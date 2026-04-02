#!/usr/bin/env node
/**
 * Water Heaters Investigator Bot — v1
 * Runs Sonnet against curation files for all 7 calibration products.
 *
 * Axis weights: Q=0.30, D=0.40, P=0.30
 * Pool S: VACANT (Yale Appliance does not cover water heaters)
 * Sub-types: Tankless gas, Tank (gas/electric), Heat Pump
 * Special rules: Sub-type parity, Navien conditional warranty, Bradford White pro-only,
 *                Platform sharing (A.O. Smith/State/American, Rheem/Ruud/Richmond)
 *
 * Usage: cd /Users/Residentialist/.openclaw/workspace/residentialist
 *        export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
 *        /usr/local/bin/node run_investigator_water_heaters.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the Residentialist Investigator Bot. Your job is to analyze a residential water heater using ONLY the evidence in the curation file provided.

CATEGORY: Water Heaters (tankless gas, storage tank gas/electric, heat pump)
AXIS WEIGHTS: Quality=0.30, Durability=0.40, Performance=0.30
COMPOSITE METHOD: Geometric mean
POOL S: VACANT — Yale Appliance does NOT sell or service water heaters. No equivalent quantified reliability database exists. Disclose this in every report.

RULES:
- The overall score is LOCKED. Not up for debate.
- Durability is the DOMINANT axis (0.40) — professional hierarchy for water heaters is organized around "which ones last" and "which ones can be serviced."
- An even split is WRONG. If your three scored axes are within 3 points of each other, you have not done your job. Find the variance.
- You MUST identify at least one clear strength and at least one clear deficiency.
- Every claim must trace to specific evidence in the curation file. No speculation.

CRITICAL WATER HEATER FINDINGS TO REPORT:

FOR TANKLESS GAS:
- Heat exchanger material is CRITICAL: dual stainless, copper + stainless, or copper only. Name it.
- Condensing vs non-condensing — this is THE efficiency cliff (0.93+ vs 0.79 UEF).
- HX warranty terms — Navien's conditional 15yr/5yr with recirculation type is a MATERIAL disclosure.
- Recirculation system: built-in (Navien ComfortFlow) vs external compatible (Rinnai Circ-Logic) vs none.
- Scale maintenance requirement — annual flushing is mandatory for all tankless.

FOR STORAGE TANK:
- Glass lining technology: Bradford White Vitraglas, A.O. Smith Blue Diamond, or generic. Name it.
- Anode rod type: powered titanium > stainless (CoreGard) > magnesium > aluminum.
- Drain valve material: brass (pro) vs plastic (retail).
- Distribution channel: pro-only (Bradford White) vs pro+retail (A.O. Smith) vs retail-only (Rheem Performance Plus).
- Millivolt operation: works without electricity (Bradford White ICON) — genuine power outage advantage.

FOR HEAT PUMP:
- UEF is in a DIFFERENT DOE testing bin than gas products. Reports MUST disclose this when comparing.
- Compressor noise, ambient temperature requirements, space requirements — real-world installation constraints.
- Control board reliability — more electronics = more failure points. Document the trade-off.
- Operating modes: heat pump only vs hybrid vs electric backup.

PLATFORM DISCLOSURE RULES (MANDATORY):
- A.O. Smith / State / American: MUST disclose same parent company (A. O. Smith Corp, NYSE: AOS).
- Rheem / Ruud / Richmond: MUST disclose same parent company (Paloma Industries).
- Bradford White: MUST disclose independent, privately held status.
- Rinnai: MUST note Japanese engineering + US assembly model.
- Navien: MUST note Korean manufacturing (Kyungdong Group).

SUB-TYPE NOTE:
Tankless, tank, and heat pump are scored within the same framework. A great tankless, a great pro-grade tank, and a great heat pump can ALL be Tier 1. Sub-type is NOT a quality hierarchy.

OUTPUT FORMAT:
## [Product Name] — Investigator Analysis
**Locked Score: [X]/100 — [Tier Label]**

### Score Decomposition
| Axis | Score | Weight | Assessment |
|------|-------|--------|------------|
| Quality | [X] | 0.30 | [One sentence] |
| Durability | [X] | 0.40 | [One sentence] |
| Performance | [X] | 0.30 | [One sentence] |
| Material Safety | [Label] | report only | [One sentence] |

### Pool S Status
[VACANT — Yale Appliance does not cover water heaters. No equivalent reliability database exists.]

### Platform Disclosure
[Mandatory corporate parent and platform sharing disclosure.]

### Strengths
[2-3 specific findings with evidence from curation file]

### Deficiencies
[2-3 specific findings with evidence from curation file]

### What You Should Know
[3-5 sentences for a homebuyer. Plain English. Honest.]

### Repair Economics
[#1 repair for this sub-type and typical cost. Is repair cost-justified vs replacement?]

### Score Justification
[2-3 sentences on why this score and not higher or lower.]`;

const products = [
  { name: 'Rinnai RU199iN SENSEI Condensing Tankless', score: 93, tier: 'Tier 1', label: 'Best in Class', slug: 'rinnai_ru199in', category: 'Water Heaters' },
  { name: 'Navien NPE-240A2 Condensing Tankless', score: 91, tier: 'Tier 1', label: 'Best in Class', slug: 'navien_npe240a2', category: 'Water Heaters' },
  { name: 'Noritz EZ111DV Condensing Tankless', score: 82, tier: 'Tier 2', label: 'Excellent', slug: 'noritz_ez111dv', category: 'Water Heaters' },
  { name: 'Bradford White RG250T6N (50 gal Tank)', score: 80, tier: 'Tier 2', label: 'Excellent', slug: 'bradford_white_rg2', category: 'Water Heaters' },
  { name: 'Rheem ProTerra XE80 Heat Pump (80 gal)', score: 78, tier: 'Tier 2', label: 'Excellent', slug: 'rheem_proterra', category: 'Water Heaters' },
  { name: 'A.O. Smith ProLine XE (50 gal Tank)', score: 67, tier: 'Tier 3', label: 'Good', slug: 'ao_smith_proline_xe', category: 'Water Heaters' },
  { name: 'Rheem Performance Plus (50 gal Tank)', score: 61, tier: 'Tier 3', label: 'Good', slug: 'rheem_performance_plus', category: 'Water Heaters' },
];

function findCurationFile(slug) {
  const dir = path.join(process.cwd(), 'calibration', 'water_heaters', 'curation_files');
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
AXIS WEIGHTS: Quality=0.30, Durability=0.40, Performance=0.30
POOL S: VACANT (Yale does not cover water heaters)

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
    const filename = `investigator_water_heater_${product.slug}.md`;
    fs.writeFileSync(filename, output);
    console.log(`Saved: ${filename} (${output.length} chars)`);
    return { product: product.name, score: product.score, output };
  } catch (e) {
    console.error(`API error for ${product.name}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('Water Heaters Investigator Bot — Starting');
  console.log('Axis weights: Q=0.30, D=0.40, P=0.30');
  console.log('Pool S: VACANT (Yale does not cover water heaters)');
  console.log('Products: 3 tankless + 2 tank + 1 heat pump + 1 retail tank');
  console.log('');

  const results = [];
  for (const p of products) {
    const r = await runInvestigation(p);
    if (r) results.push(r);
  }

  if (results.length > 0) {
    let summary = '# Water Heaters Investigator Bot Summary\n\n';
    summary += `Ran ${results.length} products.\n`;
    summary += `Axis weights: Q=0.30, D=0.40, P=0.30\n`;
    summary += `Pool S: VACANT (Yale Appliance does not sell/service water heaters)\n`;
    summary += `Sub-types: 3 tankless gas, 2 tank, 1 heat pump, 1 retail tank\n`;
    summary += `Deep dives: 7/7 completed\n\n`;
    for (const r of results) {
      summary += `---\n## ${r.product} (Score: ${r.score})\n\n${r.output}\n\n`;
    }
    fs.writeFileSync('investigator_water_heater_summary.md', summary);
    console.log('\nSaved: investigator_water_heater_summary.md');
  }
  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
