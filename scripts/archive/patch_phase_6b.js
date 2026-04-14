/**
 * Patch: Phase 6b integration into source_parser.js
 * 
 * This script modifies source_parser.js to:
 * 1. Add require() for relevance_classifier
 * 2. Update the header comment
 * 3. Insert the relevance classification step after deduplication
 * 4. Add rejected sources to meta output
 * 5. Update the complaints extraction to only count from relevant sources
 *
 * Run: node patch_phase_6b.js
 */

const fs = require('fs');
const path = require('path');

const SOURCE_PARSER_PATH = path.join(__dirname, 'source_parser.js');

let code = fs.readFileSync(SOURCE_PARSER_PATH, 'utf-8');

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH 1: Update header comment
// ═══════════════════════════════════════════════════════════════════════════════

code = code.replace(
  ' * CURRENT: Uses Brave search snippets (~160 chars) for source classification.\n * FUTURE (Phase 6b): Full page fetching + AI classification for deeper accuracy.\n * See ROADMAP.md for Phase 6b trigger conditions and scope estimate.',
  ' * Phase 6a: Brave search snippets (~160 chars) for pool/sentiment classification.\n * Phase 6b: Full page fetching + Haiku AI classification for relevance filtering.\n *           Filters false positives (e.g., "Sierra Pacific" trucks vs windows).\n *           Added March 15, 2026.'
);

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH 2: Add require for relevance_classifier after existing requires
// ═══════════════════════════════════════════════════════════════════════════════

code = code.replace(
  "const { URL }  = require('url');",
  "const { URL }  = require('url');\nconst { classifyRelevance } = require('./relevance_classifier');"
);

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH 3: Remove the Phase 6b placeholder comment
// ═══════════════════════════════════════════════════════════════════════════════

code = code.replace(
  "  // Phase 1: Direct URL fetches are noted but not actually fetched here\n  // (Phase 6b will add full page parsing; for now we note them as sources)",
  "  // Phase 1: Direct URL fetches — noted as sources with domain classification"
);

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH 4: Insert Phase 6b classification after deduplication, before assembly
// ═══════════════════════════════════════════════════════════════════════════════

// Find the dedup block and the component summary block
const dedupBlock = `  const finalSources   = [];
  const finalSourceUrls = new Set();
  for (const src of sources) {
    if (src.url && finalSourceUrls.has(src.url)) continue;
    if (src.url) finalSourceUrls.add(src.url);
    finalSources.push(src);
  }

  // ── Build component summary note ──────────────────────────────────────────`;

const newDedupBlock = `  let finalSources   = [];
  const finalSourceUrls = new Set();
  for (const src of sources) {
    if (src.url && finalSourceUrls.has(src.url)) continue;
    if (src.url) finalSourceUrls.add(src.url);
    finalSources.push(src);
  }

  // ── Phase 6b: Relevance Classification ──────────────────────────────────────
  // Full-page fetch + Haiku AI classification to filter false positives.
  // Catches: name collisions (Sierra Pacific trucks), generic articles (DOE),
  // Prop 65 pages (sierra.com), and other irrelevant results.
  // Cost: ~$0.06/product. Graceful degradation on errors.

  let relevanceRejected = [];
  let relevanceStats = null;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      console.log(\`[SOURCE PARSER] Phase 6b: Running relevance classification on \${finalSources.length} sources...\`);

      const classResult = await classifyRelevance(
        finalSources,
        productName,
        manufacturer,
        category,
        { anthropicApiKey: process.env.ANTHROPIC_API_KEY, verbose: true }
      );

      // Replace finalSources with only relevant ones
      finalSources = classResult.relevant;
      relevanceRejected = classResult.rejected;
      relevanceStats = classResult.stats;

      console.log(\`[SOURCE PARSER] Phase 6b: \${classResult.stats.relevant} relevant, \${classResult.stats.rejected} rejected\`);

      // Re-extract complaints ONLY from relevant sources
      // (We already extracted from all sources above, but rejected sources
      //  may have contributed false complaints — rebuild from relevant only)
      if (relevanceRejected.length > 0) {
        const rejectedUrls = new Set(relevanceRejected.map(r => r.source.url));
        // Remove complaints that came from rejected sources
        const cleanedComplaints = complaints.filter(c => !rejectedUrls.has(c.source));
        const removedCount = complaints.length - cleanedComplaints.length;
        if (removedCount > 0) {
          console.log(\`[SOURCE PARSER] Phase 6b: Removed \${removedCount} complaint(s) from rejected sources\`);
          complaints.length = 0;
          complaints.push(...cleanedComplaints);
        }
      }
    } catch (err) {
      // Phase 6b failure is non-fatal — continue with unfiltered sources
      console.error(\`[SOURCE PARSER] Phase 6b error (non-fatal): \${err.message}\`);
    }
  } else {
    console.log('[SOURCE PARSER] Phase 6b: Skipped — no ANTHROPIC_API_KEY');
  }

  // ── Build component summary note ──────────────────────────────────────────`;

code = code.replace(dedupBlock, newDedupBlock);

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH 5: Add relevance stats to meta output
// ═══════════════════════════════════════════════════════════════════════════════

code = code.replace(
  "      certifications_found: certifications.size,\n    },",
  "      certifications_found: certifications.size,\n      phase_6b_stats: relevanceStats,\n      phase_6b_rejected: relevanceRejected.length,\n    },"
);

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH 6: Update the Phase 1 _requires_fetch tag comment
// ═══════════════════════════════════════════════════════════════════════════════

code = code.replace(
  "      _requires_fetch: true, // Flag for Phase 6b full-page parsing\n    });\n  }\n\n  // Manufacturer-specific URLs",
  "      _requires_fetch: true,\n    });\n  }\n\n  // Manufacturer-specific URLs"
);

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH 7: Add Phase 6b rejection log to the console output
// ═══════════════════════════════════════════════════════════════════════════════

code = code.replace(
  "  console.log(`\\n[SOURCE PARSER]   U-factor:     ${parserResult.performance.thermal.u_factor || 'not found'}`);",
  "  console.log(`\\n[SOURCE PARSER]   U-factor:     ${parserResult.performance.thermal.u_factor || 'not found'}`);\n  if (relevanceStats) {\n    console.log(`[SOURCE PARSER]   6b rejected:  ${relevanceStats.rejected} false positives removed`);\n  }"
);

// ═══════════════════════════════════════════════════════════════════════════════
// WRITE
// ═══════════════════════════════════════════════════════════════════════════════

fs.writeFileSync(SOURCE_PARSER_PATH, code);
console.log(`[PATCH] source_parser.js patched successfully (${code.length} bytes)`);
console.log('[PATCH] Phase 6b integration complete.');

// Verify key markers are present
const checks = [
  ['relevance_classifier require', "require('./relevance_classifier')"],
  ['Phase 6b classification block', 'classifyRelevance('],
  ['relevanceRejected declaration', 'let relevanceRejected'],
  ['phase_6b_stats in meta', 'phase_6b_stats: relevanceStats'],
];

let allGood = true;
for (const [name, marker] of checks) {
  if (code.includes(marker)) {
    console.log(`  ✓ ${name}`);
  } else {
    console.error(`  ✗ ${name} — MISSING`);
    allGood = false;
  }
}

if (!allGood) {
  console.error('\n[PATCH] WARNING: Some patches may not have applied correctly.');
  process.exit(1);
}
