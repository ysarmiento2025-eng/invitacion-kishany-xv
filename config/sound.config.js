/* =========================================================
   sound.config.js — Identidad sonora
   Dos canales independientes: música y efectos, cada uno con su volumen.
   Cada efecto puede usar un archivo propio (src) o el sonido original
   sintetizado en el navegador (sin derechos de terceros) si src está vacío.
   Para usar archivos, colócalos en /assets/audio/ y escribe su ruta.
   ========================================================= */
window.CONFIG = window.CONFIG || {};

CONFIG.sound = {
  channels: {
    music:   { volume: 0.9, enabled: true },
    effects: { volume: 0.5, enabled: true },
  },
  minGapMs: 220,          // evita que dos efectos suenen encimados
  effects: {
    intro:        { src: "", scene: "intro",  volume: 0.9, synth: "intro"        }, // campanilla cristalina de apertura
    seal:         { src: "", scene: "all",    volume: 0.7, synth: "seal"         }, // tintineo al tocar el sello
    door:         { src: "", scene: "intro",  volume: 0.9, synth: "door"         }, // apertura de la puerta
    butterfly:    { src: "", scene: "forest", volume: 0.45, synth: "butterfly", cooldownMs: 9000 },
    reveal:       { src: "", scene: "forest", volume: 0.8, synth: "reveal"       }, // llegada al bosque
    click:        { src: "", scene: "all",    volume: 0.35, synth: "click"       },
    confirmation: { src: "", scene: "rsvp",   volume: 0.8, synth: "confirmation" },
    closing:      { src: "", scene: "final",  volume: 0.7, synth: "closing"      },
  },
};
