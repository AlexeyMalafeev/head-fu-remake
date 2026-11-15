// Isolated storage and scene dependencies, with no browser or player saves.
var savedValues = {};
var localStorage = {
  getItem: (key) => savedValues[key] || null,
  setItem: (key, value) => { savedValues[key] = value; },
};
window.HF = { Audio: { play() {} } };
