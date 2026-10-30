// Original chiptune soundtrack and a small step sequencer to play it.
//
// Song text format, one bar (16 sixteenth-note steps) per line:
//   C5        a note             C4/E4/G4  a chord, played as a fast chip arpeggio
//   -         hold previous note .         rest
//   X:n       token lasting n steps
// Drum lines use one character per step: k kick, s snare, h hat, o open hat, c crash, t/l toms.
(function () {
  'use strict';
  const HF = window.HF;

  const SONGS = {
    // "Way of the Noggin" — title theme. Bouncy C major pentatonic.
    title: {
      bpm: 138,
      order: ['A', 'B'],
      ch: [
        {
          wave: 'pulse25', vol: 0.15, env: 'pluck', vib: 0.012,
          parts: {
            A: `C5 . C5 . G5 - E5 . G5 - . . A5 . G5 .
                E5 - D5 . C5 - D5 . E5 - - - . . . .
                C5 . C5 . G5 - E5 . G5 - . . C6 . A5 .
                G5 - E5 . D5 - E5 . C5 - - - . . . .`,
            B: `A5 - - . G5 . A5 . C6 - A5 . G5 - E5 .
                G5 - - . E5 . D5 . E5 - - - . . . .
                A5 - - . G5 . A5 . C6 - D6 . E6 - D6 .
                C6 - - - G5 - - - C6 - - - . . . .`,
          },
        },
        {
          wave: 'pulse12', vol: 0.07, env: 'pluck',
          parts: {
            A: `. . E4/G4 . . . E4/G4 . . . E4/G4 . . . E4/G4 .
                . . E4/A4 . . . E4/A4 . . . E4/A4 . . . E4/A4 .
                . . F4/A4 . . . F4/A4 . . . F4/A4 . . . F4/A4 .
                . . D4/G4 . . . D4/G4 . . . E4/G4 . . . E4/G4 .`,
            B: `. . F4/A4 . . . F4/A4 . . . F4/A4 . . . F4/A4 .
                . . E4/G4 . . . E4/G4 . . . E4/G4 . . . E4/G4 .
                . . F4/A4 . . . F4/A4 . . . D4/G4 . . . D4/B4 .
                . . E4/G4 . . . E4/G4 . . . E4/G4 . . . E4/G4/C5 .`,
          },
        },
        {
          wave: 'triangle', vol: 0.3, env: 'organ', gate: 0.8,
          parts: {
            A: `C3 . G3 . C4 . G3 . C3 . G3 . C4 . G3 .
                A2 . E3 . A3 . E3 . A2 . E3 . A3 . E3 .
                F2 . C3 . F3 . C3 . F2 . C3 . F3 . C3 .
                G2 . D3 . G3 . D3 . C3 . G3 . C4 . G3 .`,
            B: `F2 . C3 . F3 . C3 . F2 . C3 . F3 . C3 .
                C3 . G3 . C4 . G3 . C3 . G3 . C4 . G3 .
                F2 . C3 . F3 . C3 . G2 . D3 . G3 . B2 .
                C3 . G3 . C4 . G3 . C3 . G3 . C4 . G3 .`,
          },
        },
        {
          drums: true, vol: 0.8,
          parts: {
            A: 'k.h.s.h.k.hks.h. k.h.s.h.k.hks.h. k.h.s.h.k.hks.h. k.h.s.h.k.s.ssss',
            B: 'k.h.s.h.k.hks.h. k.h.s.h.k.hks.h. k.h.s.h.k.hks.h. k.h.s.h.kks.ssss',
          },
        },
      ],
    },

    // "Pick Your Noggin" — character select. Jaunty F major.
    select: {
      bpm: 152,
      order: ['A', 'B'],
      ch: [
        {
          wave: 'pulse25', vol: 0.14, env: 'pluck',
          parts: {
            A: `F5 . A5 . C6 . A5 . F5 . G5 . A5 - - .
                D5 . F5 . A5 . F5 . D5 . E5 . F5 - - .
                Bb4 . D5 . F5 . D5 . G5 . F5 . D5 - - .
                C5 . E5 . G5 . Bb5 . A5 . G5 . E5 . C5 .`,
            B: `D6 - . C6 - . Bb5 - A5 - G5 - F5 - - .
                C6 - . A5 - . F5 - A5 - C6 - F6 - - .
                Bb5 - . A5 - . G5 - F5 - E5 - G5 - - .
                F5 . C5 . F5 . A5 . C6 - - - . . . .`,
          },
        },
        {
          wave: 'pulse12', vol: 0.055, env: 'organ', arp: 0.035,
          parts: {
            A: `F4/A4/C5:16 | D4/F4/A4:16 | D4/F4/Bb4:16 | E4/G4/C5:16`,
            B: `D4/F4/Bb4:16 | F4/A4/C5:16 | G4/Bb4/D5:8 E4/G4/C5:8 | F4/A4/C5:16`,
          },
        },
        {
          wave: 'triangle', vol: 0.3, env: 'organ', gate: 0.75,
          parts: {
            A: `F2 . F3 . F2 . F3 . F2 . F3 . F2 . F3 .
                D2 . D3 . D2 . D3 . D2 . D3 . D2 . D3 .
                Bb1 . Bb2 . Bb1 . Bb2 . Bb1 . Bb2 . Bb1 . Bb2 .
                C2 . C3 . C2 . C3 . C2 . C3 . E2 . G2 .`,
            B: `Bb1 . Bb2 . Bb1 . Bb2 . Bb1 . Bb2 . Bb1 . Bb2 .
                F2 . F3 . F2 . F3 . F2 . F3 . F2 . F3 .
                G2 . G3 . G2 . G3 . C2 . C3 . C2 . C3 .
                F2 . F3 . F2 . F3 . F2 . F3 . F2 . F3 .`,
          },
        },
        {
          drums: true, vol: 0.7,
          parts: {
            A: 'k.h.s.hhk.hks.hh k.h.s.hhk.hks.hh k.h.s.hhk.hks.hh k.h.s.h.k.s.ss.s',
            B: 'k.h.s.hhk.hks.hh k.h.s.hhk.hks.hh k.h.s.hhk.hks.hh k.h.s.h.k.s.ssss',
          },
        },
      ],
    },

    // "Bonk Bonk Dojo" — battle theme 1. Driving A minor.
    battle1: {
      bpm: 162,
      order: ['A', 'B'],
      ch: [
        {
          wave: 'pulse25', vol: 0.15, env: 'pluck', vib: 0.012,
          parts: {
            A: `A4 . C5 . D5 . E5 - . . G5 . E5 . D5 .
                E5 - - . D5 . C5 . A4 - - - . . G4 .
                A4 . C5 . D5 . E5 - . . A5 . G5 . E5 .
                D5 - - . E5 . D5 . B4 - - - G4 - - .`,
            B: `C6 - - . B5 . A5 . G5 - E5 . G5 - . .
                B5 - - . A5 . G5 . D5 - - - . . . .
                A5 - - . G5 . E5 . D5 - C5 . D5 - E5 .
                E5 - - - G#5 - - - B5 - - - E6 - - .`,
          },
        },
        {
          wave: 'pulse12', vol: 0.06, env: 'organ',
          parts: {
            A: `A3/C4/E4:16 | A3/C4/E4:16 | F3/A3/C4:16 | G3/B3/D4:16`,
            B: `C4/E4/G4:16 | G3/B3/D4:16 | A3/C4/E4:16 | E3/G#3/B3:16`,
          },
        },
        {
          wave: 'triangle', vol: 0.32, env: 'organ', gate: 0.75,
          parts: {
            A: `A2 . A3 . A2 . A3 . A2 . A3 . A2 . A3 .
                A2 . A3 . A2 . A3 . A2 . A3 . G2 . G3 .
                F2 . F3 . F2 . F3 . F2 . F3 . F2 . F3 .
                G2 . G3 . G2 . G3 . G2 . G3 . G2 . B2 .`,
            B: `C3 . C4 . C3 . C4 . C3 . C4 . C3 . C4 .
                G2 . G3 . G2 . G3 . G2 . G3 . G2 . G3 .
                A2 . A3 . A2 . A3 . A2 . A3 . A2 . A3 .
                E2 . E3 . E2 . E3 . E2 . E3 . G#2 . B2 .`,
          },
        },
        {
          drums: true, vol: 0.85,
          parts: {
            A: 'k.h.s.hkk.h.s.h. k.h.s.hkk.h.s.h. k.h.s.hkk.h.s.h. k.h.s.hkk.s.ssss',
            B: 'k.h.s.hkk.h.s.h. k.h.s.hkk.h.s.h. k.h.s.hkk.h.s.h. k.s.k.s.ssssssss',
          },
        },
      ],
    },

    // "Noodle Rush" — battle theme 2. Skipping G major.
    battle2: {
      bpm: 150,
      order: ['A', 'B'],
      ch: [
        {
          wave: 'pulse50', vol: 0.11, env: 'pluck', vib: 0.01,
          parts: {
            A: `G5 . . B5 D6 . B5 . G5 . A5 . B5 - - .
                E5 . . G5 B5 . G5 . E5 . F#5 . G5 - - .
                C5 . . E5 G5 . E5 . C6 . B5 . A5 - - .
                D5 . F#5 . A5 . C6 . B5 . A5 . F#5 . D5 .`,
            B: `B5 - A5 . G5 - A5 . B5 . D6 . B5 - - .
                G5 - F#5 . E5 - F#5 . G5 . B5 . G5 - - .
                E5 . G5 . C6 . E5 . F#5 . A5 . D6 . C6 .
                B5 - - - D6 - - - G6 - - - . . . .`,
          },
        },
        {
          wave: 'pulse12', vol: 0.07, env: 'pluck',
          parts: {
            A: `. . B3/D4 . . . B3/D4 . . . B3/D4 . . . B3/D4 .
                . . G3/B3 . . . G3/B3 . . . G3/B3 . . . G3/B3 .
                . . C4/E4 . . . C4/E4 . . . C4/E4 . . . C4/E4 .
                . . D4/F#4 . . . D4/F#4 . . . D4/F#4 . . . D4/F#4 .`,
            B: `. . B3/D4 . . . B3/D4 . . . B3/D4 . . . B3/D4 .
                . . G3/B3 . . . G3/B3 . . . G3/B3 . . . G3/B3 .
                . . C4/E4 . . . C4/E4 . . . D4/F#4 . . . D4/F#4 .
                . . B3/D4 . . . B3/D4 . . . B3/D4 . . . B3/D4 .`,
          },
        },
        {
          wave: 'triangle', vol: 0.32, env: 'organ', gate: 0.75,
          parts: {
            A: `G2 . . G2 B2 . D3 . G2 . . G2 B2 . D3 .
                E2 . . E2 G2 . B2 . E2 . . E2 G2 . B2 .
                C3 . . C3 E3 . G3 . C3 . . C3 E3 . G3 .
                D3 . . D3 F#3 . A3 . D3 . . D3 F#3 . A3 .`,
            B: `G2 . . G2 B2 . D3 . G2 . . G2 B2 . D3 .
                E2 . . E2 G2 . B2 . E2 . . E2 G2 . B2 .
                C3 . . C3 E3 . G3 . D3 . . D3 F#3 . A3 .
                G2 . . G2 B2 . D3 . G2 . D3 . G2 . . .`,
          },
        },
        {
          drums: true, vol: 0.75,
          parts: {
            A: 'k.hhs.hhk.hhs.hh k.hhs.hhk.hhs.hh k.hhs.hhk.hhs.hh k.hhs.hhk.s.ssss',
            B: 'k.hhs.hhk.hhs.hh k.hhs.hhk.hhs.hh k.hhs.hhk.hhs.hh k.hhs.hhk.s.ssss',
          },
        },
      ],
    },

    // "Frosty Fists" — battle theme 3. Icy D minor with shimmering arpeggios.
    battle3: {
      bpm: 150,
      order: ['A', 'B'],
      ch: [
        {
          wave: 'pulse12', vol: 0.16, env: 'pluck', vib: 0.015,
          parts: {
            A: `D5 . F5 . A5 - - . G5 . F5 . E5 . F5 .
                D5 - - . Bb4 . D5 . F5 - - - . . . .
                C5 . E5 . G5 - - . F5 . E5 . D5 . E5 .
                C#5 - - . E5 . A5 . G5 - - - E5 - - .`,
            B: `D6 - - . C6 . A5 . F5 - - . A5 . C6 .
                D6 - - . C6 . Bb5 . F5 - - - . . . .
                G5 . Bb5 . D6 . Bb5 . A5 . C#6 . E6 . C#6 .
                D6 - - - A5 - - - D5 - - - . . . .`,
          },
        },
        {
          wave: 'pulse25', vol: 0.05, env: 'organ', arp: 0.03,
          parts: {
            A: `D4/F4/A4:16 | D4/F4/Bb4:16 | E4/G4/C5:16 | C#4/E4/A4:16`,
            B: `D4/F4/A4:16 | D4/F4/Bb4:16 | G4/Bb4/D5:8 C#4/E4/A4:8 | D4/F4/A4:16`,
          },
        },
        {
          wave: 'triangle', vol: 0.32, env: 'organ', gate: 0.75,
          parts: {
            A: `D2 . D3 . A2 . D3 . D2 . D3 . A2 . D3 .
                Bb1 . Bb2 . F2 . Bb2 . Bb1 . Bb2 . F2 . Bb2 .
                C2 . C3 . G2 . C3 . C2 . C3 . G2 . C3 .
                A1 . A2 . E2 . A2 . A1 . A2 . C#3 . E3 .`,
            B: `D2 . D3 . A2 . D3 . D2 . D3 . A2 . D3 .
                Bb1 . Bb2 . F2 . Bb2 . Bb1 . Bb2 . F2 . Bb2 .
                G2 . G3 . D3 . G3 . A2 . A3 . E3 . A3 .
                D2 . D3 . A2 . D3 . D2 - - - . . . .`,
          },
        },
        {
          drums: true, vol: 0.75,
          parts: {
            A: 'k.h.s.h.k.h.s.hk k.h.s.h.k.h.s.hk k.h.s.h.k.h.s.hk k.h.s.h.k.ssssss',
            B: 'k.h.s.h.k.h.s.hk k.h.s.h.k.h.s.hk k.h.s.h.k.h.s.hk k.h.s.h.k.ssssss',
          },
        },
      ],
    },

    // "Megadome's March" — final boss. Galloping E minor, pompous and a bit silly.
    boss: {
      bpm: 172,
      order: ['A', 'B'],
      ch: [
        {
          wave: 'pulse25', vol: 0.15, env: 'pluck', vib: 0.012,
          parts: {
            A: `E5 . E5 . B4 . E5 . G5 - F#5 . E5 - D#5 .
                E5 - - . . . G5 . C6 - B5 . A5 - G5 .
                A5 . A5 . E5 . A5 . C6 - B5 . A5 - G5 .
                F#5 - - . D#5 - - . B4 - - . D#5 - F#5 .`,
            B: `B5 - - . A5 . G5 . F#5 - G5 . E5 - - .
                C6 - - . B5 . A5 . G5 - A5 . E5 - - .
                D6 - - . C6 . B5 . A5 - B5 . F#5 - - .
                D#6 - - . B5 - - . F#5 - - . D#5 - B4 .`,
          },
        },
        {
          wave: 'pulse12', vol: 0.075, env: 'pluck',
          parts: {
            A: `E4/B4 . . E4/B4 . . E4/B4 . . . E4/B4 . E4/B4 . . .
                C4/G4 . . C4/G4 . . C4/G4 . . . C4/G4 . C4/G4 . . .
                A3/E4 . . A3/E4 . . A3/E4 . . . A3/E4 . A3/E4 . . .
                B3/F#4 . . B3/F#4 . . B3/F#4 . . . B3/F#4 . B3/F#4 . . .`,
            B: `E4/B4 . . E4/B4 . . E4/B4 . . . E4/B4 . E4/B4 . . .
                C4/G4 . . C4/G4 . . C4/G4 . . . C4/G4 . C4/G4 . . .
                D4/A4 . . D4/A4 . . D4/A4 . . . D4/A4 . D4/A4 . . .
                B3/F#4 . . B3/F#4 . . B3/F#4 . . . B3/F#4 . B3/F#4 . . .`,
          },
        },
        {
          wave: 'triangle', vol: 0.32, env: 'organ', gate: 0.7,
          parts: {
            A: `E2 . E2 E3 E2 . E2 E3 E2 . E2 E3 E2 . E2 E3
                C2 . C2 C3 C2 . C2 C3 C2 . C2 C3 C2 . C2 C3
                A1 . A1 A2 A1 . A1 A2 A1 . A1 A2 A1 . A1 A2
                B1 . B1 B2 B1 . B1 B2 B1 . B1 B2 B1 . B1 B2`,
            B: `E2 . E2 E3 E2 . E2 E3 E2 . E2 E3 E2 . E2 E3
                C2 . C2 C3 C2 . C2 C3 C2 . C2 C3 C2 . C2 C3
                D2 . D2 D3 D2 . D2 D3 D2 . D2 D3 D2 . D2 D3
                B1 . B1 B2 B1 . B1 B2 B1 . B1 B2 B1 . B1 B2`,
          },
        },
        {
          drums: true, vol: 0.85,
          parts: {
            A: 'k.hks.hkk.hks.hh k.hks.hkk.hks.hh k.hks.hkk.hks.hh k.hks.hkk.s.ssss',
            B: 'k.hks.hkk.hks.hh k.hks.hkk.hks.hh k.hks.hkk.hks.hh k.hks.hkk.ssssss',
          },
        },
      ],
    },

    // "Tea Time Tales" — story cutscenes. Gentle and a little goofy.
    story: {
      bpm: 96,
      order: ['A', 'B'],
      ch: [
        {
          wave: 'pulse25', vol: 0.1, env: 'organ', vib: 0.012, vibRate: 5,
          parts: {
            A: `E5 - - - G5 - A5 - G5 - - - E5 - D5 -
                C5 - - - E5 - D5 - C5 - A4 - - - - -
                A4 - C5 - D5 - - - C5 - A4 - G4 - - -
                G4 - A4 - C5 - D5 - E5 - - - D5 - - -`,
            B: `F5 - - - E5 - D5 - C5 - - - A4 - - -
                G4 - - - C5 - E5 - G5 - - - E5 - - -
                F5 - E5 - D5 - C5 - D5 - - - A4 - - -
                B4 - - - D5 - - - G5 - - - - - - -`,
          },
        },
        {
          wave: 'pulse12', vol: 0.045, env: 'organ', arp: 0.09,
          parts: {
            A: `C4/E4/G4:16 | A3/C4/E4:16 | F3/A3/C4:16 | G3/B3/D4:16`,
            B: `F3/A3/C4:16 | C4/E4/G4:16 | D4/F4/A4:16 | G3/B3/D4:16`,
          },
        },
        {
          wave: 'triangle', vol: 0.28, env: 'organ',
          parts: {
            A: `C3:8 G2:8 | A2:8 E2:8 | F2:8 C3:8 | G2:8 D3:8`,
            B: `F2:8 C3:8 | C3:8 G2:8 | D3:8 A2:8 | G2:8 D3:8`,
          },
        },
        {
          drums: true, vol: 0.45,
          parts: {
            A: 'k...h...s...h... k...h...s...h... k...h...s...h... k...h...s...h.h.',
            B: 'k...h...s...h... k...h...s...h... k...h...s...h... k...h...s.s.s.s.',
          },
        },
      ],
    },

    victory: {
      bpm: 150,
      loop: false,
      order: ['V'],
      ch: [
        {
          wave: 'pulse25', vol: 0.16, env: 'organ', vib: 0.012,
          parts: {
            V: `G4 . C5 . E5 . G5 . C6 - - - B5 . C6 .
                D6 - - - E6 - D6 . C6 - - - - - - .`,
          },
        },
        { wave: 'pulse12', vol: 0.07, env: 'organ', parts: { V: `C4/E4/G4:8 F4/A4/C5:8 | G4/B4/D5:8 C4/E4/G4:8` } },
        {
          wave: 'triangle', vol: 0.3, env: 'organ',
          parts: { V: `C3 . . . C3 . . . F2 . . . F2 . . . | G2 . . . G2 . . . C3 - - - - - - .` },
        },
        { drums: true, vol: 0.8, parts: { V: 'k...k...k...k.s. k.s.k.s.c.......' } },
      ],
    },

    defeat: {
      bpm: 100,
      loop: false,
      order: ['D'],
      ch: [
        {
          wave: 'pulse50', vol: 0.12, env: 'organ', vib: 0.03, vibRate: 6,
          parts: { D: `G4 - - . F#4 - - . F4 - - . E4:12 . . . . . . . .` },
        },
        {
          wave: 'triangle', vol: 0.3, env: 'organ',
          parts: { D: `G2 - - . F#2 - - . F2 - - . E2:12 . . . . . . . .` },
        },
      ],
    },
  };

  // ---------- compiler ----------
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function noteFreq(n) {
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(n);
    if (!m) throw new Error('Bad note: ' + n);
    const semi = SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const midi = (parseInt(m[3], 10) + 1) * 12 + semi;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function parseMelodic(text) {
    const steps = [];
    for (const tok of text.replace(/\|/g, ' ').trim().split(/\s+/)) {
      if (!tok) continue;
      const [body, lenStr] = tok.split(':');
      const len = lenStr ? parseInt(lenStr, 10) : 1;
      if (body === '-' || body === '.') {
        for (let i = 0; i < len; i++) steps.push(body);
      } else {
        steps.push({ freqs: body.split('/').map(noteFreq) });
        for (let i = 1; i < len; i++) steps.push('-');
      }
    }
    return steps;
  }

  const parseDrums = (text) => text.replace(/[\s|]/g, '').split('');

  function toEvents(steps) {
    const ev = new Array(steps.length).fill(null);
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (s && typeof s === 'object') {
        let d = 1;
        while (i + d < steps.length && steps[i + d] === '-') d++;
        ev[i] = { freqs: s.freqs, dur: d };
      }
    }
    return ev;
  }

  function compile(name, song) {
    const partLen = {};
    const parsed = song.ch.map((ch) => {
      const out = {};
      for (const p in ch.parts) {
        out[p] = ch.drums ? parseDrums(ch.parts[p]) : parseMelodic(ch.parts[p]);
        partLen[p] = Math.max(partLen[p] || 0, out[p].length);
      }
      return out;
    });
    const problems = [];
    for (const p in partLen) if (partLen[p] % 16) problems.push(`${name} part ${p}: ${partLen[p]} steps is not whole bars`);
    const chans = song.ch.map((ch, ci) => {
      let steps = [];
      for (const p of song.order) {
        const s = (parsed[ci][p] || []).slice();
        if (parsed[ci][p] && s.length !== partLen[p]) {
          problems.push(`${name} channel ${ci} part ${p}: ${s.length} steps, expected ${partLen[p]}`);
        }
        while (s.length < partLen[p]) s.push('.');
        steps = steps.concat(s.slice(0, partLen[p]));
      }
      const events = ch.drums ? steps.map((c) => (c === '.' ? null : c)) : toEvents(steps);
      return Object.assign({}, ch, { events });
    });
    const length = song.order.reduce((a, p) => a + partLen[p], 0);
    return { name, stepDur: 60 / song.bpm / 4, loop: song.loop !== false, length, chans, problems };
  }

  const COMPILED = {};
  for (const name in SONGS) COMPILED[name] = compile(name, SONGS[name]);

  // ---------- player ----------
  const M = (HF.Music = {
    songs: COMPILED,
    cur: null,
    name: null,
    pending: null,
    step: 0,
    next: 0,
    timer: null,
    out: null,
    onEnd: null,

    play(name, onEnd) {
      const A = HF.Audio;
      if (!A.ctx) {
        this.pending = name;
        return;
      }
      if (this.name === name && this.cur) return;
      this.stop(0.08);
      const song = COMPILED[name];
      if (!song) return;
      this.cur = song;
      this.name = name;
      this.onEnd = onEnd || null;
      this.out = A.ctx.createGain();
      this.out.connect(A.musicBus);
      this.step = 0;
      this.next = A.ctx.currentTime + 0.08;
      this.timer = setInterval(() => this.pump(), 25);
      this.pump();
    },

    stop(fade = 0.25) {
      this.pending = null;
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
      if (this.out) {
        const g = this.out;
        const ctx = HF.Audio.ctx;
        g.gain.setTargetAtTime(0, ctx.currentTime, fade / 3 + 0.001);
        setTimeout(() => g.disconnect(), fade * 1000 + 400);
      }
      this.out = null;
      this.cur = null;
      this.name = null;
    },

    pump() {
      const ctx = HF.Audio.ctx;
      if (!this.cur || !ctx) return;
      // After the tab sleeps, jump ahead instead of playing a burst of late notes.
      if (this.next < ctx.currentTime - 0.2) this.next = ctx.currentTime + 0.05;
      while (this.cur && this.next < ctx.currentTime + 0.15) {
        this.schedule(this.step, this.next);
        this.next += this.cur.stepDur;
        this.step++;
        if (this.step >= this.cur.length) {
          if (this.cur.loop) this.step = 0;
          else {
            const cb = this.onEnd;
            const delay = (this.next - ctx.currentTime) * 1000;
            clearInterval(this.timer);
            this.timer = null;
            this.cur = null;
            this.name = null;
            if (cb) setTimeout(cb, delay);
          }
        }
      }
    },

    schedule(step, t) {
      for (const ch of this.cur.chans) {
        const e = ch.events[step];
        if (!e) continue;
        if (ch.drums) this.drum(e, t, ch.vol || 1);
        else this.note(ch, e.freqs, t, e.dur * this.cur.stepDur);
      }
    },

    note(ch, freqs, t, dur) {
      const A = HF.Audio, ctx = A.ctx;
      const gate = dur * (ch.gate || 0.92);
      const o = A.osc(ch.wave || 'pulse25', freqs[0], t);
      if (freqs.length > 1) {
        const rate = ch.arp || 0.032;
        let k = 0;
        for (let tt = t; tt < t + gate; tt += rate, k++) o.frequency.setValueAtTime(freqs[k % freqs.length], tt);
      } else if (ch.vib && gate > 0.28) {
        const l = ctx.createOscillator();
        l.frequency.value = ch.vibRate || 6;
        const lg = ctx.createGain();
        lg.gain.setValueAtTime(0, t);
        lg.gain.linearRampToValueAtTime(freqs[0] * ch.vib, t + 0.25);
        l.connect(lg).connect(o.frequency);
        l.start(t);
        l.stop(t + gate + 0.05);
      }
      const g = ctx.createGain();
      const v = ch.vol || 0.15;
      const end = t + gate;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.005);
      if (ch.env === 'pluck') {
        g.gain.exponentialRampToValueAtTime(v * 0.35, Math.max(t + 0.006, Math.min(end - 0.01, t + 0.22)));
      } else {
        const d = Math.min(t + 0.06, t + gate * 0.5);
        g.gain.linearRampToValueAtTime(v * 0.8, d);
        g.gain.setValueAtTime(v * 0.8, Math.max(d, end - 0.03));
      }
      g.gain.linearRampToValueAtTime(0, end);
      o.connect(g).connect(this.out);
      o.start(t);
      o.stop(end + 0.02);
    },

    drum(c, t, vol) {
      const A = HF.Audio, bus = this.out;
      switch (c) {
        case 'k':
          A.tone({ t, wave: 'sine', f: 160, f2: 42, dur: 0.14, vol: 0.75 * vol, bus });
          A.noise({ t, f: 1200, dur: 0.02, vol: 0.12 * vol, bus });
          break;
        case 's':
          A.noise({ t, type: 'bandpass', f: 1900, q: 0.8, dur: 0.13, vol: 0.45 * vol, bus });
          A.tone({ t, wave: 'triangle', f: 230, f2: 150, dur: 0.07, vol: 0.3 * vol, bus });
          break;
        case 'h':
          A.noise({ t, type: 'highpass', f: 7500, dur: 0.035, vol: 0.15 * vol, bus });
          break;
        case 'o':
          A.noise({ t, type: 'highpass', f: 6500, dur: 0.16, vol: 0.12 * vol, bus });
          break;
        case 'c':
          A.noise({ t, type: 'highpass', f: 3500, dur: 0.7, vol: 0.2 * vol, bus });
          break;
        case 't':
          A.tone({ t, wave: 'triangle', f: 280, f2: 170, dur: 0.15, vol: 0.45 * vol, bus });
          break;
        case 'l':
          A.tone({ t, wave: 'triangle', f: 170, f2: 95, dur: 0.18, vol: 0.5 * vol, bus });
          break;
      }
    },
  });

  M.problems = Object.values(COMPILED).flatMap((s) => s.problems);
})();
