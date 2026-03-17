/* ══════════════════════════════════════════════════════════════════════
   Residentialist — Submit Product Page
   ══════════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'residentialist_submissions';

// ── DOM refs ──────────────────────────────────────────────────────────
const form          = document.getElementById('submit-form');
const submitBtn     = document.getElementById('submit-btn');
const statusCard    = document.getElementById('status-card');
const statusBadge   = document.getElementById('status-badge');
const statusJobId   = document.getElementById('status-job-id');
const statusProduct = document.getElementById('status-product');
const statusCat     = document.getElementById('status-category');
const statusTime    = document.getElementById('status-time');
const progressBar   = document.getElementById('progress-bar');
const progressStep  = document.getElementById('progress-step');
const progressPct   = document.getElementById('progress-pct');
const statusError   = document.getElementById('status-error');
const recentList    = document.getElementById('recent-list');
const recentEmpty   = document.getElementById('recent-empty');
const clearBtn      = document.getElementById('clear-recent');

// ── LocalStorage helpers ──────────────────────────────────────────────
function getSubmissions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch (e) { return []; }
}

function saveSubmission(entry) {
  const list = getSubmissions();
  list.unshift(entry);
  if (list.length > 50) list.length = 50;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Render recent submissions ─────────────────────────────────────────
function renderRecent() {
  const list = getSubmissions();
  Array.from(recentList.querySelectorAll('.recent-item')).forEach(el => el.remove());

  if (list.length === 0) {
    recentEmpty.style.display = 'block';
    return;
  }
  recentEmpty.style.display = 'none';

  list.forEach(entry => {
    const timeStr = entry.timestamp
      ? new Date(entry.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '';

    const item = document.createElement('div');
    item.className = 'recent-item';
    item.innerHTML = `
      <div class="recent-item-info">
        <div class="recent-item-name">${escapeHtml(entry.product_name)}</div>
        <div class="recent-item-meta">${escapeHtml(entry.category)}${entry.config ? ' · ' + escapeHtml(entry.config) : ''}${timeStr ? ' · ' + timeStr : ''}</div>
      </div>
      <span class="recent-item-badge">${escapeHtml(entry.job_id || 'submitted')}</span>
    `;
    recentList.appendChild(item);
  });
}

// ── Loading state ─────────────────────────────────────────────────────
function setLoading(loading) {
  submitBtn.disabled = loading;
  if (loading) {
    submitBtn.innerHTML = '<span class="btn-spinner"></span> Running…';
  } else {
    submitBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Run Pipeline`;
  }
}

// ── Progress animation ────────────────────────────────────────────────
function animateProgress() {
  const steps = [
    { pct: 10, label: 'Queued…' },
    { pct: 25, label: 'Fetching product data…' },
    { pct: 45, label: 'Running analysis…' },
    { pct: 70, label: 'Scoring dimensions…' },
    { pct: 90, label: 'Finalizing results…' },
    { pct: 100, label: 'Complete' },
  ];
  let i = 0;
  const iv = setInterval(() => {
    if (i >= steps.length) { clearInterval(iv); return; }
    const s = steps[i++];
    progressBar.style.width = s.pct + '%';
    progressStep.textContent = s.label;
    progressPct.textContent = s.pct + '%';
    if (s.pct === 100) {
      statusBadge.className = 'status-badge success';
      statusBadge.textContent = 'Queued';
    }
  }, 1800);
}

// ── Show status card ──────────────────────────────────────────────────
function showStatus({ job_id, product_name, category, status, error }) {
  statusCard.classList.add('visible');
  statusCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  statusJobId.textContent   = job_id || '—';
  statusProduct.textContent = product_name || '—';
  statusCat.textContent     = category || '—';
  statusTime.textContent    = new Date().toLocaleTimeString();
  statusError.style.display = 'none';

  if (status === 'error') {
    statusBadge.className = 'status-badge error';
    statusBadge.textContent = 'Error';
    progressStep.textContent = 'Failed';
    progressPct.textContent = '';
    progressBar.style.width = '0%';
    if (error) { statusError.textContent = error; statusError.style.display = 'block'; }
  } else {
    statusBadge.className = 'status-badge running';
    statusBadge.textContent = 'Running';
    animateProgress();
  }
}

// ── Form submit ───────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const product_name = document.getElementById('product-name').value.trim();
  const category     = document.getElementById('category').value;
  const config       = document.getElementById('config').value.trim();

  if (!product_name || !category) return;
  setLoading(true);

  try {
    const res  = await fetch('/api/pipeline/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_name, category, config }),
    });

    const data   = await res.json().catch(() => ({}));
    const job_id = data.job_id || data.id || ('job_' + Date.now());

    showStatus({ job_id, product_name, category, config, status: res.ok ? 'running' : 'error', error: data.error || (res.ok ? null : 'HTTP ' + res.status) });
    saveSubmission({ job_id, product_name, category, config, timestamp: Date.now(), status: res.ok ? 'submitted' : 'error' });
    renderRecent();
    if (res.ok) form.reset();
  } catch (err) {
    showStatus({ job_id: null, product_name, category, config, status: 'error', error: err.message });
    saveSubmission({ job_id: null, product_name, category, config, timestamp: Date.now(), status: 'error' });
    renderRecent();
  } finally {
    setLoading(false);
  }
});

// ── Clear history ─────────────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  renderRecent();
});

// ── Init ──────────────────────────────────────────────────────────────
renderRecent();
