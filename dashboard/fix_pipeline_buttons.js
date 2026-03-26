/**
 * Fix 1: Add confirmation dialog to runSelected() in curation.js
 * Fix 2: Fix runPipeline() in curation-product.js to use /rescore endpoint
 */
const fs = require('fs');
const path = require('path');

const PUBLIC = '/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/public';

// ─── Fix 1: curation.js — add confirm dialog to runSelected ─────────────────
const curationJsPath = path.join(PUBLIC, 'js', 'curation.js');
let curationJs = fs.readFileSync(curationJsPath, 'utf8');

const oldRunSelectedStart = `async function runSelected(type) {
  const checkboxes = document.querySelectorAll(\`.checkbox[data-type="\${type}"]:checked\`);
  const slugs = [...checkboxes].map(cb => cb.dataset.slug);
  if (!slugs.length) return showToast('No products selected', 'error');

  showToast(\`Processing \${slugs.length} product(s)...\`, 'success');`;

const newRunSelectedStart = `async function runSelected(type) {
  const checkboxes = document.querySelectorAll(\`.checkbox[data-type="\${type}"]:checked\`);
  const slugs = [...checkboxes].map(cb => cb.dataset.slug);
  if (!slugs.length) return showToast('No products selected', 'error');

  const cost = (slugs.length * 1.20).toFixed(2);
  if (!confirm(\`Run scoring pipeline on \${slugs.length} product(s)?\\n\\nEstimated cost: ~$\${cost} in API calls\\n(Bot 2 → Bot 3 → Scorer → Bot 4 → Bot 5 → Council)\\n\\nContinue?\`)) return;

  showToast(\`Processing \${slugs.length} product(s)...\`, 'success');`;

if (curationJs.includes(oldRunSelectedStart)) {
  curationJs = curationJs.replace(oldRunSelectedStart, newRunSelectedStart);
  fs.writeFileSync(curationJsPath, curationJs);
  console.log('[Fix 1] ✅ runSelected() now has confirmation dialog with cost estimate');
} else {
  console.log('[Fix 1] ⚠️ Could not find runSelected pattern');
}

// ─── Fix 2: curation-product.js — fix runPipeline() to use /rescore ──────────
const cpJsPath = path.join(PUBLIC, 'js', 'curation-product.js');
let cpJs = fs.readFileSync(cpJsPath, 'utf8');

// Find the runPipeline function and replace the release call with rescore
const oldRunPipeline = `async function runPipeline() {
  if (!confirm(\`Run full pipeline for \${productData.product_name}? This will use ~$1.20 in API calls.\`)) return;
  try {
    await fetch(\`\${API_BASE}/api/curation/\${slug}/release\`, { method: 'POST' });
    showToast('Released to pipeline');
  } catch (err) {
    showToast(\`Error: \${err.message}\`, 'error');
  }
}`;

const newRunPipeline = `async function runPipeline() {
  if (!confirm(\`Run scoring pipeline for \${productData.product_name}?\\n\\nEstimated cost: ~$1.20 in API calls\\n(Bot 2 → Bot 3 → Scorer → Bot 4 → Bot 5 → Council)\\n\\nContinue?\`)) return;
  try {
    // Release first, then trigger the scoring pipeline
    await fetch(\`\${API_BASE}/api/curation/\${slug}/release\`, { method: 'POST' });
    const res = await fetch(\`\${API_BASE}/api/curation/\${slug}/rescore\`, { method: 'POST' });
    const result = await res.json();
    if (result.started) {
      showToast(\`Pipeline started for \${productData.product_name}. Check curation list for updated score.\`, 'success');
    } else if (result.error) {
      showToast(\`Pipeline error: \${result.error}\`, 'error');
    } else {
      showToast('Pipeline triggered', 'success');
    }
  } catch (err) {
    showToast(\`Error: \${err.message}\`, 'error');
  }
}`;

if (cpJs.includes(oldRunPipeline)) {
  cpJs = cpJs.replace(oldRunPipeline, newRunPipeline);
  fs.writeFileSync(cpJsPath, cpJs);
  console.log('[Fix 2] ✅ runPipeline() now calls /rescore after /release');
} else {
  console.log('[Fix 2] ⚠️ Could not find runPipeline pattern, trying alternate match');
  // Try a more flexible match
  if (cpJs.includes("async function runPipeline()") && cpJs.includes("Released to pipeline")) {
    // Replace the whole function using brace matching
    const funcStart = cpJs.indexOf('async function runPipeline()');
    let depth = 0, i = cpJs.indexOf('{', funcStart);
    for (; i < cpJs.length; i++) {
      if (cpJs[i] === '{') depth++;
      if (cpJs[i] === '}') { depth--; if (depth === 0) break; }
    }
    cpJs = cpJs.substring(0, funcStart) + newRunPipeline + cpJs.substring(i + 1);
    fs.writeFileSync(cpJsPath, cpJs);
    console.log('[Fix 2] ✅ runPipeline() replaced (fallback method)');
  } else {
    console.log('[Fix 2] ⚠️ runPipeline function not found');
  }
}

console.log('\n[DONE]');
