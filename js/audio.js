// Web Audio synth: chip-style voices (pulse, triangle, noise) and all sound effects.
(function () {
  'use strict';
  const HF = window.HF;

  // Pulse wave with a given duty cycle, built from its Fourier series.
  function makePulse(ctx, duty) {
    const n = 64;
    const real = new Float32Array(n), imag = new Float32Array(n);
    for (let k = 1; k < n; k++) {
      real[k] = Math.sin(2 * Math.PI * k * duty) / (Math.PI * k);
      imag[k] = (1 - Math.cos(2 * Math.PI * k * duty)) / (Math.PI * k);
    }
    return ctx.createPeriodicWave(real, imag);
  }

  const A = (HF.Audio = {
    ctx: null,
    master: null,
    musicBus: null,
    sfxBus: null,
    noiseBuf: null,
    waves: {},
    sfxMuted: false,
    lastPlayed: {},

    // Must be called from a user gesture (browsers block audio until then).
    init() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = (this.ctx = new AC());
      this.master = ctx.createGain();
      this.master.gain.value = 1;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -12;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
      comp.release.value = 0.15;
      this.master.connect(comp);
      comp.connect(ctx.destination);
      this.musicBus = ctx.createGain();
      this.musicBus.connect(this.master);
      this.sfxBus = ctx.createGain();
      this.sfxBus.connect(this.master);
      this.applyVolumes();

      const len = ctx.sampleRate;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
      this.waves.pulse12 = makePulse(ctx, 0.125);
      this.waves.pulse25 = makePulse(ctx, 0.25);
      this.waves.pulse50 = makePulse(ctx, 0.5);
      if (HF.Music.pending) HF.Music.play(HF.Music.pending);
    },

    // Called from every real input event. Mobile browsers and Android WebView only let audio start
    // inside a tap's own event (touchend or pointerup, not pointerdown or a later animation frame),
    // and may suspend the context again when the app goes to the background.
    unlock() {
      if (!this.ctx) this.init();
      else if (this.ctx.state !== 'running' && !document.hidden) this.ctx.resume();
    },

    applyVolumes() {
      if (!this.ctx) return;
      this.musicBus.gain.value = HF.settings.music * 1.2;
      this.sfxBus.gain.value = HF.settings.sfx * 1.1;
    },

    osc(wave, freq, t) {
      const o = this.ctx.createOscillator();
      if (this.waves[wave]) o.setPeriodicWave(this.waves[wave]);
      else o.type = wave;
      o.frequency.setValueAtTime(freq, t);
      return o;
    },

    // One synthesized tone with an optional pitch slide and vibrato.
    tone(o) {
      const ctx = this.ctx;
      const t = o.t != null ? o.t : ctx.currentTime + (o.at || 0);
      const dur = o.dur || 0.1;
      const osc = this.osc(o.wave || 'square', o.f || 440, t);
      if (o.f2) {
        if (o.lin) osc.frequency.linearRampToValueAtTime(o.f2, t + dur);
        else osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2), t + dur);
      }
      const g = ctx.createGain();
      const vol = o.vol == null ? 0.2 : o.vol;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + (o.attack || 0.004));
      if (o.hold) g.gain.setValueAtTime(vol, t + o.hold);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      if (o.vib) {
        const l = ctx.createOscillator();
        l.frequency.value = o.vibRate || 8;
        const lg = ctx.createGain();
        lg.gain.value = o.vib;
        l.connect(lg).connect(osc.frequency);
        l.start(t);
        l.stop(t + dur + 0.05);
      }
      osc.connect(g).connect(o.bus || this.sfxBus);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    },

    // A burst of filtered noise.
    noise(o) {
      const ctx = this.ctx;
      const t = o.t != null ? o.t : ctx.currentTime + (o.at || 0);
      const dur = o.dur || 0.1;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      src.loop = true;
      const fl = ctx.createBiquadFilter();
      fl.type = o.type || 'lowpass';
      fl.frequency.setValueAtTime(o.f || 1000, t);
      if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
      fl.Q.value = o.q || 1;
      const g = ctx.createGain();
      const vol = o.vol == null ? 0.25 : o.vol;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + (o.attack || 0.002));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(fl).connect(g).connect(o.bus || this.sfxBus);
      src.start(t, Math.random() * 0.5);
      src.stop(t + dur + 0.05);
    },

    // Play a named effect. `gap` stops rapid repeats of the same sound.
    play(name, arg, gap) {
      if (!this.ctx || this.sfxMuted || !SFX[name]) return;
      if (gap) {
        const now = this.ctx.currentTime;
        if (now - (this.lastPlayed[name] || 0) < gap) return;
        this.lastPlayed[name] = now;
      }
      SFX[name](arg);
    },
  });

  const T = (o) => A.tone(o);
  const N = (o) => A.noise(o);

  const SFX = (HF.SFX = {
    jump(p = 1) {
      T({ wave: 'pulse25', f: 210 * p, f2: 640 * p, dur: 0.13, vol: 0.2 });
    },
    airjump() {
      T({ wave: 'pulse12', f: 360, f2: 1100, dur: 0.1, vol: 0.18 });
      T({ wave: 'pulse12', f: 540, f2: 1600, dur: 0.12, vol: 0.14, at: 0.05 });
    },
    land(h = 0.5) {
      N({ f: 500, f2: 90, dur: 0.09, vol: 0.12 + h * 0.25 });
      T({ wave: 'triangle', f: 130, f2: 55, dur: 0.09, vol: 0.2 + h * 0.2 });
    },
    stomp(power = 1) {
      T({ wave: 'square', f: 700, f2: 90, dur: 0.16, vol: 0.22 });
      N({ type: 'bandpass', f: 1400, f2: 300, q: 2, dur: 0.12, vol: 0.3 });
      T({ wave: 'triangle', f: 260 * (0.8 + power * 0.2), f2: 45, dur: 0.28, vol: 0.4 });
    },
    shatter() {
      N({ type: 'highpass', f: 3500, dur: 0.3, vol: 0.3 });
      [2800, 3600, 4400].forEach((f, i) => T({ wave: 'triangle', f, dur: 0.18, vol: 0.12, at: i * 0.03 }));
    },
    clash() {
      T({ wave: 'square', f: 1480, dur: 0.3, vol: 0.12, vib: 40, vibRate: 30 });
      T({ wave: 'square', f: 1975, dur: 0.24, vol: 0.1 });
      N({ type: 'highpass', f: 3000, dur: 0.12, vol: 0.25 });
    },
    bump() {
      T({ wave: 'triangle', f: 320, f2: 170, dur: 0.13, vol: 0.3, vib: 30, vibRate: 28 });
    },
    dash() {
      N({ type: 'bandpass', f: 700, f2: 3500, q: 1.5, dur: 0.2, vol: 0.3 });
      T({ wave: 'pulse12', f: 400, f2: 950, dur: 0.1, vol: 0.12 });
    },
    hit() {
      T({ wave: 'square', f: 520, f2: 140, dur: 0.15, vol: 0.2 });
      N({ f: 2000, f2: 400, dur: 0.1, vol: 0.2 });
    },
    whistle() {
      T({ wave: 'pulse25', f: 1500, f2: 350, dur: 0.22, vol: 0.13 });
    },
    boom() {
      N({ f: 900, f2: 50, dur: 0.5, vol: 0.55 });
      T({ wave: 'sine', f: 95, f2: 32, dur: 0.45, vol: 0.6 });
      T({ wave: 'square', f: 180, f2: 40, dur: 0.25, vol: 0.12 });
    },
    frost() {
      [1760, 2350, 3135].forEach((f, i) => T({ wave: 'triangle', f, dur: 0.09, vol: 0.14, at: i * 0.035 }));
      N({ type: 'highpass', f: 5000, dur: 0.15, vol: 0.08 });
    },
    freeze() {
      [2093, 2637, 3136, 4186].forEach((f, i) => T({ wave: 'sine', f, dur: 0.4, vol: 0.1, at: i * 0.04 }));
      N({ type: 'highpass', f: 4000, dur: 0.25, vol: 0.15 });
    },
    fireball() {
      N({ f: 2500, f2: 250, dur: 0.38, vol: 0.35 });
      T({ wave: 'sawtooth', f: 220, f2: 70, dur: 0.3, vol: 0.12 });
    },
    burn() {
      N({ type: 'bandpass', f: 1200, f2: 200, dur: 0.3, vol: 0.35 });
      T({ wave: 'square', f: 600, f2: 120, dur: 0.2, vol: 0.15 });
    },
    hiss() {
      N({ type: 'highpass', f: 2500, f2: 6000, dur: 0.35, vol: 0.2 });
    },
    flap() {
      N({ type: 'bandpass', f: 500, q: 3, dur: 0.06, vol: 0.15 });
    },
    charge(level = 0) {
      T({ wave: 'pulse25', f: 180 + level * 700, dur: 0.07, vol: 0.09 });
    },
    spring(p = 1) {
      T({ wave: 'square', f: 140, f2: 700 + 400 * p, dur: 0.34, vol: 0.16, vib: 50, vibRate: 18 });
    },
    warn() {
      T({ wave: 'square', f: 880, dur: 0.08, vol: 0.12 });
      T({ wave: 'square', f: 880, dur: 0.08, vol: 0.12, at: 0.14 });
    },
    spikes() {
      T({ wave: 'square', f: 300, f2: 600, dur: 0.12, vol: 0.15 });
      T({ wave: 'square', f: 1200, dur: 0.18, vol: 0.08, at: 0.08, vib: 60, vibRate: 40 });
      N({ type: 'highpass', f: 3000, dur: 0.12, vol: 0.18, at: 0.08 });
    },
    ouch() {
      T({ wave: 'square', f: 1000, f2: 200, dur: 0.25, vol: 0.18 });
      T({ wave: 'triangle', f: 500, f2: 100, dur: 0.3, vol: 0.25 });
    },
    rage() {
      T({ wave: 'sawtooth', f: 70, f2: 110, dur: 0.8, vol: 0.25, vib: 12, vibRate: 14 });
      N({ f: 500, f2: 120, dur: 0.8, vol: 0.3 });
    },
    ko() {
      N({ f: 3000, f2: 40, dur: 0.9, vol: 0.55 });
      T({ wave: 'square', f: 900, f2: 40, dur: 0.9, vol: 0.18 });
      [784, 659, 523, 392, 262].forEach((f, i) => T({ wave: 'pulse25', f, dur: 0.12, vol: 0.14, at: 0.25 + i * 0.09 }));
    },
    move() {
      T({ wave: 'pulse25', f: 880, dur: 0.045, vol: 0.12 });
    },
    select() {
      T({ wave: 'pulse25', f: 660, dur: 0.07, vol: 0.14 });
      T({ wave: 'pulse25', f: 990, dur: 0.12, vol: 0.14, at: 0.06 });
    },
    back() {
      T({ wave: 'pulse25', f: 440, f2: 300, dur: 0.1, vol: 0.13 });
    },
    tick() {
      T({ wave: 'pulse12', f: 1250, dur: 0.035, vol: 0.12 });
    },
    round() {
      [523, 659, 784].forEach((f, i) => T({ wave: 'pulse25', f, dur: 0.1, vol: 0.15, at: i * 0.07 }));
    },
    fight() {
      T({ wave: 'sine', f: 110, dur: 1.4, vol: 0.4 });
      T({ wave: 'sine', f: 221, dur: 1.0, vol: 0.2 });
      T({ wave: 'triangle', f: 165, f2: 160, dur: 1.2, vol: 0.2, vib: 3, vibRate: 5 });
      N({ f: 1800, f2: 200, dur: 0.6, vol: 0.3 });
      T({ wave: 'square', f: 523, dur: 0.08, vol: 0.12 });
      T({ wave: 'square', f: 1046, dur: 0.18, vol: 0.12, at: 0.08 });
    },
    timeup() {
      T({ wave: 'square', f: 1568, dur: 0.5, vol: 0.12, vib: 80, vibRate: 25 });
    },
    pause() {
      T({ wave: 'pulse25', f: 988, dur: 0.06, vol: 0.12 });
      T({ wave: 'pulse25', f: 740, dur: 0.08, vol: 0.12, at: 0.06 });
    },
    cheer() {
      [523, 659, 784, 1046].forEach((f, i) => T({ wave: 'pulse25', f, dur: 0.14, vol: 0.13, at: i * 0.06 }));
    },
    unlock() {
      [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => T({ wave: 'pulse25', f, dur: 0.2, vol: 0.13, at: i * 0.08 }));
    },
    // Dialogue "voice" blip; pitch differs per speaker.
    blip(p = 1) {
      T({ wave: 'pulse25', f: 330 * p * (0.94 + Math.random() * 0.12), dur: 0.035, vol: 0.07 });
    },
  });
})();
