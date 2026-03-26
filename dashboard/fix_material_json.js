/**
 * Two fixes:
 * 1. Fix curation_pipeline.js to explicitly declare material class in synthetic Bot 1 output
 * 2. Fix validateBotOutput to handle truncated JSON + trailing text from Bot 2
 */
const fs = require('fs');
const path = require('path');

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';

// ─── Fix 1: curation_pipeline.js — add explicit material class ───────────────
const cpPath = path.join(WORKSPACE, 'curation_pipeline.js');
let cp = fs.readFileSync(cpPath, 'utf8');

// Replace the material class section that currently says "should be determined"
const oldMaterialSection = `## MATERIAL CLASS

This product's material class should be determined from the specifications above.
The raw research below contains the full Perplexity deep dive report for reference.`;

const newMaterialSection = `## MATERIAL CLASS

\${materialClass}

IMPORTANT: The material class above is the verified classification for this product from the deep dive curation. Any references to other material classes in the raw research below may pertain to competitor products or different product lines — they should NOT override this classification.`;

if (cp.includes(oldMaterialSection)) {
  cp = cp.replace(oldMaterialSection, newMaterialSection);

  // Also add the materialClass variable computation before it's used
  const beforeAssembly = "// Assemble synthetic Bot 1 output";
  const materialClassComputation = `// Determine material class from structured data
  const verifiedSpecs = structuredOutput.verified_specs || {};
  let materialClass = verifiedSpecs.frame_material || verifiedSpecs.material_class || '';
  if (!materialClass) {
    // Try to infer from product name or specs
    const productLower = (curationData.product_name || '').toLowerCase();
    const specText = JSON.stringify(verifiedSpecs).toLowerCase();
    if (specText.includes('vinyl') || specText.includes('pvc') || specText.includes('extruded rigid')) materialClass = 'Vinyl';
    else if (specText.includes('fiberglass') || specText.includes('pultruded')) materialClass = 'Fiberglass';
    else if (specText.includes('aluminum-clad wood') || specText.includes('aluminium-clad')) materialClass = 'Aluminum-clad wood';
    else if (specText.includes('wood')) materialClass = 'Wood';
    else if (specText.includes('aluminum') || specText.includes('aluminium')) materialClass = 'Aluminum';
    else materialClass = 'Unknown — see specs above';
  }
  console.log(\`[CURATION PIPELINE] Detected material class: \${materialClass}\`);

  `;
  cp = cp.replace(beforeAssembly, materialClassComputation + beforeAssembly);
  fs.writeFileSync(cpPath, cp);
  console.log('[Fix 1] ✅ Material class explicitly declared in synthetic Bot 1 output');
} else {
  console.log('[Fix 1] ⚠️ Material class section not found');
}

// Syntax check
const { execSync } = require('child_process');
try {
  execSync(`/usr/local/bin/node -c "${cpPath}"`, { stdio: 'pipe' });
  console.log('[Fix 1] SYNTAX ✅');
} catch (e) {
  console.error('[Fix 1] SYNTAX ❌', e.stderr?.toString().split('\n').slice(0, 5).join('\n'));
}

// ─── Fix 2: Improve validateBotOutput JSON extraction ────────────────────────
const orchPath = path.join(WORKSPACE, 'bot_orchestrator_v3.js');
let orch = fs.readFileSync(orchPath, 'utf8');

// The current brace matching stops at the first balanced }, but Bot 2 outputs
// truncated JSON + trailing text. We need to: find the last } and try progressively
// shorter substrings, or use jsonrepair more aggressively.

// Replace the brace matching attempt with a smarter version
const oldBraceMatcher = `    // Attempt 3: Extract first JSON object using brace matching
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
    }`;

const newBraceMatcher = `    // Attempt 3: Extract JSON using multiple strategies
    if (!parsed) {
      const firstBrace = output.indexOf('{');
      if (firstBrace !== -1) {
        // Strategy A: Find the LAST balanced closing brace (largest object)
        let depth = 0;
        let lastBalanced = -1;
        for (let i = firstBrace; i < output.length; i++) {
          if (output[i] === '{') depth++;
          if (output[i] === '}') { depth--; if (depth === 0) { lastBalanced = i; /* don't break — find LAST */ } }
        }
        if (lastBalanced > firstBrace) {
          try { parsed = JSON.parse(output.substring(firstBrace, lastBalanced + 1)); } catch (e3a) { /* continue */ }
        }

        // Strategy B: If JSON is truncated (unbalanced braces), find the last } and add closing braces
        if (!parsed) {
          const lastBrace = output.lastIndexOf('}');
          if (lastBrace > firstBrace) {
            let candidate = output.substring(firstBrace, lastBrace + 1);
            // Count unbalanced braces and close them
            let opens = 0;
            for (const ch of candidate) { if (ch === '{') opens++; if (ch === '}') opens--; }
            if (opens > 0) candidate += '}'.repeat(opens);
            try { parsed = JSON.parse(candidate); } catch (e3b) { /* continue */ }
          }
        }

        // Strategy C: Strip trailing non-JSON text (everything after last })
        if (!parsed) {
          const stripped = output.substring(firstBrace).replace(/\\}[^}]*$/, '}');
          try { parsed = JSON.parse(stripped); } catch (e3c) { /* continue */ }
        }
      }
    }`;

if (orch.includes(oldBraceMatcher)) {
  orch = orch.replace(oldBraceMatcher, newBraceMatcher);
  fs.writeFileSync(orchPath, orch);
  console.log('[Fix 2] ✅ JSON extraction improved with 3 strategies');
} else {
  console.log('[Fix 2] ⚠️ Could not find brace matcher');
  // Check if it's already been partially updated
  if (orch.includes('Strategy A:')) {
    console.log('[Fix 2] Already updated');
  }
}

try {
  execSync(`/usr/local/bin/node -c "${orchPath}"`, { stdio: 'pipe' });
  console.log('[Fix 2] SYNTAX ✅');
} catch (e) {
  console.error('[Fix 2] SYNTAX ❌', e.stderr?.toString().split('\n').slice(0, 5).join('\n'));
}

console.log('\n[DONE]');
