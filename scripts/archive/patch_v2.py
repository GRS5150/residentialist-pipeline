import re
import sys

with open(sys.argv[1]) as f:
    code = f.read()

old = '"marvin_signature_ultimate_dh.json", name: "Marvin Signature Ultimate" },\n    { file: "window_world_4000_dh.json", name: "Window World 4000" }'
new = '"pella_impervia_dh.json", name: "Pella Impervia" },\n    { file: "andersen_400_series_dh.json", name: "Andersen 400 Series" },\n    { file: "reliabilt_3500_dh.json", name: "Reliabilt 3500" },\n    { file: "marvin_signature_ultimate_dh.json", name: "Marvin Signature Ultimate" },\n    { file: "window_world_4000_dh.json", name: "Window World 4000" }'

code = code.replace(old, new)
code = code.replace("staging_recommendation_results.json", "staging_recommendation_v2_results.json")

# Fix the summary section to handle variable product count
old_summary = """  const oldSpread = Math.abs(allResults[0].oldScore.score - allResults[1].oldScore.score);
  const newSpread = Math.abs(allResults[0].newScore.score - allResults[1].newScore.score);
  console.log(`\\n  OLD: Marvin ${allResults[0].oldScore.score} vs Window World ${allResults[1].oldScore.score}  (spread: ${Math.round(oldSpread*100)/100})`);
  console.log(`  NEW: Marvin ${allResults[0].newScore.score} vs Window World ${allResults[1].newScore.score}  (spread: ${Math.round(newSpread*100)/100})`);
  console.log(`\\n  Spread change: ${oldSpread.toFixed(2)} \\u2192 ${newSpread.toFixed(2)} (${newSpread > oldSpread ? "+" : ""}${(newSpread - oldSpread).toFixed(2)})`);
  if (newSpread > oldSpread) console.log(`  \\u2713 Spread INCREASED by ${((newSpread/oldSpread - 1) * 100).toFixed(0)}%`);
  else console.log(`  \\u2717 Spread decreased by ${((1 - newSpread/oldSpread) * 100).toFixed(0)}%`);
  
  console.log(`\\n  Sources used:`);
  console.log(`    Marvin:       ${allResults[0].oldScore.effectiveSources} \\u2192 ${allResults[0].newScore.effectiveSources}`);
  console.log(`    Window World: ${allResults[1].oldScore.effectiveSources} \\u2192 ${allResults[1].newScore.effectiveSources}`);

  // Recommendation ratios
  for (const r of allResults) {
    const pos = r.recDist.strong_recommend + r.recDist.recommend;
    const neg = r.recDist.caution + r.recDist.avoid;
    console.log(`    ${r.name}: ${pos} recommend vs ${neg} caution/avoid (${r.recDist.neutral} neutral)`);
  }"""

new_summary = """  // All products comparison table
  console.log(`\\n  PRODUCT COMPARISON TABLE:`);
  console.log(`  ${"Product".padEnd(30)} ${"Old PC".padStart(7)} ${"New PC".padStart(7)} ${"Delta".padStart(7)} ${"Rec".padStart(5)} ${"Caut".padStart(5)} ${"N/A".padStart(5)}`);
  console.log(`  ${"-".repeat(30)} ${"-".repeat(7)} ${"-".repeat(7)} ${"-".repeat(7)} ${"-".repeat(5)} ${"-".repeat(5)} ${"-".repeat(5)}`);
  for (const r of allResults) {
    const pos = r.recDist.strong_recommend + r.recDist.recommend;
    const neg = r.recDist.caution + r.recDist.avoid;
    const delta = (r.newScore.score - r.oldScore.score);
    const deltaStr = (delta >= 0 ? "+" : "") + delta.toFixed(2);
    console.log(`  ${r.name.padEnd(30)} ${r.oldScore.score.toFixed(2).padStart(7)} ${r.newScore.score.toFixed(2).padStart(7)} ${deltaStr.padStart(7)} ${String(pos).padStart(5)} ${String(neg).padStart(5)} ${String(r.recDist.not_applicable).padStart(5)}`);
  }

  // Spreads
  const oldScores = allResults.map(r => r.oldScore.score);
  const newScores = allResults.map(r => r.newScore.score);
  const oldRange = Math.max(...oldScores) - Math.min(...oldScores);
  const newRange = Math.max(...newScores) - Math.min(...newScores);
  console.log(`\\n  Score range (max - min):`);
  console.log(`    Old: ${oldRange.toFixed(2)}`);
  console.log(`    New: ${newRange.toFixed(2)}`);
  console.log(`    Change: ${oldRange.toFixed(2)} -> ${newRange.toFixed(2)} (${newRange > oldRange ? "+" : ""}${(newRange - oldRange).toFixed(2)})`);"""

code = code.replace(old_summary, new_summary)

with open(sys.argv[1], "w") as f:
    f.write(code)
print("PATCHED OK")
