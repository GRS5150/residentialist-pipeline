# Hardwood Flooring — Phase 1 Research Queries (prompt_a)
## Category Onboarding — Pass 1 through Pass 4

**Scope:** Solid and engineered hardwood flooring (factory-finished/pre-finished only). Both sub-types scored within one framework. NOT laminate, NOT luxury vinyl plank (LVP), NOT bamboo, NOT cork, NOT site-finished/unfinished (different workflow). Engineered veneer thickness is THE critical spec. Solid thickness + species grade are the core differentiators.

**Run these four queries in Perplexity (sonar-deep-research) in order. Review all four outputs together before building config.**

**Naming:** `prompt_a` = research queries (this file). `prompt_b` = per-product deep dive prompts (built after config).

---

## PASS 1 — Landscape Survey

```
Who independently tests residential hardwood flooring and what do they measure?

I'm building a product intelligence platform that scores residential hardwood flooring (both solid and engineered) on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything.

Specifically:

1. What standardized tests exist for residential hardwood flooring? (list relevant standards bodies — NWFA/NOFMA grading standards, ANSI/HPVA EF 2020 for engineered wood, ASTM D2394 for surface wear, ASTM D1037 for mechanical properties, CARB Phase 2 / EPA TSCA Title VI for formaldehyde emissions, Janka hardness testing ASTM D143, any others)

2. What are the measurable performance specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium (Mirage, Carlisle Wide Plank, Mercier) and builder-grade (Bruce, LifeProof, generic imports)? Think: veneer thickness (mm) for engineered — real spread from 0.6mm to 6mm+, sawn vs rotary-peeled, Janka hardness by species, finish scratch resistance (ASTM D1044 Taber abrasion test — number of cycles to wear-through), finish adhesion testing, dimensional stability under humidity cycling, moisture content at shipping (% MC), tongue-and-groove milling tolerance, plank width and length, board thickness (total and veneer separately for engineered).

3. Who does independent comparative testing? (Consumer Reports hardwood flooring testing, NWFA technical publications, Hardwood Floors Magazine product reviews, WoodFloorBusiness.com, any labs doing side-by-side hardwood testing or structural analysis, professional installer comparative assessments)

4. What reliability/longevity data exists in the public domain? (warranty claim patterns by brand, installer consensus on delamination rates for engineered, cupping/crowning incident rates for solid, formaldehyde compliance history, any manufacturer-published failure rate data)

5. What are the key construction differentiators between premium and builder-grade hardwood flooring?
   - Solid: species grade (Clear/Select vs #1/#2 Common), thickness (3/4" vs 5/16"), kiln-drying process, moisture content at shipping, milling precision, factory finish system (aluminum oxide UV-cured vs basic polyurethane vs oil-based)
   - Engineered: veneer thickness (THE critical spec — 0.6mm to 6mm+), veneer cut method (sawn vs sliced vs rotary-peeled), core construction (Baltic birch plywood vs multi-ply hardwood vs HDF vs softwood), number of plies, adhesive type (phenol-formaldehyde vs PVA vs melamine), finish system, edge profile (micro-bevel vs square edge)

6. Are there any independent reviewers doing physical teardowns or cross-section analysis of engineered hardwood — someone cutting boards in half and measuring actual veneer thickness vs stated specs? Any fraud in stated veneer thickness?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

**Save output as:** `knowledge/hardwood_flooring/hardwood_testing_framework.md`

---

## PASS 2 — Component Deep Dive

**Purpose:** Go inside the products. Map the manufacturing, understand veneer sourcing, core construction, adhesive systems, and finish chemistry at the component level.

```
I'm building an independent product intelligence platform that scores residential hardwood flooring at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual construction inside these products — how they differ and what fails.

VENEER LAYER (ENGINEERED ONLY — THE CRITICAL SPEC):
- What veneer thicknesses do major engineered hardwood brands actually use? Map the specific mm thickness for: Mirage, Mercier, Lauzon, Shaw, Bruce/AHF, Somerset, Mohawk/RevWood, Mannington, Mullican, Columbia, Garrison, Hallmark. Are stated thicknesses accurate or do they over-claim?
- Sawn vs sliced vs rotary-peeled veneers: which brands use which method? At what thickness threshold does sawn become standard?
- Who supplies the veneer? Are premium Canadian manufacturers (Mirage, Mercier, Lauzon) using self-sourced domestic hardwood, or is veneer imported? Where does the white oak veneer come from for each major brand?
- Veneer bonding to core: what adhesives are used? Phenol-formaldehyde (waterproof, industrial grade), PVA/polyvinyl acetate (standard), melamine-urea-formaldehyde? Which adhesive type is most resistant to delamination under thermal cycling (radiant heat)?

CORE CONSTRUCTION (ENGINEERED ONLY):
- Core material by brand: Baltic birch plywood (Mirage, Mercier?), domestic hardwood plywood (poplar, eucalyptus), HDF, softwood, finger-core? Map the specific core for each major brand.
- Number of plies: does ply count correlate with stability? 3-ply vs 5-ply vs 7-ply vs 9-ply — which brands use which?
- Cross-grain orientation: all premium products should have perpendicular grain layers. Any brands cutting corners with parallel grain?
- Core moisture content at manufacturing: what's the target and what's the real spread?
- Does core species matter? Birch vs poplar vs eucalyptus vs radiata pine — rank by dimensional stability.

SOLID HARDWOOD CONSTRUCTION:
- Kiln drying: what moisture content target do premium manufacturers use vs builder-grade? (target 6-9% MC for residential). Who documents their kiln schedule?
- Tongue and groove precision: how is milling tolerance measured? What's the tolerance spread between Carlisle/Somerset/Mirage and Bruce/LifeProof?
- Solid plank width evolution: the market has moved from 2-1/4" strip to 5" plank to 7"+ wide plank. What are the dimensional stability implications of wide plank solid vs narrow strip?

FINISH SYSTEMS:
- Factory finish technology by brand: UV-cured aluminum oxide (how many coats, what aluminum oxide density?) vs UV-cured polyurethane vs oil-based (Rubio Monocoat, Bona, Osmo) vs basic polyurethane.
- Mirage NanoLinx finish — what's the technology? How does it compare to Lauzon Titanium finish? Somerset AlumaPLUS? Shaw ScufResist Platinum?
- Finish scratch resistance: ASTM D1044 Taber abrasion cycles to wear-through by brand. Is this data available?
- Finish adhesion: ASTM D3359 cross-hatch adhesion test results by brand?
- Finish warranty terms: what do "25-year" and "lifetime" finish warranties actually cover? Wear-through only, or scratches/dents too?
- UV coating application: how many coats? What's the difference between 7-coat Mirage and 3-coat budget?

FAILURE MODES:
- Engineered delamination: what causes it? Adhesive failure vs moisture intrusion vs manufacturing defect. Which brands have documented delamination patterns?
- Cupping in solid hardwood: environmental moisture vs manufacturing MC vs installation error — how do professionals partition blame? Which species/widths are most susceptible?
- Finish peeling/flaking: which finish types are most prone? Is there a documented pattern by brand?
- Gapping: seasonal vs permanent. How much is "normal"?
- Edge chipping: engineered micro-bevel vs square edge — which is more durable long-term?

FORMALDEHYDE & SAFETY:
- CARB Phase 2 / EPA TSCA Title VI compliance: who are the third-party certifiers? (Capital Testing, Intertek, SGS, Bureau Veritas)
- Which brands have Greenguard Gold certification (stricter than CARB Phase 2)?
- Lumber Liquidators (now LL Flooring, now defunct) — what specifically failed in 2015? What changed industry-wide?
- VOC off-gassing: how long does formaldehyde off-gassing continue post-installation for engineered hardwood?
- Lacey Act compliance: any brands with documented chain-of-custody violations?

Prioritize sources from: NWFA technical publications, Hardwood Floors Magazine, WoodFloorBusiness.com, professional installer communities (r/HardwoodFloors, r/Flooring), manufacturer technical data sheets, CARB/EPA enforcement actions, third-party lab certifications. Cite all sources.
```

**Save output as:** `knowledge/hardwood_flooring/hardwood_component_analysis.md`

---

## PASS 3 — Competitive Hierarchy: Premium Tier

**Purpose:** Establish where the top brands sit relative to each other.

```
How do flooring professionals rank the top residential hardwood flooring brands against each other?

I need the professional consensus hierarchy for premium hardwood flooring — both solid and engineered sub-types scored together. Specifically comparing:

SOLID:
- Carlisle Wide Plank (custom solid, Stoddard NH)
- Hull Forest Products (wide plank, Connecticut)
- Somerset Hardwood Flooring (solid, Somerset KY — is this mid-tier or premium?)

ENGINEERED:
- Mirage Hardwood Floors (Québec — widely regarded as the engineered benchmark)
- Mercier Wood Flooring (Québec — direct Mirage competitor)
- Lauzon Hardwood Flooring (Québec — Pure Genius/Titanium finish)
- Garrison Collection (US-designed, manufactured offshore)

Focus on professional installer opinions, NWFA-certified contractor assessments, and construction-level differences — not marketing claims. What do flooring professionals who install these products daily say about relative quality?

I'm interested in:
- Milling precision and installation ease (tongue-and-groove fit, board straightness, lippage)
- Finish quality and scratch resistance (which finish technology performs best in real homes?)
- Veneer quality for engineered (grain consistency, thickness accuracy, bonding integrity)
- Long-term performance at 5/10/15 years (which products age best?)
- Customer callback rates (which brands generate the fewest installation complaints?)
- Dimensional stability in extreme humidity environments
- Warranty claim experience (which manufacturers stand behind their product?)

Where does Mirage actually stand vs Mercier vs Lauzon? Is the Québec manufacturing cluster genuinely superior, or is it branding? What separates Carlisle wide plank solid from a well-sourced Somerset solid? Is Garrison competitive with the Canadian manufacturers despite offshore construction?
```

**Save output as:** `knowledge/hardwood_flooring/hardwood_hierarchy_top.md`

---

## PASS 4 — Competitive Hierarchy: Middle and Bottom

**Purpose:** Establish where the line falls between good and mediocre, and what sits at the floor.

```
Where do flooring professionals draw the line between a good hardwood floor and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank Shaw, Bruce/AHF Products, Armstrong, Mohawk/RevWood, Mannington, Mullican, Columbia Flooring, Anderson Tuftex, Bella Cera, LifeProof (Home Depot), and Chinese import brands in the professional hierarchy?

I need:
- Installer consensus on milling precision, finish quality, and long-term performance for each brand
- Known problems by brand (finish peeling, delamination, veneer thickness misrepresentation, cupping patterns, gapping)
- Which brands professionals actively warn against
- Where the floor of acceptable quality sits for hardwood flooring (what's the minimum spec a professional installer will put their name behind?)

Focus on the line between "good enough for a quality home" and "builder-grade filler that looks like hardwood." What brands do designers refuse to specify? What brands do installers dread working with?

KEY QUESTIONS:
- Shaw hardwood: good or just big? Does size/distribution compensate for product quality?
- Bruce/AHF: legacy brand with declining quality, or still solid?
- Chinese imports with thin rotary-peeled veneer (<1mm marketed as "engineered hardwood"): how do installers assess these?
- LifeProof (Home Depot house brand): is it real hardwood or a marketing category?
- Mannington and Mullican: genuine mid-tier or aspirational marketing?
- What's the veneer thickness threshold below which professional installers won't recommend the product? (hypothesis: 2mm for "real" engineered)
- Tongue-and-groove fit: which brands have documented milling problems?
- Formaldehyde concerns: which brands still raise red flags among installers?
```

**Save output as:** `knowledge/hardwood_flooring/hardwood_hierarchy_bottom.md`

---

## Calibration Product Candidates (Pre-Research)

Pending confirmation after research results reviewed:

| Tentative Tier | Brand/Product | Sub-Type | Notes |
|---|---|---|---|
| Tier 1 | Carlisle Wide Plank White Oak | Solid | Custom artisanal, Stoddard NH, Select & Better |
| Tier 1 | Mirage Sweet Memories White Oak | Engineered | 3.5mm sawn veneer, NanoLinx finish, Québec |
| Tier 2 | Mercier Design+ White Oak | Engineered | 3mm sawn veneer, Generations finish, Québec |
| Tier 2 | Lauzon Designer White Oak | Engineered | 3mm sawn veneer, Titanium finish, Québec |
| Tier 3 | Somerset Character White Oak | Solid | NWFA/NOFMA certified, Somerset KY |
| Tier 3 | Shaw Repel White Oak | Engineered | 2mm sawn veneer, ScufResist Platinum, Repel technology |
| Tier 4 | Bruce Dundee White Oak | Solid | Volume leader, standard 3/4", basic aluminum oxide |
| Tier 4 | Bruce Hydropel White Oak | Engineered | 1.2mm rotary veneer, replace-when-worn |

**Scope:** Factory-finished solid and engineered hardwood. White oak as the normalized species across all products for apples-to-apples comparison.

**All calibration products in White Oak:** White Oak (Janka 1360) is the dominant US market species and allows apples-to-apples comparison across the solid vs engineered divide. Other species scored later as variants per Rule 17.

**Axis weight hypothesis (pre-research):**
- Quality: 0.35 — Veneer/species, milling, finish, core construction define the product hierarchy
- Durability: 0.35 — "Which ones last" drives professional consensus; finish warranty, delamination resistance, structural warranty, formaldehyde compliance
- Performance: 0.30 — Refinishing potential, dimensional stability, moisture resistance, installation versatility. NOT flat — real spread from unlimited-refinish solid to not-refinishable thin-veneer engineered.

*Note: Axis weights are hypothesis. Research may reveal Quality is more dominant (if milling/finish spread is wider than expected) or Durability is more critical (if delamination patterns are more common than expected). Confirm after reviewing Pass 1-2.*

---

*Run these four queries in Perplexity in order. Review all four outputs together before building config.*
