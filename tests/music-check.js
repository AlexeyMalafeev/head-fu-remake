// Checks that every song has whole bars and channels of matching length. Run via tests/run-tests.sh
const probs = HF.Music.problems;
for (const n in HF.Music.songs) {
  const s = HF.Music.songs[n];
  print(n.padEnd(8), 'steps', s.length, 'seconds', (s.length * s.stepDur).toFixed(1));
}
print(probs.length ? 'PROBLEMS:\n' + probs.join('\n') : 'music OK: every part has whole bars and matching lengths');
