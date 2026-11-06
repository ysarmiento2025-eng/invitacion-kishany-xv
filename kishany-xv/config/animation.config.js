/* =========================================================
   animation.config.js — Cámara y tiempos (segundos)
   ========================================================= */
window.CONFIG = window.CONFIG || {};

CONFIG.animation = {
  layers: { near: 2.6, mid: 5, far: 10 },   // distancia de cada plano frente a la cámara
  introDolly: 4.2,                          // acercamiento inicial a la puerta (DOLLY IN)
  doorOpen: 2.6,                            // apertura de las hojas
  flyThrough: 2.2,                          // cruce de la cámara por la puerta
  forestTravel: 46,                         // metros que avanza la cámara al desplazar la página
  parallax: 0.35,                           // movimiento con el dedo/mouse (0 = desactivado)
};
