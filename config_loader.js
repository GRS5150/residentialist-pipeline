/**
 * THE RESIDENTIALIST — Config Loader
 * Loads category-specific configuration from configs/{category}.json
 */

const fs = require('fs');
const path = require('path');

const CONFIGS_DIR = path.join(__dirname, 'configs');

let _cache = {};

/**
 * Load config for a category.
 * @param {string} category - 'windows' or 'countertops'
 * @returns {object} Category config
 */
function loadConfig(category) {
  if (_cache[category]) return _cache[category];

  const configPath = path.join(CONFIGS_DIR, `${category}.json`);
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config not found for category "${category}": ${configPath}`);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  _cache[category] = config;
  return config;
}

/**
 * Build tier anchor text for LLM prompts from config.
 */
function buildAnchorPromptText(config) {
  const anchors = config.tier_anchors;
  const lines = [];

  for (const tierKey of ['tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5']) {
    const tier = anchors[tierKey];
    if (!tier) continue;
    const tierNum = tierKey.replace('tier_', '');
    const range = `${tier.range[0]}-${tier.range[1]}`;
    let line = `TIER ${tierNum} (${tier.label}, ${range}):`;

    if (tier.anchors && tier.anchors.length > 0) {
      const anchorDescs = tier.anchors.map(a =>
        `${a.product} — ${a.rationale}`
      ).join(' ');
      line += ` ${anchorDescs}`;
    } else {
      line += ' No anchors defined.';
    }

    lines.push(line);
  }

  return lines.join('\n\n');
}

/**
 * Detect manufacturer from product name using config's detection map.
 */
function detectManufacturer(productName, category) {
  const config = loadConfig(category);
  const map = config.manufacturer_detection || {};
  const name = productName.toLowerCase();

  for (const [key, slug] of Object.entries(map)) {
    if (name.includes(key)) return slug;
  }

  // Fallback: first word
  return name.split(' ')[0].replace(/[^a-z0-9]/g, '_');
}

/**
 * Get the Perplexity prompt template path for a category.
 */
function getPromptTemplatePath(category) {
  const config = loadConfig(category);
  const templateFile = config.deep_dive_prompt_template || 'prompt_b_product.md';
  return path.join(__dirname, 'templates', templateFile);
}

/**
 * Get pain points for a category.
 */
function getPainPoints(category) {
  const config = loadConfig(category);
  return config.pain_points || [];
}

/**
 * Get health score for a material/frame in a category.
 */
function getHealthScore(materialString, category) {
  const config = loadConfig(category);
  const map = config.health_score_map || {};
  const mat = (materialString || '').toLowerCase();

  for (const [key, score] of Object.entries(map)) {
    if (key !== 'default' && mat.includes(key)) return score;
  }

  return map.default || 7.0;
}

module.exports = { loadConfig, buildAnchorPromptText, detectManufacturer, getPromptTemplatePath, getPainPoints, getHealthScore };
