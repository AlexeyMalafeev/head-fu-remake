// A fighter head: movement physics, abilities, damage and facial mood. No drawing or sound here.
(function () {
  'use strict';
  const HF = window.HF;
  const U = HF.U;
  const NONE = { left: false, right: false, jump: false, special: false };

  const COOLDOWN = { dash: 1.0, pound: 1.8, frost: 2.0, royal: 2.2 };
  const POUND_SPEED = 1650;
  const DASH_SPEED = 820;

  class Fighter {
    constructor(def, opts = {}) {
      this.def = def;
      this.id = def.id;
      this.st = def.stats;
      this.r = this.st.radius;
      this.mass = this.st.mass;
      this.ability = def.ability;
      this.maxHp = opts.hp || this.st.hp;
      this.side = opts.side || 0;
      this.boss = !!opts.boss; // story boss: spiked helmet phases and a rage mode
      this.armor = opts.armor != null ? opts.armor : this.st.armor || 1; // multiplier on stomp damage taken
      this.t = Math.random() * 10;
      this.reset(opts.x || 300, opts.facing || 1);
    }

    reset(x, facing) {
      this.x = x;
      this.y = HF.GROUND - this.r;
      this.vx = 0;
      this.vy = 0;
      this.facing = facing;
      this.onGround = true;
      this.hp = this.maxHp;
      this.state = 'idle';
      this.ko = false;
      this.result = null;
      this.hurtT = this.stunT = this.frozenT = this.invulnT = 0;
      this.cool = 0;
      this.dashT = 0;
      this.dashDir = 1;
      this.poundT = 0;
      this.fuel = 1;
      this.charge = 0;
      this.chargeT = 0;
      this.airJumps = 1;
      this.coyote = 0;
      this.jumpBuf = 0;
      this.jumpCut = false;
      this.prevJump = false;
      this.prevSpecial = false;
      this.gliding = false;
      this.queuedPound = false;
      this.sx = this.sy = 1;
      this.svx = this.svy = 0;
      this.rot = 0;
      this.spinT = 0;
      this.spinV = 0;
      this.emote = null;
      this.emoteT = 0;
      this.blinkT = U.rand(1, 3);
      this.blink = 0;
      this.flash = 0;
      this.spikeT = 0;
      this.spikeCycle = U.rand(5, 7);
      this.spikeWarn = 0;
      this.rage = false;
      this.fireAlt = 0;
      this.hitTimes = [];
      this.stompCount = 0;
    }

    canAct() {
      return !this.ko && !this.result && this.hurtT <= 0 && this.stunT <= 0 && this.frozenT <= 0;
    }

    setEmote(name, dur) {
      this.emote = name;
      this.emoteT = dur;
    }

    coolMax() {
      return COOLDOWN[this.ability] || 1;
    }

    // 0..1 readiness for the HUD meter.
    meter() {
      switch (this.ability) {
        case 'airjump':
          return this.onGround || this.airJumps > 0 ? 1 : 0;
        case 'glide':
          return this.fuel;
        case 'spring':
          return this.state === 'charge' ? this.charge : 1;
        default:
          return 1 - U.clamp(this.cool / this.coolMax(), 0, 1);
      }
    }

    update(dt, input, b) {
      const st = this.st;
      const opp = b.other(this);
      this.t += dt;

      for (const k of ['hurtT', 'stunT', 'frozenT', 'invulnT', 'cool', 'emoteT', 'jumpBuf', 'coyote', 'flash']) {
        if (this[k] > 0) this[k] = Math.max(0, this[k] - dt * (k === 'flash' ? 6 : 1));
      }
      if (this.emoteT <= 0) this.emote = null;

      const raw = input || NONE;
      const jp = raw.jump && !this.prevJump;
      const jr = !raw.jump && this.prevJump;
      const sp = raw.special && !this.prevSpecial;
      this.prevJump = raw.jump;
      this.prevSpecial = raw.special;
      const act = this.canAct();
      const inp = act ? raw : NONE;

      if (!this.ko && !this.result && this.state !== 'dash') {
        if (opp.x > this.x + 3) this.facing = 1;
        else if (opp.x < this.x - 3) this.facing = -1;
      }

      if (this.boss) this.bossUpdate(dt, b);

      // ----- abilities -----
      this.abilityUpdate(dt, inp, raw, sp, act, b);

      // ----- jumping (with a short input buffer and coyote time) -----
      if (jp && act) this.jumpBuf = 0.12;
      const busy = this.state === 'charge' || this.state === 'dash' || this.state === 'pound';
      if (act && this.jumpBuf > 0 && !busy) {
        if (this.onGround || this.coyote > 0) {
          this.doJump(b, 1);
          this.jumpBuf = 0;
        } else if (jp && this.ability === 'airjump' && this.airJumps > 0) {
          this.doAirJump(b);
          this.jumpBuf = 0;
        }
      }
      // Letting go of jump early gives a short hop.
      if (jr && this.vy < -200 && !this.jumpCut) {
        this.vy *= 0.5;
        this.jumpCut = true;
      }

      // ----- horizontal movement -----
      const move = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      if (this.state === 'dash') {
        this.dashT -= dt;
        this.vx = this.dashDir * DASH_SPEED;
        this.vy = 0;
        if (this.dashT <= 0) {
          this.state = 'idle';
          this.vx = this.dashDir * 280;
        }
      } else if (this.state === 'pound' || this.state === 'charge') {
        this.vx = U.approach(this.vx, 0, 3000 * dt);
      } else if (!this.ko) {
        const spd = st.speed * (this.rage ? 1.2 : 1);
        const ctrl = this.onGround ? 1 : st.air * (this.gliding ? 1.35 : 1);
        if (move) this.vx = U.approach(this.vx, move * spd, 3400 * ctrl * dt);
        else {
          const decel = this.frozenT > 0 ? 260 : this.onGround ? 2800 : 500;
          this.vx = U.approach(this.vx, 0, decel * dt);
        }
      }

      // ----- vertical movement -----
      if (this.state === 'pound') {
        if (this.poundT > 0) {
          this.poundT -= dt;
          this.vy = 0;
          if (this.poundT <= 0) b.emit('poundDrop', { f: this });
        } else this.vy = POUND_SPEED;
      } else if (this.state !== 'dash') {
        this.vy += HF.GRAV * st.gravity * dt;
        if (this.gliding && this.vy > 90) this.vy = U.approach(this.vy, 90, 5000 * dt);
        this.vy = Math.min(this.vy, 1500);
      }

      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // ----- floor, walls, ceiling -----
      const floor = HF.GROUND - this.r;
      if (this.y >= floor) {
        this.y = floor;
        if (!this.onGround) this.land(b);
        else if (this.vy > 0) this.vy = 0;
      } else if (this.onGround) {
        this.onGround = false;
        this.coyote = 0.08;
      }
      const minX = HF.ARENA_L + this.r, maxX = HF.ARENA_R - this.r;
      if (this.x < minX || this.x > maxX) {
        this.x = U.clamp(this.x, minX, maxX);
        if (this.state === 'dash') {
          this.state = 'idle';
          this.dashT = 0;
        }
        this.vx = this.ko || this.hurtT > 0 ? -this.vx * 0.5 : 0;
      }
      if (this.y < -260) {
        this.y = -260;
        this.vy = Math.max(this.vy, 0);
      }

      this.animate(dt, opp);
    }

    abilityUpdate(dt, inp, raw, sp, act, b) {
      const onG = this.onGround;
      switch (this.ability) {
        case 'airjump':
          if (act && sp) {
            if (onG || this.coyote > 0) this.doJump(b, 1);
            else if (this.airJumps > 0) this.doAirJump(b);
          }
          break;
        case 'dash':
          if (act && sp && this.cool <= 0 && this.state !== 'dash') {
            const move = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
            this.dashDir = move || this.facing;
            this.state = 'dash';
            this.dashT = 0.2;
            this.cool = COOLDOWN.dash;
            this.invulnT = Math.max(this.invulnT, 0.22);
            this.jumpCut = true;
            b.emit('dash', { f: this });
          }
          break;
        case 'pound':
          if (act && sp && this.cool <= 0 && this.state !== 'pound') {
            this.cool = COOLDOWN.pound;
            if (onG) {
              // a little hop, then slam down at the top of it
              this.vy = -this.st.jump * 0.62;
              this.onGround = false;
              this.jumpCut = true;
              this.queuedPound = true;
              b.emit('jump', { f: this });
            } else this.startPound(b);
          }
          if (this.queuedPound && !this.onGround && this.vy > -80) {
            this.queuedPound = false;
            if (act) this.startPound(b);
          }
          break;
        case 'glide': {
          if (act && sp && (onG || this.coyote > 0)) this.doJump(b, 1);
          const was = this.gliding;
          this.gliding = act && raw.special && !onG && this.fuel > 0 && this.vy > -250;
          if (this.gliding) {
            this.fuel = Math.max(0, this.fuel - dt / 1.7);
            if (!was) b.emit('glide', { f: this });
          }
          break;
        }
        case 'frost':
          if (act && sp && this.cool <= 0) {
            this.cool = COOLDOWN.frost;
            b.spawnProj(this, 'frost');
          }
          break;
        case 'spring':
          if (this.state === 'charge') {
            if (!act || !onG) {
              this.state = 'idle';
              this.charge = 0;
              break;
            }
            this.chargeT += dt;
            const before = this.charge;
            this.charge = Math.min(1, this.charge + dt / 0.5);
            if (Math.floor(before * 5) !== Math.floor(this.charge * 5)) b.emit('charge', { f: this, level: this.charge });
            if (!raw.special || this.chargeT > 1.5) {
              const c = this.charge;
              this.state = 'idle';
              this.charge = 0;
              if (c > 0.15) {
                this.doJump(b, 1 + 0.5 * c);
                b.emit('spring', { f: this, power: c });
              } else this.doJump(b, 1);
            }
          } else if (act && sp && onG) {
            this.state = 'charge';
            this.charge = 0;
            this.chargeT = 0;
            this.jumpBuf = 0;
          }
          break;
        case 'royal':
          if (act && sp && this.cool <= 0) {
            if (onG) {
              this.cool = this.rage ? 1.3 : COOLDOWN.royal;
              const arc = this.rage && this.fireAlt++ % 2 === 1;
              b.spawnProj(this, 'fire', arc);
            } else {
              this.cool = COOLDOWN.royal;
              this.startPound(b);
            }
          }
          break;
      }
    }

    bossUpdate(dt, b) {
      if (this.ko || this.result) {
        this.spikeT = 0;
        return;
      }
      if (!this.rage && this.hp <= this.maxHp * 0.5) {
        this.rage = true;
        this.setEmote('angry', 1.6);
        b.emit('rage', { f: this });
      }
      if (this.spikeT > 0) {
        this.spikeT -= dt;
        if (this.spikeT <= 0) {
          this.spikeT = 0;
          this.spikeCycle = U.rand(5.5, 8) * (this.rage ? 0.7 : 1);
          b.emit('spikesOff', { f: this });
        }
      } else if (b.active) {
        this.spikeCycle -= dt;
        if (this.spikeCycle <= 0.8 && !this.spikeWarn) {
          this.spikeWarn = 1;
          b.emit('spikeWarn', { f: this });
        }
        if (this.spikeCycle <= 0) {
          this.spikeWarn = 0;
          this.spikeT = this.rage ? 3.2 : 2.6;
          b.emit('spikesOn', { f: this });
        }
      }
    }

    // Helmet visibility for drawing: blinking warning, then solid.
    helmet() {
      if (this.spikeT > 0) return 1;
      if (this.spikeWarn) return 0.5;
      return 0;
    }

    doJump(b, mult) {
      this.vy = -this.st.jump * mult;
      this.onGround = false;
      this.coyote = 0;
      this.jumpCut = mult > 1.05;
      this.svy -= 3;
      b.emit('jump', { f: this });
    }

    doAirJump(b) {
      this.vy = -this.st.jump * 0.8;
      this.airJumps--;
      this.jumpCut = false;
      this.spinT = 0.4;
      b.emit('airjump', { f: this });
    }

    startPound(b) {
      this.state = 'pound';
      this.poundT = 0.14;
      this.vx = 0;
      this.vy = 0;
      this.gliding = false;
      b.emit('poundStart', { f: this });
    }

    land(b) {
      const impact = this.vy;
      if (this.ko && impact > 260) {
        // a KO'd head bounces a few times
        this.vy = -impact * 0.45;
        this.vx *= 0.7;
        b.emit('land', { f: this, impact });
        return;
      }
      this.onGround = true;
      this.vy = 0;
      this.airJumps = 1;
      this.fuel = 1;
      this.jumpCut = false;
      this.gliding = false;
      this.spinT = 0;
      const amt = U.clamp(impact / 2600, 0.05, 0.38);
      this.sy = 1 - amt;
      this.sx = 1 + amt * 0.8;
      if (this.state === 'pound') {
        this.state = 'idle';
        b.shockwave(this);
      } else b.emit('land', { f: this, impact });
    }

    // Take damage. Returns false if the hit was ignored (invulnerable, KO'd or round over).
    hit(dmg, o, b) {
      if (this.ko || this.result || this.invulnT > 0) return false;
      this.hp = Math.max(0, this.hp - dmg);
      this.hurtT = o.hurt != null ? o.hurt : 0.32;
      this.invulnT = o.invuln != null ? o.invuln : 0.85;
      this.stunT = Math.max(this.stunT, o.stun || 0);
      this.frozenT = o.freeze || 0;
      if (o.kx != null) this.vx = o.kx;
      if (o.ky != null) {
        this.vy = o.ky;
        this.onGround = false;
      }
      this.state = 'idle';
      this.charge = 0;
      this.gliding = false;
      this.queuedPound = false;
      this.dashT = 0;
      this.flash = 1;
      this.sx = 1.35;
      this.sy = 0.62;
      this.hitTimes = this.hitTimes.filter((t) => b.time - t < 3);
      this.hitTimes.push(b.time);
      if (this.hitTimes.length >= 3) this.setEmote('angry', this.hurtT + 1.2);
      if (this.hp <= 0) {
        this.ko = true;
        this.state = 'ko';
        this.frozenT = 0;
        this.stunT = 0;
        const dir = o.dir || -this.facing;
        this.vy = -760;
        this.vx = dir * 280;
        this.onGround = false;
        this.spinV = 10 * dir;
        b.emit('ko', { f: this });
      }
      return true;
    }

    animate(dt, opp) {
      // squash & stretch spring
      let tx = 1, ty = 1;
      if (!this.onGround && !this.ko && this.state !== 'pound') {
        const s = U.clamp(Math.abs(this.vy) / 3000, 0, 0.14);
        ty = 1 + s;
        tx = 1 - s * 0.7;
      }
      if (this.state === 'charge') {
        ty = 1 - 0.32 * this.charge;
        tx = 1 + 0.26 * this.charge;
      }
      if (this.state === 'dash') {
        tx = 1.25;
        ty = 0.82;
      }
      if (this.state === 'pound' && this.poundT <= 0) {
        tx = 0.85;
        ty = 1.2;
      }
      this.svx += ((tx - this.sx) * 380 - this.svx * 14) * dt;
      this.svy += ((ty - this.sy) * 380 - this.svy * 14) * dt;
      this.sx += this.svx * dt;
      this.sy += this.svy * dt;

      // rotation: flips on air jumps, spins when KO'd, small lean while running
      if (this.ko) this.rot += this.spinV * dt * (this.onGround ? 0.2 : 1);
      else if (this.spinT > 0) {
        this.spinT = Math.max(0, this.spinT - dt);
        this.rot = (1 - this.spinT / 0.4) * Math.PI * 2 * this.facing;
      } else {
        const lean = this.state === 'dash' ? this.dashDir * 0.25 : (this.vx / (this.st.speed + 1)) * 0.1;
        this.rot = U.lerp(this.rot % (Math.PI * 2), lean, Math.min(1, dt * 12));
      }

      // blinking
      this.blinkT -= dt;
      if (this.blinkT <= 0) {
        this.blink = 1;
        this.blinkT = U.rand(1.6, 4.2);
      }
      this.blink = Math.max(0, this.blink - dt * 8);
      this.opp = opp;
    }

    // Facial mood from the current situation.
    mood() {
      const opp = this.opp;
      if (this.ko) return 'ko';
      if (this.result === 'win') return 'win';
      if (this.result === 'lose') return 'lose';
      if (this.result === 'draw') return 'shock';
      if (this.frozenT > 0) return 'frozen';
      if (this.stunT > 0) return 'stun';
      if (this.hurtT > 0) return 'hurt';
      if (this.emoteT > 0 && this.emote) return this.emote;
      if (this.state === 'charge') return 'charge';
      if (this.state === 'pound' || this.state === 'dash') return 'attack';
      if (this.rage) return 'furious';
      if (opp && !opp.ko && !opp.onGround && opp.y < this.y - this.r && Math.abs(opp.x - this.x) < (this.r + opp.r) * 1.4 && opp.vy > -100) return 'fear';
      if (!this.onGround) {
        if (opp && this.vy > 0 && opp.y > this.y && Math.abs(opp.x - this.x) < 170) return 'attack';
        return 'jump';
      }
      if (this.hp / this.maxHp < 0.3) return 'worried';
      if (Math.abs(this.vx) > 60) return 'run';
      return 'idle';
    }

    lookDir() {
      const o = this.opp;
      if (!o) return { x: this.facing, y: 0 };
      return { x: U.clamp((o.x - this.x) / 160, -1, 1), y: U.clamp((o.y - this.y) / 160, -1, 1) };
    }
  }

  HF.Fighter = Fighter;
})();
