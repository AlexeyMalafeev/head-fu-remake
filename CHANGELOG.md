# Changelog

All notable changes to Head-Fu Rebound are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions follow
[semantic versioning](https://semver.org/), and every major version has a
codename shared by all of its releases.

## [Unreleased]

### Changed

- **Gonta’s Quake Pound shakes the whole floor.** A grounded rival anywhere in
  the arena takes 10 damage (up from 4) and is stunned for 1.5 seconds (up from
  1 second). Jump before impact to dodge it. Computer Gonta can use it from
  across the arena. To balance the stronger wave, Gonta loses his 30% stomp
  damage reduction and his base stomp power drops from 16 to 11. His win rate
  against the other regular fighters went from 51% to 49% across the same
  800 normal-difficulty bot fights. A second set of 1,600 fights gave him 51%.

## [v1.3.0 "Head Start"] — 2026-11-19

### Added

- **A home arena and theme for every fighter.** Meet Momo on Courier Bridge,
  Nori in the Hidden Hat Shop, Sumi in Portrait Hall and Poko in the Palace
  Belfry. Six new chiptunes give all ten arenas their own music. Story opponents
  fight in their home arenas, and all ten arenas are available in versus.

## [v1.2.0 "Head Start"] — 2026-11-19

### Added

- **Android startup artwork.** Nori, Sumi and Poko take center stage in a
  lantern-lit courtyard. Tap the artwork to open the main menu and start
  the music.

- **Poko the Bell Ringer.** Play Poko in versus or meet him at the palace
  gate before the Emperor's fight. Press Special in midair and touch either
  wall to ring his bell and rebound upward into the arena. Poko starts with
  142 health, 322 pixels per second of movement speed, a jump speed of 910
  pixels per second and 15 base stomp damage. He scored 52% across 800
  normal bot fights against the other regular fighters.

- **Sumi the Runaway Doodle.** Play Sumi in versus or meet her by the
  palace portraits in Kenji's story. Ink Recall marks a spot on the ground
  or in the air and lets her return within two seconds if the spot is clear.
  Sumi starts with 94 health, a movement speed of 340 pixels per second,
  a jump speed of 945 pixels per second and 12 base stomp damage. She
  scored 54% across 800 normal bot fights against the other regular fighters.

- **Nori the Hat Smuggler.** Play Nori in versus or meet him at the Lantern
  Market in Kenji's story. His Pop-Up Hat briefly launches rivals and stuns
  them when they land, setting up a stomp without dealing damage itself.
  Nori starts with 110 health, 340 pixels per second of movement speed,
  a jump speed of 880 pixels per second and 11 base stomp damage. He won
  47% of 800 normal bot fights against the other regular fighters.

### Changed

- **Fighter select layout.** The nine regular fighters fill a 3 × 3 grid.
  Emperor Megadome and Random sit together in a separate row underneath.

- **New Android app icon** showing Kenji landing a stomp on Momo. The icon
  also follows your launcher’s shape and supports themed colors.

## [v1.1.0 "Head Start"] — 2026-11-15

### Added
- **Version on the title screen**: the bottom-right corner shows the version
  and its release codename.
- **Repeatable balance checks**: seeded fight simulations, a separate table
  for the six regular fighters, and automated checks on GitHub pushes and
  pull requests. Checks also keep the game and Android release versions in sync.
- **Russian language**: choose English or Русский in Options. Menus, controls,
  fighter names and moves, story dialogue, battle messages and credits are
  translated, with Cyrillic fonts and a saved language preference.
- Translation checks cover the roster, stages, story, saved language and text layout.

### Changed
- **Closer regular-fighter balance**: reduced Momo's health (80 to 73) and
  stomp power (9 to 8), reduced Yuki's health (95 to 85) and stomp power
  (11 to 10), increased Sensei Fuzz's health (110 to 125), speed (260 to
  270) and stomp power (12 to 13), and increased Bao's health (115 to 125).
  Kenji, Gonta and the Emperor keep their stats. In normal-vs-normal bot
  fights against the other five regular fighters (200 fights per matchup,
  seed 20261115), win rates changed: Kenji 49% to 50%, Momo 63% to 51%,
  Gonta 47% to 47%, Sensei Fuzz 31% to 48%, Yuki 64% to 51%, Bao 46% to
  53%. A second seed gave a 46–56% spread; human play may differ.
- **Head-Fu Rebound** is the new name, shown on the title screen, in the
  credits, in the browser tab and on the Android app.

## [v1.0.0 "Head Start"] — 2026-10-30

The ancient art of Head-Fu, reborn: the first release of the remake.

### Added
- **Six fighters and an unlockable boss**, each with a special move: Kenji's
  Sky Step, Momo's Zoom Dash, Gonta's Quake Pound, Sensei Fuzz's
  Brow-copter, Yuki's Frost Breath, Bao's Spring Bun, and Emperor
  Megadome's Royal Rage
- **Stomp combat**: land on the other head to damage it, harder from
  higher; jump into a falling head to CLANG and block the stomp. Timed
  rounds, single round or best of 3 or 5, sudden death on a tie
- **Story mode**: Kenji's quest against the Emperor's ban on hats, six
  fights with cutscenes, a final boss with a spiked helmet and a rage mode;
  beating it unlocks the Emperor for versus play
- **VS CPU** with three difficulties, and **VS Player 2** on one keyboard,
  two gamepads or one touchscreen, where each player gets their own set of
  on-screen buttons (player 1 bottom left, player 2 bottom right)
- Six stages, nine synthesised music tracks, comic hit words and effects
- Keyboard, gamepad, mouse and multi-touch controls
- **Android app**: a landscape `WebView` build with touch controls, pause on
  Back or when switching away, and volume keys
- Headless tests for music, input and AI-vs-AI balance
  (`tests/run-tests.sh`)
- Developer documentation: `AGENTS.md`, `BACKLOG.md`, this changelog,
  and a history of the original game in `README.md`
