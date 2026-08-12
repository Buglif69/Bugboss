/*
 * sfx.js — the terminal soundtrack, synthesised in the browser.
 *
 * Every sound is generated with the Web Audio API: no mp3s to license, host,
 * or wait on, and the whole dossier still ships as one HTML file. Nothing is
 * created until enable() runs off a real user gesture, so autoplay policy
 * never leaves a page silently broken.
 */
(function (root) {
  'use strict';
  var BB = (root.BB = root.BB || {});

  function Sfx() {
    this.ctx = null;
    this.on = false;
    this.master = null;
    this._droneNodes = null;
    this._lastKey = 0;
  }

  Sfx.prototype.enable = function () {
    if (!this.ctx) {
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.0;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.on = true;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0.85, this.ctx.currentTime, 0.1);
    return true;
  };

  Sfx.prototype.disable = function () {
    this.on = false;
    if (this.master) this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
  };

  Sfx.prototype.toggle = function () {
    if (this.on) { this.disable(); return false; }
    return this.enable();
  };

  /** Short burst of filtered noise — the raw material for clicks and thuds. */
  Sfx.prototype._noise = function (dur, freq, q, gain, type) {
    if (!this.on || !this.ctx) return null;
    var ctx = this.ctx, t = ctx.currentTime;
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = type || 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    var g = ctx.createGain();
    g.gain.value = gain;
    g.gain.setTargetAtTime(0, t + dur * 0.35, dur * 0.4);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.05);
    return g;
  };

  Sfx.prototype._tone = function (freq, dur, gain, type, slideTo) {
    if (!this.on || !this.ctx) return null;
    var ctx = this.ctx, t = ctx.currentTime;
    var o = ctx.createOscillator();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
    return g;
  };

  /** The typewriter click. Pitch jitters so a line of text does not buzz. */
  Sfx.prototype.key = function () {
    if (!this.on || !this.ctx) return;
    var now = this.ctx.currentTime;
    if (now - this._lastKey < 0.018) return;      // never machine-gun
    this._lastKey = now;
    this._noise(0.035, 1500 + Math.random() * 1700, 1.6, 0.16);
    this._tone(160 + Math.random() * 60, 0.03, 0.05, 'square');
  };

  /** Heavier key for headings. */
  Sfx.prototype.keyHard = function () {
    this._noise(0.06, 900 + Math.random() * 500, 1.1, 0.3);
    this._tone(120, 0.05, 0.09, 'square');
  };

  Sfx.prototype.beep = function (f, dur) {
    this._tone(f || 1180, dur || 0.07, 0.11, 'square');
  };

  /** Rising sweep used while the specimen is being "acquired". */
  Sfx.prototype.scan = function () {
    this._tone(220, 0.55, 0.06, 'sawtooth', 1400);
    this._noise(0.5, 2600, 0.8, 0.05, 'highpass');
  };

  /** Chunky confirmation — target locked, section stamped. */
  Sfx.prototype.stamp = function () {
    this._noise(0.22, 220, 0.7, 0.5, 'lowpass');
    this._tone(70, 0.3, 0.35, 'sine', 42);
    this._tone(340, 0.09, 0.1, 'square');
  };

  Sfx.prototype.lock = function () {
    var self = this;
    this._tone(880, 0.06, 0.12, 'square');
    setTimeout(function () { self._tone(1320, 0.12, 0.12, 'square'); }, 90);
  };

  Sfx.prototype.whoosh = function () {
    this._noise(0.65, 700, 0.5, 0.22, 'lowpass');
    this._tone(300, 0.6, 0.05, 'sawtooth', 90);
  };

  Sfx.prototype.alarm = function () {
    var self = this;
    [0, 200, 400].forEach(function (d) {
      setTimeout(function () { self._tone(660, 0.1, 0.1, 'square'); }, d);
    });
  };

  /** Low bed that runs under the whole dossier. Two detuned saws + slow LFO. */
  Sfx.prototype.drone = function (start) {
    if (!this.ctx) return;
    if (!start) {
      if (this._droneNodes) {
        this._droneNodes.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
        this._droneNodes = null;
      }
      return;
    }
    if (this._droneNodes) return;
    var ctx = this.ctx, t = ctx.currentTime;
    var g = ctx.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(0.035, t, 1.2);
    var filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 320;
    var oscs = [];
    [55, 55.4, 82.5].forEach(function (f) {
      var o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.connect(filt);
      o.start(t);
      oscs.push(o);
    });
    var lfo = ctx.createOscillator();
    lfo.frequency.value = 0.09;
    var lg = ctx.createGain();
    lg.gain.value = 120;
    lfo.connect(lg); lg.connect(filt.frequency);
    lfo.start(t);
    oscs.push(lfo);
    filt.connect(g); g.connect(this.master);
    this._droneNodes = { gain: g, oscs: oscs };
  };

  BB.sfx = new Sfx();
})(typeof window !== 'undefined' ? window : globalThis);
