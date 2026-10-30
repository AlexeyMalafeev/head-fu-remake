// The roster: stats, abilities and personality for every fighter.
(function () {
  'use strict';
  const HF = window.HF;

  // stats: hp, speed (px/s), jump (px/s launch), gravity (multiplier), radius, power (stomp damage),
  //        air (air control 0..1+), bounce (rebound after a stomp), mass (for pushing),
  //        armor (optional multiplier on stomp damage taken).
  // rating: 1..5 bars shown on the select screen.
  HF.FIGHTERS = [
    {
      id: 'kenji',
      name: 'KENJI',
      title: 'The Hothead',
      color: '#e63946',
      voice: 1.0,
      stage: 'dojo',
      stats: { hp: 100, speed: 300, jump: 920, gravity: 1, radius: 46, power: 12, air: 0.85, bounce: 640, mass: 1 },
      rating: { power: 3, speed: 3, jump: 4, health: 3 },
      ability: 'airjump',
      abilityName: 'Sky Step',
      abilityDesc: 'Jump again in mid-air. Refreshes on every stomp!',
      quotes: [
        "Grandma's headband stays ON.",
        'My head is hard. My heart is harder.',
        'You got stomped. Respectfully.',
      ],
    },
    {
      id: 'momo',
      name: 'MOMO',
      title: 'The Pink Blur',
      color: '#ff5fa2',
      voice: 1.5,
      stage: 'market',
      stats: { hp: 80, speed: 360, jump: 950, gravity: 1, radius: 40, power: 9, air: 1.0, bounce: 640, mass: 0.7 },
      rating: { power: 2, speed: 5, jump: 4, health: 2 },
      ability: 'dash',
      abilityName: 'Zoom Dash',
      abilityDesc: 'Blink sideways, untouchable. Bonks anyone in the way.',
      quotes: ['Too slow! Way too slow!', 'Did you blink? I zoomed.', 'Speed is the best hat.'],
    },
    {
      id: 'gonta',
      name: 'GONTA',
      title: 'The Mountain',
      color: '#c9853a',
      voice: 0.6,
      stage: 'gate',
      stats: { hp: 150, speed: 285, jump: 960, gravity: 1.1, radius: 54, power: 16, air: 0.85, bounce: 600, mass: 1.6, armor: 0.7 },
      rating: { power: 5, speed: 1, jump: 2, health: 5 },
      ability: 'pound',
      abilityName: 'Quake Pound',
      abilityDesc: 'Slam straight down. The shockwave dizzies anyone on the ground. Thick skull: takes less stomp damage.',
      quotes: ['GONTA WIN. GONTA HUNGRY.', 'GONTA IS MOUNTAIN. MOUNTAIN NOT MOVE.', 'YOU FLAT NOW. LIKE PANCAKE.'],
    },
    {
      id: 'sensei',
      name: 'SENSEI FUZZ',
      title: 'The Ancient Eyebrows',
      color: '#8e7cc3',
      voice: 0.75,
      stage: 'bamboo',
      stats: { hp: 110, speed: 260, jump: 840, gravity: 0.72, radius: 46, power: 12, air: 1.1, bounce: 620, mass: 0.9 },
      rating: { power: 3, speed: 2, jump: 5, health: 3 },
      ability: 'glide',
      abilityName: 'Brow-copter',
      abilityDesc: 'Hold special in the air to flap those eyebrows and hover.',
      quotes: ['The eyebrow is mightier than the sword.', 'I was stomping heads before you had one.', 'Patience. And gravity.'],
    },
    {
      id: 'yuki',
      name: 'YUKI',
      title: 'The Frost Ninja',
      color: '#4aa8e8',
      voice: 1.25,
      stage: 'snow',
      stats: { hp: 95, speed: 320, jump: 920, gravity: 1, radius: 44, power: 11, air: 0.95, bounce: 640, mass: 0.9 },
      rating: { power: 3, speed: 4, jump: 4, health: 3 },
      ability: 'frost',
      abilityName: 'Frost Breath',
      abilityDesc: 'Breathe a snowflake that freezes the foe solid. Stomp the ice to shatter it!',
      quotes: ['Chill out.', 'Ice to meet you. Goodbye.', 'You were frozen. I was not.'],
    },
    {
      id: 'bao',
      name: 'BAO',
      title: 'The Steamed Bun',
      color: '#f2c14e',
      voice: 1.3,
      stage: 'market',
      stats: { hp: 115, speed: 315, jump: 900, gravity: 1, radius: 46, power: 13, air: 1.0, bounce: 760, mass: 1.05, armor: 0.8 },
      rating: { power: 3, speed: 3, jump: 3, health: 4 },
      ability: 'spring',
      abilityName: 'Spring Bun',
      abilityDesc: 'Hold special to squish down, release to launch sky high. Stomps bounce off a squished bun!',
      quotes: ['Fresh out of the steamer!', 'Soft outside. Champion inside.', "You've been... bun-ished."],
    },
    {
      id: 'emperor',
      name: 'EMPEROR MEGADOME',
      title: 'The Biggest Head',
      color: '#9b5de5',
      voice: 0.5,
      stage: 'throne',
      locked: true,
      stats: { hp: 190, speed: 270, jump: 1000, gravity: 1.1, radius: 58, power: 15, air: 0.8, bounce: 620, mass: 2, armor: 0.7 },
      rating: { power: 5, speed: 1, jump: 2, health: 5 },
      ability: 'royal',
      abilityName: 'Royal Rage',
      abilityDesc: 'Spit a fireball on the ground. In the air, slam down like an empire.',
      quotes: ['BOW BEFORE THE DOME.', 'My head is big. My win is bigger.', 'Kneel! ...Oh right, no knees.'],
    },
  ];

  HF.FIGHTER = {};
  for (const f of HF.FIGHTERS) HF.FIGHTER[f.id] = f;

  // Characters who only appear in story scenes.
  HF.EXTRAS = {
    granny: { id: 'granny', name: 'GRANNY', color: '#c77dff', voice: 1.1 },
    narrator: { id: 'narrator', name: '', color: '#ffffff', voice: 0.9 },
  };

  HF.fighterUnlocked = (f) => !f.locked || HF.unlocks[f.id];
})();
