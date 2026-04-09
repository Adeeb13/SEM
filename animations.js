/* ══  PAPER INLINE CHARTS  ════════════════════════════════════ */

function drawPaperChart(canvasId, type) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const W = canvas.width = canvas.offsetWidth || 700;
  const H = canvas.height = type === 'prototype' ? 250 : 280;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'rgba(10,15,30,0.98)'); bg.addColorStop(1,'rgba(2,6,23,0.98)');
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

  const pad = {t:15,r:30,b:40,l:55};
  const cW = W-pad.l-pad.r, cH = H-pad.t-pad.b;

  if (type === 'simulation') {
    // Generate data
    const sem = [], rl = [], stat = [];
    let c=8.5, rlc=8.5;
    for (let i=0;i<100;i++) {
      const fail = Math.random()<0.07;
      const noise = (Math.random()-0.5)*0.08*c;
      if (!fail) c = c + 0.044*c*(1-c/900) - 0.00003*c + noise;
      else c = Math.max(c*0.96,8.5);
      sem.push(Math.min(c,900));
      rlc = Math.min(rlc + 0.008*rlc*(1-rlc/80) + (Math.random()-0.5)*0.4, 80);
      rl.push(Math.max(8.5,rlc));
      stat.push(8.5+(Math.random()-0.5)*0.3);
    }
    const maxV = Math.max(...sem)*1.08;
    const px = i => pad.l + (i/99)*cW;
    const py = v => pad.t + cH*(1-v/maxV);

    // Grid
    ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1;
    [0,0.25,0.5,0.75,1].forEach(f=>{
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t+cH*f); ctx.lineTo(W-pad.r, pad.t+cH*f); ctx.stroke();
    });

    // Shaded band for SEM
    ctx.beginPath();
    for(let i=0;i<100;i++) ctx.lineTo(px(i), py(sem[i]*1.12));
    for(let i=99;i>=0;i--) ctx.lineTo(px(i), py(sem[i]*0.88));
    ctx.fillStyle='rgba(59,130,246,0.07)'; ctx.fill();

    // Lines
    const drawL = (data,color,lw) => {
      ctx.beginPath(); data.forEach((v,i)=>i===0?ctx.moveTo(px(i),py(v)):ctx.lineTo(px(i),py(v)));
      ctx.strokeStyle=color; ctx.lineWidth=lw; ctx.lineJoin='round'; ctx.stroke();
    };
    drawL(stat,'rgba(107,114,128,0.6)',1.2);
    drawL(rl,'#F59E0B',1.8);
    ctx.shadowColor='#3B82F6'; ctx.shadowBlur=8; drawL(sem,'#3B82F6',2.5); ctx.shadowBlur=0;

    // Dots
    [[sem,'#60A5FA'],[rl,'#FCD34D'],[stat,'#6B7280']].forEach(([d,c])=>{
      ctx.beginPath(); ctx.arc(px(99),py(d[99]),4,0,Math.PI*2); ctx.fillStyle=c; ctx.fill();
    });

    // Labels
    ctx.font='11px Inter'; ctx.fillStyle='#60A5FA'; ctx.textAlign='left';
    ctx.fillText('SEM',W-pad.r+4,py(sem[99])+3);

    // Axis labels
    ctx.fillStyle='rgba(148,163,184,0.6)'; ctx.font='11px Inter'; ctx.textAlign='right';
    [0,0.25,0.5,0.75,1].forEach(f=>ctx.fillText(Math.round(maxV*(1-f)),pad.l-5,pad.t+cH*f+4));
    ctx.textAlign='center'; ctx.fillText('Evolutionary Cycle t',W/2,H-5);
    ctx.save(); ctx.translate(12,H/2); ctx.rotate(-Math.PI/2); ctx.fillText('Capability C(t)',0,0); ctx.restore();

  } else {
    // Prototype chart
    const sem = [], stat = [];
    let c=40.5;
    for(let i=0;i<51;i++){
      const gain = 8*(1-c/90)*(1-i/60);
      if(Math.random()<0.12) c=Math.max(c-1.5,38);
      else c=Math.min(c+gain*(0.8+Math.random()*0.4),90);
      sem.push(c);
      stat.push(38.2+(Math.random()-0.5)*1.5);
    }
    sem[0]=40.5; sem[50]=78.3;
    const maxV=95, minV=28;
    const rng=maxV-minV;
    const px=i=>pad.l+(i/50)*cW;
    const py=v=>pad.t+cH*(1-(v-minV)/rng);

    // Grid
    ctx.strokeStyle='rgba(255,255,255,0.04)'; ctx.lineWidth=1;
    [0,20,40,60,80].forEach(v=>{
      const y=py(v);
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke();
      ctx.fillStyle='rgba(148,163,184,0.6)'; ctx.font='11px Inter'; ctx.textAlign='right';
      ctx.fillText(v+'%',pad.l-5,y+4);
    });

    // Std dev band
    ctx.beginPath();
    for(let i=0;i<51;i++) ctx.lineTo(px(i),py(sem[i]+3.5));
    for(let i=50;i>=0;i--) ctx.lineTo(px(i),py(sem[i]-3.5));
    ctx.fillStyle='rgba(59,130,246,0.1)'; ctx.fill();

    const drawL=(data,color,lw)=>{
      ctx.beginPath(); data.forEach((v,i)=>i===0?ctx.moveTo(px(i),py(v)):ctx.lineTo(px(i),py(v)));
      ctx.strokeStyle=color; ctx.lineWidth=lw; ctx.lineJoin='round'; ctx.stroke();
    };
    drawL(stat,'rgba(107,114,128,0.7)',1.5);
    ctx.shadowColor='#3B82F6'; ctx.shadowBlur=8; drawL(sem,'#3B82F6',2.5); ctx.shadowBlur=0;

    // Endpoint annotation
    ctx.beginPath(); ctx.arc(px(50),py(78.3),5,0,Math.PI*2); ctx.fillStyle='#60A5FA'; ctx.fill();
    ctx.font='bold 11px Inter'; ctx.fillStyle='#60A5FA'; ctx.textAlign='left';
    ctx.fillText('78.3%  (+105%)',px(50)+8,py(78.3)+4);
    ctx.beginPath(); ctx.arc(px(0),py(40.5),4,0,Math.PI*2); ctx.fillStyle='#60A5FA'; ctx.fill();
    ctx.font='11px Inter'; ctx.fillStyle='rgba(148,163,184,0.7)';
    ctx.fillText('40.5%',px(0)+6,py(40.5)-5);

    // 38.2% static label
    ctx.fillStyle='rgba(107,114,128,0.8)'; ctx.textAlign='right';
    ctx.fillText('38.2% (static)',px(50)-5,py(38.2)-5);

    ctx.textAlign='center'; ctx.fillStyle='rgba(148,163,184,0.6)';
    ctx.fillText('Self-Modification Iteration',W/2,H-5);
    ctx.save(); ctx.translate(12,H/2); ctx.rotate(-Math.PI/2); ctx.fillText('Task Success Rate (%)',0,0); ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', ()=>{
  drawPaperChart('paper-chart','simulation');
  drawPaperChart('prototype-chart','prototype');
});
window.addEventListener('resize', ()=>{
  drawPaperChart('paper-chart','simulation');
  drawPaperChart('prototype-chart','prototype');
});
