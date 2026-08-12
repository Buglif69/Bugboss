/*
 * gallery.js — the "which pest have I got?" index page.
 *
 * A card per species with a real rendered specimen (still by default, turning
 * while hovered or touched — eight simultaneous turntables would cook a phone).
 * Clicking a card opens that dossier full-screen over the page.
 */
(function (root) {
  'use strict';
  var BB = (root.BB = root.BB || {});
  var doc = root.document;

  function el(tag, cls, parent, text) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  BB.mountGallery = function (sel, opts) {
    opts = opts || {};
    var mount = typeof sel === 'string' ? doc.querySelector(sel) : sel;
    var B = BB.BRAND;

    var head = el('header', 'gal-head', mount);
    head.innerHTML =
      '<div class="gal-unit">' + B.unit + '</div>' +
      '<h1 class="gal-title">Know what you\'re dealing with</h1>' +
      '<p class="gal-sub">Eight of the pests we get called out to most across ' + B.area +
      '. Pick one to spin the specimen and read the full file — what it is, what it does, ' +
      'where it hides and how it gets treated.</p>' +
      '<p class="gal-hint">Drag the specimen to turn it · sound switches on at your first tap</p>';

    var grid = el('div', 'gal-grid', mount);
    var cards = [];

    BB.PESTS.forEach(function (pest) {
      var card = el('button', 'gal-card', grid);
      card.type = 'button';
      card.setAttribute('aria-label', 'Open the ' + pest.name + ' dossier');

      var stage = el('div', 'gal-stage', card);
      var cv = el('canvas', null, stage);
      el('div', 'gal-spin', stage).textContent = 'DRAG / HOVER TO ROTATE';

      var body = el('div', 'gal-body', card);
      el('div', 'gal-name', body, pest.name);
      el('div', 'gal-sci', body, pest.sci);

      var meta = el('div', 'gal-meta', body);
      var pips = el('span', 'gal-pips', meta);
      for (var i = 0; i < 5; i++) {
        var pip = el('i', i < pest.threat ? 'on' : null, pips);
        pip.setAttribute('aria-hidden', 'true');
      }
      el('span', 'gal-size', meta, pest.actualSize);

      var r = new BB.Renderer(cv, {
        tilt: 0.42, fov: 2.85, fovY: 0.95, ambient: 0.30,
        light: [-0.42, 0.86, 0.42]
      });
      var model = BB.anatomy.build(pest.spec);
      model.scale = (pest.spec.fit || 1) * (2.4 / (model.span || 2.4));
      r.setModel(model);

      var entry = { r: r, spin: 0.7, live: false, stage: stage, cv: cv };
      cards.push(entry);

      function size() {
        var b = stage.getBoundingClientRect();
        if (!b.width) return;
        r.resize(b.width, b.height, root.devicePixelRatio || 1);
        r.render(entry.spin, 0);
      }
      entry.size = size;

      function start() {
        if (entry.live) return;
        entry.live = true;
        var last = performance.now();
        (function step(now) {
          if (!entry.live) return;
          entry.spin += (now - last) / 1000 * 0.85;
          last = now;
          r.render(entry.spin, now / 1000);
          requestAnimationFrame(step);
        })(last);
      }
      function stop() { entry.live = false; }

      card.addEventListener('mouseenter', start);
      card.addEventListener('mouseleave', stop);
      card.addEventListener('touchstart', start, { passive: true });
      card.addEventListener('click', function () { openDossier(pest.id); });
    });

    // first paint once the layout has settled
    function sizeAll() { cards.forEach(function (c) { c.size(); }); }
    requestAnimationFrame(sizeAll);
    root.addEventListener('resize', sizeAll);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(sizeAll);

    var foot = el('footer', 'gal-foot', mount);
    foot.innerHTML =
      '<a class="gal-cta" href="' + B.phoneHref + '">' + B.phoneLabel + '</a>' +
      '<a class="gal-cta ghost" href="' + B.bookUrl + '" target="_blank" rel="noopener">' + B.ctaButton + '</a>' +
      '<div class="gal-fine">' + B.company + ' · ' + B.proof + '<br>' +
      B.guarantee + ' · ' + B.licences + ' · ' + B.legal + '</div>';

    /* ---- full-screen dossier overlay ---- */
    var overlay = el('div', 'gal-overlay', mount);
    var bar = el('div', 'gal-bar', overlay);
    var frame = null;
    var closeBtn = el('button', 'gal-close', bar, '✕ CLOSE');
    closeBtn.type = 'button';
    closeBtn.addEventListener('click', close);
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    // Two ways to show a dossier: mounted straight into the page when the
    // dossier code is bundled alongside the gallery (one file, no iframe), or
    // an iframe pointing at pest-dossier.html when it is hosted separately.
    var inline = opts.inline !== false && typeof BB.mountDossier === 'function';
    var host = null, stage = null;

    function openDossier(id) {
      if (inline) {
        if (!host) {
          host = el('div', 'gal-inline', overlay);
          stage = BB.mountDossier(host, { pest: id });
        } else {
          stage.load(id);
        }
      } else {
        if (!frame) {
          frame = el('iframe', 'gal-frame', overlay);
          frame.setAttribute('allow', 'autoplay');
          frame.setAttribute('title', 'Pest dossier');
        }
        frame.src = (opts.dossierUrl || 'dossier.html') + '?pest=' + id;
      }
      overlay.classList.add('is-open');
      doc.body.style.overflow = 'hidden';
      if (inline && stage) requestAnimationFrame(function () { stage.resize(); });
    }

    function close() {
      overlay.classList.remove('is-open');
      doc.body.style.overflow = '';
      if (frame) frame.src = 'about:blank';
      if (stage) stage.stop();
    }

    return { open: openDossier, close: close };
  };
})(typeof window !== 'undefined' ? window : globalThis);
