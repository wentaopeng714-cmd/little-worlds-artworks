(function () {
  'use strict';
  const C = { paper: '#eee5cd', ink: '#183f64', blue: '#426c89', coral: '#d77458', pale: '#c4d5ca', shadow: '#c9bfa5' };
  const names = ['卷尾先生', '海盐小姐', '星期三鱼', '薄荷船长', '赶潮青年', '小夜班'];
  const tools = [{ id: 'scissors', label: '剪胡须' }, { id: 'comb', label: '梳头鳍' }, { id: 'rollers', label: '夹发卷' }, { id: 'next', label: '换下一位' }, { id: 'photo', label: '队列合照' }];
  let S;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function seed(n) { let z = n >>> 0; return () => ((z = (z * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function fresh(id) {
    const r = seed(809 + id * 7919);
    return { id, name: names[id % names.length], fin: Array.from({ length: 15 }, (_, i) => ({ h: 34 + r() * 54 + Math.sin(i * .3) * 12, lean: (r() - .5) * 30, curl: false })), beard: Array.from({ length: 8 }, () => 53 + r() * 24), edits: 0 };
  }
  function init() {
    const r = seed(82401);
    S = { tool: 'comb', current: fresh(0), gallery: [], id: 0, down: false, x: 500, y: 350, photo: false, clock: 0, lastSound: -10, lastCut: -10, lastCurl: -10, snips: 0, combs: 0, curls: 0, served: 0, particles: [], flash: 0, notice: '先梳一撮歪歪的头鳍。', noticeTime: 5,
      view: { w: 1000, h: 700, scale: 1, ox: 0, oy: 0 }, grain: Array.from({ length: 780 }, () => ({ x: r() * 1000, y: r() * 700, a: .025 + r() * .045, l: 1 + r() * 5 })) };
  }
  function sound(note, kind) { if (S.clock - S.lastSound > .11) { S.lastSound = S.clock; if (window.SOUND && window.SOUND.fx) window.SOUND.fx(note, kind); } }
  function say(s) { S.notice = s; S.noticeTime = 3.5; }
  function burst(x, y, n, color) { const r = seed(S.snips * 1923 + S.curls * 717 + Math.floor(S.clock * 50)); for (let i = 0; i < n; i++) S.particles.push({ x, y, vx: (r() - .5) * 170, vy: -25 - r() * 95, life: .8 + r() * .6, color, a: r() * 6.3 }); if (S.particles.length > 65) S.particles.splice(0, S.particles.length - 65); }
  function ellipse(c, x, y, rx, ry, color) { c.fillStyle = color; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
  function path(c, points, color, width) { c.beginPath(); points.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.strokeStyle = color; c.lineWidth = width; c.stroke(); }
  function text(c, str, x, y, size, color, font) { c.fillStyle = color; c.font = (font || '600') + ' ' + size + 'px sans-serif'; c.fillText(str, x, y); }
  function bodyPath(c) {
    c.beginPath(); c.moveTo(253, 298); c.bezierCurveTo(371, 206, 597, 216, 693, 245); c.bezierCurveTo(759, 257, 794, 309, 806, 347); c.bezierCurveTo(805, 358, 790, 364, 779, 363); c.bezierCurveTo(785, 406, 660, 465, 506, 461); c.bezierCurveTo(385, 460, 285, 415, 250, 376); c.closePath();
  }
  function hairBase(i) { return { x: 336 + i * 20.5, y: 250 - Math.sin(i / 14 * Math.PI) * 15 }; }
  function fish(c, f, x, y, scale, live, t) {
    c.save(); c.translate(x, y); c.scale(scale, scale); c.lineCap = 'round'; c.lineJoin = 'round';
    // Paper-cut tail, deliberately too large for a sensible fish.
    c.fillStyle = C.coral; c.strokeStyle = C.ink; c.lineWidth = 5;
    c.beginPath(); c.moveTo(270, 330); c.bezierCurveTo(220, 321, 170, 263, 146, 275); c.lineTo(171, 341); c.lineTo(140, 404); c.bezierCurveTo(181, 414, 235, 372, 270, 365); c.closePath(); c.fill(); c.stroke();
    for (let i = 0; i < 6; i++) path(c, [[161 + i * 3, 289 + i * 21], [254, 348]], C.ink, 2);
    // Each top-fin rib is stored, combable geometry, not a palette preset.
    c.beginPath(); c.moveTo(322, 259);
    f.fin.forEach((a, i) => { const p = hairBase(i); c.lineTo(p.x + a.lean, p.y - a.h); });
    c.lineTo(645, 255); c.closePath(); c.fillStyle = C.coral; c.fill(); c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
    f.fin.forEach((a, i) => { const p = hairBase(i); path(c, [[p.x, p.y], [p.x + a.lean, p.y - a.h]], C.ink, 2.5); });
    bodyPath(c); c.fillStyle = C.pale; c.fill();
    c.save(); bodyPath(c); c.clip();
    c.fillStyle = C.paper; c.fillRect(280, 353, 550, 140);
    for (let i = 0; i < 10; i++) {
      c.save(); c.translate(290 + i * 43, 320); c.rotate(-.17);
      c.fillStyle = i % 2 ? C.blue : C.ink; c.fillRect(-6, -115, 20 + (i % 3) * 4, 265); c.restore();
    }
    c.strokeStyle = '#f9efd3'; c.lineWidth = 2; c.globalAlpha = .4;
    for (let i = 0; i < 23; i++) { c.beginPath(); c.moveTo(280 + i * 19, 244); c.lineTo(265 + i * 19, 454); c.stroke(); }
    c.globalAlpha = 1;
    // Tiny scraped paper flecks, all generated rather than imported.
    for (let i = 0; i < 80; i++) { const xx = 276 + ((i * 83) % 522), yy = 245 + ((i * 61) % 215); c.fillStyle = i % 4 ? '#f0e6ca77' : '#c6694e'; c.fillRect(xx, yy, 3 + i % 5, 1.4); }
    c.restore(); bodyPath(c); c.strokeStyle = C.ink; c.lineWidth = 5; c.stroke();
    // Broad gill ring and ridiculous cheek.
    c.beginPath(); c.moveTo(651, 254); c.bezierCurveTo(598, 310, 614, 388, 659, 422); c.strokeStyle = C.ink; c.lineWidth = 7; c.stroke();
    c.beginPath(); c.moveTo(636, 268); c.bezierCurveTo(600, 313, 613, 379, 642, 400); c.strokeStyle = C.paper; c.lineWidth = 2; c.stroke();
    ellipse(c, 706, 299, 31, 35, C.paper); ellipse(c, 713, 302, 13, 19, C.ink); ellipse(c, 718, 295, 4, 6, '#fff9dc');
    if (live && Math.sin(t * .48) > .993) { path(c, [[681, 300], [731, 302]], C.ink, 8); }
    ellipse(c, 751, 340, 20, 12, C.coral);
    c.beginPath(); c.moveTo(787, 353); c.quadraticCurveTo(800, 346, 808, 352); c.strokeStyle = C.ink; c.lineWidth = 3; c.stroke();
    // Individual moustache strands survive into every archived portrait.
    f.beard.forEach((len, i) => {
      const bx = 710 + i * 9, by = 366 + Math.sin(i * .55) * 5, sign = i < 4 ? -1 : 1;
      c.beginPath(); c.moveTo(bx, by); c.bezierCurveTo(bx + sign * 11, by + len * .28, bx + sign * 30, by + len, bx + sign * (23 + i), by + len * .88); c.strokeStyle = C.ink; c.lineWidth = 4; c.stroke();
    });
    // Hand-drawn cylindrical curlers coil the selected fin tips.
    f.fin.forEach((a, i) => { if (!a.curl) return; const p = hairBase(i); c.save(); c.translate(p.x + a.lean, p.y - a.h); c.rotate(a.lean * .012); c.fillStyle = C.paper; c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); c.roundRect(-15, -12, 30, 25, 8); c.fill(); c.stroke(); for (let k = -8; k <= 8; k += 5) path(c, [[k, -9], [k, 9]], C.coral, 2); c.beginPath(); c.arc(0, 0, 6, 0, Math.PI * 1.8); c.stroke(); c.restore(); });
    // Side-fin comb held like a small fan.
    c.beginPath(); c.moveTo(499, 378); c.quadraticCurveTo(517, 399, 554, 427); c.quadraticCurveTo(482, 439, 469, 389); c.fillStyle = C.coral; c.fill(); c.strokeStyle = C.ink; c.lineWidth = 3; c.stroke();
    for (let i = 0; i < 5; i++) path(c, [[490, 391], [498 + i * 11, 420]], C.ink, 1.5);
    c.restore();
  }
  function comb(x, y) {
    if (x < 295 || x > 668 || y < 92 || y > 294) return;
    const index = clamp(Math.round((x - 336) / 20.5), 0, 14);
    S.current.fin.forEach((a, i) => { const d = Math.abs(index - i); if (d > 2) return; const p = hairBase(i), w = (3 - d) / 3; a.h += (clamp(p.y - y, 18, 145) - a.h) * .46 * w; a.lean += (clamp(x - p.x, -65, 65) - a.lean) * .3 * w; });
    S.current.edits++; S.combs++; sound(50 + index, 0); say('鳍已经记住这阵风。');
  }
  function trim(x, y) {
    if (x < 663 || x > 844 || y < 340 || y > 457 || S.clock - S.lastCut < .065) return;
    const index = clamp(Math.round((x - 710) / 9), 0, 7); let changed = false;
    for (let k = Math.max(0, index - 1); k <= Math.min(7, index + 1); k++) if (S.current.beard[k] > 10) { S.current.beard[k] = Math.max(10, S.current.beard[k] - 11); changed = true; }
    if (changed) { S.lastCut = S.clock; S.snips++; S.current.edits++; burst(x, y, 6, C.ink); sound(74, 2); say('剪下的胡须，落进今天的海风里。'); }
  }
  function curl(x, y) {
    if (x < 290 || x > 670 || y < 80 || y > 296) return;
    const i = clamp(Math.round((x - 336) / 20.5), 0, 14), a = S.current.fin[i]; a.curl = !a.curl; S.curls++; S.current.edits++; burst(x, y, 5, C.coral); sound(a.curl ? 69 : 57, 1); say(a.curl ? '一个小卷，留给合照。' : '拆掉发卷，风又回来。');
  }
  function action(id) {
    if (id === 'next') { S.gallery.push(JSON.parse(JSON.stringify(S.current))); if (S.gallery.length > 4) S.gallery.shift(); S.served++; S.current = fresh(++S.id); S.flash = 1; S.photo = false; say('上一位的发型，已经留在相片上。'); sound(64, 1); return; }
    if (id === 'photo') { S.photo = !S.photo; S.down = false; sound(76, 2); return; }
    if (tools.some(t => t.id === id)) { S.tool = id; S.photo = false; S.down = false; }
  }
  function pointer(type, x, y) {
    const v = S.view;
    S.x = (clamp(x, 0, 1) * v.w - v.ox) / v.scale; S.y = (clamp(y, 0, 1) * v.h - v.oy) / v.scale;
    if (type === 'up') { S.down = false; return; }
    if (S.photo) { if (type === 'down') S.photo = false; return; }
    if (type === 'down') { S.down = true; if (S.tool === 'rollers') curl(S.x, S.y); }
    if (S.down && (type === 'down' || type === 'move')) { if (S.tool === 'comb') comb(S.x, S.y); if (S.tool === 'scissors') trim(S.x, S.y); }
  }
  function draw(c, w, h, t, dt) {
    if (!S) init(); dt = clamp(Number(dt) || 0, 0, .05); S.clock += dt; S.noticeTime -= dt; S.flash = Math.max(0, S.flash - dt * 2);
    S.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 125 * dt; p.life -= dt; p.a += dt * 3; }); S.particles = S.particles.filter(p => p.life > 0);
    const scale = Math.max(.001, Math.min(w / 1000, h / 700)), ox = (w - 1000 * scale) / 2, oy = (h - 700 * scale) / 2;
    S.view = { w, h, scale, ox, oy };
    c.save(); c.fillStyle = C.paper; c.fillRect(0, 0, w, h);
    c.fillStyle = '#b9ad9323'; for (let i = 0; i < 29; i++) c.fillRect(0, (i + .5) * h / 29, w, .65);
    c.translate(ox, oy); c.scale(scale, scale); c.fillStyle = C.paper; c.fillRect(0, 0, 1000, 700); c.lineCap = 'round'; c.lineJoin = 'round';
    // Two offset arches and a stripe pole make a print-shop/salon stage.
    c.strokeStyle = '#c0cdbf'; c.lineWidth = 28; c.beginPath(); c.moveTo(95, 486); c.lineTo(95, 224); c.bezierCurveTo(95, 50, 327, 60, 327, 227); c.stroke();
    c.strokeStyle = '#ded4ba'; c.lineWidth = 3; c.beginPath(); c.moveTo(890, 491); c.lineTo(890, 166); c.bezierCurveTo(890, 101, 946, 100, 946, 167); c.lineTo(946, 491); c.stroke();
    text(c, 'SARDINE / SALON', 52, 53, 15, C.ink, '700'); text(c, '沙丁鱼理发铺', 52, 92, 27, C.ink, '700');
    text(c, '09', 897, 67, 43, C.coral, '800'); path(c, [[53, 108], [226, 108]], C.coral, 3);
    text(c, '今日已接待 ' + String(S.served).padStart(2, '0') + ' 位', 767, 112, 13, C.ink);
    if (S.photo) {
      c.fillStyle = C.ink; c.fillRect(60, 145, 880, 454); c.fillStyle = C.paper; c.fillRect(76, 160, 848, 420);
      text(c, '潮汐街 · 今日造型合照', 113, 199, 24, C.ink, '700'); text(c, '每一根被剪短、梳歪的线，都在。', 113, 226, 14, C.blue);
      const all = S.gallery.concat([S.current]); const n = all.length;
      all.forEach((f, i) => { const sc = n <= 2 ? .52 : .34; const xx = n === 1 ? 235 : n === 2 ? 76 + i * 421 : 56 + i % 3 * 294; const yy = n <= 2 ? 200 : 208 + Math.floor(i / 3) * 154; fish(c, f, xx, yy, sc, false, t); text(c, f.name + (i === n - 1 ? ' · 在座' : ''), xx + 74, yy + (n <= 2 ? 255 : 167), 12, C.ink); });
      text(c, '点画面回到椅子上', 402, 625, 14, C.blue);
    } else {
      // Vintage chair visible underneath the body.
      ellipse(c, 510, 514, 171, 18, '#d7ccb4'); c.fillStyle = C.ink; c.fillRect(489, 434, 26, 80); ellipse(c, 502, 511, 78, 10, C.ink);
      c.fillStyle = C.coral; c.beginPath(); c.roundRect(328, 443, 307, 25, 12); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 3; c.stroke();
      fish(c, S.current, 0, Math.sin(t * .8) * 2, 1, true, t);
      c.save(); c.translate(908, 297); c.rotate(.02); c.fillStyle = C.ink; c.beginPath(); c.roundRect(-18, -87, 36, 174, 15); c.fill(); c.save(); c.beginPath(); c.roundRect(-13, -80, 26, 160, 10); c.clip(); c.fillStyle = C.paper; c.fillRect(-20, -90, 40, 180); for (let i = -3; i < 6; i++) { c.fillStyle = i % 2 ? C.coral : C.blue; c.beginPath(); c.moveTo(-21, i * 37); c.lineTo(22, i * 37 - 24); c.lineTo(22, i * 37 - 7); c.lineTo(-21, i * 37 + 17); c.fill(); } c.restore(); c.restore();
      text(c, S.current.name, 434, 548, 18, C.ink, '700'); text(c, S.noticeTime > 0 ? S.notice : ({ comb: '在头顶拖动，把头鳍梳高、梳低、梳歪。', scissors: '在嘴角胡须上点按或慢慢拖动。', rollers: '点头鳍夹卷；再点同处拆卷。' })[S.tool], 240, 576, 14, C.blue);
      path(c, [[62, 673], [938, 673]], C.ink, 2); text(c, '合照候场', 64, 622, 13, C.ink);
      if (!S.gallery.length) { text(c, '换一位客人，便留下一张真实造型。', 242, 644, 14, '#6e7d7d'); }
      S.gallery.forEach((f, i) => { c.save(); c.translate(200 + i * 174, 579); c.rotate((i % 2 ? 1 : -1) * .023); c.fillStyle = '#f7efda'; c.fillRect(0, 0, 157, 89); c.strokeStyle = '#b3ad97'; c.lineWidth = 1; c.strokeRect(0, 0, 157, 89); fish(c, f, -10, -24, .2, false, t); text(c, String(f.id + 1).padStart(2, '0') + '  ' + f.name, 12, 81, 9, C.ink); c.restore(); });
      if (S.down) {
        c.save(); c.translate(S.x + 22, S.y + 20); c.rotate(-.3); c.strokeStyle = C.ink; c.lineWidth = 3;
        if (S.tool === 'comb') { c.fillStyle = C.coral; c.fillRect(-16, -6, 44, 10); for (let k = 0; k < 8; k++) path(c, [[-13 + k * 5, 3], [-13 + k * 5, 18]], C.ink, 2); }
        if (S.tool === 'scissors') { ellipse(c, -6, 15, 6, 6, C.paper); ellipse(c, 10, 15, 6, 6, C.paper); path(c, [[-6, 15], [11, -15]], C.ink, 2); path(c, [[10, 15], [-9, -15]], C.ink, 2); }
        c.restore();
      }
    }
    S.particles.forEach(p => { c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.globalAlpha = Math.min(1, p.life * 2); path(c, [[-3, 0], [4, 2]], p.color, 2); c.restore(); });
    S.grain.forEach(g => { c.fillStyle = 'rgba(28,54,70,' + g.a + ')'; c.fillRect(g.x, g.y, g.l, .7); });
    if (S.flash > 0) { c.fillStyle = 'rgba(255,248,218,' + S.flash * .45 + ')'; c.fillRect(0, 0, 1000, 700); }
    c.restore();
  }
  function stats() { return { tool: S.tool, customersServed: S.served, snips: S.snips, combMoves: S.combs, rollerChanges: S.curls, photoMode: S.photo, currentId: S.current.id, currentEdits: S.current.edits, fin: S.current.fin.map(v => ({ height: +v.h.toFixed(2), lean: +v.lean.toFixed(2), curl: v.curl })), beardLengths: S.current.beard.map(v => +v.toFixed(2)), portraits: S.gallery.map(f => ({ id: f.id, edits: f.edits, fin: f.fin.map(v => ({ height: +v.h.toFixed(2), lean: +v.lean.toFixed(2), curl: v.curl })), beardLengths: f.beard.map(v => +v.toFixed(2)) })), particleCount: S.particles.length }; }
  window.ART = { title: '沙丁鱼理发铺', subtitle: '每一撮怪发型，都值得一张合照。', palette: { bg: C.paper, ink: C.ink, accent: C.coral }, tools, init, draw, pointer, action, stats };
  init();
}());
