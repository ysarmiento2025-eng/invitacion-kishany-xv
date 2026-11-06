/* intro.js — intro cinematográfica: aparición, revelación, interacción y apertura de la puerta */
const Intro = {
  start() {
    const S = Scene3D, A = CONFIG.animation, rm = reduceMotion ? .3 : 1;
    cssTo($("#curtain"), { opacity: 0 }, 2.4 * rm, .2);                                    // FASE 1: aparición
    if (!S.ok) { this.showUI(1.2); return; }
    G.to(S.pMat, { opacity: .95, duration: 3 * rm, delay: .3 });
    G.to(S.rig, { z: 6.2, y: 1.7, ly: 2.1, duration: A.introDolly * rm, ease: "power2.out", delay: .2 });   // DOLLY IN
    G.to(S.front, { intensity: 1.4, duration: 3 * rm, delay: 1.2 * rm });                  // FASE 2: la luz revela la puerta
    G.to(S.doorGlow.material, { opacity: .45, duration: 3 * rm, delay: 1.2 * rm });
    setTimeout(() => S.fly(new THREE.Vector3(-3.2, 1.4, 4.2), new THREE.Vector3(3.6, 2.4, 3.4), 3.6), 2200 * rm); // mariposa en primer plano
    this.showUI(A.introDolly * rm + .2);
  },

  showUI(delay) {                                                                           // FASE 3: interacción
    setTimeout(() => { cssTo($("#tagline"), { opacity: 1, transform: "none", filter: "blur(0)" }, 1.4); cssTo($("#introCrest"), { opacity: 1 }, 1.4, .2); }, delay * 1000);
    setTimeout(() => { const b = $("#enterBtn"); b.disabled = false; cssTo(b, { opacity: 1, transform: "none" }, 1.1); }, (delay + .9) * 1000);
  },

  open() {                                                                                  // FASE 4: apertura
    const S = Scene3D, A = CONFIG.animation, b = $("#enterBtn"); if (b.disabled) return; b.disabled = true;
    AudioManager.play(); SFX.play("door"); setTimeout(() => SFX.play("intro"), 900);
    cssTo($("#tagline"), { opacity: 0, transform: "translateY(-10px)" }, .6);
    cssTo(b, { opacity: 0, transform: "translateY(10px)" }, .5); cssTo($("#introCrest"), { opacity: 0 }, .6);

    const done = () => {
      $("#intro").hidden = true; $("#veil").classList.add("on");
      const c = $("#content"); c.classList.add("on"); $("#music").classList.add("on");
      Reveal.init(); c.focus({ preventScroll: true });
    };
    if (!S.ok) { cssTo($("#flash"), { opacity: .95 }, .6); setTimeout(() => { done(); cssTo($("#flash"), { opacity: 0 }, 1.2); }, 650); return; }

    const rm = reduceMotion ? .4 : 1;
    G.to(S.rig, { z: 3.6, y: 1.75, ly: 1.9, duration: 1.8 * rm, ease: "power2.inOut" });                  // la cámara se aproxima
    G.to(S.pivL.rotation, { y: 1.75, duration: A.doorOpen * rm, ease: "power2.inOut", delay: .35 * rm });  // hoja izquierda
    G.to(S.pivR.rotation, { y: -1.75, duration: A.doorOpen * rm, ease: "power2.inOut", delay: .5 * rm });  // hoja derecha
    G.to(S.portal, { intensity: 3.2, duration: 2 * rm, delay: .5 * rm });                                     // luz del bosque
    G.to(S.portalGlow.material, { opacity: 1, duration: 1.8 * rm, delay: .5 * rm });
    G.to(S.pMat, { opacity: 1, size: CONFIG.assets.particles.size * 1.5, duration: 2 * rm, delay: .4 * rm }); // más partículas
    G.to(S, { heartsOn: 1, duration: 3 * rm, delay: 1 * rm });
    G.to(S.scene.fog, { density: .019, duration: 3 * rm, delay: 1 * rm });   // se abre la niebla al entrar al bosque

    setTimeout(() => {                                                                      // la cámara atraviesa la entrada
      G.to(S.rig, { z: -3.5, y: 1.6, ly: 1.7, lz: -14, fov: S.baseFov + 10, duration: A.flyThrough * rm, ease: "power2.in" });
      setTimeout(() => cssTo($("#flash"), { opacity: .9 }, .45), (A.flyThrough - .5) * 1000 * rm);
      setTimeout(() => {
        S.door.visible = false; S.portalGlow.visible = false; S.doorGlow.visible = false; S.phase = "forest";
        G.to(S.portal, { intensity: 1.5, duration: 2 }); G.to(S.pMat, { size: CONFIG.assets.particles.size, duration: 2 });
        G.set(S.rig, { z: -2, lz: -16 });
        G.to(S.rig, { z: -6, fov: S.baseFov, y: 1.7, ly: 2.4, duration: 3.2 * rm, ease: "power3.out" });   // revelación del bosque
        cssTo($("#flash"), { opacity: 0 }, 1.6, .1); SFX.play("reveal"); done();
      }, A.flyThrough * 1000 * rm);
    }, 1500 * rm);
  },
};
