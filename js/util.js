// Shared constants, math helpers, drawing helpers and saved settings.
(function () {
  'use strict';
  const HF = (window.HF = window.HF || {});

  // Logical resolution. The canvas is scaled to fit the window.
  HF.W = 960;
  HF.H = 540;
  HF.GROUND = 470;
  HF.ARENA_L = 18;
  HF.ARENA_R = 942;
  HF.GRAV = 2400;
  HF.OUTLINE = '#1d1830';
  HF.TAU = Math.PI * 2;

  HF.FONT_D = '"Luckiest Guy", "Arial Black", Impact, sans-serif';
  HF.FONT_B = 'Fredoka, "Trebuchet MS", "Segoe UI", sans-serif';

  const U = (HF.U = {});
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.chance = (p) => Math.random() < p;
  U.sign = (v) => (v < 0 ? -1 : 1);
  U.approach = (v, target, d) => (v < target ? Math.min(v + d, target) : Math.max(v - d, target));
  U.easeOutBack = (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  };
  U.easeOutCubic = (t) => 1 - (1 - t) ** 3;
  U.easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  U.shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  U.roundRect = (ctx, x, y, w, h, r) => {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  U.starPath = (ctx, x, y, points, ro, ri, rot = -Math.PI / 2) => {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const rr = i % 2 ? ri : ro;
      const a = rot + (i * Math.PI) / points;
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.closePath();
  };

  U.font = (size, display = true, weight = 600) =>
    display ? `${size}px ${HF.FONT_D}` : `${weight} ${size}px ${HF.FONT_B}`;

  // Outlined text: the house style for game text.
  U.text = (ctx, str, x, y, o = {}) => {
    const size = o.size || 24;
    ctx.font = o.font || U.font(size, o.display !== false, o.weight);
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = o.baseline || 'middle';
    if (o.stroke !== false) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = o.lw || Math.max(3, size * 0.18);
      ctx.strokeStyle = o.stroke || HF.OUTLINE;
      ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = o.color || '#fff';
    ctx.fillText(str, x, y);
  };

  U.wrap = (ctx, text, maxW) => {
    const lines = [];
    for (const para of String(text).split('\n')) {
      let line = '';
      for (const w of para.split(' ')) {
        const test = line ? line + ' ' + w : w;
        if (line && ctx.measureText(test).width > maxW) {
          lines.push(line);
          line = w;
        } else line = test;
      }
      lines.push(line);
    }
    return lines;
  };

  // Saved data. Falls back to memory when localStorage is unavailable.
  HF.store = {
    get(key, def) {
      try {
        const v = localStorage.getItem('headfu.' + key);
        return v == null ? def : JSON.parse(v);
      } catch (e) {
        return def;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem('headfu.' + key, JSON.stringify(val));
      } catch (e) {
        /* storage blocked: keep in memory only */
      }
    },
  };
  HF.settings = Object.assign({ music: 0.6, sfx: 0.8, time: 60, rounds: 3 }, HF.store.get('settings', {}));
  HF.saveSettings = () => HF.store.set('settings', HF.settings);
  HF.unlocks = Object.assign({ emperor: false }, HF.store.get('unlocks', {}));
  HF.saveUnlocks = () => HF.store.set('unlocks', HF.unlocks);
})();
