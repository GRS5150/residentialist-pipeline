# Hardwood Flooring — Per-Product Deep Dive Prompt (prompt_b)

**Scope:** Factory-finished solid and engineered hardwood flooring. White Oak normalized across all products.
**Pool S:** VACANT — no quantified comparative testing database exists for hardwood flooring.
**Pass 2 Intelligence Applied:** This prompt uses specific veneer thicknesses, core materials, finish technologies, and failure modes from Pass 2 component analysis to force deep-dive sources to produce actionable data.

---

# Master Query

```
I'm building an independent product intelligence platform that scores residential hardwood flooring on Quality, Performance, Durability, and Material Safety. I need a comprehensive component-level analysis of [PRODUCT NAME].

CRITICAL: DETERMINE SUB-TYPE FIRST
- Is this a solid hardwood or engineered hardwood product?
- Answer ALL applicable sections below. Skip sections marked [ENGINEERED ONLY] or [SOLID ONLY] if not applicable.

=== VENEER / FACE LAYER ANALYSIS [ENGINEERED ONLY — THE CRITICAL SPEC] ===

VENEER THICKNESS:
- What is the exact veneer (wear layer) thickness in mm? Confirm from manufacturer technical data sheet, NOT marketing copy.
- Is the stated thickness accurate? Any third-party measurements or installer reports of thinner-than-stated veneers?
- How many sandings/refinishing cycles does this thickness support? (≥4mm = 3+, 3mm = 1-2, 2mm = screen/recoat only, <2mm = none)

VENEER CUT METHOD:
- Sawn, sliced, or rotary-peeled? Sawn = authentic grain, strongest structure. Rotary = repetitive grain, thinner, budget.
- What sawn thickness does this brand use? (sawn typically 2mm+, rotary typically <2mm)

VENEER SOURCING:
- Where does the face veneer wood come from? Domestic (US/Canadian) hardwood, or imported?
- Species: White Oak — what specific White Oak source/grade? Appalachian, Midwestern, Canadian, European?
- Is the veneer sourced and manufactured in-house, or purchased from a veneer mill?

=== SOLID HARDWOOD ANALYSIS [SOLID ONLY] ===

SPECIES & GRADE:
- What NWFA/NOFMA grade is this product? (Clear, Select, Select & Better, #1 Common/Character, #2 Common/Rustic)
- Are grades manufacturer-proprietary or NWFA standard? If proprietary, how do they map to NWFA equivalents?
- What Janka hardness for the specific species used?

BOARD DIMENSIONS:
- Thickness: 3/4" (standard) or other?
- Width: strip (2-1/4"), plank (3-1/4" to 5"), wide plank (5"+)?
- Random lengths: what's the average board length? Minimum? Maximum?
- Wide plank solid (5"+): does the manufacturer address dimensional movement risk?

KILN DRYING:
- Documented kiln schedule or moisture content target?
- Moisture content at shipping (% MC)? Industry standard is 6-9% for residential.
- Acclimation requirements specified by manufacturer?

=== CORE CONSTRUCTION [ENGINEERED ONLY] ===

CORE MATERIAL:
- What is the core/substrate material? Baltic birch plywood, domestic hardwood plywood (poplar, eucalyptus), HDF, softwood, finger-core, or other?
- Number of plies (including veneer face)?
- Cross-grain orientation confirmed? (perpendicular grain layers = standard for quality)
- Total board thickness including veneer?

ADHESIVE SYSTEM:
- What adhesive bonds the veneer to the core? Phenol-formaldehyde (waterproof), PVA (standard), melamine-urea-formaldehyde, or other?
- What adhesive bonds the core plies? Same or different?
- Adhesive ANSI/HPVA bond test results if available?
- Thermal cycling performance: is this product certified for radiant heat? What testing?

=== SHARED ANALYSIS (ALL PRODUCTS) ===

FINISH SYSTEM:
- Factory finish type: UV-cured aluminum oxide (how many coats?), UV-cured polyurethane, oil-based (Rubio Monocoat, Bona, Osmo), basic polyurethane?
- Aluminum oxide density/concentration if applicable?
- Brand-specific finish technology name (Mirage NanoLinx, Lauzon Titanium, Somerset AlumaPLUS, Shaw ScufResist Platinum, etc.)
- Scratch resistance: ASTM D1044 Taber abrasion data? Manufacturer scratch resistance claims with evidence?
- Finish adhesion: ASTM D3359 cross-hatch test data?
- UV protection: does the finish include UV absorbers to reduce wood color change/ambering?
- Number of factory finish coats (primer + topcoats)?

MILLING PRECISION:
- Tongue-and-groove milling tolerance: tight fit or loose? Installer consensus on board-to-board fit.
- Edge profile: micro-bevel (eased edge), square edge, or beveled? How deep is the micro-bevel?
- End-joint precision: do end joints mate tightly or require filler?
- Board straightness: documented warp, bow, or twist rates?
- Installer complaint patterns about milling quality?

DIMENSIONAL STABILITY:
- Manufacturer's specified RH operating range (typically 30-55% for solid, wider for engineered)?
- Documented cupping, crowning, or gapping issues? Environmental vs manufacturing cause?
- Wide plank specific: is this product stable at 5"+ width? Owner/installer reports?
- Radiant heat compatibility: manufacturer certification? Testing standard?

RELIABILITY & DURABILITY DATA:
- Finish warranty: duration, what's covered (wear-through only or damage too)?
- Structural warranty: duration, what's covered?
- Residential vs commercial warranty terms?
- Known failure patterns from installer forums: delamination, finish peeling, cupping, gapping, edge chipping?
- Warranty claim process: dealer-supported, manufacturer-direct, adversarial?

MANUFACTURING & BUSINESS MODEL:
- Where is this product manufactured? (specific factory city/state/country)
- Year manufacturing began at this location?
- Corporate parent and ownership structure?
- NWFA/NOFMA certification status?
- FSC/PEFC chain-of-custody certification?
- Lacey Act compliance documented?

FORMALDEHYDE & MATERIAL SAFETY:
- CARB Phase 2 / EPA TSCA Title VI compliance status? Certifier name?
- Greenguard Gold or FloorScore certification?
- Adhesive formaldehyde content: NAUF (no added urea-formaldehyde), ULEF (ultra-low emitting formaldehyde), or standard?
- Any documented formaldehyde compliance issues or testing failures?
- VOC emissions post-installation timeline?

PROFESSIONAL OPINION:
- Installer assessment of product quality vs price positioning
- Milling/fit/finish compared to competitors in the same tier
- Long-term performance at 5/10/15+ years in the field
- Would they install this in their own home?

Prioritize sources from: NWFA, Hardwood Floors Magazine, WoodFloorBusiness.com, manufacturer technical data sheets, r/HardwoodFloors, r/Flooring, professional installer YouTube, CARB/EPA compliance databases, Consumer Reports. Cite all sources.
```

---

## PRODUCT: Carlisle Wide Plank White Oak (Solid, 3/4")
slug: carlisle_solid_white_oak
sub_type: solid
Tier 1 anchor (solid). Custom wide plank heritage manufacturer since 1966, Stoddard, NH. Hand-selected, precision kiln-dried 3/4" solid white oak in wide plank widths (5" to 10"+). Confirm manufacturing is still Stoddard, NH single-source. What NWFA/NOFMA grade equivalent does Carlisle use? (they likely have proprietary grading — map to standard). What finish system? Likely site-finish or minimal factory finish — confirm. If primarily site-finished, how does that affect our factory-finished-only scoring scope? Kiln drying protocol: what MC target? Is Carlisle actually factory-finished, or is it sold unfinished for site finishing? Pricing: Carlisle is $10-25+/sqft — confirm current range. Wide plank stability: at 7-10" width, how does Carlisle address dimensional movement? Tongue-and-groove or ship-lap? Is Carlisle NWFA/NOFMA certified? Long lead times for custom orders — typical wait? What Appalachian white oak sources? Installer consensus: is Carlisle genuinely best-in-class for solid, or is it a premium brand with artisanal marketing on standard-quality lumber?

## PRODUCT: Mirage Sweet Memories White Oak (Engineered, 5/8")
slug: mirage_sweet_memories
sub_type: engineered
Tier 1 anchor (engineered). Québec-based, St-Georges manufacturing. Confirm exact veneer thickness — stated as 3.5mm sawn. NanoLinx finish technology — what is it specifically? (nano-particle aluminum oxide? UV-cured layers?) How many coats of factory finish total? Finish warranty: 35 years — what does it actually cover? Structural warranty: lifetime — terms? Core: confirm Baltic birch plywood or other. Number of plies. Adhesive system. Cross-grain construction confirmed? Milling precision: installer consensus ranks Mirage as the gold standard for tongue-and-groove fit — why? What specific tolerance do they achieve? Sweet Memories is wire-brushed texture — does texturing affect veneer effective thickness? Radiant heat certified? Greenguard Gold? CARB Phase 2 certified by which lab? Domestic Appalachian white oak veneer or sourced elsewhere? How does Mirage compare on price to Somerset, Shaw, Bruce? ($8-14/sqft range). Deep dive into NanoLinx vs Lauzon Titanium vs Mercier Generations finishes — which performs better in real-world scratch resistance? r/HardwoodFloors installer consensus on Mirage.

## PRODUCT: Mercier Design+ White Oak (Engineered, 5/8")
slug: mercier_design_plus
sub_type: engineered
Tier 2 upper anchor (engineered). Québec manufacturer, 70+ years. Direct Mirage competitor. Confirm exact veneer thickness — likely 3mm sawn. Generations finish with Greenguard Gold. Core structure: multi-ply — confirm species and ply count. How does Mercier's milling precision compare to Mirage? Installer reports of board fit quality? Design+ is Mercier's premium line — what differentiates it from their standard line? Warranty: finish and structural terms. Manufacturing location for Design+ specifically — all Québec? Pricing relative to Mirage. Formaldehyde compliance: CARB Phase 2 certifier? Lacey Act compliance? FSC certification? Radiant heat compatibility? Deep dive: is there a measurable performance gap between Mercier and Mirage, or is it primarily a branding/distribution difference? What would make Mercier Tier 1 instead of Tier 2?

## PRODUCT: Lauzon Designer White Oak (Engineered, 5/8")
slug: lauzon_designer
sub_type: engineered
Tier 2 lower anchor (engineered). Québec manufacturer. Pure Genius air-purifying technology — what is it? (Titanium dioxide photocatalytic reaction breaking down formaldehyde and other VOCs in ambient air). Does Pure Genius actually work? Independent testing? How long does the air-purifying effect last? Titanium finish technology — is this the same as or different from Pure Genius? Veneer thickness: confirm — likely 3mm sawn. Core construction details. Milling precision relative to Mirage and Mercier. Designer is Lauzon's mid-premium line — what differentiates Designer from Essential vs Expert? Warranty terms. Manufacturing location. Pricing. Is Lauzon the weakest of the three Québec manufacturers (Mirage > Mercier > Lauzon)? If so, what's the gap? r/HardwoodFloors installer ranking of the three Canadian brands.

## PRODUCT: Somerset Character White Oak (Solid, 3/4")
slug: somerset_character
sub_type: solid
Tier 3 anchor (solid). Somerset, Kentucky — US manufacturer, Appalachian hardwood. NWFA/NOFMA certified — confirm. Character grade = #1 Common equivalent (moderate natural marks). AlumaPLUS aluminum oxide finish — technology details? How many coats? Scratch resistance vs Mirage NanoLinx? Milling precision for solid — tongue-and-groove fit quality? Kiln drying: MC at shipping? Acclimation requirements? 3-1/4" to 5" widths — standard plank. Pricing: $4-7/sqft range — competitive mid-tier. Structural warranty terms. Finish warranty terms. Somerset is independent (not part of Shaw/AHF conglomerate) — confirm. How does Somerset compare to Bruce Dundee on milling/finish quality? Professional installer consensus on Somerset as a "good value floor." Any documented quality issues or complaint patterns?

## PRODUCT: Shaw Repel White Oak (Engineered, 1/2")
slug: shaw_repel
sub_type: engineered
Tier 3 anchor (engineered). Shaw Industries (Berkshire Hathaway subsidiary). Repel is Shaw's water-resistant engineered hardwood technology — what does it actually do? (Edge and surface treatment for moisture resistance). Veneer thickness: confirm — likely 2mm sawn. Core: confirm construction — multi-ply or HDF? ScufResist Platinum finish — technology details, scratch resistance data? Total board thickness 1/2" — confirm. How does Repel compare to Bruce Hydropel technology? Is "water-resistant hardwood" genuine engineering or marketing? Milling precision: Shaw has scale advantages but does precision match premium brands? Pricing: $4-8/sqft range? Manufacturing location: Dalton GA or elsewhere? Shaw's corporate advantage: Berkshire Hathaway backing, massive distribution network, strong warranty infrastructure. Warranty terms for Repel line. CARB Phase 2 compliance. Greenguard? Can a 2mm veneer floor compete with 3-4mm premium engineered? Installer consensus on Shaw hardwood relative to LVP (Shaw also dominates LVP). Is Shaw actively prioritizing hardwood or is LVP their growth play?

## PRODUCT: Bruce Dundee White Oak (Solid, 3/4")
slug: bruce_dundee
sub_type: solid
Tier 4 anchor (solid). AHF Products (formerly Armstrong/Bruce). Dundee is the volume leader for 3/4" solid — standard builder-grade floor. What grade? (likely #1 Common equivalent). Factory finish: Dura-Shield aluminum oxide — how many coats? Performance vs premium aluminum oxide finishes? Milling precision: professional installer assessment — is Dundee milling adequate or frustrating? Width: 3-1/4" strip (traditional). Pricing: $3-5/sqft — commodity pricing. Manufacturing: where? AHF has multiple plants — Beverly, WV; Somerset, KY? — confirm for Dundee specifically. Is Bruce NWFA/NOFMA certified currently? AHF Products financial situation: post-Armstrong reorganization — stable? Warranty: finish and structural terms. Documented quality changes over time (Bruce quality perception has declined — confirm). r/Flooring and r/HardwoodFloors: what do installers say about Bruce product quality in 2024-2026? Is there a measurable gap between Bruce and Somerset solid white oak?

## PRODUCT: Bruce Hydropel White Oak (Engineered, 3/8")
slug: bruce_hydropel
sub_type: engineered
Tier 4 lower anchor (engineered). AHF Products. Hydropel = water-resistant engineered technology. Confirm veneer thickness — hypothesis is 1.2mm rotary-peeled. If <2mm and rotary: this is a replace-when-worn product, NOT refinishable. Core: 3/8" total thickness — what core material? HDF or thin plywood? Such thin total thickness suggests a click-lock floating floor product. How does Hydropel compare to Shaw Repel? Both are "water-resistant" engineered — which is genuinely better constructed? Pricing: $3-5/sqft. Milling: click-lock precision? Factory finish details. This product represents the floor below which "it's not really hardwood anymore" — confirm professional consensus. Is there a point where thin-veneer engineered is functionally equivalent to laminate with a real wood veneer? Installer assessment: would a professional install this in their own home? CARB Phase 2 compliance. Greenguard? Manufacturing location.

---

*Run all 8 product queries in Perplexity. Process outputs into curation files.*
