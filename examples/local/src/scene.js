/**
 * Harbor Oven live WebGL hero — Meshy/Higgsfield loaf GLB under a glass cloche.
 * Camera orbit and cloche lift are driven by scroll progress (0–1).
 */

import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const BG = 0x100e0c;
const DEFAULT_MODEL = new URL('../models/loaf.glb', import.meta.url).href;

/** Soft flour motes around the loaf — warm bakery dust, not a particle landscape. */
function createFlourField(THREE, origin) {
  const count = 980;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.22 + Math.random() * 1.55;
    const y = (Math.random() - 0.35) * 1.7;
    positions[i * 3] = origin.x + Math.cos(a) * r * 0.95;
    positions[i * 3 + 1] = origin.y + 0.2 + y;
    positions[i * 3 + 2] = origin.z + Math.sin(a) * r * 0.75;
    seeds[i] = Math.random() * Math.PI * 2;
    sizes[i] = 0.018 + Math.random() * 0.048;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xfff8ee) },
      uColorWarm: { value: new THREE.Color(0xf0d9b4) },
      uOpacity: { value: 0.92 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: `
      attribute float aSeed;
      attribute float aSize;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vAlpha;
      varying float vMix;
      void main() {
        float t = uTime * (0.32 + aSeed * 0.28) + aSeed * 6.2831;
        vec3 p = position;
        p.x += sin(t + aSeed) * 0.07;
        p.y += cos(t * 0.9 + aSeed * 2.1) * 0.11 + sin(uTime * 0.22 + aSeed) * 0.035;
        p.z += cos(t * 0.75) * 0.06;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float dist = length(mv.xyz);
        vAlpha = smoothstep(5.8, 1.0, dist) * (0.45 + 0.55 * fract(aSeed * 7.13));
        vMix = fract(aSeed * 3.17);
        gl_PointSize = aSize * uPixelRatio * (280.0 / max(0.7, -mv.z));
        gl_PointSize = clamp(gl_PointSize, 2.0, 22.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uColorWarm;
      uniform float uOpacity;
      varying float vAlpha;
      varying float vMix;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.06, d);
        vec3 col = mix(uColor, uColorWarm, vMix);
        gl_FragColor = vec4(col, soft * vAlpha * uOpacity);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, material };
}

function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x080706);
  const addCard = (w, h, color, pos, target) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color }),
    );
    mesh.position.copy(pos);
    mesh.lookAt(target);
    env.add(mesh);
  };
  addCard(14, 6, 0xfff4e8, new THREE.Vector3(-0.6, 7.4, 5.8), new THREE.Vector3(0, 0, 0));
  addCard(3.2, 9, 0xffffff, new THREE.Vector3(7.6, 2.2, 2.2), new THREE.Vector3(0, 0.15, 0));
  addCard(5, 2.6, 0xc45c3a, new THREE.Vector3(-6.4, 1.4, -2.8), new THREE.Vector3(0, 0.1, 0));
  return env;
}

function orbitCamera(camera, { yaw, dist, elev, target }) {
  camera.position.set(
    Math.sin(yaw) * dist * Math.cos(elev),
    dist * Math.sin(elev),
    Math.cos(yaw) * dist * Math.cos(elev),
  );
  camera.lookAt(target);
}

/** Scale + seat a GLB so it sits on y=0 with longest axis ≈ targetSize. */
function fitOnPlate(root, targetSize = 0.92) {
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
  return root;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ maxDpr?: number, modelUrl?: string, onProgress?: (n: number) => void }} [opts]
 */
export async function createHarborScene(canvas, opts = {}) {
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
  renderer.toneMappingExposure = 1.22;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(BG, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.055);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.06).texture;
  scene.environmentIntensity = 1.2;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);

  const key = new THREE.RectAreaLight(0xfff3e4, 18, 5.2, 1.7);
  key.position.set(3.6, 4.0, 3.4);
  key.lookAt(0, 0.2, 0);
  scene.add(key);

  const fill = new THREE.RectAreaLight(0xd8cfc4, 1.35, 3.8, 2.8);
  fill.position.set(-4.0, 1.5, 1.4);
  fill.lookAt(0, 0.15, 0);
  scene.add(fill);

  const accent = new THREE.RectAreaLight(0xc45c3a, 2.4, 2.2, 0.7);
  accent.position.set(-2.6, 1.3, -3.2);
  accent.lookAt(0, 0.2, 0);
  scene.add(accent);

  scene.add(new THREE.HemisphereLight(0xb8a898, BG, 0.18));

  // Kill the baked contact-shadow halo under the loaf
  const bounce = new THREE.RectAreaLight(0xfff6ea, 6.5, 3.2, 3.2);
  bounce.position.set(0.2, -0.35, 1.4);
  bounce.lookAt(0.1, 0.35, 0);
  scene.add(bounce);

  onProgress(0.35);

  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(modelUrl, (event) => {
    if (!event.total) return;
    onProgress(0.35 + 0.45 * (event.loaded / event.total));
  });

  const loaf = gltf.scene;
  loaf.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    obj.castShadow = false;
    obj.receiveShadow = false;
    const source = Array.isArray(obj.material) ? obj.material : [obj.material];
    const next = source.map((mat) => {
      const m = mat.clone();
      m.envMapIntensity = m.envMapIntensity ?? 1.25;
      m.needsUpdate = true;
      return m;
    });
    obj.material = Array.isArray(obj.material) ? next : next[0];
  });

  fitOnPlate(loaf, 1.02);
  // Right lane only — never under the headline. Mid height fills void without eating chrome.
  const loafHome = {
    x: loaf.position.x + 0.92,
    y: loaf.position.y + 0.38,
    z: loaf.position.z - 0.1,
  };
  loaf.position.set(loafHome.x, loafHome.y, loafHome.z);
  loaf.rotation.y = -0.58;
  scene.add(loaf);

  onProgress(0.85);

  const flour = createFlourField(THREE, loafHome);
  scene.add(flour.points);

  const lookTarget = new THREE.Vector3(loafHome.x - 0.12, loafHome.y + 0.06, 0);
  let scrollProgress = 0;
  let rafId = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    flour.material.uniforms.uPixelRatio.value = dpr;
  }

  function drawFrame() {
    const t = Math.min(1, Math.max(0, scrollProgress));
    const e = t * t * (3 - 2 * t);
    const now = performance.now() / 1000;

    loaf.rotation.y = -0.62 + e * Math.PI * 1.15;

    const bob = Math.sin(e * Math.PI) * 0.022;
    loaf.position.set(loafHome.x, loafHome.y + bob, loafHome.z);

    lookTarget.set(loafHome.x - 0.15, loafHome.y + 0.05 + bob * 0.2, 0);

    orbitCamera(camera, {
      yaw: -0.78 + e * 1.4,
      dist: 3.15 - e * 0.2,
      elev: THREE.MathUtils.degToRad(11 + e * 5),
      target: lookTarget,
    });

    flour.material.uniforms.uTime.value = now;
    flour.points.position.y = Math.sin(now * 0.35) * 0.03;

    renderer.render(scene, camera);
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
    flour.points.geometry.dispose();
    flour.material.dispose();
    renderer.dispose();
    pmrem.dispose();
  }

  onProgress(1);
  return { resize, render, dispose };
}
