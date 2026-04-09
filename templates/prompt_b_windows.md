# Windows — Per-Product Deep Dive Prompt (prompt_b)

**Scope:** Residential windows — double-hung, casement, fixed, sliding, awning. NOT commercial/storefront, NOT skylights, NOT specialty shapes unless requested.
**Pool S:** Consumer Reports (structured testing), Matt Risinger/Build Show (building science teardowns), Fine Homebuilding (trade publication testing).
**Pass 2 Intelligence Applied:** This prompt uses specific frame materials, IGU configurations, spacer technologies, hardware suppliers, and failure modes from Pass 2 to force deep-dive sources to produce actionable data.

---

# Master Query

```
I'm building an independent product intelligence platform that scores residential windows on Quality, Durability, and Performance. I need a comprehensive component-level analysis of [PRODUCT NAME].

FRAME MATERIAL & CONSTRUCTION (CRITICAL — #1 scoring differentiator):
- Frame material: solid wood species (pine, Douglas fir, VG Douglas fir, mahogany, alder)? Fiberglass (pultruded Ultrex, Impervia, standard)? Vinyl (multi-chamber profile, fusion-welded or mechanically fastened)? Composite (Fibrex)?
- Exterior cladding: extruded aluminum (thickness?), roll-form aluminum, fiberglass, no cladding (exposed vinyl)?
- Corner joint method: mortise-and-tenon (wood premium), fusion-welded (vinyl), mitered/bonded (fiberglass)?
- Frame depth and profile design: what's the cross-section? How many chambers (vinyl)? What's the wall thickness?
- Known frame failure modes: vinyl warping near dark surfaces? Wood rot behind cladding? Fiberglass stress cracking?
- Surface finish: acrylic color coating, factory paint, anodized aluminum, powder coat? UV stability?

INSULATING GLASS UNIT (IGU) — PERFORMANCE:
- Glass configuration: dual-pane or triple-pane? Glass thickness (3mm, 4mm)?
- Low-E coating: Cardinal LoE-180, LoE-272, LoE-340, LoE-366? Or other manufacturer (Vitro, AGC, Guardian)?
- Gas fill: argon, krypton, air? Initial fill percentage? Retention data?
- Warm-edge spacer: Super Spacer (Quanex), Intercept (Vitro/PPG), TPS, stainless steel, aluminum? Specific spacer model?
- NFRC-certified ratings: U-factor, SHGC, VT (visible transmittance), condensation resistance?
- Known IGU failure modes: seal failure timeline, fogging, gas loss rate by spacer type?

HARDWARE & OPERATING MECHANISMS:
- Hardware manufacturer: AmesburyTruth, Roto, Caldwell, Ashland, proprietary?
- Lock system: cam-lock, multi-point lock, push-out bar? Material (stainless, zinc, nylon)?
- Sash balance: block-and-tackle, coil spring, constant-force, channel balance? Manufacturer?
- Casement operator: folding arm, push-out, slide? Gear type?
- Known hardware failure modes: balance failure timeline, lock mechanism wear, operator stripping?

WEATHERSTRIPPING & AIR SEALS:
- Weatherstrip type: bulb seal, compression seal, fin seal, foam-filled bulb, Q-lon?
- Seal count: single-seal, double-seal, triple-seal?
- Air infiltration rate: CFM/ft² at 25 mph (ASTM E283)? NFRC air leakage rating?
- Water penetration: DP rating? ASTM E331 test results?

STRUCTURAL PERFORMANCE:
- Design Pressure (DP) rating: what DP level? (DP15, DP25, DP35, DP50+)
- Structural test grade: R, LC, C, HC, AW? (per AAMA/WDMA/CSA 101)
- Impact resistance: ASTM E1886/E1996 for missile impact? (relevant for coastal/hurricane zones)
- Forced entry resistance: ASTM F588?

DURABILITY & LONGEVITY:
- Expected frame lifespan: 30+ years (wood/fiberglass), 20-30 (quality vinyl), 10-20 (builder vinyl)?
- Expected IGU lifespan: 20+ years (premium spacer), 15-20 (standard), 10-15 (aluminum spacer)?
- Warranty: total warranty period? Glass warranty? Hardware warranty? Transferable? Labor coverage?
- Known class-action lawsuits or recalls? Settlement outcomes?
- Parts availability: hardware, weatherstripping, balances — stocked at distributors or special-order?

MANUFACTURING & CORPORATE:
- Manufacturing location: specific factory? Single-factory (Marvin: Warroad MN) or multi-plant?
- ISO certification? AAMA certification mark?
- Custom vs stock: true custom sizing or cut-down stock?
- Corporate parent and ownership structure
- Financial stability / going-concern risk
- ENERGY STAR certification? ENERGY STAR Most Efficient?

MATERIAL SAFETY:
- Frame materials: any off-gassing concerns (vinyl PVC, composite binders)?
- Glass coatings: any documented health concerns with Low-E metallic oxide coatings?
- Sealants: butyl/silicone used in IGU — any VOC concerns post-installation?
- Certifications: GREENGUARD? Any environmental product declarations (EPD)?

Prioritize sources from: Matt Risinger / Build Show, Building Science Corporation, Fine Homebuilding, Consumer Reports, contractor forums (GardenWeb/Houzz Window Forum), manufacturer spec sheets, NFRC certified product directory. Cite all sources.
```

---

## PRODUCT: Marvin Ultimate (Signature Ultimate) Double-Hung
slug: marvin_ultimate_dh
Tier 1 benchmark. Ultrex pultruded fiberglass exterior (proprietary — 8x stronger than vinyl per Marvin). VG Douglas fir interior available. Warroad MN single-factory. Cardinal glass. Matt Risinger has done extensive content on this product — find it. Confirm Ultrex composition: what resin system? What fiber reinforcement? Known Ultrex issues? Corner joint method on a composite/wood hybrid frame? AmesburyTruth hardware confirmed? Block-and-tackle balance confirmed? Triple-pane standard or option? What DP rating? ENERGY STAR Most Efficient? What do contractors say about installation complexity vs Andersen? What breaks first after 10 years? Glass or hardware?

## PRODUCT: Loewen Double-Hung
slug: loewen_dh
Tier 1. Canadian premium. Steinbach MB single-factory. VG Douglas fir standard. Extruded aluminum cladding — how thick? 50+ powder coat colors. What hardware supplier? Confirm triple-pane availability. What warm-edge spacer? Building science community rates this alongside or above Marvin — why? What's the actual DP rating? What's the warranty breakdown? Loewen is premium-priced — what justifies the premium over Andersen E-Series? Lead times? Parts availability for a Canadian manufacturer in the US market?

## PRODUCT: Andersen E-Series Double-Hung
slug: andersen_e_series_dh
Tier 2 upper. Massive scale. Wood interior with extruded aluminum cladding. Which factory produces E-Series? Multi-plant or single? Eagle Windows acquisition — any E-Series production at Eagle facilities? Cardinal glass confirmed? What specific Low-E coating? Hardware: AmesburyTruth confirmed? Confirm weatherstrip type. What DP rating? ENERGY STAR Most Efficient? Andersen has the most units in the field — what do home inspectors say about 10-year and 20-year failure patterns? Seal failure rates? Balance failures? Class-action history?

## PRODUCT: Pella Architect Series Double-Hung
slug: pella_architect_dh
Tier 2 lower. Wood with aluminum cladding. Between blinds option (Pella exclusive) — does this affect IGU integrity? What specific hardware supplier? What DP rating? Pella claims industry-leading warranty — what's actually covered? What's excluded? Pella Lifestyle vs Architect — what's the construction difference? Same frame? Same glass? How does Pella's 200+ showroom service network compare to Andersen/Marvin dealer networks? What do contractors say about Pella quality vs Andersen quality specifically?

## PRODUCT: Milgard Tuscany Double-Hung (Vinyl)
slug: milgard_tuscany_dh
Tier 3. MI Windows subsidiary. Fusion-welded vinyl. Multi-chamber profile confirmed? What vinyl compound? Full lifetime warranty including accidental glass breakage — confirm this is still current. West Coast dominant — availability outside Pacific region? What DP rating? Dual pane standard — triple available? What spacer type? How does Milgard compare to Simonton and Harvey in the vinyl tier? Known warping issues in hot climates? What do contractors say about vinyl longevity in desert Southwest vs Pacific Northwest?

## PRODUCT: JELD-WEN V-2500 Double-Hung (Vinyl)
slug: jeldwen_v2500_dh
Tier 4. Builder-grade vinyl benchmark. Fusion-welded corners. Which factory produces V-2500? Multi-plant confirmed — which plants and what quality variance? Class-action lawsuit history (Wood-Ultrex and vinyl seal failures) — current status? What DP rating (expected low)? What spacer type (suspected aluminum)? Hardware supplier? AuraLast wood treatment on Siteline (higher JELD-WEN line) — is this relevant to V-2500 or vinyl-only? What do home inspectors say about JELD-WEN V-2500 at 5-year and 10-year marks? What fails first? What's the realistic lifespan?

---

*Run deep dives for each calibration product after research review. Each query replaces [PRODUCT NAME] with the product-specific section above.*
