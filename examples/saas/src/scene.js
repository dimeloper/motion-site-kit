import { disposeTree } from '../../shared/lifecycle.js';
/**
 * Vortex — CAD titanium band. Particles peel off the mesh and reseat.
 * Distinct from Harbor's loaf orbit: the band stays put, the halo moves.
 *
 * Genus-1 rings crack in Meshy image-to-3D (thin tube + hole). The Sketchfab
 * Smart Ring (U&W Viz) is the look target but is not downloadable — 0 textures,
 * 8 materials, CAD topology. This lathe band is the license-safe equivalent.
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

const BG = 0x07080c;
const ACCENT = 0x3d8bff;

const easeOpen = gsap.parseEase('power2.in');
const easeSeat = gsap.parseEase('power3.inOut');

/** 1 = seated on the mesh, 0 = fully puffed. Rest is a wide surrounding field. */
const REST_ASSEMBLE = 0.2;

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

function firstMesh(root) {
  let found = null;
  root.traverse((obj) => {
    if (!found && obj.isMesh) found = obj;
  });
  return found;
}

/** Closed titanium band + inner sensors. One body mesh — extra tori z-fight and look cracked. */
function createCadRing() {
  const major = 1;
  const tube = 0.155;
  const titanium = new THREE.MeshPhysicalMaterial({
    color: 0x6a6e76,
    metalness: 0.96,
    roughness: 0.22,
    envMapIntensity: 1.7,
    clearcoat: 0.6,
    clearcoatRoughness: 0.16,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x152033,
    metalness: 0.15,
    roughness: 0.12,
    emissive: 0x123056,
    emissiveIntensity: 0.45,
  });
  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xc5ccd6,
    metalness: 1,
    roughness: 0.12,
    envMapIntensity: 1.8,
  });

  const group = new THREE.Group();
  // Default torus lives in XY (hole along Z). Tilt so a +Z camera is edge-on.
  const body = new THREE.Mesh(new THREE.TorusGeometry(major, tube, 72, 256), titanium);
  body.rotation.x = Math.PI / 2;
  group.add(body);

  const addSensor = (angle, scale, rings) => {
    const r = major - tube + 0.006;
    const g = new THREE.Group();
    g.add(new THREE.Mesh(
      new THREE.CylinderGeometry(0.036 * scale, 0.036 * scale, 0.012, 32),
      glass,
    ));
    if (rings) {
      [0.026, 0.04].forEach((rad, i) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(rad * scale, 0.003, 10, 48),
          chrome,
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.007 + i * 0.001;
        g.add(ring);
      });
    }
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    g.position.set(x, 0, -y);
    g.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(-x, 0, y).normalize(),
    );
    group.add(g);
  };

  addSensor(0.18, 1.15, true);
  addSensor(-0.22, 0.72, false);
  addSensor(0.52, 0.72, false);
  return group;
}

function createHaloField(mesh, count) {
  mesh.updateWorldMatrix(true, false);
  const sampler = new MeshSurfaceSampler(mesh).build();
  const pos = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const aHome = new Float32Array(count * 3);
  const aNrm = new Float32Array(count * 3);
  const aSeed = new Float32Array(count);
  const aPuff = new Float32Array(count);
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    sampler.sample(pos, nrm);
    nrm.normalize();
    const roll = Math.random();
    const puff = roll < 0.18
      ? 10 + Math.random() * 8
      : roll < 0.5
        ? 5 + Math.random() * 5
        : 2.2 + Math.random() * 2.6;
    aHome[i * 3] = pos.x;
    aHome[i * 3 + 1] = pos.y;
    aHome[i * 3 + 2] = pos.z;
    aNrm[i * 3] = nrm.x;
    aNrm[i * 3 + 1] = nrm.y;
    aNrm[i * 3 + 2] = nrm.z;
    aSeed[i] = Math.random();
    aPuff[i] = puff;
    positions[i * 3] = pos.x + nrm.x * puff;
    positions[i * 3 + 1] = pos.y + nrm.y * puff;
    positions[i * 3 + 2] = pos.z + nrm.z * puff;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aHome', new THREE.BufferAttribute(aHome, 3));
  geometry.setAttribute('aNrm', new THREE.BufferAttribute(aNrm, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
  geometry.setAttribute('aPuff', new THREE.BufferAttribute(aPuff, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uAssemble: { value: REST_ASSEMBLE },
      uArrive: { value: 0 },
      uFill: { value: 0 },
      uColor: { value: new THREE.Color(ACCENT) },
      uColorHi: { value: new THREE.Color(0xd4e8ff) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: `
      attribute vec3 aHome;
      attribute vec3 aNrm;
      attribute float aSeed;
      attribute float aPuff;
      uniform float uAssemble;
      uniform float uArrive;
      uniform float uFill;
      uniform float uPixelRatio;
      varying float vA;
      varying float vMix;
      void main() {
        float leave = 1.0 - uAssemble;
        float stagger = clamp((uArrive - aSeed * 0.28) / 0.72, 0.0, 1.0);
        float arrive = stagger * stagger * (3.0 - 2.0 * stagger);
        float fill = uFill * uFill * (3.0 - 2.0 * uFill);
        vec3 drift = normalize(aNrm + vec3(
          aSeed - 0.5,
          fract(aSeed * 3.17) - 0.5,
          fract(aSeed * 7.31) - 0.5
        ));
        float nearPuff = 0.1 + aPuff * 0.015;
        float farPuff = aPuff * 2.6;
        float restPuff = mix(nearPuff, farPuff, fill) * leave;
        float introOut = (1.0 - arrive) * (0.16 + aPuff * 0.04);
        vec3 p = aHome + drift * (restPuff + introOut);
        p += vec3(
          fill * leave * (aSeed - 0.5) * 7.0,
          fill * leave * (fract(aSeed * 3.11) - 0.5) * 6.0,
          fill * leave * (fract(aSeed * 7.42) - 0.5) * 6.5
        );
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vMix = fract(aSeed * 4.17);
        float fade = smoothstep(0.02, 0.14, leave) * smoothstep(0.0, 0.14, arrive);
        vA = (0.42 + 0.52 * aSeed) * fade * mix(0.55, 1.0, arrive);
        float size = mix(1.0, 2.8, leave) * (0.75 + aSeed * 0.8) * mix(0.7, 1.0, arrive);
        gl_PointSize = size * uPixelRatio * (175.0 / max(0.7, -mv.z));
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

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ maxDpr?: number, onProgress?: (n: number) => void }} [opts]
 */
export async function createVortexScene(canvas, opts = {}) {
  RectAreaLightUniformsLib.init();

  const maxDpr = opts.maxDpr ?? 2;
  const onProgress = opts.onProgress ?? (() => {});

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(BG, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.012);

  const pmrem = new THREE.PMREMGenerator(renderer);
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    disposeTree(scene); renderer.dispose(); pmrem.dispose();
  };
  opts.signal?.addEventListener('abort', release, { once: true });
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.04).texture;
  scene.environmentIntensity = 1.35;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);

  const key = new THREE.RectAreaLight(0xf4f7ff, 22, 4.4, 1.5);
  key.position.set(3.4, 3.4, 2.8);
  key.lookAt(1.1, 0.05, 0);
  scene.add(key);

  const fill = new THREE.RectAreaLight(0x9aa8c4, 1.1, 2.8, 2.0);
  fill.position.set(-2.8, 1.2, 1.6);
  fill.lookAt(1.1, 0.05, 0);
  scene.add(fill);

  const rim = new THREE.RectAreaLight(0x3d8bff, 8, 2.2, 0.7);
  rim.position.set(-0.4, 1.4, -2.6);
  rim.lookAt(1.1, 0.05, 0);
  scene.add(rim);

  const bounce = new THREE.RectAreaLight(0xe8eef8, 5.5, 2.4, 2.4);
  bounce.position.set(1.1, -0.4, 1.2);
  bounce.lookAt(1.1, 0.05, 0);
  scene.add(bounce);

  scene.add(new THREE.HemisphereLight(0xc5d0e4, BG, 0.22));

  onProgress(0.28);
  await new Promise((resolve) => setTimeout(resolve, 16));

  opts.signal?.throwIfAborted();
  const ring = createCadRing();
  fitOnPlate(ring, 0.82);
  // Body is already X-tilted to edge-on. Group yaw shows inner sensors, off the type.
  ring.rotation.set(0.18, 0.72, 0.06);
  onProgress(0.62);

  const lock = new THREE.Group();
  lock.add(ring);
  scene.add(lock);

  const mesh = firstMesh(ring);
  if (!mesh) throw new Error('[vortex] CAD ring has no mesh');

  onProgress(0.78);

  const count = window.innerWidth < 720 ? 2600 : 5600;
  const field = createHaloField(mesh, count);
  field.points.renderOrder = 2;
  mesh.add(field.points);

  const home = { x: 0.56, y: 0.08, z: 0 };
  const look = new THREE.Vector3();
  let scrollProgress = 0;
  let rafId = 0;
  const intro = { arrive: 0, fill: 0 };
  let introTween = null;
  let fillTween = null;

  function layoutLock() {
    const mobile = camera.aspect < 0.92;
    home.x = mobile ? 0.04 : 1.05;
    home.y = mobile ? -0.14 : 0;
    lock.position.set(home.x, home.y, home.z);
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
    const e = p * p * (3 - 2 * p);
    const assemble = assembleAmount(p);
    const leave = 1 - assemble;
    const arrive = Math.max(intro.arrive, THREE.MathUtils.smoothstep(p, 0, 0.05));

    field.material.uniforms.uAssemble.value = assemble;
    field.material.uniforms.uArrive.value = arrive;
    field.material.uniforms.uFill.value = intro.fill;
    field.points.visible = arrive > 0.01 && leave > 0.03;

    // Show the inner sensors, then settle — keep yaw short so it stays off type.
    lock.rotation.y = e * 0.55;
    const bob = Math.sin(e * Math.PI) * 0.012;
    lock.position.set(home.x, home.y + bob, home.z);

    const camZ = THREE.MathUtils.lerp(2.2, 1.78, e);
    const camY = THREE.MathUtils.lerp(0.2, 0.12, e);
    const camX = THREE.MathUtils.lerp(0.16, home.x * 0.08, e);
    camera.position.set(camX, camY, camZ);
    look.set(home.x - 0.12, home.y + 0.04 + bob * 0.2, 0);
    camera.lookAt(look);

    renderer.render(scene, camera);
  }

  function render(progress) {
    scrollProgress = progress;
    if (active) drawFrame();
  }

  function playIntro() {
    introTween?.kill();
    fillTween?.kill();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || scrollProgress > 0.04) {
      intro.arrive = 1;
      intro.fill = 1;
      canvas.style.opacity = '1';
      drawFrame();
      return;
    }
    intro.arrive = 0;
    intro.fill = 0;
    canvas.style.opacity = '0';
    gsap.to(canvas, { opacity: 1, duration: 0.5, ease: 'power2.out', overwrite: true });
    introTween = gsap.timeline();
    introTween.to(intro, { arrive: 1, duration: 0.85, ease: 'power2.out' }, 0);
    introTween.to(intro, { fill: 1, duration: 1.5, ease: 'power2.inOut' }, 0.5);
    fillTween = null;
  }

  let active = true;
  let disposed = false;
  function loop() {
    if (!active || disposed) return;
    rafId = requestAnimationFrame(loop);
    drawFrame();
  }
  function setActive(value) {
    if (disposed || value === active) return;
    active = value;
    if (active) loop();
    else cancelAnimationFrame(rafId);
  }
  loop();

  function dispose() {
    if (disposed) return;
    disposed = true;
    active = false;
    opts.signal?.removeEventListener('abort', release);
    release();
    gsap.killTweensOf(canvas);
    introTween?.kill();
    fillTween?.kill();
    cancelAnimationFrame(rafId);
  }

  onProgress(1);
  return { resize, render, playIntro, setActive, dispose };
}
