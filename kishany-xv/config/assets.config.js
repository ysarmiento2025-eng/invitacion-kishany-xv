/* =========================================================
   assets.config.js — Sistema de recursos reemplazables (ASSET SYSTEM)
   Cada elemento tiene un id. Para reemplazarlo:
     1. Copia el archivo a /assets/<carpeta>/
     2. Escribe su ruta en "src" (ej. "assets/floating/mariposa-01.webp")
     3. Ajusta "type": "procedural" | "image" | "3d" | "video"
   Si un archivo no existe o falla, se usa la versión generada automáticamente.
   ========================================================= */
window.CONFIG = window.CONFIG || {};

CONFIG.assets = {
  intro: {
    // Puerta: "procedural" construye la puerta 3D con dos hojas y bisagras.
    // Con un GLB propio, nombra los nodos de las hojas "LeafLeft" y "LeafRight" para que se abran.
    door:  { id: "door-main", type: "procedural", src: "", textureLeft: "", textureRight: "" },
    // Placa ornamental sobre el arco: usa el sello oficial de branding.config.js
    crest: { id: "crest-kf",  type: "image", src: "assets/branding/sello_k_transparente.webp" },
    wall:  { id: "flower-wall", type: "procedural", src: "" },        // textura repetible del muro de flores
  },

  // Objetos flotantes. layer: "near" | "mid" | "far" (planos de profundidad)
  floating: [
    { id: "butterfly-01", kind: "butterfly", type: "procedural", src: "", enabled: true, mobileEnabled: true,  layer: "near", scale: 0.30, speed: 0.8, opacity: 0.95, tint: "#FFFFFF" },
    { id: "butterfly-02", kind: "butterfly", type: "procedural", src: "", enabled: true, mobileEnabled: true,  layer: "mid",  scale: 0.22, speed: 1.0, opacity: 0.95, tint: "#F5E6E8" },
    { id: "butterfly-03", kind: "butterfly", type: "procedural", src: "", enabled: true, mobileEnabled: true,  layer: "mid",  scale: 0.20, speed: 1.1, opacity: 0.95, tint: "#E9C9C9" },
    { id: "butterfly-04", kind: "butterfly", type: "procedural", src: "", enabled: true, mobileEnabled: true,  layer: "far",  scale: 0.26, speed: 0.7, opacity: 0.90, tint: "#F3DFB3" },
    { id: "butterfly-05", kind: "butterfly", type: "procedural", src: "", enabled: true, mobileEnabled: false, layer: "mid",  scale: 0.18, speed: 1.2, opacity: 0.95, tint: "#FFFFFF" },
    { id: "butterfly-06", kind: "butterfly", type: "procedural", src: "", enabled: true, mobileEnabled: false, layer: "far",  scale: 0.22, speed: 0.9, opacity: 0.85, tint: "#E9C9C9" },
    { id: "butterfly-07", kind: "butterfly", type: "procedural", src: "", enabled: true, mobileEnabled: true,  layer: "near", scale: 0.24, speed: 0.9, opacity: 0.95, tint: "#F5E6E8" },
  ],

  particles: { enabled: true, countDesktop: 650, countMobile: 280, color: "#D8B36E", size: 0.07 },
  hearts:    { enabled: true, countDesktop: 26,  countMobile: 14 },     // pequeños corazones dorados flotando
  petals:    { enabled: true, countDesktop: 90,  countMobile: 45 },
  lightRays: { enabled: true, count: 7 },
  forest:    { trees: { desktop: 80, mobile: 46 }, flowers: { desktop: 480, mobile: 240 } },
};
