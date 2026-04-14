/**
 * Patch: International Standards + Specialty Forums + Price-Bias Filter
 * Applies four changes:
 * 1. Bot 1: Add international standards recognition (NAFS/CSA, EN, PHI, CE)
 * 2. Bot 1: Add GBA, r/PassiveHouse, r/buildingscience targeted searches
 * 3. Bot 2: Add price-bias sentiment filter for Reddit field sources
 * 4. Bot 2: Add international standards interpretation logic
 *
 * Run on Mac Mini: node patch_international_and_forums.js
 */

const fs = require('fs');
const path = '/Users/Residentialist/.openclaw/workspace/residentialist';

// ── 1. Patch bot_orchestrator_v3.js — Bot 1 prompt ──────────────────────────

const orchPath = `${path}/bot_orchestrator_v3.js`;
let orch = fs.readFileSync(orchPath, 'utf8');

// === CHANGE 1: Add international standards searches to Bot 1 Phase 2 ===
// Find the end of Phase 2 searches (search 18) and add new searches

const oldPhase2End = `18. Search: "[Product Name] VOC emissions indoor air quality certification Greenguard" — confirm or rule out air quality certifications`;

const newPhase2End = `18. Search: "[Product Name] VOC emissions indoor air quality certification Greenguard" — confirm or rule out air quality certifications

PHASE 2B — INTERNATIONAL STANDARDS SEARCH (perform if manufacturer is non-US or sells internationally):
19i. Search: "[Manufacturer] NAFS CSA A440 performance grade structural test" — Canadian fenestration standard (harmonized with AAMA)
20i. Search: "[Manufacturer] EN 14351-1 CE marking window performance" — European fenestration standard
21i. Search: "[Manufacturer] Passive House Institute PHI certified window" — search PHI component database
22i. Search: "[Manufacturer] performance data air water structural test results" — find manufacturer-published test data pages
23i. Search: site:database.passivehouse.com "[Manufacturer]" — check PHI certified components database directly

INTERNATIONAL STANDARDS RECOGNITION — CRITICAL:
First-world nation standards are ALL meaningful. You must search for and recognize:
- US: AAMA, NFRC, ENERGY STAR, Florida Building Code, IRC
- Canada: NAFS/CSA A440 (this IS the same harmonized standard as AAMA — a CW-PG70 under NAFS equals a CW-PG70 under AAMA), NRCan, ENERGY STAR Canada
- Europe: CE marking per EN 14351-1, EN 673 (thermal), EN 12567, Passive House Institute (PHI) Darmstadt certification, RAL quality marks
- UK: BS 6375, PAS 24, BFRC (British Fenestration Rating Council), BBA, BSI Kitemark
- Australia/NZ: WERS (Window Energy Rating Scheme), AS 2047

DO NOT assume a manufacturer lacks certifications just because you cannot find AAMA or NFRC data. Canadian manufacturers test to NAFS/CSA A440 — the exact same structural and air/water tests. European manufacturers test to EN standards. Report what you find under the standard it was tested to. DO NOT attempt to convert between standards (e.g., European U-values use different test conditions than NFRC U-values). Report each value with its standard clearly noted.`;

// === CHANGE 2: Add GBA, r/PassiveHouse, r/buildingscience searches ===
// Update Phase 3 to include specialty forums

const oldPhase3 = `PHASE 3 — FIELD SOURCE RESEARCH (Reddit trade professionals):
19. Search: site:reddit.com "[Product Name]" window install review — find installer/contractor opinions
20. Search: site:reddit.com "[Manufacturer]" windows quality problems — find field complaints and praise
21. Search: site:reddit.com "[Product Name]" OR "[Manufacturer]" r/homeimprovement OR r/construction OR r/homebuilding — broader trade discussion`;

const newPhase3 = `PHASE 3 — FIELD SOURCE RESEARCH (Reddit trade professionals):
19. Search: site:reddit.com "[Product Name]" window install review — find installer/contractor opinions
20. Search: site:reddit.com "[Manufacturer]" windows quality problems — find field complaints and praise
21. Search: site:reddit.com "[Product Name]" OR "[Manufacturer]" r/homeimprovement OR r/construction OR r/homebuilding — broader trade discussion

PHASE 3B — SPECIALTY FORUM RESEARCH (high-performance building community):
25. Search: site:greenbuildingadvisor.com "[Manufacturer]" OR "[Product Name]" — GBA is a paywall community of architects, energy consultants, and serious builders. Treat GBA contributors as closer to Expert Authorities (Category 2) than field sources.
26. Search: site:reddit.com/r/PassiveHouse "[Manufacturer]" OR "[Product Name]" — passive house community (energy nerds, not tradespeople)
27. Search: site:reddit.com/r/buildingscience "[Manufacturer]" OR "[Product Name]" — building science enthusiasts
28. Search: site:finehomebuilding.com "[Manufacturer]" "[Product Name]" forum — professional builder forum
29. Search: "[Manufacturer]" "[Product Name]" site:greenbuildingforum.co.uk OR site:greenbuildingtalk.com — UK/European green building forums (especially useful for European manufacturers)

GBA and r/PassiveHouse sources should be categorized separately from general Reddit in your output. These communities self-select for people who accept that high-performance windows cost more — they have minimal price-bias noise and discuss actual U-values, SHGC, air tightness, and installation methodology.`;

if (orch.includes(oldPhase2End)) {
  orch = orch.replace(oldPhase2End, newPhase2End);
  console.log('✓ Patched Bot 1: Added international standards searches (Phase 2B)');
} else {
  console.log('✗ Could not find Phase 2 end marker for international standards patch');
}

if (orch.includes(oldPhase3)) {
  orch = orch.replace(oldPhase3, newPhase3);
  console.log('✓ Patched Bot 1: Added specialty forum searches (Phase 3B)');
} else {
  console.log('✗ Could not find Phase 3 marker for specialty forum patch');
}

// Also update the Bot 1 output sections to include international standards and specialty forums
const oldBot1Output = `7. FIELD SOURCE OPINIONS — qualified Reddit/forum professionals found, their product verdicts, credibility assessment, and whether field consensus agrees with or diverges from publication/certification signals. If no qualified field sources found, note "No qualified field sources identified for this product."`;

const newBot1Output = `7. FIELD SOURCE OPINIONS — qualified Reddit/forum professionals found, their product verdicts, credibility assessment, and whether field consensus agrees with or diverges from publication/certification signals. If no qualified field sources found, note "No qualified field sources identified for this product."
8. INTERNATIONAL CERTIFICATIONS — list ALL certifications found from any first-world nation, with the standard clearly identified (e.g., "NAFS CW-PG70" not just "PG70", "EN 14351-1 CE marked" not just "CE marked"). Note the country/standard for each. Do NOT convert between standards.
9. SPECIALTY FORUM FINDINGS — separate section for GBA, r/PassiveHouse, r/buildingscience opinions. These are higher-authority than general Reddit and should be clearly distinguished.`;

if (orch.includes(oldBot1Output)) {
  orch = orch.replace(oldBot1Output, newBot1Output);
  console.log('✓ Patched Bot 1: Added international certifications and specialty forum output sections');
} else {
  console.log('✗ Could not find Bot 1 output sections marker');
}

// === CHANGE 3 & 4: Add price-bias filter and international standards to Bot 2 ===

const oldBot2FieldRules = `12. MATERIAL CLASSIFICATION LOCK — THIS IS A HARD RULE:
    - The material class established by Bot 1 research is provided to you as LOCKED_MATERIAL_CLASS.
    - You MUST score from this material class. You MAY NOT silently reclassify it.
    - If you believe the locked classification is wrong, you MUST:
      a. STOP scoring
      b. Output exactly: "MATERIAL_RECLASSIFICATION_FLAG: I believe the material class should be [X] because [cite specific source URL and quote from Bot 1 research]. The locked class is [Y]. I cannot proceed without resolution."
      c. Do NOT produce a score. Do NOT continue the evaluation.
    - If you proceed with a different material class than LOCKED_MATERIAL_CLASS without flagging, the entire evaluation is invalid.
    - A material reclassification flag will be caught by the Challenge Bot and escalated. This is the correct behavior.
    JUDGMENT SCORE FLOORS`;

const newBot2FieldRules = `12. MATERIAL CLASSIFICATION LOCK — THIS IS A HARD RULE:
    - The material class established by Bot 1 research is provided to you as LOCKED_MATERIAL_CLASS.
    - You MUST score from this material class. You MAY NOT silently reclassify it.
    - If you believe the locked classification is wrong, you MUST:
      a. STOP scoring
      b. Output exactly: "MATERIAL_RECLASSIFICATION_FLAG: I believe the material class should be [X] because [cite specific source URL and quote from Bot 1 research]. The locked class is [Y]. I cannot proceed without resolution."
      c. Do NOT produce a score. Do NOT continue the evaluation.
    - If you proceed with a different material class than LOCKED_MATERIAL_CLASS without flagging, the entire evaluation is invalid.
    - A material reclassification flag will be caught by the Challenge Bot and escalated. This is the correct behavior.

13. PRICE-BIAS FILTER FOR FIELD SOURCES — CRITICAL:
    When processing Reddit or forum opinions from qualified field sources, check for PRICE-ANCHORED NEGATIVITY:
    Price-bias indicators: "overpriced", "not worth the money", "paying for the name", "too expensive for what you get", "can get the same from X for half", "rich people windows", "markup is insane", "not worth it", "highway robbery", "better value in", "paying a premium for nothing"
    Genuine quality/durability/performance complaints: "leaks", "failed", "warranty claim", "rotted", "fogged units", "seal failure", "hard to operate", "drafty", "broke", "cracked", "callback", "replacement needed", "water damage", "mold"
    
    RULE: When negative field source sentiment co-occurs with price-bias language AND lacks specific quality/durability/performance complaints:
    a. Flag the opinion as "PRICE-BIAS DETECTED" in field source processing
    b. Reduce its weight by 50% on Quality, Durability, and Performance axes
    c. Note it as a value judgment, not a product quality judgment
    d. Do NOT discard it entirely — price-biased opinions may still contain legitimate secondary observations
    e. If the same source mixes price complaints with genuine failure reports (e.g., "overpriced AND the seals failed after 3 years"), weight the failure report at full value and flag only the price portion
    
    This filter exists because blue-collar tradespeople sometimes rate expensive products as "junk" when they mean "overpriced relative to alternatives" — a value judgment the Residentialist does not currently score.

14. INTERNATIONAL STANDARDS INTERPRETATION — CRITICAL:
    Bot 1 may report certifications from multiple national standards. Handle them as follows:
    
    a. NAFS/CSA A440 (Canadian) = EQUIVALENT to AAMA for structural and air/water performance.
       - CW-PG70 under NAFS = CW-PG70 under AAMA. Score identically.
       - Air infiltration levels: A1 (worst), A2 (moderate), A3 (best). A3 = highest possible rating = score 9-10 on air infiltration.
       - Water penetration values in Pascals: >700 Pa = excellent, 400-700 Pa = good, <400 Pa = moderate
       - Design Pressure (DP) ratings are directly comparable between NAFS and AAMA
    
    b. EN 14351-1 (European) = NOT directly comparable to NAFS/AAMA.
       - European U-values (Uw) are tested at 0°C exterior, NFRC at -18°C. European values will APPEAR better. DO NOT directly compare.
       - Instead: score European products within the European scale. Uw < 0.8 W/(m²K) = excellent, 0.8-1.2 = good, 1.2-1.6 = moderate, >1.6 = poor
       - Air permeability classes: Class 4 (best), Class 3, Class 2, Class 1 (worst)
       - Water tightness classes: higher number = better (e.g., E1200 > E600)
    
    c. PHI Certification (Passive House Institute):
       - phA+ (Uw ≤ 0.40) = premium tier, score 9.5-10 on thermal
       - phA (Uw ≤ 0.60) = excellent tier, score 9-9.5 on thermal  
       - phB (Uw ≤ 0.80) = good tier, score 8-9 on thermal
       - phC (Uw ≤ 1.00) = adequate tier, score 7-8 on thermal
       - A PHI-certified product has undergone rigorous independent testing. This is Tier 1 certification data.
    
    d. Florida Building Code registrations (FL#####) confirm products have passed hurricane/impact testing — score these as structural performance confirmation equivalent to AAMA/NAFS high wind zone compliance.
    
    e. NEVER penalize a product for "no AAMA certification" if it holds equivalent NAFS/CSA certification. They are literally the same standard with the same test procedures.
    
    JUDGMENT SCORE FLOORS`;

if (orch.includes(oldBot2FieldRules)) {
  orch = orch.replace(oldBot2FieldRules, newBot2FieldRules);
  console.log('✓ Patched Bot 2: Added price-bias filter (Rule 13) and international standards interpretation (Rule 14)');
} else {
  console.log('✗ Could not find Bot 2 field rules marker');
}

// Also add NAFS/CSA to the data completeness checker's REQUIRED_FIELDS
const oldRequiredFields = `{ field: 'AAMA Class',       signals: ['aama', 'performance class', 'design pressure'],  source: 'AAMA certification directory' },`;
const newRequiredFields = `{ field: 'AAMA/NAFS Class',   signals: ['aama', 'nafs', 'csa a440', 'performance class', 'performance grade', 'design pressure', 'en 14351'],  source: 'AAMA/NAFS/EN certification directory' },`;

if (orch.includes(oldRequiredFields)) {
  orch = orch.replace(oldRequiredFields, newRequiredFields);
  console.log('✓ Patched data completeness checker: AAMA → AAMA/NAFS/EN recognition');
} else {
  console.log('✗ Could not find AAMA field in REQUIRED_FIELDS');
}

// Add Loewen to MANDATORY_SOURCES
const oldMandatorySources = `'sierra pacific': ['sierrapacificwindows.com', 'nfrc'],`;
const newMandatorySources = `'sierra pacific': ['sierrapacificwindows.com', 'nfrc'],
    'loewen':     ['loewen.com', 'nafs', 'csa'],
    'inline':     ['inlinefiberglass.com', 'nafs'],`;

if (orch.includes(oldMandatorySources)) {
  orch = orch.replace(oldMandatorySources, newMandatorySources);
  console.log('✓ Patched MANDATORY_SOURCES: Added Loewen, Inline (Canadian manufacturers)');
} else {
  console.log('✗ Could not find sierra pacific in MANDATORY_SOURCES');
}

// Write the updated orchestrator
fs.writeFileSync(orchPath, orch);
console.log('✓ Wrote updated bot_orchestrator_v3.js');

// ── 2. Update knowledge file — add international standards section and specialty forum guidance ──

const kbPath = `${path}/knowledge/windows/windows_eval_knowledge_v1.2.md`;
let kb = fs.readFileSync(kbPath, 'utf8');

// Add specialty forum categorization guidance after the Jay Johnson rule
const jayJohnsonRuleEnd = `- **Absence is NOT a Yellow Finding for:** European import products (e.g., Internorm, Zola, Loewen) or products distributed through a single-region or specialty channel. Jay Johnson's absence from the European import product record is expected, not a data gap.`;

const specialtyForumSection = `- **Absence is NOT a Yellow Finding for:** European import products (e.g., Internorm, Zola, Loewen) or products distributed through a single-region or specialty channel. Jay Johnson's absence from the European import product record is expected, not a data gap.

---

### Specialty Forum Source Classification

**GreenBuildingAdvisor (GBA) Forum Contributors:**
GBA contributors who post substantive window evaluations in the forums are classified between Category 2 (Expert Authorities) and Category 3 (Trade Publications). Most GBA forum participants are credentialed building professionals — architects, energy consultants, PHIUS-certified professionals, and experienced builders who self-select into a paywall community focused on building science. Their window opinions carry more weight than general Reddit field sources.

**Scoring rule:** GBA forum consensus on a product should be weighted at 75% of Expert Authority weight (i.e., between Category 2 and Category 3). If 3+ GBA contributors agree on a product assessment, treat it as moderate expert consensus.

**r/PassiveHouse and r/buildingscience:**
These subreddits attract energy nerds, envelope consultants, and high-performance builders. The population is closer to GBA than to r/HomeImprovement. Opinions here should be weighted at 60% of Expert Authority weight — above general Reddit field sources but below GBA.

**Price-bias risk:** Minimal in all three of these communities. Users in GBA, r/PassiveHouse, and r/buildingscience already accept that high-performance windows cost more. Price-biased negativity is rare. Do NOT apply the price-bias filter to these sources unless explicit price language is present.

**General Reddit (r/HomeImprovement, r/Construction, r/Carpentry, etc.):**
Standard field source weighting per Category 4 rules. Price-bias filter applies.`;

if (kb.includes(jayJohnsonRuleEnd)) {
  kb = kb.replace(jayJohnsonRuleEnd, specialtyForumSection);
  console.log('✓ Patched knowledge base: Added specialty forum classification');
} else {
  console.log('✗ Could not find Jay Johnson rule end marker in knowledge base');
}

// Update version number
kb = kb.replace('**Version:** v1.2 — March 11, 2026', '**Version:** v1.3 — March 13, 2026');
kb = kb.replace(
  '**Status:** Production-ready. Source hierarchy updated per council Items 11-A through 11-D. IGU longevity research added (IGMA 25-year field study, NREL 2023 degradation review).',
  '**Status:** Production-ready. v1.3: Added international standards recognition, specialty forum classification (GBA, r/PassiveHouse, r/buildingscience), and price-bias sentiment filter for field sources.'
);

// Rename the file to v1.3
const newKbPath = `${path}/knowledge/windows/windows_eval_knowledge_v1.3.md`;
fs.writeFileSync(newKbPath, kb);
// Also keep v1.2 as archive
fs.copyFileSync(kbPath, `${path}/knowledge/windows/archive/windows_eval_knowledge_v1.2.md`);
fs.unlinkSync(kbPath);
console.log('✓ Wrote windows_eval_knowledge_v1.3.md (archived v1.2)');

console.log('\n═══════════════════════════════════════════');
console.log('All patches applied successfully.');
console.log('Next: restart bridge, then run Loewen through pipeline.');
console.log('═══════════════════════════════════════════');
