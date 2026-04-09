# Tile — Research Queries (prompt_a)

**Scope:** Residential porcelain and ceramic tile for floors, walls, showers, and backsplashes. NOT commercial/industrial paver, NOT natural stone (scored separately as countertops material class), NOT glass tile or mosaic-only decorative.
**Sub-types:** porcelain_floor, porcelain_wall, ceramic_floor, ceramic_wall, porcelain_large_format
**Methodology:** Porcelain and ceramic within one category. Key specs: PEI rating (surface abrasion resistance, ASTM C1027), water absorption % (ASTM C373 — defines porcelain vs ceramic boundary at 0.5%), DCOF slip resistance (ANSI A137.1 AcuTest). Performance axis has real spread — PEI Class 0-5, water absorption 0.01%-15%+, DCOF 0.20-0.90+. Porcelanosa appeared 39 times in luxury home listings.

---

## Pass 1 — Landscape Survey

```
Who independently tests residential porcelain and ceramic tile and what do they measure?

I'm building a product intelligence platform that scores residential tile (porcelain and ceramic) on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything.

Specifically:

1. What standardized tests exist for residential tile? (ANSI A137.1, ISO 10545 series, ASTM C373 water absorption, ASTM C1027 PEI abrasion, DCOF AcuTest slip resistance, ASTM C648 breaking strength, ASTM C1026 freeze-thaw, MOHS hardness scale — what do each of these actually test and what are the numeric ranges that create real differentiation?)

2. What are the measurable specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium European porcelain and builder-grade imported ceramic? (water absorption %, PEI class 0-5, DCOF value, breaking strength N, Mohs hardness, dimensional tolerance %, warpage %, rectification precision)

3. Who does independent comparative testing? (TCNA/IPA Laboratories, PTCA Porcelain Tile Certification Agency, Consumer Reports, independent tile reviewers, architect specification databases, NTCA — National Tile Contractors Association)

4. What reliability data exists in the public domain? (tile failure modes, installer callback patterns, cracking rates by material type, mortar bond failure data, freeze-thaw failure rates)

5. What are the key construction differentiators between premium and builder-grade tile? (clay body composition, firing temperature range, rectification process, digital printing technology, body composition vs glaze-only color, through-body porcelain vs surface-glazed)

6. Are there any independent reviewers doing physical testing or side-by-side material analysis — someone doing the equivalent of what StarCraft Reviews does for faucets? Any tile-specific teardown or testing channels?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

---

## Pass 2 — Component Deep Dive

```
I'm building an independent product intelligence platform that scores residential tile at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual manufacturing processes and material science inside these products.

PORCELAIN BODY COMPOSITION:
- What specific clay formulas differentiate premium porcelain? Feldspar content, kaolin ratios, firing temperatures (is there a real measurable difference between 1200°C, 1250°C, 1300°C in terms of final product density and water absorption)?
- Through-body porcelain (color extends through entire body) vs surface-glazed porcelain (white/gray body with printed surface) — which premium brands use through-body? What's the performance difference?
- How does body density (measured in kg/cm³ or via water absorption %) correlate with actual durability in residential use?

CERAMIC BODY COMPOSITION:
- Red body (terracotta-based) vs white body ceramic — which is higher quality? Does it matter for residential use?
- What water absorption range defines the practical boundary between "good ceramic" and "builder-grade ceramic"?

SURFACE TECHNOLOGY:
- Digital inkjet printing technology: which generation of print heads produce the most realistic stone/wood looks? (Kerajet, System, Durst, SACMI — who makes the printers and which brands use which?)
- Glaze composition and thickness: what measurably differentiates Porcelanosa/Marazzi/Daltile glazing from MSI/Home Depot private label?
- Polished vs matte vs textured vs lappato (semi-polished) — are there measurable performance differences (DCOF, stain resistance, wear)?

MANUFACTURING & RECTIFICATION:
- Rectified vs non-rectified (pressed edge): what's the actual dimensional tolerance difference? (±0.5mm vs ±2mm?)
- Which brands rectify ALL production vs only premium lines?
- Calibrated vs non-calibrated: thickness consistency across tiles. What tolerance range is acceptable?

PLATFORM SHARING / CORPORATE STRUCTURE:
- Mohawk Industries: Daltile, Marazzi USA, American Olean — do they share factories? Same production lines? Are there measurable quality differences between the three brands from the same parent?
- Grupo Porcelanosa: Porcelanosa, Venis, Urbatek, L'Antic Colonial, Butech — which share manufacturing?
- MSI: sourcing model — are they a manufacturer or distributor? Which factories supply their tile?
- Crossville: US manufacturing — what factory, what capabilities?
- Italian majors: Atlas Concorde, Florim (Floor Gres, Rex), Iris Ceramica Group (Ariostea, Fiandre, Porcelaingres, SapienStone) — platform sharing?

SUPPLY CHAIN & PARTS:
- Which brands maintain consistent dye lots for reorder?
- Which brands have known consistency issues (shade variation, size calibration problems)?
- Import sources: Italy, Spain, Brazil, India, China, Turkey — is there a measurable quality hierarchy by country of origin, or is it brand-specific?

Prioritize sources from: tile installer communities, TCNA publications, architect specification databases, tile testing labs, manufacturer technical data sheets. Cite all sources.
```

---

## Pass 3 — Competitive Hierarchy Top

```
How do professionals rank the top residential tile brands against each other?

Specifically comparing Porcelanosa, Daltile (premium lines), Marazzi (Italian production), Crossville, Ann Sacks, Walker Zanger, Fireclay Tile, and Atlas Concorde / Florim (Italian imports). What separates the best from the merely excellent?

Focus on professional installer opinions, architect specification preferences, independent testing data, and manufacturing-level differences — not marketing claims. What do tile professionals, NTCA-certified installers, and specifying architects say about relative quality? Which brands do architects specify for $2-5M homes? Which brands do experienced tile setters consider premium to work with?

Porcelanosa appeared 39 times in luxury home listings. Where does it sit relative to Italian-manufactured competitors and US-manufactured premium brands?
```

---

## Pass 4 — Competitive Hierarchy Bottom

```
Where do professionals draw the line between a good residential tile and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank Daltile (standard lines), American Olean, MSI, Bedrosians, Florida Tile, Emser, SomerTile, Merola (Home Depot), and generic imported tile in the professional hierarchy?

I need: installer feedback on quality consistency, dimensional accuracy complaints, sizing/shade variation issues, professional opinions on cutting behavior (chipping, clean breaks), bond reliability per brand, which brands professionals actively warn against, and where the floor of acceptable quality sits.

Focus on the line between "good enough for a quality home" and "builder-grade filler." What brands do tile installers and designers refuse to specify? What percentage of callbacks are attributed to product quality vs installation error?
```

---

*Save outputs to `knowledge/tile/tile_testing_framework.md` (Pass 1), `knowledge/tile/tile_component_analysis.md` (Pass 2), `knowledge/tile/tile_hierarchy_top.md` (Pass 3), `knowledge/tile/tile_hierarchy_bottom.md` (Pass 4).*
