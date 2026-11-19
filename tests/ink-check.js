// Ink Recall through the same pressed and held inputs as a match.
(function () {
  'use strict';
  function check(ok, message) { if (!ok) throw new Error(message); }
  const dt = 1 / 120, special = { special: true };

  for (const side of [0, 1]) {
    const defs = [HF.FIGHTER.kenji, HF.FIGHTER.kenji];
    defs[side] = HF.FIGHTER.sumi;
    const b = new HF.Battle({ defs });
    const sumi = b.f[side], rival = b.other(sumi);
    const step = (n, input) => {
      const inputs = [];
      inputs[side] = input;
      for (let i = 0; i < n; i++) b.step(dt, inputs);
    };
    const moveAway = side === 0 ? { left: true } : { right: true };

    step(1, special);
    check(!sumi.inkMark, 'Only a live round accepts Ink Recall');
    b.active = true;
    step(1);
    step(1, special);
    const ground = sumi.inkMark;
    check(ground && sumi.meter() === 1, 'First tap places a mark with a full timer');
    step(20, Object.assign({}, special, moveAway));
    check(sumi.inkMark === ground && sumi.x !== ground.x && sumi.meter() < 1, 'Holding Special only places a single stationary mark');
    step(1);
    sumi.hp -= 3;
    step(1, special);
    check(!sumi.inkMark && sumi.x === ground.x && sumi.y === ground.y && sumi.onGround, 'Second tap returns Sumi to the ground mark');
    check(sumi.vx === 0 && sumi.vy === 0 && sumi.hp === sumi.maxHp - 3 && sumi.invulnT === 0, 'Recall resets momentum without restoring health or granting immunity');
    check(sumi.cool > 0 && sumi.meter() === 0, 'Recall consumes the mark and starts the cooldown');
    step(1);
    step(1, special);
    check(!sumi.inkMark, 'Cooldown blocks a new mark');

    b.reset();
    step(25, { jump: true });
    step(1, { jump: true, special: true });
    const air = sumi.inkMark;
    check(air && air.y < ground.y, 'Sumi can mark a point in the air');
    step(23, Object.assign({ jump: true }, moveAway));
    step(1, { jump: true, special: true });
    check(sumi.x === air.x && sumi.y === air.y && !sumi.onGround && sumi.vy === 0, 'Sumi returns to the airborne position without a jump boost');
    step(1);
    check(sumi.y > air.y && sumi.vy > 0, 'Gravity resumes after an airborne recall');

    b.reset();
    step(1, special);
    const occupied = sumi.inkMark;
    step(43, moveAway);
    rival.x = occupied.x;
    const before = sumi.x;
    step(1, special);
    check(!sumi.inkMark && sumi.cool > 0 && Math.abs(sumi.x - before) < 5, 'An occupied destination consumes the mark without moving Sumi there');
    check(b.events.some((e) => e.type === 'inkBlocked'), 'A blocked recall emits feedback');

    b.reset();
    step(1, special);
    step(241);
    check(!sumi.inkMark && sumi.cool > 0, 'The mark expires after two seconds and starts cooldown');
    step(340);
    step(1, special);
    check(!!sumi.inkMark, 'A new mark can be placed when cooldown ends');
    b.reset();
    check(!sumi.inkMark && sumi.cool === 0, 'Round reset clears the mark and cooldown');
  }

  const mirror = new HF.Battle({ defs: [HF.FIGHTER.sumi, HF.FIGHTER.sumi] });
  mirror.active = true;
  const [a, b] = mirror.f;
  a.x = 480;
  mirror.step(dt, [special, null]);
  a.x = 250;
  b.x = 480;
  mirror.step(dt, [null, special]);
  b.x = 720;
  mirror.step(dt, [null, null]);
  mirror.step(dt, [special, special]);
  check(a.x === 250 && b.x === 720 && !a.inkMark && !b.inkMark, 'Overlapping simultaneous recalls block both players equally');
  check(mirror.events.filter((e) => e.type === 'inkBlocked').length === 2, 'Both sides get feedback in a mirror conflict');
  print('Ink Recall OK: ground, air, hold, occupancy, expiration, cooldown, reset and simultaneous recall');
})();
