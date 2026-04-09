# Toilets — Per-Product Deep Dive Prompt (prompt_b)

**Scope:** Residential toilets — one-piece, two-piece, wall-hung, smart/bidet toilets. NOT commercial, NOT urinals.
**Pool S:** MaP Testing (Veritec Consulting) — Maximum Performance flush test using standardized soybean paste media. 3,000+ models tested. MaP PREMIUM = 600g+ threshold.
**Pass 2 Intelligence Applied:** This prompt uses specific component suppliers, flush mechanism designs, and failure modes from Pass 2 to force deep-dive sources to produce actionable data.

---

# Master Query

```
I'm building an independent product intelligence platform that scores residential toilets on Quality, Performance, Durability, and Material Safety. I need a comprehensive component-level analysis of [PRODUCT NAME].

FLUSH MECHANISM (CRITICAL — #1 scoring differentiator):
- Flush valve type: TOTO TORNADO FLUSH (centrifugal rinse), Kohler AquaPiston (canister/tower, 360° water entry, no flapper), American Standard Champion 4 (4" piston valve, fastest water delivery), standard 3" flapper (silicone or rubber?), standard 2" flapper (builder-grade)? Name the exact mechanism.
- Flush valve diameter: 2" standard, 3" (TOTO, Kohler), or 4" (American Standard Champion)? Larger = faster water delivery = better flush.
- Fill valve: Fluidmaster 400A compatible (universal aftermarket), Korky QuietFILL, TOTO proprietary Unifit, Kohler proprietary, or other? Can it be replaced with a $10 Fluidmaster?
- Flapper material (if applicable): rubber (3-5 yr life) or silicone (7-10 yr)? Chemical-resistant?
- MaP Testing score: What is the exact MaP score in grams? (≥1000g = top, ≥600g = MaP PREMIUM, 350g = WaterSense minimum, <350g = fail). Search map-testing.com.
- Flush mechanism failure modes: flapper degradation (most common failure), canister seal blistering (Kohler documented), ghost flushing, running toilet, weak flush. What fails first on THIS product?

CHINA BODY & CONSTRUCTION (Quality axis):
- Construction type: one-piece skirted (premium — no tank-to-bowl gasket point), one-piece standard, two-piece concealed trapway, two-piece standard, wall-hung?
- China body quality: firing temperature (TOTO >1200°C = high-fire premium, standard ~1050-1100°C). China density and chip resistance? Known cracking issues?
- Glazing technology: TOTO CeFiONtect (zirconium-based nano-glaze, ionic barrier), Kohler CleanCoat, American Standard EverClean (silver-ion antimicrobial), Duravit HygieneGlaze 2.0, or standard glaze? Long-term bowl cleanliness comparison?
- Trapway design: fully glazed (smooth internal surface — reduces clogging), partially glazed (standard — rougher), concealed/skirted (aesthetic + fewer cleaning surfaces)? Interior diameter: 2" standard, 2-1/8" (TOTO), 2-3/8"?
- Manufacturing location: TOTO Kitakyushu Japan / Morrow GA / Lakewood GA USA, Kohler WI USA, Lixil/American Standard Mexico/USA, Gerber USA, other?

DURABILITY & PARTS ECOSYSTEM:
- Fill valve compatibility: can a standard Fluidmaster 400A replace the OEM fill valve? This is worth $100+ in repair savings.
- Parts availability: OEM parts at Ferguson/SupplyHouse.com? Aftermarket (Fluidmaster, Korky) replacements available? Smart toilet components modular or complete-unit replacement?
- DIY repairability: Can a homeowner replace flapper, fill valve, flush valve, wax ring without professional? Any proprietary tools required?
- Warranty: full years, mechanical component years, china warranty (usually limited lifetime). Claim execution smooth or adversarial?
- Common repairs by cost: flapper ($5-15), fill valve ($15-30 DIY, $100-150 pro), wax ring ($10-20 part, $150-250 pro), flush handle ($10-25), smart toilet board ($200-600+)?
- Service life expectation: 15+ years (good), 10-15 (adequate), <10 (poor)?

PERFORMANCE (MaP is Pool S):
- MaP score in grams (search map-testing.com for this exact model)
- Water consumption: GPF (gallons per flush). WaterSense = 1.28 GPF max. Dual-flush? If so, what's the full-flush and reduced-flush GPF?
- Bowl cleanliness: rinse coverage, bowl wash effectiveness. TORNADO FLUSH = centrifugal rinse (best documented). Standard rim-fed wash vs rimless?
- Noise level during flush cycle?
- Clog frequency: plumber reports on how often THIS model clogs?

SMART TOILET FEATURES (if applicable):
- Bidet wash: nozzle material (stainless vs ABS), water heater type (tankless instant vs reservoir), oscillation and pulsation modes, adjustable pressure and temperature?
- Seat: heated with adjustable temp? Auto-open/auto-close lid — motor reliability?
- Deodorizer: carbon filter or catalytic? Replacement interval?
- Dryer: air temperature and CFM? Effectiveness vs towel?
- Auto-flush: sensor type? Documented false-trigger issues?
- Remote/controls: wall remote, side panel, or app-connected?
- Electronic reliability: control board failure rates, power outage backup flush?

BUSINESS MODEL & CORPORATE:
- Corporate parent and ownership structure
- Manufacturing location (specific factory)
- Platform sharing within brand family (e.g., TOTO Drake shares TORNADO FLUSH platform with Ultramax II — which components are identical?)
- Financial stability / going-concern risk

SAFETY & CERTIFICATIONS:
- ASME A112.19.2/CSA B45.1 compliance (mandatory for any US toilet)
- WaterSense certified? (1.28 GPF max)
- UPC/IPC code compliance
- ADA compliant height? (chair-height = 17-19" seat height)
- Smart toilet: UL listed? GFCI required?
- Any CPSC recalls or safety issues?

Prioritize sources from: MaP Testing database (map-testing.com), Consumer Reports, Terry Love plumbing forum (terrylove.com), Plbg.com forums, r/Plumbing, supply house data (Ferguson, SupplyHouse.com), manufacturer spec sheets, plumber YouTube channels. Cite all sources.
```

---

## PRODUCT: TOTO Neorest NX2
slug: toto_neorest_nx2
Tier 1 benchmark smart toilet. TORNADO FLUSH system (centrifugal rinse — two powerful jets create cyclonic action washing entire bowl). CeFiONtect nano-glaze (zirconium-based ionic barrier). One-piece skirted. Japan manufacturing (Kitakyushu is TOTO's flagship factory). Confirm MaP score — TOTO Ultramax II tests at 1000g, Neorest should match or exceed. Integrated Washlet: confirm bidet nozzle material (stainless expected on flagship), tankless instant water heater vs reservoir, deodorizer type, auto-open/close reliability. Electronic flush — no flapper or mechanical valve. What's the backup flush for power outages? Fill valve: TOTO proprietary — can it be replaced with Fluidmaster? Known smart toilet failure modes: control board, water heater, nozzle motor. What's the MTBF? TOTO Ltd (public, Japan, founded 1917) — confirm financial position is strong. Dual-flush 1.0/0.8 GPF.

## PRODUCT: TOTO Ultramax II (MS604124CEFG)
slug: toto_ultramax_ii
Tier 1 conventional toilet benchmark. TORNADO FLUSH + CeFiONtect. One-piece skirted. 1.28 GPF WaterSense. Confirm MaP score (expected 1000g — search map-testing.com for model MS604124CEFG or CST604CEFG). USA manufacturing — Morrow GA or Lakewood GA? Confirm. 3" flapper — silicone or rubber? This matters for replacement life (3-5 yr rubber vs 7-10 yr silicone). Fill valve — TOTO proprietary but Fluidmaster compatible? SoftClose seat included — confirm hinge mechanism. Trapway: 2-1/8" fully glazed (TOTO benchmark for large trapway)? Plumber consensus: "best toilet period" per 44-year veteran. What specific failure modes do plumbers report? How does it compare to TOTO Drake (two-piece variant of similar platform)?

## PRODUCT: Kohler Highline Arc (K-5310)
slug: kohler_highline
Tier 2. AquaPiston canister flush valve — 360° water entry = faster flush than directional flapper. No flapper to degrade (canister seal instead). Confirm MaP score for K-5310 (search map-testing.com — Kohler publishes MaP for many models at kohler.com/en/toilets-and-seats/Map-Scores). Revolution 360 swirl rinse technology — does this actually improve bowl cleanliness vs standard rim-fed wash? CleanCoat glazing — how does it compare to CeFiONtect long-term? Two-piece construction. Kohler WI manufacturing on premium lines — is the Highline made in Kohler WI or outsourced? Fill valve: Kohler proprietary or Fluidmaster compatible? AquaPiston canister seal documented failure mode: blistering/warping on early units — is this still an issue on current production? Parts availability: AquaPiston canister repair kit widely available at Home Depot/Lowes? Kohler Co = private, family-owned since 1873 — confirm stable.

## PRODUCT: American Standard Champion 4 (2586.128ST)
slug: american_standard_champion4
Tier 3 top. 4-inch piston flush valve — largest in residential. Confirm MaP score (search map-testing.com — Champion 4 consistently 1000g in MaP database). EverClean antimicrobial surface (silver-ion based). Two-piece standard. 1.28 GPF WaterSense version (the .128 suffix). Fill valve: Fluidmaster 400A compatible? Flush valve: proprietary 4" piston — what's the replacement part? Is it widely stocked? The 4" valve delivers water faster than any 2" or 3" flapper — that's the performance story, not construction quality. Compare Champion 4 vs Champion PRO — what changed? Lixil Group (Japan, public) acquired American Standard — any quality changes post-acquisition? Plumber consensus: "workhorse" — confirm. Known issues: flush handle connection (documented weak point on some production years?), china quality vs TOTO/Kohler (standard vitreous vs high-fire)?

## PRODUCT: Gerber Viper (21-014)
slug: gerber_viper
Tier 3 mid. Plumber value pick. Confirm MaP score (search map-testing.com for Gerber Viper models — expected 800g range, MaP PREMIUM). Standard 3" flapper — rubber or silicone? Standard gravity flush (no special technology like TORNADO or AquaPiston). Standard glaze (no CeFiONtect/EverClean equivalent). Fully glazed trapway? Confirm interior diameter. Manufacturing: Gerber (Spectrum Brands) — US factory location? Fill valve: Fluidmaster 400A compatible (expected yes). Parts: universal aftermarket availability. Plumber consensus: "consistent flush, cheap parts" — confirm. What separates Gerber Viper from Gerber Avalanche (different flush mechanism)? Known issues: any documented cracking, running, or clogging patterns? Warranty: 3-year? DIY repairability: fully standard parts?

## PRODUCT: Glacier Bay Elongated HD (Home Depot)
slug: glacier_bay_hd
Tier 4 anchor. Home Depot house brand. Confirm MaP score (search map-testing.com — if listed. Many Glacier Bay models absent from MaP database, which itself is a signal). 2" flapper — rubber, standard grade. Thin-wall china — documented cracking? No special glazing. Partially glazed trapway? Who manufactures Glacier Bay toilets? (suspected Foremost/Globe Union OEM — confirm). Fill valve: Fluidmaster 400A compatible (expected yes — likely ships with Fluidmaster). Parts: universal aftermarket (only bright spot). Plumber consensus: "most service calls for clogs/valve failures" — confirm frequency. Running toilet frequency after installation? Bowl cleanliness/staining over time without special glaze? Home Depot does NOT manufacture anything — this is pure private-label. Identify the actual OEM. $100-150 price point — what do you actually get for that?

---

*Run each product as a separate Perplexity sonar-deep-research query. Append the product-specific context above to the master template. Expected output: 15-50K chars, 15-40+ sources per product.*
