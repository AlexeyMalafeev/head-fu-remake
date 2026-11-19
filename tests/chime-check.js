// Wall Chime through the same pressed and held inputs as a match.
(function () {
  'use strict';
  function check(ok, message) { if (!ok) throw new Error(message); }
  const dt = 1 / 120;

  for (const side of [0, 1]) {
    const defs = [HF.FIGHTER.kenji, HF.FIGHTER.kenji];
    defs[side] = HF.FIGHTER.poko;
    const battle = new HF.Battle({ defs });
    const poko = battle.f[side];
    const dir = side === 0 ? 1 : -1;
    const wall = side === 0 ? HF.ARENA_L + poko.r : HF.ARENA_R - poko.r;
    const toward = side === 0 ? { left: true } : { right: true };
    const jump = { jump: true };
    const prime = { jump: true, special: true };
    const step = (frames, input) => {
      const inputs = [];
      inputs[side] = input;
      for (let i = 0; i < frames; i++) battle.step(dt, inputs);
    };
    const events = () => battle.events.filter((e) => e.type === 'wallChime');

    step(1, prime);
    check(!poko.chimePrimed, 'An inactive round cannot prime the bell');
    battle.active = true;
    battle.reset();
    step(1, { special: true });
    check(!poko.chimePrimed, 'Grounded Special cannot prime the bell');
    step(1, jump);
    step(1, prime);
    check(poko.chimePrimed && !poko.chimeUsed && poko.cool === 0, 'An airborne tap arms the bell without spending it');
    step(100);
    check(poko.onGround && !poko.chimePrimed && !events().length && poko.cool === 0, 'Landing without wall contact cancels the prime');

    battle.reset();
    poko.x = wall + dir * 35;
    step(1, prime);
    check(poko.chimePrimed && !poko.onGround, 'Jump and Special can begin together');
    const steer = Object.assign({}, prime, toward);
    for (let i = 0; i < 50 && !events().length; i++) step(1, steer);
    check(events().length === 1 && events()[0].dir === dir && poko.x === wall, 'Wall contact emits one rebound in the correct direction');
    check(poko.vx * dir > poko.st.speed && poko.vy < -poko.st.jump && poko.invulnT === 0, 'Chime launches up and in without granting immunity');
    check(poko.chimeUsed && !poko.chimePrimed && poko.meter() === 0, 'A rebound spends the chime for this airtime');
    step(1);
    check(poko.vy < -poko.st.jump, 'Releasing Jump does not shorten the wall rebound');
    poko.cool = 0;
    step(12, steer);
    check(!poko.chimePrimed && events().length === 1, 'A second tap cannot rearm during the same airtime, even after cooldown');
    step(140);
    check(poko.onGround && !poko.chimeUsed && poko.meter() === 1, 'Landing restores the wall chime once cooldown is over');
    step(1, prime);
    poko.hit(1, { hurt: 0 }, battle);
    check(!poko.chimePrimed, 'Taking a hit cancels the prime');
    battle.reset();
    check(!poko.chimePrimed && !poko.chimeUsed && poko.chimeWobble === 0 && poko.cool === 0, 'Round reset clears the chime state');

    poko.x = wall;
    step(1, jump);
    step(1, prime);
    check(events().length === 1 && poko.vx * dir > 0, 'A fighter already touching a wall can rebound from it in the air');
    check(poko.cool === poko.coolMax(), 'A successful rebound starts the full cooldown');
    step(110);
    check(poko.onGround && poko.cool > 0, 'Landing does not reset the cooldown');
    step(1, prime);
    check(!poko.chimePrimed, 'Cooldown blocks the next jump’s prime');
  }
  print('Wall Chime OK: both walls, priming, landing, recovery, interruptions and reset');
})();
