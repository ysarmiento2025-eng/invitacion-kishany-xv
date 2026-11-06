/* sections.js — datos del evento, cuenta regresiva, calendario, ubicación, sobre, revelado y cierre */

const EventInfo = {
  fmt(opts) { return new Intl.DateTimeFormat("es-CO", { timeZone: CONFIG.event.timeZone, ...opts }).format(new Date(CONFIG.event.startISO)); },
  cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); },
  mapsUrl() { const E = CONFIG.event; return E.mapsUrl || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(E.mapsQuery); },
  fullAddress() { const E = CONFIG.event; return `${E.venue} · ${E.room}, ${E.address}, ${E.city}`; },

  init() {
    const E = CONFIG.event;
    const date = this.cap(this.fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    const time = this.fmt({ hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s/g, " ");
    this.dateText = date; this.timeText = time;

    $("#evDate").textContent = date; $("#evTime").textContent = time;
    $("#evRoom").textContent = E.room;
    E.parents.forEach(n => { const s = document.createElement("span"); s.textContent = n; $("#evParents").appendChild(s); });

    // Recinto, dirección y mapa (dentro de la información del evento, sin duplicar el salón)
    $("#locVenue").textContent = E.venue; $("#locAddress").textContent = `${E.address} · ${E.city}`;
    $("#mapsBtn").href = this.mapsUrl();
    $("#wazeBtn").href = "https://waze.com/ul?q=" + encodeURIComponent(E.mapsQuery) + "&navigate=yes";
    $("#copyAddr").addEventListener("click", () => copyText(this.fullAddress()));
    if (!inFrame) { // mapa embebido (en el sitio publicado; las vistas previas bloquean iframes externos)
      const f = document.createElement("iframe"); f.loading = "lazy"; f.title = "Mapa del lugar"; f.referrerPolicy = "no-referrer-when-downgrade";
      f.src = "https://www.google.com/maps?q=" + encodeURIComponent(E.mapsQuery) + "&output=embed";
      $("#mapFrame").appendChild(f); $("#mapFrame").hidden = false;
    }

    // Calendario
    $("#gcalBtn").href = Calendar.googleUrl(); $("#doneCal").href = Calendar.googleUrl();
    $("#icsBtn").addEventListener("click", () => Calendar.downloadIcs());

    if (E.spotifyUrl) { $("#spotifyBtn").href = E.spotifyUrl; $("#spotifyBtn").hidden = false; }

    // Créditos de producción con enlace al Instagram
    const C = CONFIG.credits || {};
    if (C.name) $("#credName").textContent = C.name;
    if (C.agency) $("#agencySlot").textContent = C.agency;
    if (C.tagline) $("#credTag").textContent = C.tagline;
    const ig = $("#igBtn");
    if (C.instagram) { ig.href = C.instagram; $("#igLbl").textContent = C.ctaLabel || "Conoce nuestro trabajo"; }
    else ig.hidden = true;
    $("#rsvpDeadline").textContent = E.rsvpDeadline ? `Por favor, confírmanos antes del ${E.rsvpDeadline}. ¡Tu lugar está esperándote!` : "";

    // Compartir
    const shareText = `✨ Estás invitado a los XV años de ${E.honoree} · ${E.title}. ${date}, ${time}.`;
    const url = location.href.split("#")[0];
    $("#shareBtn").href = "https://wa.me/?text=" + encodeURIComponent(shareText + " " + url);
    $("#shareBtn").addEventListener("click", e => { if (navigator.share && !inFrame) { e.preventDefault(); navigator.share({ title: E.title, text: shareText, url }).catch(() => {}); } });

    Branding.init();
  },
};

/* Sello oficial: el monograma K de la invitación original, colocado según branding.config.js */
const Branding = {
  src(key) { const B = CONFIG.branding; return B.seal[B.placement[key].asset] || ""; },
  // Coloca el sello en un contenedor. Si el archivo falta, deja el respaldo vectorial.
  place(slot, key, { tappable = false, alt = "Sello KF" } = {}) {
    const P = CONFIG.branding.placement[key]; const el = $(slot); if (!el) return;
    if (!P || !P.enabled) { el.hidden = true; return; }
    const src = this.src(key);
    if (!src) { el.innerHTML = MONOGRAM_SVG; return; }
    const img = new Image();
    img.alt = alt; img.className = "seal-img"; img.decoding = "async";
    if (P.size) img.style.width = P.size + "px";
    img.style.opacity = P.opacity ?? 1;
    img.onerror = () => { el.innerHTML = MONOGRAM_SVG; };                 // recurso faltante: no rompe la web
    img.onload = () => {
      el.replaceChildren(img);
      if (P.entrance && !reduceMotion) {                                  // entrada: opacidad + escala 0.94 → 1
        img.style.transform = `scale(${P.entrance.from})`; img.style.opacity = 0;
        cssTo(img, { transform: "scale(1)", opacity: String(P.opacity ?? 1) }, P.entrance.duration || 1.4);
      }
    };
    img.src = src;
    if (tappable) {
      el.classList.add("seal-tap"); el.setAttribute("role", "button"); el.tabIndex = 0;
      const shine = () => { el.classList.remove("shine"); void el.offsetWidth; el.classList.add("shine"); SFX.play("seal"); };
      el.addEventListener("click", shine);
      el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); shine(); } });
    }
  },
  init() {
    this.place("#heroSeal", "portada", { tappable: true, alt: "Sello de Kishany Florez" });
    this.place("#sepSeal", "separador", { alt: "" });
    this.place("#gardenSeal", "jardin", { alt: "" });
    this.place("#rsvpSeal", "confirma", { alt: "" });
    this.place("#letterSeal", "carta", { alt: "" });
    this.place("#monoSlot", "cierre", { tappable: true, alt: "Monograma KF" });
    const logo = CONFIG.branding.agencyLogo;
    if (logo) { const img = new Image(); img.alt = "LA MOVIE AGENCY S.A.S."; img.onload = () => $("#agencySlot").replaceChildren(img); img.src = logo; }
    const fav = CONFIG.branding.seal.favicon;
    if (fav) { const l = document.querySelector("link[rel=icon]"); if (l) l.href = fav; }
  },
};

const MONOGRAM_SVG = `<svg class="mono" viewBox="0 0 120 120" role="img" aria-label="Monograma KF">
  <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcc08a"/><stop offset="1" stop-color="#a07d43"/></linearGradient></defs>
  <circle cx="60" cy="60" r="56" fill="rgba(255,253,251,.7)"/>
  <circle cx="60" cy="60" r="54" fill="none" stroke="url(#mg)" stroke-width="1"/>
  <circle cx="60" cy="60" r="48" fill="none" stroke="url(#mg)" stroke-width=".5" stroke-dasharray="1 3"/>
  <text x="50" y="77" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="54" font-weight="500" fill="url(#mg)">K</text>
  <text x="72" y="84" text-anchor="middle" font-family="Cormorant Garamond, serif" font-style="italic" font-size="40" fill="#B97685">F</text>
  <path d="M60 104s-7-4.2-7-8.4a3.6 3.6 0 017-1.4 3.6 3.6 0 017 1.4c0 4.2-7 8.4-7 8.4z" fill="url(#mg)"/>
</svg>`;

const Calendar = {
  stamp(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); },
  range() { const s = new Date(CONFIG.event.startISO), e = new Date(s.getTime() + CONFIG.event.durationHours * 3600e3); return [s, e]; },
  details() { return `${CONFIG.event.title}\nCon la bendición de ${CONFIG.event.parents.join(" y ")}.\nVestuario: damas vestido largo · caballeros smoking negro.\nInvitación: ${location.href.split("#")[0]}`; },
  googleUrl() {
    const [s, e] = this.range(), E = CONFIG.event;
    return "https://calendar.google.com/calendar/render?action=TEMPLATE"
      + "&text=" + encodeURIComponent(`XV años de ${E.honoree}`)
      + "&dates=" + this.stamp(s) + "/" + this.stamp(e)
      + "&details=" + encodeURIComponent(this.details())
      + "&location=" + encodeURIComponent(EventInfo.fullAddress())
      + "&ctz=" + encodeURIComponent(E.timeZone);
  },
  ics() {
    const [s, e] = this.range(), E = CONFIG.event, esc = t => t.replace(/[\\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//LA MOVIE AGENCY//XV Kishany//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT",
      "UID:xv-kishany-20261121@lamovie", "DTSTAMP:" + this.stamp(new Date()), "DTSTART:" + this.stamp(s), "DTEND:" + this.stamp(e),
      "SUMMARY:" + esc(`XV años de ${E.honoree}`), "DESCRIPTION:" + esc(this.details()), "LOCATION:" + esc(EventInfo.fullAddress()),
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Mañana son los XV de Kishany ♡", "END:VALARM",
      "BEGIN:VALARM", "TRIGGER:-PT3H", "ACTION:DISPLAY", "DESCRIPTION:Hoy es la noche mágica ♡", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  },
  downloadIcs() {
    const blob = new Blob([this.ics()], { type: "text/calendar;charset=utf-8" }), url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "XV-Kishany-Florez.ics"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    if (inFrame) toast("En la vista previa no se descargan archivos; en el sitio publicado sí.");
  },
};

const Countdown = {
  last: {},
  init() { this.target = new Date(CONFIG.event.startISO).getTime(); this.end = this.target + CONFIG.event.durationHours * 3600e3; this.tick(); this.iv = setInterval(() => this.tick(), 1000); },
  set(id, v) {
    const s = String(v).padStart(2, "0"); if (this.last[id] === s) return; this.last[id] = s;
    const el = $("#cd-" + id); el.innerHTML = `<span>${s}</span>`;
    if (!reduceMotion) { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); }
  },
  tick() {
    const now = Date.now(), diff = this.target - now;
    if (diff <= 0) {
      clearInterval(this.iv); $("#countGrid").hidden = true; const m = $("#countMsg"); m.hidden = false;
      m.textContent = now < this.end ? "¡Hoy comienza la magia!" : "Gracias por vivir la magia conmigo"; return;
    }
    const s = Math.floor(diff / 1000);
    this.set("d", Math.floor(s / 86400)); this.set("h", Math.floor(s % 86400 / 3600)); this.set("m", Math.floor(s % 3600 / 60)); this.set("s", s % 60);
  },
};

const Envelope = {
  init() {
    const env = $("#envelope"), btn = $("#envBtn");
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("span"); s.className = "spark"; const a = i / 14 * Math.PI * 2;
      s.style.setProperty("--dx", Math.cos(a) * 120 + "px"); s.style.setProperty("--dy", Math.sin(a) * 85 - 40 + "px"); s.style.animationDelay = (.3 + Math.random() * .3) + "s";
      env.appendChild(s);
    }
    btn.addEventListener("click", () => {
      const o = env.classList.toggle("open");
      $("#sobres").classList.toggle("opened", o);
      btn.setAttribute("aria-expanded", o); btn.setAttribute("aria-label", o ? "Cerrar el sobre" : "Abrir el sobre");
      $("#envHint").textContent = o ? "Toca para cerrar" : "Toca el sobre para abrirlo";
      // la tarjeta sube fuera del sobre: la dejamos a la vista
      if (o) setTimeout(() => $("#letter").scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" }), 700);
    });
  },
};

const Reveal = {
  init() {
    const els = [...document.querySelectorAll(".rv")], root = $("#content");
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver(ents => ents.forEach(e => {
      if (!e.isIntersecting) return; const el = e.target; el.classList.add("in"); io.unobserve(el);
      if (el.hasAttribute("data-fly") && !reduceMotion) { // mariposa entre párrafos
        const f = $("#flyMsg"), sec = $("#mensaje"), r = el.getBoundingClientRect(), sr = sec.getBoundingClientRect();
        f.style.top = (r.top - sr.top + r.height * .3) + "px"; f.classList.remove("go"); void f.getBoundingClientRect(); f.classList.add("go");
      }
    }), { root, threshold: .2 });
    let heroI = 0; els.forEach(e => { if (e.closest("#hero")) e.style.transitionDelay = (heroI++ * .25) + "s"; io.observe(e); });

    // Escena final: una mariposa vuela hacia el interior del bosque
    const fin = new IntersectionObserver(ents => ents.forEach(e => {
      if (e.isIntersecting && !this.flewFinal) {
        this.flewFinal = true; SFX.play("closing");
        if (Scene3D.ok) { const c = Scene3D.camera.position; Scene3D.fly(new THREE.Vector3(c.x + .4, c.y - .2, c.z - 1.2), new THREE.Vector3(c.x - .6, c.y + 1.6, c.z - 14), 5); }
      }
    }), { root, threshold: .3 });
    fin.observe($("#final"));

    // Sonido etéreo ocasional de mariposa al entrar al bosque (nunca en cada aparición)
    const bf = new IntersectionObserver(ents => ents.forEach(e => { if (e.isIntersecting) SFX.play("butterfly"); }), { root, threshold: .5 });
    bf.observe($("#mensaje"));
  },
};
