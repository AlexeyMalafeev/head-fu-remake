// Additional playable story scripts.
(function () {
  'use strict';
  const HF = window.HF;

  HF.STORIES.momo = {
    title: 'Momo and the Undelivered Letter',
    retry: 'The post can wait one more round.',
    epilogue: 'Delivered, thirty springs later.',
    intro: {
      bg: 'bridge',
      left: 'momo',
      lines: [
        { who: 'narrator', text: 'Under the bridge, Momo found an envelope stuck between two stones. The address had washed away.' },
        { who: 'momo', face: 'think', text: 'A pressed cherry petal and a bite mark. Finally, a delivery that needs a detective!' },
      ],
    },
    chapters: [
      {
        opp: 'sumi',
        rank: 0,
        pre: [
          { who: 'momo', face: 'worried', text: 'There’s ink under the mud. Can you make it legible?' },
          { who: 'sumi', face: 'focus', text: 'If I wet the paper, the last letters will run. Bounce me some dust off that frame. Dry brushes only.' },
        ],
        post: [
          { who: 'momo', face: 'think', text: 'Three little teeth in the seal. I know a bun who tastes his own glue.' },
        ],
      },
      {
        opp: 'bao',
        rank: 1,
        pre: [
          { who: 'bao', face: 'worried', text: 'That bite? We used to seal letters with rice paste. Everybody nibbled a corner.' },
          { who: 'momo', face: 'focus', text: 'Race you for the last jar. I need to see if the paste matches!' },
        ],
        post: [
          { who: 'bao', face: 'happy', text: 'Same paste! That seal belonged to the old postmaster. Nori used to forward his mail.' },
        ],
      },
      {
        opp: 'nori',
        rank: 2,
        pre: [
          { who: 'momo', face: 'think', text: 'Bao knew the sender. I still need the address. What does a leaf in a circle mean?' },
          { who: 'nori', face: 'worried', text: 'That’s my old forwarding stamp! I kept the slips in a hat. Then I stacked thirty hats on top.' },
          { who: 'momo', face: 'focus', text: 'Pop them up one at a time. I’ll read the slips as they fall.' },
        ],
        post: [
          { who: 'nori', face: 'happy', text: 'Box seven, palace gate. Look at that. I used to file things.' },
        ],
      },
      {
        opp: 'gonta',
        rank: 3,
        pre: [
          { who: 'gonta', face: 'worried', text: 'BOX SEVEN STUCK. GONTA SHAKE. MOMO CATCH MAIL BEFORE PUDDLE.' },
          { who: 'momo', face: 'focus', text: 'All of it? Even the seed catalogues?' },
        ],
        post: [
          { who: 'gonta', face: 'proud', text: 'ESPECIALLY SEEDS. LOOK. POSTMASTER LEFT NEW ADDRESS INSIDE LID.' },
        ],
      },
      {
        opp: 'sensei',
        rank: 4,
        pre: [
          { who: 'sensei', face: 'think', text: 'My writing! I mailed myself a letter the day I retired. What did I say?' },
          { who: 'momo', face: 'smug', text: 'Postal challenge. Beat the courier to prove you were the courier.' },
        ],
        post: [
          { who: 'sensei', face: 'happy', text: 'I remember now. It said to go see the cherries. I always missed them on my rounds.' },
        ],
      },
    ],
    ending: {
      bg: 'bridge',
      left: 'momo',
      lines: [
        { who: 'momo', face: 'happy', text: 'Special delivery. Best opened right here under the tree.' },
        { who: 'narrator', text: 'For once, Momo stayed until the last petal fell. Her delivery slip smelled of cherries.' },
      ],
    },
  };

  HF.STORIES.sensei = {
    title: 'Sensei Fuzz Takes Flight',
    retry: 'Even a master gets homework.',
    epilogue: 'Tomorrow, the sparrows teach turning.',
    intro: {
      bg: 'bamboo',
      left: 'sensei',
      lines: [
        { who: 'sensei', face: 'proud', text: 'Today I shall teach the sparrows how to hover.' },
        { who: 'narrator', text: 'Thirty sparrows banked left. Sensei went straight into a shrub.' },
      ],
    },
    chapters: [
      {
        opp: 'kenji',
        rank: 0,
        pre: [
          { who: 'sensei', face: 'worried', text: 'Student, when I float, what do my eyebrows do?' },
          { who: 'kenji', face: 'smug', text: 'Mostly they cover my eyes. Hop up. This time I’ll watch from below.' },
        ],
        post: [
          { who: 'kenji', face: 'happy', text: 'Your left brow always takes off first. Try listening for both flaps.' },
        ],
      },
      {
        opp: 'poko',
        rank: 2,
        pre: [
          { who: 'poko', face: 'focus', text: 'One chime per flap. Stay with me until the echo comes back!' },
          { who: 'sensei', face: 'worried', text: 'At my age things echo even when nobody rings.' },
        ],
        post: [
          { who: 'poko', face: 'happy', text: 'Both together! Now find some wind that talks back.' },
        ],
      },
      {
        opp: 'momo',
        rank: 3,
        pre: [
          { who: 'momo', face: 'happy', text: 'The wind on this bridge changes every time I dash. Want a lift?' },
          { who: 'sensei', face: 'think', text: 'Last time somebody offered me a lift I landed in a shrub. Pass on my left first.' },
        ],
        post: [
          { who: 'momo', face: 'happy', text: 'You turned! You can stop gripping that leaf with your teeth now.' },
        ],
      },
      {
        opp: 'yuki',
        rank: 4,
        pre: [
          { who: 'yuki', face: 'focus', text: 'Cross my pass without getting blown into Tibet. I’ll supply the crosswind.' },
          { who: 'sensei', face: 'happy', text: 'A private lesson! I brought my best eyebrows.' },
        ],
        post: [],
      },
    ],
    ending: {
      bg: 'bamboo',
      left: 'sensei',
      lines: [
        { who: 'narrator', text: 'At dawn, the smallest sparrow dipped a wing. This time Sensei followed her round the bamboo.' },
        { who: 'sensei', face: 'happy', text: 'Same time tomorrow, teacher? I can bring crumbs.' },
      ],
    },
  };

  HF.STORIES.yuki = {
    title: 'Yuki and the Smallest Pawprint',
    retry: 'The tracks are still fresh.',
    epilogue: 'Two tails vanished into the snow.',
    intro: {
      bg: 'snow',
      left: 'yuki',
      lines: [
        { who: 'narrator', text: 'A fox cub curled up in Yuki’s spare scarf. Beyond the pass, a vixen called.' },
        { who: 'yuki', face: 'focus', text: 'Your mother sounds worried. Keep the scarf. We travel quiet.' },
      ],
    },
    chapters: [
      {
        opp: 'momo',
        rank: 0,
        pre: [
          { who: 'momo', face: 'worried', text: 'The cub followed my speed trail yesterday. Can you cut me off before he chases me again?' },
          { who: 'yuki', face: 'smug', text: 'Run. I’ll show him how snow catches a pink blur.' },
        ],
        post: [
          { who: 'momo', face: 'happy', text: 'Look past my tracks. His mother went toward the gate!' },
        ],
      },
      {
        opp: 'nori',
        rank: 1,
        pre: [
          { who: 'nori', face: 'worried', text: 'Something red just shot under my hat racks. Now every spring is ticking.' },
          { who: 'yuki', face: 'focus', text: 'Keep the hats popping. I’ll draw them away from the cub.' },
        ],
        post: [
          { who: 'nori', face: 'think', text: 'See that red thread? His mum brushed past here. My best tassel went with her.' },
        ],
      },
      {
        opp: 'sensei',
        rank: 3,
        pre: [
          { who: 'sensei', face: 'calm', text: 'Shut your eyes. Can you hear her over the bamboo?' },
          { who: 'yuki', face: 'worried', text: 'All I hear is your beard rustling.' },
          { who: 'sensei', face: 'happy', text: 'Then catch me by sound. My beard is quite good for beginners.' },
        ],
        post: [
          { who: 'yuki', face: 'focus', text: 'Two short barks. Downhill, beyond the gate. Little one, I hear her too.' },
        ],
      },
      {
        opp: 'gonta',
        rank: 4,
        pre: [
          { who: 'gonta', face: 'worried', text: 'ICE BLOCK PATH. GONTA BREAK IT. FOX SCARED OF BOOM.' },
          { who: 'yuki', face: 'think', text: 'Aim your pound at me. I’ll freeze the pieces into an arch before they fall.' },
        ],
        post: [],
      },
    ],
    ending: {
      bg: 'snow',
      left: 'yuki',
      lines: [
        { who: 'narrator', text: 'Beneath the ice arch two noses touched. The vixen tugged the cub home by one trailing tassel.' },
        { who: 'yuki', face: 'blush', text: 'Yes, you can keep it. That’s what second scarves are for.' },
      ],
    },
  };

  HF.STORIES.bao = {
    title: 'Bao Jumps Off the Menu',
    retry: 'Let the dough rise again.',
    epilogue: 'Top billing for a little dumpling.',
    intro: {
      bg: 'market',
      left: 'bao',
      lines: [
        { who: 'bao', face: 'worried', text: 'The circus printed my name under refreshments. I auditioned for acrobat!' },
        { who: 'narrator', text: 'The ringmaster agreed to an audition, if Bao could put together an act before sundown.' },
      ],
    },
    chapters: [
      {
        opp: 'nori',
        rank: 0,
        pre: [
          { who: 'bao', face: 'think', text: 'Got a hoop a bun could jump through?' },
          { who: 'nori', face: 'smug', text: 'Knock the middle out of my spring hat and you’ve got one.' },
        ],
        post: [
          { who: 'nori', face: 'shock', text: 'A perfect circle. And now I sell sun visors.' },
        ],
      },
      {
        opp: 'sumi',
        rank: 1,
        pre: [
          { who: 'sumi', face: 'think', text: 'From the cheap seats your hoop looks like a noodle. Can I put gold on it?' },
          { who: 'bao', face: 'happy', text: 'I’ll spin it as we bounce. All you need is one good brushstroke.' },
        ],
        post: [
          { who: 'sumi', face: 'proud', text: 'There. Even the fellow selling noodles can tell the difference.' },
        ],
      },
      {
        opp: 'sensei',
        rank: 2,
        pre: [
          { who: 'sensei', face: 'calm', text: 'Your landing is loud enough to curdle milk. Try landing on my eyebrows.' },
          { who: 'bao', face: 'worried', text: 'What if I miss?' },
        ],
        post: [
          { who: 'sensei', face: 'smug', text: 'Then you discover why I grew a beard.' },
        ],
      },
      {
        opp: 'poko',
        rank: 3,
        pre: [
          { who: 'bao', face: 'worried', text: 'The audience can see the hoop now. Trouble is, once I tuck my chin in, I can’t.' },
          { who: 'poko', face: 'focus', text: 'Take off on the chime. Open your eyes on the echo. Let’s rehearse at full bounce.' },
        ],
        post: [
          { who: 'bao', face: 'happy', text: 'Right on the echo! Ring that from the cheap seats tonight, will you?' },
        ],
      },
      {
        opp: 'kenji',
        rank: 4,
        pre: [
          { who: 'kenji', face: 'happy', text: 'The crowd’s here! I’ll launch you on the last bounce. You do the scary bit.' },
          { who: 'bao', face: 'focus', text: 'Ring up high. Steamer down low. Nobody light the stove!' },
        ],
        post: [],
      },
    ],
    ending: {
      bg: 'market',
      left: 'bao',
      lines: [
        { who: 'narrator', text: 'Bao sailed through the golden hoop. He landed in his steamer without so much as rattling the lid.' },
        { who: 'bao', face: 'proud', text: 'For my encore I shall disappear before anyone finds the soy sauce.' },
      ],
    },
  };

  HF.STORIES.nori = {
    title: 'Nori’s First Hat Regatta',
    retry: 'A good brim stays afloat.',
    epilogue: 'Every hat came home by river.',
    intro: {
      bg: 'hatshop',
      left: 'nori',
      lines: [
        { who: 'narrator', text: 'A summer shower washed Nori’s entire stock into the stream. Customers were already lining the banks.' },
        { who: 'nori', face: 'think', text: 'Refunds for forty hats? Or tickets for one boat race?' },
      ],
    },
    chapters: [
      {
        opp: 'bao',
        rank: 0,
        pre: [
          { who: 'bao', face: 'worried', text: 'That straw boat is taking on water. Permission to throw flour at it?' },
          { who: 'nori', face: 'focus', text: 'Hit my hat while it’s in the air. We’ll patch the leak with dough.' },
        ],
        post: [
          { who: 'bao', face: 'proud', text: 'Watertight. Smells fantastic too.' },
        ],
      },
      {
        opp: 'sumi',
        rank: 2,
        pre: [
          { who: 'sumi', face: 'wink', text: 'Identical boats! I bet on the one with the brim.' },
          { who: 'nori', face: 'happy', text: 'Tag each passing hat with your ink. I’ll keep them bouncing.' },
        ],
        post: [
          { who: 'sumi', face: 'happy', text: 'The spotted one just overtook the stripes!' },
        ],
      },
      {
        opp: 'gonta',
        rank: 3,
        pre: [
          { who: 'gonta', face: 'worried', text: 'GONTA COUNT THIRTY-NINE. WHERE LEAF HAT?' },
          { who: 'nori', face: 'shock', text: 'Snagged under the sluice! Shake the gate while I bounce it free.' },
        ],
        post: [
          { who: 'gonta', face: 'happy', text: 'FORTY. LITTLE LEAF IN LAST PLACE. GONTA CHEER FOR LEAF.' },
        ],
      },
      {
        opp: 'momo',
        rank: 4,
        pre: [
          { who: 'momo', face: 'smug', text: 'I’ll be the finish line. Catch me before the boats reach the bridge!' },
          { who: 'nori', face: 'worried', text: 'Finish lines usually stay put. That’s half their charm.' },
        ],
        post: [],
      },
    ],
    ending: {
      bg: 'bridge',
      left: 'nori',
      lines: [
        { who: 'narrator', text: 'Forty hats bobbed ashore. Each customer claimed a boat, tipped the water out and put it on.' },
        { who: 'nori', face: 'smug', text: 'Next year we charge extra for a cabin. I still have those soup bowls.' },
      ],
    },
  };

  HF.STORIES.sumi = {
    title: 'Sumi and the Empty Wall',
    retry: 'There’s ink left in the pot.',
    epilogue: 'The wall grew wings.',
    intro: {
      bg: 'gallery',
      left: 'sumi',
      lines: [
        { who: 'narrator', text: 'The gallery gave Sumi one whole wall. After a lifetime in the margins she had no idea where to start.' },
        { who: 'sumi', face: 'think', text: 'I can draw a still head. How do you draw where it’s going?' },
      ],
    },
    chapters: [
      {
        opp: 'momo',
        rank: 0,
        pre: [
          { who: 'momo', face: 'happy', text: 'Try drawing me. Ready? Already gone!' },
          { who: 'sumi', face: 'focus', text: 'Every time you cross my ink, I’ll have a piece of your trail.' },
        ],
        post: [
          { who: 'momo', face: 'shock', text: 'My dash looks like a feather!' },
        ],
      },
      {
        opp: 'kenji',
        rank: 1,
        pre: [
          { who: 'kenji', face: 'think', text: 'That feather on your cheek looks familiar. Barn swallows nest under our dojo roof.' },
          { who: 'sumi', face: 'sparkle', text: 'Oh! Can you jump high enough for me to see into the eaves? I’ll bounce off you.' },
        ],
        post: [
          { who: 'sumi', face: 'happy', text: 'Forked tails! I’ve been giving them all sparrow bottoms. Pass the ink.' },
        ],
      },
      {
        opp: 'poko',
        rank: 2,
        pre: [
          { who: 'poko', face: 'think', text: 'A feather needs a wing. Want the shape of my wall bounce?' },
          { who: 'sumi', face: 'happy', text: 'Both walls, please. I need a pair.' },
        ],
        post: [
          { who: 'poko', face: 'happy', text: 'Two wings. What makes them fly?' },
        ],
      },
      {
        opp: 'sensei',
        rank: 4,
        pre: [
          { who: 'sensei', face: 'calm', text: 'Leave a little blank space under each wing. Watch me glide through it.' },
          { who: 'sumi', face: 'sparkle', text: 'You mean the empty bit is part of the picture? My biggest brush can do that!' },
        ],
        post: [],
      },
    ],
    ending: {
      bg: 'gallery',
      left: 'sumi',
      lines: [
        { who: 'narrator', text: 'At closing time a flock of ink swallows swept across the plaster. One flew a little past the edge.' },
        { who: 'sumi', face: 'wink', text: 'That one’s mine. I still like the margins.' },
      ],
    },
  };

  HF.STORIES.poko = {
    title: 'Poko’s Silent Watch',
    retry: 'One more signal.',
    epilogue: 'The valley blinked goodnight.',
    intro: {
      bg: 'belfry',
      left: 'poko',
      lines: [
        { who: 'narrator', text: 'Fog swallowed the palace road. Poko rang for the night carts. The sound came straight back at him.' },
        { who: 'poko', face: 'worried', text: 'If I can’t ring them home, maybe I can blink.' },
      ],
    },
    chapters: [
      {
        opp: 'bao',
        rank: 0,
        pre: [
          { who: 'bao', face: 'think', text: 'My lanterns are yours if you can shake them loose. They’re tied up for the festival.' },
          { who: 'poko', face: 'happy', text: 'Then let’s give the rafters a little music.' },
        ],
        post: [
          { who: 'bao', face: 'happy', text: 'A whole cartload! Hang them where the road bends.' },
        ],
      },
      {
        opp: 'sumi',
        rank: 1,
        pre: [
          { who: 'poko', face: 'worried', text: 'I set two lanterns side by side. In the fog they look like one fat moon.' },
          { who: 'sumi', face: 'think', text: 'I’ll ink a shutter black. Bounce it past the light and tell me when the moon winks.' },
        ],
        post: [
          { who: 'poko', face: 'happy', text: 'There! Long blink, short blink. Even from the floor I can tell them apart.' },
        ],
      },
      {
        opp: 'yuki',
        rank: 2,
        pre: [
          { who: 'yuki', face: 'focus', text: 'From the pass I see one light. Bounce high enough for me to see the second.' },
          { who: 'poko', face: 'focus', text: 'Watch the gap between the beats. That’s when I change direction.' },
        ],
        post: [
          { who: 'yuki', face: 'happy', text: 'Two lights mean turn. I’ll signal the gate.' },
        ],
      },
      {
        opp: 'gonta',
        rank: 4,
        pre: [
          { who: 'gonta', face: 'worried', text: 'GONTA SEE LIGHT. CARTS TOO LOW.' },
          { who: 'poko', face: 'happy', text: 'Bounce me onto the gatepost. Let’s see how far the light goes!' },
        ],
        post: [],
      },
    ],
    ending: {
      bg: 'belfry',
      left: 'poko',
      lines: [
        { who: 'narrator', text: 'From the belfry Poko watched each lantern answer its neighbor. The last cart rolled home in silence.' },
        { who: 'poko', face: 'happy', text: 'First quiet shift in twenty years. My ears are still ringing.' },
      ],
    },
  };

  HF.STORIES.emperor = {
    title: 'Megadome’s Day Off',
    retry: 'Royal holidays may be extended.',
    epilogue: 'Tea for one ordinary head.',
    intro: {
      bg: 'throne',
      left: 'emperor',
      lines: [
        { who: 'emperor', face: 'worried', text: 'I ordered a day off. It arrived with six speeches and a parade.' },
        { who: 'narrator', text: 'Megadome slipped out to buy one ordinary cup of tea. He forgot to take off his crown.' },
      ],
    },
    chapters: [
      {
        opp: 'gonta',
        rank: 0,
        pre: [
          { who: 'gonta', face: 'focus', text: 'EMPEROR LEAVE PALACE. GONTA MUST ANNOUNCE.' },
          { who: 'emperor', face: 'think', text: 'What if I beat you to the other side before you finish my titles?' },
        ],
        post: [
          { who: 'gonta', face: 'think', text: 'GONTA STILL ON THIRD TITLE.' },
        ],
      },
      {
        opp: 'nori',
        rank: 1,
        pre: [
          { who: 'nori', face: 'smug', text: 'For a convincing disguise, lose the royal bounce. Try dodging these hats like you owe me money.' },
          { who: 'emperor', face: 'proud', text: 'A monarch always pays his milliner! Eventually.' },
        ],
        post: [
          { who: 'nori', face: 'happy', text: 'Perfect. You look exactly like my other customers.' },
        ],
      },
      {
        opp: 'momo',
        rank: 3,
        pre: [
          { who: 'momo', face: 'shock', text: 'A race at last! The Emperor always makes me let him win.' },
          { who: 'emperor', face: 'blush', text: 'How tiresome of him. Give this ordinary customer your very fastest dash.' },
        ],
        post: [
          { who: 'momo', face: 'happy', text: 'Look at you panting! The Emperor would have called a carriage.' },
        ],
      },
      {
        opp: 'bao',
        rank: 4,
        pre: [
          { who: 'bao', face: 'happy', text: 'Last cushion at the tea stall. House rule says we bounce for it.' },
          { who: 'emperor', face: 'happy', text: 'Finally. A rule somebody else wrote.' },
        ],
        post: [],
      },
    ],
    ending: {
      bg: 'market',
      left: 'emperor',
      lines: [
        { who: 'bao', face: 'wink', text: 'Here’s your tea, Your Majesty. The crown was a bit of a giveaway.' },
        { who: 'emperor', face: 'think', text: 'You all knew? Even the courier?' },
        { who: 'narrator', text: 'Across the market Momo winked. Megadome paid for his tea and stayed for a second cup.' },
      ],
    },
  };
})();
