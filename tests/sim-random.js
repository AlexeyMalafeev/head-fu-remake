// Test-only random stream. Never loaded by the game.
var SimRandom = (function () {
  let state = 0;
  return {
    seed(value) {
      state = value >>> 0;
    },
    random() {
      // Mulberry32: 32-bit state with a full-period increment.
      state = (state + 0x6D2B79F5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    key(text) {
      let hash = 2166136261;
      for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
      return hash >>> 0;
    },
  };
})();
