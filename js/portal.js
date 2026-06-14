import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const escena = new THREE.Scene();
const camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camara.position.set(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '-1';
renderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(renderer.domElement);

function crearTextura() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0,   'rgba(140, 155, 165, 1)');
  g.addColorStop(0.3, 'rgba(120, 135, 148, 0.6)');
  g.addColorStop(0.7, 'rgba(100, 115, 130, 0.2)');
  g.addColorStop(1,   'rgba(80, 95, 110, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

const numParticulas = 1500;
const geo = new THREE.BufferGeometry();
const pos = new Float32Array(numParticulas * 3);
const vel = new Float32Array(numParticulas);

for (let i = 0; i < numParticulas; i++) {
  pos[i * 3]     = (Math.random() - 0.5) * 80;
  pos[i * 3 + 1] = Math.random() * 12 - 4;
  pos[i * 3 + 2] = -(Math.random() * 30 + 5);
  vel[i]         = 0.015 + Math.random() * 0.02;
}

geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

const mat = new THREE.PointsMaterial({
  map: crearTextura(),
  size: 6,
  transparent: true,
  opacity: 0.18,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.NormalBlending
});

const particulas = new THREE.Points(geo, mat);
escena.add(particulas);

// Suelo animado
const grupoSuelo = new THREE.Group();
escena.add(grupoSuelo);

const loaderSuelo = new THREE.TextureLoader();
loaderSuelo.load('imagenes/suelonegro.jpg', (texturaSuelo) => {
  texturaSuelo.wrapS = THREE.RepeatWrapping;
  texturaSuelo.wrapT = THREE.RepeatWrapping;
  texturaSuelo.repeat.set(20, 20);

  const geoSuelo = new THREE.PlaneGeometry(40, 40);
  const matSuelo = new THREE.MeshBasicMaterial({
    map: texturaSuelo,
    depthWrite: false
  });
  const suelo = new THREE.Mesh(geoSuelo, matSuelo);
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.set(0, -2, -10);
  grupoSuelo.add(suelo);

  window._texturaSuelo = texturaSuelo;
});

// Barco 3D
const loaderBarco = new GLTFLoader();
let barco3D;

loaderBarco.load('3D/barco3d.glb', (gltf) => {
  barco3D = gltf.scene;
  barco3D.scale.set(2, 2, 2);
  barco3D.position.set(0, -1, -6);
  escena.add(barco3D);
});

let mouseX = 0;

document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
});

window.addEventListener('resize', () => {
  camara.aspect = window.innerWidth / window.innerHeight;
  camara.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animar() {
  requestAnimationFrame(animar);

  for (let i = 0; i < numParticulas; i++) {
    pos[i * 3 + 2] += vel[i];
    pos[i * 3]     -= mouseX * vel[i] * 0.8;

    if (pos[i * 3 + 2] > -4) {
      pos[i * 3 + 1] = Math.random() * 12 - 4;
      pos[i * 3 + 2] = -(30 + Math.random() * 5);
    }

    const dx = pos[i * 3];
    const dy = pos[i * 3 + 1];
    if (Math.sqrt(dx * dx + dy * dy) < 8 && pos[i * 3 + 2] > -8) {
      pos[i * 3 + 2] = -(30 + Math.random() * 5);
    }
  }

  geo.attributes.position.needsUpdate = true;

  if (window._texturaSuelo) {
    window._texturaSuelo.offset.y += 0.015;
  }

  if (barco3D) {
    barco3D.rotation.y += (-mouseX * 0.3 - barco3D.rotation.y) * 0.05;
  }
const ancho = window.innerWidth;
const alto = window.innerHeight;
const desplazamiento = mouseX * ancho * 0.3;
camara.setViewOffset(ancho * 2, alto, ancho * 0.5 - desplazamiento, 0, ancho, alto);
  renderer.render(escena, camara);
}

animar();