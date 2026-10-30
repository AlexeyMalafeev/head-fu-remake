// One fight's simulation: two fighters, projectiles and head-on-head collisions.
// It records events (stomps, jumps, KOs...) that the match scene turns into sound and effects.
(function () {
  'use strict';
  const HF = window.HF;
  const U = HF.U;

  const STOMP_WORDS = ['BONK!', 'WHAM!', 'POW!', 'SQUISH!', 'BOP!', 'THWOMP!'];

  class Battle {
    // cfg: { defs: [defA, defB], boss: [bool, bool], hp: [num?, num?], armor: [num?, num?] }
    constructor(cfg) {
      this.cfg = cfg;
      this.f = cfg.defs.map(
        (d, i) =>
          new HF.Fighter(d, {
            side: i,
            boss: cfg.boss && cfg.boss[i],
            hp: cfg.hp && cfg.hp[i],
            armor: cfg.armor && cfg.armor[i],
          })
      );
      this.events = [];
      this.time = 0;
      this.active = false; // true while the round clock is running
      this.reset();
    }

    reset() {
      this.f[0].reset(HF.W * 0.27, 1);
      this.f[1].reset(HF.W * 0.73, -1);
      this.proj = [];
      this.events.length = 0;
    }

    other(f) {
      return f === this.f[0] ? this.f[1] : this.f[0];
    }

    emit(type, data) {
      this.events.push(Object.assign({ type }, data));
    }

    step(dt, inputs) {
      this.time += dt;
      this.f[0].update(dt, inputs[0], this);
      this.f[1].update(dt, inputs[1], this);
      this.updateProj(dt);
      this.collide();
    }

    // ---------- projectiles ----------
    spawnProj(owner, type, arc) {
      const dir = owner.facing;
      const p = {
        owner,
        type,
        x: owner.x + dir * owner.r * 0.9,
        y: owner.y + owner.r * 0.25,
        vx: dir * (type === 'frost' ? 560 : 430),
        vy: 0,
        g: 0,
        r: type === 'frost' ? 15 : 20,
        life: 1.8,
        t: 0,
      };
      if (arc) {
        p.vy = -620;
        p.g = 1300;
        p.vx = dir * 380;
        p.life = 2.2;
      }
      this.proj.push(p);
      this.emit('shoot', { f: owner, kind: type });
    }

    updateProj(dt) {
      for (const p of this.proj) {
        p.t += dt;
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.y + p.r > HF.GROUND) {
          p.dead = true;
          this.emit('projGone', { x: p.x, y: HF.GROUND - 6, kind: p.type });
          continue;
        }
        if (p.t > p.life || p.x < HF.ARENA_L - 40 || p.x > HF.ARENA_R + 40) {
          p.dead = true;
          continue;
        }
        const tgt = this.other(p.owner);
        if (!tgt.ko && Math.hypot(tgt.x - p.x, tgt.y - p.y) < tgt.r + p.r) {
          p.dead = true;
          if (p.type === 'frost') {
            if (tgt.hit(3, { hurt: 0, freeze: 1.1, invuln: 0.4, dir: U.sign(p.vx) }, this)) this.emit('freeze', { f: tgt, x: tgt.x, y: tgt.y });
            else this.emit('projGone', { x: p.x, y: p.y, kind: p.type });
          } else {
            if (tgt.hit(7, { hurt: 0.35, kx: U.sign(p.vx) * 260, ky: -330, dir: U.sign(p.vx) }, this)) this.emit('burn', { f: tgt, x: tgt.x, y: tgt.y });
            else this.emit('projGone', { x: p.x, y: p.y, kind: p.type });
          }
        }
      }
      // opposing projectiles cancel out
      for (const a of this.proj) {
        for (const c of this.proj) {
          if (a === c || a.dead || c.dead || a.owner === c.owner) continue;
          if (Math.hypot(a.x - c.x, a.y - c.y) < a.r + c.r) {
            a.dead = c.dead = true;
            this.emit('cancel', { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 });
          }
        }
      }
      this.proj = this.proj.filter((p) => !p.dead);
    }

    // ---------- head collisions ----------
    collide() {
      const [a, b] = this.f;
      if (a.ko || b.ko || a.result || b.result) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.001;
      const minD = a.r + b.r;
      if (d >= minD) return;

      const top = a.y < b.y ? a : b;
      const bot = top === a ? b : a;
      const ny = (bot.y - top.y) / d; // how vertical the contact is (1 = straight on top)
      const closing = top.vy - bot.vy; // > 0 when the upper head is coming down onto the lower one

      if (ny > 0.5 && closing > 40) {
        if (bot.vy < -300 && bot.hurtT <= 0 && bot.state !== 'dash') return this.clash(top, bot);
        if (bot.spikeT > 0) return this.spikeHurt(top, bot);
        if (bot.state === 'charge') return this.springBack(top, bot);
        if (bot.invulnT > 0 || top.hurtT > 0) return this.softBounce(top, bot);
        return this.stomp(top, bot, closing);
      }

      // side contact: push apart by mass and trade some momentum
      const nx = dx / d, nyy = dy / d;
      const overlap = minD - d;
      const tot = a.mass + b.mass;
      a.x -= nx * overlap * (b.mass / tot);
      b.x += nx * overlap * (a.mass / tot);
      if (!a.onGround || !b.onGround) {
        a.y -= nyy * overlap * (b.mass / tot);
        b.y += nyy * overlap * (a.mass / tot);
        for (const f of [a, b]) f.y = Math.min(f.y, HF.GROUND - f.r);
      }
      const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * nyy;
      if (rv < 0) {
        const j = (-(1 + 0.45) * rv) / (1 / a.mass + 1 / b.mass);
        a.vx -= (j * nx) / a.mass;
        b.vx += (j * nx) / b.mass;
        if (!a.onGround) a.vy -= (j * nyy) / a.mass;
        if (!b.onGround) b.vy += (j * nyy) / b.mass;
        if (-rv > 160) this.emit('bump', { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      }
      if (Math.abs(nx) > 0.5) {
        if (a.state === 'dash') this.dashHit(a, b);
        else if (b.state === 'dash') this.dashHit(b, a);
      }
    }

    stomp(att, vic, closing) {
      const pound = att.state === 'pound';
      let mult = U.clamp(0.7 + closing / 2000, 0.75, 1.4);
      if (pound) mult *= 1.2;
      const shatter = vic.frozenT > 0;
      let dmg = Math.round(att.st.power * mult * vic.armor);
      if (shatter) dmg = Math.round(dmg * 1.25);
      const ok = vic.hit(dmg, { hurt: 0.32, invuln: 0.85, ky: vic.onGround ? null : 260, kx: vic.vx * 0.3, dir: U.sign(vic.x - att.x) }, this);
      if (!ok) return this.softBounce(att, vic);
      if (!vic.ko) {
        vic.sx = 1.55;
        vic.sy = 0.42;
      }
      att.y = Math.min(att.y, vic.y - (att.r + vic.r) * 0.92);
      att.vy = -att.st.bounce * (att.prevJump ? 1.12 : 1);
      att.onGround = false;
      att.state = 'idle';
      att.airJumps = 1;
      att.fuel = 1;
      att.jumpCut = true;
      att.queuedPound = false;
      att.setEmote('gloat', 0.75);
      att.stompCount++;
      this.emit('stomp', {
        att,
        vic,
        dmg,
        x: vic.x,
        y: vic.y - vic.r,
        shatter,
        pound,
        word: pound ? 'KA-BOOM!' : shatter ? 'SHATTER!' : U.pick(STOMP_WORDS),
      });
    }

    clash(top, bot) {
      const dir = U.sign(top.x - bot.x);
      top.vy = -560;
      bot.vy = 260;
      top.vx = dir * 260;
      bot.vx = -dir * 200;
      for (const f of [top, bot]) {
        if (f.state === 'pound' || f.state === 'charge') f.state = 'idle';
        f.jumpCut = true;
        f.setEmote('clash', 0.5);
      }
      top.y = Math.min(top.y, bot.y - (top.r + bot.r));
      this.emit('clash', { x: (top.x + bot.x) / 2, y: (top.y + top.r + bot.y - bot.r) / 2 });
    }

    softBounce(top, bot) {
      const dir = U.sign(top.x - bot.x);
      top.y = Math.min(top.y, bot.y - (top.r + bot.r));
      top.vy = -480;
      top.vx += dir * 140;
      if (top.state === 'pound') top.state = 'idle';
      this.emit('bump', { x: top.x, y: top.y + top.r });
    }

    // A squished, charging Bao is springy: stomps bounce off him harmlessly.
    springBack(top, bot) {
      const dir = U.sign(top.x - bot.x);
      top.y = Math.min(top.y, bot.y - (top.r + bot.r));
      top.vy = -900;
      top.vx = dir * 260;
      if (top.state === 'pound') top.state = 'idle';
      top.setEmote('shock', 0.5);
      bot.sy = 0.5;
      bot.sx = 1.4;
      this.emit('springBack', { f: bot, x: bot.x, y: bot.y - bot.r });
    }

    spikeHurt(top, bot) {
      top.y = Math.min(top.y, bot.y - (top.r + bot.r));
      if (top.state === 'pound') top.state = 'idle';
      if (top.hit(8, { hurt: 0.4, invuln: 0.9, ky: -900, kx: U.sign(top.x - bot.x) * 200, dir: U.sign(top.x - bot.x) }, this)) {
        bot.setEmote('gloat', 0.8);
        this.emit('spikeHurt', { f: top, x: top.x, y: top.y + top.r });
      } else {
        top.vy = -700;
        this.emit('bump', { x: top.x, y: top.y + top.r });
      }
    }

    dashHit(att, vic) {
      if (vic.hit(5, { hurt: 0.3, invuln: 0.6, kx: att.dashDir * 520, ky: -320, dir: att.dashDir }, this)) {
        att.state = 'idle';
        att.dashT = 0;
        att.vx = -att.dashDir * 200;
        att.setEmote('gloat', 0.6);
        this.emit('dashHit', { att, vic, x: (att.x + vic.x) / 2, y: vic.y });
      }
    }

    shockwave(src) {
      const R = src.id === 'emperor' ? 240 : 220;
      this.emit('shock', { f: src, x: src.x, y: HF.GROUND, R });
      const o = this.other(src);
      if (o.onGround && !o.ko && Math.abs(o.x - src.x) < R + o.r) {
        const dir = U.sign(o.x - src.x);
        if (o.hit(4, { hurt: 0, stun: 1.0, invuln: 0.45, ky: -380, kx: dir * 60, dir }, this)) this.emit('shockHit', { f: o, x: o.x, y: o.y });
      }
    }
  }

  HF.Battle = Battle;
})();
