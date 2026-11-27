# Head-Fu Rebound — The Way of the Noggin

A remake of the lost Flash game *Head-Fu*: two comic anime heads with no bodies, fighting by jumping on each other's heads.

Play in a browser or on Android, with keyboard, gamepad or touch controls.

## History

*Head-Fu* was a small Flash game I made in the early 2000s, one of the first games I ever wrote. Two disembodied heads bounced around an arena, and the only way to win was to land on your opponent's head.

It never left my computer: there was no repository and no copy online. Around 2010, a move to a new machine went without a proper backup, and the game was lost for good.

This remake rebuilds it from memory. The code, drawings, characters, story and music are all new. It keeps the core idea, two heads stomping each other, and adds what the original never had: a roster of fighters with special moves, a story mode, computer opponents, gamepad and touch controls, and an Android app. This time it lives in git.

## Play in a browser

Download the source code and open `index.html` in a browser.
The game uses Google Fonts when online and system fonts when offline.
The title screen shows the version and release codename in the bottom-right corner.

## Android

Download the `.apk` file attached to a [GitHub release](https://github.com/AlexeyMalafeev/head-fu-remake/releases), open it on your Android phone or tablet, and follow the installation prompts. If Android asks, allow installation from the browser or file manager you used to open the APK.

The Android app icon shows red-headband Kenji landing a stomp on pink-haired Momo.

Tap the opening artwork to enter the main menu and start the music.

The app plays in landscape with on-screen touch controls. Two people can share one phone or tablet: player 1 uses the buttons on the left, and player 2 uses the buttons on the right. Gamepads work too.

Press Android Back or the on-screen pause button to pause. The game also pauses when you switch to another app. Use the volume keys to adjust the volume.

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

Gamepads work too (first pad is player 1). Esc or P pauses. Menus also work with the mouse. On touchscreens, tap menu items and use the on-screen buttons during fights. In two-player fights each player gets their own set: player 1 the bottom-left buttons (◀ ▶ JUMP SPECIAL), player 2 the bottom-right ones. On the fighter select screen, the nine regular fighters fill a 3 × 3 grid, with Emperor Megadome and Random in a row below. On touchscreens, player 1 taps a fighter first, then player 2.

## Modes

- **Story mode.** Choose a fighter, then a difficulty. All ten fighters have their own story. Routes range from two fights to nine. Finish any story to unlock Emperor Megadome for Story and Versus.
  - **Kenji and the Great Hat Ban.** Face nine opponents on Kenji's quest to overturn the Emperor's ban on hats. When the Emperor puts on his spiked helmet, wait it out or dodge his fireballs. He enters rage mode at half health.
  - **Gonta and the Great Palace Supper.** A snowstorm strands hungry travelers at the Palace Gate. Fight through four bouts as Gonta to put supper on the table.
- **Gallery.** Finish a story on any difficulty to reveal its ending illustration. Open Gallery from the title screen to view the illustrations you have collected on this device.
- **VS CPU**: pick both fighters, a stage and a difficulty. Easy uses the former Normal bots. On Normal and Hard, each fighter has its own reaction time and aim. Hard fighters react faster and aim more accurately.
- **VS Player 2**: two players on one keyboard, one touchscreen (split on-screen buttons) or two gamepads.
- **Options**: language (English or Русский), music and sound volume, round time (30–99 s), single round or best of 3/5, fullscreen.

Choose **Options → Language / Язык → Русский** for the full Russian translation: menus, controls, fighters and their moves, story dialogue, battle messages and credits. The language changes immediately and is saved with your settings. English is the default; existing settings and fighter unlocks are preserved.

Both versus modes let you choose any of the ten arenas or select Random. Each
arena has its own battle theme.

## Fighters

| Fighter | Home arena | Style | Special |
|---|---|---|---|
| Kenji | Dojo Courtyard | Balanced | **Sky Step**: a second jump in mid-air, refreshed on every stomp |
| Momo | Courier Bridge | Small, fastest, fragile | **Zoom Dash**: invulnerable side dash that bonks anyone in the way |
| Gonta | Palace Gate | Slow and heavy, with 150 health | **Quake Pound**: slam into the floor to deal 10 damage and stun your opponent for 1.5 seconds anywhere in the arena if they are on the ground at impact |
| Sensei Fuzz | Bamboo Grove | Floaty | **Brow-copter**: hold special in the air to hover on flapping eyebrows |
| Yuki | Frosty Pass | Fast | **Frost Breath**: snowflake that freezes the foe; stomp the ice for bonus damage |
| Bao | Lantern Market | Bouncy | **Spring Bun**: hold to charge a mega jump; stomps bounce off him while charging |
| Nori | Hidden Hat Shop | Quick on the ground, modest jump, light stomps | **Pop-Up Hat**: plant a spring hat that gives a rival a short hop and stuns them for one second after landing. The hat deals no damage. Jump clear or wait for it to expire. |
| Sumi | Portrait Hall | Small and fragile, with precise air control | **Ink Recall**: tap Special to mark your position on the ground or in the air. Tap again within two seconds to return. A rival covering the mark blocks the return. |
| Poko | Palace Belfry | Sturdy, with a low jump and heavy stomps | **Wall Chime**: tap Special in midair, then touch either wall to bounce up and back into the arena. Works once before landing and has a short cooldown. |
| Emperor Megadome | Throne Room | Biggest head, unlockable | **Royal Rage**: shoot a fireball straight ahead on the ground or diagonally down in the air |

The original six regular fighters have been tuned for closer matchups: Momo and Yuki
have less health and stomp damage; Sensei Fuzz has more health, movement
speed and stomp damage; Bao has more health. Gonta trades stomp armor and power for a floor-wide Quake Pound. The Emperor keeps his stronger boss stats.

For development, build and testing instructions, see [AGENTS.md](AGENTS.md).
