import re

file = "/Users/Residentialist/.openclaw/workspace/residentialist/bot_orchestrator_v3.js"
with open(file, "r") as f:
    code = f.read()

changes = 0

# ============================================================================
# CHANGE 1: Rewrite Rule 7 — Remove transparency penalty from scoring
# ============================================================================

old_rule7 = """7. ASSUMED vs UNDISCLOSED — CERTIFICATION FLOOR RULE (Universal Principle, applies to all categories):
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
   e. CRITICAL: A certification held by a major manufacturer listed on the Energy Star partner registry or AAMA directory is CONFIRMED, not "claimed." Do not downgrade confirmed certifications to "claimed" without specific evidence of revocation."""

new_rule7 = """7. PERFORMANCE EVIDENCE HIERARCHY — How to score when specific data is missing:
   Your job is to score the WINDOW'S PERFORMANCE, not the manufacturer's data transparency.
   When a specific tested value is not published, use this evidence hierarchy (best to worst):
   
   a. PUBLISHED VALUE (score directly from data):
      - Manufacturer publishes specific tested value (e.g., U-Factor 0.28, AI 0.10 cfm/ft²)
      - Score directly from the value. No cap. This is the gold standard.
   
   b. BOUNDED THRESHOLD (score from the boundary):
      - Published bounded value (e.g., "<0.20 cfm/ft²", "≤0.10 cfm/ft²")
      - Score from the stated boundary. This IS meaningful disclosure.
   
   c. CERTIFICATION TIER (score from certification floor):
      - Product holds a recognized certification but manufacturer withholds specific number
      - Score from the CERTIFICATION FLOOR — the minimum threshold required to hold that certification
      - Certification floors for windows:
        - Energy Star Air Infiltration: ≤0.30 cfm/ft² — score from 0.30
        - Energy Star U-Factor (Northern zone): ≤0.30 — score from 0.30
        - AAMA Gold Label: product passed all performance tests — treat as CONFIRMED
        - NAFS/CSA A440 certification: equivalent to AAMA (see Rule 14)
      - Cap: 6.5 maximum for any subscore scored from certification floor alone
   
   d. PROFESSIONAL CONSENSUS (score from expert evidence):
      - No specific value AND no relevant certification, BUT multiple independent professional
        sources (architects, building scientists, experienced contractors) attest to performance
      - Requires 2+ independent professional sources (GBA contributors, Jay Johnson, BSC, etc.)
      - Score range: 5.5 to 7.0 based on strength and specificity of professional evidence
      - Example: "Zone 5 architect reports Loewen DH passes blower door tests consistently" +
        "GBA contributor reports airtightness of 0.03 cfm/ft² for Loewen casements" → evidence
        supports strong air sealing performance even without published DH-specific number → score 6.5-7.0
   
   e. FIELD EVIDENCE ONLY (limited professional data):
      - Fewer than 2 professional sources, but field evidence suggests performance level
      - Score range: 5.0 to 6.0
   
   f. NO EVIDENCE (true data gap):
      - No published value, no certification, no professional evidence
      - Score at 5.0 midpoint and flag in transparency report
      - This should be RARE for any product with industry presence
   
   CRITICAL: A certification held by a major manufacturer listed on the Energy Star partner registry
   or AAMA directory is CONFIRMED, not "claimed." Do not downgrade confirmed certifications without
   specific evidence of revocation.
   
   CRITICAL: Never fabricate a value. Score from evidence tiers, not invented numbers.
   When using professional consensus or field evidence, state: "EVIDENCE: Professional consensus
   from [sources] supports [performance level]. No published value available." """

if old_rule7 in code:
    code = code.replace(old_rule7, new_rule7, 1)
    changes += 1
    print("CHANGE 1: Rule 7 rewritten — APPLIED")
else:
    print("CHANGE 1: FAILED — Rule 7 pattern not found")
    idx = code.find("ASSUMED vs UNDISCLOSED")
    if idx >= 0:
        print(f"  Found at index {idx}")

# ============================================================================
# CHANGE 2: Replace Rule 15 (non-disclosure flag) with Transparency Report
# ============================================================================

old_rule15 = """15. NON-DISCLOSURE TRANSPARENCY FLAG — MANDATORY:
    When Bot 1 tags a spec as "NOT PUBLISHED" (meaning the manufacturer has the data but does not disclose it), AND you score that subscore from a certification floor per Rule 7:
    a. Add a non_disclosure_flags entry to your output with:
       - subscore: the affected subscore name (e.g., "air_water")
       - metric: what was withheld (e.g., "Air Infiltration specific cfm/ft² value")
       - certification_used: the certification floor applied (e.g., "Energy Star ≤ 0.30 cfm/ft²")
       - score_given: the score derived from the floor
       - note: "NON-DISCLOSURE PENALTY APPLIED — This score is based on the certification floor because [Manufacturer] does not publish specific test results despite holding certifications that required testing. Industry sources and the manufacturer's own marketing suggest actual performance is meaningfully better. If [Manufacturer] published their tested value, this subscore — and the overall score — would likely increase. We score what's documented, not what's implied."
    b. This flag is SEPARATE from YELLOW findings. A YELLOW finding says something might be wrong. A non-disclosure flag says the score is artificially low due to manufacturer choice, not product deficiency.
    c. Do NOT apply this flag when a spec is "NOT FOUND" (search limitation) — only when "NOT PUBLISHED" (manufacturer withholds data they provably possess)."""

new_rule15 = """15. TRANSPARENCY REPORT — MANDATORY:
    After scoring, produce a transparency_report in your output documenting what data was and was not available.
    This report is INFORMATIONAL ONLY — it does NOT affect the score. It tells the reader what evidence
    the score is based on and what gaps exist.
    
    For each Performance subscore, document:
    a. evidence_level: one of "PUBLISHED" | "BOUNDED" | "CERTIFICATION_FLOOR" | "PROFESSIONAL_CONSENSUS" | "FIELD_EVIDENCE" | "NO_EVIDENCE"
    b. metric: what was measured (e.g., "Air Infiltration")
    c. published_value: the actual value if published, or null
    d. evidence_used: description of what evidence informed the score (certification, professional sources, etc.)
    e. score_given: the score for this subscore
    f. professional_note: if professional consensus informed the score, summarize what professionals say about this product's performance. If professionals consider this a top performer despite missing data, say so clearly.
    
    Also include a data_completeness field: "FULL" (all metrics published), "PARTIAL" (some published, some inferred), or "LIMITED" (most metrics inferred from indirect evidence).
    
    This replaces the non_disclosure_flags field. The transparency report is about informing the reader, not penalizing the manufacturer."""

if old_rule15 in code:
    code = code.replace(old_rule15, new_rule15, 1)
    changes += 1
    print("CHANGE 2: Rule 15 replaced with Transparency Report — APPLIED")
else:
    print("CHANGE 2: FAILED — Rule 15 pattern not found")
    idx = code.find("NON-DISCLOSURE TRANSPARENCY FLAG")
    if idx >= 0:
        print(f"  Found at index {idx}")

# ============================================================================
# CHANGE 3: Update JSON schema — replace non_disclosure_flags with transparency_report
# ============================================================================

old_schema_end = '"non_disclosure_flags": [{"subscore": "string", "metric": "string", "certification_used": "string", "score_given": 0.0, "note": "string"}]'

new_schema_end = '"transparency_report": {"data_completeness": "FULL|PARTIAL|LIMITED", "performance_evidence": [{"subscore": "string", "evidence_level": "string", "metric": "string", "published_value": "string or null", "evidence_used": "string", "score_given": 0.0, "professional_note": "string or null"}]}'

if old_schema_end in code:
    code = code.replace(old_schema_end, new_schema_end, 1)
    changes += 1
    print("CHANGE 3: JSON schema updated — APPLIED")
else:
    print("CHANGE 3: FAILED — schema pattern not found")
    idx = code.find("non_disclosure_flags")
    if idx >= 0:
        print(f"  Found non_disclosure_flags at index {idx}")
        print(f"  Context: {repr(code[idx:idx+100])}")

# ============================================================================
# Write if all changes applied
# ============================================================================

if changes == 3:
    with open(file, "w") as f:
        f.write(code)
    print(f"\nALL {changes} CHANGES APPLIED SUCCESSFULLY")
    
    # Verify key phrases
    for phrase in ["PERFORMANCE EVIDENCE HIERARCHY", "TRANSPARENCY REPORT", "transparency_report", "professional_note"]:
        count = code.count(phrase)
        print(f"  Verify '{phrase}': {count} occurrence(s)")
else:
    print(f"\nONLY {changes}/3 CHANGES APPLIED — NOT WRITING FILE")
