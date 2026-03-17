/**
 * PATCH for source_parser.js — Manufacturer Source Contamination Fix
 * 
 * This script patches the classifySource function and EXCLUDED_DOMAINS to:
 * 1. Add missing manufacturer domains (loewen.com, etc.)
 * 2. Add dynamic manufacturer-own detection for YouTube channels
 * 3. Add a new isManufacturerOwn() function for product-aware classification
 *
 * Deploy: node source_parser_patch.js [apply|dry-run]
 */

const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, 'source_parser.js');

// ── Step 1: Add missing manufacturer domains to EXCLUDED_DOMAINS ─────────────

const NEW_MANUFACTURER_DOMAINS = `  // Manufacturer sites (marketing, not independent opinion)
  'milgard.com',
  'andersenwindows.com',
  'pella.com',
  'jeld-wen.com',
  'marvin.com',
  'sierrapacificwindows.com',
  'simonton.com',
  'alpenwindows.com',
  'proviaproducts.com',
  'plygem.com',
  'loewen.com',                   // Loewen Windows
  'windowworldinc.com',           // Window World
  'windowworld.com',              // Window World (alternate)
  'harveywindows.com',            // Harvey Windows
  'harveybp.com',                 // Harvey Building Products
  'lincolnwindows.com',           // Lincoln Windows
  'weathershield.com',            // Weather Shield`;

const OLD_MANUFACTURER_DOMAINS = `  // Manufacturer sites (marketing, not independent opinion)
  'milgard.com',
  'andersenwindows.com',
  'pella.com',
  'jeld-wen.com',
  'marvin.com',
  'sierrapacificwindows.com',
  'simonton.com',
  'alpenwindows.com',
  'proviaproducts.com',
  'plygem.com',`;

// ── Step 2: Add manufacturer YouTube channel map ────────────────────────────

const MANUFACTURER_YOUTUBE_BLOCK = `
/**
 * Manufacturer-own YouTube channels — ALWAYS excluded from professional consensus.
 * These are marketing channels, not independent opinions.
 * Matched case-insensitively against video title + description.
 */
const MANUFACTURER_YOUTUBE_CHANNELS = [
  'loewen windows',        // @LoewenWindows
  'loewenwindows',         // Alternate matching
  'marvin windows',        // Marvin official
  'andersen windows',      // Andersen official
  'pella windows',         // Pella official
  'milgard windows',       // Milgard official
  'jeld-wen',              // JELD-WEN official (already excluded by domain, but belt-and-suspenders)
  'simonton windows',      // Simonton official
  'weather shield',        // Weather Shield official
  'lincoln windows',       // Lincoln official
  'harvey windows',        // Harvey official
  'alpen windows',         // Alpen official
  'sierra pacific windows', // Sierra Pacific official
  'window world',          // Window World official
];

/**
 * Manufacturer-own website domain patterns derived from MANUFACTURER_MAP.
 * Used for dynamic detection: given a product name, generate the likely
 * manufacturer domains and check if a source URL belongs to the manufacturer.
 *
 * Key insight: The static EXCLUDED_DOMAINS list only catches known domains.
 * This map lets us detect manufacturer-own sources even for new manufacturers
 * that haven't been manually added to EXCLUDED_DOMAINS yet.
 */
const MANUFACTURER_DOMAIN_PATTERNS = {
  'Andersen':       ['andersenwindows.com', 'andersen.com', 'renewalbyandersen.com'],
  'Marvin':         ['marvin.com', 'marvinwindows.com'],
  'Pella':          ['pella.com'],
  'Loewen':         ['loewen.com', 'technical.loewen.com'],
  'Milgard':        ['milgard.com'],
  'Jeld-Wen':       ['jeld-wen.com'],
  'Simonton':       ['simonton.com'],
  'Sierra Pacific':  ['sierrapacificwindows.com'],
  'Alpen':          ['alpenwindows.com', 'alpen.com'],
  'Ply Gem':        ['plygem.com'],
  'Window World':   ['windowworldinc.com', 'windowworld.com'],
  'Harvey':         ['harveywindows.com', 'harveybp.com'],
  'Lincoln':        ['lincolnwindows.com'],
  'Weather Shield': ['weathershield.com'],
  'Reliabilt':      ['lowes.com'],  // Lowe's house brand — already in Pool C
};

`;

// ── Step 3: The isManufacturerOwn function ─────────────────────────────────

const IS_MANUFACTURER_OWN_FUNCTION = `
/**
 * Check if a URL + title belongs to the manufacturer of the product being scored.
 * This is the DYNAMIC detection layer that catches manufacturer-own sources
 * even if they're not in the static EXCLUDED_DOMAINS list.
 *
 * @param {string} url      — Source URL
 * @param {string} title    — Source title
 * @param {string} domain   — Extracted domain from URL
 * @param {string} manufacturer — Manufacturer name (from extractManufacturer)
 * @returns {boolean}
 */
function isManufacturerOwn(url, title, domain, manufacturer) {
  if (!manufacturer) return false;
  const mfgLower = manufacturer.toLowerCase();

  // Check 1: Domain matches known manufacturer domain patterns
  const patterns = MANUFACTURER_DOMAIN_PATTERNS[manufacturer];
  if (patterns && patterns.some(d => domain === d || domain.endsWith('.' + d))) {
    return true;
  }

  // Check 2: YouTube — check if it's the manufacturer's own channel
  if (domain === 'youtube.com' || domain === 'youtu.be') {
    const titleLower = (title || '').toLowerCase();
    // Match manufacturer YouTube channels
    if (MANUFACTURER_YOUTUBE_CHANNELS.some(ch => titleLower.includes(ch))) {
      return true;
    }
    // Also match if channel name in title starts with manufacturer name
    // e.g., "Loewen - How We Build Our Windows" → manufacturer is Loewen
    if (titleLower.startsWith(mfgLower + ' ') || titleLower.startsWith(mfgLower + '-') || titleLower.startsWith(mfgLower + ':')) {
      return true;
    }
  }

  // Check 3: Domain contains manufacturer name
  // e.g., domain "loewen.com" contains "loewen", domain "marvinwindows.com" contains "marvin"
  if (mfgLower.length >= 4 && domain.includes(mfgLower)) {
    return true;
  }

  return false;
}

`;

// ── Step 4: Updated classifySource signature + manufacturer check ────────────

// The classifySource function needs a new optional parameter: productName
// After the EXCLUDED_DOMAINS check, add a manufacturer-own check

const OLD_CLASSIFY_SIGNATURE = `function classifySource(url, title, description) {`;
const NEW_CLASSIFY_SIGNATURE = `function classifySource(url, title, description, productName) {`;

// After the excluded domains check, add manufacturer-own detection
const OLD_EXCLUDED_CHECK = `  } else if (EXCLUDED_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
    pool        = 'excluded';
    source_type = 'excluded_domain';
  } else if (POOL_A_DOMAINS`;

const NEW_EXCLUDED_CHECK = `  } else if (EXCLUDED_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
    pool        = 'excluded';
    source_type = 'excluded_domain';
  } else if (productName && isManufacturerOwn(url, title, domain, extractManufacturer(productName))) {
    // Dynamic manufacturer-own detection — catches sources belonging to
    // the manufacturer of the product being scored, even if not in EXCLUDED_DOMAINS
    pool        = 'excluded';
    source_type = 'manufacturer_own';
  } else if (POOL_A_DOMAINS`;

// Also need to update YouTube classification to check manufacturer channels
const OLD_YOUTUBE_CHECK = `  } else if (domain === 'youtube.com' || domain === 'youtu.be') {
    // Check known installer channels
    const matchedChannel = POOL_B_CHANNELS.find(ch => combined.includes(ch));
    if (matchedChannel) {
      pool           = 'B';
      source_type    = 'youtube_installer';
      youtube_channel = matchedChannel;
    } else {
      pool        = 'C';
      source_type = 'youtube_consumer';
    }`;

const NEW_YOUTUBE_CHECK = `  } else if (domain === 'youtube.com' || domain === 'youtu.be') {
    // Check manufacturer-own YouTube channels first (always excluded)
    if (MANUFACTURER_YOUTUBE_CHANNELS.some(ch => combined.includes(ch))) {
      pool        = 'excluded';
      source_type = 'manufacturer_youtube';
    // Then check known installer channels
    } else if (POOL_B_CHANNELS.find(ch => combined.includes(ch))) {
      const matchedChannel = POOL_B_CHANNELS.find(ch => combined.includes(ch));
      pool           = 'B';
      source_type    = 'youtube_installer';
      youtube_channel = matchedChannel;
    } else {
      pool        = 'C';
      source_type = 'youtube_consumer';
    }`;

// ── Apply the patch ──────────────────────────────────────────────────────────

function applyPatch(dryRun) {
  let content = fs.readFileSync(SOURCE_FILE, 'utf-8');
  const original = content;
  let changes = 0;

  // Patch 1: Add missing manufacturer domains
  if (content.includes(OLD_MANUFACTURER_DOMAINS)) {
    content = content.replace(OLD_MANUFACTURER_DOMAINS, NEW_MANUFACTURER_DOMAINS);
    changes++;
    console.log('✓ Added missing manufacturer domains to EXCLUDED_DOMAINS');
  } else {
    console.log('⚠ Could not find manufacturer domains section to patch');
  }

  // Patch 2: Add manufacturer YouTube channels + domain patterns + isManufacturerOwn
  // Insert after the EXCLUDED_DOMAINS array closing bracket
  const insertPoint = '// ─── MANUFACTURER EXTRACTION';
  if (content.includes(insertPoint) && !content.includes('MANUFACTURER_YOUTUBE_CHANNELS')) {
    content = content.replace(
      insertPoint,
      MANUFACTURER_YOUTUBE_BLOCK + IS_MANUFACTURER_OWN_FUNCTION + insertPoint
    );
    changes++;
    console.log('✓ Added MANUFACTURER_YOUTUBE_CHANNELS, MANUFACTURER_DOMAIN_PATTERNS, and isManufacturerOwn()');
  } else if (content.includes('MANUFACTURER_YOUTUBE_CHANNELS')) {
    console.log('⚠ MANUFACTURER_YOUTUBE_CHANNELS already exists — skipping');
  } else {
    console.log('⚠ Could not find insertion point for manufacturer detection');
  }

  // Patch 3: Update classifySource signature
  if (content.includes(OLD_CLASSIFY_SIGNATURE) && !content.includes(NEW_CLASSIFY_SIGNATURE)) {
    content = content.replace(OLD_CLASSIFY_SIGNATURE, NEW_CLASSIFY_SIGNATURE);
    changes++;
    console.log('✓ Updated classifySource signature to accept productName');
  }

  // Patch 4: Add dynamic manufacturer-own check in classifySource
  if (content.includes(OLD_EXCLUDED_CHECK) && !content.includes("source_type = 'manufacturer_own'")) {
    content = content.replace(OLD_EXCLUDED_CHECK, NEW_EXCLUDED_CHECK);
    changes++;
    console.log('✓ Added dynamic manufacturer-own detection in classifySource');
  }

  // Patch 5: Update YouTube classification to check manufacturer channels
  if (content.includes(OLD_YOUTUBE_CHECK) && !content.includes('manufacturer_youtube')) {
    content = content.replace(OLD_YOUTUBE_CHECK, NEW_YOUTUBE_CHECK);
    changes++;
    console.log('✓ Updated YouTube classification to check manufacturer channels first');
  }

  console.log(`\n${changes} patches applied${dryRun ? ' (dry run)' : ''}`);
  
  if (!dryRun && changes > 0) {
    // Backup original
    fs.writeFileSync(SOURCE_FILE + '.bak', original);
    console.log('Backup saved to source_parser.js.bak');
    
    // Write patched version
    fs.writeFileSync(SOURCE_FILE, content);
    console.log('Patched source_parser.js written');
  }

  return changes;
}

const mode = process.argv[2] || 'dry-run';
applyPatch(mode === 'dry-run');
