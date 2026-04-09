# Countertop v2 Rescore Summary — 2026-03-27

## Scoring Results

| Product | Score | Target | Range | Spec Adj | Status |
|---|---|---|---|---|---|
| Cambria Brittanicca | **96** | 95 | 92-97 | +7 | **OK** |
| Dekton Aura 15 | **94** | 91 | 89-93 | +3 | **FLAG (+1)** |
| Caesarstone Calacatta Maximus | **87** | 82 | 79-85 | +5 | **FLAG (+2)** |
| MSI Q Premium Calacatta Arno | **82** | 77 | 74-80 | +5 | **FLAG (+2)** |
| Ubatuba Granite | **81** | 80 | 77-83 | +1 | **OK** |
| White Ice Granite | **74** | 73 | 70-76 | +1 | **OK** |

**3 in range, 3 flagged.** Overages are smaller than v1 (max +2 vs +8 in v1). Cambria moved from 100 to 96 (now in range). White Ice moved from 64 to 74 (now in range).

---

## What Changed from v1

### Config updates (`configs/countertops.json`)
- Replaced binary cert/warranty adjustments with continuous ASTM-based thresholds
- New performance specs: heat (4-tier), Mohs (3-tier), water absorption (3-tier), impact (categorical)
- New durability specs: flexural strength (3-tier), repairability (categorical)
- Certification bundle capped at +1 total (was +1 per cert, stacking to +3)
- Warranty transferable reduced from +2 to +1
- Tier 1 effective max = 96 (reserved range 97-100 enforced as hard clamp)

### Source pool updates
- **Karin Kirk / Countertop Investigator**: PROMOTED S → was A. Methodology-documented, multi-material comparative testing. Geologist credentials.
- **Natural Stone Institute Testing Lab**: NEW Pool A. ISO 17025 accredited. Runs ASTM C97/C880/C615 tests.

### Score calculator (`score_calculator.js`)
- v2 countertop adjustment engine: 9 factors (heat, Mohs, water absorption, impact, flexural, repairability, warranty transferable, cert bundle, domestic manufacturing)
- Anchor-specific target scores (from previous session)
- Tier 1 clamped at 96 for countertops

---

## Spec Adjustment Breakdown Per Product

### Cambria Brittanicca — 96 (IN RANGE)
| Spec | Value | Adjustment | Rationale |
|---|---|---|---|
| Heat resistance | 400°F | +1 | Moderate tolerance (≥300°F) |
| Mohs hardness | 7 | +1 | Scratch-proof in kitchen use |
| Water absorption | 0.02% | +1 | Virtually non-porous (<0.05%) |
| Impact resistance | no_failures | +1 | CR quartz class: no splitting |
| Flexural strength | 8,700 psi | +1 | Top-tier (≥8,000) |
| Repairability | minimal | -1 | Replace slab |
| Warranty transferable | yes | +1 | Unique among major quartz brands |
| Cert bundle | 4 certs | +1 | Greenguard Gold + NSF 51 + HPD + LEED (capped) |
| Domestic manufacturing | yes | +1 | Le Sueur, MN |
| **Total** | | **+7** | Start 95 + 7 = 102, clamped to **96** |

**Sources:** cambriausa.com/technical-information, cambriausa.com/warranty, UL Greenguard database

### Dekton Aura 15 — 94 (FLAG: +1 over range)
| Spec | Value | Adjustment | Rationale |
|---|---|---|---|
| Heat resistance | 1,472°F | +2 | Hot-pan-proof (≥1,000°F) — sintered stone |
| Mohs hardness | 8 | +1 | Hardest common countertop surface |
| Water absorption | 0.02% | +1 | Virtually non-porous |
| Impact resistance | **documented_failures** | **-2** | **CR: only material that split entirely under heavy impact** |
| Flexural strength | 5,500 psi | 0 | Adequate (4,000-7,999) |
| Repairability | minimal | -1 | Replace slab |
| Warranty transferable | yes | +1 | 25-year transferable (Cosentino) |
| Cert bundle | 4 certs | +1 | Greenguard Gold + NSF 51 + EPD + Declare (capped) |
| Domestic manufacturing | no | 0 | Manufactured in Almeria, Spain |
| **Total** | | **+3** | Start 91 + 3 = **94** |

**Why flagged:** Score 94 is +1 above the 89-93 range ceiling. The impact penalty (-2) correctly penalizes Dekton but its heat (+2), hardness (+1), and water absorption (+1) advantages offset more than expected. The net +3 from a 91 anchor pushes it 1 point past the ceiling.

**Evidence for -2 impact:** Consumer Reports documented Dekton as the ONLY countertop material that split entirely under heavy impact. Edge chipping also confirmed by multiple fabricators. This is the single most important differentiator between Dekton and quartz for durability scoring. Source: Consumer Reports countertop material test battery.

**Sources:** cosentino.com/en-us/dekton/technical-specifications, cosentino.com/en-us/dekton/warranty

### Caesarstone Calacatta Maximus — 87 (FLAG: +2 over range)
| Spec | Value | Adjustment | Rationale |
|---|---|---|---|
| Heat resistance | 300°F | +1 | Moderate tolerance |
| Mohs hardness | 7 | +1 | Standard quartz |
| Water absorption | 0.02% | +1 | Non-porous |
| Impact resistance | no_failures | +1 | CR: no splitting documented for quartz |
| Flexural strength | 8,500 psi | +1 | Top-tier |
| Repairability | minimal | -1 | Replace slab |
| Warranty transferable | no | 0 | Original purchaser only |
| Cert bundle | 3 certs | +1 | Greenguard Gold + NSF 51 + HPD (capped) |
| Domestic manufacturing | no | 0 | 100% outsourced as of Dec 2025 |
| **Total** | | **+5** | Start 82 + 5 = **87** |

**Why flagged:** Caesarstone's spec profile is nearly identical to other premium quartz products (+5). The differentiation should come from its corporate risk (Conditional outlook) and outsourced manufacturing, but the Corporate Risk Rule says outlook does NOT affect the composite score. The 82 anchor target already prices in some risk vs Silestone (84), but the +5 spec adjustment is the same as any premium quartz. The anchor gap isn't enough to contain it.

**Key gap:** Warranty transferability marked `false` pending verification — Caesarstone's warranty docs are ambiguous on transferability. If transferable, score would be 88 (+1 worse).

**Sources:** caesarstoneus.com/technical-information, caesarstoneus.com/warranty

### MSI Q Premium Calacatta Arno — 82 (FLAG: +2 over range)
| Spec | Value | Adjustment | Rationale |
|---|---|---|---|
| Heat resistance | 300°F | +1 | Moderate tolerance |
| Mohs hardness | 7 | +1 | Standard quartz |
| Water absorption | 0.03% | +1 | Non-porous |
| Impact resistance | no_failures | +1 | No documented failures |
| Flexural strength | 8,500 psi | +1 | Top-tier |
| Repairability | minimal | -1 | Replace slab |
| Warranty transferable | **no** | 0 | NOT transferable — confirmed |
| Cert bundle | 3 certs | +1 | Greenguard Gold (VERIFIED) + NSF 51 + HPD (capped) |
| Domestic manufacturing | no | 0 | 25+ global suppliers |
| **Total** | | **+5** | Start 77 + 5 = **82** |

**Why flagged:** Same +5 as Caesarstone because material specs are identical for all engineered quartz. The 77 anchor target correctly places MSI below Caesarstone (82), but the uniform +5 adjustment pushes both products the same distance above their targets. The spec system correctly captures that MSI lacks transferable warranty and domestic manufacturing (0 instead of +1 each), but this only eliminates 2 points vs Cambria's +7.

**MSI Greenguard Gold:** VERIFIED TRUE. The previous LLM extraction was wrong. MSI Q Premium holds Greenguard Gold certification per msisurfaces.com.

**Sources:** msisurfaces.com/quartz-countertops/q-premium-natural-quartz, msisurfaces.com/quartz-countertops/calacatta-arno

### Ubatuba Granite — 81 (IN RANGE)
| Spec | Value | Adjustment | Rationale |
|---|---|---|---|
| Heat resistance | 1,200°F | +2 | Hot-pan-proof — igneous rock |
| Mohs hardness | 6.5 | 0 | Base (5-6.9 range) |
| Water absorption | 0.15% | 0 | Within ASTM C615 spec (≤0.40%) |
| Impact resistance | no_data | 0 | Not CR-tested |
| Flexural strength | 2,200 psi | -1 | Below 4,000 threshold |
| Repairability | partial | 0 | Chips can be filled |
| Warranty transferable | N/A | 0 | Natural stone — no manufacturer warranty |
| Cert bundle | 0 | 0 | Natural stone — no product certifications |
| Domestic manufacturing | no | 0 | Quarried in Brazil |
| **Total** | | **+1** | Start 80 + 1 = **81** |

**Sources:** naturalstoneinstitute.org/technical-resources, ASTM C615 Standard

### White Ice Granite — 74 (IN RANGE)
| Spec | Value | Adjustment | Rationale |
|---|---|---|---|
| Heat resistance | 1,200°F | +2 | Hot-pan-proof — igneous rock |
| Mohs hardness | 6 | 0 | Base |
| Water absorption | 0.35% | 0 | Within ASTM C615 spec but borderline |
| Impact resistance | no_data | 0 | Not CR-tested |
| Flexural strength | 1,800 psi | -1 | Below 4,000 threshold |
| Repairability | partial | 0 | Chips can be filled |
| Warranty transferable | N/A | 0 | Natural stone — no manufacturer warranty |
| Cert bundle | 0 | 0 | Natural stone — no product certifications |
| Domestic manufacturing | no | 0 | Quarried in Brazil |
| **Total** | | **+1** | Start 73 + 1 = **74** |

**Sources:** naturalstoneinstitute.org/technical-resources, ASTM C615 Standard

---

## Systemic Analysis of Remaining Flags

### Root cause: Engineered quartz spec uniformity
All 3 flagged products are engineered quartz (or share the same adjustment profile). They earn identical adjustments on:
- Mohs 7 (+1) — all quartz is Mohs 7
- Water absorption <0.05% (+1) — all quartz is non-porous
- Heat 300-400°F (+1) — all quartz is similar
- Impact no_failures (+1) — all quartz passes
- Flexural ≥8,000 (+1) — all quartz is strong
- Repairability minimal (-1) — all quartz is hard to repair
- Cert bundle (+1) — all premium quartz is certified

That's a guaranteed +5 floor for any premium engineered quartz, before warranty or manufacturing bonuses. The v2 system successfully differentiates Dekton (impact -2 offsets heat +2) and natural stone (no certs, no warranty, lower flexural), but it cannot differentiate within the quartz class because quartz products genuinely share nearly identical material properties.

### Recommended calibration options
1. **Lower the impact "no_failures" bonus to 0** — treat "no CR failures" as baseline, not a bonus. Only reward positive impact test results with documented Joules values. This would drop all quartz products by 1 point.
2. **Lower the flexural_strength threshold** — raise the top-tier threshold from 8,000 to 9,000 psi so only the strongest quartz products earn +1. At 9,000, MSI and Caesarstone (8,500) would get 0 instead of +1.
3. **Lower anchor targets by 2** — move Caesarstone from 82 to 80, MSI from 77 to 75. The spec adjustments then land them at 85 and 80 respectively, within range.

Option 1 + 2 combined would produce: Caesarstone 82+3=85 (in range), MSI 77+3=80 (in range), Dekton 91+1=92 (in range).

---

## TDS Verification Gaps

| Product | Spec | Issue | Priority |
|---|---|---|---|
| Cambria | heat_resistance_f | Cambria does not publish a single max temp — 400°F estimated | Medium |
| Dekton | warranty_transferable | Cosentino warranty generally transferable but verify current Dekton-specific terms | Low |
| Dekton | nsf_51 | Reported as NSF 51 but verify against current NSF database | Low |
| Caesarstone | warranty_transferable | Ambiguous — marked false pending verification | High |
| Caesarstone | nsf_51 | Verify certification still active post-manufacturing transition | Medium |
| MSI | flexural_strength_psi | Using material class estimate (8,500) — verify from MSI's published TDS | Medium |
| Ubatuba | flexural_strength_psi | Using NSI reference range midpoint (2,200) — verify species-specific data | Low |
| White Ice | water_absorption_pct | At 0.35%, borderline ASTM C615 max. Individual slabs may exceed. | Medium |
| White Ice | mohs_hardness | Using 6 — mineral composition varies by quarry source | Low |

---

## v1 → v2 Score Movement

| Product | v1 Score | v2 Score | Delta | Movement |
|---|---|---|---|---|
| Cambria Brittanicca | 100 | 96 | -4 | Capped by reserved range. Certs capped. |
| Dekton Aura 15 | 96 | 94 | -2 | Impact -2 penalty applied. Still +1 over. |
| Caesarstone | 87 | 87 | 0 | Same total. Lost cert stacking, gained material specs. |
| MSI Q Premium | 80 | 82 | +2 | Greenguard Gold corrected to true. Gained material specs. |
| Ubatuba Granite | 79 | 81 | +2 | Gained +2 from heat resistance (was 0 in v1). |
| White Ice Granite | 64 | 74 | +10 | Was penalized by wrong anchor (midpoint 67); now uses anchor target 73. Gained +2 heat. |
