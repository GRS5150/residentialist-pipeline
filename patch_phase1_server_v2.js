/**
 * Phase 1 Server Patch v2 — patch remaining endpoints
 * Run on Mac Mini: node patch_phase1_server_v2.js
 */
const fs = require('fs');
const path = require('path');

const SERVER_PATH = path.join(__dirname, 'dashboard', 'dashboard_server.js');
let code = fs.readFileSync(SERVER_PATH, 'utf-8');
let patchCount = 0;

function patch(label, find, replace) {
  if (code.includes(find)) {
    code = code.replace(find, replace);
    patchCount++;
    console.log(`[PATCH ✓] ${label}`);
  } else {
    console.log(`[PATCH ✗] ${label} — not found`);
  }
}

// ── Patch products list: add new fields, remove grade/outlook ────────────────
patch('Update products SQL to include new columns',
  `"SELECT id, product_name, product_line, category, overall_score, quality_score, durability_score, performance_score, material_safety_score, material_class, config, price_amount, price_unit, price_reference_spec, price_note, price_integrity FROM products WHERE overall_score IS NOT NULL AND (status IS NULL OR status != 'rejected') ORDER BY overall_score DESC"`,
  `"SELECT id, product_name, product_line, category, overall_score, quality_score, durability_score, performance_score, material_safety_score, material_class, config, price_amount, price_unit, price_reference_spec, price_note, price_integrity, product_label, health_label, price_positioning, safety_disqualified FROM products WHERE overall_score IS NOT NULL AND (status IS NULL OR status != 'rejected') ORDER BY overall_score DESC"`
);

// Replace the products map with Phase 1 fields
patch('Replace products map with Phase 1 fields',
  `products = products.map(p => ({
      ...p,
      grade: sampleData.applySafetyCap(sampleData.getGrade(p.overall_score), p.material_safety_score),
      outlook: sampleData.getOutlook(p.overall_score)
    ,
      score_tier: getScoreTier(p.overall_score),
      price_amount: p.price_amount,
      price_unit: p.price_unit,
      price_reference_spec: p.price_reference_spec,
      price_note: p.price_note,
      price_integrity: p.price_integrity,
      price_integrity_label: getPriceIntegrityLabel(p.price_integrity)}));`,
  `products = products.map(p => ({
      ...p,
      overall_score_display: Math.round(p.overall_score || 0),
      product_label: p.product_label || getScoreTier(p.overall_score),
      health_label: p.health_label || getHealthLabel(p.material_safety_score),
      price_positioning: p.price_positioning || null,
      safety_disqualified: !!p.safety_disqualified,
      // Legacy fields (deprecated)
      grade: getScoreTier(p.overall_score),
      outlook: '',
      score_tier: getScoreTier(p.overall_score),
      price_integrity_label: null
    }));`
);

// ── Patch product detail to include product_card, buyer_considerations ──────
// The detail uses: grade: sampleData.getGrade(product.overall_score),
patch('Add Phase 1 fields to product detail response',
  `grade: sampleData.getGrade(product.overall_score),`,
  `grade: getScoreTier(product.overall_score),
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
          certifications: [],
          has_certifications: false,
          materials_reviewed: null,
          materials_list: null,
          price_positioning: product.price_positioning || null,
          serviceability_summary: product.serviceability_summary || null,
          warranty_display: getWarrantyDisplay(product)
        },
        buyer_considerations: getBuyerConsiderations(product.id),`
);

// Also update the product detail SQL to include new columns
patch('Update product detail SQL query',
  `SELECT * FROM products WHERE id =`,
  `SELECT *, product_label, health_label, price_positioning, serviceability_summary, warranty_display, safety_disqualified, safety_disqualification_reason FROM products WHERE id =`
);

fs.writeFileSync(SERVER_PATH, code);
console.log(`\n[DONE] Applied ${patchCount} patches. File size: ${code.length}`);
