/* ══  PAPER PAGE  ════════════════════════════════════════════ */
body { padding-top: 70px; }

.paper-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: calc(100vh - 70px);
  max-width: 1300px;
  margin: 0 auto;
}

/* ── SIDEBAR ── */
.paper-sidebar {
  position: sticky;
  top: 70px;
  height: calc(100vh - 70px);
  overflow-y: auto;
  background: #0A0F1E;
  border-right: 1px solid rgba(37,99,235,0.15);
  padding: 2rem 1.2rem;
  font-size: 0.85rem;
}
.sidebar-section { margin-bottom: 2rem; }
.sb-label {
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--grey);
  margin-bottom: 0.7rem;
}
.ptoc-link {
  display: block; padding: 0.3rem 0.6rem;
  border-radius: 5px; color: var(--grey);
  font-size: 0.82rem; transition: var(--transition);
  margin-bottom: 0.1rem;
}
.ptoc-link:hover, .ptoc-link.active {
  color: white; background: rgba(37,99,235,0.15);
}

.qf-item {
  display: flex; justify-content: space-between;
  padding: 0.35rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  font-size: 0.8rem;
}
.qf-k { color: var(--grey); }
.qf-v { color: var(--blue-glow); font-weight: 700; font-family: var(--font-mono); }

.sb-link {
  display: block; padding: 0.4rem 0.6rem;
  border-radius: 6px; color: var(--grey);
  font-size: 0.82rem; transition: var(--transition);
  margin-bottom: 0.3rem;
}
.sb-link:hover { color: white; background: rgba(37,99,235,0.1); }

/* ── PAPER MAIN ── */
.paper-main {
  padding: 3rem 4rem 6rem;
  max-width: 900px;
  line-height: 1.8;
}

/* Title block */
.paper-title-block { margin-bottom: 2.5rem; }
.paper-journal-tag {
  font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--blue-glow);
  margin-bottom: 1rem;
}
.paper-title {
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900; color: white;
  margin-bottom: 0.5rem;
}
.paper-subtitle {
  font-family: var(--font-sans);
  font-size: 1rem; font-weight: 400;
  color: var(--grey-light);
  line-height: 1.6;
  margin-bottom: 2rem;
}
.paper-authors {
  display: flex; gap: 1.5rem; align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.pa-sep { color: var(--grey); font-size: 1.2rem; }
.pa-name { font-weight: 700; color: white; font-size: 0.95rem; }
.pa-item.main .pa-name { color: var(--blue-glow); font-size: 1rem; }
.pa-role { font-size: 0.72rem; color: var(--grey); }
.paper-keywords {
  display: flex; flex-wrap: wrap; gap: 0.4rem;
  margin-top: 1rem;
}
.paper-keywords span {
  padding: 0.2rem 0.7rem;
  background: rgba(37,99,235,0.1);
  border: 1px solid rgba(37,99,235,0.2);
  border-radius: 4px;
  font-size: 0.72rem; color: var(--grey-light);
}

.paper-divider {
  border: none;
  border-top: 1px solid rgba(37,99,235,0.2);
  margin: 2rem 0;
}

/* Sections */
.paper-section { margin-bottom: 3.5rem; scroll-margin-top: 90px; }
.sec-head {
  font-size: 1.3rem; font-weight: 800;
  color: white; margin-bottom: 1.2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(37,99,235,0.3);
  display: flex; align-items: center; gap: 0.6rem;
}
.sec-num { color: var(--blue-glow); font-family: var(--font-mono); font-size: 0.9em; }
.subsec-head {
  font-size: 1rem; font-weight: 700;
  color: var(--teal-light);
  margin: 1.5rem 0 0.7rem;
}
.paper-section p { margin-bottom: 0.9rem; }

/* Equations */
.paper-eq {
  font-family: var(--font-mono);
  font-size: 1rem; color: white;
  padding: 0.8rem 1.2rem;
  background: rgba(37,99,235,0.07);
  border-left: 3px solid var(--blue);
  border-radius: 0 8px 8px 0;
  margin: 1rem 0;
  overflow-x: auto;
}
.paper-eq.large { font-size: 0.88rem; }
.paper-eq.in-theorem { background: rgba(0,0,0,0.3); }
.paper-eq.fr { border-left-color: var(--red); color: #FCA5A5; }

/* Abstract box */
.abstract-box {
  padding: 1.5rem 2rem;
  background: rgba(37,99,235,0.05);
  border: 1px solid rgba(37,99,235,0.2);
  border-radius: var(--radius-lg);
}
.abstract-box p { font-size: 0.92rem; }

/* Lists */
.paper-list {
  padding-left: 1.5rem;
  display: flex; flex-direction: column; gap: 0.6rem;
  margin: 1rem 0;
}
.paper-list li {
  color: var(--grey-light);
  font-size: 0.93rem;
  padding-left: 0.3rem;
}

/* Numbered contributions */
.contrib-numbered { display: flex; flex-direction: column; gap: 0.8rem; margin: 1rem 0; }
.cn-item {
  display: flex; gap: 1rem; align-items: flex-start;
  padding: 0.8rem 1rem;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(37,99,235,0.15);
  border-radius: 10px;
  font-size: 0.9rem;
}
.cn-num {
  background: var(--blue);
  color: white; font-weight: 900;
  font-size: 0.75rem; font-family: var(--font-mono);
  width: 26px; height: 26px; border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* Tables */
.paper-table-wrap { overflow-x: auto; margin: 1.5rem 0; }
.paper-table {
  width: 100%; border-collapse: collapse;
  font-size: 0.85rem;
}
.paper-table th {
  background: rgba(37,99,235,0.2);
  color: white; font-weight: 700;
  padding: 0.7rem 0.9rem;
  text-align: left;
  border: 1px solid rgba(37,99,235,0.2);
  white-space: nowrap;
}
.paper-table td {
  padding: 0.6rem 0.9rem;
  border: 1px solid rgba(255,255,255,0.05);
  color: var(--grey-light);
  vertical-align: top;
}
.paper-table tr:hover td { background: rgba(255,255,255,0.02); }
.paper-table .highlight-row td { color: white; background: rgba(37,99,235,0.06); }
.table-caption {
  font-size: 0.78rem; color: var(--grey);
  font-style: italic; margin-top: 0.5rem; text-align: center;
}

/* Theorem */
.theorem-block {
  padding: 2rem;
  background: rgba(37,99,235,0.05);
  border: 2px solid rgba(37,99,235,0.35);
  border-radius: var(--radius-lg);
  margin: 1.5rem 0;
}
.theorem-header {
  font-weight: 900; font-family: var(--font-mono);
  color: white; font-size: 1rem;
  margin-bottom: 0.8rem;
}
.theorem-preamble { font-size: 0.88rem; color: var(--grey-light); margin-bottom: 1rem; }
.theorem-part { margin: 1.2rem 0; padding: 1rem; border-radius: 8px; }
.tp-tag {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; margin-bottom: 0.5rem;
}
.tp-tag.nec { color: #10B981; }
.tp-tag.suf { color: var(--blue-glow); }
.tp-tag.fail { color: var(--red); }
.theorem-note { font-size: 0.78rem; color: var(--grey); font-family: var(--font-mono); margin-top: 0.4rem; }

/* Failure regime cards */
.fr-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; margin: 1.5rem 0; }
.fr-card {
  padding: 1.2rem; border-radius: var(--radius);
  border: 1px solid;
}
.fr-card.red { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }
.fr-card.yellow { border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.05); }
.fr-card.purple { border-color: rgba(139,92,246,0.3); background: rgba(139,92,246,0.05); }
.fr-tag {
  font-family: var(--font-mono); font-weight: 700; font-size: 0.75rem;
  margin-bottom: 0.3rem;
}
.fr-card.red .fr-tag { color: var(--red); }
.fr-card.yellow .fr-tag { color: var(--gold); }
.fr-card.purple .fr-tag { color: #A78BFA; }
.fr-name { font-weight: 700; color: white; font-size: 0.9rem; margin-bottom: 0.6rem; }
.fr-card p { font-size: 0.82rem; }

/* Architecture diagram */
.arch-diagram {
  display: flex; flex-direction: column; gap: 0; align-items: center;
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: rgba(10,15,30,0.8);
  border: 1px solid rgba(37,99,235,0.2);
  border-radius: var(--radius-lg);
}
.arch-layer {
  width: 100%; max-width: 480px;
  padding: 0.7rem 1.2rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--lc);
  border-radius: 8px;
  position: relative;
}
.arch-layer.center-gate { max-width: 320px; }
.arch-layer.safety { border-width: 2px; background: rgba(239,68,68,0.05); }
.al-num {
  font-family: var(--font-mono); font-size: 0.7rem;
  font-weight: 700; color: var(--lc);
  margin-bottom: 0.2rem;
}
.al-name { font-weight: 700; color: white; font-size: 0.85rem; }
.al-desc { font-size: 0.75rem; color: var(--grey); margin-top: 0.2rem; }
.al-arrow {
  text-align: center; font-size: 1.2rem;
  color: var(--lc); margin: 0.3rem 0;
  width: 100%; max-width: 480px;
}
.arch-row {
  display: flex; gap: 1rem; align-items: center;
  width: 100%; justify-content: center;
  margin: 0;
}
.arch-layer.side { max-width: 200px; min-width: 160px; }
.arch-connector {
  font-size: 0.7rem; color: var(--blue-glow);
  white-space: nowrap; font-family: var(--font-mono);
  padding: 0.3rem;
}
.arch-caption {
  font-size: 0.78rem; color: var(--grey);
  font-style: italic; text-align: center;
  margin-top: 0.8rem;
}
.arch-caption a { color: var(--blue-glow); }

/* Code block */
.code-block {
  background: #0D1117;
  border: 1px solid rgba(37,99,235,0.2);
  border-radius: var(--radius);
  padding: 1.2rem 1.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}
.code-block pre {
  font-family: var(--font-mono);
  font-size: 0.8rem; color: #E2E8F0;
  line-height: 1.7; white-space: pre;
}

/* Charts in paper */
.results-inline {
  margin: 1.5rem 0;
  padding: 1.2rem;
  background: rgba(10,15,30,0.8);
  border: 1px solid rgba(37,99,235,0.2);
  border-radius: var(--radius-lg);
}
.results-inline canvas { width: 100% !important; display: block; }
.chart-cap {
  font-size: 0.78rem; color: var(--grey);
  font-style: italic; text-align: center;
  margin-top: 0.7rem;
}
.chart-cap a { color: var(--blue-glow); }

/* Conclusion */
.conclusion-box {
  padding: 2rem;
  background: rgba(37,99,235,0.05);
  border-left: 4px solid var(--blue);
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
}

/* References */
.references-list {
  padding-left: 2rem;
  display: flex; flex-direction: column; gap: 0.5rem;
}
.references-list li {
  font-size: 0.85rem; color: var(--grey-light);
  line-height: 1.65;
}
.references-list em { color: var(--teal-light); font-style: italic; }

@media (max-width: 1100px) {
  .paper-layout { grid-template-columns: 1fr; }
  .paper-sidebar { position: static; height: auto; border-right: none; border-bottom: 1px solid rgba(37,99,235,0.15); }
  .paper-main { padding: 2rem 1.5rem; }
  .fr-cards { grid-template-columns: 1fr; }
}
