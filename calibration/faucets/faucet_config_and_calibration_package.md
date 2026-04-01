# Faucet Category — Configuration & Calibration Package
## The Residentialist — March 30, 2026
## Step 0 complete. Ready for calibration scoring.

---

## AXIS WEIGHTS
- **Quality: 0.45** — Body material, construction method, cartridge manufacturer, finish technology, business model
- **Durability: 0.45** — Cartridge cycle life, warranty reality, parts availability, field longevity, finish longevity
- **Performance: 0.10** — Essentially flat. All legal faucets deliver water at regulated rates. Minor differentiation on spray technology, flow consistency, temperature stability. This axis compresses.

---

## TIER ANCHORS

| Tier | Range | Label | Anchor Products | Target |
|------|-------|-------|----------------|--------|
| 1 | 90-100 | Best in Class | Waterstone two-handle, California Faucets, In2aqua | 95, 92, 91 |
| 1 (lower) | 90-91 | Best in Class | Waterstone single-handle | 90 |
| 2 | 75-89 | Excellent | Brizo (DST cartridge lines) | 84 |
| 3 | 60-74 | Good | Delta mid-range | 70 |
| 4 | 40-59 | Fair | Kraus | 45 |
| 5 | 0-39 | Below Standard | Contraband/uncertified — excluded by certification gate |

---

## CALIBRATION PRODUCTS (7)

### 1. Waterstone Two-Handle
- **Target: 95** | Tier 1
- Business model: Manufacturer
- Body: 316 marine-grade stainless steel, machined from bar stock (not castings)
- Cartridge: Flühs (Tier 1) — 500K+ cycles
- Finish: 30+ custom finishes
- Construction: Monoblock — eliminates hidden voids
- Spray wands: Metal (not plastic)
- Warranty: Lifetime limited
- Factory: Murrieta, CA (42,000 sq ft)
- Source traceability: Single domestic factory
- StarCraft: "Finest faucet in the world" mission
- **Why this target:** Best body material + best cartridge + best construction method in category. Domestic manufacturer. Nothing above this except theoretical perfection.

### 2. California Faucets
- **Target: 92** | Tier 1
- Business model: Assembler (designs + hand-assembles from selected components at own facility)
- Body: Solid lead-free brass (cast)
- Cartridge: Flühs (Tier 1) across ALL configurations — no cartridge split
- Finish: 25+ artisan finishes, PVD available with lifetime guarantee
- Warranty: Lifetime limited, "outstanding" per StarCraft
- Factory: Huntington Beach, CA (180-person facility)
- Source traceability: Single domestic assembly, imported components
- StarCraft: Near-perfect score, Best Value NA Luxury 2023 + 2025 back-to-back
- **Why this target:** Flühs everywhere (no config compromise), PVD finish with lifetime guarantee, best customer service in category per StarCraft. Below Waterstone because brass < 316 SS and cast < machined, and assembler < manufacturer.

### 3. In2aqua
- **Target: 91** | Tier 1
- Business model: Manufacturer (German HQ, Holzgerlingen)
- Body: Solid brass
- Cartridge: Proprietary PVD+ coated ceramic disc — independently tested to 4,000,000 cycles (560 years equivalent), no visible wear
- Finish: Chrome, satin nickel, matte black, gold
- Warranty: Best warranty in the industry per StarCraft
- WaterSense: Listed on all bathroom sink faucets
- StarCraft: Best Value European Luxury, 7 consecutive years (2016-2025)
- **Why this target:** Cartridge innovation is category-leading (4M cycles dwarfs everything else). StarCraft's 7-year consecutive award is the longest streak of any brand. Below California Faucets because narrower finish selection and less established in NA market (thinner field data).

### 4. Waterstone Single-Handle
- **Target: 90** | Tier 1 (lower)
- Business model: Manufacturer (same factory as two-handle)
- Body: 316 marine-grade stainless steel, machined from bar stock
- Cartridge: Geann (Tier 3) — solid mid-range, NOT Flühs
- Finish: Same 30+ options as two-handle
- Construction: Same monoblock as two-handle
- Warranty: Same lifetime limited
- **Why this target:** Same exceptional body as two-handle but cartridge drops from Flühs (Tier 1) to Geann (Tier 3). Body advantage keeps it in Tier 1 but at the floor. This is the clearest example of Rule 19 — same brand, different product, different score.

### 5. Brizo (DST Cartridge Lines)
- **Target: 84** | Tier 2
- Business model: Manufacturer (Masco/Delta subsidiary, mixed sourcing)
- Body: Brass
- Cartridge: DST (Diamond Seal Technology) — independently tested to 5,000,000 cycles (700 years). Proprietary Delta/Masco technology.
- Finish: 20+ finishes, Brilliance PVD by Vapor Technologies (Masco company). "Nearly indestructible" per StarCraft field testing.
- Manufacturing: Now >2/3 China. StarCraft moved Brizo from North American to Asian category.
- Warranty: Lifetime limited (finish + function)
- StarCraft: Highly rated product, docked for manufacturing migration
- **Why this target:** DST cartridge (5M cycles) is technically the best-tested cartridge in the industry. Brilliance PVD is proven. But >2/3 China manufacturing + specifier/assembler model for offshore lines + loss of NA manufacturing classification per StarCraft keeps it out of Tier 1. Excellent product, compromised provenance.

### 6. Delta Mid-Range
- **Target: 70** | Tier 3
- Business model: Manufacturer (same parent as Brizo, mass market division)
- Body: Mixed — brass on some, zinc/composite on budget lines
- Cartridge: Varies by line — some have DST, many do not. Must score specific model.
- Finish: Chrome standard, some Brilliance PVD available
- Manufacturing: Majority China
- Warranty: Lifetime limited (function + finish)
- StarCraft: 6-8 range, varies significantly by specific line
- **Why this target:** Shares some tech with Brizo (DST on premium Delta) but cost-optimized across the board. Body material inconsistency (brass vs zinc varies by model). Mass market positioning means quality control spread is wider. Functional and reliable but not premium construction.

### 7. Kraus
- **Target: 45** | Tier 4
- Business model: Marketeer / Importer
- Body: Unknown / not disclosed per product (assumed mixed brass and zinc)
- Cartridge: Unknown manufacturer — brand does not disclose. Assumed Tier 4 generic Chinese.
- Finish: Chrome, stainless steel look
- Manufacturing: Chinese OEM factories, no identified factory
- Warranty: Limited lifetime (but excludes cartridge per industry red flag pattern)
- Parts availability: Long-term risk — marketeer has no manufacturing control
- StarCraft: 5-6 range per knowledge file
- **Why this target:** No manufacturing accountability, no cartridge transparency, no factory identity. Functional for a while but represents everything the scoring system is designed to differentiate from. Bottom of the legitimate certified market.

---

## SPEC FIELDS

### Quality Axis

| Spec Field | Values | Adjustment |
|------------|--------|------------|
| body_material | `316_ss` / `304_ss` / `solid_brass` / `zamak` / `plastic` | +2 / +1 / +1 / -4 / excluded |
| body_construction | `machined_bar_stock` / `cast` / `die_cast` | +1 / 0 / -1 |
| cartridge_manufacturer | `fluhs` / `kerox` / `geann` / `proprietary_tested` / `generic_chinese` / `unknown` | +2 / +1 / 0 / +1 / -2 / -3 |
| finish_type_best | `pvd` / `chrome` / `powder_coat` | +1 / 0 / 0 |
| business_model | `manufacturer` / `assembler` / `specifier` / `marketeer` / `rebrander` | +1 / 0 / -1 / -2 / -2 |
| source_traceability | `single_source` / `multi_source` / `unknown` | +1 / 0 / -1 |

### Durability Axis

| Spec Field | Values | Adjustment |
|------------|--------|------------|
| cartridge_cycle_life | Continuous metric (cycles) | ≥500K: +2, ≥100K: +1, ≥50K: 0, <50K: -1, unknown: -2 |
| warranty_type | `lifetime` / `limited_lifetime` / `10yr` / `5yr` / `1yr` | +1 / +1 / 0 / -1 / -2 |
| cartridge_warranty_included | `yes` / `no` / `unknown` | 0 / -2 / -1 |
| finish_warranty | `lifetime_pvd` / `lifetime` / `limited` / `none` | +1 / 0 / 0 / -1 |
| parts_availability | `excellent` / `good` / `limited` / `unknown` | +1 / 0 / -1 / -2 |

### Performance Axis (Compressed — 0.10 weight)

| Spec Field | Values | Adjustment |
|------------|--------|------------|
| spray_technology | `proprietary_advanced` / `standard` / `basic` | +1 / 0 / 0 |
| flow_certification | `watersense` / `federal_only` | +1 / 0 |
| temperature_stability | `thermostatic` / `pressure_balance` / `none` | +1 / 0 / 0 |

---

## FAUCET-SPECIFIC SCORING RULES

1. **Certification gate.** No UPC/cUPC certification = product excluded entirely. No NSF/ANSI 61 = product excluded entirely. If a faucet cannot be legally installed in the US, we do not score it. We note it as "Uncertified — Not Rated" with a contraband warning.

2. **ZAMAK red flag.** ZAMAK/zinc alloy in ANY water-path component = automatic -4 on body_material. If ZAMAK is the primary valve body material, consider exclusion. ZAMAK corrodes from inside out — invisible until catastrophic failure.

3. **Cartridge warranty separation.** Many brands advertise "lifetime warranty" but exclude the cartridge (the component most likely to fail — 90% of warranty claims are cartridge-related). If warranty excludes cartridge, that is a -2 on cartridge_warranty_included AND a Report Only finding flagging the warranty trick.

4. **Business model is a spec.** Unlike other categories where corporate structure is report-only, faucet business model directly predicts quality per StarCraft's 15+ years of data. Manufacturer > Assembler > Specifier > Marketeer > Rebrander. This IS the spec, not just context.

5. **Score the product, not the brand.** Per Rule 19. If handle type changes the cartridge, it's a different product. If retail channel changes the components (Kohler showroom vs Kohler HD), it's a different product. If a premium line and budget line share a brand name but not construction, they are separate products.

6. **Cartridge identification required.** If a brand cannot or will not identify their cartridge manufacturer, assume Tier 4 generic Chinese and apply the -3 unknown penalty. StarCraft: "If a brand can't or won't tell you who makes their cartridge, assume Tier 4."

7. **Weight as quality signal.** Report-only finding. Quality brass faucets weigh 5-12+ lbs. Budget faucets weigh 3-4 lbs. Document weight in report but do not score directly — body_material adjustment already captures this.

8. **Living finishes.** Not a quality issue. Designed to patina. Do not penalize or bonus. N/A for finish scoring.

---

## MATERIAL SAFETY (Report Only — Not Scored)

| Finding | Label | Notes |
|---------|-------|-------|
| NSF/ANSI 61 + NSF/ANSI 372 certified | Good | Meets legal requirements for drinking water safety |
| Lead-free brass (Eco-Brass, DZR) | Good | Modern standard |
| ZAMAK in water path | Concern | Dezincification risk, potential lead leaching from older ZAMAK alloys |
| No NSF/ANSI 61 | Concern | Not certified safe for drinking water contact |
| PVD+ cartridge coating | Excellent | Eliminates disc wear, prevents particulate contamination |

---

## DEEP DIVE PROMPT TEMPLATE

Use `templates/prompt_b_faucets.md` (to be created). Key steering:
- Identify cartridge manufacturer by name (Flühs, Kerox, Geann, or other)
- Identify body material (brass alloy, stainless grade, zinc/ZAMAK)
- Identify construction method (machined, cast, die-cast)
- Identify finish technology (PVD, chrome plating, powder coat)
- Identify business model (manufacturer, assembler, specifier, marketeer)
- Confirm UPC/NSF certification status
- Get StarCraft review findings if available
- Get TerryLove.com and professional plumber consensus
- Document warranty terms — specifically whether cartridge and finish are included or excluded

---

## NEXT STEPS

1. Build calibration scoring script (`score_faucets_calibration.js`) with the 7 products above
2. Set axis scores to hit targets through geometric mean (Q=0.45, D=0.45, P=0.10)
3. Run scoring, verify all 7 hit targets
4. Create `configs/faucets.json` on Residentialist Mac Mini
5. Create `templates/prompt_b_faucets.md` deep dive prompt
6. Run Perplexity deep dives for all 7 calibration products
7. Structure curation files, run investigator bot

---

*StarCraft is our North Star for this category. When in doubt, align with StarCraft's assessment. They have 15+ years of straw-buyer testing, teardowns, and 300+ brand reviews. No other source in any category we've built has this depth of independent testing.*
