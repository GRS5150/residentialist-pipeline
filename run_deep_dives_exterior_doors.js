#!/usr/bin/env node
/**
 * Exterior Doors — Batch Deep Dive Runner
 * Runs 7 calibration products through Perplexity sonar-deep-research
 * Saves raw outputs to knowledge/exterior_doors/
 * 
 * Usage: cd /Users/Residentialist/.openclaw/workspace/residentialist
 *        export PERPLEXITY_API_KEY=$(grep PERPLEXITY_API_KEY .env | cut -d= -f2)
 *        /usr/local/bin/node run_deep_dives_exterior_doors.js
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = __dirname;
const OUTPUT_DIR = path.join(WORKSPACE, 'knowledge', 'exterior_doors');
const ENV_PATH = path.join(WORKSPACE, '.env');

// Load API key from .env
function loadApiKey() {
  if (process.env.PERPLEXITY_API_KEY) return process.env.PERPLEXITY_API_KEY;
  if (fs.existsSync(ENV_PATH)) {
    const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
    const match = envContent.match(/PERPLEXITY_API_KEY=(.+)/);
    if (match) return match[1].trim();
  }
  throw new Error('PERPLEXITY_API_KEY not found in environment or .env');
}

const API_KEY = loadApiKey();

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ─── Master Template ─────────────────────────────────────────────────────────

const MASTER_TEMPLATE = `I'm building an independent product intelligence platform that scores residential exterior entry doors on Quality (0.40 weight), Durability (0.35), and Performance (0.25). I need a forensic analysis of this specific product — not generic brand information, not marketing copy. I need the specific components, suppliers, test results, and field performance data.

SLAB CONSTRUCTION & CORE:
- What is the exact slab construction? (compression-molded fiberglass, solid wood species, engineered laminated wood, steel with specific gauge?)
- If fiberglass: who manufactures the fiberglass skin? Skin thickness?
- If steel: what gauge? (16, 18, 20, 22, 24, 26 gauge?) Galvanized? Powder-coated?
- If wood: what species? Solid or engineered? Treated?
- What is the core insulation material? Polyurethane foam or polystyrene? Specific R-value?
- Is the slab manufactured in-house or sourced?

WEATHERSEALING SYSTEM:
- What weatherstripping system? (multi-layer adjustable compression, standard compression kerf, foam/magnetic?)
- Weatherstripping supplier (Schlegel/Quanex or other)?
- What threshold/sill system? (Endura Z-Series adjustable, standard aluminum, composite?)
- Corner pad specifications and expected lifespan?
- Field-replaceable using standard kerf or proprietary?
- NFRC-certified air infiltration rate (ASTM E283, cfm/sq ft)?

HARDWARE & LOCKING:
- Multipoint lock or single deadbolt standard?
- If multipoint: supplier? (GU-Gretsch-Unitas, Winkhaus, Hoppe?)
- Hinge specification: ANSI/BHMA A156.1 Grade 1, 2, or 3? Stainless or plain steel?
- Handleset construction (forged brass/bronze vs zinc die-cast)?

GLASS & GLAZING:
- Internally or externally glazed?
- Glass panel supplier (ODL, Western Reflections, in-house)?
- Low-E standard or optional? Double or triple pane?
- NFRC-certified U-factor with glass?

ENERGY PERFORMANCE:
- NFRC-certified U-factor for complete assembly?
- ENERGY STAR certified?
- ASTM E283 air infiltration test results?
- Design pressure (DP) rating?
- Impact rated (Florida Building Code, Miami-Dade)?

DURABILITY:
- Expected lifespan per professionals?
- Rot/delamination/warp issues documented?
- Finish type and durability?
- Re-stain/seal interval for wood?

WARRANTY & SERVICE:
- Full warranty terms?
- Transferable?
- Glass, hardware, finish warranty details?
- Who backs the warranty? Financial stability?

PARTS & SERVICEABILITY:
- Replacement parts availability (dealer, manufacturer, big-box)?
- Field-replaceable weatherstripping?
- Parts available at 10+ years?
- Dealer vs big-box channel product?

MANUFACTURING & CORPORATE:
- Manufacturing location?
- Parent company?
- Platform sharing with sibling brands?

PROFESSIONAL OPINION:
- What do professional installers say about this specific door?
- Would pros install in quality homes ($750K+)?
- Callback/service call rate?
- Biggest complaint?

Focus on GBA, FHB, r/Carpentry, Consumer Reports, NFRC database, manufacturer spec sheets. Cite all sources.`;

// ─── Product-Specific Context ─────────────────────────────────────────────────

const PRODUCTS = [
  {
    name: 'Marvin Signature Ultimate Entry Door',
    slug: 'marvin_ultimate_entry',
    context: `Product-specific context: Marvin's top-of-line entry door. Architect default for $2-5M homes. Engineered laminated wood/hybrid slabs. Premium factory-integrated hardware with multipoint lock standard. Lifetime warranty backed by Fortune Brands (NYSE: FBIN). Warroad, MN manufacturing. Key targets: (1) Confirm engineered laminated vs solid wood, (2) Multipoint lock supplier (GU, Winkhaus, Hoppe?), (3) NFRC U-factor, (4) Hinge grade and material, (5) Glass supplier, (6) Air infiltration results.`,
  },
  {
    name: 'Therma-Tru Classic-Craft Premium (Fiberglass)',
    slug: 'thermatru_classiccraft',
    context: `Product-specific context: AccuGrain compression-molded fiberglass — most realistic wood grain. Rot-proof slab. Polyurethane foam core (R-5+, U-factor as low as 0.14). Multi-point lock standard. 50-year/lifetime warranty. Fortune Brands parent. Butler, IN. Key targets: (1) AccuGrain skin thickness vs Benchmark, (2) Foam density and R-value, (3) Multipoint lock supplier, (4) NFRC U-factor for solid panel and lite configs, (5) Weatherstripping supplier, (6) DP rating.`,
  },
  {
    name: 'Pella Reserve Entry Door',
    slug: 'pella_reserve_entry',
    context: `Product-specific context: Pella's premium entry. #1 consumer trust (LifeStory 2026). Wood/fiberglass hybrid. R6+ rated. Family-owned (Pella Corp, founded 1925). Reserve is top line — 250 Series is builder grade (different product). Key targets: (1) Slab construction, (2) Hardware — multipoint or single deadbolt?, (3) NFRC U-factor, (4) Glass supplier, (5) What separates Reserve from 250 at component level?, (6) DP rating.`,
  },
  {
    name: 'Therma-Tru Benchmark Entry (Fiberglass)',
    slug: 'thermatru_benchmark',
    context: `Product-specific context: Builder line of Therma-Tru, NOT Classic-Craft. Thinner compression molding, less realistic grain. Fortune Brands backing. Available through dealers and some big-box. Professional quality floor. Key targets: (1) Slab thickness vs Classic-Craft, (2) Hardware grade, (3) Weatherstripping — same as Classic-Craft?, (4) NFRC U-factor, (5) Delamination rate, (6) DP rating, (7) Big-box vs dealer spec differences?`,
  },
  {
    name: 'Masonite Performance Door System (Fiberglass)',
    slug: 'masonite_performance',
    context: `Product-specific context: Masonite's premium entry. Masonite International (TSX: MAS). Innovative weatherstripping. Comparable to Therma-Tru Benchmark. Solidoor is below Performance. Key targets: (1) Slab construction, (2) Weatherstripping specifics, (3) Core insulation and R-value, (4) NFRC U-factor, (5) Hardware spec, (6) Warranty terms for Performance line.`,
  },
  {
    name: 'JELD-WEN Builders Series (Steel/Fiberglass)',
    slug: 'jeldwen_builders',
    context: `Product-specific context: Builder-grade. Both steel and fiberglass. AuraLast controversy (windows primarily). JELD-WEN (NYSE: JELD). Big-box and builder channel. Key targets: (1) Steel gauge (22 or 24?), (2) Core insulation, (3) Weatherstripping, (4) Hardware grade, (5) NFRC U-factor, (6) Manufacturing location (US vs Mexico?), (7) AuraLast — does it apply to doors?, (8) Builders Series vs Siteline spec differences.`,
  },
  {
    name: 'Reliabilt Entry Door (Lowe\'s)',
    slug: 'reliabilt_entry',
    context: `Product-specific context: JELD-WEN-made Lowe's exclusive. 24-26 gauge steel, thin fiberglass. "Disposable" per contractor consensus. 5-8 year expected lifespan. 50%+ service calls. Key targets: (1) Steel gauge, (2) JELD-WEN confirmed manufacturer?, (3) Warranty terms, (4) Core insulation, (5) Hardware grade, (6) Weatherstrip replaceability, (7) NFRC U-factor if available, (8) Fiberglass delamination timeline.`,
  },
];

// ─── Perplexity API Call ─────────────────────────────────────────────────────

async function callPerplexity(productName, productContext) {
  const query = `PRODUCT: ${productName}\n\n${MASTER_TEMPLATE}\n\n${productContext}`;
  
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-deep-research',
      messages: [
        {
          role: 'system',
          content: 'You are a building product research analyst. Provide specific, verifiable data. Name component suppliers, cite test results, quote professionals. Never fabricate data — if you cannot find specific information, say so explicitly.'
        },
        {
          role: 'user',
          content: query,
        }
      ],
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
    citations: data.citations || [],
    usage: data.usage,
  };
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Exterior Doors — Batch Deep Dive Runner');
  console.log(`Processing ${PRODUCTS.length} products via Perplexity sonar-deep-research`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  const results = [];
  
  for (let i = 0; i < PRODUCTS.length; i++) {
    const product = PRODUCTS[i];
    console.log(`\n[${ i + 1}/${PRODUCTS.length}] ━━━ ${product.name} ━━━`);
    const startTime = Date.now();

    try {
      const result = await callPerplexity(product.name, product.context);
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      
      // Build markdown output
      let output = `# Exterior Doors — Deep Dive: ${product.name}\n`;
      output += `*Generated: ${new Date().toISOString()}*\n`;
      output += `*Model: ${result.model}*\n`;
      output += `*Query length: ${product.context.length} chars*\n`;
      output += `*Response length: ${result.content.length} chars*\n`;
      output += `*Sources: ${result.citations.length}*\n`;
      output += `*Elapsed: ${elapsed}s*\n\n---\n\n`;
      output += result.content;
      
      if (result.citations.length > 0) {
        output += '\n\n---\n\n## Citations\n\n';
        result.citations.forEach((c, idx) => {
          output += `${idx + 1}. ${c}\n`;
        });
      }

      const filename = `exterior_doors_deep_dive_${product.slug}.md`;
      const filepath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(filepath, output);
      
      console.log(`  ✓ ${result.content.length} chars, ${result.citations.length} sources, ${elapsed}s`);
      console.log(`  Saved: ${filename}`);
      
      results.push({
        name: product.name,
        slug: product.slug,
        chars: result.content.length,
        sources: result.citations.length,
        elapsed,
        status: 'success',
      });

      // Rate limit: wait 15s between products
      if (i < PRODUCTS.length - 1) {
        console.log('  Waiting 15s...');
        await new Promise(r => setTimeout(r, 15000));
      }

    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
      results.push({
        name: product.name,
        slug: product.slug,
        error: err.message,
        status: 'failed',
      });
      
      // Wait before retry
      if (i < PRODUCTS.length - 1) {
        console.log('  Waiting 30s after error...');
        await new Promise(r => setTimeout(r, 30000));
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  
  const successes = results.filter(r => r.status === 'success');
  const failures = results.filter(r => r.status === 'failed');
  
  console.log(`Completed: ${successes.length}/${PRODUCTS.length}`);
  if (failures.length > 0) {
    console.log(`Failed: ${failures.map(f => f.name).join(', ')}`);
  }
  
  for (const r of successes) {
    console.log(`  ✓ ${r.name.padEnd(50)} ${r.chars} chars, ${r.sources} sources, ${r.elapsed}s`);
  }
  
  console.log('\nDone.');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
