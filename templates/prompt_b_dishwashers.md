# Dishwasher Deep Dive Prompts — Perplexity (deep dive)
## Post-Pass 2: Named components, suppliers, and part numbers included
## One prompt per product. Copy-paste each into Perplexity.

---

## MASTER TEMPLATE

Use this exact prompt, swapping only the **[PRODUCT NAME]** line and appending the product-specific context from below. Run once for each of the six products listed.

---

```
Research [PRODUCT NAME] for an independent product quality assessment. I need expert-level construction and component analysis, not consumer shopping advice.

MOTOR & PUMP ASSEMBLY:
- What type of wash motor? (brushless DC/inverter, induction, universal/brushed)
- Who manufactures the motor? (Askoll, Sisme, Nidec, Hanning, Welling, EBM-Papst, or in-house — name the specific supplier)
- Is the motor manufactured in-house or sourced from an OEM supplier?
- What is the circulation pump part number? Is it an integrated motor-pump assembly or separable?
- Who manufactures the circulation pump? (Askoll M309 for Whirlpool/KitchenAid is confirmed — verify for this brand)
- What is the drain pump type and part number? (AC synchronous, DC brushless — name the supplier if known)
- Is the drain pump a commodity part shared across brands, or proprietary?
- What does a circulation pump replacement cost? (parts only, then parts + labor)
- What does a drain pump replacement cost?
- What are the documented pump failure modes? (impeller jam from filter bypass, shaft seal leak, bearing seizure, solenoid failure)

CONTROL BOARD & ELECTRONICS:
- What is the main control board part number?
- Is this the same control board used in other brands from the same parent company? (e.g., BSH boards confirmed cross-listed across Bosch/Thermador/Gaggenau — verify specific part numbers)
- Is the architecture single-board or dual-board (main + separate UI board)?
- Who manufactures the PCB? (Continental, Bitron, in-house — name the supplier if known)
- What are the documented control board failure modes? (heater relay failure, cold solder joints, dried/bulging capacitors, moisture/steam intrusion, burned traces — which apply to this model?)
- Is the replacement board plug-and-play or does it require reprogramming/authorized service?
- Can UpFix or similar component-level repair services fix this board? What do they charge?
- What does a control board replacement cost? (parts only, then parts + labor)
- Are boards stocked at Marcone, RepairClinic, PartSelect, or only through authorized channels?

TUB & STRUCTURAL CONSTRUCTION:
- What is the tub material? (full stainless steel, hybrid stainless walls/plastic bottom, full plastic)
- What gauge is the stainless steel?
- Is the base/sump assembly stainless or plastic?
- What is the door balance system? (nylon-coated steel cable + torsion springs — what gauge cable? What material at anchor points — plastic or metal?)
- Is the door balance cable/link a documented failure point for this model? What is the replacement part number and cost?

DRYING SYSTEM:
- What drying system is used? (zeolite/CrystalDry/StarDry, fan-assisted CleanDry, AutoOpen/AutoAir, condensation-only, heated element)
- If zeolite: is it natural (clinoptilolite) or synthetic? Who supplies it? Where is it physically located in the machine?
- If fan-assisted: what blower assembly is used? (EBM-Papst or other supplier?)
- Does drying technology vary across the product line? (e.g., Thermador: zeolite on Star Sapphire only, condensation on Emerald/Sapphire)
- Does effective condensation drying require a full stainless tub? (hybrid tubs degrade condensation performance — verify for this model)
- How does it perform on plastics specifically? Cite Reviewed.com, Consumer Reports, or Yale Appliance comparison data.
- What is the final rinse temperature? Does it achieve NSF/ANSI 184 sanitization (150°F, 5-log bacteria reduction)?

FILTRATION SYSTEM:
- What type of filter? (manual mesh, self-cleaning mesh, self-cleaning with grinder/hard food disposer)
- How many filter stages? (single-stage mesh vs two-stage coarse + fine — KitchenAid premium uses two-stage, verify for this model)
- Is the filter the same part across the product line? (BSH confirmed: same filter across 100/300/500/800/Benchmark)
- What is the mesh gauge/material? (stainless mesh, nylon, plastic housing)
- What is the filter-to-pump failure chain for this model? (debris bypass → impeller damage → pump failure — documented for Frigidaire and GE)

SPRAY ARM ARCHITECTURE:
- How many independent spray arms? (Miele: 3 full arms. BSH: 2 arms + passive overhead sprinkler. Verify for this model.)
- What are spray arms made of? (stainless, plastic, composite)
- How many wash zones/levels?
- If third rack has wash jets: are they powered by a separate pump or manifold-redirected from main circulation? (KitchenAid 360° Max Jets = manifold-fed, hydraulically driven — verify for this model)

RACK SYSTEM:
- Third rack: present? What type? (wash jets, flat silverware tray, fold-down cutlery tray, none)
- Is the middle rack adjustable while loaded? (Miele claims this as unique — verify)
- Rack glide type: ball-bearing (Bosch EasyGlide, KitchenAid SatinGlide Max) or standard nylon rollers?
- What are the rack tines coated with? (nylon, PVC, vinyl — nylon is standard on all $500+ models)
- What is the rated place setting capacity?
- Are rack roller/wheel failures documented? (LG 2026 service rate spike attributed to one roller component — verify if relevant to this model)

NOISE:
- What is the manufacturer-rated noise level in dBA?
- What contributes to noise reduction? (tub material, motor type, insulation type and thickness, filter type)
- Is the rated dBA consistent with independent measurements or owner reports?

ENERGY & WATER:
- What is the rated annual energy consumption? (kWh/year — pull from EPA ENERGY STAR certified product database if available)
- What is the rated water consumption per cycle? (gal/cycle)
- Is it ENERGY STAR certified? ENERGY STAR Most Efficient?

LEAK PROTECTION:
- Does this model have AquaStop or equivalent overflow protection? (dual valve + flow sensor at supply connection)
- Or float switch only?
- What is the documented leak incidence for this model?

RELIABILITY & SERVICE DATA:
- What is the Yale Appliance service rate for this brand? (cite specific year, sample size, and multi-year trend)
- What are the top 3 most common failure modes documented by repair technicians on r/appliancerepair and AppliancePartsPros forum?
- What is the manufacturer's stated or tested design life? (Miele: 5,600 cycles / 20 years. Others?)
- What is the published parts availability guarantee? (Miele: 15 years post-production. Others?)

PARTS & SERVICEABILITY:
- Are parts stocked at Marcone, RepairClinic, PartSelect? Or authorized channels only?
- Can independent repair technicians service this brand with plug-and-play parts? Or is authorized service + proprietary diagnostics required?
- What is the typical lead time for the most common repair part?
- What does the most common repair cost? (parts + labor)
- What does a high-severity repair cost? (circulation pump or control board replacement — parts + labor)

WARRANTY:
- What is the base warranty term and coverage? (years, parts only or parts + labor)
- Does the warranty cover the control board, motor, rack system, and door balance?
- Is there a manufacturer extended warranty option?
- Is the warranty transferable?
- What is the real-world warranty claim experience? (cite owner reports from r/Appliances, Houzz, or repair forums)

BUSINESS MODEL & MANUFACTURING:
- Where is this product manufactured? (specific factory location and country)
- Is it confirmed to share a platform with other brands? (name the shared brands and cite specific shared part numbers if available)
- Who owns the company? Any recent ownership changes?
- What percentage of components are manufactured in-house vs sourced? (Miele: motor laminations from ArcelorMittal, electronics from Gütersloh plant, 60% of plastics in-house — verify equivalent detail for this brand)

EXPERT & PROFESSIONAL OPINION:
- What does Yale Appliance / Steve Sheinkopf say about this specific product?
- What do repair technicians on r/appliancerepair say about servicing this brand?
- How do professional kitchen designers rank this product?
- Are there specific models within the line to prefer or avoid?
- How does this product compare to its direct competitor one tier up and one tier down?

FIELD PERFORMANCE:
- Common issues reported by owners after 2+ years
- Known design flaws or component-generation issues (e.g., Bosch 2023-2024 control board reports)
- Real-world cleaning performance vs lab test results
- Real-world drying performance, especially on plastics
- Customer service reputation for warranty and post-warranty support

Prioritize sources from: Yale Appliance blog and YouTube (Steve Sheinkopf), Reviewed.com lab test data, r/appliancerepair (repair tech community), AppliancePartsPros forum, Consumer Reports, CNET appliance lab, RepairClinic/PartsDr/ApplianceVideo YouTube, UpFix board repair data, Marcone/Reliable Parts distributor catalogs, EPA ENERGY STAR certified product database, manufacturer spec sheets and parts diagrams. Cite all sources.
```

---

## THE SIX PRODUCTS TO RUN

1. **Miele G7000 Series dishwasher** (G7566 / G7766 models)
2. **Bosch 800 Series dishwasher** (SHP78CM5N or current equivalent)
3. **KitchenAid premium dishwasher** (KDTM series with 360° Max Jets third rack)
4. **Bosch 300 Series dishwasher**
5. **Whirlpool standard dishwasher** (WDT750SAKZ or current mid-range equivalent, $400-600 range)
6. **Samsung mid-range dishwasher** (DW80R series or current equivalent, $500-800 range)

---

## PRODUCT-SPECIFIC CONTEXT

Append this context to the end of the master template for each product. This steers Perplexity toward the specific data and components we need to verify.

### 1. Miele G7000 Series
*Additional context: Miele is the only confirmed vertical integrator in the category — ArcelorMittal supplies electrical steel from Eisenhüttenstadt for motor laminations, Gütersloh plant produces electronics, Euskirchen plant (410 employees) produces motor components, final dishwasher assembly at Uničov Czech Republic plant with Stäubli robotics. Verify this supply chain for the G7000 specifically. Miele claims 20-year design life tested at 5,600 cycles — is this independently verified or just a marketing claim? Yale 2026 service rate 5.6% but was 20.5% in 2020 — what specific component generation caused the 2019-2020 spike? Was it motor, control board, or another component? AutoDos PowerDisk adds a motor-driven detergent pump to the door — owner forums document dispenser failures at 3-5 years on G6000/G7000 — verify frequency. Miele guarantees 15 years parts availability post-production — verify this is a published policy, not just marketing. Miele drain pump PN 11019512 covers G3xx through G7xxx — confirm. Circulation pump replacement documented at $800+ for multi-part failures — verify typical cost range.*

### 2. Bosch 800 Series
*Additional context: BSH platform sharing is confirmed at the part-number level: control boards 00746432, 00676960, 00475225, 11031054 are cross-listed for Bosch/Thermador/Gaggenau. Circulation pump 00442548 is cross-listed Bosch/Thermador/Kenmore. Verify these specific part numbers apply to the current 800 Series (SHP78CM5N or equivalent). Motor/pump supplier likely Sisme (Italian) based on component geometry but not confirmed — can you identify the actual motor supplier from parts documentation? CrystalDry zeolite: BSH has not disclosed natural vs synthetic zeolite or the supplier — any information? Zeolite delivers up to 176°F at basket level — verify. Reddit late-2025 threads report control board issues on 2023-2024 production — AppliancePartsPros forum confirms cold solder joint at heater relay as primary Bosch board failure mode — is this the same issue? UpFix stocks 97 Bosch dishwasher board SKUs for component-level repair — verify. Newer generation circulation pump 00665510/00753351 is $334 special-order — verify current pricing.*

### 3. KitchenAid Premium (KDTM series)
*Additional context: Whirlpool/KitchenAid platform sharing confirmed: circulation pump Askoll M309 (Whirlpool PN W11612327/W11084656) is shared. Drain pump W10348269 is shared with Whirlpool, Amana, Maytag, Kenmore, Jenn-Air, LG, IKEA, and others — the most widely shared commodity drain pump in the industry ($32 aftermarket, $71 OEM). KitchenAid control board includes additional logic for ProDry fan, diverter motor for 360° Max Jets, two-stage filter sensing, ProWash load sensing — boards NOT interchangeable with standard Whirlpool despite shared platform. Verify these specific component relationships. 360° Max Jets third rack is manifold-redirected from main circulation (hydraulically driven, no separate pump) — verify and assess whether this creates wash intensity dependency on pump health. SatinGlide Max ball-bearing rack rails vs standard Whirlpool nylon rollers — verify. Door balance link 8194001 has documented plastic cracking at anchor point — community reports metal replacement exists — verify. Yale 2026 service rate 8.2%, was 7.4% in 2025.*

### 4. Bosch 300 Series
*Additional context: The critical question is confirming exactly which BSH components are identical to the 800 and which are downgraded. Pass 2 research confirms: same filter across all BSH tiers, same motor/pump platform, same control board platform. The 300 differs in: full SS tub (vs hybrid on 100), AutoAir drying (door pops open — NOT zeolite), 46 dBA (vs 42 on 800), basic rack adjustability, basic third rack tray. Verify these specific shared/different components. AutoAir relies on condensation + steam release — does it require full SS tub to work? (Confirmed: condensation drying degrades with hybrid/plastic tub.) Cleaning performance is claimed to be identical to 800 in independent tests — verify with Reviewed.com or CNET data. AquaStop leak protection is standard on 300+ — verify. This model represents the professional quality floor per Yale — where does cleaning and drying performance actually land in independent testing vs the 500 and 800?*

### 5. Whirlpool Standard
*Additional context: Whirlpool drain pump W10348269 ($32 aftermarket, $71 OEM) fits 10+ brand labels — the most universal commodity part in the appliance industry. Circulation pump is Askoll M309 (same as KitchenAid). Verify: at the $400-600 price point, does standard Whirlpool use a plastic tub or stainless? What motor type — is it still brushless inverter at this price, or does it drop to induction? What filter type — grinder (old American standard) or mesh? Does it have AquaStop-equivalent leak protection or just a float switch? Whirlpool is absent from Yale's dataset — find Consumer Reports subscriber survey data, J.D. Power 2025, and r/appliancerepair consensus. Repair techs consistently describe the drain pump as the most common Whirlpool failure — cheap, easy, fast fix — verify typical cost ($70-90 parts + $100-150 labor?). How do repair techs compare Whirlpool to Bosch 300 at similar price points? The control board — is it the same platform as KitchenAid but with reduced firmware, or a completely different board?*

### 6. Samsung Mid-Range
*Additional context: CRITICAL CORRECTION from Pass 2: Samsung parts ARE available at RepairClinic and Samsung direct. The problem is NOT parts availability — it is technician availability. Many U.S. markets have no authorized Samsung repair technician. Reframe: parts_availability should be "proprietary_available" not "proprietary_limited." The full penalty lands on service_network_coverage. Verify: how many authorized Samsung dishwasher repair technicians operate nationally? What is the typical wait time for Samsung warranty service in a major metro vs secondary market? Document specific failure modes with part numbers if possible: water-wall belt mechanism failure (what part?), rack degradation/tray dissolving (what material? nylon or PVC?), error code patterns, leak incidence. Samsung's control board — is authorized service required for replacement, or plug-and-play? Does Samsung use a dual-board architecture like GE Profile? The $66,913 water damage claim from a seam defect documented on Reddit/Houzz — verify the source and whether Samsung acknowledged the defect. At the component level, Samsung uses stainless tubs, brushless inverter motors, and competitive specs — the deep dive should explain specifically why the professional consensus is so negative despite these components.*

---

## NOTES
- Run each as a separate Perplexity deep dive query
- Expected output: 15-50K chars, 15-40+ sources per product
- Save each raw output — these become the curation file inputs for the pipeline
- Yale Appliance (Steve Sheinkopf) is the primary authority for dishwashers (Pool S) — equivalent to StarCraft for faucets
- The master template now names specific suppliers (Askoll, Sisme, Nidec, Hanning), specific part numbers (W10348269, W11612327, 00746432), and specific failure modes (heater relay cold solder, impeller jam from filter bypass). This specificity is what pulls Perplexity into repair tech forums and parts documentation instead of consumer reviews.
- Whirlpool and Samsung: may return thinner Yale data since Yale doesn't sell these brands in volume. That's expected — alternative reliability sources carry more weight for these products.
- Samsung correction: previous deep dive prompts incorrectly stated parts were unavailable. Pass 2 confirms parts ARE available — the gap is technician coverage. Product-specific context reflects this correction.
- After deep dives return: compare findings against calibration script assumptions. Update axis scores and rescore if component data differs from assumptions. This is expected (happened for faucets: Waterstone Geann correction, California Faucets split, Delta ZAMAK).
