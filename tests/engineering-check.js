// Release metadata must match the Android app and latest released changelog heading.
(function () {
  function check(ok, message) { if (!ok) throw new Error(message); }
  const gradle = readFile('android/app/build.gradle');
  const released = readFile('CHANGELOG.md').match(/^## \[v([^ ]+) "([^"]+)"\]/m);
  check(released && HF.VERSION === released[1] && HF.CODENAME === released[2], 'Game version/codename differs from latest release');
  check(gradle.includes("versionName '" + HF.VERSION + "'"), 'Android version differs from game');
  SimRandom.seed(1);
  const first = SimRandom.random();
  check(Math.abs(first - 0.6270739405881613) < 1e-15, 'Seeded random reference value changed');
  const second = SimRandom.random();
  SimRandom.seed(1);
  check(first === SimRandom.random() && second === SimRandom.random(), 'Random stream does not repeat');
  SimRandom.seed(2);
  check(first !== SimRandom.random(), 'Different seeds produce the same stream');
  print('engineering OK: release metadata and seeded random stream');
})();
