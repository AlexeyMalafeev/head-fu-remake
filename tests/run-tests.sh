#!/bin/sh
# Headless checks using the JavaScriptCore shell that ships with macOS (no installs needed).
#   1. every song has whole bars and matching channel lengths
#   2. multi-touch, pointer, keyboard and pause input
#   3. AI-vs-AI simulations: difficulty ladder, roster balance, final boss tuning
cd "$(dirname "$0")/.." || exit 1
JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc
"$JSC" tests/prelude.js js/util.js js/music.js tests/music-check.js || exit 1
"$JSC" tests/prelude.js tests/input-prelude.js js/input.js tests/input-check.js || exit 1
echo
exec "$JSC" tests/prelude.js js/util.js js/fighters.js js/fighter.js js/battle.js js/ai.js "$@" tests/sim.js
