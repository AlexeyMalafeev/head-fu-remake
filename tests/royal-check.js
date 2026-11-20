// Exercise the special button from both sides, including the story boss's alternating shots.
(function () {
  const dt = 1 / 120;
  for (const side of [0, 1]) {
    for (const shot of ['straight', 'arc', 'down']) {
      const defs = [HF.FIGHTER.kenji, HF.FIGHTER.kenji];
      defs[side] = HF.FIGHTER.emperor;
      const b = new HF.Battle({ defs });
      const f = b.f[side], target = b.other(f);
      const dir = side === 0 ? 1 : -1;
      f.rage = shot === 'arc';
      f.fireAlt = 1;
      if (shot === 'down') {
        f.onGround = false;
        f.y -= 140;
        target.x = f.x + dir * (f.r + 140);
      }
      b.active = true;
      const inputs = [];
      inputs[side] = { special: true };
      b.step(dt, inputs);
      const p = b.proj[0];
      if (!p || p.type !== 'fire' || p.vx * dir <= 0 || f.cool <= 0) throw new Error('Missing royal shot: ' + shot);
      if (shot === 'straight' && (p.vy !== 0 || p.g !== 0)) throw new Error('Ground shot must fly straight');
      if (shot === 'arc' && (p.vy >= 0 || p.g <= 0)) throw new Error('Rage shot must arc');
      if (shot === 'down') {
        if (p.vy !== Math.abs(p.vx) || p.g !== 0 || f.state === 'pound') throw new Error('Expected diagonal shot');
        for (let frame = 0; frame < 90 && b.proj.length; frame++) b.step(dt, []);
        if (!b.events.some(e => e.type === 'burn' && e.f === target)) throw new Error('Diagonal shot missed');
      }
    }
  }
  print('Royal Rage OK: straight, arcing and downward fireballs from both sides');
})();
