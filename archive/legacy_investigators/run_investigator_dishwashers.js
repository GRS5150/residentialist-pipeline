#!/usr/bin/env node
/**
 * Dishwasher Investigator Bot — v1
 * Runs Sonnet against curation files for all 6 calibration products.
 *
 * Axis weights: Q=0.30, D=0.40, P=0.30
 * Pool S: Yale Appliance (Steve Sheinkopf)
 * Special rules: BSH Platform Disclosure, Service Ecosystem scoring
 *
 * Usage: cd /Users/Residentialist/.openclaw/workspace/residentialist
 *        node run_investigator_dishwashers.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the Residentialist Investigator Bot. Your job is to analyze a residential building product using ONLY the evidence in the curation file provided.

CATEGORY: Dishwashers
AXIS WEIGHTS: Quality=0.30, Durability=0.40, Performance=0.30
COMPOSITE METHOD: Geometric mean
POOL S (primary authority): Yale Appliance (Steve Sheinkopf, 33,190 service calls)

RULES:
- The overall score is LOCKED. Not up for debate.
- Durability is the dominant axis (0.40 weight) because the professional hierarchy is organized around "which ones break."
- Performance is NOT flat (unlike faucets): noise spans 37-56+ dBA, drying tech creates massive real-world spread (zeolite vs heated element), soil removal spans low-90s to 99.97%.
- Quality, Durability, and Performance axis scores should roughly average to the locked composite score, but individual axes CAN range significantly above or below.
- An even split is WRONG. If your three scored axes are within 3 points of each other, you have not done your job. Find the variance.
- You MUST identify at least one clear strength and at least one clear deficiency.
- Every claim must trace to specific evidence in the curation file. No speculation.
- The motor type and manufacturer is a CRITICAL finding — name it.
- The drying technology is a CRITICAL finding — name it and its real-world performance on plastics.
- The service ecosystem (parts availability + technician availability + warranty execution) is a CRITICAL finding.
- For BSH products (Bosch, Thermador, Gaggenau): you MUST include the BSH Platform Disclosure stating that these brands share the same platform and the service rate spread is 0.4%.
- For Whirlpool-platform products (KitchenAid, Whirlpool, Maytag): you MUST disclose the shared platform.
- Service ecosystem IS the score for Tier 4 products. A product with good paper specs but catastrophic serviceability scores below a product with average specs and universal parts.
- Write for a homebuyer, not an engineer.

OUTPUT FORMAT:
## [Product Name] — Investigator Analysis
**Locked Score: [X]/100 — [Tier Label]**

### Score Decomposition
| Axis | Score | Weight | Assessment |
|------|-------|--------|------------|
| Quality | [X] | 0.30 | [One sentence] |
| Durability | [X] | 0.40 | [One sentence] |
| Performance | [X] | 0.30 | [One sentence] |
| Material Safety | [Label] | report only | [One sentence — report only, never affects composite] |

### Platform Disclosure
[If BSH or Whirlpool platform — mandatory disclosure paragraph]

### Strengths
[2-3 specific findings with evidence from curation file]

### Deficiencies
[2-3 specific findings with evidence from curation file]

### What You Should Know
[3-5 sentences for a homebuyer. Plain English. Direct and honest.]

### Repair Economics
[Most common repair, parts cost, total cost with labor. Is repair cost-justified on this product?]

### Score Justification
[2-3 sentences on why this score and not higher or lower.]`;

const products = [
  { name: 'Miele G7000 Series', score: 95, tier: 'Tier 1', label: 'Best in Class', slug: 'miele_g7000', category: 'Dishwashers' },
  { name: 'Bosch 800 Series', score: 91, tier: 'Tier 1', label: 'Best in Class', slug: 'bosch_800', category: 'Dishwashers' },
  { name: 'KitchenAid KDTM604 (M-series)', score: 81, tier: 'Tier 2', label: 'Excellent', slug: 'kitchenaid_kdtm604', category: 'Dishwashers' },
  { name: 'Bosch 300 Series', score: 67, tier: 'Tier 3', label: 'Good', slug: 'bosch_300', category: 'Dishwashers' },
  { name: 'Whirlpool WDT750SAKZ', score: 64, tier: 'Tier 3', label: 'Good', slug: 'whirlpool_wdt750sakz', category: 'Dishwashers' },
  { name: 'Samsung DW80 (mid-range)', score: 47, tier: 'Tier 4', label: 'Fair', slug: 'samsung_dw80_mid', category: 'Dishwashers' },
];

function findCurationFile(slug) {
  const dir = path.join(process.cwd(), 'calibration', 'dishwashers', 'curation_files');
  if (!fs.existsSync(dir)) { console.error('No curation_files directory found at ' + dir); return null; }
  const files = fs.readdirSync(dir);
  const match = files.find(f => f.includes(slug) && f.endsWith('.json'));
  if (match) return path.join(dir, match);
  console.error(`No curation file found for slug: ${slug}`);
  return null;
}

async function runInvestigation(product) {
  console.log(`\n=== Processing: ${product.name} ===`);

  const curationPath = findCurationFile(product.slug);
  if (!curationPath) { console.error(`No curation file for ${product.slug}`); return null; }

  const curation = fs.readFileSync(curationPath, 'utf-8');
  console.log(`Score: ${product.score}, Tier: ${product.tier}, Label: ${product.label}`);
  console.log(`Curation file: ${curationPath} (${(curation.length/1024).toFixed(1)}KB)`);

  const userMsg = `PRODUCT: ${product.name}
LOCKED SCORE: ${product.score}/100
TIER: ${product.tier} — ${product.label}
CATEGORY: ${product.category}
AXIS WEIGHTS: Quality=0.30, Durability=0.40, Performance=0.30

EVIDENCE (from curation file):
${curation.substring(0, 15000)}`;

  console.log('Calling Sonnet...');
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }]
    });

    const output = response.content[0].text;
    const filename = `investigator_dishwasher_${product.slug}.md`;
    fs.writeFileSync(filename, output);
    console.log(`Saved: ${filename}`);
    return { product: product.name, score: product.score, output };
  } catch (e) {
    console.error(`API error for ${product.name}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('Dishwasher Investigator Bot — Starting');
  console.log('Axis weights: Q=0.30, D=0.40, P=0.30');
  console.log('Pool S: Yale Appliance');
  console.log('');

  const results = [];

  for (const p of products) {
    const r = await runInvestigation(p);
    if (r) results.push(r);
  }

  if (results.length > 0) {
    let summary = '# Dishwasher Investigator Bot Summary\n\n';
    summary += `Ran ${results.length} products.\n`;
    summary += `Axis weights: Q=0.30, D=0.40, P=0.30\n`;
    summary += `Pool S: Yale Appliance (33,190 service calls)\n\n`;
    for (const r of results) {
      summary += `---\n## ${r.product} (Score: ${r.score})\n\n${r.output}\n\n`;
    }
    fs.writeFileSync('investigator_dishwasher_summary.md', summary);
    console.log('\nSaved: investigator_dishwasher_summary.md');
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
