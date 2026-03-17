const d = JSON.parse(require("fs").readFileSync("source_checklists/windows.json","utf8"));
const p2 = d.phase_2_web_searches || {};
for (const [section, data] of Object.entries(p2)) {
  console.log("=== " + section + " ===");
  if (Array.isArray(data)) {
    data.forEach(q => console.log("  " + (typeof q === "string" ? q : JSON.stringify(q))));
  } else if (typeof data === "object") {
    for (const [k, v] of Object.entries(data)) {
      console.log("  " + k + ": " + (Array.isArray(v) ? v.join("; ") : v));
    }
  }
}