/**
 * Fix all curation page navigation to use /scores/ prefix.
 * Affects: curation.html, curation-product.html, manufacturer.html, curation.js
 */
const fs = require('fs');
const path = require('path');

const PUBLIC = '/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/public';

// ─── Fix HTML files ──────────────────────────────────────────────────────────

const htmlFiles = ['curation.html', 'curation-product.html', 'manufacturer.html'];

for (const file of htmlFiles) {
  const filePath = path.join(PUBLIC, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let changes = [];

  // Remove dynamic <base> tag — we'll use explicit /scores/ paths instead
  if (html.includes("document.write('<base href=")) {
    html = html.replace(/<script>document\.write\('<base href="' \+ \(location\.pathname\.startsWith\('\/scores'\) \? '\/scores\/' : '\/'\) \+ '">'[^<]*<\/script>\n?/, '');
    changes.push('removed dynamic <base> tag');
  }

  // Fix CSS path — make explicit /scores/css/curation.css
  html = html.replace(/href="css\/curation\.css"/g, 'href="/scores/css/curation.css"');
  html = html.replace(/href="\/css\/curation\.css"/g, 'href="/scores/css/curation.css"');
  if (html.includes('/scores/css/curation.css')) changes.push('CSS → /scores/css/curation.css');

  // Fix JS path
  html = html.replace(/src="js\/curation-product\.js"/g, 'src="/scores/js/curation-product.js"');
  html = html.replace(/src="\/js\/curation-product\.js"/g, 'src="/scores/js/curation-product.js"');
  html = html.replace(/src="js\/curation\.js"/g, 'src="/scores/js/curation.js"');
  html = html.replace(/src="\/js\/curation\.js"/g, 'src="/scores/js/curation.js"');
  html = html.replace(/src="js\/manufacturer\.js"/g, 'src="/scores/js/manufacturer.js"');
  html = html.replace(/src="\/js\/manufacturer\.js"/g, 'src="/scores/js/manufacturer.js"');

  // Fix nav links — all forms → /scores/
  html = html.replace(/href="curation\.html"/g, 'href="/scores/curation.html"');
  html = html.replace(/href="\/curation\.html"/g, 'href="/scores/curation.html"');
  html = html.replace(/href="manufacturer\.html"/g, 'href="/scores/manufacturer.html"');
  html = html.replace(/href="\/manufacturer\.html"/g, 'href="/scores/manufacturer.html"');
  html = html.replace(/href="curation-product\.html/g, 'href="/scores/curation-product.html');
  html = html.replace(/href="\/curation-product\.html/g, 'href="/scores/curation-product.html');

  // Don't double-prefix
  html = html.replace(/\/scores\/scores\//g, '/scores/');

  changes.push('all nav links → /scores/ prefix');

  fs.writeFileSync(filePath, html);
  console.log(`[${file}] ✅ ${changes.join(', ')}`);
}

// ─── Fix curation.js — openProduct() ─────────────────────────────────────────

const curationJsPath = path.join(PUBLIC, 'js', 'curation.js');
let curationJs = fs.readFileSync(curationJsPath, 'utf8');

// Fix openProduct to use /scores/ prefix
curationJs = curationJs.replace(
  /window\.location\.href = 'curation-product\.html\?slug=' \+ slug;/,
  "window.location.href = '/scores/curation-product.html?slug=' + slug;"
);

// Also fix any other relative navigation
curationJs = curationJs.replace(
  /window\.location\.href = '\/curation-product\.html\?slug=' \+ slug;/,
  "window.location.href = '/scores/curation-product.html?slug=' + slug;"
);

// Don't double-prefix
curationJs = curationJs.replace(/\/scores\/scores\//g, '/scores/');

fs.writeFileSync(curationJsPath, curationJs);
console.log('[curation.js] ✅ openProduct → /scores/curation-product.html');

// ─── Fix manufacturer.js if it has navigation ────────────────────────────────

const mfgJsPath = path.join(PUBLIC, 'js', 'manufacturer.js');
if (fs.existsSync(mfgJsPath)) {
  let mfgJs = fs.readFileSync(mfgJsPath, 'utf8');
  let mfgChanged = false;

  // Check for any navigation to curation pages
  if (mfgJs.includes("'curation") || mfgJs.includes("'/curation")) {
    mfgJs = mfgJs.replace(/window\.location\.href = '\/?(curation[^']*\.html)/g, "window.location.href = '/scores/$1");
    mfgJs = mfgJs.replace(/\/scores\/scores\//g, '/scores/');
    mfgChanged = true;
  }

  if (mfgChanged) {
    fs.writeFileSync(mfgJsPath, mfgJs);
    console.log('[manufacturer.js] ✅ navigation links fixed');
  } else {
    console.log('[manufacturer.js] No navigation links found');
  }
}

// ─── Fix curation-product.js if it has navigation ────────────────────────────

const cpJsPath = path.join(PUBLIC, 'js', 'curation-product.js');
if (fs.existsSync(cpJsPath)) {
  let cpJs = fs.readFileSync(cpJsPath, 'utf8');
  let cpChanged = false;

  if (cpJs.includes("'curation") || cpJs.includes("'/curation") || cpJs.includes("'manufacturer")) {
    cpJs = cpJs.replace(/window\.location\.href = '\/?(curation[^']*\.html)/g, "window.location.href = '/scores/$1");
    cpJs = cpJs.replace(/window\.location\.href = '\/?(manufacturer[^']*\.html)/g, "window.location.href = '/scores/$1");
    cpJs = cpJs.replace(/\/scores\/scores\//g, '/scores/');
    cpChanged = true;
  }

  if (cpChanged) {
    fs.writeFileSync(cpJsPath, cpJs);
    console.log('[curation-product.js] ✅ navigation links fixed');
  } else {
    console.log('[curation-product.js] No navigation links to fix');
  }
}

console.log('\n[DONE] All curation navigation updated to /scores/ prefix');
