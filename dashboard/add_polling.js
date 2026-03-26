const fs = require('fs');
const jsPath = '/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/public/js/curation.js';
let js = fs.readFileSync(jsPath, 'utf8');

const pollingFunctions = `
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
      updateProductRowStatus(slug, 'Scored', false);
      clearInterval(activePolls[slug]);
      delete activePolls[slug];
      setTimeout(loadProducts, 2000);
    } else if (progress.status === 'running') {
      updateProductRowStatus(slug, 'Pipeline running... ' + progress.current_bot + ' (' + progress.step + '/' + progress.total + ')', true);
    } else if (progress.status === 'error') {
      updateProductRowStatus(slug, 'Pipeline error', false);
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

`;

// Insert before openProduct function
if (!js.includes('function startProgressPoll')) {
  js = js.replace('function openProduct(slug)', pollingFunctions + 'function openProduct(slug)');
  fs.writeFileSync(jsPath, js);
  console.log('ADDED polling functions');
} else {
  console.log('Already has polling functions');
}

// Verify
const count = (js.match(/startProgressPoll/g) || []).length;
console.log('startProgressPoll references:', count);
