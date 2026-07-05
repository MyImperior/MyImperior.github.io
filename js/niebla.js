// ─── NIEBLA 2D ────────────────────────────────────────────────────────────────
// Capa de niebla en canvas 2D. Se redibuja cada frame (bucle de animación)
// para permitir efectos temporales como los fogonazos de los rayos.

const canvasNiebla = document.getElementById('niebla-canvas');
const ctx = canvasNiebla.getContext('2d');

canvasNiebla.style.position = 'fixed';
canvasNiebla.style.top = '0';
canvasNiebla.style.left = '0';
canvasNiebla.style.zIndex = '2';
canvasNiebla.style.pointerEvents = 'none';

const COLOR_NIEBLA = 'rgba(138, 154, 168, 0.8)';

// ─── RAYOS ───────────────────────────────────────────────────────────────────
// Posiciones en fracción de pantalla (x, y) y radio en fracción del ancho.
// AJUSTA ESTOS VALORES para colocar cada rayo sobre su objetivo:
const POS_CIUDAD  = { x: 0.18, y: 0.52, radio: 0.15 };
const POS_MONTANA = { x: 0.78, y: 0.48, radio: 0.15 };

const DURACION_FOGONAZO = 350; // milisegundos de vida de cada fogonazo

let fogonazosActivos = []; // lista de fogonazos vivos en este momento

function lanzarFogonazo(pos) {
  fogonazosActivos.push({
    x: pos.x,
    y: pos.y,
    radio: pos.radio,
    nacimiento: performance.now()
  });
}

// Programación aleatoria de cada rayo, como en el sistema viejo:
function programarRayoCiudad() {
  lanzarFogonazo(POS_CIUDAD);
  setTimeout(programarRayoCiudad, 8000 + Math.random() * 8000);
}
function programarRayoMontana() {
  lanzarFogonazo(POS_MONTANA);
  setTimeout(programarRayoMontana, 10000 + Math.random() * 10000);
}
setTimeout(programarRayoCiudad, 3000);
setTimeout(programarRayoMontana, 6000);

// ─── DIBUJO DE UN FRAME ──────────────────────────────────────────────────────
function dibujarNiebla() {
  const w = canvasNiebla.width;
  const h = canvasNiebla.height;

  // Limpiar el frame anterior
  ctx.clearRect(0, 0, w, h);

  // 1. Velo gris general
  ctx.fillStyle = COLOR_NIEBLA;
  ctx.fillRect(0, 0, w, h);

  // 2. Modo borrador: los claros
  ctx.globalCompositeOperation = 'destination-out';

  // 2a. Claro del barco (elipse)
  const cx = w * 0.50, cy = h * 0.83;
  const rx = w * 0.50, ry = h * 0.54;
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  grad.addColorStop(0.0, 'rgba(0,0,0,1)');
  grad.addColorStop(0.3, 'rgba(0,0,0,1)');
  grad.addColorStop(0.6, 'rgba(0,0,0,0.25)');
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  ctx.fillStyle = grad;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();

  // 2b. Claro del cielo (franja superior)
  const gradCielo = ctx.createLinearGradient(0, 0, 0, h * 0.2);
  gradCielo.addColorStop(0, 'rgba(0,0,0,1)');
  gradCielo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradCielo;
  ctx.fillRect(0, 0, w, h * 0.2);

  // 2c. Claros temporales de los fogonazos activos
  const ahora = performance.now();
  fogonazosActivos = fogonazosActivos.filter(f => {
    const edad = ahora - f.nacimiento;
    if (edad > DURACION_FOGONAZO) return false; // fogonazo muerto: fuera

    // Intensidad: sube instantáneo, baja durante la vida (1 → 0)
    const intensidad = 1 - (edad / DURACION_FOGONAZO);

    const fx = w * f.x, fy = h * f.y, fr = w * f.radio;
    const gradF = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
    gradF.addColorStop(0, `rgba(0,0,0,${intensidad})`);   // centro: borra según intensidad
    gradF.addColorStop(1, 'rgba(0,0,0,0)');               // borde: no borra
    ctx.fillStyle = gradF;
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fill();

    return true; // sigue vivo
  });

  // 3. Volver a modo pintar: el resplandor de los fogonazos
  ctx.globalCompositeOperation = 'source-over';

  for (const f of fogonazosActivos) {
    const edad = ahora - f.nacimiento;
    const intensidad = 1 - (edad / DURACION_FOGONAZO);
    const fx = w * f.x, fy = h * f.y, fr = w * f.radio;
    const gradLuz = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
    gradLuz.addColorStop(0, `rgba(220,235,255,${0.35 * intensidad})`);
    gradLuz.addColorStop(0.4, `rgba(180,210,255,${0.15 * intensidad})`);
    gradLuz.addColorStop(1, 'rgba(180,210,255,0)');
    ctx.fillStyle = gradLuz;
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── BUCLE DE ANIMACIÓN ──────────────────────────────────────────────────────
function ajustarTamano() {
  canvasNiebla.width = window.innerWidth;
  canvasNiebla.height = window.innerHeight;
}
ajustarTamano();
window.addEventListener('resize', ajustarTamano);

function bucle() {
  requestAnimationFrame(bucle);
  dibujarNiebla();
}
bucle();