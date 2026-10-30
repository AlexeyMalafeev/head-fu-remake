// Minimal browser stand-ins so game logic runs headless under macOS jsc.
var window = this;
var console = { log: (...a) => print(...a), warn: (...a) => print('WARN', ...a), error: (...a) => print('ERR', ...a) };
