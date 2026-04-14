/**
 * Patch validateBotOutput to add jsonrepair fallback and save raw output before validation.
 * Also moves Bot 2 raw output save to BEFORE validation to preserve evidence on crash.
 */
const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const FILE = path.join(WORKSPACE, 'bot_orchestrator_v3.js');

let code = fs.readFileSync(FILE, 'utf8');
let changed = false;

// ─── Patch 1: Update validateBotOutput to add jsonrepair fallback ────────────
const oldValidate = `function validateBotOutput(output, botName, productName, outputDir) {
  // For Bot 1: output is markdown (web search makes JSON unreliable). Validate non-empty.
  if (botName === 'Bot 1 (Consensus)') {
    if (!output || output.length < 300) {
      throw new Error(\`BOT FAILURE: \${botName} output too short (\${output?.length || 0} chars)\`);
    }
    return true;
  }

  // For Bots 2-6: output should be JSON. Try to parse it.
  try {
    const parsed = JSON.parse(output);
    // Bot 2 must have scores
    if (botName === 'Bot 2 (Evaluator)' && !parsed.scores) {
      throw new Error('Bot 2 output missing scores object');
    }
    // Bot 3 must have material_safety
    if (botName === 'Bot 3 (Material Safety)' && parsed.material_safety_score === undefined) {
      throw new Error('Bot 3 output missing material_safety_score');
    }
    return parsed;
  } catch (e) {
    if (e instanceof SyntaxError) {
      // JSON parse failed — try to extract JSON from markdown-wrapped response
      const jsonMatch = output.match(/\`\`\`json\\n?([\\s\\S]*?)\\n?\`\`\`/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          return parsed;
        } catch (e2) {
          // Fall through to error
        }
      }
      throw new Error(\`BOT FAILURE: \${botName} did not return valid JSON. Raw output starts with: \${output.substring(0, 200)}\`);
    }
    throw e;
  }
}`;

const newValidate = `function validateBotOutput(output, botName, productName, outputDir) {
  // For Bot 1: output is markdown (web search makes JSON unreliable). Validate non-empty.
  if (botName === 'Bot 1 (Consensus)') {
    if (!output || output.length < 300) {
      throw new Error(\`BOT FAILURE: \${botName} output too short (\${output?.length || 0} chars)\`);
    }
    return true;
  }

  // Save raw output immediately (before validation) so we don't lose it on crash
  if (outputDir) {
    const slug = productName.toLowerCase().replace(/\\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const botLabel = botName.includes('2') ? 'bot2_evaluator' : botName.includes('3') ? 'bot3_material_safety' : botName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const rawPath = path.join(outputDir, \`\${slug}_\${botLabel}_raw.md\`);
    try { fs.writeFileSync(rawPath, output); } catch (e) { /* ignore */ }
  }

  // For Bots 2-6: output should be JSON. Try to parse it.
  let parsed;
  
  // Attempt 1: Direct parse
  try {
    parsed = JSON.parse(output);
  } catch (e1) {
    // Attempt 2: Extract JSON from markdown fences
    const jsonMatch = output.match(/\`\`\`json\\n?([\\s\\S]*?)\\n?\`\`\`/);
    if (jsonMatch) {
      try { parsed = JSON.parse(jsonMatch[1]); } catch (e2) { /* continue */ }
    }

    // Attempt 3: Extract first JSON object using brace matching
    if (!parsed) {
      const firstBrace = output.indexOf('{');
      if (firstBrace !== -1) {
        let depth = 0;
        let lastBrace = -1;
        for (let i = firstBrace; i < output.length; i++) {
          if (output[i] === '{') depth++;
          if (output[i] === '}') { depth--; if (depth === 0) { lastBrace = i; break; } }
        }
        if (lastBrace > firstBrace) {
          try { parsed = JSON.parse(output.substring(firstBrace, lastBrace + 1)); } catch (e3) { /* continue */ }
        }
      }
    }

    // Attempt 4: jsonrepair fallback
    if (!parsed) {
      try {
        const { jsonrepair } = require('jsonrepair');
        const repaired = jsonrepair(output);
        parsed = JSON.parse(repaired);
        console.log(\`[VALIDATE] jsonrepair succeeded for \${botName}\`);
      } catch (e4) { /* continue */ }
    }

    if (!parsed) {
      throw new Error(\`BOT FAILURE: \${botName} did not return valid JSON. Raw output starts with: \${output.substring(0, 200)}\`);
    }
  }

  // Bot 2 must have scores
  if (botName === 'Bot 2 (Evaluator)' && !parsed.scores) {
    throw new Error('Bot 2 output missing scores object');
  }
  // Bot 3 must have material_safety
  if (botName === 'Bot 3 (Material Safety)' && parsed.material_safety_score === undefined) {
    throw new Error('Bot 3 output missing material_safety_score');
  }
  return parsed;
}`;

if (code.includes('// For Bots 2-6: output should be JSON. Try to parse it.')) {
  code = code.replace(oldValidate, newValidate);
  console.log('[PATCH] ✅ validateBotOutput updated with jsonrepair fallback and pre-save');
  changed = true;
} else {
  console.log('[PATCH] ⚠️ Could not find validateBotOutput');
}

if (changed) {
  fs.writeFileSync(FILE, code);
  const { execSync } = require('child_process');
  try {
    execSync(`/usr/local/bin/node -c "${FILE}"`, { stdio: 'pipe' });
    console.log('[SYNTAX] ✅ Passes');
  } catch (e) {
    console.error('[SYNTAX] ❌', e.stderr?.toString().split('\n').slice(0, 5).join('\n'));
  }
}
