# Head-Fu Remake Backlog

Open work, ordered roughly by priority within each section (higher first).
Fixed or shipped entries move to `CHANGELOG.md` and are pruned from here.

## Bugs / known issues

### Confirmed bugs

1. **Translucency in the sprites.** Reported by the user (2026-10-30):
   something in the drawn characters is see-through when it shouldn't be.
   Which sprites and in what situation isn't recorded yet; pin that down
   first. Heads are drawn in code (`js/faces.js`), so a likely cause is
   overlapping shapes drawn one by one under a `globalAlpha` below 1 (fades,
   blinking, effects), which lets inner layers show through the outer ones;
   the usual fix is to draw the sprite opaque to an offscreen canvas and fade
   that as one image.

### Unverified / needs a decision

1. **Roster balance spread.** At normal vs normal the simulations
   (2026-10-30) give Yuki 69% and Gonta 63% against the roster, Kenji and
   Sensei Fuzz 36%. The bots play the same simple way with every fighter, so
   this may say more about the AI than the fighters. Decide whether to tune
   stats now or wait for real-player feedback.

## Features

1. **Combos.** Reward chaining hits without touching the ground: a combo
   counter and a damage bonus for consecutive stomps (stomp, bounce, stomp
   again), with a comic word for each step («DOUBLE BONK!»). Needs a
   decision on what extends a combo (stomps only, or specials too), whether
   CLANG or landing breaks it, the bonus curve, and how it interacts with
   Kenji's Sky Step, which already refreshes on every stomp. Run the
   simulations after: combos change balance, and the AI should learn to use
   them.
2. **Swipe mode.** An alternative touch control scheme for the Android app
   and phones: swipe up to jump, swipe left or right to move, swipe down (or
   tap) for the special, instead of the on-screen buttons. Needs a decision
   on how movement works (hold after a swipe, or a fixed dash per swipe),
   how hold-to-charge specials (Bao's Spring Bun, Sensei Fuzz's
   Brow-copter) map to gestures, and where the player picks the scheme
   (Options). Add cases to `tests/input-check.js`.
3. **Expand the roster to at least 10 fighters.** Today there are six
   playable heads plus the boss, Emperor Megadome. Every new head needs a
   unique special, a face in `js/faces.js`, quotes, a place in the story and
   fighter select (the select screen layout must fit 10 or more), and a
   balance pass with the simulations.
4. **Story cycles tied to difficulty.** Beating the story unlocks a second
   and then a third pass, each a new story arc with its own mechanics
   changes. Easy gives one cycle and then an ending; normal gives two
   cycles; hard gives three, with a different mechanic in each, and ends
   with a "true" ending. Needs decisions on the three mechanics, the new
   arcs' scripts, how cycle progress is saved (new fields in `HF.unlocks`
   keep old saves working), and whether a player can start a later cycle
   directly once it is unlocked.

## Engineering

1. **Show the version.** The game has no version constant; only
   `versionName` in `android/app/build.gradle` says 1.0.0. Add
   `HF.VERSION` (and a codename once the user picks one) to `js/util.js`,
   show it on the title screen, and have the release steps keep it in sync
   with the Android build.
2. **Reproducible simulations.** `U.rand`, `U.pick` and friends call
   `Math.random`, so simulation numbers drift a few percent between runs,
   which makes small balance changes hard to measure. A seeded generator for
   the simulation (the game itself can stay unseeded) would make before and
   after comparisons exact.
3. **No CI.** The tests only run by hand on macOS (they need the
   JavaScriptCore shell). Once the project is on GitHub, a workflow that
   runs them on every push would catch breakage; GitHub's macOS runners have
   the same shell.

## Ideas

Unprioritised; each needs a design decision before work starts.

- More stages.
- Online two-player (same-device two-player on touchscreens works since
  the split on-screen buttons).
