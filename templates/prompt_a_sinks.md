# Sinks — Research Queries (prompt_a)

**Scope:** Kitchen sinks (stainless steel, fireclay, cast iron, composite) and bathroom sinks (vitreous china, fireclay). NOT commercial/industrial, NOT utility/laundry sinks.
**Sub-types:** kitchen_stainless, kitchen_fireclay, kitchen_cast_iron, kitchen_composite, bathroom_vitreous_china, bathroom_fireclay
**Methodology:** Shares with faucets — material quality and construction method drive the score. Performance axis is flat (P=0.10).

---

## Pass 1 — Landscape Survey

```
Who independently tests residential kitchen and bathroom sinks and what do they measure?

I'm building a product intelligence platform that scores residential sinks on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything.

Specifically:

1. What standardized tests exist for residential sinks? (ASME A112.19.3/CSA B45.4 for stainless, ASME A112.19.2/CSA B45.1 for ceramic/fireclay, ANSI Z124 for composite/plastic — what do these actually test?)

2. What are the measurable specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium and builder-grade? (gauge thickness, steel grade, firing temperature, stone-to-resin ratio, etc.)

3. Who does independent comparative testing? (labs, consumer publications, professional reviewers doing side-by-side analysis for sinks specifically)

4. What reliability data exists in the public domain? (failure rate databases, plumber service call patterns, common failure modes by material type)

5. What are the key construction differentiators between premium and builder-grade sinks? (materials, construction methods, engineering details that professionals cite as quality signals)

6. Are there any independent reviewers doing physical teardowns or side-by-side component analysis — someone doing the equivalent of what StarCraft Reviews does for faucets?

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

---

## Pass 2 — Component Deep Dive

```
I'm building an independent product intelligence platform that scores residential sinks at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual construction inside these products.

STAINLESS STEEL CONSTRUCTION:
- What specific steel grades are used? T-304 (18/8 chromium-nickel) vs T-316 (marine-grade with molybdenum) vs 200-series (budget) vs 400-series (magnetic, lower corrosion resistance)?
- Which brands use which grades? Does Kohler use T-304 across all lines or does the retail line use lower grades?
- What gauges do each brand actually use? Kraus TRU16 certification — is this genuine or marketing? Elkay gauge claims? 
- Construction methods: zero-radius welded (CNC precision) vs tight-radius vs drawn/pressed vs stamped. Which method for which brand?
- Sound deadening systems: what's inside the pads? Rubber vs foam? Coverage percentage? Spray coating thickness? Kraus NoiseDefend vs Elkay Sound Guard vs Blanco InFino?
- Drain engineering: which brands engineer proper basin slope? Which have pooling issues?

FIRECLAY CONSTRUCTION:
- Firing temperatures: Rohl Shaws (Darwen Lancashire) vs Kohler fireclay vs DeerValley vs imported Chinese fireclay. Is there a real temperature differential?
- Clay composition: what makes premium fireclay different from standard ceramic?
- Glaze process: single-coat vs multi-coat? Thickness? Chip resistance testing?
- Known failure modes: cracking patterns, thermal shock susceptibility, glaze crazing?

CAST IRON CONSTRUCTION:
- Enamel technology: Kohler's proprietary process vs American Standard vs budget cast iron. What's the actual difference in enamel thickness and composition?
- Iron quality: casting consistency, wall thickness, foreign vs domestic.
- Known failure modes: enamel chipping patterns, rusting under chips, thermal shock?

COMPOSITE CONSTRUCTION:
- Blanco Silgranit formula: exactly what ratio of granite to acrylic? What patents protect it?
- Kohler Neoroc: composition details?
- Franke Fragranite? Elkay Quartz Luxe? Other composite formulas?
- Known failure modes: heat delamination temperature, chemical sensitivity, color fading?

BATHROOM — VITREOUS CHINA:
- What differentiates premium vitreous china from budget? Firing temperature? Glaze thickness? Clay purity?
- Kohler vs TOTO vs American Standard — is there a measurable construction difference in bathroom sinks?

PLATFORM SHARING:
- Kohler Co: which lines share construction across Kohler, Kallista (luxury), Sterling (value)? Same factory?
- Fortune Brands: Moen, Rohl, Perrin & Rowe — any sink platform sharing?
- Elkay: does the same factory make Elkay and Dayton (budget line)?
- Are there OEM relationships where one factory makes sinks for multiple brands?

Prioritize sources from: plumber communities, repair data, manufacturer spec sheets, trade publications. Cite all sources.
```

---

## Pass 3 — Competitive Hierarchy Top

```
How do professionals rank the top residential sink brands against each other?

Specifically comparing Rohl Shaws, Kohler (Whitehaven cast iron, Kohler fireclay), Blanco (Silgranit), Franke, Native Trails, and Julien/Ruvati (premium stainless). What separates the best from the merely excellent?

Focus on professional installer opinions, independent service/reliability data, and construction-level differences — not marketing claims. What do professionals who work with these products daily say about relative quality? Which brands do kitchen designers and plumbers actively recommend for $2-5M homes?
```

---

## Pass 4 — Competitive Hierarchy Bottom

```
Where do professionals draw the line between a good residential sink and a mediocre one? Which brands sit on that line?

Specifically: How do professionals rank Elkay, Kraus, Ruvati, American Standard, Moen, Delta, DeerValley, Lordear, and Glacier Bay in the professional hierarchy?

I need: reliability data where available, professional plumber and installer opinions on construction quality, known problems by brand, which brands professionals actively warn against, and where the floor of acceptable quality sits. Focus on the line between "good enough for a quality home" and "builder-grade filler." What brands do plumbers and kitchen designers refuse to specify?
```

---

*Save outputs to `knowledge/sinks/sinks_testing_framework.md` (Pass 1), `knowledge/sinks/sinks_component_analysis.md` (Pass 2), `knowledge/sinks/sinks_hierarchy_top.md` (Pass 3), `knowledge/sinks/sinks_hierarchy_bottom.md` (Pass 4).*
