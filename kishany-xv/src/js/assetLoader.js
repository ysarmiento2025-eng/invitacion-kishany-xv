/* assetLoader.js — carga recursos según su extensión (GLB/GLTF, imágenes, video)
   y devuelve null si el archivo no existe, para que la escena use la versión generada. */
const AssetLoader = {
  ext(src) { return (src.split("?")[0].split(".").pop() || "").toLowerCase(); },
  kind(src) {
    const e = this.ext(src);
    if (["glb", "gltf"].includes(e)) return "3d";
    if (["png", "webp", "jpg", "jpeg", "svg", "avif"].includes(e)) return "image";
    if (["mp4", "webm", "mov"].includes(e)) return "video";
    return "unknown";
  },
  texture(src) {
    return new Promise(res => {
      if (!src) return res(null);
      new THREE.TextureLoader().load(src, t => { t.encoding = THREE.sRGBEncoding; res(t); }, undefined,
        () => { console.warn("[assets] no se encontró", src, "→ se usa la versión generada"); res(null); });
    });
  },
  async gltf(src) {
    if (!src) return null;
    try {
      if (!THREE.GLTFLoader) await new Promise((ok, ko) => {   // se carga solo si se usa un modelo GLB
        const s = document.createElement("script");
        s.src = "assets/vendor/GLTFLoader.js";
        s.onload = ok; s.onerror = ko; document.head.appendChild(s);
      });
      return await new Promise(res => new THREE.GLTFLoader().load(src, g => res(g.scene), undefined, () => { console.warn("[assets] modelo no disponible", src); res(null); }));
    } catch (e) { return null; }
  },
  video(src) {
    return new Promise(res => {
      if (!src) return res(null);
      const v = document.createElement("video"); v.src = src; v.muted = true; v.loop = true; v.playsInline = true;
      v.oncanplay = () => { v.play().catch(() => {}); res(new THREE.VideoTexture(v)); };
      v.onerror = () => res(null);
    });
  },
  // Carga genérica según "type" o extensión
  async load(cfg) {
    if (!cfg || !cfg.src) return null;
    const kind = cfg.type && cfg.type !== "procedural" ? cfg.type : this.kind(cfg.src);
    if (kind === "image") return { kind, value: await this.texture(cfg.src) };
    if (kind === "3d") return { kind, value: await this.gltf(cfg.src) };
    if (kind === "video") return { kind, value: await this.video(cfg.src) };
    return null;
  },
};
