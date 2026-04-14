/**
 * Phase 1 Server Patch v3 — Add product_card and buyer_considerations to detail response
 */
const fs = require('fs');
const path = require('path');

const SERVER_PATH = path.join(__dirname, 'dashboard', 'dashboard_server.js');
let code = fs.readFileSync(SERVER_PATH, 'utf-8');

// Find the detail response and add product_card + buyer_considerations
const target = `      run_dir: runDir ? path.basename(runDir) : null`;
const replacement = `      run_dir: runDir ? path.basename(runDir) : null,
      // Phase 1: Product card and buyer considerations
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
      buyer_considerations: getBuyerConsiderations(product.id),
      safety_disqualified: !!product.safety_disqualified,
      safety_disqualification_reason: product.safety_disqualification_reason || null`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(SERVER_PATH, code);
  console.log('[PATCH ✓] Added product_card and buyer_considerations to detail response');
} else {
  console.log('[PATCH ✗] Target pattern not found');
}
