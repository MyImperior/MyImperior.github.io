// ============================================================
//  js/archivo.js
//  MOTOR COMÚN de las secciones tipo "archivo" (Ciencia, y la
//  que venga después: Ciencia Ficción, Arte…).
//
//  Una sección = una página mínima + un archivo de datos:
//      secciones/ciencia.html  →  datos/archivo-ciencia.js
//  Este motor dibuja dos vistas con el mismo lenguaje visual
//  (líneas finas luminosas):
//
//   1. MAPA: el nombre de la sección en el centro y las categorías
//      alrededor, unidas por líneas a 45°/90° (como un plano de
//      metro o un circuito) por las que viajan pulsos de luz.
//   2. CATEGORÍA: a la izquierda un "raíl" con todas las categorías
//      (para saltar de una a otra sin volver al mapa) y a la derecha
//      las entradas como módulos con esquinas luminosas.
//
//  La categoría abierta va en la URL (ciencia.html#relatividad):
//  el botón Atrás del navegador funciona y se pueden enlazar.
// ============================================================

import { colorDe } from './colores.js';

const SVG = 'http://www.w3.org/2000/svg';
const $ = (sel, raiz = document) => raiz.querySelector(sel);

// Etiqueta e icono de cada tipo de entrada
const TIPOS = {
  nota:    { etiqueta: 'Nota',    icono: '◇' },
  enlace:  { etiqueta: 'Enlace',  icono: '↗' },
  podcast: { etiqueta: 'Podcast', icono: '◉' },
  pagina:  { etiqueta: 'Página',  icono: '→' },
  video:   { etiqueta: 'Vídeo',   icono: '▷' },
  libro:   { etiqueta: 'Libro',   icono: '▤' }
};

const escapar = (t = '') => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dosCifras = (n) => String(n).padStart(2, '0');

export async function montarArchivo(cfg) {
  document.documentElement.style.setProperty('--acento', cfg.acento);
  document.title = `${cfg.seccion} — MyImperior`;

  // Las categorías con 'fuente' (la biblioteca) se cargan antes de dibujar,
  // para que el mapa ya muestre cuántas entradas tienen.
  await Promise.all(cfg.categorias.filter((c) => c.fuente).map(async (c) => {
    try {
      const libros = await (await fetch(c.fuente)).json();
      c.entradas = libros.map((l) => ({
        tipo: 'libro', titulo: l.titulo, meta: `${l.autor} · ${l.fecha}`, texto: l.coleccion,
        color: colorDe(l.color, cfg.paleta), estado: l.leyendo ? 'Leyendo' : (l.leido ? 'Leído' : '')
      }));
    } catch (e) {
      console.warn(`archivo: no se pudo cargar ${c.fuente}`, e);
      c.entradas = [];
    }
  }));

  const raiz = $('#archivo');
  raiz.innerHTML = `
    <canvas class="fondo"></canvas>
    <a class="volver" href="${cfg.volver.url}"><span>←</span> ${escapar(cfg.volver.texto)}</a>
    <section class="mapa" aria-label="Mapa de ${escapar(cfg.seccion)}">
      <svg class="lineas" aria-hidden="true"></svg>
      <div class="centro">
        <div class="cod">${escapar(cfg.subtitulo)}</div>
        <h1>${escapar(cfg.seccion)}</h1>
      </div>
    </section>
    <section class="vista">
      <nav class="rail" aria-label="Categorías"></nav>
      <div class="contenido"></div>
    </section>`;

  const mapa = $('.mapa', raiz);
  const lineas = $('.lineas', raiz);
  const rail = $('.rail', raiz);
  const contenido = $('.contenido', raiz);
  const fondo = $('.fondo', raiz);

  // ── Nodos del mapa (HTML encima del SVG: texto nítido y clicable) ──
  const nodos = cfg.categorias.map((c, i) => {
    const b = document.createElement('button');
    b.className = 'nodo';
    b.dataset.id = c.id;
    b.innerHTML = `<span class="marca"></span>
      <span class="txt"><span class="num">${dosCifras(i + 1)}</span>
      <span class="nombre">${escapar(c.nombre)}</span>
      <span class="lema">${escapar(c.lema || '')} · ${c.entradas.length}</span></span>`;
    b.addEventListener('click', () => { location.hash = c.id; });
    b.addEventListener('pointerenter', () => lineas.querySelector(`[data-id="${c.id}"]`)?.classList.add('activa'));
    b.addEventListener('pointerleave', () => lineas.querySelector(`[data-id="${c.id}"]`)?.classList.remove('activa'));
    mapa.appendChild(b);
    return b;
  });

  // ── Raíl ──
  rail.innerHTML = `<button class="rail-mapa">◇ Mapa</button><div class="rail-lista">` + cfg.categorias.map((c, i) =>
    `<a class="rail-item" href="#${c.id}" data-id="${c.id}"><span class="punto"></span>
     <span class="num">${dosCifras(i + 1)}</span><span class="nombre">${escapar(c.nombre)}</span></a>`).join('') + `</div>`;
  $('.rail-mapa', rail).addEventListener('click', irAlMapa);

  // ── Geometría del mapa (se recalcula al cambiar el tamaño de la ventana) ──
  function dibujarMapa() {
    const w = mapa.clientWidth, h = mapa.clientHeight;
    const cx = w / 2, cy = h / 2;
    const rx = Math.max(60, Math.min(w * 0.38, w / 2 - 250, 600)), ry = Math.min(h * 0.32, 290);   // w/2-250: sitio para la etiqueta
    lineas.setAttribute('viewBox', `0 0 ${w} ${h}`);
    lineas.innerHTML = `
      <defs><filter id="brillo" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter></defs>`;
    // órbitas tenues alrededor del centro: guiño al sistema del que se viene
    [0.45, 0.75, 1.08].forEach((k) => {
      const e = document.createElementNS(SVG, 'ellipse');
      Object.entries({ cx, cy, rx: rx * k, ry: ry * k, class: 'orbita' }).forEach(([a, v]) => e.setAttribute(a, v));
      lineas.appendChild(e);
    });

    const n = cfg.categorias.length;
    cfg.categorias.forEach((c, i) => {
      // reparto en elipse, sin nodos justo arriba/abajo (ahí va el título)
      const ang = (-90 + 360 * (i + 0.5) / n) * Math.PI / 180;
      const x = cx + rx * Math.cos(ang), y = cy + ry * Math.sin(ang);
      // Trazado octilineal (solo 0°, 45° y 90°, como un plano de metro):
      // sale en vertical desde el título, sigue en diagonal y acaba en un
      // tramo horizontal de al menos COLA px, donde "cuelga" la etiqueta.
      const COLA = 70;
      const dx = x - cx, dy = y - cy, sx = Math.sign(dx), sy = Math.sign(dy);
      const diag = Math.max(0, Math.min(Math.abs(dy), Math.abs(dx) - COLA));
      const p1 = { x: cx, y: cy + sy * (Math.abs(dy) - diag) };     // fin del tramo vertical
      const codo = { x: cx + sx * diag, y };                          // fin de la diagonal
      const d = `M ${cx} ${cy} L ${p1.x} ${p1.y} L ${codo.x} ${codo.y} L ${x} ${y}`;

      const g = document.createElementNS(SVG, 'g');
      g.dataset.id = c.id;
      g.innerHTML = `
        <path class="traza" d="${d}" pathLength="100"/>
        <path class="pulso" d="${d}" pathLength="100" filter="url(#brillo)" style="animation-delay:${(-i * 1.37).toFixed(2)}s"/>
        <circle class="codo" cx="${codo.x}" cy="${codo.y}" r="2"/>`;
      lineas.appendChild(g);

      const nodo = nodos[i];
      nodo.style.left = `${x}px`;
      nodo.style.top = `${y}px`;
      nodo.classList.toggle('izq', dx < -1);   // etiqueta a la izquierda del punto
    });
  }

  // ── Fondo: estrellas tenues (una vez por tamaño de ventana) ──
  function dibujarFondo() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    fondo.width = innerWidth * dpr; fondo.height = innerHeight * dpr;
    const g = fondo.getContext('2d');
    g.scale(dpr, dpr);
    let s = 7; const azar = () => ((s = (s * 16807) % 2147483647) / 2147483647); // siempre las mismas estrellas
    for (let i = 0; i < 260; i++) {
      const a = 0.08 + azar() * 0.35;
      g.fillStyle = `rgba(245, 215, 175, ${a})`;
      g.fillRect(azar() * innerWidth, azar() * innerHeight, azar() < 0.9 ? 1 : 1.6, azar() < 0.9 ? 1 : 1.6);
    }
  }

  // ── Vista de categoría ──
  function abrirCategoria(c) {
    const i = cfg.categorias.indexOf(c);
    rail.querySelectorAll('.rail-item').forEach((a) => a.classList.toggle('activa', a.dataset.id === c.id));
    const esLibros = c.entradas.some((e) => e.tipo === 'libro');
    contenido.innerHTML = `
      <header class="cabecera">
        <div class="cod">Categoría ${dosCifras(i + 1)} / ${dosCifras(cfg.categorias.length)}</div>
        <h2>${escapar(c.nombre)}</h2>
        <p class="lema">${escapar(c.lema || '')}</p>
      </header>
      <div class="rejilla${esLibros ? ' libros' : ''}">
        ${c.entradas.map(modulo).join('') || '<p class="vacio">Todavía no hay nada aquí.</p>'}
      </div>`;
    contenido.scrollTop = 0;
  }

  function modulo(e, k) {
    const t = TIPOS[e.tipo] || TIPOS.nota;
    const externo = e.url && /^https?:/.test(e.url);
    const etiqueta = e.url ? 'a' : 'div';
    const destino = e.url ? ` href="${escapar(e.url)}"${externo ? ' target="_blank" rel="noopener"' : ''}` : '';
    return `<${etiqueta} class="modulo tipo-${e.tipo}${e.url ? ' con-enlace' : ''}"${destino} style="animation-delay:${Math.min(k * 45, 900)}ms;${e.color ? `--color:${e.color}` : ''}">
      ${e.tipo === 'libro' && !e.estado ? '' : `<div class="tipo">${e.tipo === 'libro' ? '' : `<span>${t.icono}</span>${t.etiqueta}`}${e.estado ? `<span class="estado">${escapar(e.estado)}</span>` : ''}</div>`}
      <h3>${escapar(e.titulo)}</h3>
      ${e.texto ? `<p>${escapar(e.texto)}</p>` : ''}
      ${e.meta ? `<div class="meta">${escapar(e.meta)}${externo ? ' ↗' : ''}</div>` : ''}
    </${etiqueta}>`;
  }

  // ── Navegación (la categoría abierta vive en la URL) ──
  function irAlMapa() { history.pushState('', '', location.pathname + location.search); enrutar(); }
  function enrutar() {
    const id = decodeURIComponent(location.hash.slice(1));
    const c = cfg.categorias.find((x) => x.id === id);
    document.body.classList.toggle('en-categoria', !!c);
    if (c) abrirCategoria(c);
  }
  addEventListener('hashchange', enrutar);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && location.hash) irAlMapa(); });

  let espera;
  addEventListener('resize', () => { clearTimeout(espera); espera = setTimeout(() => { dibujarMapa(); dibujarFondo(); }, 120); });
  dibujarMapa();
  dibujarFondo();
  enrutar();
  requestAnimationFrame(() => document.body.classList.add('listo'));   // entrada: las líneas se dibujan
}
