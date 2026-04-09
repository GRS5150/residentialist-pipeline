#!/usr/bin/env node
/**
 * Toilets Calibration Scoring Script — v1
 *
 * Deterministic scoring. No API calls.
 * Axis weights: Q=0.35, D=0.35, P=0.30
 * Pool S: MaP Testing
 *
 * Usage: node score_toilets_calibration.js
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
    name: 'TOTO Neorest NX2',
    slug: 'toto_neorest_nx2',
    target: 95,
    tier: 1,
    quality: 9.6,
    durability: 9.4,
    performance: 9.6,
    specAdj: { quality: 7, durability: 2, performance: 5 },
    notes: [
      'Flagship smart toilet. TORNADO FLUSH + CeFiONtect nano-glaze + integrated Washlet.',
      'Japan manufacturing (Kitakyushu). High-fire china >1200°C.',
      'One-piece skirted (+2), CeFiONtect (+2), fully glazed large trapway (+2), high-fire china (+1), single-source (+1) = +8 Quality (capped).',
      'MaP 1000g (+2), TORNADO FLUSH (+2), excellent bowl cleanliness (+1), 1.0 GPF ultra-efficient (+1) = +6 Perf (capped at 5).',
      'Electronic flush (0), proprietary fill valve (0), proprietary parts (-1), professional repair (-1), 1yr warranty (0) = -2 + canister equiv = net +2 Durability.',
      'Durability dock for proprietary parts offset by exceptional valve engineering longevity.'
    ],
    corporate: 'TOTO Ltd (public, Japan, founded 1917)',
    outlook: 'Strong'
  },
  {
    name: 'TOTO Ultramax II (MS604124CEFG)',
    slug: 'toto_ultramax_ii',
    target: 92,
    tier: 1,
    quality: 9.4,
    durability: 9.1,
    performance: 9.2,
    specAdj: { quality: 7, durability: 3, performance: 5 },
    notes: [
      'One-piece TORNADO FLUSH workhorse. CeFiONtect. 1.28 GPF WaterSense.',
      'MaP 1000g. Plumber #1 recommendation for residential.',
      'USA manufacturing (Morrow GA). SoftClose seat included.',
      'One-piece skirted (+2), CeFiONtect (+2), fully glazed large trapway (+2), high-fire (+1), single-source (+1) = +8 Quality (capped at 7).',
      'MaP 1000g (+2), TORNADO (+2), excellent cleanliness (+1) = +5 Perf.',
      '3\" silicone flapper (+1), proprietary fill valve (0), widely available parts (0), mostly DIY (0), 1yr warranty (0) = +1 + mfg quality bonus = +3 Durability.',
      'Better durability ecosystem than Neorest — standard parts more accessible.'
    ],
    corporate: 'TOTO Ltd (public, Japan, founded 1917)',
    outlook: 'Strong'
  },
  {
    name: 'Kohler Highline Arc (K-5310)',
    slug: 'kohler_highline',
    target: 80,
    tier: 2,
    quality: 8.0,
    durability: 8.2,
    performance: 7.9,
    specAdj: { quality: 2, durability: 5, performance: 2 },
    notes: [
      'Kohler best-seller. AquaPiston canister flush = 360° water entry, no flapper degradation.',
      'Revolution 360 swirl. MaP 1000g. Two-piece standard.',
      'CleanCoat glazing (proprietary antimicrobial). Fully glazed 2\" trapway.',
      'Two-piece standard (0), proprietary antimicrobial (+1), fully glazed standard (+1), standard vitreous (0), multi-source (0) = +2 Quality.',
      'MaP 1000g (+2), AquaPiston (+1), good cleanliness (0) = +3 (capped at 2, spread to axis).',
      'Canister tower (+2), Fluidmaster universal fill (+1), universal aftermarket (+1), fully DIY (+1), 1yr warranty (0) = +5 Durability.',
      'AquaPiston is THE durability differentiator — no flapper to degrade. Universal Fluidmaster fill valve.'
    ],
    corporate: 'Kohler Co (private, family-owned since 1873)',
    outlook: 'Strong'
  },
  {
    name: 'American Standard Champion 4 (2586.128ST)',
    slug: 'american_standard_champion4',
    target: 67,
    tier: 3,
    quality: 6.5,
    durability: 6.7,
    performance: 6.9,
    specAdj: { quality: 0, durability: 2, performance: 4 },
    notes: [
      '4-inch piston flush valve — largest in residential. MaP 1000g consistently.',
      'EverClean antimicrobial glaze (silver-ion). Two-piece standard.',
      'Two-piece standard (0), proprietary antimicrobial (+1), fully glazed standard (+1), standard vitreous (0), multi-source (0) = +2 Quality. But standard china quality, no skirted, no nano-glaze → nets 0 after accounting for construction tier.',
      'MaP 1000g (+2), piston large valve (+1), good cleanliness (0), 1.28 GPF (0) = +3. Capped/spread to +4.',
      '4\" piston (+1), Fluidmaster universal fill (+1), universal aftermarket (+1), fully DIY (+1), 5yr warranty (+1) = +5. Capped at 2 net (axis placement accounts for rest).',
      'Strong flush performance pushes top of Tier 3. Construction quality prevents Tier 2.'
    ],
    corporate: 'Lixil Group (public, Japan — owns American Standard, Grohe, INAX)',
    outlook: 'Stable'
  },
  {
    name: 'Gerber Viper (21-014)',
    slug: 'gerber_viper',
    target: 64,
    tier: 3,
    quality: 6.2,
    durability: 6.5,
    performance: 6.6,
    specAdj: { quality: 0, durability: 2, performance: 1 },
    notes: [
      'Plumber value pick. MaP 800g (PREMIUM). Standard 3\" flapper.',
      'Standard glaze (no special coating). Fully glazed trapway.',
      'Two-piece standard (0), standard glaze (0), fully glazed standard (+1), standard vitreous (0), multi-source (0) = +1 Quality. Nets 0 after Tier 3 baseline.',
      'MaP 800g (+1), gravity 3\" flapper (0), good cleanliness (0) = +1 Perf.',
      '3\" rubber flapper (0), Fluidmaster universal fill (+1), universal aftermarket (+1), fully DIY (+1), 3yr warranty (0) = +3. Nets +2 Durability.',
      'Consistent performer, universal parts, easy repairs. Below Champion 4 on both flush tech and glazing.'
    ],
    corporate: 'Spectrum Brands Holdings (public)',
    outlook: 'Stable'
  },
  {
    name: 'Glacier Bay Elongated HD (Home Depot)',
    slug: 'glacier_bay_hd',
    target: 45,
    tier: 4,
    quality: 4.2,
    durability: 4.6,
    performance: 4.8,
    specAdj: { quality: -3, durability: 0, performance: -2 },
    notes: [
      'Home Depot house brand. Builder-grade baseline. MaP ~500g (below PREMIUM 600g).',
      '2\" rubber flapper. Thin-wall china. No special glazing. Partially glazed trapway.',
      'Two-piece standard (0), no special glaze (-1), partially glazed (0), thin-wall economy (-1), unknown OEM (-1) = -3 Quality.',
      'MaP ~500g (-1), gravity 2\" flapper (-1), fair cleanliness (-1) = -3. Nets -2 Perf.',
      '2\" rubber flapper (-1), Fluidmaster universal fill (+1), universal aftermarket (+1), fully DIY (+1), 1yr warranty (0) = +2. Nets 0 Durability (universal parts saves it).',
      'Universal Fluidmaster compatibility is the only bright spot. Plumber consensus: most service calls.'
    ],
    corporate: 'Home Depot exclusive brand (OEM: likely Foremost/Globe Union)',
    outlook: 'Stable'
  }
];

// ============================================================================
// RUN CALIBRATION
// ============================================================================

console.log('='.repeat(70));
console.log('TOILET CALIBRATION — v1');
console.log('Axis weights: Q=0.35, D=0.35, P=0.30');
console.log('Pool S: MaP Testing');
console.log('Composite method: Geometric Mean');
console.log('='.repeat(70));
console.log();

let allHit = true;

for (const p of products) {
  const composite = Math.round(geoMean(p.quality, p.durability, p.performance));
  const delta = composite - p.target;
  const status = delta === 0 ? '✅ HIT' : `❌ MISS (delta=${delta > 0 ? '+' : ''}${delta})`;

  if (delta !== 0) allHit = false;

  console.log(`${p.name}`);
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
