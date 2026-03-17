const fs = require("fs");
const path = require("path");
const { quarantineSources } = require("./source_quarantine");
const rules = require("./quarantine_rules.json");

async function main() {
  const evidencePath = path.join(__dirname, "evidence", "marvin_signature_ultimate_dh.json");
  const data = JSON.parse(fs.readFileSync(evidencePath, "utf-8"));
  const sources = data.professional_consensus.sources;
  console.log("Before:", sources.length, "sources");

  await quarantineSources(sources, "Marvin Signature Ultimate", {
    productSlug: "marvin_signature_ultimate_dh",
    rules
  });

  // Save back
  fs.writeFileSync(evidencePath, JSON.stringify(data, null, 2));
  const q = sources.filter(s => s.quarantined && s.restored !== true);
  console.log("After: " + q.length + " quarantined, saved to evidence file.");
}
main().catch(e => { console.error(e); process.exit(1); });
