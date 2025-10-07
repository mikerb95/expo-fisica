// main.js
// Lógica de cálculo y visualización para la exposición de Física MRUA

const accInput = document.getElementById('accInput');
const timeInput = document.getElementById('timeInput');
const calcBtn = document.getElementById('calcBtn');
const velFinalSpan = document.getElementById('velFinal');
const distRecSpan = document.getElementById('distRecorrida');
const simBtn = document.getElementById('simBtn');
const droneSprite = document.getElementById('droneSprite');
const btnVerProblema = document.getElementById('btnVerProblema');

function calcular() {
  const a = parseFloat(accInput.value) || 0;
  const t = parseFloat(timeInput.value) || 0;
  const vFinal = a * t; // v = a t (v0 = 0)
  const distancia = 0.5 * a * t * t; // s = 1/2 a t^2
  velFinalSpan.textContent = redondear(vFinal);
  distRecSpan.textContent = redondear(distancia);
  animarDrone(a, t, distancia);
}

function redondear(num) {
  return Number(num.toFixed(2)).toString();
}

// Se removieron las gráficas para versión simplificada

function animarDrone(a, t, distanciaTotal) {
  if (!window.gsap) return;
  const pista = document.querySelector('.pista');
  const ancho = pista.getBoundingClientRect().width;
  // Normalizamos distancia a porcentaje de la pista
  // limitamos para no salir de la pista visual
  const maxPx = ancho; // valor máximo (100%)
  let pxObjetivo = ancho * 0.9; // dejar margen
  // Escalamos según distancia: si distancia <=64, 64 corresponde a 90% de la pista
  pxObjetivo = Math.min((distanciaTotal / 64) * (ancho * 0.9), ancho * 0.9);

  window.gsap.killTweensOf(droneSprite);
  window.gsap.to(droneSprite, {
    x: pxObjetivo,
    duration: Math.max(t * 0.6, 0.5),
    ease: 'power2.out'
  });
  // efecto vertical suave (flotación)
  window.gsap.to(droneSprite, { y: -8, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
}

calcBtn.addEventListener('click', calcular);
btnVerProblema.addEventListener('click', () => {
  document.getElementById('problema').scrollIntoView({ behavior: 'smooth' });
});

simBtn.addEventListener('click', () => {
  calcular();
});

// Inicial
window.addEventListener('load', () => {
  calcular();
});
