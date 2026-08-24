import * as THREE from 'three';
import { createStudio, slab, orbitCamera, finishClip, readClipParams } from '../studio.js';

const { width, height, count } = readClipParams();
const { renderer, scene, camera } = createStudio({
  width,
  height,
  background: 0x1c1916,
  accent: 0x2f6b4f,
});

const wood = new THREE.MeshPhysicalMaterial({
  color: 0x6b4a2e,
  metalness: 0.04,
  roughness: 0.62,
  envMapIntensity: 0.45,
});

const pastry = new THREE.MeshPhysicalMaterial({
  color: 0x8a5a2b,
  metalness: 0.02,
  roughness: 0.68,
  envMapIntensity: 0.4,
});

const cream = new THREE.MeshPhysicalMaterial({
  color: 0xe7d3a8,
  metalness: 0.0,
  roughness: 0.55,
  envMapIntensity: 0.3,
});

const fruitDark = new THREE.MeshPhysicalMaterial({
  color: 0x6b2a24,
  metalness: 0.04,
  roughness: 0.42,
  clearcoat: 0.45,
  clearcoatRoughness: 0.28,
});

const fruitMid = new THREE.MeshPhysicalMaterial({
  color: 0xb84332,
  metalness: 0.03,
  roughness: 0.38,
  clearcoat: 0.55,
  clearcoatRoughness: 0.22,
});

const glaze = new THREE.MeshPhysicalMaterial({
  color: 0xd9a05a,
  metalness: 0.05,
  roughness: 0.22,
  clearcoat: 0.8,
  clearcoatRoughness: 0.12,
  transparent: true,
  opacity: 0.92,
});

const board = slab(2.4, 1.15, 0.07, 0.06, wood, 0.004);
board.position.y = -0.28;
scene.add(board);

const crust = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.78, 0.08, 48), pastry);
crust.position.y = -0.18;
scene.add(crust);

const crimp = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.045, 10, 48), pastry);
crimp.rotation.x = Math.PI / 2;
crimp.position.y = -0.14;
scene.add(crimp);

const filling = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 40), cream);
filling.position.y = -0.12;
scene.add(filling);

function fruitRing(radius, countPts, size, material) {
  const group = new THREE.Group();
  for (let i = 0; i < countPts; i++) {
    const a = (i / countPts) * Math.PI * 2;
    const slice = new THREE.Mesh(new THREE.SphereGeometry(size, 14, 10), material);
    slice.scale.set(1.25, 0.22, 1.35);
    slice.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    group.add(slice);
  }
  scene.add(group);
  return group;
}

const outer = fruitRing(0.5, 14, 0.09, fruitDark);
const mid = fruitRing(0.3, 9, 0.085, fruitMid);
const core = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 12), glaze);
core.scale.y = 0.38;
scene.add(core);

outer.position.y = -0.08;
mid.position.y = -0.06;
core.position.y = -0.04;

finishClip((index) => {
  const t = count <= 1 ? 0 : index / (count - 1);
  const explode = Math.sin(t * Math.PI);

  crust.position.y = -0.18 - 0.06 * explode;
  crimp.position.y = -0.14 - 0.06 * explode;
  filling.position.y = -0.12 + 0.18 * explode;
  outer.position.y = -0.08 + 0.42 * explode;
  mid.position.y = -0.06 + 0.72 * explode;
  core.position.y = -0.04 + 1.02 * explode;
  board.position.y = -0.28 - 0.04 * explode;

  const elev = THREE.MathUtils.degToRad(28 + 6 * explode);
  orbitCamera(camera, {
    yaw: 0.35 + t * 0.5,
    dist: 4.15 + 0.7 * explode,
    elev,
    target: new THREE.Vector3(0, 0.05 + 0.38 * explode, 0),
  });
  renderer.render(scene, camera);
});
