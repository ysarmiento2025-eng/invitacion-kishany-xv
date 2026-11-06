/* sfx.js — identidad sonora: canal de efectos independiente de la música.
   Cada efecto usa su archivo (CONFIG.sound.effects[x].src) o, si no existe,
   una versión original sintetizada con Web Audio API. */
const SFX = {
  ctx: null, bus: null, wet: null, last: 0, cool: {},
  get on() { return CONFIG.sound.channels.effects.enabled; },

  init() {
    const saved = store.get("kxv-sfx");
    if (saved !== null) CONFIG.sound.channels.effects.enabled = saved === "1";
    const v = parseFloat(store.get("kxv-sfx-vol")); if (!isNaN(v)) CONFIG.sound.channels.effects.volume = v;
  },
  ensure() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    const ctx = this.ctx = AudioManager.ensureCtx() || new AC();
    this.bus = ctx.createGain(); this.bus.gain.value = CONFIG.sound.channels.effects.volume;
    this.bus.connect(ctx.destination);
    const d = ctx.createDelay(); d.delayTime.value = .28;
    const fb = ctx.createGain(); fb.gain.value = .3;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3800;
    this.wet = ctx.createGain(); this.wet.gain.value = .3;
    this.wet.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(this.bus);
    return ctx;
  },
  setEnabled(on) {
    CONFIG.sound.channels.effects.enabled = on; store.set("kxv-sfx", on ? "1" : "0");
    if (this.bus) this.bus.gain.value = on ? CONFIG.sound.channels.effects.volume : 0;
  },
  hz(n) { return 440 * Math.pow(2, (n - 69) / 12); },
  bell(f, t, dur, peak, type = "sine", attack = .005) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(this.bus); g.connect(this.wet); o.start(t); o.stop(t + dur + .05);
  },
  noise(t, dur, peak, freq, q = 1, type = "bandpass") {
    const ctx = this.ctx, n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(); s.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.bus); g.connect(this.wet); s.start(t); s.stop(t + dur);
  },
  // Partituras originales de cada sonido (sin material de terceros)
  synth: {
    intro(t, v) { [84, 88, 91, 96, 100].forEach((n, i) => SFX.bell(SFX.hz(n), t + i * .13, 2.6, .10 * v, "sine", .01)); SFX.bell(SFX.hz(48), t, 3.2, .07 * v, "sine", .6); },
    seal(t, v) { SFX.bell(SFX.hz(96), t, .7, .11 * v, "sine"); SFX.bell(SFX.hz(103), t + .04, .5, .06 * v, "triangle"); SFX.noise(t, .18, .05 * v, 6200, 2); },
    door(t, v) { SFX.noise(t, 1.5, .07 * v, 320, .7, "lowpass"); SFX.noise(t + .25, 1.8, .05 * v, 900, .5, "lowpass"); SFX.bell(SFX.hz(40), t + .1, 2.4, .08 * v, "sine", .5); SFX.bell(SFX.hz(79), t + 1.1, 1.8, .05 * v, "sine", .3); },
    butterfly(t, v) { SFX.noise(t, .5, .035 * v, 2600, .8); SFX.bell(SFX.hz(98), t + .12, .9, .045 * v, "sine", .03); },
    reveal(t, v) { [72, 76, 79, 84, 88, 91, 96].forEach((n, i) => SFX.bell(SFX.hz(n), t + i * .14, 2.2, .07 * v, "sine", .02)); SFX.bell(SFX.hz(36), t, 3, .07 * v, "sine", .9); },
    click(t, v) { SFX.bell(SFX.hz(93), t, .14, .07 * v, "sine", .002); SFX.noise(t, .05, .03 * v, 4200, 3); },
    confirmation(t, v) { [76, 80, 83, 88].forEach((n, i) => SFX.bell(SFX.hz(n), t + i * .09, 1.6, .09 * v, "sine", .01)); },
    closing(t, v) { [60, 67, 72, 79].forEach((n, i) => SFX.bell(SFX.hz(n), t + i * .22, 4.5, .07 * v, "sine", .8)); SFX.bell(SFX.hz(91), t + 1.2, 3.5, .05 * v, "sine", .4); },
  },

  play(name) {
    if (!this.on) return;
    const cfg = CONFIG.sound.effects[name]; if (!cfg) return;
    const now = Date.now();
    if (now - this.last < CONFIG.sound.minGapMs) return;                       // no encimar efectos
    if (cfg.cooldownMs && now - (this.cool[name] || 0) < cfg.cooldownMs) return;
    this.last = now; this.cool[name] = now;
    const vol = (cfg.volume ?? .6);
    if (cfg.src) { const a = new Audio(cfg.src); a.volume = Math.min(1, vol * CONFIG.sound.channels.effects.volume); a.play().catch(() => this._synth(cfg, vol)); return; }
    this._synth(cfg, vol);
  },
  _synth(cfg, vol) {
    const ctx = this.ensure(); if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const fn = this.synth[cfg.synth]; if (fn) fn(ctx.currentTime + .02, vol);
  },

  // Conecta el sonido de click y la respuesta táctil a todos los botones y enlaces de acción
  wireButtons(root = document) {
    root.addEventListener("pointerdown", e => {
      const el = e.target.closest(".btn, .btn-magic, .stepper button, #musicToggle, #sfxToggle, .choice label, .env-wrap, .seal-tap");
      if (!el) return;
      this.play(el.classList.contains("env-wrap") || el.classList.contains("seal-tap") ? "seal" : "click");
    }, { passive: true });
  },
};
