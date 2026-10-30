// Menu screens: title, fighter select, results, options and how-to-play.
(function () {
  'use strict';
  const HF = window.HF;
  const U = HF.U;
  const W = HF.W, H = HF.H;
  const P_COLORS = ['#3a86ff', '#ff4d6d'];

  // ======================= TITLE =======================
  class TitleScene {
    constructor() {
      this.t = 0;
      this.ready = !!HF.Audio.ctx;
      this.menu = new HF.UI.Menu(
        [
          { label: 'STORY MODE', action: () => HF.Game.go(new HF.StoryScene()), hint: 'Help Kenji save the hats of the land!' },
          { label: 'VS CPU', action: () => HF.Game.go(new SelectScene({ mode: 'cpu' })), hint: 'You against the computer: easy, normal or hard' },
          { label: 'VS PLAYER 2', action: () => HF.Game.go(new SelectScene({ mode: '2p' })), hint: HF.Input.touch.enabled ? 'Two players on one screen, or two gamepads' : 'Two players on one keyboard (or two gamepads)' },
          { label: 'HOW TO PLAY', action: () => HF.Game.go(new HowToScene()) },
          { label: 'OPTIONS', action: () => HF.Game.go(new OptionsScene()) },
        ],
        { y: 290, gap: 42, size: 30, hintY: 492 }
      );
      this.newDemo();
    }

    newDemo() {
      const pool = HF.FIGHTERS.filter(HF.fighterUnlocked).map((f) => f.id);
      U.shuffle(pool);
      this.demoEnd = 0;
      this.demo = new HF.MatchScene({
        mode: 'demo',
        players: [
          { id: pool[0], ctrl: 'ai', skill: U.rand(0.45, 0.9) },
          { id: pool[1], ctrl: 'ai', skill: U.rand(0.45, 0.9) },
        ],
        stage: U.pick(HF.STAGES).id,
        rounds: 1,
        time: 99,
        onEnd: () => (this.demoEnd = 1.5),
      });
    }

    enter() {
      if (this.ready) HF.Music.play('title');
    }

    update(dt) {
      this.t += dt;
      this.demo.update(dt);
      if (this.demoEnd > 0) {
        this.demoEnd -= dt;
        if (this.demoEnd <= 0) this.newDemo();
      }
      if (!this.ready) {
        if (HF.Input.anyHit) {
          HF.Audio.init();
          this.ready = true;
          HF.Music.play('title');
          HF.Audio.play('select');
        }
        return;
      }
      this.menu.update(dt);
    }

    draw(ctx) {
      this.demo.draw(ctx);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, 'rgba(20,10,40,0.75)');
      g.addColorStop(0.45, 'rgba(20,10,40,0.35)');
      g.addColorStop(1, 'rgba(20,10,40,0.7)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      HF.UI.logo(ctx, W / 2, 130, 118, this.t);
      U.text(ctx, '~ THE WAY OF THE NOGGIN ~', W / 2, 212, { size: 24, color: '#ffd6f0', lw: 5 });
      if (!this.ready) {
        if (Math.floor(this.t * 2) % 2 === 0) U.text(ctx, HF.Input.touch.enabled ? 'TAP TO START' : 'PRESS ANY KEY', W / 2, 360, { size: 40, color: '#fff' });
        U.text(ctx, 'sound on for the full experience', W / 2, 410, { size: 18, display: false, color: '#d8d0f0', lw: 4 });
      } else {
        this.menu.draw(ctx);
      }
      U.text(ctx, 'A reincarnation of the lost Flash classic', W / 2, H - 14, { size: 13, display: false, color: '#bfb3e0', lw: 3 });
    }
  }

  // ======================= FIGHTER SELECT =======================
  const COLS = 4;
  const CARD = 66;

  function cardPos(k) {
    const col = k % COLS, row = Math.floor(k / COLS);
    return { x: W / 2 + (col - (COLS - 1) / 2) * (CARD + 8), y: 128 + row * (CARD + 12) };
  }

  class SelectScene {
    // o: { mode: 'cpu' | '2p', keep?: previous picks }
    constructor(o) {
      this.mode = o.mode;
      this.t = 0;
      this.roster = HF.FIGHTERS;
      this.n = this.roster.length + 1; // last card is RANDOM
      this.cur = o.keep ? o.keep.cur.slice() : [0, 1];
      this.picked = [null, null];
      this.phase = 'pick';
      this.diff = HF.store.get('difficulty', 'normal');
      this.stageIdx = -1; // -1 = random
      this.sideT = [0, 0];
      this.lastCur = this.cur.slice();
    }

    enter() {
      HF.Music.play('select');
    }

    available(k) {
      return k === this.n - 1 || HF.fighterUnlocked(this.roster[k]);
    }

    resolvePick(k) {
      if (k < this.n - 1) return this.roster[k].id;
      const pool = this.roster.filter(HF.fighterUnlocked);
      return U.pick(pool).id;
    }

    moveCursor(p, inp) {
      let c = this.cur[p];
      const step = (d) => {
        for (let i = 0; i < this.n; i++) {
          c = (c + d + this.n) % this.n;
          if (this.available(c)) break;
        }
      };
      if (inp.left) step(-1);
      if (inp.right) step(1);
      if (inp.up && c - COLS >= 0 && this.available(c - COLS)) c -= COLS;
      if (inp.down && c + COLS < this.n && this.available(c + COLS)) c += COLS;
      if (c !== this.cur[p]) {
        this.cur[p] = c;
        this.sideT[p] = 0;
        HF.Audio.play('move');
      }
    }

    // Which player's cursor the shared controls drive right now.
    chooser() {
      if (this.mode === '2p') return null;
      return this.picked[0] == null ? 0 : 1;
    }

    update(dt) {
      this.t += dt;
      this.sideT[0] += dt;
      this.sideT[1] += dt;
      const m = HF.Input.mouse;
      if (this.phase === 'pick') {
        if (this.mode === '2p') {
          for (let p = 0; p < 2; p++) {
            const inp = HF.Input.menu(p);
            if (this.picked[p] == null) {
              this.moveCursor(p, inp);
              if (inp.ok) this.pick(p);
            } else if (inp.back) this.unpick(p);
          }
          if (HF.Input.hits.has('Escape')) {
            if (this.picked[1] != null) this.unpick(1);
            else if (this.picked[0] != null) this.unpick(0);
            else this.leave();
          }
        } else {
          const p = this.chooser();
          const inp = HF.Input.menu();
          this.moveCursor(p, inp);
          if (inp.ok) this.pick(p);
          if (inp.back) {
            if (this.picked[0] != null) this.unpick(0);
            else this.leave();
          }
        }
        // mouse drives player 1 (or the CPU cursor once player 1 has picked)
        const mp = this.mode === '2p' ? (this.picked[0] == null ? 0 : this.picked[1] == null ? 1 : null) : this.chooser();
        if (mp != null && (m.moved || m.clicked)) {
          for (let k = 0; k < this.n; k++) {
            const c = cardPos(k);
            if (!this.available(k) || Math.abs(m.x - c.x) > CARD / 2 || Math.abs(m.y - c.y) > CARD / 2) continue;
            if (this.cur[mp] !== k) {
              this.cur[mp] = k;
              this.sideT[mp] = 0;
              HF.Audio.play('move');
            }
            if (m.clicked) this.pick(mp);
          }
        }
        if (this.picked[0] != null && this.picked[1] != null) {
          this.phase = this.mode === 'cpu' ? 'difficulty' : 'stage';
        }
        return;
      }
      const inp = HF.Input.menu();
      if (this.phase === 'difficulty') {
        const opts = ['easy', 'normal', 'hard'];
        let i = opts.indexOf(this.diff);
        if (inp.left) i = Math.max(0, i - 1);
        if (inp.right) i = Math.min(2, i + 1);
        if (m.moved || m.clicked) {
          for (let k = 0; k < 3; k++) {
            if (HF.UI.inRect(m, { x: W / 2 - 100 + k * 100 - 46, y: 330, w: 92, h: 44 })) {
              i = k;
              if (m.clicked) inp.ok = true;
            }
          }
        }
        if (opts[i] !== this.diff) {
          this.diff = opts[i];
          HF.Audio.play('move');
        }
        if (inp.ok) {
          HF.store.set('difficulty', this.diff);
          HF.Audio.play('select');
          this.phase = 'stage';
        }
        if (inp.back) {
          HF.Audio.play('back');
          this.unpick(1);
          this.phase = 'pick';
        }
        return;
      }
      if (this.phase === 'stage') {
        const n = HF.STAGES.length;
        let s = this.stageIdx;
        if (inp.left) s = s <= -1 ? n - 1 : s - 1;
        if (inp.right) s = s >= n - 1 ? -1 : s + 1;
        if (m.clicked) {
          if (m.x < W / 2 - 150 && m.y > 300) s = s <= -1 ? n - 1 : s - 1;
          else if (m.x > W / 2 + 150 && m.y > 300) s = s >= n - 1 ? -1 : s + 1;
          else if (m.y > 300) inp.ok = true;
        }
        if (s !== this.stageIdx) {
          this.stageIdx = s;
          HF.Audio.play('move');
        }
        if (inp.ok) {
          HF.Audio.play('select');
          this.start();
        }
        if (inp.back) {
          HF.Audio.play('back');
          if (this.mode === 'cpu') this.phase = 'difficulty';
          else {
            this.unpick(1);
            this.phase = 'pick';
          }
        }
      }
    }

    pick(p) {
      if (!this.available(this.cur[p])) return;
      this.picked[p] = this.resolvePick(this.cur[p]);
      this.sideT[p] = 0;
      HF.Audio.play('select');
      if (this.mode === 'cpu' && p === 0 && this.cur[1] === this.cur[0]) this.cur[1] = (this.cur[0] + 1) % (this.n - 1);
    }

    unpick(p) {
      if (this.picked[p] == null) return;
      this.picked[p] = null;
      HF.Audio.play('back');
    }

    leave() {
      HF.Audio.play('back');
      HF.Game.go(new TitleScene());
    }

    start() {
      const stage = this.stageIdx < 0 ? U.pick(HF.STAGES).id : HF.STAGES[this.stageIdx].id;
      const players = [
        { id: this.picked[0], ctrl: 'human' },
        { id: this.picked[1], ctrl: this.mode === 'cpu' ? 'ai' : 'human', skill: HF.AI_LEVELS[this.diff] },
      ];
      const keep = { cur: this.cur.slice() };
      const mode = this.mode;
      const launch = () =>
        HF.Game.go(
          new HF.MatchScene({
            mode,
            players,
            stage,
            rounds: HF.settings.rounds,
            time: HF.settings.time,
            onEnd: (res) => HF.Game.go(new ResultsScene({ res, mode, players, rematch: launch, keep })),
          })
        );
      launch();
    }

    // ------- drawing -------
    draw(ctx) {
      HF.UI.backdrop(ctx, this.t);
      U.text(ctx, 'CHOOSE YOUR NOGGIN!', W / 2, 52, { size: 40, color: '#ffe14d' });
      for (let k = 0; k < this.n; k++) this.drawCard(ctx, k);
      this.drawSide(ctx, 0);
      this.drawSide(ctx, 1);

      if (this.phase === 'pick') {
        U.text(ctx, 'VS', W / 2, 282, { size: 44, color: '#ff4d6d' });
        const lines = HF.Input.touch.enabled
          ? [this.mode === '2p' ? (this.picked[0] == null ? 'Player 1, pick your fighter' : 'Player 2, pick your fighter') : this.picked[0] == null ? 'Pick your fighter' : 'Now pick your opponent', 'TAP A FIGHTER TO PICK']
          : this.mode === '2p'
            ? ['P1:  WASD  +  SPACE to pick', 'P2:  ARROWS  +  ENTER to pick']
            : [this.picked[0] == null ? 'Pick your fighter' : 'Now pick your opponent', 'ARROWS / WASD  +  ENTER'];
        lines.forEach((s, i) => U.text(ctx, s, W / 2, 345 + i * 28, { size: 19, display: false, weight: 700, lw: 5, color: i === 0 && (this.mode !== '2p' || HF.Input.touch.enabled) ? '#ffe14d' : '#fff' }));
        U.text(ctx, HF.Input.touch.enabled ? 'BACK to go back' : 'ESC to go back', W / 2, 505, { size: 15, display: false, color: '#cfc6ea', lw: 4 });
      } else if (this.phase === 'difficulty') {
        U.text(ctx, 'CPU DIFFICULTY', W / 2, 305, { size: 28 });
        ['easy', 'normal', 'hard'].forEach((d, k) => {
          const x = W / 2 - 100 + k * 100, sel = d === this.diff;
          HF.UI.panel(ctx, x - 46, 330, 92, 44, { r: 12, fill: sel ? ['#4caf50', '#ff9f1c', '#e63946'][k] : 'rgba(40,28,70,0.9)', lw: sel ? 4 : 3 });
          U.text(ctx, d.toUpperCase(), x, 353, { size: 20, color: sel ? '#fff' : '#bdb5d6' });
        });
        const blurb = { easy: 'Slow and sleepy. Great for learning.', normal: 'A fair fight.', hard: 'Fast reflexes. Dodges and counters.' }[this.diff];
        U.text(ctx, blurb, W / 2, 400, { size: 17, display: false, weight: 600, lw: 4 });
        U.text(ctx, HF.Input.touch.enabled ? 'TAP A DIFFICULTY' : '← →  then ENTER', W / 2, 505, { size: 15, display: false, color: '#cfc6ea', lw: 4 });
      } else if (this.phase === 'stage') {
        const def = this.stageIdx < 0 ? null : HF.STAGES[this.stageIdx];
        U.text(ctx, 'STAGE', W / 2, 300, { size: 26 });
        if (def) HF.Stage.thumb(ctx, def, W / 2 - 128, 320, 256, 144);
        else {
          HF.UI.panel(ctx, W / 2 - 128, 320, 256, 144, { r: 10 });
          U.text(ctx, '?', W / 2, 392, { size: 80, color: '#ffe14d' });
        }
        U.text(ctx, def ? def.name.toUpperCase() : 'RANDOM', W / 2, 486, { size: 24, color: '#ffe14d' });
        const bob = Math.sin(this.t * 6) * 3;
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(W / 2 + s * (150 + bob), 392);
          ctx.lineTo(W / 2 + s * (138 + bob), 378);
          ctx.lineTo(W / 2 + s * (138 + bob), 406);
          ctx.closePath();
          ctx.fillStyle = '#ffe14d';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = HF.OUTLINE;
          ctx.stroke();
        }
        U.text(ctx, HF.Input.touch.enabled ? 'TAP STAGE TO FIGHT!' : 'ENTER to fight!', W / 2, 518, { size: 15, display: false, color: '#cfc6ea', lw: 4 });
      }
    }

    drawCard(ctx, k) {
      const c = cardPos(k);
      const isRandom = k === this.n - 1;
      const f = this.roster[k];
      const open = this.available(k);
      const x = c.x - CARD / 2, y = c.y - CARD / 2;
      U.roundRect(ctx, x, y, CARD, CARD, 12);
      ctx.fillStyle = open ? (isRandom ? '#5b4a8a' : f.color) : '#2a2238';
      ctx.fill();
      ctx.save();
      U.roundRect(ctx, x, y, CARD, CARD, 12);
      ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(x, y, CARD, CARD / 2);
      if (isRandom) U.text(ctx, '?', c.x, c.y + 3, { size: 46, color: '#ffe14d' });
      else if (open) {
        const hover = this.cur[0] === k || this.cur[1] === k;
        const r = 24 * Math.sqrt(46 / f.stats.radius);
        HF.drawHead(ctx, f.id, { x: c.x, y: c.y + 8, r, facing: 1, expr: hover ? 'happy' : 'idle', t: this.t + k });
      } else {
        HF.drawHead(ctx, f.id, { x: c.x, y: c.y + 8, r: 22, facing: 1, expr: 'smug', t: this.t, alpha: 0.25 });
        U.text(ctx, '?', c.x, c.y + 4, { size: 40, color: '#8a83a0' });
      }
      ctx.restore();
      U.roundRect(ctx, x, y, CARD, CARD, 12);
      ctx.lineWidth = 4;
      ctx.strokeStyle = HF.OUTLINE;
      ctx.stroke();
      // cursors
      for (let p = 0; p < 2; p++) {
        if (this.cur[p] !== k) continue;
        if (this.mode === 'cpu' && p === 1 && this.picked[0] == null) continue;
        const both = this.cur[0] === this.cur[1] && !(this.mode === 'cpu' && this.picked[0] == null);
        const pad = both && p === 1 ? 9 : 4;
        U.roundRect(ctx, x - pad, y - pad, CARD + pad * 2, CARD + pad * 2, 14);
        ctx.lineWidth = this.picked[p] ? 6 : 4 + Math.abs(Math.sin(this.t * 6)) * 2;
        ctx.strokeStyle = P_COLORS[p];
        ctx.stroke();
        const tag = this.mode === 'cpu' ? (p === 0 ? 'YOU' : 'CPU') : 'P' + (p + 1);
        U.text(ctx, tag, p === 0 ? x + 4 : x + CARD - 4, y - 6, { size: 14, color: P_COLORS[p], align: p === 0 ? 'left' : 'right', lw: 4 });
      }
    }

    drawSide(ctx, p) {
      const L = p === 0;
      const cx = L ? 165 : W - 165;
      const showing = this.mode === 'cpu' && p === 1 && this.picked[0] == null ? null : this.cur[p];
      const panelX = L ? 18 : W - 18 - 300;
      HF.UI.panel(ctx, panelX, 84, 300, 436, { fill: 'rgba(30,20,55,0.8)', stroke: HF.OUTLINE });
      const label = this.mode === 'cpu' ? (L ? 'YOU' : 'CPU') : L ? 'PLAYER 1' : 'PLAYER 2';
      U.text(ctx, label, cx, 104, { size: 20, color: P_COLORS[p] });
      if (showing == null) {
        U.text(ctx, '?', cx, 230, { size: 120, color: 'rgba(255,255,255,0.25)', stroke: false });
        return;
      }
      if (showing === this.n - 1) {
        U.text(ctx, '?', cx, 220, { size: 140, color: '#ffe14d' });
        U.text(ctx, 'RANDOM', cx, 330, { size: 32 });
        U.text(ctx, 'Feeling lucky?', cx, 362, { size: 18, display: false, weight: 600, lw: 4 });
        return;
      }
      const f = this.roster[showing];
      const picked = this.picked[p] === f.id;
      const k = Math.min(1, this.sideT[p] * 5);
      const r = 74 * Math.sqrt(f.stats.radius / 46) * (0.85 + 0.15 * U.easeOutBack(k));
      const expr = picked ? (this.sideT[p] < 1.2 ? 'gloat' : 'smug') : this.sideT[p] < 0.4 ? 'jump' : 'idle';
      HF.drawHead(ctx, f.id, {
        x: cx,
        y: 212 + Math.sin(this.t * 3 + p) * 4,
        r,
        facing: L ? 1 : -1,
        expr,
        look: { x: L ? 0.6 : -0.6, y: 0 },
        blink: (this.t * 0.7 + p * 0.37) % 3 < 0.1 ? 1 : 0,
        t: this.t,
      });
      U.text(ctx, f.name, cx, 318, { size: f.name.length > 10 ? 24 : 32, color: '#fff' });
      U.text(ctx, f.title, cx, 344, { size: 16, display: false, weight: 700, color: f.color, lw: 4 });
      const stats = [['POWER', f.rating.power], ['SPEED', f.rating.speed], ['JUMP', f.rating.jump], ['HEALTH', f.rating.health]];
      stats.forEach(([name, v], i) => {
        const y = 368 + i * 19;
        U.text(ctx, name, panelX + 30, y, { size: 13, display: false, weight: 700, align: 'left', lw: 3 });
        for (let s = 0; s < 5; s++) {
          U.roundRect(ctx, panelX + 110 + s * 30, y - 6, 26, 12, 4);
          ctx.fillStyle = s < v ? f.color : '#2a2238';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = HF.OUTLINE;
          ctx.stroke();
        }
      });
      U.text(ctx, '★ ' + f.abilityName.toUpperCase(), cx, 450, { size: 18, color: '#ffe14d' });
      ctx.font = U.font(14, false, 600);
      const lines = U.wrap(ctx, f.abilityDesc, 260);
      lines.forEach((s, i) => U.text(ctx, s, cx, 472 + i * 17, { size: 14, display: false, weight: 600, lw: 3, color: '#e8e2ff' }));
      if (picked) {
        ctx.save();
        ctx.translate(cx, 150);
        ctx.rotate(-0.12);
        U.text(ctx, 'READY!', 0, 0, { size: 30, color: '#7bd389' });
        ctx.restore();
      }
    }
  }

  // ======================= RESULTS =======================
  class ResultsScene {
    constructor(o) {
      this.o = o;
      this.t = 0;
      this.fx = new HF.FX();
      const res = o.res;
      this.w = res.winner;
      this.ids = res.ids;
      const human = o.players.map((p) => p.ctrl === 'human');
      this.playerWon = human[this.w];
      this.solo = human.filter(Boolean).length === 1;
      this.quote = U.pick(HF.FIGHTER[this.ids[this.w]].quotes);
      this.fx.confetti(this.playerWon || !this.solo ? 120 : 20);
      this.menu = new HF.UI.Menu(
        [
          { label: 'REMATCH', action: () => o.rematch() },
          { label: 'CHANGE FIGHTERS', action: () => HF.Game.go(new SelectScene({ mode: o.mode, keep: o.keep })) },
          { label: 'MAIN MENU', action: () => HF.Game.go(new TitleScene()) },
        ],
        { y: 430, gap: 38, size: 26 }
      );
    }

    enter() {
      HF.Music.stop(0.05);
      HF.Music.play(this.playerWon || !this.solo ? 'victory' : 'defeat');
    }

    update(dt) {
      this.t += dt;
      this.fx.update(dt);
      if (Math.random() < dt * 0.6) this.fx.confetti(this.playerWon || !this.solo ? 10 : 0);
      this.menu.update(dt);
    }

    draw(ctx) {
      HF.UI.backdrop(ctx, this.t, this.playerWon || !this.solo ? '#3b2667' : '#2a2440', this.playerWon || !this.solo ? '#4a3180' : '#333050');
      const wid = this.ids[this.w], lid = this.ids[1 - this.w];
      const wdef = HF.FIGHTER[wid];
      let title;
      if (this.solo) title = this.playerWon ? 'YOU WIN!' : 'YOU LOSE...';
      else title = 'PLAYER ' + (this.w + 1) + ' WINS!';
      U.text(ctx, title, W / 2, 62, { size: 64, color: this.playerWon || !this.solo ? '#ffe14d' : '#9aa0c8' });
      U.text(ctx, this.o.res.wins.join(' – '), W / 2, 112, { size: 26, color: '#fff' });
      // winner
      const bob = Math.abs(Math.sin(this.t * 4)) * 14;
      HF.drawHead(ctx, wid, { x: 300, y: 270 - bob, r: 92 * Math.sqrt(wdef.stats.radius / 46), facing: 1, expr: this.t % 4 < 3 ? 'win' : 'wink', t: this.t, look: { x: 0.5, y: 0 } });
      U.text(ctx, wdef.name, 300, 392, { size: 30, color: wdef.color });
      // loser
      HF.drawHead(ctx, lid, { x: 690, y: 300, r: 58 * Math.sqrt(HF.FIGHTER[lid].stats.radius / 46), facing: -1, expr: 'cry', t: this.t, rot: 0.15 });
      // speech bubble
      ctx.font = U.font(19, false, 700);
      const lines = U.wrap(ctx, '“' + this.quote + '”', 250);
      const bx = 430, by = 150, bw = 290, bh = 30 + lines.length * 24;
      U.roundRect(ctx, bx, by, bw, bh, 18);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = HF.OUTLINE;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx + 30, by + bh - 2);
      ctx.lineTo(bx - 20, by + bh + 34);
      ctx.lineTo(bx + 60, by + bh - 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(bx + 32, by + bh - 6, 26, 6);
      lines.forEach((s, i) => U.text(ctx, s, bx + bw / 2, by + 27 + i * 24, { size: 19, display: false, weight: 700, color: HF.OUTLINE, stroke: false }));
      this.fx.draw(ctx);
      this.menu.draw(ctx);
    }
  }

  // ======================= OPTIONS =======================
  class OptionsScene {
    constructor() {
      this.t = 0;
      const S = HF.settings;
      const save = () => {
        HF.saveSettings();
        HF.Audio.applyVolumes();
      };
      const vol = (key) => ({
        value: () => Math.round(S[key] * 100) + '%',
        left: () => {
          S[key] = Math.max(0, Math.round((S[key] - 0.1) * 10) / 10);
          save();
        },
        right: () => {
          S[key] = Math.min(1, Math.round((S[key] + 0.1) * 10) / 10);
          save();
        },
      });
      const times = [30, 45, 60, 90, 99];
      const rounds = [1, 3, 5];
      const cycle = (key, list) => ({
        left: () => {
          S[key] = list[Math.max(0, list.indexOf(S[key]) - 1)] || list[0];
          save();
        },
        right: () => {
          const i = list.indexOf(S[key]);
          S[key] = list[Math.min(list.length - 1, i + 1)];
          save();
        },
      });
      this.menu = new HF.UI.Menu(
        [
          Object.assign({ label: 'MUSIC' }, vol('music')),
          Object.assign({ label: 'SOUND FX' }, vol('sfx')),
          Object.assign({ label: 'ROUND TIME', value: () => S.time + ' SEC' }, cycle('time', times)),
          Object.assign({ label: 'ROUNDS', value: () => (S.rounds === 1 ? 'SINGLE' : 'BEST OF ' + S.rounds) }, cycle('rounds', rounds)),
          { label: 'FULLSCREEN', value: () => (document.fullscreenElement ? 'ON' : 'OFF'), left: () => toggleFull(), right: () => toggleFull(), action: () => toggleFull() },
          { label: 'BACK', action: () => HF.Game.go(new TitleScene()) },
        ],
        { y: 170, gap: 54, size: 32, width: 560, row: true, onBack: () => HF.Game.go(new TitleScene()) }
      );
    }

    enter() {
      HF.Music.play('select');
    }

    update(dt) {
      this.t += dt;
      const before = HF.settings.sfx;
      this.menu.update(dt);
      if (HF.settings.sfx !== before) HF.Audio.play('stomp', 1);
    }

    draw(ctx) {
      HF.UI.backdrop(ctx, this.t);
      U.text(ctx, 'OPTIONS', W / 2, 80, { size: 56, color: '#ffe14d' });
      HF.UI.panel(ctx, W / 2 - 310, 130, 620, 340);
      this.menu.draw(ctx);
      U.text(ctx, HF.Input.touch.enabled ? 'TAP AN ITEM TO CHANGE    BACK TO RETURN' : '↑ ↓ choose    ← → change    ESC back', W / 2, 505, { size: 16, display: false, color: '#cfc6ea', lw: 4 });
    }
  }

  function toggleFull() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } catch (e) {
      /* fullscreen not allowed here */
    }
  }

  // ======================= HOW TO PLAY =======================
  class HowToScene {
    constructor() {
      this.t = 0;
    }
    enter() {
      HF.Music.play('select');
    }
    update(dt) {
      this.t += dt;
      const inp = HF.Input.menu();
      if (inp.back || inp.ok || HF.Input.mouse.clicked) {
        HF.Audio.play('back');
        HF.Game.go(new TitleScene());
      }
    }
    draw(ctx) {
      HF.UI.backdrop(ctx, this.t, '#2b3d6b', '#33497c');
      U.text(ctx, 'HOW TO PLAY', W / 2, 46, { size: 48, color: '#ffe14d' });

      // rules panel
      HF.UI.panel(ctx, 20, 80, 450, 250);
      U.text(ctx, 'THE WAY OF THE NOGGIN', 245, 104, { size: 22, color: '#7bdff2' });
      const rules = [
        'Jump on the other head to hurt it.',
        'Falling from higher hits harder.',
        'Jump UP into a falling foe to CLANG',
        '   and block their stomp.',
        'Every head has a SPECIAL move.',
        'When time runs out, the lower',
        '   health bar loses. Tie? Sudden death!',
      ];
      rules.forEach((s, i) => U.text(ctx, s, 44, 136 + i * 26, { size: 17, display: false, weight: 600, align: 'left', lw: 4 }));
      // little demo: one head stomping another
      const k = (this.t % 1.6) / 1.6;
      const jy = 290 - Math.sin(k * Math.PI) * 60;
      HF.drawHead(ctx, 'kenji', { x: 400 - 30 + k * 30, y: Math.min(jy, 262), r: 20, facing: 1, expr: k > 0.5 ? 'attack' : 'jump', t: this.t });
      HF.drawHead(ctx, 'momo', { x: 410, y: 300, r: 18, facing: -1, expr: k > 0.85 ? 'hurt' : 'fear', t: this.t, sy: k > 0.85 ? 0.7 : 1 });

      // controls panel
      HF.UI.panel(ctx, 490, 80, 450, 250);
      U.text(ctx, 'CONTROLS', 715, 104, { size: 22, color: '#7bdff2' });
      if (HF.Input.touch.enabled) {
        U.text(ctx, '◀  ▶', 610, 162, { size: 40, color: '#fff' });
        U.text(ctx, 'HOLD TO MOVE', 610, 198, { size: 15, display: false, weight: 700, color: '#d8d0f0' });
        U.text(ctx, 'JUMP + SPECIAL', 810, 162, { size: 23, color: '#fff' });
        U.text(ctx, 'TAP OR HOLD THE BUTTONS', 810, 198, { size: 14, display: false, weight: 700, color: '#d8d0f0' });
        U.text(ctx, 'Use several fingers at once.', 715, 242, { size: 17, display: false, weight: 600 });
        U.text(ctx, 'Tap II or Android Back to pause.', 715, 272, { size: 17, display: false, weight: 600 });
        U.text(ctx, 'Two players: P1 left buttons, P2 right.', 715, 308, { size: 14, display: false, weight: 600, color: '#ffe14d' });
      } else {
        const K = HF.UI.key;
        U.text(ctx, 'PLAYER 1', 600, 138, { size: 18, color: P_COLORS[0] });
        K(ctx, 'W', 600, 172);
        K(ctx, 'A', 564, 208);
        K(ctx, 'S', 600, 208);
        K(ctx, 'D', 636, 208);
        U.text(ctx, 'PLAYER 2', 830, 138, { size: 18, color: P_COLORS[1] });
        K(ctx, '↑', 830, 172);
        K(ctx, '←', 794, 208);
        K(ctx, '↓', 830, 208);
        K(ctx, '→', 866, 208);
        [['move', 'A D  /  ← →'], ['jump', 'W  /  ↑   (solo: SPACE too)'], ['special', 'S  /  ↓   (solo: F too)'], ['pause', 'ESC or P']].forEach(([a, b], i) =>
          U.text(ctx, a.toUpperCase() + ':  ' + b, 510, 248 + i * 20, { size: 15, display: false, weight: 600, align: 'left', lw: 4 })
        );
        U.text(ctx, 'Gamepads work too!', 920, 308, { size: 14, display: false, weight: 600, align: 'right', lw: 4, color: '#ffe14d' });
      }

      // specials
      HF.UI.panel(ctx, 20, 346, 920, 160);
      U.text(ctx, 'SPECIAL MOVES', W / 2, 368, { size: 22, color: '#7bdff2' });
      const list = HF.FIGHTERS.filter(HF.fighterUnlocked);
      list.forEach((f, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = 60 + col * 300, y = 404 + row * 40;
        HF.drawHead(ctx, f.id, { x, y, r: 15, facing: 1, expr: 'happy', t: this.t + i });
        U.text(ctx, f.name.split(' ')[0] + ': ' + f.abilityName, x + 24, y - 6, { size: 15, display: false, weight: 700, align: 'left', lw: 4, color: f.color });
        const short = { airjump: 'jump again in the air', dash: 'untouchable side dash', pound: 'ground pound + shockwave', glide: 'hold to hover', frost: 'freezing snowflake', spring: 'hold & release: mega jump', royal: 'fireball / ground pound' }[f.ability];
        U.text(ctx, short, x + 24, y + 11, { size: 13, display: false, weight: 600, align: 'left', lw: 3 });
      });
      U.text(ctx, HF.Input.touch.enabled ? 'tap anywhere to go back' : 'press any key to go back', W / 2, 524, { size: 15, display: false, color: '#cfc6ea', lw: 4 });
    }
  }

  HF.TitleScene = TitleScene;
  HF.SelectScene = SelectScene;
  HF.ResultsScene = ResultsScene;
  HF.OptionsScene = OptionsScene;
  HF.HowToScene = HowToScene;
})();
