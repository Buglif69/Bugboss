/*
 * core3d.js — tiny dependency-free 3D engine (canvas 2D, painter's algorithm).
 *
 * Why not three.js: this has to run inside a single self-contained HTML file
 * that gets pasted into WordPress, emailed, and rendered by an offline video
 * capture script. No CDN, no build step, no 600 KB of library for eight bugs.
 *
 * Exposes BB.m4 (matrices), BB.mesh (primitive builders), BB.Renderer.
 */
(function (root) {
  'use strict';
  var BB = (root.BB = root.BB || {});

  /* ------------------------------------------------------------------ *
   * Matrices — column-major 4x4 stored as flat 16-element arrays.
   * ------------------------------------------------------------------ */
  var m4 = {
    ident: function () {
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    },
    mul: function (a, b) {
      var o = new Array(16);
      for (var c = 0; c < 4; c++) {
        for (var r = 0; r < 4; r++) {
          o[c * 4 + r] =
            a[r] * b[c * 4] +
            a[4 + r] * b[c * 4 + 1] +
            a[8 + r] * b[c * 4 + 2] +
            a[12 + r] * b[c * 4 + 3];
        }
      }
      return o;
    },
    chain: function () {
      var m = m4.ident();
      for (var i = 0; i < arguments.length; i++) m = m4.mul(m, arguments[i]);
      return m;
    },
    trans: function (x, y, z) {
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
    },
    scale: function (x, y, z) {
      if (y === undefined) { y = x; z = x; }
      return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];
    },
    rotX: function (a) {
      var c = Math.cos(a), s = Math.sin(a);
      return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
    },
    rotY: function (a) {
      var c = Math.cos(a), s = Math.sin(a);
      return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
    },
    rotZ: function (a) {
      var c = Math.cos(a), s = Math.sin(a);
      return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    },
    /** Rotate about an arbitrary pivot point (used for antenna/leg joints). */
    aroundPivot: function (px, py, pz, rot) {
      return m4.chain(m4.trans(px, py, pz), rot, m4.trans(-px, -py, -pz));
    },
    xform: function (m, p, out) {
      var x = p[0], y = p[1], z = p[2];
      out = out || [0, 0, 0];
      out[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
      out[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
      out[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
      return out;
    }
  };
  BB.m4 = m4;

  /* ------------------------------------------------------------------ *
   * Mesh building
   *
   * A mesh is { pos: [x,y,z, ...], face: [[i0,i1,i2], ...], col: [[r,g,b], ...],
   *             gloss: [n, ...] }.  Colours live per-face so species markings
   *             (pronotum stripes, redback hourglass) are just a colour
   *             function evaluated at the face centroid in local space.
   * ------------------------------------------------------------------ */
  function emptyMesh() {
    return { pos: [], face: [], col: [], gloss: [], alpha: [] };
  }

  function pushVert(m, x, y, z) {
    m.pos.push(x, y, z);
    return m.pos.length / 3 - 1;
  }

  function pushFace(m, a, b, c, color, gloss, alpha) {
    m.face.push([a, b, c]);
    m.col.push(color);
    m.gloss.push(gloss === undefined ? 0.35 : gloss);
    m.alpha.push(alpha === undefined ? 1 : alpha);
  }

  function centroid(m, a, b, c) {
    var p = m.pos;
    return [
      (p[a * 3] + p[b * 3] + p[c * 3]) / 3,
      (p[a * 3 + 1] + p[b * 3 + 1] + p[c * 3 + 1]) / 3,
      (p[a * 3 + 2] + p[b * 3 + 2] + p[c * 3 + 2]) / 3
    ];
  }

  /** Resolve a colour spec that may be a flat [r,g,b] or a fn(localPos). */
  function resolveCol(spec, pt) {
    return typeof spec === 'function' ? spec(pt) : spec;
  }

  function merge(target, src) {
    var base = target.pos.length / 3;
    for (var i = 0; i < src.pos.length; i++) target.pos.push(src.pos[i]);
    for (var f = 0; f < src.face.length; f++) {
      var t = src.face[f];
      target.face.push([t[0] + base, t[1] + base, t[2] + base]);
      target.col.push(src.col[f]);
      target.gloss.push(src.gloss[f]);
      target.alpha.push(src.alpha ? src.alpha[f] : 1);
    }
    return target;
  }

  function applyMatrix(m, mat) {
    var p = m.pos, tmp = [0, 0, 0];
    for (var i = 0; i < p.length; i += 3) {
      tmp[0] = p[i]; tmp[1] = p[i + 1]; tmp[2] = p[i + 2];
      m4.xform(mat, tmp, tmp);
      p[i] = tmp[0]; p[i + 1] = tmp[1]; p[i + 2] = tmp[2];
    }
    return m;
  }

  /**
   * UV ellipsoid. `squash` lets callers flatten the top/bottom independently,
   * which is how insect bodies get their domed-above / flat-below profile.
   */
  function ellipsoid(opt) {
    var rx = opt.rx, ry = opt.ry, rz = opt.rz;
    var su = opt.su || 14, sv = opt.sv || 9;
    var flatBottom = opt.flatBottom === undefined ? 0 : opt.flatBottom;
    var taperFront = opt.taperFront || 0;   // pinch the +z end
    var taperBack = opt.taperBack || 0;     // pinch the -z end
    var m = emptyMesh();
    var grid = [];
    for (var v = 0; v <= sv; v++) {
      var phi = (v / sv) * Math.PI;          // 0 = top (+y)
      var row = [];
      for (var u = 0; u < su; u++) {
        var th = (u / su) * Math.PI * 2;
        var y = Math.cos(phi);
        var r = Math.sin(phi);
        var x = r * Math.cos(th);
        var z = r * Math.sin(th);
        // taper along z so the abdomen narrows toward the tail
        var tz = z > 0 ? 1 - taperFront * z : 1 + taperBack * z;
        var yy = y < 0 ? y * (1 - flatBottom) : y;
        row.push(pushVert(m, x * rx * tz, yy * ry, z * rz));
      }
      grid.push(row);
    }
    for (var vv = 0; vv < sv; vv++) {
      for (var uu = 0; uu < su; uu++) {
        var a = grid[vv][uu], b = grid[vv][(uu + 1) % su];
        var c = grid[vv + 1][(uu + 1) % su], d = grid[vv + 1][uu];
        pushFace(m, a, b, c, resolveCol(opt.color, centroid(m, a, b, c)), opt.gloss, opt.alpha);
        pushFace(m, a, c, d, resolveCol(opt.color, centroid(m, a, c, d)), opt.gloss, opt.alpha);
      }
    }
    if (opt.matrix) applyMatrix(m, opt.matrix);
    return m;
  }

  /**
   * Tapered tube swept along a polyline — legs, antennae, tails, mandibles,
   * spider spinnerets. `path` is [[x,y,z], ...], `radii` one per point.
   */
  function tube(opt) {
    var path = opt.path, radii = opt.radii, sides = opt.sides || 6;
    var m = emptyMesh();
    var rings = [];
    for (var i = 0; i < path.length; i++) {
      var p = path[i];
      var next = path[Math.min(i + 1, path.length - 1)];
      var prev = path[Math.max(i - 1, 0)];
      var dir = norm([next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]]);
      var up = Math.abs(dir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
      var sx = norm(cross(up, dir));
      var sy = cross(dir, sx);
      var ring = [];
      for (var s = 0; s < sides; s++) {
        var a = (s / sides) * Math.PI * 2;
        var ca = Math.cos(a) * radii[i], sa = Math.sin(a) * radii[i];
        ring.push(pushVert(m,
          p[0] + sx[0] * ca + sy[0] * sa,
          p[1] + sx[1] * ca + sy[1] * sa,
          p[2] + sx[2] * ca + sy[2] * sa));
      }
      rings.push(ring);
    }
    for (var r = 0; r < rings.length - 1; r++) {
      for (var k = 0; k < sides; k++) {
        var a1 = rings[r][k], b1 = rings[r][(k + 1) % sides];
        var c1 = rings[r + 1][(k + 1) % sides], d1 = rings[r + 1][k];
        pushFace(m, a1, b1, c1, resolveCol(opt.color, centroid(m, a1, b1, c1)), opt.gloss, opt.alpha);
        pushFace(m, a1, c1, d1, resolveCol(opt.color, centroid(m, a1, c1, d1)), opt.gloss, opt.alpha);
      }
    }
    // cap the far end so tapered tips do not show a hole from behind
    var last = rings[rings.length - 1];
    if (radii[radii.length - 1] > 0.004) {
      var tip = pushVert(m, path[path.length - 1][0], path[path.length - 1][1], path[path.length - 1][2]);
      for (var q = 0; q < sides; q++) {
        pushFace(m, last[q], last[(q + 1) % sides], tip,
          resolveCol(opt.color, centroid(m, last[q], last[(q + 1) % sides], tip)), opt.gloss, opt.alpha);
      }
    }
    if (opt.matrix) applyMatrix(m, opt.matrix);
    return m;
  }

  /** Quadratic-ish smooth path through a start, bend and end point. */
  function curvePath(from, ctrl, to, steps) {
    var out = [];
    for (var i = 0; i <= steps; i++) {
      var t = i / steps, it = 1 - t;
      out.push([
        it * it * from[0] + 2 * it * t * ctrl[0] + t * t * to[0],
        it * it * from[1] + 2 * it * t * ctrl[1] + t * t * to[1],
        it * it * from[2] + 2 * it * t * ctrl[2] + t * t * to[2]
      ]);
    }
    return out;
  }

  function taper(n, r0, r1, curveP) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1);
      if (curveP) t = Math.pow(t, curveP);
      out.push(r0 + (r1 - r0) * t);
    }
    return out;
  }

  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function norm(v) {
    var l = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  }

  /**
   * Per-vertex normals, averaged from the faces touching each vertex.
   * Shading still happens per triangle (canvas 2D cannot interpolate a fill),
   * but a smooth normal field turns hard facet edges into a soft gradient —
   * the difference between "low-poly render" and "photographed specimen".
   * Vertices are only shared inside a primitive, so separate parts keep their
   * hard edges automatically.
   */
  function computeNormals(m) {
    var n = m.pos.length / 3;
    var vn = new Float32Array(n * 3);
    var p = m.pos;
    for (var f = 0; f < m.face.length; f++) {
      var t = m.face[f], a = t[0] * 3, b = t[1] * 3, c = t[2] * 3;
      var ux = p[b] - p[a], uy = p[b + 1] - p[a + 1], uz = p[b + 2] - p[a + 2];
      var wx = p[c] - p[a], wy = p[c + 1] - p[a + 1], wz = p[c + 2] - p[a + 2];
      var nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
      var area = Math.hypot(nx, ny, nz);
      if (area < 1e-9) continue;              // pole triangles are degenerate
      nx /= area; ny /= area; nz /= area;     // weight every face equally
      for (var k = 0; k < 3; k++) {
        var i3 = t[k] * 3;
        vn[i3] += nx; vn[i3 + 1] += ny; vn[i3 + 2] += nz;
      }
    }
    for (var v = 0; v < n; v++) {
      var l = Math.hypot(vn[v * 3], vn[v * 3 + 1], vn[v * 3 + 2]) || 1;
      vn[v * 3] /= l; vn[v * 3 + 1] /= l; vn[v * 3 + 2] /= l;
    }
    m.vnorm = vn;
    return m;
  }

  BB.mesh = {
    empty: emptyMesh, merge: merge, apply: applyMatrix, normals: computeNormals,
    ellipsoid: ellipsoid, tube: tube, curvePath: curvePath, taper: taper,
    cross: cross, norm: norm
  };

  /* ------------------------------------------------------------------ *
   * Renderer
   *
   * A model is { parts: [{ mesh, anim(t) -> matrix | null }], scale, shadow }.
   * Every frame each part is transformed by  view * spin * partMatrix,
   * faces are lit, depth-sorted back-to-front and filled.
   * ------------------------------------------------------------------ */
  function Renderer(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.model = null;
    this.spin = 0;
    this.tilt = opts.tilt === undefined ? 0.42 : opts.tilt;
    this.dist = opts.dist || 7.4;
    this.fov = opts.fov || 2.9;          // horizontal allowance, model units
    this.fovY = opts.fovY || 0.92;       // vertical allowance, as a ratio
    this.quality = 1;
    this.light = norm(opts.light || [-0.45, 0.82, 0.5]);
    this.fill = norm(opts.fill || [0.75, 0.1, 0.55]);
    this.rim = norm(opts.rim || [0.35, -0.1, -0.9]);
    this.ambient = opts.ambient === undefined ? 0.30 : opts.ambient;
    this.keyI = opts.key === undefined ? 0.70 : opts.key;
    this.fillI = opts.fillI === undefined ? 0.22 : opts.fillI;
    this.rimI = opts.rimI === undefined ? 0.34 : opts.rimI;
    this.exposure = opts.exposure === undefined ? 1.0 : opts.exposure;
    this.tint = opts.tint || [1, 0.975, 0.95];
    this.shadow = opts.shadow !== false;
    this._buf = [];
  }

  Renderer.prototype.setModel = function (model) {
    this.model = model;
    this._cacheSize();
  };

  Renderer.prototype._cacheSize = function () {
    var n = 0;
    if (!this.model) return;
    for (var i = 0; i < this.model.parts.length; i++) n += this.model.parts[i].mesh.face.length;
    this.faceCount = n;
  };

  Renderer.prototype.resize = function (w, h, dpr) {
    dpr = Math.min(dpr || 1, 2);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.w = w; this.h = h; this.dpr = dpr;
  };

  /**
   * @param spin  turntable angle, radians
   * @param t     seconds since start, drives idle articulation
   */
  Renderer.prototype.render = function (spin, t) {
    var ctx = this.ctx, w = this.w, h = this.h, dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!this.model) return;

    // Spin first (about the specimen's own vertical), then tilt the camera
    // down over it. The other order pitches the model itself, which swings
    // the underside into view as it turns.
    var base = m4.chain(m4.rotX(this.tilt), m4.rotY(spin));
    if (this.model.pre) base = m4.mul(base, this.model.pre);
    var scale = this.model.scale || 1;
    var px = w / 2, py = h / 2 + (this.model.offsetY || 0) * h;
    // Fit width and height separately: a wide, short stage should fill
    // sideways rather than being framed by its smallest dimension.
    var f = Math.min(w / this.fov, h / (this.fov * this.fovY)) * scale;

    if (this.shadow) this._groundShadow(ctx, px, py, f);

    var faces = this._buf;
    faces.length = 0;
    var parts = this.model.parts;
    var dist = this.dist;

    for (var pi = 0; pi < parts.length; pi++) {
      var part = parts[pi];
      var mat = part.anim ? m4.mul(base, part.anim(t)) : base;
      var mesh = part.mesh, pos = mesh.pos;
      var n = pos.length / 3;
      var sx = new Float32Array(n), sy = new Float32Array(n), vz = new Float32Array(n);
      var vx = new Float32Array(n), vy = new Float32Array(n);
      for (var i = 0; i < n; i++) {
        var x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
        var wx0 = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
        var wy0 = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
        var wz0 = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
        // weak perspective: +z is toward the camera, so near legs read bigger
        var persp = dist / (dist - wz0);
        vx[i] = wx0; vy[i] = wy0; vz[i] = wz0;
        sx[i] = px + wx0 * f * persp;
        sy[i] = py - wy0 * f * persp;
      }
      // smooth normals if the mesh has them, geometric normals otherwise
      var vn = mesh.vnorm, tn = null;
      if (vn) {
        tn = new Float32Array(n * 3);
        for (var q = 0; q < n; q++) {
          var ax0 = vn[q * 3], ay0 = vn[q * 3 + 1], az0 = vn[q * 3 + 2];
          tn[q * 3] = mat[0] * ax0 + mat[4] * ay0 + mat[8] * az0;
          tn[q * 3 + 1] = mat[1] * ax0 + mat[5] * ay0 + mat[9] * az0;
          tn[q * 3 + 2] = mat[2] * ax0 + mat[6] * ay0 + mat[10] * az0;
        }
      }
      var fs = mesh.face;
      for (var k = 0; k < fs.length; k++) {
        var tri = fs[k], a = tri[0], b = tri[1], c = tri[2];
        var nx, ny, nz, nl;
        if (tn) {
          nx = tn[a * 3] + tn[b * 3] + tn[c * 3];
          ny = tn[a * 3 + 1] + tn[b * 3 + 1] + tn[c * 3 + 1];
          nz = tn[a * 3 + 2] + tn[b * 3 + 2] + tn[c * 3 + 2];
        } else {
          var ux = vx[b] - vx[a], uy = vy[b] - vy[a], uz = vz[b] - vz[a];
          var wx = vx[c] - vx[a], wy = vy[c] - vy[a], wz = vz[c] - vz[a];
          nx = uy * wz - uz * wy; ny = uz * wx - ux * wz; nz = ux * wy - uy * wx;
        }
        nl = Math.hypot(nx, ny, nz);
        if (nl < 1e-7) continue;
        nx /= nl; ny /= nl; nz /= nl;
        if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; } // always face the camera
        faces.push([(vz[a] + vz[b] + vz[c]) / 3,
          sx[a], sy[a], sx[b], sy[b], sx[c], sy[c],
          nx, ny, nz, mesh.col[k], mesh.gloss[k], mesh.alpha ? mesh.alpha[k] : 1]);
      }
    }

    faces.sort(function (p, q) { return p[0] - q[0]; });

    var L = this.light, FI = this.fill, R = this.rim;
    var amb = this.ambient, kI = this.keyI, fI = this.fillI, rI = this.rimI;
    var tint = this.tint, ex = this.exposure;
    for (var q2 = 0; q2 < faces.length; q2++) {
      var F = faces[q2];
      var lam = Math.max(0, F[7] * L[0] + F[8] * L[1] + F[9] * L[2]);
      var fl = Math.max(0, F[7] * FI[0] + F[8] * FI[1] + F[9] * FI[2]);
      var rimv = Math.max(0, F[7] * R[0] + F[8] * R[1] + F[9] * R[2]);
      var gl = F[11];
      var spec = Math.pow(lam, 6 + gl * 26) * gl * 0.85;
      // hemisphere ambient: sky above, dark floor below, so tops read lighter
      var hemi = amb * (0.66 + 0.34 * F[8]);
      var shade = (hemi + lam * kI + fl * fI + rimv * rimv * rI * (0.35 + gl)) * ex;
      var col = F[10];
      var r = Math.min(255, (col[0] * shade + spec * 235) * tint[0]);
      var g = Math.min(255, (col[1] * shade + spec * 235) * tint[1]);
      var bl = Math.min(255, (col[2] * shade + spec * 235) * tint[2]);
      var style = 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (bl | 0) + ')';
      var alpha = F[12];
      ctx.globalAlpha = alpha;
      ctx.fillStyle = style;
      ctx.strokeStyle = style;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(F[1], F[2]);
      ctx.lineTo(F[3], F[4]);
      ctx.lineTo(F[5], F[6]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();   // hides hairline seams between adjacent triangles
    }
    ctx.globalAlpha = 1;
  };

  Renderer.prototype._groundShadow = function (ctx, px, py, f) {
    var s = (this.model.shadowScale || 1) * (this.model.span || 1) * 0.62;
    var rx = f * s, ry = 0.34 * f * s;
    // the specimen's feet sit at model.groundY; project that onto the canvas
    var cy = py - (this.model.groundY || 0) * Math.cos(this.tilt) * f;
    var g = ctx.createRadialGradient(px, cy, 0, px, cy, rx);
    g.addColorStop(0, 'rgba(0,0,0,0.42)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.16)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.translate(px, cy);
    ctx.scale(1, ry / rx);
    ctx.translate(-px, -cy);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, cy, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  BB.Renderer = Renderer;
})(typeof window !== 'undefined' ? window : globalThis);
