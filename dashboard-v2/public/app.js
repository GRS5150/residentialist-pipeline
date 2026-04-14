/**
 * THE RESIDENTIALIST — Product Intelligence Workbench
 * Vanilla JS Single-Page Application
 *
 * Features:
 * - Three-tier navigation: Category Grid → Product Cards → Product Detail
 * - Inspector Bot: Click 🔍 on any source to analyze it with Haiku
 * - Action buttons: Remove Source, Remove Claim, Flag, Find Better Source, Accept
 * - Score preview before destructive actions
 * - Audit history log per product
 * - Active category filtering (10 active, toggle to show all)
 *
 * Hash routing:
 *   #/                              → Category Grid
 *   #/category/{slug}               → Product Cards
 *   #/category/{slug}/product/{id}  → Product Detail
 */

// ── State ───────────────────────────────────────────────────────────────────

let cache = {};
let showAllCategories = false;
let inspectorPanel = null; // current panel DOM reference

const app = document.getElementById('app');
const breadcrumb = document.getElementById('breadcrumb');
const crumbCategory = document.getElementById('crumb-category');
const crumbCategoryLink = document.getElementById('crumb-category-link');
const crumbProduct = document.getElementById('crumb-product');
const crumbProductName = document.getElementById('crumb-product-name');
const metaText = document.getElementById('meta-text');
const refreshBtn = document.getElementById('refresh-btn');

// ── Router ──────────────────────────────────────────────────────────────────

function route() {
  closeInspectorPanel();
  const hash = window.location.hash || '#/';
  const parts = hash.replace('#/', '').split('/').filter(Boolean);

  if (parts[0] === 'category' && parts[2] === 'product' && parts[3]) {
    showProductDetail(parts[1], parts[3]);
  } else if (parts[0] === 'category' && parts[1]) {
    showCategoryDetail(parts[1]);
  } else {
    showCategoryGrid();
  }
}

window.addEventListener('hashchange', route);

// ── API Helpers ─────────────────────────────────────────────────────────────

async function fetchAPI(endpoint, opts = {}) {
  const url = `/api/${endpoint}`;
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers }
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(errData.error || `API error: ${res.status}`);
  }
  return res.json();
}

async function postAPI(endpoint, body) {
  return fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(body) });
}

async function fetchCached(endpoint, ttl = 60000) {
  const now = Date.now();
  if (cache[endpoint] && (now - cache[endpoint].time) < ttl) {
    return cache[endpoint].data;
  }
  const data = await fetchAPI(endpoint);
  cache[endpoint] = { data, time: now };
  return data;
}

// ── Refresh Button ──────────────────────────────────────────────────────────

refreshBtn.addEventListener('click', async () => {
  refreshBtn.classList.add('spinning');
  try {
    cache = {};
    await fetchAPI('refresh');
    route();
  } catch (e) {
    console.error('Refresh failed:', e);
  } finally {
    refreshBtn.classList.remove('spinning');
  }
});

// ── Breadcrumb Helpers ──────────────────────────────────────────────────────

function updateBreadcrumb(category, product) {
  breadcrumb.style.display = 'flex';
  if (category) {
    crumbCategory.style.display = 'inline';
    crumbCategoryLink.textContent = category.name;
    crumbCategoryLink.href = `#/category/${category.slug}`;
  } else {
    crumbCategory.style.display = 'none';
  }
  if (product) {
    crumbProduct.style.display = 'inline';
    crumbProductName.textContent = product.name;
  } else {
    crumbProduct.style.display = 'none';
  }
}

function hideBreadcrumb() { breadcrumb.style.display = 'none'; }

// ── Utility ─────────────────────────────────────────────────────────────────

function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatSpecKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatSpecValue(val) {
  if (typeof val === 'string') return val.replace(/_/g, ' ');
  return String(val);
}

function tierClass(tier) { return `tier-${Math.min(tier || 5, 5)}`; }

function tierName(tier) {
  const names = { 1: 'Best in Class', 2: 'Excellent', 3: 'Good', 4: 'Fair', 5: 'Below Standard' };
  return names[tier] || 'Unranked';
}

function dotColor(status) {
  if (status === 'green') return 'green';
  if (status === 'yellow') return 'yellow';
  if (status === 'red') return 'red';
  return 'gray';
}

function healthLabel(status) {
  if (status === 'clean') return 'Clean';
  if (status === 'review') return 'Review';
  if (status === 'action') return 'Action';
  return 'N/A';
}

const EVIDENCE_STATUS = {
  full_confidence: { label: 'Full Confidence', cssClass: 'evidence-full', icon: '●' },
  scored_with_disclosure: { label: 'Scored with Disclosure', cssClass: 'evidence-disclosure', icon: '◐' },
  insufficient_evidence: { label: 'Insufficient Evidence', cssClass: 'evidence-insufficient', icon: '○' },
};

function evidenceBadge(status, compact = false) {
  const info = EVIDENCE_STATUS[status] || EVIDENCE_STATUS.insufficient_evidence;
  if (compact) {
    return `<span class="evidence-badge ${info.cssClass}" title="${info.label}">${info.icon} ${info.label}</span>`;
  }
  return `<span class="evidence-badge ${info.cssClass}">${info.icon} ${info.label}</span>`;
}

function showLoading() {
  app.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>`;
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

const arrowSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
const inspectSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

// Global context for the inspector panel
let currentCategory = null;
let currentProduct = null;

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 1: Category Grid
// ═══════════════════════════════════════════════════════════════════════════

async function showCategoryGrid() {
  hideBreadcrumb();
  showLoading();

  try {
    const endpoint = showAllCategories ? 'overview?all=true' : 'overview';
    const data = await fetchCached(endpoint, 30000);
    metaText.textContent = `${data.totalCategories} categories · ${data.totalProducts} products · Audit: ${data.auditDate || 'N/A'}`;

    const cats = data.categories;
    const clean = cats.filter(c => c.auditStatus === 'clean').length;
    const review = cats.filter(c => c.auditStatus === 'review').length;
    const action = cats.filter(c => c.auditStatus === 'action').length;

    let html = `<div class="view-enter">`;

    // ── Dark Hero Banner ──────────────────────────────────────────────
    html += `<div class="hero-banner">`;
    html += `<div class="hero-top-row">`;
    html += `<div>`;
    html += `<h1 class="hero-title">Product<br>Workbench</h1>`;
    html += `<p class="hero-subtitle">Inspect, verify, and remediate every product in the database. Click any source to analyze it.</p>`;
    html += `</div>`;
    html += `<div class="hero-stats">`;
    html += heroStat(data.totalCategories, 'Categories');
    html += heroStat(data.totalProducts, 'Products');
    html += heroStat(data.auditDate || '—', 'Last Audit');
    html += `</div></div>`;

    // Status pills + toggle
    html += `<div class="hero-status-row">`;
    if (clean > 0) html += `<span class="status-pill"><span class="pill-dot green"></span>${clean} Clean</span>`;
    if (review > 0) html += `<span class="status-pill"><span class="pill-dot yellow"></span>${review} Review</span>`;
    if (action > 0) html += `<span class="status-pill"><span class="pill-dot red"></span>${action} Action Required</span>`;

    if (data.allCategoryCount && data.allCategoryCount > data.totalCategories) {
      html += `<button class="toggle-all-btn" id="toggle-all">${showAllCategories ? 'Show active only' : `Show all ${data.allCategoryCount}`}</button>`;
    } else if (showAllCategories) {
      html += `<button class="toggle-all-btn" id="toggle-all">Show active only</button>`;
    }
    html += `</div></div>`;

    // ── Category Grid ─────────────────────────────────────────────────
    html += `<div class="category-grid">`;
    for (const cat of cats) {
      html += renderCategoryCard(cat);
    }
    html += `</div></div>`;

    app.innerHTML = html;

    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        window.location.hash = `#/category/${card.dataset.slug}`;
      });
    });

    const toggleBtn = document.getElementById('toggle-all');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showAllCategories = !showAllCategories;
        cache = {};
        showCategoryGrid();
      });
    }

  } catch (e) {
    app.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>Failed to load data: ${esc(e.message)}</p></div>`;
  }
}

function heroStat(value, label) {
  return `<div class="hero-stat"><div class="hero-stat-value">${value}</div><div class="hero-stat-label">${label}</div></div>`;
}

function renderCategoryCard(cat) {
  const stats = cat.auditStats || {};
  const pausedClass = cat.isActive === false ? ' category-paused' : '';
  return `
    <div class="category-card${pausedClass}" data-slug="${cat.slug}">
      <div class="card-top">
        <div class="category-name">${esc(cat.name)}${cat.isActive === false ? '<span class="paused-label">PAUSED</span>' : ''}</div>
        <span class="health-badge ${cat.auditStatus}">${healthLabel(cat.auditStatus)}</span>
      </div>
      <div class="card-meta">
        <div class="card-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
          ${cat.productCount} product${cat.productCount !== 1 ? 's' : ''}
        </div>
        <div class="card-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
          ${cat.knowledgeFileCount} sources
        </div>
      </div>
      <div class="card-stats">
        ${stats.specIssues ? `<div class="card-stat"><span class="dot dot-red"></span>${stats.specIssues} spec issues</div>` : ''}
        ${stats.redTeamFindings ? `<div class="card-stat"><span class="dot dot-red"></span>${stats.redTeamFindings} red-team findings</div>` : ''}
        ${stats.sourceFlags ? `<div class="card-stat"><span class="dot dot-yellow"></span>${stats.sourceFlags} source flags</div>` : ''}
        ${!stats.specIssues && !stats.redTeamFindings && !stats.sourceFlags ? `<div class="card-stat"><span class="dot dot-green"></span>No issues</div>` : ''}
        ${stats.redTeamAudited ? `<div class="card-stat"><span class="dot dot-green"></span>${stats.redTeamAudited} red-team audited</div>` : ''}
      </div>
      <span class="card-arrow">${arrowSVG}</span>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 2: Category Detail
// ═══════════════════════════════════════════════════════════════════════════

async function showCategoryDetail(slug) {
  showLoading();
  try {
    const data = await fetchCached(`categories/${slug}`);
    updateBreadcrumb({ slug: data.slug, name: data.name }, null);
    metaText.textContent = `${data.name} · ${data.productCount} products`;

    let html = `<div class="view-enter">`;

    html += `<div class="category-hero">`;
    html += `<div class="category-hero-info">`;
    html += `<h1>${esc(data.name)}</h1>`;
    html += `<div class="view-subtitle">${data.productCount} product${data.productCount !== 1 ? 's' : ''} scored</div>`;
    if (data.config?.notes) {
      html += `<div class="category-notes">${esc(data.config.notes).substring(0, 350)}${data.config.notes.length > 350 ? '...' : ''}</div>`;
    }
    html += `</div>`;
    html += `<span class="health-badge ${data.auditStatus || 'unknown'}" style="font-size:11px;padding:6px 14px;">${healthLabel(data.auditStatus)}</span>`;
    html += `</div>`;

    if (data.products.length === 0) {
      html += `<div class="empty-state"><div class="empty-state-icon">📦</div><p>No products audited in this category yet.</p></div>`;
    } else {
      html += `<div class="product-grid">`;
      for (const product of data.products) {
        html += renderProductCard(product, slug);
      }
      html += `</div>`;
    }

    html += `</div>`;
    app.innerHTML = html;

    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        window.location.hash = `#/category/${slug}/product/${card.dataset.slug}`;
      });
    });

  } catch (e) {
    app.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>Failed to load category: ${esc(e.message)}</p></div>`;
  }
}

function renderProductCard(product, categorySlug) {
  const audit = product.audit || {};
  const axes = product.axisScores || {};
  return `
    <div class="product-card" data-slug="${product.slug}">
      <div class="product-top">
        <div class="product-name">${esc(product.name)}</div>
        <div class="score-badge">
          <div class="score-number">${product.target || '—'}</div>
          ${product.tier ? `<span class="tier-label ${tierClass(product.tier)}">Tier ${product.tier}</span>` : ''}
        </div>
      </div>
      <div class="audit-dots">
        <div class="audit-dot-group"><span class="audit-dot ${dotColor(audit.specStatus)}"></span><span>Specs</span></div>
        <div class="audit-dot-group"><span class="audit-dot ${audit.redTeamVerdict === 'CLEAN' ? 'green' : audit.redTeamVerdict === 'FINDINGS' ? 'red' : 'gray'}"></span><span>Red Team</span></div>
        <div class="audit-dot-group"><span class="audit-dot ${dotColor(audit.sourceStatus)}"></span><span>Sources</span></div>
      </div>
      ${product.evidenceStatus ? `<div class="product-card-evidence">${evidenceBadge(product.evidenceStatus, true)}</div>` : ''}
      <div class="axis-bars">
        ${renderAxisBar('Quality', axes.quality)}
        ${renderAxisBar('Durability', axes.durability)}
        ${renderAxisBar('Performance', axes.performance)}
      </div>
    </div>`;
}

function renderAxisBar(label, value) {
  const pct = value ? Math.min(100, value) : 0;
  return `<div class="axis-row"><span class="axis-label">${label}</span><div class="axis-bar-bg"><div class="axis-bar-fill" style="width:${pct}%"></div></div><span class="axis-value">${value ? value.toFixed(1) : '—'}</span></div>`;
}

/**
 * Read cached inspector strength ratings from localStorage and
 * activate any visible .evidence-strength-indicator dots.
 */
function loadCachedStrengths() {
  try {
    document.querySelectorAll('.evidence-strength-indicator').forEach(el => {
      const rawKey = el.getAttribute('data-source-key');
      if (!rawKey) return;
      const stored = localStorage.getItem('inspector:strength:' + rawKey);
      if (stored) {
        el.dataset.strength = stored.toLowerCase();
        el.dataset.strengthSource = 'ai';
        el.textContent = stored.charAt(0).toUpperCase() + stored.slice(1).toLowerCase();
      }
    });
  } catch (_e) { /* localStorage unavailable */ }
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 3: Product Detail
// ═══════════════════════════════════════════════════════════════════════════

async function showProductDetail(categorySlug, productSlug) {
  showLoading();
  try {
    const data = await fetchCached(`products/${categorySlug}/${productSlug}`, 30000);
    const p = data.product;
    const cat = data.category;

    currentCategory = cat;
    currentProduct = p;

    updateBreadcrumb(cat, { name: p.name });
    metaText.textContent = `${cat.name} · ${p.name}`;

    let html = `<div class="view-enter">`;

    // ── Dark Hero ───────────────────────────────────────────────────────
    html += `<div class="detail-hero">`;
    html += `<div class="detail-title-area">`;
    html += `<h1 class="detail-product-name">${esc(p.name)}</h1>`;
    if (p.corporateParent) html += `<div class="detail-corporate">${esc(p.corporateParent)}</div>`;
    if (p.outlook) {
      html += `<div class="detail-outlook">`;
      html += `<span style="width:8px;height:8px;border-radius:50%;background:${p.outlook === 'Strong' ? 'var(--green)' : p.outlook === 'Stable' ? 'var(--yellow)' : 'var(--red)'}"></span>`;
      html += `Outlook: ${esc(p.outlook)}`;
      if (p.outlookRationale) html += ` — ${esc(p.outlookRationale)}`;
      html += `</div>`;
    }
    html += `</div>`;
    html += `<div class="detail-score-area">`;
    html += `<div class="detail-score">${p.target || '—'}</div>`;
    if (p.tier) html += `<span class="detail-tier ${tierClass(p.tier)}">Tier ${p.tier} · ${tierName(p.tier)}</span>`;
    if (p.evidenceStatus) {
      html += `<div class="detail-evidence-badge">${evidenceBadge(p.evidenceStatus)}</div>`;
      if (p.evidenceStatus === 'scored_with_disclosure') {
        html += `<div class="evidence-disclosure-note">This score is based on verified specifications, category standards, and limited independent evaluation. Direct product-specific evidence is limited for this product, which is typical of builder-grade lines that receive less independent review coverage than premium brands.</div>`;
      }
    }
    html += `</div></div>`;

    // ── Score Breakdown ─────────────────────────────────────────────────
    html += `<div class="detail-section">`;
    html += `<div class="section-title">Score Breakdown</div>`;
    html += `<div class="detail-axis-bars">`;
    for (const axis of ['quality', 'durability', 'performance']) {
      const val = p.axisScores?.[axis];
      const adj = p.specAdj?.[axis];
      const pct = val ? Math.min(100, val) : 0;
      html += `<div class="detail-axis-row"><span class="detail-axis-label">${formatSpecKey(axis)}</span><div class="detail-axis-bar-bg"><div class="detail-axis-bar-fill" style="width:${pct}%"></div></div><span class="detail-axis-value">${val ? val.toFixed(1) : '—'}</span>${adj !== undefined ? `<span class="detail-axis-adj">adj: +${adj}</span>` : `<span class="detail-axis-adj"></span>`}</div>`;
    }
    html += `</div>`;
    if (p.specAdj && Object.keys(p.specAdj).length) {
      html += `<div class="spec-adj-row">`;
      for (const [k, v] of Object.entries(p.specAdj)) {
        html += `<div class="spec-adj-item"><div class="spec-adj-label">${formatSpecKey(k)} Adj</div><div class="spec-adj-value">+${v}</div></div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;

    // ── Bottom Line ─────────────────────────────────────────────────────
    if (p.bottomLine) {
      html += `<div class="detail-section"><div class="section-title">Bottom Line</div><div class="bottom-line">${esc(p.bottomLine)}</div></div>`;
    }

    // ── Notes ───────────────────────────────────────────────────────────
    if (p.notes) {
      html += `<div class="detail-section"><div class="section-title">Scoring Notes</div><div class="product-notes">${esc(typeof p.notes === 'string' ? p.notes : p.notes.join('\n'))}</div></div>`;
    }

    // ── Specs ───────────────────────────────────────────────────────────
    if (p.specs && Object.keys(p.specs).length) {
      html += `<div class="detail-section"><div class="section-title">Specifications</div><div class="specs-grid">`;
      for (const [k, v] of Object.entries(p.specs)) {
        html += `<div class="spec-item"><span class="spec-key">${formatSpecKey(k)}</span><span class="spec-val" title="${esc(formatSpecValue(v))}">${esc(formatSpecValue(v))}</span></div>`;
      }
      html += `</div></div>`;
    }

    // ── Evidence by Scope (Product Evidence + Category Standards) ──
    {
      const columns = ['expert', 'review', 'forum', 'field', 'manufacturer', 'other'];
      const colData = p.sourcesByColumn || {};
      const hasAny = columns.some(col => (colData[col] || []).length > 0);
      if (hasAny) {
        // Gather all sources and split by scope
        const allSources = [];
        for (const col of columns) {
          for (const src of (colData[col] || [])) {
            allSources.push({ ...src, _col: col });
          }
        }
        const productSources = allSources.filter(s => s.scope === 'product');
        const categorySources = allSources.filter(s => s.scope !== 'product');

        const renderScopeSection = (title, sources) => {
          if (sources.length === 0) return '';
          // Group by column within scope
          const byCol = {};
          for (const s of sources) {
            if (!byCol[s._col]) byCol[s._col] = [];
            byCol[s._col].push(s);
          }
          let shtml = `<div class="detail-section"><div class="section-title">${title} (${sources.length})</div><div class="evidence-grid">`;
          for (const col of columns) {
            const colSources = (byCol[col] || []).sort((a, b) => {
              var poolOrder = { S: 0, A: 1, B: 2, C: 3, X: 4 };
              return (poolOrder[a.pool] || 5) - (poolOrder[b.pool] || 5);
            });
            if (colSources.length === 0) continue;
            shtml += `<div class="evidence-column">`;
            shtml += `<div class="evidence-col-header"><span class="evidence-col-name">${formatSpecKey(col)}</span><span class="evidence-col-count">${colSources.length}</span></div>`;
            for (const src of colSources) {
              const sid = esc(src.id || '');
              const sname = esc(src.source_name);
              const surl = esc(src.url || '');
              shtml += `<div class="evidence-source evidence-source-clickable" data-source-id="${sid}" data-source-name="${sname}" data-source-url="${surl}">`;
              shtml += `<div class="evidence-source-top">`;
              if (src.pool) {
              shtml += `<span class="source-pool-badge">${esc(src.pool)}</span>`;
              var _ps = String(src.pool).toUpperCase();
              var _sl = _ps === 'S' || _ps === 'A' ? 'STRONG' : _ps === 'B' ? 'MODERATE' : _ps === 'C' ? 'WEAK' : 'EXCLUDED';
              var _sc = _ps === 'S' || _ps === 'A' ? 'strength-strong' : _ps === 'B' ? 'strength-moderate' : _ps === 'C' ? 'strength-weak' : 'strength-excluded';
              shtml += `<span class="source-strength-badge ${_sc}">${_sl}</span>`;
              }
              if (src.classification) shtml += `<span class="source-class-badge ${esc(src.classification)}">${esc(src.classification)}</span>`;
              shtml += `<span class="evidence-source-name">${esc(src.source_name)}</span>`;
              shtml += `<span class="evidence-strength-indicator" data-source-key="${esc(cat.slug + '||' + p.slug + '||' + src.source_name)}"></span>`;
              shtml += `<button class="inspect-btn evidence-inspect-btn" data-source-id="${sid}" data-source-name="${sname}" data-source-url="${surl}" title="Inspect this source">${inspectSVG}</button>`;
              shtml += `</div>`;
              if (src.snippet) shtml += `<div class="evidence-snippet">${esc(src.snippet.substring(0, 150))}</div>`;
              shtml += `</div>`;
            }
            shtml += `</div>`;
          }
          shtml += `</div></div>`;
          return shtml;
        };

        html += renderScopeSection('Product Evidence', productSources);
        html += renderScopeSection('Category Standards', categorySources);
      }
    }

    // ── Source List (LEGACY — commented out; remove comment to restore) ────
    // if (p.sources && p.sources.length) {
    //   html += `<div class="detail-section"><div class="section-title">Sources (${p.sources.length})</div>`;
    //   html += renderSourceList(p, cat);
    //   html += `</div>`;
    // }

    // ── Action Buttons (Add Source + Re-score) ─────────────────────────
    html += `<div class="detail-section detail-actions">`;
    html += `<button class="action-btn action-btn-add-source" id="btn-add-source">+ Add Source</button>`;
    html += `<button class="action-btn action-btn-rescore" id="btn-rescore">↻ Re-score</button>`;
    html += `</div>`;

    // ── Add Source Form (hidden) ────────────────────────────────────────
    html += `<div id="add-source-form" class="add-source-form" style="display:none">`;
    html += `<div class="section-title">Add Product Source</div>`;
    html += `<div class="form-row"><label>URL <span class="req">*</span></label><input type="url" id="as-url" placeholder="https://..." required></div>`;
    html += `<div class="form-row"><label>Source Name <span class="req">*</span></label><input type="text" id="as-name" placeholder="e.g. Yale Appliance — Merillat review"></div>`;
    html += `<div class="form-row"><label>Pool <span class="req">*</span></label><select id="as-pool"><option value="A">A — Professional reviewer / lab test</option><option value="B" selected>B — Trade publication / experienced reviewer</option><option value="C">C — Forum or consumer review</option></select></div>`;
    html += `<div class="form-row"><label>Axis <span class="req">*</span></label><div class="checkbox-group"><label><input type="checkbox" name="as-axis" value="quality" checked> Quality</label><label><input type="checkbox" name="as-axis" value="durability"> Durability</label><label><input type="checkbox" name="as-axis" value="performance"> Performance</label></div></div>`;
    html += `<div class="form-row"><label>Evaluative Claim <span class="req">*</span></label><input type="text" id="as-claim" placeholder="One sentence summarizing what this source says about the product"></div>`;
    html += `<div class="form-row"><label>Column <span class="req">*</span></label><select id="as-column"><option value="review" selected>Review</option><option value="expert">Expert</option><option value="forum">Forum</option></select></div>`;
    html += `<div class="form-actions"><button class="action-btn action-btn-submit" id="as-submit">Add Source</button><button class="action-btn action-btn-cancel" id="as-cancel">Cancel</button></div>`;
    html += `</div>`;

    // ── Audit Results ───────────────────────────────────────────────────
    if (p.audit) html += renderAuditResults(p.audit);

    // ── Audit History ───────────────────────────────────────────────────
    if (p.auditHistory && p.auditHistory.length > 0) {
      html += renderAuditHistory(p.auditHistory);
    }

    html += `</div>`;
    app.innerHTML = html;
    loadCachedStrengths(); // Restore any previously inspected strength dots

    // Attach inspector button handlers (covers both evidence cards and any standalone inspect-btns)
    document.querySelectorAll('.inspect-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sourceId = btn.dataset.sourceId || btn.dataset.sourceName;
        const sourceUrl = btn.dataset.sourceUrl || '';
        openInspectorPanel(cat.slug, p.slug, sourceId, p, btn, sourceUrl);
      });
    });

    // Make entire evidence cards clickable (delegates to their inspect-btn)
    document.querySelectorAll('.evidence-source-clickable').forEach(card => {
      card.addEventListener('click', () => {
        const btn = card.querySelector('.inspect-btn');
        if (btn) btn.click();
      });
    });

    // ── Add Source button handler ───────────────────────────────────────
    document.getElementById('btn-add-source')?.addEventListener('click', () => {
      const form = document.getElementById('add-source-form');
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('as-cancel')?.addEventListener('click', () => {
      document.getElementById('add-source-form').style.display = 'none';
    });

    document.getElementById('as-submit')?.addEventListener('click', async () => {
      const url = document.getElementById('as-url').value.trim();
      const source_name = document.getElementById('as-name').value.trim();
      const pool = document.getElementById('as-pool').value;
      const claim = document.getElementById('as-claim').value.trim();
      const column = document.getElementById('as-column').value;
      const axes = [...document.querySelectorAll('input[name="as-axis"]:checked')].map(cb => cb.value);

      if (!url || !source_name || !claim) {
        showToast('Please fill in all required fields', 'error');
        return;
      }
      if (axes.length === 0) {
        showToast('Select at least one axis', 'error');
        return;
      }

      const submitBtn = document.getElementById('as-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Adding...';

      try {
        const result = await postAPI(`products/${cat.slug}/${p.slug}/add-source`, {
          url, source_name, pool, axes, claim, column
        });
        if (result.success) {
          showToast(`Source added: ${result.source.id}`);
          cache = {};
          showProductDetail(cat.slug, p.slug);
        } else {
          showToast(result.error || 'Failed to add source', 'error');
        }
      } catch (e) {
        showToast(e.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Source';
      }
    });

    // ── Re-score button handler ────────────────────────────────────────
    document.getElementById('btn-rescore')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-rescore');
      btn.disabled = true;
      btn.textContent = '↻ Scoring...';

      try {
        const result = await postAPI(`products/${cat.slug}/${p.slug}/rescore`, {});
        if (result.success) {
          showToast(`Re-scored: ${result.score} (Tier ${result.tier} · ${result.tierLabel}) — ${result.evidenceStatus.replace(/_/g, ' ')}`);
          cache = {};
          showProductDetail(cat.slug, p.slug);
        } else {
          showToast(result.error || 'Re-score failed', 'error');
        }
      } catch (e) {
        showToast(e.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = '↻ Re-score';
      }
    });

  } catch (e) {
    app.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>Failed to load product: ${esc(e.message)}</p></div>`;
  }
}

// ── Source List ──────────────────────────────────────────────────────────────

function renderSourceList(product, category) {
  const sources = product.sources || [];
  const auditSources = product.audit?.sourceIndependence?.sources || [];
  const classMap = {};
  for (const s of auditSources) {
    classMap[s.name.toLowerCase()] = s.classification;
  }

  let html = `<div class="source-list">`;
  for (const src of sources) {
    let classification = src.classification || classMap[src.source_name.toLowerCase()] || null;
    if (!classification && src.url && src.url !== 'N/A') {
      const url = src.url.toLowerCase();
      if (url.includes('reddit.com') || url.includes('houzz.com') || url.includes('youtube.com') || url.includes('consumerreports.com')) {
        classification = 'independent';
      }
    }
    const PLACEHOLDER_URLS = ['N/A', 'deep_dive_synthesis', 'internal', 'n/a', ''];
    const hasUrl = src.url && !PLACEHOLDER_URLS.includes(src.url.trim());
    const sourceIdentifier = src.id || src.source_name;

    html += `<div class="source-item">`;
    html += `<button class="inspect-btn" data-source-id="${esc(src.id || '')}" data-source-name="${esc(src.source_name)}" data-source-url="${esc(src.url || '')}" title="Inspect this source">${inspectSVG}</button>`;
    if (src.pool) html += `<span class="source-pool-badge">${esc(src.pool)}</span>`;
    if (classification) html += `<span class="source-class-badge ${classification}">${classification}</span>`;
    html += `<span class="source-name" title="${esc(src.source_name)}">${esc(src.source_name)}</span>`;
    html += `</div>`;
  }
  html += `</div>`;
  return html;
}

// ══════════════════════════════════════════════════════════════════════════
// INSPECTOR PANEL
// ══════════════════════════════════════════════════════════════════════════

function closeInspectorPanel() {
  const existing = document.getElementById('inspector-panel');
  if (existing) existing.remove();
  document.removeEventListener('click', _inspectorOutsideClick);
  inspectorPanel = null;
}

function _inspectorOutsideClick(e) {
  const panel = document.getElementById('inspector-panel');
  if (panel && !panel.contains(e.target)) {
    closeInspectorPanel();
  }
}

async function openInspectorPanel(categorySlug, productSlug, sourceId, product, triggerBtn, sourceUrl = '') {
  closeInspectorPanel();


  // Panel — no overlay, slides in from right; evidence cards stay visible
  const panel = document.createElement('div');
  panel.id = 'inspector-panel';
  panel.innerHTML = `
    <div class="inspector-header">
      <div class="inspector-title">🔍 Source Inspector</div>
      <button class="inspector-close" onclick="closeInspectorPanel()">✕</button>
    </div>
    <div class="inspector-body">
      <div class="inspector-loading"><div class="spinner"></div><p>Analyzing source with Haiku...</p></div>
    </div>`;
  document.body.appendChild(panel);
  inspectorPanel = panel;

  requestAnimationFrame(() => {
    panel.classList.add('show');
    // Attach outside-click handler after a tick so this open-click doesn't immediately close it
    setTimeout(() => document.addEventListener('click', _inspectorOutsideClick), 50);
  });

  try {
    const result = await postAPI('inspect', {
      category: categorySlug,
      productSlug: productSlug,
      sourceId: sourceId
    });

    if (result.error) {
      panel.querySelector('.inspector-body').innerHTML = `<div class="inspector-error"><p>⚠️ ${esc(result.error)}</p></div>`;
      return;
    }

    renderInspectorResult(panel, result, categorySlug, productSlug, sourceId, product, sourceUrl);

    // Cache strength and light up the dot on the evidence card
    try {
      const inspectedSrc = product.sources.find(s => s.id === sourceId || s.source_name === sourceId);
      const srcName = inspectedSrc ? inspectedSrc.source_name : sourceId;
      const strengthKey = 'inspector:strength:' + categorySlug + '||' + productSlug + '||' + srcName;
      localStorage.setItem(strengthKey, result.strength || 'MODERATE');
      loadCachedStrengths();
    } catch (_e) {}

  } catch (err) {
    panel.querySelector('.inspector-body').innerHTML = `<div class="inspector-error"><p>⚠️ ${esc(err.message)}</p></div>`;
  }
}

function renderInspectorResult(panel, result, categorySlug, productSlug, sourceId, product, sourceUrl = '') {
  const strengthColors = { STRONG: 'var(--green)', MODERATE: 'var(--yellow)', WEAK: 'var(--red)' };
  const strengthColor = strengthColors[result.strength] || 'var(--text-tertiary)';
  const PLACEHOLDER_URLS = ['N/A', 'deep_dive_synthesis', 'internal', 'n/a', ''];
  const hasUrl = sourceUrl && !PLACEHOLDER_URLS.includes(sourceUrl.trim());

  let html = ``;

  // Source URL link (if available)
  if (hasUrl) {
    html += `<a href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer" class="inspector-source-link">`;
    html += `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
    html += `<span>${esc(sourceUrl.length > 60 ? sourceUrl.substring(0, 60) + '…' : sourceUrl)}</span>`;
    html += `</a>`;
  }

  // Strength badge
  html += `<div class="inspector-strength" style="border-color:${strengthColor}">`;
  html += `<span class="strength-dot" style="background:${strengthColor}"></span>`;
  html += `<span class="strength-label">${result.strength || 'UNKNOWN'}</span>`;
  html += `</div>`;

  // Blurb
  html += `<div class="inspector-blurb">${esc(result.blurb)}</div>`;

  // Supported claims
  if (result.supportedClaims && result.supportedClaims.length) {
    html += `<div class="inspector-claims-section">`;
    html += `<div class="inspector-claims-title">✅ Supported Claims (${result.supportedClaims.length})</div>`;
    for (const claim of result.supportedClaims) {
      html += `<div class="inspector-claim inspector-claim-supported">${esc(claim)}</div>`;
    }
    html += `</div>`;
  }

  // Unsupported claims
  if (result.unsupportedClaims && result.unsupportedClaims.length) {
    html += `<div class="inspector-claims-section">`;
    html += `<div class="inspector-claims-title">❌ Not Addressed (${result.unsupportedClaims.length})</div>`;
    for (const claim of result.unsupportedClaims) {
      html += `<div class="inspector-claim inspector-claim-unsupported">${esc(claim)}</div>`;
    }
    html += `</div>`;
  }

  // Key quotes
  if (result.keyQuotes && result.keyQuotes.length) {
    html += `<div class="inspector-claims-section">`;
    html += `<div class="inspector-claims-title">📝 Key Quotes</div>`;
    for (const q of result.keyQuotes) {
      html += `<blockquote class="inspector-quote">${esc(q)}</blockquote>`;
    }
    html += `</div>`;
  }

  // ── Action Buttons ──────────────────────────────────────────────────
  html += `<div class="inspector-actions">`;
  html += `<div class="inspector-actions-title">Actions</div>`;

  html += `<button class="action-btn action-btn-danger" data-action="remove-source">🗑️ Remove This Source</button>`;

  if (result.unsupportedClaims && result.unsupportedClaims.length) {
    html += `<button class="action-btn action-btn-warning" data-action="remove-claim">✂️ Remove Unsupported Claim</button>`;
  }

  html += `<button class="action-btn action-btn-info" data-action="flag-research">🔬 Flag for Re-Research</button>`;
  html += `<button class="action-btn action-btn-primary" data-action="find-source">🔎 Find Better Source</button>`;
  html += `<button class="action-btn action-btn-neutral" data-action="accept">✓ Accept As-Is</button>`;
  html += `</div>`;

  // Results area for Find Better Source
  html += `<div id="inspector-results-area"></div>`;

  panel.querySelector('.inspector-body').innerHTML = html;

  // Attach action handlers
  panel.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleAction(btn.dataset.action, categorySlug, productSlug, sourceId, product, result, panel);
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// ACTION HANDLERS
// ══════════════════════════════════════════════════════════════════════════

async function handleAction(action, categorySlug, productSlug, sourceId, product, inspectResult, panel) {
  const resultsArea = panel.querySelector('#inspector-results-area');

  if (action === 'remove-source') {
    if (!confirm(`Remove source "${sourceId}" from ${product.name}?\n\nThis will delete it from the curation file. A .bak backup will be created.`)) return;

    try {
      const result = await postAPI('actions/remove-source', {
        category: categorySlug,
        productSlug,
        sourceId
      });
      if (result.success) {
        showToast(`Source removed: ${result.removedSource}`, 'success');
        cache = {};
        closeInspectorPanel();
        showProductDetail(categorySlug, productSlug);
      } else {
        showToast(result.error || 'Failed to remove source', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }

  } else if (action === 'remove-claim') {
    // Show list of unsupported claims to choose from
    const claims = inspectResult.unsupportedClaims || [];
    if (claims.length === 0) return;

    let selectHtml = `<div class="claim-select"><div class="claim-select-title">Select claim to remove:</div>`;
    for (let i = 0; i < claims.length; i++) {
      selectHtml += `<button class="claim-select-btn" data-idx="${i}">${esc(claims[i])}</button>`;
    }
    selectHtml += `</div>`;
    resultsArea.innerHTML = selectHtml;

    resultsArea.querySelectorAll('.claim-select-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const claimText = claims[parseInt(btn.dataset.idx)];
        if (!confirm(`Remove this claim from scoring notes?\n\n"${claimText}"\n\nA .bak backup will be created.`)) return;
        try {
          const result = await postAPI('actions/remove-claim', {
            category: categorySlug,
            productSlug,
            claimText
          });
          if (result.success) {
            showToast('Claim removed', 'success');
            cache = {};
            closeInspectorPanel();
            showProductDetail(categorySlug, productSlug);
          } else {
            showToast(result.error || 'Failed', 'error');
          }
        } catch (err) { showToast(err.message, 'error'); }
      });
    });

  } else if (action === 'flag-research') {
    const topic = prompt('What topic needs re-research?', `${product.name} — source quality`);
    if (!topic) return;
    try {
      const result = await postAPI('actions/flag-research', {
        category: categorySlug,
        productSlug,
        topic
      });
      if (result.success) {
        showToast('Flagged for re-research', 'success');
      } else {
        showToast(result.error || 'Failed', 'error');
      }
    } catch (err) { showToast(err.message, 'error'); }

  } else if (action === 'find-source') {
    const topic = prompt('What topic should we find sources for?', `${product.name} independent reviews`);
    if (!topic) return;

    resultsArea.innerHTML = `<div class="inspector-loading"><div class="spinner"></div><p>Searching with Perplexity...</p></div>`;

    try {
      const result = await postAPI('find-source', {
        productName: product.name,
        topic
      });

      if (result.error) {
        resultsArea.innerHTML = `<div class="inspector-error"><p>⚠️ ${esc(result.error)}</p></div>`;
        return;
      }

      let foundHtml = `<div class="found-sources"><div class="found-sources-title">Found ${result.sources.length} sources:</div>`;
      for (const src of result.sources) {
        foundHtml += `<div class="found-source-card">`;
        foundHtml += `<div class="found-source-name">${esc(src.name)}</div>`;
        if (src.url) foundHtml += `<a href="${esc(src.url)}" target="_blank" class="found-source-url">${esc(src.url.substring(0, 60))}</a>`;
        foundHtml += `<div class="found-source-summary">${esc(src.summary)}</div>`;
        foundHtml += `<div class="found-source-actions">`;
        foundHtml += `<span class="source-class-badge ${src.suggestedClassification}">${src.suggestedClassification}</span>`;
        foundHtml += `<button class="add-source-btn" data-name="${esc(src.name)}" data-url="${esc(src.url)}" data-summary="${esc(src.summary)}" data-class="${esc(src.suggestedClassification)}">+ Add This Source</button>`;
        foundHtml += `</div></div>`;
      }
      foundHtml += `</div>`;
      resultsArea.innerHTML = foundHtml;

      resultsArea.querySelectorAll('.add-source-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            const addResult = await postAPI('actions/add-source', {
              category: categorySlug,
              productSlug,
              sourceData: {
                name: btn.dataset.name,
                url: btn.dataset.url,
                summary: btn.dataset.summary,
                classification: btn.dataset.class
              }
            });
            if (addResult.success) {
              showToast(`Source added: ${btn.dataset.name}`, 'success');
              btn.textContent = '✓ Added';
              btn.disabled = true;
              cache = {};
            } else {
              showToast(addResult.error || 'Failed', 'error');
            }
          } catch (err) { showToast(err.message, 'error'); }
        });
      });

    } catch (err) {
      resultsArea.innerHTML = `<div class="inspector-error"><p>⚠️ ${esc(err.message)}</p></div>`;
    }

  } else if (action === 'accept') {
    try {
      const result = await postAPI('actions/accept', {
        category: categorySlug,
        productSlug,
        detail: `Reviewed source "${sourceId}" — accepted as-is after inspector analysis (strength: ${inspectResult.strength})`
      });
      if (result.success) {
        showToast('Accepted — logged to audit history', 'success');
      }
    } catch (err) { showToast(err.message, 'error'); }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// AUDIT RESULTS (source independence, spec verification, red-team findings)
// ══════════════════════════════════════════════════════════════════════════

function renderAuditResults(audit) {
  let html = '';

  // ── Source Independence (from curation file classifications) ──────────
  if (audit.sourceIndependence) {
    const si = audit.sourceIndependence;
    const total = si.totalSources || 1;
    const indPct = (si.independent / total * 100).toFixed(0);
    const affPct = (si.affiliated / total * 100).toFixed(0);
    const mfgPct = (si.manufacturer / total * 100).toFixed(0);
    html += `<div class="detail-section">`;
    html += `<div class="section-title">Source Independence <span class="status-inline"><span class="dot ${dotColor(si.status)}"></span> ${si.ratio}%</span></div>`;
    html += `<div class="independence-bar"><div class="bar-segment bar-independent" style="width:${indPct}%"></div><div class="bar-segment bar-affiliated" style="width:${affPct}%"></div><div class="bar-segment bar-manufacturer" style="width:${mfgPct}%"></div></div>`;
    html += `<div class="independence-legend">`;
    html += `<div class="legend-item"><span class="legend-dot" style="background:var(--green)"></span>Independent: ${si.independent} (${indPct}%)</div>`;
    html += `<div class="legend-item"><span class="legend-dot" style="background:var(--yellow)"></span>Affiliated: ${si.affiliated} (${affPct}%)</div>`;
    html += `<div class="legend-item"><span class="legend-dot" style="background:var(--red)"></span>Manufacturer: ${si.manufacturer} (${mfgPct}%)</div>`;
    html += `</div></div>`;
  }

  // ── Spec Verification (from verified_specs SQLite table) ──────────────
  if (audit.specVerification) {
    const sv = audit.specVerification;
    html += `<div class="detail-section">`;
    html += `<div class="section-title">Spec Verification <span class="status-inline"><span class="dot ${dotColor(sv.status)}"></span></span></div>`;
    if (sv.specs && sv.specs.length) {
      const verified = sv.specs.filter(s => s.status === 'verified').length;
      const discrepancy = sv.specs.filter(s => s.status === 'discrepancy').length;
      const unverified = sv.specs.filter(s => s.status === 'unverified').length;

      html += `<div class="audit-stat-grid">`;
      html += auditStatCard(sv.specs.length, 'Total Specs');
      html += auditStatCard(verified, 'Verified', 'green');
      html += auditStatCard(discrepancy, 'Discrepancy', discrepancy > 0 ? 'red' : 'green');
      html += auditStatCard(unverified, 'Unverified', unverified > 0 ? 'yellow' : 'green');
      html += `</div>`;

      html += `<table class="audit-table"><thead><tr><th>Spec</th><th>Calibration</th><th>Verified Value</th><th>Confidence</th><th>Status</th></tr></thead><tbody>`;
      for (const spec of sv.specs) {
        const icon = spec.status === 'verified' ? '✅' : spec.status === 'discrepancy' ? '❌' : '⬜';
        const confBadge = spec.confidence ? `<span class="conf-badge conf-${spec.confidence}">${spec.confidence}</span>` : '';
        html += `<tr><td>${esc(formatSpecKey(spec.name))}</td><td>${esc(spec.calibrationValue)}</td><td>${esc(spec.dbValue)}${spec.unit ? ' ' + esc(spec.unit) : ''}</td><td>${confBadge}</td><td>${icon}</td></tr>`;
      }
      html += `</tbody></table>`;

      if (sv.specs.some(s => s.flagNote)) {
        html += `<div class="spec-flags">`;
        for (const spec of sv.specs.filter(s => s.flagNote)) {
          html += `<div class="spec-flag-item">⚠️ <strong>${esc(formatSpecKey(spec.name))}</strong>: ${esc(spec.flagNote)}</div>`;
        }
        html += `</div>`;
      }
    } else if (sv.hasDb === false) {
      html += `<div class="audit-explainer"><div class="audit-explainer-icon">🔧</div><div class="audit-explainer-text">Spec database (better-sqlite3) is not available. Install it to enable spec verification: <code>npm install better-sqlite3</code></div></div>`;
    } else {
      html += `<div class="audit-explainer"><div class="audit-explainer-icon">🔍</div><div class="audit-explainer-text">No verified specs found in the database for this product. Run the spec spot-check script to populate: <code>node scripts/spec_spot_check.js {slug} {category}</code></div></div>`;
    }
    html += `</div>`;
  }

  // ── Red-Team Findings (from red_team_*.md files) ──────────────────────
  if (audit.redTeam) {
    const rt = audit.redTeam;
    html += `<div class="detail-section">`;
    html += `<div class="section-title">Red-Team Audit <span class="status-inline"><span class="dot ${rt.isClean ? 'green' : 'red'}"></span> ${rt.verdict}</span></div>`;

    if (rt.isClean) {
      html += `<div class="red-team-clean"><span class="red-team-icon">✅</span><div><strong>CLEAN</strong> — No publishable embarrassments found.</div></div>`;
    } else {
      html += `<div class="red-team-findings">`;
      html += `<div class="red-team-findings-icon">⚠️ ${rt.findings.length} finding${rt.findings.length !== 1 ? 's' : ''} identified</div>`;
      for (const f of rt.findings) {
        html += `<div class="red-team-finding-item">${esc(f)}</div>`;
      }
      html += `</div>`;
    }

    if (rt.summary) {
      html += `<details class="red-team-details"><summary>Full report</summary><div class="red-team-summary">${esc(rt.summary)}</div></details>`;
    }

    if (rt.date) {
      html += `<div class="red-team-date">Audited: ${rt.date}</div>`;
    }

    html += `</div>`;
  }

  return html;
}

function auditStatCard(value, label, colorClass) {
  const color = colorClass === 'red' ? 'var(--red)' : colorClass === 'yellow' ? 'var(--yellow)' : colorClass === 'green' ? 'var(--green)' : 'var(--text-primary)';
  return `<div class="audit-stat-card"><div class="audit-stat-number" style="color:${color}">${value}</div><div class="audit-stat-label">${label}</div></div>`;
}

// ══════════════════════════════════════════════════════════════════════════
// AUDIT HISTORY TIMELINE
// ══════════════════════════════════════════════════════════════════════════

function renderAuditHistory(history) {
  let html = `<div class="detail-section">`;
  html += `<div class="section-title">Dashboard Action History (${history.length})</div>`;
  html += `<div class="audit-timeline">`;

  for (const entry of history.slice().reverse()) {
    const date = new Date(entry.timestamp);
    const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const actionBadgeClass = {
      remove_source: 'action-badge-danger',
      remove_claim: 'action-badge-warning',
      add_source: 'action-badge-success',
      flag_research: 'action-badge-info',
      accept_as_is: 'action-badge-neutral'
    }[entry.action] || 'action-badge-neutral';

    const actionLabel = {
      remove_source: 'Source Removed',
      remove_claim: 'Claim Removed',
      add_source: 'Source Added',
      flag_research: 'Flagged for Research',
      accept_as_is: 'Accepted As-Is'
    }[entry.action] || entry.action;

    html += `<div class="timeline-entry">`;
    html += `<div class="timeline-meta"><span class="timeline-time">${timeStr}</span><span class="action-badge ${actionBadgeClass}">${actionLabel}</span></div>`;
    html += `<div class="timeline-detail">${esc(entry.detail)}</div>`;
    if (entry.scoreBefore !== null && entry.scoreAfter !== null && entry.scoreBefore !== entry.scoreAfter) {
      html += `<div class="timeline-score">Score: ${entry.scoreBefore} → ${entry.scoreAfter} (${entry.scoreAfter - entry.scoreBefore > 0 ? '+' : ''}${entry.scoreAfter - entry.scoreBefore})</div>`;
    }
    html += `</div>`;
  }

  html += `</div></div>`;
  return html;
}

// ── Init ────────────────────────────────────────────────────────────────────

route();
