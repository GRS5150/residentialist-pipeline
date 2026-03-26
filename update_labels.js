const Database = require('better-sqlite3');
const db = new Database('/Users/Residentialist/.openclaw/workspace/residentialist/residentialist.db');

// Scores in DB are 0-10 scale. The handoff doc says "multiply by 10 for display"
// But labels should use 0-100 scale (score * 10)
function getLabel(score) {
  const s = score * 10; // convert 0-10 to 0-100
  if (s >= 90) return "Best in Class";
  if (s >= 75) return "Excellent";
  if (s >= 60) return "Good";
  if (s >= 40) return "Fair";
  return "Below Standard";
}

function getHealthLabel(score) {
  if (score >= 9.0) return "Excellent";
  if (score >= 8.0) return "Good";
  if (score >= 7.0) return "Moderate";
  return "Material Concern";
}

// First check what scale the scores are in
const sample = db.prepare("SELECT id, product_name, overall_score, material_safety_score FROM products WHERE status = 'active' AND overall_score IS NOT NULL LIMIT 3").all();
console.log("Sample scores:", JSON.stringify(sample));

// Determine scale - if max > 10, scores are 0-100 already
const maxScore = db.prepare("SELECT MAX(overall_score) as m FROM products").get();
console.log("Max overall_score:", maxScore.m);

const isHundredScale = maxScore.m > 10;
console.log("Scale:", isHundredScale ? "0-100" : "0-10");

const products = db.prepare("SELECT id, product_name, overall_score, material_safety_score FROM products WHERE status = 'active' AND overall_score IS NOT NULL").all();

const updateStmt = db.prepare("UPDATE products SET product_label = ?, health_label = ? WHERE id = ?");

products.forEach(p => {
  let displayScore;
  if (isHundredScale) {
    displayScore = p.overall_score; // already 0-100
  } else {
    displayScore = p.overall_score * 10; // convert to 0-100
  }
  
  let label;
  if (displayScore >= 90) label = "Best in Class";
  else if (displayScore >= 75) label = "Excellent";
  else if (displayScore >= 60) label = "Good";
  else if (displayScore >= 40) label = "Fair";
  else label = "Below Standard";
  
  let healthScore = p.material_safety_score;
  let health = null;
  if (healthScore != null) {
    if (isHundredScale) healthScore = healthScore / 10; // normalize to 0-10
    if (healthScore >= 9.0) health = "Excellent";
    else if (healthScore >= 8.0) health = "Good";
    else if (healthScore >= 7.0) health = "Moderate";
    else health = "Material Concern";
  }
  
  updateStmt.run(label, health, p.id);
  console.log(`${p.product_name}: score=${p.overall_score} (display=${displayScore}) -> ${label}, safety=${p.material_safety_score} -> ${health}`);
});

console.log("LABELS_UPDATED:", products.length, "products");
db.close();
