// Particles, comic hit words, shockwave rings and screen shake.
(function () {
  'use strict';
  const HF = window.HF;
  const U = HF.U;
  const TAU = HF.TAU;

  const WORD_COLORS = ['#ffe14d', '#ff8c42', '#ff5fa2', '#7bdff2', '#b8f35d'];

  class FX {
    constructor() {
      this.parts = [];
      this.words = [];
      this.rings = [];
      this.shake = 0;
      this.flash = 0;
    }

    clear() {
      this.parts.length = 0;
      this.words.length = 0;
      this.rings.length = 0;
      this.shake = 0;
      this.flash = 0;
    }

    add(p) {
      if (this.parts.length < 400) this.parts.push(Object.assign({ t: 0, rot: 0, vr: 0, g: 0, drag: 0 }, p));
    }

    dust(x, y, n = 6, spread = 1, color = 'rgba(240,230,215,0.9)') {
      for (let i = 0; i < n; i++) {
        const dir = i % 2 ? 1 : -1;
        this.add({ kind: 'dust', x: x + U.rand(-10, 10) * spread, y: y - U.rand(0, 6), vx: dir * U.rand(40, 160) * spread, vy: U.rand(-60, -10), r: U.rand(6, 12), life: U.rand(0.35, 0.6), color, drag: 3 });
      }
    }

    stars(x, y, n = 6) {
      for (let i = 0; i < n; i++) {
        const a = U.rand(0, TAU);
        const s = U.rand(180, 360);
        this.add({ kind: 'star', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, r: U.rand(7, 12), life: U.rand(0.5, 0.8), color: U.pick(['#ffe14d', '#fff', '#ffb703']), g: 900, vr: U.rand(-10, 10), drag: 1 });
      }
    }

    sparks(x, y, n = 12, color = '#ffe066') {
      for (let i = 0; i < n; i++) {
        const a = U.rand(0, TAU);
        const s = U.rand(250, 600);
        this.add({ kind: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: U.rand(2, 4), life: U.rand(0.2, 0.4), color, drag: 4 });
      }
    }

    shards(x, y, n = 12, color = '#cdf3ff') {
      for (let i = 0; i < n; i++) {
        const a = U.rand(Math.PI, TAU);
        const s = U.rand(150, 420);
        this.add({ kind: 'shard', x: x + U.rand(-20, 20), y: y + U.rand(-20, 20), vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: U.rand(5, 10), life: U.rand(0.5, 0.9), color, g: 1200, vr: U.rand(-14, 14) });
      }
    }

    puff(x, y, n = 6, color = 'rgba(255,255,255,0.85)', size = 1) {
      for (let i = 0; i < n; i++) {
        const a = U.rand(0, TAU);
        this.add({ kind: 'dust', x: x + Math.cos(a) * 8, y: y + Math.sin(a) * 8, vx: Math.cos(a) * U.rand(30, 110), vy: Math.sin(a) * U.rand(30, 110), r: U.rand(6, 11) * size, life: U.rand(0.3, 0.55), color, drag: 3 });
      }
    }

    embers(x, y, n = 8, color = '#ff8c42') {
      for (let i = 0; i < n; i++) {
        this.add({ kind: 'spark', x: x + U.rand(-12, 12), y: y + U.rand(-12, 12), vx: U.rand(-120, 120), vy: U.rand(-260, -60), r: U.rand(2, 4), life: U.rand(0.3, 0.7), color, g: -100, drag: 1 });
      }
    }

    confetti(n = 60) {
      for (let i = 0; i < n; i++) {
        this.add({ kind: 'confetti', x: U.rand(0, HF.W), y: U.rand(-200, -10), vx: U.rand(-40, 40), vy: U.rand(60, 160), r: U.rand(4, 7), life: U.rand(2.5, 4), color: U.pick(WORD_COLORS.concat(['#9b5de5', '#fff'])), vr: U.rand(-8, 8), g: 40 });
      }
    }

    afterimage(f) {
      this.add({ kind: 'ghost', x: f.x, y: f.y, r: f.r, life: 0.18, color: f.def.color, sx: f.sx, sy: f.sy });
    }

    ring(x, y, color = '#fff', maxR = 120, flat = 0.3) {
      this.rings.push({ x, y, color, maxR, flat, t: 0, life: 0.4 });
    }

    // Comic hit word ("BONK!") with a starburst behind it.
    word(x, y, text, o = {}) {
      this.words.push({ x, y, text, t: 0, life: o.life || 0.75, size: o.size || 34, color: o.color || U.pick(WORD_COLORS), rot: U.rand(-0.25, 0.25), burst: o.burst !== false });
    }

    addShake(a) {
      this.shake = Math.min(18, Math.max(this.shake, a));
    }

    update(dt) {
      for (const p of this.parts) {
        p.t += dt;
        p.vy += p.g * dt;
        if (p.drag) {
          const d = Math.exp(-p.drag * dt);
          p.vx *= d;
          p.vy *= d;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if ((p.kind === 'star' || p.kind === 'shard') && p.y > HF.GROUND) {
          p.y = HF.GROUND;
          p.vy *= -0.4;
          p.vx *= 0.7;
        }
      }
      this.parts = this.parts.filter((p) => p.t < p.life);
      for (const w of this.words) w.t += dt;
      this.words = this.words.filter((w) => w.t < w.life);
      for (const r of this.rings) r.t += dt;
      this.rings = this.rings.filter((r) => r.t < r.life);
      this.shake = Math.max(0, this.shake - dt * 40);
      this.flash = Math.max(0, this.flash - dt * 3);
    }

    shakeOffset() {
      if (this.shake <= 0.1) return [0, 0];
      return [U.rand(-1, 1) * this.shake, U.rand(-1, 1) * this.shake];
    }

    draw(ctx) {
      for (const r of this.rings) {
        const k = r.t / r.life;
        ctx.globalAlpha = 1 - k;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 8 * (1 - k) + 2;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.maxR * U.easeOutCubic(k), r.maxR * r.flat * U.easeOutCubic(k), 0, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const p of this.parts) {
        const k = p.t / p.life;
        ctx.globalAlpha = Math.min(1, (1 - k) * 1.6);
        ctx.fillStyle = p.color;
        if (p.kind === 'dust') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * (0.6 + k * 0.9), 0, TAU);
          ctx.fill();
        } else if (p.kind === 'star') {
          U.starPath(ctx, p.x, p.y, 5, p.r, p.r * 0.45, p.rot);
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = HF.OUTLINE;
          ctx.stroke();
        } else if (p.kind === 'spark') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.r;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
          ctx.stroke();
        } else if (p.kind === 'shard') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.moveTo(0, -p.r);
          ctx.lineTo(p.r * 0.6, p.r * 0.6);
          ctx.lineTo(-p.r * 0.6, p.r * 0.4);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(80,160,220,0.9)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        } else if (p.kind === 'confetti') {
          ctx.save();
          ctx.translate(p.x + Math.sin(p.t * 4 + p.r) * 10, p.y);
          ctx.rotate(p.rot);
          ctx.fillRect(-p.r, -p.r * 0.4, p.r * 2, p.r * 0.8);
          ctx.restore();
        } else if (p.kind === 'ghost') {
          ctx.globalAlpha = 0.35 * (1 - k);
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.r * p.sx, p.r * p.sy, 0, 0, TAU);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    drawWords(ctx) {
      for (const w of this.words) {
        const k = w.t / w.life;
        const pop = k < 0.2 ? U.easeOutBack(k / 0.2) : 1;
        const fade = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(w.x, w.y - k * 30);
        ctx.rotate(w.rot);
        ctx.scale(pop, pop);
        if (w.burst) {
          U.starPath(ctx, 0, 0, 10, w.size * 1.5, w.size * 1.0, w.rot);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = HF.OUTLINE;
          ctx.stroke();
        }
        U.text(ctx, w.text, 0, 2, { size: w.size, color: w.color, lw: w.size * 0.22 });
        ctx.restore();
      }
    }
  }

  HF.FX = FX;
})();
