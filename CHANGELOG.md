# Changelog

All notable changes to Head-Fu Rebound are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions follow
[semantic versioning](https://semver.org/), and every major version has a
codename shared by all of its releases.

## [Unreleased]

### Added
- **Version on the title screen**: the bottom-right corner shows the version
  and its release codename, currently v1.0.0 “Head Start”.
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
