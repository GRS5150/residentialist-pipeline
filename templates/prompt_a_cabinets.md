# The Residentialist — Cabinets Category Research Queries
## Kitchen & Bath Cabinetry — Custom, Semi-Custom, Stock
### Created April 6, 2026 — Pipeline Rebuild

---

## Naming Convention

- `prompt_a_{category}.md` = Research queries (Pass 1-4, run before any product is scored)
- `prompt_b_{category}.md` = Per-product deep dive prompts (run after config is built)

Study completed category query files before drafting new ones. The specificity level in these queries — naming component suppliers, referencing known platform sharing, asking about specific failure modes — is the standard. Generic placeholder queries produce generic results.

---

## Pass 1 — Landscape Survey (Query 1)

**Purpose:** Discover what gets measured, who measures it, where the scores live.

```
Who independently tests residential kitchen and bathroom cabinets and what do they measure?

I'm building a product intelligence platform that scores residential cabinetry on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything. Custom, semi-custom, and stock cabinetry — kitchen and bath.

Specifically:

1. What standardized tests exist for residential cabinets? (KCMA (Kitchen Cabinet Manufacturers Association) / ANSI A161.1 performance and construction standard — what does it actually test? KCMA certification marks: what do they mean? BHMA/ANSI A156 hardware standards. ASTM D1037 particleboard/MDF properties. CARB/EPA TSCA Title VI formaldehyde emissions. GREENGUARD/GREENGUARD Gold for VOC. What tests create meaningful differentiation between custom and stock?)

2. What are the measurable specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between custom (Crystal, Rutt, Plain & Fancy) and stock (Hampton Bay, Diamond NOW)? Think: box material (plywood vs particleboard vs MDF), box thickness (1/2" vs 3/4"), shelf capacity (pounds per shelf), drawer glide type and rating (Blum vs Hettich vs KV vs generic), hinge type and cycles, dovetail vs stapled drawer boxes, finish coats and type.

3. Who does independent comparative testing? (Consumer Reports? KCMA testing labs? Any independent reviewers doing factory visits or construction quality comparisons? CliqStudios reviews? Trade publications with structured testing?)

4. What reliability data exists in the public domain? (KCMA member listing and certification status, contractor warranty claim patterns, documented finish failure rates, drawer glide failure by type, hinge failure by type, cabinet installer complaints on specific brands, any published service life data)

5. What are the key construction differentiators between premium and builder-grade cabinets? (Box construction: 3/4" plywood all sides vs 1/2" particleboard. Drawer box construction: solid hardwood dovetail vs stapled MDF vs plywood. Face frame vs frameless/full-access (European). Shelf construction and adjustability. Back panel (1/4" vs 1/2" vs full plywood). Assembly method: dowel + glue vs cam lock vs staple + glue. Finish type: catalyzed conversion varnish vs lacquer vs thermofoil vs melamine vs paint)

6. Are there any independent reviewers doing physical comparisons or construction-level analysis of residential cabinets? (Anyone doing the equivalent of what StarCraft Reviews does for faucets — taking cabinets apart and comparing construction methods across brands?)

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

**Save output as:** `knowledge/cabinets/cabinets_testing_framework.md`

---

## Pass 2 — Component Deep Dive (Query 2)

**Purpose:** Go inside the products. Name the component suppliers, map the platform sharing, understand the failure modes at part level.

```
I'm building an independent product intelligence platform that scores residential cabinets at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails.

BOX CONSTRUCTION & MATERIALS:
- Plywood grading: what species and grades do premium cabinet makers use? (Baltic birch, maple plywood, domestic birch, Chinese birch, poplar core). How does plywood quality vary by source?
- Particleboard vs MDF vs plywood: at what spend level does the industry switch? Is there a particleboard that performs comparably to plywood? (Furniture-board? Industrial particleboard?)
- Box material by brand: Crystal Cabinet — confirmed all-plywood? Rutt — confirmed? Fabuwood Galaxy — confirmed plywood box? KraftMaid — mixed? Merillat — particleboard confirmed?
- Box thickness: 3/4" (19mm) vs 1/2" (12.7mm) by brand. Who skimps on back panels? Who uses 1/4" luan backs?
- Assembly methods: dowel + glue (traditional), cam lock (RTA/ready-to-assemble), dado joint, mortise-and-tenon (high-end). Which brands use which? How does assembly method correlate with longevity?
- Toe kick construction: separate vs integral, adjustable legs vs fixed

DRAWER SYSTEMS (CRITICAL WEAR COMPONENT):
- Drawer glide/slide manufacturers: Blum (Austria), Hettich (Germany), Grass (Austria), King Slide (Taiwan), Knape & Vogt (US), Accuride, generic Chinese. Who supplies whom?
- Blum TANDEM vs Blum MOVENTO vs Hettich Quadro vs Grass Dynapro — actual engineering differences? Cycle testing: Blum tests to 100,000+ cycles — do others publish comparable data?
- Soft-close mechanism: integrated in slide (Blum Blumotion) vs add-on dampener. Which brands use genuine Blum vs generic soft-close?
- Drawer box construction: solid hardwood dovetail (walnut, maple, birch), plywood with dovetail, stapled MDF, melamine-wrapped particleboard. Weight capacity correlation?
- Under-mount vs side-mount vs center-mount glides — which method for which quality tier?
- Known failure modes: drawer glide collapse under weight (> 75 lbs), soft-close mechanism failure, plastic clip breakage on generic slides

HINGES (CRITICAL WEAR COMPONENT):
- Hinge manufacturers: Blum (Clip top, Clip top Blumotion), Hettich (Sensys), Grass (Tiomos), Salice, generic Chinese
- Hinge adjustment: 3-way adjustable (standard on European hinges) vs non-adjustable cup hinges
- Cycle ratings: Blum Clip top Blumotion rated to 200,000 cycles? Comparable data from Hettich, Grass?
- Soft-close hinges: integrated Blumotion vs separate damper piston vs generic spring
- Which brands use genuine Blum vs rebranded generics? How can a consumer verify?
- Known failure modes: spring fatigue, screw pull-out from particleboard, adjustment drift

FINISH SYSTEMS:
- Catalyzed conversion varnish: the gold standard per professionals — which brands use this? Application method: spray vs dip vs curtain coat?
- Lacquer: solvent-based vs water-based. VOC implications? Durability difference?
- Thermofoil / RTF (rigid thermal foil): PVC film heat-applied over MDF. Known delamination failure modes? Temperature and humidity sensitivity?
- Melamine: direct-pressure laminate — the cheapest finish. Chip resistance at edges? Color-through vs surface-only?
- Paint: cabinet-grade paint (sprayed in factory) vs field-painted. Which brands offer factory paint with catalyzed topcoat?
- Stain quality: wiping stain vs spray stain. Consistency across large orders?
- UV stability: which finishes yellow over time? Thermofoil yellowing timeline?

SHELVING & INTERIOR:
- Shelf material: plywood (premium), particleboard with edge banding (standard), wire (budget bath)
- Shelf adjustability: 32mm system (European standard) vs non-standard hole spacing
- Weight rating per shelf: does anyone publish this? What's the real-world capacity before deflection?
- Soft-close shelf clips vs friction-fit

PLATFORM SHARING / CORPORATE:
- MasterBrand Cabinets (Fortune Brands): Diamond, Aristockraft, Homecrest, Kemper, Omega, Schrock, Star Mark, Kitchen Craft, Decora — which lines share box construction? Same factories?
- American Woodmark: Waypoint, Timberlake, Shenandoah — is a Shenandoah cabinet a Waypoint with cheaper doors?
- Fabuwood: New Jersey manufacturer — all product made in-house? Galaxy vs Allure vs Nexus construction differences?
- IKEA: Forvara/Maximera drawer system — Blum manufactured? Who makes IKEA cabinet boxes? (Reported: IKEA uses Blum for premium drawers)
- Crystal Cabinet Works: Minnesota custom shop — confirmed single-factory, fully custom? How do they compare to Rutt/Plain & Fancy?
- KraftMaid (MasterBrand/Fortune Brands): the dominant semi-custom. What's actually inside a KraftMaid box in 2025+ vs 2015? Has quality changed?

FORMALDEHYDE & MATERIAL SAFETY:
- CARB Phase 2 / EPA TSCA Title VI: all US manufacturers must comply — but does compliance = zero risk?
- NAF (no added formaldehyde) panels: which brands use NAF plywood or MDF? Cost premium?
- GREENGUARD Gold certified brands — who has it? Who doesn't?
- Finish off-gassing: catalyzed conversion varnish vs thermofoil vs melamine. Any independent testing on post-cure VOC levels?

Prioritize sources from: professional cabinet installers, kitchen designer communities, KCMA, trade publications (Woodworking Network, FDMC), manufacturer spec sheets, r/Cabinetry, r/HomeImprovement, Houzz forums. Cite all sources.
```

**Save output as:** `knowledge/cabinets/cabinets_component_analysis.md`

---

## Pass 3 — Competitive Hierarchy: Top (Query 3)

**Purpose:** Establish where the top brands sit relative to each other.

```
How do professionals rank the top residential cabinet brands against each other?

Specifically comparing Crystal Cabinet Works, Rutt HandCrafted Cabinetry, Plain & Fancy, Fabuwood Galaxy, Wood-Mode/Brookhaven, and Shiloh Cabinetry. What separates the best from the merely excellent in the custom and premium semi-custom tier?

Focus on professional kitchen designer opinions, cabinet installer feedback, independent construction-level analysis, and documented quality differences — not marketing claims. What do professionals who specify and install these cabinets daily say about relative quality?

I'm interested in: box construction material and methods, drawer system quality (Blum vs alternatives), hinge hardware, finish durability and consistency, joinery methods, shelf construction, warranty terms and execution, lead times and order accuracy, and factory quality control. True custom and premium semi-custom only — what justifies the price premium at the top tier?
```

**Save output as:** `knowledge/cabinets/cabinets_hierarchy_top.md`

---

## Pass 4 — Competitive Hierarchy: Middle and Bottom (Query 4)

**Purpose:** Establish where the line falls between good and mediocre, and what sits at the floor.

```
Where do professionals draw the line between a good residential cabinet brand and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank KraftMaid, Merillat, Diamond (MasterBrand), Decora, Waypoint/Timberlake (American Woodmark), Fabuwood Allure, CliqStudios, IKEA (SEKTION), cardell, RTA (ready-to-assemble generics), Hampton Bay (Home Depot), and Diamond NOW (Lowe's) in the professional hierarchy?

I need: reliability data where available, professional installer and kitchen designer opinions on construction quality, known quality problems by brand (delaminating thermofoil, drawer glide failure, particleboard swelling from moisture), which brands professionals actively warn against, and where the floor of acceptable quality sits for residential cabinetry.

Focus on the line between "good enough for a quality kitchen" and "builder-grade box that will fail in 5-7 years." What brands do kitchen designers and experienced installers refuse to specify? What breaks first on cheap cabinets? What does a $15,000 kitchen install look like at year 7 vs a $40,000 kitchen?
```

**Save output as:** `knowledge/cabinets/cabinets_hierarchy_bottom.md`

---

## Calibration Product Candidates (Pre-Research)

Pending confirmation after research results reviewed:

| Tentative Tier | Brand | Notes |
|---|---|---|
| Tier 1 | Crystal Cabinet Works | Minnesota custom, all-plywood, Blum hardware |
| Tier 1 | Fabuwood Galaxy | NJ manufacturer, plywood box, Blum TANDEM drawers |
| Tier 1-2 | Plain & Fancy | Custom — needs hierarchy confirmation |
| Tier 2 | KraftMaid (MasterBrand) | Dominant semi-custom — needs quality assessment |
| Tier 2-3 | Decora (MasterBrand) | Semi-custom — platform sharing with Diamond? |
| Tier 3 | IKEA SEKTION | European design, reported Blum drawers — needs confirmation |
| Tier 3-4 | Merillat (MasterBrand) | Builder-grade tier — particleboard construction? |
| Tier 4 | Hampton Bay / Diamond NOW | Big-box store brands — documented quality floor |

**Scope:** Residential kitchen and bath cabinetry. Custom, semi-custom, and stock. NOT commercial, NOT garage, NOT closet systems.

---

*Run these four queries in order. Review all four outputs together before building config.*
