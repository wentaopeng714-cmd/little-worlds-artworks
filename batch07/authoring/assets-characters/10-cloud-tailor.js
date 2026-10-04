(function () {
  'use strict';
  const C = { bg: '#202342', ink: '#ddd9eb', purple: '#6e648e', lavender: '#aaa6c7', cyan: '#76afb6', gold: '#e7ba77', dark: '#292742', pale: '#d1cbe0', rose: '#ba889c' };
  const tools = [{ id: 'pull', label: '拉云被' }, { id: 'moon', label: '缝月补丁' }, { id: 'hole', label: '开洞漏星' }, { id: 'sew', label: '缝好小洞' }, { id: 'fold', label: '折一折' }];
  const COL = 10, ROW = 5;
  let S;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  function seed(n) { let z = n >>> 0; return () => ((z = (z * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function init() {
    const r = seed(912761);
    S = { tool: 'pull', time: 0, down: false, x: 500, y: 430, lastX: 500, lastY: 430, anchor: null, lastSound: -10, lastSew: -10, lastLeak: 0, patches: [], holes: [], stars: [], stitches: [], folds: 0, pullMoves: 0, repairs: 0, emitted: 0, moonCount: 0, holesMade: 0, notice: '捏住云被，轻轻给他盖好。', noticeTime: 5, needle: null,
      view: { w: 1000, h: 700, scale: 1, ox: 0, oy: 0 }, nodes: Array.from({ length: (COL + 1) * (ROW + 1) }, () => ({ dx: 0, dy: 0 })),
      sky: Array.from({ length: 90 }, () => ({ x: r() * 1000, y: r() * 650, r: .5 + r() * 1.7, p: r() * 6.28 })),
      dust: Array.from({ length: 670 }, () => ({ x: r() * 1000, y: r() * 700, len: 1 + r() * 4, a: .025 + r() * .055 })) };
  }
  function sound(note, kind) { if (S.time - S.lastSound > .15) { S.lastSound = S.time; if (window.SOUND && window.SOUND.fx) window.SOUND.fx(note, kind); } }
  function say(s) { S.notice = s; S.noticeTime = 4; }
  function base(u, v) { return { x: 100 + u * 790 + Math.sin(v * Math.PI) * Math.cos(u * Math.PI) * 17, y: 358 + v * 259 + Math.sin(u * Math.PI * 3) * (1 - v) * 12 + Math.sin(u * Math.PI) * v * 18 }; }
  function node(i, j) { const p = base(i / COL, j / ROW), n = S.nodes[j * (COL + 1) + i]; return { x: p.x + n.dx, y: p.y + n.dy }; }
  function pos(u, v) {
    const gx = clamp(u, 0, .99999) * COL, gy = clamp(v, 0, .99999) * ROW, i = Math.floor(gx), j = Math.floor(gy), a = gx - i, b = gy - j;
    const p = node(i, j), q = node(i + 1, j), r = node(i, j + 1), z = node(i + 1, j + 1);
    return { x: p.x * (1 - a) * (1 - b) + q.x * a * (1 - b) + r.x * (1 - a) * b + z.x * a * b, y: p.y * (1 - a) * (1 - b) + q.y * a * (1 - b) + r.y * (1 - a) * b + z.y * a * b };
  }
  function locate(x, y, maxDistance) {
    let best = null, dd = Infinity;
    for (let j = 0; j <= 24; j++) for (let i = 0; i <= 45; i++) { const u = i / 45, v = j / 24, p = pos(u, v), d = (x - p.x) ** 2 + (y - p.y) ** 2; if (d < dd) { dd = d; best = { u, v }; } }
    return dd <= (maxDistance || 35) ** 2 ? best : null;
  }
  function ellipse(c, x, y, rx, ry, fill) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); }
  function line(c, pts, color, width) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.strokeStyle = color; c.lineWidth = width; c.stroke(); }
  function label(c, str, x, y, size, color, weight) { c.font = (weight || '500') + ' ' + size + 'px sans-serif'; c.fillStyle = color; c.fillText(str, x, y); }
  function star(c, x, y, r, col, angle) { c.save(); c.translate(x, y); c.rotate(angle || 0); c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * .26 : r; const xx = Math.cos(a) * rr, yy = Math.sin(a) * rr; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.closePath(); c.fillStyle = col; c.fill(); c.restore(); }
  function clothPath(c) {
    const a = node(0, 0); c.beginPath(); c.moveTo(a.x, a.y);
    for (let i = 1; i <= COL; i++) { const p = node(i - 1, 0), q = node(i, 0); c.quadraticCurveTo((p.x + q.x) / 2, (p.y + q.y) / 2 - 28, q.x, q.y); }
    for (let j = 1; j <= ROW; j++) { const p = node(COL, j - 1), q = node(COL, j); c.quadraticCurveTo((p.x + q.x) / 2 + 25, (p.y + q.y) / 2, q.x, q.y); }
    for (let i = COL - 1; i >= 0; i--) { const p = node(i + 1, ROW), q = node(i, ROW); c.quadraticCurveTo((p.x + q.x) / 2, (p.y + q.y) / 2 + 23, q.x, q.y); }
    for (let j = ROW - 1; j >= 0; j--) { const p = node(0, j + 1), q = node(0, j); c.quadraticCurveTo((p.x + q.x) / 2 - 25, (p.y + q.y) / 2, q.x, q.y); } c.closePath();
  }
  function moonPatch(c, patch) {
    const p = pos(patch.u, patch.v); const a = pos(clamp(patch.u + .025, 0, 1), patch.v); const angle = Math.atan2(a.y - p.y, a.x - p.x) + patch.rotation;
    c.save(); c.translate(p.x, p.y); c.rotate(angle); c.fillStyle = C.gold; c.strokeStyle = '#857189'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(3, -28); c.bezierCurveTo(-33, -30, -41, 19, -7, 28); c.bezierCurveTo(7, 33, 24, 18, 24, 13); c.bezierCurveTo(1, 23, -14, -7, 3, -28); c.closePath(); c.fill(); c.stroke();
    c.setLineDash([2, 5]); c.strokeStyle = '#fbdfaa'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-5, -21); c.bezierCurveTo(-27, -17, -28, 17, -7, 22); c.stroke(); c.setLineDash([]);
    for (let i = 0; i < 6; i++) { const a = i / 5 * 3.8 + 1.3; const x = Math.cos(a) * 27 - 4, y = Math.sin(a) * 28; line(c, [{ x: x - 3, y: y - 2 }, { x: x + 3, y: y + 2 }], C.pale, 2); }
    c.restore();
  }
  function editAt(x, y, type) {
    const uv = locate(x, y, 39); if (!uv) return;
    if (S.tool === 'moon' && type === 'down') {
      const previous = S.patches.find(p => { const q = pos(p.u, p.v); return Math.hypot(q.x - x, q.y - y) < 35; });
      if (previous) { previous.rotation += .6; say('让这弯月亮转个身。'); }
      else { S.patches.push({ u: uv.u, v: uv.v, rotation: -.3 + (S.moonCount % 4) * .25 }); if (S.patches.length > 18) S.patches.shift(); S.moonCount++; say('月亮缝牢了，会跟着被子走。'); }
      S.needle = { x, y, life: 1 }; sound(65 + S.moonCount % 6, 0);
    }
    if (S.tool === 'hole' && type === 'down') {
      const previous = S.holes.find(p => { const q = pos(p.u, p.v); return !p.closed && Math.hypot(q.x - x, q.y - y) < p.r + 10; });
      if (previous) { previous.r = Math.min(44, previous.r + 6); previous.progress = Math.max(0, previous.progress - .2); }
      else { S.holes.push({ u: uv.u, v: uv.v, r: 22 + S.holesMade % 3 * 4, progress: 0, closed: false, phase: S.holesMade * 1.7 }); if (S.holes.length > 14) S.holes.shift(); S.holesMade++; }
      leakAt(uv.u, uv.v, 5); sound(44, 1); say('星星漏出来了。用针线把洞慢慢收好。');
    }
    if (S.tool === 'sew' && S.time - S.lastSew > .085) {
      S.lastSew = S.time;
      let best = null, dist = Infinity;
      S.holes.forEach(h => { const p = pos(h.u, h.v), d = Math.hypot(x - p.x, y - p.y); if (!h.closed && d < h.r + 23 && d < dist) { dist = d; best = h; } });
      S.needle = { x, y, life: .7 };
      if (best) { best.progress = Math.min(1, best.progress + .26); sound(59 + Math.round(best.progress * 10), 0); if (best.progress >= 1) { best.closed = true; S.repairs++; say('洞合拢了，留下一道温柔的针脚。'); } else say('再缝几针，星星就不冷了。'); }
      else if (type === 'down') { S.stitches.push({ u: uv.u, v: uv.v, rotation: (S.stitches.length % 6) * .2 }); if (S.stitches.length > 45) S.stitches.shift(); sound(57, 0); say('在空白处，缝一道自己的星轨。'); }
    }
  }
  function leakAt(u, v, count) { const p = pos(u, v), r = seed(S.emitted * 915 + 1719); for (let i = 0; i < count; i++) { S.stars.push({ x: p.x + (r() - .5) * 22, y: p.y, vx: (r() - .5) * 50, vy: -20 - r() * 40, life: 5 + r() * 3, maxLife: 8, r: 3 + r() * 5, a: r() * 6.28 }); S.emitted++; } if (S.stars.length > 80) S.stars.splice(0, S.stars.length - 80); }
  function fold() {
    S.folds++; const mode = S.folds % 3;
    for (let j = 0; j <= ROW; j++) for (let i = 0; i <= COL; i++) {
      const u = i / COL, v = j / ROW, n = S.nodes[j * (COL + 1) + i];
      if (mode === 1) { const corner = Math.max(0, (u - .48) / .52); n.dx = clamp(n.dx * .35 - corner * 148 * (1 - v * .6), -168, 135); n.dy = clamp(n.dy * .4 + corner * (1 - v) * 104, -135, 126); }
      else if (mode === 2) { n.dx = clamp(n.dx * .45 + Math.sin(u * Math.PI * 4) * 15, -168, 135); n.dy = clamp(n.dy * .35 - v * 103 + Math.sin(u * Math.PI) * 24, -135, 126); }
      else { n.dx *= .18; n.dy *= .18; }
    }
    S.down = false; S.anchor = null; sound(48 + mode * 5, 1); say(['展开云被，旧月亮和针脚还在。', '右角折下来，所有补丁跟着打个盹。', '把下摆掖好，云被变成一条暖围巾。'][mode]);
  }
  function action(id) { if (id === 'fold') { fold(); return; } if (tools.some(t => t.id === id)) { S.tool = id; S.down = false; S.anchor = null; } }
  function pointer(type, x, y) {
    const view = S.view, xx = (clamp(x, 0, 1) * view.w - view.ox) / view.scale, yy = (clamp(y, 0, 1) * view.h - view.oy) / view.scale; S.x = xx; S.y = yy;
    if (type === 'up') { S.down = false; S.anchor = null; return; }
    if (type === 'down') { S.down = true; S.lastX = xx; S.lastY = yy; S.anchor = S.tool === 'pull' ? locate(xx, yy, 45) : null; if (S.anchor) say('慢慢拉，月亮和针脚会一起挪动。'); }
    if (!S.down) return;
    if (S.tool === 'pull' && S.anchor && type === 'move') {
      const dx = clamp(xx - S.lastX, -45, 45), dy = clamp(yy - S.lastY, -45, 45);
      for (let j = 0; j <= ROW; j++) for (let i = 0; i <= COL; i++) { const du = i / COL - S.anchor.u, dv = (j / ROW - S.anchor.v) * .5, influence = Math.exp(-(du * du + dv * dv) / .047); const n = S.nodes[j * (COL + 1) + i]; n.dx = clamp(n.dx + dx * influence, -168, 135); n.dy = clamp(n.dy + dy * influence, -135, 126); }
      S.pullMoves++; if (Math.abs(dx) + Math.abs(dy) > 2) sound(45 + Math.round(S.anchor.u * 14), 1);
    } else if (S.tool !== 'pull') editAt(xx, yy, type);
    S.lastX = xx; S.lastY = yy;
  }
  function drawHead(c, t, warmth) {
    // Layered pastel paper silhouette and a heavy, gently tilted head.
    c.save(); c.translate(345, 228); c.rotate(-.11 + Math.sin(t * .4) * .012);
    ellipse(c, -44, 77, 206, 111, '#39344f'); ellipse(c, -134, 45, 35, 53, C.purple);
    ellipse(c, 0, 3, 164, 171, '#918aaf'); ellipse(c, 21, 3, 140, 162, '#b2a7c4'); ellipse(c, 38, 24, 111, 132, '#bab0ca');
    // Cut-felt night cap, floppy point to the left.
    c.beginPath(); c.moveTo(-156, -13); c.bezierCurveTo(-154, -167, -6, -200, 108, -102); c.bezierCurveTo(28, -152, -118, -155, -198, -96); c.bezierCurveTo(-190, -141, -185, -160, -172, -179); c.bezierCurveTo(-290, -110, -235, -58, -156, -13); c.closePath(); c.fillStyle = C.purple; c.fill();
    c.beginPath(); c.moveTo(-156, -13); c.bezierCurveTo(-114, -106, 33, -151, 118, -87); c.strokeStyle = '#867da3'; c.lineWidth = 23; c.stroke();
    c.setLineDash([2, 8]); c.strokeStyle = '#b7aacb'; c.lineWidth = 2; c.stroke(); c.setLineDash([]); star(c, -192, -159, 16, C.gold, .2);
    // Eyes react to open holes: a cold draft makes one sleepy eyelid lift.
    const wake = clamp((68 - warmth) / 55, 0, 1);
    c.strokeStyle = C.dark; c.lineWidth = 5; c.beginPath(); c.moveTo(-82, 13); c.bezierCurveTo(-65, 25, -42, 25, -25, 14); c.stroke();
    c.beginPath(); c.moveTo(39, 11); c.bezierCurveTo(54, 22 - wake * 17, 80, 22 - wake * 17, 94, 7); c.stroke();
    if (wake > .2) ellipse(c, 66, 15, 4, 2 + wake * 5, C.dark);
    for (let k = 0; k < 3; k++) { line(c, [{ x: -67 + k * 12, y: 24 }, { x: -71 + k * 12, y: 31 }], C.dark, 2); }
    c.beginPath(); c.moveTo(7, 15); c.bezierCurveTo(-11, 40, -8, 55, 21, 50); c.strokeStyle = '#897c9b'; c.lineWidth = 3; c.stroke();
    ellipse(c, -73, 59, 34, 20, C.rose); ellipse(c, 98, 47, 23, 16, C.rose);
    for (let i = 0; i < 6; i++) { line(c, [{ x: -98 + i * 9, y: 56 }, { x: -94 + i * 9, y: 63 }], '#d7a4ac', 2); }
    ellipse(c, 28, 88, 11, 8 + Math.sin(t * .95) * 2, '#77647c');
    c.strokeStyle = '#d2c4d5'; c.lineWidth = 2; c.beginPath(); c.moveTo(51, -72); c.quadraticCurveTo(108, -52, 111, -6); c.stroke();
    c.restore();
    // Hand resting on the duvet, echoed by an embroidered cuff.
    c.save(); c.translate(637, 356); c.rotate(.12); ellipse(c, 0, 0, 69, 25, '#a69ab7'); for (let i = 0; i < 4; i++) line(c, [{ x: -25 + i * 17, y: -3 }, { x: -27 + i * 17, y: 13 }], '#786b8d', 2); c.restore();
  }
  function drawCloth(c) {
    c.save(); c.translate(8, 16); clothPath(c); c.fillStyle = '#171b3288'; c.fill(); c.restore();
    clothPath(c); c.fillStyle = C.cyan; c.fill(); c.strokeStyle = '#899fb6'; c.lineWidth = 3; c.stroke();
    c.save(); clothPath(c); c.clip();
    const colors = ['#9bacbf', '#aeb9ce', '#86a8b8', '#a2baca', '#b5bcd0'];
    for (let j = 0; j < ROW; j++) for (let i = 0; i < COL; i++) {
      const p = [node(i, j), node(i + 1, j), node(i + 1, j + 1), node(i, j + 1)]; c.beginPath(); p.forEach((q, k) => k ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); c.closePath(); c.fillStyle = colors[(i * 3 + j * 2) % colors.length]; c.fill(); c.strokeStyle = '#728ea36b'; c.lineWidth = 1.2; c.stroke();
      // Fine alternating woven weft follows bilinear cloth coordinates.
      for (let l = 1; l < 5; l++) { const v = (j + l / 5) / ROW; line(c, [pos((i + .05) / COL, v), pos((i + .94) / COL, v)], '#e3ddec24', .7); }
      const mid = pos((i + .5) / COL, (j + .5) / ROW); if ((i + j) % 3 === 0) { c.strokeStyle = '#d8d5e080'; c.lineWidth = 1.5; c.beginPath(); c.arc(mid.x, mid.y, 7, .2, Math.PI - .2); c.stroke(); }
    }
    // Curving quilting channels, sewn down the mesh rather than screen space.
    c.setLineDash([2.5, 5.5]);
    for (let i = 1; i < COL; i += 2) { const pts = []; for (let j = 0; j <= 30; j++) pts.push(pos(i / COL + Math.sin(j / 30 * 6.28) * .008, j / 30)); line(c, pts, '#e4d9e7a0', 1.7); }
    c.setLineDash([]);
    S.patches.forEach(p => moonPatch(c, p));
    S.holes.forEach(h => {
      const p = pos(h.u, h.v); const rx = h.r * Math.max(.10, 1 - h.progress * .9);
      if (!h.closed) { ellipse(c, p.x, p.y, rx, h.r * .78, '#272943'); ellipse(c, p.x + 2, p.y - 3, rx * .76, h.r * .55, '#353450'); star(c, p.x + Math.sin(S.time * 1.7 + h.phase) * rx * .35, p.y + 2, 5, C.gold, S.time * .2); c.strokeStyle = '#71819e'; c.lineWidth = 3; c.beginPath(); c.ellipse(p.x, p.y, rx, h.r * .78, 0, 0, Math.PI * 2); c.stroke(); }
      const stitches = h.closed ? 7 : Math.floor(h.progress * 7);
      for (let i = 0; i < stitches; i++) { const yy = p.y - h.r * .6 + i * h.r * .2; line(c, [{ x: p.x - 9, y: yy - 3 }, { x: p.x + 9, y: yy + 4 }], C.gold, 2.6); line(c, [{ x: p.x + 9, y: yy - 3 }, { x: p.x - 9, y: yy + 4 }], '#e9d5ad', 1.2); }
    });
    S.stitches.forEach(s => { const p = pos(s.u, s.v); c.save(); c.translate(p.x, p.y); c.rotate(s.rotation); for (let i = -2; i < 3; i++) { line(c, [{ x: i * 8 - 3, y: -4 }, { x: i * 8 + 3, y: 4 }], C.gold, 2.2); } c.restore(); });
    c.restore();
    // Stitched scalloped perimeter, separate from the fill.
    clothPath(c); c.strokeStyle = '#d9cfe0b0'; c.lineWidth = 2; c.setLineDash([3, 7]); c.stroke(); c.setLineDash([]);
  }
  function draw(c, w, h, t, dt) {
    if (!S) init(); dt = clamp(Number(dt) || 0, 0, .05); S.time += dt; S.noticeTime -= dt; if (S.needle) { S.needle.life -= dt; if (S.needle.life <= 0) S.needle = null; }
    const open = S.holes.filter(hole => !hole.closed), warmth = clamp(85 + S.patches.length * 3 - open.length * 15, 0, 100);
    if (S.time - S.lastLeak > .72) { S.lastLeak = S.time; open.forEach(hole => leakAt(hole.u, hole.v, 1)); }
    S.stars.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.vx += Math.sin(S.time + s.a) * 4 * dt; s.life -= dt; s.a += dt * .4; }); S.stars = S.stars.filter(s => s.life > 0 && s.y > -30);
    const scale = Math.max(.001, Math.min(w / 1000, h / 700)), ox = (w - 1000 * scale) / 2, oy = (h - 700 * scale) / 2; S.view = { w, h, scale, ox, oy };
    c.save(); c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
    S.sky.forEach(s => { c.globalAlpha = .18; ellipse(c, s.x * w / 1000, s.y * h / 700, Math.max(.5, s.r * scale), Math.max(.5, s.r * scale), '#c6bfd8'); }); c.globalAlpha = 1;
    c.translate(ox, oy); c.scale(scale, scale); c.fillStyle = C.bg; c.fillRect(0, 0, 1000, 700); c.lineCap = 'round'; c.lineJoin = 'round';
    const grad = c.createRadialGradient(481, 320, 80, 480, 355, 580); grad.addColorStop(0, '#54517388'); grad.addColorStop(1, '#20234200'); c.fillStyle = grad; c.fillRect(0, 0, 1000, 700);
    S.sky.forEach(s => { c.globalAlpha = .25 + .23 * Math.sin(t * .4 + s.p); ellipse(c, s.x, s.y, s.r, s.r, '#c6bfd8'); }); c.globalAlpha = 1;
    // Night workshop: thread reel, needle and a length of loose pale yarn.
    c.strokeStyle = '#6a6588'; c.lineWidth = 1; c.beginPath(); c.moveTo(719, 73); c.bezierCurveTo(864, 11, 973, 151, 845, 229); c.bezierCurveTo(772, 273, 946, 265, 946, 331); c.stroke();
    c.save(); c.translate(823, 195); c.rotate(.24); c.fillStyle = '#ba91a6'; c.fillRect(-26, -24, 52, 48); ellipse(c, 0, -25, 35, 9, '#866a8c'); ellipse(c, 0, 26, 35, 9, '#b195ae'); for (let i = -19; i <= 18; i += 5) line(c, [{ x: -24, y: i }, { x: 24, y: i + 3 }], '#d0adc0', 1); c.restore();
    c.save(); c.translate(907, 172); c.rotate(.35); line(c, [{ x: 0, y: -33 }, { x: 0, y: 45 }], '#bbb9d5', 3); c.strokeStyle = C.bg; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, -23, 2, 6, 0, 0, Math.PI * 2); c.stroke(); c.restore();
    label(c, '云被裁缝', 51, 67, 28, '#ddd4e8', '700'); label(c, 'CLOUD / MENDING ROOM', 638, 94, 12, '#a7b7cd', '600');
    label(c, '10', 900, 67, 43, C.gold, '700');
    drawHead(c, t, warmth); drawCloth(c);
    S.stars.forEach(s => { c.globalAlpha = Math.min(1, s.life * .6); star(c, s.x, s.y, s.r, '#edc987', s.a); c.globalAlpha = 1; });
    if (S.needle) { c.save(); c.translate(S.needle.x + 9, S.needle.y - 7); c.rotate(.75); line(c, [{ x: 0, y: -23 }, { x: 0, y: 22 }], '#f1e5dc', 2.4); c.strokeStyle = C.gold; c.lineWidth = 1.3; c.beginPath(); c.moveTo(0, -20); c.bezierCurveTo(-22, -36, 11, -54, 26, -31); c.stroke(); c.restore(); }
    if (S.down && S.tool === 'pull' && S.anchor) { const p = pos(S.anchor.u, S.anchor.v); c.strokeStyle = '#e8d6b6'; c.lineWidth = 2; c.setLineDash([3, 6]); c.beginPath(); c.arc(p.x, p.y, 24, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); }
    // Quiet captions make the three-minute play loop discoverable.
    label(c, '暖意 ' + Math.round(warmth) + '%', 51, 667, 13, C.gold, '600'); label(c, '月补丁 ' + S.patches.length + '  ·  漏星洞 ' + open.length + '  ·  缝好 ' + S.repairs, 739, 667, 12, '#b2bdcf');
    c.textAlign = 'center'; label(c, S.noticeTime > 0 ? S.notice : ({ pull: '拖云被塑形；补丁、洞与针脚都跟着走。', moon: '点云被缝一弯月；再点月亮让它转身。', hole: '点云被开洞，看星星慢慢逃跑。', sew: '在洞上点四针，或慢慢拖动缝合。' })[S.tool], 500, 684, 13, '#c4c4d5'); c.textAlign = 'left';
    S.dust.forEach(d => { c.fillStyle = 'rgba(225,213,237,' + d.a + ')'; c.fillRect(d.x, d.y, d.len, .65); });
    c.restore();
  }
  function stats() { return { tool: S.tool, moonPatches: S.patches.length, totalMoonsPlaced: S.moonCount, openHoles: S.holes.filter(h => !h.closed).length, holesMade: S.holesMade, repairs: S.repairs, looseStitches: S.stitches.length, folds: S.folds, foldMode: S.folds % 3, pullMoves: S.pullMoves, starsEmitted: S.emitted, liveStars: S.stars.length, patches: S.patches.map(p => ({ u: +p.u.toFixed(4), v: +p.v.toFixed(4), x: +pos(p.u, p.v).x.toFixed(2), y: +pos(p.u, p.v).y.toFixed(2), rotation: +p.rotation.toFixed(2) })), holes: S.holes.map(h => ({ u: +h.u.toFixed(4), v: +h.v.toFixed(4), x: +pos(h.u, h.v).x.toFixed(2), y: +pos(h.u, h.v).y.toFixed(2), progress: +h.progress.toFixed(2), closed: h.closed })), deformation: +S.nodes.reduce((a, n) => a + Math.abs(n.dx) + Math.abs(n.dy), 0).toFixed(2), nodeCount: S.nodes.length }; }
  window.ART = { title: '云被裁缝', subtitle: '把漏掉的星星，慢慢缝回梦里。', palette: { bg: C.bg, ink: C.ink, accent: C.gold }, tools, init, draw, pointer, action, stats };
  init();
}());
