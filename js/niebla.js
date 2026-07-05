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
  canvasNiebla.width = window.innerWidth;
  canvasNiebla.height = window.innerHeight;

  const w = canvasNiebla.width;
  const h = canvasNiebla.height;

  // ── 1. Empañar: velo gris en toda la pantalla ──
  ctx.fillStyle = COLOR_NIEBLA;
  ctx.fillRect(0, 0, w, h);

  // ── 2. Limpiar el claro del barco (elipse) ──
  // A partir de aquí, todo lo que se dibuje BORRA en vez de pintar:
  ctx.globalCompositeOperation = 'destination-out';

  // Centro y radios de la elipse, traducidos del CSS:
  // ellipse 50% 54% at 50% 83%
  const cx = w * 0.50;   // centro horizontal
  const cy = h * 0.83;   // centro vertical
  const rx = w * 0.50;   // radio horizontal
  const ry = h * 0.54;   // radio vertical

  // Degradado radial de borrado. Canvas solo hace degradados circulares,
  // así que creamos un círculo y lo estiramos a elipse con una transformación.
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  // Paradas invertidas respecto al CSS:
  // CSS: transparente hasta 30% → denso hacia fuera
  // Aquí: borrar del todo hasta 30% → dejar de borrar hacia fuera
  grad.addColorStop(0.0, 'rgba(0,0,0,1)');    // centro: borrado total
  grad.addColorStop(0.3, 'rgba(0,0,0,1)');    // sigue borrando del todo hasta el 30%
  grad.addColorStop(0.6, 'rgba(0,0,0,0.25)'); // al 60%: borra poco (CSS tenía 0.75 de niebla)
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');    // borde: no borra nada

  // Transformación: movemos el origen al centro de la elipse y escalamos
  // el círculo unitario a los radios rx/ry — así el degradado circular
  // se convierte en elíptico.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  ctx.fillStyle = grad;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
// ── Limpiar el claro del cielo (franja superior) ──
  // Degradado lineal vertical: de (0,0) arriba a (0, h*0.2) — el 20% de altura.
  // Borrado total en el borde superior, ningún borrado a partir del 20%.
  const gradCielo = ctx.createLinearGradient(0, 0, 0, h * 0.2);
  gradCielo.addColorStop(0, 'rgba(0,0,0,1)');   // top: borra todo → cielo limpio
  gradCielo.addColorStop(1, 'rgba(0,0,0,0)');   // al 20% de altura: no borra nada
  ctx.fillStyle = gradCielo;
  ctx.fillRect(0, 0, w, h * 0.2);
  // ── 3. Volver al modo normal de pintado para futuros dibujados ──
  ctx.globalCompositeOperation = 'source-over';
}
// Dibujar al cargar y redibujar si cambia el tamaño de la ventana
dibujarNiebla();
window.addEventListener('resize', dibujarNiebla);