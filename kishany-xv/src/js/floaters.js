/* =========================================================
   floaters.js — Capa de elementos flotantes al frente (profundidad)
   - Tres planos: lejos, medio y cerca (los cercanos, grandes y desenfocados).
   - pointer-events:none → jamás bloquea un toque.
   - Parallax por velocidad de scroll (sensación de viento).
   - Se atenúa al escribir en formularios, se pausa con la pestaña oculta
     y respeta "reducir movimiento".
   ========================================================= */
(function () {
  const C = (window.CONFIG && CONFIG.floaters) || { enabled: true, mobileScale: .7, blooms: true, butterflies: true, dimWhileTyping: true, maxOpacity: 1, layers: { far: { sparkle: 6, petal: 2 }, mid: { petal: 4, heart: 2, sparkle: 2, butterfly: 1 }, near: { petal: 2, heart: 1, butterfly: 1 } } };
  if (!C.enabled) return;
  const device = document.getElementById("device"), content = document.getElementById("content");
  if (!device || !content) return;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pal = (window.CONFIG && CONFIG.branding && CONFIG.branding.palette) || {};
  const K = { rosa: pal.rosaEmpolvado || "#D9AEB7", champ: pal.rosaChampagne || "#E9C9C9", claro: pal.rosaClaro || "#F5E6E8", antiguo: pal.rosaAntiguo || "#B98289", oro: pal.doradoChampagne || "#C6A46B", oroC: pal.doradoClaro || "#E8D3A2", verde: pal.verdeBotanico || "#617B61" };
  const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];

  // ---- estilos (inyectados, para no tocar global.css) ----
  const css = `
#fore{position:absolute;inset:0;z-index:12;pointer-events:none;overflow:hidden;opacity:0;transition:opacity 2.4s ease}
#fore.on{opacity:1}#fore.dim{opacity:.16;transition-duration:.5s}
#fore.paused *{animation-play-state:paused!important}
#fore .lyr{position:absolute;inset:0;transform:translate3d(0,var(--sh,0px),0);will-change:transform}
#fore .fl{position:absolute;left:var(--x);top:0;width:var(--s);opacity:var(--o);filter:blur(var(--b,0px))}
#fore .fi{width:100%;will-change:transform}
#fore .fi svg{display:block;width:100%;height:auto;overflow:visible}
#fore .k-petal .fi,#fore .k-heart .fi{animation:flFall var(--d) linear var(--dl) infinite}
#fore .k-petal svg{animation:flSway var(--sw) ease-in-out infinite alternate}
#fore .k-heart svg{animation:flBeat 2.6s ease-in-out infinite alternate}
#fore .k-sparkle .fi{animation:flRise var(--d) ease-in-out var(--dl) infinite}
#fore .k-sparkle svg{animation:flTwinkle var(--sw) ease-in-out infinite alternate;filter:drop-shadow(0 0 4px ${K.oroC})}
#fore .k-butterfly .fi{animation:flWander var(--d) ease-in-out var(--dl) infinite}
#fore .k-butterfly .wings{transform-origin:32px 24px;animation:flFlap .24s ease-in-out infinite alternate}
#fore .bloom{position:absolute;pointer-events:none;filter:blur(1.4px);opacity:.55;-webkit-mask-image:radial-gradient(closest-side,#000 62%,transparent 100%);mask-image:radial-gradient(closest-side,#000 62%,transparent 100%)}
#fore .bloom svg{display:block;width:100%;height:auto;animation:flBloom 9s ease-in-out infinite alternate;transform-origin:50% 50%}
#fore .b1{left:-62px;top:-58px;width:190px}
#fore .b2{right:-66px;bottom:-62px;width:220px}
#fore .b2 svg{animation-delay:-4s}
@keyframes flFall{from{transform:translate3d(0,calc(var(--H,800px)*-.12),0) rotate(0)}to{transform:translate3d(var(--dx),calc(var(--H,800px)*1.12),0) rotate(var(--rot))}}
@keyframes flRise{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(var(--dx),-26px,0)}100%{transform:translate3d(0,0,0)}}
@keyframes flSway{from{transform:rotate(-18deg) translateX(-9px)}to{transform:rotate(22deg) translateX(9px)}}
@keyframes flBeat{from{transform:scale(.88)}to{transform:scale(1.08)}}
@keyframes flTwinkle{0%{opacity:.15;transform:scale(.5) rotate(0)}60%{opacity:1}100%{opacity:.35;transform:scale(1.15) rotate(45deg)}}
@keyframes flWander{0%{transform:translate3d(calc(var(--W,400px)*-.3),var(--y0),0) rotate(8deg)}25%{transform:translate3d(calc(var(--W,400px)*.25),calc(var(--y0) - 70px),0) rotate(-6deg)}50%{transform:translate3d(calc(var(--W,400px)*.55),calc(var(--y0) + 40px),0) rotate(10deg)}75%{transform:translate3d(calc(var(--W,400px)*.85),calc(var(--y0) - 40px),0) rotate(-8deg)}100%{transform:translate3d(calc(var(--W,400px)*1.25),var(--y0),0) rotate(6deg)}}
@keyframes flFlap{from{transform:scaleX(1)}to{transform:scaleX(.3)}}
@keyframes flBloom{from{transform:rotate(-4deg) scale(1)}to{transform:rotate(5deg) scale(1.05)}}
@media (prefers-reduced-motion:reduce){#fore .fl{display:none}#fore .bloom svg{animation:none}}
`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // ---- dibujos SVG ----
  const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="fgP1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE9EC"/><stop offset="1" stop-color="${K.rosa}"/></linearGradient>
<linearGradient id="fgP2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF5F3"/><stop offset="1" stop-color="${K.champ}"/></linearGradient>
<linearGradient id="fgP3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6D7DD"/><stop offset="1" stop-color="${K.antiguo}"/></linearGradient>
<linearGradient id="fgW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FCE8EC"/><stop offset=".6" stop-color="${K.rosa}"/><stop offset="1" stop-color="${K.oroC}"/></linearGradient>
<radialGradient id="fgC"><stop offset="0" stop-color="#FFF3D6"/><stop offset="1" stop-color="${K.oro}"/></radialGradient>
</defs></svg>`;
  const S = {
    petal: () => `<svg viewBox="0 0 40 52"><path d="M20 2C33 14 39 31 20 50C1 31 7 14 20 2Z" fill="url(#fgP${1 + Math.floor(Math.random() * 3)})"/><path d="M20 9C20 22 20 36 20 46" stroke="#fff" stroke-opacity=".45" stroke-width=".9" fill="none"/></svg>`,
    heart: () => `<svg viewBox="0 0 32 32"><path d="M16 28S3 20 3 11a7 7 0 0113-3 7 7 0 0113 3c0 9-13 17-13 17z" fill="${pick([K.oro, K.oroC, K.rosa])}" fill-opacity=".9"/></svg>`,
    sparkle: () => `<svg viewBox="0 0 20 20"><path d="M10 0C11 6 14 9 20 10C14 11 11 14 10 20C9 14 6 11 0 10C6 9 9 6 10 0Z" fill="${pick([K.oroC, "#FFF3D6", K.oro])}"/></svg>`,
    butterfly: () => { const wl = `<path d="M32 22C22 3 5 1 3 14C2 25 18 29 32 24Z" fill="url(#fgW)" stroke="${K.oro}" stroke-width=".7"/><path d="M32 25C20 28 9 36 15 44C22 49 30 38 32 29Z" fill="url(#fgW)" fill-opacity=".9" stroke="${K.oro}" stroke-width=".7"/><circle cx="14" cy="14" r="2.4" fill="#fff" fill-opacity=".6"/><circle cx="18" cy="38" r="1.8" fill="#fff" fill-opacity=".55"/>`;
      return `<svg viewBox="0 0 64 48"><g class="wings"><g>${wl}</g><g transform="translate(64 0) scale(-1 1)">${wl}</g></g><path d="M32 17V33" stroke="#7a5560" stroke-width="2" stroke-linecap="round"/><path d="M32 17Q28 8 24 6M32 17Q36 8 40 6" stroke="#7a5560" stroke-width=".8" fill="none"/></svg>`; },
    bloom: () => { let p = ""; for (let i = 0; i < 8; i++) p += `<ellipse cx="50" cy="27" rx="12" ry="23" fill="url(#fgP${1 + (i % 3)})" transform="rotate(${i * 45} 50 50)"/>`; let q = ""; for (let i = 0; i < 8; i++) q += `<ellipse cx="50" cy="35" rx="7.5" ry="14" fill="#FFF3F3" fill-opacity=".7" transform="rotate(${i * 45 + 22} 50 50)"/>`;
      return `<svg viewBox="0 0 100 100"><ellipse cx="14" cy="80" rx="22" ry="7" fill="${K.verde}" fill-opacity=".55" transform="rotate(-28 14 80)"/><ellipse cx="86" cy="22" rx="22" ry="7" fill="${K.verde}" fill-opacity=".5" transform="rotate(-28 86 22)"/>${p}${q}<circle cx="50" cy="50" r="5.5" fill="url(#fgC)" fill-opacity=".85"/></svg>`; },
  };

  // ---- construcción ----
  const layer = document.createElement("div"); layer.id = "fore"; layer.setAttribute("aria-hidden", "true"); layer.innerHTML = defs;
  const LY = {
    far:  { f: .35, size: [9, 15],  op: [.5, .8],  blur: 0, fall: [24, 38] },
    mid:  { f: .8,  size: [16, 28], op: [.55, .8], blur: 0, fall: [17, 28] },
    near: { f: 2,   size: [38, 66], op: [.26, .4], blur: 2.6, fall: [12, 19] },
  };
  const lys = {};
  const small = device.clientWidth < 560, scale = small ? (C.mobileScale || .7) : 1, oMul = C.maxOpacity == null ? 1 : C.maxOpacity;
  Object.keys(LY).forEach(name => {
    const L = LY[name], el = document.createElement("div"); el.className = "lyr"; lys[name] = el; layer.appendChild(el);
    const spec = (C.layers && C.layers[name]) || {};
    Object.keys(spec).forEach(kind => {
      if (kind === "butterfly" && C.butterflies === false) return;
      const n = Math.max(0, Math.round(spec[kind] * scale));
      for (let i = 0; i < n; i++) {
        const w = document.createElement("div"); w.className = "fl k-" + kind;
        let s = rnd(L.size[0], L.size[1]); if (kind === "butterfly") s *= name === "near" ? 1.7 : 2.1; if (kind === "sparkle") s *= .8;
        const d = kind === "butterfly" ? rnd(24, 40) : kind === "sparkle" ? rnd(5, 9) : rnd(L.fall[0], L.fall[1]);
        w.style.cssText = `--x:${rnd(2, 92).toFixed(1)}%;--s:${s.toFixed(0)}px;--o:${(rnd(L.op[0], L.op[1]) * oMul).toFixed(2)};--b:${L.blur}px;--d:${d.toFixed(1)}s;--dl:-${rnd(0, d).toFixed(1)}s;--dx:${rnd(-70, 70).toFixed(0)}px;--rot:${rnd(-260, 260).toFixed(0)}deg;--sw:${rnd(2.2, 5).toFixed(1)}s;--y0:${rnd(60, 520).toFixed(0)}px`;
        if (kind === "sparkle") w.style.top = rnd(4, 94).toFixed(0) + "%";
        if (kind === "butterfly") w.style.left = "0";
        w.innerHTML = `<div class="fi">${S[kind]()}</div>`; el.appendChild(w);
      }
    });
  });
  if (C.blooms !== false) {
    ["b1", "b2"].forEach(c => { const b = document.createElement("div"); b.className = "bloom " + c; b.innerHTML = S.bloom(); layer.appendChild(b); });
  }
  device.appendChild(layer);

  const size = () => { layer.style.setProperty("--H", device.clientHeight + "px"); layer.style.setProperty("--W", device.clientWidth + "px"); };
  size(); window.addEventListener("resize", size);

  // ---- aparece cuando la invitación ya está abierta ----
  const reveal = () => { if (content.classList.contains("on")) layer.classList.add("on"); };
  reveal(); new MutationObserver(reveal).observe(content, { attributes: true, attributeFilter: ["class"] });

  // ---- parallax por velocidad de scroll (viento) ----
  if (!reduce) {
    let last = content.scrollTop, shift = 0, run = false;
    const loop = () => {
      shift *= .92; if (Math.abs(shift) < .15) { shift = 0; run = false; }
      Object.keys(lys).forEach(n => lys[n].style.setProperty("--sh", (shift * LY[n].f).toFixed(1) + "px"));
      if (run) requestAnimationFrame(loop);
    };
    content.addEventListener("scroll", () => {
      const v = content.scrollTop - last; last = content.scrollTop;
      shift = Math.max(-34, Math.min(34, shift - v * .6));
      if (!run) { run = true; requestAnimationFrame(loop); }
    }, { passive: true });
  }

  // ---- no estorbar: atenuar al escribir, pausar si la pestaña está oculta ----
  if (C.dimWhileTyping !== false) {
    content.addEventListener("focusin", e => { if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) layer.classList.add("dim"); });
    content.addEventListener("focusout", () => layer.classList.remove("dim"));
  }
  document.addEventListener("visibilitychange", () => layer.classList.toggle("paused", document.hidden));
})();
