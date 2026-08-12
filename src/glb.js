/*
 * glb.js — load a real 3D model (.glb) into the dossier renderer.
 *
 * This is the door for models that did not come from anatomy.js: a scan you
 * bought, one an image-to-3D service generated from photographs, or one you
 * photogrammetried off an actual specimen on a turntable. Drop the file in
 * assets/models/, point a pest at it, and it turns on the same stage with the
 * same lighting, HUD and dossier around it.
 *
 * Three jobs beyond plain parsing, all of them necessary in practice:
 *
 *   1. Real models arrive at any scale and orientation. Everything is
 *      re-centred and normalised to the same frame the generated specimens use.
 *   2. They arrive at 50k–500k triangles. The canvas renderer sorts every face
 *      each frame, so meshes are decimated by vertex clustering to a budget.
 *   3. They are textured, and this renderer shades per face. The base colour
 *      texture is sampled once per triangle at its centroid UV and baked in,
 *      which is a close-enough approximation at specimen scale.
 *
 * Only the parts of glTF 2.0 that matter here: triangles, node transforms,
 * base colour factor and base colour texture. No animation, no PBR maps, no
 * skinning — a turntable specimen needs none of it.
 */
(function (root) {
  'use strict';
  var BB = (root.BB = root.BB || {});
  var m4 = BB.m4;

  var COMPONENT = {
    5120: Int8Array, 5121: Uint8Array, 5122: Int16Array,
    5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array
  };
  var NUM = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };

  function parseContainer(buf) {
    var dv = new DataView(buf);
    if (dv.getUint32(0, true) !== 0x46546c67) throw new Error('not a .glb file');
    var len = dv.getUint32(8, true);
    var off = 12, json = null, bin = null;
    while (off < len) {
      var clen = dv.getUint32(off, true);
      var ctype = dv.getUint32(off + 4, true);
      var body = buf.slice(off + 8, off + 8 + clen);
      if (ctype === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(body));
      else if (ctype === 0x004e4942) bin = body;
      off += 8 + clen + ((4 - (clen % 4)) % 4);
    }
    if (!json) throw new Error('no JSON chunk in .glb');
    return { json: json, bin: bin };
  }

  function readAccessor(gltf, bin, index) {
    if (index === undefined || index === null) return null;
    var acc = gltf.accessors[index];
    var comps = NUM[acc.type];
    var Ctor = COMPONENT[acc.componentType];
    if (!Ctor) throw new Error('unsupported component type ' + acc.componentType);
    if (acc.bufferView === undefined) return new Ctor(acc.count * comps);
    var view = gltf.bufferViews[acc.bufferView];
    var start = (view.byteOffset || 0) + (acc.byteOffset || 0);
    var stride = view.byteStride;
    if (!stride || stride === comps * Ctor.BYTES_PER_ELEMENT) {
      return new Ctor(bin, start, acc.count * comps);
    }
    // interleaved: copy out the attribute we want
    var out = new Ctor(acc.count * comps);
    var bytes = new Uint8Array(bin);
    var tmp = new Uint8Array(out.buffer);
    var size = comps * Ctor.BYTES_PER_ELEMENT;
    for (var i = 0; i < acc.count; i++) {
      tmp.set(bytes.subarray(start + i * stride, start + i * stride + size), i * size);
    }
    return out;
  }

  /** glTF nodes carry either a matrix or a translation/rotation/scale triple. */
  function nodeMatrix(node) {
    if (node.matrix) return node.matrix.slice();
    var m = m4.ident();
    if (node.scale) m = m4.mul(m, m4.scale(node.scale[0], node.scale[1], node.scale[2]));
    if (node.rotation) m = m4.mul(quatMatrix(node.rotation), m);
    if (node.translation) {
      m = m4.mul(m4.trans(node.translation[0], node.translation[1], node.translation[2]), m);
    }
    return m;
  }

  function quatMatrix(q) {
    var x = q[0], y = q[1], z = q[2], w = q[3];
    return [
      1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0,
      2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0,
      2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0,
      0, 0, 0, 1
    ];
  }

  /** Decode every base colour image once, into pixel arrays we can sample. */
  function decodeTextures(gltf, bin) {
    var images = gltf.images || [];
    return Promise.all(images.map(function (img) {
      if (img.bufferView === undefined) return null;   // external URI: skip
      var view = gltf.bufferViews[img.bufferView];
      var bytes = new Uint8Array(bin, view.byteOffset || 0, view.byteLength);
      var blob = new Blob([bytes], { type: img.mimeType || 'image/png' });
      return createImageBitmap(blob).then(function (bmp) {
        var w = Math.min(bmp.width, 512), h = Math.min(bmp.height, 512);
        var cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        var cx = cv.getContext('2d', { willReadFrequently: true });
        cx.drawImage(bmp, 0, 0, w, h);
        bmp.close && bmp.close();
        return { w: w, h: h, data: cx.getImageData(0, 0, w, h).data };
      }).catch(function () { return null; });
    }));
  }

  function sampleTexture(tex, u, v) {
    if (!tex) return null;
    var x = Math.min(tex.w - 1, Math.max(0, Math.round((u - Math.floor(u)) * (tex.w - 1))));
    var y = Math.min(tex.h - 1, Math.max(0, Math.round((v - Math.floor(v)) * (tex.h - 1))));
    var i = (y * tex.w + x) * 4;
    return [tex.data[i], tex.data[i + 1], tex.data[i + 2]];
  }

  /**
   * Vertex-clustering decimation: snap positions onto a grid, weld anything
   * that lands in the same cell, drop the triangles that collapse. Crude next
   * to a proper edge-collapse, but it is fast, needs no topology, and at
   * turntable size the difference does not show.
   */
  function decimate(mesh, target) {
    var faceCount = mesh.face.length;
    if (faceCount <= target) return mesh;
    var pos = mesh.pos;
    var minX = Infinity, minY = Infinity, minZ = Infinity;
    var maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (var i = 0; i < pos.length; i += 3) {
      if (pos[i] < minX) minX = pos[i];
      if (pos[i] > maxX) maxX = pos[i];
      if (pos[i + 1] < minY) minY = pos[i + 1];
      if (pos[i + 1] > maxY) maxY = pos[i + 1];
      if (pos[i + 2] < minZ) minZ = pos[i + 2];
      if (pos[i + 2] > maxZ) maxZ = pos[i + 2];
    }
    var span = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
    // grid resolution scaled so the surviving face count lands near the target
    var grid = Math.max(8, Math.round(Math.pow(target, 1 / 2) * 1.9));

    var cells = {}, remap = new Int32Array(pos.length / 3);
    var out = { pos: [], face: [], col: [], gloss: [], alpha: [], unlit: [] };
    for (var v = 0; v < pos.length / 3; v++) {
      var gx = Math.floor((pos[v * 3] - minX) / span * grid);
      var gy = Math.floor((pos[v * 3 + 1] - minY) / span * grid);
      var gz = Math.floor((pos[v * 3 + 2] - minZ) / span * grid);
      var key = gx + ',' + gy + ',' + gz;
      var hit = cells[key];
      if (hit === undefined) {
        hit = cells[key] = out.pos.length / 3;
        out.pos.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]);
      }
      remap[v] = hit;
    }
    var seen = {};
    for (var f = 0; f < faceCount; f++) {
      var t = mesh.face[f];
      var a = remap[t[0]], b = remap[t[1]], c = remap[t[2]];
      if (a === b || b === c || a === c) continue;          // collapsed
      var fk = [a, b, c].sort().join(',');
      if (seen[fk]) continue;                                // duplicate
      seen[fk] = 1;
      out.face.push([a, b, c]);
      out.col.push(mesh.col[f]);
      out.gloss.push(mesh.gloss[f]);
      out.alpha.push(mesh.alpha[f]);
      out.unlit.push(mesh.unlit[f]);
    }
    return out;
  }

  /**
   * @param buf      ArrayBuffer of a .glb file
   * @param opt      { faces, gloss, upAxis, yaw, pitch, tint }
   * @returns model  the same shape anatomy.build() returns
   */
  BB.loadGLB = function (buf, opt) {
    opt = opt || {};
    var parsed = parseContainer(buf);
    var gltf = parsed.json, bin = parsed.bin;

    return decodeTextures(gltf, bin).then(function (textures) {
      var mesh = { pos: [], face: [], col: [], gloss: [], alpha: [], unlit: [] };
      var scene = gltf.scenes[gltf.scene || 0];
      var gl = opt.gloss === undefined ? 0.35 : opt.gloss;

      function walk(nodeIndex, parent) {
        var node = gltf.nodes[nodeIndex];
        var world = m4.mul(parent, nodeMatrix(node));
        if (node.mesh !== undefined) {
          gltf.meshes[node.mesh].primitives.forEach(function (prim) {
            if (prim.mode !== undefined && prim.mode !== 4) return;   // triangles only
            addPrimitive(mesh, gltf, bin, prim, world, textures, gl);
          });
        }
        (node.children || []).forEach(function (c) { walk(c, world); });
      }
      scene.nodes.forEach(function (n) { walk(n, m4.ident()); });

      if (!mesh.face.length) throw new Error('no triangles found in the model');

      mesh = decimate(mesh, opt.faces || 6500);
      orient(mesh, opt);
      BB.mesh.normals(mesh);

      var box = bounds(mesh.pos);
      return {
        parts: [{ name: 'model', mesh: mesh }],
        pre: m4.trans(-box.cx, -box.cy, -box.cz),
        groundY: box.minY - box.cy,
        span: Math.max(box.maxX - box.minX, box.maxZ - box.minZ, (box.maxY - box.minY) * 1.6),
        shadowScale: 1,
        faces: mesh.face.length,
        source: 'glb'
      };
    });
  };

  function addPrimitive(mesh, gltf, bin, prim, world, textures, gloss) {
    var P = readAccessor(gltf, bin, prim.attributes.POSITION);
    if (!P) return;
    var UV = readAccessor(gltf, bin, prim.attributes.TEXCOORD_0);
    var idx = readAccessor(gltf, bin, prim.indices);

    var mat = (gltf.materials || [])[prim.material] || {};
    var pbr = mat.pbrMetallicRoughness || {};
    var factor = pbr.baseColorFactor || [0.8, 0.8, 0.8, 1];
    var flat = [factor[0] * 255, factor[1] * 255, factor[2] * 255];
    var tex = null;
    if (pbr.baseColorTexture && gltf.textures) {
      var t = gltf.textures[pbr.baseColorTexture.index];
      if (t && t.source !== undefined) tex = textures[t.source];
    }

    var base = mesh.pos.length / 3;
    var p = [0, 0, 0];
    for (var i = 0; i < P.length; i += 3) {
      p[0] = P[i]; p[1] = P[i + 1]; p[2] = P[i + 2];
      m4.xform(world, p, p);
      mesh.pos.push(p[0], p[1], p[2]);
    }

    var count = idx ? idx.length : P.length / 3;
    for (var f = 0; f < count; f += 3) {
      var a = idx ? idx[f] : f, b = idx ? idx[f + 1] : f + 1, c = idx ? idx[f + 2] : f + 2;
      var col = flat;
      if (tex && UV) {
        // one sample per triangle, taken at its centroid
        var u = (UV[a * 2] + UV[b * 2] + UV[c * 2]) / 3;
        var v = (UV[a * 2 + 1] + UV[b * 2 + 1] + UV[c * 2 + 1]) / 3;
        var s = sampleTexture(tex, u, v);
        if (s) col = [s[0] * factor[0], s[1] * factor[1], s[2] * factor[2]];
      }
      mesh.face.push([base + a, base + b, base + c]);
      mesh.col.push(col);
      mesh.gloss.push(gloss);
      mesh.alpha.push(1);
      mesh.unlit.push(0);
    }
  }

  function bounds(pos) {
    var b = { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity };
    for (var i = 0; i < pos.length; i += 3) {
      if (pos[i] < b.minX) b.minX = pos[i];
      if (pos[i] > b.maxX) b.maxX = pos[i];
      if (pos[i + 1] < b.minY) b.minY = pos[i + 1];
      if (pos[i + 1] > b.maxY) b.maxY = pos[i + 1];
      if (pos[i + 2] < b.minZ) b.minZ = pos[i + 2];
      if (pos[i + 2] > b.maxZ) b.maxZ = pos[i + 2];
    }
    b.cx = (b.minX + b.maxX) / 2;
    b.cy = (b.minY + b.maxY) / 2;
    b.cz = (b.minZ + b.maxZ) / 2;
    return b;
  }

  /**
   * Put the model in the frame the rest of the system assumes: +y up,
   * +z forward, longest axis about 2.4 units. `yaw`/`pitch`/`roll` in the
   * spec let you turn a model that was exported facing the wrong way.
   */
  function orient(mesh, opt) {
    var m = m4.ident();
    if (opt.upAxis === 'z') m = m4.mul(m4.rotX(-Math.PI / 2), m);
    if (opt.pitch) m = m4.mul(m4.rotX(opt.pitch), m);
    if (opt.yaw) m = m4.mul(m4.rotY(opt.yaw), m);
    if (opt.roll) m = m4.mul(m4.rotZ(opt.roll), m);
    var b0 = bounds(mesh.pos);
    var longest = Math.max(b0.maxX - b0.minX, b0.maxY - b0.minY, b0.maxZ - b0.minZ) || 1;
    var k = 2.4 / longest * (opt.fit || 1);
    BB.mesh.apply(mesh, m4.mul(m4.scale(k, k, k), m));
  }

  /** Fetch and load in one call. */
  BB.loadModelFile = function (url, opt) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('could not fetch ' + url + ' (HTTP ' + r.status + ')');
      return r.arrayBuffer();
    }).then(function (buf) { return BB.loadGLB(buf, opt); });
  };
})(typeof window !== 'undefined' ? window : globalThis);
