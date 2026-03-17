const fs = require("fs");
const path = require("path");

// Domains that are clearly NOT about windows/building
const OFFTOPIC_DOMAINS = [
  "cartelligent.com", "rv-pro.com", "lerchrv.com", "autorepairx.com",
  "mycarvoice.com", "thelemonfirm.com", "classlawgroup.com",
  "lemonmyvehicle.com", "hondapassport",
  // Auto/vehicle
  "cars.com", "caranddriver.com", "motortrend.com", "kbb.com",
  "edmunds.com", "autotrader.com", "autoblog.com",
  // Other off-topic
  "food", "recipe", "gaming", "crypto", "forex", "travel",
];

// Check the relevance_classifier to understand Phase 6b filtering
try {
  const rc = require("./relevance_classifier");
  console.log("relevance_classifier exports:", Object.keys(rc).join(", "));
} catch(e) {
  console.log("relevance_classifier not loadable:", e.message.substring(0,80));
}

// Audit every evidence file for off-topic sources
const evidenceDir = "evidence";
const files = fs.readdirSync(evidenceDir).filter(f => f.endsWith(".json") && !f.includes("status_check"));
let totalSources = 0;
let offTopicCount = 0;
const offTopicByProduct = {};

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(evidenceDir, f), "utf8"));
  const srcs = (data.professional_consensus || {}).sources || [];
  totalSources += srcs.length;
  
  for (const s of srcs) {
    const url = (s.url || "").toLowerCase();
    const name = (s.name || "").toLowerCase();
    const combined = url + " " + name;
    
    // Check for obvious off-topic domains
    if (OFFTOPIC_DOMAINS.some(d => combined.includes(d))) {
      offTopicCount++;
      const prod = f.replace(".json", "");
      if (!offTopicByProduct[prod]) offTopicByProduct[prod] = [];
      offTopicByProduct[prod].push({
        name: (s.name || "").substring(0, 60),
        url: (s.url || "").substring(0, 80),
        pool: s.pool
      });
    }
  }
}

console.log("\nTotal sources across all products:", totalSources);
console.log("Off-topic (known bad domains):", offTopicCount);
console.log("\nBy product:");
for (const [prod, items] of Object.entries(offTopicByProduct)) {
  console.log(prod + ": " + items.length);
  items.forEach(i => console.log("  [" + i.pool + "] " + i.name + " | " + i.url));
}

// Also check: how many sources have pool=unknown?
let unknownCount = 0;
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(evidenceDir, f), "utf8"));
  const srcs = (data.professional_consensus || {}).sources || [];
  const unknown = srcs.filter(s => s.pool === "unknown");
  if (unknown.length > 0) {
    unknownCount += unknown.length;
  }
}
console.log("\nSources with pool=unknown:", unknownCount, "(these bypass pool classification)");
