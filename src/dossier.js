/*
 * dossier.js — the show.
 *
 * Boots a stage, spins up the specimen, then types the dossier down the side
 * with the terminal clatter under it. Everything is driven by URL parameters
 * so one file serves the website embed, the vertical reel and the headless
 * video capture:
 *
 *   ?pest=german-cockroach   which specimen (or `random`)
 *   ?format=web|reel|square|wide
 *   ?speed=1.4               typing speed multiplier
 *   ?items=3                 cap list lengths (reels want fewer)
 *   ?sound=1                 arm audio immediately (capture only — browsers
 *                            block it without a gesture)
 *   ?autoplay=1  ?loop=1  ?chrome=0  ?cta=0
 *   ?hold=1                  build but wait for BBStage.play() (recorder)
 */
(function (root) {
  'use strict';
  var BB = (root.BB = root.BB || {});
  var doc = root.document;

  var FORMATS = {
    web: { cls: 'fmt-web' },
    wide: { cls: 'fmt-wide' },
    reel: { cls: 'fmt-reel', items: 3, speed: 1.15 },
    square: { cls: 'fmt-square', items: 4 }
  };

  function qs(name, def) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(root.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : def;
  }
  function el(tag, cls, parent) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }
  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  /* ------------------------------------------------------------------ *
   * Stage
   * ------------------------------------------------------------------ */
  function Stage(mount, opts) {
    opts = opts || {};
    this.opts = opts;
    this.mount = mount;
    this.format = FORMATS[opts.format] ? opts.format : 'web';
    var f = FORMATS[this.format];
    this.speed = parseFloat(opts.speed || f.speed || 1);
    this.itemCap = parseInt(opts.items || f.items || 99, 10);
    this.showCta = opts.cta !== '0' && opts.cta !== false;
    this.showChrome = opts.chrome !== '0' && opts.chrome !== false;
    this.loop = opts.loop === '1' || opts.loop === true;
    this.token = 0;
    this.skip = false;
    this.spin = 0;
    this.spinRate = 0.55;
    this.dragging = false;
    this.build();
  }

  Stage.prototype.build = function () {
    var self = this;
    var wrap = el('div', 'bb ' + FORMATS[this.format].cls, this.mount);
    this.root = wrap;
    wrap.setAttribute('data-format', this.format);

    var stage = el('div', 'bb-stage', wrap);
    this.stageEl = stage;
    this.canvas = el('canvas', 'bb-canvas', stage);

    var hud = el('div', 'bb-hud', stage);
    hud.innerHTML =
      '<span class="bb-br tl"></span><span class="bb-br tr"></span>' +
      '<span class="bb-br bl"></span><span class="bb-br br"></span>' +
      '<div class="bb-reticle"><i></i><b></b></div>' +
      '<div class="bb-sweep"></div>' +
      '<div class="bb-readout"><span class="bb-rot">ROT 000°</span><span class="bb-scale"></span></div>' +
      '<div class="bb-stagetag">LIVE SPECIMEN SCAN · 360°</div>';
    this.rotEl = hud.querySelector('.bb-rot');
    this.scaleEl = hud.querySelector('.bb-scale');
    this.sweepEl = hud.querySelector('.bb-sweep');

    var panel = el('div', 'bb-panel', wrap);
    this.panelEl = panel;
    var head = el('div', 'bb-panelhead', panel);
    head.innerHTML =
      '<span class="bb-unit">' + BB.BRAND.unit + '</span>' +
      '<span class="bb-file">FILE <b class="bb-fileno">—</b></span>';
    this.fileNoEl = head.querySelector('.bb-fileno');

    this.docEl = el('div', 'bb-doc', panel);
    this.ctaEl = el('div', 'bb-cta', panel);

    if (this.showChrome) this.buildControls(wrap);

    el('div', 'bb-scanlines', wrap);
    el('div', 'bb-vignette', wrap);

    this.renderer = new BB.Renderer(this.canvas, {
      tilt: 0.40, fov: 2.95, fovY: 0.92, ambient: 0.30,
      light: [-0.42, 0.86, 0.42], rim: [0.7, -0.1, -0.7]
    });

    this.resize();
    root.addEventListener('resize', function () { self.resize(); });

    // drag to inspect — people always try it on a spinning object
    var lastX = 0;
    function down(e) {
      self.dragging = true;
      lastX = (e.touches ? e.touches[0].clientX : e.clientX);
      stage.classList.add('is-dragging');
    }
    function move(e) {
      if (!self.dragging) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX);
      self.spin += (x - lastX) * 0.012;
      lastX = x;
      if (e.cancelable) e.preventDefault();
    }
    function up() { self.dragging = false; stage.classList.remove('is-dragging'); }
    stage.addEventListener('mousedown', down);
    stage.addEventListener('touchstart', down, { passive: true });
    root.addEventListener('mousemove', move);
    root.addEventListener('touchmove', move, { passive: false });
    root.addEventListener('mouseup', up);
    root.addEventListener('touchend', up);

    // click / space skips the current typing pass
    wrap.addEventListener('click', function (e) {
      if (e.target.closest('.bb-controls') || e.target.closest('a')) return;
      self.skip = true;
    });
    doc.addEventListener('keydown', function (e) {
      if (e.code === 'Space') { self.skip = true; e.preventDefault(); }
      if (e.key === 'r' || e.key === 'R') self.play();
    });

    this.startLoop();
  };

  Stage.prototype.buildControls = function (wrap) {
    var self = this;
    var c = el('div', 'bb-controls', wrap);

    var sel = el('select', 'bb-select', c);
    BB.PESTS.forEach(function (p) {
      var o = el('option', null, sel);
      o.value = p.id;
      o.textContent = p.name;
    });
    sel.addEventListener('change', function () { self.load(sel.value); });
    this.selectEl = sel;

    var replay = el('button', 'bb-btn', c);
    replay.innerHTML = '&#9654; REPLAY';
    replay.addEventListener('click', function () { self.play(); });

    var snd = el('button', 'bb-btn', c);
    snd.innerHTML = '&#128266; SOUND: OFF';
    snd.addEventListener('click', function () {
      var on = BB.sfx.toggle();
      snd.innerHTML = on ? '&#128266; SOUND: ON' : '&#128264; SOUND: OFF';
      snd.classList.toggle('is-on', !!on);
      if (on) BB.sfx.drone(true);
    });
    this.soundBtn = snd;

    var spd = el('button', 'bb-btn', c);
    var speeds = [1, 1.5, 2, 0.75];
    var si = 0;
    spd.textContent = '1× SPEED';
    spd.addEventListener('click', function () {
      si = (si + 1) % speeds.length;
      self.speed = speeds[si];
      spd.textContent = speeds[si] + '× SPEED';
    });
  };

  Stage.prototype.resize = function () {
    var r = this.stageEl.getBoundingClientRect();
    this.renderer.resize(r.width, r.height, root.devicePixelRatio || 1);
  };

  Stage.prototype.startLoop = function () {
    var self = this, last = performance.now(), t0 = last;
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!self.dragging) self.spin += self.spinRate * dt;
      self.renderer.render(self.spin, (now - t0) / 1000);
      if (self.rotEl) {
        var deg = ((self.spin * 180 / Math.PI) % 360 + 360) % 360;
        self.rotEl.textContent = 'ROT ' + ('00' + Math.round(deg)).slice(-3) + '°';
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  /* ---------------- loading a specimen ------------------------------- */

  /** @param hold  build the specimen but wait for an external play() —
   *               the video recorder uses it to line audio up with frame 1 */
  Stage.prototype.load = function (id, hold) {
    var pest = BB.pestById(id) || BB.PESTS[0];
    this.pest = pest;
    var model = BB.anatomy.build(pest.spec);
    model.scale = (pest.spec.fit || 1) * (2.4 / (model.span || 2.4));
    this.renderer.setModel(model);
    if (this.selectEl) this.selectEl.value = pest.id;
    if (this.scaleEl) this.scaleEl.textContent = 'ACTUAL ' + pest.actualSize;
    if (this.fileNoEl) this.fileNoEl.textContent = fileNumber(pest);
    doc.title = pest.name + ' — Pest Dossier | ' + BB.BRAND.company;
    this.renderer.render(0, 0);
    if (!hold) this.play();
  };

  function fileNumber(pest) {
    var n = 0;
    for (var i = 0; i < pest.id.length; i++) n = (n * 31 + pest.id.charCodeAt(i)) % 9000;
    return 'SB-' + (1000 + n);
  }

  /* ---------------- typing ------------------------------------------- */

  /**
   * Type `text` into `node` one character at a time. Resolves early if the
   * viewer skips or the run token moves on (replay / new specimen).
   */
  Stage.prototype.type = function (node, text, cps, hard) {
    var self = this;
    var my = this.token;
    return new Promise(function (resolve) {
      var i = 0;
      var perChar = 1000 / (cps * self.speed);
      node.classList.add('typing');
      function step() {
        if (my !== self.token) { node.classList.remove('typing'); return resolve(); }
        if (self.skip) {
          node.textContent = text;
          node.classList.remove('typing');
          return resolve();
        }
        var batch = perChar < 8 ? Math.ceil(8 / perChar) : 1;
        for (var b = 0; b < batch && i < text.length; b++) {
          node.textContent += text.charAt(i++);
        }
        if (text.charAt(i - 1) !== ' ') (hard ? BB.sfx.keyHard() : BB.sfx.key());
        self.scrollDown();
        if (i < text.length) setTimeout(step, perChar * batch);
        else { node.classList.remove('typing'); resolve(); }
      }
      step();
    });
  };

  Stage.prototype.pause = function (ms) {
    var self = this, my = this.token;
    return new Promise(function (resolve) {
      var waited = 0, tick = 30;
      (function step() {
        if (my !== self.token || self.skip) return resolve();
        waited += tick;
        if (waited >= ms / self.speed) return resolve();
        setTimeout(step, tick);
      })();
    });
  };

  Stage.prototype.scrollDown = function () {
    this.docEl.scrollTop = this.docEl.scrollHeight;
  };

  /* ---------------- the sequence ------------------------------------- */

  Stage.prototype.play = async function () {
    var self = this;
    var pest = this.pest;
    if (!pest) return;
    this.token++;
    var my = this.token;
    this.skip = false;
    this.docEl.innerHTML = '';
    this.ctaEl.innerHTML = '';
    this.ctaEl.classList.remove('is-in');
    this.root.classList.remove('is-locked');
    this.spinRate = 3.4;                       // spin up, then settle
    var alive = function () { return my === self.token; };

    // 1. boot handshake
    var boot = el('div', 'bb-boot', this.docEl);
    var lines = [
      BB.BRAND.unit,
      'ESTABLISHING LINK ................ OK',
      'DATABASE: ' + BB.PESTS.length + ' SPECIES ON FILE',
      'SCANNING SPECIMEN ...'
    ];
    for (var i = 0; i < lines.length; i++) {
      if (!alive()) return;
      var ln = el('div', 'bb-bootline', boot);
      await this.type(ln, lines[i], 90);
      await this.pause(70);
    }
    if (!alive()) return;
    BB.sfx.scan();
    this.stageEl.classList.add('is-scanning');
    await this.pause(700);
    this.stageEl.classList.remove('is-scanning');
    if (!alive()) return;

    // 2. lock
    BB.sfx.stamp();
    this.root.classList.add('is-locked');
    var stamp = el('div', 'bb-stamp', this.docEl);
    stamp.textContent = 'SPECIMEN IDENTIFIED';
    await this.pause(320);
    if (!alive()) return;

    // 3. identity block
    var idb = el('div', 'bb-id', this.docEl);
    var h1 = el('h1', 'bb-name', idb);
    await this.type(h1, pest.name.toUpperCase(), 15, true);
    var sci = el('div', 'bb-sci', idb);
    await this.type(sci, pest.sci, 42);
    if (pest.aka && pest.aka.length) {
      var aka = el('div', 'bb-aka', idb);
      await this.type(aka, 'AKA: ' + pest.aka.join(' · '), 70);
    }
    var ord = el('div', 'bb-order', idb);
    await this.type(ord, pest.order, 70);

    // 4. threat meter
    if (!alive()) return;
    var tw = el('div', 'bb-threat', this.docEl);
    tw.innerHTML = '<div class="bb-threatlab">THREAT LEVEL</div><div class="bb-bar"><span></span></div><div class="bb-threattxt"></div>';
    var bar = tw.querySelector('.bb-bar span');
    bar.style.width = (pest.threat * 20) + '%';
    bar.setAttribute('data-lvl', pest.threat);
    BB.sfx.alarm();
    await this.pause(260);
    await this.type(tw.querySelector('.bb-threattxt'), pest.threatLabel, 55, true);

    if (pest.tagline) {
      var tag = el('div', 'bb-tagline', this.docEl);
      await this.type(tag, '"' + pest.tagline + '"', 48);
    }

    // 5. sections
    var cap = this.itemCap;
    await this.section('VITAL STATISTICS', pest.vitals.slice(0, Math.max(cap, 4)), 'kv');
    await this.section('CHARGES', pest.charges.slice(0, cap), 'charge');
    await this.section('METHOD OF OPERATION', pest.mo.slice(0, cap), 'list');
    await this.section('EVIDENCE AT THE SCENE', pest.evidence.slice(0, cap), 'list');
    await this.section('KNOWN HIDEOUTS', pest.hideouts, 'chips');
    await this.section('OUR VERDICT', [pest.verdict], 'verdict');

    if (!alive()) return;

    // 6. call to action
    if (this.showCta) {
      BB.sfx.lock();
      var B = BB.BRAND;
      this.ctaEl.innerHTML =
        '<div class="bb-ctahead">' + B.ctaHead + '</div>' +
        '<div class="bb-ctaline">' + B.ctaLine + '</div>' +
        '<div class="bb-ctarow">' +
        '<a class="bb-ctabtn" href="' + B.phoneHref + '">' + B.phoneLabel + '</a>' +
        '<a class="bb-ctabtn ghost" href="' + B.bookUrl + '" target="_blank" rel="noopener">' + B.ctaButton + '</a>' +
        '</div>' +
        '<div class="bb-ctafoot">' + B.proof + '<br>' + B.guarantee + '<br>' + B.licences + '</div>';
      this.ctaEl.classList.add('is-in');
    }
    this.scrollDown();

    // settle the turntable to a slow, steady rotation
    var settle = setInterval(function () {
      if (my !== self.token) return clearInterval(settle);
      self.spinRate += (0.55 - self.spinRate) * 0.06;
      if (Math.abs(self.spinRate - 0.55) < 0.01) { self.spinRate = 0.55; clearInterval(settle); }
    }, 30);

    if (this.loop) {
      await this.pause(6000);
      if (alive()) this.play();
    }
  };

  Stage.prototype.section = async function (title, items, kind) {
    var my = this.token, self = this;
    if (my !== this.token || !items || !items.length) return;
    this.skip = false;                       // a skip only fast-forwards one section
    var sec = el('div', 'bb-sec bb-sec-' + kind, this.docEl);
    var h = el('div', 'bb-sechead', sec);
    BB.sfx.beep(920, 0.05);
    await this.type(h, title, 55, true);
    if (my !== this.token) return;

    if (kind === 'chips') {
      var box = el('div', 'bb-chipbox', sec);
      for (var c = 0; c < items.length; c++) {
        if (my !== this.token) return;
        var chip = el('span', 'bb-chip', box);
        await this.type(chip, items[c], 95);
        await this.pause(40);
      }
      await this.pause(240);
      return;
    }

    for (var i = 0; i < items.length; i++) {
      if (my !== this.token) return;
      var it = items[i];
      var row = el('div', 'bb-row', sec);
      if (kind === 'kv') {
        var k = el('span', 'bb-k', row);
        var v = el('span', 'bb-v', row);
        await this.type(k, it[0], 110);
        await this.type(v, it[1], 78);
      } else if (kind === 'charge') {
        var n = el('span', 'bb-n', row);
        n.textContent = ('0' + (i + 1)).slice(-2);
        var t = el('span', 'bb-t', row);
        await this.type(t, it, 70);
      } else if (kind === 'verdict') {
        var vt = el('span', 'bb-t', row);
        await this.type(vt, it, 62);
      } else {
        el('span', 'bb-dot', row).textContent = '›';
        var t2 = el('span', 'bb-t', row);
        await this.type(t2, it, 78);
      }
      await this.pause(90);
    }
    await this.pause(260);
  };

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  BB.mountDossier = function (mountSel, overrides) {
    var mount = typeof mountSel === 'string' ? doc.querySelector(mountSel) : mountSel;
    var o = overrides || {};
    var opts = {
      format: o.format || qs('format', 'web'),
      speed: o.speed || qs('speed'),
      items: o.items || qs('items'),
      cta: o.cta !== undefined ? o.cta : qs('cta'),
      chrome: o.chrome !== undefined ? o.chrome : qs('chrome'),
      loop: o.loop !== undefined ? o.loop : qs('loop')
    };
    var stage = new Stage(mount, opts);
    var want = o.pest || qs('pest', BB.PESTS[0].id);
    if (want === 'random') want = BB.PESTS[Math.floor(Math.random() * BB.PESTS.length)].id;

    if (qs('sound') === '1' || o.sound) {
      if (BB.sfx.enable()) {
        BB.sfx.drone(true);
        if (stage.soundBtn) {
          stage.soundBtn.innerHTML = '&#128266; SOUND: ON';
          stage.soundBtn.classList.add('is-on');
        }
      }
    }
    // first real gesture arms audio, the way every browser insists
    var armed = false;
    function arm() {
      if (armed) return;
      armed = true;
      if (qs('sound') !== '0' && BB.sfx.enable()) {
        BB.sfx.drone(true);
        if (stage.soundBtn) {
          stage.soundBtn.innerHTML = '&#128266; SOUND: ON';
          stage.soundBtn.classList.add('is-on');
        }
      }
    }
    doc.addEventListener('pointerdown', arm, { once: true });
    doc.addEventListener('keydown', arm, { once: true });

    root.BBStage = stage;
    stage.load(want, qs('hold') === '1' || o.hold);
    return stage;
  };
})(typeof window !== 'undefined' ? window : globalThis);
