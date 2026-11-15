# Head-Fu Rebound — The Way of the Noggin

A remake of *Head-Fu*, the user's own lost Flash game from the early 2000s: two
comic anime heads with no bodies fight by jumping on each other's heads. Plain
HTML5 canvas and JavaScript, no build step, no dependencies; graphics are
drawn in code and all music and sound is synthesised live with the Web Audio
API. It runs from `file://`, any static server, and as a native Android app
that wraps the same files in a `WebView`. `README.md` covers controls, modes
and the roster.

## Running the game

- `python3 -m http.server 8731 --bind 127.0.0.1`, then open
  http://127.0.0.1:8731 (or open `index.html` directly).
- In the Claude desktop app, `.claude/launch.json` has the preview server
  `head-fu` on 8731.
- The English and Russian fonts come from Google Fonts; offline the game falls back
  to system fonts, so a layout that looks right offline may not online.
- Saved data lives in `localStorage` under `headfu.*` (`settings`,
  `unlocks`, `difficulty`), through `HF.store` in `js/util.js`. The preview
  browser keeps it between sessions; reset anything you changed for a test
  (for example the Emperor unlock) so the user starts clean.

## Testing

`./tests/run-tests.sh` runs five headless checks with the JavaScriptCore
shell that ships with macOS (nothing to install). Run it
after every change to game code:

1. **Music**: every song has whole bars and channels of matching length.
2. **Input**: multi-touch, pointer cancellation, pause, mouse, keyboard and
   the audio unlock (`tests/input-check.js` with a fake DOM in
   `tests/input-prelude.js`).
3. **Translations**: Russian roster, stages and story coverage, saved language,
   message templates, Cyrillic fonts, wrapping and dialogue animation
   (`tests/i18n-check.js`).
4. **Engineering**: game version and codename match the latest released
   changelog entry and Android version; seeded random values repeat.
5. **Simulations** (`tests/sim.js`): AI-vs-AI fights that print the
   difficulty ladder, each fighter's win rate against the roster at normal,
   and how the story's final boss fares against computer Kenjis of different
   skill. They also throw on a NaN position or a head below the floor.

The simulation replaces `Math.random` with a test-only seeded generator;
normal gameplay keeps its usual randomness. Each matchup has its own stream,
so changing one fighter does not change the samples for unrelated fights.
The default is seed `20261115`, with 100 fights per matchup and alternating
sides. Compare the regular-roster table (boss excluded) when balancing the
six basic fighters. To use another seed or sample size, create a temporary
JavaScript file with `var SIM_SEED = 8675309; var SIM_N = 200;`, then pass its
path to `./tests/run-tests.sh /path/to/config.js`. The seed and count appear
in the output; identical code and settings give identical output.
GitHub Actions runs the same checks on macOS for pushes and pull requests.

For anything the player sees or
touches (layout, menus, effects, touch controls), also check it in the
browser preview, including a phone-sized landscape viewport for touch.

When adding a script file, add it to `index.html` in load order, and to
`tests/run-tests.sh` if the headless checks need it.

## Building and installing the Android app

`README.md` is for players: direct them to release APKs and explain how to
play. Keep SDK setup, shell commands, project layout and testing details in
this file rather than adding them to the README.

Build with JDK 17 and Android SDK platform 34. Set `ANDROID_HOME` if the SDK
is outside Android Studio's default location:

```bash
cd android
./gradlew assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.
From the repository root, install it on a connected test device with:

```bash
"${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb" install -r android/app/build/outputs/apk/debug/app-debug.apk
```

The Gradle build syncs `index.html` and `js/` into the APK automatically;
never copy web files into `android/` by hand.

## Android tools on the development Mac

Verified on 2026-11-15: the Android SDK, `adb` (Android Debug Bridge) and
emulator executable are installed under `$HOME/Library/Android/sdk`. `adb`
was not on the shell's `PATH`; a failed `command -v adb` does not mean the
tool is missing or that macOS access was denied.

Before reporting that Android testing is blocked, check `ANDROID_HOME` and
Android Studio's default SDK location. Use the installed tools directly:

```bash
"${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb" devices -l
"${ANDROID_HOME:-$HOME/Library/Android/sdk}/emulator/emulator" -list-avds
```

An empty device list means no phone or running emulator is visible to ADB;
it is not evidence of a missing Mac permission. An installed emulator
executable also does not guarantee that a virtual device is configured.
Recheck these conditions each session rather than assuming the last result
still applies.

For a physical phone, connect it by USB, enable **Settings → Developer
options → USB debugging** on the phone, and have the user accept the phone's
debugging authorization prompt. For an emulator, use **Android Studio →
Tools → Device Manager** to create or start a virtual device. macOS needs
no additional configuration for the standard ADB device connection; do not
request broad Mac permissions to fix a missing command path. See the
[official Android device setup guide](https://developer.android.com/studio/run/device).

## Layout

```
index.html        page shell; loads the scripts below in order
js/util.js        HF namespace, constants, math and drawing helpers, HF.store, settings
js/i18n.js        Russian translation catalog, language selection and message formatting
js/input.js       keyboard, gamepad, pointer and multi-touch controls
js/audio.js       Web Audio synth voices and all sound effects
js/music.js       the soundtrack (9 tracks in a text notation) and its sequencer
js/fighters.js    roster: stats, abilities, quotes
js/faces.js       head drawing for every character, facial expressions
js/fx.js          particles, comic hit words, screen shake
js/stages.js      six stage backgrounds and their ambient particles
js/fighter.js     one fighter's physics, abilities and mood
js/battle.js      a fight's simulation: collisions, stomps, clashes, projectiles
js/ai.js          computer opponent (reaction delay and skill by difficulty)
js/ui.js          menus, panels, logo
js/match.js       fight scene: rounds, timer, HUD, effects, pause
js/scenes.js      title, fighter select, results, options, how-to-play
js/story.js       story script, cutscenes, continue screen, credits
js/main.js        canvas scaling, main loop, scene transitions
android/          native Android WebView app and Gradle build
tests/            headless checks (see Testing)
```

## Conventions

- **Code shape.** One IIFE per file that reads `window.HF` and attaches to
  it; no modules, no bundler, no dependencies, so `file://` keeps working.
  Match the surrounding style: two-space indent, single quotes, short
  comments only where the why isn't obvious.
- **The simulation is DOM-free.** `fighter.js`, `battle.js`, `ai.js`,
  `fighters.js` and `util.js` never touch `document` or the canvas outside
  drawing helpers; `battle.js` records events (stomps, jumps, KOs) that
  `match.js` turns into sound and effects. This is what keeps the headless
  simulations possible.
- **Logical resolution** is 960×540 (`HF.W`, `HF.H`); the canvas is scaled
  to fit. Lay everything out in logical pixels.
- **Balance changes** (stats in `js/fighters.js`, AI settings in
  `js/ai.js`, damage, timings): run the simulations before and after, and say
  in the changelog entry that balance changed, with the numbers that moved.
- **Android.** The Gradle build syncs `index.html` and `js/` into the APK
  (`syncWebAssets` in `android/app/build.gradle`), so never copy web files
  into `android/`. Changes to touch controls, pause or volume need a check on
  a device or emulator, not only in the browser.
- **Saves.** Renaming or restructuring `HF.settings` or `HF.unlocks` loses
  players' saved data; adding fields with defaults is fine.
- **Docs rule.** A change to what the player sees (controls, modes, a
  fighter's special) isn't done until `README.md` matches, in the same
  commit.
- **Commits:** conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`,
  `chore:`, `test:`; `RELEASE:` for releases). Commit and push to `main`
  once the work is verified (tests pass, the browser checked for visible
  changes); ask before releases and tags.

## Tracking work

`BACKLOG.md` holds bugs, open questions, engineering work and ideas;
`CHANGELOG.md` holds what shipped. Raw bug reports and ideas go to
`BACKLOG.md`, not into loose note files. When an item ships, write its
changelog entry under `## [Unreleased]` and remove it from the backlog.

Changelog entries are written for players: what changed in the game, in
plain words, bold lead-in for the headline. Internal refactors that change
nothing visible go in only when they matter to a contributor (for example a
new test).

## Versioning and releases

Semantic versioning, `vMAJOR.MINOR.PATCH`:

- **Patch**: bug fixes, text fixes, small balance tweaks.
- **Minor**: new content or features (fighters, stages, modes, moves,
  controls) that keep saved settings and unlocks working.
- **Major**: a milestone that reshapes the game, or anything that breaks
  saved data. Every major version has a **codename** shared by all its
  releases. The user picks each codename; suggest a few, never choose one.

The version must agree in the changelog heading, the git tag and
`versionName` in `android/app/build.gradle`, and `HF.VERSION` in
`js/util.js` (bump `versionCode` by one with every release). `HF.CODENAME`
in `js/util.js` holds the user-chosen major-version codename. Both appear
on the title screen; the engineering check prevents release metadata drift.

Release steps (ask first):

1. Rename `## [Unreleased]` in `CHANGELOG.md` to
   `## [vX.Y.Z "Codename"] — YYYY-MM-DD` and add a fresh empty
   `## [Unreleased]` above it. Re-read the section and prune entries that
   describe mid-cycle states that never shipped.
2. Set `HF.VERSION` and `HF.CODENAME` in `js/util.js`, set the matching
   `versionName` and bump `versionCode` in `android/app/build.gradle`.
3. Run the tests, check the game in the browser, and build the APK
   (`cd android && ./gradlew assembleDebug`).
4. Commit `RELEASE: vX.Y.Z "Codename"`, tag `vX.Y.Z` (annotated), push with
   tags.
5. Publish a GitHub Release from the tag with the released changelog section
   as notes, and attach the APK:
   `gh release create vX.Y.Z --verify-tag --latest --title 'vX.Y.Z "Codename"' --notes-file <notes> android/app/build/outputs/apk/debug/app-debug.apk`.

## Dev memory

`DEV_MEMORY.md` (gitignored, local-only) is a private diary of memorable dev
moments shared with the user. Consult it when cross-session continuity
matters; append short dated entries when a moment is worth keeping. Its
contents are private — never quote them into the changelog, backlog, docs,
or commit messages.
