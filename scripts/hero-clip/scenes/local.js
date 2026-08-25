import * as THREE from 'three';
import {
  createStudio,
  addDust,
  addFloor,
  slab,
  orbitCamera,
  finishClip,
  readClipParams,
} from '../studio.js';

const { width, height, count } = readClipParams();
const { renderer, scene, camera } = createStudio({
  width,
  height,
  background: 0x000000,
  accent: 0xd4a574,
});
addDust(scene, { color: 0xf0e0c8, opacity: 0.22, count: 2000 });
addFloor(scene, -0.82);

const stone = new THREE.MeshPhysicalMaterial({
  color: 0x1c1612,
  metalness: 0.12,
  roughness: 0.52,
  envMapIntensity: 0.55,
});

const glass = new THREE.MeshPhysicalMaterial({
  color: 0xf7f4ee,
  metalness: 0,
  roughness: 0.04,
  transmission: 1,
  thickness: 0.5,
  ior: 1.48,
  clearcoat: 1,
  clearcoatRoughness: 0.03,
  envMapIntensity: 1.7,
  attenuationColor: new THREE.Color(0xe8c9a0),
  attenuationDistance: 2.2,
});

const brass = new THREE.MeshPhysicalMaterial({
  color: 0xc4a574,
  metalness: 1,
  roughness: 0.16,
  envMapIntensity: 1.5,
});

const plate = slab(1.55, 1.55, 0.04, 0.45, stone, 0.004);
plate.position.y = -0.42;
scene.add(plate);

const dome = new THREE.Mesh(new THREE.SphereGeometry(0.62, 64, 48, 0, Math.PI * 2, 0, Math.PI * 0.52), glass);
dome.position.y = -0.08;

const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.018, 12, 64), brass);
rim.rotation.x = Math.PI / 2;
rim.position.y = -0.38;
scene.add(rim);

const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.11, 16), brass);
stem.position.y = 0.58;

const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 16), brass);
knob.position.y = 0.66;

const cloche = new THREE.Group();
cloche.add(dome, stem, knob);
scene.add(cloche);

finishClip((index) => {
  const t = count <= 1 ? 0 : index / (count - 1);
  const explode = Math.sin(t * Math.PI);

  cloche.position.y = 0.38 * explode;
  cloche.rotation.y = 0.15 * explode;
  plate.rotation.y = t * 0.12;

  orbitCamera(camera, {
    yaw: 0.35 + t * 0.5,
    dist: 3.7 + 0.45 * explode,
    elev: THREE.MathUtils.degToRad(18 + 8 * explode),
    target: new THREE.Vector3(0, 0.08 + 0.18 * explode, 0),
  });
  renderer.render(scene, camera);
});
