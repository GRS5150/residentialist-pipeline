#!/usr/bin/env node
/**
 * Quarantine Review CLI
 *
 * Usage:
 *   node quarantine_review.js list <product_slug>             — List quarantined sources
 *   node quarantine_review.js restore <product_slug> <id>     — Restore a quarantined source
 *   node quarantine_review.js quarantine <product_slug> <id> [reason] — Manually quarantine a source
 *
 * Examples:
 *   node quarantine_review.js list marvin_signature_ultimate_dh
 *   node quarantine_review.js restore marvin_signature_ultimate_dh PC-MSU-007
 *   node quarantine_review.js quarantine andersen_400_series_dh PC-A4S-003 "off-topic"
 */

const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = path.join(__dirname, 'evidence');

function loadEvidence(slug) {
  const filePath = path.join(EVIDENCE_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Evidence file not found: ${filePath}`);
    process.exit(1);
  }
  return { data: JSON.parse(fs.readFileSync(filePath, 'utf-8')), filePath };
}

function saveEvidence(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function cmdList(slug) {
  const { data } = loadEvidence(slug);
  const sources = data.professional_consensus?.sources || [];

  const quarantined = sources.filter(s => s.quarantined && s.restored !== true);
  const restored = sources.filter(s => s.quarantined && s.restored === true);
  const active = sources.filter(s => !s.quarantined);

  console.log(`\nEvidence: ${slug}`);
  console.log(`Total sources: ${sources.length} | Active: ${active.length} | Quarantined: ${quarantined.length} | Restored: ${restored.length}\n`);

  if (quarantined.length === 0) {
    console.log('No quarantined sources.');
    return;
  }

  // Group by reason
  const byReason = {};
  for (const s of quarantined) {
    const reason = s.quarantine_reason || 'unknown';
    if (!byReason[reason]) byReason[reason] = [];
    byReason[reason].push(s);
  }

  for (const [reason, srcs] of Object.entries(byReason)) {
    console.log(`--- ${reason} (${srcs.length}) ---`);
    for (const s of srcs) {
      const id = s.id || '(no id)';
      const name = (s.name || '').substring(0, 40);
      const url = (s.url || '').substring(0, 60);
      const summary = (s.summary || '').replace(/<[^>]+>/g, ' ').substring(0, 80);
      const at = s.quarantined_at ? ` @ ${s.quarantined_at.substring(0, 10)}` : '';
      console.log(`  ${id.padEnd(16)} [${(s.pool || 'C').toUpperCase()}] ${name}`);
      if (url) console.log(`${''.padEnd(20)}${url}`);
      console.log(`${''.padEnd(20)}${summary}${at}`);
    }
    console.log();
  }

  if (restored.length > 0) {
    console.log(`--- restored (${restored.length}) ---`);
    for (const s of restored) {
      console.log(`  ${(s.id || '(no id)').padEnd(16)} [${(s.pool || 'C').toUpperCase()}] ${(s.name || '').substring(0, 40)} — was: ${s.quarantine_reason}`);
    }
    console.log();
  }
}

function cmdRestore(slug, sourceId) {
  const { data, filePath } = loadEvidence(slug);
  const sources = data.professional_consensus?.sources || [];

  const src = sources.find(s => s.id === sourceId);
  if (!src) {
    console.error(`Source ${sourceId} not found in ${slug}`);
    process.exit(1);
  }

  if (!src.quarantined) {
    console.log(`Source ${sourceId} is not quarantined.`);
    return;
  }

  if (src.restored === true) {
    console.log(`Source ${sourceId} is already restored.`);
    return;
  }

  src.restored = true;
  saveEvidence(filePath, data);
  console.log(`Restored source ${sourceId} (was quarantined for: ${src.quarantine_reason})`);
}

function cmdQuarantine(slug, sourceId, reason) {
  const { data, filePath } = loadEvidence(slug);
  const sources = data.professional_consensus?.sources || [];

  const src = sources.find(s => s.id === sourceId);
  if (!src) {
    console.error(`Source ${sourceId} not found in ${slug}`);
    process.exit(1);
  }

  if (src.quarantined && src.restored !== true) {
    console.log(`Source ${sourceId} is already quarantined (reason: ${src.quarantine_reason}).`);
    return;
  }

  src.quarantined = true;
  src.quarantine_reason = reason || 'manual';
  src.quarantined_at = new Date().toISOString();
  // Clear restored flag if manually quarantining
  if (src.restored) {
    src.restored = false;
  }
  saveEvidence(filePath, data);
  console.log(`Quarantined source ${sourceId} (reason: ${src.quarantine_reason})`);
}

// ─── CLI ───────────────────────────────────────────────────────────────────────

const [,, command, slug, idOrReason, reason] = process.argv;

if (!command || !slug) {
  console.log(`Usage:
  node quarantine_review.js list <product_slug>
  node quarantine_review.js restore <product_slug> <source_id>
  node quarantine_review.js quarantine <product_slug> <source_id> [reason]`);
  process.exit(0);
}

switch (command) {
  case 'list':
    cmdList(slug);
    break;
  case 'restore':
    if (!idOrReason) { console.error('Missing source_id'); process.exit(1); }
    cmdRestore(slug, idOrReason);
    break;
  case 'quarantine':
    if (!idOrReason) { console.error('Missing source_id'); process.exit(1); }
    cmdQuarantine(slug, idOrReason, reason);
    break;
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
