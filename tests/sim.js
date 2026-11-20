// Headless AI-vs-AI fights to check difficulty levels and roster balance.
// Run: ./tests/run-tests.sh
(function () {
  const DT = 1 / 120;
  const seed = typeof SIM_SEED !== 'undefined' ? SIM_SEED : 20261115;
  Math.random = SimRandom.random;
  function seedFight(key, i) {
    SimRandom.seed(SimRandom.key(seed + ':' + key + ':' + i));
  }

  function fight(idA, idB, skillA, skillB, seconds) {
    const b = new HF.Battle({ defs: [HF.FIGHTER[idA], HF.FIGHTER[idB]] });
    b.active = true;
    const ais = [new HF.AI(b.f[0], b, skillA), new HF.AI(b.f[1], b, skillB)];
    let t = 0;
    const counts = { stomp: 0, clash: 0, dashHit: 0, freeze: 0, burn: 0, shockHit: 0, spikeHurt: 0 };
    while (t < seconds) {
      b.step(DT, [ais[0].update(DT), ais[1].update(DT)]);
      for (const e of b.events) if (counts[e.type] != null) counts[e.type]++;
      b.events.length = 0;
      t += DT;
      if (b.f[0].ko || b.f[1].ko) break;
      for (const f of b.f) {
        if (!isFinite(f.x) || !isFinite(f.y)) throw new Error('NaN position for ' + f.id);
        if (f.y > HF.GROUND - f.r + 0.5) throw new Error('below floor: ' + f.id);
      }
    }
    const [a, c] = b.f;
    let winner;
    if (a.ko && !c.ko) winner = 1;
    else if (c.ko && !a.ko) winner = 0;
    else {
      const ra = a.hp / a.maxHp, rc = c.hp / c.maxHp;
      winner = ra > rc ? 0 : rc > ra ? 1 : -1;
    }
    return { winner, time: t, ko: a.ko || c.ko, counts, hp: [a.hp, c.hp] };
  }

  function series(idA, idB, sA, sB, n, seconds = 60) {
    let w = [0, 0, 0], kos = 0, time = 0;
    const tot = { stomp: 0, clash: 0 };
    for (let i = 0; i < n; i++) {
      seedFight([idA, idB, sA, sB].join(':'), i);
      // alternate sides so starting position doesn't bias results
      const flip = i % 2 === 1;
      const r = flip ? fight(idB, idA, sB, sA, seconds) : fight(idA, idB, sA, sB, seconds);
      let win = r.winner;
      if (flip && win >= 0) win = 1 - win;
      w[win < 0 ? 2 : win]++;
      if (r.ko) kos++;
      time += r.time;
      tot.stomp += r.counts.stomp;
      tot.clash += r.counts.clash;
    }
    return { aWins: w[0], bWins: w[1], draws: w[2], kos, avgTime: time / n, stomps: tot.stomp / n, clashes: tot.clash / n };
  }

  const ids = HF.FIGHTERS.map((f) => f.id);
  const N = typeof SIM_N !== 'undefined' ? SIM_N : 100;
  const pct = (x) => Math.round(x * 100) + '%';

  print('Simulation seed: ' + seed + '; fights per matchup: ' + N);
  print('== Difficulty ladder (same fighter vs itself, all fighters) ==');
  for (const [hi, lo] of [['normal', 'easy'], ['hard', 'normal'], ['hard', 'easy']]) {
    let wins = 0, games = 0, kos = 0, time = 0, stomps = 0;
    for (const id of ids) {
      const s = series(id, id, hi, lo, N);
      wins += s.aWins + s.draws * 0.5;
      games += N;
      kos += s.kos;
      time += s.avgTime * N;
      stomps += s.stomps * N;
    }
    print(`${hi} beats ${lo}: ${pct(wins / games)}   KO rate ${pct(kos / games)}   avg length ${(time / games).toFixed(1)}s   stomps/fight ${(stomps / games).toFixed(1)}`);
  }

  print('\n== Roster balance at NORMAL vs NORMAL (row fighter win rate) ==');
  const regular = ids.filter((id) => !HF.FIGHTER[id].locked);
  const regularRows = {};
  for (const id of regular) regularRows[id] = { w: 0, g: 0 };
  const rows = {};
  for (const a of ids) rows[a] = { w: 0, g: 0 };
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const s = series(ids[i], ids[j], 'normal', 'normal', N);
      if (regularRows[ids[i]] && regularRows[ids[j]]) {
        regularRows[ids[i]].w += s.aWins + s.draws * 0.5;
        regularRows[ids[j]].w += s.bWins + s.draws * 0.5;
        regularRows[ids[i]].g += N;
        regularRows[ids[j]].g += N;
      }
      rows[ids[i]].w += s.aWins + s.draws * 0.5;
      rows[ids[j]].w += s.bWins + s.draws * 0.5;
      rows[ids[i]].g += N;
      rows[ids[j]].g += N;
    }
  }
  for (const id of ids) print(`${id.padEnd(8)} ${pct(rows[id].w / rows[id].g)}`);

  print('\n== Regular roster only (boss excluded) ==');
  for (const id of regular) print(`${id.padEnd(8)} ${pct(regularRows[id].w / regularRows[id].g)}`);

  // Each opponent contributes equally. Cross-tier rows exclude mirror matches too.
  const scores = {};
  for (const id of ids) scores[id] = {};
  for (const [level, opponent] of [['normal', 'easy'], ['hard', 'normal'], ['hard', 'hard']]) {
    const points = Object.fromEntries(ids.map((id) => [id, 0]));
    for (const [i, a] of ids.entries()) {
      for (const [j, b] of ids.entries()) {
        if (i === j || (level === opponent && i > j)) continue;
        const s = series(a, b, level, opponent, N);
        points[a] += s.aWins + s.draws / 2;
        if (level === opponent) points[b] += s.bWins + s.draws / 2;
      }
    }
    for (const id of ids) scores[id][level + '/' + opponent] = points[id] / ((ids.length - 1) * N);
  }
  print('\n== Each fighter vs the other nine (draws count half) ==');
  print('fighter  Normal/baseline  Normal/Normal  Hard/Normal  Hard/Hard');
  for (const id of ids) {
    const score = scores[id];
    const rates = [score['normal/easy'], rows[id].w / rows[id].g, score['hard/normal'], score['hard/hard']];
    print(id.padEnd(8) + rates.map((rate) => (rate * 100).toFixed(2).padStart(12)).join(''));
  }

  print('\n== Story final boss (story settings: 130 HP, spikes, rage) vs AI Kenji ==');
  for (const [story, offset] of [['easy', 0], ['normal', -0.05], ['hard', -0.05]]) {
    const row = [];
    for (const kSkill of [0.5, 0.7, 0.9]) {
      let w = 0, spikes = 0;
      for (let i = 0; i < N; i++) {
        seedFight('story:' + story + ':' + kSkill, i);
        const b = new HF.Battle({ defs: [HF.FIGHTER.kenji, HF.FIGHTER.emperor], boss: [false, true], hp: [100, 130], armor: [null, 1] });
        b.active = true;
        const ais = [new HF.AI(b.f[0], b, kSkill), new HF.AI(b.f[1], b, story, offset)];
        let t = 0;
        while (t < 99 && !b.f[0].ko && !b.f[1].ko) {
          b.step(DT, [ais[0].update(DT), ais[1].update(DT)]);
          for (const e of b.events) if (e.type === 'spikeHurt') spikes++;
          b.events.length = 0;
          t += DT;
        }
        const k = b.f[0], e = b.f[1];
        if (e.ko || (!k.ko && k.hp / k.maxHp > e.hp / e.maxHp)) w++;
      }
      row.push(`kenji skill ${kSkill}: ${pct(w / N)} (spike hits/fight ${(spikes / N).toFixed(1)})`);
    }
    print(`${story.padEnd(6)} boss -> ` + row.join('   '));
  }
})();
