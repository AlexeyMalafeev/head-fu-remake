var navigator = { maxTouchPoints: 1, getGamepads: () => [] };
var windowListeners = {};
var canvasListeners = {};
// Each entry calls every listener added for that event type, like the real dispatcher.
window.addEventListener = (type, fn) => {
  const prev = windowListeners[type];
  windowListeners[type] = prev ? (e) => (prev(e), fn(e)) : fn;
};
var canvas = {
  addEventListener: (type, fn) => (canvasListeners[type] = fn),
  setPointerCapture() {},
  focus() {},
};
window.HF = {
  W: 960,
  H: 540,
  TAU: Math.PI * 2,
  U: { text() {} },
  Game: { scene: null, toLogical: (x, y) => ({ x, y }) },
  Audio: { unlocks: 0, unlock() { this.unlocks++; } },
};
HF.MatchScene = function () {};
HF.Game.scene = new HF.MatchScene();
Object.assign(HF.Game.scene, { demo: false, solo: true, paused: false, ended: false });
