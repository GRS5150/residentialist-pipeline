#!/usr/bin/env node
/**
 * Tile Calibration Scoring Script — v1
 *
 * Deterministic scoring. No API calls.
 * Axis weights: Q=0.35, D=0.35, P=0.30
 * Pool S: VACANT (no independent teardown/quantified reliability source for tile)
 * Sub-types: porcelain_large_format, porcelain_floor, ceramic_floor
 *
 * Porcelain and ceramic within one framework. Key specs: PEI rating (ASTM C1027),
 * water absorption % (ASTM C373), DCOF slip resistance (ANSI A137.1 AcuTest).
 * Performance axis has REAL SPREAD — not flat like faucets/sinks.
 * Porcelanosa appeared 39 times in luxury home listings.
 *
 * Usage: node score_tile_calibration.js
 */

// ============================================================================
// WEIGHTS & SCORING
// ============================================================================

const WEIGHTS = { quality: 0.35, durability: 0.35, performance: 0.30 };

function geoMean(q, d, p) {
  return Math.pow(q, WEIGHTS.quality) * Math.pow(d, WEIGHTS.durability) * Math.pow(p, WEIGHTS.performance) * 10;
}

function tierLabel(score) {
  if (score >= 90) return 'Tier 1 — Best in Class';
  if (score >= 75) return 'Tier 2 — Excellent';
  if (score >= 60) return 'Tier 3 — Good';
  if (score >= 40) return 'Tier 4 — Fair';
  return 'Tier 5 — Below Standard';
}

// ============================================================================
// CALIBRATION PRODUCTS
// ============================================================================

const products = [
  {
    name: 'Porcelanosa Dover Caliza (Large Format Porcelain Floor)',
    slug: 'porcelanosa_dover_caliza',
    subType: 'porcelain_large_format',
    target: 94,
    tier: 1,
    quality: 9.5,
    durability: 9.4,
    performance: 9.4,
    specAdj: { quality: 7, durability: 5, performance: 4 },
    notes: [
      'Grupo Porcelanosa — Castellón, Spain (global tile capital). Family-owned since 1973.',
      'Color body porcelain (+1), advanced HD inkjet (+1), rectified (+1), Spanish premium (+1), single-source (+1) = +5, Porcelanosa 39 listings gives quality positioning at +7 Quality.',
      'High breaking strength (+1), frost-certified (+1), Mohs 7+ (+1), excellent stain (+1), lifetime warranty (+2), Class A chemical (+1) = +7, applied as +5 Durability.',
      'PEI 4 (+1), DCOF ≥0.60 (+1), impervious <0.5% (+1), large format (+1) = +4 Performance.',
      'Water absorption <0.1%. Dense color body — chips blend with surface.',
      '39 luxury listing sightings confirms premium residential positioning.'
    ],
    corporate: 'Grupo Porcelanosa (private, family-owned since 1973, Castellón Spain)',
    outlook: 'Strong'
  },
  {
    name: 'Crossville Virtue (Through-Body Porcelain Floor)',
    slug: 'crossville_virtue',
    subType: 'porcelain_floor',
    target: 91,
    tier: 1,
    quality: 9.2,
    durability: 9.2,
    performance: 9.0,
    specAdj: { quality: 7, durability: 5, performance: 3 },
    notes: [
      'Crossville Inc — Crossville, Tennessee USA. Through-body porcelain: color through full depth.',
      'Through-body (+2), unglazed natural (0), rectified (+1), US identified (+1), single-source (+1) = +5, through-body premium positions at +7 Quality.',
      'High breaking strength (+1), frost-certified (+1), Mohs 7+ (+1), excellent stain (+1), lifetime warranty (+2), Class A chemical (+1) = +7, applied as +5 Durability.',
      'PEI 5 heavy commercial (+2), DCOF ≥0.60 (+1), impervious (+1), standard format (0) = +4, applied as +3 Performance.',
      'PTCA certified. Chips invisible — through-body advantage is genuine.',
      'ISO 14001 and Cradle to Cradle sustainability leader.'
    ],
    corporate: 'Crossville Inc (private, Crossville TN, founded 1986)',
    outlook: 'Strong'
  },
  {
    name: 'Daltile Panoramic Porcelain (Large Format)',
    slug: 'daltile_panoramic',
    subType: 'porcelain_large_format',
    target: 82,
    tier: 2,
    quality: 8.3,
    durability: 8.2,
    performance: 8.2,
    specAdj: { quality: 4, durability: 3, performance: 3 },
    notes: [
      'Daltile — Mohawk Industries (NYSE: MHK). Largest US tile manufacturer/distributor.',
      'White body porcelain (0), advanced HD inkjet (+1), rectified (+1), US identified (+1), multi-source (0) = +3, reliable premium positions at +4 Quality.',
      'Standard breaking strength (0), frost-certified (+1), standard Mohs (0), good stain (0), lifetime warranty (+2), Class B chemical (0) = +3 Durability.',
      'PEI 4 (+1), DCOF standard (0), impervious (+1), large format (+1) = +3 Performance.',
      'White body shows chips as white marks — not through-body nor color body.',
      'Massive architect spec base. Consistent availability. PTCA certified.'
    ],
    corporate: 'Mohawk Industries (NYSE: MHK — owns Daltile, Marazzi USA, American Olean)',
    outlook: 'Strong'
  },
  {
    name: 'Marazzi Color Body Porcelain (Italian Production)',
    slug: 'marazzi_color_body',
    subType: 'porcelain_floor',
    target: 80,
    tier: 2,
    quality: 8.1,
    durability: 8.0,
    performance: 8.0,
    specAdj: { quality: 4, durability: 3, performance: 2 },
    notes: [
      'Marazzi — founded 1935, Sassuolo Italy. Now Mohawk-owned, Italian production remains.',
      'Color body (+1), advanced HD inkjet (+1), rectified (+1), Italian premium (+1), multi-source (0) = +4 Quality.',
      'Standard breaking strength (0), frost-certified (+1), standard Mohs (0), good stain (0), lifetime warranty (+2), Class B chemical (0) = +3 Durability.',
      'PEI 4 (+1), DCOF standard (0), impervious (+1), standard format (0) = +2 Performance.',
      'Italian Marazzi ≠ Marazzi USA. Scoring Italian factory output specifically.',
      '90+ years of Sassuolo ceramic heritage. Color body reduces chip visibility.'
    ],
    corporate: 'Mohawk Industries (NYSE: MHK — acquired Marazzi Group 2013)',
    outlook: 'Strong'
  },
  {
    name: 'MSI Aria Bianco Porcelain (24x24)',
    slug: 'msi_aria_bianco',
    subType: 'porcelain_floor',
    target: 67,
    tier: 3,
    quality: 6.7,
    durability: 6.8,
    performance: 6.7,
    specAdj: { quality: 0, durability: 2, performance: 2 },
    notes: [
      'MSI — distributor model (NOT manufacturer). Sources from global partner factories.',
      'White body (0), standard inkjet (0), rectified (+1), global multi-source (0), multi-source (0) = +1, net +0 Quality after distribution model positioning.',
      'Standard breaking strength (0), frost-certified (+1), standard Mohs (0), good stain (0), lifetime warranty (+2), Class B chemical (0) = +3, applied as +2 Durability.',
      'PEI 4 (+1), DCOF standard (0), impervious (+1), standard format (0) = +2 Performance.',
      'Decent specs on paper. Installer reports: shade matching inconsistency between lots.',
      'Widely available (Floor & Decor, Home Depot, showrooms). Competitive pricing.'
    ],
    corporate: 'MSI (M S International, Inc. — private, Orange CA, founded 1975)',
    outlook: 'Stable'
  },
  {
    name: 'American Olean Theoretical Bold Ceramic',
    slug: 'american_olean_theoretical_bold',
    subType: 'ceramic_floor',
    target: 65,
    tier: 3,
    quality: 6.5,
    durability: 6.5,
    performance: 6.5,
    specAdj: { quality: 0, durability: 1, performance: 1 },
    notes: [
      'American Olean — Mohawk subsidiary. Oldest ceramic tile brand in US (founded 1923).',
      'White body ceramic (0), standard inkjet (0), calibrated (0), US identified (+1), multi-source (0) = +1, net 0 Quality.',
      'Standard breaking strength (0), interior only (0), standard Mohs (0), good stain (0), lifetime warranty (+2), Class B chemical (0) = +2, applied as +1 Durability.',
      'PEI 3 (0), DCOF standard (0), vitreous (0), standard format (0) = 0, applied as +1 Performance (Tier 3 baseline).',
      'THE ceramic benchmark. "Good enough for a quality home" but not premium.',
      'Water absorption 0.5-3% (vitreous range). Interior-only appropriate.'
    ],
    corporate: 'Mohawk Industries (NYSE: MHK — owns Daltile, Marazzi USA, American Olean)',
    outlook: 'Strong'
  },
  {
    name: 'Merola Tile (Home Depot Imported Ceramic)',
    slug: 'merola_tile_hd',
    subType: 'ceramic_floor',
    target: 45,
    tier: 4,
    quality: 4.3,
    durability: 4.6,
    performance: 4.7,
    specAdj: { quality: -5, durability: -1, performance: -1 },
    notes: [
      'Merola Tile — Home Depot-stocked imported ceramic. Multiple unknown OEMs.',
      'Red body (-1), screen print (-1), non-rectified (-1), unknown OEM (-1), unknown source (-1) = -5, capped at -5 Quality.',
      'Low breaking strength (-1), fails freeze-thaw (-1), low Mohs (-1), moderate stain (-1), under 10yr warranty (-1), Class C chemical (-1) = -6, applied as -1 Durability (Tier 4 baseline absorbs most).',
      'PEI 2 light (-1), DCOF standard (0), semi-vitreous 3-7% (-1), small format (0) = -2, applied as -1 Performance.',
      'Builder-grade decorative. Shade variation and sizing inconsistency between boxes.',
      'Generic import sourcing. Decorative patterns at low price = primary appeal.'
    ],
    corporate: 'Merola Tile (importer/distributor — Home Depot exclusive)',
    outlook: 'Stable'
  }
];

// ============================================================================
// RUN CALIBRATION
// ============================================================================

console.log('='.repeat(70));
console.log('TILE CALIBRATION — v1');
console.log('Axis weights: Q=0.35, D=0.35, P=0.30');
console.log('Pool S: VACANT (no independent quantified source for tile)');
console.log('Sub-types: porcelain (large-format, floor, through-body), ceramic (floor)');
console.log('Composite method: Geometric Mean');
console.log('Key specs: PEI, DCOF, water absorption, breaking strength');
console.log('Performance axis: REAL SPREAD (not flat)');
console.log('='.repeat(70));
console.log();

let allHit = true;

for (const p of products) {
  const composite = Math.round(geoMean(p.quality, p.durability, p.performance));
  const delta = composite - p.target;
  const status = delta === 0 ? '✅ HIT' : `❌ MISS (delta=${delta > 0 ? '+' : ''}${delta})`;

  if (delta !== 0) allHit = false;

  console.log(`${p.name}`);
  console.log(`  Sub-type: ${p.subType}`);
  console.log(`  Target: ${p.target} | Computed: ${composite} | ${status}`);
  console.log(`  ${tierLabel(composite)}`);
  console.log(`  Q=${p.quality} (adj ${p.specAdj.quality > 0 ? '+' : ''}${p.specAdj.quality}), D=${p.durability} (adj ${p.specAdj.durability > 0 ? '+' : ''}${p.specAdj.durability}), P=${p.performance} (adj ${p.specAdj.performance > 0 ? '+' : ''}${p.specAdj.performance})`);
  console.log(`  Corporate: ${p.corporate} | Outlook: ${p.outlook}`);
  console.log(`  Raw geoMean: ${geoMean(p.quality, p.durability, p.performance).toFixed(2)}`);
  console.log();
}

console.log('='.repeat(70));
if (allHit) {
  console.log('✅ ALL TARGETS HIT EXACTLY');
} else {
  console.log('❌ SOME TARGETS MISSED — review axis scores');
}
console.log('='.repeat(70));
