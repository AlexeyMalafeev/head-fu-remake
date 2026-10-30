// Computer opponent. It presses the same virtual buttons a player would, and it sees the
// opponent with a delay ("reaction time"), so difficulty comes from skill, not from cheating.
(function () {
  'use strict';
  const HF = window.HF;
  const U = HF.U;

  // Skill 0..1 behind each difficulty name.
  HF.AI_LEVELS = { easy: 0.15, normal: 0.5, hard: 0.9 };

  // Time until a falling body at y0 with velocity vy reaches yT, or null if it never does.
  function timeToY(y0, vy, g, yT) {
    const disc = vy * vy + 2 * g * (yT - y0);
    if (disc < 0) return null;
    const t = (-vy + Math.sqrt(disc)) / g;
    return t >= 0 ? t : null;
  }

  class AI {
    constructor(me, battle, skill) {
      this.me = me;
      this.b = battle;
      this.setSkill(skill);
      this.hist = [];
      this.now = 0;
      this.thinkT = 0;
      this.targetX = null;
      this.noise = 0;
      this.idleT = 0;
      this.jumpReq = null;
      this.jumpHold = 0;
      this.specReq = null;
      this.specHold = 0;
      this.glide = false;
      this.forceDir = 0;
      this.forceT = 0;
      this.prevJ = false;
      this.prevS = false;
      this.out = { left: false, right: false, jump: false, special: false };
    }

    setSkill(s) {
      this.skill = s;
      const L = U.lerp;
      this.p = {
        reaction: L(0.42, 0.06, s),
        think: L(0.26, 0.04, s),
        aim: L(105, 5, s),
        predict: s,
        dodge: L(0.06, 0.92, s),
        clash: L(0, 0.55, s),
        aggr: L(0.12, 0.85, s),
        range: L(0.6, 1.0, s),
        special: L(0.1, 0.9, s),
        idle: L(0.5, 0, s),
        randomJump: L(0.4, 0, s),
      };
    }

    jump(hold) {
      this.jumpReq = hold;
    }
    tapSpecial(dir = 0, hold = 0.05) {
      this.specReq = hold;
      if (dir) {
        this.forceDir = dir;
        this.forceT = 0.08;
      }
    }

    // What the AI "sees": the opponent as it was `reaction` seconds ago.
    observe() {
      const o = this.b.other(this.me);
      this.hist.push({
        t: this.now,
        x: o.x,
        y: o.y,
        vx: o.vx,
        vy: o.vy,
        r: o.r,
        g: HF.GRAV * o.st.gravity,
        onGround: o.onGround,
        invuln: o.invulnT > 0.1 && o.state !== 'dash',
        helpless: o.frozenT > 0 || o.stunT > 0,
        spikes: o.spikeT > 0 || !!o.spikeWarn,
        ko: o.ko,
      });
      while (this.hist.length > 1 && this.hist[1].t <= this.now - this.p.reaction) this.hist.shift();
      return this.hist[0];
    }

    update(dt) {
      this.now += dt;
      const me = this.me;
      const o = this.observe();
      const out = this.out;
      if (me.ko || me.result || o.ko) {
        out.left = out.right = out.jump = out.special = false;
        this.prevJ = this.prevS = false;
        return out;
      }

      this.thinkT -= dt;
      if (this.idleT > 0) this.idleT -= dt;
      if (this.thinkT <= 0) {
        this.thinkT = this.p.think * U.rand(0.7, 1.3);
        this.think(o);
      }

      // steering toward the chosen spot
      out.left = out.right = false;
      if (this.forceT > 0) {
        this.forceT -= dt;
        out.left = this.forceDir < 0;
        out.right = this.forceDir > 0;
      } else if (this.idleT <= 0 && this.targetX != null) {
        const tx = U.clamp(this.targetX, HF.ARENA_L + me.r, HF.ARENA_R - me.r);
        const d = tx - me.x;
        const dead = me.onGround ? 10 : 5;
        out.left = d < -dead;
        out.right = d > dead;
      }

      // button presses need a release between them
      let j = false;
      if (this.jumpReq != null) {
        if (!this.prevJ) {
          this.jumpHold = this.jumpReq;
          this.jumpReq = null;
        }
      }
      if (this.jumpHold > 0) {
        j = true;
        this.jumpHold -= dt;
      }
      let s = false;
      if (this.specReq != null) {
        if (!this.prevS) {
          this.specHold = this.specReq;
          this.specReq = null;
        }
      }
      if (this.specHold > 0) {
        s = true;
        this.specHold -= dt;
      } else if (this.glide && me.ability === 'glide') s = true;
      out.jump = this.prevJ = j;
      out.special = this.prevS = s;
      return out;
    }

    // Range of horizontal distances from which a jump lands on the opponent's head without
    // bumping into its side on the way up. Null if the head is too tall to jump onto.
    jumpWindow(o) {
      const me = this.me;
      const g = HF.GRAV * me.st.gravity;
      const y0 = HF.GROUND - me.r, yT = o.y - o.r - me.r, v = me.st.jump;
      const disc = v * v - 2 * g * (y0 - yT);
      if (disc < 0) return null;
      const t1 = (v - Math.sqrt(disc)) / g; // bottom rises past their top
      const t2 = (v + Math.sqrt(disc)) / g; // bottom falls back to their top
      let air = me.st.air;
      if (me.ability === 'airjump' || me.ability === 'glide') air *= 1.3;
      const sp = me.st.speed * air;
      const rr = me.r + o.r;
      const min = Math.max(rr + 8, sp * t1 + rr * 0.5);
      const max = sp * t2 * 0.85 + rr * 0.7;
      return max > min ? { min, max } : { min: rr + 8, max: rr + 30 };
    }

    // Where will an airborne opponent come down relative to height yLevel (its bottom)?
    landingX(o, yLevel) {
      if (o.onGround) return o.x;
      const t = timeToY(o.y, o.vy, o.g, yLevel - o.r);
      if (t == null) return o.x;
      return U.clamp(o.x + o.vx * t * this.p.predict, HF.ARENA_L, HF.ARENA_R);
    }

    // Is the opponent about to land on me?
    threat(o) {
      const me = this.me;
      if (o.onGround || o.y > me.y - me.r * 0.4) return null;
      const t = timeToY(o.y, o.vy, o.g, me.y - me.r - o.r);
      if (t == null || t > 0.9) return null;
      const landX = o.x + o.vx * t * (0.4 + 0.6 * this.p.predict);
      const myX = me.x + me.vx * t * 0.5;
      if (Math.abs(landX - myX) > (me.r + o.r) * 1.15) return null;
      return { t, landX };
    }

    think(o) {
      const me = this.me, p = this.p;
      this.glide = false;
      if (me.hurtT > 0 || me.stunT > 0 || me.frozenT > 0) return;
      if (U.chance(p.idle * p.think)) this.idleT = U.rand(0.25, 0.8);
      if (me.onGround && U.chance(p.randomJump * p.think)) this.jump(U.rand(0.05, 0.4));

      const dx = o.x - me.x, adx = Math.abs(dx), dir = U.sign(dx);
      const oTop = o.y - o.r;
      const threat = this.threat(o);

      if (me.onGround) {
        if (me.state === 'charge') return; // keep charging
        if (threat && U.chance(p.dodge)) {
          if (threat.t < 0.22 && U.chance(p.clash)) {
            this.jump(0.3);
            this.targetX = me.x;
            return;
          }
          let away = threat.landX > me.x ? -1 : 1;
          if (me.x + away * 160 < HF.ARENA_L + me.r || me.x + away * 160 > HF.ARENA_R - me.r) away = -away;
          if (me.ability === 'dash' && me.cool <= 0 && U.chance(p.special)) this.tapSpecial(away);
          if (me.ability === 'spring' && threat.t < 0.5 && U.chance(p.special)) {
            this.tapSpecial(0, 0.6);
            this.targetX = null;
            return;
          }
          this.targetX = me.x + away * 240;
          return;
        }
        if (o.spikes) {
          // never stomp a spiked helmet: keep away and use ranged moves
          this.targetX = o.x - dir * (me.r + o.r + 170);
          this.groundAbility(o, adx, dir, true);
          return;
        }
        const win = this.jumpWindow(o);
        const aggr = o.helpless ? 1 : p.aggr;
        const canStrike = o.onGround || o.y > me.y - 30;
        if (canStrike && win && adx > win.min * 0.9 - (1 - p.range) * 40 && adx < win.max * p.range && !o.invuln && U.chance(aggr)) {
          this.jump(0.45);
          this.noise = U.rand(-p.aim, p.aim);
          this.targetX = o.x;
          return;
        }
        if (this.groundAbility(o, adx, dir, false)) return;
        if (canStrike) this.targetX = o.x - dir * (win ? (win.min + win.max * p.range) / 2 : me.r + o.r + 140);
        else this.targetX = this.landingX(o, me.y - me.r) - dir * (me.r + o.r) * 1.9;
        return;
      }

      // airborne: aim for the opponent's predicted spot when we come down onto its head
      const g = HF.GRAV * me.st.gravity;
      const t = me.state === 'pound' ? null : timeToY(me.y, me.vy, g, oTop - me.r);
      if (threat) {
        this.targetX = me.x - U.sign(o.x - me.x) * 220;
      } else if (t != null && !o.spikes) {
        this.targetX = o.x + o.vx * t * p.predict + this.noise;
      } else {
        this.targetX = o.x - dir * (me.r + o.r) * 1.6;
      }
      this.airAbility(o, t, dir, threat);
    }

    groundAbility(o, adx, dir, defensive) {
      const me = this.me, p = this.p;
      if (!U.chance(p.special)) return false;
      const level = Math.abs(o.y - me.y);
      switch (me.ability) {
        case 'frost':
          if (me.cool <= 0 && !o.helpless && !o.invuln && level < 60 && adx > 110 && adx < 650) {
            this.tapSpecial();
            return true;
          }
          break;
        case 'royal':
          if (me.cool <= 0 && !o.invuln && level < 90 && adx > 160) {
            this.tapSpecial();
            return true;
          }
          break;
        case 'dash':
          if (!defensive && me.cool <= 0 && o.onGround && !o.invuln && adx > 90 && adx < 280) {
            this.tapSpecial(dir);
            return true;
          }
          break;
        case 'spring':
          if (!defensive && o.onGround && !o.invuln && adx > 220 && adx < 560) {
            this.tapSpecial(0, U.clamp(adx / 1100, 0.15, 0.5));
            this.noise = U.rand(-p.aim, p.aim);
            this.targetX = o.x;
            return true;
          }
          break;
        case 'pound':
          if (!defensive && me.cool <= 0 && o.onGround && adx < 190 && U.chance(0.6)) {
            this.tapSpecial();
            return true;
          }
          break;
      }
      return false;
    }

    airAbility(o, t, dir, threat) {
      const me = this.me, p = this.p;
      const oTop = o.y - o.r;
      const gap = this.targetX != null ? Math.abs(this.targetX - me.x) : 0;
      switch (me.ability) {
        case 'airjump':
          if (me.airJumps > 0 && me.vy > 60 && U.chance(p.special)) {
            const reachable = t != null && gap < me.st.speed * me.st.air * t + (me.r + o.r) * 0.5;
            if (!threat && (!reachable || me.y > oTop - me.r * 0.5) && Math.abs(o.x - me.x) < 320) this.jump(0.35);
          }
          break;
        case 'pound':
        case 'royal':
          if (me.cool <= 0 && !o.spikes && me.y + me.r < oTop - 15 && Math.abs(o.x + o.vx * 0.12 - me.x) < o.r * 0.75 && U.chance(p.special)) {
            this.tapSpecial();
          }
          break;
        case 'glide':
          this.glide = !threat && me.vy > 0 && t != null && me.fuel > 0 && gap > 25 && U.chance(p.special + 0.1);
          break;
        case 'frost':
          if (me.cool <= 0 && !o.helpless && Math.abs(o.y - me.y) < 50 && Math.abs(o.x - me.x) > 120 && U.chance(p.special * 0.5)) this.tapSpecial();
          break;
        case 'dash':
          if (me.cool <= 0 && t != null && !threat && gap > me.st.speed * t + 60 && gap < 320 && U.chance(p.special)) {
            this.tapSpecial(U.sign(this.targetX - me.x));
          }
          break;
      }
    }
  }

  HF.AI = AI;
})();
