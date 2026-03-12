
const fs = require('fs');
const path = require('path');

// LOCKED CORRECTION RULES — change only with Ray approval
// Each rule is enforced structurally, not by asking bots to comply
const CORRECTION_RULES = {
  'reliabilt_3500': {
    mandatory_2b_max: 3.5,
    overall_ceiling: 4.9,
    red_findings: ['atrium_bankruptcy', 'manufacturing_defect_pattern', 'installer_rejection'],
    notes: 'Budget band. 3 confirmed RED findings. Locked March 10 2026.'
  },
  'window_world_4000': {
    overall_ceiling: 4.9,
    notes: 'Budget band. Locked March 10 2026.'
  }
};

// BENCHMARK BANDS — expected score ranges for known products
const BENCHMARK_BANDS = {
  'andersen_400_series': { min: 7.0, max: 10.0, tier: 'Premium' },
  'marvin_integrity':    { min: 7.0, max: 10.0, tier: 'Premium' },
  'pella_250_series':    { min: 5.0, max: 6.9,  tier: 'Mid-range' },
  'jeldwen_v2500':       { min: 5.0, max: 6.9,  tier: 'Mid-range' },
  'milgard_tuscany':     { min: 5.0, max: 6.9,  tier: 'Mid-range' },
  'window_world_4000':   { min: 0.0, max: 4.9,  tier: 'Budget' },
  'reliabilt_3500':      { min: 0.0, max: 4.9,  tier: 'Budget' }
};

// LOCKED AXIS WEIGHTS — Ray Shapley, March 11 2026
// Q:35% D:35% P:30% — buyer-focused weights for durable goods
const AXIS_WEIGHTS = { Q: 0.35, D: 0.35, P: 0.30 };

function productKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/, '');
}

function extractAxisScores(text) {
  // Extract Q, D, P axis scores from bot2 evaluator
  const qMatch = text.match(/QUALITY[^:]*:\s*[A-Z][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/i);
  const dMatch = text.match(/DURABILITY[^:]*:\s*[A-Z][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/i);
  const pMatch = text.match(/PERFORMANCE[^:]*:\s*[A-Z][+-]?\s*\(([0-9]+\.[0-9]+)\/10\)/i);
  if (qMatch && dMatch && pMatch) {
    return { Q: parseFloat(qMatch[1]), D: parseFloat(dMatch[1]), P: parseFloat(pMatch[1]) };
  }
  return null;
}

function applyWeights(axes) {
  return Math.round(((axes.Q * AXIS_WEIGHTS.Q) + (axes.D * AXIS_WEIGHTS.D) + (axes.P * AXIS_WEIGHTS.P)) * 100) / 100;
}

function extractOverallScore(text) {
  const patterns = [
    /Proposed Overall[:\s*]+([0-9]+\.[0-9]+)/i,
    /Overall Score[:\s*]+([0-9]+\.[0-9]+)/i,
    /Final Score[:\s*]+([0-9]+\.[0-9]+)/i,
    /\*\*Proposed Overall.*?([0-9]+\.[0-9]+)/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseFloat(m[1]);
  }
  return null;
}

function extract2BScore(text) {
  const patterns = [
    /Final 2B score[^:]*:\s*([0-9]+\.[0-9]+)/i,
    /Net Final 2B[^:]*:[\s*]+([0-9]+\.[0-9]+)/i,
    /2B[\s*]+Score[^:]*:[\s*]+([0-9]+\.[0-9]+)/i,
    /Net 2B[\s*=]+.*?([0-9]+\.[0-9]+)\s*\/\s*10/i,
    /Materials.*?Durability.*?\*\*([0-9]+\.[0-9]+)\/10\*\*/i,
    /Materials.*?Durability.*?([0-9]+\.[0-9]+)\s*\/\s*10/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return parseFloat(m[1]);
  }
  return null;
}

function validate(outputDir, productName) {
  const key = productKey(productName);
  const violations = [];
  const warnings = [];
  const corrections = [];

  const files = fs.readdirSync(outputDir);
  // Read from bot5 reconciliation (final resolved scores), not bot4 challenge (disputed scores)
  const reconFile = files.find(f => f.includes('bot5_reconciliation'));
  const challengeFile = files.find(f => f.includes('bot4_challenge'));
  const sourceFile = reconFile || challengeFile;
  if (!sourceFile) {
    return { valid: false, violations: ['No Bot 5 reconciliation or Bot 4 challenge output found'], warnings: [] };
  }

  // Also read bot2 evaluator for overall score (bot5 reconciliation doesn't always contain it)
  const bot2File = files.find(f => f.includes('bot2_evaluator'));
  const bot2Text = bot2File ? fs.readFileSync(path.join(outputDir, bot2File), 'utf8') : '';
  const text = fs.readFileSync(path.join(outputDir, sourceFile), 'utf8');

  // Apply locked axis weights (Q:35% D:35% P:30%) structurally
  // Bots default to equal thirds — this corrects it without relying on bot compliance
  const axisScores = extractAxisScores(bot2Text);
  let overallScoreRaw = extractOverallScore(bot2Text) || extractOverallScore(text);
  let weightedScore = null;
  if (axisScores) {
    weightedScore = applyWeights(axisScores);
    if (Math.abs(weightedScore - overallScoreRaw) > 0.05) {
      corrections.push(
        'Axis weights corrected from equal thirds to Q:35% D:35% P:30% — ' +
        'raw=' + overallScoreRaw + ' → weighted=' + weightedScore +
        ' (Q:' + axisScores.Q + ' D:' + axisScores.D + ' P:' + axisScores.P + ')'
      );
      fs.writeFileSync(
        path.join(outputDir, 'WEIGHT_CORRECTED_SCORE.json'),
        JSON.stringify({ product: productName, axisScores, weights: AXIS_WEIGHTS, rawScore: overallScoreRaw, weightedScore, locked: 'March 11 2026' }, null, 2)
      );
    }
    overallScoreRaw = weightedScore || overallScoreRaw;
  }

  const score2B = extract2BScore(bot2Text) || extract2BScore(text);

  let overallScore = overallScoreRaw;

  // Check hard correction rules
  const rules = CORRECTION_RULES[key];
  if (rules) {
    // 2B max — demoted to warning; ceiling clamp handles final score enforcement
    if (rules.mandatory_2b_max !== undefined && score2B !== null) {
      if (score2B > rules.mandatory_2b_max + 0.1) {
        warnings.push(
          'BOT REASONING DRIFT: 2B score ' + score2B + ' exceeds expected maximum ' + rules.mandatory_2b_max +
          ' for ' + productName + '. RED findings should require: ' + (rules.red_findings || []).join(', ') +
          '. Final score corrected by ceiling clamp.'
        );
      }
    }
    // Overall ceiling — CLAMP and correct, do not fail
    // Ceiling is a material class rule (vinyl budget tier), not score manipulation
    if (rules.overall_ceiling !== undefined && overallScore !== null) {
      if (overallScore > rules.overall_ceiling + 0.05) {
        corrections.push(
          'Overall score clamped from ' + overallScore + ' to ' + rules.overall_ceiling +
          ' (vinyl material class ceiling for ' + productName + ' — locked March 10 2026)'
        );
        overallScore = rules.overall_ceiling;
        // Write corrected score file so report assembly uses it
        fs.writeFileSync(
          path.join(outputDir, 'CORRECTED_SCORE.json'),
          JSON.stringify({ product: productName, rawScore: overallScoreRaw, correctedScore: overallScore, reason: 'vinyl_material_class_ceiling', locked: 'March 10 2026' }, null, 2)
        );
      }
    }  }

  // ── MATERIAL CEILING BACKSTOP ────────────────────────────────────────────────
  // Pre-computed ceiling was injected into Bot 2's prompt upstream.
  // This is the final hard backstop — if Bot 2 still exceeded it, block pipeline.
  const MATERIAL_CEILINGS_V = {
    'pultruded fiberglass': 10, 'ultrex': 10,
    'aluminum-clad wood': 9,   'aluminum clad wood': 9,
    'roll-form': 8,            'vinyl-clad wood': 8,
    'composite': 7,            'fibrex': 7, 'proprietary': 7,
    'vinyl': 6,                'aluminum': 6,
  };
  const lockFilePath = path.join(outputDir, 'MATERIAL_CLASS_LOCK.json');
  if (fs.existsSync(lockFilePath)) {
    try {
      const lock = JSON.parse(fs.readFileSync(lockFilePath, 'utf8'));
      const matClass = (lock.materialClass || '').toLowerCase();
      let matCeiling = null;
      for (const [mkey, mval] of Object.entries(MATERIAL_CEILINGS_V)) {
        if (matClass.includes(mkey)) { matCeiling = mval; break; }
      }
      if (matCeiling !== null && score2B !== null && score2B > matCeiling + 0.05) {
        violations.push(
          'CEILING VIOLATION: 2B Materials Durability ' + score2B +
          ' exceeds maximum ' + matCeiling +
          ' for material class "' + lock.materialClass + '".' +
          ' Bot 2 ignored pre-computed ceiling. Pipeline blocked.'
        );
      } else if (matCeiling !== null && score2B !== null) {
        console.log('[VALIDATOR] 2B ceiling: ' + score2B + ' \u2264 ' + matCeiling + ' for "' + lock.materialClass + '" \u2713');
      }
    } catch(e) {
      warnings.push('Could not verify 2B ceiling — MATERIAL_CLASS_LOCK.json unreadable: ' + e.message);
    }
  }

    console.log('[VALIDATOR] ' + productName + ' | Overall: ' + overallScoreRaw + (overallScore !== overallScoreRaw ? ' → clamped to ' + overallScore : '') + ' | 2B: ' + score2B);

  // Check benchmark bands against clamped score (warning only, not hard fail)
  const band = BENCHMARK_BANDS[key];
  if (band && overallScore !== null) {
    if (overallScore < band.min || overallScore > band.max) {
      warnings.push(
        'BENCHMARK DRIFT: ' + productName + ' scored ' + overallScore +
        ', expected ' + band.tier + ' (' + band.min + '-' + band.max + ')'
      );
    }
  }

  const valid = violations.length === 0;
  // Ceiling corrections are structural enforcement, not failures — write PASS if only corrections
  const status = valid ? 'PASS' : 'FAIL';
  if (corrections.length > 0 && valid) {
    fs.writeFileSync(path.join(outputDir, 'VALIDATION_PASSED.txt'), 'VALIDATOR: PASS (with corrections)\n' + corrections.join('\n'));
  } else if (!valid) {
    fs.writeFileSync(path.join(outputDir, 'VALIDATION_FAILED.txt'), 'DETERMINISTIC VALIDATOR FAILED:\n' + violations.join('\n'));
  } else {
    fs.writeFileSync(path.join(outputDir, 'VALIDATION_PASSED.txt'), 'VALIDATOR: PASS');
  }
  const report = { timestamp: new Date().toISOString(), product: productName, key, overallScoreRaw, overallScore, score2B, valid, status, violations, corrections, warnings };
  fs.writeFileSync(path.join(outputDir, 'VALIDATION_REPORT.json'), JSON.stringify(report, null, 2));

  return report;
}

module.exports = { validate, CORRECTION_RULES, BENCHMARK_BANDS };

if (require.main === module) {
  const [,, outputDir, productName] = process.argv;
  if (!outputDir || !productName) { console.log('Usage: node deterministic_validator.js <outputDir> <productName>'); process.exit(1); }
  const result = validate(outputDir, productName);
  console.log('[VALIDATOR]', result.valid ? 'PASS' : 'FAIL');
  result.violations.forEach(v => console.log('  VIOLATION:', v));
  result.warnings.forEach(w => console.log('  WARNING:', w));
  process.exit(result.valid ? 0 : 1);
}



