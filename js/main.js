// main.js
// Lógica de cálculo y visualización para la exposición de Física MRUA

// Valores fijos del ejercicio
const A_FIJA = 2; // m/s^2
const T_FIJO = 8; // s
const V_FIJ = A_FIJA * T_FIJO; // 16 m/s
const S_FIJA = 0.5 * A_FIJA * T_FIJO * T_FIJO; // 64 m
const simBtn = document.getElementById('simBtn');
const startBtn = document.getElementById('startBtn');
const progressBar = document.getElementById('progressBar');
const tiempoActualEl = document.getElementById('tiempoActual');
const tiempoTotalEl = document.getElementById('tiempoTotal');
const pasosLista = document.querySelectorAll('.pasos li');
const percentAvanceEl = document.getElementById('percentAvance');
const velBar = document.getElementById('velBar');
const distBar = document.getElementById('distBar');
const velInstText = document.getElementById('velInstText');
const distInstText = document.getElementById('distInstText');
const droneMarker = document.getElementById('droneMarker');
const droneSprite = document.getElementById('droneSprite');
const btnVerProblema = document.getElementById('btnVerProblema');

function calcular() {
  // Reutiliza valores fijos
  posicionInicial();
  updateMetrics(0, A_FIJA, T_FIJO, S_FIJA);
  prepararFormulas(A_FIJA, T_FIJO, V_FIJ, S_FIJA);
  // Debug opcional: console.log('Valores fijos', {A_FIJA, T_FIJO, V_FIJ, S_FIJA});
  return { a: A_FIJA, t: T_FIJO, vFinal: V_FIJ, distancia: S_FIJA };
}

function redondear(num) {
  return Number(num.toFixed(2)).toString();
}

// Se removieron las gráficas para versión simplificada

let timeline = null;

function animarDrone(a, t, distanciaTotal) {
  if (t <= 0 || distanciaTotal <= 0) {
    console.warn('Parámetros inválidos para animación', { a, t, distanciaTotal });
    return;
  }
  if (!window.gsap) {
    // Fallback simple sin GSAP
    let start = null;
    const pista = document.querySelector('.pista');
  let ancho = pista.getBoundingClientRect().width * 0.9;
  if (ancho === 0) ancho = 800; // ancho virtual si está oculto
    function step(ts) {
      if (!start) start = ts;
      const elapsed = (ts - start) / 1000;
      const ratio = Math.min(elapsed / t, 1);
      const distancia = distanciaTotal * ratio * ratio; // cuadrático
      const x = Math.min((distancia / distanciaTotal) * ancho, ancho);
      droneSprite.style.transform = `translate(${x}px, ${Math.sin(elapsed*3)*4}px)`;
      updateProgress(ratio, elapsed, t);
      highlightSteps(ratio);
      updateMetrics(ratio, a, t, distanciaTotal);
      if (ratio < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    return;
  }
  const pista = document.querySelector('.pista');
  let ancho = pista.getBoundingClientRect().width * 0.9;
  if (ancho === 0) ancho = 800; // ancho virtual si está oculto
  const destinoX = Math.min((distanciaTotal / 64) * ancho, ancho);

  if (timeline) timeline.kill();
  window.gsap.set(droneSprite, { x: 0, y: 0 });

  timeline = window.gsap.timeline({
    defaults: { ease: 'none' },
    onUpdate: () => {
      const ratio = timeline.progress();
      const tiempoActual = ratio * t;
      updateProgress(ratio, tiempoActual, t);
      highlightSteps(ratio);
      updateMetrics(ratio, a, t, distanciaTotal);
    }
  });

  // Movimiento horizontal con aceleración simulada (ease personalizada)
  timeline.to(droneSprite, {
    duration: t,
    motionRatio: 1,
    x: destinoX,
    ease: customQuadraticEase()
  }, 0);

  // Flotación independiente
  window.gsap.to(droneSprite, { y: -18, duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut' });
}

function customQuadraticEase() {
  return (p) => p * p; // simple ease-in cuadrático
}

function updateProgress(ratioTiempo, tiempo, total) {
  // En MRUA desde reposo: s ∝ t^2, así que ratio de distancia = (t/t_total)^2 = ratioTiempo^2
  const ratioDist = Math.min(1, Math.max(0, ratioTiempo * ratioTiempo));
  if (progressBar) progressBar.style.width = (ratioDist * 100).toFixed(1) + '%';
  if (tiempoActualEl) tiempoActualEl.textContent = (Math.min(tiempo, total)).toFixed(1) + ' s';
  if (tiempoTotalEl) tiempoTotalEl.textContent = total.toFixed(1) + ' s';
  const porcentaje = Math.round(ratioDist * 100);
  if (percentAvanceEl) percentAvanceEl.textContent = porcentaje + '%';
  if (droneMarker) droneMarker.style.left = (ratioDist * 100) + '%';
  const avanceBox = document.getElementById('avancePorcBox');
  if (avanceBox) avanceBox.textContent = porcentaje + '%';
}

function highlightSteps(ratio) {
  pasosLista.forEach(li => li.classList.remove('active'));
  if (ratio < 0.05) pasosLista[0]?.classList.add('active');
  else if (ratio < 0.5) pasosLista[1]?.classList.add('active');
  else if (ratio < 0.9) pasosLista[2]?.classList.add('active');
  else pasosLista[3]?.classList.add('active');
  actualizarEscrituraFormulas(ratio);
}

function updateMetrics(ratio, a, t, distanciaTotal) {
  // ratio temporal (0..1) -> tiempo actual
  const tiempoAct = ratio * t;
  const vInst = a * tiempoAct; // v = a t
  const sInst = 0.5 * a * tiempoAct * tiempoAct; // s = 1/2 a t^2
  if (velInstText) velInstText.textContent = redondear(vInst) + ' m/s';
  if (distInstText) distInstText.textContent = redondear(sInst) + ' m';
  if (velBar) velBar.style.width = (vInst / (a * t || 1) * 100) + '%';
  if (distBar) distBar.style.width = (sInst / (distanciaTotal || 1) * 100) + '%';
}

// --- Fórmulas progresivas ---
const contenidoFormulas = {
  step1: (a,t) => `v0 = 0\na = ${a} m/s^2\nt = ${t} s`,
  step2: (a,t,v) => `v = v0 + a·t\n  = 0 + ${a}·${t}\n  = ${redondear(v)} m/s`,
  step3: (a,t,_,s) => `s = 1/2·a·t^2\n  = 0.5·${a}·(${t})^2\n  = ${redondear(s)} m`,
  step4: () => `Crecimiento:\n v ∝ t (lineal)\n s ∝ t^2 (cuadrático)`
};

let bufferFormulas = {};

function prepararFormulas(a,t,v,s){
  bufferFormulas = {
    f1: contenidoFormulas.step1(a,t),
    f2: contenidoFormulas.step2(a,t,v),
    f3: contenidoFormulas.step3(a,t,v,s),
    f4: contenidoFormulas.step4()
  };
  // limpiar contenedores
  ['fStep1','fStep2','fStep3','fStep4'].forEach(id=>{
    const el = document.getElementById(id); if(el){el.textContent='';el.classList.remove('typing');}
  });
}

function escribirProgresivo(id, texto, progresoLocal){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add('typing');
  const len = Math.floor(texto.length * progresoLocal);
  el.textContent = texto.slice(0,len);
  if (len >= texto.length) el.classList.remove('typing');
}

// Mapea el avance global (0..1) a sub-rangos por paso para escribir las fórmulas
function actualizarEscrituraFormulas(ratio){
  // Rango asignado a cada paso: 0-0.15, 0.15-0.5, 0.5-0.85, 0.85-1
  const segmentos = [ [0,0.15,'fStep1','f1'], [0.15,0.5,'fStep2','f2'], [0.5,0.85,'fStep3','f3'], [0.85,1,'fStep4','f4'] ];
  for (const [ini,fin,dom,bufKey] of segmentos){
    if (ratio >= ini){
      const local = Math.min(1, (ratio - ini)/(fin - ini));
      escribirProgresivo(dom, bufferFormulas[bufKey]||'', local);
    }
  }
}

function posicionInicial() {
  if (window.gsap) {
    window.gsap.killTweensOf(droneSprite);
    window.gsap.set(droneSprite, { x: 0, y: 0 });
  } else if (droneSprite) {
    droneSprite.style.transform = 'translate(0px,0px)';
  }
}

if (btnVerProblema) {
  btnVerProblema.addEventListener('click', () => {
    const p = document.getElementById('problema');
    p && p.scrollIntoView({ behavior: 'smooth' });
  });
}

if (simBtn) {
  simBtn.addEventListener('click', () => {
    if (timeline) timeline.kill();
    calcular();
    updateProgress(0, 0, T_FIJO);
    highlightSteps(0);
    const avanceBox = document.getElementById('avancePorcBox');
    if (avanceBox) avanceBox.textContent = '0%';
  });
}

if (startBtn) {
  startBtn.addEventListener('click', () => {
    const { a, t, distancia } = calcular();
    animarDrone(a, t, distancia);
  });
}

// Inicial
window.addEventListener('load', () => {
  const vals = calcular();
  // Auto start puede habilitarse colocando data-auto en el botón
  if (startBtn && startBtn.dataset.auto === 'true') {
    animarDrone(vals.a, vals.t, vals.distancia);
  }
});
