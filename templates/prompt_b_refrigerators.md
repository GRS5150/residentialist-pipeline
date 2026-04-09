# Refrigerators — Per-Product Deep Dive Prompt (prompt_b)

**Scope:** Built-in refrigerators only (column, French door built-in, integrated). NOT freestanding, NOT counter-depth freestanding, NOT commercial.
**Pool S:** Yale Appliance — publishes annual service rate data, brand rankings, and repair technician insights. Consumer Reports conducts lab testing (temperature stability, energy, noise). Both provide actionable data for built-in segment.
**Pass 2 Intelligence Applied:** This prompt uses specific compressor architectures, sealed system designs, temperature stability metrics, and corporate platform relationships from Pass 2 to force deep-dive sources to produce actionable data.

---

# Master Query

```
I'm building an independent product intelligence platform that scores built-in residential refrigerators on Quality, Durability, and Performance. I need a comprehensive component-level analysis of [PRODUCT NAME].

COMPRESSOR & SEALED SYSTEM (CRITICAL — #1 scoring differentiator):
- Compressor type: variable-speed (inverter) vs single-speed? Dual compressor (separate refrigerator and freezer compressors) vs single compressor with dual evaporators vs single compressor single evaporator?
- Compressor manufacturer: Embraco, Secop (Danfoss), GMCC (Midea), LG BLDC, proprietary?
- Sealed system design: what refrigerant (R-600a isobutane, R-134a, R-290 propane)? Charge amount?
- Condenser type: forced-air with fan vs static/skin condenser? Location (bottom, rear, top)?
- Evaporator design: aluminum vs copper tubing? Single vs dual evaporators for independent temperature zones?
- Expected sealed system lifespan: 15-20+ years (premium) vs 8-12 years (mid-tier)?
- Known sealed system failure modes: refrigerant leaks (pinhole corrosion in aluminum evaporators), compressor bearing failure, capacitor failure, restriction (filter drier), fan motor failure?

TEMPERATURE STABILITY & FOOD PRESERVATION (Performance):
- Temperature stability: ±1°F (premium dual-compressor) vs ±2-3°F (single compressor) vs ±5°F (budget)?
- Recovery time after door opening: how quickly does the unit return to setpoint?
- Humidity management: sealed crisper drawers with humidity controls? Independent humidity zones?
- Air purification: ethylene scrubbing (Sub-Zero's purification system), activated carbon filters, UV light? Or none?
- Multi-zone temperature control: how many independent temperature zones? Can zones be set to different temps?
- Freezer performance: 0°F target, how tight is variance? Rapid freeze function?

CONSTRUCTION & BUILD QUALITY (Quality):
- Cabinet construction: welded stainless steel frame vs riveted/screwed assembly? Interior material (stainless steel liner vs molded plastic)?
- Insulation: foam type and thickness? R-value if published?
- Door construction: solid stainless, panel-ready with custom panel overlay, or integrated flush with cabinetry? Hinge type (cam-lift, spring-loaded)?
- Shelving: tempered glass with stainless trim, glass with plastic trim, wire shelving? Adjustable? Slide-out?
- Drawer construction: full-extension ball-bearing slides vs partial extension plastic slides?
- LED lighting: theater-style multi-zone LED vs single LED strip vs incandescent?
- Ice maker: integrated vs separate module? Known ice maker failure rates and modes?
- Water filter: built-in filtration? Filter type and replacement frequency?

CONTROLS & ELECTRONICS:
- Control system: electronic with digital display, touchscreen, mechanical thermostat?
- Smart features: WiFi connectivity, app control, diagnostics? Proprietary platform?
- Control board reliability: known failure modes? Board replacement cost?
- Noise level: published dB rating? Compressor noise, fan noise, ice maker noise?

RELIABILITY & SERVICE (Durability — CRITICAL):
- Yale Appliance service rate: what percentage of units require service in first year? (Sub-Zero ~5-8%, Thermador ~10%, Viking ~18-20%, Samsung ~23%+?)
- Most common repair: sealed system, control board, ice maker, fan motor, door gasket?
- Parts availability: nationwide dealer/service network? Parts stocking vs special order?
- Average repair cost: parts + labor for most common failure?
- Service network: factory-certified technicians required, or any appliance tech?
- Expected total lifespan: 20+ years (Sub-Zero/True), 15-20 (Thermador/Miele), 10-15 (Bosch/JennAir), <10 (Viking/Samsung)?

WARRANTY:
- Full warranty period: 1 year, 2 years?
- Sealed system warranty: 5-year, 6-year, 12-year? What's covered vs excluded?
- Extended warranty options: manufacturer-offered or third-party only?
- Warranty execution: smooth or adversarial? Technician and consumer experiences?

BUSINESS MODEL & CORPORATE:
- Corporate parent and ownership structure
- Manufacturing location (specific factory — Fitchburg WI for Sub-Zero, BSH plants for Thermador/Bosch, etc.)
- Platform sharing: does this brand share compressor, sealed system, control boards, or cabinet components with sister brands? (BSH shares across Thermador/Bosch/Gaggenau — confirm extent for refrigerators)
- Financial stability / going-concern risk
- Distribution: luxury appliance dealer, big-box, online?

CERTIFICATIONS & SAFETY:
- UL/CSA listed?
- ENERGY STAR certified? Annual kWh consumption?
- DOE Energy Guide testing results?
- Any CPSC recalls? Known safety issues?
- Refrigerant environmental impact (GWP rating)?

Prioritize sources from: Yale Appliance (blog, YouTube, service data), Consumer Reports (lab test results), professional appliance repair technicians (r/Appliances, ApplianceBlog forums), manufacturer spec sheets, ENERGY STAR product finder data. Cite all sources.
```

---

## PRODUCT: Sub-Zero Classic/Designer/Pro Built-In
slug: sub_zero_classic_designer
Tier 1 benchmark — the gold standard for built-in refrigerators. Sub-Zero Group, Inc. (privately held, Madison WI). Manufacturing: Fitchburg, Wisconsin and Goodyear, Arizona. Dual compressor design (separate refrigerator and freezer compressors) — confirm this is standard across Classic/Designer/Pro lines. NASA-inspired air purification system with ethylene scrubbing. Key verification targets: dual compressor specs (Embraco? proprietary?), sealed system 20+ year expected lifespan, Yale Appliance service rate (~5-8% cited by pros), stainless steel interior liner (Classic), temperature stability ±1°F claim, 12-year sealed system warranty, parts availability nationwide. 95 target score. How does Sub-Zero Classic differ from Designer differ from Pro? Is it the same sealed system in different cabinet configurations? Why do repair technicians universally rate Sub-Zero #1 for serviceability? Compare directly against Thermador Freedom and True Residential.

## PRODUCT: Thermador Freedom Collection Built-In
slug: thermador_freedom
Tier 1 column/integrated refrigerator. BSH Home Appliances (Bosch/Siemens joint venture). Key verification targets: CONFIRM platform sharing with Bosch Benchmark — do Freedom columns share the same compressor, sealed system, and/or control boards as Bosch Benchmark built-ins? This is the critical question for scoring. If same sealed system = same durability score regardless of brand premium. Manufacturing location — BSH US plant (New Bern NC?) or European? Freedom Collection allows flexible column configurations. Yale service rate (~10%). Temperature stability vs Sub-Zero dual compressor. Warranty: 2-year full, how long on sealed system? Star-K certified? SuperFreeze/SuperCool functions. What do repair technicians say about Thermador vs Bosch refrigerator reliability — are they genuinely different or badge-engineered? 90 target score.

## PRODUCT: Bosch Benchmark Built-In
slug: bosch_benchmark
Tier 2 built-in. BSH Home Appliances — same corporate parent as Thermador and Gaggenau. Key verification targets: CONFIRM what components are shared with Thermador Freedom. If same compressor and sealed system, the quality/durability gap between Bosch Benchmark (79 target) and Thermador Freedom (90 target) must be justified by other factors (cabinet construction, features, controls). Manufacturing location — same BSH plant as Thermador? Compressor type (single or dual?). Yale service rate (~15-16%). Known issues: evaporator icing, control board failures reported by technicians. Ice maker reliability. Parts availability through BSH network. Why do kitchen designers specify Thermador over Bosch Benchmark when BSH makes both — is it genuine quality difference or positioning? 79 target score.

## PRODUCT: JennAir Built-In Column
slug: jennair_column
Tier 3 column refrigerator. Whirlpool Corporation (NYSE: WHR) subsidiary — premium brand. Key verification targets: compressor type (single or dual?), sealed system design, manufacturing location (Whirlpool has US and Mexico plants). How does JennAir column compare to Sub-Zero and Thermador at the component level? Compressor supplier? Sealed system expected lifespan? Yale service rate (reported ~12-15%).DERA technology (obsidian interior, LED theater lighting, WiFi). Panel-ready column configurations. Known failure modes — control boards, compressors, ice makers? Parts availability through Whirlpool service network. JennAir positioned between KitchenAid and Sub-Zero — is the build quality proportionally between them? Warranty terms. 70 target score.

## PRODUCT: Dacor Column Refrigerator (DRR30980RAP)
slug: dacor_column
Tier 4 column. Samsung Electronics subsidiary (acquired 2016). Key verification targets: what changed after Samsung acquisition? Are Dacor refrigerators now Samsung internals in a Dacor cabinet? Compressor sourcing — Samsung/LG BLDC vs independent? Sealed system design and expected lifespan. Manufacturing location — Dacor historically US-based (Commerce CA), has production moved? Yale service rate (~14% cited). Known platform sharing with Samsung Bespoke or Samsung built-in lines. Stainless steel interior. SteelCool technology. Parts: available through Samsung service network or separate Dacor channel? Professional and technician opinions — has quality changed post-Samsung acquisition? Warranty: 3-year full, sealed system coverage? 56 target score.

## PRODUCT: Viking 5 Series Built-In Column (FDRB5363)
slug: viking_5_series
Tier 4 anchor — high-price, high-service-rate cautionary example. Viking Range, LLC (Middleby Corporation subsidiary, NYSE: MIDD). Manufacturing: Greenwood, Mississippi. Key verification targets: Yale Appliance service rate (~18-20% — one of the highest among luxury brands). Most common failures: sealed system leaks, door seal issues, compressor failures. Why is Viking so unreliable despite premium pricing? Compressor sourcing — who makes Viking compressors? Sealed system design flaws? Build quality: heavy but reportedly "finicky" per installers. Parts availability through Middleby/Viking service network. Repair technician consensus: most-dreaded brand to service? Panel quality and alignment issues reported. Warranty terms (limited). How does Viking 5 Series compare to Viking 3 Series — same sealed system or different? Is Middleby investing in quality improvement? 45 target score — lowest-scoring built-in in calibration, reflecting chronic reliability issues despite premium brand positioning and pricing.

---

### Operational Notes
- Run each product as a separate Perplexity deep dive
- Expected output: 15-50K chars, 15-40+ sources per product
- Save raw output as markdown to `knowledge/refrigerators/`
- After all 6 deep dives: review for corrections, update calibration if needed
