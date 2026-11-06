/* =========================================================
   branding.config.js — Sello oficial, monograma, paleta y opacidades
   El monograma K proviene de la invitación física original de Kishany
   (recortado de la pieza entregada por la dirección creativa).
   NO se redibuja ni se sustituye por una K generada.
   Para actualizarlo, reemplaza el archivo y conserva el nombre.
   ========================================================= */
window.CONFIG = window.CONFIG || {};

CONFIG.branding = {
  // Recursos del sello (si un archivo falta, la web sigue funcionando con el respaldo vectorial)
  seal: {
    principal:   "assets/branding/sello_k_principal.webp",
    transparente:"assets/branding/sello_k_transparente.webp",
    simplificado:"assets/branding/sello_k_simplificado.webp",
    monograma:   "assets/branding/monograma_k_original.webp",
    favicon:     "assets/branding/favicon_k.png",
  },

  // Paleta oficial (coincide con las variables de src/styles/global.css)
  palette: {
    rosaEmpolvado: "#D9AEB7", rosaChampagne: "#E9C9C9", rosaClaro: "#F5E6E8", rosaAntiguo: "#B98289",
    marfil: "#F7F1E9", doradoChampagne: "#C6A46B", doradoClaro: "#E8D3A2",
    verdeBotanico: "#617B61", vino: "#672F45", plateado: "#C9C6C7",
  },

  // Escala de opacidad por tipo de elemento
  opacity: {
    sello: 1, identidad: .9, ornamento: .75, floresFondo: .55,
    ambiente: .35, particulas: .2, bokeh: .1,
  },

  // Dónde aparece el sello y con qué tratamiento. enabled:false lo oculta en esa escena.
  placement: {
    portada:  { enabled: true,  asset: "principal",    size: 210, opacity: 1,   entrance: { from: .94, to: 1, duration: 1.4 } },
    puerta:   { enabled: true,  asset: "transparente", opacity: 1 },             // placa ornamental sobre el arco
    jardin:   { enabled: true,  asset: "simplificado", size: 72,  opacity: .6 }, // firma discreta en una esquina
    separador:{ enabled: true,  asset: "transparente", size: 50,  opacity: .95 },// separador en datos del evento
    confirma: { enabled: true,  asset: "transparente", size: 96,  opacity: .9 }, // encabezado del formulario
    carta:    { enabled: true,  asset: "transparente", size: 58,  opacity: 1 },  // tarjeta dentro del sobre
    cierre:   { enabled: true,  asset: "principal",    size: 230, opacity: 1 },
  },

  // Logo oficial de LA MOVIE AGENCY. Vacío = crédito en texto (no se dibuja un logo sustituto).
  agencyLogo: "",
};
