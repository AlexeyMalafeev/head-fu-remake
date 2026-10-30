// Shared UI pieces: menus (keyboard, gamepad and mouse), panels and backdrops.
(function () {
  'use strict';
  const HF = window.HF;
  const U = HF.U;
  const W = HF.W, H = HF.H;

  function inRect(m, r) {
    return m.x >= r.x && m.x <= r.x + r.w && m.y >= r.y && m.y <= r.y + r.h;
  }

  // Vertical list menu. Items: { label, action?, value?: () => string, left?, right?, disabled? }
  class Menu {
    constructor(items, o = {}) {
      this.items = items;
      this.o = Object.assign({ x: W / 2, y: 300, gap: 50, size: 32, width: 380, row: false, cursor: 'kenji' }, o);
      this.i = 0;
      this.t = 0;
      this.pulse = 0;
    }

    rect(k) {
      const o = this.o;
      return { x: o.x - o.width / 2, y: o.y + k * o.gap - o.gap / 2 + 3, w: o.width, h: o.gap - 6 };
    }

    move(d) {
      const n = this.items.length;
      for (let k = 0; k < n; k++) {
        this.i = (this.i + d + n) % n;
        if (!this.items[this.i].disabled) break;
      }
      this.pulse = 1;
      HF.Audio.play('move');
    }

    update(dt, inp) {
      inp = inp || HF.Input.menu();
      this.t += dt;
      this.pulse = Math.max(0, this.pulse - dt * 5);
      if (inp.up) this.move(-1);
      if (inp.down) this.move(1);
      const it = this.items[this.i];
      if (inp.left && it.left) {
        it.left();
        HF.Audio.play('move');
      }
      if (inp.right && it.right) {
        it.right();
        HF.Audio.play('move');
      }
      const m = HF.Input.mouse;
      if (m.moved || m.clicked) {
        for (let k = 0; k < this.items.length; k++) {
          const r = this.rect(k);
          if (!inRect(m, r) || this.items[k].disabled) continue;
          if (k !== this.i) {
            this.i = k;
            this.pulse = 1;
            HF.Audio.play('move');
          }
          if (m.clicked) {
            const item = this.items[k];
            if (item.left && item.right) {
              if (m.x < r.x + r.w * 0.75) item.left();
              else item.right();
              HF.Audio.play('move');
            } else if (item.action) {
              HF.Audio.play('select');
              item.action();
              return;
            }
          }
        }
      }
      if (inp.ok && it.action && !it.disabled) {
        HF.Audio.play('select');
        it.action();
        return;
      }
      if (inp.back && this.o.onBack) {
        HF.Audio.play('back');
        this.o.onBack();
      }
    }

    draw(ctx) {
      const o = this.o;
      for (let k = 0; k < this.items.length; k++) {
        const it = this.items[k];
        const sel = k === this.i;
        const y = o.y + k * o.gap;
        const size = sel ? o.size * (1.08 + this.pulse * 0.08) : o.size;
        const color = it.disabled ? '#8a83a0' : sel ? '#ffe14d' : '#fff';
        const label = typeof it.label === 'function' ? it.label() : it.label;
        if (o.row) {
          const lx = o.x - o.width / 2 + 10;
          U.text(ctx, label, lx, y, { size: o.size * 0.8, color, align: 'left' });
          if (it.value) {
            const vx = o.x + o.width / 2 - 30;
            const val = it.value();
            U.text(ctx, val, vx - 20, y, { size: o.size * 0.8, color, align: 'right' });
            if (sel) {
              ctx.font = U.font(o.size * 0.8);
              const vw = ctx.measureText(val).width;
              arrow(ctx, vx - 40 - vw, y, -1, color);
              arrow(ctx, vx, y, 1, color);
            }
          }
          if (sel) cursor(ctx, o.cursor, lx - 34, y, this.t);
        } else {
          const bob = sel ? Math.sin(this.t * 6) * 2 : 0;
          U.text(ctx, label, o.x, y + bob, { size, color });
          if (sel && o.cursor) {
            ctx.font = U.font(size);
            const w = ctx.measureText(label).width;
            cursor(ctx, o.cursor, o.x - w / 2 - 34, y, this.t);
          }
        }
        if (it.hint && sel) U.text(ctx, it.hint, o.x, o.hintY || o.y + this.items.length * o.gap + 4, { size: 18, display: false, color: '#d8d0f0', lw: 4 });
      }
    }
  }

  function arrow(ctx, x, y, dir, color) {
    ctx.beginPath();
    ctx.moveTo(x + dir * 9, y);
    ctx.lineTo(x - dir * 6, y - 9);
    ctx.lineTo(x - dir * 6, y + 9);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = HF.OUTLINE;
    ctx.stroke();
    ctx.fill();
  }

  // The menu cursor is a tiny head that winks at you.
  function cursor(ctx, id, x, y, t) {
    const expr = Math.floor(t * 1.2) % 4 === 3 ? 'wink' : 'gloat';
    HF.drawHead(ctx, id, { x, y: y + Math.sin(t * 8) * 2, r: 15, facing: 1, expr, t, rot: Math.sin(t * 4) * 0.15 });
  }

  // Rounded panel with the house outline.
  function panel(ctx, x, y, w, h, o = {}) {
    U.roundRect(ctx, x + 5, y + 7, w, h, o.r || 18);
    ctx.fillStyle = 'rgba(10,6,20,0.35)';
    ctx.fill();
    U.roundRect(ctx, x, y, w, h, o.r || 18);
    ctx.fillStyle = o.fill || 'rgba(40,28,70,0.92)';
    ctx.fill();
    ctx.lineWidth = o.lw || 4;
    ctx.strokeStyle = o.stroke || HF.OUTLINE;
    ctx.stroke();
  }

  // Animated striped backdrop for menu screens.
  function backdrop(ctx, t, c1 = '#3b2667', c2 = '#4a3180') {
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = c2;
    const off = (t * 30) % 80;
    for (let x = -H - 80; x < W + 80; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x + off, 0);
      ctx.lineTo(x + off + 40, 0);
      ctx.lineTo(x + off + 40 + H, H);
      ctx.lineTo(x + off + H, H);
      ctx.closePath();
      ctx.fill();
    }
    const g = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 600);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // Big "HEAD-FU" logo with bouncing letters.
  function logo(ctx, x, y, size, t) {
    const word = 'HEAD-FU';
    ctx.font = U.font(size);
    const widths = [...word].map((c) => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0) + (word.length - 1) * size * 0.02;
    let cx = x - total / 2;
    for (let i = 0; i < word.length; i++) {
      const c = word[i];
      const bounce = Math.abs(Math.sin(t * 3 + i * 0.55)) * size * 0.08;
      const lx = cx + widths[i] / 2;
      ctx.save();
      ctx.translate(lx, y - bounce);
      ctx.rotate(Math.sin(t * 2 + i) * 0.05);
      U.text(ctx, c, 6, 8, { size, color: '#1d1830', lw: size * 0.22 });
      const g = ctx.createLinearGradient(0, -size * 0.5, 0, size * 0.4);
      g.addColorStop(0, '#fff27a');
      g.addColorStop(0.55, '#ffb703');
      g.addColorStop(1, '#ff6b35');
      U.text(ctx, c, 0, 0, { size, color: g, lw: size * 0.2 });
      ctx.restore();
      cx += widths[i] + size * 0.02;
    }
  }

  // Keyboard key glyph used on the help screens.
  function key(ctx, label, x, y, w = 34) {
    U.roundRect(ctx, x - w / 2, y - 16, w, 32, 7);
    ctx.fillStyle = '#f4f0ff';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = HF.OUTLINE;
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x - w / 2 + 3, y + 9, w - 6, 4);
    U.text(ctx, label, x, y, { size: label.length > 2 ? 13 : 17, display: false, weight: 700, color: HF.OUTLINE, stroke: false });
  }

  HF.UI = { Menu, panel, backdrop, logo, key, inRect, cursor };
})();
