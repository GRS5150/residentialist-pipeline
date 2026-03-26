/**
 * THE RESIDENTIALIST — Curation Home Page JS
 */

const API_BASE = location.pathname.startsWith('/scores') ? '/scores' : '';
let allProducts = [];

// ─── Data Loading ─────────────────────────────────────────────────────────────

async function loadProducts() {
  // Preserve checkbox state before re-render
  window._checkedSlugs = new Set(
    [...document.querySelectorAll('.checkbox:checked')].map(cb => cb.dataset.slug)
  );

  try {
    const res = await fetch(`${API_BASE}/api/curation`);
    allProducts = await res.json();
    renderProducts();
    populateManufacturerFilter();
    checkQueueStatus();
  } catch (err) {
    console.error('Failed to load products:', err);
  }
}

function populateManufacturerFilter() {
  const select = document.getElementById('filterManufacturer');
  const manufacturers = [...new Set(allProducts.map(p => p.manufacturer_slug).filter(Boolean))].sort();
  manufacturers.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    select.appendChild(opt);
  });
}

function filterProducts() {
  renderProducts();
}

function getFilteredProducts() {
  const status = document.getElementById('filterStatus').value;
  const manufacturer = document.getElementById('filterManufacturer').value;

  return allProducts.filter(p => {
    if (status !== 'all' && p.curation_status !== status) return false;
    if (manufacturer !== 'all' && p.manufacturer_slug !== manufacturer) return false;
    return true;
  });
}

// ─── Rendering ────────────────────────────────────────────────────────────────

function renderProducts() {
  const products = getFilteredProducts();

  const staged = products.filter(p => p.curation_status === 'staged');
  const reviewed = products.filter(p => p.curation_status === 'reviewed' || p.curation_status === 'released');
  const scored = products.filter(p => p.display_score != null);

  renderProductList('stagedList', staged, 'staged');
  renderProductList('reviewedList', reviewed, 'reviewed');
  renderProductList('scoredList', scored, 'scored');
}

function renderProductList(containerId, products, type) {
  const container = document.getElementById(containerId);
  if (!products.length) {
    container.innerHTML = '<div class="empty-state"><p>No products in this status.</p></div>';
    return;
  }

  container.innerHTML = products.map(p => {
    const reviewBadge = p.needs_review > 0
      ? `<span class="review-badge">${p.needs_review} need review</span>`
      : `<span class="review-badge done">✓ Reviewed</span>`;

    let scoreBadge = '';
    if (p.display_score && p.display_score > 0) {
      scoreBadge = `<span class="score-badge">${p.display_score}</span><span class="label-badge label-${labelClass(p.product_label)}">${p.product_label || ''}</span>`;
    } else {
      scoreBadge = `<span class="label-badge" style="background:var(--bg-tertiary); color:var(--text-muted);">Not yet scored</span>`;
    }

    return `
      <div class="product-row" onclick="openProduct('${p.slug}')">
        <input type="checkbox" class="checkbox" data-slug="${p.slug}" data-type="${type}" onclick="event.stopPropagation()">
        <span class="status-dot ${p.curation_status}"></span>
        <span class="name">${p.product_name}</span>
        <span class="source-count">${p.total_sources} src</span>
        ${type !== 'scored' ? reviewBadge : scoreBadge}
        <span class="meta">${p.deep_dive_date || ''}</span>
        <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation(); openProduct('${p.slug}')">Open</button>
      </div>
    `;
  }).join('');
  if (window._checkedSlugs && window._checkedSlugs.size > 0) { container.querySelectorAll('.checkbox').forEach(cb => { if (window._checkedSlugs.has(cb.dataset.slug)) cb.checked = true; }); }
}

function labelClass(label) {
  if (!label) return '';
  return label.toLowerCase().replace(/\s+/g, '-');
}

// ─── Actions ──────────────────────────────────────────────────────────────────

async function startDeepDive() {
  const productName = document.getElementById('productName').value.trim();
  const operationType = document.getElementById('operationType').value;
  if (!productName) return;

  const btn = document.getElementById('startBtn');
  btn.disabled = true;
  btn.textContent = 'Starting...';

  try {
    const res = await fetch(`${API_BASE}/api/deepdive/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_name: productName, operation_type: operationType })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Full pipeline started for ${productName} (deep dive → scoring)`, 'success');
      // Start polling for this product's progress
      if (data.slug) startProgressPoll(data.slug);
    } else {
      showToast(`Error: ${data.error}`, 'error');
    }
    document.getElementById('productName').value = '';
    setTimeout(checkQueueStatus, 2000);
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Start';
  }
}

async function startBatch() {
  const input = document.getElementById('batchInput').value.trim();
  if (!input) return;

  const products = input.split('\n').filter(l => l.trim()).map(line => {
    const parts = line.split(',').map(s => s.trim());
    return { product_name: parts[0], operation_type: parts[1] || 'double_hung' };
  });

  try {
    const res = await fetch(`${API_BASE}/api/deepdive/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products })
    });
    const data = await res.json();
    showToast(data.success ? `${products.length} products queued` : `Error: ${data.error}`, data.success ? 'success' : 'error');
    document.getElementById('batchInput').value = '';
    setTimeout(checkQueueStatus, 2000);
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

async function runSelected(type) {
  const checkboxes = document.querySelectorAll(`.checkbox[data-type="${type}"]:checked`);
  const slugs = [...checkboxes].map(cb => cb.dataset.slug);
  if (!slugs.length) return showToast('No products selected', 'error');

  const cost = (slugs.length * 1.20).toFixed(2);
  if (!confirm(`Run scoring pipeline on ${slugs.length} product(s)?\n\nEstimated cost: ~${cost} in API calls\n(Bot 2 → Bot 3 → Scorer → Bot 4 → Bot 5 → Council)\n\nContinue?`)) return;

  showToast(`Processing ${slugs.length} product(s)...`, 'success');

  for (const slug of slugs) {
    try {
      // Step 1: Release from staging
      await fetch(`${API_BASE}/api/curation/${slug}/release`, { method: 'POST' });

      // Step 2: Trigger scoring pipeline (uses curated sources, skips Bot 1)
      showToast(`Starting pipeline for ${slug.replace(/_/g, ' ')}...`, 'success');
      const scoreRes = await fetch(`${API_BASE}/api/curation/${slug}/rescore`, { method: 'POST' });
      const scoreResult = await scoreRes.json();
      if (scoreResult.error) {
        showToast(`Pipeline failed for ${slug}: ${scoreResult.error}`, 'error');
      } else if (scoreResult.started) {
        showToast(`Pipeline running for ${slug.replace(/_/g, ' ')} (3-5 min)`, 'success');
        // Start polling for this product's progress
        startProgressPoll(slug);
      } else {
        showToast(`${slug.replace(/_/g, ' ')}: scored ${scoreResult.new_score || 'done'}`, 'success');
      }
    } catch (err) {
      console.error(`Pipeline failed for ${slug}:`, err);
      showToast(`Error for ${slug}: ${err.message}`, 'error');
    }
  }
  showToast(`${slugs.length} product(s) released to pipeline`, 'success');
  loadProducts();
}


// ─── Pipeline Progress Polling ────────────────────────────────────────────────
const activePolls = {};

function startProgressPoll(slug) {
  if (activePolls[slug]) return;
  activePolls[slug] = setInterval(function() { pollProgress(slug); }, 10000);
  updateProductRowStatus(slug, 'Pipeline starting...', true);
}

async function pollProgress(slug) {
  try {
    const res = await fetch(API_BASE + '/api/curation/' + slug + '/pipeline-status');
    const progress = await res.json();
    if (progress.status === 'done') {
      var doneText = 'Scored';
      if (progress.score) doneText = 'Scored: ' + progress.score + '/100 (' + (progress.label || '') + ')';
      updateProductRowStatus(slug, doneText, false);
      clearInterval(activePolls[slug]);
      delete activePolls[slug];
      setTimeout(loadProducts, 3000);
    } else if (progress.status === 'running') {
      var phaseLabel = progress.phase === 'deep_dive' ? 'Deep Dive' : progress.phase === 'scoring' ? 'Scoring' : '';
      updateProductRowStatus(slug, (phaseLabel ? phaseLabel + ': ' : '') + progress.current_bot + ' (' + progress.step + '/' + progress.total + ')', true);
    } else if (progress.status === 'error') {
      var errText = 'Pipeline error';
      if (progress.error) errText += ': ' + progress.error.substring(0, 60);
      updateProductRowStatus(slug, errText, false);
      clearInterval(activePolls[slug]);
      delete activePolls[slug];
    }
  } catch (err) { console.error('Poll error:', err); }
}

function updateProductRowStatus(slug, statusText, isActive) {
  var checkbox = document.querySelector('.checkbox[data-slug="' + slug + '"]');
  if (!checkbox) return;
  var row = checkbox.closest('.product-row');
  if (!row) return;
  var indicator = row.querySelector('.pipeline-progress');
  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'pipeline-progress';
    indicator.style.cssText = 'font-size:12px;padding:2px 8px;border-radius:4px;margin-left:8px;';
    var btn = row.querySelector('.btn');
    if (btn) row.insertBefore(indicator, btn);
    else row.appendChild(indicator);
  }
  indicator.textContent = statusText;
  indicator.style.background = isActive ? '#3b82f6' : (statusText.indexOf('Scored') >= 0 ? '#22c55e' : '#ef4444');
  indicator.style.color = 'white';
  indicator.style.animation = isActive ? 'pulse 2s infinite' : '';
}

function openProduct(slug) {
  window.location.href = '/scores/curation-product.html?slug=' + slug;
}

// ─── Queue Status ─────────────────────────────────────────────────────────────

async function checkQueueStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/deepdive/status`);
    const status = await res.json();
    const section = document.getElementById('queueSection');

    // Check if any pipelines are actively running (from progress polls)
    const hasActivePolls = Object.keys(activePolls).length > 0;

    if (status.processing || status.queued > 0 || hasActivePolls) {
      section.style.display = '';
      const list = document.getElementById('queueList');
      const items = status.queue_items || [];
      const current = status.current;

      let html = '';

      // Show active full-pipeline runs
      for (const slug of Object.keys(activePolls)) {
        html += `<div class="product-row">
          <span class="status-dot processing"></span>
          <span class="name">${slug.replace(/_/g, ' ')}</span>
          <span class="meta pipeline-progress" id="queue-progress-${slug}" style="font-size:12px;padding:2px 8px;border-radius:4px;background:#3b82f6;color:white;">Running...</span>
        </div>`;
      }

      if (current) {
        html += `<div class="product-row">
          <span class="status-dot processing"></span>
          <span class="name">${current.product_name || current.manufacturer || 'Processing...'}</span>
          <span class="meta">${current.type}</span>
          <div class="progress-bar"><div class="fill" style="width:50%"></div></div>
        </div>`;
      }
      items.forEach(item => {
        html += `<div class="product-row">
          <span class="status-dot"></span>
          <span class="name">${item.name}</span>
          <span class="meta">${item.type} · #${item.position}</span>
        </div>`;
      });
      list.innerHTML = html;

      // Poll while processing
      setTimeout(checkQueueStatus, 5000);
    } else {
      section.style.display = 'none';
    }
  } catch (err) {
    console.error('Queue status check failed:', err);
  }
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

loadProducts();
setInterval(loadProducts, 30000); // Refresh every 30s
