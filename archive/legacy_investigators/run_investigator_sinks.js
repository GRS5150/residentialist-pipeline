#!/usr/bin/env node
/**
 * Sinks Investigator Bot — v1
 * Runs Sonnet against curation files for all 7 calibration products.
 *
 * Axis weights: Q=0.45, D=0.45, P=0.10
 * Pool S: VACANT (no independent quantified reliability source for sinks)
 * Sub-types: kitchen_fireclay, kitchen_cast_iron, kitchen_composite, kitchen_stainless,
 *            bathroom_vitreous_china
 * Special rules: Performance flat (P=0.10), material quality drives score,
 *                Kohler 187 luxury listing sightings, sub-type parity,
 *                platform sharing disclosure (Fortune Brands, Kohler Co)
 *
 * Usage: cd /Users/Residentialist/.openclaw/workspace/residentialist
 *        export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
 *        /usr/local/bin/node run_investigator_sinks.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the Residentialist Investigator Bot. Your job is to analyze a residential sink using ONLY the evidence in the curation file provided.

CATEGORY: Sinks (kitchen stainless, kitchen fireclay, kitchen cast iron, kitchen composite, bathroom vitreous china)
AXIS WEIGHTS: Quality=0.45, Durability=0.45, Performance=0.10
COMPOSITE METHOD: Geometric mean
POOL S: VACANT — No independent, methodology-documented, comparative testing source equivalent to StarCraft (faucets), MaP (toilets), or Yale Appliance (dishwashers) exists for residential sinks. No teardown channel, no quantified reliability database. Disclose this in every report.

RULES:
- The overall score is LOCKED. Not up for debate.
- Quality and Durability are CO-DOMINANT axes (0.45 each) — material construction and longevity are what define a sink. Performance is essentially flat (0.10).
- An even split is WRONG. If your three scored axes are within 3 points of each other, you have not done your job. Find the variance. Performance SHOULD be close across products because all sinks drain water — but Quality and Durability MUST show the material/construction hierarchy.
- You MUST identify at least one clear strength and at least one clear deficiency.
- Every claim must trace to specific evidence in the curation file. No speculation.

CRITICAL SINK FINDINGS TO REPORT:

FOR STAINLESS STEEL:
- Gauge is THE quality signal: 16-gauge (professional) vs 18-gauge (standard) vs 20+ gauge (builder-grade). Name it.
- Steel grade: T-304 (18/8, standard premium) vs T-316 (marine-grade, coastal) vs unstated (red flag). Name it.
- Construction method: zero-radius welded > tight-radius > drawn/pressed > stamped.
- Sound deadening: full pad + spray (Kraus NoiseDefend, Elkay Sound Guard) vs partial vs none. Coverage percentage.

FOR FIRECLAY:
- Manufacturing: handcrafted individual (Rohl Shaws, Lancashire) vs mold-formed mass-production (DeerValley, Chinese import). This is THE fireclay quality divider.
- Firing temperature: 2100°F+ premium vs lower. Clay composition matters.
- Known trade-off: flat bottom may pool water. Report this honestly.

FOR CAST IRON:
- Enamel technology: Kohler proprietary enamel (benchmark) vs standard porcelain vs budget. Enamel thickness and chip resistance.
- Inherent advantages: massive thermal mass = silent, dent-proof, extreme heat resistance.
- Known weakness: enamel CAN chip under extreme impact (non-structural, cosmetic, but visible).

FOR COMPOSITE:
- Formula: Blanco Silgranit (80% granite, 35+ patents, 35+ years market data) vs Kohler Neoroc (proprietary, newer) vs generic.
- Heat rating: Silgranit = 536°F (280°C) verified. Others?
- Metal transfer marks: cosmetic, removable — NOT a defect. Report this accurately.

FOR BATHROOM (VITREOUS CHINA):
- Performance axis is FLAT. All bathroom sinks drain water adequately. Differentiation is entirely in Quality and Durability.
- Quality comes from: glazing quality, china density, dimensional consistency, overflow mechanism, brand ecosystem.

PLATFORM DISCLOSURE RULES (MANDATORY):
- Kohler Co (private, family-owned since 1873): MUST disclose private status, WI headquarters, diversified business.
- Fortune Brands Innovations (NYSE: FBIN): MUST disclose parent of Rohl, Moen, Perrin & Rowe.
- BLANC & FISCHER Family Holding: MUST disclose private German family-owned parent of Blanco.
- Kraus USA: MUST disclose private, DTC-primary, manufacturing in partner factories (China/Vietnam).
- Glacier Bay: MUST disclose Home Depot private-label, unknown OEM manufacturing.

SUB-TYPE NOTE:
Kitchen stainless, fireclay, cast iron, composite, and bathroom vitreous china are scored within the same framework. A premium fireclay and a premium cast iron can BOTH be Tier 1. Sub-type is NOT a quality hierarchy.

OUTPUT FORMAT:
## [Product Name] — Investigator Analysis
**Locked Score: [X]/100 — [Tier Label]**

### Score Decomposition
| Axis | Score | Weight | Assessment |
|------|-------|--------|------------|
| Quality | [X] | 0.45 | [One sentence] |
| Durability | [X] | 0.45 | [One sentence] |
| Performance | [X] | 0.10 | [One sentence] |
| Material Safety | [Label] | report only | [One sentence] |

### Pool S Status
[VACANT — No independent comparative testing source exists for residential sinks.]

### Platform Disclosure
[Mandatory corporate parent and platform sharing disclosure.]

### Strengths
[2-3 specific findings with evidence from curation file]

### Deficiencies
[2-3 specific findings with evidence from curation file]

### What You Should Know
[3-5 sentences for a homebuyer. Plain English. Honest.]

### Repair Economics
[#1 maintenance/repair need for this sub-type and typical cost.]

### Score Justification
[2-3 sentences on why this score and not higher or lower.]`;

const products = [
  { name: 'Rohl Shaws Original Lancaster Fireclay Farmhouse (RC3618)', score: 94, tier: 'Tier 1', label: 'Best in Class', slug: 'rohl_shaws_rc3618', category: 'Sinks' },
  { name: 'Kohler Whitehaven Self-Trimming Cast Iron (K-6489)', score: 91, tier: 'Tier 1', label: 'Best in Class', slug: 'kohler_whitehaven_k6489', category: 'Sinks' },
  { name: 'Blanco IKON 33 Silgranit Composite Apron Front (401734)', score: 83, tier: 'Tier 2', label: 'Excellent', slug: 'blanco_ikon_33', category: 'Sinks' },
  { name: 'Kohler Cairn Neoroc Composite Undermount (K-8206)', score: 80, tier: 'Tier 2', label: 'Excellent', slug: 'kohler_cairn_k8206', category: 'Sinks' },
  { name: 'Kraus Standart PRO 16-Gauge Stainless Undermount (KHU100-30)', score: 68, tier: 'Tier 3', label: 'Good', slug: 'kraus_standart_pro_30', category: 'Sinks' },
  { name: 'Kohler Caxton Oval Undermount Bathroom (K-2210)', score: 68, tier: 'Tier 3', label: 'Good', slug: 'kohler_caxton_k2210', category: 'Sinks' },
  { name: 'Glacier Bay All-in-One Drop-In Stainless (VT3322A08)', score: 45, tier: 'Tier 4', label: 'Fair', slug: 'glacier_bay_dropin', category: 'Sinks' },
];

function findCurationFile(slug) {
  const dir = path.join(process.cwd(), 'calibration', 'sinks', 'curation_files');
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
  console.log(`Curation: ${curationPath} (${(curation.length/1024).toFixed(1)}KB)`);

  const userMsg = `PRODUCT: ${product.name}
LOCKED SCORE: ${product.score}/100
TIER: ${product.tier} — ${product.label}
CATEGORY: ${product.category}
AXIS WEIGHTS: Quality=0.45, Durability=0.45, Performance=0.10
POOL S: VACANT (no independent testing source for sinks)

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
    const filename = `investigator_sink_${product.slug}.md`;
    fs.writeFileSync(filename, output);
    console.log(`Saved: ${filename} (${output.length} chars)`);
    return { product: product.name, score: product.score, output };
  } catch (e) {
    console.error(`API error for ${product.name}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('Sinks Investigator Bot — Starting');
  console.log('Axis weights: Q=0.45, D=0.45, P=0.10');
  console.log('Pool S: VACANT (no independent testing source for sinks)');
  console.log('Sub-types: fireclay, cast iron, composite (x2), stainless, bathroom vitreous china, builder-grade stainless');
  console.log('Products: 7 calibration products spanning Tier 1–4');
  console.log('');

  const results = [];
  for (const p of products) {
    const r = await runInvestigation(p);
    if (r) results.push(r);
  }

  if (results.length > 0) {
    let summary = '# Sinks Investigator Bot Summary\n\n';
    summary += `Ran ${results.length} products.\n`;
    summary += `Axis weights: Q=0.45, D=0.45, P=0.10\n`;
    summary += `Pool S: VACANT (no independent testing source exists for residential sinks)\n`;
    summary += `Sub-types: 1 fireclay, 1 cast iron, 2 composite, 1 stainless, 1 bathroom vitreous china, 1 builder-grade stainless\n`;
    summary += `Deep dives: ${results.length}/7 completed\n\n`;
    for (const r of results) {
      summary += `---\n## ${r.product} (Score: ${r.score})\n\n${r.output}\n\n`;
    }
    fs.writeFileSync('investigator_sinks_summary.md', summary);
    console.log('\nSaved: investigator_sinks_summary.md');
  }
  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
