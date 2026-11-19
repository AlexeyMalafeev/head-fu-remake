// Pop-Up Hat timing and eligibility through the same inputs as a match.
(function () {
  'use strict';
  function check(ok, message) { if (!ok) throw new Error(message); }
  const dt = 1 / 120;
  for (const side of [0, 1]) {
    const defs = [HF.FIGHTER.kenji, HF.FIGHTER.kenji];
    defs[side] = HF.FIGHTER.nori;
    const b = new HF.Battle({ defs });
    const nori = b.f[side], rival = b.other(nori);
    const step = (n, input, rivalInput) => {
      const inputs = [];
      inputs[side] = input;
      inputs[1 - side] = rivalInput;
      for (let i = 0; i < n; i++) b.step(dt, inputs);
    };
    const plant = () => {
      step(1);
      step(1, { special: true });
      check(b.hats[side] && !b.hats[side].armed, 'Fresh hat has a wind-up');
      return b.hats[side].x;
    };

    step(1, { special: true });
    check(!b.hats[side], 'Special can only plant during a live round');
    b.active = true;
    step(1);
    step(1, { jump: true });
    step(1, { special: true });
    check(!b.hats[side], 'Special cannot plant in midair');
    b.reset();
    const x = plant();
    nori.x -= nori.facing * 60;
    rival.x = x;
    step(24);
    check(!rival.hatPopped && !b.hats[side].armed, 'Contact during wind-up does not spring the hat');
    rival.y -= 120;
    rival.onGround = false;
    step(20);
    check(b.hats[side].armed && !rival.hatPopped, 'The rival can pass above an armed hat');
    rival.invulnT = 0.35;
    step(30);
    check(rival.onGround && b.hats[side] && !rival.hatPopped, 'The trap respects existing invulnerability');
    step(14);
    check(rival.hatPopped && !rival.onGround && !b.hats[side], 'Ground contact springs and consumes the hat');
    check(rival.hp === rival.maxHp && rival.invulnT === 0 && rival.stunT === 0, 'Pop changes neither health nor invulnerability and stun waits for landing');
    let ticks = 0;
    while (!rival.onGround && ticks++ < 45) step(1, null, { jump: true, right: true, special: true });
    check(rival.onGround && rival.stunT === 1 && rival.x === x, 'The pop is short and landing starts the full stun');
    step(119);
    check(!rival.canAct(), 'Rival is still stunned just before one second');
    step(2);
    check(rival.canAct(), 'Rival recovers after one second');

    b.reset();
    const followUp = plant();
    step(40);
    rival.x = followUp;
    nori.x -= nori.facing * 60;
    step(1);
    step(32);
    nori.x = rival.x;
    nori.y = rival.y - rival.r - nori.r + 2;
    nori.onGround = false;
    nori.vy = 400;
    step(1);
    check(rival.hp < rival.maxHp && b.events.some((e) => e.type === 'stomp'), 'A follow-up stomp still deals normal damage');

    b.reset();
    plant();
    step(390);
    check(!b.hats[side], 'An unused hat expires');
    step(120);
    plant();
    b.reset();
    check(!b.hats[side] && !rival.hatPopped && rival.stunT === 0, 'Round reset clears hat and stun state');
  }
  print('Pop-Up Hat OK: wind-up, contact, dodge, zero damage, landing stun, follow-up stomp and reset');
})();
