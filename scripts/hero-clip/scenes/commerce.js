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
  accent: 0xc45c26,
});
addDust(scene, { color: 0xe8d3c0, opacity: 0.18 });
addFloor(scene, -0.62);

const brass = new THREE.MeshPhysicalMaterial({
  color: 0xb08a4a,
  metalness: 1,
  roughness: 0.22,
  envMapIntensity: 1.55,
});

const brassBright = new THREE.MeshPhysicalMaterial({
  color: 0xd7b56a,
  metalness: 1,
  roughness: 0.12,
  envMapIntensity: 1.7,
});

const nylon = new THREE.MeshPhysicalMaterial({
  color: 0x1c1918,
  metalness: 0.04,
  roughness: 0.82,
  sheen: 0.7,
  sheenColor: new THREE.Color(0x6a5850),
  sheenRoughness: 0.55,
  envMapIntensity: 0.35,
});

const strap = slab(0.42, 2.4, 0.038, 0.05, nylon, 0.006);
strap.position.y = -0.02;
scene.add(strap);

const stitch = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.048, 2.35), brass);
stitch.position.set(-0.18, 0.0, 0);
strap.add(stitch);
const stitchR = stitch.clone();
stitchR.position.x = 0.18;
strap.add(stitchR);

const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.038, 16, 48, Math.PI * 1.35), brass);
ring.rotation.x = Math.PI / 2;
ring.rotation.z = -0.4;
ring.position.set(0, 0.02, 0.82);
scene.add(ring);

const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.38, 24), brassBright);
bar.rotation.z = Math.PI / 2;
bar.position.set(0, 0.02, 0.58);
scene.add(bar);

const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 20), brassBright);
rivet.position.set(-0.12, 0.03, 0.22);
scene.add(rivet);
const rivetR = rivet.clone();
rivetR.position.x = 0.12;
scene.add(rivetR);

finishClip((index) => {
  const t = count <= 1 ? 0 : index / (count - 1);
  const explode = Math.sin(t * Math.PI);

  ring.position.z = 0.82 + 0.55 * explode;
  ring.rotation.y = 0.35 * explode;
  bar.position.z = 0.58 + 0.22 * explode;
  strap.position.z = -0.18 * explode;

  orbitCamera(camera, {
    yaw: 0.55 + t * 0.4,
    dist: 2.85 + 0.35 * explode,
    elev: THREE.MathUtils.degToRad(18 + 5 * explode),
    target: new THREE.Vector3(0, 0.02, 0.35 + 0.2 * explode),
  });
  renderer.render(scene, camera);
});
