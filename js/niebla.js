// ─── NIEBLA 2D ────────────────────────────────────────────────────────────────
// Capa de niebla dibujada en canvas 2D, por encima del canvas 3D.
// Concepto: pintar gris en toda la pantalla ("empañar el cristal"),
// luego borrar zonas con degradados ("limpiar con el dedo").

const canvasNiebla = document.getElementById('niebla-canvas');
const ctx = canvasNiebla.getContext('2d');

// Colocación: misma posición que tenía el div, encima del 3D (z-index 2)
canvasNiebla.style.position = 'fixed';
canvasNiebla.style.top = '0';
canvasNiebla.style.left = '0';
canvasNiebla.style.zIndex = '2';
canvasNiebla.style.pointerEvents = 'none';

// El color de la niebla, el mismo gris del CSS: rgb(138,154,168)
const COLOR_NIEBLA = 'rgba(138, 154, 168, 0.8)';

function dibujarNiebla() {
  // Ajustar el tamaño del canvas al de la ventana
  canvasNiebla.width = window.innerWidth;
  canvasNiebla.height = window.innerHeight;

  // Empañar: gris semitransparente en toda la superficie
  ctx.fillStyle = COLOR_NIEBLA;
  ctx.fillRect(0, 0, canvasNiebla.width, canvasNiebla.height);
}

// Dibujar al cargar y redibujar si cambia el tamaño de la ventana
dibujarNiebla();
window.addEventListener('resize', dibujarNiebla);