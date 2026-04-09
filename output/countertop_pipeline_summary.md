# Countertop Pipeline Summary — 2026-03-27

## What Was Done

### Step 1: Config Extraction
- Created `configs/` directory with `windows.json` and `countertops.json`
- Extracted all hardcoded window values (tier anchors, spec thresholds, operation type adjustments, pain points, health score maps, manufacturer detection) into `configs/windows.json`
- Created `configs/countertops.json` with all specified anchors, source pools, spec fields, scoring rules, outlook modifiers, and material class definitions

### Step 2: Category-Aware Pipeline
Updated 10 pipeline scripts to accept `--category` flag and load from config:

| Script | Changes |
|---|---|
| `config_loader.js` | **NEW** — shared config loader with anchor text builder, manufacturer detection, prompt template resolution |
| `full_pipeline.js` | `--category` flag, config-driven slug format, sibling reuse gated by category, outlook modifier for countertops |
| `deep_dive_pipeline.js` | `--category` flag, category-specific prompt template |
| `sonnet_scorer.js` | Anchor text from config, category-specific spec_highlights format, countertop-aware consideration text |
| `haiku_auditor.js` | Anchor text from config |
| `score_calculator.js` | Countertop spec adjustments (warranty, certs, heat, sealing, manufacturing), no op-type adj for countertops, anchor-specific target scores instead of tier midpoint |
| `report_writer.js` | Pain points from config, category-aware product label |
| `sonnet_structurer.js` | Countertop manufacturer detection map |
| `manufacturer_manager.js` | Countertop manufacturer detection (Cambria, Cosentino/Dekton/Silestone, Caesarstone, MSI, natural stone) |
| `spec_verifier.js` | Countertop spec names (mohs_hardness, heat_resistance_f, water_absorption_pct, etc.) |
| `score_from_curation_v2.js` | `--category` flag, category-aware slug derivation |

### Step 3: Countertop Prompt Template
- Created `templates/prompt_b_countertop.md` — separate from window template, focused on fabricator opinions, material composition, heat/stain/scratch/impact resistance, certifications, material safety, manufacturing origin

### Step 4: Manufacturer Stubs
Created 5 manufacturer files in `manufacturers/`:
- `cambria.json` — private family-owned, 100% domestic, transferable lifetime warranty, Outlook: Strong
- `cosentino.json` — covers Dekton + Silestone, 25-year transferable, Outlook: Strong
- `caesarstone.json` — 100% outsourced manufacturing, $137.5M net loss, 618 silicosis claims, Outlook: Conditional
- `msi.json` — non-transferable limited lifetime, 25+ global suppliers, Outlook: Stable
- `natural_stone.json` — generic, no manufacturer warranty, fabricator-dependent

### Step 5: DB Schema
- 6 countertop products inserted with `category='countertops'`
- Existing products already had `category='windows'` column

### Step 6: Perplexity Deep Dives
All 6 products researched via `sonar-deep-research`:

| Product | Perplexity | Structuring | Score Sources |
|---|---|---|---|
| Cambria Brittanicca | 48,888 chars | 44 sources | 25 score |
| Dekton Aura 15 | 63,573 chars | 44 sources | 22 score |
| Caesarstone Calacatta Maximus | 50,798 chars | 35 sources | 21 score |
| MSI Q Premium Calacatta Arno | 51,621 chars | 42 sources | 22 score |
| Ubatuba Granite | 37,335 chars (retry) | 20 sources | 13 score |
| White Ice Granite | 39,190 chars (retry) | 20 sources | 19 score |

**Note:** Natural stone products (Ubatuba, White Ice) initially got Perplexity refusals — the deep research model treated generic stone type names as "too vague." Retried with a simpler product-review-focused prompt and got good results on second attempt.

### Step 7: Scoring Results

| Product | Score | Target | Range | Status |
|---|---|---|---|---|
| Cambria Brittanicca | **100** | 95 | 92-97 | **FLAG** |
| Dekton Aura 15 | **96** | 91 | 89-93 | **FLAG** |
| Caesarstone Calacatta Maximus | **87** | 82 | 79-85 | **FLAG** |
| MSI Q Premium Calacatta Arno | 80 | 77 | 74-80 | OK |
| Ubatuba Granite | 79 | 80 | 77-83 | OK |
| White Ice Granite | 70 | 73 | 70-76 | OK |

---

## Flagged Products — Evidence

### Cambria Brittanicca: 100 (target 92-97, +3 over range)

**Root cause:** Spec adjustments total +5 from a 95 starting point, hitting the Tier 1 ceiling of 100.

Breakdown:
- Start: 95 (Tier 1 midpoint = Cambria anchor target)
- +2 transferable warranty
- +1 lifetime warranty
- +1 Greenguard Gold
- +1 NSF 51
- +1 domestic manufacturing
- -1 heat resistance (150°F — quartz scorch vulnerability)
- Net: +5 → 100 (clamped)

**Why this happens:** Cambria's anchor target IS the Tier 1 midpoint (95). Every spec adjustment that lands adds directly toward the ceiling. With 6 positive factors and only 1 negative, the product slams into the cap.

**Recommended fix:** Either (a) reduce `warranty_transferable` adjustment from +2 to +1 for countertops (most premium quartz has transferable warranties, so it's less differentiating), or (b) lower the spec_adjustment_cap from 8 to 4 for countertops, or (c) set Cambria's target to 93 so +5 yields 98 (still Tier 1 but doesn't cap).

### Dekton Aura 15: 96 (target 89-93, +3 over range)

**Root cause:** Spec adjustments total +5 from a 91 starting point.

Breakdown:
- Start: 91 (Dekton anchor target — correctly resolved)
- +2 transferable warranty
- +1 Greenguard Gold
- +1 NSF 51
- +1 heat resistance (1000°F — sintered stone excels)
- Net: +5 → 96

**Why this happens:** Dekton earns legitimate spec bonuses across the board. The +2 for transferable warranty is the largest contributor. Without it, score = 94 — still +1 over range.

**Recommended fix:** Same as Cambria — reduce transferable warranty weight for countertops.

### Caesarstone Calacatta Maximus: 87 (target 79-85, +2 over range)

**Root cause:** Spec adjustments total +5 from an 82 starting point.

Breakdown:
- Start: 82 (Caesarstone anchor target = Tier 2 midpoint)
- +2 transferable warranty
- +1 lifetime warranty
- +1 Greenguard Gold
- +1 NSF 51
- Net: +5 → 87

**Why this happens:** Caesarstone shares the same cert/warranty profile as Cambria. Despite Conditional outlook (financial distress, outsourced manufacturing), the deterministic calculator doesn't deduct for outlook — outlook is report-only per the Corporate Risk Rule.

**Recommended fix:** Same systemic issue. Consider adding a -1 adjustment for multi-source/outsourced manufacturing, which Caesarstone now has (they closed their Bar-Lev plant in Dec 2025).

---

## Systemic Issue: Countertop Spec Adjustment Inflation

All three flagged products share the same pattern: premium quartz/sintered stone products accumulate +4 to +5 spec points because they ALL have:
- Transferable warranties (+2)
- Lifetime or 25yr warranties (+1)
- Greenguard Gold (+1)
- NSF 51 (+1)

For windows, the spec adjustments differentiate meaningfully (different U-factors, DP ratings, air infiltration). For countertops, the cert/warranty bundle is nearly universal among premium products, reducing its differentiating power.

**Recommended calibration:** Reduce `warranty_transferable` from +2 to +1, and either combine Greenguard Gold + NSF 51 into a single +1 "certification bundle" or cap total cert bonuses at +1.

---

## What Worked Well
- Config-driven architecture: adding a new category required zero structural changes to the pipeline
- Perplexity deep research returned 35-64K chars of substantive material for all branded products
- Sonnet tier classification achieved 3/3 unanimous agreement on all 6 products
- Haiku audit upheld all tier placements (no overrides)
- Anchor-target fix properly differentiated MSI (77) from Caesarstone (82) within Tier 2
- Natural stone products (Ubatuba, White Ice) scored within range despite sparser source data

## What Needs Review
1. **Countertop spec adjustment weights** — transferable warranty (+2) and cert bonuses are too uniform across premium products. Needs recalibration.
2. **Perplexity refusal on generic stone names** — "Ubatuba Granite" and "White Ice Granite" triggered sonar-deep-research refusals on first attempt. The simpler retry prompt worked but this means the structuring was done on a differently-formatted report. Consider adding a granite-specific prompt variant.
3. **Manufacturer detection for natural stone** — The original deep dive batch ran before the manufacturer_manager fix, so Dekton → "dekton.json" and White Ice → "white.json" rather than "cosentino.json" and "natural_stone.json". The scoring still worked because the pipeline falls back to whatever manufacturer file exists, but the data in those auto-generated files is from Perplexity (not our curated stubs).
4. **Haiku audit axis scores** — The audit returned `undefined` for quality/durability/performance axes on all 6 products. This is likely because the haiku audit prompt expects window-style axis scoring. The axis derivation in score_calculator also uses window-specific logic (frame_material, U-factor, glass_warranty). Countertop axis derivation needs its own logic.
5. **Outlook modifier display** — The outlook modifier (Strong/Stable/Conditional) is computed and stored in `DETERMINISTIC_SCORES.json` but the report writer doesn't prominently surface it yet. Caesarstone's "Conditional" outlook should be very visible to consumers.
