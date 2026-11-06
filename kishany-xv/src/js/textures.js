/* textures.js — texturas generadas en canvas (respaldo cuando no hay archivos en /assets) */
const Tex = {
  canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; },
  done(c) { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; },

  glow(inner = "rgba(255,248,236,1)", mid = "rgba(245,214,220,.45)") {
    const c = this.canvas(128, 128), x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner); g.addColorStop(.3, mid); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); return this.done(c);
  },
  sparkle() { // destello dorado con brillo (visible sobre fondos claros)
    const c = this.canvas(64, 64), x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,250,235,1)"); g.addColorStop(.25, "rgba(222,186,118,.95)"); g.addColorStop(.55, "rgba(198,164,107,.35)"); g.addColorStop(1, "rgba(198,164,107,0)");
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return this.done(c);
  },
  heart() {
    const c = this.canvas(64, 64), x = c.getContext("2d");
    x.translate(32, 34); x.beginPath(); x.moveTo(0, 18); x.bezierCurveTo(-26, 2, -22, -22, 0, -10); x.bezierCurveTo(22, -22, 26, 2, 0, 18);
    const g = x.createLinearGradient(0, -20, 0, 18); g.addColorStop(0, "#f3dfb3"); g.addColorStop(1, "#c6a46b");
    x.fillStyle = g; x.fill(); x.lineWidth = 1.5; x.strokeStyle = "#fff8ec"; x.stroke(); return this.done(c);
  },
  rose(x, cx, cy, r, col, gold) {
    x.save(); x.translate(cx, cy);
    for (let i = 0; i < 5; i++) { x.rotate(Math.PI * 2 / 5); x.beginPath(); x.ellipse(0, -r * .55, r * .42, r * .62, 0, 0, Math.PI * 2); x.fillStyle = col; x.fill(); x.strokeStyle = gold; x.lineWidth = 1.4; x.stroke(); }
    x.beginPath(); x.arc(0, 0, r * .28, 0, Math.PI * 2); x.fillStyle = gold; x.fill(); x.restore();
  },
  curl(x, sx, sy, s, flip, gold) {
    x.save(); x.translate(sx, sy); x.scale(flip ? -s : s, s); x.strokeStyle = gold; x.lineWidth = 2.4 / s; x.lineCap = "round";
    x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(30, -10, 50, -40, 30, -60); x.bezierCurveTo(15, -72, -5, -58, 8, -46); x.stroke();
    x.beginPath(); x.moveTo(18, -20); x.bezierCurveTo(30, -18, 40, -8, 36, 4); x.stroke();
    x.beginPath(); x.ellipse(40, -30, 6, 12, .6, 0, Math.PI * 2); x.stroke(); x.restore();
  },
  doorLeaf(mirror) {
    const W = 512, H = 1620, c = this.canvas(W, H), x = c.getContext("2d"), s = W / 1.2;
    const cy = H - 2.6 * s, R = 1.2 * s, gold = "#c9a462";
    if (mirror) { x.translate(W, 0); x.scale(-1, 1); }
    const outline = () => { x.beginPath(); x.moveTo(0, H); x.lineTo(W, H); x.lineTo(W, cy - R); x.arc(W, cy, R, 1.5 * Math.PI, Math.PI, true); x.closePath(); };
    outline(); x.save(); x.clip();
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#f7e4e7"); g.addColorStop(.45, "#eccdd3"); g.addColorStop(1, "#d6a7b1");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.globalAlpha = .3; for (let i = 0; i < 70; i++) this.curl(x, Math.random() * W, Math.random() * H, .5 + Math.random() * .5, Math.random() > .5, "#b98289");
    x.globalAlpha = 1;
    x.lineWidth = 44; x.strokeStyle = gold; outline(); x.stroke();
    x.lineWidth = 3; x.strokeStyle = "#f6e6c4"; x.beginPath(); x.moveTo(30, H - 30); x.lineTo(W - 30, H - 30); x.lineTo(W - 30, cy - R + 34); x.arc(W, cy, R - 30, 1.5 * Math.PI, Math.PI, true); x.closePath(); x.stroke();
    x.lineWidth = 3; x.strokeStyle = gold;
    x.beginPath(); x.moveTo(64, H * .52); x.lineTo(64, cy); x.arc(W, cy, R - 64, Math.PI, 1.5 * Math.PI); x.lineTo(W - 46, cy - R + 64); x.lineTo(W - 46, H * .52); x.closePath(); x.stroke();
    x.strokeRect(64, H * .56, W - 110, H * .4 - 40); x.lineWidth = 1.2; x.strokeRect(80, H * .56 + 16, W - 142, H * .4 - 72);
    const pinks = ["#d98f9f", "#e8b2bd", "#c47a8b"];
    for (let i = 0; i < 6; i++) this.curl(x, 120 + (i % 2) * 140, H * .64 + i * 70, .9, i % 2, gold);
    this.rose(x, W * .52, H * .76, 46, pinks[0], gold); this.rose(x, W * .3, H * .68, 26, pinks[1], gold); this.rose(x, W * .68, H * .86, 30, pinks[2], gold);
    this.rose(x, W * .45, H * .36, 34, pinks[1], gold); this.rose(x, W * .7, H * .27, 22, pinks[0], gold); this.rose(x, W * .3, H * .44, 20, pinks[2], gold);
    for (let i = 0; i < 5; i++) this.curl(x, W * .25 + i * 50, H * .42 - i * 40, .8, i % 2, gold);
    // corazón dorado en el panel inferior
    x.save(); x.translate(W * .5, H * .62); x.scale(1.4, 1.4); x.beginPath(); x.moveTo(0, 18); x.bezierCurveTo(-26, 2, -22, -22, 0, -10); x.bezierCurveTo(22, -22, 26, 2, 0, 18); x.lineWidth = 2; x.strokeStyle = gold; x.stroke(); x.restore();
    x.beginPath(); x.arc(W - 72, H - 1.3 * s, 22, 0, Math.PI * 2); x.lineWidth = 7; x.strokeStyle = "#b8924f"; x.stroke();
    x.beginPath(); x.arc(W - 72, H - 1.3 * s + 34, 8, 0, Math.PI * 2); x.fillStyle = "#b8924f"; x.fill();
    x.restore();
    return this.done(c);
  },
  flowerWall() { // muro de rosas y hojas salvia, tonos claros
    const c = this.canvas(512, 512), x = c.getContext("2d");
    x.fillStyle = "#dcb4bb"; x.fillRect(0, 0, 512, 512);
    const leaves = ["#9fb79a", "#8aa584", "#b5c7ae", "#75906f"];
    for (let i = 0; i < 700; i++) { x.save(); x.translate(Math.random() * 512, Math.random() * 512); x.rotate(Math.random() * 6.3); x.fillStyle = leaves[(Math.random() * leaves.length) | 0]; x.globalAlpha = .55 + Math.random() * .4; x.beginPath(); x.ellipse(0, 0, 4 + Math.random() * 5, 10 + Math.random() * 9, 0, 0, 6.3); x.fill(); x.restore(); }
    x.globalAlpha = 1;
    const pinks = ["#f5e6e8", "#f0c4cc", "#e7aab7", "#fff7f3", "#d9aeb7"];
    for (let i = 0; i < 120; i++) {
      const px = Math.random() * 512, py = Math.random() * 512, r = 7 + Math.random() * 12, col = pinks[(Math.random() * pinks.length) | 0];
      for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(px, py, r * (1 - k * .28), 0, 6.3); x.fillStyle = k % 2 ? "#fff0f2" : col; x.globalAlpha = k ? .5 : 1; x.fill(); }
      x.globalAlpha = 1; x.strokeStyle = "rgba(150,88,103,.45)"; x.lineWidth = 1.2; x.beginPath(); x.arc(px, py, r * .45, 0, 4.5); x.stroke();
    }
    const t = this.done(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  },
  crest() {
    const c = this.canvas(512, 512), x = c.getContext("2d"), gold = "#c9a462";
    x.translate(256, 256);
    const g = x.createRadialGradient(0, 0, 10, 0, 0, 240); g.addColorStop(0, "#fffaf6"); g.addColorStop(1, "#f0d2d7");
    x.beginPath(); x.moveTo(0, -230); x.bezierCurveTo(120, -230, 200, -170, 200, -40); x.bezierCurveTo(200, 90, 110, 180, 0, 230); x.bezierCurveTo(-110, 180, -200, 90, -200, -40); x.bezierCurveTo(-200, -170, -120, -230, 0, -230);
    x.fillStyle = g; x.fill(); x.lineWidth = 10; x.strokeStyle = gold; x.stroke(); x.lineWidth = 2; x.save(); x.scale(.88, .88); x.stroke(); x.restore();
    for (let i = 0; i < 4; i++) this.curl(x, -150 + (i % 2) * 300, -150 + (i > 1 ? 260 : 0), 1, i % 2, gold);
    x.textAlign = "center"; x.textBaseline = "middle";
    x.fillStyle = "#a88345"; x.font = "500 200px 'Cormorant Garamond', Garamond, serif"; x.fillText("K", -24, 6);
    x.fillStyle = "#b97685"; x.font = "italic 400 150px 'Cormorant Garamond', Garamond, serif"; x.fillText("F", 52, 46);
    return this.done(c);
  },
  wing(tint = "#F5E6E8") {
    const c = this.canvas(256, 256), x = c.getContext("2d");
    const shape = () => { x.beginPath(); x.moveTo(4, 122); x.bezierCurveTo(40, 40, 140, -10, 228, 26); x.bezierCurveTo(262, 60, 214, 116, 150, 126); x.bezierCurveTo(206, 150, 214, 214, 168, 236); x.bezierCurveTo(118, 254, 40, 196, 4, 134); x.closePath(); };
    shape(); const g = x.createRadialGradient(10, 128, 6, 60, 128, 230);
    g.addColorStop(0, "#ffffff"); g.addColorStop(.35, tint); g.addColorStop(.8, "#e3a9b6"); g.addColorStop(1, "#c6a46b");
    x.fillStyle = g; x.fill(); x.lineWidth = 6; x.strokeStyle = "#c9a462"; x.stroke();
    x.save(); shape(); x.clip(); x.strokeStyle = "rgba(176,140,80,.8)"; x.lineWidth = 1.8;
    [[228, 30], [200, 70], [160, 118], [190, 200], [130, 220]].forEach(([tx, ty]) => { x.beginPath(); x.moveTo(6, 128); x.quadraticCurveTo(tx * .45, (ty + 128) / 2, tx, ty); x.stroke(); });
    x.fillStyle = "rgba(255,255,255,.95)"; for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(40 + Math.random() * 180, 30 + Math.random() * 200, Math.random() * 2.8, 0, 6.3); x.fill(); }
    x.restore(); return this.done(c);
  },
  ray() {
    const c = this.canvas(64, 256), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "rgba(255,252,240,.95)"); g.addColorStop(1, "rgba(255,252,240,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 256);
    const h = x.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, "rgba(0,0,0,1)"); h.addColorStop(.5, "rgba(0,0,0,0)"); h.addColorStop(1, "rgba(0,0,0,1)");
    x.globalCompositeOperation = "destination-out"; x.fillStyle = h; x.fillRect(0, 0, 64, 256); return this.done(c);
  },
  petal() {
    const c = this.canvas(64, 64), x = c.getContext("2d"); x.translate(32, 32); x.beginPath(); x.ellipse(0, 0, 14, 26, 0, 0, 6.3);
    const g = x.createLinearGradient(0, -26, 0, 26); g.addColorStop(0, "#fff4f5"); g.addColorStop(1, "#e7aab7"); x.fillStyle = g; x.fill(); return this.done(c);
  },
};
