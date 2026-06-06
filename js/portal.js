import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const escena = new THREE.Scene();
escena.background = new THREE.Color(0x080810);

const camara = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camara.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '-1';
document.body.appendChild(renderer.domElement);

// Partículas de niebla
const numParticulas = 2000;
const geometria = new THREE.BufferGeometry();
const posiciones = new Float32Array(numParticulas * 3);

for (let i = 0; i < numParticulas * 3; i++) {
  posiciones[i] = (Math.random() - 0.5) * 20;
}

geometria.setAttribute('position', new THREE.BufferAttribute(posiciones, 3));

const material = new THREE.PointsMaterial({
  color: 0x8899aa,
  size: 0.05,
  transparent: true,
  opacity: 0.6
});

const particulas = new THREE.Points(geometria, material);
escena.add(particulas);

// Animación
function animar() {
  requestAnimationFrame(animar);
  particulas.position.z += 0.01;
  if (particulas.position.z > 5) particulas.position.z = 0;
  renderer.render(escena, camara);
}

animar();
