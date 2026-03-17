#!/usr/bin/env node
/**
 * export_intel.js — NotebookLM Intelligence Export
 * 
 * Generates two NotebookLM-ready markdown files from pipeline data:
 *   1. {category}_101_course.md  — Category fundamentals & education
 *   2. {category}_field_intel.md — Contractor sentiment by brand
 * 
 * Usage:
 *   node export_intel.js windows
 *   node export_intel.js windows --course1-only
 *   node export_intel.js windows --course2-only
 *   node export_intel.js windows --include-pool-c
 * 
 * Output: exports/notebooklm/{category}_101_course.md
 *         exports/notebooklm/{category}_field_intel.md
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── CONFIG ────────────────────────────────────────────────────────────────────

const ROOT         = __dirname;
const EVIDENCE_DIR = path.join(ROOT, 'evidence');
const INPUTS_DIR   = path.join(ROOT, 'inputs');
const KNOWLEDGE_DIR= path.join(ROOT, 'knowledge');
const CHECKLIST_DIR= path.join(ROOT, 'source_checklists');
const EXPORT_DIR   = path.join(ROOT, 'exports', 'notebooklm');

// Pools to include in Course 2 (Field Intel)
const INCLUDED_POOLS = ['A', 'B'];

// ─── CLI PARSING ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const category = args.find(a => !a.startsWith('--'));
const course1Only  = args.includes('--course1-only');
const course2Only  = args.includes('--course2-only');
const includePoolC = args.includes('--include-pool-c');

if (!category) {
  console.log('Usage: node export_intel.js <category> [--course1-only] [--course2-only] [--include-pool-c]');
  console.log('Example: node export_intel.js windows');
  process.exit(1);
}

if (includePoolC) {
  INCLUDED_POOLS.push('C');
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return null;
  }
}

function readTextSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return null;
  }
}

function stripHtml(text) {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').trim();
}

function anonymizeText(text) {
  if (!text) return '';
  return text
    .replace(/\bReddit\s+user\b/gi, 'Forum user')
    .replace(/\bon\s+Reddit\b/gi, 'in online forums')
    .replace(/\breddit\b/gi, 'trade forum')
    .replace(/\br\/\w+/gi, 'online trade community')
    .replace(/\bGBA\b/g, 'building science community')
    .replace(/\bGreenBuildi[a-z]*/gi, 'building science community')
    .replace(/\bGreen\s*Building\s*Advisor\b/gi, 'building science community')
    .replace(/\bFinehomebuilding\b/gi, 'trade publication')
    .replace(/\bFine\s*Homebuilding\b/gi, 'trade publication')
    .replace(/\bFHB\b/g, 'trade publication')
    .replace(/\bJLC\b/g, 'trade publication')
    .replace(/\bjlconline\.com/gi, 'trade publication')
    .replace(/\bu\/\w+/gi, 'trade professional')
    .replace(/forums\.trade publication\.com/gi, 'trade publication forums');
}

function anonymizeSourceName(name) {
  return anonymizeText(name);
}

function getProductDisplayName(filename) {
  // Convert filename like "andersen_400_series_dh" to "Andersen 400 Series"
  const name = filename
    .replace(/_dh\.json$/, '')
    .replace(/_dh$/, '')
    .replace(/_/g, ' ');
  
  // Title case with special handling
  const specialNames = {
    'alpen zenith zr7': 'Alpen Zenith ZR-7',
    'andersen 100 series': 'Andersen 100 Series',
    'andersen 400 series': 'Andersen 400 Series',
    'andersen aseries': 'Andersen A-Series',
    'andersen eseries': 'Andersen E-Series',
    'jeldwen v2500': 'Jeld-Wen V-2500',
    'loewen': 'Loewen',
    'marvin integrity': 'Marvin Integrity',
    'marvin signature ultimate': 'Marvin Signature Ultimate',
    'milgard tuscany': 'Milgard Tuscany',
    'pella 250 series': 'Pella 250 Series',
    'pella impervia': 'Pella Impervia',
    'ply gem pro series': 'Ply Gem Pro Series',
    'reliabilt 3500': 'ReliaBilt 3500',
    'sierra pacific': 'Sierra Pacific',
    'simonton reflections 5500': 'Simonton Reflections 5500',
    'window world 4000': 'Window World 4000',
  };
  
  return specialNames[name] || name.replace(/\b\w/g, c => c.toUpperCase());
}

// ─── DATA LOADING ──────────────────────────────────────────────────────────────

function loadAllEvidence(category) {
  const files = fs.readdirSync(EVIDENCE_DIR).filter(f => f.endsWith('.json'));
  const products = [];
  
  for (const file of files) {
    const data = readJsonSafe(path.join(EVIDENCE_DIR, file));
    if (!data) continue;
    if ((data.category || '').toLowerCase() !== category.toLowerCase()) continue;
    
    products.push({
      filename: file,
      displayName: getProductDisplayName(file),
      data
    });
  }
  
  // Sort alphabetically by display name
  products.sort((a, b) => a.displayName.localeCompare(b.displayName));
  return products;
}

function loadResearchBaselines(category) {
  const baselines = {};
  const files = fs.readdirSync(INPUTS_DIR).filter(f => f.endsWith('_research_baseline.md'));
  
  for (const file of files) {
    const content = readTextSafe(path.join(INPUTS_DIR, file));
    if (!content) continue;
    
    // Match to product by filename pattern
    const key = file.replace('_research_baseline.md', '').replace('_dh', '');
    baselines[key] = content;
  }
  
  return baselines;
}

function loadEvalKnowledge(category) {
  const catDir = path.join(KNOWLEDGE_DIR, category);
  if (!fs.existsSync(catDir)) return null;
  
  const files = fs.readdirSync(catDir).filter(f => f.includes('eval_knowledge'));
  if (files.length === 0) return null;
  
  // Pick the latest version
  files.sort();
  return readTextSafe(path.join(catDir, files[files.length - 1]));
}

function loadMaterialSafety(category) {
  const catDir = path.join(KNOWLEDGE_DIR, category);
  if (!fs.existsSync(catDir)) return null;
  
  const files = fs.readdirSync(catDir).filter(f => f.includes('material_safety'));
  if (files.length === 0) return null;
  
  files.sort();
  return readTextSafe(path.join(catDir, files[files.length - 1]));
}

function loadVerifiedSources(category) {
  const filePath = path.join(KNOWLEDGE_DIR, category, 'verified_field_sources.json');
  return readJsonSafe(filePath);
}

function loadSourceChecklist(category) {
  const filePath = path.join(CHECKLIST_DIR, `${category}.json`);
  return readJsonSafe(filePath);
}

// ─── COURSE 1: CATEGORY 101 ───────────────────────────────────────────────────

function buildCourse1(category, products, baselines, evalKnowledge, materialSafety, checklist, verifiedSources) {
  const today = new Date().toISOString().split('T')[0];
  const productNames = products.map(p => p.displayName).join(', ');
  
  let doc = '';
  
  // Header
  doc += `# ${capitalize(category)} 101 — The Residentialist Education Brief\n\n`;
  doc += `Generated: ${today}\n`;
  doc += `Category: ${capitalize(category)}\n`;
  doc += `Products covered: ${productNames}\n\n`;
  doc += `---\n\n`;
  
  // How to use
  doc += `## How to Use This Document\n\n`;
  doc += `Drop this file into Google NotebookLM as a source document. You can then have a conversation with it — ask questions, request summaries, or explore specific topics. Examples:\n\n`;
  doc += `- "What's the difference between vinyl and fiberglass windows?"\n`;
  doc += `- "Explain U-factor in simple terms"\n`;
  doc += `- "Compare the warranty coverage across all products"\n`;
  doc += `- "Who are the most trusted experts in this space and why?"\n\n`;
  doc += `---\n\n`;
  
  // Section 1: Category Fundamentals
  doc += `## Section 1: Category Fundamentals\n\n`;
  doc += buildFundamentalsSection(category, evalKnowledge, baselines);
  doc += `\n---\n\n`;
  
  // Section 2: Who Are The Experts
  doc += `## Section 2: Who Are The Experts\n\n`;
  doc += buildExpertsSection(evalKnowledge, checklist, verifiedSources);
  doc += `\n---\n\n`;
  
  // Section 3: Product Profiles
  doc += `## Section 3: Product-by-Product Technical Profiles\n\n`;
  for (const product of products) {
    doc += buildProductProfile(product, baselines);
    doc += `\n`;
  }
  doc += `---\n\n`;
  
  // Section 4: Standards & Certifications
  doc += `## Section 4: Industry Standards & Certifications\n\n`;
  doc += buildStandardsSection(category, evalKnowledge, checklist);
  doc += `\n---\n\n`;
  
  // Section 5: Terminology
  doc += `## Section 5: Key Terminology\n\n`;
  doc += buildGlossarySection(category, baselines);
  doc += `\n---\n\n`;
  
  // Section 6: Material Safety
  doc += `## Section 6: Material Safety Overview\n\n`;
  if (materialSafety) {
    // Extract the useful parts, skip internal pipeline instructions
    const lines = materialSafety.split('\n');
    const usefulLines = lines.filter(l => 
      !l.includes('Bot ') && 
      !l.includes('pipeline') && 
      !l.includes('scoring') &&
      !l.includes('rubric')
    );
    doc += usefulLines.join('\n');
  } else {
    doc += `Material safety information not yet compiled for this category.\n`;
  }
  
  return doc;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildFundamentalsSection(category, evalKnowledge, baselines) {
  let section = '';
  
  if (category === 'windows') {
    section += `### What Are Residential Windows?\n\n`;
    section += `Residential windows serve three functions: they let in light, they provide ventilation, and they act as a thermal barrier between inside and outside. The quality of that thermal barrier — and how long it lasts — is what separates a $200 window from a $2,000 window.\n\n`;
    
    section += `### Major Material Types\n\n`;
    section += `**Vinyl (PVC/uPVC):** The most common and affordable option. Made from extruded polyvinyl chloride. Pros: low cost, no painting required, decent thermal performance. Cons: can warp in extreme heat, limited color options (paint doesn't adhere well), some environmental concerns about PVC production and disposal. Most big-box store windows are vinyl.\n\n`;
    section += `**Fiberglass (Pultruded):** Stronger and more dimensionally stable than vinyl. Made by pulling glass fibers through resin. Pros: excellent thermal performance, paintable, doesn't warp, expands/contracts at nearly the same rate as glass (reduces seal failure). Cons: more expensive than vinyl, fewer manufacturers.\n\n`;
    section += `**Aluminum-Clad Wood:** A wood frame (typically pine, fir, or mahogany) wrapped in aluminum on the exterior. Pros: the warmth and aesthetics of wood inside, the weather resistance of aluminum outside, excellent structural strength, paintable. Cons: most expensive option, wood requires some maintenance on interior, heavier.\n\n`;
    section += `**Composite:** A blend of materials (wood fibers and polymers, or fiberglass and other materials). Pros: can combine benefits of multiple materials. Cons: varies widely by manufacturer, harder to evaluate as a category.\n\n`;
    
    section += `### Common Window Configurations\n\n`;
    section += `**Double-Hung (DH):** Both the top and bottom sash slide up and down. Most popular style in residential construction. Both sashes typically tilt inward for cleaning.\n\n`;
    section += `**Single-Hung:** Only the bottom sash moves. Simpler, slightly cheaper, slightly better air sealing than double-hung.\n\n`;
    section += `**Casement:** Hinged on one side, cranks open outward. Better air sealing than hung windows because the sash presses against the frame when closed. Common in modern and energy-focused homes.\n\n`;
    section += `**Awning:** Hinged at the top, opens outward from the bottom. Good for ventilation during rain.\n\n`;
    section += `**Fixed/Picture:** Doesn't open. Best thermal and air sealing performance since there are no operable parts.\n\n`;
    
    section += `### Key Performance Metrics\n\n`;
    section += `**U-Factor:** Measures how much heat passes through the window. Scale: 0.15 to 1.20. Lower is better — it means less heat escapes. A U-factor of 0.30 is good; 0.20 is excellent; 0.15 is passive-house level.\n\n`;
    section += `**SHGC (Solar Heat Gain Coefficient):** Measures how much solar radiation passes through. Scale: 0 to 1. Lower means less solar heat enters. In hot climates you want low SHGC; in cold climates, higher SHGC can help with passive solar heating.\n\n`;
    section += `**VT (Visible Transmittance):** How much visible light passes through. Higher means more natural light. Typically 0.30 to 0.70.\n\n`;
    section += `**Air Infiltration:** How much air leaks through the window when it's closed. Measured in CFM per square foot (cfm/ft²). Lower is better. Good: 0.30 or less. Excellent: 0.10 or less. Passive house level: 0.01-0.03.\n\n`;
    section += `**Design Pressure (DP):** Measures structural strength — how much wind pressure the window can withstand. Higher is better. DP35 is minimum code in most areas. DP50+ is recommended for high-wind zones.\n\n`;
  } else {
    // Generic fundamentals for other categories
    section += `Category fundamentals for ${category} will be populated as products are scored and research baselines are built.\n\n`;
  }
  
  return section;
}

function buildExpertsSection(evalKnowledge, checklist, verifiedSources) {
  let section = '';
  
  if (evalKnowledge) {
    // Extract expert information from eval knowledge
    // Look for Category 2 expert section
    const expertMatch = evalKnowledge.match(/### CATEGORY 2:.*?(?=### CATEGORY 3:|---|\n## )/s);
    if (expertMatch) {
      // Clean up for readability
      let expertText = expertMatch[0];
      // Remove internal scoring rules
      expertText = expertText.replace(/\*\*Scoring rule:\*\*.*/g, '');
      section += expertText + '\n\n';
    }
    
    // Extract Category 3 (trade publications)
    const tradeMatch = evalKnowledge.match(/### CATEGORY 3:.*?(?=### CATEGORY 4:|---|\n## )/s);
    if (tradeMatch) {
      let tradeText = tradeMatch[0];
      tradeText = tradeText.replace(/\*\*Scoring rule:\*\*.*/g, '');
      section += tradeText + '\n\n';
    }
    
    // Extract Category 4 (field sources) — but anonymize
    const fieldMatch = evalKnowledge.match(/### CATEGORY 4:.*?(?=---|\n## )/s);
    if (fieldMatch) {
      let fieldText = fieldMatch[0];
      // Keep the general description but remove specific reddit references
      const fieldIntro = fieldText.match(/### CATEGORY 4:.*?\n\n.*?\n\n.*?\n\n/s);
      if (fieldIntro) {
        section += `### Field Professionals\n\n`;
        section += `Trade professionals — installers, glaziers, carpenters, repair technicians — who share product opinions in online forums. These are the people who see what happens to products after the spec sheet ends. They know which frames crack at year seven, which hardware seizes up, which products are nightmares to flash. Their knowledge is experiential and long-duration.\n\n`;
        section += `When an installer with hundreds of installations says a product has problems, that opinion was formed over years of callbacks and warranty work. This is the most reliable signal for real-world quality and durability.\n\n`;
      }
    }
  }
  
  // Add verified field source stats (anonymized)
  if (verifiedSources && verifiedSources.sources) {
    section += `### Verified Trade Professionals in Our Database\n\n`;
    section += `We have ${verifiedSources.sources.length} verified trade professionals whose opinions are tracked. Qualification criteria:\n\n`;
    const crit = verifiedSources.qualification_criteria;
    if (crit) {
      section += `- Minimum ${crit.minimum_brands_discussed || 3} different brands discussed\n`;
      section += `- Active in professional trade communities for ${crit.minimum_account_age_months || 12}+ months\n`;
      section += `- No commercial affiliation with manufacturers or dealers\n`;
      section += `- Demonstrated hands-on installation or service experience\n\n`;
    }
    
    // List professions only (no usernames)
    section += `Professions represented:\n\n`;
    const professions = [...new Set(verifiedSources.sources.map(s => s.profession).filter(Boolean))];
    for (const prof of professions) {
      section += `- ${prof}\n`;
    }
    section += `\n`;
  }
  
  return section;
}

function buildProductProfile(product, baselines) {
  let section = `### ${product.displayName}\n\n`;
  
  const data = product.data;
  
  // Basic info
  section += `**Manufacturer:** ${data.product || product.displayName}\n`;
  section += `**Configuration:** ${(data.config || 'DH').toUpperCase()}\n`;
  
  // Component quality
  const cq = data.component_quality || {};
  if (cq.quality_tier) {
    section += `**Quality tier:** ${cq.quality_tier}\n`;
  }
  if (cq._note) {
    section += `**Construction:** ${cq._note}\n`;
  }
  
  // Manufacturing
  const mq = data.manufacturing_quality || {};
  if (mq.business_model) {
    const modelLabels = {
      'manufacturer_own_factory': 'Manufacturer-owned factory',
      'contract_manufacturer': 'Contract manufactured',
      'mixed': 'Mixed manufacturing'
    };
    section += `**Manufacturing:** ${modelLabels[mq.business_model] || mq.business_model}\n`;
  }
  
  // Performance data
  const perf = data.performance || {};
  section += `\n**Performance Data:**\n`;
  
  if (perf.thermal) {
    const t = perf.thermal;
    if (t.u_factor) {
      section += `- U-Factor: ${t.u_factor}`;
      if (t.u_factor_source) section += ` (${t.u_factor_source})`;
      section += `\n`;
    } else {
      section += `- U-Factor: Not published by manufacturer\n`;
    }
  }
  
  if (perf.structural) {
    const s = perf.structural;
    if (s.design_pressure) {
      section += `- Design Pressure: DP${s.design_pressure}\n`;
    }
    if (s.aama_class) {
      section += `- AAMA Class: ${s.aama_class}\n`;
    }
  }
  
  if (perf.air_water) {
    const aw = perf.air_water;
    if (aw.air_infiltration) {
      section += `- Air Infiltration: ${aw.air_infiltration} cfm/ft²\n`;
    }
  }
  
  // Repairability
  const rep = data.repairability || {};
  if (rep.igu_replacement_method) {
    const methods = {
      'glass_swap': 'Glass-only swap (easier, cheaper repair)',
      'sash_replacement': 'Full sash replacement required',
      'full_unit': 'Full unit replacement required'
    };
    section += `\n**Repairability:** ${methods[rep.igu_replacement_method] || rep.igu_replacement_method}\n`;
  }
  if (rep._note) {
    section += `${rep._note}\n`;
  }
  
  // Try to pull warranty and construction details from research baseline
  const baselineKey = product.filename.replace('.json', '').replace(/_dh$/, '');
  // Try multiple possible keys
  const possibleKeys = [
    baselineKey,
    baselineKey.replace('_dh', ''),
    product.data.product ? product.data.product.toLowerCase().replace(/[^a-z0-9]/g, '_') : null
  ].filter(Boolean);
  
  let baseline = null;
  for (const key of possibleKeys) {
    if (baselines[key]) {
      baseline = baselines[key];
      break;
    }
  }
  
  // Also try partial match
  if (!baseline) {
    for (const [bKey, bVal] of Object.entries(baselines)) {
      if (baselineKey.includes(bKey) || bKey.includes(baselineKey.replace('_dh', ''))) {
        baseline = bVal;
        break;
      }
    }
  }
  
  if (baseline) {
    // Extract warranty section
    const warrantyMatch = baseline.match(/###?\s*Warranty.*?\n([\s\S]*?)(?=###?\s|\n## |$)/i);
    if (warrantyMatch) {
      section += `\n**Warranty:**\n${warrantyMatch[1].trim()}\n`;
    }
    
    // Extract glazing/IGU info
    const glazingMatch = baseline.match(/###?\s*Glazing.*?\n([\s\S]*?)(?=###?\s|\n## |$)/i);
    if (glazingMatch) {
      section += `\n**Glazing System:**\n${glazingMatch[1].trim()}\n`;
    }
  }
  
  section += `\n`;
  return section;
}

function buildStandardsSection(category, evalKnowledge, checklist) {
  let section = '';
  
  if (category === 'windows') {
    section += `### NFRC (National Fenestration Rating Council)\n`;
    section += `Independent testing body that certifies window thermal performance. Tests U-factor, SHGC, VT, and air leakage under standardized conditions. An NFRC label is required for Energy Star certification. This is the gold standard for thermal performance data — if a manufacturer publishes a U-factor, it should be NFRC certified.\n\n`;
    
    section += `### AAMA/FGIA (American Architectural Manufacturers Association / Fenestration & Glazing Industry Alliance)\n`;
    section += `Tests and certifies structural performance, water resistance, and air infiltration. AAMA grades windows into performance classes: R (Residential), LC (Light Commercial), CW (Commercial), AW (Architectural). Higher class = more stringent testing. Also certifies paint finish durability: AAMA 2603 (basic), AAMA 2604 (high performance), AAMA 2605 (superior — Kynar/PVDF).\n\n`;
    
    section += `### Energy Star\n`;
    section += `U.S. EPA program certifying energy efficiency. Windows must meet climate-zone-specific U-factor and SHGC thresholds. Energy Star certification requires NFRC-tested performance data. Most Stringent criteria are the tightest tier.\n\n`;
    
    section += `### PHI / PHIUS (Passive House Institute / Passive House Institute US)\n`;
    section += `Certifies windows for passive house construction — the most demanding energy standard. Requires extremely low U-factors (typically 0.14 or below for the full assembly). Few windows qualify.\n\n`;
    
    section += `### IGMA (Insulating Glass Manufacturers Alliance)\n`;
    section += `Certifies insulated glass unit (IGU) quality and longevity. IGMA certification means the sealed glass assembly has passed accelerated aging tests.\n\n`;
    
    section += `### International Standards\n\n`;
    section += `**Canada:** CSA A440 is the Canadian window performance standard. NRCan (Natural Resources Canada) runs the Canadian Energy Star program with criteria adapted for Canadian climate zones.\n\n`;
    section += `**Europe:** ift Rosenheim is the primary European testing authority. European windows are rated using Uw values (whole-window U-value) in W/(m²·K). To compare: multiply the European Uw by 0.176 to approximate the NFRC U-factor. CE marking is required for windows sold in the EU.\n\n`;
    
    section += `### Greenguard / Greenguard Gold\n`;
    section += `UL-certified indoor air quality standard. Tests for VOC (volatile organic compound) emissions. Greenguard Gold is the stricter tier, originally designed for schools and healthcare facilities.\n\n`;
  } else {
    section += `Standards and certifications for ${category} will be populated as the category knowledge base is built.\n\n`;
  }
  
  return section;
}

function buildGlossarySection(category, baselines) {
  let section = '';
  
  if (category === 'windows') {
    const terms = [
      ['U-Factor', 'How much heat passes through the window. Lower number = better insulation. Measured by NFRC testing. Range: 0.15 (excellent) to 1.20 (poor for modern windows).'],
      ['SHGC', 'Solar Heat Gain Coefficient. How much solar energy passes through the glass. Lower = less heat gain. Important in hot climates.'],
      ['VT', 'Visible Transmittance. How much visible light passes through. Higher = brighter room.'],
      ['IGU', 'Insulated Glass Unit. The sealed glass assembly — two or three panes with gas fill between them. The heart of any modern window.'],
      ['Low-E Coating', 'Low-emissivity coating applied to glass. Reflects infrared heat while allowing visible light through. Different Low-E types for different climates.'],
      ['Argon / Krypton Fill', 'Inert gases injected between glass panes to reduce heat transfer. Argon is standard; krypton is denser and better but more expensive.'],
      ['Warm-Edge Spacer', 'The spacer bar between glass panes at the edge of the IGU. "Warm edge" spacers (stainless steel, foam, or composite) reduce heat loss at the glass edge compared to aluminum spacers.'],
      ['Air Infiltration', 'How much air leaks through the window when closed. Measured in cfm/ft² (cubic feet per minute per square foot). Lower is better.'],
      ['Design Pressure (DP)', 'Structural rating for wind resistance. DP35 is residential minimum. DP50+ recommended for exposed locations.'],
      ['AAMA 2605', 'The highest paint finish standard for aluminum cladding. Uses Kynar 500 / PVDF resin. Resists fading, chalking, and weathering for 20+ years.'],
      ['AAMA 2604', 'Mid-tier paint finish standard. Good performance but not as durable as 2605.'],
      ['AAMA 2603', 'Basic paint finish standard. Adequate for protected applications.'],
      ['Pultruded Fiberglass', 'Manufacturing process where glass fibers are pulled through resin. Creates a strong, dimensionally stable frame material.'],
      ['Extruded Aluminum', 'Aluminum pushed through a die to create frame profiles. Stronger and more precise than roll-formed aluminum.'],
      ['Roll-Form Aluminum', 'Aluminum bent into shape from flat sheet. Less precise than extruded. Used on lower-cost clad windows.'],
      ['Mortise and Tenon', 'Traditional woodworking joint where a projecting piece fits into a hole. Stronger than mitered (angled) joints. Sign of higher-quality wood window construction.'],
      ['Sash', 'The movable part of the window that holds the glass. In a double-hung, there are two sashes.'],
      ['Flashing', 'Weather-resistant material installed around the window frame to prevent water intrusion. Proper flashing is critical — many "window failures" are actually flashing failures.'],
      ['Nailing Fin', 'A flat flange around the window frame used to attach it to the wall framing. Integral nailing fins are stronger than applied ones.'],
      ['Muntin / Grille', 'Bars that divide the window glass into smaller panes. Can be true divided (actual separate panes), simulated divided (applied to surface), or grilles-between-glass (GBG, inside the IGU).'],
    ];
    
    for (const [term, definition] of terms) {
      section += `**${term}:** ${definition}\n\n`;
    }
  } else {
    section += `Terminology for ${category} will be populated as products are scored.\n\n`;
  }
  
  return section;
}


// ─── COURSE 2: FIELD INTEL ─────────────────────────────────────────────────────

function buildCourse2(category, products, verifiedSources) {
  const today = new Date().toISOString().split('T')[0];
  const productNames = products.map(p => p.displayName).join(', ');
  
  // Count total sources across all products
  let totalSources = 0;
  let totalPoolA = 0;
  let totalPoolB = 0;
  
  for (const product of products) {
    const sources = (product.data.professional_consensus || {}).sources || [];
    for (const s of sources) {
      if (INCLUDED_POOLS.includes(s.pool)) {
        totalSources++;
        if (s.pool === 'A') totalPoolA++;
        if (s.pool === 'B') totalPoolB++;
      }
    }
  }
  
  let doc = '';
  
  // Header
  doc += `# ${capitalize(category)} Field Intel — The Residentialist Sentiment Brief\n\n`;
  doc += `Generated: ${today}\n`;
  doc += `Category: ${capitalize(category)}\n`;
  doc += `Products covered: ${productNames}\n`;
  doc += `Sources included: Pool A (professional building science) and Pool B (verified trade professionals)\n`;
  doc += `Total source entries: ${totalSources} (${totalPoolA} Pool A, ${totalPoolB} Pool B)\n\n`;
  doc += `---\n\n`;
  
  // How to use
  doc += `## How to Use This Document\n\n`;
  doc += `Drop this file into Google NotebookLM as a source document. You can then explore contractor sentiment by asking questions like:\n\n`;
  doc += `- "What do contractors really think about [Brand]?"\n`;
  doc += `- "What are the most common complaints across all brands?"\n`;
  doc += `- "Which products get the most praise from installers?"\n`;
  doc += `- "What patterns do you see in negative sentiment?"\n`;
  doc += `- "Compare what professionals say about [Brand A] vs [Brand B]"\n\n`;
  doc += `---\n\n`;
  
  // Cross-product themes
  doc += `## Cross-Product Themes\n\n`;
  doc += buildCrossProductThemes(products);
  doc += `\n---\n\n`;
  
  // Per-product sections
  for (const product of products) {
    doc += buildProductSentiment(product);
    doc += `---\n\n`;
  }
  
  return doc;
}

function buildCrossProductThemes(products) {
  let section = '';
  
  // Gather all included sources across products
  const allPositive = [];
  const allNegative = [];
  const allMixed = [];
  const allComplaints = [];
  const priceBiasCount = { total: 0, flagged: 0 };
  
  for (const product of products) {
    const sources = (product.data.professional_consensus || {}).sources || [];
    for (const s of sources) {
      if (!INCLUDED_POOLS.includes(s.pool)) continue;
      priceBiasCount.total++;
      if (s.price_bias) priceBiasCount.flagged++;
      
      const entry = { product: product.displayName, ...s };
      if (s.sentiment === 'positive') allPositive.push(entry);
      else if (s.sentiment === 'negative') allNegative.push(entry);
      else allMixed.push(entry);
    }
    
    const complaints = (product.data.manufacturing_quality || {}).complaints || [];
    for (const c of complaints) {
      allComplaints.push({ product: product.displayName, ...c });
    }
  }
  
  section += `Across ${products.length} products evaluated, ${allPositive.length} source entries were positive, ${allNegative.length} were negative, and ${allMixed.length} were mixed.\n\n`;
  
  if (priceBiasCount.flagged > 0) {
    section += `${priceBiasCount.flagged} of ${priceBiasCount.total} source entries were flagged for potential price bias — opinions that may reflect value sensitivity rather than actual product quality.\n\n`;
  }
  
  // Summarize positive themes
  if (allPositive.length > 0) {
    section += `### What Gets Praised\n\n`;
    const praiseByProduct = {};
    for (const s of allPositive) {
      if (!praiseByProduct[s.product]) praiseByProduct[s.product] = [];
      praiseByProduct[s.product].push(s.summary);
    }
    for (const [prod, summaries] of Object.entries(praiseByProduct)) {
      section += `**${prod}:** ${summaries.length} positive source entries\n`;
    }
    section += `\n`;
  }
  
  // Summarize negative themes
  if (allNegative.length > 0) {
    section += `### What Gets Criticized\n\n`;
    const critByProduct = {};
    for (const s of allNegative) {
      if (!critByProduct[s.product]) critByProduct[s.product] = [];
      critByProduct[s.product].push(s.summary);
    }
    for (const [prod, summaries] of Object.entries(critByProduct)) {
      section += `**${prod}:** ${summaries.length} negative source entries\n`;
    }
    section += `\n`;
  }
  
  // Complaint patterns
  if (allComplaints.length > 0) {
    section += `### Complaint Patterns\n\n`;
    const complaintTypes = {};
    for (const c of allComplaints) {
      const cls = c.classification || 'unclassified';
      if (!complaintTypes[cls]) complaintTypes[cls] = [];
      complaintTypes[cls].push(c.product);
    }
    for (const [cls, prods] of Object.entries(complaintTypes)) {
      section += `- **${cls}:** Reported for ${[...new Set(prods)].join(', ')}\n`;
    }
    section += `\n`;
  }
  
  return section;
}

function buildProductSentiment(product) {
  let section = `## ${product.displayName} — Field Sentiment\n\n`;
  
  const sources = (product.data.professional_consensus || {}).sources || [];
  const included = sources.filter(s => INCLUDED_POOLS.includes(s.pool));
  
  if (included.length === 0) {
    section += `No Pool A or Pool B sources available for this product.\n\n`;
    
    // Still show complaints if any
    const complaints = (product.data.manufacturing_quality || {}).complaints || [];
    if (complaints.length > 0) {
      section += `### Known Complaints\n\n`;
      for (const c of complaints) {
        section += `- **${c.classification || 'General'}:** ${anonymizeText(stripHtml(c.description))}\n`;
        if (c.evidence_level) section += `  Severity: ${c.evidence_level}\n`;
        if (c.note) section += `  ${anonymizeText(stripHtml(c.note))}\n`;
      }
      section += `\n`;
    }
    
    return section;
  }
  
  // Sentiment counts
  const positive = included.filter(s => s.sentiment === 'positive');
  const negative = included.filter(s => s.sentiment === 'negative');
  const mixed    = included.filter(s => s.sentiment === 'mixed');
  const poolA    = included.filter(s => s.pool === 'A');
  const poolB    = included.filter(s => s.pool === 'B');
  const priceBiased = included.filter(s => s.price_bias);
  
  section += `**Overall sentiment:** ${positive.length} positive, ${negative.length} negative, ${mixed.length} mixed\n`;
  section += `**Source quality:** ${poolA.length} Pool A, ${poolB.length} Pool B\n`;
  if (priceBiased.length > 0) {
    section += `**Price bias detected:** Yes (${priceBiased.length} source(s))\n`;
  }
  section += `\n`;
  
  // Positive
  if (positive.length > 0) {
    section += `### What Contractors Say — Positive\n\n`;
    for (const s of positive) {
      const name = anonymizeSourceName(s.name || '');
      const summary = anonymizeText(stripHtml(s.summary || ''));
      section += `- "${summary}" — ${name} (Pool ${s.pool})\n`;
      if (s.price_bias) {
        section += `  [Note: This opinion may reflect price sensitivity rather than product quality]\n`;
      }
      section += `\n`;
    }
  }
  
  // Negative
  if (negative.length > 0) {
    section += `### What Contractors Say — Negative / Concerns\n\n`;
    for (const s of negative) {
      const name = anonymizeSourceName(s.name || '');
      const summary = anonymizeText(stripHtml(s.summary || ''));
      section += `- "${summary}" — ${name} (Pool ${s.pool})\n`;
      if (s.price_bias) {
        section += `  [Note: This opinion may reflect price sensitivity rather than product quality]\n`;
      }
      section += `\n`;
    }
  }
  
  // Mixed
  if (mixed.length > 0) {
    section += `### What Contractors Say — Mixed\n\n`;
    for (const s of mixed) {
      const name = anonymizeSourceName(s.name || '');
      const summary = anonymizeText(stripHtml(s.summary || ''));
      section += `- "${summary}" — ${name} (Pool ${s.pool})\n`;
      if (s.price_bias) {
        section += `  [Note: This opinion may reflect price sensitivity rather than product quality]\n`;
      }
      section += `\n`;
    }
  }
  
  // Complaints
  const complaints = (product.data.manufacturing_quality || {}).complaints || [];
  if (complaints.length > 0) {
    section += `### Known Complaints\n\n`;
    for (const c of complaints) {
      section += `- **${c.classification || 'General'}:** ${anonymizeText(stripHtml(c.description))}\n`;
      if (c.evidence_level) section += `  Severity: ${c.evidence_level}\n`;
      if (c.note) section += `  ${anonymizeText(stripHtml(c.note))}\n`;
      section += `\n`;
    }
  }
  
  // Component quality
  const cq = product.data.component_quality || {};
  if (cq.quality_tier || cq._note) {
    section += `### Component Quality Summary\n\n`;
    if (cq.quality_tier) section += `- Quality tier: ${cq.quality_tier}\n`;
    if (cq._note) section += `- ${cq._note}\n`;
    section += `\n`;
  }
  
  return section;
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────

function main() {
  console.log(`\n📚 NotebookLM Intelligence Export`);
  console.log(`   Category: ${category}`);
  console.log(`   Pools: ${INCLUDED_POOLS.join(', ')}\n`);
  
  // Load data
  const products = loadAllEvidence(category);
  if (products.length === 0) {
    console.log(`❌ No evidence files found for category "${category}".`);
    console.log(`   Evidence directory: ${EVIDENCE_DIR}`);
    console.log(`   Make sure evidence files have "category": "${category}" in their JSON.`);
    process.exit(1);
  }
  
  console.log(`Found ${products.length} products: ${products.map(p => p.displayName).join(', ')}\n`);
  
  const baselines      = loadResearchBaselines(category);
  const evalKnowledge  = loadEvalKnowledge(category);
  const materialSafety = loadMaterialSafety(category);
  const checklist      = loadSourceChecklist(category);
  const verifiedSources= loadVerifiedSources(category);
  
  console.log(`Research baselines: ${Object.keys(baselines).length}`);
  console.log(`Eval knowledge: ${evalKnowledge ? 'loaded' : 'not found'}`);
  console.log(`Material safety: ${materialSafety ? 'loaded' : 'not found'}`);
  console.log(`Source checklist: ${checklist ? 'loaded' : 'not found'}`);
  console.log(`Verified sources: ${verifiedSources ? verifiedSources.sources.length + ' professionals' : 'not found'}\n`);
  
  // Ensure output directory
  ensureDir(EXPORT_DIR);
  
  // Build Course 1
  if (!course2Only) {
    console.log('Building Course 1: Category 101...');
    const course1 = buildCourse1(category, products, baselines, evalKnowledge, materialSafety, checklist, verifiedSources);
    const course1Path = path.join(EXPORT_DIR, `${category}_101_course.md`);
    fs.writeFileSync(course1Path, course1, 'utf-8');
    console.log(`  ✅ Saved: ${course1Path}`);
    console.log(`  📄 ${course1.split('\n').length} lines, ${course1.length} characters\n`);
  }
  
  // Build Course 2
  if (!course1Only) {
    console.log('Building Course 2: Field Intel...');
    const course2 = buildCourse2(category, products, verifiedSources);
    const course2Path = path.join(EXPORT_DIR, `${category}_field_intel.md`);
    fs.writeFileSync(course2Path, course2, 'utf-8');
    console.log(`  ✅ Saved: ${course2Path}`);
    console.log(`  📄 ${course2.split('\n').length} lines, ${course2.length} characters\n`);
  }
  
  console.log('Done! Upload the files to Google NotebookLM as source documents.\n');
}

main();
