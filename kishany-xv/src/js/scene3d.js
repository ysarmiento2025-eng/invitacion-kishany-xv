/* scene3d.js — escena Three.js: puerta, jardín-bosque, mariposas, partículas y cámara */
const Scene3D = {
  ok: false, running: true, t: 0, scrollP: 0, scrollS: 0, pointer: { x: 0, y: 0 }, phase: "intro",
  rays: [], petals: [], hearts: [], flies: [],

  init() {
    const canvas = $("#gl");
    try {
      if (!window.THREE) throw 0;
      const test = document.createElement("canvas");
      if (!(test.getContext("webgl2") || test.getContext("webgl"))) throw 0;
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: "high-performance" });
    } catch (e) { return false; }
    const r = this.renderer;
    r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = .92;
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));

    const scene = this.scene = new THREE.Scene();
    this.bg = new THREE.Color(0xf6e3e6);
    scene.background = this.bg; scene.fog = new THREE.FogExp2(0xf2d8dc, .042);
    this.camera = new THREE.PerspectiveCamera(52, 1, .05, 120);
    this.look = new THREE.Vector3(0, 1.7, 0);
    this.rig = { x: 0, y: 1.55, z: 10, lx: 0, ly: 1.7, lz: 0, fov: 52 };
    this.camera.position.set(0, 1.55, 10);

    this.buildLights(); this.buildDoor(); this.buildForest(); this.buildParticles(); this.buildButterflies();
    this.resize(); new ResizeObserver(() => this.resize()).observe($("#device"));
    document.addEventListener("visibilitychange", () => { this.running = !document.hidden; if (this.running) { this.clock.getDelta(); this.loop(); } });
    $("#device").addEventListener("pointermove", e => {
      const b = e.currentTarget.getBoundingClientRect();
      this.pointer.x = ((e.clientX - b.left) / b.width - .5) * 2; this.pointer.y = ((e.clientY - b.top) / b.height - .5) * 2;
    });
    this.clock = new THREE.Clock(); this.fpsT = 0; this.fpsN = 0; this.lowMode = false;
    this.ok = true; this.loop(); return true;
  },

  resize() {
    const d = $("#device"), w = d.clientWidth, h = d.clientHeight;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h;
    this.baseFov = w / h < .7 ? 58 : 50; this.camera.updateProjectionMatrix();
  },

  buildLights() {
    const s = this.scene;
    s.add(new THREE.HemisphereLight(0xfff6f0, 0xc9a9ae, .5));
    s.add(new THREE.AmbientLight(0xfff1ec, .12));
    const sun = new THREE.DirectionalLight(0xfff0dc, .5); sun.position.set(4, 9, 6); s.add(sun);
    const rim = new THREE.DirectionalLight(0xe9c9c9, .22); rim.position.set(-6, 4, -8); s.add(rim);   // contraluz rosado
    this.front = new THREE.PointLight(0xffe2c8, 0, 12, 1.8); this.front.position.set(0, 3.2, 3); s.add(this.front);
    this.portal = new THREE.PointLight(0xfff0dc, 0, 20, 1.6); this.portal.position.set(0, 2, -2.5); s.add(this.portal);
    [[-3, 2.5, -14, 0xf0b6c2], [3, 2.5, -24, 0xf0d6a8], [-2.5, 2.5, -34, 0xf0b6c2], [2.5, 3, -44, 0xf0d6a8]]
      .forEach(([x, y, z, c]) => { const l = new THREE.PointLight(c, .55, 14, 1.8); l.position.set(x, y, z); s.add(l); });
  },

  buildDoor() {
    const s = this.scene, D = this.door = new THREE.Group(); s.add(D);
    const A = CONFIG.assets.intro;
    const gold = new THREE.MeshStandardMaterial({ color: 0xd2ae6e, metalness: .75, roughness: .3, emissive: 0x2a1c08 });

    // Hojas con pivotes independientes (bisagras en los extremos)
    const shapeL = new THREE.Shape(); shapeL.moveTo(0, 0); shapeL.lineTo(1.2, 0); shapeL.lineTo(1.2, 3.8); shapeL.absarc(1.2, 2.6, 1.2, Math.PI / 2, Math.PI, false); shapeL.lineTo(0, 0);
    const shapeR = new THREE.Shape(); shapeR.moveTo(0, 0); shapeR.lineTo(0, 2.6); shapeR.absarc(-1.2, 2.6, 1.2, 0, Math.PI / 2, false); shapeR.lineTo(-1.2, 0); shapeR.lineTo(0, 0);
    const ext = { depth: .09, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 2, curveSegments: 32 };
    const mk = (shape, mirror, customSrc) => {
      const tex = Tex.doorLeaf(mirror); tex.repeat.set(1 / 1.2, 1 / 3.8); if (mirror) tex.offset.set(1, 0);
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: .5, metalness: .1 });
      if (customSrc) AssetLoader.texture(customSrc).then(t => { if (t) { t.repeat.copy(tex.repeat); t.offset.copy(tex.offset); mat.map = t; mat.needsUpdate = true; } });
      return new THREE.Mesh(new THREE.ExtrudeGeometry(shape, ext), [mat, new THREE.MeshStandardMaterial({ color: 0xd9aeb7, roughness: .6 })]);
    };
    this.pivL = new THREE.Group(); this.pivL.position.set(-1.2, 0, 0); this.pivL.add(mk(shapeL, false, A.door.textureLeft)); D.add(this.pivL);
    this.pivR = new THREE.Group(); this.pivR.position.set(1.2, 0, 0); this.pivR.add(mk(shapeR, true, A.door.textureRight)); D.add(this.pivR);

    // Puerta GLB opcional: nodos "LeafLeft" y "LeafRight" se abren igual que las hojas generadas
    if (A.door.src) AssetLoader.load(A.door).then(res => {
      if (!res || res.kind !== "3d" || !res.value) return;
      const m = res.value, l = m.getObjectByName("LeafLeft"), rr = m.getObjectByName("LeafRight");
      if (l && rr) { this.pivL.visible = this.pivR.visible = false; D.add(m); this.pivL = l; this.pivR = rr; }
    });

    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.32, .1, 16, 64, Math.PI), gold); arch.position.set(0, 2.6, .05); D.add(arch);
    [-1.32, 1.32].forEach(x => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(.1, .12, 2.6, 16), gold); p.position.set(x, 1.3, .05); D.add(p);
      [.6, 1.5, 2.2].forEach(y => { const h = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .2, 10), gold); h.position.set(x * .93, y, .1); D.add(h); });
    });

    // Muro de flores con hueco en arco
    const wallTex = Tex.flowerWall(); wallTex.repeat.set(.4, .4);
    const wm = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 1 });
    if (A.wall.src) AssetLoader.texture(A.wall.src).then(t => { if (t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(.4, .4); wm.map = t; wm.needsUpdate = true; } });
    const hw = 1.4;
    const left = new THREE.Shape(); left.moveTo(-22, -1); left.lineTo(-hw, -1); left.lineTo(-hw, 14); left.lineTo(-22, 14);
    const right = new THREE.Shape(); right.moveTo(hw, -1); right.lineTo(22, -1); right.lineTo(22, 14); right.lineTo(hw, 14);
    const top = new THREE.Shape(); top.moveTo(-hw, 2.6); top.lineTo(-hw, 14); top.lineTo(hw, 14); top.lineTo(hw, 2.6); top.absarc(0, 2.6, hw, 0, Math.PI, false);
    [left, right, top].forEach(sh => { const m = new THREE.Mesh(new THREE.ShapeGeometry(sh, 32), wm); m.position.z = -.03; D.add(m); });

    // Escudo KF
    const crestMat = new THREE.MeshBasicMaterial({ map: Tex.crest(), transparent: true, opacity: CONFIG.branding.placement.puerta.opacity ?? .95 });
    if (A.crest.src) AssetLoader.texture(A.crest.src).then(t => { if (t) { crestMat.map = t; crestMat.needsUpdate = true; } });
    const crest = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 1.75), crestMat); crest.position.set(0, 4.75, .1); D.add(crest);
    // placa ornamental detrás del sello, para que se despegue del muro
    const plaque = new THREE.Mesh(new THREE.CircleGeometry(1.02, 48), new THREE.MeshBasicMaterial({ color: 0xfff4ef, transparent: true, opacity: .55 }));
    plaque.position.set(0, 4.75, .06); D.add(plaque);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.04, .035, 10, 64), gold); ring.position.set(0, 4.75, .07); D.add(ring);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.18, .016, 8, 64), gold); ring2.position.set(0, 4.75, .07); D.add(ring2);
    this.crestRing = ring2;

    // Arbustos y flores al pie de la puerta
    const bush = new THREE.MeshStandardMaterial({ color: 0xa9bfa2, roughness: .95, flatShading: true });
    const pink = new THREE.MeshStandardMaterial({ color: 0xf0b9c4, roughness: .7, flatShading: true });
    const ivory = new THREE.MeshStandardMaterial({ color: 0xfff6f2, roughness: .7, flatShading: true });
    [-1, 1].forEach(sd => {
      for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.35 + Math.random() * .35, 1), bush); b.position.set(sd * (1.7 + i * .45 + Math.random() * .3), .2 + Math.random() * .3, .3 + Math.random() * .6); D.add(b); }
      for (let i = 0; i < 30; i++) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.07 + Math.random() * .07, 0), Math.random() > .35 ? pink : ivory); const a = Math.random(); f.position.set(sd * (1.55 + Math.random() * 2.6), .3 + Math.random() * (a > .7 ? 2.8 : .7), .5 + Math.random() * .7); D.add(f); }
    });

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 140), new THREE.MeshStandardMaterial({ color: 0xefd6da, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.z = -50; s.add(ground);
    const path = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 70), new THREE.MeshBasicMaterial({ color: 0xfff8f0, transparent: true, opacity: .55, depthWrite: false }));
    path.rotation.x = -Math.PI / 2; path.position.set(0, .01, -36); s.add(path);

    this.portalGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: Tex.glow("rgba(255,255,250,1)", "rgba(255,240,228,.6)"), transparent: true, opacity: 0, depthWrite: false }));
    this.portalGlow.scale.set(7, 7, 1); this.portalGlow.position.set(0, 2, -1.6); s.add(this.portalGlow);
    this.doorGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: Tex.glow("rgba(255,244,228,.7)", "rgba(255,226,200,.2)"), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.doorGlow.scale.set(9, 9, 1); this.doorGlow.position.set(0, 2.2, .4); s.add(this.doorGlow);
  },

  buildForest() {
    const s = this.scene, F = CONFIG.assets.forest, n = isMobile ? F.trees.mobile : F.trees.desktop, dummy = new THREE.Object3D();
    const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.1, .2, 1, 6), new THREE.MeshStandardMaterial({ color: 0x9a7f72, roughness: 1, flatShading: true }), n);
    const tones = [0xdb93a4, 0xc87d91, 0xeaaeba, 0x8fab8a, 0x74906f];          // cerezos rosas y follaje salvia
    const canopies = tones.map(c => new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true }), n * 2));
    const blossom = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xfff2f4, roughness: .8, flatShading: true }), n * 3);
    const cc = tones.map(() => 0); let bc = 0;
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1, z = -2.5 - Math.random() * 70, x = side * (3.4 + Math.pow(Math.random(), 1.4) * 12), h = 3 + Math.random() * 5;
      dummy.position.set(x, h / 2, z); dummy.rotation.set(0, Math.random() * 6, (Math.random() - .5) * .1); dummy.scale.set(1 + Math.random() * .6, h, 1 + Math.random() * .6); dummy.updateMatrix(); trunk.setMatrixAt(i, dummy.matrix);
      for (let k = 0; k < 2; k++) {
        const gi = Math.random() < .65 ? (Math.random() * 3) | 0 : 3 + ((Math.random() * 2) | 0), rr = 1 + Math.random() * 1.4;
        dummy.position.set(x + (Math.random() - .5) * 1.2, h + k * .9 - .3, z + (Math.random() - .5) * 1.2); dummy.scale.set(rr, rr * (.8 + Math.random() * .5), rr); dummy.rotation.set(Math.random(), Math.random(), 0); dummy.updateMatrix(); canopies[gi].setMatrixAt(cc[gi]++, dummy.matrix);
      }
      if (Math.random() < .5) for (let k = 0; k < 3; k++) { const rr = .2 + Math.random() * .3; dummy.position.set(x + (Math.random() - .5) * 2, h + (Math.random() - .3) * 1.4, z + (Math.random() - .5) * 2 + .6); dummy.scale.set(rr, rr, rr); dummy.updateMatrix(); blossom.setMatrixAt(bc++, dummy.matrix); }
    }
    canopies.forEach((m, i) => { m.count = cc[i]; s.add(m); }); blossom.count = bc; s.add(trunk, blossom);

    const fn = isMobile ? F.flowers.mobile : F.flowers.desktop;
    const fl = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.06, 0), new THREE.MeshStandardMaterial({ color: 0xe7a3b1, roughness: .6 }), fn);
    for (let i = 0; i < fn; i++) { const sd = Math.random() > .5 ? 1 : -1; dummy.position.set(sd * (.9 + Math.random() * 4), .06 + Math.random() * .15, -1 - Math.random() * 64); const rr = .6 + Math.random() * 1.2; dummy.scale.set(rr, rr, rr); dummy.updateMatrix(); fl.setMatrixAt(i, dummy.matrix); }
    s.add(fl);

    if (CONFIG.assets.lightRays.enabled) {
      const rt = Tex.ray();
      for (let i = 0; i < CONFIG.assets.lightRays.count; i++) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1 + Math.random() * 1.6, 16), new THREE.MeshBasicMaterial({ map: rt, transparent: true, opacity: .22, depthWrite: false, color: 0xfffaf0, side: THREE.DoubleSide, fog: false }));
        m.position.set((Math.random() - .5) * 10, 6, -6 - i * 6 - Math.random() * 3); m.rotation.z = .32 + (Math.random() - .5) * .15; m.userData.ph = Math.random() * 6; s.add(m); this.rays.push(m);
      }
    }
    if (CONFIG.assets.petals.enabled) {
      const pt = Tex.petal(), pn = isMobile ? CONFIG.assets.petals.countMobile : CONFIG.assets.petals.countDesktop;
      for (let i = 0; i < pn; i++) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(.07, .1), new THREE.MeshBasicMaterial({ map: pt, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
        m.position.set((Math.random() - .5) * 8, Math.random() * 5, 4 - Math.random() * 60); m.userData = { sp: .15 + Math.random() * .3, ph: Math.random() * 6, rs: Math.random() * 2 }; s.add(m); this.petals.push(m);
      }
    }
    // Bokeh: círculos de luz desenfocados que dan profundidad al fondo
    this.bokeh = [];
    const bt = Tex.glow("rgba(255,255,255,.95)", "rgba(255,236,224,.5)");
    for (let i = 0; i < (isMobile ? 16 : 30); i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bt, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      const sc = .5 + Math.random() * 1.6; sp.scale.set(sc, sc, 1);
      sp.position.set((Math.random() - .5) * 16, .8 + Math.random() * 6, 2 - Math.random() * 60);
      sp.userData = { ph: Math.random() * 6.3, op: .1 + Math.random() * .22 }; s.add(sp); this.bokeh.push(sp);
    }
    if (CONFIG.assets.hearts.enabled) {
      const ht = Tex.heart(), hn = isMobile ? CONFIG.assets.hearts.countMobile : CONFIG.assets.hearts.countDesktop;
      for (let i = 0; i < hn; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ht, transparent: true, opacity: 0, depthWrite: false }));
        const sc = .12 + Math.random() * .14; sp.scale.set(sc, sc, 1);
        sp.position.set((Math.random() - .5) * 7, .3 + Math.random() * 4, 6 - Math.random() * 64);
        sp.userData = { ph: Math.random() * 6, sp: .1 + Math.random() * .15, base: sp.position.clone(), op: .6 + Math.random() * .4 }; s.add(sp); this.hearts.push(sp);
      }
    }
  },

  buildParticles() {
    const P = CONFIG.assets.particles; if (!P.enabled) return;
    const n = isMobile ? P.countMobile : P.countDesktop, pos = new Float32Array(n * 3);
    this.pBase = new Float32Array(n * 3); this.pPh = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = this.pBase[i * 3] = (Math.random() - .5) * 14; pos[i * 3 + 1] = this.pBase[i * 3 + 1] = Math.random() * 6; pos[i * 3 + 2] = this.pBase[i * 3 + 2] = 9 - Math.random() * 70; this.pPh[i] = Math.random() * 6.28;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.pMat = new THREE.PointsMaterial({ size: P.size, map: Tex.sparkle(), color: new THREE.Color(0xffffff), transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true });
    this.points = new THREE.Points(g, this.pMat); this.scene.add(this.points);
  },

  makeButterfly(cfg) {
    const grp = new THREE.Group(), inner = new THREE.Group(); grp.add(inner); inner.rotation.x = -.35;
    const geo = new THREE.PlaneGeometry(1, 1); geo.translate(.5, 0, 0); geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ map: Tex.wing(cfg.tint), transparent: true, opacity: cfg.opacity ?? .95, side: THREE.DoubleSide, depthWrite: false });
    const wr = new THREE.Mesh(geo, mat), wl = new THREE.Mesh(geo, mat); wl.scale.x = -1;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.03, .02, .55, 6), new THREE.MeshBasicMaterial({ color: 0x8a5a66 })); body.rotation.x = Math.PI / 2;
    inner.add(wr, wl, body); grp.scale.setScalar(cfg.scale);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: Tex.glow("rgba(255,250,240,.75)", "rgba(255,226,200,.18)"), transparent: true, opacity: .5, depthWrite: false })); glow.scale.set(2.2, 2.2, 1); grp.add(glow);
    grp.userData = { cfg, wr, wl, ph: Math.random() * 10, a: .6 + Math.random() * .5, b: .4 + Math.random() * .4, c: .5 + Math.random() * .3, ox: (Math.random() - .5) * 2.6, oy: (Math.random() - .5) * 1.2, flap: 9 + Math.random() * 4 };
    if (cfg.src) AssetLoader.load(cfg).then(res => {
      if (!res || !res.value) return;
      if (res.kind === "3d") { inner.visible = false; grp.add(res.value); }
      else { mat.map = res.value; mat.needsUpdate = true; }
    });
    return grp;
  },

  buildButterflies() {
    this.flies = CONFIG.assets.floating
      .filter(f => f.kind === "butterfly" && f.enabled && (!isMobile || f.mobileEnabled))
      .map(c => { const b = this.makeButterfly(c); this.scene.add(b); return b; });
    this.hero = this.makeButterfly({ tint: "#FFFFFF", scale: .5, opacity: .95 }); this.hero.visible = false; this.scene.add(this.hero);
  },

  loop() {
    if (!this.running) return; requestAnimationFrame(() => this.loop());
    const dt = Math.min(this.clock.getDelta(), .05); this.t += dt; const t = this.t;
    this.fpsT += dt; this.fpsN++;
    if (this.fpsT > 2.5) { // reduce calidad en dispositivos lentos
      if (this.fpsN / this.fpsT < 38 && !this.lowMode) { this.lowMode = true; this.renderer.setPixelRatio(1); this.rays.forEach(r => r.visible = false); this.petals.forEach((p, i) => { if (i % 2) p.visible = false; }); }
      this.fpsT = 0; this.fpsN = 0;
    }
    const cam = this.camera, R = this.rig;
    let z = R.z, y = R.y, lz = R.lz, ly = R.ly;
    if (this.phase === "forest") {
      this.scrollS += (this.scrollP - this.scrollS) * .06; const p = this.scrollS, T = CONFIG.animation.forestTravel;
      z -= p * T; lz -= p * T; const end = Math.max(0, (p - .9) / .1); y += end * 1.8; ly += end * 3.5; z += end * 3; // al final la cámara se aleja y mira hacia arriba
    }
    const par = reduceMotion ? 0 : CONFIG.animation.parallax * (isMobile ? .5 : 1);
    cam.position.set(R.x + this.pointer.x * par, y - this.pointer.y * par * .4 + Math.sin(t * .5) * .03, z);
    this.look.set(R.lx + this.pointer.x * par * .3, ly, lz); cam.lookAt(this.look);
    if (Math.abs(cam.fov - R.fov) > .01) { cam.fov = R.fov; cam.updateProjectionMatrix(); }

    if (this.points) {
      const a = this.points.geometry.attributes.position.array;
      for (let i = 0; i < this.pPh.length; i++) { const ph = this.pPh[i]; a[i * 3] = this.pBase[i * 3] + Math.sin(t * .3 + ph) * .3; a[i * 3 + 1] = this.pBase[i * 3 + 1] + Math.sin(t * .5 + ph * 2) * .25; }
      this.points.geometry.attributes.position.needsUpdate = true;
    }
    this.petals.forEach(m => { const u = m.userData; m.position.y -= u.sp * dt; m.position.x += Math.sin(t + u.ph) * dt * .2; m.rotation.x += dt * u.rs; m.rotation.y += dt * .7; if (m.position.y < 0) m.position.y = 5; });
    this.hearts.forEach(h => { const u = h.userData; h.position.y = u.base.y + Math.sin(t * u.sp * 4 + u.ph) * .25; h.position.x = u.base.x + Math.sin(t * .3 + u.ph) * .2; h.material.opacity = u.op * this.heartsOn * (.7 + .3 * Math.sin(t * 2 + u.ph)); });
    this.rays.forEach(r => r.material.opacity = .14 + Math.sin(t * .4 + r.userData.ph) * .08);
    this.bokeh.forEach(b => { const u = b.userData; b.material.opacity = u.op * this.heartsOn * (.55 + .45 * Math.sin(t * .6 + u.ph)); b.position.y += Math.sin(t * .4 + u.ph) * dt * .25; });
    if (this.crestRing) this.crestRing.rotation.z = t * .12;

    const L = CONFIG.animation.layers, tmp = this._v || (this._v = new THREE.Vector3());
    this.flies.forEach(b => {
      const u = b.userData, c = u.cfg, d = L[c.layer] || 5, tt = t * c.speed * .55 + u.ph;
      const cx = cam.position.x + u.ox * (d * .35), cy = 1.6 + u.oy + (c.layer === "far" ? 1.2 : 0), cz = cam.position.z - d;
      const at = k => tmp.set(cx + Math.sin(k * u.a) * d * .32, cy + Math.sin(k * u.b * 1.7) * .5, cz + Math.sin(k * u.c) * d * .25);
      b.position.lerp(at(tt), u.init ? .08 : 1); u.init = true; b.lookAt(at(tt + .1));
      const f = .15 + .95 * (.5 + .5 * Math.sin(t * u.flap)); u.wr.rotation.z = f; u.wl.rotation.z = -f;
    });
    if (this.hero.visible) { const u = this.hero.userData, f = .15 + .95 * (.5 + .5 * Math.sin(t * 11)); u.wr.rotation.z = f; u.wl.rotation.z = -f; }
    this.renderer.render(this.scene, cam);
  },
  heartsOn: 0,

  // Mariposa protagonista con trayectoria guiada
  fly(from, to, dur, onDone) {
    const h = this.hero, s = { k: 0 }, dir = new THREE.Vector3().subVectors(to, from).normalize(), p = new THREE.Vector3();
    h.visible = true; h.position.copy(from);
    G.to(s, { k: 1, duration: dur, ease: "sine.inOut",
      onUpdate: () => { p.lerpVectors(from, to, s.k); p.y += Math.sin(s.k * Math.PI * 2) * .35; h.position.copy(p); h.lookAt(p.x + dir.x, p.y + dir.y, p.z + dir.z); },
      onComplete: () => { h.visible = false; onDone && onDone(); } });
  },
};
