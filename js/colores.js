// ============================================================
//  js/colores.js
//  Paleta de las dos bibliotecas.
//
//  El Excel guarda una LETRA en la columna COLOR. Aqui se
//  traduce esa letra a un hexadecimal. Es la unica pieza que
//  hay que tocar para cambiar la paleta entera: los JSON no
//  llevan colores, solo codigos.
//
//  Las ocho letras son unicas entre las dos secciones a
//  proposito, para que una letra nunca signifique dos cosas.
// ============================================================

export const PALETA = {

    // Ciencia ficcion: gama calida sobre negro.
    // OJO: mostaza y caramelo comparten tono (~33 grados) y solo
    // se distinguen por saturacion. Si algun dia bajas la
    // saturacion global de las particulas, estos dos se funden
    // antes que ningun otro par. Es el punto fragil de la gama.
    ficcion: {
        M: "#E08A14",   // mostaza naranja
        T: "#B5502F",   // teja
        C: "#BE9A70",   // caramelo  (el mas luminoso de los ocho)
        V: "#C2BC1E"    // amarillo verdoso
    },

    // Ciencia: gama fria. Los cuatro se separan por tono, asi
    // que aguanta mejor los cambios de opacidad y brillo.
    ciencia: {
        A: "#2E5FA8",   // azul
        P: "#6A4C9C",   // morado
        Q: "#3FA89B",   // aguamarina
        G: "#3D9A35"    // verde
    }
};

// Color para los libros que aun no tienen letra asignada.
// Gris neutro: visible sobre negro, pero claramente "sin asignar".
export const SIN_ASIGNAR = "#5A5A5A";


// ------------------------------------------------------------
//  colorDe(codigo, seccion)
//
//  Devuelve el hexadecimal de una letra. Si la letra no existe
//  o viene vacia, devuelve el gris y avisa por consola.
//
//  Avisa en vez de fallar callando porque una errata en el
//  Excel (una 'X' suelta, una letra de la otra seccion) daria
//  un libro invisible o de color equivocado sin ninguna pista.
//
//  seccion: "ficcion" o "ciencia"
// ------------------------------------------------------------
export function colorDe(codigo, seccion) {

    const tabla = PALETA[seccion];

    if (!tabla) {
        console.warn(`colorDe: seccion desconocida "${seccion}"`);
        return SIN_ASIGNAR;
    }

    if (!codigo) return SIN_ASIGNAR;

    // El script de PowerShell ya normaliza a mayusculas, pero
    // esto cubre el caso de que algun dia se edite el JSON a mano.
    const letra = String(codigo).trim().toUpperCase();

    if (!tabla[letra]) {
        console.warn(`colorDe: codigo "${letra}" no existe en "${seccion}"`);
        return SIN_ASIGNAR;
    }

    return tabla[letra];
}


// ------------------------------------------------------------
//  codigosDe(seccion)
//
//  Devuelve las letras validas de una seccion. Util para
//  generar leyendas o filtros sin repetir la lista a mano.
// ------------------------------------------------------------
export function codigosDe(seccion) {
    return Object.keys(PALETA[seccion] || {});
}
