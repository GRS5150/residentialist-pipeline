# Countertop Final Rescore Summary — 2026-03-28

## Results

| Product | Score | Target | Range | Spec Adj | v2 Score | Delta | Status |
|---|---|---|---|---|---|---|---|
| Cambria Brittanicca | **96** | 95 | 92-97 | +6 | 96 | 0 | **OK** |
| Dekton Aura 15 | **94** | 91 | 89-93 | +3 | 94 | 0 | **FLAG (+1)** |
| Caesarstone Calacatta Maximus | **86** | 82 | 79-85 | +4 | 87 | -1 | **FLAG (+1)** |
| MSI Q Premium Calacatta Arno | **81** | 77 | 74-80 | +4 | 82 | -1 | **FLAG (+1)** |
| Ubatuba Granite | **82** | 80 | 77-83 | +2 | 81 | +1 | **OK** |
| White Ice Granite | **74** | 73 | 70-76 | +2 | 74 | 0 | **OK** |

**3 in range, 3 flagged.** All flags are exactly +1 over their range ceiling. Improvement from v1 where overages were +2 to +8.

---

## Changes Made

### Change 1: Certification Bundle Removed from Composite

**What:** Removed the +1 certification_bundle adjustment (Greenguard Gold + NSF 51 + HPD) from composite scoring. Certs remain in DB and Material Safety report section.

**Why:** The Residentialist methodology defines Material Safety as report-only — it does not affect the composite score. Greenguard Gold and NSF 51 are health/safety certifications. Including them in composite violated the methodology's own rule. Every premium quartz product has these certs, so the +1 added zero differentiation while inflating all scores uniformly.

**Impact:**
- Cambria: -1 (was +7, now +6) — no score change, still clamped at 96
- Dekton: -1 (was +3 with cert, now +3 without cert but +1 from new source_traceability) — net 0
- Caesarstone: -1 (87 → 86)
- MSI: -1 (82 → 81)
- Ubatuba: 0 (had no certs)
- White Ice: 0 (had no certs)

**Files changed:**
- `configs/countertops.json`: `certification_count` field marked `report_only: true`, `certification_bundle` adjustment removed
- `score_calculator.js`: cert bundle logs as "report-only, no composite impact" instead of adding +1

### Change 2: domestic_manufacturing → source_traceability

**What:** Replaced the binary `domestic_manufacturing` (true/false) with a 3-tier `source_traceability` field:
- `single_source` (+1): Traceable to a single factory or identifiable geological formation with testable ASTM composition
- `multi_source` (0): Multiple global suppliers or fully outsourced manufacturing
- `unknown` (-1): No disclosed origin (future use for generic builder-grade)

**Why:** "Domestic manufacturing" was US-centric and missed the real quality signal. Dekton is manufactured in Spain at a single Cosentino facility — that's excellent supply chain traceability despite not being "domestic." Natural granite from a specific formation (Ubatuba from Minas Gerais) has testable, identifiable composition — that's single-source traceability despite being imported. The quality signal is whether you can trace and verify the material, not which country it ships from.

**Assignments:**
| Product | Old Field | Old Value | New Field | New Value | Rationale |
|---|---|---|---|---|---|
| Cambria | domestic_manufacturing | true (+1) | source_traceability | single_source (+1) | One factory, Le Sueur MN |
| Dekton | domestic_manufacturing | false (0) | source_traceability | single_source (+1) | Single Cosentino process, Almeria Spain |
| Caesarstone | domestic_manufacturing | false (0) | source_traceability | multi_source (0) | 100% third-party manufacturing since Dec 2025 |
| MSI | domestic_manufacturing | false (0) | source_traceability | multi_source (0) | 25+ global suppliers |
| Ubatuba | domestic_manufacturing | false (0) | source_traceability | single_source (+1) | Specific geological formation, testable ASTM |
| White Ice | domestic_manufacturing | false (0) | source_traceability | single_source (+1) | Specific geological formation, testable ASTM |

**Net impact of Change 2:**
- Dekton: +1 (was 0, now single_source +1)
- Ubatuba: +1 (was 0, now single_source +1)
- White Ice: +1 (was 0, now single_source +1)
- Cambria, Caesarstone, MSI: no change

**Files changed:**
- `configs/countertops.json`: quality_specs field renamed, adjustment rules updated
- `score_calculator.js`: source_traceability logic with backward compat for old field
- `manufacturers/*.json`: unchanged (stubs retain original domestic_manufacturing field)
- `verified_specs` DB table: `source_traceability` row added for all 6 products

---

## Full Spec Adjustment Breakdown

### Cambria Brittanicca — 96 (IN RANGE, target 92-97)
| # | Spec | Value | Adj | Rationale |
|---|---|---|---|---|
| 1 | Heat resistance | 400°F | +1 | ≥300°F moderate tolerance |
| 2 | Mohs hardness | 7 | +1 | ≥7 scratch-proof |
| 3 | Water absorption | 0.02% | +1 | <0.05% non-porous |
| 4 | Impact resistance | no_failures | +1 | CR: no quartz splitting |
| 5 | Flexural strength | 8,700 psi | +1 | ≥8,000 top-tier |
| 6 | Repairability | minimal | -1 | Replace slab |
| 7 | Warranty transferable | yes | +1 | Unique among quartz brands |
| 8 | Cert bundle | 4 certs | — | Report-only (GG + NSF 51 + HPD + LEED) |
| 9 | Source traceability | single_source | +1 | Le Sueur MN, own quarry |
| | **Total** | | **+6** | Start 95 + 6 = 101, clamped to **96** |

### Dekton Aura 15 — 94 (FLAG: +1 over 89-93 range)
| # | Spec | Value | Adj | Rationale |
|---|---|---|---|---|
| 1 | Heat resistance | 1,472°F | +2 | ≥1,000°F hot-pan-proof |
| 2 | Mohs hardness | 8 | +1 | Hardest common countertop |
| 3 | Water absorption | 0.02% | +1 | Sintered stone, zero porosity |
| 4 | Impact resistance | **documented_failures** | **-2** | **CR: only material that split entirely** |
| 5 | Flexural strength | 5,500 psi | 0 | 4,000-7,999 adequate |
| 6 | Repairability | minimal | -1 | Replace slab |
| 7 | Warranty transferable | yes | +1 | 25yr Cosentino warranty |
| 8 | Cert bundle | 4 certs | — | Report-only |
| 9 | Source traceability | single_source | +1 | Single Cosentino facility |
| | **Total** | | **+3** | Start 91 + 3 = **94** |

**Why flagged:** Score 94 is +1 above the 93 ceiling. Dekton's material property advantages (heat +2, Mohs +1, water +1 = +4) outweigh its penalties (impact -2, repairability -1 = -3) by more than expected. The impact -2 is working — without it Dekton would score 96 — but the net +3 from a 91 anchor still overshoots by 1.

### Caesarstone Calacatta Maximus — 86 (FLAG: +1 over 79-85 range)
| # | Spec | Value | Adj | Rationale |
|---|---|---|---|---|
| 1 | Heat resistance | 300°F | +1 | ≥300°F moderate |
| 2 | Mohs hardness | 7 | +1 | Standard quartz |
| 3 | Water absorption | 0.02% | +1 | Non-porous |
| 4 | Impact resistance | no_failures | +1 | CR: no splitting |
| 5 | Flexural strength | 8,500 psi | +1 | Top-tier |
| 6 | Repairability | minimal | -1 | Replace slab |
| 7 | Warranty transferable | no | 0 | Original purchaser only |
| 8 | Cert bundle | 3 certs | — | Report-only |
| 9 | Source traceability | multi_source | 0 | 100% outsourced since Dec 2025 |
| | **Total** | | **+4** | Start 82 + 4 = **86** |

**Why flagged:** +4 from an 82 anchor = 86, which is +1 over the 85 ceiling. Caesarstone earns the same material-property adjustments as all premium quartz (+1 heat, +1 Mohs, +1 water, +1 impact, +1 flexural, -1 repair = +4). It correctly loses warranty transferable (0 vs Cambria's +1) and source traceability (0 vs Cambria's +1), creating a 2-point gap. But the +4 floor for quartz still overshoots.

### MSI Q Premium Calacatta Arno — 81 (FLAG: +1 over 74-80 range)
| # | Spec | Value | Adj | Rationale |
|---|---|---|---|---|
| 1 | Heat resistance | 300°F | +1 | ≥300°F moderate |
| 2 | Mohs hardness | 7 | +1 | Standard quartz |
| 3 | Water absorption | 0.03% | +1 | Non-porous |
| 4 | Impact resistance | no_failures | +1 | No documented failures |
| 5 | Flexural strength | 8,500 psi | +1 | Top-tier |
| 6 | Repairability | minimal | -1 | Replace slab |
| 7 | Warranty transferable | no | 0 | NOT transferable — confirmed |
| 8 | Cert bundle | 3 certs | — | Report-only (GG VERIFIED + NSF 51) |
| 9 | Source traceability | multi_source | 0 | 25+ global suppliers |
| | **Total** | | **+4** | Start 77 + 4 = **81** |

**Why flagged:** Same +4 as Caesarstone. MSI correctly differentiates from Cambria by losing warranty transferable and source traceability, but the +4 quartz floor still pushes 1 point over.

### Ubatuba Granite — 82 (IN RANGE, target 77-83)
| # | Spec | Value | Adj | Rationale |
|---|---|---|---|---|
| 1 | Heat resistance | 1,200°F | +2 | Igneous rock, hot-pan-proof |
| 2 | Mohs hardness | 6.5 | 0 | Base (5-6.9) |
| 3 | Water absorption | 0.15% | 0 | Within ASTM C615 |
| 4 | Impact resistance | no_data | 0 | Not CR-tested |
| 5 | Flexural strength | 2,200 psi | -1 | <4,000 psi |
| 6 | Repairability | partial | 0 | Chips can be filled |
| 7 | Warranty transferable | N/A | 0 | Natural stone, no mfg warranty |
| 8 | Cert bundle | 0 certs | — | Report-only |
| 9 | Source traceability | single_source | +1 | Verde Ubatuba formation, Minas Gerais Brazil |
| | **Total** | | **+2** | Start 80 + 2 = **82** |

### White Ice Granite — 74 (IN RANGE, target 70-76)
| # | Spec | Value | Adj | Rationale |
|---|---|---|---|---|
| 1 | Heat resistance | 1,200°F | +2 | Igneous rock, hot-pan-proof |
| 2 | Mohs hardness | 6 | 0 | Base |
| 3 | Water absorption | 0.35% | 0 | Within ASTM C615 but borderline |
| 4 | Impact resistance | no_data | 0 | Not CR-tested |
| 5 | Flexural strength | 1,800 psi | -1 | <4,000 psi |
| 6 | Repairability | partial | 0 | Chips can be filled |
| 7 | Warranty transferable | N/A | 0 | Natural stone, no mfg warranty |
| 8 | Cert bundle | 0 certs | — | Report-only |
| 9 | Source traceability | single_source | +1 | Specific geological formation |
| | **Total** | | **+2** | Start 73 + 2 = **74** |

---

## Remaining Flag Analysis

All 3 flags are exactly +1 over their range ceiling. The root cause is unchanged from the v2 analysis: premium engineered quartz earns a guaranteed +4 floor from material properties (heat +1, Mohs +1, water +1, impact +1, flexural +1, repairability -1). This is not an error — quartz genuinely has these properties. The question is whether the anchor targets should shift down by 1 to absorb the uniform adjustment, or whether the +4 is working correctly and the range ceilings should widen by 1.

**Recommended fix (pick one):**
- **Option A:** Lower Dekton anchor 91→90, Caesarstone anchor 82→81, MSI anchor 77→76. All three then land exactly at their range ceilings.
- **Option B:** Accept +1 overshoot. All 3 are within 1 point of range. The scores are defensible — they just reflect that quartz material properties earn a consistent bonus.

---

## Score Progression Across All Versions

| Product | v1 (binary) | v2 (continuous) | Final (no certs, traceability) | Net Change |
|---|---|---|---|---|
| Cambria | 100 | 96 | **96** | -4 |
| Dekton | 96 | 94 | **94** | -2 |
| Caesarstone | 87 | 87 | **86** | -1 |
| MSI | 80 | 82 | **81** | +1 |
| Ubatuba | 79 | 81 | **82** | +3 |
| White Ice | 64 | 74 | **74** | +10 |

Largest improvements: White Ice (+10 — anchor target fix + heat bonus + source traceability), Ubatuba (+3 — source traceability + heat), Cambria (-4 — cert cap + reserved range clamp).
