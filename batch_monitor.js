
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Database = require('better-sqlite3');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const DB_PATH = path.join(WORKSPACE, 'residentialist.db');

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
}

function safeJsonFromText(txt) {
  try { return JSON.parse(txt); } catch (e) {}
  const startObj = txt.indexOf('{');
  const startArr = txt.indexOf('[');
  let start = -1;
  if (startObj === -1) start = startArr;
  else if (startArr === -1) start = startObj;
  else start = Math.min(startObj, startArr);
  if (start === -1) throw new Error('No JSON start token found');
  return JSON.parse(txt.slice(start).trim());
}

function getPs() {
  const ps = run(`ps aux | grep batch_rescore | grep -v grep || true`).trim();
  return { running: ps.length > 0, ps };
}

function queryAll(sql, params=[]) {
  const db = new Database(DB_PATH, { readonly: true });
  try {
    return db.prepare(sql).all(params);
  } finally {
    db.close();
  }
}

function fileExists(p) {
  try { fs.accessSync(p, fs.constants.F_OK); return true; } catch(e) { return false; }
}

function main() {
  const summaryPath = path.join(WORKSPACE, 'outputs/phase9_rescore_summary.json');
  const result = {
    timestamp: new Date().toISOString(),
    process: null,
    products: null,
    escalations: null,
    summary: { exists: fileExists(summaryPath), path: summaryPath, data: null }
  };

  result.process = getPs();

  try {
    const rows = queryAll(`
      SELECT id, product_name, category, overall_score, quality_score, durability_score, performance_score,
             material_safety_score, rubric_version, eval_id, last_synced
      FROM products
      ORDER BY COALESCE(last_synced, '') DESC
      LIMIT 25
    `);
    result.products = { ok: true, rows };
  } catch (e) {
    result.products = { ok: false, error: String(e) };
  }

  try {
    const rows = queryAll(`
      SELECT id, product_id, status, error_count, self_corrected, started_at, completed_at, notes
      FROM run_history
      WHERE status = 'ESCALATED'
      ORDER BY id DESC
      LIMIT 50
    `);
    result.escalations = { ok: true, rows };
  } catch (e) {
    result.escalations = { ok: false, error: String(e) };
  }

  if (result.summary.exists) {
    try {
      const txt = fs.readFileSync(summaryPath,'utf8');
      result.summary.data = safeJsonFromText(txt);
    } catch(e) {
      result.summary.data = { parse_error: String(e) };
    }
  }

  console.log(JSON.stringify(result));
}

main();
