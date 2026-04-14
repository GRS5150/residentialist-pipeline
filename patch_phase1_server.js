/**
 * Phase 1 Server Patch — Safe patching of dashboard_server.js
 * Adds: product_card, buyer_considerations, safety_disqualified, five-tier labels
 * Run on Mac Mini: node patch_phase1_server.js
 */
const fs = require('fs');
const path = require('path');

const SERVER_PATH = path.join(__dirname, 'dashboard', 'dashboard_server.js');
let code = fs.readFileSync(SERVER_PATH, 'utf-8');
const originalLen = code.length;
let patchCount = 0;

function patch(label, find, replace) {
  if (code.includes(find)) {
    code = code.replace(find, replace);
    patchCount++;
    console.log(`[PATCH ✓] ${label}`);
  } else {
    console.log(`[PATCH ✗] ${label} — pattern not found, skipping`);
  }
}

// ── Patch 1: Add getHealthLabel and buyer consideration helpers ──────────────
patch('Add getHealthLabel after getScoreTier',
  `// Price Integrity labels`,
  `function getHealthLabel(safetyScore) {
  if (safetyScore == null) return null;
  const s = safetyScore > 10 ? safetyScore / 10 : safetyScore;
  if (s >= 9.0) return 'Excellent';
  if (s >= 8.0) return 'Good';
  if (s >= 7.0) return 'Moderate';
  return 'Material Concern';
}

function getBuyerConsiderations(productId) {
  try {
    return queryDB('SELECT id, text, gate_passed, mapped_pain_point FROM buyer_considerations WHERE product_id = ' + productId + ' ORDER BY id');
  } catch(e) { return []; }
}

function getWarrantyDisplay(product) {
  if (!product.warranty_display) return [];
  try { return JSON.parse(product.warranty_display); } catch(e) { return []; }
}

// Price Integrity labels`
);

// ── Patch 2: Enhance /api/products response ─────────────────────────────────
// Find the products endpoint and add new fields
patch('Enhance products list response',
  `product_name: p.product_name,`,
  `product_name: p.product_name,
          overall_score_display: Math.round(p.overall_score || 0),
          product_label: p.product_label || getScoreTier(p.overall_score),
          health_label: p.health_label || getHealthLabel(p.material_safety_score),
          price_positioning: p.price_positioning || null,
          safety_disqualified: !!p.safety_disqualified,`
);

// ── Patch 3: Add product_card to /api/product/:id ───────────────────────────
// Find where the product detail response is assembled and add product_card
// We need to find the sendJSON call for the product detail endpoint
// Look for where quarantine is added to the detail response
patch('Add product_card to detail response',
  `quarantine: quarantine,`,
  `quarantine: quarantine,
        // Phase 1: Product Card
        product_label: product.product_label || getScoreTier(product.overall_score),
        health_label: product.health_label || getHealthLabel(product.material_safety_score),
        price_positioning: product.price_positioning || null,
        serviceability_summary: product.serviceability_summary || null,
        safety_disqualified: !!product.safety_disqualified,
        safety_disqualification_reason: product.safety_disqualification_reason || null,
        product_card: {
          score: Math.round(product.overall_score || 0),
          label: product.product_label || getScoreTier(product.overall_score),
          health_label: product.health_label || getHealthLabel(product.material_safety_score),
          certifications: [], // TODO: populate from bot3 output
          has_certifications: false,
          materials_reviewed: null,
          materials_list: null,
          price_positioning: product.price_positioning || null,
          serviceability_summary: product.serviceability_summary || null,
          warranty_display: getWarrantyDisplay(product)
        },
        buyer_considerations: getBuyerConsiderations(product.id),`
);

// ── Write patched file ──────────────────────────────────────────────────────
if (patchCount > 0) {
  // Backup original
  fs.writeFileSync(SERVER_PATH + '.bak', fs.readFileSync(SERVER_PATH));
  fs.writeFileSync(SERVER_PATH, code);
  console.log(`\n[DONE] Applied ${patchCount} patches. File: ${originalLen} → ${code.length} bytes`);
  console.log(`[DONE] Backup saved to ${SERVER_PATH}.bak`);
} else {
  console.log('\n[DONE] No patches applied — patterns may have already been patched.');
}
