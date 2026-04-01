#!/usr/bin/env node
/**
 * Enrich HVAC curation files with `sources` array, `outlook`, `bottom_line`,
 * and `platform_disclosure` fields needed by run_investigator.js
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'curation_files');

const ENRICHMENTS = {
  carrier_infinity: {
    outlook: 'Strong',
    outlook_rationale: 'Carrier Global (NYSE: CARR) is Fortune 500, publicly traded since 2020 UTC spinoff. Dominant residential HVAC brand. Strong corporate backing.',
    platform_disclosure: 'Bryant Evolution 180B shares same compressor and board platform as Carrier Infinity. Different thermostat software, different badge, different dealer network. Report must disclose this per Rule 19.',
    bottom_line: 'Top-tier variable-speed split system. Copeland inverter compressor, 24 SEER2, WeatherArmor cabinet. Moderate proprietary lock-in via Infinity communicating system. Best balance of performance, durability, and serviceability in the premium tier.',
    sources: [
      { id: 'S1', pool: 'A', column: 'quality', classification: 'score', source_name: 'carrier.com', snippet: 'Copeland variable-speed scroll compressor (ZPD series). Greenspeed Intelligence — 25-100% continuous capacity modulation. True DC inverter.' },
      { id: 'S2', pool: 'A', column: 'quality', classification: 'score', source_name: 'carrier.com', snippet: 'WeatherArmor Ultra protection. Heavy gauge galvanized cabinet with louvered coil guard. Traditional copper/aluminum condenser coil (not microchannel on Infinity).' },
      { id: 'S3', pool: 'A', column: 'performance', classification: 'score', source_name: 'carrier.com / AHRI Directory', snippet: 'SEER2 up to 24.0. HSPF2 up to 10.0. Sound as low as 56-58 dBA. ENERGY STAR Most Efficient eligible.' },
      { id: 'S4', pool: 'B', column: 'durability', classification: 'score', source_name: 'r/HVAC contractor consensus', snippet: '10-year compressor warranty (registered). 10-year parts. Carrier Enterprise distribution — some captive pricing. Infinity communicating system requires proprietary thermostat for full features.' },
      { id: 'S5', pool: 'B', column: 'quality', classification: 'score', source_name: 'r/HVAC', snippet: 'Electronic Expansion Valve (EEV). Variable-speed BLDC condenser fan motor. Collierville, TN manufacturing traced.' },
      { id: 'S6', pool: 'B', column: 'durability', classification: 'report_only', source_name: 'r/HVAC', snippet: 'Bryant Evolution 180B = same compressor and board as Carrier Infinity. Different thermostat ecosystem. Carrier Enterprise vs independent dealer distribution.' },
      { id: 'S7', pool: 'A', column: 'quality', classification: 'report_only', source_name: 'copeland.com', snippet: 'Copeland ZPD-series scroll manufactured Sidney, OH. Compressor OEM identified and traceable.' },
    ],
  },

  trane_xv: {
    outlook: 'Strong',
    outlook_rationale: 'Trane Technologies (formerly Ingersoll Rand) publicly traded. Premium HVAC brand with strong contractor loyalty. Also owns American Standard.',
    platform_disclosure: 'American Standard AccuComfort is under same parent (Trane Technologies) but is a different product tier with different component selection — NOT badge-engineered.',
    bottom_line: 'Durability champion of premium HVAC. 12-year compressor warranty (best in category). Spine Fin coil inherently corrosion-resistant. Most forgiving of installation quality. SEER2 22.0 trails Carrier (24) and Lennox (28) on paper, but robust build quality and proven reliability earn it Tier 1.',
    sources: [
      { id: 'S1', pool: 'A', column: 'quality', classification: 'score', source_name: 'trane.com', snippet: 'TruComfort variable-speed technology. Copeland variable-speed scroll compressor. 25-100% continuous modulation.' },
      { id: 'S2', pool: 'A', column: 'quality', classification: 'score', source_name: 'trane.com', snippet: 'Proprietary Spine Fin condenser coil — not traditional copper/aluminum flat-fin, not microchannel. Spiny aluminum fins wrapped around copper tubing. Inherently more corrosion-resistant.' },
      { id: 'S3', pool: 'A', column: 'performance', classification: 'score', source_name: 'trane.com / AHRI', snippet: 'SEER2 up to 22.0. HSPF2 up to 10.0. Sound 60 dBA. ENERGY STAR certified.' },
      { id: 'S4', pool: 'B', column: 'durability', classification: 'score', source_name: 'r/HVAC', snippet: '12-year compressor warranty (registered) — strongest in category. Most forgiving unit of installation quality. Contractors cite fewest long-term issues. Tyler, TX manufacturing.' },
      { id: 'S5', pool: 'B', column: 'durability', classification: 'score', source_name: 'r/HVAC', snippet: 'ComfortLink II communicating system. Spine Fin coil requires proprietary Trane replacement — not universal. Trane Supply + independent parts availability.' },
    ],
  },

  lennox_sl28xcv: {
    outlook: 'Strong',
    outlook_rationale: 'Lennox International Inc. (NYSE: LII) publicly traded. Profitable HVAC manufacturer. No badge-engineering. Proprietary ecosystem strategy is intentional, not a weakness.',
    platform_disclosure: 'Lennox does NOT badge-engineer. Owns Armstrong (air handlers) — some internal component sharing within Lennox divisions only.',
    bottom_line: 'The Lennox Paradox: Best-on-paper specs in the entire ducted split system category (28 SEER2, 56 dB) but worst total cost of ownership in service years. Parts 15-20% more expensive, Lennox-only distribution, warranty claims rated most difficult. This is what drops it from Tier 1 to Tier 2. For buyers prioritizing energy bills over service cost, it is unmatched.',
    sources: [
      { id: 'S1', pool: 'A', column: 'performance', classification: 'score', source_name: 'lennox.com / AHRI', snippet: 'SEER2 up to 28.0 — HIGHEST of any ducted residential split system. HSPF2 up to 10.5. Sound as low as 56 dB (SilentComfort). ENERGY STAR Most Efficient.' },
      { id: 'S2', pool: 'A', column: 'quality', classification: 'score', source_name: 'lennox.com', snippet: 'Copeland variable-speed scroll compressor. EEV electronic expansion. Variable-speed BLDC condenser fan motor. SilentComfort noise isolation technology.' },
      { id: 'S3', pool: 'B', column: 'durability', classification: 'score', source_name: 'r/HVAC / HVAC-Talk', snippet: 'PROPRIETARY ECOSYSTEM: Parts 15-20% more expensive. Lennox-authorized distributors only. Longer lead times for coils, boards. Warranty claims rated most difficult by contractor consensus.' },
      { id: 'S4', pool: 'B', column: 'durability', classification: 'score', source_name: 'r/HVAC', snippet: 'iComfort communicating system locks buyer into Lennox thermostat ecosystem. Proprietary diagnostic requirements. Standard 24V thermostat works with adapter but loses significant features.' },
      { id: 'S5', pool: 'B', column: 'quality', classification: 'score', source_name: 'r/HVAC', snippet: 'Best product with worst servicing economics. Contractors reconcile: recommend for long-term homeowners prioritizing energy bills, steer away for service-cost-conscious.' },
    ],
  },

  rheem_prestige: {
    outlook: 'Stable',
    outlook_rationale: 'Rheem Manufacturing is privately held subsidiary of Paloma Industries (Japan). Stable, mature brand. Not publicly traded. Low corporate risk.',
    platform_disclosure: 'Rheem/Ruud are same unit, different distribution channel. Ruud = wholesale/supply-house. Identical components. Report must note.',
    bottom_line: 'The Toyota Camry of HVAC — not exciting but reliable. Best-in-class warranty claim process. Open parts ecosystem (any supply house). Any contractor can service. Represents the floor for a quality home. Two-stage Copeland — proven technology. 19 SEER2 is adequate but not impressive.',
    sources: [
      { id: 'S1', pool: 'A', column: 'quality', classification: 'score', source_name: 'rheem.com', snippet: 'Copeland two-stage scroll compressor. 67%/100% capacity. TXV expansion. ECM condenser fan motor. Standard galvanized cabinet.' },
      { id: 'S2', pool: 'A', column: 'performance', classification: 'score', source_name: 'rheem.com', snippet: 'SEER2 19.0. HSPF2 9.0. Sound 65 dBA. ENERGY STAR certified. Two-stage provides better dehumidification than single-stage.' },
      { id: 'S3', pool: 'B', column: 'durability', classification: 'score', source_name: 'r/HVAC', snippet: 'Warranty claim process rated easiest/most contractor-friendly among all brands. 10yr compressor + 10yr parts (registered). Universal parts availability. Any contractor can service.' },
      { id: 'S4', pool: 'B', column: 'quality', classification: 'score', source_name: 'r/HVAC', snippet: 'Non-communicating — standard 24V thermostat. No proprietary lock-in. Prestige line meaningfully outperforms Rheem Classic (different components, not just badge engineering).' },
      { id: 'S5', pool: 'B', column: 'durability', classification: 'report_only', source_name: 'r/HVAC', snippet: 'Ruud = identical unit, wholesale distribution. Fort Smith, AR manufacturing. Paloma Industries (Japan) parent.' },
    ],
  },

  goodman_gsxc18: {
    outlook: 'Strong',
    outlook_rationale: 'Daikin Industries (Japan) is world\'s largest HVAC manufacturer. Goodman acquisition in 2012 brought significant quality improvement. Strong corporate backing.',
    platform_disclosure: 'Amana HVAC = rebadged Goodman with enhanced warranty marketing. Same compressor, coil, cabinet. Daikin Fit/DX is SEPARATE platform — different compressor, different architecture.',
    bottom_line: 'Daikin-backed two-stage with lifetime compressor warranty and widest parts availability. Post-Daikin quality meaningfully improved. Copeland scroll, TXV, ECM fan. Non-communicating = zero brand lock-in. Builder-grade stigma persists but current units are genuinely solid. Represents strong value in mid-tier.',
    sources: [
      { id: 'S1', pool: 'A', column: 'quality', classification: 'score', source_name: 'goodmanmfg.com / deep dive', snippet: 'Copeland two-stage scroll compressor (ZP/ZPK series). Single compressor + solenoid valve = two-stage. TXV expansion. ECM condenser fan. 22-26 gauge cabinet.' },
      { id: 'S2', pool: 'A', column: 'performance', classification: 'score', source_name: 'goodmanmfg.com', snippet: 'SEER2 18.0. HSPF2 8.5. Sound 68 dBA. ENERGY STAR certified. 67%/100% two-stage modulation.' },
      { id: 'S3', pool: 'B', column: 'durability', classification: 'score', source_name: 'deep dive / r/HVAC', snippet: 'Lifetime compressor warranty (registered) — genuinely claimable post-Daikin. Goodman replaces compressor, buyer pays labor + refrigerant. Widest parts in industry: GEMAIRE, Ferguson, Johnstone.' },
      { id: 'S4', pool: 'B', column: 'quality', classification: 'score', source_name: 'deep dive', snippet: 'Non-communicating system. Standard 24V thermostat. Control board $300-600 parts, $600-1200 installed. Compressor replacement $600-900 parts, $1800-3000 installed.' },
      { id: 'S5', pool: 'B', column: 'durability', classification: 'score', source_name: 'r/HVAC', snippet: 'Post-Daikin (2012+) quality meaningfully improved. Volume leader in new construction. Houston, TX and Fayetteville, TN manufacturing. Amana = same unit.' },
    ],
  },

  goodman_gsx14: {
    outlook: 'Strong',
    outlook_rationale: 'Same Daikin backing as GSXC18. Even base-model Goodman benefits from world\'s largest HVAC company ownership.',
    platform_disclosure: 'Amana ASX14 = badge-engineered equivalent. Same compressor, coil, cabinet. Different brand/warranty marketing.',
    bottom_line: 'Builder-grade floor. This is what goes in $300K-600K tract homes. Single-stage, fixed orifice, PSC motor. 14.3 SEER2 at code minimum. 8-10 year expected lifespan. BUT: lifetime compressor warranty, widest parts availability, simplest service ecosystem. Every buyer should understand this is the baseline — functional cooling with zero differentiation.',
    sources: [
      { id: 'S1', pool: 'A', column: 'quality', classification: 'score', source_name: 'goodmanmfg.com', snippet: 'Copeland single-stage scroll compressor. Fixed orifice (piston) expansion. PSC fan motor (40-50% efficiency). Light gauge steel cabinet with mesh guard.' },
      { id: 'S2', pool: 'A', column: 'performance', classification: 'score', source_name: 'goodmanmfg.com', snippet: 'SEER2 14.3 — at or near code minimum. Sound 74 dBA. 100% only single-stage. Does NOT meet ENERGY STAR.' },
      { id: 'S3', pool: 'B', column: 'durability', classification: 'score', source_name: 'r/HVAC', snippet: 'Lifetime compressor warranty even on base model. 10yr parts (registered). Any supply house stocks parts. Any contractor can service. Simple design = fewer failure modes.' },
      { id: 'S4', pool: 'B', column: 'durability', classification: 'score', source_name: 'r/HVAC', snippet: '8-10 year expected lifespan per repair tech consensus. Builder-grade standard in tract home construction. PSC motor and fixed orifice = cheapest but least efficient components.' },
      { id: 'S5', pool: 'B', column: 'quality', classification: 'report_only', source_name: 'r/HVAC', snippet: 'Daikin ownership since 2012. Houston, TX manufacturing. Amana ASX14 = same unit. Volume leader in new construction.' },
    ],
  },
};

// Process each file
for (const [slug, enrichment] of Object.entries(ENRICHMENTS)) {
  const filePath = path.join(DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`SKIP: ${filePath} not found`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Add missing fields
  data.outlook = enrichment.outlook;
  data.outlook_rationale = enrichment.outlook_rationale;
  data.platform_disclosure = enrichment.platform_disclosure;
  data.bottom_line = enrichment.bottom_line;
  data.sources = enrichment.sources;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`✅ ${slug}: ${enrichment.sources.length} sources, outlook=${enrichment.outlook}`);
}

console.log('\nDone — all curation files enriched');
