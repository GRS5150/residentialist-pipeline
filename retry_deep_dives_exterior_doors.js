#!/usr/bin/env node
/**
 * Exterior Doors — Retry Failed Deep Dives
 * Re-runs the 3 products that failed in batch: Masonite, JELD-WEN, Reliabilt
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = __dirname;
const OUTPUT_DIR = path.join(WORKSPACE, 'knowledge', 'exterior_doors');
const ENV_PATH = path.join(WORKSPACE, '.env');

function loadApiKey() {
  if (process.env.PERPLEXITY_API_KEY) return process.env.PERPLEXITY_API_KEY;
  if (fs.existsSync(ENV_PATH)) {
    const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
    const match = envContent.match(/PERPLEXITY_API_KEY=(.+)/);
    if (match) return match[1].trim();
  }
  throw new Error('PERPLEXITY_API_KEY not found');
}

const API_KEY = loadApiKey();
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const MASTER_TEMPLATE = `I'm building an independent product intelligence platform that scores residential exterior entry doors on Quality (0.40 weight), Durability (0.35), and Performance (0.25). I need a forensic analysis of this specific product — not generic brand information, not marketing copy. I need the specific components, suppliers, test results, and field performance data.

SLAB CONSTRUCTION & CORE:
- What is the exact slab construction? (compression-molded fiberglass, solid wood species, engineered laminated wood, steel with specific gauge?)
- Core insulation material and R-value?
- In-house or sourced slab?

WEATHERSEALING SYSTEM:
- Weatherstripping type and supplier (Schlegel/Quanex)?
- Threshold/sill system?
- Corner pad quality and expected lifespan?
- NFRC air infiltration rate?

HARDWARE & LOCKING:
- Multipoint lock or single deadbolt?
- If multipoint: supplier (GU, Winkhaus, Hoppe)?
- ANSI/BHMA hinge grade?

GLASS & GLAZING:
- Internally or externally glazed?
- Glass panel supplier?
- Low-E, double/triple pane?
- NFRC U-factor?

ENERGY PERFORMANCE:
- NFRC U-factor for complete assembly?
- ENERGY STAR certified?
- Design pressure rating?

DURABILITY & WARRANTY:
- Expected lifespan per professionals?
- Warranty terms?
- Parts availability at 10+ years?
- Dealer vs big-box channel quality differences?

MANUFACTURING & CORPORATE:
- Manufacturing location?
- Parent company?
- Platform sharing?

PROFESSIONAL OPINION:
- What do installers say?
- Callback/service rate?

Focus on GBA, FHB, r/Carpentry, Consumer Reports, NFRC database. Cite all sources.`;

const RETRY_PRODUCTS = [
  {
    name: 'Masonite Performance Door System (Fiberglass)',
    slug: 'masonite_performance',
    context: `Product-specific context: Masonite's premium entry. Masonite International (TSX: MAS). Innovative weatherstripping. Comparable to Therma-Tru Benchmark. Solidoor is below Performance. Multiple facilities US, Canada, Mexico. Key targets: (1) Slab construction, (2) Weatherstripping specifics, (3) R-value, (4) NFRC U-factor, (5) Hardware spec, (6) Warranty terms.`,
  },
  {
    name: 'JELD-WEN Builders Series (Steel/Fiberglass)',
    slug: 'jeldwen_builders',
    context: `Product-specific context: Builder-grade. Both steel and fiberglass. AuraLast controversy (windows primarily). JELD-WEN (NYSE: JELD). Big-box and builder channel. Key targets: (1) Steel gauge, (2) Core insulation, (3) Weatherstripping, (4) Hardware grade, (5) NFRC U-factor, (6) Manufacturing location, (7) AuraLast applicability to doors, (8) Builders Series vs Siteline differences.`,
  },
  {
    name: 'Reliabilt Entry Door (Lowe\'s)',
    slug: 'reliabilt_entry',
    context: `Product-specific context: JELD-WEN-made Lowe's exclusive. 24-26 gauge steel, thin fiberglass. "Disposable" per contractor consensus. 5-8 year expected lifespan. Key targets: (1) Steel gauge, (2) Confirm JELD-WEN manufacturer, (3) Warranty terms, (4) Core insulation, (5) Hardware grade, (6) NFRC U-factor, (7) Delamination timeline.`,
  },
];

async function callPerplexity(productName, productContext, retryNum = 0) {
  const query = `PRODUCT: ${productName}\n\n${MASTER_TEMPLATE}\n\n${productContext}`;
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-deep-research',
        messages: [
          { role: 'system', content: 'You are a building product research analyst. Provide specific, verifiable data. Cite all sources.' },
          { role: 'user', content: query }
        ],
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${response.status}: ${text.substring(0, 200)}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      citations: data.citations || [],
      usage: data.usage,
    };
  } catch (err) {
    if (retryNum < 2) {
      console.log(`  Retry ${retryNum + 1}/2 after 30s...`);
      await new Promise(r => setTimeout(r, 30000));
      return callPerplexity(productName, productContext, retryNum + 1);
    }
    throw err;
  }
}

async function main() {
  console.log('Retrying 3 failed exterior door deep dives...\n');

  for (let i = 0; i < RETRY_PRODUCTS.length; i++) {
    const product = RETRY_PRODUCTS[i];
    console.log(`[${i + 1}/${RETRY_PRODUCTS.length}] ━━━ ${product.name} ━━━`);
    const startTime = Date.now();

    try {
      const result = await callPerplexity(product.name, product.context);
      const elapsed = Math.round((Date.now() - startTime) / 1000);

      let output = `# Exterior Doors — Deep Dive: ${product.name}\n`;
      output += `*Generated: ${new Date().toISOString()}*\n`;
      output += `*Model: ${result.model}*\n`;
      output += `*Response length: ${result.content.length} chars*\n`;
      output += `*Sources: ${result.citations.length}*\n`;
      output += `*Elapsed: ${elapsed}s*\n\n---\n\n`;
      output += result.content;
      
      if (result.citations.length > 0) {
        output += '\n\n---\n\n## Citations\n\n';
        result.citations.forEach((c, idx) => { output += `${idx + 1}. ${c}\n`; });
      }

      const filename = `exterior_doors_deep_dive_${product.slug}.md`;
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), output);
      console.log(`  ✓ ${result.content.length} chars, ${result.citations.length} sources, ${elapsed}s`);

      if (i < RETRY_PRODUCTS.length - 1) {
        console.log('  Waiting 20s...');
        await new Promise(r => setTimeout(r, 20000));
      }
    } catch (err) {
      console.error(`  ✗ Final error: ${err.message}`);
    }
  }

  console.log('\nRetry complete.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
