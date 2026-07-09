import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ─── RENDERER ────────────────────────────────────────────────────────────────
// autoClear = false: el renderer NO limpia automáticamente entre renders.
// Lo haremos a mano cada frame para poder hacer dos pasadas (suelo → barco).
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.autoClear = false;
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '0';
renderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(renderer.domElement);

// ─── CÁMARA (compartida entre las dos escenas) ────────────────────────────────
const camara = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camara.position.set(0, 0.5, 2);
camara.lookAt(0, 0.5, -6);

// ─── ENVIRONMENT MAP (compartido entre las dos escenas) ──────────────────────
// Esto es lo que hizo fallar el intento anterior: el env map se asignó solo a
// una escena. Sin él, MeshStandardMaterial aparece completamente negro.
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

// ═════════════════════════════════════════════════════════════════════════════
// ESCENA 1 — SUELO + NIEBLA
// La niebla vive aquí. Todo lo que esté en esta escena se verá afectado por ella.
// ═════════════════════════════════════════════════════════════════════════════
const escena1 = new THREE.Scene();
escena1.fog = new THREE.Fog(0x5d6568, 8, 22);

// Luz ambiental suave para que el suelo no quede en negro absoluto
const luzAmbiente1 = new THREE.AmbientLight(0xffffff, 1.5);
escena1.add(luzAmbiente1);

// Luz cálida del casco proyectada hacia el suelo.
// PointLight: emite en todas direcciones desde un punto.
// Color 0xffaa44 = naranja cálido. Intensidad 4, rango 10 unidades.
// Posición: donde está el casco del barco, ligeramente por encima del suelo.
const luzCasco = new THREE.PointLight(0xffaa44, 6, 80, 0.5);
luzCasco.position.set(0, -1.2, -7);
escena1.add(luzCasco);
// ─── FONDO 3D ────────────────────────────────────────────────────────────────
// La imagen de fondo como telón dentro de la escena: mismo sistema de
// proyección que el suelo → horizontes alineados por construcción.
const loaderFondo = new THREE.TextureLoader();
loaderFondo.load('imagenes/fondo.jpg', (texturaFondo) => {
  texturaFondo.colorSpace = THREE.SRGBColorSpace; // colores fieles al archivo

  const geoFondo = new THREE.PlaneGeometry(68, 57); // sobredimensionado a propósito
  const matFondo = new THREE.MeshBasicMaterial({
    map: texturaFondo,
    fog: false   // el fondo es lo infinitamente lejano: la niebla no lo tiñe
  });

  const fondo = new THREE.Mesh(geoFondo, matFondo);
  // Posición: lejos en Z, y la altura Y es TU PALANCA de alineación del horizonte
  fondo.position.set(0, 0, -40);
  
  escena1.add(fondo);
});
// Suelo animado (disco con desvanecido radial de opacidad)
const grupoSuelo = new THREE.Group();
escena1.add(grupoSuelo);

const loaderSuelo = new THREE.TextureLoader();
loaderSuelo.load('imagenes/suelonegro.jpg', (texturaSuelo) => {
  texturaSuelo.wrapS = THREE.RepeatWrapping;
  texturaSuelo.wrapT = THREE.RepeatWrapping;
  texturaSuelo.repeat.set(60, 60);

  // CircleGeometry(radio, segmentos): disco de radio 20, 64 segmentos.
  const geoSuelo = new THREE.CircleGeometry(60, 64);

  // ── Desvanecido radial con vertex colors (RGBA) ──
  // CircleGeometry: vértice 0 = centro, resto = perímetro.
  // Centro opaco (alfa 1), borde transparente (alfa 0).
  const numVertices = geoSuelo.attributes.position.count;
  const colores = new Float32Array(numVertices * 4); // 4 = R,G,B,A

  for (let i = 0; i < numVertices; i++) {
    colores[i * 4]     = 1; // R
    colores[i * 4 + 1] = 1; // G
    colores[i * 4 + 2] = 1; // B
    // Alfa: vértice 0 (centro) opaco; el resto (borde) transparente.
    colores[i * 4 + 3] = (i === 0) ? 1 : 0;
  }

  geoSuelo.setAttribute('color', new THREE.BufferAttribute(colores, 4));

  const matSuelo = new THREE.MeshStandardMaterial({
    map: texturaSuelo,
    depthWrite: false,
    roughness: 0.9,
    metalness: 0.1,
        vertexColors: true    // necesario para que lea los colores por vértice
  });

  const suelo = new THREE.Mesh(geoSuelo, matSuelo);
  suelo.rotation.x = -Math.PI / 2;
  grupoSuelo.add(suelo);
  grupoSuelo.position.set(0, -2, -6);

  window._texturaSuelo = texturaSuelo;
});


// ═════════════════════════════════════════════════════════════════════════════
// ESCENA 2 — BARCO (sin niebla)
// No tiene fog asignado. El barco se renderiza siempre nítido,
// independientemente de la niebla de escena1.
// ═════════════════════════════════════════════════════════════════════════════
const escena2 = new THREE.Scene();

// CRÍTICO: sin esto el GLB aparece completamente negro.
// MeshStandardMaterial necesita un environment map para calcular
// la iluminación de reflexión ambiental.
escena2.environment = envTexture;

// Luces del barco (mismas que antes, ahora en escena2)
const luzAmbiente2 = new THREE.AmbientLight(0xffffff, 2);
escena2.add(luzAmbiente2);

const luzDir1 = new THREE.DirectionalLight(0xffffff, 2.5);
luzDir1.position.set(5, 5, 5);
escena2.add(luzDir1);

const luzDir2 = new THREE.DirectionalLight(0xffffff, 2.5);
luzDir2.position.set(-5, 3, -5);
escena2.add(luzDir2);

let barco3D;
const loaderBarco = new GLTFLoader();

loaderBarco.load('3D/barco3d.glb', (gltf) => {
  barco3D = gltf.scene;
  barco3D.scale.set(2, 2, 2);
  barco3D.position.set(0, -1, -9);
  escena2.add(barco3D);
});

// ─── PARTÍCULAS DE NIEBLA (desactivadas, lógica preservada) ──────────────────
// escena1.add(particulas)
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

const numParticulas = 2500;
const geo = new THREE.BufferGeometry();
const pos = new Float32Array(numParticulas * 3);
const vel = new Float32Array(numParticulas);

for (let i = 0; i < numParticulas; i++) {
  pos[i * 3]     = (Math.random() - 0.5) * 80;
  pos[i * 3 + 1] = Math.random() * 12 - 4;
  pos[i * 3 + 2] = -(Math.random() * 30 + 5);
  vel[i]         = 0.04 + Math.random() * 0.04;
}

geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

const mat = new THREE.PointsMaterial({
  map: crearTextura(),
  size: 4,
  transparent: true,
  opacity: 0.32,
  sizeAttenuation: true,
  depthWrite: false,
  blending: THREE.NormalBlending
});

const particulas = new THREE.Points(geo, mat);
escena1.add(particulas); 

// ─── EVENTOS ─────────────────────────────────────────────────────────────────
let mouseX = 0;
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
});

window.addEventListener('resize', () => {
  camara.aspect = window.innerWidth / window.innerHeight;
  camara.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── LOOP DE ANIMACIÓN ────────────────────────────────────────────────────────
function animar() {
  requestAnimationFrame(animar);

  // Lógica de partículas (se mantiene aunque no estén en ninguna escena)
  for (let i = 0; i < numParticulas; i++) {
    pos[i * 3 + 2] += vel[i];
    pos[i * 3] += grupoSuelo.rotation.y * vel[i] * 2.5;
    if (pos[i * 3] > 40) pos[i * 3] -= 80;
    if (pos[i * 3] < -40) pos[i * 3] += 80;
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

  // Animación textura suelo
  if (window._texturaSuelo) {
    window._texturaSuelo.offset.y += 0.035;
  }

  // Rotación suelo con ratón
  grupoSuelo.rotation.y += (-mouseX * 0.4 - grupoSuelo.rotation.y) * 0.05;
  grupoSuelo.rotation.y = Math.max(-0.43, Math.min(0.43, grupoSuelo.rotation.y));

  // Rotación barco con ratón (añadido clamp que faltaba en el original)
  if (barco3D) {
    barco3D.rotation.y += (-mouseX * 0.6 - barco3D.rotation.y) * 0.05;
    barco3D.rotation.y = Math.max(-0.43, Math.min(0.43, barco3D.rotation.y));
  }

  // ── DOS PASADAS DE RENDER ─────────────────────────────────────────────────
  // 1. Limpiamos color + depth buffer manualmente (autoClear está desactivado)
  renderer.clear();

  // 2. Renderizamos el suelo con niebla.
  //    El depth buffer se rellena con la geometría del suelo.
  renderer.render(escena1, camara);

  // 3. Renderizamos el barco sin niebla, ENCIMA de lo anterior.
  //    El depth buffer de escena1 sigue activo: el barco se integra
  //    correctamente en profundidad con el suelo sin necesidad de limpiar nada.
  renderer.render(escena2, camara);
}

animar();
