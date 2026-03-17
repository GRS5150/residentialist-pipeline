const fs = require("fs");
const path = require("path");
const outDir = "/Users/Residentialist/.openclaw/workspace/residentialist/outputs";

const runs = {
  "Marvin Signature Ultimate": "marvin_signature_ultimate_2026-03-13T04-06-11",
  "Loewen": "loewen_2026-03-12T22-22-22",
  "Pella Impervia": "pella_impervia_2026-03-13T04-06-43",
  "Andersen E-Series": "andersen_eseries_2026-03-13T04-20-09",
  "Pella 250 Series": "pella_250_series_2026-03-13T03-50-52",
  "Ply Gem Pro Series": "ply_gem_pro_series_2026-03-13T04-11-12",
  "Reliabilt 3500": "reliabilt_3500_2026-03-13T03-59-26",
};

for (const [name, runDir] of Object.entries(runs)) {
  const runPath = path.join(outDir, runDir);
  
  // Check data completeness
  try {
    const dcPath = path.join(runPath, "DATA_COMPLETENESS.txt");
    if (fs.existsSync(dcPath)) {
      const dc = fs.readFileSync(dcPath, "utf8");
      const undisclosed = (dc.match(/UNDISCLOSED/gi) || []).length;
      const midpoint = (dc.match(/midpoint/gi) || []).length;
      console.log(name + ": " + undisclosed + " undisclosed, " + midpoint + " midpoint refs");
    }
  } catch(e) {}
  
  // Check challenge bot flags
  try {
    const files = fs.readdirSync(runPath).filter(f => f.includes("bot4_challenge"));
    if (files.length > 0) {
      const challenge = fs.readFileSync(path.join(runPath, files[0]), "utf8");
      const flags = (challenge.match(/###\s*FLAG/g) || []).length;
      const warns = (challenge.match(/\*\*WARN\*\*/g) || []).length;
      console.log("  Challenge: " + flags + " FLAGs, " + warns + " WARNs");
    }
  } catch(e) {}
  
  // Check Bot 2 undisclosed specs
  try {
    const files = fs.readdirSync(runPath).filter(f => f.endsWith("_bot2_evaluator.json"));
    if (files.length > 0) {
      const bot2 = JSON.parse(fs.readFileSync(path.join(runPath, files[0]), "utf8"));
      const yellows = bot2.findings ? bot2.findings.yellow.length : 0;
      const reds = bot2.findings ? bot2.findings.red.length : 0;
      console.log("  Findings: " + reds + " red, " + yellows + " yellow");
    }
  } catch(e) {}
  
  console.log("");
}
