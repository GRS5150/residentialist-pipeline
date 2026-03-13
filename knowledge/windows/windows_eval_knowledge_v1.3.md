# Windows Eval Knowledge File

**Category:** Windows and Doors — Windows
**Version:** v1.3 — March 13, 2026
**Status:** Production-ready. v1.3: Added international standards recognition, specialty forum classification (GBA, r/PassiveHouse, r/buildingscience), and price-bias sentiment filter for field sources.

Give this file to Bot 1 (source hierarchy section only) and Bot 2 (full file).

---

## Source Authority Hierarchy

*Updated March 13, 2026 — Four-category taxonomy with field source integration. Preserves all council-validated rules (Items 11-A through 11-D).*

The source hierarchy uses four functional categories rather than a simple credibility ladder. Each category contributes differently to scoring, and their weight varies by axis.

---

### CATEGORY 1: Certification Bodies — Hard Constraints on Performance

NFRC (thermal ratings), AAMA/FGIA (structural, air infiltration), Energy Star (efficiency thresholds), PHI/PHIUS (passive house certification), ift Rosenheim (European testing authority), Greenguard (emissions), IGMA (IGU longevity data).

**Role:** These are verified test data, not opinions. They feed directly into the Performance axis and Material Safety dimension as deterministic inputs.

**Scoring rule:** Certification data is not weighted against expert opinions — it is a different kind of input. A product that meets Passive House standards should score near the top of the Performance axis. If it doesn't, the rubric is miscalibrated on that axis. Certification data also sets scale boundaries for calibration.

---

### CATEGORY 2: Expert Authorities — Governing Sources for Quality & Durability

| Source | Authority | Independence Basis |
|---|---|---|
| Jay Johnson / WindowPurchase.com | PRIMARY — component taxonomy, spacer hierarchy, hardware quality, comparative product evaluation, P1 Chamber testing | Direct sales model — paid by buyers, not manufacturers. No dealer referral revenue. No brand partnership income. Publicly documented. |
| Green Building Advisor (GBA) editorial experts | Expert authority — independent building science professionals | Expert contributors are credentialed building scientists operating without manufacturer sponsorship in editorial contexts |
| Building Science Corporation / BSC (Lstiburek) | Expert authority — technical publications | Academic and research funding basis; no product endorsement revenue |

**Scoring rule:** 2+ Expert Authority sources in agreement = consensus established. 1 Expert Authority source = strong evidence, not full consensus. Expert Authority governs over all other categories when in direct conflict.

---

### CATEGORY 3: Trade Publications — Calibration Cross-Check (moderate weight)

| Source | Authority | Limitation |
|---|---|---|
| Fine Homebuilding | Contractor and architect field experience | Advertiser relationships with window manufacturers; editorial content credible but commercially adjacent |
| The Window Dog | Product research and comparison content | Dealer referral model (commercial adjacency to brands reviewed); useful for product identification, not independent verdicts |
| Consumer Reports | Independent consumer testing | Methodology disputed in building science community for windows specifically; useful as corroborating source |
| IBHS (Insurance Institute for Business and Home Safety) | Structural and weather resistance testing | Specialized scope; high credibility within that scope |
| Jeff Ludy / Houston Window Experts | **Installation methodology, flashing practices, warranty mechanics, consumer education ONLY** | Authorized Marvin Infinity dealer with commercial referral relationships (jeffslist.com). NOT brand evaluation authority under any circumstances. |

**Scoring rule:** Publications provide analytical rigor and broader market perspective. Use as calibration cross-check. If pipeline output disagrees with both the field professionals and the publications, the pipeline is almost certainly wrong. If it agrees with field professionals but disagrees with a publication, the pipeline is probably right and the publication may have advertiser bias.

---

### CATEGORY 4: Qualified Field Sources — Ground Truth for Quality & Durability

**What this is:** Trade professionals (installers, glaziers, carpenters, repair technicians) who share product opinions in online forums, primarily Reddit. These are the people who see what happens to products after the spec sheet ends. They know which frames crack at year seven, which hardware seizes up, which products are nightmares to flash. Their knowledge is experiential and long-duration.

**Why this matters:** When an installer with hundreds of installations tells you a product is garbage, that opinion was formed over years of callbacks and warranty work. This is the most reliable signal for Quality and Durability scoring. The limitation is that tradespeople generally don't think in terms of thermal performance data — they think in "this one holds up" and "this one doesn't." So their input is strongest on Quality and Durability, weaker on Performance.

**Pre-qualified sources:** See `verified_field_sources.json` in the knowledge base. Bot 1 should check this cache first, then discover new qualified sources dynamically during research.

**Dynamic qualification criteria (for new sources found during research):**
- 5,000+ total karma (shows sustained engagement, not a throwaway)
- Active in relevant subreddits: r/HomeImprovement, r/Homebuilding, r/Construction, r/Carpentry, r/BuildingScience, r/PassiveHouse, r/replacementwindows, r/homeowners
- Account age 12+ months
- Has posted about 3+ different brands/products (not a single-brand advocate)
- Uses technical vocabulary consistent with trade experience (references installation practices, specific components, failure modes)
- **Exception:** Users below karma threshold qualify if they explicitly self-identify as 30+ year trade professionals with detailed technical contributions. Weight at 50% until karma threshold met.

**Disqualifiers:**
- Post history shows commercial affiliation (manufacturer, dealer, distributor employee)
- Primarily posts referral links or affiliate content
- Only posts in one brand's subreddit
- Signs of astroturfing (sudden burst of brand-positive posts)

**Sample-size-dependent scoring ceilings for Professional Consensus:**

| Qualified Sources Found | Professional Consensus Ceiling | Confidence Label |
|---|---|---|
| 1-2 qualified field sources | Max 6.5 | Low — directional only |
| 3-5 qualified field sources | Max 7.5 | Moderate — contributing evidence |
| 6-9 qualified field sources | Max 8.5 | High — field consensus |
| 10+ qualified field sources | Max 10 (no cap) | Strong — full professional consensus |

**Smoothing method:** Trimmed mean — drop the highest and lowest scores from the qualified source pool, average the rest. Minimum 4 sources required for trimming; below 4, use simple mean.

**Calibration use:** Aggregate field source sentiment (brand rankings from verified_field_sources.json) serves as a directional benchmark. Pipeline scores should be roughly aligned with field consensus patterns — not matching exact numbers, but directionally correct. If field sources consistently rank a product as top-tier and the pipeline scores it mid-range, investigate why.

---

### CATEGORY 5: Influencers & Educators — Sentiment Indicator (lowest weight)

YouTube reviewers, building science educators, continuing education instructors (e.g., Matt Risinger).

**Scoring rule:** Some are genuinely knowledgeable; others repeat manufacturer talking points or optimize for engagement. Use as directional gut check only. If field sources, publications, AND educators all agree a product is top-tier, confidence is very high. If only influencers love a product and field sources are lukewarm, that's a marketing story, not a quality signal. Influencer-only evidence cannot establish any scored verdict.

---

### Per-Axis Calibration Weights

When checking whether pipeline output is directionally correct, weight source categories by axis:

| Axis | Certification Bodies | Expert Authorities | Trade Publications | Qualified Field Sources | Influencers |
|---|---|---|---|---|---|
| Quality | — | 30% | 20% | 40% | 10% |
| Durability | — | 25% | 15% | 50% | 10% |
| Performance | Hard constraint (governs) | 25% | 30% | 25% | 20% |

---

### Divergence Flagging Rule

When the field source consensus (Category 4) and the certification/publication consensus (Categories 1-3) disagree by more than 2 points on any axis, Bot 2 must generate a Yellow Finding:

*"Field professionals rate this product significantly [lower/higher] than its [certification data / publication reviews] would suggest on the [Quality/Durability/Performance] axis. Investigate whether [lab testing diverges from field conditions / marketing narrative diverges from installation reality / publication bias is present]."*

These divergences are high-value intelligence — they surface tensions that no single source would reveal on its own.

---

### Tier Governance (preserved)

Expert Authorities (Category 2) govern over all other categories. When an Expert Authority source directly contradicts a Trade Publication, Field Source, or Influencer source, document the conflict and score from the Expert Authority assessment with the contradiction noted.

Do NOT use: manufacturer marketing materials, Amazon/retailer reviews, HomeAdvisor/Angi for brand evaluation.

---


### Jay Johnson Special Access Rule (Item 11-B)

Jay Johnson is a **transcript-only source.** He does not maintain a publicly searchable article archive in the conventional sense. His assessments are captured in transcripts, interview recordings, and documented conversations.

- A 404 error, broken link, or absence from a web search result is NOT a data gap for Jay Johnson.
- If Jay Johnson has evaluated the specific product line and configuration, that transcript is authoritative Tier 1 evidence regardless of whether it is currently findable via web search.
- **Absence is a Yellow Finding ONLY for:** US-manufactured products in active production that are "actively distributed in the US" (meaning: available for purchase through at least one national or multi-regional dealer network, not a regional specialty import).
- **Absence is NOT a Yellow Finding for:** European import products (e.g., Internorm, Zola, Loewen) or products distributed through a single-region or specialty channel. Jay Johnson's absence from the European import product record is expected, not a data gap.

---

### Specialty Forum Source Classification

**GreenBuildingAdvisor (GBA) Forum Contributors:**
GBA contributors who post substantive window evaluations in the forums are classified between Category 2 (Expert Authorities) and Category 3 (Trade Publications). Most GBA forum participants are credentialed building professionals — architects, energy consultants, PHIUS-certified professionals, and experienced builders who self-select into a paywall community focused on building science. Their window opinions carry more weight than general Reddit field sources.

**Scoring rule:** GBA forum consensus on a product should be weighted at 75% of Expert Authority weight (i.e., between Category 2 and Category 3). If 3+ GBA contributors agree on a product assessment, treat it as moderate expert consensus.

**r/PassiveHouse and r/buildingscience:**
These subreddits attract energy nerds, envelope consultants, and high-performance builders. The population is closer to GBA than to r/HomeImprovement. Opinions here should be weighted at 60% of Expert Authority weight — above general Reddit field sources but below GBA.

**Price-bias risk:** Minimal in all three of these communities. Users in GBA, r/PassiveHouse, and r/buildingscience already accept that high-performance windows cost more. Price-biased negativity is rare. Do NOT apply the price-bias filter to these sources unless explicit price language is present.

**General Reddit (r/HomeImprovement, r/Construction, r/Carpentry, etc.):**
Standard field source weighting per Category 4 rules. Price-bias filter applies.

---

### Houston Window Experts Enforcement Rule (Item 11-C)

Any use of Jeff Ludy / Houston Window Experts content for brand evaluation, product quality judgment, or comparative product recommendation triggers an **automatic Yellow Finding** in the evaluation file.

Yellow Finding text: *"Houston Window Experts content used for brand evaluation. Jeff Ludy is an authorized Marvin Infinity dealer with commercial referral relationships. This source is approved for installation methodology only. Brand evaluation content from this source is not accepted."*

This rule applies regardless of whether the HWE assessment is positive or negative.

---

### Four-Criterion Standard for Future Source Tier Assignment (Item 11-D)

When a source not on the Tier 1/2/3 lists above is encountered and must be assigned, use these four criteria:

1. **Revenue model:** Does this source earn money from product sales, dealer referrals, manufacturer sponsorships, or affiliated commissions? Yes = cannot be Tier 1. No = eligible for Tier 1 review.
2. **Methodology transparency:** Does the source document how they evaluated the product (testing methods, inspection approach, data sources)? Yes = Tier 1/2 eligible. No = Tier 3.
3. **Credential verification:** Can the source's professional credentials (contractor license, engineering degree, building science certification) be independently verified? Yes = Tier 1/2 eligible. No = Tier 2/3.
4. **Peer standing:** Is the source cited by or respected within the building science community (GBA contributors, Lstiburek citations, PHI network)? Yes = Tier 1 eligible. Unknown = Tier 2.

**Assignment rules:**
- All four criteria pass = Tier 1 eligible. Document and note in evaluation.
- Criteria 1 fails (commercial interest) but 2-4 pass = Tier 2 maximum.
- Criteria 2 fails (no methodology) = Tier 3 regardless of others.
- Any new Tier 1 assignment must be noted in the evaluation file as "Provisional Tier 1 pending council validation."



---

## Frame Material Hierarchy

| Frame Type | Quality Range | Durability Range | Key Notes |
|---|---|---|---|
| Pultruded fiberglass | 8.5–9.5 | 9.0–10 | Expands/contracts same rate as glass; highest seal integrity; paintable; 50+ yr lifespan |
| Fiberglass composite | 8.0–9.0 | 8.5–9.5 | Similar to pultruded with minor manufacturing variation |
| Aluminum-clad wood (premium) | 7.5–9.0 | 7.5–9.0 | Best interior aesthetics; aluminum protects exterior; wood interior requires climate control |
| Aluminum-clad wood (standard) | 6.5–8.0 | 7.0–8.5 | Standard execution of the clad-wood approach |
| Premium vinyl (foam-filled, heavy-wall, multi-chamber) | 6.0–7.5 | 6.5–8.0 | Significant quality range within vinyl; foam fill + multi-chamber + heavy wall = real performance difference from builder-grade |
| Aluminum (thermal break) | 5.5–7.5 | 7.0–8.5 | Strong, durable; thermal performance limited by aluminum conductivity |
| Standard vinyl (mid-grade) | 4.5–6.0 | 5.5–7.0 | Most common residential replacement window |
| Builder-grade vinyl | 2.0–4.5 | 3.0–5.5 | Thin wall, single/double chamber, no reinforcement; minimum spec |
| Aluminum (no thermal break) | 2.0–4.0 | 6.0–8.0 | High durability but poor thermal performance; appropriate for commercial, not residential |

---

## Spacer System Hierarchy
*Source: Jay Johnson / WindowPurchase.com — established from P1 Chamber testing*

| Spacer Type | Quality Score | Notes |
|---|---|---|
| Super Spacer (foam) | 9–10 | Warm-edge; flexible; best seal longevity |
| TGI / Swiggle (foam-based) | 8–9 | Warm-edge; strong performance |
| Duralite / comparable foam-based | 8–9 | Warm-edge |
| Thermix / stainless steel warm-edge | 7–8 | Warm-edge; stiffer than foam but better than aluminum |
| Aluminum spacer | 4–5 | Thermal bridge; highest condensation risk; fastest seal degradation |

**Key principle from Jay Johnson:** Aluminum spacers are a significant quality downgrade. Any manufacturer using aluminum spacers in a product positioned as premium is cost-optimizing at the expense of long-term seal performance.

---

## IGU Longevity Research — Field Data

Two authoritative studies establish the deterministic basis for IGU seal scoring. Use these data points when scoring the Durability axis, specifically seal longevity and IGU certification subscores.

### IGMA / Lingnell 25-Year Field Study (1980–2005)
*Source: Insulating Glass Manufacturers Alliance (IGMA) with HUD. Published through Oak Ridge National Laboratory. Tier 1.*

~2,400 IGUs across 140+ buildings in 14 U.S. cities. Inspected at 10, 15, and 25 years.

**Failure rates by certification class at 25 years:**
| Certification Class | Failure Rate at 25 Years |
|---|---|
| CBA (highest) | 3.6% |
| C / CB (lower) | 14%+ (estimated 20%+ accounting for units already re-glazed before final inspection) |

A second phase (1990) tracked 10,944 CBA-certified units across 102 buildings: 1% failure rate at 15 years.

**Key findings:**
- 60% of all failures were caused by glazing systems that trapped water near the edge seal — meaning installation and drainage design, not the IGU itself, was the primary longevity killer
- Climate had almost no effect on failure rate — results were consistent across hot, cold, wet, dry, sea-level, and mountain locations
- CBA certification (now ASTM E2190) is the most predictive single indicator of IGU longevity

**Scoring implication:** ASTM E2190 (formerly CBA) certification is not a checkbox — it carries a documented 4x failure rate reduction over 25 years vs. uncertified or lower-certified units. Score it accordingly on the Durability axis. Products that do not publish IGU certification tier should be scored at midpoint on this subscore.

### NREL / University of Colorado IGU Degradation Review (2023)
*Source: National Renewable Energy Laboratory. Most current academic synthesis of IGU durability literature. Tier 1.*

**Key findings:**
- Commercial windows have a documented lifespan of 20–30 years vs. 50–60 year building life — windows are typically the first major envelope component to fail
- **Argon gas loss:** Ongoing from day one. A 32% increase in U-factor is possible from argon gas loss alone over the product's life. Aluminum spacers leak more than warm-edge (foam) spacers. Heat accelerates loss.
- **Sealant chemistry:** Silicone secondary sealants consistently outlast polysulphide sealants — better UV resistance, better elastic recovery, less temperature-dependent gas permeability
- No current accelerated test reliably predicts actual field lifespan — lab certification is necessary but not sufficient

**Scoring implication:** Silicone vs. polysulphide secondary sealant is a documented durability differentiator. When manufacturers disclose sealant chemistry, score silicone higher. When undisclosed, use midpoint — do not assume silicone. The 32% U-factor degradation from argon loss reinforces the warm-edge spacer scoring premium already in the Spacer System Hierarchy above.

### The Five Longevity Factors (Synthesis)
The combined field and laboratory data resolves to five factors that predict IGU longevity. A window with all five has documented near-zero failure risk at 25 years:

1. ASTM E2190 (CBA-class) certified insulating glass
2. Silicone secondary sealant (not polysulphide)
3. Warm-edge spacer (foam-based — Super Spacer, TGI, Duralite or equivalent)
4. Glazing system that drains water away from the edge seal (drainage design, not product spec — note as installation dependency)
5. Competent installer (plumb, level, properly flashed)

Factors 1–3 are product-scorable. Factor 4 is partially product-scorable (frame drainage design) and partially installation-dependent. Factor 5 is outside product scope — note as installation dependency in DATA CONFIDENCE section.

---

## Glass System Hierarchy

| Glass Configuration | Quality Score | Notes |
|---|---|---|
| Triple-pane + krypton + premium Low-E + warm-edge spacer | 9–10 | Passive house and extreme-climate spec |
| Double-pane + argon + Cardinal 366 + warm-edge spacer | 7.5–9 | Calibration benchmark tier (Marvin Elevate, Andersen 400 select configs) |
| Double-pane + argon + Cardinal 180/270 + warm-edge spacer | 6.5–7.5 | Standard quality residential |
| Double-pane + argon + Low-E + aluminum spacer | 5.5–6.5 | Adequate performance; seal longevity concern |
| Double-pane + no gas fill + Low-E | 4.5–5.5 | Below standard |
| Double-pane + no Low-E | 3.0–4.5 | Builder-grade |
| Single pane | 1.0–2.0 | Replacement target |

**Cardinal Glass note:** Dominant independent glass supplier for premium residential windows. Used by Marvin, Andersen, Pella. Cardinal Low-E line: 180 (one coat, highest VT), 270 (one coat, balanced), 366 (three coats, best solar control, standard in Northern/mixed climates). Evaluate proprietary Low-E products against Cardinal equivalents where data permits.

---

## Business Model Classification

| Type | Characteristics | Score Implication |
|---|---|---|
| True Manufacturer (integrated) | Designs and manufactures in own facilities. Controls frame extrusion, glass, hardware, assembly. | Highest confidence in component selection and QC |
| True Manufacturer (wholesale-to-dealer) | Manufactures product but requires authorized dealer for purchase and service. | Well-made products; service experience depends on dealer quality |
| Branded Assembler | Assembles from third-party components under own brand. | Component selection is the key evaluation point |
| Builder-Grade OEM | Manufactures for production builder spec. Optimized for cost-per-unit, not longevity. Often private-labeled. | Expect low Quality and Durability scores |
| Import Assembler | Sources components offshore, assembles and brands. | Evaluate parts availability carefully |

---

## Performance Tier Classification

| Tier | Description | Typical Overall Score |
|---|---|---|
| Tier 1 — Traditional Luxury | Marvin Ultimate, Sierra Pacific, Zola Thermo Clad, Alpen. Premium composite or all-wood. Full service ecosystem. | A- to A+ (8.5–10) |
| Tier 2 — Premium Production | Marvin Elevate, Pella Lifestyle Series, Andersen A-Series. Wood-clad or high-end composite. Wide dealer network. | B+ to A- (8.0–8.9) |
| Tier 3 — Quality Production | Andersen 400 Series, Pella 350 Series, JW Siteline. Mid-range wood-clad or premium vinyl. | B- to B+ (7.0–8.4) |
| Tier 4 — Builder-Grade | JW V-2500, stock vinyl, big-box replacement windows. Minimum spec. | C to B- (5.0–7.4) |

---

## Known Failure Patterns by Material Type

**Vinyl frames:**
- Yellowing and UV degradation: documented in older/cheaper vinyl; titanium dioxide content in premium vinyl significantly reduces this
- Warping under high heat: documented in thin-wall builder-grade near dark cladding or direct south/west exposure
- Hardware pull-out: documented in thin-wall vinyl where hardware anchors into soft material

**Aluminum-clad wood:**
- Wood rot at moisture entry points: primary failure mode when cladding seal fails at corners or exposed end grain
- Cladding joint failure: seal at aluminum-to-aluminum joints can fail over time

**All double-pane windows:**
- IGU seal failure (fogging): category-universal failure mode. IGMA 25-year field data shows 3.6% failure rate for ASTM E2190-certified units vs. 14–20%+ for lower-certified units. Warm-edge spacers, silicone sealant, and proper drainage design are the primary mitigating factors. Only score as product-specific concern if rate is elevated above category norm.
- Argon gas loss: ongoing from day one per NREL 2023 review. Aluminum spacers leak faster than warm-edge spacers. A 32% increase in U-factor is possible over product life from gas loss alone. This is a Performance axis degradation concern, not a Quality defect — note in DATA CONFIDENCE when spacer type is aluminum.

**Hardware:**
- DH balance failure: documented in budget DH windows; typically at 10-15 years
- Casement operator failure (gear wear): documented in high-cycle applications; premium multi-point operators more durable

---

## Calibration Benchmarks — Six Products

| Product | Config | Quality | Durability | Performance | Overall | Grade |
|---|---|---|---|---|---|---|
| Alpen Zenith ZR-7 | CSM | 9.1 | 9.1 | 8.0 | 8.7 | A- |
| Marvin Elevate | DH | 8.7 | 8.6 | 7.3 | 8.2 | B+ |
| Pella Lifestyle Series | CSM | 7.0 | 8.2 | 8.3 | 7.8 | B |
| Andersen 400 Series | DH | 7.3 | 7.9 | 7.2 | 7.47 | B- |
| JW Siteline | DH | 6.3 | 7.9 | 6.7 | 7.0 | B- |
| JW V-2500 | DH | 4.6 | 5.6 | 6.8 | 5.7 | C |

**Calibration notes:**

**Alpen Zenith ZR-7 (A-):** Pultruded fiberglass triple-pane benchmark. Sets the ceiling. Only products with premium frame material + triple-pane + exceptional specs reach A-range.

**Marvin Elevate (B+):** Performance 7.3 reflects Air Infiltration reclassification to Energy Star certification floor (0.30 → score 5) under Principle 3. Marvin does not publish DH AI data — strategic non-disclosure. Quality 8.7 and Durability 8.6 are the genuine strengths. The split profile is accurate.

**Pella Lifestyle (B):** Legitimate split profile — Quality 7.0, Performance 8.3. Strong published NFRC data with moderate construction quality. The split is the story.

**Andersen 400 (B-):** Air Infiltration scored 7 from "<0.20" bounded threshold. This is meaningful data — not Active Vagueness. Different from Marvin's complete non-publication.

**JW Siteline (B-):** Middle tier. Durability 7.9 reflects serviceable JW dealer network. Quality 6.3 reflects execution limitations.

**JW V-2500 (C):** Builder-grade floor. Quality 4.6 from thin-wall vinyl. Performance 6.8 relatively stronger — even builder-grade windows carry Energy Star ratings.

---

## Scoring Anchors

- **A-range (8.5+):** Premium product with no meaningful compromises. Appropriate in $1M+ custom build without apology.
- **B+ (8.0–8.4):** Strong premium product with one or two specific limitations.
- **B (7.5–7.9):** Solid quality production product.
- **B- (7.0–7.4):** Competent quality production product. Serviceable for most homeowners.
- **C-range (5.5–6.9):** Builder-grade to low-end production. Not what a quality-conscious buyer should accept in a custom build.
- **D-range and below:** Bottom of market or products with documented failures.
