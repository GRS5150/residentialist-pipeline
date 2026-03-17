const fs = require("fs");
const path = require("path");
const evidenceDir = "evidence";
const badDomains = ["cartelligent.com", "topclassactions.com", "rv-pro.com", "retrofitmagazine.com"];
const files = fs.readdirSync(evidenceDir).filter(f => f.endsWith(".json"));
let totalBad = 0;
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(evidenceDir, f), "utf8"));
  const srcs = (data.professional_consensus || {}).sources || [];
  const bad = srcs.filter(s => {
    const url = (s.url || "").toLowerCase();
    return badDomains.some(d => url.includes(d)) || url.includes("usatoday.com/recalls");
  });
  if (bad.length > 0) {
    console.log(f + ": " + bad.length + " irrelevant sources");
    bad.forEach(s => console.log("  " + (s.url || "no-url").substring(0, 80)));
    totalBad += bad.length;
  }
}
console.log("\nTotal irrelevant from these domains: " + totalBad);

// Now do a broader audit - find ALL sources with domains unrelated to windows/building
const suspectPatterns = ["car", "auto", "honda", "toyota", "rv-pro", "rv.", "motorcycle", "boat",
  "pet", "food", "recipe", "fashion", "beauty", "gaming", "crypto", "forex"];
let suspectCount = 0;
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(evidenceDir, f), "utf8"));
  const srcs = (data.professional_consensus || {}).sources || [];
  for (const s of srcs) {
    const urlLower = (s.url || "").toLowerCase();
    const nameLower = (s.name || "").toLowerCase();
    const combined = urlLower + " " + nameLower;
    if (suspectPatterns.some(p => combined.includes(p)) && !combined.includes("window") && !combined.includes("door") && !combined.includes("glass")) {
      if (suspectCount < 30) console.log("SUSPECT: " + f.replace(".json","") + " | " + (s.name || "").substring(0, 60) + " | " + (s.url || "").substring(0, 60));
      suspectCount++;
    }
  }
}
console.log("\nTotal suspect sources: " + suspectCount);
