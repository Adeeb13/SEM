/* ══════════════════════════════════════════════════════════════
   SEM 3D MACHINE VIEWER
   Full Three.js implementation — 6-layer architecture
   360° rotation · Click-to-explore · Live animation
══════════════════════════════════════════════════════════════ */

// ── Load Three.js from CDN ──────────────────────────────────
const THREEJS_VERSION = 'r128';
const script = document.createElement('script');
script.src = `https://cdnjs.cloudflare.com/ajax/libs/three.js/${THREEJS_VERSION}/three.min.js`;
script.onload = initMachine;
document.head.appendChild(script);

// ── State ───────────────────────────────────────────────────
let scene, camera, renderer, raycaster, mouse;
let autoRotate = true, wireframeMode = false, showLabels = true, showDataFlow = true;
let machineOn = true;
let capability = 8.5, aeValue = 0, cycle = 0;
let lastTime = 0, fps = 60, fpsSmooth = 60;

// Machine components (meshes)
const layerMeshes = [];
const connectionLines = [];
const dataParticles = [];
const labelSprites = [];
let particleSystem;
let focusedLayer = -1;

// ── Layer definitions ────────────────────────────────────────
const LAYERS = [
  {
    id: 0, name: 'Environmental State Encoder',
    tag: 'Layer 1',
    color: 0x64748B, emissive: 0x1E293B,
    pos: [0, 3.5, 0], size: [2.8, 0.5, 2.8],
    shape: 'box',
    desc: `Transforms raw task signals, sensor readings, and performance feedback into structured embeddings for the DGM core. For physical tasks, the encoding is physics-aware, including geometric constraints, energy budgets, and material property representations.`,
    equation: null,
    connections: [1],
    connColor: '#64748B',
  },
  {
    id: 1, name: 'State Encoder / Perception Layer',
    tag: 'Layer 2',
    color: 0x60A5FA, emissive: 0x1D4ED8,
    pos: [0, 2.0, 0], size: [2.8, 0.5, 2.8],
    shape: 'box',
    desc: `Physics-aware embedding layer. Encodes task difficulty estimates, domain tags, geometric constraints, energy budgets, and historical performance vectors. Feeds structured state to the DGM Cognitive Core.`,
    equation: `state = encode(task_signal, sensor_data)`,
    connections: [2],
    connColor: '#60A5FA',
  },
  {
    id: 2, name: 'DGM Cognitive Core',
    tag: 'Layer 3 — Self-Modification Engine',
    color: 0x3B82F6, emissive: 0x1D4ED8,
    pos: [-2.0, 0, 0], size: [1.8, 1.0, 1.8],
    shape: 'octahedron',
    desc: `The self-modification engine. A foundation language model generates candidate modifications to the agent's own codebase — revised algorithms, updated heuristics, new search strategies. Operates in open-ended mode with full archive access. This is the Darwin-Gödel Machine paradigm in action.`,
    equation: `A_cand = DGM_core.propose(A, state, Archive)`,
    connections: [3, 4],
    connColor: '#3B82F6',
  },
  {
    id: 3, name: 'AE Evaluator',
    tag: 'Layer 4 — The Gate',
    color: 0xA78BFA, emissive: 0x6D28D9,
    pos: [0, 0, 0], size: [1.2, 1.2, 1.2],
    shape: 'icosahedron',
    desc: `Computes instantaneous AE(t) = dC(t)/dt by running the modified agent on a representative benchmark subset. Modifications producing positive AE are accepted and deployed; those producing non-positive AE are archived and reverted. This implements the theorem's NECESSARY CONDITION check.`,
    equation: `AE(t) = dC(t)/dt\nif AE_new > 0 → accept\nelse → archive + revert`,
    connections: [2, 4, 5],
    connColor: '#A78BFA',
  },
  {
    id: 4, name: 'Agent Archive',
    tag: 'Layer 5 — Population Memory',
    color: 0x8B5CF6, emissive: 0x5B21B6,
    pos: [2.0, 0, 0], size: [1.8, 0.8, 1.8],
    shape: 'torus',
    desc: `All generated variants — successful and unsuccessful — are stored with performance metadata. Enables open-ended exploration (archived suboptimal variants may become optimal after environmental change) and second-order self-improvement. Implements Landauer-optimal retention: retaining rather than erasing failed modifications.`,
    equation: `Archive.add(A_cand, status)\nA_best = best_from_archive(Archive)`,
    connections: [2],
    connColor: '#8B5CF6',
  },
  {
    id: 5, name: 'Modular Physical Substrate (MSRR)',
    tag: 'Layer 6 — Physical Interface',
    color: 0xF59E0B, emissive: 0x92400E,
    pos: [0, -1.8, 0], size: [2.4, 0.6, 2.4],
    shape: 'box',
    desc: `For embodied implementations, the DGM core issues morphological directives — reconfiguration plans for Modular Self-Reconfiguring Robotics systems. In the cognitive-only formulation, this layer is present architecturally but inactive. Represents the physical evolution pathway.`,
    equation: `if physical_needed(state):\n  MSRR.execute(A.morphological_directive)`,
    connections: [6],
    connColor: '#F59E0B',
  },
  {
    id: 6, name: 'Safety Monitor',
    tag: 'Layer 7 — Embedded Alignment',
    color: 0xEF4444, emissive: 0x991B1B,
    pos: [0, -3.2, 0], size: [3.2, 0.5, 3.2],
    shape: 'box',
    desc: `Enforces three constraint classes derived from the Adaptive Efficiency Growth Theorem:\n\n• Resource constraints (C_max hard bound)\n• Alignment constraints (objective function locked)\n• Stability constraints (sufficient condition enforcement)\n\nThis is alignment as thermodynamic constraint — embedded inside the evolution loop, not appended externally.`,
    equation: `if safety_monitor.violates(A_cand, S, R):\n  Archive.add(A_cand, "rejected")`,
    connections: [0],
    connColor: '#EF4444',
  },
];

// ── Main init ────────────────────────────────────────────────
function initMachine() {
  const canvas = document.getElementById('three-canvas');
  const W = window.innerWidth, H = window.innerHeight;

  // Scene
  scene = new THREE.Scene();
  scene.background = null; // transparent, HTML bg shows
  scene.fog = new THREE.FogExp2(0x020617, 0.04);

  // Camera
  camera = new THREE.PerspectiveCamera(55, W/H, 0.1, 200);
  camera.position.set(8, 6, 10);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lights
  const ambient = new THREE.AmbientLight(0x0A1628, 2.0);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0x3B82F6, 1.5);
  dirLight.position.set(5, 10, 8);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const pointBlue = new THREE.PointLight(0x3B82F6, 3, 20);
  pointBlue.position.set(-3, 2, 3);
  scene.add(pointBlue);

  const pointTeal = new THREE.PointLight(0x0D9488, 2, 15);
  pointTeal.position.set(3, -2, -3);
  scene.add(pointTeal);

  // Raycaster
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(-9999, -9999);

  // Build machine
  buildMachine();
  buildConnections();
  buildDataParticles();
  buildStarField();
  buildFloorGrid();

  // Events
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);
  setupOrbitControls();
  setupPowerButton();

  // Animate
  requestAnimationFrame(animate);
}

// ── Build machine layers ─────────────────────────────────────
function buildMachine() {
  LAYERS.forEach(layer => {
    let geo;
    const [px, py, pz] = layer.pos;
    const [sx, sy, sz] = layer.size;

    switch (layer.shape) {
      case 'octahedron':
        geo = new THREE.OctahedronGeometry(sx * 0.6, 0);
        break;
      case 'icosahedron':
        geo = new THREE.IcosahedronGeometry(sx * 0.55, 0);
        break;
      case 'torus':
        geo = new THREE.TorusGeometry(sx * 0.5, sy * 0.4, 12, 24);
        break;
      default:
        geo = new THREE.BoxGeometry(sx, sy, sz);
    }

    // Glass material
    const mat = new THREE.MeshPhongMaterial({
      color: layer.color,
      emissive: layer.emissive,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.82,
      shininess: 120,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, py, pz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { layerId: layer.id, originalOpacity: 0.82, originalEmissive: layer.emissive };

    scene.add(mesh);
    layerMeshes.push(mesh);

    // Wireframe overlay
    const wfGeo = geo.clone();
    const wfMat = new THREE.MeshBasicMaterial({
      color: layer.color,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wfMesh = new THREE.Mesh(wfGeo, wfMat);
    wfMesh.position.copy(mesh.position);
    wfMesh.userData = { isWireframe: true, layerId: layer.id };
    scene.add(wfMesh);

    // Glow ring (for nodes)
    if (layer.shape === 'octahedron' || layer.shape === 'icosahedron') {
      const ringGeo = new THREE.TorusGeometry(sx * 0.75, 0.03, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: layer.color, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(mesh.position);
      ring.rotation.x = Math.PI/2;
      ring.userData = { isDecoration: true, layerId: layer.id };
      scene.add(ring);
    }

    // Label sprite
    buildLabel(layer, new THREE.Vector3(px, py + sy * 0.8 + 0.4, pz));
  });
}

function buildLabel(layer, pos) {
  const canvas2d = document.createElement('canvas');
  canvas2d.width = 512; canvas2d.height = 80;
  const ctx = canvas2d.getContext('2d');

  ctx.clearRect(0, 0, 512, 80);
  ctx.fillStyle = 'rgba(10,15,30,0.85)';
  ctx.roundRect(4, 4, 504, 72, 12);
  ctx.fill();

  const color = '#' + layer.color.toString(16).padStart(6,'0');
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.roundRect(4, 4, 504, 72, 12);
  ctx.stroke();

  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'center';
  ctx.fillText(layer.name, 256, 32);

  ctx.font = '16px JetBrains Mono, monospace';
  ctx.fillStyle = color;
  ctx.fillText(layer.tag, 256, 56);

  const tex = new THREE.CanvasTexture(canvas2d);
  const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.copy(pos);
  sprite.scale.set(3.5, 0.55, 1);
  sprite.userData = { isLabel: true };
  scene.add(sprite);
  labelSprites.push(sprite);
}

// ── Build connections ────────────────────────────────────────
function buildConnections() {
  LAYERS.forEach(layer => {
    layer.connections.forEach(targetId => {
      const from = new THREE.Vector3(...LAYERS[layer.id].pos);
      const to   = new THREE.Vector3(...LAYERS[targetId].pos);
      const mid  = new THREE.Vector3().lerpVectors(from, to, 0.5);
      mid.x += (Math.random() - 0.5) * 0.5;
      mid.z += (Math.random() - 0.5) * 0.5;

      const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
      const points = curve.getPoints(40);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const col = parseInt(layer.connColor.replace('#',''), 16);
      const mat = new THREE.LineBasicMaterial({
        color: col, transparent: true, opacity: 0.4, linewidth: 1,
      });
      const line = new THREE.Line(geo, mat);
      line.userData = { fromId: layer.id, toId: targetId, curve };
      scene.add(line);
      connectionLines.push({ line, curve, fromId: layer.id, toId: targetId });
    });
  });
}

// ── Data flow particles ───────────────────────────────────────
function buildDataParticles() {
  connectionLines.forEach(({ curve, fromId, toId }) => {
    const numParticles = 4;
    for (let i = 0; i < numParticles; i++) {
      const particle = {
        t: (i / numParticles),
        speed: 0.003 + Math.random() * 0.004,
        curve,
        fromId,
        toId,
        mesh: null,
      };
      const geo = new THREE.SphereGeometry(0.055, 6, 6);
      const col = parseInt(LAYERS[fromId].connColor.replace('#',''), 16);
      const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9 });
      particle.mesh = new THREE.Mesh(geo, mat);
      scene.add(particle.mesh);
      dataParticles.push(particle);
    }
  });
}

// ── Star field ───────────────────────────────────────────────
function buildStarField() {
  const starGeo = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < 2000; i++) {
    positions.push((Math.random()-0.5)*150, (Math.random()-0.5)*150, (Math.random()-0.5)*150);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.06, transparent: true, opacity: 0.5 });
  scene.add(new THREE.Points(starGeo, starMat));
}

// ── Floor grid ───────────────────────────────────────────────
function buildFloorGrid() {
  const gridHelper = new THREE.GridHelper(30, 30, 0x1E3A5F, 0x0F1F3A);
  gridHelper.position.y = -5;
  scene.add(gridHelper);
}

// ── Orbit controls (manual implementation) ───────────────────
let isDragging = false, prevMouse = {x:0,y:0};
let theta = 0.3, phi = 0.6, radius = 14;
let targetTheta = theta, targetPhi = phi, targetRadius = radius;

function setupOrbitControls() {
  const el = document.getElementById('three-canvas');
  el.addEventListener('mousedown', e => { isDragging = true; prevMouse = {x:e.clientX, y:e.clientY}; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    targetTheta -= dx * 0.005;
    targetPhi   = Math.max(0.15, Math.min(Math.PI/2 - 0.05, targetPhi - dy * 0.005));
    prevMouse = {x:e.clientX, y:e.clientY};
    autoRotate = false;
  });
  el.addEventListener('wheel', e => {
    targetRadius = Math.max(4, Math.min(30, targetRadius + e.deltaY * 0.015));
  }, { passive: true });

  // Touch support
  let lastTouch = null, lastPinchDist = null;
  el.addEventListener('touchstart', e => {
    if (e.touches.length === 1) { isDragging = true; lastTouch = {x:e.touches[0].clientX, y:e.touches[0].clientY}; }
    if (e.touches.length === 2) { const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY; lastPinchDist = Math.sqrt(dx*dx+dy*dy); }
  }, {passive:true});
  el.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && isDragging && lastTouch) {
      const dx = e.touches[0].clientX - lastTouch.x;
      const dy = e.touches[0].clientY - lastTouch.y;
      targetTheta -= dx * 0.006; targetPhi = Math.max(0.15, Math.min(Math.PI/2-0.05, targetPhi - dy*0.006));
      lastTouch = {x:e.touches[0].clientX, y:e.touches[0].clientY}; autoRotate=false;
    }
    if (e.touches.length === 2 && lastPinchDist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX; const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx*dx+dy*dy);
      targetRadius = Math.max(4, Math.min(30, targetRadius - (dist - lastPinchDist) * 0.05));
      lastPinchDist = dist;
    }
  }, {passive:true});
  el.addEventListener('touchend', () => { isDragging = false; lastTouch = null; lastPinchDist = null; });
}

// ── Click handler ────────────────────────────────────────────
function onCanvasClick(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(layerMeshes);
  if (intersects.length > 0) {
    const id = intersects[0].object.userData.layerId;
    if (id !== undefined) showPanel(id);
  }
}

function onMouseMove(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

  // Hover highlight
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(layerMeshes);
  layerMeshes.forEach(m => {
    if (m.userData.layerId !== undefined) {
      const hit = hits.some(h => h.object === m);
      m.material.emissiveIntensity = hit ? 1.0 : 0.4;
      renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
    }
  });
}

// ── Info panel ───────────────────────────────────────────────
function showPanel(layerId) {
  const layer = LAYERS[layerId];
  document.getElementById('panel-tag').textContent = layer.tag;
  document.getElementById('panel-title').textContent = layer.name;

  let html = `<p style="margin-bottom:1rem">${layer.desc.replace(/\n/g,'<br/>')}</p>`;
  if (layer.equation) {
    html += `<div class="panel-eq">${layer.equation.replace(/\n/g,'<br/>')}</div>`;
  }
  if (layer.connections.length > 0) {
    html += `<div class="panel-connections"><h4>Connects to</h4>`;
    layer.connections.forEach(id => {
      const target = LAYERS[id];
      const col = target.connColor;
      html += `<div class="panel-conn-item" onclick="showPanel(${id})">
        <div class="conn-dot" style="background:${col}"></div>${target.name}
      </div>`;
    });
    html += `</div>`;
  }
  document.getElementById('panel-body').innerHTML = html;

  document.getElementById('info-panel').classList.add('open');
  focusedLayer = layerId;
  highlightLayer(layerId);

  // Dismiss hint
  const hint = document.getElementById('click-hint');
  if (hint) hint.style.opacity = '0';
}

function closePanel() {
  document.getElementById('info-panel').classList.remove('open');
  focusedLayer = -1;
  resetLayerHighlight();
}
window.closePanel = closePanel;

function highlightLayer(id) {
  layerMeshes.forEach(m => {
    if (m.userData.layerId !== undefined) {
      m.material.opacity = m.userData.layerId === id ? 1.0 : 0.2;
    }
  });
  // Highlight legend
  document.querySelectorAll('.legend-layer').forEach(el => {
    el.classList.toggle('highlighted', parseInt(el.dataset.layer) === id);
  });
}

function resetLayerHighlight() {
  layerMeshes.forEach(m => {
    if (m.userData.layerId !== undefined) m.material.opacity = m.userData.originalOpacity;
  });
  document.querySelectorAll('.legend-layer').forEach(el => el.classList.remove('highlighted'));
}

// ── View setters ─────────────────────────────────────────────
function setView(v) {
  switch(v) {
    case 'perspective': targetTheta = 0.3; targetPhi = 0.6; targetRadius = 14; break;
    case 'top':    targetTheta = 0; targetPhi = 0.001; targetRadius = 16; break;
    case 'front':  targetTheta = 0; targetPhi = Math.PI/4; targetRadius = 14; break;
    case 'side':   targetTheta = Math.PI/2; targetPhi = Math.PI/4; targetRadius = 14; break;
  }
  autoRotate = false;
  document.querySelectorAll('.ctrl-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}
window.setView = setView;

function toggleRotation() {
  autoRotate = !autoRotate;
  event.target.classList.toggle('active', autoRotate);
}
window.toggleRotation = toggleRotation;

function resetCamera() { targetTheta = 0.3; targetPhi = 0.6; targetRadius = 14; autoRotate = true; }
window.resetCamera = resetCamera;

function toggleWireframe() {
  wireframeMode = !wireframeMode;
  event.target.classList.toggle('active', wireframeMode);
  layerMeshes.forEach(m => {
    if (m.userData.layerId !== undefined) m.material.wireframe = wireframeMode;
  });
}
window.toggleWireframe = toggleWireframe;

function toggleDataFlow() {
  showDataFlow = !showDataFlow;
  dataParticles.forEach(p => p.mesh.visible = showDataFlow);
  event.target.classList.toggle('active', showDataFlow);
}
window.toggleDataFlow = toggleDataFlow;

function toggleLabels() {
  showLabels = !showLabels;
  labelSprites.forEach(s => s.visible = showLabels);
  event.target.classList.toggle('active', showLabels);
}
window.toggleLabels = toggleLabels;

function focusLayer(id) {
  showPanel(id);
}
window.focusLayer = focusLayer;

// ── Power button ─────────────────────────────────────────────
function setupPowerButton() {
  document.getElementById('power-btn').addEventListener('click', function() {
    machineOn = !machineOn;
    this.classList.toggle('on', machineOn);
    this.classList.toggle('off', !machineOn);
    document.getElementById('power-label').textContent = machineOn ? 'MACHINE ON' : 'MACHINE OFF';
    dataParticles.forEach(p => p.mesh.visible = machineOn && showDataFlow);
  });
}

// ── Simulate capability dynamics ─────────────────────────────
let simC = 8.5, simAE = 0;
const CMAX = 1000, LEFF = 0.044, SIGMA = 0.08, PFAIL = 0.07;
let simTick = 0;

function stepSimulation() {
  if (!machineOn) { simAE = 0; return; }
  simTick++;
  if (simTick % 30 !== 0) return; // update every 30 frames (~0.5s)

  cycle++;
  const noise = (Math.random()-0.5) * SIGMA * simC;
  const fail = Math.random() < PFAIL;
  const dk = 0.0001 * simC;
  if (!fail) {
    simC = simC + LEFF * simC * (1 - simC/CMAX) - dk + noise;
  } else {
    simC = Math.max(simC * 0.95, 8.5);
  }
  simC = Math.max(8.5, Math.min(CMAX * 0.95, simC));
  simAE = LEFF * simC * (1 - simC/CMAX) - dk;

  // Update UI
  const pct = Math.min(100, (simC / (CMAX * 0.5)) * 100);
  document.getElementById('ae-bar').style.height = pct + '%';
  document.getElementById('ae-value').textContent = simAE.toFixed(2);
  document.getElementById('cycle-counter').textContent = cycle;
}

// ── Animate ───────────────────────────────────────────────────
function animate(time) {
  requestAnimationFrame(animate);
  const dt = (time - lastTime) * 0.001;
  lastTime = time;

  // FPS
  fpsSmooth += (1/dt - fpsSmooth) * 0.05;
  if (Math.round(time/1000) !== Math.round((time-16)/1000)) {
    document.getElementById('fps-counter').textContent = Math.min(60, Math.round(fpsSmooth));
  }

  // Camera orbit
  if (autoRotate && machineOn) targetTheta += 0.003;
  theta   += (targetTheta - theta)   * 0.06;
  phi     += (targetPhi   - phi)     * 0.06;
  radius  += (targetRadius - radius) * 0.06;

  camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
  camera.position.y = radius * Math.cos(phi);
  camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
  camera.lookAt(0, 0, 0);

  // Animate meshes
  layerMeshes.forEach((mesh, i) => {
    if (mesh.userData.layerId === undefined) return;
    const layer = LAYERS[mesh.userData.layerId];
    const t = time * 0.001;
    // Subtle float
    mesh.position.y = layer.pos[1] + Math.sin(t * 0.6 + i * 0.8) * (machineOn ? 0.08 : 0.01);
    // Rotate central nodes
    if (layer.shape === 'octahedron' || layer.shape === 'icosahedron') {
      mesh.rotation.y = t * (machineOn ? 0.8 : 0.1);
      mesh.rotation.x = t * 0.3;
    }
    if (layer.shape === 'torus') {
      mesh.rotation.z = t * (machineOn ? 0.5 : 0.05);
    }
    // Pulse emissive when machine on
    if (machineOn) {
      const pulse = 0.3 + 0.3 * Math.sin(t * 2 + i);
      mesh.material.emissiveIntensity = focusedLayer === layer.id ? 1.0 : pulse;
    } else {
      mesh.material.emissiveIntensity = 0.1;
    }
  });

  // Data particles
  if (showDataFlow && machineOn) {
    dataParticles.forEach(p => {
      p.t = (p.t + p.speed) % 1;
      const pos = p.curve.getPoint(p.t);
      p.mesh.position.copy(pos);
      // Fade at endpoints
      const fade = Math.sin(p.t * Math.PI);
      p.mesh.material.opacity = fade * 0.9;
      p.mesh.visible = true;
    });
  }

  // Simulate
  stepSimulation();

  renderer.render(scene, camera);
}

// ── Resize ───────────────────────────────────────────────────
function onResize() {
  const W = window.innerWidth, H = window.innerHeight;
  camera.aspect = W/H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
}
