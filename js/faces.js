// Head drawing: every character's look plus a library of anime-style facial expressions.
(function () {
  'use strict';
  const HF = window.HF;
  const U = HF.U;
  const OL = HF.OUTLINE;
  const TAU = HF.TAU;
  const PI = Math.PI;

  // Expressions combine eyes, brows, mouth and extra effects.
  HF.EXPR = {
    idle: { eyes: 'normal', brows: 'neutral', mouth: 'smile' },
    focus: { eyes: 'determined', brows: 'angry', mouth: 'flat' },
    run: { eyes: 'determined', brows: 'angry', mouth: 'smirk' },
    jump: { eyes: 'normal', brows: 'raised', mouth: 'open' },
    attack: { eyes: 'angry', brows: 'angry', mouth: 'shout' },
    gloat: { eyes: 'happy', brows: 'raised', mouth: 'grin', fx: ['sparkles'] },
    hurt: { eyes: 'hurt', brows: 'worried', mouth: 'wavy', fx: ['tears'] },
    stun: { eyes: 'dizzy', brows: 'worried', mouth: 'wavy', fx: ['stars'] },
    fear: { eyes: 'wide', brows: 'worried', mouth: 'open', fx: ['sweat'] },
    worried: { eyes: 'normal', brows: 'worried', mouth: 'teeth', fx: ['sweat'] },
    frozen: { eyes: 'wide', brows: 'worried', mouth: 'teeth' },
    ko: { eyes: 'ko', brows: 'none', mouth: 'tongue' },
    win: { eyes: 'happy', brows: 'raised', mouth: 'grin', fx: ['sparkles', 'blush'] },
    lose: { eyes: 'sad', brows: 'worried', mouth: 'frown', fx: ['tears'] },
    angry: { eyes: 'angry', brows: 'angry', mouth: 'shout', fx: ['vein'] },
    furious: { eyes: 'angry', brows: 'angry', mouth: 'teeth', fx: ['vein', 'steam'] },
    happy: { eyes: 'happy', brows: 'raised', mouth: 'smile', fx: ['blush'] },
    shock: { eyes: 'wide', brows: 'raised', mouth: 'open', fx: ['gloom'] },
    smug: { eyes: 'determined', brows: 'raised', mouth: 'smirk' },
    sad: { eyes: 'sad', brows: 'worried', mouth: 'frown' },
    cry: { eyes: 'closed', brows: 'worried', mouth: 'wail', fx: ['tears'] },
    calm: { eyes: 'closed', brows: 'neutral', mouth: 'smile' },
    charge: { eyes: 'hurt', brows: 'angry', mouth: 'teeth', fx: ['vein'] },
    blush: { eyes: 'normal', brows: 'worried', mouth: 'wavy', fx: ['blush', 'sweat'], look: [-0.9, 0.5] },
    think: { eyes: 'normal', brows: 'raised', mouth: 'flat', fx: ['sweat'], look: [0.6, -0.9] },
    sparkle: { eyes: 'sparkle', brows: 'raised', mouth: 'grin', fx: ['sparkles', 'blush'] },
    wink: { eyes: 'wink', brows: 'raised', mouth: 'grin' },
    clash: { eyes: 'wide', brows: 'raised', mouth: 'teeth' },
    joy: { eyes: 'sparkle', brows: 'worried', mouth: 'wail', fx: ['tears', 'blush'] },
    proud: { eyes: 'closed', brows: 'raised', mouth: 'grin', fx: ['sparkles'] },
    sleepy: { eyes: 'closed', brows: 'flat', mouth: 'flat' },
  };

  // ---------------- character looks ----------------
  // Points are in head-radius units for a head facing right; x is mirrored for facing left.
  function poly(ctx, pts, r, f) {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0] * r * f, p[1] * r) : ctx.moveTo(p[0] * r * f, p[1] * r)));
    ctx.closePath();
  }
  function fillStroke(ctx, fill, lw) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = lw;
    ctx.strokeStyle = OL;
    ctx.stroke();
  }
  // A ribbon that trails behind and flutters (headband tails, scarves).
  function ribbon(ctx, x0, y0, f, len, width, color, t, phase, droop) {
    const pts = [];
    for (let i = 0; i <= 5; i++) {
      const k = i / 5;
      pts.push([x0 - f * len * k, y0 + droop * k * len + Math.sin(t * 11 + phase + k * 3) * width * 0.9 * k]);
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const [w, c] of [[width + 5, OL], [width, color]]) {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.lineWidth = w;
      ctx.strokeStyle = c;
      ctx.stroke();
    }
  }

  const KENJI_HAIR = [
    [-1.0, -0.12], [-1.28, -0.42], [-0.98, -0.55], [-1.2, -0.95], [-0.72, -0.86], [-0.8, -1.32],
    [-0.3, -1.02], [-0.12, -1.4], [0.2, -1.02], [0.5, -1.3], [0.56, -0.92], [0.98, -1.06],
    [0.86, -0.66], [1.06, -0.46], [0.98, -0.2], [0.74, -0.44], [0.56, -0.24], [0.36, -0.48],
    [0.14, -0.26], [-0.08, -0.5], [-0.3, -0.28], [-0.54, -0.5], [-0.78, -0.3],
  ];

  const LOOKS = (HF.LOOKS = {
    kenji: {
      skin: '#ffd7b0', shade: '#eeb085', hair: '#2a2638', iris: '#7a4a24', brow: '#2a2638',
      back(ctx, r, o, f, t) {
        ribbon(ctx, -f * r * 0.9, -r * 0.5, f, r * 0.9, r * 0.13, '#e63946', t, 0, 0.25);
        ribbon(ctx, -f * r * 0.9, -r * 0.44, f, r * 0.75, r * 0.11, '#c62839', t, 1.7, 0.5);
      },
      front(ctx, r, o, f) {
        poly(ctx, KENJI_HAIR, r, f);
        fillStroke(ctx, this.hair, r * 0.06);
        // highlight streak
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = r * 0.07;
        ctx.beginPath();
        ctx.arc(0, -r * 0.1, r * 0.95, PI * 1.35, PI * 1.6);
        ctx.stroke();
        // headband across the forehead, clipped to the head
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.04, 0, TAU);
        ctx.clip();
        ctx.fillStyle = '#e63946';
        ctx.fillRect(-r * 1.1, -r * 0.66, r * 2.2, r * 0.22);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(-r * 1.1, -r * 0.49, r * 2.2, r * 0.05);
        ctx.restore();
        ctx.strokeStyle = OL;
        ctx.lineWidth = r * 0.05;
        ctx.beginPath();
        ctx.moveTo(-r * 0.86, -r * 0.66 + r * 0.14);
        ctx.quadraticCurveTo(0, -r * 0.72, r * 0.86, -r * 0.66 + r * 0.14);
        ctx.moveTo(-r * 0.95, -r * 0.3);
        ctx.quadraticCurveTo(0, -r * 0.5, r * 0.95, -r * 0.3);
        ctx.stroke();
        // emblem
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(f * r * 0.15, -r * 0.55, r * 0.09, 0, TAU);
        ctx.fill();
        ctx.lineWidth = r * 0.03;
        ctx.stroke();
      },
    },

    momo: {
      skin: '#ffe0cc', shade: '#f5b9a0', hair: '#ff6fae', iris: '#d6338a', brow: '#d94f8f', eyeScale: 1.15, cheeks: true,
      back(ctx, r, o, f, t) {
        for (const s of [-1, 1]) {
          const bx = s * r * 0.78, by = -r * 0.78 + Math.sin(t * 6 + s) * r * 0.02;
          ctx.beginPath();
          ctx.arc(bx, by, r * 0.36, 0, TAU);
          fillStroke(ctx, this.hair, r * 0.06);
          ctx.strokeStyle = 'rgba(255,255,255,0.35)';
          ctx.lineWidth = r * 0.05;
          ctx.beginPath();
          ctx.arc(bx, by, r * 0.22, PI * 1.1, PI * 1.6);
          ctx.stroke();
          // ribbon
          ctx.fillStyle = '#ffe14d';
          ctx.beginPath();
          ctx.ellipse(bx + s * r * 0.05, by + r * 0.3, r * 0.14, r * 0.08, s * 0.4, 0, TAU);
          ctx.fill();
          ctx.lineWidth = r * 0.03;
          ctx.strokeStyle = OL;
          ctx.stroke();
        }
      },
      front(ctx, r, o, f) {
        ctx.beginPath();
        ctx.moveTo(-r * 1.04, r * 0.32);
        ctx.lineTo(-r * 1.04, -r * 0.05);
        ctx.arc(0, -r * 0.05, r * 1.04, PI, TAU);
        ctx.lineTo(r * 1.04, r * 0.32);
        ctx.quadraticCurveTo(r * 0.92, r * 0.36, r * 0.84, r * 0.26);
        ctx.lineTo(r * 0.84, -r * 0.24);
        const n = 5;
        for (let i = 0; i < n; i++) {
          const x0 = r * (0.84 - (1.68 * i) / n), x1 = r * (0.84 - (1.68 * (i + 1)) / n);
          ctx.quadraticCurveTo((x0 + x1) / 2 + f * r * 0.05, -r * 0.12, x1, -r * 0.36);
        }
        ctx.lineTo(-r * 0.84, r * 0.26);
        ctx.quadraticCurveTo(-r * 0.92, r * 0.36, -r * 1.04, r * 0.32);
        ctx.closePath();
        fillStroke(ctx, this.hair, r * 0.06);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = r * 0.06;
        ctx.beginPath();
        ctx.arc(0, -r * 0.05, r * 0.85, PI * 1.3, PI * 1.55);
        ctx.stroke();
      },
    },

    gonta: {
      skin: '#e8a978', shade: '#c98257', hair: '#231d2b', iris: '#3d2a1a', brow: '#231d2b',
      shape: 'wide', browThick: 2, cheeks: true, nose: true, mouthY: 0.5,
      back() {},
      front(ctx, r, o, f) {
        // topknot
        ctx.beginPath();
        ctx.ellipse(-f * r * 0.05, -r * 1.02, r * 0.2, r * 0.12, -f * 0.2, 0, TAU);
        fillStroke(ctx, this.hair, r * 0.05);
        ctx.beginPath();
        ctx.ellipse(f * r * 0.12, -r * 1.06, r * 0.14, r * 0.08, f * 0.5, 0, TAU);
        fillStroke(ctx, this.hair, r * 0.05);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-r * 0.06, -r * 1.0, r * 0.12, r * 0.08);
        // side hair
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.06, r * 0.98, 0, 0, TAU);
        ctx.clip();
        ctx.fillStyle = this.hair;
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(s * r * 1.02, -r * 0.1, r * 0.2, r * 0.42, 0, 0, TAU);
          ctx.fill();
        }
        ctx.restore();
        // shiny scalp
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.ellipse(-f * r * 0.3, -r * 0.62, r * 0.22, r * 0.1, -0.5 * f, 0, TAU);
        ctx.fill();
      },
    },

    sensei: {
      skin: '#f6dcc0', shade: '#dfb898', hair: '#f4f4f8', iris: '#4b3b6b', brow: '#f4f4f8',
      browStyle: 'huge', eyeDefault: 'closed', mouthY: 0.54,
      back() {},
      front(ctx, r, o, f) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(-f * r * 0.3, -r * 0.62, r * 0.28, r * 0.13, -0.5 * f, 0, TAU);
        ctx.fill();
        // wrinkles
        ctx.strokeStyle = 'rgba(120,80,60,0.45)';
        ctx.lineWidth = r * 0.03;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(f * r * 0.1, -r * (0.25 + i * 0.1), r * 0.35, PI * 1.3, PI * 1.7);
          ctx.stroke();
        }
      },
      over(ctx, r, o, f, t, fx) {
        // beard
        const sway = Math.sin(t * 3) * r * 0.05;
        ctx.beginPath();
        ctx.moveTo(fx - r * 0.36, r * 0.7);
        ctx.quadraticCurveTo(fx - r * 0.32, r * 1.2, fx + sway, r * 1.6);
        ctx.quadraticCurveTo(fx + r * 0.32, r * 1.2, fx + r * 0.36, r * 0.7);
        ctx.quadraticCurveTo(fx, r * 0.8, fx - r * 0.36, r * 0.7);
        fillStroke(ctx, this.hair, r * 0.05);
        ctx.strokeStyle = '#c9c9d6';
        ctx.lineWidth = r * 0.025;
        ctx.beginPath();
        ctx.moveTo(fx - r * 0.1, r * 0.86);
        ctx.quadraticCurveTo(fx - r * 0.1, r * 1.15, fx + sway * 0.6, r * 1.35);
        ctx.moveTo(fx + r * 0.12, r * 0.86);
        ctx.quadraticCurveTo(fx + r * 0.12, r * 1.1, fx + sway * 0.8, r * 1.3);
        ctx.stroke();
        // drooping mustache, ending above the mouth so expressions stay readable
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(fx, r * 0.33);
          ctx.quadraticCurveTo(fx + s * r * 0.36, r * 0.26, fx + s * r * 0.52, r * 0.56);
          ctx.quadraticCurveTo(fx + s * r * 0.56, r * 0.74, fx + s * r * 0.46, r * 0.8);
          ctx.quadraticCurveTo(fx + s * r * 0.34, r * 0.44, fx, r * 0.43);
          ctx.closePath();
          fillStroke(ctx, this.hair, r * 0.045);
        }
      },
    },

    yuki: {
      skin: '#fde9e4', shade: '#efc6c0', hair: '#cfeaff', iris: '#2b8fd6', brow: '#8ec5ea', mouthY: 0.38,
      back(ctx, r, o, f, t) {
        ctx.beginPath();
        ctx.moveTo(-r * 1.12, r * 0.58);
        ctx.lineTo(-r * 1.12, -r * 0.08);
        ctx.arc(0, -r * 0.08, r * 1.12, PI, TAU);
        ctx.lineTo(r * 1.12, r * 0.58);
        ctx.quadraticCurveTo(0, r * 0.75, -r * 1.12, r * 0.58);
        fillStroke(ctx, this.hair, r * 0.06);
        ribbon(ctx, -f * r * 0.7, r * 0.75, f, r * 0.8, r * 0.18, '#2f4fa8', t, 0.5, 0.7);
      },
      front(ctx, r, o, f) {
        ctx.beginPath();
        ctx.moveTo(-r * 1.0, r * 0.3);
        ctx.lineTo(-r * 1.02, -r * 0.08);
        ctx.arc(0, -r * 0.08, r * 1.02, PI, TAU);
        ctx.lineTo(r * 1.0, r * 0.3);
        ctx.lineTo(r * 0.82, r * 0.2);
        ctx.lineTo(r * 0.8, -r * 0.34);
        const pts = [0.55, 0.3, 0.05, -0.2, -0.45, -0.7];
        pts.forEach((x, i) => ctx.lineTo(r * (x + f * 0.04), -r * (i % 2 ? 0.4 : 0.3)));
        ctx.lineTo(-r * 0.8, -r * 0.34);
        ctx.lineTo(-r * 0.82, r * 0.2);
        ctx.closePath();
        fillStroke(ctx, this.hair, r * 0.06);
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = r * 0.06;
        ctx.beginPath();
        ctx.arc(0, -r * 0.08, r * 0.82, PI * 1.25, PI * 1.5);
        ctx.stroke();
        // snowflake pin
        const sx = f * r * 0.55, sy = -r * 0.62;
        ctx.strokeStyle = '#2b8fd6';
        ctx.lineWidth = r * 0.04;
        ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          const a = (i * PI) / 3;
          ctx.beginPath();
          ctx.moveTo(sx - Math.cos(a) * r * 0.13, sy - Math.sin(a) * r * 0.13);
          ctx.lineTo(sx + Math.cos(a) * r * 0.13, sy + Math.sin(a) * r * 0.13);
          ctx.stroke();
        }
        // scarf
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.05, 0, TAU);
        ctx.clip();
        ctx.fillStyle = '#2f4fa8';
        ctx.fillRect(-r * 1.2, r * 0.6, r * 2.4, r * 0.6);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = r * 0.03;
        for (let i = -4; i <= 4; i++) {
          ctx.beginPath();
          ctx.moveTo(i * r * 0.22, r * 0.62);
          ctx.lineTo(i * r * 0.22 + r * 0.1, r * 1.1);
          ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = OL;
        ctx.lineWidth = r * 0.05;
        ctx.beginPath();
        ctx.moveTo(-r * 0.8, r * 0.6);
        ctx.quadraticCurveTo(0, r * 0.66, r * 0.8, r * 0.6);
        ctx.stroke();
      },
    },

    bao: {
      skin: '#fff5e4', shade: '#ecd2ac', hair: '#fff5e4', iris: '#8a5a2b', brow: '#b58a5a', shape: 'bun', cheeks: true,
      moods: { idle: { eyes: 'normal', brows: 'neutral', mouth: 'cat' } },
      back(ctx, r, o, f, t) {
        // steam wisps
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = r * 0.06;
        ctx.lineCap = 'round';
        const strong = o.charge ? 1 + o.charge * 2 : 1;
        for (let i = 0; i < 3; i++) {
          const k = (t * 0.6 * strong + i / 3) % 1;
          ctx.globalAlpha = (1 - k) * 0.8;
          const x = (i - 1) * r * 0.35, y = -r * (1.05 + k * 0.7);
          ctx.beginPath();
          ctx.moveTo(x, y + r * 0.2);
          ctx.quadraticCurveTo(x + r * 0.15, y + r * 0.1, x, y);
          ctx.quadraticCurveTo(x - r * 0.15, y - r * 0.1, x, y - r * 0.2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      },
      front(ctx, r) {
        ctx.strokeStyle = this.shade;
        ctx.lineWidth = r * 0.05;
        ctx.lineCap = 'round';
        for (let i = 0; i < 5; i++) {
          const ex = (-0.62 + i * 0.31) * r;
          ctx.beginPath();
          ctx.moveTo(0, -r * 1.0);
          ctx.quadraticCurveTo(ex * 0.35, -r * 0.92, ex, -r * 0.62 + Math.abs(ex) * 0.15);
          ctx.stroke();
        }
        ctx.fillStyle = this.shade;
        ctx.beginPath();
        ctx.arc(0, -r * 1.0, r * 0.07, 0, TAU);
        ctx.fill();
      },
    },

    emperor: {
      skin: '#f6d9a8', shade: '#dcb37a', hair: '#1f1a2e', iris: '#8b2fc9', brow: '#1f1a2e', browThick: 1.7, mouthY: 0.48,
      back(ctx, r) {
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(s * r * 0.95, -r * 0.05, r * 0.22, r * 0.38, s * 0.25, 0, TAU);
          fillStroke(ctx, this.hair, r * 0.045);
        }
      },
      front(ctx, r, o, f, t) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(-f * r * 0.32, -r * 0.6, r * 0.3, r * 0.13, -0.5 * f, 0, TAU);
        ctx.fill();
        if (o.spikes) drawHelmet(ctx, r, o.spikes, t);
        else if (o.hat !== 'beanie') drawCrown(ctx, r, f);
      },
      over(ctx, r, o, f, t, fx) {
        // twirly mustache and goatee
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(fx, r * 0.32);
          ctx.quadraticCurveTo(fx + s * r * 0.4, r * 0.22, fx + s * r * 0.62, r * 0.36);
          ctx.quadraticCurveTo(fx + s * r * 0.82, r * 0.42, fx + s * r * 0.78, r * 0.22);
          ctx.quadraticCurveTo(fx + s * r * 0.74, r * 0.12, fx + s * r * 0.66, r * 0.18);
          ctx.quadraticCurveTo(fx + s * r * 0.7, r * 0.32, fx + s * r * 0.55, r * 0.3);
          ctx.quadraticCurveTo(fx + s * r * 0.3, r * 0.3, fx, r * 0.4);
          ctx.closePath();
          fillStroke(ctx, this.hair, r * 0.03);
        }
        ctx.beginPath();
        ctx.moveTo(fx - r * 0.1, r * 0.8);
        ctx.lineTo(fx + r * 0.1, r * 0.8);
        ctx.lineTo(fx, r * 1.05);
        ctx.closePath();
        fillStroke(ctx, this.hair, r * 0.03);
      },
    },

    granny: {
      skin: '#f9dcc8', shade: '#e2b49c', hair: '#d9d6e6', iris: '#5b4636', brow: '#b7b3c8', eyeDefault: 'closed', cheeks: true,
      back(ctx, r) {
        ctx.beginPath();
        ctx.arc(0, -r * 1.02, r * 0.34, 0, TAU);
        fillStroke(ctx, this.hair, r * 0.05);
        ctx.strokeStyle = '#c0884a';
        ctx.lineWidth = r * 0.05;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-r * 0.5, -r * 1.35);
        ctx.lineTo(r * 0.35, -r * 0.8);
        ctx.moveTo(r * 0.5, -r * 1.35);
        ctx.lineTo(-r * 0.35, -r * 0.8);
        ctx.stroke();
        ctx.fillStyle = '#ff5fa2';
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(s * r * 0.5, -r * 1.35, r * 0.06, 0, TAU);
          ctx.fill();
        }
      },
      front(ctx, r, o, f) {
        ctx.beginPath();
        ctx.moveTo(-r * 1.02, r * 0.1);
        ctx.arc(0, -r * 0.02, r * 1.03, PI * 1.03, PI * 1.97);
        ctx.lineTo(r * 0.9, -r * 0.2);
        for (let i = 0; i <= 6; i++) {
          const x = r * (0.9 - (1.8 * i) / 6);
          ctx.quadraticCurveTo(x + r * 0.15, -r * 0.55, x, -r * (0.42 + (i % 2) * 0.06));
        }
        ctx.closePath();
        fillStroke(ctx, this.hair, r * 0.05);
        // wrinkles
        ctx.strokeStyle = 'rgba(120,80,60,0.4)';
        ctx.lineWidth = r * 0.025;
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(f * r * 0.13 + s * r * 0.58, -r * 0.02);
          ctx.lineTo(f * r * 0.13 + s * r * 0.7, -r * 0.08);
          ctx.moveTo(f * r * 0.13 + s * r * 0.58, r * 0.08);
          ctx.lineTo(f * r * 0.13 + s * r * 0.7, r * 0.1);
          ctx.stroke();
        }
      },
      over(ctx, r, o, f, t, fx, eyes) {
        // round glasses
        ctx.strokeStyle = '#7a5230';
        ctx.lineWidth = r * 0.045;
        for (const e of eyes) {
          ctx.beginPath();
          ctx.arc(e.x, e.y, r * 0.24, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = 'rgba(200,230,255,0.25)';
          ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(eyes[0].x + r * 0.24, eyes[0].y);
        ctx.quadraticCurveTo(fx, eyes[0].y - r * 0.08, eyes[1].x - r * 0.24, eyes[1].y);
        ctx.stroke();
      },
    },
  });

  function drawCrown(ctx, r, f) {
    ctx.save();
    ctx.translate(f * r * 0.12, -r * 0.98);
    ctx.rotate(f * 0.18);
    const w = r * 0.24, h = r * 0.2;
    ctx.beginPath();
    ctx.moveTo(-w, 0);
    ctx.lineTo(-w, -h);
    ctx.lineTo(-w * 0.5, -h * 0.45);
    ctx.lineTo(0, -h * 1.2);
    ctx.lineTo(w * 0.5, -h * 0.45);
    ctx.lineTo(w, -h);
    ctx.lineTo(w, 0);
    ctx.closePath();
    fillStroke(ctx, '#ffd23f', r * 0.035);
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.arc(0, -h * 0.35, r * 0.04, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawHelmet(ctx, r, amt, t) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, amt);
    const blink = amt < 1 && Math.floor(t * 12) % 2 === 0;
    if (blink) ctx.globalAlpha *= 0.4;
    for (let i = 0; i < 5; i++) {
      const a = PI * (1.12 + i * 0.19);
      const bx = Math.cos(a) * r * 0.92, by = Math.sin(a) * r * 0.92;
      const tx = Math.cos(a) * r * 1.42, ty = Math.sin(a) * r * 1.42;
      const px = -Math.sin(a) * r * 0.12, py = Math.cos(a) * r * 0.12;
      ctx.beginPath();
      ctx.moveTo(bx + px, by + py);
      ctx.lineTo(tx, ty);
      ctx.lineTo(bx - px, by - py);
      ctx.closePath();
      fillStroke(ctx, '#cfd6e6', r * 0.04);
    }
    ctx.beginPath();
    ctx.arc(0, -r * 0.05, r * 1.0, PI * 1.02, PI * 1.98);
    ctx.quadraticCurveTo(0, -r * 0.42, -r * 0.99, -r * 0.1);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, -r, 0, -r * 0.2);
    g.addColorStop(0, '#e8edf7');
    g.addColorStop(1, '#8a93ab');
    fillStroke(ctx, g, r * 0.05);
    ctx.fillStyle = '#5c6378';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc((-0.6 + i * 0.3) * r, -r * 0.36 - Math.abs(-0.6 + i * 0.3) * r * -0.05, r * 0.04, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBeanie(ctx, r) {
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r * 1.06, PI * 1.02, PI * 1.98);
    ctx.closePath();
    fillStroke(ctx, '#ff7eb6', r * 0.05);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#9b5de5';
    for (let i = 0; i < 4; i++) ctx.fillRect(-r * 1.2, -r * (1.2 - i * 0.26), r * 2.4, r * 0.11);
    ctx.restore();
    U.roundRect(ctx, -r * 1.1, -r * 0.42, r * 2.2, r * 0.3, r * 0.12);
    fillStroke(ctx, '#ffb3d4', r * 0.05);
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = r * 0.03;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.12, -r * 0.38);
      ctx.lineTo(i * r * 0.12, -r * 0.16);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, -r * 1.3, r * 0.24, 0, TAU);
    fillStroke(ctx, '#fff0f7', r * 0.045);
  }

  // ---------------- face parts ----------------
  function eye(ctx, L, kind, x, y, w, h, lx, ly, blink, side, t) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = OL;
    const lw = Math.max(1.4, w * 0.32);
    ctx.lineWidth = lw;
    if (kind === 'happy') {
      ctx.beginPath();
      ctx.arc(x, y + h * 0.4, w * 0.95, PI * 1.15, PI * 1.85);
      ctx.stroke();
      return;
    }
    if (kind === 'closed') {
      ctx.beginPath();
      ctx.arc(x, y - h * 0.35, w * 0.9, PI * 0.2, PI * 0.8);
      ctx.stroke();
      return;
    }
    if (kind === 'hurt') {
      const tip = x - side * w * 0.75;
      ctx.beginPath();
      ctx.moveTo(x + side * w * 0.75, y - h * 0.55);
      ctx.lineTo(tip, y);
      ctx.lineTo(x + side * w * 0.75, y + h * 0.55);
      ctx.stroke();
      return;
    }
    if (kind === 'ko') {
      ctx.beginPath();
      ctx.moveTo(x - w * 0.75, y - h * 0.5);
      ctx.lineTo(x + w * 0.75, y + h * 0.5);
      ctx.moveTo(x + w * 0.75, y - h * 0.5);
      ctx.lineTo(x - w * 0.75, y + h * 0.5);
      ctx.stroke();
      return;
    }
    if (kind === 'dizzy') {
      ctx.lineWidth = lw * 0.7;
      ctx.beginPath();
      for (let a = 0; a < PI * 5; a += 0.25) {
        const rr = (w * 0.95 * a) / (PI * 5);
        const px = x + Math.cos(a + t * 9 * side) * rr, py = y + Math.sin(a + t * 9 * side) * rr * (h / w) * 0.8;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      return;
    }
    const wide = kind === 'wide';
    const ew = wide ? w * 1.12 : w, eh0 = wide ? h * 1.08 : h;
    const eh = eh0 * (1 - blink);
    if (eh < eh0 * 0.18) {
      ctx.beginPath();
      ctx.moveTo(x - ew, y + eh0 * 0.1);
      ctx.quadraticCurveTo(x, y + eh0 * 0.3, x + ew, y + eh0 * 0.1);
      ctx.stroke();
      return;
    }
    // sclera
    ctx.beginPath();
    ctx.ellipse(x, y, ew, eh, 0, 0, TAU);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.save();
    ctx.clip();
    const lookDown = kind === 'sad' ? 0.5 : 0;
    const iw = wide ? ew * 0.42 : ew * 0.78, ih = wide ? ew * 0.42 : eh * 0.72;
    const ix = x + lx * ew * 0.3, iy = y + (ly * 0.3 + lookDown) * eh * 0.5 + eh * 0.08;
    ctx.fillStyle = L.iris;
    ctx.beginPath();
    ctx.ellipse(ix, iy, iw, ih, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(ix, iy - ih * 0.45, iw, ih * 0.55, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#120d1c';
    ctx.beginPath();
    ctx.ellipse(ix, iy, iw * 0.46, ih * 0.5, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ix - iw * 0.35, iy - ih * 0.38, iw * 0.36, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ix + iw * 0.32, iy + ih * 0.38, iw * 0.15, 0, TAU);
    ctx.fill();
    if (kind === 'sparkle') {
      U.starPath(ctx, ix + iw * 0.1, iy + ih * 0.05, 4, iw * 0.5, iw * 0.12, -PI / 4);
      ctx.fill();
    }
    if (kind === 'sad') {
      ctx.fillStyle = 'rgba(160,210,255,0.55)';
      ctx.fillRect(x - ew, y + eh * 0.35, ew * 2, eh);
    }
    ctx.restore();
    ctx.lineWidth = lw * 0.55;
    ctx.beginPath();
    ctx.ellipse(x, y, ew, eh, 0, 0, TAU);
    ctx.stroke();
    // thick upper lash line
    ctx.lineWidth = lw * 1.05;
    ctx.beginPath();
    ctx.ellipse(x, y, ew, eh, 0, PI * 1.08, PI * 1.92);
    ctx.stroke();
    // slanted lids give angry / determined / sad looks
    let lidOuter = null, lidInner = null;
    if (kind === 'angry') (lidOuter = -0.95), (lidInner = -0.15);
    else if (kind === 'determined') (lidOuter = -0.5), (lidInner = -0.3);
    else if (kind === 'sad') (lidOuter = -0.2), (lidInner = -0.85);
    if (lidOuter !== null) {
      const ox = x + side * ew * 1.15, inx = x - side * ew * 1.15;
      ctx.fillStyle = L.skin;
      ctx.beginPath();
      ctx.moveTo(ox, y - eh * 1.4);
      ctx.lineTo(inx, y - eh * 1.4);
      ctx.lineTo(inx, y + lidInner * eh);
      ctx.lineTo(ox, y + lidOuter * eh);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(ox, y + lidOuter * eh);
      ctx.lineTo(inx, y + lidInner * eh);
      ctx.stroke();
    }
  }

  function brows(ctx, L, kind, eyes, w, h, r, o) {
    if (kind === 'none') return;
    const huge = L.browStyle === 'huge';
    ctx.lineCap = 'round';
    for (const e of eyes) {
      const side = e.side;
      const by = e.y - h - r * (huge ? 0.04 : 0.1) - (kind === 'raised' ? r * 0.08 : 0);
      const outer = e.x + side * w * 1.05, inner = e.x - side * w * 0.95;
      let oy = by, iy = by;
      if (kind === 'angry') (oy -= r * 0.07), (iy += r * 0.08);
      if (kind === 'worried') (oy += r * 0.05), (iy -= r * 0.09);
      if (huge) {
        // Sensei's giant eyebrows. They flap like wings while he glides.
        // Mirror the tilt for the left brow; flapping lifts both brows together.
        const tilt = Math.atan2(oy - iy, Math.abs(outer - inner)) * 0.6;
        ctx.save();
        ctx.translate(inner, iy);
        ctx.rotate(side * tilt - side * (o.flap || 0) * 0.7);
        const len = r * 0.95 * side;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.05);
        ctx.quadraticCurveTo(len * 0.5, -r * 0.22, len, r * 0.12);
        ctx.quadraticCurveTo(len * 0.95, r * 0.22, len * 0.85, r * 0.16);
        ctx.quadraticCurveTo(len * 0.5, r * 0.08, 0, r * 0.08);
        ctx.closePath();
        fillStroke(ctx, L.brow, r * 0.04);
        ctx.restore();
        continue;
      }
      ctx.strokeStyle = L.brow;
      ctx.lineWidth = r * 0.075 * (L.browThick || 1);
      ctx.beginPath();
      ctx.moveTo(outer, oy);
      const arch = kind === 'flat' ? 0 : kind === 'raised' || kind === 'neutral' ? -r * 0.05 : 0;
      ctx.quadraticCurveTo((outer + inner) / 2, (oy + iy) / 2 + arch, inner, iy);
      ctx.stroke();
    }
  }

  function mouth(ctx, kind, x, y, r, talk) {
    const w = r * 0.22;
    const dark = '#5c1a2b', tongue = '#ff7b8a';
    ctx.strokeStyle = OL;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1.4, r * 0.055);
    if (talk && kind !== 'grin' && kind !== 'shout' && kind !== 'wail') kind = talk > 0.5 ? 'talk' : 'talkClosed';
    const openShape = (rx, ry, oy = 0) => {
      ctx.beginPath();
      ctx.ellipse(x, y + oy, rx, ry, 0, 0, TAU);
      ctx.fillStyle = dark;
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = tongue;
      ctx.beginPath();
      ctx.ellipse(x, y + oy + ry * 0.8, rx * 0.8, ry * 0.6, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.ellipse(x, y + oy, rx, ry, 0, 0, TAU);
      ctx.stroke();
    };
    switch (kind) {
      case 'smile':
        ctx.beginPath();
        ctx.arc(x, y - w * 0.55, w * 0.8, PI * 0.22, PI * 0.78);
        ctx.stroke();
        break;
      case 'frown':
        ctx.beginPath();
        ctx.arc(x, y + w * 0.75, w * 0.7, PI * 1.25, PI * 1.75);
        ctx.stroke();
        break;
      case 'flat':
      case 'talkClosed':
        ctx.beginPath();
        ctx.moveTo(x - w * 0.45, y);
        ctx.lineTo(x + w * 0.45, y);
        ctx.stroke();
        break;
      case 'smirk':
        ctx.beginPath();
        ctx.moveTo(x - w * 0.6, y + w * 0.05);
        ctx.quadraticCurveTo(x + w * 0.1, y + w * 0.35, x + w * 0.7, y - w * 0.3);
        ctx.stroke();
        break;
      case 'wavy':
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
          const px = x - w * 0.7 + (w * 1.4 * i) / 6, py = y + (i % 2 ? -w * 0.18 : w * 0.18);
          if (i) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
        }
        ctx.stroke();
        break;
      case 'open':
        openShape(w * 0.45, w * 0.55, w * 0.1);
        break;
      case 'talk':
        openShape(w * 0.42, w * 0.38, w * 0.05);
        break;
      case 'wail':
        openShape(w * 0.85, w * 0.55, w * 0.15);
        break;
      case 'grin':
      case 'shout': {
        const big = kind === 'shout' ? 1.15 : 1;
        ctx.beginPath();
        ctx.moveTo(x - w * big, y - w * 0.25);
        ctx.quadraticCurveTo(x, y - w * 0.35, x + w * big, y - w * 0.25);
        ctx.quadraticCurveTo(x + w * big * 0.9, y + w * 1.1 * big, x, y + w * 1.1 * big);
        ctx.quadraticCurveTo(x - w * big * 0.9, y + w * 1.1 * big, x - w * big, y - w * 0.25);
        ctx.closePath();
        ctx.fillStyle = dark;
        ctx.fill();
        ctx.save();
        ctx.clip();
        ctx.fillStyle = '#fff';
        ctx.fillRect(x - w * 1.3, y - w * 0.5, w * 2.6, w * 0.45);
        ctx.fillStyle = tongue;
        ctx.beginPath();
        ctx.ellipse(x, y + w * 1.0 * big, w * 0.6, w * 0.4, 0, 0, TAU);
        ctx.fill();
        ctx.restore();
        ctx.stroke();
        break;
      }
      case 'teeth':
        U.roundRect(ctx, x - w * 0.75, y - w * 0.28, w * 1.5, w * 0.56, w * 0.2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth *= 0.6;
        ctx.beginPath();
        ctx.moveTo(x - w * 0.75, y);
        ctx.lineTo(x + w * 0.75, y);
        for (let i = -1; i <= 1; i++) {
          ctx.moveTo(x + i * w * 0.38, y - w * 0.28);
          ctx.lineTo(x + i * w * 0.38, y + w * 0.28);
        }
        ctx.stroke();
        break;
      case 'tongue':
        openShape(w * 0.4, w * 0.3);
        ctx.fillStyle = tongue;
        ctx.beginPath();
        ctx.ellipse(x + w * 0.25, y + w * 0.45, w * 0.22, w * 0.35, -0.3, 0, TAU);
        ctx.fill();
        ctx.stroke();
        break;
      case 'cat':
        ctx.beginPath();
        ctx.arc(x - w * 0.28, y - w * 0.05, w * 0.28, PI * 0.1, PI * 0.9);
        ctx.moveTo(x + w * 0.56, y - w * 0.05);
        ctx.arc(x + w * 0.28, y - w * 0.05, w * 0.28, PI * 0.1, PI * 0.9);
        ctx.stroke();
        break;
    }
  }

  function extras(ctx, L, fx, list, r, f, t, eyes, faceX, h) {
    for (const k of list) {
      if (k === 'blush' || (k === 'cheeks' && L.cheeks)) {
        for (const e of eyes) {
          ctx.fillStyle = 'rgba(255,110,140,0.45)';
          ctx.beginPath();
          ctx.ellipse(e.x + e.side * r * 0.06, e.y + h * 1.25, r * 0.14, r * 0.07, 0, 0, TAU);
          ctx.fill();
          if (k === 'blush') {
            ctx.strokeStyle = 'rgba(220,60,90,0.6)';
            ctx.lineWidth = r * 0.02;
            for (let i = -1; i <= 1; i++) {
              ctx.beginPath();
              ctx.moveTo(e.x + i * r * 0.06 + r * 0.03, e.y + h * 1.12);
              ctx.lineTo(e.x + i * r * 0.06 - r * 0.02, e.y + h * 1.38);
              ctx.stroke();
            }
          }
        }
      } else if (k === 'sweat') {
        const sx = -f * r * 0.72, sy = -r * 0.42 + Math.sin(t * 4) * r * 0.03;
        ctx.beginPath();
        ctx.moveTo(sx, sy - r * 0.2);
        ctx.quadraticCurveTo(sx + r * 0.13, sy + r * 0.02, sx, sy + r * 0.06);
        ctx.quadraticCurveTo(sx - r * 0.13, sy + r * 0.02, sx, sy - r * 0.2);
        fillStroke(ctx, '#8fd3ff', r * 0.03);
      } else if (k === 'tears') {
        for (const e of eyes) {
          ctx.fillStyle = '#8fd3ff';
          ctx.strokeStyle = '#4aa8e8';
          ctx.lineWidth = r * 0.02;
          const ex = e.x + e.side * r * 0.05;
          U.roundRect(ctx, ex - r * 0.05, e.y + h * 0.6, r * 0.1, r * 0.45, r * 0.05);
          ctx.fill();
          const k2 = (t * 1.6 + (e.side > 0 ? 0.5 : 0)) % 1;
          ctx.beginPath();
          ctx.arc(ex + e.side * k2 * r * 0.25, e.y + h * 0.9 + k2 * r * 0.55, r * 0.06, 0, TAU);
          ctx.fill();
        }
      } else if (k === 'vein') {
        const s = 1 + Math.sin(t * 12) * 0.12;
        ctx.save();
        ctx.translate(f * r * 0.55, -r * 0.62);
        ctx.scale(s, s);
        ctx.strokeStyle = '#e63946';
        ctx.lineWidth = r * 0.06;
        for (let i = 0; i < 4; i++) {
          ctx.rotate(PI / 2);
          ctx.beginPath();
          ctx.arc(r * 0.13, r * 0.13, r * 0.1, PI, PI * 1.5);
          ctx.stroke();
        }
        ctx.restore();
      } else if (k === 'stars') {
        for (let i = 0; i < 3; i++) {
          const a = t * 5 + (i * TAU) / 3;
          const sx = Math.cos(a) * r * 0.75, sy = -r * 1.08 + Math.sin(a) * r * 0.16;
          U.starPath(ctx, sx, sy, 5, r * 0.15, r * 0.07, a);
          fillStroke(ctx, '#ffe14d', r * 0.025);
        }
      } else if (k === 'sparkles') {
        for (let i = 0; i < 4; i++) {
          const a = (i * TAU) / 4 + 0.6;
          const s = Math.max(0, Math.sin(t * 6 + i * 1.7));
          if (s < 0.1) continue;
          U.starPath(ctx, Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.15 - r * 0.2, 4, r * 0.16 * s, r * 0.04 * s, 0);
          ctx.fillStyle = '#fff6a0';
          ctx.fill();
        }
      } else if (k === 'steam') {
        for (let i = 0; i < 4; i++) {
          const side = i % 2 ? 1 : -1;
          const k2 = (t * 1.4 + i * 0.25) % 1;
          ctx.globalAlpha = 1 - k2;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(side * r * (0.8 + k2 * 0.4), -r * (0.7 + k2 * 0.7), r * (0.1 + k2 * 0.15), 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }
  }

  function headPath(ctx, L, r) {
    ctx.beginPath();
    if (L.shape === 'wide') ctx.ellipse(0, 0, r * 1.06, r * 0.98, 0, 0, TAU);
    else if (L.shape === 'bun') {
      ctx.moveTo(-r, r * 0.08);
      ctx.bezierCurveTo(-r, -r * 0.75, -r * 0.4, -r * 1.02, 0, -r * 1.04);
      ctx.bezierCurveTo(r * 0.4, -r * 1.02, r, -r * 0.75, r, r * 0.08);
      ctx.bezierCurveTo(r, r * 0.75, r * 0.6, r * 0.98, 0, r * 0.98);
      ctx.bezierCurveTo(-r * 0.6, r * 0.98, -r, r * 0.75, -r, r * 0.08);
      ctx.closePath();
    } else ctx.arc(0, 0, r, 0, TAU);
  }

  // Resolve an expression name (or object) for a given look.
  function resolveExpr(L, expr) {
    let e = typeof expr === 'string' ? (L.moods && L.moods[expr]) || HF.EXPR[expr] || HF.EXPR.idle : expr || HF.EXPR.idle;
    if (L.eyeDefault && e.eyes === 'normal') e = Object.assign({}, e, { eyes: L.eyeDefault });
    return e;
  }

  // Draw a head. o: {x, y, r, facing, sx, sy, rot, expr, look:{x,y}, blink, talk, t, flash, alpha,
  //                  hat, spikes, rage, flap, charge}
  HF.drawHead = function (ctx, id, o) {
    const L = LOOKS[id] || LOOKS.kenji;
    const r = o.r;
    const f = o.facing || 1;
    const t = o.t || 0;
    const e = resolveExpr(L, o.expr);
    ctx.save();
    ctx.translate(o.x, o.y);
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale(o.sx || 1, o.sy || 1);
    if (o.alpha != null) ctx.globalAlpha = o.alpha;

    if (L.back) L.back(ctx, r, o, f, t);

    // head base with cel shading
    headPath(ctx, L, r);
    ctx.fillStyle = L.skin;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = L.shade;
    ctx.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
    ctx.fillStyle = L.skin;
    ctx.beginPath();
    ctx.arc(f * r * 0.1, -r * 0.12, r * 0.98, 0, TAU);
    ctx.fill();
    if (o.rage) {
      ctx.fillStyle = `rgba(255,40,40,${0.28 * o.rage})`;
      ctx.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
    }
    ctx.restore();
    headPath(ctx, L, r);
    ctx.lineWidth = Math.max(2, r * 0.07);
    ctx.strokeStyle = OL;
    ctx.stroke();

    if (L.front) L.front(ctx, r, o, f, t);
    if (o.hat === 'beanie') drawBeanie(ctx, r);

    // face layout (shifted toward the facing side for a 3/4 look)
    const fx = f * r * 0.13;
    const es = L.eyeScale || 1;
    const w = r * 0.17 * es, h = r * 0.25 * es;
    const ey = r * 0.06;
    const eyes = [
      { x: fx - r * 0.34, y: ey, side: -1 },
      { x: fx + r * 0.34, y: ey, side: 1 },
    ];
    const lx = U.clamp(o.look ? o.look.x : 0, -1, 1), ly = U.clamp(o.look ? o.look.y : 0, -1, 1);
    const elook = e.look ? { x: e.look[0] * f, y: e.look[1] } : { x: lx, y: ly };
    if (L.nose) {
      ctx.beginPath();
      ctx.ellipse(fx + f * r * 0.06, r * 0.28, r * 0.1, r * 0.08, 0, 0, TAU);
      fillStroke(ctx, L.shade, r * 0.04);
    }
    for (const ee of eyes) {
      let kind = e.eyes;
      if (kind === 'wink') kind = ee.side === f ? 'happy' : 'normal';
      const far = ee.side === -f ? 0.9 : 1;
      eye(ctx, L, kind, ee.x, ee.y, w * far, h, elook.x, elook.y, o.blink || 0, ee.side, t);
    }
    brows(ctx, L, e.brows, eyes, w, h, r, o);
    mouth(ctx, e.mouth, fx, r * (L.mouthY || 0.44), r, o.talk);
    const fxList = (e.fx || []).slice();
    if (L.cheeks && fxList.indexOf('blush') < 0) fxList.unshift('cheeks');
    if (e.fx && e.fx.indexOf('gloom') >= 0) {
      ctx.save();
      headPath(ctx, L, r);
      ctx.clip();
      ctx.strokeStyle = 'rgba(80,60,140,0.55)';
      ctx.lineWidth = r * 0.04;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(fx + i * r * 0.13, -r * 0.95);
        ctx.lineTo(fx + i * r * 0.13, -r * (0.45 + (i % 2 ? 0.06 : 0)));
        ctx.stroke();
      }
      ctx.restore();
    }
    extras(ctx, L, fx, fxList, r, f, t, eyes, fx, h);
    if (L.over) L.over(ctx, r, o, f, t, fx, eyes);

    if (o.flash) {
      headPath(ctx, L, r);
      ctx.fillStyle = `rgba(255,255,255,${o.flash * 0.75})`;
      ctx.fill();
    }
    ctx.restore();
  };
})();
