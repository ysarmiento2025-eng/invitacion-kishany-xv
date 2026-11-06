/* =========================================================
   event.config.js — Datos del evento
   Edita aquí fecha, hora, lugar, enlaces y textos.
   ========================================================= */
window.CONFIG = window.CONFIG || {};

CONFIG.event = {
  honoree: "Kishany Florez",
  title: "Mis 15 Años · El Bosque de un Renacer",

  // Fecha y hora con la zona horaria de Colombia (UTC-5, sin horario de verano).
  startISO: "2026-11-21T19:00:00-05:00",
  timeZone: "America/Bogota",
  durationHours: 6,                         // duración para el calendario y el mensaje final del contador

  venue: "Centro de Convenciones de las Américas",
  room: "Salón Nueva Granada",
  address: "Anillo Vial, sector Cielo Mar",
  city: "Cartagena de Indias",

  parents: ["Kevin Flórez", "Tatiana Pastrana"],

  // Texto que usan Google Maps, Waze y el calendario para encontrar el lugar.
  // Si el cliente entrega un enlace oficial de Google Maps, pégalo en mapsUrl y tendrá prioridad.
  mapsQuery: "Centro de Convenciones de las Américas, Anillo Vial, Cielo Mar, Cartagena, Colombia",
  mapsUrl: "",

  // Enlace opcional a la playlist colaborativa de Spotify (se muestra como botón extra).
  spotifyUrl: "",

  rsvpDeadline: "14 de noviembre",
};

CONFIG.rsvp = {
  // Los cupos (1 a 4 por invitado) los asigna quien envía la invitación y se comunican en el mensaje;
  // el formulario ya no pregunta por acompañantes ni celular.

  // CONFIRMACIÓN POR WHATSAPP (se usa si la base de datos no está configurada o falla).
  //
  // Opción A (recomendada): el número que recibe las confirmaciones, en formato
  // internacional, solo dígitos, sin "+" ni espacios. Ejemplo: 573001234567.
  whatsappNumber: "",

  // Opción B: un enlace completo ya armado. Si lo escribes, tiene prioridad sobre el número.
  // OJO: wa.me solo acepta NÚMEROS de teléfono después de la barra. Un enlace como
  // "wa.me/Kishanys15thBirthday" muestra «número de teléfono no válido» en WhatsApp.
  // Si tienes un enlace de wa.me/message/XXXX (enlace corto de WhatsApp Business), ese sí sirve.
  whatsappLink: "https://wa.me/Kishanys15thBirthday",

  // Texto que se envía por WhatsApp. {nombre}, {asistencia} y {mensaje} se reemplazan solos.
  whatsappText: "Hola! Respondo a la invitación a los 15 años de Kishany Florez.\nNombre: {nombre}\nAsistencia: {asistencia}{mensaje}",

  apiBase: "/api",                          // rutas de Vercel: /api/rsvp y /api/songs
};

CONFIG.credits = {
  name: "YOSIMAR ZUÑIGA",
  agency: "LA MOVIE AGENCY S.A.S.",
  tagline: "Creative Direction · Digital Experience · Web Development",
  ctaLabel: "Conoce nuestro trabajo",
  instagram: "https://www.instagram.com/ads_yosii/",
};
