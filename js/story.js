// Story mode: Kenji's quest to un-ban hats. Script, cutscenes, stage cards, continue screen and credits.
(function () {
  'use strict';
  const HF = window.HF;
  const U = HF.U;
  const W = HF.W, H = HF.H;

  // ----------------------------- the script -----------------------------
  // Line fields: who, face, text, left/right (swap who stands on that side), hat {id: 'beanie'},
  // decree (show as a royal scroll), shake.
  const STORY = (HF.STORY = {
    intro: {
      bg: 'dojo',
      left: 'kenji',
      lines: [
        { who: 'narrator', text: 'In the Valley of Noggins, everyone is just a head. Nobody knows why. It is considered rude to ask.' },
        { who: 'narrator', text: 'Heads love two things more than anything: the noble art of HEAD-FU... and HATS.' },
        { who: 'narrator', text: 'But one morning, a royal decree was nailed to every door in the valley...' },
        { who: 'narrator', decree: true, text: 'BY ORDER OF EMPEROR MEGADOME: ALL HATS ARE BANNED. ALSO HEADBANDS. ESPECIALLY HEADBANDS.' },
        { who: 'kenji', face: 'shock', text: 'Banned?! But Grandma knitted this headband for me!' },
        { who: 'kenji', face: 'cry', text: 'It took her forty years. She has no hands!' },
        { who: 'kenji', face: 'angry', shake: true, text: "That's it. I'm going to the Imperial Palace to give that Emperor a piece of my head!" },
      ],
    },
    chapters: [
      {
        opp: 'momo',
        stage: 'dojo',
        pre: [
          { who: 'momo', face: 'happy', text: "Halt! I'm Momo, the Emperor's fastest messenger!" },
          { who: 'momo', face: 'sparkle', text: "And his number one fan! I have his poster on my... um. I have a head." },
          { who: 'kenji', face: 'focus', text: "Out of my way, Momo. I'm on a mission." },
          { who: 'momo', face: 'smug', text: "Nobody gets past Momo! Unless they're faster. Which they're NOT." },
        ],
        post: [
          { who: 'momo', face: 'cry', text: "Waaah! I'm telling the Emperor! ...As fast as possible!" },
          { who: 'kenji', face: 'smug', text: 'One down. My forehead is just getting warmed up.' },
        ],
      },
      {
        opp: 'bao',
        stage: 'market',
        pre: [
          { who: 'bao', face: 'happy', text: "Welcome to the Lantern Market! I'm Bao. The Emperor's favorite snack." },
          { who: 'kenji', face: 'shock', text: "...You're a bun." },
          { who: 'bao', face: 'proud', text: "I'm a bun with a DREAM. And the dream is to flatten you!" },
          { who: 'kenji', face: 'focus', text: "That's the worst dream I've ever heard." },
        ],
        post: [
          { who: 'bao', face: 'cry', text: "Ow... I'm just a little steamed." },
          { who: 'kenji', face: 'happy', text: "No hard feelings. You're very fluffy." },
          { who: 'bao', face: 'blush', text: '...Thank you.' },
        ],
      },
      {
        opp: 'sensei',
        stage: 'bamboo',
        pre: [
          { who: 'sensei', face: 'calm', text: 'Kenji. My foolish student.' },
          { who: 'kenji', face: 'shock', text: 'Sensei Fuzz?! What are you doing here?' },
          { who: 'sensei', face: 'smug', text: 'The Emperor offered me a lifetime supply of eyebrow wax. A man must think of his eyebrows.' },
          { who: 'kenji', face: 'angry', shake: true, text: 'You sold out for EYEBROW WAX?!' },
          { who: 'sensei', face: 'focus', text: 'Show me what you have learned. Then I shall step aside. Slowly. I am very old.' },
        ],
        post: [
          { who: 'sensei', face: 'calm', text: "You have learned well. One final lesson: the Emperor's head is very big." },
          { who: 'kenji', face: 'think', text: '...And?' },
          { who: 'sensei', face: 'proud', text: "That's it. That's the lesson. Big head, easy to land on. Off you go." },
        ],
      },
      {
        opp: 'yuki',
        stage: 'snow',
        pre: [
          { who: 'yuki', face: 'focus', text: 'The palace lies beyond this pass. You will not reach it.' },
          { who: 'kenji', face: 'smug', text: 'Let me guess. The Emperor promised you something.' },
          { who: 'yuki', face: 'blush', text: "...A scarf. A really nice scarf. It's COLD up here, okay?!" },
          { who: 'kenji', face: 'shock', text: "You're already wearing a scarf!" },
          { who: 'yuki', face: 'angry', shake: true, text: 'A ninja can have TWO scarves!' },
        ],
        post: [
          { who: 'yuki', face: 'blush', text: "Brr... you're warmer than you look. Go. My second scarf can wait." },
          { who: 'kenji', face: 'happy', text: "I'll ask Grandma to knit you one. She's fast. For someone with no hands." },
        ],
      },
      {
        opp: 'gonta',
        stage: 'gate',
        pre: [
          { who: 'gonta', face: 'focus', text: 'GONTA GUARD GATE.' },
          { who: 'kenji', face: 'worried', text: 'Gonta, please. I just need to talk to the Emperor.' },
          { who: 'gonta', face: 'smug', text: 'GONTA ALSO GUARD SNACKS. GONTA MOSTLY GUARD SNACKS.' },
          { who: 'kenji', face: 'happy', text: '...I have a rice ball.' },
          { who: 'gonta', face: 'think', text: '. . . . . . . . . . . .' },
          { who: 'gonta', face: 'angry', shake: true, text: 'GONTA HAVE HONOR. FIGHT FIRST. RICE BALL AFTER.' },
        ],
        post: [
          { who: 'gonta', face: 'happy', text: 'GONTA LOSE. GONTA ACCEPT RICE BALL.' },
          { who: 'gonta', face: 'sparkle', text: 'IS VERY GOOD RICE BALL. GATE IS OPEN. GONTA IS BUSY NOW.' },
        ],
      },
      {
        opp: 'emperor',
        stage: 'throne',
        boss: true,
        pre: [
          { who: 'emperor', face: 'smug', text: 'So. The little hothead has come to my throne room.' },
          { who: 'kenji', face: 'angry', text: 'Why did you ban hats?! Hats bring joy to heads everywhere!' },
          { who: 'emperor', face: 'sad', text: 'Because... NO HAT FITS ME!' },
          { who: 'emperor', face: 'cry', text: "Do you know what that's like? Look at this crown! It's from a CHILDREN'S PARTY!" },
          { who: 'kenji', face: 'shock', text: "...Oh. That's actually kind of sad." },
          { who: 'emperor', face: 'furious', shake: true, text: "If I can't wear a hat, NOBODY CAN! Feel the weight of an EMPIRE... on your FACE!" },
          { who: 'narrator', text: 'Tip: when the Emperor puts on his spiked helmet, do NOT stomp him. Wait it out, or dodge his fireballs!' },
        ],
        post: [],
      },
    ],
    ending: {
      bg: 'throne',
      left: 'kenji',
      right: 'emperor',
      music: 'story',
      lines: [
        { who: 'emperor', face: 'cry', text: 'I... I lost. To a head half my size.' },
        { who: 'kenji', face: 'sad', text: "Emperor... you didn't need to ban hats. You just needed the right one." },
        { who: 'granny', left: 'granny', face: 'happy', text: 'Did somebody say they need a BIG hat?' },
        { who: 'kenji', left: 'kenji', face: 'shock', text: 'GRANDMA?! How did you get here?' },
        { who: 'granny', left: 'granny', face: 'smug', text: 'I rolled. Downhill, mostly. Now hold still, Your Majesty...' },
        { who: 'narrator', text: '*knit knit knit knit knit knit knit*' },
        { who: 'emperor', face: 'shock', hat: { emperor: 'beanie' }, text: 'It... it fits. IT FITS!' },
        { who: 'emperor', face: 'joy', text: 'By royal decree: hats are UN-BANNED! And Granny is the new Royal Knitter!' },
        { who: 'granny', face: 'wink', text: "I'll need a raise. And a pair of hands." },
        { who: 'kenji', left: 'kenji', face: 'win', text: 'Thanks, Grandma. Head-fu forever!' },
        { who: 'narrator', text: 'And so, peace returned to the Valley of Noggins. Everyone wore hats again.' },
        { who: 'narrator', text: 'Except Gonta, who wore a rice ball.' },
        { who: 'narrator', text: 'THE END...?' },
      ],
    },
  });

  function speakerInfo(id) {
    if (HF.FIGHTER[id]) return HF.FIGHTER[id];
    return HF.EXTRAS[id] || HF.EXTRAS.narrator;
  }

  // ----------------------------- story flow -----------------------------
  HF.Story = {
    begin(diff) {
      this.diff = diff;
      this.ch = 0;
      HF.Game.go(new DialogScene(STORY.intro, () => this.chapter()));
    },
    chapter() {
      const c = STORY.chapters[this.ch];
      HF.Game.go(new CardScene(c, this.ch, () => HF.Game.go(new DialogScene({ bg: c.stage, left: 'kenji', right: c.opp, lines: c.pre }, () => this.fight()))));
    },
    fight() {
      const c = STORY.chapters[this.ch];
      const base = HF.AI_LEVELS[this.diff];
      // Later opponents are a little sharper than early ones. The boss already has spikes,
      // rage and a big health bar, so its reflexes are toned down (tuned with tests/run-sim.sh).
      const skill = c.boss ? base - (this.diff === 'hard' ? 0.12 : 0.05) : U.clamp(base + (this.ch - 2.5) * 0.04, 0.05, 0.97);
      HF.Game.go(
        new HF.MatchScene({
          mode: 'story',
          players: [
            { id: 'kenji', ctrl: 'human' },
            { id: c.opp, ctrl: 'ai', skill },
          ],
          stage: c.stage,
          rounds: c.boss ? 1 : HF.settings.rounds,
          time: c.boss ? 99 : HF.settings.time,
          boss: !!c.boss,
          hp: c.boss ? [100, 130] : [],
          armor: c.boss ? [null, 1] : [],
          music: c.boss ? 'boss' : undefined,
          title: c.boss ? 'FINAL BATTLE' : undefined,
          onEnd: (res) => (res.winner === 0 ? this.won() : this.lost()),
          onQuit: () => HF.Game.go(new HF.TitleScene()),
        })
      );
    },
    won() {
      const c = STORY.chapters[this.ch];
      const next = () => {
        this.ch++;
        if (this.ch >= STORY.chapters.length) this.ending();
        else this.chapter();
      };
      if (c.post.length) HF.Game.go(new DialogScene({ bg: c.stage, left: 'kenji', right: c.opp, lines: c.post }, next));
      else next();
    },
    lost() {
      HF.Game.go(new ContinueScene(() => this.fight(), () => HF.Game.go(new HF.TitleScene())));
    },
    ending() {
      HF.Game.go(new DialogScene(STORY.ending, () => HF.Game.go(new CreditsScene())));
    },
  };

  // ----------------------------- difficulty pick -----------------------------
  class StoryScene {
    constructor() {
      this.t = 0;
      const pick = (d) => () => {
        HF.store.set('difficulty', d);
        HF.Story.begin(d);
      };
      this.menu = new HF.UI.Menu(
        [
          { label: 'EASY', action: pick('easy'), hint: 'Sleepy opponents. Enjoy the story.' },
          { label: 'NORMAL', action: pick('normal'), hint: 'A fair fight all the way.' },
          { label: 'HARD', action: pick('hard'), hint: 'For true masters of the noggin.' },
        ],
        { y: 300, gap: 52, size: 34, onBack: () => HF.Game.go(new HF.TitleScene()) }
      );
      const d = HF.store.get('difficulty', 'normal');
      this.menu.i = Math.max(0, ['easy', 'normal', 'hard'].indexOf(d));
    }
    enter() {
      HF.Music.play('story');
    }
    update(dt) {
      this.t += dt;
      this.menu.update(dt);
    }
    draw(ctx) {
      HF.UI.backdrop(ctx, this.t, '#5a2a4a', '#6a3358');
      U.text(ctx, 'STORY MODE', W / 2, 70, { size: 60, color: '#ffe14d' });
      U.text(ctx, 'Kenji and the Great Hat Ban', W / 2, 122, { size: 22, display: false, weight: 700, lw: 5 });
      HF.drawHead(ctx, 'kenji', { x: 170, y: 330, r: 80, facing: 1, expr: 'focus', t: this.t, look: { x: 1, y: 0 } });
      HF.drawHead(ctx, 'emperor', { x: 790, y: 320, r: 96, facing: -1, expr: 'smug', t: this.t, look: { x: -1, y: 0 } });
      U.text(ctx, 'CHOOSE DIFFICULTY', W / 2, 230, { size: 26 });
      this.menu.draw(ctx);
      U.text(ctx, 'ESC to go back', W / 2, 505, { size: 15, display: false, color: '#e0cfe0', lw: 4 });
    }
  }

  // ----------------------------- cutscene dialogue -----------------------------
  class DialogScene {
    constructor(script, onDone) {
      this.script = script;
      this.onDone = onDone;
      this.lines = script.lines;
      this.stage = script.bg ? new HF.Stage(script.bg) : null;
      this.slots = { left: script.left || null, right: script.right || null };
      this.slotT = { left: 1, right: 1 };
      this.faces = {};
      this.hats = {};
      this.t = 0;
      this.shake = 0;
      this.idx = -1;
      this.done = false;
      this.next();
    }

    enter() {
      HF.Music.play(this.script.music || 'story');
    }

    next() {
      this.idx++;
      if (this.idx >= this.lines.length) {
        if (!this.done) {
          this.done = true;
          this.onDone();
        }
        return;
      }
      const l = this.lines[this.idx];
      for (const side of ['left', 'right']) {
        if (l[side] && l[side] !== this.slots[side]) {
          this.slots[side] = l[side];
          this.slotT[side] = 0;
        }
      }
      // a speaker who isn't on stage yet walks in on their own side
      if (l.who !== 'narrator' && this.slots.left !== l.who && this.slots.right !== l.who) {
        const side = l.who === 'kenji' || l.who === 'granny' ? 'left' : 'right';
        this.slots[side] = l.who;
        this.slotT[side] = 0;
      }
      if (l.face) this.faces[l.who] = l.face;
      if (l.hat) Object.assign(this.hats, l.hat);
      if (l.hat) HF.Audio.play('unlock');
      if (l.shake) this.shake = 0.35;
      this.chars = 0;
      this.lineT = 0;
    }

    update(dt) {
      this.t += dt;
      this.lineT += dt;
      this.shake = Math.max(0, this.shake - dt);
      for (const s of ['left', 'right']) this.slotT[s] = Math.min(1, this.slotT[s] + dt * 3);
      if (this.stage) this.stage.update(dt);
      if (this.done) return;
      const l = this.lines[this.idx];
      const before = this.chars;
      this.chars = Math.min(l.text.length, this.chars + dt * 45);
      const voice = speakerInfo(l.who).voice || 1;
      if (Math.floor(this.chars / 2) !== Math.floor(before / 2) && this.chars < l.text.length && l.text[Math.floor(this.chars)] !== ' ') HF.Audio.play('blip', voice);
      const inp = HF.Input.menu();
      if (inp.back) {
        HF.Audio.play('back');
        this.done = true;
        this.onDone();
        return;
      }
      if (inp.ok || HF.Input.mouse.clicked || HF.Input.hits.has('KeyW') || HF.Input.hits.has('ArrowUp') || HF.Input.hits.has('ArrowDown')) {
        if (this.chars < l.text.length) this.chars = l.text.length;
        else {
          HF.Audio.play('move');
          this.next();
        }
      }
    }

    draw(ctx) {
      const sx = this.shake > 0 ? U.rand(-6, 6) : 0, sy = this.shake > 0 ? U.rand(-6, 6) : 0;
      ctx.save();
      ctx.translate(sx, sy);
      if (this.stage) {
        this.stage.drawBack(ctx);
        this.stage.drawFront(ctx);
        ctx.fillStyle = 'rgba(15,8,30,0.35)';
        ctx.fillRect(-10, -10, W + 20, H + 20);
      } else HF.UI.backdrop(ctx, this.t, '#2a2050', '#33285e');
      if (this.done) {
        ctx.restore();
        return;
      }
      const l = this.lines[this.idx];
      const talking = this.chars < l.text.length;
      for (const side of ['left', 'right']) {
        const id = this.slots[side];
        if (!id) continue;
        const L = side === 'left';
        const speaking = l.who === id;
        const def = HF.FIGHTER[id];
        const size = def ? Math.sqrt(def.stats.radius / 46) : 1;
        const slide = U.easeOutCubic(this.slotT[side]);
        const x = (L ? 210 : W - 210) + (1 - slide) * (L ? -320 : 320);
        const bob = speaking ? Math.abs(Math.sin(this.t * 7)) * 8 : Math.sin(this.t * 2 + (L ? 0 : 1)) * 3;
        HF.drawHead(ctx, id, {
          x,
          y: 268 - bob,
          r: 88 * size * (speaking ? 1.05 : 1),
          facing: L ? 1 : -1,
          expr: this.faces[id] || 'idle',
          look: { x: L ? 0.7 : -0.7, y: 0 },
          talk: speaking && talking ? (Math.floor(this.t * 12) % 2 ? 1 : 0.2) : 0,
          blink: (this.t * 0.6 + (L ? 0 : 0.5)) % 3 < 0.08 ? 1 : 0,
          t: this.t,
          hat: this.hats[id],
          alpha: speaking || l.who === 'narrator' ? 1 : 0.8,
        });
      }
      const shown = l.text.slice(0, Math.floor(this.chars));
      if (l.decree) {
        // royal scroll
        ctx.save();
        ctx.translate(W / 2, 200);
        ctx.rotate(-0.02);
        HF.UI.panel(ctx, -250, -120, 500, 240, { fill: '#f6e3b4', r: 10 });
        for (const s of [-1, 1]) {
          U.roundRect(ctx, -270, s * 120 - 14, 540, 28, 14);
          ctx.fillStyle = '#c9a25c';
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = HF.OUTLINE;
          ctx.stroke();
        }
        ctx.font = U.font(26);
        U.wrap(ctx, shown, 430).forEach((s, i) => U.text(ctx, s, 0, -60 + i * 34, { size: 26, color: '#8a1c1c', stroke: false }));
        ctx.restore();
      }
      const info = speakerInfo(l.who);
      const narr = l.who === 'narrator';
      if (!l.decree) HF.UI.panel(ctx, 40, 392, 880, 134, { fill: narr ? 'rgba(20,14,40,0.92)' : 'rgba(255,255,255,0.96)' });
      if (!narr) {
        const tagW = Math.max(150, info.name.length * 15 + 40);
        const tx = this.slots.right === l.who ? 900 - tagW : 60;
        HF.UI.panel(ctx, tx, 368, tagW, 40, { fill: info.color, r: 12 });
        U.text(ctx, info.name, tx + tagW / 2, 389, { size: 22 });
      }
      ctx.font = U.font(23, false, 600);
      const lines = U.wrap(ctx, narr && l.decree ? '' : shown, 820);
      lines.forEach((s, i) => U.text(ctx, s, 66, 436 + i * 31, { size: 23, display: false, weight: 600, align: 'left', color: narr ? '#ffe9a8' : HF.OUTLINE, stroke: false }));
      if (!talking && Math.floor(this.t * 3) % 2 === 0) U.text(ctx, '▼', 890, 505, { size: 20, color: '#ff4d6d', stroke: false });
      ctx.restore();
      U.text(ctx, 'ENTER next · ESC skip', W - 16, 16, { size: 13, display: false, weight: 600, align: 'right', lw: 3, color: '#e8e2ff' });
    }
  }

  // ----------------------------- stage card -----------------------------
  class CardScene {
    constructor(c, i, onDone) {
      this.c = c;
      this.i = i;
      this.onDone = onDone;
      this.t = 0;
      this.stage = new HF.Stage(c.stage);
      this.done = false;
    }
    enter() {
      HF.Music.stop(0.3);
      HF.Audio.play('round');
    }
    update(dt) {
      this.t += dt;
      this.stage.update(dt);
      const inp = HF.Input.menu();
      if (!this.done && (this.t > 2.6 || (this.t > 0.4 && (inp.ok || HF.Input.mouse.clicked)))) {
        this.done = true;
        this.onDone();
      }
    }
    draw(ctx) {
      this.stage.drawBack(ctx);
      ctx.fillStyle = 'rgba(15,8,30,0.55)';
      ctx.fillRect(0, 0, W, H);
      const opp = HF.FIGHTER[this.c.opp];
      const k = U.easeOutBack(Math.min(1, this.t * 2.5));
      const label = this.c.boss ? 'FINAL STAGE' : 'STAGE ' + (this.i + 1) + ' / ' + (STORY.chapters.length - 1);
      U.text(ctx, label, W / 2, 90, { size: 54 * k, color: this.c.boss ? '#ff4d4d' : '#ffe14d' });
      HF.drawHead(ctx, 'kenji', { x: 260 - (1 - k) * 300, y: 270, r: 84, facing: 1, expr: 'focus', t: this.t, look: { x: 1, y: 0 } });
      const or = 84 * Math.sqrt(opp.stats.radius / 46);
      HF.drawHead(ctx, opp.id, { x: 700 + (1 - k) * 300, y: 270, r: or, facing: -1, expr: this.c.boss ? 'furious' : 'smug', t: this.t, look: { x: -1, y: 0 } });
      U.text(ctx, 'VS', W / 2, 270, { size: 80 * k, color: '#ff4d6d' });
      U.text(ctx, opp.name, 700, 400, { size: 30, color: opp.color });
      U.text(ctx, opp.title, 700, 430, { size: 18, display: false, weight: 700, lw: 4 });
      U.text(ctx, 'KENJI', 260, 400, { size: 30, color: '#e63946' });
      U.text(ctx, this.stage.def.name.toUpperCase(), W / 2, 490, { size: 24, color: '#fff' });
    }
  }

  // ----------------------------- continue? -----------------------------
  class ContinueScene {
    constructor(retry, quit) {
      this.t = 0;
      this.count = 9.99;
      this.quit = quit;
      this.menu = new HF.UI.Menu(
        [
          { label: 'RETRY', action: retry },
          { label: 'GIVE UP', action: quit },
        ],
        { y: 420, gap: 50, size: 32 }
      );
    }
    enter() {
      HF.Music.stop(0.05);
      HF.Music.play('defeat');
    }
    update(dt) {
      this.t += dt;
      const before = Math.ceil(this.count);
      this.count -= dt;
      if (Math.ceil(this.count) !== before && this.count > 0) HF.Audio.play('tick');
      if (this.count <= 0) {
        this.count = 0;
        this.quit();
        this.quit = () => {};
        return;
      }
      this.menu.update(dt);
    }
    draw(ctx) {
      HF.UI.backdrop(ctx, this.t, '#22203a', '#2b2846');
      U.text(ctx, 'CONTINUE?', W / 2, 80, { size: 64, color: '#ffe14d' });
      HF.drawHead(ctx, 'kenji', { x: W / 2, y: 240, r: 90, facing: 1, expr: 'cry', t: this.t });
      U.text(ctx, String(Math.ceil(this.count)), W / 2 + 190, 240, { size: 90, color: '#ff4d6d' });
      U.text(ctx, "Grandma's headband believes in you!", W / 2, 360, { size: 19, display: false, weight: 700, lw: 5 });
      this.menu.draw(ctx);
    }
  }

  // ----------------------------- credits -----------------------------
  const CREDITS = [
    ['HEAD-FU', 64, '#ffe14d'],
    ['The Way of the Noggin', 26, '#ffd6f0'],
    ['', 30],
    ['STARRING', 30, '#7bdff2'],
    ['Kenji  -  The Hothead', 22],
    ['Momo  -  The Pink Blur', 22],
    ['Bao  -  The Steamed Bun', 22],
    ['Sensei Fuzz  -  The Ancient Eyebrows', 22],
    ['Yuki  -  The Frost Ninja', 22],
    ['Gonta  -  The Mountain', 22],
    ['Emperor Megadome  -  The Biggest Head', 22],
    ['and Granny as herself', 22],
    ['', 30],
    ['BASED ON', 30, '#7bdff2'],
    ['a lost Flash classic,', 22],
    ['reincarnated for the modern web', 22],
    ['', 30],
    ['MUSIC & SOUND', 30, '#7bdff2'],
    ['synthesized live, 8-bit style', 22],
    ['', 40],
    ['THANK YOU FOR PLAYING!', 40, '#ffe14d'],
  ];

  class CreditsScene {
    constructor() {
      this.t = 0;
      this.unlocked = !HF.unlocks.emperor;
      this.scroll = 0;
      this.doneT = 0;
      this.fx = new HF.FX();
      if (this.unlocked) {
        HF.unlocks.emperor = true;
        HF.saveUnlocks();
      }
    }
    enter() {
      HF.Music.stop(0.1);
      HF.Music.play('title');
    }
    height() {
      return CREDITS.reduce((a, c) => a + c[1] * 1.5, 0);
    }
    update(dt) {
      this.t += dt;
      this.fx.update(dt);
      const inp = HF.Input.menu();
      const speed = HF.Input.keys.has('Enter') || HF.Input.keys.has('Space') ? 200 : 55;
      if (this.scroll < this.height() + H * 0.55) this.scroll += dt * speed;
      else {
        if (this.doneT === 0) {
          HF.Audio.play(this.unlocked ? 'unlock' : 'cheer');
          this.fx.confetti(120);
        }
        this.doneT += dt;
        if (this.doneT > 1 && (inp.ok || inp.back || HF.Input.mouse.clicked)) HF.Game.go(new HF.TitleScene());
      }
      if (inp.back && this.doneT === 0) this.scroll = this.height() + H * 0.55;
    }
    draw(ctx) {
      HF.UI.backdrop(ctx, this.t, '#2a2050', '#33285e');
      let y = H + 20 - this.scroll;
      for (const [s, size, color] of CREDITS) {
        if (s && y > -60 && y < H + 60) U.text(ctx, s, W / 2, y, { size, color: color || '#fff', display: size >= 30 });
        y += size * 1.5;
      }
      // a parade of heads along the bottom
      const ids = ['kenji', 'momo', 'bao', 'sensei', 'yuki', 'gonta', 'emperor', 'granny'];
      ids.forEach((id, i) => {
        const x = ((i * 130 + this.t * 60) % (W + 200)) - 100;
        const hop = Math.abs(Math.sin(this.t * 4 + i)) * 20;
        HF.drawHead(ctx, id, { x, y: 495 - hop, r: id === 'emperor' ? 34 : 26, facing: 1, expr: i % 2 ? 'happy' : 'win', t: this.t + i, hat: id === 'emperor' ? 'beanie' : null });
      });
      if (this.doneT > 0) {
        const k = U.easeOutBack(Math.min(1, this.doneT * 2));
        ctx.save();
        ctx.translate(W / 2, 220);
        ctx.scale(k, k);
        HF.UI.panel(ctx, -300, -150, 600, 300, { fill: 'rgba(40,20,70,0.95)' });
        if (this.unlocked) {
          U.text(ctx, 'NEW FIGHTER UNLOCKED!', 0, -110, { size: 36, color: '#ffe14d' });
          HF.drawHead(ctx, 'emperor', { x: 0, y: -10, r: 64, facing: 1, expr: 'sparkle', t: this.t, hat: 'beanie' });
          U.text(ctx, 'EMPEROR MEGADOME', 0, 90, { size: 30, color: '#c9a7ff' });
          U.text(ctx, 'now playable in Versus modes', 0, 122, { size: 17, display: false, weight: 700, lw: 4 });
        } else {
          U.text(ctx, 'THE END', 0, -40, { size: 60, color: '#ffe14d' });
          U.text(ctx, 'You saved the hats. Again!', 0, 30, { size: 20, display: false, weight: 700, lw: 4 });
        }
        ctx.restore();
        if (this.doneT > 1) U.text(ctx, 'press ENTER', W / 2, 410, { size: 18, display: false, weight: 700, lw: 4 });
      }
      this.fx.draw(ctx);
    }
  }

  HF.StoryScene = StoryScene;
  HF.DialogScene = DialogScene;
  HF.CreditsScene = CreditsScene;
})();
