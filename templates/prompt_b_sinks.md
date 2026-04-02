# Sinks — Per-Product Deep Dive Prompt (prompt_b)

**Scope:** Kitchen sinks (stainless, fireclay, cast iron, composite) and bathroom sinks (vitreous china, fireclay). NOT commercial, NOT utility/laundry sinks.
**Pool S:** VACANT — No independent, methodology-documented, comparative testing source equivalent to StarCraft (faucets), MaP (toilets), or Yale Appliance (dishwashers) exists for residential sinks.
**Pass 2 Intelligence Applied:** This prompt uses specific material grades, construction methods, and failure modes from Pass 2 to force deep-dive sources to produce actionable data.

---

# Master Query

```
I'm building an independent product intelligence platform that scores residential sinks on Quality, Performance, Durability, and Material Safety. I need a comprehensive component-level analysis of [PRODUCT NAME].

BODY MATERIAL & CONSTRUCTION (CRITICAL — #1 scoring differentiator):
- For stainless: exact gauge (16, 18, 20, 22)? Verified or marketing claim? Steel grade (T-304/18-8/18-10, T-316 marine-grade, or unspecified)? Construction method (zero-radius CNC welded, tight-radius welded, drawn/pressed single sheet, stamped mass-production)? Weld quality and finishing?
- For fireclay: firing temperature (2100°F+ premium vs lower)? Clay composition? Glaze type (single-coat, multi-coat)? Dimensional consistency (handcrafted variations vs mold-consistent)? Manufacturing location and process?
- For cast iron: iron casting quality? Enamel technology (proprietary premium process vs standard porcelain)? Enamel thickness? Chip resistance testing data?
- For composite: stone-to-resin ratio (Blanco Silgranit = 80% granite)? Heat resistance rating (Silgranit = 536°F/280°C)? Proprietary formula or generic? Patent protection?
- For vitreous china: firing temperature? Glaze quality? China density and chip resistance? Non-porosity verification?

SOUND DEADENING (Critical for stainless, N/A for other materials):
- Sound deadening pad type: rubber, foam, or spray-on coating?
- Coverage: full bottom/sides (80%+) or partial?
- Brand-specific technology: Kraus NoiseDefend? Elkay Sound Guard? Other?
- Tested noise reduction dB claims?
- Note: cast iron, fireclay, and composite are inherently silent — dense body mass absorbs vibration.

DRAIN ENGINEERING & BASIN DESIGN:
- Basin slope: engineered slope to rear drain (premium) vs center drain (standard) vs flat bottom (builder-grade)?
- Basin depth: shallow (<8"), standard (8-9"), deep (10"+)?
- Corner design: zero-radius (true 90°), tight-radius (small curve), standard radius (large curve)?
- Drain assembly included? Quality brand (Kraus, Kohler, generic)?
- Overflow mechanism (bathroom): integrated vs external?

MOUNTING & INSTALLATION:
- Mounting type: apron-front/farmhouse, undermount, flush-mount, drop-in/self-rimming?
- Weight: approximate weight? Does it require reinforced cabinetry?
- Installation complexity: professional-only (apron-front, heavy fireclay) vs DIY-capable (drop-in)?
- Kohler Self-Trimming (cast iron): does it overlap cabinet face? Installation advantage?

DURABILITY & LONGEVITY:
- Expected lifespan: 50+ years (cast iron, fireclay), 25-50 (composite, 16-gauge stainless), 15-25 (18-gauge stainless), <15 (thin gauge)?
- Chip/crack resistance: what fails and when? Impact testing? Known failure patterns?
- Stain resistance: non-porous inherent vs susceptible? Long-term surface degradation?
- Heat resistance: rated temperature? Hot pan tolerance?
- Chemical resistance: bleach, acid, alkaline cleaners — what damages the surface?
- Warranty: limited lifetime? What's excluded? Claim execution smooth or adversarial?
- Parts ecosystem: drain assemblies, basket strainers, mounting hardware, sink grids — universal or proprietary?

WORKSTATION FEATURES (if applicable):
- Integrated ledge rails for accessories?
- Included accessories (cutting board, colander, drying rack, roll-up grid)?
- Accessory compatibility with third-party products?

BUSINESS MODEL & CORPORATE:
- Corporate parent and ownership structure
- Manufacturing location (specific factory — Darwen Lancashire for Rohl Shaws, Kohler WI for cast iron, Oberderdingen Germany for Blanco, etc.)
- Platform sharing within brand family
- Financial stability / going-concern risk
- Distribution: plumbing supply house vs big-box retail vs DTC/Amazon

SAFETY & CERTIFICATIONS:
- cUPC (Uniform Plumbing Code) certified? This is the minimum bar — uncertified = excluded.
- ASME A112.19.3/CSA B45.4 (stainless) or ASME A112.19.2/CSA B45.1 (ceramic/fireclay) compliance?
- ANSI Z124 (composite)?
- NSF/ANSI 61 (drinking water contact)?
- Any CPSC recalls or documented safety issues?
- Lead content in glazes (should be zero — lead-free standard)?

Prioritize sources from: Consumer Reports, This Old House, professional plumber forums (r/Plumbing, Terry Love, Plbg.com), SupplyHouse.com reviews, manufacturer spec sheets, installation guide data. Cite all sources.
```

---

## PRODUCT: Rohl Shaws Original Lancaster Fireclay Farmhouse (RC3618)
slug: rohl_shaws_rc3618
Tier 1 fireclay benchmark. Handcrafted in Darwen, Lancashire, England (Shaws of Darwen factory — heritage manufacturer, operating since 1897). Kiln-fired at 2100°F+. Apron-front farmhouse 36" single bowl. Each individually formed — confirm artisanal process. Clay composition: what specifically makes Shaws fireclay different from Chinese-import fireclay? Glaze: single-coat or multi-coat? Known issues: flat bottom pooling? Dimensional variation tolerance? Weight: ~140 lbs — confirms heavy-duty cabinetry required. Fortune Brands Innovations (NYSE: FBIN) owns Rohl. Limited lifetime warranty — what's excluded? Parts: drain assembly and grid available from Rohl? Professional consensus: how do kitchen designers rate Shaws vs Kohler Whitehaven vs imported fireclay? Is Shaws considered THE benchmark? Search for long-term (5+ year) owner reviews.

## PRODUCT: Kohler Whitehaven Self-Trimming Cast Iron (K-6489)
slug: kohler_whitehaven_k6489
Tier 1 cast iron benchmark. Self-trimming apron-front design — confirm installation advantage (overlaps cabinet face, hides rough cuts). Kohler proprietary porcelain enamel — what's the actual composition and process? Chip resistance vs standard cast iron enamel? Kohler WI USA manufacturing — confirm factory location. Weight: ~100+ lbs? Basin slope engineering — is it rear-drain sloped or center? Deep basin? Available in 30" and 36" — are they the same construction? Limited lifetime warranty — Kohler's warranty execution reputation. 187 Kohler luxury listing sightings. Plumber consensus: is Whitehaven their recommended farmhouse sink? How does it compare to Kohler's fireclay line (if they have one)?

## PRODUCT: Blanco IKON 33 Silgranit Composite Apron Front (401734)
slug: blanco_ikon_33
Tier 2 composite benchmark. Silgranit II patented formula — confirm 80% granite content. 35+ patents on material. Heat rated to 536°F (280°C) — is this independently verified? First composite apron-front sink. German engineering (Oberderdingen HQ) — where is it actually manufactured? BLANC & FISCHER Family Holding (private German since 1925). Metal transfer marks issue — how common? Can they always be removed with Bar Keepers Friend? Known chip/crack issues at extreme impact? Color fading over time? Limited lifetime warranty — Blanco's claim execution. Professional consensus: is Silgranit considered THE composite benchmark, or does Franke Fragranite compete? r/Plumbing and r/HomeImprovement opinions. Long-term owner reviews (5+ years).

## PRODUCT: Kohler Cairn Neoroc Composite Undermount (K-8206)
slug: kohler_cairn_k8206
Tier 2 composite. Neoroc proprietary composite — what's the actual composition? How does it compare to Silgranit in stone-to-resin ratio? Matte finish — does it hide marks as well as Silgranit? Kohler engineering: drainage slope, basin dimensions. Undermount installation. Manufacturing location? Limited lifetime warranty. Parts/accessories through Kohler ecosystem. How long has Neoroc been on market? Less field data than Silgranit (35+ years). Any documented failure modes? Heat resistance rating? Professional and consumer comparison vs Blanco Silgranit directly.

## PRODUCT: Kraus Standart PRO 16-Gauge Stainless Undermount (KHU100-30)
slug: kraus_standart_pro_30
Tier 3 stainless benchmark. TRU16 certification — is this genuine 16-gauge throughout or "up to 16-gauge" marketing? Verify T-304 stainless grade. NoiseDefend sound deadening — what material? Coverage percentage (claimed 80%+)? Commercial-grade satin finish. Tight-radius corners (not zero-radius). 10" deep basin. Engineered drain slope — confirmed? Drain assembly quality (Kraus branded). Manufacturing: where does Kraus actually make sinks? China? Vietnam? Quality control process? Kraus USA (private, Port Washington NY) — corporate structure? DTC/Amazon primary distribution. Limited lifetime warranty — claim execution from a DTC brand (no showroom)? r/Plumbing and r/HomeImprovement opinions on Kraus quality. Long-term durability (5+ year reviews). Compare to Elkay Crosstown and Ruvati premium stainless.

## PRODUCT: Kohler Caxton Oval Undermount Bathroom (K-2210)
slug: kohler_caxton_k2210
Tier 3 bathroom benchmark. Kohler's most popular bathroom undermount. Standard vitreous china — what differentiates Kohler china from budget chinese imports? Firing temperature? Glaze quality? Dimensional consistency? Overflow mechanism: integrated concealed overflow (standard on Caxton). Undermount clips and mounting system — quality? Weight: manageable for standard vanity cabinetry. Limited lifetime warranty. Universal drain assemblies (1-1/4" bathroom standard). Available in multiple sizes (Caxton 15", 17", 19", 21" widths). Kohler WI brand backing. Is this the "default" bathroom sink that every plumber recommends? Price-tier: mid-range ($100-200). Compare to American Standard Ovalyn, TOTO LT579G.

## PRODUCT: Glacier Bay All-in-One Drop-In Stainless (VT3322A08)
slug: glacier_bay_dropin
Tier 4 anchor. Home Depot house brand — who is the actual OEM? (suspected Globe Union/Foremost — confirm). 22-gauge stainless — confirm gauge. T-304 grade claimed? Verify. No sound deadening — confirm. Stamped construction? Flat bottom — pooling issues? Drop-in installation. 1-year warranty (vs lifetime from established brands). Generic drain assembly quality. Consumer complaints: flexing, noise ("tinny"), water spots, staining from standing water, denting from normal pot/pan handling. Plumber consensus: "most callbacks" for installation quality issues? How does it compare to other budget brands (Dayton by Elkay, Mainline)? Price: $100-150 range. Is there ANY quality differentiation from the absolute floor of the market?

---

*Run each product as a separate Perplexity sonar-deep-research query. Append the product-specific context above to the master template. Expected output: 15-50K chars, 15-40+ sources per product.*
