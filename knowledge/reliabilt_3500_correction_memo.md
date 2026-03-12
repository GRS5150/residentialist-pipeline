# Reliabilt 3500 — Scoring Correction Memo
# Date: 2026-03-10
# Authority: Ray Shapley / Benchmark calibration review

## Issue: Score Landing in Mid-Range Instead of Budget Band

Reliabilt 3500 scored 5.21 overall — this places it in the mid-range band (5.0–7.0).
Expert consensus across Tier 1/2 sources consistently places Reliabilt 3500 in the
BUDGET/ENTRY tier. This is a Lowes house-brand window at entry-level price point.

## Root Cause:
Bot 2 applied a -0.5 "data completeness" penalty for unknown seal system.
Challenge Bot correctly flagged this as not supported by the material hierarchy.
Council auto-resolved — but the correction brought the score UP to 5.21,
pushing it into mid-range when budget is correct.

## Required Corrections:

### 1. Corner Construction
Bot 2 dismissed manufacturer claim of "all-welded corners" as marketing language.
This is an ASSUMPTION. Per evidence standards:
- If Bot 1 found manufacturer spec claiming welded corners, treat as DISCLOSED
- Do NOT downgrade claimed spec without independent contradicting evidence
- Apply midpoint if unverifiable, not a penalty

### 2. Seal System Unknown
Unknown seal system = UNDISCLOSED, not a penalty.
Score at midpoint (5.0) with gap documented. No -0.5 deduction.

### 3. Overall Calibration Note
Reliabilt 3500 is a Lowes private-label entry-level product.
Expected score range: 3.5–5.0 (budget band: 0–5.0)
If corrected score still lands above 5.0, review Performance axis for
undocumented adjustments pushing score above vinyl base.

## Evidence:
- Expert consensus: ReplacementWindowsReviews.co, WindowPurchase.com = entry/budget
- Price point: entry-level Lowes house brand
- Challenge Bot flagged -0.5 undocumented penalty in 2B