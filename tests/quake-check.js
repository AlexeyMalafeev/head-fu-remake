// Check floor contact on the impact frame, including jumps and landings from either side.
(function () {
  'use strict';
  const dt = 1 / 120;
  for (const side of [0, 1]) {
    for (const contact of ['ground', 'jump', 'landing']) {
      const defs = [HF.FIGHTER.kenji, HF.FIGHTER.kenji];
      defs[side] = HF.FIGHTER.gonta;
      const b = new HF.Battle({ defs });
      const gonta = b.f[side], target = b.other(gonta);
      b.active = true;
      gonta.x = HF.ARENA_L + gonta.r;
      target.x = HF.ARENA_R - target.r;
      const inputs = [];
      inputs[side] = { special: true };
      b.step(dt, inputs);
      inputs[side] = null;
      for (let frame = 0; frame < 120 && !b.events.some(e => e.type === 'shock'); frame++) {
        if (gonta.state === 'pound' && gonta.poundT <= 0 && gonta.y + gonta.r + 1650 * dt >= HF.GROUND) {
          if (contact === 'jump') inputs[1 - side] = { jump: true };
          if (contact === 'landing') {
            target.onGround = false;
            target.y -= 1;
            target.vy = 200;
          }
        }
        b.step(dt, inputs);
      }
      const hit = contact !== 'jump';
      if (!b.events.some(e => e.type === 'shock') || target.hp !== target.maxHp - (hit ? 10 : 0) || target.stunT !== (hit ? 1.5 : 0)) {
        throw new Error('Quake Pound failed for side ' + side + ', target ' + contact);
      }
    }
  }
  print('Quake Pound OK: full-floor damage, stun, impact-frame jumps and landings on both sides');
})();
