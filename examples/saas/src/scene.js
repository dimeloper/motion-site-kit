/**
 * Vortex explode → assemble scene.
 * Twelve DualSense-class modules start scattered and seat on scroll progress.
 * Not an orbit — motion language is explode/assemble only.
 */

import * as THREE from 'three';

const BG = 0x07080c;
const GRAPHITE = 0x5a6170;
const GRAPHITE_HI = 0x7a8496;
const ACCENT = 0x5aa0ff;
const RUBBER = 0x2a2e38;
const LIGHT_BUS = 0x8ec5ff;

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.45,
    metalness: opts.metalness ?? 0.25,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
  });
}

function makePart(mesh, home, explode) {
  mesh.position.copy(home);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return {
    mesh,
    home: home.clone(),
    explode: explode.clone(),
    homeRot: mesh.rotation.clone(),
    explodeRot: new THREE.Euler(
      (Math.random() - 0.5) * 1.4,
      (Math.random() - 0.5) * 1.8,
      (Math.random() - 0.5) * 1.2,
    ),
  };
}

/** Procedural DualSense-class kit — separate meshes so they can explode. */
function buildControllerKit(THREE) {
  const root = new THREE.Group();
  const parts = [];

  const bodyMat = mat(GRAPHITE, { roughness: 0.38, metalness: 0.35 });
  const darkMat = mat(RUBBER, { roughness: 0.7, metalness: 0.05 });
  const hiMat = mat(GRAPHITE_HI, { roughness: 0.32, metalness: 0.4 });
  const accentMat = mat(ACCENT, {
    roughness: 0.25,
    metalness: 0.55,
    emissive: ACCENT,
    emissiveIntensity: 0.35,
  });
  const busMat = mat(LIGHT_BUS, {
    roughness: 0.2,
    metalness: 0.6,
    emissive: LIGHT_BUS,
    emissiveIntensity: 0.8,
  });

  const add = (mesh, home, explodeScale = 1.15) => {
    const dir = home.clone().normalize();
    if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0.2).normalize();
    const explode = home.clone().addScaledVector(dir, 1.55 * explodeScale);
    explode.x += (Math.random() - 0.5) * 0.85;
    explode.y += 0.55 + Math.random() * 1.15;
    explode.z += (Math.random() - 0.5) * 0.85;
    parts.push(makePart(mesh, home, explode));
    root.add(mesh);
  };

  // Central shell
  const shell = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.42, 0.95), bodyMat);
  shell.geometry.translate(0, 0, 0);
  add(shell, new THREE.Vector3(0, 0, 0), 0.9);

  // Left / right grips
  const gripGeo = new THREE.CapsuleGeometry(0.22, 0.55, 6, 12);
  const leftGrip = new THREE.Mesh(gripGeo, darkMat);
  leftGrip.rotation.z = 0.35;
  add(leftGrip, new THREE.Vector3(-0.82, -0.28, 0.05), 1.35);

  const rightGrip = new THREE.Mesh(gripGeo, darkMat);
  rightGrip.rotation.z = -0.35;
  add(rightGrip, new THREE.Vector3(0.82, -0.28, 0.05), 1.35);

  // Sticks
  const stickShaft = new THREE.CylinderGeometry(0.07, 0.09, 0.16, 16);
  const stickCap = new THREE.SphereGeometry(0.12, 20, 16);
  const leftStick = new THREE.Group();
  leftStick.add(new THREE.Mesh(stickShaft, hiMat));
  const lCap = new THREE.Mesh(stickCap, darkMat);
  lCap.position.y = 0.12;
  leftStick.add(lCap);
  add(leftStick, new THREE.Vector3(-0.38, 0.22, 0.12), 1.5);

  const rightStick = leftStick.clone();
  add(rightStick, new THREE.Vector3(0.38, 0.22, -0.18), 1.5);

  // D-pad
  const dpad = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.28), hiMat);
  add(dpad, new THREE.Vector3(-0.42, 0.18, -0.22), 1.25);

  // Face buttons cluster
  const face = new THREE.Group();
  const btnGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.04, 16);
  [[0.08, 0], [0, 0.08], [-0.08, 0], [0, -0.08]].forEach(([x, z], i) => {
    const b = new THREE.Mesh(btnGeo, i % 2 ? accentMat : hiMat);
    b.rotation.x = Math.PI / 2;
    b.position.set(x, 0, z);
    face.add(b);
  });
  add(face, new THREE.Vector3(0.42, 0.2, 0.18), 1.4);

  // Touch strip
  const touch = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.22), darkMat);
  add(touch, new THREE.Vector3(0, 0.24, 0.02), 1.1);

  // Triggers
  const trigGeo = new THREE.BoxGeometry(0.28, 0.12, 0.32);
  const l2 = new THREE.Mesh(trigGeo, hiMat);
  add(l2, new THREE.Vector3(-0.55, 0.12, 0.48), 1.55);
  const r2 = new THREE.Mesh(trigGeo, hiMat);
  add(r2, new THREE.Vector3(0.55, 0.12, 0.48), 1.55);

  // Shoulder bumpers
  const bumpGeo = new THREE.BoxGeometry(0.34, 0.08, 0.18);
  const l1 = new THREE.Mesh(bumpGeo, bodyMat);
  add(l1, new THREE.Vector3(-0.55, 0.28, 0.38), 1.3);
  const r1 = new THREE.Mesh(bumpGeo, bodyMat);
  add(r1, new THREE.Vector3(0.55, 0.28, 0.38), 1.3);

  // Light bus (last to “ignite”)
  const bus = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.06), busMat);
  add(bus, new THREE.Vector3(0, 0.05, 0.48), 0.85);

  // Bias whole kit to the right lane — larger so it reads on desktop & mobile.
  root.position.set(0.62, 0.12, 0);
  root.rotation.y = -0.42;
  root.rotation.x = 0.22;
  root.scale.setScalar(1.35);

  return { root, parts, busMat };
}

function createSparkField(THREE) {
  const count = 420;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.35) * 4.5;
    positions[i * 3 + 1] = (Math.random() - 0.2) * 3.2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
    seeds[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uAssemble: { value: 0 },
      uColor: { value: new THREE.Color(ACCENT) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    },
    vertexShader: `
      attribute float aSeed;
      uniform float uTime;
      uniform float uAssemble;
      uniform float uPixelRatio;
      varying float vA;
      void main() {
        float t = uTime * (0.4 + aSeed) + aSeed * 6.28;
        vec3 p = position;
        p.y += sin(t) * 0.08 * (1.0 - uAssemble);
        p += normalize(p + 0.001) * (1.0 - uAssemble) * 0.15;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vA = (0.25 + 0.75 * aSeed) * mix(0.85, 0.25, uAssemble);
        gl_PointSize = (2.0 + aSeed * 4.0) * uPixelRatio * (180.0 / max(0.8, -mv.z));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vA;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.05, d);
        gl_FragColor = vec4(uColor, soft * vA);
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
  const maxDpr = opts.maxDpr ?? 2;
  const onProgress = opts.onProgress ?? (() => {});

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(BG, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.045);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);

  scene.add(new THREE.AmbientLight(0x9aa6c0, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.85);
  key.position.set(2.8, 4.2, 3.2);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x5aa0ff, 0.75);
  fill.position.set(-3.2, 1.2, -1.5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xd0e4ff, 0.85);
  rim.position.set(0.2, 2.5, -3.5);
  scene.add(rim);
  const bounce = new THREE.DirectionalLight(0xffffff, 0.4);
  bounce.position.set(0.4, -2.2, 1.5);
  scene.add(bounce);

  onProgress(0.35);

  const { root, parts, busMat } = buildControllerKit(THREE);
  scene.add(root);

  const sparks = createSparkField(THREE);
  scene.add(sparks.points);

  onProgress(0.85);

  let scrollProgress = 0;
  let rafId = 0;
  const look = new THREE.Vector3(0.45, 0.05, 0);

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
    sparks.material.uniforms.uPixelRatio.value = dpr;
  }

  function drawFrame() {
    const p = Math.min(1, Math.max(0, scrollProgress));
    // Hold scatter briefly, then assemble through mid scroll, settle at end.
    const assemble = THREE.MathUtils.smoothstep(p, 0.08, 0.82);
    const settle = THREE.MathUtils.smoothstep(p, 0.75, 1);
    const now = performance.now() / 1000;

    for (const part of parts) {
      part.mesh.position.lerpVectors(part.explode, part.home, assemble);
      part.mesh.rotation.x = THREE.MathUtils.lerp(part.explodeRot.x, part.homeRot.x, assemble);
      part.mesh.rotation.y = THREE.MathUtils.lerp(part.explodeRot.y, part.homeRot.y, assemble);
      part.mesh.rotation.z = THREE.MathUtils.lerp(part.explodeRot.z, part.homeRot.z, assemble);
    }

    busMat.emissiveIntensity = 0.15 + assemble * 0.95 + settle * 0.35;
    sparks.material.uniforms.uTime.value = now;
    sparks.material.uniforms.uAssemble.value = assemble;

    root.rotation.y = -0.35 + (1 - assemble) * 0.25 + settle * 0.08;
    root.position.y = 0.05 + Math.sin(now * 0.7) * 0.012 * assemble;

    // Dolly in as it locks — no orbit.
    const camZ = THREE.MathUtils.lerp(5.1, 3.55, assemble);
    const camY = THREE.MathUtils.lerp(1.75, 0.95, assemble);
    const camX = THREE.MathUtils.lerp(0.05, 0.62, assemble);
    camera.position.set(camX, camY, camZ);
    look.set(0.55, 0.08 + settle * 0.04, 0);
    camera.lookAt(look);

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
    renderer.dispose();
    sparks.points.geometry.dispose();
    sparks.material.dispose();
  }

  onProgress(1);
  return { resize, render, dispose };
}
