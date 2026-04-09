/**
 * THE RESIDENTIALIST — Product Intelligence Dashboard
 * Vanilla JS Single-Page Application
 *
 * Mews-inspired: dark hero banners, bento card grids, bold typography.
 *
 * Hash routing:
 *   #/                              → Category Grid
 *   #/category/{slug}               → Product Cards
 *   #/category/{slug}/product/{id}  → Product Detail
 */

// ── State ───────────────────────────────────────────────────────────────────

let cache = {};
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

async function fetchAPI(endpoint) {
  const res = await fetch(`/api/${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
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

function hideBreadcrumb() {
  breadcrumb.style.display = 'none';
}

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

function tierClass(tier) {
  return `tier-${Math.min(tier || 5, 5)}`;
}

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

function showLoading() {
  app.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>`;
}

const arrowSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;

// ═══════════════════════════════════════════════════════════════════════════
// VIEW 1: Category Grid
// ═══════════════════════════════════════════════════════════════════════════

async function showCategoryGrid() {
  hideBreadcrumb();
  showLoading();

  try {
    const data = await fetchCached('overview');
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
    html += `<h1 class="hero-title">Product<br>Database</h1>`;
    html += `<p class="hero-subtitle">Every category and product scored by The Residentialist — specs verified, claims traced, sources classified.</p>`;
    html += `</div>`;
    html += `<div class="hero-stats">`;
    html += heroStat(data.totalCategories, 'Categories');
    html += heroStat(data.totalProducts, 'Products');
    html += heroStat(data.auditDate || '—', 'Last Audit');
    html += `</div>`;
    html += `</div>`;

    // Status pills
    html += `<div class="hero-status-row">`;
    if (clean > 0) html += `<span class="status-pill"><span class="pill-dot green"></span>${clean} Clean</span>`;
    if (review > 0) html += `<span class="status-pill"><span class="pill-dot yellow"></span>${review} Review</span>`;
    if (action > 0) html += `<span class="status-pill"><span class="pill-dot red"></span>${action} Action Required</span>`;
    html += `</div>`;
    html += `</div>`;

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

  } catch (e) {
    app.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>Failed to load data: ${esc(e.message)}</p></div>`;
  }
}

function heroStat(value, label) {
  return `<div class="hero-stat"><div class="hero-stat-value">${value}</div><div class="hero-stat-label">${label}</div></div>`;
}

function renderCategoryCard(cat) {
  const stats = cat.auditStats || {};
  return `
    <div class="category-card" data-slug="${cat.slug}">
      <div class="card-top">
        <div class="category-name">${esc(cat.name)}</div>
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
        ${stats.contradictedClaims ? `<div class="card-stat"><span class="dot dot-red"></span>${stats.contradictedClaims} contradicted</div>` : ''}
        ${stats.redCriticalFlags ? `<div class="card-stat"><span class="dot dot-yellow"></span>${stats.redCriticalFlags} source flags</div>` : ''}
        ${!stats.specIssues && !stats.contradictedClaims && !stats.redCriticalFlags ? `<div class="card-stat"><span class="dot dot-green"></span>No issues</div>` : ''}
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

    // ── Dark Hero ─────────────────────────────────────────────────────
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
        <div class="audit-dot-group">
          <span class="audit-dot ${dotColor(audit.specStatus)}"></span>
          <span>Specs</span>
        </div>
        <div class="audit-dot-group">
          <span class="audit-dot ${dotColor(audit.claimStatus)}"></span>
          <span>Claims</span>
        </div>
        <div class="audit-dot-group">
          <span class="audit-dot ${dotColor(audit.sourceStatus)}"></span>
          <span>Sources</span>
        </div>
      </div>

      <div class="axis-bars">
        ${renderAxisBar('Quality', axes.quality)}
        ${renderAxisBar('Durability', axes.durability)}
        ${renderAxisBar('Performance', axes.performance)}
      </div>
    </div>`;
}

function renderAxisBar(label, value) {
  const pct = value ? (value / 10 * 100) : 0;
  return `
    <div class="axis-row">
      <span class="axis-label">${label}</span>
      <div class="axis-bar-bg"><div class="axis-bar-fill" style="width:${pct}%"></div></div>
      <span class="axis-value">${value ? value.toFixed(1) : '—'}</span>
    </div>`;
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

    updateBreadcrumb(cat, { name: p.name });
    metaText.textContent = `${cat.name} · ${p.name}`;

    let html = `<div class="view-enter">`;

    // ── Dark Hero ───────────────────────────────────────────────────────
    html += `<div class="detail-hero">`;
    html += `<div class="detail-title-area">`;
    html += `<h1 class="detail-product-name">${esc(p.name)}</h1>`;
    if (p.corporateParent) {
      html += `<div class="detail-corporate">${esc(p.corporateParent)}</div>`;
    }
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
    if (p.tier) {
      html += `<span class="detail-tier ${tierClass(p.tier)}">Tier ${p.tier} · ${tierName(p.tier)}</span>`;
    }
    html += `</div></div>`;

    // ── Score Breakdown ─────────────────────────────────────────────────
    html += `<div class="detail-section">`;
    html += `<div class="section-title">Score Breakdown</div>`;
    html += `<div class="detail-axis-bars">`;
    for (const axis of ['quality', 'durability', 'performance']) {
      const val = p.axisScores?.[axis];
      const adj = p.specAdj?.[axis];
      const pct = val ? (val / 10 * 100) : 0;
      html += `
        <div class="detail-axis-row">
          <span class="detail-axis-label">${formatSpecKey(axis)}</span>
          <div class="detail-axis-bar-bg"><div class="detail-axis-bar-fill" style="width:${pct}%"></div></div>
          <span class="detail-axis-value">${val ? val.toFixed(1) : '—'}</span>
          ${adj !== undefined ? `<span class="detail-axis-adj">adj: +${adj}</span>` : `<span class="detail-axis-adj"></span>`}
        </div>`;
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
      html += `<div class="detail-section">`;
      html += `<div class="section-title">Bottom Line</div>`;
      html += `<div class="bottom-line">${esc(p.bottomLine)}</div>`;
      html += `</div>`;
    }

    // ── Notes ───────────────────────────────────────────────────────────
    if (p.notes) {
      html += `<div class="detail-section">`;
      html += `<div class="section-title">Scoring Notes</div>`;
      html += `<div class="product-notes">${esc(p.notes)}</div>`;
      html += `</div>`;
    }

    // ── Specs ───────────────────────────────────────────────────────────
    if (p.specs && Object.keys(p.specs).length) {
      html += `<div class="detail-section">`;
      html += `<div class="section-title">Specifications</div>`;
      html += `<div class="specs-grid">`;
      for (const [k, v] of Object.entries(p.specs)) {
        html += `<div class="spec-item"><span class="spec-key">${formatSpecKey(k)}</span><span class="spec-val" title="${esc(formatSpecValue(v))}">${esc(formatSpecValue(v))}</span></div>`;
      }
      html += `</div></div>`;
    }

    // ── Evidence Summary ────────────────────────────────────────────────
    if (p.sourcesByColumn) {
      const columns = ['expert', 'review', 'forum', 'field', 'manufacturer', 'other'];
      const hasAny = columns.some(col => (p.sourcesByColumn[col] || []).length > 0);

      if (hasAny) {
        html += `<div class="detail-section">`;
        html += `<div class="section-title">Evidence by Category</div>`;
        html += `<div class="evidence-grid">`;

        for (const col of columns) {
          const sources = p.sourcesByColumn[col] || [];
          if (sources.length === 0) continue;

          html += `<div class="evidence-column">`;
          html += `<div class="evidence-col-header">`;
          html += `<span class="evidence-col-name">${formatSpecKey(col)}</span>`;
          html += `<span class="evidence-col-count">${sources.length}</span>`;
          html += `</div>`;

          for (const src of sources) {
            html += `<div class="evidence-source">`;
            html += `<div>${esc(src.source_name)}</div>`;
            if (src.snippet) {
              html += `<div class="evidence-snippet">${esc(src.snippet.substring(0, 150))}</div>`;
            }
            html += `</div>`;
          }
          html += `</div>`;
        }
        html += `</div></div>`;
      }
    }

    // ── Source List ──────────────────────────────────────────────────────
    if (p.sources && p.sources.length) {
      html += `<div class="detail-section">`;
      html += `<div class="section-title">Sources (${p.sources.length})</div>`;
      html += renderSourceList(p);
      html += `</div>`;
    }

    // ── Audit Results ───────────────────────────────────────────────────
    if (p.audit) {
      html += renderAuditResults(p.audit);
    }

    html += `</div>`;
    app.innerHTML = html;

  } catch (e) {
    app.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>Failed to load product: ${esc(e.message)}</p></div>`;
  }
}

function renderSourceList(product) {
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
    const hasUrl = src.url && src.url !== 'N/A';

    html += `<div class="source-item">`;
    if (src.pool) html += `<span class="source-pool-badge">${esc(src.pool)}</span>`;
    if (classification) html += `<span class="source-class-badge ${classification}">${classification}</span>`;
    html += `<span class="source-name" title="${esc(src.source_name)}">${esc(src.source_name)}</span>`;
    if (hasUrl) {
      html += `<a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer" class="source-link" onclick="event.stopPropagation()">`;
      html += `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
      html += `</a>`;
    }
    html += `</div>`;
  }
  html += `</div>`;
  return html;
}

function renderAuditResults(audit) {
  let html = '';

  if (audit.specVerification) {
    const sv = audit.specVerification;
    html += `<div class="detail-section">`;
    html += `<div class="section-title">Audit: Spec Verification <span class="status-inline"><span class="dot ${dotColor(sv.status)}"></span></span></div>`;
    if (sv.specs && sv.specs.length) {
      html += `<table class="audit-table"><thead><tr>`;
      html += `<th>Spec</th><th>Our Value</th><th>Manufacturer</th><th>Status</th>`;
      html += `</tr></thead><tbody>`;
      for (const spec of sv.specs) {
        const icon = spec.status === 'verified' ? '✅' : spec.status === 'discrepancy' ? '⚠️' : '❓';
        html += `<tr><td>${esc(spec.name)}</td><td>${esc(spec.calibrationValue)}</td><td>${esc(spec.manufacturerValue?.substring(0, 80))}</td><td>${icon} ${esc(spec.status)}</td></tr>`;
      }
      html += `</tbody></table>`;
    } else {
      html += `<div class="audit-explainer">`;
      html += `<div class="audit-explainer-icon">🔍</div>`;
      html += `<div class="audit-explainer-text">No manufacturer spec sheets were found to cross-reference against our calibration values. This means the audit bot could not independently verify the specs we have on file.</div>`;
      html += `</div>`;
    }
    html += `</div>`;
  }

  if (audit.claimTraceability) {
    const ct = audit.claimTraceability;
    html += `<div class="detail-section">`;
    html += `<div class="section-title">Audit: Claim Traceability <span class="status-inline"><span class="dot ${dotColor(ct.status)}"></span></span></div>`;
    html += `<div class="audit-stat-grid">`;
    html += auditStatCard(ct.totalClaims, 'Total Claims');
    html += auditStatCard(ct.sourced, 'Sourced', 'green');
    html += auditStatCardClickable(ct.unsourced, 'Unsourced', ct.unsourced > 0 ? 'yellow' : 'green', 'unsourced-claims');
    html += auditStatCardClickable(ct.contradicted, 'Contradicted', ct.contradicted > 0 ? 'red' : 'green', 'contradicted-claims');
    html += `</div>`;

    // Expandable contradicted claims
    if (ct.contradictedClaims && ct.contradictedClaims.length > 0) {
      html += `<div id="contradicted-claims" class="claim-drawer" style="display:none">`;
      html += `<div class="claim-drawer-header">`;
      html += `<span class="claim-drawer-title">⚠️ Contradicted Claims (${ct.contradictedClaims.length})</span>`;
      html += `<button class="claim-drawer-close" onclick="document.getElementById('contradicted-claims').style.display='none'">✕</button>`;
      html += `</div>`;
      for (const c of ct.contradictedClaims) {
        html += `<div class="claim-item claim-contradicted">`;
        html += `<div class="claim-text">"${esc(c.claim)}"</div>`;
        html += `<div class="claim-source">Source: <strong>${esc(c.source)}</strong></div>`;
        if (c.context) {
          html += `<div class="claim-context">${esc(c.context)}</div>`;
        }
        html += `</div>`;
      }
      html += `</div>`;
    }

    // Expandable unsourced claims
    if (ct.unsourcedClaims && ct.unsourcedClaims.length > 0) {
      html += `<div id="unsourced-claims" class="claim-drawer" style="display:none">`;
      html += `<div class="claim-drawer-header">`;
      html += `<span class="claim-drawer-title">📋 Unsourced Claims (${ct.unsourcedClaims.length})</span>`;
      html += `<button class="claim-drawer-close" onclick="document.getElementById('unsourced-claims').style.display='none'">✕</button>`;
      html += `</div>`;
      for (const c of ct.unsourcedClaims) {
        html += `<div class="claim-item claim-unsourced">`;
        html += `<div class="claim-text">"${esc(c.claim)}"</div>`;
        html += `</div>`;
      }
      html += `</div>`;
    }

    html += `</div>`;
  }

  if (audit.sourceIndependence) {
    const si = audit.sourceIndependence;
    const total = si.totalSources || 1;
    const indPct = (si.independent / total * 100).toFixed(0);
    const affPct = (si.affiliated / total * 100).toFixed(0);
    const mfgPct = (si.manufacturer / total * 100).toFixed(0);

    html += `<div class="detail-section">`;
    html += `<div class="section-title">Audit: Source Independence <span class="status-inline"><span class="dot ${dotColor(si.status)}"></span> ${si.ratio}%</span></div>`;
    html += `<div class="independence-bar">`;
    html += `<div class="bar-segment bar-independent" style="width:${indPct}%"></div>`;
    html += `<div class="bar-segment bar-affiliated" style="width:${affPct}%"></div>`;
    html += `<div class="bar-segment bar-manufacturer" style="width:${mfgPct}%"></div>`;
    html += `</div>`;
    html += `<div class="independence-legend">`;
    html += `<div class="legend-item"><span class="legend-dot" style="background:var(--green)"></span>Independent: ${si.independent} (${indPct}%)</div>`;
    html += `<div class="legend-item"><span class="legend-dot" style="background:var(--yellow)"></span>Affiliated: ${si.affiliated} (${affPct}%)</div>`;
    html += `<div class="legend-item"><span class="legend-dot" style="background:var(--red)"></span>Manufacturer: ${si.manufacturer} (${mfgPct}%)</div>`;
    html += `</div></div>`;
  }

  return html;
}

function auditStatCard(value, label, colorClass) {
  const color = colorClass === 'red' ? 'var(--red)' : colorClass === 'yellow' ? 'var(--yellow)' : colorClass === 'green' ? 'var(--green)' : 'var(--text-primary)';
  return `<div class="audit-stat-card"><div class="audit-stat-number" style="color:${color}">${value}</div><div class="audit-stat-label">${label}</div></div>`;
}

function auditStatCardClickable(value, label, colorClass, drawerId) {
  const color = colorClass === 'red' ? 'var(--red)' : colorClass === 'yellow' ? 'var(--yellow)' : colorClass === 'green' ? 'var(--green)' : 'var(--text-primary)';
  if (value > 0) {
    return `<div class="audit-stat-card audit-stat-clickable" onclick="toggleDrawer('${drawerId}')" title="Click to see details"><div class="audit-stat-number" style="color:${color}">${value}</div><div class="audit-stat-label">${label}</div><div class="audit-stat-hint">Click to review ↓</div></div>`;
  }
  return `<div class="audit-stat-card"><div class="audit-stat-number" style="color:${color}">${value}</div><div class="audit-stat-label">${label}</div></div>`;
}

function toggleDrawer(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isHidden = el.style.display === 'none';
  // Close all drawers first
  document.querySelectorAll('.claim-drawer').forEach(d => d.style.display = 'none');
  if (isHidden) {
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ── Init ────────────────────────────────────────────────────────────────────

route();
