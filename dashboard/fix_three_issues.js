/**
 * Fix script: patch three issues in dashboard_server.js
 * 1. Fix WORKSPACE path (append /residentialist if needed)
 * 2. Fix price labels (retire "Exceeds/Meets/Below Its Class")
 * 3. Verify curation CSS link
 * 
 * Run: node fix_three_issues.js
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const SERVER_PATH = path.join(WORKSPACE, 'dashboard', 'dashboard_server.js');

let code = fs.readFileSync(SERVER_PATH, 'utf8');
let changed = false;

// ─── Fix 1: WORKSPACE path ──────────────────────────────────────────────────
// The server uses path.resolve(__dirname, '..') which resolves to /workspace/ not /workspace/residentialist/
// Replace with explicit path that includes /residentialist
const oldWorkspace = "const WORKSPACE = process.env.RESIDENTIALIST_WORKSPACE || path.resolve(__dirname, '..');";
const newWorkspace = `let WORKSPACE = process.env.RESIDENTIALIST_WORKSPACE || path.resolve(__dirname, '..');
// Auto-detect: if DB not found at workspace root, try /residentialist subdirectory
if (!fs.existsSync(path.join(WORKSPACE, 'residentialist.db')) && fs.existsSync(path.join(WORKSPACE, 'residentialist', 'residentialist.db'))) {
  WORKSPACE = path.join(WORKSPACE, 'residentialist');
}`;

if (code.includes(oldWorkspace)) {
  code = code.replace(oldWorkspace, newWorkspace);
  console.log('[FIX 1] ✅ WORKSPACE auto-detection added');
  changed = true;
} else if (code.includes('Auto-detect: if DB not found')) {
  console.log('[FIX 1] Already applied');
} else {
  console.log('[FIX 1] ⚠️ Could not find WORKSPACE line to patch');
}

// ─── Fix 2: Price labels ────────────────────────────────────────────────────
// Replace old "Exceeds/Meets/Below Its Class" with new Price Positioning vocabulary
const oldLabels = [
  ["exceeds: { label: 'Exceeds Its Class'", "exceeds: { label: 'Price Outperformer'"],
  ["detail: 'Scores above what its price should deliver'", "detail: 'Delivers more quality than its price tier suggests'"],
  ["meets: { label: 'Meets Its Class'", "meets: { label: 'Price Aligned'"],
  ["detail: 'Performs where you\\'d expect for the money'", "detail: 'Quality matches what you pay'"],
  ["below: { label: 'Below Its Class'", "below: { label: 'Price Underperformer'"],
  ["detail: \"You're paying for the name, not the product\"", "detail: 'Quality falls short of its price point'"]
];

for (const [old, newVal] of oldLabels) {
  if (code.includes(old)) {
    code = code.replace(old, newVal);
    changed = true;
  }
}
console.log('[FIX 2] ✅ Price labels updated to new vocabulary');

// ─── Fix 3: Verify curation CSS ─────────────────────────────────────────────
const curationHtmlPath = path.join(WORKSPACE, 'dashboard', 'public', 'curation.html');
if (fs.existsSync(curationHtmlPath)) {
  let html = fs.readFileSync(curationHtmlPath, 'utf8');
  if (html.includes('curation.css')) {
    console.log('[FIX 3] ✅ curation.html already references curation.css');
  } else if (html.includes('style.css')) {
    html = html.replace('style.css', 'curation.css');
    fs.writeFileSync(curationHtmlPath, html);
    console.log('[FIX 3] ✅ Updated curation.html to use curation.css');
    changed = true;
  }
  
  // Check that the CSS file actually exists
  const cssPath = path.join(WORKSPACE, 'dashboard', 'public', 'css', 'curation.css');
  if (fs.existsSync(cssPath)) {
    console.log('[FIX 3] ✅ curation.css exists (' + fs.statSync(cssPath).size + ' bytes)');
  } else {
    console.log('[FIX 3] ⚠️ curation.css MISSING at', cssPath);
  }
} else {
  console.log('[FIX 3] ⚠️ curation.html not found');
}

// ─── Write ──────────────────────────────────────────────────────────────────
if (changed) {
  fs.writeFileSync(SERVER_PATH, code);
  console.log('\n[DONE] ✅ Server patched. Restart required.');
} else {
  console.log('\n[DONE] No changes needed.');
}

// Syntax check
const { execSync } = require('child_process');
try {
  execSync(`/usr/local/bin/node -c "${SERVER_PATH}"`, { stdio: 'pipe' });
  console.log('[SYNTAX] ✅ Passes syntax check');
} catch (e) {
  console.error('[SYNTAX] ❌ FAILED:', e.stderr?.toString());
}
