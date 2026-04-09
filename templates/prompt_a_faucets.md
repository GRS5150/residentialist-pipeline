# The Residentialist — Faucets Category Research Queries
## Kitchen & Bath Faucets — Pull-Down, Pull-Out, Bar, Pot Filler, Lavatory
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
Who independently tests residential kitchen and bathroom faucets and what do they measure?

I'm building a product intelligence platform that scores residential faucets on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything. Kitchen pull-downs, pull-outs, bar faucets, pot fillers, and bathroom lavatory faucets.

Specifically:

1. What standardized tests exist for residential faucets? (ASME A112.18.1/CSA B125.1 — the master standard. NSF/ANSI 61 lead content and drinking water safety. NSF/ANSI 372 "lead-free" definition. ASSE 1016 mixing valve testing. CalGreen/AB953 California lead requirements. CSA Group compliance for Canadian market. Cartridge cycle testing — who tests and what protocols exist? What creates meaningful spread between premium and builder-grade?)

2. What are the measurable specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium (California Faucets, Waterstone, In2aqua) and builder-grade (Glacier Bay, AquaSource)? Think: cartridge cycle rating (500K, 1M, 2M, 4M, 5M cycles), body material (solid brass, stainless steel, ZAMAK zinc alloy, plastic), valve type (ceramic disc, ball valve, compression), finish technology (PVD vs electroplated), flow rate, maximum temperature limit.

3. Who does independent comparative testing? (StarCraft Custom Builders / Zach Pett — THE source for faucet teardowns and component analysis. Consumer Reports. Any plumbing industry labs doing side-by-side cartridge or finish durability testing?)

4. What reliability data exists in the public domain? (StarCraft Reviews ratings, plumber community consensus on failure rates, r/Plumbing feedback, manufacturer warranty claim rates where published, common failure modes by brand — cartridge failure, finish degradation, hose failure, spray head clogging, handle loosening)

5. What are the key construction differentiators between premium and builder-grade faucets? (body material: solid brass casting vs stainless steel bar stock vs ZAMAK zinc alloy vs plastic. Cartridge: ceramic disc (Flühs, Kerox, Sedal, Geann, generic) vs ball valve (Delta DST). Waterway: brass vs PEX vs silicone. Spray head: metal vs plastic, magnetic vs snap-in docking. Handle construction: solid brass vs hollow zinc. Mounting hardware: brass vs plastic.)

6. Are there any independent reviewers doing physical teardowns or side-by-side component analysis of residential faucets? (StarCraft Custom Builders — detailed cartridge, body, and finish analysis. Any others doing comparable work? plumbing trade publications? Who has opened faucets and named the cartridge suppliers?)

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

**Save output as:** `knowledge/faucets/faucets_testing_framework.md`

---

## Pass 2 — Component Deep Dive (Query 2)

**Purpose:** Go inside the products. Name the component suppliers, map the platform sharing, understand the failure modes at part level.

```
I'm building an independent product intelligence platform that scores residential faucets at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual components inside these products — who makes them, how they differ, and what fails.

CARTRIDGE / VALVE TECHNOLOGY (THE #1 SCORING DIFFERENTIATOR):
- Ceramic disc cartridge manufacturers: Flühs (Germany — premium, used in California Faucets), Kerox (Hungary — used in In2aqua, some Hansgrohe), Sedal (Spain — used in Brizo/Delta, some Kohler), Geann (Taiwan — used in Waterstone, some Moen),?"unknown Chinese" generics — who supplies whom exactly?
- Cartridge cycle ratings: Flühs published certification? Kerox PVD+ at 4M cycles? Sedal at what rating? Delta DST (Diamond Seal Technology) at 5M cycles? What are the actual independently-verified numbers?
- Delta DST: diamond-coated ceramic disc — is this genuinely different technology or marketing? How does the manufacturing process differ from standard ceramic disc? Which Delta/Brizo models have DST vs Sedal?
- Ball valve (Delta traditional): how does the ball valve compare to ceramic disc for longevity?
- Single-handle vs dual-handle cartridge differences — different suppliers?
- Cartridge replaceability: which brands use industry-standard cartridge sizes? Which use proprietary? Who stocks replacements? Flühs replacements available? Kerox?

BODY MATERIAL & CONSTRUCTION:
- Solid brass (forged/cast): California Faucets, Rohl, Brizo — which use forged vs cast? Low-lead brass alloy composition (ECO Brass, silicon bronze, DZR brass)?
- 316 stainless steel: Waterstone uses 316 SS bar stock — who else? Is SS body objectively better than brass for longevity?
- ZAMAK (zinc alloy): which brands use ZAMAK for the entire body vs just the handle/decorative shell? Delta Essa — confirmed ZAMAK body? Moen mid-range — where's the ZAMAK?
- Plastic body/internals: Glacier Bay, AquaSource, Amazon generics — any brand claiming quality that actually uses plastic waterways?
- Weight as proxy: what does a solid brass faucet weigh vs ZAMAK vs plastic? (StarCraft publishes weights)
- Lead-free compliance: NSF 372 is the floor. California AB953 is stricter. Which brands exceed the standard?

FINISH TECHNOLOGY:
- PVD (Physical Vapor Deposition): California Faucets (Lifetime PVD), Brizo (Brilliance), In2aqua, Graff — is PVD from different brands the same process? Who does the PVD coating? (Some brands outsource to PVD shops)
- Electroplated chrome: the industry default. Average lifespan before showing wear? 5 years? 10?
- Powder coat: some brands use for matte/specialty finishes. Durability vs PVD?
- Finish warranty: lifetime (California Faucets, Waterstone, Brizo) vs limited (Moen, Delta, Kohler). What's actually covered?
- StarCraft finish testing: what has StarCraft documented about finish quality by brand?

SPRAY HEAD & HOSE:
- Spray head materials: metal (brass, stainless) vs ABS plastic. Which brands use which?
- Magnetic vs snap-in docking: Kohler DockNetik, Delta MagnaTite, Moen Power Boost with Reflex — engineering differences?
- Hose material: braided nylon, braided stainless, silicone-lined, PEX. Which is most durable? Known hose failure modes?
- Check valve / backflow prevention: integrated vs separate. ASSE 1016 compliance?
- Spray function technology: boost/pause buttons, touchless, side spray, pot filler articulation

PLATFORM SHARING — SPECIFIC COMPONENT MAP:
- Fortune Brands Innovations (NYSE: FBIN): Moen, Rohl, Perrin & Rowe, Riobel, Shaws — which lines share platform components? Moen cartridge in Rohl? Same body casting factory?
- Delta Faucet Company (part of Masco): Delta, Brizo, Peerless — what's shared? Brizo DST = same as Delta DST? Peerless = Delta with cheaper finish? Same factories?
- Kohler Co: Kohler, Kallista (luxury), Sterling (value) — component sharing between Kohler kitchen and Kallista? Same factories?
- Hansgrohe/Axor (Masco Group affiliation?): — where are Hansgrohe faucets made? Kerox cartridges confirmed? Axor = Hansgrohe platform with design premium?
- California Faucets: Huntington Beach, CA manufacturing confirmed? All product domestic?
- Waterstone: Murrieta, CA manufacturing? True "made in USA" including all components?
- In2aqua: German-engineered, where manufactured?

PARTS & SERVICE ECOSYSTEM:
- Cartridge availability: which brands have cartridges at Home Depot/Lowe's/plumbing supply? Which require direct order or are discontinued within 10 years?
- Lifetime warranty execution: which brands actually ship parts free, no questions? Which brands make warranty claims adversarial?
- Plumber parts preference: what do plumbers stock and recommend for parts availability?
- Service life by price tier: $150 faucet lifespan vs $400 vs $800 vs $1500+ — professional consensus?

Prioritize sources from: StarCraft Custom Builders / Zach Pett (primary source for teardown data), plumber communities (r/Plumbing, Terry Love), manufacturer spec sheets, parts catalogs, trade publications. Cite all sources.
```

**Save output as:** `knowledge/faucets/faucets_component_analysis.md`

---

## Pass 3 — Competitive Hierarchy: Top (Query 3)

**Purpose:** Establish where the top brands sit relative to each other.

```
How do professionals rank the top residential faucet brands against each other?

Specifically comparing California Faucets, In2aqua, Waterstone, Brizo (DST cartridge models), Rohl, Graff, and Kallista. What separates the best from the merely excellent?

Focus on professional opinions, StarCraft Custom Builders ratings and teardown analysis, plumber feedback, and construction-level differences — not marketing claims. What do plumbers, kitchen designers, and faucet specialists who work with these products daily say about relative quality?

I'm interested in: cartridge brand and cycle rating, body material and construction method, finish technology (PVD vs electroplate), parts availability and warranty execution, spray head and hose engineering, and long-term durability. Which faucets do professionals install in $2M+ homes and why?
```

**Save output as:** `knowledge/faucets/faucets_hierarchy_top.md`

---

## Pass 4 — Competitive Hierarchy: Middle and Bottom (Query 4)

**Purpose:** Establish where the line falls between good and mediocre, and what sits at the floor.

```
Where do professionals draw the line between a good residential faucet and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank Moen (mid-range), Kohler (mid-range), Delta (non-DST models), Hansgrohe (non-Axor), American Standard, Pfister (Spectrum Brands), Kingston Brass, Kraus, Glacier Bay (Home Depot), AquaSource (Lowe's), and Amazon house-brand faucets in the professional hierarchy?

I need: StarCraft Reviews ratings where available, plumber community consensus, documented construction quality by brand (ZAMAK body vs brass, cartridge type, finish durability), known reliability problems, which brands professionals actively warn against, and where the floor of acceptable quality sits for residential faucets.

Focus on the line between "good enough for a quality home" and "builder-grade filler that will need replacing in 3-5 years." What brands do plumbers and kitchen designers refuse to install? What fails first on cheap faucets? Which "premium-looking" brands are actually ZAMAK and plastic inside?
```

**Save output as:** `knowledge/faucets/faucets_hierarchy_bottom.md`

---

## Calibration Product Candidates (Pre-Research)

Pending confirmation after research results reviewed:

| Tentative Tier | Brand | Notes |
|---|---|---|
| Tier 1 | California Faucets | Flühs cartridge, PVD finish, US-made (Huntington Beach), StarCraft near-perfect |
| Tier 1 | In2aqua | Kerox PVD+ 4M cycles, best warranty per StarCraft |
| Tier 1 | Waterstone | 316 SS bar stock body, Murrieta CA — Geann cartridges, no PVD |
| Tier 2 | Brizo (DST models) | DST cartridge 5M cycles, Brilliance PVD. China manufacturing, plastic wands |
| Tier 3 | Delta (DST models) | Same DST tech, ZAMAK shell + PEX waterway. Massive parts availability |
| Tier 3-4 | Moen | Proprietary cartridge, solid mid-range. Fortune Brands. Parts everywhere |
| Tier 4 | Pfister / American Standard | Budget mainstream — needs hierarchy confirmation |
| Tier 4-5 | Glacier Bay / Amazon | Big-box/import — documented quality floor |

**Scope:** Residential kitchen and bath faucets. Pull-down, pull-out, bar, pot filler, lavatory. NOT commercial, NOT utility.

---

*Run these four queries in order. Review all four outputs together before building config.*
