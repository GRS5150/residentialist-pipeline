/**
 * THE RESIDENTIALIST — Manufacturer Manager
 * Handles manufacturer data freshness, full searches via Perplexity, and light refreshes.
 * 
 * Usage:
 *   const { checkManufacturer, runManufacturerSearch, runManufacturerRefresh } = require('./manufacturer_manager');
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = __dirname;
const MANUFACTURERS_DIR = path.join(WORKSPACE, 'manufacturers');
const TEMPLATES_DIR = path.join(WORKSPACE, 'templates');
const MANUFACTURER_FRESHNESS_DAYS = 90;

// Ensure directories exist
if (!fs.existsSync(MANUFACTURERS_DIR)) fs.mkdirSync(MANUFACTURERS_DIR, { recursive: true });

/**
 * Slugify a manufacturer name for file naming.
 */
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

/**
 * Check freshness of manufacturer data.
 * Returns { status, action, days_old, data }
 */
function checkManufacturer(slug) {
  const filePath = path.join(MANUFACTURERS_DIR, `${slug}.json`);

  if (!fs.existsSync(filePath)) {
    return { status: 'missing', action: 'full_search', days_old: null, data: null };
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const daysSince = (Date.now() - new Date(data.last_updated).getTime()) / 86400000;

  if (daysSince <= MANUFACTURER_FRESHNESS_DAYS) {
    return { status: 'fresh', action: 'skip', days_old: Math.round(daysSince), data };
  }

  return { status: 'stale', action: 'light_refresh', days_old: Math.round(daysSince), data };
}

/**
 * Detect manufacturer slug from a product name.
 */
function detectManufacturer(productName) {
  const name = productName.toLowerCase();
  const manufacturers = {
    'andersen': ['andersen', 'a-series', 'e-series', '100 series', '200 series', '400 series'],
    'pella': ['pella', 'impervia', 'lifestyle', '250 series', '350 series'],
    'marvin': ['marvin', 'integrity', 'elevate', 'essential', 'signature'],
    'milgard': ['milgard', 'tuscany', 'trinsic', 'ultra'],
    'jeld_wen': ['jeld-wen', 'jeldwen', 'jeld wen', 'v-2500', 'v2500', 'siteline'],
    'kolbe': ['kolbe', 'ultra series'],
    'windsor': ['windsor', 'pinnacle'],
    'simonton': ['simonton', 'reflections'],
    'reliabilt': ['reliabilt', 'reliable'],
    'loewen': ['loewen'],
    'alpen': ['alpen', 'zenith'],
    'sierra_pacific': ['sierra pacific'],
    'provia': ['provia', 'endure'],
    'cgi': ['cgi', 'impact'],
    'window_world': ['window world'],
    'ply_gem': ['ply gem', 'plygem'],
    'mi_windows': ['mi windows'],
    'atrium': ['atrium'],
    'sunrise': ['sunrise'],
    'soft_lite': ['soft lite', 'softlite']
  };

  for (const [slug, keywords] of Object.entries(manufacturers)) {
    for (const keyword of keywords) {
      if (name.includes(keyword)) return slug;
    }
  }

  // Fallback: use the first word
  return slugify(productName.split(' ')[0]);
}

/**
 * Run full manufacturer search via Perplexity Sonar Deep Research.
 */
async function runManufacturerSearch(manufacturerName, perplexityApiKey) {
  const slug = slugify(manufacturerName);
  console.log(`[MFG_MANAGER] Running full search for manufacturer: ${manufacturerName} (${slug})`);

  // Load prompt template
  const templatePath = path.join(TEMPLATES_DIR, 'prompt_c_manufacturer.md');
  let prompt = fs.readFileSync(templatePath, 'utf8');
  prompt = prompt.replace(/\{\{MANUFACTURER_NAME\}\}/g, manufacturerName);

  // Call Perplexity
  const startTime = Date.now();
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar-deep-research',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Perplexity API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const report = data.choices[0].message.content;
  const duration = Date.now() - startTime;

  console.log(`[MFG_MANAGER] Full search complete for ${manufacturerName} in ${Math.round(duration / 1000)}s`);

  // Save manufacturer file
  const mfgData = {
    manufacturer_name: manufacturerName,
    manufacturer_slug: slug,
    search_type: 'full',
    last_updated: new Date().toISOString(),
    search_duration_ms: duration,
    raw_report: report,
    // These will be populated by Sonnet structuring or manual review
    warranty_program: null,
    service_network: null,
    company_stability: null,
    reputation_pattern: null
  };

  const filePath = path.join(MANUFACTURERS_DIR, `${slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(mfgData, null, 2));
  console.log(`[MFG_MANAGER] Saved to ${filePath}`);

  return mfgData;
}

/**
 * Run light 90-day refresh for a manufacturer.
 */
async function runManufacturerRefresh(manufacturerName, perplexityApiKey) {
  const slug = slugify(manufacturerName);
  console.log(`[MFG_MANAGER] Running light refresh for manufacturer: ${manufacturerName} (${slug})`);

  // Load prompt template
  const templatePath = path.join(TEMPLATES_DIR, 'prompt_manufacturer_refresh.md');
  let prompt = fs.readFileSync(templatePath, 'utf8');
  prompt = prompt.replace(/\{\{MANUFACTURER_NAME\}\}/g, manufacturerName);

  // Call Perplexity (using regular sonar for light refresh — cheaper and faster)
  const startTime = Date.now();
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${perplexityApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Perplexity API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const report = data.choices[0].message.content;
  const duration = Date.now() - startTime;

  console.log(`[MFG_MANAGER] Light refresh complete for ${manufacturerName} in ${Math.round(duration / 1000)}s`);

  // Update existing manufacturer file
  const filePath = path.join(MANUFACTURERS_DIR, `${slug}.json`);
  let mfgData = {};
  if (fs.existsSync(filePath)) {
    mfgData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  mfgData.last_updated = new Date().toISOString();
  mfgData.last_refresh = {
    date: new Date().toISOString(),
    type: 'light_refresh',
    duration_ms: duration,
    report: report
  };

  fs.writeFileSync(filePath, JSON.stringify(mfgData, null, 2));
  console.log(`[MFG_MANAGER] Updated ${filePath}`);

  return mfgData;
}

/**
 * Get manufacturer data if available.
 */
function getManufacturerData(slug) {
  const filePath = path.join(MANUFACTURERS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

module.exports = {
  checkManufacturer,
  detectManufacturer,
  runManufacturerSearch,
  runManufacturerRefresh,
  getManufacturerData,
  slugify,
  MANUFACTURERS_DIR,
  MANUFACTURER_FRESHNESS_DAYS
};
