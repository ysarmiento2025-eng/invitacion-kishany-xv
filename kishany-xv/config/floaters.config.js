/* =========================================================
   floaters.config.js — Elementos flotantes al frente (profundidad)
   Pétalos, mariposas, destellos, corazones y flores desenfocadas
   que pasan DELANTE del contenido sin bloquear toques ni lectura.
   enabled:false apaga toda la capa.
   ========================================================= */
window.CONFIG = window.CONFIG || {};
CONFIG.floaters = {
  enabled: true,
  mobileScale: .7,      // fracción de elementos en pantallas pequeñas
  blooms: true,         // flores desenfocadas en las esquinas
  butterflies: true,
  dimWhileTyping: true, // se atenúa mientras el invitado escribe en un formulario
  maxOpacity: 1,        // multiplica la opacidad de todos (0–1)
  layers: {             // cantidad por profundidad y tipo
    far:  { sparkle: 6, petal: 2 },
    mid:  { petal: 4, heart: 2, sparkle: 2, butterfly: 1 },
    near: { petal: 2, heart: 1, butterfly: 1 },
  },
};
