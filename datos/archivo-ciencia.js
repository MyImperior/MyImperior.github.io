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
//    texto       resumen MUY corto (una línea)
//    meta        línea pequeña opcional (autor, fecha, duración…)
//    url         opcional. Si empieza por http se abre en otra pestaña
//
//  Lo marcado [ejemplo] es relleno para ver el diseño: sustitúyelo.
// ============================================================

export default {
  seccion: 'Ciencia',
  subtitulo: 'Archivo · Planeta f',
  paleta: 'ciencia',                 // nombre de la paleta en js/colores.js (para los libros)
  acento: '#c98a3e',                 // ocre de las líneas luminosas (el resto de colores, en css/archivo.css)
  volver: { texto: 'Sistema', url: 'sistema.html' },

  categorias: [
    {
      id: 'relatividad',
      nombre: 'Relatividad',
      lema: 'Espacio y tiempo',
      entradas: [
        { tipo: 'nota', titulo: 'Principio de equivalencia', texto: '[ejemplo] Caer es flotar.', meta: 'Nota' },
        { tipo: 'nota', titulo: 'Tiempo junto a un agujero negro', texto: '[ejemplo] Métrica de Schwarzschild.', meta: 'Nota' },
        { tipo: 'enlace', titulo: 'Einstein Online', texto: 'Max Planck, divulgación.', url: 'https://www.einstein-online.info/en/', meta: 'einstein-online.info' }
      ]
    },
    {
      id: 'campos',
      nombre: 'Teoría de campos',
      lema: 'Cuántica',
      entradas: [
        { tipo: 'nota', titulo: 'Qué es un campo', texto: '[ejemplo] Partículas como excitaciones.', meta: 'Nota' },
        { tipo: 'nota', titulo: 'Ruta de estudio', texto: '[ejemplo] Clásica → relatividad → cuántica → QFT.', meta: 'En curso' }
      ]
    },
    {
      id: 'coffee-break',
      nombre: 'Coffee Break',
      lema: 'Señal y Ruido',
      entradas: [
        { tipo: 'podcast', titulo: 'Coffee Break', texto: 'Tertulia científica semanal.', url: 'https://www.ivoox.com/podcast-coffee-break-senal-ruido_sq_f1172891_1.html', meta: 'iVoox' },
        { tipo: 'podcast', titulo: 'Favoritos', texto: '[ejemplo] Episodios elegidos.', meta: 'Selección' }
      ]
    },
    {
      id: 'planetario',
      nombre: 'Planetario',
      lema: 'El cielo',
      entradas: [
        { tipo: 'pagina', titulo: 'Este sistema', texto: 'Estrella K, ocho mundos.', url: 'sistema.html', meta: 'Web' },
        { tipo: 'enlace', titulo: 'Stellarium Web', texto: 'El cielo real, en el navegador.', url: 'https://stellarium-web.org/', meta: 'stellarium-web.org' }
      ]
    },
    {
      id: 'biblioteca',
      nombre: 'Biblioteca',
      lema: 'Libros',
      fuente: '../datos/ciencia.json'   // se genera desde LIBRARY.xlsx con actualizar.ps1
    },
    {
      id: 'redes',
      nombre: 'Redes',
      lema: 'Contacto',
      entradas: [
        { tipo: 'enlace', titulo: '[ejemplo] Perfiles', texto: 'Pendiente.', meta: '—' },
        { tipo: 'enlace', titulo: 'GitHub', texto: 'El código de esta web.', url: 'https://github.com/MyImperior', meta: 'github.com/MyImperior' }
      ]
    }
  ]
};
