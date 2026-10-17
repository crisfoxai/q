/* Logo de "El truco escondido": una galera de mago armada con módulos de QR en relieve, banda magenta,
   chispa cian y dos ojos que espían desde abajo. window.LOGO.build(cont, {palabra}) arma el SVG;
   window.LOGO.animar(tl, t0, refs, {idle}) lo anima sobre un timeline GSAP (seek-safe). */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const CI = "#22e4ff", MG = "#ff2fa0", BLANCO = "#f3f6fa", SOMBRA = "#8b94a3";
  const el = (tag, attrs, padre) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (padre) padre.appendChild(e); return e; };

  // galera en una grilla de 24×24 módulos: [col, fila, tipo]  (b = blanco, m = banda magenta)
  function modulos() {
    const out = [];
    for (let r = 4; r <= 12; r++) for (let c = 7; c <= 16; c++) {
      if (r === 4 && (c === 7 || c === 16)) continue;               // copa con esquinas redondeadas
      out.push([c, r, r >= 11 ? "m" : "b"]);
    }
    for (let c = 4; c <= 19; c++) out.push([c, 13, "b"]);           // ala
    for (let c = 3; c <= 20; c++) out.push([c, 14, "b"]);
    return out;
  }

  function build(cont, { palabra = true, tam = 1080 } = {}) {
    const svg = el("svg", { viewBox: palabra ? "0 0 24 32" : "0 0 24 24", width: tam, height: palabra ? tam * 32 / 24 : tam, style: "overflow:visible;display:block" }, cont);
    const defs = el("defs", {}, svg);
    const f = el("filter", { id: "lg-brillo", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    el("feGaussianBlur", { stdDeviation: "0.35", result: "b" }, f);
    const fm = el("feMerge", {}, f); el("feMergeNode", { in: "b" }, fm); el("feMergeNode", { in: "SourceGraphic" }, fm);

    const raiz = el("g", { transform: "translate(0 1.2)" }, svg);
    // ojos (debajo del ala: aparecen cuando la galera se levanta)
    const ojos = el("g", {}, raiz);
    const ojo = (cx) => {
      const g = el("g", { class: "lg-ojo" }, ojos);
      el("ellipse", { cx, cy: 16.6, rx: 1.15, ry: 1.0, fill: BLANCO }, g);
      const p = el("circle", { cx: cx + 0.25, cy: 16.75, r: 0.48, fill: CI, filter: "url(#lg-brillo)", class: "lg-pupila" }, g);
      return { g, p };
    };
    const o1 = ojo(9.6), o2 = ojo(14.4);
    // galera
    const galera = el("g", { class: "lg-galera" }, raiz);
    const mods = modulos().map(([c, r, t]) => {
      const g = el("g", { class: "lg-mod" }, galera);
      el("rect", { x: c + 0.06, y: r + 0.2, width: 0.88, height: 0.88, rx: 0.2, fill: t === "m" ? "#a3156a" : SOMBRA }, g);
      el("rect", { x: c + 0.06, y: r + 0.06, width: 0.88, height: 0.82, rx: 0.2, fill: t === "m" ? MG : BLANCO }, g);
      g.dataset.c = c; g.dataset.r = r; g.dataset.t = t;
      return g;
    });
    // chispa
    const chispa = el("g", { class: "lg-chispa" }, raiz);
    el("path", { d: "M19.6 0.6 L20.25 2.45 L22.1 3.1 L20.25 3.75 L19.6 5.6 L18.95 3.75 L17.1 3.1 L18.95 2.45 Z", fill: CI, filter: "url(#lg-brillo)" }, chispa);
    el("circle", { cx: 22.4, cy: 5.9, r: 0.42, fill: CI, filter: "url(#lg-brillo)" }, chispa);
    const refs = { svg, galera, mods, ojos: [o1, o2], chispa };
    if (palabra) {
      const t1 = el("text", { x: 12, y: 24.2, "text-anchor": "middle", "font-family": "Manrope, sans-serif", "font-weight": 800, "font-size": 3.1, fill: BLANCO, "letter-spacing": "-0.05" }, svg);
      t1.textContent = "el truco";
      const g2 = el("g", {}, svg);
      const t2 = el("text", { x: 12, y: 28.6, "text-anchor": "middle", "font-family": "Manrope, sans-serif", "font-weight": 800, "font-size": 3.1, fill: BLANCO, "letter-spacing": "-0.05" }, g2);
      t2.textContent = "escondido";
      const caja = el("rect", { x: 4.1, y: 25.75, width: 15.8, height: 3.75, fill: "none", stroke: MG, "stroke-width": 0.22, rx: 0.15 }, g2);
      const h1 = el("circle", { cx: 4.1, cy: 25.75, r: 0.42, fill: BLANCO, stroke: MG, "stroke-width": 0.22 }, g2);
      const h2 = el("circle", { cx: 19.9, cy: 29.5, r: 0.42, fill: BLANCO, stroke: MG, "stroke-width": 0.22 }, g2);
      Object.assign(refs, { t1, t2, caja, h1, h2 });
    }
    return refs;
  }

  function animar(tl, t0, R, { idle = 2.0, palabra = true } = {}) {
    const g = window.gsap;
    // los módulos caen por columnas y rebotan
    R.mods.forEach((m) => {
      const c = +m.dataset.c, r = +m.dataset.r;
      tl.fromTo(m, { y: -14 - r * 0.4, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "bounce.out", immediateRender: true }, t0 + (c - 3) * 0.022 + (14 - r) * 0.008);
    });
    const tSube = t0 + 0.7;
    // la galera se levanta un poco, se inclina y deja ver los ojos
    tl.fromTo(R.galera, { y: 0, rotation: 0, svgOrigin: "12 14" }, { y: -1.6, rotation: -7, svgOrigin: "12 14", duration: 0.45, ease: "back.out(2.5)", immediateRender: false }, tSube);
    tl.fromTo(R.ojos.map((o) => o.g), { scale: 0, svgOrigin: "12 16.6", opacity: 0 }, { scale: 1, opacity: 1, svgOrigin: "12 16.6", duration: 0.35, ease: "back.out(3)", immediateRender: true }, tSube + 0.12);
    // chispa
    tl.fromTo(R.chispa, { scale: 0, rotation: -90, svgOrigin: "19.6 3.1", opacity: 0 }, { scale: 1, rotation: 0, svgOrigin: "19.6 3.1", opacity: 1, duration: 0.5, ease: "back.out(3)", immediateRender: true }, tSube + 0.25);
    if (palabra && R.t1) {
      tl.fromTo(R.t1, { opacity: 0, y: 1.5 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", immediateRender: true }, tSube + 0.35);
      tl.fromTo(R.t2, { opacity: 0, y: 1.5 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", immediateRender: true }, tSube + 0.5);
      tl.fromTo(R.caja, { scaleX: 0, svgOrigin: "4.1 27.6", opacity: 1 }, { scaleX: 1, svgOrigin: "4.1 27.6", duration: 0.3, ease: "power3.out", immediateRender: true }, tSube + 0.62);
      tl.fromTo([R.h1, R.h2], { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, transformOrigin: "50% 50%", duration: 0.25, ease: "back.out(3)", stagger: 0.07, immediateRender: true }, tSube + 0.8);
    }
    // reposo: los ojos miran a un lado y al otro, parpadean; la galera respira; la chispa titila
    const tI = tSube + 0.9;
    const pup = R.ojos.map((o) => o.p);
    tl.to(pup, { x: -0.5, duration: 0.25, ease: "power2.inOut" }, tI);
    tl.to(pup, { x: 0.3, duration: 0.3, ease: "power2.inOut" }, tI + 0.6);
    tl.to(R.ojos.map((o) => o.g), { scaleY: 0.1, svgOrigin: "12 16.6", duration: 0.07, yoyo: true, repeat: 1 }, tI + 1.05);
    tl.to(R.galera, { y: -1.9, duration: idle / 2, ease: "sine.inOut", yoyo: true, repeat: 1 }, tI);
    tl.to(R.chispa, { scale: 1.25, svgOrigin: "19.6 3.1", duration: 0.2, yoyo: true, repeat: 3, ease: "sine.inOut" }, tI + 0.3);
    return { fin: tI + idle, cae: t0 + 0.35, sube: tSube, chispa: tSube + 0.25 };
  }

  window.LOGO = { build, animar, CI, MG };
})();
