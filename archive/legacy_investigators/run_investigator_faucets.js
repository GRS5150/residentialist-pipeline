#!/usr/bin/env node
/**
 * Faucet Investigator Bot — runs all 6 calibration products
 * through Sonnet for axis decomposition and buyer reports.
 *
 * Usage: cd /Users/Residentialist/.openclaw/workspace/residentialist && node run_investigator_faucets.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Anthropic = require('@anthropic-ai/sdk') || require(path.join(process.cwd(), 'node_modules', '@anthropic-ai/sdk'));
const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Residentialist Investigator Bot. Your job is forensic analysis of product evidence.

A product has been independently scored and that score is LOCKED. You cannot change it. Your job is to investigate the evidence and determine:
1. What SPECIFICALLY drove this score — not generalities, specific findings
2. Where did this product SHINE relative to its peers
3. Where was this product DEFICIENT relative to its peers
4. What specifically prevented it from scoring higher
5. What specifically kept it from scoring lower

Distribute the locked score across four axes based on the evidence:
- QUALITY (Is it well-made? Body material, construction method, cartridge manufacturer, finish technology, business model)
- DURABILITY (Will it last? Cartridge cycle life, warranty reality, parts availability, field longevity, finish longevity)
- PERFORMANCE (Does it do its job well? For faucets this axis COMPRESSES — all legal faucets deliver water at regulated rates. Minor differentiation on spray technology, flow consistency, temperature stability.)
- MATERIAL SAFETY (Report-only axis. Does not affect score. Flag any concerns with a label: Excellent/Good/Moderate/Concern)

RULES:
- The overall score is LOCKED. Not up for debate.
- Quality and Durability are weighted equally (0.45 each). Performance is compressed (0.10 weight).
- Quality, Durability, and Performance axis scores should roughly average to the locked composite score, but individual axes CAN range significantly above or below.
- An even split is WRONG. If your three scored axes are within 3 points of each other, you have not done your job. Find the variance.
- You MUST identify at least one clear strength and at least one clear deficiency.
- Every claim must trace to specific evidence in the curation file. No speculation.
- The cartridge manufacturer identity is a CRITICAL finding — name it.
- The business model (manufacturer/assembler/specifier/marketeer) is a CRITICAL finding — identify it.
- Write for a homebuyer, not an engineer.

OUTPUT FORMAT:
## [Product Name] — Investigator Analysis
**Locked Score: [X]/100 — [Tier Label]**

### Score Decomposition
| Axis | Score | Assessment |
|------|-------|------------|
| Quality | [X] | [One sentence] |
| Durability | [X] | [One sentence] |
| Performance | [X] | [One sentence] |
| Material Safety | [Label] | [One sentence — report only] |

### Strengths
[2-3 specific findings with evidence from curation file]

### Deficiencies
[2-3 specific findings with evidence from curation file]

### What You Should Know
[3-5 sentences for a homebuyer. Plain English. Direct and honest.]

### Score Justification
[2-3 sentences on why this score and not higher or lower.]`;

const products = [
  { name: 'California Faucets', score: 94, tier: 'Tier 1', label: 'Best in Class', slug: 'california_faucets', category: 'Faucets' },
  { name: 'In2aqua', score: 92, tier: 'Tier 1', label: 'Best in Class', slug: 'in2aqua', category: 'Faucets' },
  { name: 'Waterstone', score: 91, tier: 'Tier 1', label: 'Best in Class', slug: 'waterstone', category: 'Faucets' },
  { name: 'Brizo (DST Cartridge Lines)', score: 84, tier: 'Tier 2', label: 'Excellent', slug: 'brizo_dst', category: 'Faucets' },
  { name: 'Delta Mid-Range (DST Models)', score: 69, tier: 'Tier 3', label: 'Good', slug: 'delta_mid_range', category: 'Faucets' },
  { name: 'Kraus', score: 45, tier: 'Tier 4', label: 'Fair', slug: 'kraus', category: 'Faucets' },
];

function findCurationFile(slug) {
  const dir = path.join(process.cwd(), 'curation');
  if (!fs.existsSync(dir)) { console.error('No curation directory found'); return null; }
  const files = fs.readdirSync(dir);
  const match = files.find(f => f.includes(slug) && f.endsWith('_sources.json'));
  if (match) return path.join(dir, match);
  const partial = files.find(f => f.includes(slug));
  if (partial) return path.join(dir, partial);
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
AXIS WEIGHTS: Quality=0.45, Durability=0.45, Performance=0.10

EVIDENCE (from curation file):
${curation.substring(0, 15000)}`;

  console.log('Calling Sonnet...');
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }]
    });

    const output = response.content[0].text;
    const filename = `investigator_faucet_${product.slug}.md`;
    fs.writeFileSync(filename, output);
    console.log(`Saved: ${filename}`);
    return { product: product.name, score: product.score, output };
  } catch (e) {
    console.error(`API error for ${product.name}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('Faucet Investigator Bot — Starting');
  const results = [];

  for (const p of products) {
    const r = await runInvestigation(p);
    if (r) results.push(r);
  }

  if (results.length > 0) {
    let summary = '# Faucet Investigator Bot Summary\n\n';
    summary += `Ran ${results.length} products.\n\n`;
    for (const r of results) {
      summary += `---\n## ${r.product} (Score: ${r.score})\n\n${r.output}\n\n`;
    }
    fs.writeFileSync('investigator_faucet_summary.md', summary);
    console.log('\nSaved: investigator_faucet_summary.md');
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
