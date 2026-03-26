/**
 * Fix API_BASE in curation JS files to auto-detect /scores/ prefix
 */
const fs = require('fs');
const path = require('path');

const jsDir = '/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/public/js';
const files = ['curation.js', 'curation-product.js', 'manufacturer.js'];

for (const file of files) {
  const filePath = path.join(jsDir, file);
  if (!fs.existsSync(filePath)) { console.log(`[SKIP] ${file} not found`); continue; }
  
  let code = fs.readFileSync(filePath, 'utf8');
  const oldPattern = "const API_BASE = '';";
  const newPattern = "const API_BASE = location.pathname.startsWith('/scores') ? '/scores' : '';";
  
  if (code.includes(oldPattern)) {
    code = code.replace(oldPattern, newPattern);
    fs.writeFileSync(filePath, code);
    console.log(`[FIXED] ${file} — API_BASE now auto-detects /scores/ prefix`);
  } else if (code.includes("location.pathname.startsWith('/scores')")) {
    console.log(`[OK] ${file} — already fixed`);
  } else {
    console.log(`[SKIP] ${file} — no API_BASE found`);
  }
}
