// Stage backgrounds (drawn once into a cached canvas) plus ambient particles like petals and snow.
(function () {
  'use strict';
  const HF = window.HF;
  const U = HF.U;
  const W = HF.W, H = HF.H, G = HF.GROUND;
  const OL = HF.OUTLINE;
  const TAU = HF.TAU;

  function grad(ctx, y0, y1, stops) {
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    return g;
  }
  function sky(ctx, stops) {
    ctx.fillStyle = grad(ctx, 0, G, stops);
    ctx.fillRect(0, 0, W, G);
  }
  function mountains(ctx, base, peaks, color, snow) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, base);
    for (const [x, y] of peaks) ctx.lineTo(x, y);
    ctx.lineTo(W, base);
    ctx.closePath();
    ctx.fill();
    if (snow) {
      ctx.fillStyle = snow;
      for (let i = 1; i < peaks.length - 1; i++) {
        const [x, y] = peaks[i];
        if (y > peaks[i - 1][1] || y > peaks[i + 1][1]) continue;
        const [lx, ly] = peaks[i - 1], [rx, ry] = peaks[i + 1];
        const k = 0.28;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (lx - x) * k, y + (ly - y) * k);
        ctx.lineTo(x + (lx - x) * k * 0.5, y + (ly - y) * k * 0.8);
        ctx.lineTo(x, y + (ly - y) * k * 0.6);
        ctx.lineTo(x + (rx - x) * k * 0.5, y + (ry - y) * k * 0.8);
        ctx.lineTo(x + (rx - x) * k, y + (ry - y) * k);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  function cloud(ctx, x, y, s, color = 'rgba(255,255,255,0.9)') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 22 * s, 0, TAU);
    ctx.arc(x + 26 * s, y - 12 * s, 28 * s, 0, TAU);
    ctx.arc(x + 58 * s, y - 2 * s, 22 * s, 0, TAU);
    ctx.arc(x + 30 * s, y + 8 * s, 22 * s, 0, TAU);
    ctx.fill();
  }
  function sun(ctx, x, y, r, core, glow) {
    const g = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3);
    g.addColorStop(0, glow);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  // Pagoda-style roof with upturned eaves.
  function roof(ctx, x, y, w, h, color, trim) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 18, y + h);
    ctx.quadraticCurveTo(x + 10, y + h * 0.75, x + w * 0.18, y);
    ctx.lineTo(x + w * 0.82, y);
    ctx.quadraticCurveTo(x + w - 10, y + h * 0.75, x + w + 18, y + h);
    ctx.quadraticCurveTo(x + w / 2, y + h * 0.82, x - 18, y + h);
    ctx.fill();
    if (trim) {
      ctx.strokeStyle = trim;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }
  function floorPlanks(ctx, top, bot, line) {
    ctx.fillStyle = grad(ctx, G, H, [top, bot]);
    ctx.fillRect(0, G, W, H - G);
    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    for (let y = G + 14; y < H; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    for (let row = 0; row < 5; row++) {
      for (let x = (row * 67) % 140; x < W; x += 140) {
        ctx.beginPath();
        ctx.moveTo(x, G + row * 16);
        ctx.lineTo(x, G + row * 16 + 14);
        ctx.stroke();
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, G, W, 4);
  }
  function stoneTiles(ctx, top, bot, line, size = 60) {
    ctx.fillStyle = grad(ctx, G, H, [top, bot]);
    ctx.fillRect(0, G, W, H - G);
    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    for (let y = G; y < H; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      const off = ((y - G) / 24) % 2 ? size / 2 : 0;
      for (let x = off; x < W; x += size) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 24);
        ctx.stroke();
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(0, G, W, 4);
  }
  function lantern(ctx, x, y, s, color = '#e63946') {
    const g = ctx.createRadialGradient(x, y, 2, x, y, 40 * s);
    g.addColorStop(0, 'rgba(255,210,120,0.55)');
    g.addColorStop(1, 'rgba(255,210,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 40 * s, y - 40 * s, 80 * s, 80 * s);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, 13 * s, 16 * s, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(x - 7 * s, y - 19 * s, 14 * s, 4 * s);
    ctx.fillRect(x - 7 * s, y + 15 * s, 14 * s, 4 * s);
  }
  function bamboo(ctx, x, w, color, node, top = 0) {
    ctx.fillStyle = color;
    ctx.fillRect(x - w / 2, top, w, G - top + 4);
    ctx.fillStyle = node;
    for (let y = top + 30 + (x % 40); y < G; y += 70) ctx.fillRect(x - w / 2 - 1, y, w + 2, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x - w / 2 + 2, top, w * 0.2, G - top);
  }
  function pine(ctx, x, base, h, color, snow) {
    for (let i = 0; i < 3; i++) {
      const y = base - h * (0.35 + i * 0.25), w = h * (0.42 - i * 0.1);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y - h * 0.3);
      ctx.lineTo(x - w, y + h * 0.12);
      ctx.lineTo(x + w, y + h * 0.12);
      ctx.closePath();
      ctx.fill();
      if (snow) {
        ctx.fillStyle = snow;
        ctx.beginPath();
        ctx.moveTo(x, y - h * 0.3);
        ctx.lineTo(x - w * 0.45, y - h * 0.1);
        ctx.quadraticCurveTo(x, y - h * 0.02, x + w * 0.45, y - h * 0.1);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.fillStyle = '#5a3d2b';
    ctx.fillRect(x - 4, base - h * 0.2, 8, h * 0.2);
  }

  const STAGES = [
    {
      id: 'dojo',
      name: 'Dojo Courtyard',
      music: 'battle1',
      ambient: 'petals',
      draw(ctx) {
        sky(ctx, ['#7cc8ff', '#bfe6ff', '#fff2d6']);
        sun(ctx, 790, 105, 42, '#fff5c4', 'rgba(255,245,190,0.6)');
        cloud(ctx, 90, 90, 1.1);
        cloud(ctx, 430, 60, 0.8);
        cloud(ctx, 620, 150, 0.7);
        mountains(ctx, 380, [[0, 330], [120, 250], [230, 310], [360, 190], [470, 300], [600, 240], [720, 320], [860, 230], [960, 300]], '#a9c8e6', '#f4f9ff');
        mountains(ctx, 420, [[0, 380], [160, 320], [300, 370], [520, 300], [700, 360], [900, 310], [960, 340]], '#8fb7a6');
        // dojo building
        ctx.fillStyle = '#f3e3c2';
        ctx.fillRect(20, 300, 320, 175);
        ctx.fillStyle = '#7a4a2a';
        for (const x of [20, 120, 230, 330]) ctx.fillRect(x, 300, 12, 175);
        ctx.fillRect(20, 300, 322, 12);
        ctx.strokeStyle = '#c9a77a';
        ctx.lineWidth = 2;
        for (let x = 140; x < 230; x += 22) {
          ctx.beginPath();
          ctx.moveTo(x, 320);
          ctx.lineTo(x, 460);
          ctx.stroke();
        }
        for (let y = 340; y < 460; y += 30) {
          ctx.beginPath();
          ctx.moveTo(132, y);
          ctx.lineTo(230, y);
          ctx.stroke();
        }
        roof(ctx, 10, 240, 342, 64, '#3d3552', '#2a2438');
        // sign with a head emblem
        ctx.fillStyle = '#5a3420';
        ctx.fillRect(150, 255, 60, 28);
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        ctx.arc(180, 269, 9, 0, TAU);
        ctx.fill();
        // fence
        ctx.fillStyle = '#b07a4a';
        ctx.fillRect(340, 418, 620, 10);
        ctx.fillRect(340, 446, 620, 8);
        for (let x = 350; x < W; x += 34) ctx.fillRect(x, 405, 10, 66);
        // cherry tree
        ctx.fillStyle = '#6b4226';
        ctx.beginPath();
        ctx.moveTo(812, 472);
        ctx.quadraticCurveTo(790, 380, 840, 300);
        ctx.lineTo(860, 305);
        ctx.quadraticCurveTo(820, 390, 842, 472);
        ctx.fill();
        for (const [x, y, r, c] of [[800, 270, 60, '#ffb7d0'], [880, 250, 70, '#ff9ec3'], [930, 300, 50, '#ffb7d0'], [760, 310, 45, '#ffc9dc'], [860, 320, 50, '#ffadc9']]) {
          ctx.fillStyle = c;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, TAU);
          ctx.fill();
        }
        floorPlanks(ctx, '#d39a63', '#a8703f', 'rgba(90,50,20,0.35)');
      },
    },
    {
      id: 'market',
      name: 'Lantern Market',
      music: 'battle2',
      ambient: 'glow',
      draw(ctx) {
        sky(ctx, ['#2f2a6a', '#9b4f8e', '#ff9a5e']);
        sun(ctx, 480, 380, 60, '#ffcf7a', 'rgba(255,170,90,0.5)');
        // distant rooftops
        ctx.fillStyle = '#4b3570';
        for (let x = -20; x < W; x += 110) {
          const h = 60 + ((x * 7) % 50);
          ctx.fillRect(x, 340 - h, 90, h + 140);
          roof(ctx, x - 6, 315 - h, 102, 30, '#3a2858');
        }
        // shop fronts
        const shops = [[0, 250, '#7a3b4f'], [250, 220, '#8a4f3a'], [520, 200, '#6b3f6e'], [740, 220, '#7a3b4f']];
        for (const [x, w, c] of shops) {
          ctx.fillStyle = c;
          ctx.fillRect(x, 300, w, 175);
          roof(ctx, x - 4, 262, w + 8, 44, '#2e2240', '#1d1530');
          ctx.fillStyle = '#ffd27a';
          ctx.fillRect(x + 20, 330, w - 40, 60);
          ctx.fillStyle = 'rgba(122,59,79,0.8)';
          for (let k = 0; k < 4; k++) ctx.fillRect(x + 20 + (k * (w - 40)) / 4, 330, 4, 60);
          ctx.fillStyle = '#e63946';
          ctx.fillRect(x + 12, 300, w - 24, 18);
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          for (let k = 0; k < 6; k++) ctx.fillRect(x + 20 + (k * (w - 40)) / 6, 304, (w - 40) / 12, 10);
        }
        // noodle bowl sign
        ctx.fillStyle = '#fff3e0';
        ctx.beginPath();
        ctx.arc(360, 285, 26, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#e63946';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.strokeStyle = '#ffd23f';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(342 + i * 9, 284);
          ctx.quadraticCurveTo(346 + i * 9, 260, 340 + i * 9, 248);
          ctx.stroke();
        }
        // lantern strings
        for (const [y0, sag] of [[110, 50], [170, 40]]) {
          ctx.strokeStyle = 'rgba(30,20,40,0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, y0);
          ctx.quadraticCurveTo(W / 2, y0 + sag * 2, W, y0);
          ctx.stroke();
          for (let x = 40; x < W; x += 80) {
            const k = x / W;
            const y = y0 + sag * 4 * k * (1 - k) + 18;
            lantern(ctx, x, y, 0.9, (x / 80) % 2 ? '#e63946' : '#ff8c42');
          }
        }
        // cobblestones
        ctx.fillStyle = grad(ctx, G, H, ['#7b6380', '#4f3d55']);
        ctx.fillRect(0, G, W, H - G);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for (let y = G + 8; y < H; y += 18) {
          for (let x = ((y / 18) % 2) * 20; x < W; x += 40) {
            ctx.beginPath();
            ctx.ellipse(x, y, 16, 6, 0, 0, TAU);
            ctx.fill();
          }
        }
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, G, W, 4);
      },
    },
    {
      id: 'bamboo',
      name: 'Bamboo Grove',
      music: 'bamboo',
      ambient: 'leaves',
      draw(ctx) {
        sky(ctx, ['#dff7d0', '#a8dca0', '#6fae72']);
        for (let x = 10; x < W; x += 46) bamboo(ctx, x, 12, '#b8e0a8', '#9ccc8c');
        // light rays
        ctx.fillStyle = 'rgba(255,255,230,0.18)';
        for (const x of [180, 420, 700]) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + 70, 0);
          ctx.lineTo(x + 260, G);
          ctx.lineTo(x + 120, G);
          ctx.closePath();
          ctx.fill();
        }
        for (let x = 30; x < W; x += 95) bamboo(ctx, x + ((x * 13) % 30), 20, '#7cbf6c', '#5e9e52');
        // stone lantern
        ctx.fillStyle = '#9aa39a';
        ctx.fillRect(470, 380, 20, 90);
        ctx.fillRect(452, 360, 56, 22);
        roof(ctx, 444, 335, 72, 26, '#7d867d');
        ctx.fillStyle = '#ffe9a0';
        ctx.fillRect(466, 364, 28, 14);
        for (const x of [60, 250, 690, 900]) bamboo(ctx, x, 30, '#3f8a4a', '#2f6e3a');
        // leaves on near stalks
        ctx.fillStyle = '#4f9a55';
        for (const [x, y, s] of [[75, 120, 1], [265, 80, -1], [705, 140, 1], [915, 100, -1], [265, 260, 1], [690, 300, -1]]) {
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(x + s * (20 + i * 12), y + i * 10, 26, 6, s * (0.4 + i * 0.25), 0, TAU);
            ctx.fill();
          }
        }
        ctx.fillStyle = grad(ctx, G, H, ['#6aa84f', '#3e7a33']);
        ctx.fillRect(0, G, W, H - G);
        ctx.fillStyle = '#7cc25e';
        for (let x = 0; x < W; x += 14) {
          ctx.beginPath();
          ctx.moveTo(x, G + 2);
          ctx.lineTo(x + 5, G - 10 - (x % 3) * 3);
          ctx.lineTo(x + 9, G + 2);
          ctx.fill();
        }
      },
    },
    {
      id: 'snow',
      name: 'Frosty Pass',
      music: 'battle3',
      ambient: 'snow',
      draw(ctx) {
        sky(ctx, ['#9ec9f0', '#cfe6fb', '#eef7ff']);
        mountains(ctx, 400, [[0, 300], [140, 150], [280, 280], [420, 110], [560, 260], [700, 160], [860, 280], [960, 200]], '#b9cfe8', '#ffffff');
        mountains(ctx, 430, [[0, 360], [200, 270], [380, 350], [600, 260], [800, 340], [960, 290]], '#d6e5f5', '#ffffff');
        for (const [x, h] of [[60, 140], [150, 110], [820, 150], [910, 120], [260, 90], [700, 95]]) pine(ctx, x, 440, h, '#2f6b55', '#f4faff');
        // little shrine gate
        ctx.fillStyle = '#d64545';
        ctx.fillRect(420, 330, 14, 120);
        ctx.fillRect(526, 330, 14, 120);
        ctx.fillRect(400, 330, 160, 14);
        ctx.fillRect(410, 352, 140, 8);
        ctx.fillStyle = '#fff';
        ctx.fillRect(398, 324, 164, 6);
        ctx.fillStyle = grad(ctx, G - 30, H, ['#ffffff', '#dceaf8', '#b8d0ea']);
        ctx.beginPath();
        ctx.moveTo(0, G - 6);
        for (let x = 0; x <= W; x += 60) ctx.quadraticCurveTo(x + 30, G - 16, x + 60, G - 6);
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.fill();
        ctx.fillStyle = 'rgba(120,160,210,0.25)';
        for (let x = 30; x < W; x += 90) {
          ctx.beginPath();
          ctx.ellipse(x, G + 30 + (x % 3) * 8, 30, 5, 0, 0, TAU);
          ctx.fill();
        }
      },
    },
    {
      id: 'gate',
      name: 'Palace Gate',
      music: 'gate',
      ambient: 'leavesOrange',
      draw(ctx) {
        sky(ctx, ['#b8406b', '#ff7f50', '#ffcf7a']);
        sun(ctx, 160, 230, 55, '#fff0b3', 'rgba(255,200,120,0.5)');
        cloud(ctx, 600, 90, 1.0, 'rgba(255,220,200,0.7)');
        cloud(ctx, 760, 150, 0.7, 'rgba(255,220,200,0.6)');
        // palace silhouette
        ctx.fillStyle = '#6e2f52';
        ctx.fillRect(380, 150, 200, 120);
        roof(ctx, 360, 110, 240, 46, '#4a1f3a');
        roof(ctx, 400, 70, 160, 40, '#4a1f3a');
        // wall
        ctx.fillStyle = '#d9c3a3';
        ctx.fillRect(0, 300, W, 172);
        ctx.fillStyle = 'rgba(120,90,60,0.25)';
        for (let y = 310; y < 470; y += 22) for (let x = ((y / 22) % 2) * 30; x < W; x += 60) ctx.fillRect(x, y, 56, 2);
        ctx.fillStyle = '#3d2a3a';
        ctx.fillRect(0, 288, W, 16);
        // gate
        ctx.fillStyle = '#b8322a';
        ctx.fillRect(330, 250, 300, 222);
        ctx.fillStyle = '#8f241e';
        ctx.fillRect(478, 260, 4, 212);
        ctx.fillStyle = '#ffd23f';
        for (let y = 285; y < 460; y += 34) for (let x = 352; x < 620; x += 32) {
          if (Math.abs(x - 480) < 10) continue;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, TAU);
          ctx.fill();
        }
        roof(ctx, 300, 200, 360, 56, '#2e2a40', '#ffd23f');
        // banners
        for (const x of [190, 770]) {
          ctx.fillStyle = '#5a3a20';
          ctx.fillRect(x - 3, 180, 6, 292);
          ctx.fillStyle = '#9b5de5';
          ctx.beginPath();
          ctx.moveTo(x + 3, 195);
          ctx.lineTo(x + 70, 195);
          ctx.lineTo(x + 70, 310);
          ctx.lineTo(x + 36, 290);
          ctx.lineTo(x + 3, 310);
          ctx.fill();
          ctx.fillStyle = '#ffd23f';
          ctx.beginPath();
          ctx.arc(x + 36, 240, 18, 0, TAU);
          ctx.fill();
          ctx.fillStyle = '#9b5de5';
          ctx.fillRect(x + 28, 222, 16, 8);
        }
        stoneTiles(ctx, '#b9a38a', '#8a735c', 'rgba(70,50,30,0.35)');
      },
    },
    {
      id: 'throne',
      name: 'Throne Room',
      music: 'boss',
      ambient: 'embers',
      draw(ctx) {
        ctx.fillStyle = grad(ctx, 0, G, ['#1a0b26', '#3d1238', '#5c1a3a']);
        ctx.fillRect(0, 0, W, G);
        // moon window
        ctx.fillStyle = '#2a1a4a';
        ctx.beginPath();
        ctx.arc(480, 130, 92, 0, TAU);
        ctx.fill();
        sun(ctx, 500, 120, 46, '#fff3c4', 'rgba(255,240,190,0.35)');
        ctx.strokeStyle = '#ffd23f';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(480, 130, 92, 0, TAU);
        ctx.moveTo(388, 130);
        ctx.lineTo(572, 130);
        ctx.moveTo(480, 38);
        ctx.lineTo(480, 222);
        ctx.stroke();
        // throne
        ctx.fillStyle = '#c99a1e';
        U.roundRect(ctx, 370, 250, 220, 222, 30);
        ctx.fill();
        ctx.fillStyle = '#ffd23f';
        U.roundRect(ctx, 385, 262, 190, 200, 24);
        ctx.fill();
        ctx.fillStyle = '#7b2d8b';
        U.roundRect(ctx, 405, 285, 150, 150, 50);
        ctx.fill();
        ctx.fillStyle = '#ffd23f';
        for (const x of [380, 580]) {
          ctx.beginPath();
          ctx.arc(x, 250, 16, 0, TAU);
          ctx.fill();
        }
        // pillars
        for (const [x, w, dark] of [[150, 60, 0.35], [810, 60, 0.35], [40, 80, 0], [920, 80, 0]]) {
          ctx.fillStyle = '#a3262f';
          ctx.fillRect(x - w / 2, 0, w, G);
          ctx.fillStyle = '#ffd23f';
          ctx.fillRect(x - w / 2 - 4, 60, w + 8, 12);
          ctx.fillRect(x - w / 2 - 4, G - 40, w + 8, 12);
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fillRect(x - w / 2 + 6, 0, w * 0.18, G);
          if (dark) {
            ctx.fillStyle = `rgba(20,0,20,${dark})`;
            ctx.fillRect(x - w / 2, 0, w, G);
          }
        }
        // banners with the Emperor's face
        for (const x of [270, 690]) {
          ctx.fillStyle = '#7b2d8b';
          ctx.beginPath();
          ctx.moveTo(x - 45, 40);
          ctx.lineTo(x + 45, 40);
          ctx.lineTo(x + 45, 250);
          ctx.lineTo(x, 225);
          ctx.lineTo(x - 45, 250);
          ctx.fill();
          ctx.strokeStyle = '#ffd23f';
          ctx.lineWidth = 4;
          ctx.stroke();
          HF.drawHead(ctx, 'emperor', { x, y: 130, r: 30, facing: 1, expr: 'smug', t: 0 });
        }
        // marble floor with carpet
        ctx.fillStyle = grad(ctx, G, H, ['#4a2a52', '#2a1630']);
        ctx.fillRect(0, G, W, H - G);
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        for (let x = 0; x < W; x += 80) ctx.fillRect(x, G, 2, H - G);
        ctx.fillStyle = '#a3262f';
        ctx.beginPath();
        ctx.moveTo(380, G);
        ctx.lineTo(580, G);
        ctx.lineTo(640, H);
        ctx.lineTo(320, H);
        ctx.fill();
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(330, H - 8, 300, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, G, W, 4);
      },
      // braziers flicker every frame
      live(ctx, t) {
        for (const x of [255, 705]) {
          ctx.fillStyle = '#5a3a20';
          ctx.fillRect(x - 4, 400, 8, 72);
          ctx.fillStyle = '#ffd23f';
          ctx.beginPath();
          ctx.moveTo(x - 26, 392);
          ctx.lineTo(x + 26, 392);
          ctx.lineTo(x + 14, 410);
          ctx.lineTo(x - 14, 410);
          ctx.fill();
          for (let i = 0; i < 3; i++) {
            const h = 34 + Math.sin(t * 13 + i * 2 + x) * 8;
            ctx.fillStyle = ['#ff5e3a', '#ff9f1c', '#ffe66d'][i];
            ctx.beginPath();
            ctx.moveTo(x - 20 + i * 6, 392);
            ctx.quadraticCurveTo(x - 6 + Math.sin(t * 9 + i) * 6, 392 - h * (1 - i * 0.2), x, 392 - h * (1 - i * 0.25));
            ctx.quadraticCurveTo(x + 6, 392 - h * 0.5, x + 20 - i * 6, 392);
            ctx.fill();
          }
        }
      },
    },
    {
      id: 'bridge',
      name: 'Courier Bridge',
      music: 'bridge',
      ambient: 'petals',
      draw(ctx) {
        sky(ctx, ['#59b9cd', '#b7e6dc', '#ffe2a1']);
        sun(ctx, 230, 164, 40, '#fff4b9', 'rgba(255,235,160,0.6)');
        cloud(ctx, 355, 140, 1.15);
        cloud(ctx, 635, 178, 0.8);
        cloud(ctx, 805, 100, 1.1);
        mountains(ctx, 383, [[0, 283], [110, 229], [260, 329], [410, 273], [560, 335], [702, 232], [855, 298], [960, 254]], '#78aeb0');
        mountains(ctx, 395, [[0, 308], [165, 335], [295, 356], [490, 312], [630, 321], [820, 298], [960, 339]], '#4d8e89');
        ctx.fillStyle = grad(ctx, 365, G, ['#90d2ba', '#367b91']);
        ctx.fillRect(0, 365, W, G - 365);
        for (let i = 0; i < 34; i++) {
          ctx.fillStyle = i % 3 ? 'rgba(226,255,228,0.27)' : 'rgba(38,100,120,0.32)';
          ctx.fillRect((i * 137) % W, 370 + (i * 31) % 80, 18 + (i * 13) % 68, 2);
        }
        // Courier pennants strung above the red bridge.
        ctx.strokeStyle = '#365c61';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(72, 145);
        ctx.quadraticCurveTo(480, 305, 888, 145);
        ctx.stroke();
        for (let x = 116; x <= 844; x += 56) {
          const y = 225 - 80 * ((x - 480) / 408) ** 2;
          ctx.fillStyle = ['#f78855', '#ffe49a', '#ec79a3'][(x - 116) / 56 % 3];
          ctx.beginPath();
          ctx.moveTo(x - 17, y - 1);
          ctx.lineTo(x + 16, y + 1);
          ctx.lineTo(x - 6, y + 31);
          ctx.fill();
        }
        ctx.fillStyle = '#843e48';
        ctx.fillRect(0, 424, W, 12);
        ctx.fillRect(0, 458, W, 12);
        for (let x = 24; x < W; x += 65) {
          ctx.fillStyle = '#b05750';
          ctx.fillRect(x, 417, 12, 53);
          ctx.fillStyle = '#efb16b';
          ctx.fillRect(x - 3, 413, 18, 7);
        }
        for (const x of [72, 888]) {
          ctx.fillStyle = '#713845';
          ctx.fillRect(x - 9, 137, 18, 333);
          ctx.fillStyle = '#f5bc71';
          ctx.beginPath();
          ctx.arc(x, 132, 12, 0, TAU);
          ctx.fill();
        }
        floorPlanks(ctx, '#ba6955', '#743c40', '#8d4b45');
      },
    },
    {
      id: 'hatshop',
      name: 'Hidden Hat Shop',
      music: 'hatshop',
      ambient: 'glow',
      draw(ctx) {
        sky(ctx, ['#221936', '#403453', '#654960']);
        ctx.fillStyle = '#221a31';
        ctx.fillRect(28, 112, 904, 358);
        for (const x of [50, 338, 626]) {
          ctx.fillStyle = grad(ctx, 124, 438, ['#44354f', '#2d243d']);
          ctx.fillRect(x, 124, 282, 314);
          for (const y of [241, 364]) {
            ctx.fillStyle = '#795052';
            ctx.fillRect(x, y, 282, 13);
            ctx.fillStyle = '#ae7965';
            ctx.fillRect(x, y, 282, 3);
            for (let i = 0; i < 3; i++) {
              const hx = x + 50 + i * 91;
              const [crown, band] = [['#477b81', '#ffcf77'], ['#a85576', '#ffa475'], ['#6a5e99', '#c0c9a5']][((x + y) % 5 + i) % 3];
              ctx.fillStyle = crown;
              ctx.beginPath();
              ctx.ellipse(hx, y - 5, 38, 7, i * 0.06 - 0.06, 0, TAU);
              ctx.fill();
              U.roundRect(ctx, hx - 22, y - 48 + i * 5, 44, 44 - i * 5, 12);
              ctx.fill();
              ctx.fillStyle = band;
              ctx.fillRect(hx - 22, y - 19, 44, 6);
              ctx.fillStyle = '#ffe2ae';
              ctx.fillRect(hx + 7, y - 21, 9, 10);
            }
          }
        }
        for (const x of [26, 324, 622, 920]) {
          ctx.fillStyle = '#503244';
          ctx.fillRect(x, 106, 16, 364);
        }
        for (const x of [156, 480, 804]) {
          ctx.fillStyle = '#2c2037';
          ctx.fillRect(x - 2, 0, 4, 111);
          lantern(ctx, x, 135, 1.25, '#d98562');
        }
        floorPlanks(ctx, '#866058', '#513948', '#674650');
      },
    },
    {
      id: 'gallery',
      name: 'Portrait Hall',
      music: 'gallery',
      ambient: 'glow',
      draw(ctx) {
        sky(ctx, ['#575074', '#a2899b', '#c4a69e']);
        ctx.fillStyle = '#705a76';
        ctx.fillRect(0, 380, W, G - 380);
        for (let x = 0; x < W; x += 120) {
          ctx.fillStyle = '#b393a0';
          ctx.fillRect(x, 386, 114, 78);
          ctx.fillStyle = '#9b7d91';
          ctx.fillRect(x + 5, 391, 104, 68);
        }
        for (const [x, y, w, h, id, hat] of [
          [70, 156, 111, 133, 'gonta', 'beanie'],
          [240, 124, 126, 150, 'momo', 'straw'],
          [398, 96, 164, 190, 'emperor', 'straw'],
          [596, 135, 130, 152, 'yuki', 'beanie'],
          [772, 171, 112, 132, 'sensei', 'straw'],
        ]) {
          ctx.fillStyle = '#655169';
          ctx.fillRect(x + 4, y + 6, w, h);
          ctx.fillStyle = '#b68152';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = '#f6cb80';
          ctx.lineWidth = 3;
          ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
          ctx.fillStyle = '#ecdbb1';
          ctx.fillRect(x + 10, y + 10, w - 20, h - 20);
          HF.drawHead(ctx, id, { x: x + w / 2, y: y + h * 0.55, r: w * 0.235, facing: 1, expr: 'proud', hat, t: 0 });
          ctx.fillStyle = '#b94c63';
          ctx.fillRect(x + w - 26, y + h - 26, 9, 9);
        }
        ctx.fillStyle = '#e2b486';
        ctx.fillRect(0, 374, W, 6);
        stoneTiles(ctx, '#7a708d', '#4b425f', '#554764', 95);
      },
    },
    {
      id: 'belfry',
      name: 'Palace Belfry',
      music: 'belfry',
      ambient: 'embers',
      draw(ctx) {
        sky(ctx, ['#34335d', '#bd656d', '#ffd18c']);
        sun(ctx, 735, 321, 52, '#ffe2a4', 'rgba(255,195,114,0.55)');
        mountains(ctx, G, [[0, 315], [135, 262], [280, 364], [400, 295], [585, 403], [774, 352], [960, 310]], '#715675');
        for (const [x, y, w] of [[-40, 342, 220], [160, 384, 180], [596, 392, 154], [800, 353, 200]]) {
          ctx.fillStyle = '#5d425e';
          ctx.fillRect(x, y + 18, w, G - y);
          roof(ctx, x, y, w, 39, '#473750');
        }
        for (const x of [225, 704]) {
          ctx.fillStyle = '#663d50';
          ctx.fillRect(x, 114, 33, G - 114);
          ctx.fillStyle = '#a76562';
          ctx.fillRect(x + 4, 115, 8, G - 115);
        }
        roof(ctx, 197, 54, 566, 76, '#392e4a', '#f0a568');
        ctx.fillStyle = '#663b48';
        ctx.fillRect(216, 124, 528, 18);
        ctx.fillStyle = '#382b40';
        ctx.fillRect(469, 140, 22, 24);
        ctx.fillStyle = grad(ctx, 167, 341, ['#f9ce82', '#bf8149', '#73504a']);
        ctx.beginPath();
        ctx.moveTo(452, 163);
        ctx.quadraticCurveTo(481, 147, 508, 163);
        ctx.bezierCurveTo(567, 173, 549, 278, 594, 327);
        ctx.quadraticCurveTo(481, 353, 366, 327);
        ctx.bezierCurveTo(411, 278, 393, 173, 452, 163);
        ctx.fill();
        ctx.strokeStyle = '#f5c682';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(384, 304);
        ctx.quadraticCurveTo(480, 326, 576, 304);
        ctx.stroke();
        ctx.fillStyle = '#553c43';
        ctx.beginPath();
        ctx.ellipse(480, 332, 111, 15, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#d89755';
        ctx.beginPath();
        ctx.ellipse(480, 344, 15, 19, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#624254';
        ctx.fillRect(0, 424, W, 9);
        ctx.fillRect(0, 460, W, 10);
        for (let x = 25; x < W; x += 58) ctx.fillRect(x, 420, 9, 50);
        floorPlanks(ctx, '#8a605f', '#513649', '#704553');
      },
    },
  ];

  HF.STAGES = STAGES;
  HF.STAGE = {};
  for (const s of STAGES) HF.STAGE[s.id] = s;

  // A stage instance owns the cached background and its ambient particles.
  class Stage {
    constructor(id) {
      this.def = HF.STAGE[id] || STAGES[0];
      this.parts = [];
      this.t = 0;
      for (let i = 0; i < 30; i++) this.spawn(true);
    }

    static background(def) {
      // A hidden or not-yet-laid-out window can report a zero size; never cache an empty canvas.
      const scale = Math.max(0.1, HF.Game.scale || 1);
      if (!def._cache || def._cacheScale !== scale) {
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.ceil(W * scale));
        c.height = Math.max(1, Math.ceil(H * scale));
        const cx = c.getContext('2d');
        cx.scale(scale, scale);
        def.draw(cx);
        def._cache = c;
        def._cacheScale = scale;
      }
      return def._cache;
    }

    spawn(anywhere) {
      const a = this.def.ambient;
      const p = { x: U.rand(-20, W + 20), y: anywhere ? U.rand(0, G) : -20, t: U.rand(0, 10), s: U.rand(0.6, 1.2) };
      if (a === 'petals') Object.assign(p, { vx: U.rand(20, 60), vy: U.rand(30, 70), color: U.pick(['#ffb7d0', '#ff9ec3', '#fff0f6']) });
      else if (a === 'snow') Object.assign(p, { vx: U.rand(-15, 15), vy: U.rand(30, 80), color: '#fff' });
      else if (a === 'leaves') Object.assign(p, { vx: U.rand(-30, 30), vy: U.rand(30, 60), color: U.pick(['#7cc25e', '#a8d672', '#4f9a55']) });
      else if (a === 'leavesOrange') Object.assign(p, { vx: U.rand(20, 70), vy: U.rand(30, 60), color: U.pick(['#ff8c42', '#ffb347', '#e85d3a']) });
      else if (a === 'glow') Object.assign(p, { y: anywhere ? U.rand(0, G) : G + 10, vx: U.rand(-10, 10), vy: -U.rand(15, 35), color: 'rgba(255,214,120,0.8)' });
      else if (a === 'embers') Object.assign(p, { y: anywhere ? U.rand(0, G) : G + 10, vx: U.rand(-15, 15), vy: -U.rand(30, 70), color: U.pick(['#ff8c42', '#ffd23f']) });
      this.parts.push(p);
    }

    update(dt) {
      this.t += dt;
      for (const p of this.parts) {
        p.t += dt;
        p.x += (p.vx + Math.sin(p.t * 2) * 20) * dt;
        p.y += p.vy * dt;
      }
      this.parts = this.parts.filter((p) => p.y < H + 20 && p.y > -40 && p.x > -60 && p.x < W + 60);
      while (this.parts.length < 30) this.spawn(false);
    }

    drawBack(ctx) {
      ctx.drawImage(Stage.background(this.def), 0, 0, W, H);
      if (this.def.live) this.def.live(ctx, this.t);
    }

    drawFront(ctx) {
      const a = this.def.ambient;
      for (const p of this.parts) {
        ctx.fillStyle = p.color;
        if (a === 'snow' || a === 'glow' || a === 'embers') {
          ctx.globalAlpha = a === 'snow' ? 0.9 : 0.55 + Math.sin(p.t * 5) * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, (a === 'snow' ? 3 : 2.2) * p.s, 0, TAU);
          ctx.fill();
        } else {
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, 6 * p.s, 3 * p.s, p.t * 2, 0, TAU);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    // Small preview for the stage picker.
    static thumb(ctx, def, x, y, w, h) {
      ctx.save();
      U.roundRect(ctx, x, y, w, h, 10);
      ctx.clip();
      ctx.drawImage(Stage.background(def), x, y, w, h);
      ctx.restore();
      U.roundRect(ctx, x, y, w, h, 10);
      ctx.lineWidth = 4;
      ctx.strokeStyle = OL;
      ctx.stroke();
    }
  }

  HF.Stage = Stage;
})();
