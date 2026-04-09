# The Residentialist — Windows Category Research Queries
## Residential Windows — Double-Hung, Casement, Fixed, Sliding, Awning
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
Who independently tests residential windows and what do they measure?

I'm building a product intelligence platform that scores residential windows on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything. Residential replacement and new-construction windows — double-hung, casement, fixed, sliding, awning configurations.

Specifically:

1. What standardized tests exist for residential windows? (AAMA/WDMA/CSA 101/I.S.2/A440 — what does it actually test? NFRC 100/200/500 for thermal and solar performance. ASTM E283 air infiltration, ASTM E331 water penetration, ASTM E330 structural wind load, ASTM E547 cyclic pressure water, ASTM E1886/1996 impact resistance. AAMA 910 voluntary lifecycle specification. DP rating system — what do the numbers mean in practice?)

2. What are the measurable performance specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium (Marvin Ultimate, Loewen, Sierra Pacific) and builder-grade (JELD-WEN Builders Vinyl, Ply Gem)? Think: U-factor, SHGC, VT, condensation resistance (CRF), air infiltration rate (CFM/ft²), DP rating, sound transmission class (STC), UV transmittance, forced-entry resistance.

3. Who does independent comparative testing? (Consumer Reports window ratings, NFRC certified product directory, ENERGY STAR Most Efficient list, building science professionals: Matt Risinger/Build Show, Building Science Corporation/Joe Lstiburek, GBA/Martin Holladay, Fine Homebuilding testing, any labs doing side-by-side thermal or durability testing)

4. What reliability data exists in the public domain? (J.D. Power window satisfaction surveys, class-action lawsuit history by brand, building envelope failure databases, home inspector consensus on brands to avoid, warranty claim rates where published, contractor forums on seal failure rates, balance system failure rates by brand)

5. What are the key construction differentiators between premium and builder-grade windows? (frame material: solid wood, clad wood, fiberglass, cellular PVC, extruded vinyl, roll-form aluminum. Glass packages: triple-pane vs dual, argon vs krypton, Low-E coating positions, warm-edge spacer technology — Intercept vs Super Spacer vs TPS vs stainless vs aluminum. Weatherstripping type. Hardware engineering. Sash balance technology. Corner joint method: fusion-welded vs mechanically fastened vs mortise-and-tenon)

6. Are there any independent reviewers doing physical comparisons or side-by-side analysis of residential windows? (Matt Risinger teardowns, The Window Dog, Chris VanAcker/StarCraft Custom Builders, any building science professionals who have done controlled thermal imaging comparisons or water/air testing across brands?)

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

**Save output as:** `knowledge/windows/windows_testing_framework.md`

---

## Pass 2 — Component Deep Dive (Query 2)

**Purpose:** Go inside the products. Name the component suppliers, map the platform sharing, understand the failure modes at part level.

```
I'm building an independent product intelligence platform that scores residential windows at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails.

GLASS PACKAGES (IGU — INSULATING GLASS UNIT):
- Who manufactures the IGUs for each major brand? (Cardinal Industries, Vitro/PPG, AGC, Guardian, in-house)
- Cardinal LoE-180, LoE-272, LoE-340, LoE-366 — which coating does each brand use? Can the consumer specify?
- Triple-pane adoption: which brands offer triple standard, which as an option, which not at all?
- Gas fill: argon vs krypton vs xenon. Gas retention rates over 10/20 years — any published data?
- Warm-edge spacer technology by brand: Intercept (PPG/Vitro), Super Spacer (Quanex), TPS (Thermoplastic Spacer), stainless steel, aluminum. Which is the documented best performer for seal longevity?
- Documented IGU seal failure rates by brand/spacer type? Average years to seal failure?
- Glass thickness: 3mm vs 4mm vs tempered — what does each brand use by default?

FRAME MATERIALS & CONSTRUCTION:
- Solid wood interior species by brand: pine, Douglas fir, mahogany, vertical-grain Douglas fir, alder — who uses what?
- Exterior cladding: extruded aluminum (Marvin, Andersen), roll-form aluminum (budget), fiberglass (Pella Impervia, Marvin Ultrex, Milgard), cellular PVC. Cladding thickness by brand?
- Fiberglass pultrusion: Marvin Ultrex (proprietary), Pella Impervia, Milgard — are these the same fiberglass compound? Resin system differences?
- Vinyl extrusion: who manufactures the vinyl compounds? Fusion-welded corners (JELD-WEN, Milgard, Ply Gem) vs mechanically fastened. Number of chambers in vinyl profile by brand?
- Corner joint construction: mortise-and-tenon (wood), fusion-welded (vinyl), mitered/bonded (fiberglass), mechanically fastened — longevity comparison?
- Known frame failure modes: vinyl warping/melting near dark surfaces, wood rot behind cladding, fiberglass cracking at stress points, aluminum thermal bridging?

HARDWARE & OPERATING MECHANISMS:
- Who manufactures window hardware? (Truth Hardware/AmesburyTruth, Ashland Hardware, Caldwell Manufacturing, Roto North America, Amesbury)
- Sash balance systems: block-and-tackle (AmesburyTruth), coil spring, constant-force, channel balance — which brands use which? Known failure modes?
- Lock hardware: cam-lock, push-out bar, multi-point locking — supplier and quality tier by brand?
- Casement operators: folding arm vs push-out vs slide? Which manufacturer? Gear failure rates?
- Operator and hardware materials: stainless steel vs zinc die-cast vs Nylon — which brands use which?

WEATHERSTRIPPING & AIR SEALS:
- Weatherstripping types: bulb seal, compression seal, fin seal, foam-filled bulb, Q-lon — who uses what?
- Which brands double-seal vs single-seal? Triple-seal?
- What's the rated air infiltration spread between best and worst? (CFM/ft² at 25 mph)
- Weatherstripping replacement: user-serviceable or requires professional/factory service?

PLATFORM SHARING — SPECIFIC COMPONENT MAP:
- Andersen Corporation: Andersen, Renewal by Andersen — shared components? Same factory?
- JELD-WEN: JELD-WEN, Siteline — what's shared vs differentiated? AuraLast wood treatment — real or marketing?
- Marvin: Ultimate, Elevate, Essential — how much platform sharing between lines? Same factory (Warroad MN)?
- Pella Corporation: Pella Reserve, Architect, Lifestyle, 250, Encompass — which share frames/glass/hardware?
- MI Windows (PGT): known OEM for builder-grade. Any premium brands sourcing from MI?
- Milgard (MI subsidiary): factory locations and quality tier?
- Ply Gem/MITER Brands: who else does Ply Gem make windows for? 

MANUFACTURING & QUALITY:
- Which brands maintain single-factory production? (Marvin: Warroad MN, Loewen: Steinbach Manitoba, Sierra Pacific: Red Bluff CA)
- Which brands are multi-plant and is there quality variance? (Andersen, JELD-WEN, Pella)
- ISO 9001 certification status by brand?
- Custom vs stock sizing: which brands manufacture true custom vs cut-down stock?
- Lead times: who delivers in weeks vs months?

Prioritize sources from: building science professionals, contractor communities, home inspector forums, window industry trade publications (Window & Door, DWM), manufacturer spec sheets, installation guides. Cite all sources.
```

**Save output as:** `knowledge/windows/windows_component_analysis.md`

---

## Pass 3 — Competitive Hierarchy: Top (Query 3)

**Purpose:** Establish where the top brands sit relative to each other.

```
How do professionals rank the top residential window brands against each other?

Specifically comparing Loewen, Marvin Ultimate (formerly Integrity), Sierra Pacific, Pella Reserve/Architect, Andersen E-Series/A-Series, and Kolbe Ultra/Heritage. What separates the best from the merely excellent?

Focus on professional installer opinions, building science expert analysis (Matt Risinger, Building Science Corporation, Fine Homebuilding), independent service/reliability data, and construction-level differences — not marketing claims. What do contractors, building science professionals, architects, and window installers who work with these products daily say about relative quality?

I'm interested in: frame material and construction quality, IGU performance and longevity, hardware durability, seal integrity over 10-20 years, warranty terms and execution (what's actually covered vs excluded, transferability, claim process), parts and service availability, known defects or class-action history, and suitability for high-performance building envelopes.

Premium residential windows only — I'm looking at the $800-2000+ per unit range.
```

**Save output as:** `knowledge/windows/windows_hierarchy_top.md`

---

## Pass 4 — Competitive Hierarchy: Middle and Bottom (Query 4)

**Purpose:** Establish where the line falls between good and mediocre, and what sits at the floor.

```
Where do professionals draw the line between a good residential window and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank Andersen 200/400 Series, Pella 250/Lifestyle, Milgard Tuscany/Trinsic, JELD-WEN Siteline/Builders Vinyl/V-2500, Ply Gem Pro Series, Simonton, PGT WinGuard, Harvey, and Alside in the professional hierarchy?

I need: reliability/service data where available, professional installer and contractor opinions on construction quality, known structural or seal failure problems by brand, class-action lawsuits and their outcomes, which brands professionals actively warn against, and where the floor of acceptable quality sits for residential windows.

Focus on the line between "good enough for a quality home" and "builder-grade filler that will fail in 10 years." What brands do contractors, home inspectors, and building science professionals refuse to specify? What brands do home inspectors see the most seal failures on? Which vinyl windows are known to warp near dark-colored surfaces?

Include ENERGY STAR and NFRC data where it demonstrates the performance gap between mid-tier and bottom-tier. I need the professional consensus, not the marketing tier.
```

**Save output as:** `knowledge/windows/windows_hierarchy_bottom.md`

---

## Calibration Product Candidates (Pre-Research)

Pending confirmation after research results reviewed:

| Tentative Tier | Brand | Notes |
|---|---|---|
| Tier 1 | Loewen | Canadian premium, full wood + aluminum clad, VG Doug Fir |
| Tier 1 | Marvin Ultimate | Heritage US manufacturer, Ultrex fiberglass + wood |
| Tier 1-2 | Sierra Pacific | Solid wood, US manufacturing (Red Bluff CA) |
| Tier 2 | Pella Architect/Reserve | Premium Pella lines — needs platform sharing confirmation |
| Tier 2-3 | Andersen 400/E-Series | Huge market share — needs hierarchy confirmation |
| Tier 3 | Milgard Tuscany | MI Windows subsidiary, vinyl — needs quality confirmation |
| Tier 4 | JELD-WEN Builders Vinyl | Builder-grade benchmark — class-action history |
| Tier 4-5 | Ply Gem | MITER Brands — documented quality concerns |

**Scope:** Residential replacement and new-construction windows. All operation types (DH, casement, fixed, sliding, awning).

---

*Run these four queries in order. Review all four outputs together before building config.*
