const fs = require("fs");
const path = require("path");

const evidenceDir = path.join(__dirname, "evidence");
const files = [
  ["reliabilt_3500_dh.json", "Reliabilt 3500"],
  ["window_world_4000_dh.json", "Window World 4000"],
  ["andersen_400_series_dh.json", "Andersen 400"],
  ["pella_impervia_dh.json", "Pella Impervia"],
  ["marvin_signature_ultimate_dh.json", "Marvin Sig Ultimate"]
];

for (const [f, label] of files) {
  const d = JSON.parse(fs.readFileSync(path.join(evidenceDir, f)));
  const srcs = d.professional_consensus?.sources || [];
  const poolA = srcs.filter(s => (s.pool || "C").toUpperCase() === "A");
  console.log(`\n========== ${label} (${poolA.length} Pool A) ==========`);
  for (let i = 0; i < poolA.length; i++) {
    const s = poolA[i];
    const summary = (s.summary || "").replace(/<[^>]+>/g, " ").substring(0, 250);
    const url = (s.url || "").substring(0, 100);
    console.log(`\n  [${i}] ${url}`);
    console.log(`      ${summary}`);
  }
}
