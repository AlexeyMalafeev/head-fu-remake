# Head-Fu Remake — The Way of the Noggin

A remake of the lost Flash game *Head-Fu*: two comic anime heads with no bodies, fighting by jumping on each other's heads.

Plain HTML5 canvas and JavaScript. No build step, no dependencies. Graphics are drawn in code, and all music and sound effects are synthesized live with the Web Audio API.

## History

*Head-Fu* was a Flash game from the early 2000s, from the era when browser games spread through Flash portals and were passed around between friends. Two disembodied heads bounced around an arena, and the only way to win was to land on your opponent's head.

Like much of that era, the game is now lost. Browsers dropped Flash Player at the end of 2020, the sites that hosted it are gone, and no copy of the original `.swf` file or any trace of it online has turned up so far.

This remake rebuilds the game from memory as a new, independent work. Its code, drawings, characters, story and music are all new; nothing is taken from the original. It keeps the core idea, two heads stomping each other, and adds to it: a roster of fighters with special moves, a story mode, computer opponents, gamepad and touch controls, and an Android app.

If you remember *Head-Fu* or know who made it, please open an issue: the history above is incomplete, and finding a surviving copy would be wonderful.

## Run it

Open `index.html` in a browser. Or serve the folder and open http://localhost:8731:

```bash
python3 -m http.server 8731
```

The two display fonts load from Google Fonts. Offline, the game falls back to system fonts.

## Android

The `android/` directory contains a native landscape app that packages the same HTML and JavaScript in a `WebView`. Solo fights have multi-touch controls; Android Back or the on-screen pause button pauses the game, and so does switching away from the app. The volume keys control the game's volume. Local two-player mode uses gamepads.

Build the installable debug APK with JDK 17 and the Android SDK (platform 34) installed. Set `ANDROID_HOME` if the SDK is not in Android Studio's default location:

```bash
cd android
./gradlew assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. To install it on a connected device with USB debugging enabled:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Run that `adb` command from the repository root. The Android build automatically syncs `index.html` and `js/`, so no duplicate web assets need to be edited.

## How to play

- Land on the other head to damage it. Falling from higher hits harder.
- Jump up into a head that is falling onto you to **CLANG**: the stomp is blocked and you both bounce off.
- Every fighter has a special move (see below).
- Rounds are timed. When time runs out, the fighter with the lower health bar (in percent) loses. A tie goes to sudden death: the next hit wins.

| | Move | Jump | Special |
|---|---|---|---|
| Player 1 | A / D | W | S |
| Player 2 | ← / → | ↑ | ↓ |
| Solo (vs CPU, story) | either set | also Space | also F |

Gamepads work too (first pad is player 1). Esc or P pauses. Menus also work with the mouse. On touchscreens, tap menu items and use the on-screen buttons during solo fights.

## Modes

- **Story mode**: Kenji's quest to overturn the Emperor's ban on hats. Six fights with cutscenes between them, ending with the final boss, Emperor Megadome, who has a spiked helmet you must not stomp and a rage mode at half health. Beating the story unlocks the Emperor for versus play.
- **VS CPU**: pick both fighters, a stage and a difficulty (easy, normal, hard).
- **VS Player 2**: two players on one keyboard or two gamepads.
- **Options**: music and sound volume, round time (30–99 s), single round or best of 3/5, fullscreen.

## Fighters

| Fighter | Style | Special |
|---|---|---|
| Kenji | Balanced | **Sky Step**: a second jump in mid-air, refreshed on every stomp |
| Momo | Small, fastest, fragile | **Zoom Dash**: invulnerable side dash that bonks anyone in the way |
| Gonta | Big and heavy, takes reduced stomp damage | **Quake Pound**: slam down; the shockwave dizzies grounded foes |
| Sensei Fuzz | Floaty | **Brow-copter**: hold special in the air to hover on flapping eyebrows |
| Yuki | Fast | **Frost Breath**: snowflake that freezes the foe; stomp the ice for bonus damage |
| Bao | Bouncy | **Spring Bun**: hold to charge a mega jump; stomps bounce off him while charging |
| Emperor Megadome | Biggest head, unlockable | **Royal Rage**: fireball on the ground, ground pound in the air |

## Project layout

```
index.html        loads the scripts below in order
js/util.js        constants, math and drawing helpers, saved settings
js/input.js       keyboard, gamepad, pointer and multi-touch controls
js/audio.js       Web Audio synth voices and all sound effects
js/music.js       the soundtrack (9 original tracks in a text notation) and its sequencer
js/fighters.js    roster: stats, abilities, quotes
js/faces.js       head drawing for every character and the facial-expression library
js/fx.js          particles, comic hit words, screen shake
js/stages.js      six stage backgrounds and their ambient particles
js/fighter.js     one fighter's physics, abilities and mood
js/battle.js      a fight's simulation: collisions, stomps, clashes, projectiles
js/ai.js          computer opponent (reaction delay and skill set by difficulty)
js/ui.js          menus, panels, logo
js/match.js       fight scene: rounds, timer, HUD, effects, pause
js/scenes.js      title, fighter select, results, options, how-to-play
js/story.js       story script, cutscenes, continue screen, credits
js/main.js        canvas scaling, main loop, scene transitions
android/          native Android WebView app and Gradle build
tests/            headless checks (see below)
```

## Tests

On macOS, `./tests/run-tests.sh` runs headless checks with the built-in JavaScriptCore shell (nothing to install):

1. every song has whole bars and channels of matching length;
2. multi-touch, pointer cancellation, pause, mouse and keyboard input;
3. AI-vs-AI simulations that report how each difficulty fares against the others, each fighter's win rate against the roster, and how the final boss fares against computer Kenjis of different skill.

Use these numbers when changing stats in `js/fighters.js` or AI settings in `js/ai.js`.
