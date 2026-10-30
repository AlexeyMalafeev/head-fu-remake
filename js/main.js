// Boot: canvas scaling, the main loop and scene transitions (a cartoon iris wipe).
(function () {
  'use strict';
  const HF = window.HF;
  const W = HF.W, H = HF.H;

  const Game = (HF.Game = {
    canvas: null,
    ctx: null,
    scale: 1,
    scene: null,
    trans: null,
    last: 0,

    init() {
      this.canvas = document.getElementById('game');
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
      HF.Input.init(this.canvas);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // Fingers lifted while the app was in the background never send pointerup.
          HF.Input.keys.clear();
          HF.Input.clearTouches();
          if (this.scene && this.scene.suspend) this.scene.suspend();
        }
        const ac = HF.Audio.ctx;
        if (!ac) return;
        if (document.hidden) ac.suspend();
        else ac.resume();
      });
      this.canvas.focus();
      this.go(new HF.TitleScene(), false);
      // Redraw cached stage art once the display font has arrived.
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => HF.STAGES.forEach((s) => (s._cache = null)));
      const tick = (ts) => {
        this.frame(ts);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },

    resize() {
      const s = Math.min(window.innerWidth / W, window.innerHeight / H) || 1;
      const cw = Math.max(16, Math.floor(W * s)), ch = Math.max(9, Math.floor(H * s));
      this.canvas.style.width = cw + 'px';
      this.canvas.style.height = ch + 'px';
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(cw * dpr);
      this.canvas.height = Math.round(ch * dpr);
      this.scale = this.canvas.width / W;
    },

    toLogical(cx, cy) {
      const r = this.canvas.getBoundingClientRect();
      return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H };
    },

    // Switch scenes. With a transition, the new scene starts once the iris has closed.
    go(scene, transition = true) {
      if (!transition || !this.scene) {
        if (this.scene && this.scene.exit) this.scene.exit();
        this.scene = scene;
        if (scene.enter) scene.enter();
        return;
      }
      this.trans = { t: 0, dur: 0.28, next: scene, swapped: false };
    },

    // One frame of input, update and drawing. Tests can call it directly to step the game.
    frame(ts) {
      const dt = Math.max(0, Math.min(0.05, (ts - (this.last || ts)) / 1000));
      this.last = ts;
      HF.Input.poll();
      const tr = this.trans;
      if (tr) {
        tr.t += dt;
        if (!tr.swapped && tr.t >= tr.dur) {
          if (this.scene && this.scene.exit) this.scene.exit();
          this.scene = tr.next;
          if (this.scene.enter) this.scene.enter();
          tr.swapped = true;
        }
        if (tr.t >= tr.dur * 2) this.trans = null;
      }
      try {
        if (!tr || tr.swapped) this.scene.update(dt);
        const ctx = this.ctx;
        ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
        ctx.clearRect(0, 0, W, H);
        this.scene.draw(ctx);
        if (this.trans) this.drawIris(ctx, this.trans);
      } catch (e) {
        console.error(e);
      }
      HF.Input.endFrame();
    },

    drawIris(ctx, tr) {
      const p = tr.t < tr.dur ? tr.t / tr.dur : 1 - (tr.t - tr.dur) / tr.dur;
      const rad = (1 - HF.U.easeInOut(Math.min(1, Math.max(0, p)))) * 580;
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.arc(W / 2, H / 2, Math.max(0.1, rad), 0, HF.TAU, true);
      ctx.fillStyle = '#120f1d';
      ctx.fill('evenodd');
    },
  });

  window.addEventListener('load', () => Game.init());
})();
