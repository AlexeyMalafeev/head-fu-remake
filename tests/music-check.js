// Checks song structure and the one-to-one mapping between fighters, arenas and themes.
const probs = HF.Music.problems;
if (probs.length) throw new Error(probs.join('\n'));
for (const n in HF.Music.songs) {
  const s = HF.Music.songs[n];
  print(n.padEnd(8), 'steps', s.length, 'seconds', (s.length * s.stepDur).toFixed(1));
}

const homes = new Set();
for (const f of HF.FIGHTERS) {
  if (!HF.STAGE[f.stage] || homes.has(f.stage)) throw new Error(f.name + ' needs a unique home arena');
  homes.add(f.stage);
}
if (homes.size !== HF.STAGES.length) throw new Error('Every arena needs one roster fighter');

const themes = new Set();
const melodies = new Set();
for (const stage of HF.STAGES) {
  const song = HF.Music.songs[stage.music];
  if (!song || !song.loop || themes.has(stage.music)) throw new Error(stage.name + ' needs a unique looping theme');
  themes.add(stage.music);
  const melody = JSON.stringify(song.chans[0].events);
  if (melodies.has(melody)) throw new Error(stage.name + ' reuses another arena’s melody');
  melodies.add(melody);
}
print('music OK: whole bars, matching channel lengths and ' + themes.size + ' unique home arenas with their own themes');
