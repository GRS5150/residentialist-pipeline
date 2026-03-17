const fs = require("fs");
const file = "source_parser.js";
let content = fs.readFileSync(file, "utf-8");
let changes = 0;

// Call site 1: Line ~1362 in parseSourcesForProduct (productName is in scope)
const old1 = "const cls = classifySource(url, title, description);";
const new1 = "const cls = classifySource(url, title, description, productName);";
if (content.includes(old1) && !content.includes(new1)) {
  content = content.replace(old1, new1);
  changes++;
  console.log("Fixed call site 1: parseSourcesForProduct loop");
}

// Call site 2: buildPhase1Sources — needs manufacturer name passed as product
// The function sig is buildPhase1Sources(checklist, manufacturer)
// We can pass manufacturer as the productName since extractManufacturer will return it as-is
const old2 = "const cls = classifySource(entry.url, entry.purpose || \x27\x27, \x27\x27);";
const new2 = "const cls = classifySource(entry.url, entry.purpose || \x27\x27, \x27\x27, manufacturer);";
if (content.includes(old2)) {
  content = content.replace(old2, new2);
  changes++;
  console.log("Fixed call site 2: buildPhase1Sources");
}

if (changes > 0) {
  fs.writeFileSync(file, content);
  console.log(changes + " call sites updated");
} else {
  console.log("No call sites to update (already patched?)");
}