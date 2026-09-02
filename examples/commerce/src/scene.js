/**
 * Halo studio hero. Textured stone stays put.
 * Two rings of light lift off the body and seat on reverse.
 * Not Harbor orbit. Not a particle halo.
 */

import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const BG = 0x0c0d10;
const RING = 0xe4c56a;
const DEFAULT_MODEL = new URL('../models/pillar.glb', import.meta.url).href;
const FALLBACK_STILL = new URL('../images/pillar-hero.jpg', import.meta.url).href;

function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(BG);
  const addCard = (w, h, color, pos, target) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color }),
    );
    mesh.position.copy(pos);
    mesh.lookAt(target);
    env.add(mesh);
  };
  addCard(10, 8, 0xfff4d6, new THREE.Vector3(0.4, 8.2, 3.4), new THREE.Vector3(0, 0.4, 0));
  addCard(4, 6, 0x6a7080, new THREE.Vector3(-6.2, 2.2, 1.2), new THREE.Vector3(0, 0.2, 0));
  addCard(5, 2.4, 0x1a1c22, new THREE.Vector3(5.4, -1.2, -2.4), new THREE.Vector3(0, 0.2, 0));
  return env;
}

function makeRadialTex(inner, mid, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, inner);
  grd.addColorStop(0.32, mid);
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeShaftTex() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 512;
  const g = c.getContext('2d');
  for (let y = 0; y < 512; y += 1) {
    const v = y / 511;
    const fall = Math.sin(Math.min(1, v / 0.18) * Math.PI * 0.5) * (1 - v) ** 1.15;
    for (let x = 0; x < 128; x += 1) {
      const u = Math.abs(x / 127 - 0.5) * 2;
      const edge = Math.max(0, 1 - u ** 1.6);
      const a = fall * edge;
      g.fillStyle = `rgba(255, 236, 186, ${a.toFixed(3)})`;
      g.fillRect(x, y, 1, 1);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function fitOnPlate(root, targetSize = 1.02) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  root.scale.setScalar(targetSize / maxDim);
  root.updateMatrixWorld(true);
  box.setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;
  return box.setFromObject(root);
}

function makeHaloRing(radius, glowTex) {
  const group = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.018, 20, 160),
    new THREE.MeshBasicMaterial({ color: RING, toneMapped: false }),
  );
  core.rotation.x = Math.PI / 2;

  const shell = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.062, 16, 96),
    new THREE.MeshBasicMaterial({
      color: RING,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  shell.rotation.x = Math.PI / 2;

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color: RING,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  sprite.scale.set(radius * 3.4, radius * 3.4, 1);

  group.add(shell, core, sprite);
  group.userData = { core, shell, sprite, radius };
  group.frustumCulled = false;
  return group;
}

async function loadStone(modelUrl, onProgress) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  try {
    const gltf = await loader.loadAsync(modelUrl, (event) => {
      if (!event.total) return;
      onProgress(0.3 + 0.45 * (event.loaded / event.total));
    });
    const root = gltf.scene;
    root.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const source = Array.isArray(obj.material) ? obj.material : [obj.material];
      const next = source.map((mat) => {
        const m = mat.clone();
        m.envMapIntensity = 0.7;
        m.needsUpdate = true;
        return m;
      });
      obj.material = Array.isArray(obj.material) ? next : next[0];
    });
    return root;
  } catch {
    const texture = await new THREE.TextureLoader().loadAsync(FALLBACK_STILL);
    texture.colorSpace = THREE.SRGBColorSpace;
    const img = texture.image;
    const aspect = (img?.width || 972) / (img?.height || 1661);
    const height = 1.72;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(height * aspect, height),
      new THREE.MeshBasicMaterial({
        map: texture,
        fog: false,
        toneMapped: false,
      }),
    );
    const group = new THREE.Group();
    group.userData.billboard = true;
    group.add(mesh);
    mesh.position.y = height / 2;
    return group;
  }
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ maxDpr?: number, modelUrl?: string, onProgress?: (n: number) => void }} [opts]
 */
export async function createHaloScene(canvas, opts = {}) {
  RectAreaLightUniformsLib.init();

  const maxDpr = opts.maxDpr ?? 2;
  const modelUrl = opts.modelUrl ?? DEFAULT_MODEL;
  const onProgress = opts.onProgress ?? (() => {});

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(BG, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.028);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.08).texture;
  scene.environmentIntensity = 0.95;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);

  const beam = new THREE.RectAreaLight(0xfff1c2, 34, 0.85, 7.2);
  beam.position.set(0.22, 5.8, 0.4);
  beam.lookAt(0.55, 0.7, 0);
  scene.add(beam);

  const key = new THREE.RectAreaLight(0xffe7a8, 14, 3.2, 1.6);
  key.position.set(2.4, 3.6, 3.4);
  key.lookAt(0.5, 0.55, 0);
  scene.add(key);

  const fill = new THREE.RectAreaLight(0x8a92a0, 1.4, 3.2, 2.4);
  fill.position.set(-3.4, 1.6, 2.0);
  fill.lookAt(0.4, 0.45, 0);
  scene.add(fill);

  const bounce = new THREE.RectAreaLight(0xfff1c2, 5.5, 2.4, 2.4);
  bounce.position.set(0.55, -0.2, 1.6);
  bounce.lookAt(0.55, 0.4, 0);
  scene.add(bounce);

  scene.add(new THREE.HemisphereLight(0xc9c4b8, BG, 0.2));

  const glowTex = makeRadialTex(
    'rgba(255,244,210,1)',
    'rgba(228,197,106,0.42)',
    'rgba(228,197,106,0)',
  );
  const shaftTex = makeShaftTex();

  onProgress(0.28);

  const stone = await loadStone(modelUrl, onProgress);
  const fitted = fitOnPlate(stone, 1.02);
  const stoneHome = {
    x: 0.62,
    y: stone.position.y + 0.04,
    z: 0,
  };
  stone.position.set(stoneHome.x, stoneHome.y, stoneHome.z);
  if (!stone.userData.billboard) stone.rotation.y = -0.22;
  scene.add(stone);

  const size = fitted.getSize(new THREE.Vector3());
  const midY = stoneHome.y + size.y * 0.54;
  const topY = stoneHome.y + size.y * 0.62;
  const waist = Math.max(size.x, size.z) * 0.78;

  const shaft = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 4.8),
    new THREE.MeshBasicMaterial({
      map: shaftTex,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    }),
  );
  shaft.position.set(stoneHome.x, stoneHome.y + 1.55, -0.2);
  scene.add(shaft);

  const ringLow = makeHaloRing(waist * 1.08, glowTex);
  const ringHigh = makeHaloRing(waist * 1.28, glowTex);

  const rings = new THREE.Group();
  rings.add(ringLow, ringHigh);
  scene.add(rings);

  const lowGlow = new THREE.PointLight(RING, 2.4, 3.4);
  ringLow.add(lowGlow);
  const highGlow = new THREE.PointLight(RING, 2.6, 3.8);
  ringHigh.add(highGlow);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.28, 0.55, 0.86);
  composer.addPass(bloom);

  const lookTarget = new THREE.Vector3(stoneHome.x - 0.06, midY, 0);
  let scrollProgress = 0;
  let rafId = 0;
  let layout = { mobile: false };

  onProgress(0.9);

  function layoutLock() {
    const mobile = window.innerWidth < 768;
    layout.mobile = mobile;
    const x = mobile ? 0.06 : stoneHome.x;
    stone.position.set(x, stoneHome.y - (mobile ? 0.06 : 0), 0);
    shaft.position.x = x;
    bloom.strength = mobile ? 0.2 : 0.28;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    layoutLock();
  }

  function applyRings(t) {
    const lift = Math.max(0, (t - 0.1) / 0.9);
    const e = lift * lift * (3 - 2 * lift);
    const xShift = layout.mobile ? 0.06 : stone.position.x;

    ringLow.position.set(xShift, midY + e * 0.78, 0.06);
    ringLow.scale.setScalar(1 + e * 1.15);
    ringLow.userData.shell.material.opacity = 0.26 + e * 0.22;
    ringLow.userData.sprite.material.opacity = 0.62 + e * 0.28;

    ringHigh.position.set(xShift, topY + e * 1.02, 0.02);
    ringHigh.scale.setScalar(1 + e * 1.45);
    ringHigh.rotation.z = e * 0.42;
    ringHigh.rotation.x = e * 0.12;
    ringHigh.userData.shell.material.opacity = 0.28 + e * 0.24;
    ringHigh.userData.sprite.material.opacity = 0.68 + e * 0.26;

    shaft.material.opacity = 0.3 + e * 0.16;
  }

  function drawFrame() {
    const t = Math.min(1, Math.max(0, scrollProgress));
    applyRings(t);

    const targetX = layout.mobile ? 0.02 : stoneHome.x - 0.1;
    lookTarget.set(targetX, midY + t * 0.1, 0);

    const dist = layout.mobile ? 3.7 : 3.35;
    const elev = THREE.MathUtils.degToRad(6 + t * 3);
    camera.position.set(
      Math.sin(-0.38) * dist * Math.cos(elev),
      dist * Math.sin(elev) + 0.22,
      Math.cos(-0.38) * dist * Math.cos(elev),
    );
    camera.lookAt(lookTarget);
    shaft.quaternion.copy(camera.quaternion);

    composer.render();
  }

  function render(progress) {
    scrollProgress = progress;
    drawFrame();
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    drawFrame();
  }
  loop();

  function dispose() {
    cancelAnimationFrame(rafId);
    composer.dispose();
    renderer.dispose();
    pmrem.dispose();
    glowTex.dispose();
    shaftTex.dispose();
  }

  onProgress(1);
  return { resize, render, dispose };
}
