import * as THREE from 'three';
import { createStudio, slab, roundedRect, orbitCamera, finishClip, readClipParams } from '../studio.js';

const { width, height, count } = readClipParams();
const { renderer, scene, camera } = createStudio({
  width,
  height,
  background: 0x1a1718,
  accent: 0xc45c26,
});

const nylon = new THREE.MeshPhysicalMaterial({
  color: 0x2c292a,
  metalness: 0.03,
  roughness: 0.78,
  sheen: 0.55,
  sheenColor: new THREE.Color(0x6a615c),
  sheenRoughness: 0.6,
  envMapIntensity: 0.45,
});

const rust = new THREE.MeshPhysicalMaterial({
  color: 0xc45c26,
  metalness: 0.82,
  roughness: 0.3,
  envMapIntensity: 1.15,
});

const leather = new THREE.MeshPhysicalMaterial({
  color: 0x5a3828,
  metalness: 0.06,
  roughness: 0.52,
  envMapIntensity: 0.45,
});

const rubber = new THREE.MeshPhysicalMaterial({
  color: 0x121011,
  metalness: 0.1,
  roughness: 0.86,
});

const sleeveMat = new THREE.MeshPhysicalMaterial({
  color: 0x3f3a36,
  metalness: 0.05,
  roughness: 0.42,
});

function duffel() {
  const geo = new THREE.ExtrudeGeometry(roundedRect(2.35, 0.98, 0.4), {
    depth: 0.52,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 4,
    curveSegments: 28,
  });
  geo.rotateX(-Math.PI / 2);
  geo.center();
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, nylon);
}

const bag = new THREE.Group();
scene.add(bag);

const shell = duffel();
bag.add(shell);

const zipper = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 1.55, 6, 14), rust);
zipper.rotation.z = Math.PI / 2;
zipper.position.set(0, 0.3, 0);
shell.add(zipper);

const pull = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.11, 10), rust);
pull.rotation.x = Math.PI / 2;
pull.position.set(0.55, 0.32, 0.06);
shell.add(pull);

function handle(x) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x, 0.06, -0.22),
    new THREE.Vector3(x, 0.48, -0.1),
    new THREE.Vector3(x, 0.48, 0.2),
    new THREE.Vector3(x, 0.06, 0.32),
  ]);
  shell.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 28, 0.032, 10, false), leather));
}
handle(-0.34);
handle(0.34);

const endCap = new THREE.Mesh(new THREE.CircleGeometry(0.38, 28), nylon);
endCap.position.set(-1.22, 0.0, 0);
endCap.rotation.y = Math.PI / 2;
shell.add(endCap);
const endCapR = endCap.clone();
endCapR.position.x = 1.22;
endCapR.rotation.y = -Math.PI / 2;
shell.add(endCapR);

const sleeve = slab(1.55, 0.95, 0.04, 0.03, sleeveMat, 0.003);
scene.add(sleeve);

const plate = slab(1.7, 0.7, 0.05, 0.05, rubber, 0.003);
scene.add(plate);

finishClip((index) => {
  const t = count <= 1 ? 0 : index / (count - 1);
  const explode = Math.sin(t * Math.PI);

  bag.position.set(0, 0.04 + 0.16 * explode, 0);
  bag.rotation.y = -0.12 + 0.1 * explode;
  sleeve.position.set(0.15 + 1.15 * explode, 0.04, 0.28 + 0.12 * explode);
  sleeve.rotation.y = -0.35 + 0.2 * explode;
  plate.position.set(0, -0.44 - 0.34 * explode, 0);

  orbitCamera(camera, {
    yaw: 0.38 + t * 0.2,
    dist: 5.1 + 0.55 * explode,
    elev: THREE.MathUtils.degToRad(16 + 5 * explode),
    target: new THREE.Vector3(0.12 * explode, 0.04, 0),
  });
  renderer.render(scene, camera);
});
