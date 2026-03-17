const Database=require('better-sqlite3');
const db=new Database('residentialist.db',{readonly:true});
const products=db.prepare("SELECT id, product_name, category, overall_score, quality_score, durability_score, performance_score, material_safety_score, rubric_version, last_synced FROM products WHERE LOWER(category)='windows' ORDER BY last_synced DESC LIMIT 10").all();
const escalations=db.prepare("SELECT id, product_id, status, error_count, started_at, completed_at, notes FROM run_history WHERE status='ESCALATED' ORDER BY started_at DESC LIMIT 50").all();
console.log(JSON.stringify({products,escalations},null,2));
