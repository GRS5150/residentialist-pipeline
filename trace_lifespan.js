const fs = require("fs");
const dir = "/Users/Residentialist/.openclaw/workspace/residentialist/outputs/andersen_aseries_2026-03-16T17-49-46/";

// Search Bot 1 consensus
const bot1 = fs.readFileSync(dir + "andersen_aseries_bot1_consensus.md", "utf8");
console.log("=== BOT 1 — lifespan/30-year references ===");
bot1.split("\n").forEach((line, i) => {
  if (/30.year|lifespan|life.span|expected.life|longevity|frame.life|durability.*year/i.test(line)) {
    console.log("L" + (i+1) + ": " + line.trim().slice(0, 200));
  }
});

// Search Bot 2 raw
const bot2raw = fs.readFileSync(dir + "andersen_aseries_bot2_evaluator_raw.md", "utf8");
console.log("\n=== BOT 2 RAW — lifespan/30-year references ===");
bot2raw.split("\n").forEach((line, i) => {
  if (/30.year|lifespan|life.span|expected.life|longevity|frame.life/i.test(line)) {
    console.log("L" + (i+1) + ": " + line.trim().slice(0, 200));
  }
});

// Search Bot 2 JSON for frame longevity reasoning
const bot2json = JSON.parse(fs.readFileSync(dir + "andersen_aseries_bot2_evaluator.json", "utf8"));
console.log("\n=== BOT 2 JSON — frame longevity ===");
console.log(JSON.stringify(bot2json.scores.durability.frame_longevity, null, 2));
console.log("\n=== BOT 2 JSON — expected lifespan ===");
console.log(JSON.stringify(bot2json.expected_lifespan, null, 2));
