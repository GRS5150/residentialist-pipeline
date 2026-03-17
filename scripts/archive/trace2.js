const fs = require("fs");

// Check both runs
const dirs = [
  "/Users/Residentialist/.openclaw/workspace/residentialist/outputs/andersen_aseries_2026-03-16T17-49-46/",
  "/Users/Residentialist/.openclaw/workspace/residentialist/outputs/andersen_aseries_2026-03-16T17-56-00/"
];

dirs.forEach(dir => {
  console.log("\n=== " + dir.split("/").slice(-2)[0] + " ===");
  const bot1 = fs.readFileSync(dir + "andersen_aseries_bot1_consensus.md", "utf8");
  
  // Search for ANY mention of years, lifespan, durability estimates
  const matches = [];
  bot1.split("\n").forEach((line, i) => {
    if (/\d+.*year|lifespan|life.span|expected.life|longevity|durability.*estimate/i.test(line)) {
      matches.push("L" + (i+1) + ": " + line.trim().slice(0, 250));
    }
  });
  
  if (matches.length === 0) {
    console.log("NO lifespan/year references found in Bot 1 output");
  } else {
    matches.forEach(m => console.log(m));
  }
  
  // Also check for "Fibrex" claims
  console.log("\n  Fibrex mentions:");
  bot1.split("\n").forEach((line, i) => {
    if (/fibrex/i.test(line)) {
      console.log("  L" + (i+1) + ": " + line.trim().slice(0, 250));
    }
  });
});
