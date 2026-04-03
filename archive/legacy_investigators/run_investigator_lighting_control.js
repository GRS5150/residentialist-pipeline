#!/usr/bin/env node
/**
 * Lighting Control Investigator Bot — v1
 * Runs Sonnet against curation files for all 7 calibration products.
 *
 * Axis weights: Q=0.40, D=0.30, P=0.30
 * Pool S: VACANT (no independent comparative testing source for lighting systems)
 * System-level scoring: Lutron HomeWorks QSX (2 variants), RadioRA 3, Savant, Control4, Caseta, Leviton
 * Lutron dominates: 334 luxury listing sightings
 *
 * Usage: cd /Users/Residentialist/.openclaw/workspace/residentialist
 *        export ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d= -f2)
 *        /usr/local/bin/node run_investigator_lighting_control.js
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the Residentialist Investigator Bot. Your job is to analyze a residential lighting control system using ONLY the evidence in the curation file provided.

CATEGORY: Lighting Control Systems (scored as SYSTEM PLATFORMS, not individual switches)
AXIS WEIGHTS: Quality=0.40, Durability=0.30, Performance=0.30
COMPOSITE METHOD: Geometric mean
POOL S: VACANT — No independent, methodology-documented, comparative testing source exists for whole-home lighting control systems. No teardown channel, no quantified reliability database. CEDIA integrators provide the closest professional consensus but are commercially interested. Disclose this in every report.

RULES:
- The overall score is LOCKED. Not up for debate.
- Quality is DOMINANT (0.40) — system architecture and switch aesthetics drive the professional hierarchy. A panelized wired system with exclusive designer keypads IS fundamentally higher quality than WiFi switches.
- Performance is NOT flat — tunable white (Ketra 1,400K-10,000K vs fixed CCT), dimming depth (0.1% vs 5%), scene complexity, device capacity, and integration depth create real spread.
- An even split is WRONG. If your three scored axes are within 3 points of each other, you have not done your job. Find the variance.
- You MUST identify at least one clear strength and at least one clear deficiency.
- Every claim must trace to specific evidence in the curation file. No speculation.

CRITICAL LIGHTING CONTROL FINDINGS TO REPORT:

FOR LUTRON SYSTEMS:
- Identify specific system tier: HomeWorks QSX (panelized, wired QS Link) vs RadioRA 3 (wireless, distributed) vs Caseta (entry-level, 75 device limit). These are DIFFERENT products.
- Communication protocol: Clear Connect Type X vs Type A — name which.
- Keypad availability: Palladiom/Alisse (HomeWorks exclusive) vs Sunnata/Maestro/seeTouch (RadioRA 3) vs Diva/Claro (Caseta).
- Ketra availability: HomeWorks ONLY. If product has Ketra, report CCT range, Color Lock, Natural Light. If not, note Ketra exclusion.
- Device capacity: 10,000+ (HomeWorks) vs 200/processor (RadioRA 3) vs 75 (Caseta).
- 334 luxury listing sightings — Lutron dominant category presence.

FOR SAVANT:
- MATERIAL FINDING: Professional integrators frequently pair Savant brain + Lutron lighting hardware. Report this.
- TrueImage display technology.
- 3-year warranty vs Lutron 8-year.
- Bluetooth mesh vs Clear Connect reliability.

FOR CONTROL4:
- Zigbee mesh on shared 2.4 GHz spectrum vs Lutron dedicated band.
- TWO ownership changes in 5 years (Snap One 2019, Resideo 2024). Report corporate stability concern.
- 2-year warranty — shortest in category.

FOR WIFI SWITCHES (Leviton):
- NOT a system — individual switches with an app. Score reflects this.
- Router dependency, cloud dependency, network congestion.
- Professional integrators do not specify WiFi switches for quality homes.

PLATFORM DISCLOSURE RULES (MANDATORY):
- Lutron Electronics Co.: privately held, family-owned since 1961, Coopersburg PA. 17,000+ patents. Strong outlook.
- Savant Systems: privately held, Hyannis MA.
- Control4/Snap One/Resideo: publicly traded (Resideo REZI). Three corporate layers. Conditional outlook.
- Leviton Manufacturing: privately held since 1906, Melville NY. Stable outlook.

OUTPUT FORMAT:
## [Product Name] — Investigator Analysis
**Locked Score: [X]/100 — [Tier Label]**

### Score Decomposition
| Axis | Score | Weight | Assessment |
|------|-------|--------|------------|
| Quality | [X] | 0.40 | [One sentence] |
| Durability | [X] | 0.30 | [One sentence] |
| Performance | [X] | 0.30 | [One sentence] |
| Material Safety | [Label] | report only | [One sentence] |

### Pool S Status
[VACANT — No independent comparative testing source exists for residential lighting control systems.]

### Platform Disclosure
[Mandatory corporate parent and ownership disclosure.]

### Strengths
[2-3 specific findings with evidence from curation file]

### Deficiencies
[2-3 specific findings with evidence from curation file]

### What You Should Know
[3-5 sentences for a homebuyer. Plain English. Honest.]

### System Architecture Note
[Brief description of this system's communication architecture and what it means for reliability.]

### Score Justification
[2-3 sentences on why this score and not higher or lower.]`;

const products = [
  { name: 'Lutron HomeWorks QSX (with Ketra)', score: 95, tier: 'Tier 1', label: 'Best in Class', slug: 'lutron_homeworks_qsx_ketra', category: 'Lighting Control' },
  { name: 'Lutron HomeWorks QSX (Standard)', score: 92, tier: 'Tier 1', label: 'Best in Class', slug: 'lutron_homeworks_qsx', category: 'Lighting Control' },
  { name: 'Lutron RadioRA 3', score: 84, tier: 'Tier 2', label: 'Excellent', slug: 'lutron_radiora3', category: 'Lighting Control' },
  { name: 'Savant Lighting System', score: 80, tier: 'Tier 2', label: 'Excellent', slug: 'savant_lighting', category: 'Lighting Control' },
  { name: 'Control4 Lighting (Snap One)', score: 67, tier: 'Tier 3', label: 'Good', slug: 'control4_lighting', category: 'Lighting Control' },
  { name: 'Lutron Caseta', score: 64, tier: 'Tier 3', label: 'Good', slug: 'lutron_caseta', category: 'Lighting Control' },
  { name: 'Leviton Decora Smart Wi-Fi', score: 47, tier: 'Tier 4', label: 'Fair', slug: 'leviton_decora_smart', category: 'Lighting Control' },
];

function findCurationFile(slug) {
  const dir = path.join(process.cwd(), 'calibration', 'lighting_control', 'curation_files');
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
AXIS WEIGHTS: Quality=0.40, Durability=0.30, Performance=0.30
POOL S: VACANT (no independent testing source for lighting control systems)
LUTRON MARKET DATA: 334 luxury listing sightings — dominant category presence

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
    const filename = `investigator_lighting_control_${product.slug}.md`;
    fs.writeFileSync(filename, output);
    console.log(`Saved: ${filename} (${output.length} chars)`);
    return { product: product.name, score: product.score, output };
  } catch (e) {
    console.error(`API error for ${product.name}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('Lighting Control Investigator Bot — Starting');
  console.log('Axis weights: Q=0.40, D=0.30, P=0.30');
  console.log('Pool S: VACANT');
  console.log('Category: Lighting Control Systems (7 calibration products)');
  console.log('Market: Lutron 334 luxury listing sightings — dominant');
  console.log('');

  const results = [];
  for (const p of products) {
    const r = await runInvestigation(p);
    if (r) results.push(r);
  }

  if (results.length > 0) {
    let summary = '# Lighting Control Investigator Bot Summary\n\n';
    summary += `Ran ${results.length} products.\n`;
    summary += `Axis weights: Q=0.40, D=0.30, P=0.30\n`;
    summary += `Pool S: VACANT (no independent testing source exists for lighting control systems)\n`;
    summary += `Systems: 2 HomeWorks QSX (Ketra + Standard), 1 RadioRA 3, 1 Savant, 1 Control4, 1 Caseta, 1 Leviton\n`;
    summary += `Market data: Lutron appeared 334 times in luxury home listings\n`;
    summary += `Deep dives: ${results.length}/7 completed\n\n`;
    for (const r of results) {
      summary += `---\n## ${r.product} (Score: ${r.score})\n\n${r.output}\n\n`;
    }
    fs.writeFileSync('investigator_lighting_control_summary.md', summary);
    console.log('\nSaved: investigator_lighting_control_summary.md');
  }
  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
