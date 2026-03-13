# Windows & Doors -- Deterministic Scoring Rubrics v5
## The Residentialist -- Product Intelligence System

**Version:** v5 — March 6, 2026. Updated per council Items 10-A through 10-D (PHI as Tier 1 U-Factor source; EN 12207 Class 4 as scoreable AI input with corrected conversion; CE marking structural floor raised to class-based scale; European delta-T penalty reduced to −0.5).

**Purpose:** This document maps measurable data inputs to specific score outputs for every objective metric in the windows evaluation framework. Any analyst given the same NFRC/AAMA data will produce the same subscores. Published as part of methodology transparency.

**Applies to:** All window and door evaluations. Category-specific rubrics for other product categories (faucets, countertops, HVAC, appliances) follow the same structural pattern with different metrics.

**Universal Principles:** This rubric inherits all 12 principles in `residentialist_universal_rubric_principles.md`. Load that document before this one in every scoring session. In any conflict between this document and the universal principles, the universal principles govern unless a council-validated exception is noted here.

**Scoring scale:** 1-10 for all metrics. Scores map to letter grades per the universal scale (A+ = 9.5-10, A = 9.0-9.4, etc.)

**Boundary rule:** Products within 0.01 of a U-factor tier boundary or within NFRC measurement uncertainty of any boundary carry a ±1 point disclosure. Example: U-factor 0.26 scores 7, but the report notes "±1 at tier boundary."

**Configuration lock:** Every evaluation specifies the exact unit size (e.g., 3050 tilt-wash DH), glazing package (e.g., Low-E4 SmartSun + HeatLock + argon), and grille configuration. All NFRC/AAMA data is pulled for that specific configuration. All competitor comparisons use the same reference unit dimensions and comparable glazing.

---

## AXIS 1: QUALITY (Scored 1-10)

Quality measures how well this specific product was designed and manufactured within its class. Quality subscores blend deterministic metrics with structured professional judgment.

### 1A. Component/Material Grade (30% of Quality)

This subscore blends deterministic and judgment-based elements:

**Deterministic elements (60% of this subscore):**

| Component | Data Required | Scoring |
|---|---|---|
| Spacer system | Confirmed from AAMA test report or architectural spec | One-piece stainless steel = 10. Warm-edge foam/hybrid (Super Spacer, TGI, Endure) = 8. Multi-piece stainless = 7. Four-piece aluminum = 4. Unknown/unverified = 5 with "Partial" data completeness flag. |
| Balance system | Confirmed from manufacturer spec or independent analysis | AAMA Class 5 constant force = 10. Class 4 = 9. Class 3 coil spring = 8. Class 2 block-and-tackle = 7. Class 1 = 5. Unknown = 5 with flag. |
| Weather stripping attachment | Confirmed from spec or teardown | Channeled/integrated = 10. Mechanically fastened = 8. Adhesive/glued = 6. Unknown = 5 with flag. |
| Weather stripping coverage | Confirmed from spec | All lineal joints + triple weather stripped = 10. All lineal joints + double = 8. Partial coverage (head/sill/meeting rail only) = 6. Unknown = 5 with flag. |
| Glazing bead construction | Confirmed from spec or teardown | Double-wall integrated = 10. Single-wall snap-in = 6. No glazing bead (full sash replacement required) = 5. Unknown = 5 with flag. |

**Judgment-based elements (40% of this subscore):**
- Frame material grade within class (e.g., quality of the pine core, vinyl compound formulation, fiberglass pultrusion quality)
- Hardware finish options and mechanism quality
- Manufacturing precision indicators (corner joints, miter quality, finish consistency)

Judgment-based elements use structured tiers:
- Excellent (9-10): Premium materials confirmed, no documented quality control issues, professional consensus positive
- Good (7-8): Solid materials, minor issues documented or minor unknowns
- Adequate (5-6): Standard materials, some cost optimization documented
- Below standard (3-4): Documented cheap components or widespread QC issues
- Poor (1-2): Confirmed deficient materials or recalls

### 1B. Manufacturing & Engineering (40% of Quality)

**Deterministic elements (40% of this subscore):**

| Metric | Scoring |
|---|---|
| Business model | True manufacturer with own factory = 10. Manufacturer through licensed facilities = 8. Assembler with quality components = 7. Specifier = 6. Marketeer = 4. Retail rebrander = 3. |
| Certification breadth | NFRC + AAMA Gold Label + Energy Star + PHI/Phius = 10. NFRC + AAMA Gold = 9. NFRC + AAMA Silver/Bronze = 8. NFRC + WDMA Hallmark = 8. NFRC only = 6. No NFRC = 3. |
| Triple-pane availability | Standard offering = 10. Available as upgrade = 8. Not available = 6. |
| Laminated glass availability | Standard = 10. Available = 8. Not available on this product type = 6 (no penalty for types where laminated is unusual). |

**Judgment-based elements (60% of this subscore):**
- Engineering innovation and design approach
- Frame construction sophistication (chamber count for vinyl, cladding system for wood-clad, thermal break design for aluminum)
- Documented design limitations (e.g., gray substrate on non-white vinyl, no glazing bead)
- Evidence of cost optimization vs engineering optimization in design choices

Structured tiers (same Excellent/Good/Adequate/Below/Poor scale as above).

### 1C. Professional Consensus on Quality (30% of Quality)

**Structured field intelligence tier (not numeric -- categorical):**

| Tier | Criteria | Score Range |
|---|---|---|
| Excellent | 5+ independent professional sources praise quality without qualification. No professional criticism of build quality documented. | 9-10 |
| Good | Professional consensus positive with minor caveats. 1-2 specific component criticisms but overall positive. | 7-8 |
| Mixed | Professional opinions split. Some praise, some criticize. Or limited professional data available. | 5-6 |
| Concerning | Multiple professional sources cite quality concerns. Pattern of complaints about specific components. | 3-4 |
| Poor | Professionals actively warn against. Widespread documented quality failures. | 1-2 |

**Professional Consensus Ceiling Rule:** If 2+ independent professional sources recommend specific competing products at the same or lower price, Professional Consensus cannot exceed 7.5.

**Source quality requirements:**
- "Professional source" = contractor, builder, building scientist, or independent consultant with verifiable credentials
- Forum posts from verified professionals count. Anonymous consumer complaints do not.
- Manufacturer marketing does not count as professional consensus.

---

## AXIS 2: DURABILITY (Scored 1-10)

### 2A. Longevity (37.5% of Durability)

**Deterministic elements (50% of this subscore):**

**Warranty-Lifespan Alignment Rule:** If the judgment-based Longevity tier score is more than 1.5 points below the deterministic warranty average, cap the deterministic warranty average at the judgment score + 2. This prevents warranty paperwork from inflating Durability on products that won't survive long enough to use the warranty. A 20-year glass warranty on a product expected to last 12-18 years is functionally a 12-18 year warranty. This rule only triggers on products where warranty terms overpromise relative to field reality. The cap applies upward only -- it never deflates a score, only limits inflation. Threshold tightened from 2.0 to 1.5 points per council validation, March 2026.

| Metric | Scoring |
|---|---|
| Glass/IGU warranty | 25+ years = 10. 20 years = 8. 15 years = 7. 10 years = 6. 5 years = 4. Less than 5 = 2. |
| Non-glass component warranty | 20+ years = 10. 15 years = 9. 10 years = 8. 7 years = 7. 5 years = 6. Less than 5 = 4. |
| Exterior finish warranty | 20+ years = 10. 15 years = 9. 10 years = 8. 5 years = 6. Less than 5 = 4. |
| P1 chamber results (if available) | 20+ weeks = 10. 15-19 weeks = 9. 10-14 weeks = 8. 5-9 weeks = 6. Under 5 weeks = 4. Not published = no score (data completeness flag). |
| Proration | Non-prorated = 10. Prorated after 15+ years = 8. Prorated after 10 years = 6. Prorated after 5 years = 4. |

**Judgment-based elements (50% of this subscore):**
- Documented multi-decade installations and their condition
- Documented failure mode timeline (when do seals typically fail for this product?)
- Frame material longevity track record (wood rot history, vinyl degradation, fiberglass stability)

Structured tiers:
- 30+ year documented track record with minimal issues = 9-10
- 20-30 year track record, manageable issues = 7-8
- 15-20 year expected life, some documented degradation patterns = 5-6
- Under 15 years expected or widespread early failures = 3-4
- Under 10 years or documented premature failure pattern = 1-2

### 2B. Materials Durability (37.5% of Durability)

**Deterministic elements (70% of this subscore):**

| Frame Material | Base Score | Adjustments |
|---|---|---|
| Fiberglass (pultruded) | 9 | +1 if thermal expansion matches glass (reduces seal stress) |
| Wood-clad, aluminum cladding | 8 | +1 for documented cladding gauge and finish system. -1 if cladding system has documented failure pattern. |
| Wood-clad, vinyl cladding | 7 | +1 for documented longevity track record. -1 for documented color substrate issues on non-white. |
| Premium vinyl (foam-filled or 15+ chambers, welded corners) | 7 | +1 for documented titanium dioxide content and UV resistance data. |
| Standard vinyl (hollow, mechanical corners, fewer chambers) | 5 | -1 if documented UV degradation or warping pattern. |
| Composite/proprietary (Fibrex, etc.) | 6 | +1 for published composition and longevity data. -1 for documented serviceability limitations (e.g., no glazing bead). |
| Aluminum without thermal break | 4 | Thermal bridging inherently limits durability of seals and interior condensation management. |
| Aluminum with thermal break | 7 | Quality of thermal break determines adjustment (polyamide = +1, PVC = 0). |

| Seal System | Score Adjustment |
|---|---|
| Triple-pane with dual seal | +1 to base material score |
| Double-pane with dual seal | +0.5 |
| Double-pane with single seal | +0 |
| Seal system unknown | -0.5 with data completeness flag |

### 2C. Repairability & Support (25% of Durability)

**Deterministic elements (60% of this subscore):**

| Metric | Scoring |
|---|---|
| IGU replacement method | Glass-only swap via glazing bead = 10. Full sash replacement required = 6. Full window replacement required = 3. |
| Parts availability commitment | Parts guaranteed 20+ years = 10. 15 years = 8. 10 years = 7. 5 years = 5. No commitment = 4. |
| Labor warranty coverage | Parts + labor = 10. Parts only with low labor cost = 7. Parts only = 6. Limited parts coverage = 4. |
| Warranty transferability | Fully transferable, non-prorated = 10. Transferable, prorated = 7. Not transferable = 4. |
| Dealer/service network | Manufacturer-direct service = 10. Nationwide certified dealer network = 9. Regional dealer network = 7. Dealer-dependent, variable = 6. Limited/no service network = 4. |

**Judgment-based elements (40% of this subscore):**
- Documented warranty claims experience (how does the manufacturer actually handle claims?)
- Post-warranty parts availability track record
- Brand stability and company financial health

Structured tiers:
- Documented decades of parts availability + positive claims experience + $1B+ company = 9-10
- Good parts availability + generally positive claims experience + stable company = 7-8
- Adequate parts + mixed claims experience = 5-6
- Limited parts + difficult claims process or small/unstable company = 3-4
- No parts infrastructure or company stability concerns = 1-2

---

## AXIS 3: PERFORMANCE (Scored 1-10) -- Systems categories only

Performance measures how well the product does its primary job, based on independently certified test data.

### 3A. Thermal Performance (25% of Performance)

**100% deterministic. No judgment-based elements.**

| U-Factor (Total Unit, NFRC Certified) | Score |
|---|---|
| ≤0.15 | 10 |
| 0.16-0.18 | 9.5 |
| 0.19-0.20 | 9 |
| 0.21-0.23 | 8 |
| 0.24-0.25 | 7.5 |
| 0.26-0.28 | 7 |
| 0.29-0.30 | 6.5 |
| 0.31-0.33 | 6 |
| 0.34-0.36 | 5 |
| 0.37-0.40 | 4 |
| >0.40 | 3 |
| Not NFRC certified | 2 with Red Finding |

**Data requirement:** NFRC total-unit U-factor for the specific configuration and size being evaluated. Center-of-glass values are NOT acceptable. If total-unit is unavailable, score receives "Partial" data completeness with the center-of-glass value noted and a -1 adjustment applied as an approximation penalty.

**Accepted Tier 1 U-Factor sources (council-validated March 2026 — Item 10-A):**

| Source | Treatment | Notes |
|---|---|---|
| NFRC Certified Products Directory (whole-unit) | Score directly — no adjustment | Primary US standard |
| Passive House Institute (PHI) Certified Component | Score directly — no approximation penalty | PHI certification requires independent laboratory testing under ISO 12567. Rigorously audited. No delta-T adjustment penalty when PHI is the sole U-Factor source. |
| PHIUS (Passive House Institute US) certified component | Score directly — no approximation penalty | Same standing as PHI |
| EN 673 laboratory result (EU standard, Notified Body tested) | Apply +0.02 delta-T adjustment default | EN 673 uses 10°C delta-T vs NFRC 22.2°C delta-T. Products tested at lower delta-T typically report slightly better U-Factor. Add 0.02 to the published value before scoring. If manufacturer provides a site-specific delta-T correction, use that value instead. |

**PHI Tier 1 rationale:** PHI certification requires testing by an independent accredited laboratory using validated methodology. PHI-certified products carry real verified data — applying an approximation penalty when PHI data exists would penalize transparency. When both NFRC and PHI values are available, use the NFRC value (US market standard). When PHI is the only source, score from PHI value without penalty.

### 3B. Solar Heat Gain (10% of Performance)

**100% deterministic. Climate-zone adjusted.**

SHGC scoring depends on the climate zone of the intended installation. If evaluating for a general/national audience, score using Northern zone (heating-dominated) as default with Southern zone score noted.

| SHGC | Northern Zone Score (Heating) | Southern Zone Score (Cooling) |
|---|---|---|
| ≤0.20 | 6 (blocks beneficial solar gain) | 10 (excellent heat rejection) |
| 0.21-0.25 | 7 | 9 |
| 0.26-0.30 | 8 | 8 |
| 0.31-0.35 | 9 | 7 |
| 0.36-0.40 | 10 (maximum passive solar benefit) | 6 |
| >0.40 | 9 (diminishing returns, overheating risk) | 5 |

### 3C. Condensation Resistance (15% of Performance)

**100% deterministic.**

| CR Rating (NFRC) | Score |
|---|---|
| ≥70 | 10 |
| 60-69 | 9 |
| 50-59 | 8 |
| 40-49 | 7 |
| 30-39 | 6 |
| 20-29 | 5 |
| <20 | 4 |
| Not published | 5 with "Partial" data completeness flag and Yellow Finding for opacity. Not publishing an optional rating earns midpoint, not credit. |

### 3D. Air Infiltration (25% of Performance)

**100% deterministic. Scoring input determined by disclosure level per Universal Principle 3.**

**Air Infiltration — accepted input sources (council-validated March 2026 — Item 10-B):**

| Source | Treatment | Scoring Tier |
|---|---|---|
| NFRC certified AI value (cfm/ft²) | Score directly from table | Standard |
| EN 12207 Class 4 air permeability test | Convert to equivalent cfm/ft² and score. Class 4 = ≤0.10 m³/(h·m²) at 100 Pa. Area-referenced conversion: ~0.034–0.036 cfm/ft² → score 10. | Tier 2 — Yellow Finding noting non-NFRC source; no score cap |
| EN 12207 Class 3 or lower | Use as certification floor only — score 7 (Class 3 cert floor). Yellow Finding required. | Tier 2 floor |
| Energy Star certified, no specific value | Score from 0.30 certification floor | Standard |
| No certification, no value | Tier 2 — exclude and redistribute | N/A |

**EN 12207 conversion note:** EN 12207 uses area-referenced air permeability in m³/(h·m²) at 100 Pa. Class 4 (the highest EU residential grade) requires ≤0.10 m³/(h·m²). Converting to ASTM E283 cfm/ft² units: 0.10 m³/(h·m²) ÷ 196.85 (unit conversion) × 1.13 (pressure adjustment factor 100 Pa → 75 Pa ASTM) ≈ 0.034–0.036 cfm/ft². This is a score 10 input — EN 12207 Class 4 represents genuine high performance, not a weak certification. The prior briefing document stated 0.10–0.16 cfm/ft² for Class 4; that figure was incorrect (joint-length metric confused with area-referenced metric) and is superseded by this corrected conversion.

**What this means for "Not NFRC certified" products:** The "Not NFRC → score 2 with Red Finding" rule in Thermal Performance (3A) does NOT automatically apply to Air Infiltration for products certified under EN 12207 Class 4. EN 12207 Class 4 is accepted Tier 2 input for AI scoring. Products with no NFRC and no EN 12207 Class 4 still receive Tier 2 (exclude and redistribute) treatment for AI.



| Disclosure Level | Scoring Input | Treatment |
|---|---|---|
| Specific tested value published (e.g., 0.11 cfm/ft²) | The published value | Score directly from table below |
| Bounded threshold published (e.g., "<0.20" or "≤0.20") | The stated boundary value | Score from boundary value in table below |
| Energy Star certified, no specific value published | 0.30 cfm/ft² (Energy Star certification floor) | Score from 0.30 in table below. Not a penalty -- 0.30 is the only verified number available. Manufacturer may rescore at any time by publishing a specific value. |
| No Energy Star certification, no published value | N/A | Tier 2 -- exclude and redistribute weight |

**Step 2: Score from table using the input determined above.**

| Air Infiltration (ASTM E283, cfm/ft²) | Score |
|---|---|
| ≤0.10 | 10 |
| 0.11-0.13 | 9 |
| 0.14-0.16 | 8 |
| 0.17-0.20 | 7 |
| 0.21-0.25 | 6 |
| 0.26-0.30 | 5 |
| >0.30 | 4 |

**What this means in practice:**
- A manufacturer that publishes their specific tested value is scored on their actual performance.
- A manufacturer that publishes a bounded threshold (e.g., "<0.20") is scored from that boundary -- this is honest disclosure and earns no penalty.
- A manufacturer that holds Energy Star certification but publishes no AI value is scored at the certification floor of 0.30 (score: 5). They receive credit for being certified. They lose credit for not disclosing where in the certified range they actually land.
- Publishing a specific value can only help a manufacturer, never hurt them -- if their actual number is worse than 0.30, they should not be Energy Star certified.

**Note on "≤0.3" or "< 0.3" published claims:** A threshold publication that merely restates the Energy Star certification minimum (0.30) is not meaningful disclosure -- it tells the buyer nothing beyond what the certification already implies. Treat these as "no specific value published" and score from the 0.30 certification floor.

**Critical note:** Double-hung windows are inherently less airtight than casements due to physics (more seams, more weatherstrip length, no pull-in compression lock). This is a product-type characteristic, NOT a product defect. All AI scores are compared within configuration type (DH vs DH, casement vs casement). The report should note if casement versions of the same product line achieve significantly better air infiltration. Configuration is tagged on every evaluation file -- never compare across configurations in a score table without a clear notation.

### 3E. Structural Performance (15% of Performance)

**100% deterministic.**

| Performance Grade (AAMA/FGIA PG) | Score |
|---|---|
| PG50+ | 10 |
| PG45 | 9 |
| PG40 | 8 |
| PG35 | 7 |
| PG30 | 6 |
| PG25 | 5 |
| PG20 or below | 4 |
| CE marking + EN 14351-1 Class 5 | 8 with Yellow Finding (not AAMA/FGIA; European Notified Body certified) |
| CE marking + EN 14351-1 Class 4 | 7 with Yellow Finding (not AAMA/FGIA; European Notified Body certified) |
| CE marking + EN 14351-1 Class 3 | 6 with Yellow Finding (not AAMA/FGIA; European Notified Body certified) |
| CE marking only (class not documented) | 5 with Yellow Finding |
| Not AAMA/FGIA certified, no CE marking | 4 with Yellow Finding |

**CE marking rationale (council-validated March 2026 — Item 10-C):** CE marking under EN 14351-1 is mandatory for all windows sold in the EU since 2010 and requires independent Notified Body testing — the European equivalent of an AAMA-accredited laboratory. Scoring CE structural results at 4 (the no-certification floor) was incorrect. The class-based scale above reflects genuine structural performance certification at each tier. A ~1 point premium over equivalent AAMA PG levels reflects EN 14351-1's combined scope (structural load, water penetration, and air permeability in a single certification).

**European delta-T penalty rule (council-validated March 2026 — Item 10-D):**

| U-Factor source | Delta-T penalty |
|---|---|
| PHI or PHIUS certified | No penalty (see 10-A above) |
| CE only (no PHI), EN 673 tested | −0.5 score adjustment after table scoring |
| NFRC certified | No penalty (native protocol) |

The previous −1.0 penalty for CE-only products has been reduced to −0.5. Rationale: the EN 673 vs NFRC protocol difference is a methodological translation gap, not a product deficiency. A −1.0 penalty over-punished a product for not holding a US certification it was not designed to seek. The −0.5 adjustment preserves appropriate weighting for protocol differences without distorting the score beyond what the technical gap warrants.

**Note:** This scale is calibrated for residential applications where PG30-40 is typical. PG50+ exceeds residential requirements and earns full credit. Commercial/high-rise evaluations would use a different scale. Score the STANDARD Performance Grade for the evaluated configuration. If PG upgrades are available, note them in the report but do not score the upgrade unless the evaluation is specifically for the upgraded configuration.

### 3F. Visible Light Transmittance (10% of Performance)

**100% deterministic.**

| VT (NFRC Certified, Total Unit) | Score |
|---|---|
| ≥0.60 | 10 |
| 0.55-0.59 | 9 |
| 0.50-0.54 | 8 |
| 0.45-0.49 | 7 |
| 0.40-0.44 | 6 |
| 0.35-0.39 | 5 |
| <0.35 | 4 |

**Note:** VT is published on every NFRC label. Lower VT means less natural daylight enters the room. High-performance Low-E coatings and HeatLock coatings can reduce VT as a tradeoff for thermal performance. The report should note this tradeoff when VT scores below 7 alongside strong U-factor scores.

---

## MANDATORY PRE-SCORING SEARCH PROTOCOL

Before any metric is flagged as "Unknown/Unverified" or "Not published," the following search tiers must be exhausted in order. An "Undisclosed" flag is only defensible after Tiers 1-3 have been completed and documented.

### Tier 1: Primary Certified Databases (MANDATORY)
- NFRC Certified Products Directory (nfrc.org) for the exact configuration and size
- AAMA/FGIA Certified Products Database for structural performance data
- If data is found here, it is authoritative. Search complete for that metric.

### Tier 2: Manufacturer Technical Documentation (MANDATORY if Tier 1 incomplete)
- Manufacturer's professional/architectural specification guide (NOT the consumer brochure)
- Manufacturer's published NFRC performance tables on their website
- Manufacturer's AAMA test report if publicly accessible
- These are where spacer types, weather stripping details, balance system class, and detailed component specs typically live.

### Tier 3: Direct Manufacturer Inquiry (MANDATORY if Tier 2 incomplete)
- Contact manufacturer's technical support or architectural services department
- One email or phone call asking for the specific missing data point
- Document the inquiry date, contact method, and response (or non-response)
- A manufacturer that does not respond within 10 business days is documented as "Inquiry made [date], no response received"

### Tier 4: Building Science Community Sources (RECOMMENDED if Tiers 1-3 incomplete)
- GreenBuildingAdvisor articles and Q&A (e.g., Dana Dorsett identifying Cardinal LoE-i89)
- Fine Homebuilding technical content
- BuildingScience.com (Joe Lstiburek)
- Independent consultant analysis (Jay Johnson component identification, The Window Dog)
- Professional contractor forums (ContractorTalk, Houzz)

### Tier 1: "True Active Vagueness" -- SCORE FROM CERTIFICATION FLOOR
The company holds a certification that required testing this metric, has the data, and has published either nothing or a threshold that merely restates the certification minimum (e.g., "≤0.3 cfm/ft²" when that is the Energy Star floor). The certification floor is the only verified number available.
**Scoring rule:** Score from the certification floor using the standard deterministic rubric. For AI: Energy Star floor = 0.30 cfm/ft² → score 5. This is not a penalty -- it is the honest score anchored to what was actually verified. The manufacturer can improve their score at any time by publishing a specific tested value.
**Distinction from bounded threshold disclosure:** A manufacturer that publishes "<0.20" or "≤0.20" is making a meaningful claim that narrows the range below the certification minimum. That is honest disclosure -- score from the stated boundary value, not the certification floor. Only treat as Tier 1 when the published threshold offers no information beyond what the certification already implies.

### Tier 1.5: "Certified but Not in ADM" (Data Exists in Databases) -- SCORE FROM DATABASE
The metric does not appear in the manufacturer's printed ADM or spec sheets, but IS found in the NFRC Certified Products Directory, AAMA/FGIA database, or Energy Star certification records with a specific value.
**Scoring rule:** Score from the database value using the standard deterministic rubric. The data is public and verifiable -- it just wasn't in the printed literature. Data completeness grade reflects the extra research required but the score is not penalized.
**Important:** If the database contains a specific tested value (e.g., CR 55 in the NFRC CPD), that value governs. If the database confirms certification but does not contain a specific value for the metric, fall back to Tier 1 certification floor scoring -- never estimate from other subscores. Averaging other subscores to estimate an unknown metric is circular and non-reproducible and is no longer permitted.

### Tier 2: "Genuinely Not Found" (Optional Metric, No Data in Any Public Source) -- EXCLUDE AND REDISTRIBUTE
The metric is optional per NFRC (AL and CR are optional), does not appear in manufacturer documentation, is NOT found in the NFRC CPD, and is not required by the product's certification pathway. This is genuine absence, not strategic omission.
**Scoring rule:** EXCLUDE the metric from the Performance calculation. Redistribute weight proportionally across confirmed metrics. Product is not penalized for following normal industry practice. Data completeness grade reflects the gap. Maximum exclusion: if more than 50% of Performance weight would be excluded, the Performance axis is flagged "Insufficient Data" and excluded from the Overall score.
**Anti-gaming provision:** If the product is Energy Star certified, air leakage CANNOT be Tier 2 (Energy Star requires AL ≤0.3, so data exists). Classify as Tier 1.5 minimum. If more than 50% of the competitive set publishes a given optional metric, any product omitting it upgrades from Tier 2 to Tier 1.5.

### Mandatory NFRC CPD Cross-Check
Before classifying ANY metric as Tier 2, the analyst MUST search the NFRC Certified Products Directory for the manufacturer's product family. NFRC CPD contains certified values that may not appear in printed ADMs. If data is found in CPD, classify as Tier 1.5 and score from database values. This check is non-negotiable and must be documented in the Search Protocol Status table.

### Data Source Hierarchy for Tier Classification
| Priority | Source | Tier Classification |
|---|---|---|
| 1 | Manufacturer's printed ADM / spec sheets with specific value | Score normally from rubric table |
| 2 | NFRC Certified Products Directory (CPD) with specific value | Tier 1.5 -- score from database value |
| 3 | Energy Star / AAMA certification records with specific value | Tier 1.5 -- score from database value |
| 4 | Manufacturer publishes bounded threshold narrower than certification floor (e.g., "<0.20" when floor is 0.30) | Score from stated boundary value -- this is honest disclosure, no penalty |
| 5 | Certification held, no specific value in any public source | Tier 1 -- score from certification floor. Not a penalty, just the only verified number available. |
| 6 | No certification, no data found in any public source, metric is NFRC-optional | Tier 2 -- exclude and redistribute |
Every "Unknown/Unverified" or "Not published" flag must document what was searched:
- "CR rating: Not found in NFRC CPD [searched MM/DD/YYYY]. Not found in Andersen Professional Guide [document version/date]. Inquiry sent to Andersen Architectural Services [MM/DD/YYYY] -- [response status]."

### Maximum Source Age
- NFRC/AAMA certified data: No age limit (certification is current until decertified)
- Manufacturer technical documentation: Maximum 36 months from document date. Documents older than 36 months require verification that the product line has not changed.
- Field intelligence and forum data: Maximum 24 months (per staleness rule)

---

## FIELD INTELLIGENCE (Qualitative Layer -- NOT Scored Numerically)

Field intelligence is presented alongside numeric scores but does NOT affect them. It uses structured categorical tiers with published criteria.

### Tier Definitions

| Tier | Criteria | Minimum Evidence Threshold |
|---|---|---|
| **Excellent** | Professionals consistently praise this product with no meaningful criticism of field performance. | 5+ independent professional sources with positive assessment. Zero professional sources documenting patterns of field failure. |
| **Good** | Professional consensus positive. Minor field issues documented but not patterns. | 3+ independent professional sources positive. Issues documented are isolated, not patterns. |
| **Mixed** | Professional opinions split. Some positive, some negative. OR limited professional data available. | Documented positive AND negative professional assessments. OR fewer than 3 professional sources total. |
| **Concerning** | Multiple professional sources document field performance issues. Pattern of complaints evident. | 3+ independent professional sources documenting the same type of field issue. OR class action / regulatory action documented. |
| **Poor** | Professionals actively warn against this product based on field experience. | 5+ independent professional sources with negative assessment. OR active recall. |

### Field Intelligence Categories (reported separately)
- **Air tightness field experience:** What do installers and occupants report?
- **Seal longevity field experience:** Documented seal failure patterns and timelines?
- **Warranty claims experience:** How does the manufacturer handle claims in practice?
- **Installation sensitivity:** How dependent is performance on installer quality?
- **Parts availability experience:** Can parts actually be obtained when needed?

### Staleness rule
Field intelligence is dated. Maximum validity window is 24 months from the most recent source consulted. Reports older than 24 months carry a staleness flag.

---

## DATA COMPLETENESS GRADING

Every evaluation axis carries a data completeness indicator.

| Grade | Definition |
|---|---|
| **A (Complete)** | All required primary source data obtained and verified from NFRC CPD, AAMA/FGIA database, or manufacturer's AAMA-certified test report. |
| **B (Substantial)** | Most data from primary sources. 1-2 metrics from manufacturer documentation (not independently certified). |
| **C (Partial)** | Mix of primary and secondary sources. Some metrics estimated or approximated. Report notes which specific metrics are estimated. |
| **D (Limited)** | Key metrics unavailable. Multiple metrics scored with data completeness penalties. Report prominently flags limitations. |
| **F (Insufficient)** | Critical metrics missing. Product cannot be meaningfully scored on one or more axes. Axis marked "Not Rated" rather than estimated. |

---

## VALUE INDICATOR (Separate from Scores)

Value is reported separately and never affects the Quality, Durability, or Performance scores.

| Value Tier | Definition |
|---|---|
| **Exceptional Value** | Scores exceed price positioning by 1+ letter grade. Product performs like a B+ but is priced like a C+. |
| **Expected Value** | Scores match price positioning. You get what you pay for. |
| **Below Expected Value** | Scores fall below price positioning by 1+ letter grade. Product performs like a B- but is priced like a B+. |

Value assessment requires pricing data from dealer quotes, published MSRP, or documented market pricing. If pricing is unavailable, Value Indicator is "Not Assessed."

---

## OVERALL SCORE CALCULATION

Overall = (Quality + Durability + Performance) / 3

Each axis is weighted equally. The council recommended user-adjustable weights tied to buyer archetypes as a future enhancement, but v1 uses equal weighting for simplicity and defensibility.

**Future enhancement (planned):** Buyer archetype weighting:
- "Cold Climate Comfort" -- overweights Performance (thermal + air infiltration)
- "Coastal Durability" -- overweights Durability (structural + materials + weather resistance)
- "Budget Conscious" -- overweights Quality (component grade + value indicator)

---

## COMPETITIVE CALIBRATION REQUIREMENT

No product score is published in isolation. Every evaluation includes a minimum of 5 competing products scored with the same rubrics, same data source types, same reference unit dimensions, and same methodology.

**Rigid Reference Unit (by window type):**
- Double-Hung: 36" x 60" (3060), standard glazing package, no grilles
- Casement: 30" x 48" (3048), standard glazing package, no grilles
- Sliding Patio Door: 72" x 80" (6080), standard glazing package

All NFRC/AAMA data pulled for the reference unit size. If a manufacturer does not publish data for the exact reference size, the closest available size is used with a note.

**Glazing Comparability Standard:** For each product in the competitive set, use the manufacturer's standard Energy Star-qualifying glazing package as the comparison configuration. If a manufacturer offers multiple Energy Star packages, use the one most commonly specified in new construction for the relevant climate zone. Document the exact glazing package for each competitor. If standard packages differ significantly across competitors (e.g., one defaults to triple-pane, another to double-pane), score both the standard configuration and note the upgrade path available.

---

## VERSION HISTORY

- **v4 (March 6, 2026):** Four changes from council session and post-session methodology development. (1) Universal Principles reference added -- this rubric now inherits all 12 principles in `residentialist_universal_rubric_principles.md`. Load universal principles before this document in every scoring session. (2) Air Infiltration 3D completely rewritten per Universal Principle 3 (Certification Floor Scoring). Three-tier disclosure system replaces flat vague-reporting penalty: specific value scores from table; bounded threshold narrower than certification floor (e.g., "<0.20") scores from stated boundary; Energy Star certified with no specific value scores from certification floor (0.30 cfm/ft² → score 5). "Average of other subscores" method for unknown AI retired -- non-reproducible and circular. (3) Warranty-Lifespan Alignment Rule threshold tightened from 2.0 to 1.5 points per 2-1 council vote (Consumer Advocate + Technical Purist). (4) Tier 1 Active Vagueness redefined: threshold publications narrower than the certification minimum are honest disclosure, not vagueness. Only publications that restate the certification floor without adding information are Tier 1. Tier 1.5 updated: averaging other subscores to estimate unknown metrics is no longer permitted -- fall back to certification floor if no specific database value exists.
- **v3 (March 5, 2026):** Three-tier data treatment added per council validation. Tier 1 (active vagueness, score 5), Tier 1.5 (certified-but-not-in-ADM, score from database), Tier 2 (genuinely not found, exclude and redistribute with 50% maximum exclusion threshold). Mandatory NFRC CPD cross-check required before any Tier 2 classification. Anti-gaming provisions: Energy Star products cannot classify AL as Tier 2; metrics published by 50%+ of competitive set cannot be Tier 2. Data source hierarchy published. Warranty-Lifespan Alignment Rule added to Durability 2A at 2.0-point threshold.
- **v2 (March 5, 2026):** Council review fixes. (1) Unknown/unverified defaults dropped from 6-7 to 5 across all components. (2) Spacer double-count eliminated. (3) Air infiltration tiers recalibrated. (4) CR "not published" dropped from 6 to 5. (5) Structural PG recalibrated for residential. (6) VT added as new Performance subscore at 10% weight. (7) Mandatory pre-scoring search protocol added. (8) Glazing comparability standard defined.
- **v1 (March 5, 2026):** Initial rubric build. Council returned 7.1/10 average with specific implementation gaps identified.
