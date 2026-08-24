import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

export function readClipParams() {
  const params = new URLSearchParams(location.search);
  return {
    width: Number(params.get('w') || 1600),
    height: Number(params.get('h') || 900),
    count: Number(params.get('count') || 120),
  };
}

export function createStudio({ width, height, background, accent = 0x889988 }) {
  RectAreaLightUniformsLib.init();

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);

  function studioEnvironment() {
    const env = new THREE.Scene();
    env.background = new THREE.Color(background);
    const addCard = (w, h, color, pos, target) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color }),
      );
      mesh.position.copy(pos);
      mesh.lookAt(target);
      env.add(mesh);
    };
    addCard(14, 6, 0xf4efe6, new THREE.Vector3(-1.5, 7.2, 5.5), new THREE.Vector3(0, 0, 0));
    addCard(5, 9, 0xffffff, new THREE.Vector3(7.5, 2.2, 3.2), new THREE.Vector3(0, 0.2, 0));
    addCard(8, 4, 0xd9e2dc, new THREE.Vector3(-6.5, 3.4, -2.4), new THREE.Vector3(0, 0, 0));
    addCard(10, 3, 0x2a2c28, new THREE.Vector3(0, -4.5, 2), new THREE.Vector3(0, 0, 0));
    return env;
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.05).texture;
  scene.environmentIntensity = 1.05;

  const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 40);

  const key = new THREE.RectAreaLight(0xfff3e8, 11, 7, 2.6);
  key.position.set(3.4, 3.6, 4.4);
  key.lookAt(0, 0.1, 0);
  scene.add(key);

  const fill = new THREE.RectAreaLight(0xeef1f4, 2.8, 4.5, 3);
  fill.position.set(-3.8, 2.2, 1.6);
  fill.lookAt(0, 0, 0);
  scene.add(fill);

  const rim = new THREE.RectAreaLight(0xdbe6df, 1.8, 3, 1.4);
  rim.position.set(-3.6, 1.6, -3.8);
  rim.lookAt(0, 0, 0);
  scene.add(rim);

  const kicker = new THREE.RectAreaLight(accent, 1.4, 1.4, 0.7);
  kicker.position.set(-2.2, 0.8, -2.6);
  kicker.lookAt(0, 0.2, 0);
  scene.add(kicker);

  scene.add(new THREE.HemisphereLight(0xcfc8be, background, 0.22));

  return { renderer, scene, camera };
}

export function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

export function slab(w, d, thick, r, material, bevel = 0.0025) {
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, d, r), {
    depth: thick,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 28,
  });
  geo.rotateX(-Math.PI / 2);
  geo.center();
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, material);
}

export function orbitCamera(camera, { yaw, dist, elev, target }) {
  camera.position.set(
    Math.sin(yaw) * dist * Math.cos(elev),
    dist * Math.sin(elev),
    Math.cos(yaw) * dist * Math.cos(elev),
  );
  camera.lookAt(target);
}

export function finishClip(renderFrame) {
  window.renderFrame = renderFrame;
  window.renderFrame(0);
  document.documentElement.dataset.ready = '1';
}
