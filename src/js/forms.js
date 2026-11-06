/* forms.js — confirmación de asistencia (RSVP) y sugerencias de canciones.
   Guarda en Supabase a través de /api/rsvp y /api/songs (funciones de Vercel).
   Si la base de datos no está configurada o no responde, ofrece enviar por WhatsApp. */

function setErr(id, msg, input) {
  $("#err-" + id).textContent = msg || "";
  if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
}
function busy(btn, on, label) {
  btn.setAttribute("aria-busy", on ? "true" : "false");
  if (label) { btn.dataset.label = btn.dataset.label || btn.lastChild.textContent; btn.lastChild.textContent = on ? label : btn.dataset.label; }
}
// Arma el enlace de WhatsApp. Si hay whatsappLink lo usa tal cual y solo le pone el texto;
// si no, usa el número. Sin ninguno de los dos, el invitado elige el chat.
function waLink(text) {
  const R = CONFIG.rsvp, custom = (R.whatsappLink || "").trim();
  if (custom) {
    try {
      const u = new URL(custom);
      u.searchParams.set("text", text);
      return u.toString();
    } catch (e) { /* enlace mal escrito: seguimos con el número */ }
  }
  const num = (R.whatsappNumber || "").replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

const RSVP = {
  init() {
    this.shownAt = Date.now();
    document.querySelectorAll("input[name=attend]").forEach(r => r.addEventListener("change", () => {
      $("#dietWrap").hidden = !$("#rsvp-yes").checked; setErr("attend", "");
    }));
    $("#rsvp-name").addEventListener("input", e => setErr("name", "", e.target));
    $("#rsvpForm").addEventListener("submit", e => { e.preventDefault(); this.submit(); });
    $("#editBtn").addEventListener("click", () => { $("#rsvpDone").hidden = true; $("#rsvpForm").hidden = false; $("#rsvp-name").focus(); });
    this.prefill();
  },
  prefill() { // si ya respondió desde este teléfono, recupera sus datos para editarlos
    let prev = null; try { prev = JSON.parse(store.get("kxv-rsvp")); } catch (e) {}
    if (!prev) return;
    $("#rsvp-name").value = prev.name || ""; $("#rsvp-msg").value = prev.message || ""; $("#rsvp-diet").value = prev.diet || "";
    const r = $(prev.attending ? "#rsvp-yes" : "#rsvp-no"); r.checked = true; r.dispatchEvent(new Event("change"));
  },
  validate() {
    const nameEl = $("#rsvp-name"), name = nameEl.value.trim().replace(/\s+/g, " ");
    const attend = (document.querySelector("input[name=attend]:checked") || {}).value;
    let ok = true, first = null;
    const fail = (id, msg, el) => { setErr(id, msg, el); ok = false; first = first || el || $("#rsvp-yes"); };
    if (name.length < 5 || name.split(" ").length < 2) fail("name", "Escribe tu nombre y apellido.", nameEl); else setErr("name", "", nameEl);
    if (!attend) fail("attend", "Cuéntanos si nos acompañas."); else setErr("attend", "");
    if (first) first.focus();
    // Los cupos los asigna el organizador; el invitado no elige acompañantes ni deja celular.
    return ok ? {
      name, attending: attend === "si", companions: 0, companionNames: "", phone: "",
      diet: attend === "si" ? $("#rsvp-diet").value.trim() : "", message: $("#rsvp-msg").value.trim(),
    } : null;
  },
  async submit() {
    const data = this.validate(); if (!data) return;
    if ($("#rsvp-web").value) return;                                           // trampa anti-spam (honeypot)
    const btn = $("#rsvpSubmit"); busy(btn, true, "Enviando…"); $("#rsvpMsg").textContent = "";
    const res = await api("/rsvp", { ...data, website: $("#rsvp-web").value, elapsedMs: Date.now() - this.shownAt });
    busy(btn, false, "Enviando…");

    if (res.ok) { store.set("kxv-rsvp", JSON.stringify(data)); return this.done(data, res.data.status === "updated" ? "updated" : "saved"); }
    if (res.status === 400 || res.status === 422) { $("#rsvpMsg").textContent = res.data.error || "Revisa los datos e inténtalo de nuevo."; return; }
    if (res.status === 429) { $("#rsvpMsg").textContent = "Recibimos muchos intentos seguidos. Espera un minuto y vuelve a intentarlo."; return; }
    // 503 (sin base de datos) o sin conexión → WhatsApp
    store.set("kxv-rsvp", JSON.stringify(data)); this.done(data, "whatsapp");
  },
  text(d) {
    const asistencia = d.attending ? "Sí, allí estaré" : "No podré asistir";
    const plantilla = CONFIG.rsvp.whatsappText;
    if (plantilla) {                                   // plantilla configurable
      return plantilla
        .replace("{nombre}", d.name)
        .replace("{asistencia}", asistencia)
        .replace("{mensaje}", d.message ? `\nMensaje: ${d.message}` : "")
        + (d.attending && d.diet ? `\nAlimentación: ${d.diet}` : "")
        + (d.attending ? "" : "\n(Lamento no poder acompañarlos)");
    }
    const when = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: CONFIG.event.timeZone }).format(new Date());
    return [`✨ Confirmación · XV de ${CONFIG.event.honoree}`, `Nombre: ${d.name}`,
      `Asistencia: ${d.attending ? "Sí, allí estaré ♡" : "Lo siento, no podré asistir"}`,
      d.diet ? `Alimentación: ${d.diet}` : null, d.message ? `Mensaje: ${d.message}` : null,
      `Registrado: ${when}`].filter(Boolean).join("\n");
  },
  done(d, mode) {
    SFX.play("confirmation");
    const first = d.name.split(" ")[0];
    $("#doneTitle").textContent = d.attending ? `¡Te espero, ${first}!` : `Gracias, ${first}`;
    const pre = $("#donePreview"), wa = $("#waBtn");
    if (mode === "whatsapp") {
      $("#doneText").textContent = "Último paso: envía tu confirmación por WhatsApp para que quede registrada.";
      const txt = this.text(d); pre.textContent = txt; pre.hidden = false; wa.href = waLink(txt); wa.hidden = false;
    } else {
      $("#doneText").textContent = mode === "updated"
        ? "Actualizamos tu respuesta. ¡Gracias por avisarnos!"
        : d.attending ? "Tu confirmación quedó guardada. Kishany está feliz de compartir esta noche contigo." : "Tu respuesta quedó guardada. Te vamos a extrañar; gracias por tu cariño.";
      pre.hidden = true; wa.hidden = true;
    }
    $("#doneCal").hidden = !d.attending;
    $("#rsvpForm").hidden = true; $("#rsvpDone").hidden = false;
    $("#rsvpDone").scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
  },
};

const Songs = {
  init() {
    this.shownAt = Date.now();
    $("#songForm").addEventListener("submit", e => { e.preventDefault(); this.submit(); });
    $("#song-title").addEventListener("input", e => setErr("song", "", e.target));
    $("#song-link").addEventListener("input", e => setErr("link", "", e.target));
    this.load();
  },
  async load() {
    const res = await api("/songs", null, { timeout: 7000 });
    if (res.ok && Array.isArray(res.data.songs)) this.render(res.data.songs);
  },
  render(list) {
    const ul = $("#songItems"); ul.replaceChildren();
    list.forEach(s => {
      const li = document.createElement("li"), sp = document.createElement("span"); sp.textContent = s.song; li.appendChild(sp);
      if (s.by) { const sm = document.createElement("small"); sm.textContent = s.by; li.appendChild(sm); }
      ul.appendChild(li);
    });
    $("#songList").hidden = list.length === 0;
  },
  validLink(v) {
    try { const u = new URL(v); return u.protocol === "https:" && /(^|\.)(spotify\.com|spotify\.link|youtube\.com|youtu\.be|music\.apple\.com|deezer\.com|soundcloud\.com)$/i.test(u.hostname); }
    catch (e) { return false; }
  },
  async submit() {
    const tEl = $("#song-title"), lEl = $("#song-link"), song = tEl.value.trim().replace(/\s+/g, " "), link = lEl.value.trim(), by = $("#song-name").value.trim();
    let ok = true;
    if (song.length < 2 && !link) { setErr("song", "Escribe el nombre de la canción o pega su enlace.", tEl); ok = false; }
    if (link && !this.validLink(link)) { setErr("link", "Pega un enlace de Spotify, YouTube, Apple Music, Deezer o SoundCloud.", lEl); ok = false; }
    if (!ok) return;
    if ($("#song-web").value) return;
    const btn = $("#songSubmit"); busy(btn, true, "Enviando…"); $("#songMsg").textContent = "";
    const res = await api("/songs", { song: song || "Canción por enlace", link, by, website: $("#song-web").value, elapsedMs: Date.now() - this.shownAt });
    busy(btn, false, "Enviando…");
    if (res.ok) {
      $("#songMsg").textContent = res.data.duplicate ? "¡Esa canción ya estaba en la lista! Gracias por votar por ella ♡" : "¡Gracias! Tu canción ya está en la lista ♡";
      tEl.value = ""; lEl.value = ""; if (Array.isArray(res.data.songs)) this.render(res.data.songs); return;
    }
    if (res.status === 400) { $("#songMsg").textContent = res.data.error || "Revisa los datos."; return; }
    if (res.status === 429) { $("#songMsg").textContent = "Espera un momento antes de sugerir otra canción."; return; }
    // Sin base de datos: enviar por WhatsApp
    const txt = `🎵 Canción para los XV de ${CONFIG.event.honoree}: ${song}${link ? "\n" + link : ""}${by ? "\nDe: " + by : ""}`;
    const msg = $("#songMsg"); msg.textContent = "No pudimos guardarla en este momento. ";
    const a = document.createElement("a"); a.href = waLink(txt); a.target = "_blank"; a.rel = "noopener"; a.textContent = "Envíala por WhatsApp"; a.style.color = "var(--rosa-hondo)";
    msg.appendChild(a);
  },
};
