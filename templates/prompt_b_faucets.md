# Faucets — Per-Product Deep Dive Prompt (prompt_b)

**Scope:** Residential kitchen and bath faucets — pull-down, pull-out, bar, pot filler, lavatory. NOT commercial, NOT utility.
**Pool S:** StarCraft Custom Builders / Zach Pett (THE source for faucet teardowns, cartridge identification, body material verification, finish analysis).
**Pass 2 Intelligence Applied:** This prompt uses specific cartridge manufacturers (Flühs, Kerox, Sedal, Geann, DST), body materials (solid brass, 316 SS, ZAMAK), finish technology (PVD vs electroplated), and platform sharing from Pass 2 to force deep-dive sources to produce actionable data.

---

# Master Query

```
I'm building an independent product intelligence platform that scores residential faucets on Quality, Durability, and Performance. I need a comprehensive component-level analysis of [PRODUCT NAME].

CARTRIDGE / VALVE TECHNOLOGY (CRITICAL — #1 scoring differentiator):
- Cartridge type: ceramic disc? Ball valve? Compression?
- Cartridge manufacturer: Flühs (Germany), Kerox (Hungary), Sedal (Spain), Geann (Taiwan), proprietary/Delta DST? Or unknown/generic Chinese?
- Cycle rating: independently certified cycle count? (500K, 1M, 2M, 4M, 5M cycles?) How was this tested?
- Cartridge model: specific part number if identifiable?
- Ceramic disc material: standard alumina, PVD-coated (Kerox PVD+), diamond-coated (Delta DST)?
- Replaceability: industry-standard size? Proprietary? Available at hardware stores or direct-order only?
- Known cartridge failure modes: ceramic disc cracking, ball valve pitting, seal degradation, drip at what cycle count?

BODY MATERIAL & CONSTRUCTION (CRITICAL):
- Body material: solid brass (forged? cast?), 316 stainless steel (bar stock? cast?), ZAMAK zinc alloy (full body or partial?), plastic?
- Brass alloy: ECO Brass, silicon bronze, DZR brass, standard low-lead?
- Weight: total faucet weight (StarCraft publishes this as solid brass proxy)?
- Waterway material: brass internal waterway, PEX connection, silicone?
- Lead content: NSF 372 compliant? Below California AB953?
- Construction method: single-piece body, multi-piece brazed, die-cast shell?
- Spout material: solid brass, hollow brass, stainless, ZAMAK, plastic?
- Handle material: solid brass, hollow zinc, plastic knob?
- Mounting hardware: brass or plastic supply lines/connections?

FINISH TECHNOLOGY:
- Finish type: PVD (Physical Vapor Deposition), electroplated chrome, powder coat, other?
- PVD process: if PVD, done in-house or outsourced? What material deposited (titanium nitride, zirconium, chromium)?
- Available finishes: how many? Chrome, brushed nickel, matte black, polished nickel, PVD options?
- Finish warranty: lifetime? What's actually covered?
- Published finish testing: salt spray hours? Scratch resistance? Taber abrasion?
- Known finish failure modes: electroplate peeling, PVD chipping, powder coat fading?

SPRAY HEAD & HOSE:
- Spray head material: metal (brass, stainless) or ABS plastic?
- Docking mechanism: magnetic (MagnaTite, DockNetik, Reflex) or snap-in?
- Spray functions: stream, spray, pause, boost? Touch activation?
- Hose material: braided nylon, braided stainless, silicone-lined?
- Hose length: adequate for deep sinks?
- Check valve / backflow prevention: ASSE 1016 compliant?
- Known spray head failure modes: plastic cracking, magnetic dock weakening, hose kinking?

PARTS & SERVICE:
- Cartridge availability: stocked at Home Depot/Lowe's? Plumbing supply? Direct-order only?
- Replacement parts: aerators, handles, spray heads, supply lines — universal or proprietary?
- Warranty execution: does the brand actually ship parts free, no questions? Or adversarial?
- Plumber parts preference: do plumbers stock this brand's cartridges and parts?
- Service life: professional consensus on how many years before rebuild/replacement?

CERTIFICATIONS & SAFETY:
- cUPC (Uniform Plumbing Code) certified?
- NSF/ANSI 61 (drinking water safety)?
- NSF/ANSI 372 (lead-free)?
- WaterSense (EPA water efficiency)?
- California AB953 compliant?
- Any CPSC recalls?

CORPORATE & MANUFACTURING:
- Corporate parent and ownership structure
- Manufacturing location: US-made, China, other? Specific factory if known?
- Business model: true manufacturer, assembler (US assembly from imported components), or marketeer (brand only, OEM everything)?
- Platform sharing within brand family
- Financial stability

Prioritize sources from: StarCraft Custom Builders / Zach Pett (primary for teardown data), plumber communities (r/Plumbing, Terry Love), manufacturer spec sheets, parts catalogs. Cite all sources.
```

---

## PRODUCT: California Faucets (representative pull-down)
slug: california_faucets
Tier 1 benchmark. Huntington Beach CA manufacturing — confirm all-US assembly. Flühs (Germany) + Kerox (Hungary) cartridge sourcing — which models use which? Solid brass cast body — forging or casting? PVD lifetime finish — what PVD process? In-house or outsourced coating? StarCraft rating — near-perfect. How many finishes available (70+?)? What's the price premium over Brizo/Waterstone and what justifies it? Parts availability — plumbing supply or direct? What do plumbers who install at the $2M+ level say about California Faucets vs Waterstone vs Rohl? Any known weaknesses? What fails at year 10?

## PRODUCT: In2aqua
slug: in2aqua
Tier 1. Kerox PVD+ cartridge at 4M cycles — confirm cycle certification. StarCraft: best warranty execution. German-engineered — where manufactured? Solid brass body — confirm. Chrome finish primarily (no PVD?) — if correct, what finish durability data? Parts availability in US market? Relatively unknown brand — what's the installer experience? Distribution channel? Price point vs California Faucets/Waterstone?

## PRODUCT: Waterstone
slug: waterstone
Tier 1. Murrieta CA — true manufacturer. 316 stainless steel bar stock body — confirm SS grade and construction. Machined not cast — confirm. Geann (Taiwan) cartridge — what cycle rating? (500K suspected — lower than Flühs/Kerox). No PVD finish — powder coat or electroplate? What finishes available? Why is body material the best in class but cartridge/finish not? StarCraft rating? What do plumbers say about Waterstone long-term? Parts availability for a smaller manufacturer?

## PRODUCT: Brizo (DST Cartridge Lines)
slug: brizo_dst
Tier 2. Diamond Seal Technology — what's the actual process vs Sedal? 5M cycle claim — independently verified? Brilliance PVD finish — in-house process? Which Brizo models use DST vs Sedal/unknown cartridges? >2/3 China manufacturing — which factory? Solid brass body confirmed on all models? Plastic spray wands — universal or model-specific? How does Brizo distinguish itself from parent Delta at the construction level? Same factories? Platform disclosure: Delta Faucet Company (Masco) — Brizo, Delta, Peerless. What parts are shared?

## PRODUCT: Delta Mid-Range (DST models)
slug: delta_mid_range
Tier 3. Same DST 5M-cycle cartridge as Brizo — confirm identical engineering. ZAMAK shell + PEX waterway — confirm. Die-cast construction. Chrome finish standard (no PVD). Massive parts availability — every hardware store in America. Lifetime warranty — how does Delta warranty compare to Brizo warranty? Is a Delta DST faucet 85% of a Brizo DST faucet at 40% of the price? What do plumbers think? Which Delta models specifically have DST (look for -DST suffix)?

## PRODUCT: Kraus
slug: kraus
Tier 4 benchmark. Marketing claims solid brass — StarCraft verification? Unknown cartridge supplier — what has been found inside? Claimed cycle ratings? Chrome finish quality — salt spray data? Where manufactured — China confirmed? Marketeer business model — who actually makes Kraus? Any OEM factory identified? Parts availability: can you buy a Kraus cartridge 5 years after purchase? Warranty "lifetime" — claim execution? What do plumbers say? What fails first — cartridge, hose, or finish?

---

*Run deep dives for each calibration product after research review.*
