#!/usr/bin/env node
/**
 * Wall Oven Investigator Bot — v1 (Post Deep Dive)
 * Runs Sonnet against curation files for all 6 calibration products.
 *
 * Axis weights: Q=0.30, D=0.35, P=0.35
 * Pool S: Yale Appliance (Steve Sheinkopf)
 * Special rules: BSH Platform Disclosure, Whirlpool Platform Disclosure,
 *                GE Platform Disclosure, Wall Oven / Range Cross-Category
 *
 * Usage: cd /Users/Residentialist/.openclaw/workspace/residentialist
 *        export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
 *        /usr/local/bin/node run_investigator_wall_ovens.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the Residentialist Investigator Bot. Your job is to analyze a residential built-in wall oven using ONLY the evidence in the curation file provided.

CATEGORY: Wall Ovens (built-in only — no freestanding ranges, no countertop ovens)
AXIS WEIGHTS: Quality=0.30, Durability=0.35, Performance=0.35
COMPOSITE METHOD: Geometric mean
POOL S (primary authority): Yale Appliance (Steve Sheinkopf) — wall oven service rates

NOTE ON POOL S DATA: Yale wall oven service rate spread is TIGHTER than dishwashers (8.8–10.5% vs 5.6–23%).
This means reliability differences between products are SMALLER than other categories. Acknowledge this.

RULES:
- The overall score is LOCKED. Not up for debate.
- Durability and Performance are equally weighted (0.35 each) and both outweigh Quality (0.30).
- Quality, Durability, and Performance axis scores should roughly average to the locked composite score, but individual axes CAN range significantly above or below.
- An even split is WRONG. If your three scored axes are within 3 points of each other, you have not done your job. Find the variance.
- You MUST identify at least one clear strength and at least one clear deficiency.
- Every claim must trace to specific evidence in the curation file. No speculation.

CRITICAL WALL OVEN FINDINGS TO REPORT:
- Convection system type is CRITICAL: True European (dedicated ring element) vs fan-assisted (circulates air from bake/broil). Name the system.
- Dual-fan vs single-fan convection: Wolf VertiCross, Miele TwinPower, JennAir V2 — name it.
- Cavity material is CRITICAL: true porcelain enamel, stainless steel, or painted enamel/steel. This determines pyrolytic self-clean survivability.
- Control board/ERC reliability is the #1 non-element repair in wall ovens. Name any documented failure patterns.
- Self-clean creates a Performance vs Durability tension: high-temp pyrolytic is best for cleaning (Performance) but stresses components (Durability). Score both independently.
- Service ecosystem (parts + technician availability + warranty execution) is CRITICAL for Durability scoring.

PLATFORM DISCLOSURE RULES (MANDATORY):
- BSH products (Bosch, Thermador, Gaggenau): MUST disclose shared wall oven platform. Thermador Masterpiece and Professional are confirmed identical internally.
- Whirlpool products (JennAir, KitchenAid): MUST disclose shared platform.
- GE products (Monogram, Café, Profile, GE): MUST disclose Selmer TN factory platform sharing.
- Samsung/Dacor: If evidence suggests platform sharing, MUST disclose.
- CROSS-CATEGORY: If evidence confirms wall oven components are shared with the brand's range oven, MUST disclose with explicit component list.

OUTPUT FORMAT:
## [Product Name] — Investigator Analysis
**Locked Score: [X]/100 — [Tier Label]**

### Score Decomposition
| Axis | Score | Weight | Assessment |
|------|-------|--------|------------|
| Quality | [X] | 0.30 | [One sentence] |
| Durability | [X] | 0.35 | [One sentence] |
| Performance | [X] | 0.35 | [One sentence] |
| Material Safety | [Label] | report only | [One sentence — report only, never affects composite] |

### Platform Disclosure
[Mandatory if BSH, Whirlpool, GE, or Samsung/Dacor platform. Include cross-category wall oven/range sharing if confirmed.]

### Strengths
[2-3 specific findings with evidence from curation file]

### Deficiencies
[2-3 specific findings with evidence from curation file]

### What You Should Know
[3-5 sentences for a homebuyer. Plain English. Direct and honest.]

### Repair Economics
[Most common wall oven repair (element, control board, hinge, sensor, self-clean lock), parts cost, total cost with labor. Is repair cost-justified on this product?]

### Score Justification
[2-3 sentences on why this score and not higher or lower.]`;

const products = [
  { name: 'Miele H7000 Series', score: 95, tier: 'Tier 1', label: 'Best in Class', slug: 'miele_h7000', category: 'Wall Ovens' },
  { name: 'Wolf M Series', score: 91, tier: 'Tier 1', label: 'Best in Class', slug: 'wolf_m_series', category: 'Wall Ovens' },
  { name: 'Thermador Masterpiece', score: 82, tier: 'Tier 2', label: 'Excellent', slug: 'thermador_masterpiece', category: 'Wall Ovens' },
  { name: 'JennAir Rise', score: 76, tier: 'Tier 2', label: 'Excellent', slug: 'jennair_rise', category: 'Wall Ovens' },
  { name: 'GE Café', score: 65, tier: 'Tier 3', label: 'Good', slug: 'ge_cafe', category: 'Wall Ovens' },
  { name: 'Samsung Flex Duo', score: 47, tier: 'Tier 4', label: 'Fair', slug: 'samsung_flex_duo', category: 'Wall Ovens' },
];

function findCurationFile(slug) {
  const dir = path.join(process.cwd(), 'calibration', 'wall_ovens', 'curation_files');
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
AXIS WEIGHTS: Quality=0.30, Durability=0.35, Performance=0.35

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
    const filename = `investigator_wall_oven_${product.slug}.md`;
    fs.writeFileSync(filename, output);
    console.log(`Saved: ${filename} (${output.length} chars)`);
    return { product: product.name, score: product.score, output };
  } catch (e) {
    console.error(`API error for ${product.name}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('Wall Oven Investigator Bot — Starting');
  console.log('Axis weights: Q=0.30, D=0.35, P=0.35');
  console.log('Pool S: Yale Appliance');
  console.log('');

  const results = [];

  for (const p of products) {
    const r = await runInvestigation(p);
    if (r) results.push(r);
  }

  if (results.length > 0) {
    let summary = '# Wall Oven Investigator Bot Summary\n\n';
    summary += `Ran ${results.length} products.\n`;
    summary += `Axis weights: Q=0.30, D=0.35, P=0.35\n`;
    summary += `Pool S: Yale Appliance\n`;
    summary += `Deep dives: 6/6 completed (Samsung: 48K chars, 50 sources)\n\n`;
    for (const r of results) {
      summary += `---\n## ${r.product} (Score: ${r.score})\n\n${r.output}\n\n`;
    }
    fs.writeFileSync('investigator_wall_oven_summary.md', summary);
    console.log('\nSaved: investigator_wall_oven_summary.md');
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
