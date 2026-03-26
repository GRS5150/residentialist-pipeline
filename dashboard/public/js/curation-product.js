/**
 * THE RESIDENTIALIST — Product Curation View JS
 * Three-column source view with classification management
 */

const API_BASE = location.pathname.startsWith('/scores') ? '/scores' : '';
const slug = new URLSearchParams(window.location.search).get('slug');
let productData = null;

// ─── Data Loading ─────────────────────────────────────────────────────────────

async function loadProduct() {
  if (!slug) return;
  try {
    const res = await fetch(`${API_BASE}/api/curation/${slug}`);
    productData = await res.json();
    renderProduct();
    loadScoreHistory();
  } catch (err) {
    console.error('Failed to load product:', err);
    document.getElementById('productName').textContent = 'Error loading product';
  }
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function renderProduct() {
  const d = productData;
  document.title = `${d.product_name} — Curation`;
  document.getElementById('productName').textContent = d.product_name || slug;
  document.getElementById('productMeta').textContent =
    `${d.operation_type || ''} · ${d.manufacturer_slug || ''} · ${d.deep_dive_date || ''} · ${d.auto_classification_summary?.total || 0} sources`;

  const scoreEl = document.getElementById('scoreDisplay');
  scoreEl.style.display = '';
  if (d.display_score && d.display_score > 0) {
    scoreEl.innerHTML = `
      <span class="score-number">${d.display_score}</span>
      <span class="score-label label-${labelClass(d.product_label)}">${d.product_label || ''}</span>
    `;
  } else {
    scoreEl.innerHTML = `
      <span class="score-number" style="color:var(--text-muted); font-size:16px;">—</span>
      <span class="score-label" style="background:var(--bg-tertiary); color:var(--text-muted);">Not yet scored</span>
    `;
  }

  renderSources(d.sources || []);
  renderConsensus(d.consensus_matrix || []);
  renderWarranty(d.warranty_reality || {});
  renderSpecs(d.verified_specs || {});
  renderRedFlags(d.red_flags || []);
  updateClassificationSummary();
}

function renderSources(sources) {
  const experts = sources.filter(s => s.column === 'expert');
  const reviews = sources.filter(s => s.column === 'review');
  const forums = sources.filter(s => s.column === 'forum');

  document.getElementById('expertList').innerHTML = experts.map(renderSourceCard).join('') || '<p class="empty-state" style="padding:12px;">No expert sources</p>';
  document.getElementById('reviewList').innerHTML = reviews.map(renderSourceCard).join('') || '<p class="empty-state" style="padding:12px;">No review sources</p>';
  document.getElementById('forumList').innerHTML = forums.map(renderSourceCard).join('') || '<p class="empty-state" style="padding:12px;">No forum sources</p>';
}

function renderSourceCard(source) {
  const topicTags = (source.topics || []).map(t => `<span class="topic-tag">${t}</span>`).join('');
  return `
    <div class="source-card" id="source-${source.id}">
      <div class="source-card-header">
        <div>
          <span class="source-name">${source.source_name}</span>
          <span class="pool-badge pool-${source.pool}">Pool ${source.pool}</span>
        </div>
        <div class="classification-badge ${source.classification}" onclick="cycleClassification('${source.id}')">
          ${classificationIcon(source.classification)} ${source.classification || 'unset'}
        </div>
      </div>
      <div class="source-snippet">${source.snippet || ''}</div>
      ${source.url && source.url !== 'not_available' ? `<div class="source-link"><a href="${source.url}" target="_blank">${truncateUrl(source.url)}</a></div>` : ''}
      <div class="source-topics">${topicTags}</div>
    </div>
  `;
}

function classificationIcon(cls) {
  switch (cls) {
    case 'score': return '✓';
    case 'report_only': return '⚠';
    case 'quarantine': return '✗';
    default: return '?';
  }
}

function truncateUrl(url) {
  try { return new URL(url).hostname + '...' ; } catch { return url.slice(0, 50); }
}

function labelClass(label) {
  if (!label) return '';
  return label.toLowerCase().replace(/\s+/g, '-');
}

// ─── Classification Cycling ───────────────────────────────────────────────────

const CLASSIFICATION_CYCLE = ['score', 'report_only', 'quarantine'];

async function cycleClassification(sourceId) {
  const source = productData.sources.find(s => s.id === sourceId);
  if (!source) return;

  const currentIdx = CLASSIFICATION_CYCLE.indexOf(source.classification);
  const newClassification = CLASSIFICATION_CYCLE[(currentIdx + 1) % CLASSIFICATION_CYCLE.length];

  try {
    await fetch(`${API_BASE}/api/curation/${slug}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id: sourceId, classification: newClassification })
    });

    source.classification = newClassification;
    const badge = document.querySelector(`#source-${sourceId} .classification-badge`);
    badge.className = `classification-badge ${newClassification}`;
    badge.innerHTML = `${classificationIcon(newClassification)} ${newClassification}`;
    updateClassificationSummary();
    showToast(`${source.source_name} → ${newClassification}`);
  } catch (err) {
    showToast(`Classification failed: ${err.message}`, 'error');
  }
}

function updateClassificationSummary() {
  const sources = productData.sources || [];
  const score = sources.filter(s => s.classification === 'score').length;
  const report = sources.filter(s => s.classification === 'report_only').length;
  const quarantine = sources.filter(s => s.classification === 'quarantine').length;
  const other = sources.length - score - report - quarantine;

  document.getElementById('classificationSummary').textContent =
    `${sources.length} total · ${score} score · ${report} report only · ${quarantine} quarantine` +
    (other > 0 ? ` · ${other} unset` : '');
}

// ─── Consensus Matrix ─────────────────────────────────────────────────────────

function renderConsensus(matrix) {
  const body = document.getElementById('consensusBody');
  if (!matrix.length) {
    body.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No consensus data</td></tr>';
    return;
  }
  body.innerHTML = matrix.map(row => `
    <tr>
      <td style="font-weight:500;">${row.topic}</td>
      <td>${row.experts || '—'}</td>
      <td>${row.reviews || '—'}</td>
      <td>${row.forums || '—'}</td>
      <td><span class="agreement-${row.agreement || 'moderate'}">${row.agreement || '—'}</span></td>
    </tr>
  `).join('');
}

// ─── Warranty Reality ─────────────────────────────────────────────────────────

function renderWarranty(warranty) {
  renderWarrantyColumn('warrantyBeats', warranty.beats_expectations || []);
  renderWarrantyColumn('warrantyUnderperforms', warranty.underperforms_expectations || []);
  renderWarrantyColumn('warrantySurprises', warranty.surprises || []);
}

function renderWarrantyColumn(containerId, items) {
  const container = document.getElementById(containerId);
  if (!items.length) {
    container.innerHTML = '<p style="font-size:12px; color:var(--text-muted);">None identified</p>';
    return;
  }
  container.innerHTML = items.map(item => `<div class="warranty-item">${item}</div>`).join('');
}

// ─── Verified Specs ───────────────────────────────────────────────────────────

function renderSpecs(specs) {
  const body = document.getElementById('specsBody');
  const entries = Object.entries(specs).filter(([k, v]) => v != null);
  if (!entries.length) {
    body.innerHTML = '<tr><td colspan="2" style="text-align:center; color:var(--text-muted);">No specs data</td></tr>';
    return;
  }
  body.innerHTML = entries.map(([key, value]) => `
    <tr>
      <td style="font-weight:500;">${formatSpecName(key)}</td>
      <td>${value}</td>
    </tr>
  `).join('');
}

function formatSpecName(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Red Flags ────────────────────────────────────────────────────────────────

function renderRedFlags(flags) {
  const section = document.getElementById('redFlagsSection');
  if (!flags.length) { section.style.display = 'none'; return; }
  section.style.display = '';
  document.getElementById('redFlagsList').innerHTML =
    flags.map(f => `<div class="warranty-item" style="color:var(--accent-red);">${f}</div>`).join('');
}

// ─── Actions ──────────────────────────────────────────────────────────────────

async function quarantineAll() {
  const unset = productData.sources.filter(s => !s.classification || s.classification === 'uncertain');
  if (!unset.length) return showToast('No unclassified sources');
  const ids = unset.map(s => s.id);

  try {
    await fetch(`${API_BASE}/api/curation/${slug}/bulk-classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_ids: ids, classification: 'quarantine' })
    });
    showToast(`${ids.length} sources quarantined`);
    loadProduct();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function markReviewed() {
  try {
    const filePath = `${API_BASE}/api/curation/${slug}/release`;
    // First just update status without releasing
    productData.curation_status = 'reviewed';
    showToast('Marked as reviewed');
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function runPipeline() {
  if (!confirm(`Run scoring pipeline for ${productData.product_name}?\n\nEstimated cost: ~$1.20 in API calls\n(Bot 2 → Bot 3 → Scorer → Bot 4 → Bot 5 → Council)\n\nContinue?`)) return;
  try {
    // Release first, then trigger the scoring pipeline
    await fetch(`${API_BASE}/api/curation/${slug}/release`, { method: 'POST' });
    const res = await fetch(`${API_BASE}/api/curation/${slug}/rescore`, { method: 'POST' });
    const result = await res.json();
    if (result.started) {
      showToast(`Pipeline started for ${productData.product_name}. Check curation list for updated score.`, 'success');
    } else if (result.error) {
      showToast(`Pipeline error: ${result.error}`, 'error');
    } else {
      showToast('Pipeline triggered', 'success');
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function rescoreProduct() {
  try {
    const res = await fetch(`${API_BASE}/api/curation/${slug}/rescore`, { method: 'POST' });
    const result = await res.json();
    showToast(`Rescored: ${result.old_score} → ${result.new_score} (${result.duration_ms}ms, $0.00)`);
    loadProduct();
  } catch (err) {
    showToast(`Rescore failed: ${err.message}`, 'error');
  }
}

// ─── Score History ────────────────────────────────────────────────────────────

async function loadScoreHistory() {
  try {
    const res = await fetch(`${API_BASE}/api/score-history/${slug}`);
    const history = await res.json();
    if (history.length) {
      const section = document.getElementById('historySection');
      section.style.display = '';
      document.getElementById('historyList').innerHTML = history.map(h => `
        <div class="product-row">
          <span class="meta">${new Date(h.created_at).toLocaleString()}</span>
          <span class="name">${h.action}</span>
          <span class="meta">${h.old_score || '—'} → ${h.new_score || '—'}</span>
          <span class="meta">${h.notes || ''}</span>
        </div>
      `).join('');
    }
  } catch (err) { /* Score history table may not exist yet */ }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

loadProduct();
