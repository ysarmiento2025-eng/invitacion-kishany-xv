/* audioManager.js — música ambiental (archivo autorizado o ambiente sintetizado) y efectos */
const AudioManager = {
  ctx: null, master: null, wet: null, el: null, mode: null, playing: false,
  vol: (CONFIG.sound && CONFIG.sound.channels.music.volume) ?? CONFIG.music.volume, timer: null, chordIdx: 0,

  init() {
    const saved = parseFloat(store.get("kxv-vol2")); if (!isNaN(saved)) this.vol = saved;
    $("#vol").value = this.vol;
    if (CONFIG.music.src) this.prepare();                       // el archivo se va descargando mientras se ve la portada
    if (CONFIG.sound) CONFIG.sound.channels.music.volume = this.vol;
    $("#musicToggle").addEventListener("click", () => this.playing ? this.pause() : this.play());
    $("#volToggle").addEventListener("click", () => { const x = $("#music").classList.toggle("expanded"); $("#volToggle").setAttribute("aria-expanded", x); });
    $("#vol").addEventListener("input", e => this.setVol(+e.target.value));
    document.addEventListener("visibilitychange", () => { if (document.hidden && this.playing) { this._resume = true; this.pause(); } else if (!document.hidden && this._resume) { this._resume = false; this.play(); } });
  },
  ensureCtx() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain(); this.master.gain.value = this.vol * .5;
    const comp = ctx.createDynamicsCompressor(); this.master.connect(comp); comp.connect(ctx.destination);
    this.wet = ctx.createGain(); this.wet.gain.value = .35;
    const d = ctx.createDelay(); d.delayTime.value = .42; const fb = ctx.createGain(); fb.gain.value = .38;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2200;
    this.wet.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(this.master);
    return ctx;
  },
  hz(n) { return 440 * Math.pow(2, (n - 69) / 12); },
  note(freq, t, dur, type, peak, attack = 1.6) {
    const ctx = this.ctx, o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = type; o.frequency.value = freq; f.type = "lowpass"; f.frequency.value = type === "sine" ? 3000 : 1600;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(this.master); g.connect(this.wet); o.start(t); o.stop(t + dur + .1);
  },
  schedule() { // progresión suave en Do mayor con campanitas pentatónicas
    const ctx = this.ctx, t = ctx.currentTime + .05;
    const chords = [[48, 55, 64, 67], [45, 57, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62]];
    const ch = chords[this.chordIdx++ % chords.length];
    ch.forEach((n, i) => { this.note(this.hz(n), t + i * .05, 7.5, "sine", .065); this.note(this.hz(n) * 1.003, t, 7, "triangle", .022); });
    const pent = [76, 79, 81, 84, 86, 88];
    for (let k = 0; k < 4; k++) if (Math.random() < .7) this.note(this.hz(pent[(Math.random() * pent.length) | 0]), t + .8 + k * 1.4 + Math.random() * .4, 2.6, "sine", .03, .02);
  },
  // Elemento <audio> único: nunca se recrea ni se reinicia al cambiar de sección.
  prepare() {
    if (this.el) return this.el;
    const el = this.el = new Audio(); el.src = CONFIG.music.src; el.loop = true; el.preload = "auto"; el.setAttribute("playsinline", "");
    el.addEventListener("ended", () => { if (this.playing) { el.currentTime = 0; el.play().catch(() => {}); } });   // respaldo del bucle
    el.addEventListener("error", () => { if (this.mode === "file") { this.mode = "synth"; console.warn("[música] archivo no disponible, se usa ambiente"); if (this.playing) this.play(); } });
    return el;
  },
  // Reproduce el archivo a través de Web Audio: así el volumen funciona también en iPhone
  // (Safari ignora audio.volume) y la música entra con un fundido suave.
  async playFile() {
    const el = this.prepare(), ctx = this.ensureCtx();
    if (ctx) {
      if (ctx.state !== "running") ctx.resume();
      if (!this.fgain) { try { const src = ctx.createMediaElementSource(el); this.fgain = ctx.createGain(); src.connect(this.fgain); this.fgain.connect(ctx.destination); } catch (e) { this.fgain = null; } }
    }
    this.mode = "file";
    if (this.fgain) { el.volume = 1; const t = ctx.currentTime; this.fgain.gain.cancelScheduledValues(t); this.fgain.gain.setValueAtTime(0, t); this.fgain.gain.linearRampToValueAtTime(this.vol, t + 1.4); }
    else el.volume = this.vol;
    await el.play(); this.playing = true; this.ui();
  },
  async play() {
    if (CONFIG.music.src && this.mode !== "synth") {
      try { await this.playFile(); return; }
      catch (e) {
        if (e && e.name === "NotAllowedError") { this.playing = false; this.ui(); return; }   // el navegador pidió un toque: el botón queda en «reproducir»
        this.mode = "synth";
      }
    }
    this.mode = "synth"; const ctx = this.ensureCtx(); if (!ctx) { toast("Este navegador no permite reproducir audio."); return; }
    await ctx.resume(); if (!this.timer) { this.schedule(); this.timer = setInterval(() => this.schedule(), 6000); }
    this.playing = true; this.ui();
  },
  pause() {
    if (this.mode === "file" && this.el) this.el.pause();
    if (this.ctx) this.ctx.suspend();
    clearInterval(this.timer); this.timer = null; this.playing = false; this.ui();
  },
  setVol(v) {
    this.vol = v; store.set("kxv-vol2", v);
    if (this.fgain) this.fgain.gain.setTargetAtTime(v, this.ctx.currentTime, .05); else if (this.el) this.el.volume = v;
    if (this.master) this.master.gain.setTargetAtTime(v * .5, this.ctx.currentTime, .1);
  },
  setVolChannel(v) { CONFIG.sound.channels.music.volume = v; this.setVol(v); },
  ui() {
    $("#music").classList.toggle("playing", this.playing);
    const b = $("#musicToggle");
    b.setAttribute("aria-label", this.playing ? "Pausar música" : "Reproducir música");
    b.setAttribute("aria-pressed", String(this.playing));
  },
};
