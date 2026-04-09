# Countertop Spec Fields — Redesigned
## Based on Perplexity Testing Framework Deep Dive, March 27, 2026

---

## THE PROBLEM WITH v1

The original spec fields were mostly binary (Greenguard Gold yes/no, NSF 51 yes/no, warranty transferable yes/no). Every premium product checked every box, giving them all the same +5 spec adjustment. No differentiation within tier. The scores inflated uniformly.

## THE FIX

Replace binary checkboxes with continuous, ASTM-verified numerical metrics that create real spread. Keep the binary certs but cap their total contribution.

---

## NEW SPEC FIELDS BY AXIS

### Performance Specs (these are NOT flat — huge cross-class and some within-class spread)

| Field | Unit | Test Standard | Why It Matters | Expected Range |
|---|---|---|---|---|
| heat_resistance_f | °F | NEMA LD3-3.6/3.10, EN 14617-6, NSF 51-2025 | Can you put a hot pan on it? Ranges from ~200°F (laminate) to 1,472°F (sintered). Quartz scorches at 150-300°F — a real daily-use limitation. | 200-1,500 |
| mohs_hardness | Mohs | Mohs scratch test (Karin Kirk protocol) | Will kitchen use scratch it? Steel knives ~5.5-6.5. Ranges from 2 (solid surface) to 8 (sintered). Quartz and granite cluster at 6-7 but sintered stone separates clearly. | 2-8 |
| water_absorption_pct | % | ASTM C97 | Porosity drives stain susceptibility and microbial resistance. Ranges from 0.02% (sintered/quartz) to 0.8% (some granite/marble). Lower = better. | 0.01-1.0 |
| stain_resistance | Class 1-5 | ISO 10545-14 / ASTM C1378 | Does lemon juice, wine, coffee leave a mark? Karin Kirk's testing showed real within-class differences (Caesarstone quartz stained, Dekton didn't). | 1-5 |
| uv_resistance | boolean | ASTM G154 / ISO 4892-2 | Will it yellow near windows or in outdoor applications? Sintered stone passes; quartz often fails. Binary but meaningful for specific installations. | true/false |

### Durability Specs

| Field | Unit | Test Standard | Why It Matters | Expected Range |
|---|---|---|---|---|
| flexural_strength_psi | psi | ASTM C880 / EN 14617-2 | Will the slab survive unsupported spans or dropped heavy objects? Quartz leads (~8,700-10,875 psi), granite varies widely (1,740-7,700 psi), sintered stone mid-range (~5,500 psi). | 1,000-11,000 |
| impact_resistance_joules | Joules | EN 14617-9 / Consumer Reports protocol | Will it crack from a dropped cast iron pan? Dekton split entirely in CR testing despite excellent scores everywhere else. This is THE spec that differentiates Dekton from quartz. | 1-10 |
| abrasion_resistance_index | index | ASTM C1353 | How does it hold up to daily wear? Volume loss measured after 1,000 rotations. Higher index = more wear. | 50-500 |
| repairability | categorical | N/A (professional consensus) | Can damage be fixed? Solid surface = full (sand and buff). Granite = partial (fill chips). Quartz/sintered = minimal (epoxy touch-up). Laminate = none (replace). | full/partial/minimal/none |
| warranty_years | years | N/A | Duration of manufacturer warranty. 999 = lifetime. | 1-999 |
| warranty_transferable | boolean | N/A | Does warranty transfer to new homeowner? Cambria = yes (unique advantage). MSI = no. Critical for resale value. | true/false |

### Quality Specs (most of these are already captured in tier placement via expert consensus — keep as tiebreakers)

| Field | Unit | Source | Why It Matters |
|---|---|---|---|
| domestic_manufacturing | boolean | Manufacturer data | Single-source domestic vs multi-source global. Already reflected in tier placement but confirms it in specs. |
| certification_count | number | Manufacturer data | Total independent certifications held (Greenguard Gold, NSF 51, HPD, Declare, LEED contributing). Cap adjustment at +1 regardless of count — having certs is table stakes for premium products. |
| slab_consistency | categorical | Fabricator consensus | Pattern extends through full slab thickness vs surface-only. Fabricator quality tell. High/Medium/Low. |

### Material Safety (Report Only — unchanged)

| Field | Source | Notes |
|---|---|---|
| resin_content_pct | Manufacturer TDS / HPD | Quartz ~7-10%. Sintered = 0%. Granite = 0%. Higher resin = more off-gassing potential. |
| requires_sealing | Manufacturer data | Granite/marble = yes (PFAS sealer concern). Quartz/sintered/solid surface = no. |
| greenguard_gold | Manufacturer cert | VOC emissions ≤220 μg/m³. Report only — confirms managed. |
| nsf_51 | Manufacturer cert | Food contact safe. Report only — confirms managed. |
| hpd_available | HPD Repository | Has the manufacturer published an HPD? Transparency signal. |

---

## REVISED SPEC ADJUSTMENT SCORING

### Performance adjustments (NEW — these create the spread we were missing)

| Spec | Condition | Adjustment | Rationale |
|---|---|---|---|
| heat_resistance_f | ≥1,000°F | +2 | True hot-pan-proof (sintered stone, granite) |
| heat_resistance_f | 300-999°F | +1 | Moderate heat tolerance |
| heat_resistance_f | <300°F | 0 | Base (quartz and below) |
| heat_resistance_f | <200°F | -1 | Notably heat-vulnerable (laminate, some solid surface) |
| mohs_hardness | ≥7 | +1 | Scratch-proof in normal kitchen use |
| mohs_hardness | 5-6.9 | 0 | Base (resists most but not all implements) |
| mohs_hardness | <5 | -1 | Scratches from normal kitchen use |
| water_absorption_pct | <0.05% | +1 | Virtually non-porous |
| water_absorption_pct | 0.05-0.4% | 0 | Base (within ASTM stone spec) |
| water_absorption_pct | >0.4% | -1 | Above ASTM C615 granite max; sealer-dependent |
| impact_resistance | No failures in testing | +1 | Confirmed impact-safe |
| impact_resistance | Documented cracking/splitting | -2 | Severe — the Dekton CR finding |

### Durability adjustments

| Spec | Condition | Adjustment | Rationale |
|---|---|---|---|
| flexural_strength_psi | ≥8,000 | +1 | Top-tier bending resistance |
| flexural_strength_psi | 4,000-7,999 | 0 | Base — adequate |
| flexural_strength_psi | <4,000 | -1 | Weakness under load |
| repairability | full | +1 | Solid surface: sand, buff, restore |
| repairability | partial | 0 | Granite: fill chips |
| repairability | minimal/none | -1 | Quartz/sintered: replace slab |
| warranty_transferable | yes | +1 | Resale value protection |
| warranty_transferable | no | 0 | Base |

### Quality/Certification adjustments (CAPPED at +1 total)

| Spec | Condition | Adjustment | Rationale |
|---|---|---|---|
| certification_bundle | Any combination of Greenguard Gold + NSF 51 + HPD + Declare | +1 max | Having certs is table stakes. Don't stack. |
| domestic_manufacturing | yes | +1 | Single-source quality control |
| domestic_manufacturing | no | 0 | Base |

### Total spec adjustment cap: ±8 (unchanged)

---

## HOW THIS FIXES THE INFLATION PROBLEM

**Old v1 scoring for Cambria:**
- Transferable warranty: +2
- Lifetime warranty: +1
- Greenguard Gold: +1
- NSF 51: +1
- Total: +5 (same as every other premium product)

**New scoring for Cambria:**
- Heat resistance <300°F: +0 (quartz is heat-vulnerable — a REAL limitation)
- Mohs 7: +1
- Water absorption <0.05%: +1
- Impact: +1 (no documented failures)
- Flexural strength ~9,000 psi: +1
- Repairability minimal: -1
- Warranty transferable: +1
- Cert bundle: +1 (capped)
- Domestic manufacturing: +1
- Total: +6

**New scoring for Dekton:**
- Heat resistance 1,472°F: +2
- Mohs 7-8: +1
- Water absorption 0.02%: +1
- Impact: -2 (CR documented splitting — this is the big one)
- Flexural strength ~5,500 psi: 0
- Repairability minimal: -1
- Warranty transferable: (check Dekton warranty terms)
- Cert bundle: +1
- Domestic manufacturing: 0
- Total: +2

**New scoring for MSI Q Premium:**
- Heat resistance <300°F: +0
- Mohs 7: +1
- Water absorption <0.05%: +1
- Impact: +1
- Flexural strength ~9,000 psi: +1
- Repairability minimal: -1
- Warranty NOT transferable: 0
- Cert bundle: +1
- Domestic manufacturing: 0 (multi-source, some domestic)
- Total: +4

Now the specs DIFFERENTIATE. Cambria and MSI don't get the same adjustment. Dekton gets dinged for impact despite winning on heat. The numbers tell a story.

---

## ESTIMATED RESCORED RESULTS

Applying new spec adjustments to existing tier placements:

| Product | Tier Midpoint/Anchor | Old Spec Adj | New Spec Adj | Old Score | New Est. Score | Target |
|---|---|---|---|---|---|---|
| Cambria | 95 anchor | +5 | +6 | 100 | ~97* | 92-97 |
| Dekton | 91 anchor | +5 | +2 | 96 | ~93 | 89-93 |
| Caesarstone | 82 anchor | +5 | +4 | 87 | ~84* | 79-85 |
| Ubatuba | 80 anchor | +0 | +1 | 79 | ~80 | 77-83 |
| MSI Q Premium | 77 anchor | +3 | +4 | 80 | ~79* | 74-80 |
| White Ice | 73 anchor | -1 | -1 | 70 | ~72 | 70-76 |

*Clamped to tier max if needed. Cambria at 97 would hit the tier cap — which is correct, since 97-100 is reserved.

**Key: Dekton drops from 96 to ~93 because the impact penalty (-2) offsets its heat advantage (+2).** That's real. That's what the data shows. That's what a homebuyer should know.

---

## SOURCE POOL UPDATE

| Source | Pool | Change | Rationale |
|---|---|---|---|
| Karin Kirk / Countertop Investigator | S (PROMOTED) | Was A | Only independent, methodology-documented, multi-material comparative test in the public domain. Geologist credentials. Hands-on testing with Mohs picks, stain agents, heat sources. The countertop StarCraft equivalent. |
| Consumer Reports | S | No change | 14-material battery including the Dekton impact finding. Qualitative ratings but rigorous protocol. |
| Natural Stone Institute Testing Lab | A | NEW | ISO 17025 accredited. Runs the actual ASTM tests. Personnel lead ASTM C18 and ISO/TC 327. |
| Fine Homebuilding / GBA | A | No change | |
| Countertop Specialty | A | No change | |
| Fabricator forums | B | No change | |
| Granite Guy Inc | B | No change | |

---

## NEXT STEPS

1. Update countertops.json config with new spec fields and adjustment rules
2. Verify which specs are available in manufacturer TDS for each calibration product
3. Rescore all 6 products with new spec adjustments
4. Validate scores land in target ranges
5. If Karin Kirk's 2019 data provides product-specific numerical results for any calibration product, import those as verified specs

---

## THE RESIDENTIALIST OPPORTUNITY (from Perplexity gap map)

The report explicitly states: "No JD Power / Energy Star equivalent exists for countertop materials." The gap map shows no aggregated performance database, no brand-to-brand standardized comparison, no publicly accessible numerical rating system. This is exactly what The Residentialist is building. Worth noting in pitch materials and YouTube content framing.
