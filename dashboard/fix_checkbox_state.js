/**
 * Fix: Preserve checkbox state across auto-refresh and prevent re-render while selecting.
 */
const fs = require('fs');
const path = require('path');

const jsPath = '/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/public/js/curation.js';
let js = fs.readFileSync(jsPath, 'utf8');

// Fix 1: In loadProducts(), preserve checked state before re-render and restore after
const oldLoadProducts = `async function loadProducts() {
  try {
    const res = await fetch(\`\${API_BASE}/api/curation\`);`;

const newLoadProducts = `async function loadProducts() {
  // Preserve checkbox state before re-render
  const checkedSlugs = new Set(
    [...document.querySelectorAll('.checkbox:checked')].map(cb => cb.dataset.slug)
  );

  try {
    const res = await fetch(\`\${API_BASE}/api/curation\`);`;

if (js.includes(oldLoadProducts)) {
  js = js.replace(oldLoadProducts, newLoadProducts);
  console.log('[Fix 1a] ✅ Save checked state before re-render');
}

// Fix 2: In renderProductList, restore checked state after rendering
const oldRenderEnd = `  container.innerHTML = html;
}`;

// Find all occurrences and only replace the one inside renderProductList
// The renderProductList function builds HTML and sets container.innerHTML = html
const renderFnStart = js.indexOf('function renderProductList(containerId, products, type)');
if (renderFnStart !== -1) {
  const renderContainerInnerHTML = js.indexOf("container.innerHTML = html;\n}", renderFnStart);
  if (renderContainerInnerHTML !== -1) {
    const newRenderEnd = `  container.innerHTML = html;

  // Restore checked state from before re-render
  if (typeof checkedSlugs !== 'undefined' && checkedSlugs.size > 0) {
    container.querySelectorAll('.checkbox').forEach(cb => {
      if (checkedSlugs.has(cb.dataset.slug)) cb.checked = true;
    });
  }
}`;
    js = js.substring(0, renderContainerInnerHTML) + newRenderEnd + js.substring(renderContainerInnerHTML + oldRenderEnd.length);
    console.log('[Fix 2] ✅ Restore checked state after re-render');
  }
}

// Fix 3: Make checkedSlugs a global variable accessible from renderProductList
// Actually, loadProducts calls renderProductList, so checkedSlugs is in scope as a closure.
// But it's defined inside loadProducts. Let me make it a module-level variable instead.
js = js.replace(
  `  // Preserve checkbox state before re-render
  const checkedSlugs = new Set(`,
  `  // Preserve checkbox state before re-render
  window._checkedSlugs = new Set(`
);
js = js.replace(
  `  if (typeof checkedSlugs !== 'undefined' && checkedSlugs.size > 0) {
    container.querySelectorAll('.checkbox').forEach(cb => {
      if (checkedSlugs.has(cb.dataset.slug)) cb.checked = true;
    });
  }`,
  `  if (window._checkedSlugs && window._checkedSlugs.size > 0) {
    container.querySelectorAll('.checkbox').forEach(cb => {
      if (window._checkedSlugs.has(cb.dataset.slug)) cb.checked = true;
    });
  }`
);
console.log('[Fix 3] ✅ Use window._checkedSlugs for cross-function access');

fs.writeFileSync(jsPath, js);

// Verify
const { execSync } = require('child_process');
try {
  execSync(`/usr/local/bin/node -c "${jsPath}"`, { stdio: 'pipe' });
  console.log('[SYNTAX] ✅');
} catch (e) {
  console.error('[SYNTAX] ❌', e.stderr?.toString().split('\n').slice(0, 3).join('\n'));
}

console.log('[DONE]');
