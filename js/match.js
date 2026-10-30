// The fight scene: rounds, timer, HUD, hit effects and the pause menu.
(function () {
  'use strict';
  const HF = window.HF;
  const U = HF.U;
  const W = HF.W, H = HF.H;
  const TAU = HF.TAU;
  const STEP = 1 / 120;
  const P_COLORS = ['#3a86ff', '#ff4d6d'];
  const SILENT = { play() {} };

  class MatchScene {
    // cfg: { mode: 'cpu' | '2p' | 'story' | 'demo', players: [{ id, ctrl: 'human' | 'ai', skill }],
    //        stage, rounds, time, boss, hp: [], armor: [], music, title, onEnd(result), onQuit() }
    constructor(cfg) {
      this.cfg = cfg;
      this.demo = cfg.mode === 'demo';
      this.stage = new HF.Stage(cfg.stage);
      this.battle = new HF.Battle({
        defs: cfg.players.map((p) => HF.FIGHTER[p.id]),
        boss: [false, !!cfg.boss],
        hp: cfg.hp || [],
        armor: cfg.armor || [],
      });
      this.ai = cfg.players.map((p, i) => (p.ctrl === 'ai' ? new HF.AI(this.battle.f[i], this.battle, p.skill) : null));
      this.solo = cfg.players.filter((p) => p.ctrl === 'human').length === 1;
      this.labels = cfg.players.map((p, i) => (p.ctrl === 'ai' ? 'CPU' : this.solo ? 'YOU' : 'P' + (i + 1)));
      this.fx = new HF.FX();
      this.wins = [0, 0];
      this.round = 0;
      this.need = Math.ceil((cfg.rounds || 1) / 2);
      this.t = 0;
      this.acc = 0;
      this.paused = false;
      this.ended = false;
      this.pauseMenu = new HF.UI.Menu(
        [
          { label: 'RESUME', action: () => (this.paused = false) },
          { label: 'RESTART', action: () => this.restart() },
          { label: cfg.mode === 'story' ? 'QUIT STORY' : 'QUIT TO MENU', action: () => this.quit() },
        ],
        { y: 270, gap: 54, size: 34, onBack: () => (this.paused = false) }
      );
      this.startRound();
    }

    enter() {
      if (!this.demo) HF.Music.play(this.cfg.music || this.stage.def.music);
    }

    // The app went to the background: pause so the fight doesn't carry on when it returns.
    suspend() {
      if (this.demo || this.ended || this.paused || (this.phase !== 'fight' && this.phase !== 'intro')) return;
      this.paused = true;
      this.pauseMenu.i = 0;
    }

    restart() {
      this.paused = false;
      this.wins = [0, 0];
      this.round = 0;
      this.ended = false;
      this.startRound();
      HF.Music.stop(0.05);
      HF.Music.play(this.cfg.music || this.stage.def.music);
    }

    quit() {
      this.paused = false;
      if (this.cfg.onQuit) this.cfg.onQuit();
      else HF.Game.go(new HF.TitleScene());
    }

    startRound() {
      this.round++;
      this.battle.reset();
      this.battle.active = false;
      this.fx.clear();
      this.timeLeft = this.cfg.time || 60;
      this.phase = 'intro';
      this.phaseT = 0;
      this.saidFight = false;
      this.sudden = false;
      this.timeScale = 1;
      this.hitstop = 0;
      this.trail = [1, 1];
      this.trailHold = [0, 0];
      this.lastRatio = [1, 1];
      this.roundWinner = null;
      const final = this.need > 1 && this.wins[0] === this.need - 1 && this.wins[1] === this.need - 1;
      const text = this.cfg.title || (final ? 'FINAL ROUND' : this.need > 1 ? 'ROUND ' + this.round : 'READY?');
      this.banner(text, { dur: 0.95, color: '#fff' });
      if (!this.demo) HF.Audio.play('round');
    }

    banner(text, o = {}) {
      this.ban = { text, t: 0, dur: o.dur || 1.2, color: o.color || '#ffe14d', size: o.size || 76, sub: o.sub };
    }

    inputFor(i) {
      if (this.ai[i]) return this.ai[i].update(STEP);
      return HF.Input.player(this.solo ? 0 : i, this.solo);
    }

    update(dt) {
      this.t += dt;
      if (!this.demo && !this.ended && HF.Input.pausePressed() && (this.phase === 'fight' || this.phase === 'intro')) {
        this.paused = !this.paused;
        this.pauseMenu.i = 0;
        HF.Audio.play('pause');
        return;
      }
      if (this.paused) {
        this.pauseMenu.update(dt);
        return;
      }
      if (this.ban) {
        this.ban.t += dt;
        if (this.ban.t > this.ban.dur) this.ban = null;
      }
      this.stage.update(dt);
      this.fx.update(dt * Math.max(this.timeScale, 0.5));
      if (this.hitstop > 0) {
        this.hitstop -= dt;
        return;
      }

      const live = this.phase === 'fight';
      this.acc += dt * this.timeScale;
      let steps = 0;
      while (this.acc >= STEP && steps < 12) {
        const inputs = live ? [this.inputFor(0), this.inputFor(1)] : [null, null];
        this.battle.step(STEP, inputs);
        this.acc -= STEP;
        steps++;
      }
      this.handleEvents();
      this.ambientFx();
      this.updateTrails(dt);
      this.updatePhase(dt);
    }

    updatePhase(dt) {
      const b = this.battle;
      this.phaseT += dt;
      switch (this.phase) {
        case 'intro':
          if (this.phaseT > 1.0 && !this.saidFight) {
            this.saidFight = true;
            this.banner('FIGHT!', { dur: 0.7, color: '#ff4d4d', size: 96 });
            if (!this.demo) HF.Audio.play('fight');
          }
          if (this.phaseT > 1.45) {
            this.phase = 'fight';
            this.phaseT = 0;
            b.active = true;
          }
          break;
        case 'fight': {
          const kos = b.f.filter((f) => f.ko);
          if (kos.length) {
            this.phase = 'ko';
            this.phaseT = 0;
            b.active = false;
            this.timeScale = 0.3;
            this.roundWinner = kos.length === 2 ? -1 : b.f[0].ko ? 1 : 0;
            this.banner('K.O.!', { dur: 1.6, color: '#ff4d4d', size: 120 });
            return;
          }
          if (this.sudden) {
            for (let i = 0; i < 2; i++) {
              if (b.f[i].hp < this.sdHp[i]) {
                this.endRound(1 - i, 'sudden');
                return;
              }
            }
          } else {
            const before = Math.ceil(this.timeLeft);
            this.timeLeft = Math.max(0, this.timeLeft - dt);
            const now = Math.ceil(this.timeLeft);
            if (now !== before && now <= 5 && now > 0 && !this.demo) HF.Audio.play('tick');
            if (this.timeLeft <= 0) {
              this.phase = 'timeup';
              this.phaseT = 0;
              b.active = false;
              this.banner('TIME!', { dur: 1.3, color: '#7bdff2', size: 100 });
              if (!this.demo) HF.Audio.play('timeup');
            }
          }
          break;
        }
        case 'ko':
          if (this.phaseT > 1.1) this.timeScale = 1;
          if (this.phaseT > 2.2) this.endRound(this.roundWinner, 'ko');
          break;
        case 'timeup':
          if (this.phaseT > 1.4) {
            const [a, c] = b.f;
            const ra = a.hp / a.maxHp, rc = c.hp / c.maxHp;
            if (Math.abs(ra - rc) < 1e-9) {
              // tie on health: next hit wins
              this.sudden = true;
              this.sdHp = [a.hp, c.hp];
              this.phase = 'fight';
              this.phaseT = 0;
              b.active = true;
              this.banner('SUDDEN DEATH!', { dur: 1.4, color: '#ff4d4d', size: 70, sub: 'next hit wins' });
            } else this.endRound(ra > rc ? 0 : 1, 'time');
          }
          break;
        case 'roundEnd':
          if (this.phaseT > 2.4) {
            if (this.matchWinner != null) {
              this.phase = 'over';
              this.phaseT = 0;
              this.ended = true;
              if (this.cfg.onEnd) this.cfg.onEnd(this.result());
            } else this.startRound();
          }
          break;
      }
    }

    endRound(w, how) {
      const b = this.battle;
      this.phase = 'roundEnd';
      this.phaseT = 0;
      this.timeScale = 1;
      b.active = false;
      this.matchWinner = null;
      if (w < 0) {
        for (const f of b.f) if (!f.ko) f.result = 'draw';
        this.banner('DRAW!', { dur: 2, color: '#fff' });
        return;
      }
      const win = b.f[w], lose = b.f[1 - w];
      win.result = 'win';
      if (!lose.ko) lose.result = 'lose';
      this.wins[w]++;
      if (this.wins[w] >= this.need) this.matchWinner = w;
      const perfect = win.hp >= win.maxHp;
      const name = this.labels[w] === 'YOU' ? 'YOU WIN!' : win.def.name + ' WINS';
      this.banner(name, { dur: 2.3, color: w === 0 ? '#8ecbff' : '#ff9eb0', size: name.length > 12 ? 58 : 72, sub: perfect ? 'PERFECT!' : how === 'time' ? 'on time' : how === 'sudden' ? 'sudden death' : null });
      if (!this.demo) HF.Audio.play('cheer');
      this.fx.confetti(perfect ? 90 : 40);
    }

    result() {
      const b = this.battle;
      return {
        winner: this.matchWinner,
        wins: this.wins.slice(),
        ids: b.f.map((f) => f.id),
        hp: b.f.map((f) => f.hp / f.maxHp),
        stomps: b.f.map((f) => f.stompCount),
      };
    }

    updateTrails(dt) {
      for (let i = 0; i < 2; i++) {
        const f = this.battle.f[i];
        const ratio = f.hp / f.maxHp;
        if (ratio < this.lastRatio[i]) this.trailHold[i] = 0.5;
        this.lastRatio[i] = ratio;
        if (this.trailHold[i] > 0) this.trailHold[i] -= dt;
        else this.trail[i] = U.approach(this.trail[i], ratio, dt * 0.6);
        if (this.trail[i] < ratio) this.trail[i] = ratio;
      }
    }

    ambientFx() {
      for (const f of this.battle.f) {
        if (f.state === 'dash' && Math.floor(this.t * 60) % 2 === 0) this.fx.afterimage(f);
        if (f.gliding && !this.demo) HF.Audio.play('flap', null, 0.12);
        if (f.state === 'charge' && Math.random() < 0.3) this.fx.puff(f.x, f.y - f.r * 0.6, 1, 'rgba(255,255,255,0.8)', 0.6);
        if (f.rage && Math.random() < 0.1) this.fx.puff(f.x + U.rand(-f.r, f.r), f.y - f.r, 1, 'rgba(255,255,255,0.7)', 0.8);
      }
      for (const p of this.battle.proj) {
        if (Math.random() < 0.5) {
          if (p.type === 'frost') this.fx.add({ kind: 'spark', x: p.x, y: p.y, vx: -p.vx * 0.1 + U.rand(-30, 30), vy: U.rand(-30, 30), r: 2, life: 0.3, color: '#e8fbff', drag: 2 });
          else this.fx.embers(p.x, p.y, 1);
        }
      }
    }

    handleEvents() {
      const fx = this.fx, A = this.demo ? SILENT : HF.Audio;
      for (const e of this.battle.events) {
        switch (e.type) {
          case 'jump':
            fx.dust(e.f.x, HF.GROUND, 5, 0.8);
            A.play('jump', 46 / e.f.r);
            break;
          case 'airjump':
            fx.ring(e.f.x, e.f.y + e.f.r, '#fff', 50, 0.35);
            fx.puff(e.f.x, e.f.y + e.f.r, 5);
            A.play('airjump');
            break;
          case 'land':
            if (e.impact > 250) {
              fx.dust(e.f.x, HF.GROUND, Math.min(10, Math.round(e.impact / 120)));
              A.play('land', Math.min(1, e.impact / 1400), 0.05);
            }
            break;
          case 'stomp':
            this.hitstop = e.vic.ko ? 0.12 : 0.075;
            fx.addShake(6 + e.dmg * 0.35 + (e.pound ? 8 : 0));
            fx.stars(e.x, e.y, 7);
            fx.word(e.x + U.rand(-30, 30), e.y - 55, e.word, { size: e.pound ? 40 : 34 });
            A.play('stomp', e.dmg / 12);
            if (e.shatter) {
              fx.shards(e.vic.x, e.vic.y, 16);
              A.play('shatter');
            }
            break;
          case 'clash':
            this.hitstop = 0.06;
            fx.sparks(e.x, e.y, 16);
            fx.word(e.x, e.y - 40, 'CLANG!', { color: '#7bdff2', size: 30 });
            fx.addShake(5);
            A.play('clash');
            break;
          case 'bump':
            A.play('bump', null, 0.12);
            break;
          case 'dash':
            A.play('dash');
            break;
          case 'dashHit':
            this.hitstop = 0.05;
            fx.stars(e.x, e.y, 5);
            fx.word(e.x, e.y - 60, 'ZOOM!', { color: '#ff5fa2', size: 30 });
            fx.addShake(6);
            A.play('hit');
            break;
          case 'poundStart':
            A.play('whistle');
            break;
          case 'shock':
            fx.ring(e.x, e.y, '#fff', e.R, 0.18);
            fx.ring(e.x, e.y, '#ffe14d', e.R * 0.7, 0.18);
            fx.dust(e.x, e.y, 14, 2);
            fx.addShake(12);
            A.play('boom');
            break;
          case 'shockHit':
            fx.word(e.x, e.y - 70, 'DIZZY!', { color: '#ffe14d', size: 26 });
            A.play('hit');
            break;
          case 'shoot':
            A.play(e.kind === 'frost' ? 'frost' : 'fireball');
            break;
          case 'freeze':
            fx.shards(e.x, e.y, 10);
            fx.word(e.x, e.y - 70, 'FREEZE!', { color: '#7bdff2', size: 30 });
            A.play('freeze');
            break;
          case 'burn':
            fx.embers(e.x, e.y, 14);
            fx.word(e.x, e.y - 70, 'TOASTY!', { color: '#ff8c42', size: 30 });
            fx.addShake(6);
            A.play('burn');
            break;
          case 'projGone':
            fx.puff(e.x, e.y, 5, e.kind === 'frost' ? 'rgba(220,245,255,0.9)' : 'rgba(255,170,90,0.9)', 0.7);
            break;
          case 'cancel':
            fx.puff(e.x, e.y, 10);
            fx.word(e.x, e.y - 40, 'FSSSH!', { size: 24, color: '#fff' });
            A.play('hiss');
            break;
          case 'charge':
            A.play('charge', e.level);
            break;
          case 'spring':
            fx.ring(e.f.x, HF.GROUND, '#fff', 70, 0.25);
            fx.dust(e.f.x, HF.GROUND, 8, 1.4);
            A.play('spring', e.power);
            break;
          case 'springBack':
            fx.word(e.x, e.y - 40, 'BOING!', { color: '#f2c14e', size: 30 });
            fx.stars(e.x, e.y, 3);
            A.play('spring', 0.4);
            break;
          case 'glide':
            A.play('flap', null, 0.1);
            break;
          case 'spikeWarn':
            A.play('warn');
            break;
          case 'spikesOn':
            fx.word(e.f.x, e.f.y - e.f.r - 60, 'SPIKES!', { color: '#cfd6e6', size: 28 });
            A.play('spikes');
            break;
          case 'spikesOff':
            fx.puff(e.f.x, e.f.y - e.f.r, 6);
            break;
          case 'spikeHurt':
            this.hitstop = 0.06;
            fx.word(e.x, e.y - 30, 'YOWCH!', { color: '#ff5fa2', size: 32 });
            fx.sparks(e.x, e.y, 10, '#fff');
            fx.addShake(8);
            A.play('ouch');
            break;
          case 'rage':
            fx.word(e.f.x, e.f.y - e.f.r - 60, 'RAAAGE!', { color: '#ff4d4d', size: 42, life: 1.4 });
            fx.addShake(14);
            A.play('rage');
            break;
          case 'ko':
            fx.stars(e.f.x, e.f.y, 12);
            fx.addShake(16);
            fx.flash = 1;
            A.play('ko');
            break;
        }
      }
      this.battle.events.length = 0;
    }

    // ---------------- drawing ----------------
    draw(ctx) {
      const [sx, sy] = this.fx.shakeOffset();
      ctx.save();
      ctx.translate(sx, sy);
      this.stage.drawBack(ctx);
      const fs = this.battle.f;
      for (const f of fs) {
        const h = HF.GROUND - (f.y + f.r);
        const s = U.clamp(1 - h / 420, 0.3, 1);
        ctx.fillStyle = 'rgba(20,10,30,0.28)';
        ctx.beginPath();
        ctx.ellipse(f.x, HF.GROUND + 3, f.r * 0.95 * s, f.r * 0.2 * s, 0, 0, TAU);
        ctx.fill();
      }
      for (const p of this.battle.proj) this.drawProj(ctx, p);
      const order = fs.slice().sort((a, b) => b.y - a.y);
      for (const f of order) this.drawFighter(ctx, f);
      this.fx.draw(ctx);
      this.stage.drawFront(ctx);
      this.fx.drawWords(ctx);
      ctx.restore();

      if (!this.demo) {
        this.drawHUD(ctx);
        this.drawBanner(ctx);
      }
      if (this.fx.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${this.fx.flash * 0.5})`;
        ctx.fillRect(0, 0, W, H);
      }
      if (this.paused) this.drawPause(ctx);
      HF.Input.drawTouchControls(ctx);
    }

    drawFighter(ctx, f) {
      const i = this.battle.f.indexOf(f);
      const blink = f.invulnT > 0 && !f.ko && f.state !== 'dash' && !f.result && Math.floor(this.t * 16) % 2 === 0;
      const y = f.onGround ? f.y + f.r * (1 - f.sy) : f.y;
      HF.drawHead(ctx, f.id, {
        x: f.x,
        y,
        r: f.r,
        facing: f.facing,
        sx: f.sx,
        sy: f.sy,
        rot: f.rot,
        expr: f.mood(),
        look: f.lookDir(),
        blink: f.blink,
        t: f.t,
        flash: f.flash,
        alpha: blink ? 0.45 : 1,
        spikes: f.helmet(),
        rage: f.rage ? 1 : 0,
        flap: f.gliding ? Math.sin(f.t * 40) : 0,
        charge: f.charge,
      });
      if (f.frozenT > 0) {
        const r = f.r * 1.22;
        ctx.save();
        ctx.globalAlpha = 0.5;
        U.roundRect(ctx, f.x - r, y - r, r * 2, r * 2, r * 0.35);
        ctx.fillStyle = '#bfefff';
        ctx.fill();
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#5bbbe8';
        ctx.stroke();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(f.x - r * 0.7, y - r * 0.3);
        ctx.lineTo(f.x - r * 0.3, y - r * 0.7);
        ctx.moveTo(f.x - r * 0.65, y + r * 0.05);
        ctx.lineTo(f.x - r * 0.45, y - r * 0.15);
        ctx.stroke();
        ctx.restore();
      }
      if (!this.demo && !f.ko && !f.result) {
        const my = f.y - f.r * (f.id === 'sensei' || f.id === 'kenji' ? 1.55 : 1.45) - 14 + Math.sin(this.t * 5) * 2;
        ctx.fillStyle = P_COLORS[i];
        ctx.beginPath();
        ctx.moveTo(f.x, my + 12);
        ctx.lineTo(f.x - 8, my);
        ctx.lineTo(f.x + 8, my);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = HF.OUTLINE;
        ctx.stroke();
        U.text(ctx, this.labels[i], f.x, my - 10, { size: 15, color: P_COLORS[i], lw: 4 });
      }
    }

    drawProj(ctx, p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.type === 'frost') {
        ctx.rotate(p.t * 8);
        ctx.fillStyle = 'rgba(190,240,255,0.45)';
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 1.4, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineCap = 'round';
        for (const [w, c] of [[7, '#2b8fd6'], [4, '#ffffff']]) {
          ctx.lineWidth = w;
          ctx.strokeStyle = c;
          for (let k = 0; k < 3; k++) {
            const a = (k * Math.PI) / 3;
            ctx.beginPath();
            ctx.moveTo(-Math.cos(a) * p.r, -Math.sin(a) * p.r);
            ctx.lineTo(Math.cos(a) * p.r, Math.sin(a) * p.r);
            ctx.stroke();
          }
        }
      } else {
        const fl = 1 + Math.sin(p.t * 40) * 0.08;
        const dir = U.sign(p.vx);
        for (let k = 3; k >= 1; k--) {
          ctx.fillStyle = ['', '#ffe66d', '#ff9f1c', '#ff5e3a'][k];
          ctx.beginPath();
          ctx.arc(-dir * k * 7, 0, p.r * (0.55 + 0.2 * (3 - k)) * fl * (k === 1 ? 1.1 : 1), 0, TAU);
          ctx.fill();
        }
        ctx.lineWidth = 3;
        ctx.strokeStyle = HF.OUTLINE;
        ctx.beginPath();
        ctx.arc(-dir * 7, 0, p.r * 0.95 * fl, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawHUD(ctx) {
      const b = this.battle;
      for (let i = 0; i < 2; i++) {
        const f = b.f[i];
        const L = i === 0;
        const px = L ? 52 : W - 52, py = 52;
        // portrait with live expression
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 38, 0, TAU);
        ctx.fillStyle = P_COLORS[i];
        ctx.fill();
        ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(px - 40, py - 40, 80, 40);
        HF.drawHead(ctx, f.id, {
          x: px,
          y: py + 10,
          r: 31,
          facing: L ? 1 : -1,
          expr: f.mood(),
          look: { x: L ? 0.8 : -0.8, y: 0 },
          blink: f.blink,
          t: f.t,
          spikes: f.helmet(),
          rage: f.rage ? 1 : 0,
          flap: f.gliding ? Math.sin(f.t * 40) : 0,
        });
        ctx.restore();
        ctx.lineWidth = 5;
        ctx.strokeStyle = HF.OUTLINE;
        ctx.beginPath();
        ctx.arc(px, py, 38, 0, TAU);
        ctx.stroke();
        U.text(ctx, this.labels[i], px, py + 42, { size: 15, color: '#fff', lw: 4 });

        // health bar (empties toward the centre)
        const bw = 320, bh = 24, bx = L ? 100 : W - 100 - bw, by = 26;
        const ratio = f.hp / f.maxHp;
        const bar = (x0, w, fill) => {
          ctx.beginPath();
          const sk = 10;
          if (L) {
            ctx.moveTo(x0, by);
            ctx.lineTo(x0 + w + sk, by);
            ctx.lineTo(x0 + w, by + bh);
            ctx.lineTo(x0, by + bh);
          } else {
            ctx.moveTo(x0 - sk, by);
            ctx.lineTo(x0 + w, by);
            ctx.lineTo(x0 + w, by + bh);
            ctx.lineTo(x0, by + bh);
          }
          ctx.closePath();
          ctx.fillStyle = fill;
          ctx.fill();
        };
        bar(bx, bw, '#2a2238');
        const tw = bw * this.trail[i], hw = bw * ratio;
        if (tw > 0) bar(L ? bx : bx + bw - tw, tw, '#fff3f3');
        if (hw > 0) {
          let col = ratio > 0.5 ? '#ffd23f' : ratio > 0.25 ? '#ff9f1c' : Math.floor(this.t * 6) % 2 ? '#ff4d4d' : '#ff7a7a';
          bar(L ? bx : bx + bw - hw, hw, col);
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fillRect(L ? bx : bx + bw - hw, by + 3, hw, 5);
        }
        ctx.lineWidth = 4;
        ctx.strokeStyle = HF.OUTLINE;
        ctx.beginPath();
        if (L) {
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + bw + 10, by);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx, by + bh);
        } else {
          ctx.moveTo(bx - 10, by);
          ctx.lineTo(bx + bw, by);
          ctx.lineTo(bx + bw, by + bh);
          ctx.lineTo(bx, by + bh);
        }
        ctx.closePath();
        ctx.stroke();
        U.text(ctx, f.def.name, L ? bx + 2 : bx + bw - 2, by + bh + 17, { size: 21, align: L ? 'left' : 'right' });

        // ability meter
        const m = f.meter();
        const mw = 92, mx = L ? bx + 2 : bx + bw - 2 - mw, my = by + bh + 34;
        U.roundRect(ctx, mx, my, mw, 9, 4);
        ctx.fillStyle = '#2a2238';
        ctx.fill();
        if (m > 0) {
          U.roundRect(ctx, L ? mx : mx + mw - mw * m, my, mw * m, 9, 4);
          ctx.fillStyle = m >= 1 ? f.def.color : '#8f86a8';
          ctx.fill();
        }
        U.roundRect(ctx, mx, my, mw, 9, 4);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = HF.OUTLINE;
        ctx.stroke();
        U.text(ctx, f.def.abilityName.toUpperCase(), L ? mx + mw + 8 : mx - 8, my + 5, { size: 13, display: false, weight: 700, align: L ? 'left' : 'right', lw: 3, color: m >= 1 ? '#fff' : '#bdb5d6' });

        // round wins
        for (let k = 0; k < this.need && this.need > 1; k++) {
          const cx = L ? bx + bw - 14 - k * 24 : bx + 14 + k * 24, cy = by + bh + 16;
          ctx.beginPath();
          ctx.arc(cx, cy, 8, 0, TAU);
          ctx.fillStyle = this.wins[i] > k ? '#ffe14d' : '#2a2238';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = HF.OUTLINE;
          ctx.stroke();
        }
      }
      // timer
      ctx.beginPath();
      ctx.arc(W / 2, 44, 34, 0, TAU);
      ctx.fillStyle = '#1d1830';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffd23f';
      ctx.stroke();
      const tl = this.sudden ? '!!' : String(Math.ceil(this.timeLeft));
      U.text(ctx, tl, W / 2, 48, { size: 38, color: this.sudden || this.timeLeft <= 10 ? '#ff4d4d' : '#fff' });

      if (this.round === 1 && (this.phase === 'intro' || (this.phase === 'fight' && this.phaseT < 4))) {
        const a = this.phase === 'fight' ? U.clamp(4 - this.phaseT, 0, 1) : 1;
        ctx.globalAlpha = a;
        const lines = HF.Input.touch.enabled && this.solo
          ? ['HOLD ◀ ▶ TO MOVE   TAP JUMP AND SPECIAL']
          : this.solo
            ? ['MOVE  A D / ← →      JUMP  W / ↑ / SPACE      SPECIAL  S / ↓']
            : ['P1:  A D move   W jump   S special', 'P2:  ← → move   ↑ jump   ↓ special'];
        lines.forEach((s, k) => U.text(ctx, s, W / 2, H - 46 + k * 24 - (lines.length - 1) * 12, { size: 18, display: false, weight: 700, lw: 5 }));
        ctx.globalAlpha = 1;
      }
    }

    drawBanner(ctx) {
      const bn = this.ban;
      if (!bn) return;
      const k = bn.t / bn.dur;
      const pop = k < 0.15 ? U.easeOutBack(k / 0.15) : 1;
      const fade = k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1;
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.translate(W / 2, H * 0.42);
      ctx.scale(pop, pop);
      ctx.rotate(-0.04);
      ctx.fillStyle = 'rgba(20,10,30,0.55)';
      ctx.fillRect(-W, -bn.size * 0.62, W * 2, bn.size * (bn.sub ? 1.6 : 1.24));
      U.text(ctx, bn.text, 0, 0, { size: bn.size, color: bn.color, lw: bn.size * 0.2 });
      if (bn.sub) U.text(ctx, bn.sub.toUpperCase(), 0, bn.size * 0.72, { size: bn.size * 0.36, color: '#fff' });
      ctx.restore();
    }

    drawPause(ctx) {
      ctx.fillStyle = 'rgba(15,8,28,0.7)';
      ctx.fillRect(0, 0, W, H);
      U.text(ctx, 'PAUSED', W / 2, 170, { size: 72, color: '#ffe14d' });
      this.pauseMenu.draw(ctx);
      U.text(ctx, HF.Input.touch.enabled ? 'TAP RESUME OR PRESS BACK' : 'ESC / P to resume', W / 2, 470, { size: 18, display: false, color: '#d8d0f0', lw: 4 });
    }
  }

  HF.MatchScene = MatchScene;
})();
