#!/bin/sh
# Headless checks using the JavaScriptCore shell that ships with macOS (no installs needed).
#   1. every song has whole bars and matching channel lengths
#   2. multi-touch, pointer, keyboard and pause input
#   3. translation coverage, saved language and text formatting
#   4. release metadata and seeded random stream
#   5. Pop-Up Hat timing, contact and follow-up stomp
#   6. Ink Recall timing, ground and air returns, and mirror matches
#   7. Wall Chime priming, rebounds from both walls, and resets
#   8. AI-vs-AI simulations: difficulty ladder, roster balance, final boss tuning
cd "$(dirname "$0")/.." || exit 1
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc
"$JSC" tests/prelude.js js/util.js js/music.js tests/music-check.js || exit 1
"$JSC" tests/prelude.js tests/input-prelude.js js/input.js tests/input-check.js || exit 1
"$JSC" tests/prelude.js tests/i18n-prelude.js js/util.js js/i18n.js js/fighters.js js/stages.js js/story.js tests/i18n-check.js || exit 1
"$JSC" tests/prelude.js js/util.js tests/sim-random.js tests/engineering-check.js || exit 1
"$JSC" tests/prelude.js js/util.js js/fighters.js js/fighter.js js/battle.js tests/hat-check.js || exit 1
"$JSC" tests/prelude.js js/util.js js/fighters.js js/fighter.js js/battle.js tests/ink-check.js || exit 1
"$JSC" tests/prelude.js js/util.js js/fighters.js js/fighter.js js/battle.js tests/chime-check.js || exit 1
echo
exec "$JSC" tests/prelude.js js/util.js js/fighters.js js/fighter.js js/battle.js js/ai.js tests/sim-random.js "$@" tests/sim.js
