# Pella 250 Series — Material Classification Correction Memo
# Date: 2026-03-10
# Authority: Ray Shapley / Challenge Bot FLAG resolved

## CRITICAL: Material Base Score Correction

The Pella 250 Series DH has a CONFIRMED aluminum-clad exterior with wood interior.
Bot 1 confirmed: "wood interior and aluminum-clad exterior"

## Correct Material Classification:
- Frame Material: Aluminum-clad wood (roll-form aluminum)
- Correct Base Score: 7 (NOT 5 — standard vinyl is WRONG)
- Material Hierarchy: Aluminum-clad wood, roll-form = base 7

## Previous Error:
Bot 2 incorrectly applied base score 5 (standard vinyl) to this product.
This caused a cascade error resulting in an invalid overall score of 3.72/4.0.

## Required Scoring for Pella 250 Series:
- 1A Frame Material base: START AT 7 (aluminum-clad wood, roll-form)
- Apply adjustments from base 7, not base 5
- Expected score range after correct classification: 5.5–7.0 (mid-range)

## NFRC Data Gap:
Pella 250 Series is NOT in the NFRC certified products database.
Apply UNDISCLOSED methodology: score performance specs at midpoint (5.0) with gap documented.
Do NOT apply a 2.0 penalty score for missing NFRC data — use midpoint only.

## Evidence:
- Bot 1 confirmed aluminum-clad exterior in scoring run 2026-03-10
- Challenge Bot flagged hierarchy violation: base 5 applied to aluminum-clad product
- Council auto-resolved with correction required