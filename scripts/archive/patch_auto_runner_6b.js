/**
 * Patch: Update auto_runner.js to report Phase 6b stats in Telegram.
 *
 * Changes:
 * 1. After source parser runs, report how many sources were rejected by Phase 6b
 *
 * Run: node patch_auto_runner_6b.js
 */

const fs = require('fs');
const path = require('path');

const AUTO_RUNNER_PATH = path.join(__dirname, 'auto_runner.js');

let code = fs.readFileSync(AUTO_RUNNER_PATH, 'utf-8');

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH 1: Update the source parser Telegram message to include 6b info
// ═══════════════════════════════════════════════════════════════════════════════

// The current message is:
// `📚 *Source parser complete*\n${productName}: ${sourceCount} sources found\nPool A: ${poolA} | B: ${poolB} | C: ${poolC}`
// 
// After 6b, parserResult will have meta.phase_6b_stats and meta.phase_6b_rejected.
// Update the message to include rejected count.

code = code.replace(
  "      if (sourceCount > 0) {\n        await sendTelegram(`📚 *Source parser complete*\\n${productName}: ${sourceCount} sources found\\nPool A: ${poolA} | B: ${poolB} | C: ${poolC}`);",
  `      const rejected6b = (parserResult.meta?.phase_6b_rejected) || 0;
      if (sourceCount > 0) {
        const rejectedNote = rejected6b > 0 ? \`\\n🔍 Phase 6b: \${rejected6b} false positive(s) removed\` : '';
        await sendTelegram(\`📚 *Source parser complete*\\n\${productName}: \${sourceCount} sources found\\nPool A: \${poolA} | B: \${poolB} | C: \${poolC}\${rejectedNote}\`);`
);

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH 2: Update the header comment
// ═══════════════════════════════════════════════════════════════════════════════

code = code.replace(
  ' * Phase 6a: Source parser runs before pipeline to discover/update evidence\n *           Requires BRAVE_SEARCH_API_KEY in .env. Skips gracefully if missing.',
  ' * Phase 6a: Source parser runs before pipeline to discover/update evidence\n *           Requires BRAVE_SEARCH_API_KEY in .env. Skips gracefully if missing.\n * Phase 6b: Relevance classifier filters false positives via full-page Haiku AI.\n *           Added March 15, 2026.'
);

// ═══════════════════════════════════════════════════════════════════════════════
// WRITE
// ═══════════════════════════════════════════════════════════════════════════════

fs.writeFileSync(AUTO_RUNNER_PATH, code);
console.log(`[PATCH] auto_runner.js patched successfully (${code.length} bytes)`);

// Verify
if (code.includes('rejected6b') && code.includes('Phase 6b: Relevance classifier')) {
  console.log('  ✓ All patches applied');
} else {
  console.error('  ✗ Some patches may not have applied');
  process.exit(1);
}
