/**
 * Residentialist Dashboard — Shared Utilities
 */

// ── Admin Mode ──────────────────────────────────────────────────────────────
const AdminMode = {
  KEY: 'residentialist_admin_mode',
  
  isAdmin() {
    try {
      return localStorage.getItem(this.KEY) !== 'public';
    } catch {
      return true; // default admin
    }
  },
  
  toggle() {
    try {
      const current = this.isAdmin();
      localStorage.setItem(this.KEY, current ? 'public' : 'admin');
    } catch {}
    this.updateUI();
    return this.isAdmin();
  },
  
  updateUI() {
    const btn = document.getElementById('mode-toggle');
    if (!btn) return;
    const isAdmin = this.isAdmin();
    btn.classList.toggle('admin', isAdmin);
    btn.innerHTML = isAdmin
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>ADMIN</span>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="1" y1="1" x2="23" y2="23"/></svg><span>PUBLIC</span>`;
    // Dispatch event for other modules
    document.dispatchEvent(new CustomEvent('admin-mode-changed', { detail: { isAdmin } }));
  }
};

// ── Score Formatting ────────────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 8.0) return 'green';
  if (score >= 6.5) return 'amber';
  return 'red';
}

function scoreCSSColor(score) {
  if (score >= 8.0) return 'var(--score-green)';
  if (score >= 6.5) return 'var(--score-amber)';
  return 'var(--score-red)';
}

function scoreHex(score) {
  if (score >= 8.0) return '#3fb950';
  if (score >= 6.5) return '#d29922';
  return '#f85149';
}

function formatScore(score) {
  if (score === null || score === undefined) return '—';
  return Math.round(parseFloat(score));
}

function getTier(score) { if (score >= 90) return 'Best in Class'; if (score >= 75) return 'Excellent'; if (score >= 60) return 'Good'; if (score >= 40) return 'Fair'; return 'Poor'; }
function getGrade(score) { return getTier(score); }

function getOutlook(score) {
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Positive';
  if (score >= 60) return 'Stable';
  if (score >= 50) return 'Watch';
  return 'Concern';
}

function outlookClass(outlook) {
  return (outlook || '').toLowerCase().replace(/\s+/g, '-');
}

// ── Score Circle SVG ────────────────────────────────────────────────────────
function createScoreCircleSVG(score, size = 'sm') {
  const r = size === 'lg' ? 44 : 22;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(score / 100, 1);
  const offset = circumference * (1 - pct);
  const color = scoreCSSColor(score);
  const cx = size === 'lg' ? 50 : 26;
  const cy = cx;
  const viewBox = size === 'lg' ? '0 0 100 100' : '0 0 52 52';

  return `
    <div class="score-circle-${size}">
      <svg viewBox="${viewBox}">
        <circle class="track" cx="${cx}" cy="${cy}" r="${r}" />
        <circle class="fill" cx="${cx}" cy="${cy}" r="${r}"
          stroke="${color}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}" />
      </svg>
      <span class="score-value-${size}" style="color: ${color}">${formatScore(score)}</span>
    </div>`;
}

// ── Grade Badge ─────────────────────────────────────────────────────────────
function createGradeBadge(score, extraClass = '') {
  const grade = typeof score === 'string' ? score : getGrade(score);
  const numScore = typeof score === 'number' ? score : 8;
  const color = scoreColor(typeof score === 'number' ? score : numScore);
  return `<span class="grade-badge ${color} ${extraClass}">${grade}</span>`;
}

// ── Outlook Badge ───────────────────────────────────────────────────────────
function createOutlookBadge(score) {
  const outlook = typeof score === 'string' ? score : getOutlook(score);
  const cls = outlookClass(outlook);
  const arrows = { 'strong': '↑', 'positive': '↗', 'stable': '→', 'watch': '↘', 'concern': '↓' };
  return `<span class="outlook-badge ${cls}">${arrows[cls] || '→'} ${outlook}</span>`;
}

// ── Spark Bars ──────────────────────────────────────────────────────────────
function createSparkBars(q, d, p) {
  const maxH = 22;
  const labels = ['Q', 'D', 'P'];
  const scores = [q, d, p];
  return `<div class="card-bars">${scores.map((s, i) => {
    const h = Math.max(2, (s / 10) * maxH);
    const c = scoreCSSColor(s);
    return `<div class="spark-bar" style="height:${h}px;background:${c}">
      <span class="spark-bar-label">${labels[i]}</span>
    </div>`;
  }).join('')}</div>`;
}

// ── Source Anonymizer ───────────────────────────────────────────────────────
const SOURCE_ANON_MAP = [
  { pattern: /reddit/i, category: 'Online Community Discussion' },
  { pattern: /gba/i, category: 'Building Science Forum' },
  { pattern: /green\s*building\s*advisor/i, category: 'Building Science Forum' },
  { pattern: /houzz/i, category: 'Home Improvement Forum' },
  { pattern: /contractor\s*talk/i, category: 'Industry Professional Forum' },
  { pattern: /jlc/i, category: 'Building Trade Publication' },
  { pattern: /fine\s*homebuilding/i, category: 'Building Trade Publication' },
  { pattern: /energy\s*vanguard/i, category: 'Building Science Professional' },
  { pattern: /building\s*science/i, category: 'Building Science Organization' },
  { pattern: /this\s*old\s*house/i, category: 'Home Improvement Media' },
  { pattern: /window\s*nerd/i, category: 'Industry Blog' }
];

let _anonCounters = {};

function anonymizeSource(name, pool) {
  for (const map of SOURCE_ANON_MAP) {
    if (map.pattern.test(name)) {
      const key = `${map.category}_${pool}`;
      _anonCounters[key] = (_anonCounters[key] || 0) + 1;
      return `${map.category} #${_anonCounters[key]} (Pool ${pool})`;
    }
  }
  _anonCounters['Other'] = (_anonCounters['Other'] || 0) + 1;
  return `Professional Source #${_anonCounters['Other']} (Pool ${pool})`;
}

function resetAnonCounters() {
  _anonCounters = {};
}

// ── API Helpers ─────────────────────────────────────────────────────────────
function getBasePath() {
  return location.pathname.startsWith('/scores') ? '/scores/' : '/';
}

async function fetchAPI(endpoint) {
  const base = getBasePath();
  const res = await fetch(`${base}api/${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── DOM Helpers ─────────────────────────────────────────────────────────────
function el(tag, attrs = {}, children = '') {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') e.className = v;
    else if (k === 'innerHTML') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  }
  if (typeof children === 'string') e.innerHTML = children;
  else if (children instanceof Node) e.appendChild(children);
  else if (Array.isArray(children)) children.forEach(c => { if (c) e.appendChild(c); });
  return e;
}

function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

// ── Date Formatting ─────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── SVG Icons ───────────────────────────────────────────────────────────────
const ICONS = {
  chevronDown: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>',
  alertTriangle: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  alertCircle: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  flag: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
  externalLink: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>'
};

// ── Header Setup ────────────────────────────────────────────────────────────
function initHeader() {
  AdminMode.updateUI();
  const btn = document.getElementById('mode-toggle');
  if (btn) btn.addEventListener('click', () => AdminMode.toggle());
}

// ── Product ID from URL ─────────────────────────────────────────────────────
function getProductIdFromURL() {
  const parts = window.location.pathname.split('/');
  const idx = parts.indexOf('product');
  if (idx >= 0 && parts[idx + 1]) return parseInt(parts[idx + 1]);
  const params = new URLSearchParams(window.location.search);
  return params.get('id') ? parseInt(params.get('id')) : null;
}
