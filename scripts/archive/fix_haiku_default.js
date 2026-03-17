const fs = require("fs");
const FILE = "relevance_classifier.js";
let content = fs.readFileSync(FILE, "utf8");

// Find the Haiku error catch block and change relevant:true to relevant:false
const old = "On API error, default to INCLUDE";
const newText = "On API error, default to REJECT (fail-closed — unverified sources should not be included)";
if (content.includes(old)) {
  content = content.replace(old, newText);
  console.log("Updated comment");
}

// Now find the relevant: true near Haiku API error
const idx = content.indexOf("Haiku API error");
if (idx > -1) {
  // Go backwards to find relevant: true
  const before = content.substring(idx - 200, idx);
  const relIdx = before.lastIndexOf("relevant: true");
  if (relIdx > -1) {
    const absIdx = idx - 200 + relIdx;
    content = content.substring(0, absIdx) + "relevant: false" + content.substring(absIdx + 14);
    console.log("Changed relevant: true to relevant: false for Haiku error path");
  } else {
    console.log("Could not find relevant: true before Haiku API error");
  }
}

fs.writeFileSync(FILE, content);
console.log("Done");
