#!/usr/bin/env node
/**
 * Rescore all existing curation files using tier-based scoring.
 * No Perplexity calls — just re-runs score_from_curation_v2.js on each.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = __dirname;
const CURATION_DIR = path.join(WORKSPACE, 'curation');
const NODE = process.execPath;

const slugs = fs.readdirSync(CURATION_DIR)
  .filter(f => f.endsWith('_sources.json') && !f.includes('pipeline'))
  .map(f => f.replace('_sources.json', ''))
  .sort();

console.log(`Rescoring ${slugs.length} products with tier-based system...\n`);

const results = [];

for (const slug of slugs) {
  // Derive config from slug
  let config = 'DH';
  let category = 'windows';
  if (slug.includes('_casement')) config = 'casement';
  else if (slug.includes('_awning')) config = 'awning';
  else if (slug.includes('_sliding')) config = 'sliding';

  process.stdout.write(`  ${slug} ... `);
  try {
    const out = execSync(`${NODE} score_from_curation_v2.js ${slug} ${category} ${config}`, {
      cwd: WORKSPACE, encoding: 'utf-8', timeout: 120000
    });
    // Extract score line
    const scoreLine = out.match(/Score: (\d+)\/100 — Tier (\d) \(([^)]+)\)/);
    if (scoreLine) {
      const [, score, tier, label] = scoreLine;
      console.log(`Tier ${tier} → ${score}/100 (${label})`);
      results.push({ slug, score: parseInt(score), tier: parseInt(tier), label, status: 'ok' });
    } else {
      console.log('done (could not parse score)');
      results.push({ slug, score: '?', tier: '?', label: '?', status: 'parse_error' });
    }
  } catch (err) {
    const msg = (err.stderr || err.message || '').substring(0, 100);
    console.log(`FAILED: ${msg}`);
    results.push({ slug, score: 'ERR', tier: '?', label: 'failed', status: 'failed', error: msg });
  }
}

// Print summary
console.log('\n' + '═'.repeat(90));
console.log('  ' + 'Product'.padEnd(45) + 'Tier'.padStart(5) + 'Score'.padStart(7) + '  Label');
console.log('  ' + '─'.repeat(85));
for (const r of results.sort((a,b) => (b.score || 0) - (a.score || 0))) {
  console.log('  ' + r.slug.replace(/_/g, ' ').padEnd(45) + String(r.tier).padStart(5) + String(r.score).padStart(7) + '  ' + (r.label || ''));
}
console.log('═'.repeat(90));
console.log(`\n${results.filter(r=>r.status==='ok').length} succeeded, ${results.filter(r=>r.status!=='ok').length} failed`);
