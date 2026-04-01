# Exterior Doors — Research Queries (Pass 1-4)
## Category Onboarding — Phase 1

---

## Pass 1 — Landscape Survey

Who independently tests residential exterior doors and what do they measure?

I'm building a product intelligence platform that scores residential exterior doors on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything.

Specifically:

1. What standardized tests exist for residential exterior doors? I need the standards body names and test designations — ASTM, AAMA, NFRC, WDMA, ADA, IBC, ANSI, NAFS, ENERGY STAR, Florida Product Approval. Which tests apply specifically to entry doors vs patio doors vs French doors?

2. What are the measurable performance specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. Specifically looking for:
   - Air infiltration rates (cfm/ft²) — what's the spread between premium and builder-grade?
   - Water resistance ratings (psf) — AAMA/WDMA/CSA testing
   - Structural load ratings (DP rating in psf) — design pressure, what's the range?
   - U-factor (NFRC-certified) — what's the range for fiberglass vs steel vs wood exterior doors?
   - SHGC for doors with glass panels
   - Sound Transmission Class (STC) — what differentiation exists between door materials and construction?
   - Forced entry resistance — UL 325, ASTM F476, any standardized break-in resistance testing?
   - Hardware cycle testing ratings for hinges, locksets, multipoint locks
   - Finish/coating longevity (UV resistance, chalking, fading) — any standardized artificial weathering tests?

3. Who does independent comparative testing? Think Consumer Reports, independent labs, building science experts doing side-by-side analysis, anyone doing teardowns or cross-brand comparisons of exterior doors. Who is the equivalent of Matt Risinger (windows), StarCraft Reviews (faucets), or Yale Appliance (dishwashers) for doors?

4. What reliability data exists in the public domain? Service rates, common failure modes tracked by anyone, warranty claim data, installer consensus on which brands hold up and which don't?

5. What are the key construction differentiators between premium and builder-grade exterior doors?
   - Fiberglass vs steel vs solid wood vs wood with fiberglass/aluminum cladding
   - Core materials: polyurethane foam vs polystyrene vs solid wood
   - Weatherstripping systems: compression vs magnetic vs fin-seal
   - Threshold construction: adjustable vs fixed, aluminum vs composite vs brass
   - Lock/hardware quality: multipoint lock systems, hinge types (ball-bearing vs plain), strike plate construction
   - Glass panel construction: SDL vs GBG vs true divided lite, glass package quality in door lites
   - Sill pan and drainage systems

6. Are there any independent reviewers doing physical teardowns, cross-sectional cuts, or side-by-side component analysis of exterior doors? This would be equivalent to what StarCraft Reviews does for faucets — physically cutting products open to compare construction.

7. What about the premium brands — Marvin, Kolbe, Loewen, Pella Reserve, Simpson Door Company, TruStile, Baldwin Hardware, weather-rated iron doors (Clark Hall, IronDoorsByPIPE), pivot doors? Is there a professional installer or architect community that ranks these against each other?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.

**Save output as:** `knowledge/exterior_doors/exterior_doors_testing_framework.md`

---

## Pass 2 — Component Deep Dive

I'm building an independent product intelligence platform that scores residential exterior doors at the component level. I've already mapped the testing landscape and general brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails.

DOOR CORE AND SLAB CONSTRUCTION:
- Fiberglass door slab manufacturers: Who actually makes the fiberglass skins? Therma-Tru (Fortune Brands), Masonite, JELD-WEN, Plastpro — are there other fiberglass skin suppliers, or do these 4 companies supply everyone including private label?
- Steel door slab construction: What gauge steel is used across brands? 24-gauge vs 22-gauge vs 20-gauge — which brands use which? What's inside the slab — polyurethane foam density varies how much?
- Wood door construction: Which companies still make solid wood exterior doors? Simpson Door Company, TruStile, JELD-WEN IWP (formerly International Wood Products) — are there others? What wood species are used (mahogany, alder, Douglas fir, white oak) and do they actually matter for exterior durability?
- Iron/steel decorative doors: Who manufactures the iron entry doors (Clark Hall, First Impression Ironworks, Iron Doors Plus, Universal Iron Doors)? What gauge steel, what welding methods, what's the actual hardware inside them? Are these custom or assemblies?
- Fiberglass skin quality: AccuGrain (Therma-Tru), Masonite HDG (Heritage Design Glass), JELD-WEN fiberglass grain patterns — is there a measurable quality difference in the fiberglass molds? How does wood grain depth and realism vary?
- Foam core insulation: R-value spread across door types. What specific polyurethane and polystyrene formulations are used? HFC vs HFO blowing agents in foam? Does foam core quality degrade over time in real installations?

WEATHERSTRIPPING AND SEALING SYSTEMS:
- Weatherstrip suppliers: Who makes the weatherstripping used by major door manufacturers? Is Schlegel (now Quanex) still the dominant supplier? Q-Lon, compression bulb, magnetic — which technology works best long-term?
- Corner pad sealing: The #1 failure point in exterior door water intrusion is corner pads where the weatherstrip meets the threshold. Which brands have solved this with continuous sealing vs butt joints?
- Adjustable threshold systems: Who makes them? How do they compare? Endura Products (owned by Quanex) makes the vast majority of residential thresholds — is this true? Which premium brands use their own threshold design vs Endura?
- Sill pan drainage: Which brands include sill pans, which require aftermarket? What's the failure mode when sill pans are absent?

HARDWARE AND LOCKING SYSTEMS:
- Multipoint lock suppliers: Who makes the multipoint lock mechanisms used in premium doors? GU (Gretsch-Unitas), Fuhr, Winkhaus, Hoppe, Amesbury Truth — which brands use which suppliers? Cycle life ratings?
- Entry handleset manufacturers: Baldwin (Spectrum Brands), Emtek (ASSA ABLOY), Schlage (Allegion), Kwikset (Spectrum Brands), Ashley Norton, Rocky Mountain Hardware — what's the construction difference between cast brass/bronze, forged, and die-cast zinc handlesets? Which ones use real brass/bronze vs zinc die-cast with plated finish?
- Hinge quality: NRP (non-removable pin) hinges, ball-bearing vs plain bearing, stainless steel vs steel, ANSI/BHMA A156.1 grade ratings — what grade do builder-grade vs premium doors ship with? Who supplies the hinges?
- Smart lock integration: How do entry doors accommodate smart locks (Baldwin Evolved, Schlage Encode, Yale Assure) — does the door prep matter for reliability?

GLASS AND GLAZING IN DOORS:
- Who makes the decorative glass inserts (door lites)? ODL, Western Reflections (Masonite), Therma-Tru glass options — are these different suppliers or all from the same glass fabricators?
- Internally glazed vs externally glazed: Which is better for exterior doors? Premium brands tout internal glazing — is there measurable performance data?
- Low-E coatings and gas fills in door glass: Do door lites get the same glass packages as windows (argon-filled, Low-E)? Or are they typically lesser?

PLATFORM SHARING — SPECIFIC COMPONENT MAP:
- Fortune Brands Innovations: Therma-Tru, Master Lock, Moen, Fiberon — does Therma-Tru share any component suppliers with Moen?
- Masonite International: What's their actual manufacturing footprint? They make doors AND glass panels — vertically integrated?
- JELD-WEN: Massive door manufacturer — do they make fiberglass skins in-house or source from Therma-Tru/Masonite? JELD-WEN bought IWP (International Wood Products) — is IWP wood quality maintained?
- Marvin/Kolbe/Loewen: These make primarily windows — are their door products using the same frame and finish systems as their windows? Or are doors an afterthought?
- Big box private label: Reliabilt (Lowe's, JELD-WEN manufactured), American Craftsman (Home Depot, Andersen manufactured for windows — who makes their doors?), Steves & Sons — which brands are genuinely different products vs relabeled commodity?

PARTS AND SERVICE ECOSYSTEM:
- Weatherstrip replacement: Can homeowners replace weatherstripping on most brands easily, or do some use proprietary profiles?
- Hardware replacement: Which door brands use standard bore patterns that accept aftermarket hardware? Which have proprietary mounting?
- Glass panel replacement: If a door lite breaks, can you replace just the glass or does the entire slab need replacement? Which brands offer field-replaceable glass panels?
- Finish refresh: Can fiberglass and steel doors be refinished/repainted? How does this compare to wood door refinishing requirements?

Prioritize sources from: door installer communities, building science forums (GBA, FHB), contractor communities (r/Carpentry, r/HomeImprovement), door hardware specialists, weatherstripping and threshold suppliers (Endura/Quanex spec sheets), Consumer Reports, building performance testing reports. Cite all sources.

**Save output as:** `knowledge/exterior_doors/exterior_doors_component_analysis.md`

---

## Pass 3 — Competitive Hierarchy: Top

How do professionals rank the top residential exterior door brands against each other?

Specifically comparing Marvin (Signature Ultimate door), Kolbe (VistaLuxe door), Loewen, Simpson Door Company (solid wood), TruStile (modern doors), Pella (Reserve/Architect Series), Therma-Tru (Classic Craft, Fiber-Classic), and any premium-tier door brands that architects and high-end builders consistently specify.

What separates the best exterior doors from the merely excellent? I'm looking at:
- Slab construction quality and materials (solid wood vs fiberglass vs hybrid)
- Weatherstripping and sealing system quality
- Hardware quality (who ships with the best factory hardware?)
- Glass panel quality and options
- Finish durability and refinishability
- Custom options and lead times
- Warranty terms and backing entity strength
- Professional installer and architect preference — who do they specify for $2-5M+ homes?

Also: Iron and steel decorative entry doors — Clark Hall, First Impression Ironworks — where do these sit in the hierarchy? Are they premium construction or decorative only?

And pivot doors — are these their own subcategory or do they follow the same hierarchy?

Focus on professional installer opinions, architect specifications, independent testing data, and construction-level differences — not marketing claims. What do professionals who install and service exterior doors daily say about relative quality? What do high-end builders default to when they want the best door available?

**Save output as:** `knowledge/exterior_doors/exterior_doors_hierarchy_top.md`

---

## Pass 4 — Competitive Hierarchy: Middle and Bottom

Where do professionals draw the line between a good residential exterior door and a mediocre one? Which brands sit on that line?

Specifically: How do professional installers and contractors rank Therma-Tru (Benchmark, Smooth-Star — builder lines), Masonite (Performance Door System, Solidoor), JELD-WEN (Builders Series, Siteline), Steves & Sons, Reliabilt (Lowe's), Feather River Doors (Home Depot — now discontinued?), American Craftsman (Home Depot), Plastpro, Novatech, and any other mid-to-low-tier exterior door brands?

I need: professional installer opinions on build quality and durability by brand, known failure modes at each tier (warping, water intrusion, weatherstrip failure, finish deterioration, hardware failure), which brands contractors actively warn against, and where the floor of acceptable quality sits for an exterior entry door.

Focus on the line between "good enough for a quality home" and "builder-grade filler that'll need replacing within 10 years." What brands do pros refuse to install? What do they see on the most service/callback calls?

Specific questions:
- Steel doors: What gauge separates "real" from commodity? Who makes genuinely good steel doors? Is Therma-Tru Smooth-Star the floor or below it?
- Fiberglass doors: Is Therma-Tru Benchmark significantly worse than Classic Craft? How does Masonite fiberglass compare?
- Builder-grade wood doors: Do any exist that aren't terrible? Or is wood exterior = premium only?
- Big box doors: Are Reliabilt, American Craftsman, Steves & Sons the same product in different packaging, or genuinely different quality tiers?
- Home improvement store vs specialty dealer: Does the same brand (Therma-Tru, Masonite, JELD-WEN) ship different quality to Home Depot vs a dealer showroom? (This is a key question — same brand name, different product?)

What is the contractor consensus on JELD-WEN quality trajectory? Their 2020s class-action lawsuit over AuraLast wood — did that affect their reputation with installers? Is JELD-WEN door quality now different from JELD-WEN window quality?

Also: Where does Pella fit in the door market? Their windows span Tier 1 through Tier 3 depending on series. Do Pella doors follow the same hierarchy (Reserve = premium, 250 = builder) or are they all mid-tier?

**Save output as:** `knowledge/exterior_doors/exterior_doors_hierarchy_bottom.md`

---

## Calibration Product Candidates (Pre-Research)

Pending confirmation after research results reviewed:

| Tentative Tier | Brand/Product | Notes |
|---|---|---|
| Tier 1 | Marvin Signature Ultimate Entry Door | Aluminum-clad wood, best-in-class craftsmanship if door quality matches window reputation |
| Tier 1 | Simpson Door Company (solid wood) | Premium solid wood, one of the last remaining wood door specialists |
| Tier 2 | Therma-Tru Classic Craft (fiberglass) | Top-of-line fiberglass from the largest door manufacturer, AccuGrain premium skin |
| Tier 3 | Masonite Performance Door System | Mid-market entry, newer Performance line pushes weatherstrip innovation |
| Tier 3-4 | JELD-WEN Premium Steel | Mid-market steel, post-AuraLast lawsuit reputation |
| Tier 4 | Reliabilt (Lowe's steel/fiberglass) | Builder-grade big box, JELD-WEN manufactured |

**Scope:** Residential exterior entry doors (front door, side entry). Includes fiberglass, steel, solid wood, iron/decorative. Excludes garage doors, sliding patio doors (those may become a separate category), storm doors.

**Pool S candidates (pre-research):** Unknown — this category may not have a dominant independent testing authority like faucets (StarCraft), countertops (Karin Kirk), or dishwashers (Yale Appliance). If no clear Pool S exists, note that in config.

**Axis weight hypothesis (pre-research):**
- Quality: 0.40 — Slab construction, hardware quality, glass quality, manufacturing precision. The primary differentiator between a $200 steel slab and a $5,000 custom wood door is construction quality.
- Durability: 0.35 — Weatherstripping longevity, finish weathering, hardware cycle life, structural integrity over time, warranty reality. Exterior doors face constant weather exposure — durability matters more here than for most product categories.
- Performance: 0.25 — Air infiltration, water resistance, thermal performance (U-factor), sound, forced entry resistance. Not flat — there is real performance spread — but quality and durability dominate the professional hierarchy.

*Note: Axis weights are hypothesis. Research may shift these if Performance spread (e.g., air infiltration, water resistance) is larger than expected, or if Durability (weatherstrip/finish degradation) is the primary organizing principle. Confirm after reviewing Pass 1-2.*

---

*Run these four queries in Perplexity in order. Review all four outputs together before building config.*
