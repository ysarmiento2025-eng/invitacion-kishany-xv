/* utils.js — utilidades compartidas */
const $ = (s, r = document) => r.querySelector(s);
const isMobile = matchMedia("(pointer:coarse)").matches || window.innerWidth < 640;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();

const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};

function toast(msg, ms = 3200) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("on"), ms);
}

// GSAP si está disponible; si no, un sustituto mínimo que aplica valores finales.
const G = window.gsap || {
  to(o, v) {
    const skip = ["duration", "ease", "delay", "onComplete", "onUpdate"];
    setTimeout(() => { for (const k in v) if (!skip.includes(k)) o[k] = v[k]; v.onUpdate && v.onUpdate(); v.onComplete && v.onComplete(); }, (v.delay || 0) * 1000);
    return { kill() {} };
  },
  set(o, v) { Object.assign(o, v); },
};

function cssTo(el, styles, dur = 1, delay = 0) {
  el.style.transition = `all ${dur}s cubic-bezier(.2,.7,.2,1) ${delay}s`;
  requestAnimationFrame(() => Object.assign(el.style, styles));
}

function normalizeName(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

// Llamada a las funciones de Vercel con tiempo límite.
async function api(path, body, { timeout = 9000 } = {}) {
  const ctrl = new AbortController(); const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(CONFIG.rsvp.apiBase + path, {
      method: body ? "POST" : "GET", headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined, signal: ctrl.signal,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: {} };
  } finally { clearTimeout(id); }
}

async function copyText(txt, fallbackEl) {
  try { await navigator.clipboard.writeText(txt); toast("Copiado ♡"); }
  catch (e) {
    if (fallbackEl) { const r = document.createRange(); r.selectNodeContents(fallbackEl); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    toast("Mantén presionado para copiar");
  }
}
