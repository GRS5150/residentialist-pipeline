/**
 * THE RESIDENTIALIST — migrate_to_db.js
 * Phase 5: One-time migration of existing output directories into SQLite.
 * Works with existing residentialist.db schema (product_name, product_line columns).
 */

const fs = require('fs');
const path = require('path');
const db = require('./db');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const OUTPUT_DIR = path.join(WORKSPACE, 'outputs');

const CALIBRATION = [
  { product: 'Alpen Zenith ZR-7',   config: 'DH', category: 'windows', overall: 8.73, grade: 'A-',  Q: null,   D: null,   P: null  },
  { product: 'Marvin Integrity',     config: 'DH', category: 'windows', overall: 7.65, grade: 'B+',  Q: 8.075,  D: 8.0625, P: 6.80  },
  { product: 'Andersen 400 Series',  config: 'DH', category: 'windows', overall: 7.07, grade: 'B',   Q: 6.73,   D: 7.39,   P: 7.10  },
  { product: 'Milgard Tuscany',      config: 'DH', category: 'windows', overall: 6.92, grade: 'B-',  Q: 6.05,   D: 7.90,   P: 6.80  },
  { product: 'Pella 250 Series',     config: 'DH', category: 'windows', overall: 6.78, grade: 'B-',  Q: 6.43,   D: 7.13,   P: 6.77  },
  { product: 'Jeld-Wen V-2500',      config: 'DH', category: 'windows', overall: 5.76, grade: 'C+',  Q: 5.00,   D: 6.19,   P: 6.10  },
  { product: 'Pella 350 Series',     config: 'DH', category: 'windows', overall: 4.91, grade: 'D+',  Q: 4.50,   D: 4.94,   P: 5.29  },
  { product: 'Reliabilt 3500',       config: 'DH', category: 'windows', overall: 4.90, grade: 'D+',  Q: null,   D: null,   P: null  },
  { product: 'Window World 4000',    config: 'DH', category: 'windows', overall: 4.63, grade: 'D',   Q: 5.20,   D: 4.50,   P: 4.20  },
];

function gradeScale(s) {
  if (s >= 9.0) return 'A+'; if (s >= 8.5) return 'A';  if (s >= 8.0) return 'A-';
  if (s >= 7.5) return 'B+'; if (s >= 7.0) return 'B';  if (s >= 6.5) return 'B-';
  if (s >= 6.0) return 'C+'; if (s >= 5.5) return 'C';  if (s >= 5.0) return 'C-';
  if (s >= 4.5) return 'D+'; if (s >= 4.0) return 'D';  return 'F';
}

function parseOutputDir(dirName) {
  const dirPath = path.join(OUTPUT_DIR, dirName);
  const statusFile = path.join(dirPath, 'PIPELINE_STATUS.txt');
  if (!fs.existsSync(statusFile)) return null;

  const status = fs.readFileSync(statusFile, 'utf8');
  const productM = status.match(/PRODUCT:\s*(.+)/);
  const configM  = status.match(/CONFIG:\s*(.+)/);
  const tsM      = status.match(/TIMESTAMP:\s*(.+)/);
  const stateM   = status.match(/STATUS:\s*(.+)/);
  const overallM = status.match(/OVERALL:\s*([0-9.]+)/);
  const gradeM   = status.match(/GRADE:\s*([A-F][+-]?)/);
  const outlookM = status.match(/OUTLOOK:\s*(.+)/);
  const confM    = status.match(/DATA CONFIDENCE:\s*(\w+)/);
  const undiscM  = status.match(/\*\*(\d+) spec\(s\)/);
  if (!productM) return null;

  const product = productM[1].trim();
  const config  = configM ? configM[1].trim() : 'DH';
  const ts      = tsM ? tsM[1].trim() : '';
  const state   = stateM ? stateM[1].trim() : 'UNKNOWN';
  let overall = overallM ? parseFloat(overallM[1]) : null;
  let grade   = gradeM ? gradeM[1] : null;
  let outlook = outlookM ? outlookM[1].trim() : null;
  let Q = null, D = null, P = null;

  // Try council for overall
  const councilFile = path.join(dirPath, 'council_session.md');
  if (fs.existsSync(councilFile) && !overall) {
    const council = fs.readFileSync(councilFile, 'utf8');
    const oM = council.match(/\*\*(?:Proposed |Final |Confirmed )?Overall[:\s*]+([0-9]+\.[0-9]+)/i)
            || council.match(/Overall[:\s]+([0-9]+\.[0-9]+)/i);
    if (oM) overall = parseFloat(oM[1]);
  }

  // Try bot2 for axis scores
  try {
    const bot2Files = fs.readdirSync(dirPath).filter(f => f.includes('bot2_evaluator'));
    if (bot2Files.length > 0) {
      const bot2 = fs.readFileSync(path.join(dirPath, bot2Files[0]), 'utf8');
      if (!overall) {
        const ovM = bot2.match(/\*\*OVERALL:\s*[A-F][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/);
        if (ovM) overall = parseFloat(ovM[1]);
      }
      const calcLine = bot2.split('\n').find(l => l.includes('\u00d7') && l.includes('\u2192'));
      if (calcLine) {
        const re = /\(([0-9.]+)\s*\u00d7/g;
        const nums = []; let m;
        while ((m = re.exec(calcLine)) !== null) nums.push(parseFloat(m[1]));
        if (nums.length >= 3) { Q = nums[0]; D = nums[1]; P = nums[2]; }
        if (!overall) { const arrM = calcLine.match(/\u2192\s*([0-9]+\.[0-9]+)/); if (arrM) overall = parseFloat(arrM[1]); }
      }
    }
  } catch (e) {}

  if (!grade && overall) grade = gradeScale(overall);
  return { product, config, ts, state, overall, grade, outlook, quality: Q, durability: D, performance: P,
    dataConfidence: confM ? confM[1] : null, undisclosedCount: undiscM ? parseInt(undiscM[1]) : 0, runDir: dirName };
}

function migrate() {
  console.log('=== RESIDENTIALIST DB MIGRATION ===\n');

  // 1. Import calibration benchmarks
  console.log('Importing calibration benchmarks...');
  let calImported = 0;
  const dbInst = db.getDb();

  for (const cal of CALIBRATION) {
    // Check if already in scores table by source
    const existing = dbInst.prepare(`
      SELECT s.id FROM scores s JOIN products p ON s.product_id = p.id
      WHERE LOWER(TRIM(p.product_name)) = ? AND s.source = 'calibration' LIMIT 1
    `).get(cal.product.toLowerCase().trim());

    if (existing) { console.log('  Skip (exists): ' + cal.product); continue; }

    db.saveScore({
      product: cal.product, config: cal.config, category: cal.category,
      overall: cal.overall, grade: cal.grade,
      quality: cal.Q, durability: cal.D, performance: cal.P,
      source: 'calibration', notes: 'Imported from calibration benchmarks'
    });
    calImported++;
    console.log('  + ' + cal.product + ': ' + cal.overall + ' (' + cal.grade + ')');
  }
  console.log('Calibration: ' + calImported + ' imported\n');

  // 2. Scan output directories
  console.log('Scanning output directories...');
  let dirs;
  try {
    dirs = fs.readdirSync(OUTPUT_DIR).filter(f => {
      try { return fs.statSync(path.join(OUTPUT_DIR, f)).isDirectory(); } catch (e) { return false; }
    }).sort();
  } catch (e) { console.error('Cannot read outputs:', e.message); return; }

  let imported = 0, skipped = 0, failed = 0;

  for (const dir of dirs) {
    const data = parseOutputDir(dir);
    if (!data) { skipped++; continue; }

    // Check if run_dir already migrated
    const existingRun = dbInst.prepare('SELECT id FROM scores WHERE run_dir = ?').get(dir);
    if (existingRun) { skipped++; continue; }

    try {
      if (!data.state.includes('PASS') || !data.overall) {
        db.saveRun({ product: data.product, config: data.config, runDir: dir, status: data.state, notes: 'Migrated' });
        skipped++;
        continue;
      }

      db.saveScore({
        product: data.product, config: data.config, category: 'windows',
        overall: data.overall, grade: data.grade, outlook: data.outlook,
        quality: data.quality, durability: data.durability, performance: data.performance,
        dataConfidence: data.dataConfidence, undisclosedCount: data.undisclosedCount,
        source: 'pipeline', runDir: dir, notes: 'Migrated from ' + dir
      });
      db.saveRun({ product: data.product, config: data.config, runDir: dir, status: data.state, notes: 'Migrated' });
      imported++;
      console.log('  + ' + data.product + ': ' + data.overall + ' ' + data.grade + ' — ' + dir);
    } catch (e) {
      failed++;
      console.error('  x ' + dir + ': ' + e.message);
    }
  }

  console.log('\nMigration complete:');
  console.log('  Calibration: ' + calImported);
  console.log('  Pipeline: ' + imported + ' imported, ' + skipped + ' skipped, ' + failed + ' failed');

  const stats = db.getStats();
  console.log('\nDB Stats: ' + stats.products + ' products, ' + stats.scores + ' scores, ' + stats.runs + ' runs, avg ' + stats.avgScore);
  db.close();
}

migrate();
