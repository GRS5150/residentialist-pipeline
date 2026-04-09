#!/usr/bin/env node
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'residentialist.db'));
const specs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'countertop_tds_specs.json'), 'utf8'));

const upsert = db.prepare(
  "INSERT INTO verified_specs (product_slug, spec_name, raw_value, raw_unit, test_standard, normalized_value, normalized_unit, conversion_method, source_url, source_type, verified_date, verified_by, confidence, flag_note) " +
  "VALUES (?, ?, ?, '', 'TDS/ASTM', ?, '', 'direct', ?, 'tds_verification', datetime('now'), 'bot_tds', ?, ?) " +
  "ON CONFLICT(product_slug, spec_name) DO UPDATE SET " +
  "raw_value = excluded.raw_value, normalized_value = excluded.normalized_value, " +
  "source_url = excluded.source_url, confidence = excluded.confidence, " +
  "flag_note = excluded.flag_note, updated_at = datetime('now')"
);

const specFields = [
  'heat_resistance_f', 'mohs_hardness', 'water_absorption_pct', 'flexural_strength_psi',
  'impact_resistance', 'warranty_years', 'warranty_transferable', 'greenguard_gold',
  'nsf_51', 'domestic_manufacturing', 'repairability', 'uv_resistance', 'certification_count'
];

const slugs = ['cambria_brittanicca', 'dekton_aura_15', 'caesarstone_calacatta_maximus',
  'msi_q_premium_calacatta_arno', 'ubatuba_granite', 'white_ice_granite'];

let count = 0;
for (const slug of slugs) {
  const product = specs[slug];
  if (!product) continue;
  const urls = (product.source_urls || []).join(', ');

  for (const field of specFields) {
    const val = product[field];
    if (val === undefined) continue;
    const conf = product[field + '_confidence'] || 'medium';
    const notes = (product[field + '_notes'] || '').substring(0, 500);
    const rawVal = val === null ? 'N/A' : String(val);

    upsert.run(slug, field, rawVal, rawVal, urls, conf, notes);
    count++;
  }
}

db.close();
console.log('Inserted ' + count + ' verified specs across ' + slugs.length + ' products');
