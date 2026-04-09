/* ══  MINI CHART — Homepage results preview  ══════════════════ */
(function() {
  const canvas = document.getElementById('mini-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const W = canvas.width = 500;
  const H = canvas.height = 280;

  // Generate SEM trajectory (logistic growth with noise)
  function semData(n) {
    const pts = [];
    let c = 8.5;
    const cmax = 1000;
    const leff = 0.044;
    for (let i = 0; i < n; i++) {
      const noise = (Math.random() - 0.5) * 0.08 * c;
      const fail = Math.random() < 0.07;
      if (!fail) c = c + leff * c * (1 - c/cmax) + noise;
      else c = Math.max(c * 0.95, 8.5);
      pts.push(c);
    }
    return pts;
  }
  function rlData(n) {
    const pts = [];
    let c = 8.5;
    for (let i = 0; i < n; i++) {
      c = c + 0.008 * c * (1 - c/80) + (Math.random()-0.5)*0.5;
      pts.push(Math.min(c, 80));
    }
    return pts;
  }
  function staticData(n) {
    return Array(n).fill(8.5).map(v => v + (Math.random()-0.5)*0.3);
  }

  const T = 80;
  const sem   = semData(T);
  const rl    = rlData(T);
  const stat  = staticData(T);

  const pad = { top: 20, right: 20, bottom: 40, left: 55 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  function toX(i) { return pad.left + (i / (T-1)) * cW; }
  function toY(v, maxV) { return pad.top + cH - (v / maxV) * cH; }

  const maxV = Math.max(...sem) * 1.1;

  function drawGrid() {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let g = 0; g <= 5; g++) {
      const y = pad.top + (g/5)*cH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      const val = Math.round(maxV * (1 - g/5));
      ctx.fillStyle = 'rgba(148,163,184,0.6)';
      ctx.font = '11px Inter'; ctx.textAlign = 'right';
      ctx.fillText(val, pad.left - 8, y + 4);
    }
    // X axis labels
    for (let g = 0; g <= 4; g++) {
      const x = pad.left + (g/4)*cW;
      ctx.fillStyle = 'rgba(148,163,184,0.6)';
      ctx.font = '11px Inter'; ctx.textAlign = 'center';
      ctx.fillText(Math.round((g/4)*(T-1)), x, H - pad.bottom + 18);
    }
    ctx.fillStyle = 'rgba(148,163,184,0.7)';
    ctx.font = '11px Inter'; ctx.textAlign = 'center';
    ctx.fillText('Evolutionary Cycle t', W/2, H - 5);
    ctx.save(); ctx.translate(12, H/2); ctx.rotate(-Math.PI/2);
    ctx.fillText('Capability C(t)', 0, 0); ctx.restore();
  }

  let frame = 0;
  const totalFrames = 90;

  function drawLine(data, color, lineW, maxFr, label) {
    const drawN = Math.min(data.length, Math.round((maxFr / totalFrames) * data.length));
    if (drawN < 2) return;
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0], maxV));
    for (let i = 1; i < drawN; i++) {
      ctx.lineTo(toX(i), toY(data[i], maxV));
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function drawShaded(data, color, maxFr) {
    const drawN = Math.min(data.length, Math.round((maxFr / totalFrames) * data.length));
    if (drawN < 2) return;
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0]*1.15, maxV));
    for (let i = 1; i < drawN; i++) ctx.lineTo(toX(i), toY(data[i]*1.15, maxV));
    for (let i = drawN-1; i >= 0; i--) ctx.lineTo(toX(i), toY(data[i]*0.85, maxV));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    // Background
    const bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0, 'rgba(11,17,36,0.95)');
    bg.addColorStop(1, 'rgba(2,6,23,0.95)');
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,W,H);

    drawGrid();

    const f = Math.min(frame, totalFrames);

    // Shaded confidence band for SEM
    drawShaded(sem, 'rgba(59,130,246,0.08)', f);

    // Lines
    drawLine(stat, 'rgba(107,114,128,0.7)', 1.5, f);
    drawLine(rl,   '#F59E0B', 1.8, f);
    drawLine(sem,  '#3B82F6', 2.5, f);

    // Endpoint dots
    const drawN = Math.min(T, Math.round((f/totalFrames)*T));
    if (drawN >= T) {
      [[sem,'#60A5FA'],[rl,'#FCD34D'],[stat,'#9CA3AF']].forEach(([d,c]) => {
        ctx.beginPath();
        ctx.arc(toX(drawN-1), toY(d[drawN-1], maxV), 5, 0, Math.PI*2);
        ctx.fillStyle = c;
        ctx.fill();
      });
    }

    if (frame < totalFrames) { frame++; requestAnimationFrame(render); }
  }

  // Trigger when visible
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { frame = 0; render(); obs.disconnect(); }
  }, { threshold: 0.4 });
  obs.observe(canvas);
})();
