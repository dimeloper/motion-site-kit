import * as THREE from 'three';
import { createStudio, orbitCamera, finishClip, readClipParams } from '../studio.js';

const { width, height, count } = readClipParams();
const { renderer, scene, camera } = createStudio({
  width,
  height,
  background: 0x0e1116,
  accent: 0x2a6ceb,
});

function cardFace(title, owner, status, statusColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#141a24';
  ctx.fillRect(0, 0, 1024, 1280);
  ctx.fillStyle = '#2a6ceb';
  ctx.fillRect(0, 0, 28, 1280);
  ctx.fillStyle = '#7f8aa3';
  ctx.font = '600 48px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText('CLOSE TASK', 80, 160);
  ctx.fillStyle = '#f4f6f8';
  ctx.font = '700 108px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(title, 80, 320);
  ctx.fillStyle = '#9aa3b5';
  ctx.font = '500 52px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(owner, 80, 430);
  ctx.fillStyle = '#2a3140';
  ctx.fillRect(80, 520, 864, 2);
  ctx.fillStyle = statusColor;
  roundRect(ctx, 80, 600, 340, 88, 44);
  ctx.fill();
  ctx.fillStyle = '#0e1116';
  ctx.font = '700 46px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText(status, 118, 658);
  ctx.fillStyle = '#7f8aa3';
  ctx.font = '500 42px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText('Due  28 Aug  ·  17:00 UTC', 80, 780);
  ctx.fillText('Source  NetSuite', 80, 860);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.needsUpdate = true;
  return map;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const glass = new THREE.MeshPhysicalMaterial({
  color: 0x1c2433,
  metalness: 0.12,
  roughness: 0.28,
  clearcoat: 0.7,
  clearcoatRoughness: 0.12,
  envMapIntensity: 0.9,
});

const metal = new THREE.MeshPhysicalMaterial({
  color: 0xb7c0ce,
  metalness: 1,
  roughness: 0.22,
});

function panel(w, h, thick) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, thick), glass);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(w - 0.04, h - 0.04),
    new THREE.MeshBasicMaterial({ toneMapped: false }),
  );
  face.position.z = thick / 2 + 0.002;
  group.add(body, face);
  group.userData.face = face;
  return group;
}

const specs = [
  { title: 'North America', owner: 'Priya  ·  GL', status: 'Ready', color: '#7dcea0' },
  { title: 'AP close', owner: 'Marcus  ·  AP', status: 'Blocked', color: '#e7b56a' },
  { title: 'Cash rec', owner: 'Elena  ·  Treasury', status: 'Done', color: '#7dcea0' },
];

const tasks = specs.map((spec, i) => {
  const card = panel(1.28, 1.62, 0.05);
  card.userData.face.material.map = cardFace(spec.title, spec.owner, spec.status, spec.color);
  card.userData.restX = (i - 1) * 0.18;
  card.userData.restZ = i * 0.12;
  card.userData.restRot = (i - 1) * 0.12;
  card.position.set(card.userData.restX, 0.12, card.userData.restZ);
  card.rotation.y = card.userData.restRot;
  scene.add(card);
  return card;
});

const rail = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.03, 0.08), metal);
rail.position.set(0, -0.78, 0.2);
scene.add(rail);

finishClip((index) => {
  const t = count <= 1 ? 0 : index / (count - 1);
  const explode = Math.sin(t * Math.PI);

  tasks.forEach((card, i) => {
    const spread = (i - 1) * 0.82 * explode;
    card.position.set(
      card.userData.restX + spread,
      0.12 + (i === 1 ? 0.08 : 0.02) * explode,
      card.userData.restZ - (1 - i) * 0.22 * explode,
    );
    card.rotation.y = card.userData.restRot + (i - 1) * 0.22 * explode;
  });
  rail.position.y = -0.78 - 0.06 * explode;

  orbitCamera(camera, {
    yaw: 0.22 + t * 0.28,
    dist: 4.8 + 0.55 * explode,
    elev: THREE.MathUtils.degToRad(8 + 4 * explode),
    target: new THREE.Vector3(0, 0.12, 0.1),
  });
  renderer.render(scene, camera);
});
