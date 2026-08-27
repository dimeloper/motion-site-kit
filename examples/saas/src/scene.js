/**
 * Vortex — fitness ring.
 *
 * Particles travel one way on the SAME torus as the solid band.
 * Intro puffs along the tube normal, then seats. No second ring, no mesh offset.
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

const BG = 0x07080c;
const ACCENT = 0x3d8bff;
const MAJOR = 0.78;
const MINOR = 0.145;

const easeOpen = gsap.parseEase('power2.in');
const easeSeat = gsap.parseEase('power3.inOut');
const easeDolly = gsap.parseEase('power2.inOut');

/** Idle rest: ring present, a tight halo still riding the tube. */
const REST_ASSEMBLE = 0.72;

/** 1 = seated on the tube, 0 = fully puffed. Rest is a halo, not a solid lock. */
function assembleAmount(p) {
  if (p <= 0.08) return REST_ASSEMBLE;
  if (p < 0.40) return REST_ASSEMBLE * (1 - easeOpen((p - 0.08) / 0.32));
  if (p < 0.50) return 0;
  if (p < 0.90) return easeSeat((p - 0.50) / 0.40);
  return 1;
}

function studioEnvironment() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x05060a);
  const addCard = (w, h, color, pos, target) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color }),
    );
    mesh.position.copy(pos);
    mesh.lookAt(target);
    env.add(mesh);
  };
  addCard(12, 5, 0xf4f7ff, new THREE.Vector3(-0.2, 6.8, 5.2), new THREE.Vector3(0, 0, 0));
  addCard(2.8, 8, 0xffffff, new THREE.Vector3(6.8, 2.0, 2.4), new THREE.Vector3(0, 0.1, 0));
  addCard(3.6, 2.2, 0x3d8bff, new THREE.Vector3(-5.8, 1.2, -2.4), new THREE.Vector3(0, 0.1, 0));
  return env;
}

function torusPoint(u, v, major, minor) {
  const x = (major + minor * Math.cos(v)) * Math.cos(u);
  const y = minor * Math.sin(v);
  const z = (major + minor * Math.cos(v)) * Math.sin(u);
  return { x, y, z };
}

function torusNormal(u, v) {
  return {
    x: Math.cos(u) * Math.cos(v),
    y: Math.sin(v),
    z: Math.sin(u) * Math.cos(v),
  };
}

function createRingGeometry() {
  return new THREE.TorusGeometry(MAJOR, MINOR, 64, 192);
}

function createVortexField(count) {
  const aU = new Float32Array(count);
  const aV = new Float32Array(count);
  const aSeed = new Float32Array(count);
  const aPuff = new Float32Array(count);
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const puff = Math.random() < 0.08
      ? 0.22 + Math.random() * 0.18
      : 0.04 + Math.random() * 0.12;
    const home = torusPoint(u, v, MAJOR, MINOR);
    const n = torusNormal(u, v);
    aU[i] = u;
    aV[i] = v;
    aSeed[i] = Math.random();
    aPuff[i] = puff;
    positions[i * 3] = home.x + n.x * puff;
    positions[i * 3 + 1] = home.y + n.y * puff;
    positions[i * 3 + 2] = home.z + n.z * puff;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aU', new THREE.BufferAttribute(aU, 1));
  geometry.setAttribute('aV', new THREE.BufferAttribute(aV, 1));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
  geometry.setAttribute('aPuff', new THREE.BufferAttribute(aPuff, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uSpin: { value: 0 },
      uAssemble: { value: REST_ASSEMBLE },
      uArrive: { value: 0 },
      uMajor: { value: MAJOR },
      uMinor: { value: MINOR },
      uColor: { value: new THREE.Color(ACCENT) },
      uColorHi: { value: new THREE.Color(0xd4e8ff) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: `
      attribute float aU;
      attribute float aV;
      attribute float aSeed;
      attribute float aPuff;
      uniform float uSpin;
      uniform float uAssemble;
      uniform float uArrive;
      uniform float uMajor;
      uniform float uMinor;
      uniform float uPixelRatio;
      varying float vA;
      varying float vMix;
      void main() {
        float leave = 1.0 - uAssemble;
        float stagger = clamp((uArrive - aSeed * 0.28) / 0.72, 0.0, 1.0);
        float arrive = stagger * stagger * (3.0 - 2.0 * stagger);

        float u = aU + uSpin * (0.62 + aSeed * 0.22);
        float v = aV;

        vec3 home;
        home.x = (uMajor + uMinor * cos(v)) * cos(u);
        home.y = uMinor * sin(v);
        home.z = (uMajor + uMinor * cos(v)) * sin(u);

        vec3 nrm = vec3(cos(u) * cos(v), sin(v), sin(u) * cos(v));
        float restPuff = aPuff * leave;
        float introOut = (1.0 - arrive) * (0.35 + aPuff * 0.5);
        vec3 p = home + nrm * (restPuff + introOut);

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vMix = fract(aSeed * 4.17);
        float fade = smoothstep(0.02, 0.16, leave) * smoothstep(0.0, 0.14, arrive);
        vA = (0.38 + 0.48 * aSeed) * fade * mix(0.45, 1.0, arrive);
        float size = mix(0.9, 2.6, leave) * (0.8 + aSeed * 0.7) * mix(0.7, 1.0, arrive);
        gl_PointSize = size * uPixelRatio * (165.0 / max(0.7, -mv.z));
        gl_PointSize = clamp(gl_PointSize, 1.2, 16.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uColorHi;
      varying float vA;
      varying float vMix;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float core = smoothstep(0.2, 0.0, d);
        float halo = smoothstep(0.5, 0.16, d);
        vec3 col = mix(uColor, uColorHi, core * 0.85 + vMix * 0.2);
        float alpha = (halo * 0.32 + core * 0.92) * vA;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, material };
}

function createLockMesh() {
  const geometry = createRingGeometry();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x3d8bff,
    metalness: 0.08,
    roughness: 0.1,
    envMapIntensity: 1.7,
    emissive: 0x0d2f78,
    emissiveIntensity: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 1;
  return { mesh, material };
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ maxDpr?: number, onProgress?: (n: number) => void }} [opts]
 */
export async function createVortexScene(canvas, opts = {}) {
  RectAreaLightUniformsLib.init();

  const maxDpr = opts.maxDpr ?? 2;
  const onProgress = opts.onProgress ?? (() => {});
  onProgress(0.15);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(BG, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.038);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.2;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);

  const key = new THREE.RectAreaLight(0xf4f7ff, 18, 4.4, 1.5);
  key.position.set(2.8, 3.6, 2.4);
  key.lookAt(0.5, 0.1, 0);
  scene.add(key);

  const fill = new THREE.RectAreaLight(0x9aa8c4, 0.8, 2.8, 2.0);
  fill.position.set(-3.4, 1.2, 1.6);
  fill.lookAt(0.5, 0.1, 0);
  scene.add(fill);

  const rim = new THREE.RectAreaLight(0x3d8bff, 12, 2.2, 0.7);
  rim.position.set(-1.2, 1.4, -2.6);
  rim.lookAt(0.5, 0.1, 0);
  scene.add(rim);

  scene.add(new THREE.HemisphereLight(0xc5d0e4, BG, 0.18));

  onProgress(0.45);

  const lock = new THREE.Group();
  lock.rotation.set(0.72, -0.38, 0.06);
  scene.add(lock);

  const count = window.innerWidth < 720 ? 2600 : 4800;
  const field = createVortexField(count);
  field.points.renderOrder = 0;
  lock.add(field.points);

  const ring = createLockMesh();
  ring.mesh.renderOrder = 1;
  lock.add(ring.mesh);

  onProgress(0.85);

  let scrollProgress = 0;
  let rafId = 0;
  let spin = 0;
  let lastT = performance.now() / 1000;
  const look = new THREE.Vector3();
  const intro = { arrive: 0 };
  let introTween = null;

  function layoutLock() {
    const mobile = camera.aspect < 0.92;
    lock.position.set(mobile ? 0.02 : 0.56, mobile ? -0.16 : 0.06, 0);
  }

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
    field.material.uniforms.uPixelRatio.value = dpr;
    layoutLock();
  }

  function drawFrame() {
    const p = THREE.MathUtils.clamp(scrollProgress, 0, 1);
    const assemble = assembleAmount(p);
    const leave = 1 - assemble;
    const arrive = Math.max(intro.arrive, THREE.MathUtils.smoothstep(p, 0, 0.05));
    const ringReveal = THREE.MathUtils.smoothstep(arrive, 0.22, 0.85);
    const dolly = easeDolly(THREE.MathUtils.smoothstep(p, 0.48, 1));
    const now = performance.now() / 1000;
    const dt = Math.min(0.05, Math.max(0, now - lastT));
    lastT = now;
    spin += dt * (0.26 + leave * 0.4);

    field.material.uniforms.uSpin.value = spin;
    field.material.uniforms.uAssemble.value = assemble;
    field.material.uniforms.uArrive.value = arrive;
    field.points.visible = leave > 0.02 && arrive > 0.01;

    ring.mesh.quaternion.identity();
    ring.material.opacity = ringReveal * THREE.MathUtils.lerp(1, 0.88, leave);
    ring.material.transparent = ringReveal < 0.999 || leave > 0.02;
    ring.material.depthWrite = ringReveal > 0.55 && leave < 0.35;
    ring.material.emissiveIntensity = 0.22 + leave * 0.1;
    ring.mesh.visible = ringReveal > 0.02;

    const home = lock.position;
    const camZ = THREE.MathUtils.lerp(4.85, 2.85, dolly);
    const camY = THREE.MathUtils.lerp(1.05, 0.42, dolly);
    const camX = THREE.MathUtils.lerp(0.08, home.x * 0.68, dolly);
    camera.position.set(camX, camY, camZ);
    look.set(home.x - 0.02, home.y + 0.02, 0);
    camera.lookAt(look);

    renderer.render(scene, camera);
  }

  function render(progress) {
    scrollProgress = progress;
    drawFrame();
  }

  function playIntro() {
    introTween?.kill();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || scrollProgress > 0.04) {
      intro.arrive = 1;
      canvas.style.opacity = '1';
      drawFrame();
      return;
    }
    canvas.style.opacity = '0';
    gsap.to(canvas, { opacity: 1, duration: 0.45, ease: 'power2.out', overwrite: true });
    introTween = gsap.to(intro, {
      arrive: 1,
      duration: 1.15,
      ease: 'power2.out',
      overwrite: true,
    });
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    drawFrame();
  }
  loop();

  function dispose() {
    introTween?.kill();
    cancelAnimationFrame(rafId);
    field.points.geometry.dispose();
    field.material.dispose();
    ring.mesh.geometry.dispose();
    ring.material.dispose();
    renderer.dispose();
    pmrem.dispose();
  }

  onProgress(1);
  return { resize, render, playIntro, dispose };
}
