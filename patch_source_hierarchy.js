const fs = require("fs");
const filePath = "/Users/Residentialist/.openclaw/workspace/residentialist/knowledge/Windows/windows_eval_knowledge_v1.2.md";
let content = fs.readFileSync(filePath, "utf8");

// Find the source hierarchy section boundaries
const startMarker = "## Source Authority Hierarchy";
const endMarker = "### Jay Johnson Special Access Rule";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log("ERROR: Could not find section boundaries");
  console.log("startIdx:", startIdx, "endIdx:", endIdx);
  process.exit(1);
}

// Replace the section
const before = content.substring(0, startIdx);
const after = content.substring(endIdx);
const newSection = fs.readFileSync("/Users/Residentialist/.openclaw/workspace/residentialist/knowledge/Windows/new_source_hierarchy_section.md", "utf8");

content = before + newSection + "\n" + after;
fs.writeFileSync(filePath, content);
console.log("PATCHED: Source hierarchy replaced with four-category taxonomy");
console.log("File size: " + content.length + " chars");
