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
  accent: 0x6ea0ff,
});
addDust(scene, { color: 0xc9d6ee, opacity: 0.22 });
addFloor(scene, -0.88);

const glass = new THREE.MeshPhysicalMaterial({
  color: 0xf4f7fb,
  metalness: 0,
  roughness: 0.035,
  transmission: 1,
  thickness: 0.55,
  ior: 1.5,
  clearcoat: 1,
  clearcoatRoughness: 0.02,
  envMapIntensity: 1.85,
  attenuationColor: new THREE.Color(0x6ea8ff),
  attenuationDistance: 1.15,
});

const gold = new THREE.MeshPhysicalMaterial({
  color: 0xc4a574,
  metalness: 1,
  roughness: 0.18,
  envMapIntensity: 1.4,
});

const plates = [0, 1, 2].map((i) => {
  const group = new THREE.Group();
  const plate = slab(1.62, 1.62, 0.038, 0.035, glass, 0.003);
  const rim = slab(1.66, 1.66, 0.006, 0.04, gold, 0.001);
  rim.position.y = -0.024;
  group.add(plate, rim);
  group.userData.restY = i * 0.055;
  group.userData.restYaw = i * 0.045;
  group.position.y = group.userData.restY;
  group.rotation.y = group.userData.restYaw;
  scene.add(group);
  return group;
});

finishClip((index) => {
  const t = count <= 1 ? 0 : index / (count - 1);
  const explode = Math.sin(t * Math.PI);

  plates.forEach((plate, i) => {
    plate.position.y = plate.userData.restY + i * 0.28 * explode;
    plate.rotation.y = plate.userData.restYaw + (i - 1) * 0.12 * explode;
    plate.rotation.x = -0.08 * explode;
  });

  orbitCamera(camera, {
    yaw: 0.42 + t * 0.38,
    dist: 4.35 + 0.55 * explode,
    elev: THREE.MathUtils.degToRad(22 + 6 * explode),
    target: new THREE.Vector3(0, 0.12 + 0.22 * explode, 0),
  });
  renderer.render(scene, camera);
});
