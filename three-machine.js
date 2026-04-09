/* ══════════════════════════════════════════════════════════════
   SEM LIVE SIMULATION ENGINE
   Stochastic AE Growth Model · Real-time Charts
══════════════════════════════════════════════════════════════ */

// ── Parameters ──────────────────────────────────────────────
let P = {
  lcog: 0.050, lphys: 0.030, sigma: 0.08, pfail: 0.07,
  cmax: 1000, alpha: 0.70,
};
function get_leff() { return P.alpha * P.lcog + (1 - P.alpha) * P.lphys; }
function get_dk(c) { return 0.00005 * c; }
function get_mu_fail() { return 0.06; }

// ── State ────────────────────────────────────────────────────
let running = true, speed = 1;
let history = { sem:[], rl:[], stat:[], ae:[], accept:[] };
let cycle = 0, failures = 0;
let semC = 8.5, rlC = 8.5, statC = 8.5;
let recentAcceptances = [], recentWindowSize = 10;
let frameCount = 0;

// ── DOM refs ─────────────────────────────────────────────────
const ctxCap = document.getElementById('chart-capability').getContext('2d');
const ctxAE  = document.getElementById('chart-ae').getContext('2d');
const ctxPh  = document.getElementById('chart-phase').getContext('2d');
const ctxAcc = document.getElementById('chart-acceptance').getContext('2d');

// ── Step simulation ──────────────────────────────────────────
function stepSim() {
  cycle++;

  // SEM
  const noise = (Math.random()-0.5)*2 * P.sigma * semC;
  const fail = Math.random() < P.pfail;
  const dk = get_dk(semC);
  const leff = get_leff();
  let newC;
  if (!fail) {
    newC = semC + leff * semC * (1 - semC/P.cmax) - dk + noise;
    if (newC > semC) {
      recentAcceptances.push(1);
      logEvent(`Cycle ${cycle}: Modification accepted. ΔC = +${(newC-semC).toFixed(3)}`, 'success');
    } else {
      recentAcceptances.push(0);
      newC = semC; // revert
    }
  } else {
    failures++;
    newC = Math.max(semC * 0.95, 8.5);
    recentAcceptances.push(0);
    logEvent(`Cycle ${cycle}: Failure detected. Reverted to archive. Recovery in progress.`, 'fail');
  }
  if (recentAcceptances.length > recentWindowSize) recentAcceptances.shift();

  const ae = (newC - semC);
  semC = Math.max(8.5, Math.min(P.cmax * 0.97, newC));

  // RL
  rlC = Math.min(rlC + 0.008 * rlC * (1 - rlC/80) + (Math.random()-0.5)*0.4, 80);
  rlC = Math.max(8.5, rlC);

  // Static
  statC = 8.5 + (Math.random()-0.5)*0.3;

  // Record
  history.sem.push(semC);
  history.rl.push(rlC);
  history.stat.push(statC);
  history.ae.push(ae);
  const acceptRate = recentAcceptances.reduce((a,b)=>a+b,0) / recentWindowSize;
  if (cycle % recentWindowSize === 0) history.accept.push({ x: cycle, y: acceptRate });

  // Trim to last 200
  if (history.sem.length > 200) {
    history.sem.shift(); history.rl.shift(); history.stat.shift(); history.ae.shift();
  }

  // Update stats
  document.getElementById('stat-cycle').textContent = cycle;
  document.getElementById('stat-c').textContent = semC.toFixed(1);
  document.getElementById('stat-ae').textContent = ae.toFixed(3);
  document.getElementById('stat-rl').textContent = rlC.toFixed(1);
  document.getElementById('stat-improvement').textContent = Math.round((semC/rlC - 1)*100) + '%';
  document.getElementById('stat-failures').textContent = failures;

  // Update regime indicators
  updateRegimeIndicators();
}

// ── Regime check ─────────────────────────────────────────────
function updateRegimeIndicators() {
  const leff = get_leff();
  const muFail = get_mu_fail();
  const dk = get_dk(semC);

  // Sufficient condition: λ_eff > σ²/2 + p_fail*μ_fail + dk_max/C0
  const suffRHS = (P.sigma**2)/2 + P.pfail*muFail + 0.001;
  const suffMet = leff > suffRHS;
  const sc = document.getElementById('sufficient-check');
  if (suffMet) {
    sc.className = 'condition-check condition-pass';
    sc.textContent = `✓ Sufficient condition met: λ_eff=${leff.toFixed(3)} > ${suffRHS.toFixed(3)}`;
  } else {
    sc.className = 'condition-check condition-fail';
    sc.textContent = `✗ Condition violated: λ_eff=${leff.toFixed(3)} ≤ ${suffRHS.toFixed(3)}`;
  }

  // FR-1: σ²/2 > λ_eff - p_fail*μ_fail
  const fr1 = (P.sigma**2)/2 > leff - P.pfail*muFail;
  setRegime('fr1', fr1, 'FR-1: Noise Dominance');

  // FR-2: C close to Cmax
  const fr2 = semC > P.cmax * 0.90;
  setRegime('fr2', fr2, 'FR-2: Resource Saturation');

  // FR-3: dk >= leff * C * (1 - C/Cmax)
  const fr3 = dk >= leff * semC * (1 - semC/P.cmax);
  setRegime('fr3', fr3, 'FR-3: Algorithmic Limit');
}

function setRegime(id, active, label) {
  const dot = document.getElementById(`${id}-dot`);
  const txt = document.getElementById(`${id}-text`);
  if (active) {
    dot.style.opacity = '1';
    txt.className = 'regime-active';
    txt.textContent = label + ' — ACTIVE ⚠';
  } else {
    dot.style.opacity = '0.3';
    txt.className = 'regime-inactive';
    txt.textContent = label + ' — inactive';
  }
}

// ── Charts ────────────────────────────────────────────────────
function renderCapabilityChart() {
  const canvas = document.getElementById('chart-capability');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;
  const ctx = ctxCap;
  ctx.clearRect(0,0,W,H);

  const bg = ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'rgba(10,15,30,0.95)'); bg.addColorStop(1,'rgba(2,6,23,0.95)');
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

  const pad = {t:10,r:10,b:30,l:45};
  const cW = W-pad.l-pad.r, cH = H-pad.t-pad.b;

  const allVals = [...history.sem, ...history.rl, ...history.stat];
  const maxV = Math.max(...allVals, 10) * 1.05;

  function px(i, total) { return pad.l + (i/(total-1)) * cW; }
  function py(v) { return pad.t + cH * (1 - v/maxV); }

  drawGridLines(ctx, pad, cW, cH, W, H, maxV);

  const n = history.sem.length;
  if (n < 2) return;

  drawLine(ctx, history.stat, n, px, py, '#6B7280', 1.2);
  drawLine(ctx, history.rl,   n, px, py, '#F59E0B', 1.8);

  // SEM with glow
  ctx.shadowColor = '#3B82F6'; ctx.shadowBlur = 8;
  drawLine(ctx, history.sem, n, px, py, '#3B82F6', 2.5);
  ctx.shadowBlur = 0;

  // Labels
  ctx.font = '10px Inter'; ctx.fillStyle = '#60A5FA';
  ctx.fillText('SEM', px(n-1,n)+4, py(history.sem[n-1]));
  ctx.fillStyle = '#F59E0B';
  ctx.fillText('RL',  px(n-1,n)+4, py(history.rl[n-1]));

  // Axis
  ctx.font = '10px Inter'; ctx.fillStyle = 'rgba(148,163,184,0.6)'; ctx.textAlign='right';
  [0,0.25,0.5,0.75,1].forEach(f => {
    ctx.fillText(Math.round(maxV*f), pad.l-4, py(maxV*f)+3);
  });
  ctx.textAlign='center';
  ctx.fillStyle = 'rgba(148,163,184,0.5)';
  ctx.fillText('Cycle', W/2, H-2);
}

function renderAEChart() {
  const canvas = document.getElementById('chart-ae');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;
  const ctx = ctxAE;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = 'rgba(10,15,30,0.95)'; ctx.fillRect(0,0,W,H);

  const pad = {t:10,r:10,b:30,l:45};
  const cW = W-pad.l-pad.r, cH = H-pad.t-pad.b;
  const n = history.ae.length; if (n<2) return;

  const maxAE = Math.max(...history.ae.map(Math.abs), 0.5)*1.2;
  function px(i) { return pad.l + (i/(n-1))*cW; }
  function py(v) { return pad.t + cH*(0.5 - v/(maxAE*2)); }

  // Zero line
  ctx.beginPath(); ctx.moveTo(pad.l, py(0)); ctx.lineTo(W-pad.r, py(0));
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth=1; ctx.stroke();

  // Fill above zero (green) and below (red)
  ctx.beginPath();
  ctx.moveTo(px(0), py(0));
  history.ae.forEach((v,i) => ctx.lineTo(px(i), py(Math.max(0,v))));
  ctx.lineTo(px(n-1), py(0));
  ctx.fillStyle = 'rgba(16,185,129,0.2)'; ctx.fill();

  ctx.beginPath();
  ctx.moveTo(px(0), py(0));
  history.ae.forEach((v,i) => ctx.lineTo(px(i), py(Math.min(0,v))));
  ctx.lineTo(px(n-1), py(0));
  ctx.fillStyle = 'rgba(239,68,68,0.15)'; ctx.fill();

  ctx.shadowColor = '#2DD4BF'; ctx.shadowBlur = 6;
  drawLine(ctx, history.ae, n, i=>px(i), py, '#2DD4BF', 1.8);
  ctx.shadowBlur = 0;

  ctx.font = '9px Inter'; ctx.fillStyle = 'rgba(148,163,184,0.6)'; ctx.textAlign='right';
  ctx.fillText(`+${maxAE.toFixed(2)}`, pad.l-3, pad.t+8);
  ctx.fillText('0', pad.l-3, py(0)+3);
  ctx.fillText(`−${maxAE.toFixed(2)}`, pad.l-3, H-pad.b-5);
}

function renderPhaseChart() {
  const canvas = document.getElementById('chart-phase');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;
  const ctx = ctxPh;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = 'rgba(10,15,30,0.95)'; ctx.fillRect(0,0,W,H);

  const pad = {t:20,r:20,b:35,l:45};
  const cW = W-pad.l-pad.r, cH = H-pad.t-pad.b;

  const maxL = 0.12;
  const leff_for = (lc, lp) => P.alpha*lc + (1-P.alpha)*lp;
  const suffRHS = (P.sigma**2)/2 + P.pfail*get_mu_fail() + 0.001;

  // Draw gradient background
  for (let xi = 0; xi < 50; xi++) {
    for (let yi = 0; yi < 50; yi++) {
      const lc = (xi/49)*maxL, lp = (yi/49)*maxL;
      const le = leff_for(lc,lp);
      const above = le > suffRHS;
      const x = pad.l + (lc/maxL)*cW;
      const y = pad.t + cH - (lp/maxL)*cH;
      ctx.fillStyle = above ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)';
      ctx.fillRect(x, y, cW/49+1, cH/49+1);
    }
  }

  // Boundary line
  ctx.beginPath();
  let first = true;
  for (let xi = 0; xi <= 100; xi++) {
    const lc = (xi/100)*maxL;
    // λ_eff = suffRHS → α*lc + (1-α)*lp = suffRHS → lp = (suffRHS - α*lc)/(1-α)
    const lp = (suffRHS - P.alpha*lc)/(1-P.alpha);
    if (lp < 0 || lp > maxL) continue;
    const x = pad.l + (lc/maxL)*cW;
    const y = pad.t + cH - (lp/maxL)*cH;
    if (first) { ctx.moveTo(x,y); first=false; } else ctx.lineTo(x,y);
  }
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.5;
  ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);

  // Current point
  const cx = pad.l + (P.lcog/maxL)*cW;
  const cy = pad.t + cH - (P.lphys/maxL)*cH;
  ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI*2);
  const leff = get_leff();
  ctx.fillStyle = leff > suffRHS ? '#10B981' : '#EF4444';
  ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2);
  ctx.strokeStyle = leff > suffRHS ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)';
  ctx.lineWidth = 2; ctx.stroke();

  // Labels
  ctx.font = '10px Inter'; ctx.fillStyle = 'rgba(148,163,184,0.7)'; ctx.textAlign='center';
  ctx.fillText('λ_cog', W/2, H-5);
  ctx.save(); ctx.translate(10, H/2); ctx.rotate(-Math.PI/2);
  ctx.fillText('λ_phys', 0, 0); ctx.restore();
  ctx.fillStyle = 'rgba(16,185,129,0.7)'; ctx.fillText('GROWTH', pad.l+cW*0.7, pad.t+15);
  ctx.fillStyle = 'rgba(239,68,68,0.7)'; ctx.fillText('FAILURE', pad.l+cW*0.2, pad.t+cH-10);
}

function renderAcceptanceChart() {
  const canvas = document.getElementById('chart-acceptance');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;
  const ctx = ctxAcc;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = 'rgba(10,15,30,0.95)'; ctx.fillRect(0,0,W,H);

  const data = history.accept;
  if (data.length < 2) return;

  const pad = {t:10,r:10,b:30,l:40};
  const cW = W-pad.l-pad.r, cH = H-pad.t-pad.b;
  const maxC = Math.max(...data.map(d=>d.x));
  function px(d) { return pad.l + (d.x/maxC)*cW; }
  function py(d) { return pad.t + cH*(1-d.y); }

  // Bar chart
  const barW = Math.max(3, cW / data.length * 0.8);
  data.forEach(d => {
    const x = px(d), h = d.y*cH;
    const grad = ctx.createLinearGradient(0,pad.t+cH-h,0,pad.t+cH);
    grad.addColorStop(0,'rgba(59,130,246,0.8)'); grad.addColorStop(1,'rgba(13,148,136,0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(x-barW/2, pad.t+cH-h, barW, h);
  });

  // Reference line at 0.93 (theorem sufficient region)
  const yLine = pad.t + cH*(1-0.93);
  ctx.beginPath(); ctx.moveTo(pad.l,yLine); ctx.lineTo(W-pad.r,yLine);
  ctx.strokeStyle='rgba(16,185,129,0.4)'; ctx.lineWidth=1; ctx.setLineDash([4,3]);
  ctx.stroke(); ctx.setLineDash([]);
  ctx.font='9px Inter'; ctx.fillStyle='rgba(16,185,129,0.7)'; ctx.textAlign='right';
  ctx.fillText('93%',pad.l-3,yLine+3);

  ctx.fillStyle='rgba(148,163,184,0.6)'; ctx.textAlign='center';
  ctx.font='10px Inter';
  ctx.fillText('Cycle', W/2, H-2);
}

// ── Utility ───────────────────────────────────────────────────
function drawLine(ctx, data, n, px, py, color, width) {
  if (n < 2) return;
  ctx.beginPath();
  ctx.moveTo(px(0,n), py(data[0]));
  for (let i = 1; i < n; i++) ctx.lineTo(px(i,n), py(data[i]));
  ctx.strokeStyle = color; ctx.lineWidth = width;
  ctx.lineJoin = 'round'; ctx.stroke();
}

function drawGridLines(ctx, pad, cW, cH, W, H, maxV) {
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const y = pad.t + (g/4)*cH;
    ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
  }
}

function logEvent(msg, type) {
  const log = document.getElementById('activity-log');
  const line = document.createElement('div');
  line.className = `log-line log-${type}`;
  const ts = String(cycle).padStart(4,'0');
  line.textContent = `[${ts}] ${msg}`;
  log.insertBefore(line, log.firstChild);
  while (log.children.length > 40) log.removeChild(log.lastChild);
}

// ── Controls ──────────────────────────────────────────────────
function updateParam(key, val) {
  P[key] = parseFloat(val);
  const display = { lcog:'lcog', lphys:'lphys', sigma:'sigma', pfail:'pfail', cmax:'cmax', alpha:'alpha' };
  const el = document.getElementById(`val-${display[key]}`);
  if (el) el.textContent = parseFloat(val).toFixed(3).replace(/\.?0+$/,'');
  updateRegimeIndicators();
}
window.updateParam = updateParam;

function toggleRun() {
  running = !running;
  document.getElementById('run-btn').innerHTML = running ? '⏸ Pause' : '▶ Run';
}
window.toggleRun = toggleRun;

function resetSim() {
  running = false;
  cycle = 0; failures = 0;
  semC = 8.5; rlC = 8.5; statC = 8.5;
  history = { sem:[], rl:[], stat:[], ae:[], accept:[] };
  recentAcceptances = [];
  document.getElementById('activity-log').innerHTML = '';
  document.getElementById('run-btn').innerHTML = '▶ Run';
  running = true;
  document.getElementById('run-btn').innerHTML = '⏸ Pause';
}
window.resetSim = resetSim;

let simSpeed = 1, speedLabels = [1,2,5,10];
let speedIdx = 0;
function toggleSpeed() {
  speedIdx = (speedIdx+1) % speedLabels.length;
  simSpeed = speedLabels[speedIdx];
  document.getElementById('speed-label').textContent = simSpeed + '×';
}
window.toggleSpeed = toggleSpeed;

// ── Main loop ─────────────────────────────────────────────────
let lastRender = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  if (!running) return;

  frameCount++;
  for (let i = 0; i < simSpeed; i++) stepSim();

  if (ts - lastRender > 80) { // ~12fps render
    lastRender = ts;
    renderCapabilityChart();
    renderAEChart();
    renderPhaseChart();
    renderAcceptanceChart();
  }
}

// Init log
logEvent('Simulation initialized. Parameters loaded from theorem defaults.', 'info');
logEvent(`Sufficient condition: λ_eff=${get_leff().toFixed(3)} > σ²/2+p_fail·μ_fail+δK/C0`, 'info');
running = true;
requestAnimationFrame(loop);
