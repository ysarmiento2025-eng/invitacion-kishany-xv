/* =========================================================
   music.config.js — Música ambiental
   «Dos Oruguitas» (assets/music/dos-oruguitas.mp3, normalizada a -14 LUFS
   y 128 kbps para cargar rápido en el celular). Suena en bucle desde el primer
   toque en «Descubrir la magia». Si el archivo falta, se usa un ambiente
   instrumental generado en el navegador.
   ========================================================= */
window.CONFIG = window.CONFIG || {};

CONFIG.music = {
  src: "assets/music/dos-oruguitas.mp3",
  volume: 0.9,
  effects: {
    opening: "",              // "assets/audio/opening.mp3" (vacío = destello sintetizado)
  },
};
