# HVAC Deep Dive Prompts — Perplexity (per-product)
## Post-Pass 2: Named component suppliers, compressor OEMs, failure modes included
## Scope: Central AC & Heat Pumps (split systems only)
## Created April 1, 2026

---

# QUERY TEMPLATE

```
Research [PRODUCT NAME] for an independent product quality assessment. I need expert-level construction and component analysis, not consumer shopping advice. This is a residential central air conditioner / heat pump split system (outdoor unit + indoor air handler).

COMPRESSOR:
- What specific compressor model is used? (Copeland scroll — which model? ZP, ZPK, ZPD series? Danfoss? Proprietary?)
- Is it single-stage, two-stage, or variable-speed/inverter?
- If variable-speed: true DC inverter or modulating? What is the modulation range (e.g., 25-100%, 40-100%)?
- Who manufactures the compressor? (Copeland/Emerson, Danfoss, Bristol/NIDEC, Daikin, Mitsubishi, or in-house)
- What refrigerant does it use? (R-410A, R-454B, R-32)
- Is the compressor the same unit used in other brands from the same parent company? (e.g., Carrier/Bryant/Heil shared components — verify specific compressor model)
- What are the documented compressor failure modes for this specific unit? (scroll tip seal wear, liquid slugging, internal relief valve failure, bearing failure)
- What is the typical compressor lifespan for this type/model?
- What does a compressor replacement cost? (parts only, then parts + labor including refrigerant recovery/recharge)

CONDENSER COIL:
- What type of condenser coil? (copper tube/aluminum fin traditional, all-aluminum microchannel, Trane Spine Fin)
- If microchannel: which specific lines use microchannel? Is this unit microchannel or traditional?
- What coil coating/corrosion protection is applied? (WeatherShield, Quantum coil, BlueShield, DuraGuard, none)
- What is the documented coil lifespan for this construction type?
- What does a condenser coil replacement cost? (parts + labor + refrigerant)
- Are there documented corrosion issues in coastal or chemical environments?
- Is the coil repairable (leak repair via brazing) or replace-only?

EXPANSION DEVICE:
- What type of expansion device? (fixed orifice/piston, TXV thermostatic expansion valve, EEV electronic expansion valve)
- If TXV: where is the sensing bulb mounted? Is sensing bulb migration a documented issue?
- If EEV: who manufactures it? Is it integrated into the control board or standalone?
- Does the expansion device type affect real-world efficiency vs rated SEER2?

CONTROL BOARD & COMMUNICATING SYSTEM:
- What is the main control board part number?
- Is this a communicating system? (Carrier Infinity, Trane ComfortLink II, Lennox iComfort, Goodman ComfortBridge/ComfortNet, York Hx3)
- Does the communicating system require a proprietary thermostat, or can a standard 24V thermostat be used?
- Who manufactures the PCB assemblies?
- What are the documented control board failure modes? (power surge damage, capacitor aging, moisture intrusion, relay failure)
- What does a control board replacement cost?
- Can the board be repaired at component level, or is it replace-only?

FAN MOTOR:
- What type of condenser fan motor? (PSC, ECM, variable-speed brushless DC)
- Who manufactures the fan motor? (Regal Rexnord/GE Industrial, Nidec, Broad-Ocean, proprietary)
- Fan blade: composite or stamped steel?
- What does a fan motor replacement cost?

CABINET & CONSTRUCTION:
- What gauge steel is the cabinet?
- What type of powder coat finish?
- Louvered coil guard or mesh guard?
- Base pan: fully welded or stamped? Drain provisions?
- What is the outdoor unit footprint and weight? (indicates material quantity)

PERFORMANCE SPECIFICATIONS:
- What is the AHRI-certified SEER2 rating? (cite AHRI Directory listing if possible)
- What is the EER2 rating?
- If heat pump: What is the HSPF2 rating?
- What is the manufacturer-rated sound level (dBA)?
- What is the rated cooling capacity (BTU/h)?
- If heat pump: What is heating capacity at 47°F and at 17°F? What is COP at 47°F and 17°F?
- What is the minimum operating temperature? (for heat pumps)
- Is it ENERGY STAR certified? ENERGY STAR Most Efficient? What CEE tier?
- What is the maximum static pressure capability (in. w.c.)?

RELIABILITY & SERVICE DATA:
- Is there any published service rate data for this brand? (Consumer Reports reliability surveys, J.D. Power data, repair tech community consensus)
- What are the top 3 most common failure modes documented by HVAC repair technicians? (cite r/HVAC, HVAC-Talk, YouTube repair channels)
- What is the typical system lifespan for this product class?
- What is the professional consensus on this brand's reliability vs competitors?

WARRANTY:
- What is the compressor warranty term? (standard and registered)
- What is the parts warranty term? (standard and registered)
- Is labor warranty included from the manufacturer, or dealer-dependent?
- How do contractors rate the warranty claim process for this brand? (easy, standard, difficult)
- Is the warranty transferable to a new homeowner?

PARTS & SERVICEABILITY:
- Where are replacement parts available? (Carrier Enterprise, Trane Supply, GEMAIRE, Ferguson, Johnstone Supply, independent distributors)
- Is this brand proprietary distribution or open? Can any supply house stock parts?
- Can any HVAC contractor service this unit, or does it require brand-certified technicians?
- Does the communicating system require proprietary diagnostic tools?
- What is the typical lead time for the most common repair parts?
- How do replacement part prices for this brand compare to competitors? (control board, condenser coil, compressor, fan motor)

PLATFORM SHARING & CORPORATE:
- What parent company owns this brand?
- What other brands share the same or similar platform? (Carrier/Bryant/Heil, Trane/American Standard, Goodman/Amana/Daikin, Rheem/Ruud, York/Coleman)
- If platform sharing exists: which specific components are identical vs different between brand siblings?
- Where is this unit manufactured?
- Has the brand changed ownership recently? Any corporate risk factors?

PROFESSIONAL OPINION:
- What do HVAC contractors say about this specific unit on r/HVAC, HVAC-Talk, and trade forums?
- Would professional installers recommend this unit to a homeowner? Under what conditions?
- How does this unit compare to its closest competitors in the same price range?
- Is installation quality sensitivity high or low for this product? (Does it need a great installer, or does a mediocre one still get acceptable results?)

CERTIFICATIONS & SAFETY:
- UL 1995 / CSA C22.2 listing confirmed?
- AHRI certified? (cite directory listing number if available)
- Any documented safety recalls or service bulletins?
- Refrigerant type and safety classification (A1, A2L)

Focus on expert sources: HVAC technician forums (r/HVAC, HVAC-Talk), Consumer Reports, AHRI Directory, manufacturer spec sheets, trade publications (ACHR News, HPAC Engineering), YouTube HVAC channels. Cite all sources.
```

---

## PRODUCT: Carrier Infinity 24VNA (Variable-Speed)
slug: carrier_infinity

Product-specific context: Carrier's top-of-line residential split system with Greenspeed Intelligence. Copeland variable-speed scroll compressor (verify specific model — ZPD series?). Infinity communicating system integrates outdoor unit, air handler, thermostat. WeatherArmor cabinet. SEER2 rated up to 24.0. Part of Carrier/Bryant/Heil/ICP family — Bryant Evolution 180B uses same platform, different badge. Manufactured at Collierville, TN. Carrier Global (NYSE: CARR) publicly traded, Fortune 500.

Key verification targets: (1) Confirm Copeland ZPD compressor model, (2) Confirm traditional copper/aluminum coil on Infinity (vs microchannel on some Carrier lines), (3) Infinity communicating system — does it REQUIRE Infinity thermostat or work with Ecobee/Nest via adapter?, (4) WeatherArmor cabinet — what gauge steel?, (5) Confirm SEER2 from AHRI Directory, (6) Any documented inverter board failure issues?, (7) Parts availability via Carrier Enterprise vs independent distributors.

---

## PRODUCT: Trane XV20i (Variable-Speed)
slug: trane_xv

Product-specific context: Trane's flagship residential variable-speed split system. TruComfort variable-speed technology. Uses Copeland compressor (verify — some Trane lines use Climatuff). Proprietary Spine Fin condenser coil (not traditional copper/aluminum). ComfortLink II communicating system. Tyler, TX manufacturing. Trane Technologies (formerly Ingersoll Rand) publicly traded. American Standard AccuComfort is sibling — different tier within same parent, NOT badge-engineered.

Key verification targets: (1) Confirm compressor OEM — Copeland or Climatuff on XV20i specifically, (2) Spine Fin coil: what is the construction exactly? Durability vs traditional copper/aluminum? Repair vs replace economics?, (3) ComfortLink II — proprietary thermostat required?, (4) 12-year compressor warranty (registered) — is this confirmed?, (5) How does XV20i differ from American Standard AccuComfort Platinum at component level?, (6) Sound rating — manufacturer claim vs independent measurement.

---

## PRODUCT: Lennox SL28XCV (Variable-Speed)
slug: lennox_sl28xcv

Product-specific context: Lennox's flagship variable-speed — highest SEER2 in ducted residential (up to 28 SEER2). SilentComfort technology (as low as 56 dB). iComfort communicating system. Copeland compressor (verify specific model). Known for most proprietary ecosystem in the industry — parts 15-20% more expensive, Lennox-only distributors, warranty claims rated most difficult by contractors. Lennox International (NYSE: LII) publicly traded. Manufacturing in Stuttgart, AR. Does NOT badge-engineer — owns Armstrong (air handlers), some internal component sharing only.

Key verification targets: (1) Confirm compressor OEM and model, (2) Confirm SEER2 28 from AHRI Directory — is this for specific configuration only?, (3) iComfort: does it REQUIRE iComfort thermostat? Can a standard 24V thermostat work?, (4) Parts pricing comparison: condenser coil, control board, compressor vs Carrier/Trane/Goodman equivalent parts, (5) Any documented inverter board or iComfort system failures?, (6) Do Lennox-authorized contractors confirm the proprietary parts headache, or is it overstated?, (7) Sound rating 56 dB — independent confirmation?

---

## PRODUCT: Rheem Prestige RA20 (Two-Stage)
slug: rheem_prestige

Product-specific context: Rheem's premium two-stage air conditioner / heat pump. Positioned as the "Toyota Camry" of HVAC by contractor consensus — reliable, not exciting. Copeland two-stage scroll compressor (verify). TXV expansion. ECM fan motor. Rheem Manufacturing Company is privately held subsidiary of Paloma Industries (Japan). Ruud = same unit, different distribution channel (Rheem = contractor, Ruud = wholesale/supply-house). Fort Smith, AR manufacturing. Open parts ecosystem — any supply house stocks Rheem parts.

Key verification targets: (1) Confirm Copeland compressor on Prestige line specifically, (2) Rheem Prestige vs Rheem Classic — what differs at component level? (different compressor, different board, or just feature set?), (3) Confirm Rheem/Ruud are genuinely identical units, (4) Warranty claim process — contractors rate Rheem as "easy" — confirm, (5) Any known reliability issues with Rheem Prestige specifically?, (6) Two-stage comfort benefit — does it deliver meaningful dehumidification improvement over single-stage?

---

## PRODUCT: Goodman GSXC18 (Two-Stage)
slug: goodman_gsxc18

Product-specific context: Goodman's mid-tier two-stage air conditioner. Daikin-owned since 2012. Key question: has Daikin ownership meaningfully improved quality vs pre-acquisition Goodman? Copeland two-stage scroll (verify — has Daikin migrated their own compressors into Goodman lines?). TXV expansion. ECM condenser fan. Lifetime compressor warranty (verify: genuinely claimable). Widest parts availability in industry: GEMAIRE, Ferguson, Johnstone Supply. Amana = same unit with better warranty marketing. Houston, TX / Fayetteville, TN manufacturing. Daikin Industries (Japan) — world's largest HVAC manufacturer.

Key verification targets: (1) Is compressor Copeland or Daikin on current GSXC18?, (2) What Daikin technology has migrated into Goodman since 2012 acquisition?, (3) Lifetime compressor warranty: genuinely claimable? What are the actual terms/exclusions?, (4) Is Goodman GSXC18 a Daikin platform or legacy Goodman platform?, (5) How does GSXC18 compare to Daikin Fit at component level?, (6) Current reliability — do repair techs see post-Daikin improvement in the field, or is quality still inconsistent?

---

## PRODUCT: Goodman GSX14 (Single-Stage Builder-Grade)
slug: goodman_gsx14

Product-specific context: Builder-grade floor. Single-stage, fixed orifice (piston). PSC fan motor. This is what goes in $300K-600K tract homes across the US. 14.3 SEER2 — at or near code minimum. Daikin-owned. Lifetime compressor warranty exists even on base model. Simple design = fewer things to break. Expected lifespan 8-10 years per repair tech consensus. Amana ASX14 = badge-engineered equivalent. Houston, TX manufacturing. Lowest cost system in the Goodman lineup.

Key verification targets: (1) Confirm Copeland single-stage scroll compressor (or is this a less expensive compressor?), (2) Confirm fixed orifice — is this a literal piston or restrict-o-disc?, (3) PSC vs ECM fan motor — confirm PSC on GSX14, (4) Cabinet gauge steel — confirm light gauge, (5) What does a typical GSX14 system cost installed?, (6) What is actual field lifespan — do these make it to 15 years or fail at 8-10?, (7) Is the lifetime compressor warranty genuinely transferable?, (8) Any documented quality differences between pre-2012 and post-2012 (Daikin) GSX-series base models?

