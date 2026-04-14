/**
 * Update the dashboard server rescore route to fork curation_pipeline.js
 * as a child process for curated products, or use deterministicScorer for
 * products that already have Bot 2 output.
 */
const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const SERVER_PATH = path.join(WORKSPACE, 'dashboard', 'dashboard_server.js');
let code = fs.readFileSync(SERVER_PATH, 'utf8');

// Find the existing rescore route and replace it with a more complete version
const oldRescoreStart = "  // POST /api/curation/:slug/rescore — recalculate score using curated sources";

if (!code.includes(oldRescoreStart)) {
  console.log('[ERROR] Cannot find rescore route to update');
  process.exit(1);
}

// Find the end of the rescore route (next route start or closing)
const rescoreIdx = code.indexOf(oldRescoreStart);
const nextRouteMarker = "  // POST /api/deepdive/start";
const nextRouteIdx = code.indexOf(nextRouteMarker, rescoreIdx);

if (nextRouteIdx === -1) {
  console.log('[ERROR] Cannot find next route marker');
  process.exit(1);
}

const oldRescoreRoute = code.substring(rescoreIdx, nextRouteIdx);
console.log(`[INFO] Found rescore route (${oldRescoreRoute.length} chars), replacing...`);

const newRescoreRoute = `  // POST /api/curation/:slug/rescore — run scoring pipeline on curated product
  const rescoreMatch = pathname.match(/^\\/api\\/curation\\/([^/]+)\\/rescore$/);
  if (rescoreMatch && req.method === 'POST') {
    try {
      const slug = rescoreMatch[1];
      const curationFile = path.join(CURATION_DIR, slug + '_sources.json');
      const deepDiveDir = path.join(path.dirname(CURATION_DIR), 'deep_dives', slug);

      // Check if this product has a curation file (deep dive path)
      if (fs.existsSync(curationFile) && fs.existsSync(deepDiveDir)) {
        // Fork curation_pipeline.js as a child process (pipeline takes minutes)
        const { fork } = require('child_process');
        const pipelinePath = path.join(WORKSPACE, 'curation_pipeline.js');

        if (!fs.existsSync(pipelinePath)) {
          sendJSON(res, { error: 'curation_pipeline.js not found' }, 500);
          return true;
        }

        console.log(\`[RESCORE] Forking curation pipeline for: \${slug}\`);
        const child = fork(pipelinePath, [slug], {
          cwd: WORKSPACE,
          env: { ...process.env, OPENCLAW_WORKSPACE: WORKSPACE },
          stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        });

        let logOutput = '';
        child.stdout.on('data', d => { logOutput += d.toString(); console.log(\`[PIPELINE:\${slug}] \${d.toString().trim()}\`); });
        child.stderr.on('data', d => { logOutput += d.toString(); console.error(\`[PIPELINE:\${slug}] ERR: \${d.toString().trim()}\`); });

        child.on('exit', (code) => {
          console.log(\`[PIPELINE:\${slug}] Exited with code: \${code}\`);
          // Save log to output for debugging
          const logPath = path.join(WORKSPACE, 'curation', slug + '_pipeline_log.txt');
          try { fs.writeFileSync(logPath, logOutput); } catch (e) {}
        });

        sendJSON(res, {
          started: true,
          message: \`Pipeline started for \${slug} (Bot 2 → Scorer → Council)\`,
          note: 'Pipeline runs in background. Check curation list for updated score.'
        });
      } else if (deterministicScorer) {
        // No curation file — use existing Bot 2 output for rescore
        let result;
        if (typeof deterministicScorer.rescoreProduct === 'function') {
          result = deterministicScorer.rescoreProduct(slug, 'windows');
        } else {
          sendJSON(res, { error: 'No scoring function available' }, 500);
          return true;
        }
        if (result && typeof result.then === 'function') result = await result;
        sendJSON(res, result || { success: true });
      } else {
        sendJSON(res, { error: 'Neither curation file nor scorer module available' }, 500);
      }
    } catch (err) {
      console.error('[RESCORE ERROR]', err);
      sendJSON(res, { error: err.message }, 500);
    }
    return true;
  }

  `;

code = code.substring(0, rescoreIdx) + newRescoreRoute + code.substring(nextRouteIdx);

fs.writeFileSync(SERVER_PATH, code);
console.log('[DONE] ✅ Rescore route updated');

// Syntax check
const { execSync } = require('child_process');
try {
  execSync(`/usr/local/bin/node -c "${SERVER_PATH}"`, { stdio: 'pipe' });
  console.log('[SYNTAX] ✅ Passes');
} catch (e) {
  console.error('[SYNTAX] ❌', e.stderr?.toString().split('\n').slice(0, 5).join('\n'));
}
