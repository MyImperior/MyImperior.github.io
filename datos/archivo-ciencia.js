// ============================================================
//  datos/archivo-ciencia.js
//  CONTENIDO de la sección Ciencia. Es el ÚNICO archivo que hay
//  que tocar para añadir, quitar o cambiar cosas: la página
//  (secciones/ciencia.html), el aspecto (css/archivo.css) y el
//  motor (js/archivo.js) son comunes a todas las secciones.
//
//  ¿Por qué un .js y no un .json? Porque aquí escribirás texto:
//  el JSON no admite comentarios ni textos en varias líneas, y
//  cualquier comilla mal cerrada rompe la página sin avisar.
//
//  CATEGORÍA
//    id          corto, sin espacios ni tildes (va en la URL: ciencia.html#relatividad)
//    nombre      lo que se ve en el mapa
//    lema        una línea bajo el nombre
//    entradas    lista de entradas (ver abajo)
//    fuente      alternativa a 'entradas': un JSON de la biblioteca
//
//  ENTRADA
//    tipo        nota · enlace · podcast · pagina · video   (cambia la etiqueta y el icono)
//    titulo
//    texto       resumen corto (2–3 líneas)
//    meta        línea pequeña opcional (autor, fecha, duración…)
//    url         opcional. Si empieza por http se abre en otra pestaña
//
//  Lo marcado [ejemplo] es relleno para ver el diseño: sustitúyelo.
// ============================================================

export default {
  seccion: 'Ciencia',
  subtitulo: 'Archivo · Planeta f',
  paleta: 'ciencia',                 // nombre de la paleta en js/colores.js (para los libros)
  acento: '#6fd3c6',                 // color de las líneas luminosas
  volver: { texto: 'Volver al sistema', url: 'sistema.html' },

  categorias: [
    {
      id: 'relatividad',
      nombre: 'Relatividad',
      lema: 'Espacio, tiempo y gravedad',
      entradas: [
        { tipo: 'nota', titulo: 'El principio de equivalencia', texto: '[ejemplo] Por qué caer libremente es indistinguible de flotar, y cómo eso obliga a curvar el espacio-tiempo.', meta: 'Nota propia' },
        { tipo: 'nota', titulo: 'Dilatación temporal en un agujero negro', texto: '[ejemplo] Cálculo paso a paso con la métrica de Schwarzschild.', meta: 'Nota propia' },
        { tipo: 'enlace', titulo: 'Einstein Online', texto: 'Explicaciones divulgativas del Instituto Max Planck de Física Gravitacional.', url: 'https://www.einstein-online.info/en/', meta: 'einstein-online.info' }
      ]
    },
    {
      id: 'campos',
      nombre: 'Teoría de campos',
      lema: 'Cuántica y partículas',
      entradas: [
        { tipo: 'nota', titulo: 'Qué es un campo', texto: '[ejemplo] Del campo clásico al cuántico: las partículas como excitaciones.', meta: 'Nota propia' },
        { tipo: 'nota', titulo: 'Mi ruta de estudio', texto: '[ejemplo] Mecánica clásica → relatividad → cuántica → teoría cuántica de campos.', meta: 'En curso' }
      ]
    },
    {
      id: 'coffee-break',
      nombre: 'Coffee Break',
      lema: 'Señal y Ruido',
      entradas: [
        { tipo: 'podcast', titulo: 'Coffee Break: Señal y Ruido', texto: 'La tertulia semanal de actualidad científica.', url: 'https://www.ivoox.com/podcast-coffee-break-senal-ruido_sq_f1172891_1.html', meta: 'iVoox' },
        { tipo: 'podcast', titulo: 'Episodios favoritos', texto: '[ejemplo] Una selección de episodios con una línea sobre por qué merecen la pena.', meta: 'Selección propia' }
      ]
    },
    {
      id: 'planetario',
      nombre: 'Planetario',
      lema: 'Mirar el cielo',
      entradas: [
        { tipo: 'pagina', titulo: 'Este sistema', texto: 'La estrella K y sus ocho mundos, con los datos de cada uno.', url: 'sistema.html', meta: 'Dentro de la web' },
        { tipo: 'enlace', titulo: 'Stellarium Web', texto: 'Planetario en el navegador: el cielo real desde cualquier lugar y fecha.', url: 'https://stellarium-web.org/', meta: 'stellarium-web.org' }
      ]
    },
    {
      id: 'biblioteca',
      nombre: 'Biblioteca',
      lema: 'Libros de ciencia',
      fuente: '../datos/ciencia.json'   // se genera desde LIBRARY.xlsx con actualizar.ps1
    },
    {
      id: 'redes',
      nombre: 'Redes',
      lema: 'Dónde encontrarme',
      entradas: [
        { tipo: 'enlace', titulo: '[ejemplo] Mastodon / Bluesky / X', texto: 'Pon aquí tus perfiles.', meta: 'Pendiente' },
        { tipo: 'enlace', titulo: 'GitHub', texto: 'El código de esta web.', url: 'https://github.com/MyImperior', meta: 'github.com/MyImperior' }
      ]
    }
  ]
};
