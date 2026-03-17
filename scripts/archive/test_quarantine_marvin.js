const fs = require("fs");
const path = require("path");
const { quarantineSources } = require("./source_quarantine");
const rules = require("./quarantine_rules.json");

async function main() {
  // Load a COPY of Marvin evidence (dont mutate original)
  const raw = fs.readFileSync(path.join(__dirname, "evidence", "marvin_signature_ultimate_dh.json"), "utf-8");
  const data = JSON.parse(raw);
  const sources = data.professional_consensus.sources;
  console.log("Before quarantine:", sources.length, "sources");

  // Run quarantine
  await quarantineSources(sources, "Marvin Signature Ultimate", {
    productSlug: "marvin_signature_ultimate_dh",
    rules
  });

  // Count results
  const q = sources.filter(s => s.quarantined && s.restored !== true);
  const active = sources.filter(s => !s.quarantined || s.restored === true);
  console.log("\nAfter quarantine:", active.length, "active,", q.length, "quarantined");

  const byReason = {};
  for (const s of q) {
    byReason[s.quarantine_reason] = (byReason[s.quarantine_reason] || 0) + 1;
  }
  console.log("Breakdown:", JSON.stringify(byReason));

  // V5 staging removed 29 total (3 bad Pool A, 3 dedup, 23 wrong product)
  console.log("\nV5 staging comparison:");
  console.log("  V5 removed: 29 (3 bad_pool_a, 3 dedup, 23 cross_product)");
  console.log("  Quarantine: " + q.length + " (" + Object.entries(byReason).map(([k,v]) => v + " " + k).join(", ") + ")");
  console.log("\nNote: Some variation expected due to Haiku non-determinism.");
}

main().catch(e => { console.error(e); process.exit(1); });
