/**
 * Fix three curation dashboard issues:
 * 1. openProduct() URL routing — use relative path with /scores/ prefix awareness
 * 2. runSelected() pipeline trigger — call rescore after release
 * 3. curation-product.html nav links — make relative
 */

const fs = require('fs');
const path = require('path');

const PUBLIC = '/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/public';

// ─── Fix 1 & 2: curation.js ────────────────────────────────────────────────

const curationJsPath = path.join(PUBLIC, 'js', 'curation.js');
let curationJs = fs.readFileSync(curationJsPath, 'utf8');

// Fix 1: openProduct — use relative path so <base> tag handles the prefix
const oldOpen = "function openProduct(slug) {\n  window.location.href = `/curation-product.html?slug=${slug}`;\n}";
const newOpen = `function openProduct(slug) {
  window.location.href = 'curation-product.html?slug=' + slug;
}`;

if (curationJs.includes("window.location.href = `/curation-product.html")) {
  curationJs = curationJs.replace(
    /function openProduct\(slug\) \{[\s\S]*?window\.location\.href = `\/curation-product\.html\?slug=\$\{slug\}`;[\s\S]*?\}/,
    newOpen
  );
  console.log('[FIX 1] ✅ openProduct() URL made relative');
} else if (curationJs.includes("'curation-product.html?slug='")) {
  console.log('[FIX 1] Already fixed');
} else {
  console.log('[FIX 1] ⚠️ Could not find openProduct pattern');
}

// Fix 2: runSelected — after releasing, trigger the scoring pipeline via rescore
const oldRunSelected = `async function runSelected(type) {
  const checkboxes = document.querySelectorAll(\`.checkbox[data-type="\${type}"]:checked\`);
  const slugs = [...checkboxes].map(cb => cb.dataset.slug);
  if (!slugs.length) return showToast('No products selected', 'error');

  for (const slug of slugs) {
    try {
      await fetch(\`\${API_BASE}/api/curation/\${slug}/release\`, { method: 'POST' });
    } catch (err) {
      console.error(\`Release failed for \${slug}:\`, err);
    }
  }
  showToast(\`\${slugs.length} products released to pipeline\`, 'success');
  loadProducts();
}`;

const newRunSelected = `async function runSelected(type) {
  const checkboxes = document.querySelectorAll(\`.checkbox[data-type="\${type}"]:checked\`);
  const slugs = [...checkboxes].map(cb => cb.dataset.slug);
  if (!slugs.length) return showToast('No products selected', 'error');

  showToast(\`Processing \${slugs.length} product(s)...\`, 'success');

  for (const slug of slugs) {
    try {
      // Step 1: Release from staging
      await fetch(\`\${API_BASE}/api/curation/\${slug}/release\`, { method: 'POST' });

      // Step 2: Trigger scoring pipeline (uses curated sources, skips Bot 1)
      showToast(\`Scoring \${slug.replace(/_/g, ' ')}...\`, 'success');
      const scoreRes = await fetch(\`\${API_BASE}/api/curation/\${slug}/rescore\`, { method: 'POST' });
      const scoreResult = await scoreRes.json();
      if (scoreResult.error) {
        showToast(\`Score failed for \${slug}: \${scoreResult.error}\`, 'error');
      } else {
        showToast(\`\${slug.replace(/_/g, ' ')}: scored \${scoreResult.new_score || 'done'}\`, 'success');
      }
    } catch (err) {
      console.error(\`Pipeline failed for \${slug}:\`, err);
      showToast(\`Error for \${slug}: \${err.message}\`, 'error');
    }
  }
  showToast(\`\${slugs.length} product(s) released and scored\`, 'success');
  loadProducts();
}`;

if (curationJs.includes("showToast(`${slugs.length} products released to pipeline`")) {
  curationJs = curationJs.replace(
    /async function runSelected\(type\) \{[\s\S]*?showToast\(`\$\{slugs\.length\} products released to pipeline`[\s\S]*?loadProducts\(\);\s*\}/,
    newRunSelected
  );
  console.log('[FIX 2] ✅ runSelected() now triggers scoring pipeline after release');
} else if (curationJs.includes('Scoring ${slug')) {
  console.log('[FIX 2] Already fixed');
} else {
  console.log('[FIX 2] ⚠️ Could not find runSelected pattern — applying manual fix');
  // Fallback: just replace the function
  const funcStart = curationJs.indexOf('async function runSelected(type)');
  if (funcStart !== -1) {
    // Find end of function by counting braces
    let depth = 0, i = curationJs.indexOf('{', funcStart);
    for (; i < curationJs.length; i++) {
      if (curationJs[i] === '{') depth++;
      if (curationJs[i] === '}') { depth--; if (depth === 0) break; }
    }
    curationJs = curationJs.substring(0, funcStart) + newRunSelected + curationJs.substring(i + 1);
    console.log('[FIX 2] ✅ runSelected() replaced (fallback method)');
  }
}

fs.writeFileSync(curationJsPath, curationJs);

// ─── Fix 3: curation-product.html nav links ─────────────────────────────────

const cpHtmlPath = path.join(PUBLIC, 'curation-product.html');
let cpHtml = fs.readFileSync(cpHtmlPath, 'utf8');

// Fix absolute nav links
let htmlChanged = false;
if (cpHtml.includes('href="/curation.html"')) {
  cpHtml = cpHtml.replace(/href="\/curation\.html"/g, 'href="curation.html"');
  htmlChanged = true;
}
if (cpHtml.includes('href="/manufacturer.html"')) {
  cpHtml = cpHtml.replace(/href="\/manufacturer\.html"/g, 'href="manufacturer.html"');
  htmlChanged = true;
}

if (htmlChanged) {
  fs.writeFileSync(cpHtmlPath, cpHtml);
  console.log('[FIX 3] ✅ curation-product.html nav links made relative');
} else {
  console.log('[FIX 3] Nav links already relative');
}

// Also fix curation.html nav links
const cHtmlPath = path.join(PUBLIC, 'curation.html');
let cHtml = fs.readFileSync(cHtmlPath, 'utf8');
let cHtmlChanged = false;
if (cHtml.includes('href="/curation.html"')) {
  cHtml = cHtml.replace(/href="\/curation\.html"/g, 'href="curation.html"');
  cHtmlChanged = true;
}
if (cHtml.includes('href="/manufacturer.html"')) {
  cHtml = cHtml.replace(/href="\/manufacturer\.html"/g, 'href="manufacturer.html"');
  cHtmlChanged = true;
}
if (cHtmlChanged) {
  fs.writeFileSync(cHtmlPath, cHtml);
  console.log('[FIX 3] ✅ curation.html nav links made relative');
}

console.log('\n[DONE] All fixes applied. No server restart needed (static files).');
