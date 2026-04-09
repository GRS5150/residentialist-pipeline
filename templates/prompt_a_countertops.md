# The Residentialist — Countertops Category Research Queries
## Engineered Quartz, Natural Stone, Porcelain, Ultra-Compact, Solid Surface
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
Who independently tests residential countertop materials and what do they measure?

I'm building a product intelligence platform that scores residential countertop materials on Quality, Performance, Durability, and Material Safety. I need to understand the testing landscape before I score anything. Engineered quartz, natural stone (granite, marble, quartzite, soapstone), porcelain slab, ultra-compact surface (Dekton, Lapitec), and solid surface (Corian, Hi-Macs).

Specifically:

1. What standardized tests exist for residential countertops? (ASTM C97 water absorption, ASTM C99 flexural strength, ASTM C170 compressive strength, ASTM C241 abrasion resistance, ASTM C880 flexural testing, Mohs hardness scale, EN 14617 for engineered stone, NSF/ANSI 51 food contact, GREENGUARD/GREENGUARD Gold VOC emissions, UL certification. What does each actually measure and what creates meaningful spread?)

2. What are the measurable specs with real numeric spread across brands? I need continuous metrics, not binary pass/fail. What specs create meaningful differentiation between premium (Caesarstone, Cambria, Dekton) and builder-grade (generic Asian imports, solid surface)? Think: quartz content percentage, resin content and type, flexural strength, water absorption rate, heat resistance (max temp before damage), scratch resistance (Mohs), impact resistance, UV stability, stain resistance by substance.

3. Who does independent comparative testing? (Karin Kirk / Countertop Investigator — geology-based independent analysis, Consumer Reports countertop ratings, Natural Stone Institute, Marble Institute of America, university materials testing labs, any independent fabricator doing side-by-side durability comparisons)

4. What reliability data exists in the public domain? (Fabricator warranty claim rates, class-action lawsuits — particularly Cambria cracking/chipping claims, Silestone anti-bacterial claims litigation, natural stone radon testing databases, documented failure mode databases by material type)

5. What are the key construction differentiators between premium and builder-grade countertop materials? (quartz-to-resin ratio, resin system type: polyester vs acrylic vs hybrid, pigment technology: natural mineral vs recycled glass vs synthetic, slab thickness: 2cm vs 3cm, backing mesh quality, edge profile engineering, consistency of mitered edges)

6. Are there any independent reviewers doing physical testing or side-by-side material analysis? (Karin Kirk's comparative posts, fabricator community testing, any materials scientists or geologists publishing accessible countertop comparisons?)

Focus on sources that a product rating organization could cite with confidence. Skip marketing materials and manufacturer claims. I need the testing infrastructure, not the sales pitch.
```

**Save output as:** `knowledge/countertops/countertops_testing_framework.md`

---

## Pass 2 — Component Deep Dive (Query 2)

**Purpose:** Go inside the materials. Map the manufacturing processes, resin systems, mineral sourcing, and what actually determines quality at the production level.

```
I'm building an independent product intelligence platform that scores residential countertop materials at the component level. I've already mapped the testing landscape and brand hierarchy. Now I need to understand the actual manufacturing, composition, and quality determinants for each material type.

ENGINEERED QUARTZ — MANUFACTURING PROCESS:
- Breton (Treviso, Italy) invented the process. How many manufacturers use licensed Breton technology vs reverse-engineered processes?
- Quartz content: Caesarstone (93% quartz, 7% resin per published data), Cambria (what's their actual ratio?), Silestone, LG Viatera, Hanwha Radianz, MSI Q Quartz — published or tested composition ratios?
- Resin system type: who uses unsaturated polyester, who uses acrylic-modified, who uses proprietary blends? Does resin type correlate with heat resistance and yellowing?
- Pigment technology: which brands use natural mineral pigments vs recycled glass vs synthetic? Does this affect durability?
- Manufacturing consistency: single-slab production (one factory, one batch) vs multi-source (slabs from India, China, Turkey, Brazil mixed under one brand)?
- Known quality variance: which brands have documented lot-to-lot color or structural consistency issues?

NATURAL STONE — SOURCING & QUALITY:
- Granite sourcing: Brazil (Marrom Imperial, Absolute Black), India (Black Galaxy, Tan Brown), Italy (Bianco Romano), Norway (Blue Pearl, Emerald Pearl) — are there measurable quality differences by origin?
- Quartzite authentication: true quartzite (metamorphic) vs mislabeled marble/dolomite in the market — how widespread is the labeling problem? Which "quartzites" are actually soft stone?
- Marble: Calacatta vs Statuario vs Carrara — beyond aesthetics, are there measurable hardness/durability differences?
- Soapstone: Virginia Soapstone (single US source) vs Brazilian imports — composition and quality differences?
- Water absorption rates by stone type — actual tested numbers, not category averages
- Radon emissions: AARST testing data for granite by variety — is this a real consumer concern or overblown?

ULTRA-COMPACT / SINTERED STONE:
- Dekton (Cosentino): sintering process at 25,000°C+ and 25,000 tons of pressure — confirmed specs? Raw materials: glass, porcelain, quartz — what ratio?
- Lapitec: how does their process differ from Dekton? Same sintered category?
- Neolith: composition and process? Manufacturing location?
- These products claim near-zero porosity — independent testing confirmation?
- Heat resistance: Dekton claims no thermal shock damage — has this been independently verified? The reported field cracking near cooktops — what's the root cause?

PORCELAIN SLAB:
- Who manufactures porcelain slabs? (Laminam from Italy, Florim/Magnum, ABK, SapienStone, The Size/Coverlam) — are US-market "porcelain countertops" from these factories or Chinese production lines?
- Thickness and structure: 6mm, 12mm, 20mm — with or without backing substrate? Which is structurally sound for kitchen use?
- Fabrication challenges: why do fabricators charge more? Chipping risk? Diamond tooling requirements?

SOLID SURFACE:
- Corian (DuPont/now CorStar Capital): acrylic vs polyester vs hybrid resin. Corian = PMMA (polymethyl methacrylate) — confirmed?
- Hi-Macs (LG Hausys): same PMMA base as Corian?
- Staron (Samsung): composition vs Corian/Hi-Macs?
- These are all repairable/renewable surfaces — that's the selling point. What are the actual limitations?
- Thermoforming capability: which can do seamless curves and integrated sinks? Temperature limits?
- Heat resistance: the documented weakness — at what temperature does damage begin? Thermal shock testing results?

MATERIAL SAFETY:
- VOC emissions from engineered quartz: which brands have GREENGUARD Gold? Which fail?
- Resin off-gassing: is there data showing long-term VOC emission from quartz countertops post-installation?
- Natural stone sealer chemistry: which sealers contain PFAS? Is there a PFAS-free alternative that works?
- Silicosis risk: strictly a fabrication/manufacturing hazard — confirm this is NOT a consumer in-home concern
- Radon from granite: EPA/AARST position — is this a measured consumer risk or not?

PLATFORM SHARING / CORPORATE:
- Cosentino: Silestone + Dekton + Sensa — same company, different technologies. Component sharing?
- Cambria: family-owned (Davis family, Le Sueur MN) — entire production at one US factory? Confirmed?
- Caesarstone: Sdot Yam, Israel + Georgia, USA + manufacturing in India, China? Quality consistency across plants?
- MSI (M S International): distribution/import company or manufacturer? Where do MSI Q Quartz slabs actually come from?
- LG Hausys: Hi-Macs (solid surface) + Viatera (quartz) — manufacturing overlap?

Prioritize sources from: fabricator communities (r/Stonefabrication, StoneForum), Karin Kirk / Countertop Investigator, Natural Stone Institute, trade publications, manufacturer spec sheets, materials testing databases. Cite all sources.
```

**Save output as:** `knowledge/countertops/countertops_component_analysis.md`

---

## Pass 3 — Competitive Hierarchy: Top (Query 3)

**Purpose:** Establish where the top brands and material types sit relative to each other.

```
How do professionals rank the top residential countertop materials and brands against each other?

Specifically comparing Cambria (US-made engineered quartz), Caesarstone (Israeli/global), Dekton (ultra-compact sintered), premium natural quartzite (Taj Mahal, Super White verified), premium granite (Absolute Black, Blue Pearl), and Virginia Soapstone. What separates the best from the merely excellent?

Focus on professional fabricator opinions, independent testing data (Karin Kirk / Countertop Investigator, Natural Stone Institute), geologist analysis, and construction-level differences — not marketing claims. What do fabricators, kitchen designers, and stone specialists who work with these products daily say about relative quality?

I'm interested in: material composition and purity, manufacturing consistency (lot-to-lot variation), structural integrity (flexural strength, impact resistance), resistance profile (heat, stain, scratch, UV), warranty terms and execution, repairability, and long-term appearance retention. Premium products only — what performs best when price is not the primary constraint?
```

**Save output as:** `knowledge/countertops/countertops_hierarchy_top.md`

---

## Pass 4 — Competitive Hierarchy: Middle and Bottom (Query 4)

**Purpose:** Establish where the line falls between good and mediocre, and what sits at the floor.

```
Where do professionals draw the line between a good residential countertop material and a mediocre one? Which brands and materials sit on that line?

Specifically: How do professionals rank Silestone, LG Viatera, Hanwha Radianz, MSI Q Quartz, Allen + Roth (Lowe's house brand), Corian (solid surface), Hi-Macs, generic imported quartz (Vicostone, Compac, Santa Margherita), laminate (Formica, Wilsonart), and big-box "granite Special" imports?

I need: reliability and complaint data where available, professional fabricator opinions on material quality, documented warranty claim issues (Cambria chipping class-action, Silestone anti-bacterial marketing settlement), which materials fabricators warn clients away from, which imported quartz brands have known consistency problems, and where the floor of acceptable quality sits for residential countertops.

Focus on the line between "good enough for a quality home" and "builder-grade filler that will show its age in 5 years." What materials and brands do kitchen designers and experienced fabricators refuse to install? What do long-term owners (5+ years) report failing first?
```

**Save output as:** `knowledge/countertops/countertops_hierarchy_bottom.md`

---

## Calibration Product Candidates (Pre-Research)

Pending confirmation after research results reviewed:

| Tentative Tier | Brand/Material | Notes |
|---|---|---|
| Tier 1 | Cambria | US-made engineered quartz (Le Sueur, MN), family-owned, single-source |
| Tier 1 | Dekton (Cosentino) | Ultra-compact sintered surface, near-zero porosity claims |
| Tier 1-2 | Premium Natural Quartzite | True metamorphic quartzite — Taj Mahal, Super White verified |
| Tier 2 | Caesarstone | Global manufacturer, multiple plant locations |
| Tier 2-3 | Silestone (Cosentino) | Major brand — anti-bacterial marketing settlement, needs hierarchy |
| Tier 3 | LG Viatera / Hanwha Radianz | Korean manufacturers — needs quality positioning |
| Tier 3-4 | Corian (Solid Surface) | Repairable but heat-vulnerable, lower durability |
| Tier 4 | MSI Q Quartz / Generic Import | Import/distribution model — quality consistency concerns |

**Scope:** Residential countertops. Engineered quartz, natural stone, ultra-compact, porcelain slab, solid surface. NOT laminate, NOT butcher block, NOT concrete.

---

*Run these four queries in order. Review all four outputs together before building config.*
