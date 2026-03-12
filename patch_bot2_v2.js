#!/usr/bin/env node
/**
 * patch_bot2_v2.js
 * Precise patch targeting exact Bot 2 prompt text.
 * Fixes:
 * 1. Rule 7 — replaces midpoint default with certification floor rule
 * 2. Rule 11 — tightens RED/YELLOW to explicitly block single-source anecdotes from RED
 */

const fs = require('fs');
const ORCHESTRATOR_PATH = '/home/ubuntu/.openclaw/workspace/residentialist/bot_orchestrator_v2.js';

let content = fs.readFileSync(ORCHESTRATOR_PATH, 'utf8');
fs.writeFileSync(ORCHESTRATOR_PATH + '.bak3', content);
console.log('[PATCH] Backup saved to bot_orchestrator_v2.js.bak3');

// ─────────────────────────────────────────────────────────────────────────────
// PATCH 1: Replace Rule 7 — certification floor instead of midpoint default
// ─────────────────────────────────────────────────────────────────────────────

const OLD_RULE_7 = `7. ASSUMED vs UNDISCLOSED: If Bot 1 lists a spec as UNKNOWN/NOT DISCLOSED, score it at 5.0 (midpoint) and label it "undisclosed — scored at midpoint." Never apply a positive adjustment for an undisclosed spec. Never state an undisclosed spec as confirmed fact.`;

const NEW_RULE_7 = `7. ASSUMED vs UNDISCLOSED — CERTIFICATION FLOOR RULE (Universal Principle, applies to all categories):
   a. If a product holds a recognized certification (Energy Star, AAMA Gold Label, NFRC, WaterSense, AHRI, KCMA or equivalent) and the manufacturer has not published a specific tested value for a metric covered by that certification:
      - Score from the CERTIFICATION FLOOR — the minimum threshold required to hold that certification
      - Do NOT score at 5.0 midpoint default
      - Do NOT penalize beyond the certification floor
      - Flag as YELLOW: "Manufacturer holds [certification] but does not publish specific [metric] value. Scored from certification floor."
   b. Certification floors for windows:
      - Energy Star U-Factor (Northern zone): 0.30 — score deterministically from 0.30
      - Energy Star SHGC: score from zone-appropriate floor
      - Energy Star Air Infiltration: 0.30 cfm/ft² — score from 0.30, not 5.0
      - AAMA Gold Label: product passed air leakage, water, structural, thermal, forced entry — treat certifications as CONFIRMED, not "claimed"
      - If a bounded threshold is published (e.g. "<0.20"), score from that boundary — this IS meaningful disclosure
   c. If a product holds NO relevant certification for a metric AND no value is published: score at 5.0 midpoint and label "undisclosed — no certification floor available."
   d. Never apply a positive adjustment for an undisclosed spec. Never state an undisclosed spec as confirmed fact.
   e. CRITICAL: A certification held by a major manufacturer listed on the Energy Star partner registry or AAMA directory is CONFIRMED, not "claimed." Do not downgrade confirmed certifications to "claimed" without specific evidence of revocation.`;

if (content.includes(OLD_RULE_7)) {
  content = content.replace(OLD_RULE_7, NEW_RULE_7);
  console.log('[PATCH 1] Rule 7 replaced with certification floor rule.');
} else {
  console.error('[PATCH 1] ERROR: Could not find Rule 7 text. Aborting.');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH 2: Replace Rule 11 — tighten RED/YELLOW evidence standards
// ─────────────────────────────────────────────────────────────────────────────

const OLD_RULE_11 = `11. RED vs YELLOW FINDINGS — apply this checklist to every negative finding:
    RED FINDING (all three must be true):
    - Multiple independent sources (minimum 2, not the same outlet repeated)
    - Documented pattern, not a single incident
    - Sourced to this specific product line, not the brand generally
    RED FINDING also applies to: any manufacturer acknowledgment of inability to fix a documented failure pattern.
    YELLOW FINDING (any one of these):
    - Single source only
    - Installation-dependent (may be installer error, not product defect)
    - Attributed to brand generally, not confirmed for this specific product line
    - Manufacturer acknowledged but not litigated or independently verified
    - Older than 10 years with no recent corroboration
    Label every negative finding as RED or YELLOW in your output. Never leave a finding unclassified.`;

const NEW_RULE_11 = `11. RED vs YELLOW FINDINGS — apply this checklist to every negative finding:
    RED FINDING (ALL FOUR must be true — if any one fails, it is YELLOW):
    - Minimum 2 INDEPENDENT sources (different outlets, not the same story republished)
    - Documented pattern across multiple unrelated incidents, not a single event
    - Sourced to this specific product line, not the brand generally
    - Independently verifiable — court records, CPSC database, independent lab test, named investigative journalism
    RED FINDING also applies to: any manufacturer acknowledgment of inability to fix a documented failure pattern.
    EXPLICIT RED DISQUALIFIERS — these can NEVER be RED findings regardless of severity:
    - A single customer review, forum post, or comment — even if detailed or alarming
    - A denied, dismissed, or decertified class action — a denied class action is evidence in the manufacturer's FAVOR, not against them
    - A single installation anecdote (e.g. "29 of 39 units failed") — this is one customer's experience, not a systemic pattern
    - Yelp, Google, or BBB star ratings alone — these are sentiment data, not failure documentation
    - Any claim where the only source is the claimant themselves
    YELLOW FINDING (any one of these):
    - Single source only
    - Installation-dependent (may be installer error, not product defect)
    - Attributed to brand generally, not confirmed for this specific product line
    - Manufacturer acknowledged but not litigated or independently verified
    - Older than 10 years with no recent corroboration
    - Consumer complaint pattern without independent verification
    JUDGMENT SCORE FLOORS based on evidence classification:
    - Only NOTE-level evidence (single source): Judgment floor is 4.0 — cannot score below 4.0
    - YELLOW evidence (pattern, multiple sources, unverified): Judgment range 3.0–6.0
    - RED evidence (verified, multi-source, independent): Judgment range 1.0–5.0
    Before every Judgment score write: "EVIDENCE LEVEL: [NOTE/YELLOW/RED] — [reason in one sentence]"
    Label every negative finding as RED or YELLOW in your output. Never leave a finding unclassified.`;

if (content.includes(OLD_RULE_11)) {
  content = content.replace(OLD_RULE_11, NEW_RULE_11);
  console.log('[PATCH 2] Rule 11 replaced with tightened RED/YELLOW standards.');
} else {
  console.error('[PATCH 2] ERROR: Could not find Rule 11 text. Aborting.');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Write patched file
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(ORCHESTRATOR_PATH, content);
console.log('[DONE] bot_orchestrator_v2.js patched successfully.');
console.log('Run: node --check ' + ORCHESTRATOR_PATH);
