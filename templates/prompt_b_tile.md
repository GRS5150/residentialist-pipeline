# Tile — Per-Product Deep Dive Prompt (prompt_b)

**Scope:** Residential ceramic and porcelain tile for floors and walls. NOT commercial/industrial, NOT natural stone, NOT LVP/LVT (separate category).
**Pool S:** VACANT — No independent, methodology-documented, comparative testing source equivalent to StarCraft (faucets), MaP (toilets), or Yale Appliance (dishwashers) exists for residential tile. TCNA develops standards but does not publish comparative reviews.
**Pass 2 Intelligence Applied:** This prompt uses specific material compositions, manufacturing processes, standardized test metrics, and corporate ownership structures from Pass 2 to force deep-dive sources to produce actionable data.

---

# Master Query

```
I'm building an independent product intelligence platform that scores residential tile on Quality, Durability, and Performance. I need a comprehensive component-level analysis of [PRODUCT NAME].

BODY COMPOSITION & MANUFACTURING (CRITICAL — #1 scoring differentiator):
- Body type: color-body porcelain (pigment throughout) vs glazed porcelain (white/gray body + surface glaze) vs red-body ceramic vs white-body ceramic?
- Water absorption rate: exact percentage tested per ISO 10545-3? Premium porcelain <0.5% (impervious); standard porcelain 0.5-3%; ceramic 3-10%+? This is the single largest measurable quality differential.
- Firing temperature: 2200°F+ (premium porcelain) vs 1800-2200°F (standard porcelain) vs 1500-1800°F (ceramic)?
- Body density: raw material composition (feldspar, quartz, kaolin ratios if available)?
- Manufacturing location: specific factory and country? Italian (Sassuolo district), Spanish (Castellón), US (Crossville TN, Daltile TX/OK), Chinese, Indian, Brazilian?

SURFACE TECHNOLOGY & GLAZE:
- Digital printing technology: advanced HD inkjet (Durst, Kerajet, SACMI single-pass) vs standard inkjet? How many channels/colors?
- Texture synchronization: is surface texture registered (aligned) to printed pattern? Or generic texture overlaid?
- Glaze type: polished, matte, lappato (semi-polished), structured/textured, natural cleft?
- Glaze durability: PEI abrasion rating (Classes 1-5 per ISO 10545-7)? Class 3+ required for residential floors; premium is 4-5.
- Scratch resistance: Mohs hardness rating? Premium porcelain 7+; ceramic 5-6.

DIMENSIONAL PRECISION (Quality differentiator):
- Rectification: are edges precision-ground post-firing (rectified) or natural-edge (non-rectified)? Rectified allows 1.5mm grout lines; non-rectified requires 9mm+.
- Dimensional tolerance: ±0.5mm (rectified premium) vs ±3mm (non-rectified)?
- Calibration: are tiles sorted into caliber groups for thickness consistency?
- Warpage tolerance: maximum surface curvature specification?
- Format size: standard (<12x24), large format (24x48+), ultra-large (gauged porcelain panels 48x96+)?

PERFORMANCE METRICS (Standardized — ANSI A137.1 / ISO 10545):
- Breaking strength (ISO 10545-4): measured in Newtons? Premium porcelain >2000N; ceramic 800-1500N.
- Slip resistance (DCOF AcuTest): dynamic coefficient of friction value? ANSI requires ≥0.42 for all floors; ≥0.60 recommended for wet areas; premium textured 0.75+.
- Freeze-thaw resistance (ISO 10545-12): certified frost resistant? Pass/fail with cycle count?
- Stain resistance (ISO 10545-14): Class 1-5? Premium porcelain typically Class 5 (non-porous, stains cannot penetrate).
- Chemical resistance (ISO 10545-13): Class A (no visible effect), B, or C?
- Thermal shock resistance (ISO 10545-9): pass/fail?

DURABILITY & LONGEVITY:
- Expected lifespan: 50+ years (premium porcelain, properly installed), 25-50 (standard porcelain), 15-25 (ceramic floor), <15 (cheap ceramic)?
- Known failure modes: cracking, crazing (glaze cracking), chipping, delamination, lippage issues?
- Dye lot variation: how consistent are batches? V1 (uniform) through V4 (substantial variation) shade rating?
- Warranty: manufacturer warranty terms? What's excluded?

INSTALLATION REQUIREMENTS:
- Substrate requirements: cement board, uncoupling membrane (Schluter DITRA), mud bed, direct to slab?
- Thinset requirements: modified vs unmodified? Large-format require specific mortars?
- Grout line minimum: what does manufacturer specify?
- Professional installation recommended/required vs DIY-capable?

BUSINESS MODEL & CORPORATE:
- Corporate parent and ownership structure (Mohawk Industries owns Daltile + Marazzi USA + American Olean; Grupo Porcelanosa private family-owned; etc.)
- Manufacturing location (specific factory — Castellón Spain for Porcelanosa, Crossville TN for Crossville, Sassuolo Italy for premium Italian, etc.)
- Platform sharing within brand family — do multiple brands share production lines?
- Distribution: specialty tile showroom vs big-box retail (Home Depot, Lowes) vs online/DTC?
- Financial stability / going-concern risk

CERTIFICATIONS (Material Safety — report only):
- ANSI A137.1 compliance?
- Porcelain Tile Certification Agency (PTCA) certified porcelain? (verifies water absorption <0.5%)
- GREENGUARD / GREENGUARD Gold certified (low VOC emissions)?
- Cradle to Cradle certification?
- Any documented health/safety issues (heavy metals in glazes, silica dust hazards during cutting)?

Prioritize sources from: TCNA published data, ISO 10545 test results, manufacturer technical data sheets, professional tile installer forums (John Bridge Tile Forum, r/Tile), architect specification databases, Consumer Reports (if available for tile). Cite all sources.
```

---

## PRODUCT: Porcelanosa Dover Caliza (Large Format Porcelain Floor)
slug: porcelanosa_dover_caliza
Tier 1 large-format porcelain benchmark. Manufactured by Grupo Porcelanosa in Castellón, Spain (global tile capital). Private family-owned since 1973. Advanced HD inkjet on dense color-body porcelain. Large-format rectified tiles with precision edges. Key verification targets: water absorption <0.1%, DCOF ≥0.60 on textured variants, breaking strength >2000N, Mohs 7+ surface hardness, full frost resistance, Class A chemical resistance. 39 luxury listing sightings. Porcelanosa operates branded showrooms globally — premium distribution model. Limited lifetime warranty. Compare directly against Crossville Virtue as Tier 1 competitor. Confirm whether Spanish manufacturing achieves Italian-equivalent precision, or whether Sassuolo district (Atlas Concorde, Florim) remains ahead. What do NTCA-certified installers say about working with Porcelanosa vs Italian imports?

## PRODUCT: Crossville Virtue (Through-Body Porcelain Floor)
slug: crossville_virtue
Tier 1 through-body porcelain benchmark. Manufactured in Crossville, Tennessee, USA. Through-body (color-body) porcelain — pigment extends throughout tile body, not just surface glaze. Key verification targets: confirm through-body construction (chips/edges show same color as surface), water absorption rate (porcelain standard <0.5%), rectification precision, PEI rating, DCOF value, breaking strength. Crossville is notable as a premium American manufacturer in a market dominated by Italian/Spanish imports. Green manufacturing claims — verify sustainability certifications. What separates Crossville from Daltile premium lines? How do architects specify Crossville vs imported Italian for $2-5M residential projects? What do installers report about cutting behavior, dimensional consistency, and callback rates?

## PRODUCT: Daltile Panoramic Porcelain (Large Format)
slug: daltile_panoramic
Tier 2 large-format porcelain. Mohawk Industries subsidiary (NYSE: MHK). Daltile is the dominant US tile brand by volume. Key verification targets: body composition (color-body or glazed?), water absorption rate, rectification status, manufacturing location (Daltile operates US plants in TX, OK, and sources from Mexico/Italy/Brazil). How does Daltile Panoramic compare to Porcelanosa Dover at the material science level? Is this the same factory/line as standard Daltile, or a premium sub-brand? HD printing quality vs Italian/Spanish competitors? PEI rating, DCOF, breaking strength data from Daltile tech specs. What do installers prefer — Daltile Panoramic vs Crossville vs imported? Mohawk platform sharing: does Daltile share manufacturing with Marazzi USA or American Olean lines?

## PRODUCT: Marazzi Color Body Porcelain (Italian Production)
slug: marazzi_color_body
Tier 2 Italian-manufactured color-body porcelain. Marazzi Group (Mohawk Industries subsidiary for US operations, but Italian Marazzi production is from historic Sassuolo district factory). Key verification targets: CONFIRM this is Italian-manufactured Marazzi (Fiorano Modenese/Sassuolo plant), NOT Marazzi USA (Sunnyvale TX / Dallas). Italian Marazzi represents the heritage brand (founded 1935). How does Italian Marazzi color-body compare to Porcelanosa and Atlas Concorde at the material level? Water absorption, rectification precision, digital printing technology. What's the quality differential between Italian Marazzi and American Marazzi under Mohawk? Distribution: is Italian Marazzi available through US Daltile showrooms, or specialty import only? Price positioning vs Porcelanosa Dover?

## PRODUCT: MSI Aria Bianco Porcelain (24x24)
slug: msi_aria_bianco
Tier 3 mid-market porcelain. MSI (M S International, Inc.) is a global distributor sourcing from multiple countries — NOT a manufacturer. Key verification targets: where is Aria Bianco actually manufactured? (China? India? Turkey? MSI sources globally.) Body composition: glazed porcelain or color-body? Water absorption rate? Rectified or non-rectified? PEI rating, DCOF, breaking strength from MSI tech data. 24x24 standard format. MSI distributes through Home Depot, Lowes, and flooring retailers — volume play, not premium positioning. How does MSI quality control work when sourcing from multiple factories across countries? Dye lot consistency issues? What do professional installers report about MSI tile quality vs Daltile vs domestic premium brands? Known failure modes or callbacks?

## PRODUCT: American Olean Theoretical Bold Ceramic
slug: american_olean_theoretical_bold
Tier 3 ceramic. Mohawk Industries subsidiary (same parent as Daltile and Marazzi USA). Key verification targets: body type (red-body or white-body ceramic?), water absorption rate (ceramic: 3-10%), PEI rating, DCOF. Manufacturing location — does American Olean share production with Daltile? Platform sharing is the critical question: is American Olean just Daltile's mid-tier brand differentiation, or are there genuinely different production lines? Glazed ceramic expected (not porcelain). Breaking strength comparison vs porcelain products above. What separates American Olean ceramic from Daltile ceramic lines? Installer preferences? Are there quality differences between American Olean lines made in USA vs imported? Warranty terms and claim execution.

## PRODUCT: Merola Tile (Home Depot Imported Ceramic)
slug: merola_tile_hd
Tier 4 anchor — builder-grade floor. Home Depot exclusive brand. Key verification targets: who is the actual manufacturer/OEM? (Merola is an import label, not a manufacturer — sourced from China, Spain, Italy, Brazil depending on SKU.) Body type: typically red-body or white-body ceramic with basic glaze. Water absorption rate — expect 3-10% (ceramic range). Non-rectified expected. Basic digital printing or screen printing? PEI rating (likely Class 2-3). DCOF values. Breaking strength likely <1500N. Dimensional consistency issues — do installers report warping, sizing variation, chipping during cuts? Warranty: minimal or none expected. Is there ANY quality differentiation between Merola SKUs (some supposedly Italian-made vs Chinese)? What do professional installers say — do they refuse Merola for quality projects? Callback rates? This is the de facto floor of the residential tile market at big-box retail. Compare against SomerTile (also Home Depot).

---

### Operational Notes
- Run each product as a separate Perplexity deep dive
- Expected output: 15-50K chars, 15-40+ sources per product
- Save raw output as markdown to `knowledge/tile/`
- After all 7 deep dives: review for corrections, update calibration if needed
