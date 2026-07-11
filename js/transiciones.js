// js/transiciones.js
// Herramientas compartidas para las transiciones entre secciones.
// No sabe nada de Three.js ni de la niebla: solo anima números.
// Quien lo usa decide QUÉ número animar; este archivo decide CÓMO.

// --- Curvas de easing ---
// Reciben un progreso t entre 0 y 1 y devuelven ese progreso "curvado".
export const Easing = {
  lineal: (t) => t,
  entrada: (t) => t * t * t,                    // arranca lento, acaba rápido
  salida: (t) => 1 - Math.pow(1 - t, 3),        // arranca rápido, frena suave
  entradaSalida: (t) => t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2           // suave en ambos extremos
};

// --- Animador de valores ---
// Lleva un número de `desde` a `hasta` en `duracion` ms.
// `alCambiar(valor)` se ejecuta en cada frame con el valor actual.
// Devuelve una Promise que se resuelve al terminar: permite encadenar con await.
export function animar({ desde, hasta, duracion, easing = Easing.entradaSalida, alCambiar }) {
  return new Promise((resolver) => {
    const inicio = performance.now();

    function paso(ahora) {
      const t = Math.min((ahora - inicio) / duracion, 1); // progreso 0→1, nunca pasa de 1
      const valor = desde + (hasta - desde) * easing(t);
      alCambiar(valor);

      if (t < 1) {
        requestAnimationFrame(paso);
      } else {
        resolver();
      }
    }

    requestAnimationFrame(paso);
  });
}

// --- Pausa entre fases ---
// Uso: await esperar(400);
export function esperar(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}