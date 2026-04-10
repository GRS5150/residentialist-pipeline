#!/usr/bin/env node
/**
 * Extract citations from investigator files in output/investigators/ for products
 * with 0 product-scoped sources in the registry.
 * 
 * These files exist as the "investigator" analysis outputs but were never fed
 * through the citation extraction pipeline because extract_citations.js only
 * looked in knowledge/{category}/ for deep_dive_* files.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CAL = path.join(ROOT, 'calibration');
const KNOW = path.join(ROOT, 'knowledge');
const INVEST = path.join(ROOT, 'output', 'investigators');
const NODE = process.execPath;

// Products still at 0 with investigator files available
const TARGETS = [
  { cat: 'countertops', slug: 'caesarstone', file: 'investigator_countertops_caesarstone.md' },
  { cat: 'dishwashers', slug: 'miele_g7000', file: 'investigator_dishwashers_miele_g7000.md' },
  { cat: 'dishwashers', slug: 'bosch_800', file: 'investigator_dishwashers_bosch_800.md' },
  { cat: 'dishwashers', slug: 'kitchenaid_kdtm604', file: 'investigator_dishwashers_kitchenaid_kdtm604.md' },
  { cat: 'dishwashers', slug: 'bosch_300', file: 'investigator_dishwashers_bosch_300.md' },
  { cat: 'dishwashers', slug: 'whirlpool_wdt750sakz', file: 'investigator_dishwashers_whirlpool_wdt750sakz.md' },
  { cat: 'dishwashers', slug: 'samsung_dw80_mid', file: 'investigator_dishwashers_samsung_dw80_mid.md' },
  { cat: 'exterior_doors', slug: 'pella_reserve_entry', file: 'investigator_exterior_doors_pella_reserve_entry.md' },
  { cat: 'exterior_doors', slug: 'reliabilt_entry', file: 'investigator_exterior_doors_reliabilt_entry.md' },
  { cat: 'hvac', slug: 'lennox_sl28xcv', file: 'investigator_hvac_lennox_sl28xcv.md' },
  { cat: 'hvac', slug: 'goodman_gsx14', file: 'investigator_hvac_goodman_gsx14.md' },
  { cat: 'lighting_control', slug: 'lutron_homeworks_qsx_ketra', file: 'investigator_lighting_control_lutron_homeworks_qsx_ketra.md' },
  { cat: 'lighting_control', slug: 'lutron_homeworks_qsx', file: 'investigator_lighting_control_lutron_homeworks_qsx.md' },
  { cat: 'lighting_control', slug: 'lutron_radiora3', file: 'investigator_lighting_control_lutron_radiora3.md' },
  { cat: 'lighting_control', slug: 'savant_lighting', file: 'investigator_lighting_control_savant_lighting.md' },
  { cat: 'lighting_control', slug: 'control4_lighting', file: 'investigator_lighting_control_control4_lighting.md' },
  { cat: 'lighting_control', slug: 'lutron_caseta', file: 'investigator_lighting_control_lutron_caseta.md' },
  { cat: 'lighting_control', slug: 'leviton_decora_smart', file: 'investigator_lighting_control_leviton_decora_smart.md' },
  { cat: 'range_hoods', slug: 'vent_a_hood_prh', file: 'investigator_range_hoods_vent_a_hood_prh.md' },
  { cat: 'range_hoods', slug: 'wolf_pro_ventilation', file: 'investigator_range_hoods_wolf_pro_ventilation.md' },
  { cat: 'range_hoods', slug: 'zephyr_tempest_ii', file: 'investigator_range_hoods_zephyr_tempest_ii.md' },
  { cat: 'range_hoods', slug: 'thermador_hpcn', file: 'investigator_range_hoods_thermador_hpcn.md' },
  { cat: 'range_hoods', slug: 'broan_elite_e60e', file: 'investigator_range_hood_broan_elite_e60e.md' },
  { cat: 'range_hoods', slug: 'broan_f40000', file: 'investigator_range_hoods_broan_f40000.md' },
  { cat: 'sinks', slug: 'kohler_whitehaven_k6489', file: 'investigator_sinks_kohler_whitehaven_k6489.md' },
  { cat: 'sinks', slug: 'glacier_bay_dropin', file: 'investigator_sinks_glacier_bay_dropin.md' },
  { cat: 'water_heaters', slug: 'noritz_ez111dv', file: 'investigator_water_heaters_noritz_ez111dv.md' },
  { cat: 'water_heaters', slug: 'ao_smith_proline_xe', file: 'investigator_water_heaters_ao_smith_proline_xe.md' },
];

async function run() {
  console.log(`\n╔══════════════════════════════════════════════════════════════════════╗`);
  console.log(`║  INVESTIGATOR CITATION EXTRACTION — ${TARGETS.length} products                  ║`);
  console.log(`╚══════════════════════════════════════════════════════════════════════╝\n`);

  const results = [];

  for (const t of TARGETS) {
    // Count before — skip if already populated
    const regPath = path.join(KNOW, t.cat, 'sources_registry.json');
    let before = 0;
    if (fs.existsSync(regPath)) {
      const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
      before = reg.filter(s => s.scope === 'product' && s.products && s.products.includes(t.slug)).length;
    }
    if (before > 0) {
      console.log(`  ${t.slug.padEnd(35)} SKIP (already has ${before})`);
      results.push({ cat: t.cat, slug: t.slug, before, after: before, added: 0 });
      continue;
    }

    // Resolve the actual investigator file — scan directory for any file matching slug
    const catDir = path.join(INVEST, t.cat);
    let investFile = null;
    if (fs.existsSync(catDir)) {
      const candidates = fs.readdirSync(catDir).filter(f => 
        f.endsWith('.md') && !f.includes('summary') && f.includes(t.slug)
      ).sort((a, b) => fs.statSync(path.join(catDir, b)).size - fs.statSync(path.join(catDir, a)).size);
      if (candidates.length > 0) investFile = path.join(catDir, candidates[0]);
    }

    if (!investFile) {
      console.log(`  ${t.slug.padEnd(35)} ✗ no investigator file`);
      results.push({ cat: t.cat, slug: t.slug, before: 0, after: 0, added: 0 });
      continue;
    }

    // Copy investigator file to knowledge dir as a deep_dive_ file
    const tempName = `deep_dive_${t.slug}.md`;
    const tempPath = path.join(KNOW, t.cat, tempName);
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(path.join(KNOW, t.cat), { recursive: true });
      fs.copyFileSync(investFile, tempPath);
    }

    process.stdout.write(`  ${t.slug.padEnd(35)} `);

    try {
      const cmd = `${NODE} ${path.join(ROOT, 'scripts', 'extract_citations.js')} ${t.cat} ${tempPath}`;
      execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 60000, env: process.env });
    } catch (err) {
      const msg = (err.message || '').substring(0, 80);
      if (msg.includes('SIGTERM') || msg.includes('timed out')) {
        process.stdout.write(`⏱ timeout — `);
      } else {
        process.stdout.write(`❌ ${msg} — `);
      }
    }

    // Count after
    let after = 0;
    if (fs.existsSync(regPath)) {
      const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
      after = reg.filter(s => s.scope === 'product' && s.products && s.products.includes(t.slug)).length;
    }

    const added = after - before;
    console.log(`${before} → ${after} (+${added})`);
    results.push({ cat: t.cat, slug: t.slug, before, after, added });

    // Rate limit
    await new Promise(r => setTimeout(r, 4000));
  }

  // Summary
  console.log('\n' + '═'.repeat(85));
  console.log('Category'.padEnd(20) + 'Product'.padEnd(35) + 'Before'.padStart(8) + 'After'.padStart(8) + 'Added'.padStart(8));
  console.log('─'.repeat(85));
  for (const r of results) {
    console.log(r.cat.padEnd(20) + r.slug.padEnd(35) + String(r.before).padStart(8) + String(r.after).padStart(8) + String(r.added).padStart(8));
  }
  console.log('─'.repeat(85));
  const totalBefore = results.reduce((s, r) => s + r.before, 0);
  const totalAfter = results.reduce((s, r) => s + r.after, 0);
  const totalAdded = results.reduce((s, r) => s + r.added, 0);
  console.log('TOTAL'.padEnd(55) + String(totalBefore).padStart(8) + String(totalAfter).padStart(8) + String(totalAdded).padStart(8));
  console.log('═'.repeat(85));

  const stillZero = results.filter(r => r.after === 0).length;
  console.log(`\nPopulated: ${results.length - stillZero} | Still zero: ${stillZero}`);
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
