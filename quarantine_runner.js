const fs = require("fs");
const path = require("path");
const { quarantineSources } = require("./source_quarantine");

const workdir = "/Users/Residentialist/.openclaw/workspace/residentialist";
const evidenceDir = path.join(workdir, "evidence");
const files = fs.readdirSync(evidenceDir)
  .filter(f => f.endswith("_dh.json"))
  .sort();

async function processAll() {
  for (const file of files) {
    const filepath = path.join(evidenceDir, file);
    const productName = file.replace("_dh.json", "");
    const evidence = JSON.parse(fs.readFileSync(filepath, "utf-8"));
    
    const sources = evidence.professional_consensus?.sources || [];
    const beforeQuarantine = sources.filter(s => s.quarantined && s.restored !== true).length;
    
    if (sources.length === 0) {
      console.log();
      continue;
    }
    
    console.log();
    
    try {
      await quarantineSources(sources, productName);
      const afterQuarantine = sources.filter(s => s.quarantined && s.restored !== true).length;
      evidence.professional_consensus.sources = sources;
      fs.writeFileSync(filepath, JSON.stringify(evidence, null, 2));
      console.log();
    } catch (err) {
      console.error();
    }
  }
}

processAll().catch(console.error);
