/**
 * Structural fix: Reject unknown-pool sources when page fetch fails.
 * 
 * Root cause: 53% of page fetches fail (71/133 for Alpen). When they do,
 * the system keeps them by default. For pool=unknown sources, this means
 * completely unverified search results (car warranty pages, RV articles,
 * Honda lawsuits) leak into window scoring data.
 *
 * Principle: Known-pool sources (A, B, C) already have domain-level trust.
 * Unknown-pool sources have ZERO trust — they only exist because a web
 * search returned them. If we can't even verify the page is about windows,
 * it has no business in the evidence.
 *
 * Also: Change Haiku API error default from keep to reject.
 */

const fs = require("fs");

const FILE = "relevance_classifier.js";
let content = fs.readFileSync(FILE, "utf8");
const backup = content;
let changes = 0;

// ── PATCH 1: Reject unknown-pool fetch failures ──────────────────────────
// Replace the default-to-include for fetch failures with pool-aware logic

const OLD_FETCH_FAIL = `        if (verbose) console.log(\`[RELEVANCE]   FETCH_FAIL: \${src.url?.slice(0, 80)} — \${error || 'empty page'} → INCLUDE\`);
        return { src, relevant: true, reason: \`Fetch failed: \${error || 'empty'} — defaulting to include\` };`;

const NEW_FETCH_FAIL = `        // Pool-aware fetch failure handling:
        // Known-pool sources (A, B, C) have domain trust → keep them.
        // Unknown-pool sources have ZERO trust → reject.
        // This prevents unverified garbage (car warranties, RV articles) from leaking in.
        const srcPool = (src.pool || '').toUpperCase();
        if (srcPool === 'UNKNOWN' || srcPool === '') {
          if (verbose) console.log(\`[RELEVANCE]   FETCH_FAIL+UNKNOWN: \${src.url?.slice(0, 80)} — \${error || 'empty page'} → REJECT (no domain trust)\`);
          return { src, relevant: false, reason: \`Fetch failed + pool=unknown — no domain trust to fall back on\` };
        }
        if (verbose) console.log(\`[RELEVANCE]   FETCH_FAIL: \${src.url?.slice(0, 80)} — \${error || 'empty page'} → INCLUDE (pool \${srcPool} has domain trust)\`);
        return { src, relevant: true, reason: \`Fetch failed: \${error || 'empty'} — kept because pool \${srcPool} has domain trust\` };`;

if (content.includes(OLD_FETCH_FAIL)) {
  content = content.replace(OLD_FETCH_FAIL, NEW_FETCH_FAIL);
  changes++;
  console.log("✓ Patch 1: Reject unknown-pool sources on fetch failure (structural fix)");
} else {
  console.log("✗ Patch 1: Could not find fetch-fail default-include block");
  // Try to find it with slightly different whitespace
  const alt = content.indexOf("defaulting to include");
  if (alt > -1) {
    console.log("  Found 'defaulting to include' at position " + alt);
    console.log("  Context: " + content.substring(alt - 100, alt + 100));
  }
}

// ── PATCH 2: Change Haiku API error from keep to reject ──────────────────
const OLD_HAIKU_ERROR = "relevant: true,\n        confidence: 'low',\n        reason: `Haiku API error:";
const NEW_HAIKU_ERROR = "relevant: false,\n        confidence: 'low',\n        reason: `Haiku API error:";

if (content.includes(OLD_HAIKU_ERROR)) {
  content = content.replace(OLD_HAIKU_ERROR, NEW_HAIKU_ERROR);
  changes++;
  console.log("✓ Patch 2: Change Haiku API error default from keep to reject");
} else {
  console.log("✗ Patch 2: Could not find Haiku error block");
  // Check for variations
  const haikuIdx = content.indexOf("Haiku API error");
  if (haikuIdx > -1) {
    console.log("  Found at position " + haikuIdx);
    console.log("  Context: " + content.substring(haikuIdx - 200, haikuIdx + 50));
  }
}

// Also update the message
const OLD_HAIKU_MSG = "defaulting to relevant`";
const NEW_HAIKU_MSG = "defaulting to NOT relevant (fail-closed)`";
if (content.includes(OLD_HAIKU_MSG)) {
  content = content.replace(OLD_HAIKU_MSG, NEW_HAIKU_MSG);
  changes++;
  console.log("✓ Patch 2b: Updated Haiku error message");
}

console.log("\n" + changes + " patches applied");
if (changes > 0) {
  fs.writeFileSync(FILE + ".bak2", backup);
  fs.writeFileSync(FILE, content);
  console.log("Written to " + FILE);
} else {
  console.log("No changes made — check error messages above");
}
