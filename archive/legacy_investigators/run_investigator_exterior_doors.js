#!/usr/bin/env node
/**
 * Exterior Doors Investigator Bot — v1
 * Runs Sonnet against curation files for all 7 calibration products.
 *
 * Axis weights: Q=0.40, D=0.35, P=0.25
 * Pool S: VACANT
 * Pool A: GBA, FHB, Consumer Reports, NFRC
 *
 * Usage: cd /Users/Residentialist/.openclaw/workspace/residentialist
 *        export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
 *        /usr/local/bin/node run_investigator_exterior_doors.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the Residentialist Investigator Bot. Your job is to analyze a residential building product using ONLY the evidence in the curation file provided.

CATEGORY: Exterior Doors
AXIS WEIGHTS: Quality=0.40, Durability=0.35, Performance=0.25
COMPOSITE METHOD: Geometric mean
POOL S: VACANT — No independent comparative door tester equivalent exists.
POOL A: GBA (Green Building Advisor), FHB (Fine Homebuilding), Consumer Reports, NFRC Database

RULES:
- The overall score is LOCKED. Not up for debate.
- Quality is the dominant axis (0.40 weight) because slab construction, weatherstripping quality, and hardware grade carry the most meaningful variation.
- Durability (0.35) captures material longevity, rot/warp resistance, warranty strength, and serviceability.
- Performance (0.25) captures energy performance (U-factor), air infiltration, glass quality, and structural DP rating. Performance is real but less variable than quality — most fiberglass doors meet ENERGY STAR easily.
- Quality, Durability, and Performance axis scores should roughly average to the locked composite score, but individual axes CAN range significantly above or below.
- An even split is WRONG. If your three scored axes are within 3 points of each other, you have not done your job. Find the variance.
- You MUST identify at least one clear strength and at least one clear deficiency.
- Every claim must trace to specific evidence in the curation file. No speculation.
- The slab construction and material is a CRITICAL finding — name it (engineered wood, compression-molded fiberglass, steel gauge).
- The weatherstripping system and corner pad quality is a CRITICAL finding.
- The hardware grade (multipoint vs single deadbolt) is a CRITICAL finding.
- Channel quality matters: same brand sells different specs at dealer vs big-box. Name which channel.
- For Fortune Brands products (Therma-Tru, Marvin): disclose shared parent company.
- For JELD-WEN/Reliabilt: disclose that Reliabilt is JELD-WEN-made for Lowe's.
- Fiberglass rot-proof advantage is a genuine construction benefit — call it out when relevant.
- Write for a homebuyer, not an engineer.

OUTPUT FORMAT:
## [Product Name] — Investigator Analysis
**Locked Score: [X]/100 — [Tier Label]**

### Score Decomposition
| Axis | Score | Weight | Assessment |
|------|-------|--------|------------|
| Quality | [X] | 0.40 | [One sentence] |
| Durability | [X] | 0.35 | [One sentence] |
| Performance | [X] | 0.25 | [One sentence] |
| Material Safety | [Label] | report only | [One sentence — report only, never affects composite] |

### Corporate Disclosure
[Parent company, manufacturing, corporate risk factors if any]

### Strengths
[2-3 specific findings with evidence from curation file]

### Deficiencies
[2-3 specific findings with evidence from curation file]

### What You Should Know
[3-5 sentences for a homebuyer. Plain English. Direct and honest.]

### Channel & Availability
[Where to buy, dealer vs big-box, lead time, channel-specific quality differences]

### Score Justification
[2-3 sentences on why this score and not higher or lower.]`;

const products = [
  { name: 'Marvin Signature Ultimate Entry Door', score: 94, tier: 'Tier 1', label: 'Best in Class', slug: 'marvin_ultimate_entry', category: 'Exterior Doors' },
  { name: 'Therma-Tru Classic-Craft Premium (Fiberglass)', score: 91, tier: 'Tier 1', label: 'Best in Class', slug: 'thermatru_classiccraft', category: 'Exterior Doors' },
  { name: 'Pella Reserve Entry Door', score: 80, tier: 'Tier 2', label: 'Excellent', slug: 'pella_reserve_entry', category: 'Exterior Doors' },
  { name: 'Therma-Tru Benchmark Entry (Fiberglass)', score: 67, tier: 'Tier 3', label: 'Good', slug: 'thermatru_benchmark', category: 'Exterior Doors' },
  { name: 'Masonite Performance Door System (Fiberglass)', score: 64, tier: 'Tier 3', label: 'Good', slug: 'masonite_performance', category: 'Exterior Doors' },
  { name: 'JELD-WEN Builders Series (Steel/Fiberglass)', score: 48, tier: 'Tier 4', label: 'Fair', slug: 'jeldwen_builders', category: 'Exterior Doors' },
  { name: 'Reliabilt Entry Door (Lowe\'s)', score: 40, tier: 'Tier 4', label: 'Fair', slug: 'reliabilt_entry', category: 'Exterior Doors' },
];

function findCurationFile(slug) {
  const dir = path.join(process.cwd(), 'calibration', 'exterior_doors', 'curation_files');
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
AXIS WEIGHTS: Quality=0.40, Durability=0.35, Performance=0.25

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
    const filename = `investigator_exterior_doors_${product.slug}.md`;
    fs.writeFileSync(filename, output);
    console.log(`Saved: ${filename}`);
    return { product: product.name, score: product.score, output };
  } catch (e) {
    console.error(`API error for ${product.name}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('Exterior Doors Investigator Bot — Starting');
  console.log('Axis weights: Q=0.40, D=0.35, P=0.25');
  console.log('Pool S: VACANT');
  console.log('');

  const results = [];

  for (const p of products) {
    const r = await runInvestigation(p);
    if (r) results.push(r);
  }

  if (results.length > 0) {
    let summary = '# Exterior Doors Investigator Bot Summary\n\n';
    summary += `Ran ${results.length} products.\n`;
    summary += `Axis weights: Q=0.40, D=0.35, P=0.25\n`;
    summary += `Pool S: VACANT\n\n`;
    for (const r of results) {
      summary += `---\n## ${r.product} (Score: ${r.score})\n\n${r.output}\n\n`;
    }
    fs.writeFileSync('investigator_exterior_doors_summary.md', summary);
    console.log('\nSaved: investigator_exterior_doors_summary.md');
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
