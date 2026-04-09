# Countertops — Per-Product Deep Dive Prompt (prompt_b)

**Scope:** Residential countertop materials — engineered quartz, natural stone, ultra-compact sintered, solid surface. NOT laminate, NOT butcher block, NOT concrete, NOT tile.
**Pool S:** Karin Kirk / Countertop Investigator (geology-based independent analysis), Consumer Reports (structured testing), Natural Stone Institute.
**Pass 2 Intelligence Applied:** This prompt uses specific material compositions, resin systems, manufacturing processes, and failure modes from Pass 2 to force deep-dive sources to produce actionable data.

---

# Master Query

```
I'm building an independent product intelligence platform that scores residential countertop materials on Quality, Durability, and Performance. I need a comprehensive material-level analysis of [PRODUCT NAME].

MATERIAL COMPOSITION (CRITICAL — #1 scoring differentiator):
- For engineered quartz: quartz content percentage (93%? 90%? lower?)? Resin type (unsaturated polyester, acrylic-modified, proprietary blend)? Resin content percentage? Pigment technology (natural mineral, recycled glass, synthetic)? Breton technology licensed or reverse-engineered?
- For natural stone: geological classification (true quartzite/metamorphic, granite/igneous, marble/metamorphic calcium carbonate, soapstone/steatite)? Mineral composition? Country/quarry of origin? Verified classification or potentially mislabeled?
- For ultra-compact/sintered: raw materials (glass, porcelain, quartz — what ratio)? Sintering temperature and pressure? Near-zero porosity confirmed independently? Resin content (should be zero)?
- For solid surface: resin system (PMMA acrylic, polyester, hybrid)? Filler material? Composition ratio?

MANUFACTURING PROCESS & CONSISTENCY:
- Manufacturing location: specific factory? (Cambria: Le Sueur MN, Cosentino: Cantoria Spain, Caesarstone: Sdot Yam Israel + GA USA + India + China)
- Single-source or multi-source? If multi-source, quality consistency documented across plants?
- Breton slab pressing technology (quartz)? Compaction pressure? Vibro-compaction? Vacuum processing?
- Batch consistency: lot-to-lot color matching? Structural consistency? Known variance issues?
- Slab thickness: 2cm or 3cm standard? Option for both?

RESISTANCE PROFILE (Performance):
- Heat resistance: maximum temperature before damage? Thermal shock susceptibility? Hot pan test data? (Critical: Corian damages at ~200°F, quartz at ~350-400°F, Dekton at 500°F+, natural stone varies)
- Scratch resistance: Mohs hardness rating? Real-world scratch test data? Kitchen knife scratch resistance?
- Stain resistance: which substances cause problems (wine, coffee, lemon, turmeric, beet)? Permanence? Time-to-stain threshold? Sealed vs unsealed?
- Impact resistance: chipping at edges? Cracking? Flexural strength (psi)? Breakage during fabrication?
- UV stability: color fading in direct sunlight? Outdoor use rated? (Dekton yes, quartz generally no)
- Chemical resistance: bleach, acid, alkaline cleaners — what damages the surface?

POROSITY & SEALING:
- Water absorption rate: ASTM C97 result if applicable?
- Sealing required? Frequency (annual, every 3-5 years, never)?
- Sealer chemistry: any PFAS content in recommended sealers? PFAS-free alternatives?
- Factory-applied sealer or post-installation? Brand recommended?

DURABILITY & LONGEVITY:
- Expected lifespan: 25+ years (quartz, sintered), 30+ (natural stone maintained), 15-20 (solid surface)?
- Known failure modes: chipping patterns (quartz edge), cracking (natural stone), delamination (porcelain slab), thermal damage (solid surface)?
- Repairability: can damage be fixed invisibly? Professional repair process? DIY repairable?
- Warranty: duration, residential vs commercial, transferable?, what's excluded, claim execution smooth or adversarial?

CERTIFICATIONS & MATERIAL SAFETY:
- GREENGUARD Gold: certified or not? VOC emissions data?
- NSF/ANSI 51: food contact surface certified?
- HPD (Health Product Declaration) available?
- Declare label (Living Building Challenge)?
- VOC off-gassing from resins: any data on post-installation emissions?
- Natural stone radon: EPA/AARST position on consumer risk?
- Sealer PFAS content: documented concern for PFAS-based sealers?

CORPORATE & BUSINESS:
- Corporate parent and ownership structure
- Manufacturing location(s)
- Platform sharing within brand family
- Financial stability / going-concern risk
- Distribution: fabricator network vs big-box vs DTC
- Fabricator quality control: is fabrication quality consistent or installer-dependent?

Prioritize sources from: Karin Kirk / Countertop Investigator, Consumer Reports, Natural Stone Institute, fabricator communities (r/Stonefabrication, StoneForum), Houzz, manufacturer spec sheets, university materials testing. Cite all sources.
```

---

## PRODUCT: Cambria Quartz
slug: cambria_quartz
Tier 1 engineered quartz benchmark. Davis family-owned, Le Sueur MN. 93% quartz content published — confirm resin type and percentage. Breton technology licensed. Single US factory — confirm no offshore manufacturing. GREENGUARD Gold + NSF 51 — confirm both current. Chipping class-action (pre-2020) — what was the outcome? Formula change? Current chipping rates? Fabricator consensus: is Cambria still THE benchmark for engineered quartz? How does it compare to Caesarstone in hardness testing? Known heat resistance limit? What do 5+ year owners report?

## PRODUCT: Dekton (Cosentino Ultra-Compact)
slug: dekton
Tier 1 sintered benchmark. Cantoria Spain factory. Sintering at 25,000°C+ and extreme pressure — independent verification? Near-zero porosity claimed — ASTM C97 water absorption result? Field cracking reports near cooktops — root cause? Thermal shock or installation? Fabricator difficulty premium — why do they charge more? Diamond tooling issues? Outdoor/UV rated — confirmed? GREENGUARD Gold — confirmed? Lifetime residential warranty — what's excluded? How does Dekton compare to Lapitec and Neolith?

## PRODUCT: Caesarstone Quartz
slug: caesarstone
Tier 2. Multi-plant: Israel, GA USA, India, China. 93% quartz, 7% resin — confirm resin type. Quality consistency across plants — are US-made slabs better than Asian? Georgia plant — how new? Quality track record? GREENGUARD Gold + NSF 51 — confirm. How do fabricators rate Caesarstone vs Cambria in 2025-2026? Price differential? Known issues with specific collections?

## PRODUCT: Silestone (Cosentino)
slug: silestone
Tier 2. Anti-bacterial N-Boost marketing settlement — details? HybriQ+ recycled material technology — what percentage recycled content? 25-year warranty. How does Silestone compare to Caesarstone in hardness, heat resistance, stain testing? Fabricator preference? Cosentino distribution network — advantage or disadvantage? Known color-specific issues?

## PRODUCT: Corian (Solid Surface)
slug: corian
Tier 3. Originally DuPont, now CorStar Capital. PMMA acrylic — confirm composition. Heat damage temperature (200°F reported — confirm). Seamless/thermoformable — at what temperature? Renewable surface — how many times can it be sanded? Thickness loss per sanding? 10-year warranty — what's excluded? How do fabricators compare Corian to Hi-Macs (LG) and Staron (Samsung)? Has CorStar ownership affected quality/parts/warranty?

## PRODUCT: MSI Q Quartz
slug: msi_q_quartz
Tier 4. Import/distribution model. Where exactly are MSI quartz slabs made? Which factories? Can MSI trace a slab to a specific factory? Documented lot-to-lot inconsistency reports? Known voids, cracking? What certifications does MSI Q Quartz hold? GREENGUARD? NSF 51? What warranty does MSI offer and how does execution compare? Fabricator consensus: do experienced fabricators refuse MSI? What's the quality floor of engineered quartz?

---

*Run deep dives for each calibration product after research review.*
