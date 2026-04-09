# Toilets — Phase 1 Research Queries (prompt_a)
## Category Onboarding — Pass 1 through Pass 4

**Scope:** Residential toilets — one-piece, two-piece, wall-hung, smart/bidet toilets. NOT commercial/industrial, NOT urinals, NOT portable.

**Run these four queries in Perplexity (sonar-deep-research / sonar-pro) in order. Review all four outputs together before building config.**

**Pool S:** MaP Testing (Maximum Performance Testing) — the only independent, standardized, repeatable flush performance test in North America. Tests bulk waste removal using soybean paste media at 350g, 500g, 750g, 1000g increments. Published results for 3,000+ toilet models.

**Naming:** `prompt_a` = research queries (this file). `prompt_b` = per-product deep dive prompts (built after config).

---

## Pass 1 — Landscape Survey

```
Who independently tests residential toilets and what do they measure?

I'm building a product intelligence platform that scores residential toilets on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything.

Specifically:

1. What standardized tests exist for residential toilets? (list relevant standards bodies — ASME A112.19.2/CSA B45.1, ASME A112.19.14 for six-liter toilets, WaterSense EPA certification, MaP Testing protocol, IAPMO, UPC, IPC, CAN/CSA-B45 series, CalGreen, any others)

2. What are the measurable performance specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium (TOTO Neorest, Kohler Veil, Duravit SensoWash) and builder-grade (American Standard Cadet, Glacier Bay, Project Source)? Think: MaP flush score (grams of waste removed per flush — 350g to 1000g+ range), water consumption (gallons per flush — 1.28 GPF WaterSense to 1.6 GPF standard to 0.8 GPF dual-flush low), bowl cleanliness (% clean after single flush — some brands test this), noise (dB during flush cycle), trap diameter (inches — 2" standard to 2-1/8" to 2-3/8" fully glazed), trapway glazing quality, rinse coverage (% of bowl surface contacted by water).

3. Who does independent comparative testing? (MaP Testing program at Veritec Consulting, Consumer Reports toilet flushing/clogging/cleaning tests, WaterSense independent lab testing for EPA, J.D. Power bathroom fixtures, any reviewers doing physical teardowns or side-by-side flush testing — someone doing the equivalent of what StarCraft Reviews does for faucets)

4. What reliability data exists in the public domain? (toilet failure rates, flapper/fill valve/flush valve replacement frequency, wax ring failure data, service call data, warranty claim rates by brand)

5. What are the key construction differentiators between premium and builder-grade toilets? (vitreous china body quality — firing temperature and density, single-piece vs two-piece construction, concealed trapway vs exposed, skirted vs non-skirted bowl, glazing type — TOTO CeFiONtect/Kohler CleanCoat/American Standard EverClean vs standard glaze, flush mechanism — gravity-fed vs pressure-assisted vs vacuum-assisted vs washdown, tank internals — Fluidmaster vs proprietary fill/flush valves, seat quality — soft-close hardware)

6. Are there any independent reviewers doing physical teardowns or side-by-side component analysis of toilets — someone doing the equivalent of what StarCraft Reviews does for faucets? Does anyone independently measure trapway cross-section, glazing thickness, or china density?
7. What is the relationship between ASME A112.19.2 compliance testing and real-world flush performance? Does passing the 350g ASME minimum correlate with consumer satisfaction, or is there a much higher threshold (like MaP 600g+) that separates "adequate" from "good"?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

**Save output as:** `knowledge/toilets/toilets_testing_framework.md`

---

## Pass 2 — Component Deep Dive

**Purpose:** Go inside the products. Name the component suppliers, map the platform sharing, understand the failure modes at part level.

```
I'm building an independent product intelligence platform that scores residential toilets at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails.

FLUSH MECHANISM & VALVE SYSTEMS:
- Who manufactures the flush valves and fill valves used by each major toilet brand? (Fluidmaster — dominant aftermarket and OEM supplier, Korky/Lavelle Industries, Geberit — European dual-flush mechanisms and in-wall carriers, TOTO proprietary Unifit system, Kohler AquaPiston/Revolution 360, American Standard Champion flush valve — name the specific mechanism for each brand)
- What are the specific flush valve designs? Flapper (standard — 2" or 3" — larger flapper = faster water delivery = better flush), canister/tower (Kohler AquaPiston — 360° water entry), piston (American Standard Champion 4 — 4" flush valve), dual-flush button (Geberit, TOTO), electronic flush (smart toilets)?
- What flush valve diameter creates meaningful performance differentiation? 2" standard flapper vs 3" flapper (Kohler, TOTO) vs 4" piston (American Standard Champion) — is there a measurable performance difference in MaP scores correlated with valve size?
- Fill valve suppliers: Fluidmaster 400A (dominant, universal replacement), Korky QuietFILL, TOTO proprietary, Kohler proprietary — which brands use which? What is the service life difference?
- Documented failure modes for flush mechanisms: flapper degradation timeline (standard rubber vs silicone — 3-5 yrs vs 7-10 yrs?), canister seal failure, fill valve hiss/running toilet, flush valve seat corrosion, dual-flush button jamming, electronic flush board failure (smart toilets)

CHINA BODY & CONSTRUCTION:
- Vitreous china manufacturing: Who fires at what temperature? TOTO (Kitakyushu + Morrow GA + Lakewood GA — ~1200°C+ high-fire), Kohler (Kohler WI — premium line, outsourced lines?), Duravit (Hornberg Germany + Egypt + Tunisia), Lixil/American Standard/Grohe (multiple global factories), Roca, Villeroy & Boch — what is the relationship between firing temperature, china density, and long-term durability?
- Single-piece vs two-piece construction: is single-piece genuinely more durable (no tank-to-bowl gasket failure point, no bolt corrosion) or primarily aesthetic? Are there structural performance differences measurable by plumbers?
- Glazing technology: TOTO CeFiONtect (zirconium-based nano-glaze — ionic barrier prevents waste adhesion), Kohler CleanCoat, American Standard EverClean (antimicrobial silver-ion), Duravit HygieneGlaze 2.0 (antimicrobial — active ingredient?), CEFIONTECT vs standard glaze in long-term toilet bowl cleanliness — is there comparative data?
- Trapway design: fully glazed trapway (smooth internal surface — reduces clogging), partially glazed (standard — rougher, catches waste), concealed/skirted trapway (aesthetic only or functional?). What is the interior diameter measurement by brand? 2" standard, 2-1/8" (TOTO), 2-3/8" (some commercial models)?
- Wall-hung toilet carrier systems: Geberit Duofix is the dominant carrier frame (hidden in wall). Grohe Rapid SL, TOTO in-wall carrier. Are carriers interchangeable with bowls from other brands? What fails — bowl connection gasket, carrier frame bolts, concealed flush plate mechanism?

SEAT & HARDWARE:
- Seat hinge types: standard metal bolt (rust), plastic bolt (no rust, weaker), concealed quick-release (premium — easy cleaning), SoftClose/slow-close damper — who makes the dampers? Blum (as in cabinets) or toilet-specific suppliers?
- Smart toilet components: bidet wash nozzle material (stainless vs ABS), water heater type (tankless instant vs reservoir — TOTO uses instant), deodorizer type (carbon filter vs catalytic), auto-open/close lid — motor supplier and failure rates, dryer effectiveness (air temp + CFM)

PLATFORM SHARING — SPECIFIC COMPONENT MAP:
- TOTO: Does the Drake (Tier 2-3 workhorse) share the same flush valve mechanism as the UltraMax? Is the Neorest bidet mechanism the same platform as the Washlet seat? Which TOTO models share the TORNADO FLUSH system vs the older Double Cyclone?
- Kohler: Which models use AquaPiston vs Revolution 360 vs standard flapper? Is the Veil intelligent toilet's bidet system developed in-house or sourced? Kohler Numi vs Veil — same tech platform?
- Lixil Group (American Standard, Grohe, INAX): Which American Standard models share INAX technology? Champion 4 flush valve — is this genuinely different hardware or a marketing distinction? Does Grohe's Sensia bidet toilet use INAX wash technology?
- Geberit: Dominates in-wall carrier systems AND dual-flush mechanisms. Which brands OEM Geberit flush internals? Carrier frame compatibility matrix?
- Roca/Villeroy & Boch: European brands — are they using Geberit flush mechanisms or proprietary?

PARTS & SERVICE ECOSYSTEM:
- Fluidmaster universal compatibility: can Fluidmaster 400A/502 replace proprietary fill/flush valves in TOTO, Kohler, American Standard? Which brands have proprietary parts that CANNOT be replaced with aftermarket?
- TOTO Unifit adapter system: allows swapping TOTO toilets without moving rough-in. Is this genuinely useful or marketing?
- Common toilet repairs and cost: flapper replacement ($5-15 DIY), fill valve replacement ($15-30 DIY, $100-150 pro), wax ring/gasket replacement ($10-20 part, $150-250 pro installed), flush handle/trip lever ($10-25), bidet seat component replacement (nozzle assembly, control board — $200-600+)?
- Which toilet brands have the highest DIY repairability? Which require proprietary tools or parts?
- Smart toilet repair ecosystem: TOTO Washlet has field-replaceable modules? Kohler Veil/Numi — are components modular or is the entire unit replaced?

Prioritize sources from: plumber communities (r/Plumbing, Plbg.com forums, Terry Love plumbing forum), MaP Testing database, supply house catalogs (Ferguson, SupplyHouse.com), WaterSense certified product listings, Consumer Reports, repair/teardown content. Cite all sources.
```

**Save output as:** `knowledge/toilets/toilets_component_analysis.md`

---

## Pass 3 — Competitive Hierarchy: Top

**Purpose:** Establish where the top brands sit relative to each other.

```
How do professionals rank the top residential toilet brands against each other?

Specifically comparing TOTO (Neorest, Ultramax II, Drake), Kohler (Veil, Numi, Highline, San Souci), Duravit (Starck 3, SensoWash, ME by Starck), and any other brands that plumbers and bathroom designers consistently place at the top.

Focus on professional plumber opinions, independent flush performance data (especially MaP Testing scores), and construction-level differences — not marketing claims. What do plumbers who install and service these products daily say about relative quality?

I'm interested in: flush performance (MaP scores, clog frequency, bowl cleanliness), china body quality and durability, trapway design (glazed vs partially glazed, diameter), glazing technology longevity (CeFiONtect vs competitors), internal valve reliability (which ones run, which ones don't), ease of installation, parts availability for repairs, smart toilet reliability (TOTO Washlet vs Kohler bidet toilets), and overall plumber preference when asked "if it were your house, what would you install?"

Where does TOTO actually stand vs Kohler in the eyes of working plumbers? Is the Neorest worth the premium over a Drake + Washlet? Does Duravit's European engineering translate to better real-world performance in US installations?

MaP Testing data should be the primary performance reference — it's the only standardized, repeatable, independent flush test.
```

**Save output as:** `knowledge/toilets/toilets_hierarchy_top.md`

---

## Pass 4 — Competitive Hierarchy: Middle and Bottom

**Purpose:** Establish where the line falls between good and mediocre, and what sits at the floor.

```
Where do professionals draw the line between a good residential toilet and a mediocre one? Which brands sit on that line?

Specifically: How do plumbers and bathroom contractors rank American Standard (Champion, Cadet, Vormax, Colony), Gerber (Viper, Avalanche), Mansfield (Denali, Summit), Swiss Madison, WoodBridge, DeerValley (Amazon/DTC brands), Glacier Bay (Home Depot house brand), Project Source (Lowe's house brand), and any other mid-to-low-tier toilet brands?

I need: MaP Testing scores where available, professional plumber opinions on flush quality and reliability, known design or manufacturing problems by brand (cracking, running toilets, weak flushes, difficult repairs), which brands plumbers actively warn against, and where the floor of acceptable quality sits.

Focus on the line between "good enough for a quality bathroom" and "builder-grade filler that'll need replacing." What brands do plumbers refuse to install? What brands do they see on the most service calls? Which Amazon/DTC brands (WoodBridge, Swiss Madison, DeerValley with 10,000+ reviews and 4.7 stars) are actually competent products vs marketing machines?

The MaP Testing database should ground this — if a brand consistently scores below 600g MaP, that's a material performance concern regardless of Amazon ratings. What's the MaP performance spread across builder-grade vs mid-tier?

Also: what is the plumber consensus on the current American Standard product line post-Lixil acquisition? Has quality changed under Lixil vs the old American Standard?
```

**Save output as:** `knowledge/toilets/toilets_hierarchy_bottom.md`

---

## Calibration Product Candidates (Pre-Research)

Pending confirmation after research results reviewed:

| Tentative Tier | Brand/Product | Notes |
|---|---|---|
| Tier 1 | TOTO Neorest NX2 / AH | Smart toilet benchmark, Tornado Flush + CeFiONtect + integrated bidet, Japan manufacturing |
| Tier 1 | TOTO Ultramax II | One-piece, Tornado Flush, CeFiONtect, 1.28 GPF WaterSense, plumber consensus workhorse |
| Tier 2 | Kohler Highline / San Souci | AquaPiston canister flush, decent MaP scores, strong parts ecosystem |
| Tier 3 | American Standard Champion 4 | 4" flush valve, strong MaP scores (1000g), two-piece value, Lixil parent |
| Tier 3-4 | Gerber Viper or Swiss Madison | Mid-market — plumber opinion varies, MaP data available for Gerber |
| Tier 4 | Glacier Bay / Project Source | Big box house brands, builder-grade, minimal MaP data expected |

**Scope:** Residential toilets. No commercial, no urinals.

**Pool S:** MaP Testing (Veritec Consulting) — independent flush performance testing using standardized soybean paste media. 3,000+ models tested. The only repeatable, independent comparative performance test for toilets.

**Axis weight hypothesis (pre-research):**
- Quality: 0.35 — China body construction, glazing technology, trapway design, manufacturing precision (TOTO fires at higher temps, single-piece vs two-piece)
- Durability: 0.35 — Flush mechanism reliability, valve replacement frequency, china longevity, parts ecosystem, DIY repairability
- Performance: 0.30 — MaP flush score, bowl cleanliness, noise, water efficiency. NOT flat — MaP scores range from 350g to 1000g+. Real continuous metric spread.

*Note: Axis weights are hypothesis. Research may reveal Performance is more dominant (if MaP spread is the primary professional organizing principle) or Durability is more important. Confirm after reviewing Pass 1-2.*

---

*Run these four queries in Perplexity in order. Review all four outputs together before building config.*
