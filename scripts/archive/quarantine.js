const fs = require("fs");
const path = require("path");
const { quarantineSources } = require("/Users/Residentialist/.openclaw/workspace/residentialist/source_quarantine");

const evidenceDir = "/Users/Residentialist/.openclaw/workspace/residentialist/evidence";
const files = fs.readdirSync(evidenceDir)
  .filter(f => f.endsWith("_dh.json"))
  .sort();

async function processAll() {
  for (const file of files) {
    const filepath = path.join(evidenceDir, file);
    const productName = file.replace("_dh.json", "");
    const evidence = JSON.parse(fs.readFileSync(filepath, "utf-8"));
    
    const sources = evidence.professional_consensus?.sources || [];
    const before = sources.filter(s => s.quarantined && s.restored !== true).length;
    
    if (sources.length === 0) {
      console.log("SKIP: " + productName);
      continue;
    }
    
    console.log("START: " + productName + " - " + before + "/" + sources.length);
    
    try {
      await quarantineSources(sources, productName);
      const after = sources.filter(s => s.quarantined && s.restored !== true).length;
      evidence.professional_consensus.sources = sources;
      fs.writeFileSync(filepath, JSON.stringify(evidence, null, 2));
      console.log("DONE: " + productName + " - " + after + "/" + sources.length + "\\n");
    } catch (err) {
      console.error("ERROR in " + productName + ": " + err.message + "\\n");
    }
  }
}

processAll().catch(console.error);
