#!/usr/bin/env node
/**
 * Ranges & Cooktops Investigator Bot — v1
 * Runs Sonnet against curation files for all 7 calibration products.
 *
 * Axis weights: Q=0.30, D=0.35, P=0.35
 * Pool S: Yale Appliance (gas range + induction service rates)
 * Special rules: BSH Platform, GE Platform, Wolf/Range cross-category, igniter scoring
 *
 * Usage: cd /Users/Residentialist/.openclaw/workspace/residentialist
 *        export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
 *        /usr/local/bin/node run_investigator_ranges_cooktops.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the Residentialist Investigator Bot. Your job is to analyze a residential range or cooktop using ONLY the evidence in the curation file provided.

CATEGORY: Ranges & Cooktops (pro-style gas, dual-fuel, induction ranges + built-in cooktops)
AXIS WEIGHTS: Quality=0.30, Durability=0.35, Performance=0.35
COMPOSITE METHOD: Geometric mean
POOL S (primary authority): Yale Appliance — gas range service rates (GE 4.8%, LG 5.5%, Profile 10.1%, Cafe 11.7%, avg 6.9%) and induction service rates (Bosch 1.7%, Thermador 4.9%, Gaggenau 0%)

RULES:
- The overall score is LOCKED. Not up for debate.
- Durability and Performance are equally weighted (0.35 each) and both outweigh Quality (0.30).
- An even split is WRONG. If your three scored axes are within 3 points of each other, you have not done your job. Find the variance.
- You MUST identify at least one clear strength and at least one clear deficiency.
- Every claim must trace to specific evidence in the curation file. No speculation.

CRITICAL RANGE/COOKTOP FINDINGS TO REPORT:

FOR GAS RANGES:
- Burner type is CRITICAL: dual-stacked sealed (Wolf), open cast (BlueStar), star (Thermador), standard sealed, stamped aluminum. Name it.
- Maximum BTU per burner and minimum simmer BTU — these define the performance range.
- Gas valve manufacturer (Robertshaw, Honeywell, etc.) — affects repair economics.
- Igniter type is CRITICAL (#1 repair item): silicon carbide vs silicon nitride vs electronic spark. Name it.
- Grate material: continuous cast iron vs individual vs stamped.

FOR INDUCTION:
- Zone configuration: full-surface (Thermador Freedom), flex/bridge, fixed. Name it.
- Max watts per zone and total wattage.
- Component suppliers if documented: E.G.O. coils, Infineon IGBTs, Schott CERAN glass.
- Power board failures documented?

FOR ALL:
- Oven section (ranges only): convection type, same as wall oven? Cross-category sharing?
- Service ecosystem: parts + technician availability + warranty.
- Corporate parent and platform sharing.

PLATFORM DISCLOSURE RULES (MANDATORY):
- BSH (Bosch, Thermador, Gaggenau): MUST disclose shared platform. Specify what is shared vs differentiated.
- Whirlpool (JennAir, KitchenAid): MUST disclose shared platform.
- GE/Haier (Monogram, Cafe, Profile, GE): MUST disclose Selmer TN factory platform sharing. MUST note GE base (4.8%) outperforms Cafe (11.7%).
- Samsung/Dacor: if evidence suggests sharing, MUST disclose.
- CROSS-CATEGORY: If range oven section shares components with wall oven, MUST disclose.

GAS vs INDUCTION NOTE:
Gas and induction are scored in the same framework. A great gas range and a great induction cooktop can both be Tier 1. Fuel type is NOT a quality hierarchy.

OUTPUT FORMAT:
## [Product Name] — Investigator Analysis
**Locked Score: [X]/100 — [Tier Label]**

### Score Decomposition
| Axis | Score | Weight | Assessment |
|------|-------|--------|------------|
| Quality | [X] | 0.30 | [One sentence] |
| Durability | [X] | 0.35 | [One sentence] |
| Performance | [X] | 0.35 | [One sentence] |
| Material Safety | [Label] | report only | [One sentence] |

### Platform Disclosure
[Mandatory for BSH, GE, Whirlpool, Samsung. Cross-category if applicable.]

### Strengths
[2-3 specific findings with evidence from curation file]

### Deficiencies
[2-3 specific findings with evidence from curation file]

### What You Should Know
[3-5 sentences for a homebuyer. Plain English. Honest.]

### Repair Economics
[#1 repair for this product type (igniter for gas, power board for induction, control board). Parts cost, labor, total. Is repair cost-justified?]

### Score Justification
[2-3 sentences on why this score and not higher or lower.]`;

const products = [
  { name: 'Wolf Pro-Style Gas Range (36"/48")', score: 94, tier: 'Tier 1', label: 'Best in Class', slug: 'wolf_gas_range', category: 'Ranges & Cooktops' },
  { name: 'BlueStar Platinum Gas Range', score: 91, tier: 'Tier 1', label: 'Best in Class', slug: 'bluestar_platinum', category: 'Ranges & Cooktops' },
  { name: 'Thermador Pro Grand Gas Range', score: 83, tier: 'Tier 2', label: 'Excellent', slug: 'thermador_pro_grand', category: 'Ranges & Cooktops' },
  { name: 'Thermador Freedom Induction Cooktop (36")', score: 81, tier: 'Tier 2', label: 'Excellent', slug: 'thermador_freedom_induction', category: 'Ranges & Cooktops' },
  { name: 'Bosch 800 Induction Cooktop (36")', score: 70, tier: 'Tier 3', label: 'Good', slug: 'bosch_800_induction', category: 'Ranges & Cooktops' },
  { name: 'GE Cafe Gas Slide-In Range', score: 64, tier: 'Tier 3', label: 'Good', slug: 'ge_cafe_gas', category: 'Ranges & Cooktops' },
  { name: 'Samsung Gas Slide-In Range', score: 45, tier: 'Tier 4', label: 'Fair', slug: 'samsung_gas', category: 'Ranges & Cooktops' },
];

function findCurationFile(slug) {
  const dir = path.join(process.cwd(), 'calibration', 'ranges_cooktops', 'curation_files');
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
    const filename = `investigator_range_${product.slug}.md`;
    fs.writeFileSync(filename, output);
    console.log(`Saved: ${filename} (${output.length} chars)`);
    return { product: product.name, score: product.score, output };
  } catch (e) {
    console.error(`API error for ${product.name}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('Ranges & Cooktops Investigator Bot — Starting');
  console.log('Axis weights: Q=0.30, D=0.35, P=0.35');
  console.log('Pool S: Yale Appliance');
  console.log('Products: 3 gas + 2 induction + 2 mixed-tier');
  console.log('');

  const results = [];
  for (const p of products) {
    const r = await runInvestigation(p);
    if (r) results.push(r);
  }

  if (results.length > 0) {
    let summary = '# Ranges & Cooktops Investigator Bot Summary\n\n';
    summary += `Ran ${results.length} products.\n`;
    summary += `Axis weights: Q=0.30, D=0.35, P=0.35\n`;
    summary += `Pool S: Yale Appliance (gas + induction service rates)\n`;
    summary += `Deep dives: 7/7 completed\n\n`;
    for (const r of results) {
      summary += `---\n## ${r.product} (Score: ${r.score})\n\n${r.output}\n\n`;
    }
    fs.writeFileSync('investigator_range_summary.md', summary);
    console.log('\nSaved: investigator_range_summary.md');
  }
  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
