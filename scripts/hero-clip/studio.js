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

export function createStudio({ width, height, background = 0x000000, accent = 0xa8b4c0 }) {
  RectAreaLightUniformsLib.init();

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  scene.fog = new THREE.FogExp2(background, 0.045);

  function studioEnvironment() {
    const env = new THREE.Scene();
    env.background = new THREE.Color(0x050505);
    const addCard = (w, h, color, pos, target) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color }),
      );
      mesh.position.copy(pos);
      mesh.lookAt(target);
      env.add(mesh);
    };
    addCard(16, 7, 0xf7f2ea, new THREE.Vector3(-0.8, 8.2, 6.2), new THREE.Vector3(0, 0, 0));
    addCard(3.5, 10, 0xffffff, new THREE.Vector3(8.2, 2.4, 2.4), new THREE.Vector3(0, 0.2, 0));
    addCard(6, 3, 0x1a1c20, new THREE.Vector3(-7, 1.8, -3), new THREE.Vector3(0, 0, 0));
    return env;
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.08).texture;
  scene.environmentIntensity = 1.15;

  const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 40);

  const key = new THREE.RectAreaLight(0xfff6ea, 16, 5.5, 1.8);
  key.position.set(3.8, 4.2, 3.6);
  key.lookAt(0, 0.1, 0);
  scene.add(key);

  const fill = new THREE.RectAreaLight(0xcfd6e0, 1.1, 4, 3);
  fill.position.set(-4.2, 1.6, 1.2);
  fill.lookAt(0, 0, 0);
  scene.add(fill);

  const rim = new THREE.RectAreaLight(accent, 3.2, 2.4, 0.8);
  rim.position.set(-2.8, 1.4, -3.4);
  rim.lookAt(0, 0.15, 0);
  scene.add(rim);

  scene.add(new THREE.HemisphereLight(0x8a9098, background, 0.08));

  return { renderer, scene, camera };
}

export function addDust(scene, { count = 2200, color = 0xe8e4dc, spread = 9, opacity = 0.28 } = {}) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = Math.random() * spread * 0.55 - 0.4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const field = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color,
      size: 0.011,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(field);
  return field;
}

export function addFloor(scene, y = -0.92) {
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(7, 72),
    new THREE.MeshPhysicalMaterial({
      color: 0x070707,
      metalness: 0.92,
      roughness: 0.16,
      envMapIntensity: 0.7,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = y;
  scene.add(floor);
  return floor;
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
