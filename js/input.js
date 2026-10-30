// Keyboard, gamepad, pointer and multi-touch input. Fighters read held buttons; menus read presses.
(function () {
  'use strict';
  const HF = window.HF;

  const P1 = { left: ['KeyA'], right: ['KeyD'], jump: ['KeyW', 'Space'], special: ['KeyS', 'KeyF'] };
  const P2 = { left: ['ArrowLeft'], right: ['ArrowRight'], jump: ['ArrowUp'], special: ['ArrowDown', 'Slash', 'Numpad0'] };
  const MENU_ANY = {
    up: ['KeyW', 'ArrowUp'],
    down: ['KeyS', 'ArrowDown'],
    left: ['KeyA', 'ArrowLeft'],
    right: ['KeyD', 'ArrowRight'],
    ok: ['Enter', 'Space', 'NumpadEnter', 'KeyF'],
    back: ['Escape', 'Backspace'],
  };
  const MENU_P = [
    { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], ok: ['Space', 'KeyF'], back: ['KeyQ'] },
    {
      up: ['ArrowUp'],
      down: ['ArrowDown'],
      left: ['ArrowLeft'],
      right: ['ArrowRight'],
      ok: ['Enter', 'NumpadEnter', 'Numpad0'],
      back: ['Backspace'],
    },
  ];
  const BLOCK = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Slash', 'Tab']);
  // Solo fights: one set across the bottom corners. Two-player fights: each player gets a
  // compact copy of it in their half of the screen (player 1 left, player 2 right).
  const PAUSE_BUTTON = { action: 'pause', x: 480, y: 105, r: 23, label: 'II', color: '#d8d0f0' };
  const SOLO_BUTTONS = [
    { player: 0, action: 'left', x: 66, y: 446, r: 46, label: '◀', color: '#3a86ff' },
    { player: 0, action: 'right', x: 172, y: 446, r: 46, label: '▶', color: '#3a86ff' },
    { player: 0, action: 'jump', x: 786, y: 446, r: 50, label: 'JUMP', color: '#ffd23f' },
    { player: 0, action: 'special', x: 898, y: 446, r: 46, label: 'SPECIAL', color: '#ff4d6d' },
    PAUSE_BUTTON,
  ];
  const duoSet = (player, x0) => [
    { player, action: 'left', x: x0 + 56, y: 458, r: 40, label: '◀', color: '#3a86ff' },
    { player, action: 'right', x: x0 + 146, y: 458, r: 40, label: '▶', color: '#3a86ff' },
    { player, action: 'jump', x: x0 + 326, y: 458, r: 44, label: 'JUMP', color: '#ffd23f' },
    { player, action: 'special', x: x0 + 422, y: 458, r: 40, label: 'SPECIAL', color: '#ff4d6d' },
  ];
  const DUO_BUTTONS = [...duoSet(0, 0), ...duoSet(1, 480), PAUSE_BUTTON];
  const PLAYER_COLORS = ['#3a86ff', '#ff4d6d'];

  HF.Input = {
    keys: new Set(),
    hits: new Set(),
    padDown: [new Set(), new Set()],
    padHits: [new Set(), new Set()],
    mouse: { x: -1, y: -1, clicked: false, moved: false },
    touch: { enabled: false, down: [new Set(), new Set()], pauseHit: false },
    pointers: new Map(),
    pointerOwners: new Map(),
    anyHit: false,

    init(canvas) {
      this.touch.enabled = navigator.maxTouchPoints > 0;
      window.addEventListener('keydown', (e) => {
        if (BLOCK.has(e.code)) e.preventDefault();
        if (e.repeat) return;
        this.keys.add(e.code);
        this.hits.add(e.code);
        this.anyHit = true;
      });
      window.addEventListener('keyup', (e) => this.keys.delete(e.code));
      window.addEventListener('blur', () => {
        this.keys.clear();
        this.clearTouches();
      });
      const unlockAudio = () => HF.Audio.unlock();
      for (const type of ['touchend', 'pointerup', 'click', 'keydown']) window.addEventListener(type, unlockAudio, true);
      canvas.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') this.touch.enabled = true;
        const p = HF.Game.toLogical(e.clientX, e.clientY);
        const control = this.touchControlAt(p.x, p.y);
        if (control) {
          e.preventDefault();
          this.pointers.set(e.pointerId, control);
          this.refreshTouches();
          if (control.action === 'pause') this.touch.pauseHit = true;
          this.anyHit = true;
          if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
          return;
        }
        this.mouse.x = p.x;
        this.mouse.y = p.y;
        this.mouse.clicked = true;
        this.anyHit = true;
        canvas.focus();
      });
      canvas.addEventListener('pointermove', (e) => {
        const p = HF.Game.toLogical(e.clientX, e.clientY);
        if (this.pointers.has(e.pointerId)) {
          e.preventDefault();
          // A finger may slide between its own player's buttons, never onto the other player's.
          const previous = this.pointers.get(e.pointerId);
          if (previous && previous.action === 'pause') return;
          const owner = previous ? previous.player : this.pointerOwners.get(e.pointerId);
          const control = this.touchControlAt(p.x, p.y);
          this.pointers.set(e.pointerId, control && control.player === owner ? control : null);
          this.pointerOwners.set(e.pointerId, owner);
          this.refreshTouches();
          return;
        }
        this.mouse.x = p.x;
        this.mouse.y = p.y;
        this.mouse.moved = true;
      });
      const release = (e) => {
        if (!this.pointers.has(e.pointerId)) return;
        e.preventDefault();
        this.pointers.delete(e.pointerId);
        this.pointerOwners.delete(e.pointerId);
        this.refreshTouches();
      };
      canvas.addEventListener('pointerup', release);
      canvas.addEventListener('pointercancel', release);
      canvas.addEventListener('lostpointercapture', release);
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    },

    controlsVisible() {
      const scene = HF.Game && HF.Game.scene;
      return this.touch.enabled && scene instanceof HF.MatchScene && !scene.demo && !scene.paused && !scene.ended;
    },

    touchButtons() {
      return HF.Game.scene.solo ? SOLO_BUTTONS : DUO_BUTTONS;
    },

    touchControlAt(x, y) {
      if (!this.controlsVisible()) return null;
      for (const b of this.touchButtons()) {
        const r = b.r + 10;
        if ((x - b.x) ** 2 + (y - b.y) ** 2 <= r * r) return b;
      }
      return null;
    },

    refreshTouches() {
      this.touch.down[0].clear();
      this.touch.down[1].clear();
      for (const b of this.pointers.values()) if (b && b.action !== 'pause') this.touch.down[b.player].add(b.action);
    },

    clearTouches() {
      this.pointers.clear();
      this.pointerOwners.clear();
      this.touch.down[0].clear();
      this.touch.down[1].clear();
      this.touch.pauseHit = false;
    },

    drawTouchControls(ctx) {
      if (!this.controlsVisible()) return;
      ctx.save();
      const buttons = this.touchButtons();
      if (buttons === DUO_BUTTONS) {
        for (let p = 0; p < 2; p++) {
          ctx.globalAlpha = 0.8;
          HF.U.text(ctx, 'P' + (p + 1), p * 480 + 101, 404, { size: 18, color: PLAYER_COLORS[p], lw: 4 });
        }
      }
      for (const b of buttons) {
        const pressed = b.action === 'pause' ? this.touch.pauseHit : this.touch.down[b.player].has(b.action);
        ctx.globalAlpha = pressed ? 0.9 : b.action === 'pause' ? 0.5 : 0.62;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, HF.TAU);
        ctx.fillStyle = pressed ? b.color : 'rgba(20,14,35,0.72)';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = b.color;
        ctx.stroke();
        const size = b.action === 'special' ? 12 : b.action === 'jump' ? 17 : b.action === 'pause' ? 18 : 32;
        const scale = b.action === 'pause' ? 1 : b.r / (b.action === 'jump' ? 50 : 46);
        HF.U.text(ctx, b.label, b.x, b.y + 1, { size: size * scale, color: pressed ? '#1d1830' : '#fff', lw: 3 });
      }
      ctx.restore();
    },

    // Called once at the start of every frame.
    poll() {
      const list = navigator.getGamepads ? navigator.getGamepads() : [];
      let n = 0;
      for (const gp of list) {
        if (!gp || !gp.connected || n > 1) continue;
        const b = (i) => gp.buttons[i] && gp.buttons[i].pressed;
        const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
        const down = new Set();
        if (ax < -0.45 || b(14)) down.add('left');
        if (ax > 0.45 || b(15)) down.add('right');
        if (ay < -0.6 || b(12)) down.add('up');
        if (ay > 0.6 || b(13)) down.add('down');
        if (b(0)) down.add('a');
        if (b(1)) down.add('b');
        if (b(2)) down.add('x');
        if (b(3)) down.add('y');
        if (b(9)) down.add('start');
        const prev = this.padDown[n];
        const hits = this.padHits[n];
        for (const k of down) if (!prev.has(k)) hits.add(k);
        if (hits.size) this.anyHit = true;
        this.padDown[n] = down;
        n++;
      }
    },

    endFrame() {
      this.hits.clear();
      this.padHits[0].clear();
      this.padHits[1].clear();
      this.mouse.clicked = false;
      this.mouse.moved = false;
      this.touch.pauseHit = false;
      this.anyHit = false;
    },

    // Held fighter buttons. In solo mode player 1 may use either key set.
    player(pi, solo) {
      const st = { left: false, right: false, jump: false, special: false };
      const maps = solo ? [P1, P2] : [pi === 0 ? P1 : P2];
      for (const m of maps) for (const k in st) if (m[k].some((c) => this.keys.has(c))) st[k] = true;
      const pd = this.padDown[pi];
      if (pd.has('left')) st.left = true;
      if (pd.has('right')) st.right = true;
      if (pd.has('a') || pd.has('up') || pd.has('y')) st.jump = true;
      if (pd.has('b') || pd.has('x') || pd.has('down')) st.special = true;
      const td = this.touch.down[pi];
      if (td.has('left')) st.left = true;
      if (td.has('right')) st.right = true;
      if (td.has('jump')) st.jump = true;
      if (td.has('special')) st.special = true;
      return st;
    },

    // Menu presses. pi undefined means "anyone".
    menu(pi) {
      const r = { up: false, down: false, left: false, right: false, ok: false, back: false };
      const map = pi == null ? MENU_ANY : MENU_P[pi];
      for (const k in r) if (map[k].some((c) => this.hits.has(c))) r[k] = true;
      const pads = pi == null ? [0, 1] : [pi];
      for (const p of pads) {
        const h = this.padHits[p];
        if (h.has('up')) r.up = true;
        if (h.has('down')) r.down = true;
        if (h.has('left')) r.left = true;
        if (h.has('right')) r.right = true;
        if (h.has('a') || h.has('start')) r.ok = true;
        if (h.has('b')) r.back = true;
      }
      return r;
    },

    pausePressed() {
      return this.touch.pauseHit || this.hits.has('Escape') || this.hits.has('KeyP') || this.padHits[0].has('start') || this.padHits[1].has('start');
    },
  };
})();
