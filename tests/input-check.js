function assert(ok, message) {
  if (!ok) throw new Error(message);
}

function pointer(type, id, x, y, pointerType = 'touch') {
  canvasListeners[type]({ pointerId: id, clientX: x, clientY: y, pointerType, preventDefault() {} });
}

HF.Input.init(canvas);
pointer('pointerdown', 1, 66, 446);
pointer('pointerdown', 2, 786, 446);
pointer('pointerdown', 3, 898, 446);
let state = HF.Input.player(0, true);
assert(state.left && state.jump && state.special, 'simultaneous touch buttons should be held');

pointer('pointermove', 1, 172, 446);
state = HF.Input.player(0, true);
assert(!state.left && state.right && state.jump && state.special, 'sliding should change direction without releasing other fingers');

pointer('pointerup', 2, 786, 446);
state = HF.Input.player(0, true);
assert(state.right && !state.jump && state.special, 'releasing jump should preserve movement and special');
pointer('pointercancel', 1, 172, 446);
pointer('pointerup', 3, 898, 446);
state = HF.Input.player(0, true);
assert(!state.right && !state.special, 'cancel and release should clear held buttons');

pointer('pointerdown', 4, 480, 105);
assert(HF.Input.pausePressed(), 'touch pause should produce a pause press');
HF.Input.endFrame();
assert(!HF.Input.pausePressed(), 'pause should be an edge, not a held input');
pointer('pointerup', 4, 480, 105);

HF.Game.scene.paused = true;
pointer('pointerdown', 5, 20, 20);
assert(HF.Input.mouse.clicked && HF.Input.anyHit, 'paused screens should still accept menu taps');
HF.Input.endFrame();
HF.Game.scene.paused = false;

pointer('pointerdown', 6, 66, 446, 'mouse');
assert(HF.Input.player(0, true).left, 'visible touch controls should accept mouse pointers');
pointer('pointerup', 6, 66, 446, 'mouse');

windowListeners.keydown({ code: 'KeyD', repeat: false, preventDefault() {} });
assert(HF.Input.player(0, true).right, 'keyboard movement should still work');
windowListeners.keyup({ code: 'KeyD' });
assert(!HF.Input.player(0, true).right, 'keyboard release should still work');

pointer('pointerdown', 7, 66, 446);
windowListeners.blur();
assert(!HF.Input.player(0, true).left, 'blur should clear held touch input');
const unlocks = HF.Audio.unlocks;
windowListeners.touchend({});
windowListeners.keydown({ code: 'Enter', repeat: false, preventDefault() {} });
assert(HF.Audio.unlocks === unlocks + 2, 'tap releases and key presses should unlock audio');
print('input OK: multi-touch, pointer cancellation, pause, mouse, keyboard and audio unlock');
