(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const root = document.documentElement;
  const mesa = $("#mesa"), escala = $("#escala"), lona = $("#lona");
  const inAncho = $("#inAncho"), inAlto = $("#inAlto"), lectura = $("#lectura");
  const PX_CM = 10;
  let modo = "ajustar";

  /* ---------- Datos Reales ---------- */
  const barras = [
    { et: "Media gral.", pre: 4.64, post: 4.86, max: 5, fmt: (v) => v.toFixed(2).replace(".", ",") },
    { et: "Acuerdo", pre: 90, post: 95, max: 100, fmt: (v) => v + "%" }
  ];
  const retos = [
    ["Soledad", 27], ["Dinero", 23], ["Entorno", 23], ["Hogar", 14]
  ];

  function pintarGraficas() {
    const g = $("#graficas");
    if(g) {
      g.innerHTML = "";
      barras.forEach((b) => {
        const fila = document.createElement("div");
        fila.className = "barra-g";
        fila.innerHTML = `<div class="et">${b.et}</div><div class="pistas">
          <div class="pista pre"><div class="relleno"><i data-w="${(b.pre / b.max) * 100}"></i></div><em>${b.fmt(b.pre)}</em></div>
          <div class="pista post"><div class="relleno"><i data-w="${(b.post / b.max) * 100}"></i></div><em>${b.fmt(b.post)}</em></div>
        </div>`;
        g.appendChild(fila);
      });
    }

    const r = $("#retos");
    if(r) {
      r.innerHTML = "";
      const max = Math.max(...retos.map((x) => x[1]));
      retos.forEach(([n, v]) => {
        const d = document.createElement("div");
        d.className = "reto";
        d.innerHTML = `<span>${n}</span><div class="rel"><i data-w="${(v / max) * 100}"></i></div><b>${v}</b>`;
        r.appendChild(d);
      });
    }

    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll("[data-w]").forEach((i) => (i.style.width = i.dataset.w + "%"));
    }));
  }

  /* ---------- Medidas y Escala ---------- */
  function aplicarMedidas() {
    const w = Math.max(30, Math.min(400, +inAncho.value || 120));
    const h = Math.max(30, Math.min(400, +inAlto.value || 120));
    root.style.setProperty("--w", w);
    root.style.setProperty("--h", h);
    escalar();
  }

  function escalar() {
    const w = +getComputedStyle(root).getPropertyValue("--w") || 120;
    const h = +getComputedStyle(root).getPropertyValue("--h") || 120;
    const pw = w * PX_CM, ph = h * PX_CM;
    
    let k = 1;
    if (modo === "ajustar") {
      const ancho = mesa.clientWidth - 100, alto = mesa.clientHeight - 100;
      k = Math.min(ancho / pw, alto / ph, 1.5);
    }
    
    escala.style.transform = `scale(${k})`;
    escala.style.width = pw + "px";
    escala.style.height = ph + "px";
    lectura.textContent = `${w} × ${h} cm · vista ${(k * 100).toFixed(0)}%`;
  }

  /* ---------- Eventos ---------- */
  $("#btnAjustar").addEventListener("click", () => { modo = "ajustar"; escalar(); lona.classList.remove("enfocado"); lona.style.transform = ''; });
  $("#btnReal").addEventListener("click", () => { modo = "real"; escalar(); mesa.scrollTo(0, 0); });
  $("#btnImprimir").addEventListener("click", () => window.print());
  [inAncho, inAlto].forEach((i) => i.addEventListener("input", aplicarMedidas));
  window.addEventListener("resize", () => modo === "ajustar" && escalar());

  /* ---------- Interatividad 3D ---------- */
  mesa.addEventListener("mousemove", (e) => {
    if (modo !== "ajustar" || lona.classList.contains("enfocado")) return;
    const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
    lona.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
  });

  mesa.addEventListener("mouseleave", () => {
    if(!lona.classList.contains("enfocado")) lona.style.transform = `rotateY(0deg) rotateX(0deg)`;
  });

  document.querySelectorAll(".panel").forEach(panel => {
    panel.addEventListener("click", (e) => {
      if(e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.tagName === 'INPUT') return;
      
      lona.classList.toggle("enfocado");
      if(lona.classList.contains("enfocado")) {
        escala.style.transform = `scale(${1.25})`; 
        lona.style.transform = `rotateY(0deg) rotateX(0deg)`; 
      } else {
        escalar();
      }
    });
  });

  pintarGraficas();
  aplicarMedidas();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(escalar);
})();