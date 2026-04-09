# Cabinets — Per-Product Deep Dive Prompt (prompt_b)

**Scope:** Residential kitchen and bath cabinetry — custom, semi-custom, stock. NOT commercial, NOT garage, NOT closet systems.
**Pool S:** Main Line Kitchen Design (structured brand ratings/reviews), KCMA certification data.
**Pass 2 Intelligence Applied:** This prompt uses specific hardware suppliers (Blum, Hettich, KV), box construction methods, finish systems, and failure modes from Pass 2 to force deep-dive sources to produce actionable data.

---

# Master Query

```
I'm building an independent product intelligence platform that scores residential cabinets on Quality, Durability, and Performance. I need a comprehensive construction-level analysis of [PRODUCT NAME].

BOX CONSTRUCTION (CRITICAL — #1 scoring differentiator):
- Box material: plywood (species? grade? Baltic birch? Domestic birch? Maple? Poplar core?)? Particleboard (furniture-board M? Low-density LD?)? MDF?
- Box thickness: sides 3/4" (19mm) or 1/2" (12.7mm)? Back panel: 1/2" plywood (premium), 1/4" hardboard (standard), 1/8" hardboard (budget)?
- Assembly method: dowel + glue (traditional), dado joint, cam lock (RTA), staple + glue (budget)?
- Face frame vs frameless (European full-access)? Face frame material: solid hardwood or MDF?
- Corner blocks? Metal clips? Reinforcement at hinges and shelf pins?
- Toe kick: separate or integral? Adjustable legs?

DRAWER SYSTEM (CRITICAL WEAR COMPONENT):
- Drawer box construction: solid hardwood dovetail (wood species?)? Baltic birch dovetail? Plywood with dado? Stapled MDF? Melamine-wrapped particleboard?
- Drawer slide/glide manufacturer: Blum (TANDEM, MOVENTO), Hettich (Quadro, ArciTech), Grass (Dynapro), King Slide, Knape & Vogt, Accuride, generic Chinese?
- Slide type: undermount (premium) vs side-mount vs center-mount?
- Cycle rating: how many cycles rated? (Blum TANDEM: 100,000+? Blum MOVENTO: higher?)
- Weight capacity: 75 lbs? 100 lbs? 130 lbs?
- Soft-close: integrated (Blum Blumotion) or add-on dampener? Or no soft-close?
- Full-extension or 3/4 extension?

HINGE HARDWARE:
- Hinge manufacturer: Blum (Clip top Blumotion), Hettich (Sensys), Grass (Tiomos), Salice, generic?
- Cycle rating: 100,000? 165,000? 200,000?
- Adjustment: 3-way adjustable? 6-way (Blum)?
- Soft-close: integrated Blumotion or separate damper piston?
- Hinge cup: 35mm standard? Screw mounting or tool-free?

FINISH SYSTEM:
- Finish type: catalyzed conversion varnish (gold standard)? Catalyzed lacquer? Water-based lacquer? Thermofoil/RTF (PVC heat-applied over MDF)? TFL/melamine (direct-pressure laminate)?
- Application method: spray, dip, curtain coat?
- Number of finish coats? Sanding between coats?
- UV stability: yellowing timeline? (Thermofoil known to yellow)
- Known failure modes: thermofoil delamination? Lacquer cracking? Paint chipping?

SHELVING & INTERIOR:
- Shelf material: 3/4" plywood (premium), particleboard with edge banding (standard), wire (budget bath)?
- Shelf adjustability: 32mm European system? Non-standard hole spacing?
- Weight rating per shelf: published capacity? Real-world before deflection?
- Shelf clips: metal or plastic?

FORMALDEHYDE & MATERIAL SAFETY:
- CARB Phase 2 / EPA TSCA Title VI compliant? (Mandatory for all US manufacturing)
- NAF (no added formaldehyde) panels? Plywood is typically CARB-exempt.
- GREENGUARD Gold certified?
- Finish off-gassing: catalyzed CV vs thermofoil vs melamine — post-cure VOC levels?
- KCMA certified? KCMA ESP (Environmental Stewardship Program)?

RELIABILITY & SERVICE:
- Expected lifespan: 20+ years (custom plywood), 15-20 (semi-custom particle), 5-10 (builder RTA)?
- Known failure modes: drawer glide collapse (>75 lbs), particleboard swelling from moisture, thermofoil delamination, soft-close mechanism failure, hinge screw pull-out from particleboard?
- Warranty: lifetime limited? What's actually excluded? Claim execution?
- Parts availability: replacement doors, hinges, slides — stocked or custom-order?
- Lead time: order to delivery?

CORPORATE & MANUFACTURING:
- Corporate parent and ownership structure
- Manufacturing location: single factory or multi-plant?
- Platform sharing within brand family (MasterBrand, American Woodmark)
- Financial stability / going-concern risk
- Distribution: dealer/designer exclusive vs big-box

Prioritize sources from: Main Line Kitchen Design reviews, kitchen designer forums (Houzz, r/Cabinetry), KCMA, installer feedback, Woodworking Network/FDMC trade publications. Cite all sources.
```

---

## PRODUCT: Crystal Keyline (Custom)
slug: crystal_keyline_custom
Tier 1 benchmark. Crystal Cabinet Works, Princeton MN. 3/4" plywood construction — confirm all-plywood including backs. Solid hardwood dovetail drawers — species? Blum TANDEM confirmed? Blum Clip top Blumotion hinges — cycle rating? Catalyzed conversion varnish finish — spray application confirmed? KCMA certified? What do designers who work with Crystal say vs Rutt and Plain & Fancy? Is Crystal true custom (made-to-order dimensions) or semi-custom with modifications? Lead times? What justifies Crystal pricing vs Fabuwood Galaxy?

## PRODUCT: Fabuwood Galaxy
slug: fabuwood_galaxy
Tier 1. NJ manufacturer. Plywood box — 3/4" all sides confirmed? Back panel: 1/4" hardboard or plywood? Baltic birch dovetail drawer boxes — confirmed or marketing? Blum TANDEM slides — model number? Load rating? Blum Clip top Blumotion hinges — confirmed? Catalyzed lacquer finish (not CV) — is this a meaningful quality gap vs Crystal? KCMA certified? Fabuwood Galaxy vs Allure vs Nexus — construction differences chart? Is Galaxy genuinely premium or is it marketing for a semi-custom product?

## PRODUCT: KraftMaid (base config)
slug: kraftmaid_base
Tier 2. MasterBrand/Fortune Brands. The dominant semi-custom. Particleboard box (furniture-board grade?) — confirm grade. What changed in KraftMaid construction 2015 vs 2025? Blum hinges confirmed — which model? Blum slides confirmed — which model? Catalyzed CV finish — confirmed? KCMA certified? KraftMaid sold at Home Depot and through designers — same product or different SKUs? Main Line Kitchen Design rates B+ — what pushes it down? Particleboard swelling documented? Drawer box material?

## PRODUCT: IKEA SEKTION
slug: ikea_sektion
Tier 3. Swedish design, multi-source manufacturing. Particleboard box — confirm density grade. Blum MAXIMERA drawer system confirmed — is this genuinely Blum? Blum hinges confirmed on all doors? TFL (thermofoil laminate) finish. RTA (cam-lock assembly) — durability of cam-lock joints over time? 25-year limited warranty — what's actually excluded? KCMA not certified — why not? Thermofoil delamination reports — how common at year 3-5? Moisture sensitivity (kitchen/bath)? Who actually makes IKEA cabinet boxes? What do kitchen designers say about IKEA for premium clients vs budget renovations?

## PRODUCT: Merillat Classic
slug: merillat_classic
Tier 3 lower. MasterBrand builder-grade line. Particleboard box — same grade as KraftMaid or lower-density? Generic drawer slides (not Blum?) — what brand? What cycle rating? Blum hinges — confirmed or generic? Catalyzed lacquer finish. KCMA certified (positive). No soft-close standard — must be specified? What's the construction gap between Merillat Classic and KraftMaid? Same factory? Same carcase with different doors? Platform sharing depth?

## PRODUCT: Hampton Bay (Home Depot)
slug: hampton_bay
Tier 4 floor. Home Depot house brand. Lowest-density particleboard? Generic hinges — what brand? What cycle rating (suspected 30,000 or less)? Generic drawer slides — what brand? What weight capacity? Thermofoil or melamine finish? Multi-source import — which countries? No KCMA certification? What do contractors and installers say about installing Hampton Bay in rental/flip kitchens? What breaks first — drawer slides, thermofoil, swelling? Realistic lifespan? What does a Hampton Bay kitchen look like at year 5?

---

*Run deep dives for each calibration product after research review.*
