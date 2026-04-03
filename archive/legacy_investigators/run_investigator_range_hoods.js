#!/usr/bin/env node
/**
 * Range Hood Investigator Bot — v1
 * Runs Sonnet against curation files for all 6 calibration products.
 *
 * Axis weights: Q=0.30, D=0.25, P=0.45
 * Pool S: VACANT — no single dominant independent source
 * Special rules: BSH Platform Disclosure, Wolf Pairing, Vent-A-Hood Centrifugal Architecture,
 *                CFM-to-BTU Matching, External Blower Scoring
 *
 * Usage: cd /Users/Residentialist/.openclaw/workspace/residentialist
 *        export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
 *        /usr/local/bin/node run_investigator_range_hoods.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the Residentialist Investigator Bot. Your job is to analyze a residential range hood using ONLY the evidence in the curation file provided.

CATEGORY: Range Hoods (residential ventilation — wall-mount, island, undercabinet, insert/liner)
AXIS WEIGHTS: Quality=0.30, Durability=0.25, Performance=0.45
COMPOSITE METHOD: Geometric mean
POOL S: VACANT — no dominant independent hood reviewer. HVI provides independent CFM/sone certification (compliance-level, not comparative).

NOTE: Performance is the dominant axis (0.45) because CFM airflow and sone noise rating create massive spread across the category. A 210 CFM builder-grade hood vs a 1200 CFM premium hood is a 6x difference. Sone ratings span 0.5 to 8+.

RULES:
- The overall score is LOCKED. Not up for debate.
- Performance dominates (0.45). Quality (0.30) and Durability (0.25) are secondary.
- Quality, Durability, and Performance axis scores should roughly average to the locked composite score, but individual axes CAN range significantly above or below.
- An even split is WRONG. If your three scored axes are within 3 points of each other, you have not done your job. Find the variance.
- You MUST identify at least one clear strength and at least one clear deficiency.
- Every claim must trace to specific evidence in the curation file. No speculation.

CRITICAL RANGE HOOD FINDINGS TO REPORT:
- Blower type is CRITICAL: centrifugal (squirrel cage) vs axial fan. Name the type. Ball bearing vs sleeve bearing.
- For Vent-A-Hood: Magic Lung centrifugal capture is a fundamentally different architecture — grease is captured before reaching the fan.
- Filter type: stainless baffle (dishwasher safe), aluminum mesh (clogs, needs frequent replacement), or centrifugal capture (no filter).
- CFM-to-BTU matching: ALWAYS note whether the hood's CFM is adequate for the ranges it would typically be paired with.
- Sone rating context: 1 sone = quiet refrigerator, 4 sones = TV volume, 8 sones = uncomfortable conversation.
- External blower availability: does this hood offer a remote/in-line blower option?
- Body material and gauge: 304 stainless vs 430 stainless vs painted steel.

PLATFORM DISCLOSURE RULES (MANDATORY):
- BSH products (Thermador, Bosch): MUST disclose likely shared blower/filter components.
- Wolf: MUST note designed to pair with Wolf ranges if applicable.
- Broan-NuTone: MUST note Nortek parent. Elite and F40000 are same parent company.

OUTPUT FORMAT:
## [Product Name] — Investigator Analysis
**Locked Score: [X]/100 — [Tier Label]**

### Score Decomposition
| Axis | Score | Weight | Assessment |
|------|-------|--------|------------|
| Quality | [X] | 0.30 | [One sentence] |
| Durability | [X] | 0.25 | [One sentence] |
| Performance | [X] | 0.45 | [One sentence] |
| Material Safety | [Label] | report only | [One sentence — report only, never affects composite] |

### Platform Disclosure
[Mandatory if BSH, Wolf, or parent company platform applies.]

### CFM-to-BTU Assessment
[State the hood's CFM, what BTU range it can adequately ventilate, and any mismatch warning.]

### Strengths
[2-3 specific findings with evidence from curation file]

### Deficiencies
[2-3 specific findings with evidence from curation file]

### What You Should Know
[3-5 sentences for a homebuyer. Plain English. Direct and honest.]

### Repair Economics
[Most common range hood repair (motor replacement), parts cost, total cost with labor. Is this product worth repairing or cheaper to replace?]

### Score Justification
[2-3 sentences on why this score and not higher or lower.]`;

const products = [
  { name: 'Vent-A-Hood PRH Series', score: 95, tier: 'Tier 1', label: 'Best in Class', slug: 'vent_a_hood_prh', category: 'Range Hoods' },
  { name: 'Wolf Pro Ventilation', score: 91, tier: 'Tier 1', label: 'Best in Class', slug: 'wolf_pro_ventilation', category: 'Range Hoods' },
  { name: 'Zephyr Tempest II', score: 82, tier: 'Tier 2', label: 'Excellent', slug: 'zephyr_tempest_ii', category: 'Range Hoods' },
  { name: 'Thermador HPCN Series', score: 76, tier: 'Tier 2', label: 'Excellent', slug: 'thermador_hpcn', category: 'Range Hoods' },
  { name: 'Broan-NuTone Elite E60E30SS', score: 64, tier: 'Tier 3', label: 'Good', slug: 'broan_elite_e60e', category: 'Range Hoods' },
  { name: 'Broan-NuTone F40000 Series', score: 47, tier: 'Tier 4', label: 'Fair', slug: 'broan_f40000', category: 'Range Hoods' },
];

function findCurationFile(slug) {
  const dir = path.join(process.cwd(), 'calibration', 'range_hoods', 'curation_files');
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
AXIS WEIGHTS: Quality=0.30, Durability=0.25, Performance=0.45

EVIDENCE (from curation file):
${curation.substring(0, 20000)}`;

  console.log('Calling Sonnet...');
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }]
    });

    const output = response.content[0].text;
    const filename = `investigator_range_hood_${product.slug}.md`;
    fs.writeFileSync(filename, output);
    console.log(`Saved: ${filename} (${output.length} chars)`);
    return { product: product.name, score: product.score, output };
  } catch (e) {
    console.error(`API error for ${product.name}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('Range Hood Investigator Bot — Starting');
  console.log('Axis weights: Q=0.30, D=0.25, P=0.45 (Performance dominant)');
  console.log('Pool S: VACANT');
  console.log('Heritage brand: Vent-A-Hood (Houston TX, 1933)');
  console.log('');

  const results = [];

  for (const p of products) {
    const r = await runInvestigation(p);
    if (r) results.push(r);
  }

  if (results.length > 0) {
    let summary = '# Range Hood Investigator Bot Summary\n\n';
    summary += `Ran ${results.length} products.\n`;
    summary += `Axis weights: Q=0.30, D=0.25, P=0.45 (Performance dominant)\n`;
    summary += `Pool S: VACANT\n`;
    summary += `Heritage brand: Vent-A-Hood (Houston TX, 1933, Magic Lung centrifugal)\n`;
    summary += `BSH platform sharing: Thermador/Bosch hoods (confirm in deep dive)\n`;
    summary += `Zephyr: 26x in luxury listings\n\n`;
    for (const r of results) {
      summary += `---\n## ${r.product} (Score: ${r.score})\n\n${r.output}\n\n`;
    }
    fs.writeFileSync('investigator_range_hood_summary.md', summary);
    console.log('\nSaved: investigator_range_hood_summary.md');
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
