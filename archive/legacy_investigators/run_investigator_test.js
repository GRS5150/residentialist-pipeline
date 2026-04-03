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
- QUALITY (Is it well-made? Component construction, manufacturing precision, professional consensus)
- PERFORMANCE (Does it do its job well? Measurable specs — U-factor, air infiltration, structural ratings)
- DURABILITY (Will it last? Warranty reality, parts availability, field longevity data, repairability)
- MATERIAL SAFETY (Report-only axis. Does not affect score. Flag any concerns with a label: Excellent/Good/Moderate/Concern)

RULES:
- The overall score is LOCKED. Not up for debate.
- Quality, Performance, and Durability axis scores should roughly average to the locked composite score, but individual axes CAN range significantly above or below.
- An even split is WRONG. If your three scored axes are within 3 points of each other, you have not done your job. Find the variance.
- You MUST identify at least one clear strength and at least one clear deficiency.
- Every claim must trace to specific evidence in the curation file. No speculation.
- Write for a homebuyer, not an engineer.

OUTPUT FORMAT:
## [Product Name] — Investigator Analysis
**Locked Score: [X]/100 — [Tier Label]**

### Score Decomposition
| Axis | Score | Assessment |
|------|-------|------------|
| Quality | [X] | [One sentence] |
| Performance | [X] | [One sentence] |
| Durability | [X] | [One sentence] |
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
  { name: 'Marvin Signature Ultimate', config: 'Double Hung', slug: 'marvin_signature_ultimate' },
  { name: 'Andersen 400 Series', config: 'Double Hung', slug: 'andersen_400_series' },
  { name: 'Reliabilt 3500', config: 'Double Hung', slug: 'reliabilt_3500' }
];

async function findCurationFile(slug) {
  const dir = path.join(process.cwd(), 'curation_files');
  if (!fs.existsSync(dir)) {
    const alt = path.join(process.cwd(), 'curation');
    if (fs.existsSync(alt)) return findInDir(alt, slug);
    console.error('No curation_files or curation directory found');
    return null;
  }
  return findInDir(dir, slug);
}

function findInDir(dir, slug) {
  const files = fs.readdirSync(dir);
  // Prefer double_hung sources file for this slug
  const dhMatch = files.find(f => f.includes(slug) && f.includes('double_hung') && f.endsWith('_sources.json'));
  if (dhMatch) return path.join(dir, dhMatch);
  const match = files.find(f => f.includes(slug) && f.endsWith('_sources.json'));
  if (match) return path.join(dir, match);
  const partial = files.find(f => f.includes(slug));
  if (partial) return path.join(dir, partial);
  console.log('Available files:', files.filter(f => !f.includes('progress')).join(', '));
  return null;
}

function getScore(slug, productName) {
  const { execSync } = require('child_process');
  // Try matching by product name first (more reliable), then by slug pattern
  const queries = [
    `SELECT product_name, overall_score, product_label FROM products WHERE product_name='${productName}' AND config='DH' LIMIT 1`,
    `SELECT product_name, overall_score, product_label FROM products WHERE product_name LIKE '%${slug.replace(/_/g, '%')}%' AND config='DH' LIMIT 1`
  ];
  for (const q of queries) {
    try {
      const result = execSync(`sqlite3 residentialist.db "${q}"`, { encoding: 'utf-8' }).trim();
      if (!result) continue;
      const parts = result.split('|');
      return { name: parts[0], score: parts[1], tier: parts[2] || '', label: parts[2] || '' };
    } catch (e) { continue; }
  }
  return null;
}

async function runInvestigation(product) {
  console.log(`\n=== Processing: ${product.name} ===`);

  const curationPath = await findCurationFile(product.slug);
  if (!curationPath) { console.error(`No curation file for ${product.slug}`); return; }

  const curation = fs.readFileSync(curationPath, 'utf-8');
  const dbRecord = getScore(product.slug, product.name);
  if (!dbRecord) { console.error(`No DB record for ${product.slug}`); return; }

  console.log(`Score: ${dbRecord.score}, Tier: ${dbRecord.tier}, Label: ${dbRecord.label}`);
  console.log(`Curation file: ${curationPath} (${(curation.length/1024).toFixed(1)}KB)`);

  const userMsg = `PRODUCT: ${product.name}
CONFIGURATION: ${product.config}
LOCKED SCORE: ${dbRecord.score}/100
TIER: ${dbRecord.tier} — ${dbRecord.label}
CATEGORY: Windows

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
    const filename = `investigator_test_${product.slug}_double_hung.md`;
    fs.writeFileSync(filename, output);
    console.log(`Saved: ${filename}`);
    return { product: product.name, score: dbRecord.score, output };
  } catch (e) {
    console.error(`API error for ${product.name}:`, e.message);
    return null;
  }
}

async function main() {
  console.log('Investigator Bot Test — Starting');
  const results = [];

  for (const p of products) {
    const r = await runInvestigation(p);
    if (r) results.push(r);
  }

  if (results.length > 0) {
    let summary = '# Investigator Bot Test Summary\n\n';
    summary += `Ran ${results.length} products.\n\n`;
    for (const r of results) {
      summary += `---\n## ${r.product} (Score: ${r.score})\n\n${r.output}\n\n`;
    }
    fs.writeFileSync('investigator_test_summary.md', summary);
    console.log('\nSaved: investigator_test_summary.md');
  }

  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
