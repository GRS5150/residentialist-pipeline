/**
 * Deterministic Validator Stub
 * The full validator is not deployed to the Mac Mini.
 * This stub allows the orchestrator to load without error.
 */

function validate(outputDir, productName) {
  // Stub: just check if DETERMINISTIC_SCORES.json exists
  const fs = require('fs');
  const path = require('path');
  const scoresPath = path.join(outputDir, 'DETERMINISTIC_SCORES.json');
  if (fs.existsSync(scoresPath)) {
    return { valid: true, status: 'PASS', message: 'Scores file exists' };
  }
  return { valid: false, status: 'SKIP', message: 'No scores file (validator stub)' };
}

module.exports = { validate };
