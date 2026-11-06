/* audioManager.js — música ambiental (archivo autorizado o ambiente sintetizado) y efectos */
const AudioManager = {
  ctx: null, master: null, wet: null, el: null, mode: null, playing: false,
  vol: (CONFIG.sound && CONFIG.sound.channels.music.volume) ?? CONFIG.music.volume, timer: null, chordIdx: 0,

  init() {
    const saved = parseFloat(store.get("kxv-vol")); if (!isNaN(saved)) this.vol = saved;
    $("#vol").value = this.vol;
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
  async play() {
    if (CONFIG.music.src && this.mode !== "synth") {
      try {
        if (!this.el) {
          this.el = new Audio(CONFIG.music.src); this.el.loop = true; this.el.preload = "auto";
          this.el.addEventListener("error", () => { if (this.mode === "file") { this.mode = "synth"; console.warn("[música] archivo no disponible, se usa ambiente"); if (this.playing) this.play(); } });
        }
        this.el.volume = this.vol; this.mode = "file"; await this.el.play(); this.playing = true; this.ui(); return;
      } catch (e) { this.mode = "synth"; }
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
    this.vol = v; store.set("kxv-vol", v);
    if (this.el) this.el.volume = v;
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
