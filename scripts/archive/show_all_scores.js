const db = require("./db");
const sqlDb = db.getDb();
const all = sqlDb.prepare("SELECT s.id, p.product_name as name, p.config, s.overall, s.grade, s.quality, s.durability, s.performance, s.run_dir, s.scored_at FROM scores s JOIN products p ON s.product_id = p.id ORDER BY s.overall DESC").all();
all.forEach(s => {
  console.log(JSON.stringify(s));
});
