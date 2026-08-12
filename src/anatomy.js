/*
 * anatomy.js — procedural body plans.
 *
 * Every specimen is generated from numbers, not a downloaded model: no asset
 * licensing, no 20 MB GLB files, and a new species is ~30 lines of data.
 * Three plans cover the whole Brisbane pest list:
 *
 *   insect   — 6 legs, 2 antennae, optional wings / waist / mandibles
 *   arachnid — 8 legs, cephalothorax + abdomen, pedipalps
 *   rodent   — 4 legs, snout, ears, tail
 *
 * Model space: +z forward (head), +y up, +x the specimen's right.
 * Everything is built with the feet on y = 0 and re-centred at the end.
 */
(function (root) {
  'use strict';
  var BB = (root.BB = root.BB || {});
  var m4 = BB.m4, M = BB.mesh;

  function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  /* ---------------- marking helpers: turn data into colour functions ------- */

  /**
   * Two dark longitudinal stripes — the German cockroach's calling card.
   * Edges are feathered: a hard threshold makes the boundary follow the
   * triangle edges and the marking comes out with a sawtooth edge.
   */
  function stripeFn(base, mark, halfWidth, opt) {
    opt = opt || {};
    var inner = opt.inner === undefined ? 0.22 : opt.inner;
    var outer = opt.outer === undefined ? 0.62 : opt.outer;
    var soft = opt.soft === undefined ? 0.07 : opt.soft;
    return function (p) {
      var t = Math.abs(p[0]) / halfWidth;
      if (p[1] < (opt.minY === undefined ? -1e9 : opt.minY)) return base;
      var a = smoothstep(inner - soft, inner + soft, t);
      var b = 1 - smoothstep(outer - soft, outer + soft, t);
      return mix(base, mark, Math.min(a, b));
    };
  }

  function smoothstep(e0, e1, x) {
    var t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0 || 1e-6)));
    return t * t * (3 - 2 * t);
  }

  /** Pale margin around a darker centre — American cockroach pronotum. */
  function haloFn(base, edge, rx, rz) {
    return function (p) {
      var d = Math.hypot(p[0] / rx, p[2] / rz);
      if (d > 0.72) return edge;
      if (d > 0.58) return mix(base, edge, (d - 0.58) / 0.14);
      return base;
    };
  }

  /** Transverse bands down the abdomen — wasp stripes, bed bug segments. */
  function bandFn(base, mark, rz, count, sharp) {
    return function (p) {
      var t = (p[2] / rz + 1) / 2;               // 0 tail .. 1 front
      var s = Math.sin(t * Math.PI * count);
      if (sharp) return s > 0 ? mark : base;
      return mix(base, mark, Math.max(0, s) * 0.9);
    };
  }

  /** Dorsal blaze — the redback's red stripe, feathered at both edges. */
  function dorsalFn(base, mark, rx, ry, width) {
    return function (p) {
      var lift = smoothstep(ry * 0.1, ry * 0.4, p[1]);
      var band = 1 - smoothstep(rx * width * 0.75, rx * width * 1.15, Math.abs(p[0]));
      return mix(base, mark, lift * band);
    };
  }

  /** A pale blaze on the very tip of the abdomen — the white-tailed spider. */
  function tailSpotFn(base, mark, rz, size) {
    // -p[2] runs from -rz at the head end to +rz at the tail tip, so the
    // blaze starts once we are `size` of the way back
    return function (p) {
      var t = smoothstep(rz * (size - 0.09), rz * (size + 0.09), -p[2]);
      return mix(base, mark, t);
    };
  }

  /**
   * Wing markings. The leading edge is the outer one, which is +x on the
   * right wing and -x on the left, so these need to know which side they are
   * painting — both wings are built from the same local mesh.
   */
  function wingEdgeFn(base, mark, rx, side, width) {
    return function (p) {
      var outer = p[0] * side;                    // >0 towards the wing tip edge
      return mix(base, mark, smoothstep(rx * (1 - width - 0.15), rx * (1 - width), outer));
    };
  }

  /** Two-tone wing along its length — the pantry moth's cream-to-bronze half. */
  function wingSplitFn(inner, outer, rz, at) {
    return function (p) {
      var t = smoothstep(-rz * (at + 0.18), -rz * (at - 0.18), -p[2]);
      return mix(inner, outer, t);
    };
  }

  /** Lighter underside — rodent belly, termite abdomen. */
  function bellyFn(base, belly, ry) {
    return function (p) {
      var t = (-p[1] / ry - 0.1) / 0.9;
      return t <= 0 ? base : mix(base, belly, Math.min(1, t));
    };
  }

  function paletteFor(part, p) {
    var c = p.colors;
    var mk = p.markings || {};
    switch (part) {
      case 'pronotum':
        if (mk.pronotumStripes) {
          return stripeFn(c.pronotum || c.body, mk.pronotumStripes.color,
            p._pronotumRx, mk.pronotumStripes);
        }
        if (mk.pronotumHalo) {
          return haloFn(c.pronotum || c.body, mk.pronotumHalo.color, p._pronotumRx, p._pronotumRz);
        }
        return c.pronotum || c.body;
      case 'abdomen':
        if (mk.abdomenBands) {
          return bandFn(c.abdomen || c.body, mk.abdomenBands.color, p._abdomenRz,
            mk.abdomenBands.count || 4, mk.abdomenBands.sharp);
        }
        if (mk.dorsalStripe) {
          return dorsalFn(c.abdomen || c.body, mk.dorsalStripe.color, p._abdomenRx,
            p._abdomenRy, mk.dorsalStripe.width || 0.34);
        }
        if (mk.tailSpot) {
          return tailSpotFn(c.abdomen || c.body, mk.tailSpot.color, p._abdomenRz, mk.tailSpot.size || 0.62);
        }
        if (mk.belly) return bellyFn(c.abdomen || c.body, mk.belly.color, p._abdomenRy);
        return c.abdomen || c.body;
      case 'wing': {
        var wingBase = (p.wings && p.wings.color) || c.wing || c.body;
        if (mk.wingSplit) {
          return wingSplitFn(wingBase, mk.wingSplit.color, p._wingRz, mk.wingSplit.at || 0.1);
        }
        if (mk.wingEdge) {
          return wingEdgeFn(wingBase, mk.wingEdge.color, p._wingRx, arguments[2], mk.wingEdge.width || 0.3);
        }
        return wingBase;
      }
      default:
        return c.body;
    }
  }

  /* ---------------- shared limb builder ----------------------------------- */

  /**
   * One sprawled leg: coxa → femur → knee → tibia → foot → tarsus.
   * `side` is -1 (left) or +1 (right); `dir` the splay angle in the xz plane
   * measured from straight-ahead, so front legs reach forward and hind legs
   * kick back the way a real roach stands.
   */
  function buildLeg(cfg) {
    var side = cfg.side, L = cfg.len, col = cfg.color, gloss = cfg.gloss;
    var ax = cfg.attach[0], ay = cfg.attach[1], az = cfg.attach[2];
    var ang = cfg.dir;
    var ux = Math.sin(ang) * side, uz = Math.cos(ang);
    var kneeR = cfg.kneeOut * L, kneeY = cfg.kneeUp * L;
    var footR = cfg.footOut * L;
    var knee = [ax + ux * kneeR, ay + kneeY, az + uz * kneeR];
    var foot = [ax + ux * footR, cfg.footY, az + uz * footR * (cfg.footZScale || 1)];
    var mesh = M.empty();
    var th = cfg.thick * L;

    M.merge(mesh, M.tube({
      path: M.curvePath([ax, ay, az], [ax + ux * kneeR * 0.5, ay + kneeY * 1.15, az + uz * kneeR * 0.5], knee, 4),
      radii: M.taper(5, th * 1.5, th * 0.85), sides: cfg.sides || 6, color: col, gloss: gloss
    }));
    M.merge(mesh, M.tube({
      path: M.curvePath(knee, [(knee[0] + foot[0]) / 2 + ux * 0.02, (knee[1] + foot[1]) / 2 + L * 0.02, (knee[2] + foot[2]) / 2], foot, 5),
      radii: M.taper(6, th * 0.8, th * 0.34), sides: cfg.sides || 6, color: col, gloss: gloss
    }));
    // tarsus: the little foot segment that keeps it from looking like a stick
    var toe = [foot[0] + ux * L * 0.07, cfg.footY, foot[2] + uz * L * 0.07 + L * 0.03];
    M.merge(mesh, M.tube({
      path: [foot, toe], radii: [th * 0.3, th * 0.16], sides: 4, color: col, gloss: gloss
    }));
    return mesh;
  }

  /* ---------------- plan: insect ------------------------------------------ */

  function buildInsect(p) {
    var L = p.len;
    var c = p.colors;
    var gl = p.gloss === undefined ? 0.4 : p.gloss;
    var parts = [];
    var stand = (p.stand || 0.16) * L;

    var abRx = (p.abdomenW || 0.30) * L, abRy = (p.abdomenH || 0.115) * L, abRz = (p.abdomenL || 0.34) * L;
    p._abdomenRx = abRx; p._abdomenRy = abRy; p._abdomenRz = abRz;
    var abY = stand + abRy * (p.bodyLift || 1.0);
    var abZ = (p.abdomenZ === undefined ? -0.26 : p.abdomenZ) * L;

    // abdomen / gaster
    parts.push({
      name: 'abdomen',
      mesh: M.ellipsoid({
        rx: abRx, ry: abRy, rz: abRz, su: 22, sv: 24,
        flatBottom: p.flatBottom === undefined ? 0.3 : p.flatBottom,
        taperBack: p.abdomenTaper === undefined ? 0.42 : p.abdomenTaper,
        taperFront: p.abdomenTaperFront || 0,
        segments: p.segments === undefined ? 7 : p.segments,
        segAmp: p.segAmp === undefined ? 0.055 : p.segAmp,
        mottle: p.mottle === undefined ? 0.07 : p.mottle,
        color: paletteFor('abdomen', p), gloss: gl,
        matrix: m4.trans(0, abY, abZ)
      })
    });

    // petiole — the pinched waist that reads instantly as "ant" or "wasp"
    if (p.waist) {
      var wz = abZ + abRz * 0.95;
      parts.push({
        name: 'waist',
        mesh: M.merge(
          M.ellipsoid({
            rx: p.waist.r * L, ry: p.waist.r * L * 1.35, rz: p.waist.r * L, su: 8, sv: 6,
            color: c.body, gloss: gl, matrix: m4.trans(0, abY + abRy * 0.15, wz + p.waist.r * L)
          }),
          M.tube({
            path: [[0, abY, wz], [0, abY + abRy * 0.2, wz + p.waist.len * L]],
            radii: [p.waist.r * L * 0.7, p.waist.r * L * 0.55], sides: 6, color: c.body, gloss: gl
          })
        )
      });
    }

    // thorax
    var thRx = (p.thoraxW || 0.24) * L, thRy = (p.thoraxH || 0.11) * L, thRz = (p.thoraxL || 0.19) * L;
    var thZ = (p.thoraxZ === undefined ? 0.14 : p.thoraxZ) * L;
    var thY = stand + thRy * (p.bodyLift || 1.0) * (p.thoraxLift || 1);
    parts.push({
      name: 'thorax',
      mesh: M.ellipsoid({
        rx: thRx, ry: thRy, rz: thRz, su: 18, sv: 10, flatBottom: 0.35,
        mottle: p.mottle === undefined ? 0.07 : p.mottle,
        color: c.thorax || c.body, gloss: gl, matrix: m4.trans(0, thY, thZ)
      })
    });

    // pronotum — the shield plate over the thorax, where roach markings live
    if (p.pronotum !== false) {
      var prRx = (p.pronotumW || 0.30) * L, prRz = (p.pronotumL || 0.20) * L;
      p._pronotumRx = prRx; p._pronotumRz = prRz;
      parts.push({
        name: 'pronotum',
        mesh: M.ellipsoid({
          rx: prRx, ry: (p.pronotumH || 0.075) * L, rz: prRz, su: 24, sv: 11, flatBottom: 0.75,
          mottle: (p.mottle === undefined ? 0.07 : p.mottle) * 0.6,
          color: paletteFor('pronotum', p), gloss: gl + 0.15,
          matrix: m4.chain(m4.trans(0, thY + thRy * 0.55, thZ + prRz * 0.04), m4.rotX(-0.06))
        })
      });
    }

    // wings / tegmina
    if (p.wings) {
      var wg = p.wings;
      var wLen = wg.len * L, wW = wg.w * L;
      p._wingRx = wW; p._wingRz = wLen;
      for (var s = -1; s <= 1; s += 2) {
        parts.push({
          name: 'wing' + s,
          mesh: M.ellipsoid({
            rx: wW, ry: wg.thick * L, rz: wLen, su: 20, sv: 9,
            taperBack: wg.taperBack === undefined ? 0.55 : wg.taperBack,
            taperFront: wg.taperFront === undefined ? 0.22 : wg.taperFront,
            flatBottom: 0.5,
            color: paletteFor('wing', p, s), gloss: wg.gloss === undefined ? 0.55 : wg.gloss,
            alpha: wg.alpha,
            matrix: m4.chain(
              m4.trans(s * wW * (wg.spread || 0.72), abY + abRy * (wg.lift || 0.85), abZ + (wg.z || 0.1) * L),
              // positive roll droops the outer edge over the abdomen flank,
              // negative pitch settles the wing tips down over the tail
              m4.rotY(-s * (wg.yaw || 0.07)), m4.rotZ(-s * (wg.roll || 0.14)), m4.rotX(wg.pitch === undefined ? -0.1 : wg.pitch))
          })
        });
      }
    }

    // setae — the fine hairs along the abdomen and thorax. They catch the rim
    // light and rough up the silhouette, which is most of the difference
    // between a specimen and a smooth toy.
    if (p.setae !== false) {
      var st = p.setae || {};
      parts.push({
        name: 'setae',
        mesh: M.setae({
          rx: abRx * 0.98, ry: abRy * 0.98, rz: abRz * 0.98,
          count: st.count || 90, len: (st.len || 0.035) * L, thick: (st.thick || 0.0022) * L,
          color: st.color || mix(c.abdomen || c.body, [255, 240, 220], 0.22),
          minY: st.minY === undefined ? -0.35 : st.minY,
          cover: st.cover || 1.5, sweep: st.sweep === undefined ? 0.35 : st.sweep,
          matrix: m4.trans(0, abY, abZ)
        })
      });
    }

    // head, tilted down under the pronotum the way roaches carry it
    var hRx = (p.headW || 0.17) * L, hRy = (p.headH || 0.13) * L, hRz = (p.headL || 0.14) * L;
    var hZ = (p.headZ === undefined ? 0.36 : p.headZ) * L;
    var hY = stand + (p.headY === undefined ? 0.11 : p.headY) * L;
    var headMat = m4.chain(m4.trans(0, hY, hZ), m4.rotX(p.headPitch === undefined ? -0.55 : p.headPitch));
    var head = M.ellipsoid({
      rx: hRx, ry: hRy, rz: hRz, su: 18, sv: 11, flatBottom: 0.1,
      color: c.head || c.body, gloss: gl + 0.1, matrix: headMat
    });
    // compound eyes
    var eR = (p.eye === undefined ? 0.045 : p.eye) * L;
    if (eR > 0.001) {
      for (var e = -1; e <= 1; e += 2) {
        M.merge(head, M.ellipsoid({
          rx: eR, ry: eR * 1.25, rz: eR * 1.15, su: 8, sv: 6,
          color: c.eye || [18, 14, 12], gloss: 0.85,
          matrix: m4.mul(headMat, m4.trans(e * hRx * 0.78, hRy * 0.25, hRz * 0.3))
        }));
      }
    }
    // rostrum — the nasute soldier's snout. No mandibles at all: it squirts a
    // sticky defensive terpene out of the point instead of biting.
    if (p.rostrum) {
      var rs = p.rostrum;
      M.merge(head, M.tube({
        path: M.curvePath(
          [0, hRy * 0.1, hRz * 0.55],
          [0, hRy * 0.02, hRz * 0.55 + rs.len * L * 0.5],
          [0, -hRy * (rs.droop === undefined ? 0.15 : rs.droop), hRz * 0.55 + rs.len * L], 7),
        radii: M.taper(8, rs.thick * L, rs.thick * L * 0.1, 1.5),
        sides: 7, color: rs.color || c.head, gloss: 0.55,
        matrix: headMat
      }));
    }

    // mandibles — termite soldiers are basically a pair of these with a bug attached
    if (p.mandibles) {
      var md = p.mandibles;
      for (var mside = -1; mside <= 1; mside += 2) {
        // mandibles reach forward and cross slightly, rather than hanging down
        var mstart = [mside * hRx * 0.55, hRy * 0.02, hRz * 0.7];
        var mctrl = [mside * hRx * 1.02, -hRy * 0.02, hRz * 0.7 + md.len * L * 0.6];
        var mend = [mside * hRx * -0.05, -hRy * 0.06, hRz * 0.72 + md.len * L];
        M.merge(head, M.tube({
          path: M.curvePath(mstart, mctrl, mend, 7),
          radii: M.taper(8, md.thick * L, md.thick * L * 0.18, 1.4),
          sides: 5, color: md.color || c.head, gloss: 0.7,
          matrix: headMat
        }));
      }
    }
    parts.push({ name: 'head', mesh: head, pivot: [0, hY, hZ] });

    // antennae — long, curved, and animated; the thing that sells "alive"
    var an = p.antenna || {};
    var aLen = (an.len === undefined ? 1.15 : an.len) * L;
    var aTh = (an.thick === undefined ? 0.018 : an.thick) * L;
    for (var as = -1; as <= 1; as += 2) {
      var base = [as * hRx * 0.5, hY + hRy * 0.35, hZ + hRz * 0.55];
      var mesh;
      if (an.elbowed) {
        // ants: a long straight scape, then a bend into the funiculus
        var elbow = [as * (hRx * 0.5 + aLen * 0.38), base[1] + aLen * 0.16, base[2] + aLen * 0.30];
        var tip = [as * (hRx * 0.5 + aLen * 0.52), base[1] + aLen * 0.02, base[2] + aLen * 0.78];
        mesh = M.merge(
          M.tube({ path: [base, elbow], radii: [aTh, aTh * 0.8], sides: 5, color: c.antenna || c.body, gloss: gl }),
          M.tube({
            path: M.curvePath(elbow, [(elbow[0] + tip[0]) / 2, elbow[1] - aLen * 0.02, (elbow[2] + tip[2]) / 2], tip, 6),
            radii: M.taper(7, aTh * 0.8, aTh * 0.5), sides: 5, color: c.antenna || c.body, gloss: gl
          })
        );
      } else {
        var ctrl = [as * aLen * (an.splay === undefined ? 0.42 : an.splay), base[1] + aLen * (an.arch === undefined ? 0.34 : an.arch), base[2] + aLen * 0.45];
        var end = [as * aLen * (an.spread === undefined ? 0.62 : an.spread), base[1] + aLen * (an.rise === undefined ? 0.06 : an.rise), base[2] + aLen * (an.reach === undefined ? 0.86 : an.reach)];
        mesh = M.tube({
          path: M.curvePath(base, ctrl, end, an.segs || 9),
          radii: M.taper((an.segs || 9) + 1, aTh, aTh * 0.22, 1.2),
          sides: 5, color: c.antenna || c.body, gloss: gl
        });
      }
      parts.push({ name: 'antenna' + as, mesh: mesh, pivot: base, side: as, kind: 'antenna' });
    }

    // legs
    var lg = p.legs || {};
    var zs = lg.attachZ || [0.20, 0.04, -0.13];
    var dirs = lg.dirs || [0.62, 1.5, 2.35];
    var lens = lg.scale || [0.9, 1.0, 1.22];
    for (var pair = 0; pair < 3; pair++) {
      for (var sd = -1; sd <= 1; sd += 2) {
        var legMesh = buildLeg({
          side: sd,
          attach: [sd * thRx * 0.72, thY - thRy * 0.45, zs[pair] * L],
          len: L * lens[pair],
          dir: dirs[pair],
          kneeOut: lg.kneeOut === undefined ? 0.24 : lg.kneeOut,
          kneeUp: lg.kneeUp === undefined ? 0.13 : lg.kneeUp,
          footOut: lg.footOut === undefined ? 0.40 : lg.footOut,
          footY: 0,
          thick: lg.thick === undefined ? 0.026 : lg.thick,
          color: c.leg || c.body,
          gloss: gl
        });
        parts.push({ name: 'leg' + pair + sd, mesh: legMesh, kind: 'leg', side: sd, pair: pair });
      }
    }

    // cerci — the two little tail prongs on roaches
    if (p.cerci) {
      var cerci = typeof p.cerci === 'number' ? { len: p.cerci } : p.cerci;
      var cz = abZ - abRz * 0.9;
      var spread = cerci.spread === undefined ? 0.55 : cerci.spread;
      // three bristles (silverfish) means a straight central one as well
      var offsets = cerci.count === 3 ? [-1, 0, 1] : [-1, 1];
      for (var ci = 0; ci < offsets.length; ci++) {
        var cs = offsets[ci];
        var clen = cerci.len * L * (cs === 0 ? (cerci.midScale || 1.15) : 1);
        parts.push({
          name: 'cercus' + ci,
          mesh: M.tube({
            path: M.curvePath(
              [cs * abRx * 0.3, abY, cz],
              [cs * abRx * spread * 0.7, abY + abRy * 0.15, cz - clen * 0.5],
              [cs * abRx * spread * 1.6, abY + abRy * 0.1, cz - clen], 5),
            radii: M.taper(6, aTh * 1.2, aTh * 0.2), sides: 5, color: cerci.color || c.leg || c.body, gloss: gl
          })
        });
      }
    }

    return finish(parts, p);
  }

  /* ---------------- plan: arachnid ---------------------------------------- */

  function buildArachnid(p) {
    var L = p.len, c = p.colors, gl = p.gloss === undefined ? 0.6 : p.gloss;
    var parts = [];
    var stand = (p.stand || 0.30) * L;

    var abRx = (p.abdomenW || 0.30) * L, abRy = (p.abdomenH || 0.30) * L, abRz = (p.abdomenL || 0.32) * L;
    p._abdomenRx = abRx; p._abdomenRy = abRy; p._abdomenRz = abRz;
    var abY = stand + abRy * 0.15, abZ = -(p.abdomenZ || 0.30) * L;
    parts.push({
      name: 'abdomen',
      mesh: M.ellipsoid({
        rx: abRx, ry: abRy, rz: abRz, su: 26, sv: 16,
        mottle: p.mottle === undefined ? 0.08 : p.mottle,
        color: paletteFor('abdomen', p), gloss: gl,
        matrix: m4.trans(0, abY, abZ)
      })
    });
    // ventral hourglass, drawn as a small red patch on the underside
    if (p.markings && p.markings.hourglass) {
      parts.push({
        name: 'hourglass',
        mesh: M.ellipsoid({
          rx: abRx * 0.26, ry: abRy * 0.1, rz: abRz * 0.42, su: 10, sv: 5,
          color: p.markings.hourglass.color, gloss: 0.5,
          matrix: m4.trans(0, abY - abRy * 0.94, abZ)
        })
      });
    }

    var ctRx = (p.thoraxW || 0.20) * L, ctRy = (p.thoraxH || 0.13) * L, ctRz = (p.thoraxL || 0.24) * L;
    var ctY = stand + ctRy * 0.2, ctZ = (p.thoraxZ === undefined ? 0.12 : p.thoraxZ) * L;
    var ceph = M.ellipsoid({
      rx: ctRx, ry: ctRy, rz: ctRz, su: 18, sv: 12, flatBottom: 0.3,
      mottle: p.mottle === undefined ? 0.08 : p.mottle,
      color: c.thorax || c.body, gloss: gl + 0.15, matrix: m4.trans(0, ctY, ctZ)
    });
    // eye cluster
    for (var ex = -1; ex <= 1; ex += 2) {
      for (var ei = 0; ei < 2; ei++) {
        M.merge(ceph, M.ellipsoid({
          rx: L * 0.018, ry: L * 0.018, rz: L * 0.018, su: 6, sv: 4,
          color: c.eye || [10, 8, 8], gloss: 0.9,
          matrix: m4.trans(ex * ctRx * (0.25 + ei * 0.3), ctY + ctRy * 0.55, ctZ + ctRz * (0.82 - ei * 0.12))
        }));
      }
    }
    parts.push({ name: 'cephalothorax', mesh: ceph });

    // pedipalps
    for (var ps = -1; ps <= 1; ps += 2) {
      parts.push({
        name: 'palp' + ps,
        mesh: M.tube({
          path: M.curvePath(
            [ps * ctRx * 0.5, ctY - ctRy * 0.2, ctZ + ctRz * 0.7],
            [ps * ctRx * 1.0, ctY - ctRy * 0.5, ctZ + ctRz * 1.15],
            [ps * ctRx * 0.9, stand * 0.35, ctZ + ctRz * 1.5], 5),
          radii: M.taper(6, L * 0.024, L * 0.014), sides: 5, color: c.leg || c.body, gloss: gl
        })
      });
    }

    if (p.setae !== false) {
      var ast = p.setae || {};
      parts.push({
        name: 'setae',
        mesh: M.setae({
          rx: abRx * 0.98, ry: abRy * 0.98, rz: abRz * 0.98,
          count: ast.count || 110, len: (ast.len || 0.032) * L, thick: (ast.thick || 0.0022) * L,
          color: ast.color || mix(c.abdomen || c.body, [255, 240, 220], 0.25),
          minY: ast.minY === undefined ? -0.4 : ast.minY,
          cover: ast.cover || 1.6, sweep: ast.sweep === undefined ? 0.2 : ast.sweep,
          matrix: m4.trans(0, abY, abZ)
        })
      });
    }

    // eight legs, knees high above the body — unmistakably spider
    var lg = p.legs || {};
    var zs = lg.attachZ || [0.22, 0.10, -0.02, -0.14];
    var dirs = lg.dirs || [0.55, 1.15, 1.85, 2.5];
    var lens = lg.scale || [1.05, 0.95, 0.92, 1.15];
    for (var pr = 0; pr < 4; pr++) {
      for (var sd = -1; sd <= 1; sd += 2) {
        parts.push({
          name: 'leg' + pr + sd, kind: 'leg', side: sd, pair: pr,
          mesh: buildLeg({
            side: sd,
            attach: [sd * ctRx * 0.8, ctY - ctRy * 0.1, ctZ + zs[pr] * L],
            len: L * lens[pr],
            dir: dirs[pr],
            kneeOut: lg.kneeOut === undefined ? 0.30 : lg.kneeOut,
            kneeUp: lg.kneeUp === undefined ? 0.42 : lg.kneeUp,
            footOut: lg.footOut === undefined ? 0.62 : lg.footOut,
            footY: 0,
            thick: lg.thick === undefined ? 0.030 : lg.thick,
            color: c.leg || c.body, gloss: gl
          })
        });
      }
    }
    return finish(parts, p);
  }

  /* ---------------- plan: rodent ------------------------------------------ */

  function buildRodent(p) {
    var L = p.len, c = p.colors, gl = p.gloss === undefined ? 0.22 : p.gloss;
    var parts = [];
    var stand = (p.stand || 0.13) * L;
    var bRx = (p.bodyW || 0.17) * L, bRy = (p.bodyH || 0.18) * L, bRz = (p.bodyL || 0.40) * L;
    p._abdomenRx = bRx; p._abdomenRy = bRy; p._abdomenRz = bRz;
    var bY = stand + bRy * 0.92;
    var bodyCol = paletteFor('abdomen', p);

    // two overlapping masses give the hunched rat silhouette
    parts.push({
      name: 'body',
      mesh: M.merge(
        M.ellipsoid({
          rx: bRx, ry: bRy, rz: bRz, su: 22, sv: 15, taperFront: 0.30, taperBack: 0.25,
          mottle: p.mottle === undefined ? 0.09 : p.mottle,
          color: bodyCol, gloss: gl, matrix: m4.trans(0, bY, -bRz * 0.08)
        }),
        M.ellipsoid({
          rx: bRx * 0.92, ry: bRy * 0.86, rz: bRz * 0.5, su: 14, sv: 9,
          color: bodyCol, gloss: gl, matrix: m4.trans(0, bY + bRy * 0.12, -bRz * 0.45)
        })
      )
    });

    var hRx = (p.headW || 0.115) * L, hRy = (p.headH || 0.115) * L, hRz = (p.headL || 0.17) * L;
    var hZ = bRz * 0.82, hY = bY + bRy * 0.05;
    var head = M.ellipsoid({
      rx: hRx, ry: hRy, rz: hRz, su: 18, sv: 13, taperFront: 0.55,
      color: bodyCol, gloss: gl, matrix: m4.trans(0, hY, hZ)
    });
    // snout
    M.merge(head, M.tube({
      path: [[0, hY - hRy * 0.15, hZ + hRz * 0.5], [0, hY - hRy * 0.42, hZ + hRz * 1.12]],
      radii: [hRx * 0.62, hRx * 0.16], sides: 8, color: bodyCol, gloss: gl
    }));
    M.merge(head, M.ellipsoid({
      rx: hRx * 0.17, ry: hRx * 0.14, rz: hRx * 0.14, su: 6, sv: 5,
      color: c.nose || [196, 132, 138], gloss: 0.7,
      matrix: m4.trans(0, hY - hRy * 0.46, hZ + hRz * 1.16)
    }));
    // ears — big thin discs, the giveaway between roof rat and mouse
    for (var es = -1; es <= 1; es += 2) {
      M.merge(head, M.ellipsoid({
        rx: (p.ear || 0.075) * L, ry: (p.ear || 0.075) * L * 0.95, rz: L * 0.012, su: 12, sv: 6,
        color: c.ear || mix(bodyCol.length ? bodyCol : [120, 100, 90], [214, 170, 166], 0.45), gloss: 0.35,
        matrix: m4.chain(
          m4.trans(es * hRx * 0.82, hY + hRy * 0.95, hZ - hRz * 0.22),
          m4.rotY(es * 0.5), m4.rotZ(es * 0.25))
      }));
    }
    for (var ys = -1; ys <= 1; ys += 2) {
      M.merge(head, M.ellipsoid({
        rx: hRx * 0.17, ry: hRx * 0.17, rz: hRx * 0.17, su: 8, sv: 6,
        color: c.eye || [16, 12, 12], gloss: 0.9,
        matrix: m4.trans(ys * hRx * 0.66, hY + hRy * 0.28, hZ + hRz * 0.42)
      }));
    }
    // whiskers
    for (var ws = -1; ws <= 1; ws += 2) {
      for (var wi = 0; wi < 3; wi++) {
        M.merge(head, M.tube({
          path: M.curvePath(
            [ws * hRx * 0.3, hY - hRy * 0.3, hZ + hRz * 0.95],
            [ws * hRx * 1.3, hY - hRy * 0.05 + wi * L * 0.02, hZ + hRz * 1.2],
            [ws * hRx * 2.4, hY - hRy * 0.5 + wi * L * 0.05, hZ + hRz * 1.15], 4),
          radii: [L * 0.006, L * 0.004, L * 0.003, L * 0.002, L * 0.001],
          sides: 3, color: c.whisker || [225, 220, 215], gloss: 0.1
        }));
      }
    }
    parts.push({ name: 'head', mesh: head, pivot: [0, hY, hZ] });

    // legs — short, tucked, four of them
    var lg = p.legs || {};
    var zs = lg.attachZ || [0.30, -0.26];
    for (var pr = 0; pr < 2; pr++) {
      for (var sd = -1; sd <= 1; sd += 2) {
        parts.push({
          name: 'leg' + pr + sd, kind: 'leg', side: sd, pair: pr,
          mesh: buildLeg({
            side: sd,
            attach: [sd * bRx * 0.72, bY - bRy * 0.55, zs[pr] * L],
            len: L,
            dir: pr === 0 ? 0.5 : 2.6,
            kneeOut: 0.10, kneeUp: -0.02, footOut: 0.14,
            footY: 0, thick: 0.045,
            color: bodyCol, gloss: gl, sides: 6
          })
        });
      }
    }

    // tail
    var tl = (p.tail || 1.0) * L;
    parts.push({
      name: 'tail',
      mesh: M.tube({
        path: M.curvePath(
          [0, bY - bRy * 0.25, -bRz * 1.0],
          [0, bY - bRy * 0.1, -bRz - tl * 0.45],
          [tl * 0.22, stand * 0.4, -bRz - tl * 0.92], 10),
        radii: M.taper(11, bRx * 0.30, bRx * 0.05, 0.8),
        sides: 7, color: c.tail || [176, 150, 146], gloss: 0.4
      }),
      pivot: [0, bY, -bRz]
    });

    return finish(parts, p);
  }

  /* ---------------- assembly ---------------------------------------------- */

  /**
   * Re-centre on the origin, attach idle animation, and hand back a model the
   * renderer can spin. Idle motion is per-part matrices, not a rebuilt mesh,
   * so it costs nothing per frame.
   */
  function finish(parts, p) {
    // Two bounding boxes: everything, and everything except the antennae.
    // Framing follows the body box, otherwise a long-whiskered roach gets
    // shrunk to a dot to make room for two hairs.
    var all = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity };
    var core = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity };
    function grow(box, x, y, z) {
      if (x < box.minX) box.minX = x;
      if (x > box.maxX) box.maxX = x;
      if (y < box.minY) box.minY = y;
      if (y > box.maxY) box.maxY = y;
      if (z < box.minZ) box.minZ = z;
      if (z > box.maxZ) box.maxZ = z;
    }
    for (var i = 0; i < parts.length; i++) {
      var pos = parts[i].mesh.pos;
      var isWhisker = parts[i].kind === 'antenna' || parts[i].name === 'tail';
      for (var j = 0; j < pos.length; j += 3) {
        grow(all, pos[j], pos[j + 1], pos[j + 2]);
        if (!isWhisker) grow(core, pos[j], pos[j + 1], pos[j + 2]);
      }
    }
    var minY = all.minY;
    var cy = (core.minY + core.maxY) / 2;
    var czc = (core.minZ + core.maxZ) / 2;
    var coreSpan = Math.max(core.maxX - core.minX, core.maxZ - core.minZ, (core.maxY - core.minY) * 1.7);
    var fullSpan = Math.max(all.maxX - all.minX, all.maxZ - all.minZ);
    // let extremities overhang, but never more than a third out of frame
    var span = Math.max(coreSpan, fullSpan * 0.66);

    var model = {
      parts: parts,
      pre: m4.trans(0, -cy, -czc),
      groundY: minY - cy,
      span: span,
      shadowScale: 1,
      shadowDrop: 1
    };

    var idle = p.idle === undefined ? 1 : p.idle;
    for (var k = 0; k < parts.length; k++) {
      M.normals(parts[k].mesh);
      attachIdle(parts[k], idle, p);
    }
    return model;
  }

  function attachIdle(part, amt, p) {
    if (!amt) return;
    var pivot = part.pivot;
    if (part.kind === 'antenna') {
      var side = part.side, ph = side > 0 ? 0 : 1.7;
      part.anim = function (t) {
        var a = Math.sin(t * 2.1 + ph) * 0.13 * amt;
        var b = Math.cos(t * 1.4 + ph) * 0.09 * amt;
        return m4.aroundPivot(pivot[0], pivot[1], pivot[2], m4.mul(m4.rotY(a), m4.rotX(b)));
      };
    } else if (part.kind === 'leg') {
      var ph2 = part.pair * 1.9 + (part.side > 0 ? 0 : 0.9);
      part.anim = function (t) {
        var a = Math.sin(t * 1.6 + ph2) * 0.022 * amt;
        return m4.rotY(a);
      };
    } else if (part.name === 'head' && pivot) {
      part.anim = function (t) {
        var a = Math.sin(t * 0.9) * 0.05 * amt;
        return m4.aroundPivot(pivot[0], pivot[1], pivot[2], m4.rotY(a));
      };
    } else if (part.name === 'tail' && pivot) {
      part.anim = function (t) {
        var a = Math.sin(t * 1.1) * 0.10 * amt;
        return m4.aroundPivot(pivot[0], pivot[1], pivot[2], m4.rotY(a));
      };
    }
  }

  BB.anatomy = {
    build: function (spec) {
      var p = JSON.parse(JSON.stringify(spec));
      // colour functions are lost by the clone above, so copy them back
      p.colors = spec.colors;
      p.markings = spec.markings;
      if (spec.plan === 'arachnid') return buildArachnid(p);
      if (spec.plan === 'rodent') return buildRodent(p);
      return buildInsect(p);
    },
    mix: mix
  };
})(typeof window !== 'undefined' ? window : globalThis);
