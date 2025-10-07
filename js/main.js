// main.js
// Lógica de cálculo y visualización para la exposición de Física MRUA

const accInput = document.getElementById('accInput');
const timeInput = document.getElementById('timeInput');
const calcBtn = document.getElementById('calcBtn');
const velFinalSpan = document.getElementById('velFinal');
const distRecSpan = document.getElementById('distRecorrida');
const simBtn = document.getElementById('simBtn');
const startBtn = document.getElementById('startBtn');
const progressBar = document.getElementById('progressBar');
const tiempoActualEl = document.getElementById('tiempoActual');
const tiempoTotalEl = document.getElementById('tiempoTotal');
const pasosLista = document.querySelectorAll('.pasos li');
const droneSprite = document.getElementById('droneSprite');
const btnVerProblema = document.getElementById('btnVerProblema');

function calcular() {
  const a = parseFloat(accInput.value) || 0;
  const t = parseFloat(timeInput.value) || 0;
  const vFinal = a * t; // v = a t (v0 = 0)
  const distancia = 0.5 * a * t * t; // s = 1/2 a t^2
  velFinalSpan.textContent = redondear(vFinal);
  distRecSpan.textContent = redondear(distancia);
  // Actualizar texto pasos
  document.getElementById('aDato').textContent = redondear(a);
  document.getElementById('tDato').textContent = redondear(t);
  document.getElementById('velFinalPaso').textContent = redondear(vFinal);
  document.getElementById('distPaso').textContent = redondear(distancia);
  // No animar automáticamente; solo reposicionar inicial
  posicionInicial();
  return { a, t, vFinal, distancia };
}

function redondear(num) {
  return Number(num.toFixed(2)).toString();
}

// Se removieron las gráficas para versión simplificada

let timeline = null;

function animarDrone(a, t, distanciaTotal) {
  if (!window.gsap) {
    // Fallback simple sin GSAP
    let start = null;
    const pista = document.querySelector('.pista');
    const ancho = pista.getBoundingClientRect().width * 0.9;
    function step(ts) {
      if (!start) start = ts;
      const elapsed = (ts - start) / 1000;
      const ratio = Math.min(elapsed / t, 1);
      const distancia = distanciaTotal * ratio * ratio; // cuadrático
      const x = Math.min((distancia / distanciaTotal) * ancho, ancho);
      droneSprite.style.transform = `translate(${x}px, ${Math.sin(elapsed*3)*4}px)`;
      updateProgress(ratio, elapsed, t);
      highlightSteps(ratio);
      if (ratio < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    return;
  }
  const pista = document.querySelector('.pista');
  const ancho = pista.getBoundingClientRect().width * 0.9;
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

function updateProgress(ratio, tiempo, total) {
  if (progressBar) progressBar.style.width = (ratio * 100).toFixed(1) + '%';
  if (tiempoActualEl) tiempoActualEl.textContent = (Math.min(tiempo, total)).toFixed(1) + ' s';
  if (tiempoTotalEl) tiempoTotalEl.textContent = total.toFixed(1) + ' s';
}

function highlightSteps(ratio) {
  pasosLista.forEach(li => li.classList.remove('active'));
  if (ratio < 0.05) pasosLista[0]?.classList.add('active');
  else if (ratio < 0.5) pasosLista[1]?.classList.add('active');
  else if (ratio < 0.9) pasosLista[2]?.classList.add('active');
  else pasosLista[3]?.classList.add('active');
}

function posicionInicial() {
  if (!window.gsap) return;
  window.gsap.killTweensOf(droneSprite);
  window.gsap.set(droneSprite, { x: 0, y: 0 });
}

calcBtn.addEventListener('click', calcular);
btnVerProblema.addEventListener('click', () => {
  document.getElementById('problema').scrollIntoView({ behavior: 'smooth' });
});

simBtn.addEventListener('click', () => {
  if (timeline) timeline.kill();
  calcular();
  updateProgress(0, 0, parseFloat(timeInput.value)||0);
  highlightSteps(0);
});

startBtn.addEventListener('click', () => {
  const { a, t, distancia } = calcular();
  animarDrone(a, t, distancia);
});

// Inicial
window.addEventListener('load', () => {
  calcular();
});
