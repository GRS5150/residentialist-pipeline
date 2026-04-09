#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'residentialist.db'));

const traceability = {
  cambria_brittanicca: { val: 'single_source', note: 'Single factory Le Sueur MN, own quarry' },
  dekton_aura_15: { val: 'single_source', note: 'Single Cosentino process, Almeria Spain' },
  caesarstone_calacatta_maximus: { val: 'multi_source', note: '100% third-party manufacturing as of Dec 2025' },
  msi_q_premium_calacatta_arno: { val: 'multi_source', note: '25+ global suppliers' },
  ubatuba_granite: { val: 'single_source', note: 'Specific geological formation (Verde Ubatuba, Minas Gerais Brazil), testable ASTM composition' },
  white_ice_granite: { val: 'single_source', note: 'Specific geological formation, testable ASTM composition' }
};

const upsert = db.prepare(
  "INSERT INTO verified_specs (product_slug, spec_name, raw_value, raw_unit, test_standard, normalized_value, normalized_unit, conversion_method, source_url, source_type, verified_date, verified_by, confidence, flag_note) " +
  "VALUES (?, 'source_traceability', ?, '', 'methodology', ?, '', 'direct', '', 'manual_classification', datetime('now'), 'human', 'high', ?) " +
  "ON CONFLICT(product_slug, spec_name) DO UPDATE SET " +
  "raw_value = excluded.raw_value, normalized_value = excluded.normalized_value, " +
  "confidence = 'high', flag_note = excluded.flag_note, updated_at = datetime('now')"
);

let count = 0;
for (const [slug, data] of Object.entries(traceability)) {
  upsert.run(slug, data.val, data.val, data.note);
  count++;
}

db.close();
console.log('Updated source_traceability for ' + count + ' products');
