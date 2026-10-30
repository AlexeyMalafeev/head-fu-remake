# Changelog

All notable changes to Head-Fu Remake are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions follow
[semantic versioning](https://semver.org/), and every major version has a
codename shared by all of its releases.

## [Unreleased]

The first version with a changelog. Everything below already exists; it
becomes the first release when it is tagged.

### Added
- **Two players on one touchscreen**: VS Player 2 no longer needs
  gamepads on phones and tablets. Each player gets their own set of
  on-screen buttons, player 1 on the bottom left and player 2 on the bottom
  right, and players pick their fighters by tapping in turn
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
- **VS CPU** with three difficulties, and **VS Player 2** on one keyboard or
  two gamepads
- Six stages, nine synthesised music tracks, comic hit words and effects
- Keyboard, gamepad, mouse and multi-touch controls
- **Android app**: a landscape `WebView` build with touch controls, pause on
  Back or when switching away, and volume keys
- Headless tests for music, input and AI-vs-AI balance
  (`tests/run-tests.sh`)
- Developer documentation: `AGENTS.md`, `BACKLOG.md`, this changelog,
  and a history of the original game in `README.md`
