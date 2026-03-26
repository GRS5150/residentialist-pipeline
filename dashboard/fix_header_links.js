/**
 * Fix 1: Make "THE RESIDENTIALIST" header a link to /scores/ in curation pages
 * Fix 2: Fix index.html Curation link to /scores/curation.html
 */
const fs = require('fs');
const path = require('path');

const PUBLIC = '/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/public';

// Fix 1: Curation pages — wrap header brand in <a> link to /scores/
const curationPages = ['curation.html', 'curation-product.html', 'manufacturer.html'];

for (const file of curationPages) {
  const filePath = path.join(PUBLIC, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Replace plain div with linked version
  const oldBrand = /<div class="header-brand">THE <span>RESIDENTIALIST<\/span>[^<]*<\/div>/;
  const match = html.match(oldBrand);
  if (match) {
    const subtitle = match[0].includes('Curation') ? ' · Curation' : match[0].includes('Manufacturers') ? ' · Manufacturers' : '';
    html = html.replace(oldBrand, `<div class="header-brand"><a href="/scores/" style="color:inherit;text-decoration:none;">THE <span>RESIDENTIALIST</span></a>${subtitle}</div>`);
    fs.writeFileSync(filePath, html);
    console.log(`[${file}] ✅ Brand → clickable link to /scores/`);
  } else {
    console.log(`[${file}] Already linked or pattern not found`);
  }
}

// Fix 2: index.html — fix Curation link href
const indexPath = path.join(PUBLIC, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

if (indexHtml.includes('href="curation.html"')) {
  indexHtml = indexHtml.replace(/href="curation\.html"/g, 'href="/scores/curation.html"');
  fs.writeFileSync(indexPath, indexHtml);
  console.log('[index.html] ✅ Curation link → /scores/curation.html');
} else if (indexHtml.includes('href="/scores/curation.html"')) {
  console.log('[index.html] Already correct');
} else {
  console.log('[index.html] ⚠️ No Curation link found');
}

console.log('\n[DONE]');
