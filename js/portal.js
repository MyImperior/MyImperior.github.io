// Importamos Three.js desde CDN
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Los tres elementos fundamentales
const escena = new THREE.Scene();

const camara = new THREE.PerspectiveCamera(
  75,                                    // campo de visión en grados
  window.innerWidth / window.innerHeight, // proporción pantalla
  0.1,                                   // distancia mínima de renderizado
  1000                                   // distancia máxima de renderizado
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Posición inicial de la cámara
camara.position.z = 5;

// Bucle de animación — se ejecuta ~60 veces por segundo
function animar() {
  requestAnimationFrame(animar);
  renderer.render(escena, camara);
}

animar();
