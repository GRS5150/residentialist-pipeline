#!/usr/bin/env node
/**
 * patch_bot2_evidence_standards.js
 * Patches bot_orchestrator_v2.js with two fixes:
 * 1. Evidence classification standards for Bot 2 Judgment scoring
 * 2. Universal Principles enforcement (certification floor, not midpoint)
 */

const fs = require('fs');
const path = require('path');

const ORCHESTRATOR_PATH = '/home/ubuntu/.openclaw/workspace/residentialist/bot_orchestrator_v2.js';

// Read the file
let content = fs.readFileSync(ORCHESTRATOR_PATH, 'utf8');

// Backup
fs.writeFileSync(ORCHESTRATOR_PATH + '.bak2', content);
console.log('[PATCH] Backup saved to bot_orchestrator_v2.js.bak2');

// ─────────────────────────────────────────────────────────────────────────────
// PATCH 1: Find the end of the BOT2_EVALUATOR_PROMPT and inject evidence rules
// We look for a closing section of the prompt before the closing backtick
// ─────────────────────────────────────────────────────────────────────────────

const EVIDENCE_RULES = `

## MANDATORY EVIDENCE CLASSIFICATION RULES — MUST FOLLOW BEFORE EVERY JUDGMENT SCORE

### Evidence Thresholds
Before assigning ANY Judgment score, you MUST classify your evidence using these standards:

**RED Finding** (pipeline-halting, major score impact):
- Requires: 2 or more INDEPENDENT verified sources confirming the same specific defect, OR
- A credible third-party document: court ruling (certified, not dismissed), CPSC recall, independent lab test, investigative journalism from a named publication
- A DENIED class action is NOT a RED finding — it means the legal system evaluated the claim and rejected it. This is evidence in the manufacturer's FAVOR.
- A single customer complaint, forum post, or review — regardless of severity — is NOT a RED finding under any circumstances.

**YELLOW Finding** (advisory, moderate score impact):
- Requires: A pattern of similar complaints across multiple UNRELATED sources (minimum 3 distinct sources)
- OR: One moderately credible secondary source (trade publication, contractor forum with professional respondents)
- A single source, even if detailed, is a NOTE — not a YELLOW finding.

**NOTE** (informational only, minimal score impact):
- Any single-source claim, anecdote, or unverified report
- Forum posts, individual reviews, social media
- These may be mentioned in findings but CANNOT anchor a Judgment score below 4.0

### Judgment Score Floor Rules
- If your ONLY negative evidence is Notes (single-source), Judgment CANNOT be below 4.0
- If your evidence is YELLOW (pattern, multiple sources), Judgment range is 3.0–6.0 depending on severity
- If your evidence is RED (verified, multi-source), Judgment range is 1.0–4.0
- You MUST state your evidence classification and source count before writing any Judgment score

### Before Every Judgment Score Write This:
EVIDENCE CHECK:
- Source count: [N]
- Classification: [NOTE / YELLOW / RED]
- Reason: [one sentence]
- Judgment floor: [minimum score based on above]

## MANDATORY UNIVERSAL PRINCIPLES — CERTIFICATION FLOOR SCORING

### When Specific Values Are Not Published
If a product holds a recognized certification (Energy Star, AAMA, NFRC, WaterSense, AHRI, KCMA, or equivalent) but the manufacturer has not published a specific tested value for a metric:

1. Score from the CERTIFICATION FLOOR — the minimum threshold required to hold that certification
2. Do NOT score at 5.0 midpoint default
3. Do NOT penalize beyond the certification floor
4. Flag as YELLOW: "Manufacturer holds [certification] but does not publish specific [metric] value. Scored from certification floor."

### Certification Floors for Windows
- Energy Star U-Factor: 0.30 (Northern zone) — score deterministically from 0.30
- Energy Star SHGC: varies by zone — score from zone-appropriate floor
- Energy Star Air Infiltration: 0.30 cfm/ft² — score from 0.30
- AAMA Gold Label: product passed air leakage, water, structural, thermal, forced entry — note as confirmed, no penalty
- If a bounded threshold is published (e.g. "<0.20"), score from that boundary value — this IS meaningful disclosure

### The Principle
Certification is evidence. A certified product that withholds specific numbers is being opaque, not fraudulent. They earn credit for passing the test. They lose credit only for not telling you where in the certified range they actually land. That is already captured by scoring from the floor rather than their actual (better) number.
`;

// Find the insertion point — just before the final closing of BOT2_EVALUATOR_PROMPT
// We'll look for a distinctive closing section pattern
const BOT2_CLOSING_MARKERS = [
  'MECHANICAL VALIDATION REQUIREMENTS',
  'mechanical validation',
  'Mechanical Validation',
  'CONFIDENCE LEVEL',
  'confidence level'
];

let insertionPoint = -1;
let markerFound = '';

for (const marker of BOT2_CLOSING_MARKERS) {
  const idx = content.indexOf(marker);
  if (idx !== -1) {
    // Find the start of this line
    const lineStart = content.lastIndexOf('\n', idx);
    insertionPoint = lineStart;
    markerFound = marker;
    break;
  }
}

if (insertionPoint === -1) {
  console.error('[PATCH] ERROR: Could not find insertion point in Bot 2 prompt. Aborting.');
  process.exit(1);
}

console.log('[PATCH 1] Found insertion point near marker: "' + markerFound + '"');

// Insert the evidence rules before the mechanical validation section
content = content.slice(0, insertionPoint) + EVIDENCE_RULES + content.slice(insertionPoint);

console.log('[PATCH 1] Evidence classification rules injected into Bot 2 prompt.');

// ─────────────────────────────────────────────────────────────────────────────
// Write the patched file
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(ORCHESTRATOR_PATH, content);
console.log('[DONE] bot_orchestrator_v2.js patched with Bot 2 evidence standards + Universal Principles.');
console.log('');
console.log('Run: node --check ' + ORCHESTRATOR_PATH);
