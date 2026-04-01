# Exterior Doors — Per-Product Deep Dive Prompt Template
## prompt_b_exterior_doors.md
## Created: 2026-04-01

---

## Master Template

Copy the code block below, append the product-specific context paragraph, and submit as a single Perplexity deep dive query.

```
I'm building an independent product intelligence platform that scores residential exterior entry doors on Quality (0.40 weight), Durability (0.35), and Performance (0.25). I need a forensic analysis of this specific product — not generic brand information, not marketing copy. I need the specific components, suppliers, test results, and field performance data.

PRODUCT: [PRODUCT NAME]

SLAB CONSTRUCTION & CORE:
- What is the exact slab construction? (compression-molded fiberglass, solid wood species, engineered laminated wood, steel with specific gauge?)
- If fiberglass: who manufactures the fiberglass skin? Is it AccuGrain (Therma-Tru), standard compression-molded, or smooth? Skin thickness?
- If steel: what gauge? (16, 18, 20, 22, 24, 26 gauge?) Galvanized? Powder-coated?
- If wood: what species? Solid or engineered? Cross-laminated or solid plank? Treated (AuraLast or similar)?
- What is the core insulation material? Polyurethane foam (R-value per inch ~5-7), polystyrene (R-3.5-4.5), or other? What is the specific R-value published for this door?
- Is the slab manufactured in-house or sourced from another company?

WEATHERSEALING SYSTEM:
- What weatherstripping system does this door use? (multi-layer adjustable compression, standard compression with kerf, foam/magnetic, other?)
- Is the weatherstripping supplied by Schlegel/Quanex or another manufacturer?
- What threshold/sill system? (Endura Z-Series adjustable, standard aluminum, composite?) Who manufactures it?
- What are the corner pad specifications? (corner pad failure at 5-7 years is the most common weatherstrip failure mode)
- Is the weatherstripping field-replaceable using standard kerf profiles, or proprietary requiring manufacturer parts?
- NFRC-certified air infiltration rate? (ASTM E283, cfm/sq ft — premium doors achieve 0.05-0.10, builder-grade 0.20-0.30+)

HARDWARE & LOCKING:
- Does this door come standard with multipoint lock or single deadbolt?
- If multipoint: who manufactures the lock system? (GU-Gretsch-Unitas, Winkhaus, Hoppe, other?)
- How many locking points? (3-point, 5-point?)
- What hinge specification? ANSI/BHMA A156.1 Grade 1, Grade 2, or Grade 3? Stainless steel or plain steel? NRP (non-removable pins)?
- What handleset construction? (forged brass, forged bronze, cast zinc, die-cast zinc?) Who makes the handlesets? (Baldwin, Emtek/ASSA ABLOY, Schlage, Ashley Norton, Rocky Mountain, or proprietary?)
- Are hinges ball-bearing or plain bearing?

GLASS & GLAZING:
- Is glass internally or externally glazed? (internally glazed = glass held from inside, better security and water resistance)
- Who supplies the glass panels? (ODL, Western Reflections, in-house?)
- Low-E coating standard or optional? If standard: what type? (Low-E2, Low-E3, Low-E 366?)
- Double or triple pane? Argon or krypton filled? Spacer type (warm-edge or aluminum)?
- What is the NFRC-certified U-factor for the door assembly with glass? (Solid panel vs half-lite vs full-lite — list each if available)
- SHGC and VT ratings published?

ENERGY PERFORMANCE:
- NFRC-certified U-factor for the complete door assembly? (list for solid panel and with glass lite separately)
- ENERGY STAR certified? For which climate zones?
- ASTM E283 air infiltration test results?
- ASTM E547 water penetration test results?
- Design pressure (DP) rating? (DP20, DP35, DP50+?)
- Impact rated? (Florida Building Code, Miami-Dade NOA?) Specific test protocol and rating?

DURABILITY & MATERIAL LONGEVITY:
- What is the expected lifespan reported by professionals who install this door?
- Rot resistance: inherent (fiberglass) or treatment-dependent (wood)?
- If wood: what UV/weather treatment? Re-stain/seal interval recommended?
- Steel dent resistance: gauge and coating quality?
- Fiberglass delamination: any documented issues? At what age?
- Finish type: PVD, powder coat, factory stain (UV-stable), factory paint, field-paint-only?
- Finish warranty term separately from structural warranty?

WARRANTY & SERVICE:
- Full warranty terms (years, what's covered, what's excluded)?
- Is the warranty transferable?
- Glass lite warranty separate from slab warranty?
- Hardware warranty included or excluded?
- Finish/stain warranty term?
- Who backs the warranty? (parent company financial stability matters)
- What does the warranty claim process look like? (easy, bureaucratic, adversarial?)

PARTS & SERVICEABILITY:
- Are replacement parts available through dealer network, manufacturer direct, or big-box?
- Can weatherstripping be replaced in the field using standard kerf profiles?
- Are replacement glass panels available without replacing the entire door?
- Can hardware (hinges, locks) be upgraded aftermarket?
- After 10 years, are parts still available?
- Is this a dealer-channel or big-box-channel product? (Same brand often ships different specs to different channels)

MANUFACTURING & CORPORATE:
- Where is this specific product manufactured? (city, state/country)
- Parent company? (Fortune Brands/Therma-Tru, Masonite International, JELD-WEN, Pella Corp, etc.)
- Does the parent company also manufacture doors for other brands? (JELD-WEN makes Reliabilt for Lowe's)
- Any platform sharing with sibling brands? (e.g., Therma-Tru Classic-Craft vs Benchmark = same parent, different spec levels)
- Recent ownership changes or corporate risk factors?

PROFESSIONAL & EXPERT OPINION:
- What do professional installers say about this specific door on contractor forums? (r/Carpentry, GBA, FHB)
- Would professionals install this door in a quality home ($750K+)? Under what conditions?
- How do pros compare this door to its closest competitors?
- What is the callback/service call rate that installers experience with this product?
- What is the single biggest complaint pros have about this product?

CERTIFICATIONS & SAFETY (Report Only):
- ENERGY STAR certified?
- NFRC label present?
- ADA compliant?
- Florida Building Code / Miami-Dade approved? (if applicable)
- Any active recalls or safety bulletins?
- Low-VOC finish certification?

Focus on expert sources: GBA contractor forums, FHB professional articles, r/Carpentry, Consumer Reports, NFRC database, manufacturer spec sheets, and professional installer YouTube channels. Cite all sources with URLs.
```

---

## PRODUCT: Marvin Signature Ultimate Entry Door
slug: marvin_ultimate_entry

Product-specific context: Marvin's top-of-line entry door. Architect default for $2-5M homes. Engineered laminated wood/hybrid slabs — verify exact construction (laminated vs solid). Premium factory-integrated hardware with multipoint lock standard. Refinishable UV-stable stains. Lifetime warranty backed by Fortune Brands Innovations (NYSE: FBIN, also owns Therma-Tru and Moen). Warroad, MN manufacturing. Reported <1% service call rate by pro installers. Kolbe VistaLuxe and Loewen are direct competitors at this tier.

Key verification targets: (1) Confirm engineered laminated wood vs solid wood slab construction, (2) Identify multipoint lock supplier (GU, Winkhaus, Hoppe, or proprietary?), (3) Confirm NFRC U-factor for solid panel and with glass lite, (4) Hinge grade — Grade 1 stainless confirmed?, (5) Glass supplier — in-house or ODL/third party?, (6) Air infiltration test results, (7) What Fortune Brands warranty actually covers vs excludes.

---

## PRODUCT: Therma-Tru Classic-Craft Premium (Fiberglass)
slug: thermatru_classiccraft

Product-specific context: Therma-Tru's premium fiberglass entry. AccuGrain compression-molded fiberglass — most realistic wood grain in fiberglass. Rot-proof slab. Polyurethane foam core yielding R-5+ on solid panel (U-factor claimed as low as 0.14-0.15). Multi-point lock standard. 50-year/lifetime warranty. Fortune Brands parent. Butler, IN manufacturing. Professional consensus: best fiberglass door available. Classic-Craft is dealer-channel product — NOT the same as Smooth-Star or Benchmark sold at big-box.

Key verification targets: (1) Confirm AccuGrain skin thickness and construction vs Benchmark/Smooth-Star, (2) Confirm polyurethane foam core density and R-value, (3) Multipoint lock supplier, (4) NFRC U-factor for solid panel and half-lite/full-lite configurations, (5) Weatherstripping supplier (Schlegel/Quanex?), (6) Corner pad specification and expected lifespan, (7) Confirm DP rating — DP50 standard or option?, (8) 50-year warranty fine print — what's excluded?

---

## PRODUCT: Pella Reserve Entry Door
slug: pella_reserve_entry

Product-specific context: Pella's premium entry door line. #1 consumer trust brand (LifeStory Research 2026). Wood/fiberglass hybrid depending on configuration. R6+ rated door system. Family-owned (Pella Corporation, Pella IA — founded 1925). Limited lifetime warranty. Reserve is the top Pella line — Lifestyle and 250 Series are lower, different products per Rule 19. Professional ranking: below ProVia/Therma-Tru Classic-Craft, above JELD-WEN. Available through Pella showrooms and select retailers.

Key verification targets: (1) Confirm slab construction for Reserve fiberglass specifically, (2) Confirm hardware — does Reserve include multipoint lock or is it single deadbolt standard?, (3) NFRC U-factor for complete system, (4) Glass supplier, (5) What separates Reserve from Lifestyle and 250 Series at component level?, (6) Warranty claim process reputation, (7) Air infiltration and DP rating from NFRC database.

---

## PRODUCT: Therma-Tru Benchmark Entry (Fiberglass)
slug: thermatru_benchmark

Product-specific context: Therma-Tru builder line — NOT Classic-Craft quality. Thinner compression molding, less realistic grain. Fortune Brands backing (same parent as Classic-Craft). Available through dealers and some big-box stores. Professional "quality floor" — installers put Benchmark in $500K+ homes without hesitation but prefer Classic-Craft. Smooth-Star is a step below Benchmark (even thinner fiberglass — that's a separate product).

Key verification targets: (1) Confirm slab thickness vs Classic-Craft AccuGrain, (2) Confirm standard hardware (expecting Grade 2, single deadbolt), (3) Weatherstripping — same Schlegel/Quanex supply as Classic-Craft or different?, (4) NFRC U-factor, (5) Delamination rate vs Classic-Craft, (6) Confirm DP rating, (7) Is this the exact same door whether bought at dealer vs Menards/big-box, or are big-box units further spec-reduced?

---

## PRODUCT: Masonite Performance Door System (Fiberglass)
slug: masonite_performance

Product-specific context: Masonite's premium entry line. "Performance Door System" branding. Masonite International (TSX: MAS, publicly traded). Solid mid-market. Innovative weatherstripping cited as better than JELD-WEN. Comparable to Therma-Tru Benchmark. Solidoor is a step below Performance — different product. Multiple manufacturing facilities across US, Canada, Mexico.

Key verification targets: (1) Confirm slab construction (standard or compression-molded fiberglass?), (2) What makes the weatherstripping "innovative" — specific construction/supplier?, (3) Core insulation type and R-value, (4) NFRC U-factor, (5) Hardware spec (expecting Grade 2 single deadbolt), (6) Masonite warranty terms for Performance line specifically, (7) Is the Performance Door System genuinely different from Masonite standard at component level?

---

## PRODUCT: JELD-WEN Builders Series (Steel/Fiberglass)
slug: jeldwen_builders

Product-specific context: JELD-WEN builder-grade entry. Both steel and fiberglass configurations. AuraLast wood treatment controversy primarily affected windows — doors score on own merits per JELD-WEN Rule, but report the history. Mexico-made lines reported thinner/cheaper. JELD-WEN (NYSE: JELD). Big-box and builder channel distribution. JELD-WEN also makes dealer-channel products (Siteline fiberglass, Premium Steel) that are genuinely different and higher quality — those are separate products per Rule 19.

Key verification targets: (1) Confirm steel gauge — 22 or 24 gauge on Builders Series?, (2) Core insulation type, (3) Weatherstripping spec, (4) Hardware grade, (5) NFRC U-factor, (6) Where is Builder Series manufactured — US or Mexico?, (7) What are the specific AuraLast issues and do they apply to doors at all?, (8) Callback rate from contractor experience reports, (9) How does Builders Series spec differ from dealer-channel JELD-WEN Siteline?

---

## PRODUCT: Reliabilt Entry Door (Lowe's)
slug: reliabilt_entry

Product-specific context: JELD-WEN-made big-box exclusive for Lowe's. Downgraded specs compared to branded JELD-WEN — 24-26 gauge steel, thin fiberglass, basic foam weatherstripping. Contractor consensus: "disposable" door, 5-8 year expected lifespan. 50%+ service call rate per contractor reports. Highest callbacks in category. Weatherstrip fails at 2-5 years. Parts unavailable after ~5 years. For flips and rentals only per professional installer consensus.

Key verification targets: (1) Confirm steel gauge — does Lowe's spec list gauge?, (2) Who actually manufactures — confirmed JELD-WEN?, (3) Warranty terms — how short?, (4) Core insulation type (polystyrene or polyurethane?), (5) Hardware grade, (6) Can weatherstripping be replaced or is the door economically disposable?, (7) NFRC U-factor (if available — may not be NFRC certified), (8) Any documented delamination timelines for fiberglass models?

---

## Source Priority

1. **Pool A (Primary):** GBA (Green Building Advisor) contractor threads, FHB (Fine Homebuilding) articles and reviews, Consumer Reports testing data, NFRC database certified test results
2. **Pool B:** Houzz professional threads, r/Carpentry, r/HomeImprovement (professional contributors), YouTube installer/contractor channels
3. **Pool C:** Homeowner reviews, ConsumerAffairs, individual forum posts

## Operational Notes

- Run each product as a **separate** Perplexity deep dive query
- Append the product-specific context paragraph to the master template
- Expected output: 15-40K chars, 15-35+ sources per product
- Save each raw output as `exterior_doors_deep_dive_{slug}.md`
- After all 7 deep dives: compare findings against calibration assumptions. If specs differ from what the calibration script assumed, update calibration and rescore (this is expected and healthy — happened for faucets, dishwashers, refrigerators)
