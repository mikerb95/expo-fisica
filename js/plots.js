// plots.js
// Configuración de gráficas usando Chart.js

function baseConfig(ctx, label, data, color, yLabel) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label,
            data: data.values,
            borderColor: color,
            backgroundColor: color + '33',
            tension: 0.15,
            fill: true,
            pointRadius: 0,
            borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Tiempo (s)' },
          grid: { color: 'rgba(255,255,255,0.08)' },
          ticks: { color: '#cbd5e1' }
        },
        y: {
          title: { display: true, text: yLabel },
          grid: { color: 'rgba(255,255,255,0.08)' },
          ticks: { color: '#cbd5e1' }
        }
      },
      plugins: {
        legend: { labels: { color: '#e2e8f0' } },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#0f172a',
          borderColor: '#1e293b',
          borderWidth: 1,
          titleColor: '#fff',
          bodyColor: '#a5f3fc'
        }
      }
    }
  });
}

export function graficarVelocidad(tiempos, velocidades) {
  const ctx = document.getElementById('graficaVelocidad').getContext('2d');
  return baseConfig(ctx, 'Velocidad (m/s)', { labels: tiempos, values: velocidades }, '#06b6d4', 'Velocidad (m/s)');
}

export function graficarDistancia(tiempos, distancias) {
  const ctx = document.getElementById('graficaDistancia').getContext('2d');
  return baseConfig(ctx, 'Distancia (m)', { labels: tiempos, values: distancias }, '#3b82f6', 'Distancia (m)');
}
