#!/usr/bin/env node
/**
 * Tile Investigator Bot — v1
 * Runs Sonnet against curation files for all 7 calibration products.
 *
 * Axis weights: Q=0.35, D=0.35, P=0.30
 * Pool S: VACANT (no independent quantified testing source for tile)
 * Sub-types: porcelain_large_format, porcelain_floor, ceramic_floor
 * Key specs: PEI rating, water absorption %, DCOF slip resistance, breaking strength
 * Performance axis: REAL SPREAD (not flat — PEI 0-5, DCOF 0.20-0.90+, absorption 0.01%-15%+)
 * Porcelanosa: 39 luxury listing sightings
 * Platform sharing: Mohawk (Daltile/Marazzi/American Olean)
 *
 * Usage: cd /Users/Residentialist/.openclaw/workspace/residentialist
 *        export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
 *        /usr/local/bin/node run_investigator_tile.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the Residentialist Investigator Bot. Your job is to analyze a residential tile product using ONLY the evidence in the curation file provided.

CATEGORY: Tile (porcelain large-format, porcelain floor, porcelain through-body, ceramic floor)
AXIS WEIGHTS: Quality=0.35, Durability=0.35, Performance=0.30
COMPOSITE METHOD: Geometric mean
POOL S: VACANT — No independent, methodology-documented, comparative testing source equivalent to StarCraft (faucets), MaP (toilets), or Yale Appliance (dishwashers) exists for residential tile. TCNA/IPA Labs tests to standards but doesn't publish comparative brand rankings. PTCA certifies porcelain claims but doesn't rank quality. Disclose this in every report.

PERFORMANCE AXIS NOTE: Performance has REAL SPREAD in tile (not flat like sinks/faucets). PEI Class 0-5, DCOF 0.20-0.90+, water absorption 0.01%-15%+. All three axes should show meaningful variance.

RULES:
- The overall score is LOCKED. Not up for debate.
- Quality and Durability are CO-DOMINANT axes (0.35 each) — clay body composition, manufacturing origin, firing precision, and rectification quality drive the meaningful variation. Performance axis (0.30) has REAL SPREAD due to measurable spec differences (PEI, DCOF, water absorption).
- An even split across all three axes is WRONG. Find the variance. Performance should vary meaningfully between PEI 2 and PEI 5 products, between DCOF 0.42 and 0.60+ products, between 0.1% and 7% water absorption products.
- You MUST identify at least one clear strength and at least one clear deficiency.
- Every claim must trace to specific evidence in the curation file. No speculation.

CRITICAL TILE FINDINGS TO REPORT:

FOR PORCELAIN (LARGE FORMAT / FLOOR):
- Body composition: through-body porcelain (premium — chips invisible) vs color body (tinted — chip visibility reduced) vs white body (chips show white). Name it.
- Water absorption: exact % if available. <0.1% = deeply impervious premium. <0.5% = porcelain grade. >0.5% = NOT porcelain.
- Rectification: rectified (machine-cut, ±0.5mm, enables tight grout) vs calibrated (sorted) vs non-rectified (pressed edge). Name it.
- Manufacturing origin: identify factory location. Castellón Spain, Sassuolo Italy, Crossville TN, or unidentified/multi-source?
- PEI rating: Class 0-5. Through-body unglazed = PEI 5 equivalent (inherent full-depth wear resistance).
- DCOF value: ≥0.42 minimum for wet interior. ≥0.60 = high slip resistance.
- PTCA certification: independently verified porcelain, or claimed without certification?

FOR CERAMIC (FLOOR):
- Body type: white body (standard) vs red body (terracotta-based, lower quality signal). Name it.
- Water absorption range: vitreous (0.5-3%), semi-vitreous (3-7%), non-vitreous (>7%). Name it.
- PEI rating: Class 2-3 is typical for standard ceramic. Class 4+ is premium.
- Rectification status: most standard ceramic is calibrated, not rectified. Report what it IS.
- NOT porcelain: do not allow ceramic to inherit porcelain quality claims.

PLATFORM DISCLOSURE RULES (MANDATORY):
- Grupo Porcelanosa (private, family-owned since 1973, Castellón Spain): MUST disclose private family-owned status, vertically integrated model, €1B+ revenue, 39 luxury listing sightings.
- Mohawk Industries (NYSE: MHK): MUST disclose as parent of Daltile, Marazzi USA, American Olean. Disclose which brands share manufacturing and which products differ within the portfolio.
- Crossville Inc (private, Crossville TN): MUST disclose private status, US manufacturing, single factory.
- MSI (M S International): MUST disclose distributor model (NOT manufacturer), global sourcing, Orange CA headquarters.
- Merola Tile: MUST disclose importer/distributor model, unknown/variable OEM manufacturing, Home Depot distribution.

SUB-TYPE NOTE:
Porcelain and ceramic are scored within the same framework. Porcelain's inherently lower water absorption, higher density, and frost resistance are captured as real spec advantages through the spec fields — NOT as automatic tier bonuses. A premium ceramic used in its appropriate application can still score well. Sub-type is NOT a quality hierarchy — it's a material classification.

PERFORMANCE IS NOT FLAT:
Unlike sinks and faucets, tile Performance axis has genuine, measurable variation. PEI 2 (light traffic wall tile) vs PEI 5 (heavy commercial floor tile) is a REAL performance gap. DCOF 0.42 (minimum) vs 0.60+ (high slip resistance) is a REAL safety performance gap. Water absorption 0.1% (deeply impervious) vs 7% (semi-vitreous) is a REAL application range gap. Score Performance with spread.

OUTPUT FORMAT:
## [Product Name] — Investigator Analysis
**Locked Score: [X]/100 — [Tier Label]**

### Score Decomposition
| Axis | Score | Weight | Assessment |
|------|-------|--------|------------|
| Quality | [X] | 0.35 | [One sentence] |
| Durability | [X] | 0.35 | [One sentence] |
| Performance | [X] | 0.30 | [One sentence] |
| Material Safety | [Label] | report only | [One sentence] |

### Pool S Status
[VACANT — No independent comparative testing source exists for residential tile.]

### Platform Disclosure
[Mandatory corporate parent and platform sharing disclosure.]

### Key Specifications
| Spec | Value | Assessment |
|------|-------|------------|
| Body Composition | [type] | [significance] |
| Water Absorption | [%] | [porcelain/ceramic classification] |
| PEI Rating | [Class X] | [traffic rating] |
| DCOF | [value] | [slip resistance level] |
| Rectification | [yes/no] | [precision level] |
| PTCA Certified | [yes/no/N/A] | [porcelain verification] |

### Strengths
[2-3 specific findings with evidence from curation file]

### Deficiencies
[2-3 specific findings with evidence from curation file]

### What You Should Know
[3-5 sentences for a homebuyer. Plain English. Honest.]

### Maintenance & Repair
[#1 maintenance need for this tile type and typical cost. Grout maintenance, surface sealing needs, chip repair if applicable.]

### Score Justification
[2-3 sentences on why this score and not higher or lower.]`;

const products = [
  { name: 'Porcelanosa Dover Caliza (Large Format Porcelain Floor)', score: 94, tier: 'Tier 1', label: 'Best in Class', slug: 'porcelanosa_dover_caliza', category: 'Tile' },
  { name: 'Crossville Virtue (Through-Body Porcelain Floor)', score: 91, tier: 'Tier 1', label: 'Best in Class', slug: 'crossville_virtue', category: 'Tile' },
  { name: 'Daltile Panoramic Porcelain (Large Format)', score: 82, tier: 'Tier 2', label: 'Excellent', slug: 'daltile_panoramic', category: 'Tile' },
  { name: 'Marazzi Color Body Porcelain (Italian Production)', score: 80, tier: 'Tier 2', label: 'Excellent', slug: 'marazzi_color_body', category: 'Tile' },
  { name: 'MSI Aria Bianco Porcelain (24x24)', score: 67, tier: 'Tier 3', label: 'Good', slug: 'msi_aria_bianco', category: 'Tile' },
  { name: 'American Olean Theoretical Bold Ceramic', score: 65, tier: 'Tier 3', label: 'Good', slug: 'american_olean_theoretical_bold', category: 'Tile' },
  { name: 'Merola Tile (Home Depot Imported Ceramic)', score: 45, tier: 'Tier 4', label: 'Fair', slug: 'merola_tile_hd', category: 'Tile' },
];

function findCurationFile(slug) {
  const dir = path.join(process.cwd(), 'calibration', 'tile', 'curation_files');
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
AXIS WEIGHTS: Quality=0.35, Durability=0.35, Performance=0.30
POOL S: VACANT (no independent testing source for tile)
PERFORMANCE NOTE: Performance has REAL SPREAD in tile — PEI, DCOF, water absorption create meaningful variation.

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
    const filename = `investigator_tile_${product.slug}.md`;
    fs.writeFileSync(filename, output);
    console.log(`Saved: ${filename} (${output.length} chars)`);
    return { product: product.name, score: product.score, output };
  } catch (e) {
    console.error(`API error for ${product.name}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('Tile Investigator Bot — Starting');
  console.log('Axis weights: Q=0.35, D=0.35, P=0.30');
  console.log('Pool S: VACANT (no independent testing source for tile)');
  console.log('Sub-types: porcelain large-format (x2), porcelain floor/through-body (x2), ceramic floor (x2), ceramic decorator (x1)');
  console.log('Key specs: PEI, DCOF, water absorption %, breaking strength, body composition');
  console.log('Products: 7 calibration products spanning Tier 1–4');
  console.log('');

  const results = [];
  for (const p of products) {
    const r = await runInvestigation(p);
    if (r) results.push(r);
  }

  if (results.length > 0) {
    let summary = '# Tile Investigator Bot Summary\n\n';
    summary += `Ran ${results.length} products.\n`;
    summary += `Axis weights: Q=0.35, D=0.35, P=0.30\n`;
    summary += `Pool S: VACANT (no independent testing source exists for residential tile)\n`;
    summary += `Sub-types: 2 porcelain large-format, 2 porcelain floor/through-body, 2 ceramic floor, 1 ceramic decorator\n`;
    summary += `Key specs: PEI, DCOF, water absorption %, breaking strength, body composition\n`;
    summary += `Deep dives: ${results.length}/7 completed\n\n`;
    for (const r of results) {
      summary += `---\n## ${r.product} (Score: ${r.score})\n\n${r.output}\n\n`;
    }
    fs.writeFileSync('investigator_tile_summary.md', summary);
    console.log('\nSaved: investigator_tile_summary.md');
  }
  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
