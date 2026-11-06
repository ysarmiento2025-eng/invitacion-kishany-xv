/* main.js — arranque de la experiencia */
(async function boot() {
  SFX.init(); EventInfo.init(); Countdown.init(); Envelope.init(); RSVP.init(); Songs.init(); AudioManager.init();
  SFX.wireButtons();
  const sfxBtn = $("#sfxToggle");
  const paintSfx = () => {
    const on = SFX.on;
    sfxBtn.setAttribute("aria-pressed", on); sfxBtn.setAttribute("aria-label", on ? "Silenciar efectos de sonido" : "Activar efectos de sonido");
    sfxBtn.querySelector(".ic-on").hidden = !on; sfxBtn.querySelector(".ic-off").hidden = on;
  };
  sfxBtn.addEventListener("click", () => { SFX.setEnabled(!SFX.on); paintSfx(); });
  paintSfx();

  try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); } catch (e) {}

  let ok = false;
  try { ok = Scene3D.init(); } catch (e) { console.warn("WebGL no disponible, se usa la versión ligera", e); ok = false; }
  if (!ok) { $("#fallbackBg").hidden = false; $("#gl").hidden = true; }

  $("#content").addEventListener("scroll", e => {
    const c = e.target; Scene3D.scrollP = c.scrollTop / Math.max(1, c.scrollHeight - c.clientHeight);
  }, { passive: true });
  $("#enterBtn").addEventListener("click", () => Intro.open());

  const L = $("#loader"); L.style.opacity = 0; setTimeout(() => { L.hidden = true; }, 800);
  Intro.start();
})();
