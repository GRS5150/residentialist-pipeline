#!/usr/bin/env node
/**
 * Targeted citation extraction for products with 0 product-scoped registry sources
 * but existing deep dive files.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CAL = path.join(ROOT, 'calibration');
const KNOW = path.join(ROOT, 'knowledge');
const NODE = process.execPath;

// Find products with 0 product-scoped sources AND a deep dive file
const cats = fs.readdirSync(CAL).filter(d => fs.existsSync(path.join(CAL, d, 'config.json'))).sort();
const targets = [];

for (const cat of cats) {
  const config = JSON.parse(fs.readFileSync(path.join(CAL, cat, 'config.json'), 'utf8'));
  const regPath = path.join(KNOW, cat, 'sources_registry.json');
  let reg = [];
  if (fs.existsSync(regPath)) reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));

  for (const p of config.calibration_products || []) {
    const prodSrc = reg.filter(s => s.scope === 'product' && s.products && s.products.includes(p.slug));
    if (prodSrc.length > 0) continue;

    // Look for deep dive file
    const catDir = path.join(KNOW, cat);
    if (!fs.existsSync(catDir)) continue;
    const ddFiles = fs.readdirSync(catDir).filter(f => {
      if (!f.startsWith('deep_dive_') || !f.endsWith('.md')) return false;
      const slugParts = p.slug.split('_');
      // Try full slug match first, then first two parts
      return f.includes(p.slug) || f.includes(slugParts.slice(0, 2).join('_'));
    });
    if (ddFiles.length === 0) continue;

    targets.push({ cat, slug: p.slug, name: p.name, ddFile: path.join(catDir, ddFiles[0]) });
  }
}

console.log(`\n╔══════════════════════════════════════════════════════════════════╗`);
console.log(`║  TARGETED CITATION EXTRACTION — ${targets.length} products with deep dives   ║`);
console.log(`╚══════════════════════════════════════════════════════════════════╝\n`);

async function run() {
  const results = [];

  for (const t of targets) {
    const regPath = path.join(KNOW, t.cat, 'sources_registry.json');
    let before = 0;
    if (fs.existsSync(regPath)) {
      try {
        const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
        before = reg.filter(s => s.scope === 'product' && s.products && s.products.includes(t.slug)).length;
      } catch {}
    }

    console.log(`  ${t.name} (${t.cat})`);
    console.log(`    Deep dive: ${path.basename(t.ddFile)}`);
    console.log(`    Before: ${before} product-scoped sources`);

    try {
      const cmd = `${NODE} ${path.join(ROOT, 'scripts', 'extract_citations.js')} ${t.cat} ${t.ddFile}`;
      const output = execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 180000, env: process.env });
      console.log(`    ${output.trim().split('\n').pop()}`);
    } catch (err) {
      console.log(`    ❌ ${(err.message || '').substring(0, 120)}`);
    }

    // Count after
    let after = 0;
    if (fs.existsSync(regPath)) {
      try {
        const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
        after = reg.filter(s => s.scope === 'product' && s.products && s.products.includes(t.slug)).length;
      } catch {}
    }

    results.push({ cat: t.cat, slug: t.slug, name: t.name, before, after, added: after - before });
    console.log(`    After: ${after} product-scoped sources (+${after - before})\n`);

    // Rate limit
    await new Promise(r => setTimeout(r, 4000));
  }

  // Summary
  console.log('═'.repeat(85));
  console.log('Category'.padEnd(20) + 'Product'.padEnd(35) + 'Before'.padStart(8) + 'After'.padStart(8) + 'Added'.padStart(8));
  console.log('─'.repeat(85));
  for (const r of results) {
    console.log(r.cat.padEnd(20) + r.name.substring(0, 34).padEnd(35) + String(r.before).padStart(8) + String(r.after).padStart(8) + String(r.added).padStart(8));
  }
  console.log('─'.repeat(85));
  const totalAdded = results.reduce((s, r) => s + r.added, 0);
  console.log('TOTAL'.padEnd(55) + String(0).padStart(8) + String(totalAdded).padStart(8) + String(totalAdded).padStart(8));
  console.log('═'.repeat(85));
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
