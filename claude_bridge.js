const http = require('http');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const PORT = 7823;
const API_KEY = process.env.BRIDGE_API_KEY || 'residentialist-bridge-2026';

function log(msg) {
  const line = '[BRIDGE] ' + new Date().toISOString() + ' ' + msg;
  console.log(line);
  fs.appendFileSync('/Users/Residentialist/bridge.log', line + '\n');
}

function runCommand(cmd) {
  try {
    return { success: true, output: execSync(cmd, { cwd: WORKSPACE, timeout: 10000 }).toString() };
  } catch(e) {
    return { success: false, output: e.message };
  }
}

function readFile(filePath) {
  try {
    return { success: true, content: fs.readFileSync(filePath, 'utf8') };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function listOutputs() {
  try {
    const outputDir = path.join(WORKSPACE, 'outputs');
    const dirs = fs.readdirSync(outputDir).filter(f => fs.statSync(path.join(outputDir, f)).isDirectory());
    return dirs.sort().reverse().slice(0, 20);
  } catch(e) {
    return [];
  }
}

function getStatus() {
  const pipelineRunning = runCommand('pgrep -f auto_runner').success;
  const telegramRunning = runCommand('pgrep -f telegram_listener').success;
  const lastOutputs = listOutputs();
  const recentLog = runCommand('tail -20 /Users/Residentialist/deploy.log').output;
  return { pipelineRunning, telegramRunning, lastOutputs, recentLog, timestamp: new Date().toISOString() };
}

function gradeScale(s) {
  if (s >= 9.0) return 'A+'; if (s >= 8.5) return 'A';  if (s >= 8.0) return 'A-';
  if (s >= 7.5) return 'B+'; if (s >= 7.0) return 'B';  if (s >= 6.5) return 'B-';
  if (s >= 6.0) return 'C+'; if (s >= 5.5) return 'C';  if (s >= 5.0) return 'C-';
  if (s >= 4.5) return 'D+'; if (s >= 4.0) return 'D';  return 'F';
}

function getPipelineData() {
  const CALIBRATION = [
    { product: 'Alpen Zenith ZR-7',   config: 'DH', overall: 8.73, grade: 'A-',  Q: null,   D: null,   P: null  },
    { product: 'Marvin Integrity',     config: 'DH', overall: 7.65, grade: 'B+',  Q: 8.075,  D: 8.0625, P: 6.80  },
    { product: 'Andersen 400 Series',  config: 'DH', overall: 7.07, grade: 'B',   Q: 6.73,   D: 7.39,   P: 7.10  },
    { product: 'Milgard Tuscany',      config: 'DH', overall: 6.92, grade: 'B-',  Q: 6.05,   D: 7.90,   P: 6.80  },
    { product: 'Pella 250 Series',     config: 'DH', overall: 6.78, grade: 'B-',  Q: 6.43,   D: 7.13,   P: 6.77  },
    { product: 'Jeld-Wen V-2500',      config: 'DH', overall: 5.76, grade: 'C+',  Q: 5.00,   D: 6.19,   P: 6.10  },
    { product: 'Pella 350 Series',     config: 'DH', overall: 4.91, grade: 'D+',  Q: 4.50,   D: 4.94,   P: 5.29  },
    { product: 'Reliabilt 3500',       config: 'DH', overall: 4.90, grade: 'D+',  Q: null,   D: null,   P: null  },
    { product: 'Window World 4000',    config: 'DH', overall: 4.63, grade: 'D',   Q: 5.20,   D: 4.50,   P: 4.20  },
  ];

  const outputDir = path.join(WORKSPACE, 'outputs');
  const dirs = fs.readdirSync(outputDir)
    .filter(f => { try { return fs.statSync(path.join(outputDir, f)).isDirectory(); } catch(e) { return false; } })
    .sort().reverse();

  const evaluations = [];

  for (const dir of dirs) {
    try {
      const dirPath = path.join(outputDir, dir);
      const statusFile = path.join(dirPath, 'PIPELINE_STATUS.txt');
      if (!fs.existsSync(statusFile)) continue;

      const status = fs.readFileSync(statusFile, 'utf8');
      const productM = status.match(/PRODUCT:\s*(.+)/);
      const configM  = status.match(/CONFIG:\s*(.+)/);
      const tsM      = status.match(/TIMESTAMP:\s*(.+)/);
      const stateM   = status.match(/STATUS:\s*(.+)/);
      if (!productM) continue;

      const product = productM[1].trim();
      const config  = configM  ? configM[1].trim() : 'DH';
      const ts      = tsM      ? tsM[1].trim()     : '';
      const state   = stateM   ? stateM[1].trim()  : 'UNKNOWN';

      let overall = null, Q = null, D = null, P = null;

      // 1. Try council_session.md for overall
      const councilFile = path.join(dirPath, 'council_session.md');
      if (fs.existsSync(councilFile)) {
        const council = fs.readFileSync(councilFile, 'utf8');
        const oM = council.match(/\*\*(?:Proposed |Final |Confirmed )?Overall[:\s*]+([0-9]+\.[0-9]+)/i)
                || council.match(/Overall[:\s]+([0-9]+\.[0-9]+)/i);
        if (oM) overall = parseFloat(oM[1]);
      }

      // 2. Try bot2 for overall + axis scores
      const bot2Files = fs.readdirSync(dirPath).filter(f => f.includes('bot2_evaluator'));
      if (bot2Files.length > 0) {
        const bot2 = fs.readFileSync(path.join(dirPath, bot2Files[0]), 'utf8');

        // **OVERALL: B (7.24/10)**
        if (!overall) {
          const ovM = bot2.match(/\*\*OVERALL:\s*[A-F][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/);
          if (ovM) overall = parseFloat(ovM[1]);
        }

        // Weighted calc line: (7.27 × 0.35) + (7.60 × 0.35) + (6.6 × 0.30) = ... → 7.24
        const bot2Lines = bot2.split('\n');
        const calcLine = bot2Lines.find(function(l) {
          return l.indexOf('\u00d7') !== -1 && l.indexOf('\u2192') !== -1;
        });
        if (calcLine) {
          const re = /\(([0-9.]+)\s*\u00d7/g;
          const nums = [];
          let m;
          while ((m = re.exec(calcLine)) !== null) nums.push(parseFloat(m[1]));
          if (nums.length >= 3) { Q = nums[0]; D = nums[1]; P = nums[2]; }
          const arrM = calcLine.match(/\u2192\s*([0-9]+\.[0-9]+)/);
          if (arrM && !overall) overall = parseFloat(arrM[1]);
        }
      }

      evaluations.push({
        dir, product, config, ts, state,
        overall: overall,
        grade: overall ? gradeScale(overall) : null,
        Q: Q, D: D, P: P
      });
    } catch(e) {
      // skip bad dirs silently
    }
  }

  return { calibration: CALIBRATION, evaluations: evaluations, timestamp: new Date().toISOString() };
}

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const url = req.url;

    // Public routes — no auth
    if (req.method === 'OPTIONS') { 
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'x-api-key, Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.writeHead(204); res.end(); return; 
    }
    if (req.method === 'GET' && (url === '/dashboard' || url === '/')) {
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      try {
        const dashPath = path.join(WORKSPACE, 'dashboard.html');
        if (fs.existsSync(dashPath)) {
          res.end(fs.readFileSync(dashPath, 'utf8'));
        } else {
          res.end('<html><body><h1>Dashboard not found</h1><p>Place dashboard.html in workspace.</p></body></html>');
        }
      } catch(e) {
        res.end('<html><body><h1>Dashboard error</h1><p>' + e.message + '</p></body></html>');
      }
      return;
    }

    const auth = req.headers['x-api-key'];
    if (auth !== API_KEY) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'x-api-key, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    try {
      const url = req.url;
      if (req.method === 'GET' && url === '/status') {
        res.writeHead(200);
        res.end(JSON.stringify(getStatus()));
        return;
      }

      if (req.method === 'GET' && url.startsWith('/logs')) {
        const params = new URL(url, 'http://localhost').searchParams;
        const file = params.get('file') || 'deploy';
        const logMap = {
          deploy: '/Users/Residentialist/deploy.log',
          bridge: '/Users/Residentialist/bridge.log',
          telegram: '/Users/Residentialist/telegram.log',
          cron: '/Users/Residentialist/deploy_cron.log',
          diagnose: path.join(WORKSPACE, 'diagnose.log')
        };
        const logPath = logMap[file] || logMap.deploy;
        const tail = runCommand('tail -100 ' + logPath);
        res.writeHead(200);
        res.end(JSON.stringify({ file, content: tail.output }));
        return;
      }

      if (req.method === 'GET' && url.startsWith('/file')) {
        const params = new URL(url, 'http://localhost').searchParams;
        const filePath = params.get('path');
        if (!filePath) { res.writeHead(400); res.end(JSON.stringify({ error: 'No path' })); return; }
        const fullPath = filePath.startsWith('/') ? filePath : path.join(WORKSPACE, filePath);
        const result = readFile(fullPath);
        res.writeHead(result.success ? 200 : 404);
        res.end(JSON.stringify(result));
        return;
      }

      if (req.method === 'GET' && url === '/outputs') {
        res.writeHead(200);
        res.end(JSON.stringify({ outputs: listOutputs() }));
        return;
      }

      if (req.method === 'GET' && url === '/pipeline') {
        res.writeHead(200);
        res.end(JSON.stringify(getPipelineData()));
        return;
      }

      if (req.method === 'POST' && url === '/run') {
        const data = JSON.parse(body);
        if (!data.product) { res.writeHead(400); res.end(JSON.stringify({ error: 'No product' })); return; }
        const config = data.config || 'DH';
        const category = data.category || 'Windows';
        log('RUN: ' + data.product + ' ' + config + ' ' + category);
        const child = spawn('node', ['auto_runner.js', data.product, config, category], {
          cwd: WORKSPACE, detached: true, stdio: 'ignore'
        });
        child.unref();
        res.writeHead(200);
        res.end(JSON.stringify({ started: true, product: data.product, config, category }));
        return;
      }

      // Phase 4: POST /diagnose — error diagnosis endpoint
      if (req.method === 'POST' && url === '/diagnose') {
        const data = JSON.parse(body);
        log('DIAGNOSE: ' + (data.context || 'no context'));
        const { diagnose, executeAutoFix } = require('./diagnose');
        diagnose({
          error: data.error || '',
          context: data.context || '',
          attempt: data.attempt || 0,
          product: data.product || '',
          step: data.step || ''
        }).then(async (result) => {
          log('DIAGNOSIS: ' + result.action + ' — ' + result.reason);
          if (result.autoFixed) {
            await executeAutoFix(result, {
              product: data.product,
              config: data.config,
              category: data.category
            });
          }
          res.writeHead(200);
          res.end(JSON.stringify(result));
        }).catch(err => {
          log('DIAGNOSE ERROR: ' + err.message);
          res.writeHead(500);
          res.end(JSON.stringify({ action: 'ESCALATE', reason: 'Diagnosis failed: ' + err.message, autoFixed: false }));
        });
        return;
      }


      // Phase 5: GET /db/scores — all products with latest scores
      if (req.method === 'GET' && url === '/db/scores') {
        try {
          const db = require('./db');
          const scores = db.getAllScores();
          res.writeHead(200);
          res.end(JSON.stringify({ scores, stats: db.getStats() }));
        } catch(e) {
          log('DB ERROR: ' + e.message);
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
        return;
      }

      // GET /db/scores/grouped — scores grouped by material group (clad vs non-clad)
      if (req.method === 'GET' && url === '/db/scores/grouped') {
        try {
          const db = require('./db');
          const grouped = db.getScoresByGroup();
          res.writeHead(200);
          res.end(JSON.stringify(grouped));
        } catch(e) {
          log('DB ERROR: ' + e.message);
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
        return;
      }

      // GET /db/escalations — all escalated runs for the escalation dashboard
      if (req.method === 'GET' && url === '/db/escalations') {
        try {
          const db = require('./db');
          const dbInst = db.getDb();
          const escalations = dbInst.prepare(`
            SELECT p.product_name as name, p.config, rh.run_dir, rh.status,
                   rh.attempts, rh.error_count, rh.started_at, rh.completed_at, rh.notes
            FROM run_history rh
            JOIN products p ON rh.product_id = p.id
            WHERE rh.status = 'ESCALATED'
            ORDER BY rh.started_at DESC
            LIMIT 50
          `).all();
          res.writeHead(200);
          res.end(JSON.stringify({ escalations }));
        } catch(e) {
          log('DB ERROR: ' + e.message);
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
        return;
      }

      // Phase 5: GET /db/product?name=...&config=DH — single product detail
      if (req.method === 'GET' && url.startsWith('/db/product')) {
        try {
          const db = require('./db');
          const params = new URL(url, 'http://localhost').searchParams;
          const name = params.get('name');
          const config = params.get('config') || 'DH';
          if (!name) { res.writeHead(400); res.end(JSON.stringify({ error: 'No name' })); return; }
          const score = db.getScore(name, config);
          const history = db.getScoreHistory(name, config);
          const runs = db.getRunHistory(name, config);
          res.writeHead(200);
          res.end(JSON.stringify({ score, history, runs }));
        } catch(e) {
          log('DB ERROR: ' + e.message);
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
        return;
      }

      // Phase 5: GET /db/stats — database summary
      if (req.method === 'GET' && url === '/db/stats') {
        try {
          const db = require('./db');
          res.writeHead(200);
          res.end(JSON.stringify(db.getStats()));
        } catch(e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
        return;
      }

      // Phase 5: GET /db/check?name=...&config=DH — is product already scored?
      if (req.method === 'GET' && url.startsWith('/db/check')) {
        try {
          const db = require('./db');
          const params = new URL(url, 'http://localhost').searchParams;
          const name = params.get('name');
          const config = params.get('config') || 'DH';
          res.writeHead(200);
          res.end(JSON.stringify({ name, config, scored: db.isScored(name, config) }));
        } catch(e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
        return;
      }


      // Phase 6: POST /spec/parse — parse a spec sheet file
      if (req.method === 'POST' && url === '/spec/parse') {
        const data = JSON.parse(body);
        if (!data.file) { res.writeHead(400); res.end(JSON.stringify({ error: 'No file path' })); return; }

        const filePath = data.file.startsWith('/') ? data.file : path.join(WORKSPACE, data.file);
        if (!fs.existsSync(filePath)) {
          res.writeHead(404); res.end(JSON.stringify({ error: 'File not found: ' + filePath })); return;
        }

        log('SPEC PARSE: ' + filePath);

        // Load config for auto-queue setting
        let autoQueue = true;
        try {
          const config = JSON.parse(fs.readFileSync(path.join(WORKSPACE, 'config.json'), 'utf8'));
          if (config.spec_ingestion && config.spec_ingestion.auto_queue_specs === false) autoQueue = false;
        } catch(e) {}

        const { parseSpecSheet } = require('./spec_parser');
        parseSpecSheet(filePath, {
          builder: data.builder || null,
          address: data.address || null,
          autoQueue: data.autoQueue !== undefined ? data.autoQueue : autoQueue
        }).then(result => {
          // Save to DB
          try {
            const db = require('./db');
            const specId = db.saveSpecSheet({
              source: data.source || 'API',
              builder: data.builder || result.summary?.source,
              address: data.address || result.summary?.property,
              rawText: null, // Don't store raw text to save space
              products: result.products,
              ambiguous: result.ambiguous,
              summary: result.summary
            });
            result.spec_id = specId;
          } catch(e) {
            log('DB save error: ' + e.message);
            result.db_error = e.message;
          }

          // Send Telegram notification
          try {
            const { formatTelegramMessage } = require('./spec_parser');
            const { sendTelegram } = require('./auto_runner');
            const msg = formatTelegramMessage(result);
            sendTelegram(msg);
          } catch(e) {
            log('Telegram notify error: ' + e.message);
          }

          res.writeHead(200);
          res.end(JSON.stringify(result));
        }).catch(err => {
          log('SPEC PARSE ERROR: ' + err.message);
          res.writeHead(500);
          res.end(JSON.stringify({ success: false, error: err.message }));
        });
        return;
      }

      // Phase 6: GET /spec/list — list parsed spec sheets
      if (req.method === 'GET' && url.startsWith('/spec/list')) {
        try {
          const db = require('./db');
          const params = new URL(url, 'http://localhost').searchParams;
          const limit = parseInt(params.get('limit') || '50');
          const specs = db.getSpecSheets(limit);
          const stats = db.getSpecStats();
          res.writeHead(200);
          res.end(JSON.stringify({ specs, stats }));
        } catch(e) {
          log('SPEC LIST ERROR: ' + e.message);
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
        return;
      }

      // Phase 6: GET /spec/detail?id=... — single spec sheet detail
      if (req.method === 'GET' && url.startsWith('/spec/detail')) {
        try {
          const db = require('./db');
          const params = new URL(url, 'http://localhost').searchParams;
          const specId = params.get('id');
          if (!specId) { res.writeHead(400); res.end(JSON.stringify({ error: 'No id' })); return; }
          const spec = db.getSpecSheet(specId);
          if (!spec) { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return; }
          res.writeHead(200);
          res.end(JSON.stringify(spec));
        } catch(e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
        return;
      }

      // Phase 6: POST /spec/upload — receive file upload (base64) and parse
      if (req.method === 'POST' && url === '/spec/upload') {
        const data = JSON.parse(body);
        if (!data.filename || !data.content) {
          res.writeHead(400); res.end(JSON.stringify({ error: 'Need filename and content (base64)' })); return;
        }

        const SPEC_UPLOAD_DIR = path.join(WORKSPACE, 'spec_uploads');
        if (!fs.existsSync(SPEC_UPLOAD_DIR)) fs.mkdirSync(SPEC_UPLOAD_DIR, { recursive: true });

        const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const savePath = path.join(SPEC_UPLOAD_DIR, `${Date.now()}_${safeName}`);
        fs.writeFileSync(savePath, Buffer.from(data.content, 'base64'));
        log('SPEC UPLOAD: ' + savePath);

        // Auto-parse
        let autoQueue = true;
        try {
          const config = JSON.parse(fs.readFileSync(path.join(WORKSPACE, 'config.json'), 'utf8'));
          if (config.spec_ingestion && config.spec_ingestion.auto_queue_specs === false) autoQueue = false;
        } catch(e) {}

        const { parseSpecSheet } = require('./spec_parser');
        parseSpecSheet(savePath, {
          builder: data.builder || null,
          address: data.address || null,
          autoQueue: data.autoQueue !== undefined ? data.autoQueue : autoQueue
        }).then(result => {
          try {
            const db = require('./db');
            const specId = db.saveSpecSheet({
              source: 'upload',
              builder: data.builder || result.summary?.source,
              address: data.address || result.summary?.property,
              products: result.products,
              ambiguous: result.ambiguous,
              summary: result.summary
            });
            result.spec_id = specId;
          } catch(e) { result.db_error = e.message; }

          try {
            const { formatTelegramMessage } = require('./spec_parser');
            const { sendTelegram } = require('./auto_runner');
            sendTelegram(formatTelegramMessage(result));
          } catch(e) {}

          res.writeHead(200);
          res.end(JSON.stringify(result));
        }).catch(err => {
          res.writeHead(500);
          res.end(JSON.stringify({ success: false, error: err.message }));
        });
        return;
      }


      if (req.method === 'POST' && url === '/write') {
        const data = JSON.parse(body);
        if (!data.path || !data.content) { res.writeHead(400); res.end(JSON.stringify({ error: 'No path or content' })); return; }
        const fullPath = data.path.startsWith('/') ? data.path : path.join(WORKSPACE, data.path);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, data.content);
        log('WRITE: ' + fullPath);
        res.writeHead(200);
        res.end(JSON.stringify({ written: true, path: fullPath }));
        return;
      }

      if (req.method === 'POST' && url === '/shell') {
        const data = JSON.parse(body);
        if (!data.cmd) { res.writeHead(400); res.end(JSON.stringify({ error: 'No cmd' })); return; }
        log('SHELL: ' + data.cmd);
        const result = runCommand(data.cmd);
        res.writeHead(200);
        res.end(JSON.stringify(result));
        return;
      }


      // Phase 4: POST /restart — graceful restart (watchdog will revive)
      if (req.method === 'POST' && url === '/restart') {
        log('RESTART requested — exiting for watchdog restart');
        res.writeHead(200);
        res.end(JSON.stringify({ restarting: true, message: 'Bridge will restart in ~5 seconds via watchdog' }));
        setTimeout(() => process.exit(0), 500);
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));

    } catch(e) {
      log('ERROR: ' + e.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  log('Claude Bridge listening on port ' + PORT);
});

process.on('uncaughtException', err => log('UNCAUGHT: ' + err.message));

