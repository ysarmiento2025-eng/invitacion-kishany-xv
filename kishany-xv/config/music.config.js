/* =========================================================
   music.config.js — Música ambiental
   Coloca el instrumental AUTORIZADO de «Dos Oruguitas» en /assets/music/
   y escribe su ruta en "src". Vacío o archivo faltante = ambiente
   instrumental generado en el navegador (sin derechos de terceros).
   La música solo suena después de tocar «Descubrir la magia».
   ========================================================= */
window.CONFIG = window.CONFIG || {};

CONFIG.music = {
  src: "",                    // ej. "assets/music/ambient.mp3"
  volume: 0.6,
  effects: {
    opening: "",              // "assets/audio/opening.mp3" (vacío = destello sintetizado)
  },
};
