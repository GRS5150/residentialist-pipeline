#!/usr/bin/env node
/**
 * Sinks Calibration Scoring Script — v1
 *
 * Deterministic scoring. No API calls.
 * Axis weights: Q=0.45, D=0.45, P=0.10
 * Pool S: VACANT (no independent teardown/quantified reliability source for sinks)
 * Sub-types: kitchen_fireclay, kitchen_cast_iron, kitchen_composite, kitchen_stainless,
 *            bathroom_vitreous_china, bathroom_fireclay
 *
 * Shares methodology with faucets — Performance flat (P=0.10), material quality drives the score.
 * Kohler appeared 187 times in luxury home listings.
 *
 * Usage: node score_sinks_calibration.js
 */

// ============================================================================
// WEIGHTS & SCORING
// ============================================================================

const WEIGHTS = { quality: 0.45, durability: 0.45, performance: 0.10 };

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
    name: 'Rohl Shaws Original Lancaster Fireclay Farmhouse (RC3618)',
    slug: 'rohl_shaws_rc3618',
    subType: 'kitchen_fireclay',
    target: 94,
    tier: 1,
    quality: 9.5,
    durability: 9.5,
    performance: 9.0,
    specAdj: { quality: 8, durability: 5, performance: 1 },
    notes: [
      'Handcrafted English fireclay — Darwen Lancashire, kiln-fired at 2100°F+.',
      'Each individually formed — artisanal quality, slight variations are authenticity.',
      'Fireclay handcrafted (+2), handcrafted individual (+2), standard glaze (0), N/A mass body (+1), apron-front (+1), single-source England (+1) = +7, capped at 8 Quality.',
      'Lifetime 50+ years (+2), good chip resistance (0), non-porous (+1), extreme heat (+1), lifetime warranty (+2), brand-specific parts (0) = +6, applied as +5 Durability.',
      'Standard center drain (0), deep basin (+1), no workstation (0) = +1 Performance.',
      'Flat bottom is a known trade-off — some pooling vs superior aesthetic.'
    ],
    corporate: 'Fortune Brands Innovations (NYSE: FBIN — Rohl, Moen, Perrin & Rowe)',
    outlook: 'Strong'
  },
  {
    name: 'Kohler Whitehaven Self-Trimming Cast Iron (K-6489)',
    slug: 'kohler_whitehaven_k6489',
    subType: 'kitchen_cast_iron',
    target: 91,
    tier: 1,
    quality: 9.2,
    durability: 9.1,
    performance: 8.8,
    specAdj: { quality: 7, durability: 6, performance: 1 },
    notes: [
      'Cast iron with proprietary Kohler porcelain enamel — industry benchmark glaze.',
      'Self-trimming apron-front simplifies installation vs traditional fireclay.',
      'Cast iron enamel (+2), drawn/pressed (0), proprietary enamel premium (+2), N/A mass body (+1), apron-front (+1), single-source Kohler WI (+1) = +7 Quality.',
      'Lifetime 50+ years (+2), good chip resistance (0), non-porous (+1), extreme heat (+1), lifetime warranty (+2), universal parts (+1) = +7, applied as +6 Durability.',
      'Sloped bottom rear drain (+1), deep basin (+1), no workstation (0) = +2, applied as +1 Performance.',
      '187 Kohler sightings in luxury listings. Self-trimming hides rough cabinet cuts.'
    ],
    corporate: 'Kohler Co (private, family-owned since 1873, Kohler WI)',
    outlook: 'Strong'
  },
  {
    name: 'Blanco IKON 33 Silgranit Composite Apron Front (401734)',
    slug: 'blanco_ikon_33',
    subType: 'kitchen_composite',
    target: 83,
    tier: 2,
    quality: 8.4,
    durability: 8.4,
    performance: 7.5,
    specAdj: { quality: 4, durability: 4, performance: 1 },
    notes: [
      'Patented Silgranit II — 80% granite + acrylic resin, 35+ patents.',
      'First composite apron-front sink on market. German engineering (Oberderdingen HQ).',
      'Composite premium (+1), drawn/pressed (0), patented composite (+1), N/A mass body (+1), apron-front (+1), multi-source (0) = +4 Quality.',
      'Long-term 25-50yr (+1), excellent chip resistance (+1), non-porous (+1), good heat 536°F (+0), lifetime warranty (+2), brand-specific parts (0) = +5, applied as +4 Durability.',
      'Standard center drain (0), deep basin (+1), no workstation (0) = +1 Performance.',
      'Heat rated to 536°F (280°C). Metal transfer marks are cosmetic, removable.'
    ],
    corporate: 'BLANC & FISCHER Family Holding (private, German family-owned since 1925)',
    outlook: 'Strong'
  },
  {
    name: 'Kohler Cairn Neoroc Composite Undermount (K-8206)',
    slug: 'kohler_cairn_k8206',
    subType: 'kitchen_composite',
    target: 80,
    tier: 2,
    quality: 8.1,
    durability: 8.1,
    performance: 7.5,
    specAdj: { quality: 3, durability: 3, performance: 1 },
    notes: [
      'Kohler\'s Neoroc proprietary composite. Matte finish, rock-hard surface.',
      'Kohler engineering applied to composite — precise drainage slope.',
      'Composite premium (+1), drawn/pressed (0), patented composite (+1), N/A mass body (+1), undermount (0), multi-source (0) = +3 Quality.',
      'Long-term 25-50yr (+1), excellent chip resistance (+1), non-porous (+1), good heat (+0), lifetime warranty (+2), universal parts (+1) = +6, applied as +3 Durability.',
      'Sloped bottom (+1), standard basin (0), no workstation (0) = +1 Performance.',
      'Newer formula than Silgranit — less long-term field data. Kohler ecosystem compensates.'
    ],
    corporate: 'Kohler Co (private, family-owned since 1873, Kohler WI)',
    outlook: 'Strong'
  },
  {
    name: 'Kraus Standart PRO 16-Gauge Stainless Undermount (KHU100-30)',
    slug: 'kraus_standart_pro_30',
    subType: 'kitchen_stainless',
    target: 68,
    tier: 3,
    quality: 6.7,
    durability: 6.9,
    performance: 6.8,
    specAdj: { quality: 2, durability: 2, performance: 1 },
    notes: [
      'Real 16-gauge T-304 stainless (TRU16 certified). Best value stainless.',
      'NoiseDefend sound deadening (80%+ coverage). Commercial satin finish.',
      '16-gauge T-304 (+1), tight-radius welded (+1), satin commercial (0), full sound deadening (+1), undermount (0), multi-source (0) = +3, applied as +2 Quality.',
      'Long-term 25-50yr (+1), excellent inherent chip resistance (+1), non-porous (+1), extreme heat (+1), lifetime warranty (+2), universal parts (+1) = +7, applied as +2 Durability (Tier 3 baseline absorbs material advantage).',
      'Sloped drain (+1), deep basin (+1), accessory compatible (0) = +2, applied as +1 Performance.',
      'Plumber consensus: solid value, thick steel, well-engineered drain slope.'
    ],
    corporate: 'Kraus USA (private, Port Washington NY)',
    outlook: 'Stable'
  },
  {
    name: 'Kohler Caxton Oval Undermount Bathroom (K-2210)',
    slug: 'kohler_caxton_k2210',
    subType: 'bathroom_vitreous_china',
    target: 68,
    tier: 3,
    quality: 6.8,
    durability: 6.8,
    performance: 6.8,
    specAdj: { quality: 1, durability: 2, performance: 0 },
    notes: [
      'Kohler\'s most popular bathroom undermount. THE bathroom sink benchmark.',
      'Standard vitreous china — consistent quality, tight tolerances.',
      'Vitreous china standard (0), drawn/pressed (0), standard glaze (0), N/A mass body (+1), undermount (0), multi-source (0) = +1 Quality.',
      'Long-term 25-50yr (+1), good chip resistance (0), non-porous (+1), good heat (0), lifetime warranty (+2), universal parts (+1) = +5, applied as +2 Durability.',
      'Standard center drain (0), standard basin (0), no workstation (0) = 0 Performance.',
      'Bathroom Performance axis is essentially flat. All bathroom sinks drain water adequately.'
    ],
    corporate: 'Kohler Co (private, family-owned since 1873, Kohler WI)',
    outlook: 'Strong'
  },
  {
    name: 'Glacier Bay All-in-One Drop-In Stainless (VT3322A08)',
    slug: 'glacier_bay_dropin',
    subType: 'kitchen_stainless',
    target: 45,
    tier: 4,
    quality: 4.2,
    durability: 4.7,
    performance: 4.8,
    specAdj: { quality: -5, durability: -1, performance: -1 },
    notes: [
      'Home Depot house brand. Builder-grade baseline. 22-gauge stainless.',
      'No sound deadening. Stamped. Drop-in. Unknown OEM.',
      '22-gauge (-2), stamped (-1), basic finish (-1), no sound deadening (-2), drop-in (-1), unknown OEM (-1) = -8, capped at -5 Quality.',
      'Short-term <15yr (-1), poor chip resistance (-1), susceptible stains (-1), extreme heat SS (+1), under 10yr warranty (-1), universal parts (+1) = -2, applied as -1 Durability.',
      'Flat bottom poor drainage (-1), standard basin (0), no workstation (0) = -1 Performance.',
      'Universal Fluidmaster-compatible parts is the only bright spot. Most service callbacks.'
    ],
    corporate: 'Home Depot exclusive brand (OEM: likely Globe Union/Foremost)',
    outlook: 'Stable'
  }
];

// ============================================================================
// RUN CALIBRATION
// ============================================================================

console.log('='.repeat(70));
console.log('SINK CALIBRATION — v1');
console.log('Axis weights: Q=0.45, D=0.45, P=0.10');
console.log('Pool S: VACANT (no independent quantified source for sinks)');
console.log('Sub-types: fireclay, cast iron, composite, stainless, vitreous china');
console.log('Composite method: Geometric Mean');
console.log('Methodology: Shares with faucets — Performance flat, material quality drives score');
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
