/**
 * Add the missing rescore route to dashboard_server.js
 * Also check if deterministicScorer module exists and is loadable
 */
const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const SERVER_PATH = path.join(WORKSPACE, 'dashboard', 'dashboard_server.js');

// Check if the scorer module exists
const scorerPath = path.join(WORKSPACE, 'deterministic_scorer.js');
console.log(`[CHECK] deterministic_scorer.js exists: ${fs.existsSync(scorerPath)}`);

if (fs.existsSync(scorerPath)) {
  try {
    const scorer = require(scorerPath);
    console.log(`[CHECK] Scorer loaded. Exports: ${Object.keys(scorer).join(', ')}`);
    if (scorer.rescoreProduct) {
      console.log('[CHECK] rescoreProduct function available');
    } else {
      console.log('[CHECK] ⚠️ rescoreProduct NOT available in exports');
      console.log('[CHECK] Available functions:', Object.keys(scorer).filter(k => typeof scorer[k] === 'function').join(', '));
    }
  } catch (e) {
    console.log(`[CHECK] ⚠️ Scorer load error: ${e.message}`);
  }
}

// Add rescore route to server
let code = fs.readFileSync(SERVER_PATH, 'utf8');

if (code.includes('/rescore')) {
  console.log('[ROUTE] rescore route already in server');
} else {
  // Insert after the release route's `return true; }`
  const insertPoint = '  // POST /api/deepdive/start';
  
  const rescoreRoute = `  // POST /api/curation/:slug/rescore — recalculate score using curated sources
  const rescoreMatch = pathname.match(/^\\/api\\/curation\\/([^/]+)\\/rescore$/);
  if (rescoreMatch && req.method === 'POST') {
    try {
      const slug = rescoreMatch[1];
      if (!deterministicScorer) {
        sendJSON(res, { error: 'Scorer module not loaded' }, 500);
        return true;
      }
      // Try rescoreProduct if available, otherwise try scoreProduct
      let result;
      if (typeof deterministicScorer.rescoreProduct === 'function') {
        result = deterministicScorer.rescoreProduct(slug, 'windows');
      } else if (typeof deterministicScorer.scoreProduct === 'function') {
        result = deterministicScorer.scoreProduct(slug, 'windows');
      } else {
        // List available functions for debugging
        const funcs = Object.keys(deterministicScorer).filter(k => typeof deterministicScorer[k] === 'function');
        sendJSON(res, { error: 'No scoring function found. Available: ' + funcs.join(', ') }, 500);
        return true;
      }
      // Handle async scoring
      if (result && typeof result.then === 'function') {
        result = await result;
      }
      sendJSON(res, result || { success: true, message: 'Scored' });
    } catch (err) {
      console.error('[RESCORE ERROR]', err);
      sendJSON(res, { error: err.message, stack: err.stack?.split('\\n').slice(0, 5) }, 500);
    }
    return true;
  }

  `;
  
  if (code.includes(insertPoint)) {
    code = code.replace(insertPoint, rescoreRoute + insertPoint);
    fs.writeFileSync(SERVER_PATH, code);
    console.log('[ROUTE] ✅ Rescore route added to server');
    
    // Syntax check
    const { execSync } = require('child_process');
    try {
      execSync(`/usr/local/bin/node -c "${SERVER_PATH}"`, { stdio: 'pipe' });
      console.log('[SYNTAX] ✅ Passes');
    } catch (e) {
      console.error('[SYNTAX] ❌', e.stderr?.toString().split('\n').slice(0, 3).join('\n'));
    }
  } else {
    console.log('[ROUTE] ⚠️ Could not find insertion point');
  }
}
