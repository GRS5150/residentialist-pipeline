/**
 * THE RESIDENTIALIST — spec_parser.js (Phase 6)
 * Builder Spec Sheet Ingestion & Product Extraction
 *
 * Supports multiple input formats:
 *   1. DesignSpec CSV    — direct column parse, $0 AI cost
 *   2. CoConstruct PDF   — text extraction + Haiku AI, ~$0.03
 *   3. Builder text list — text extraction + Haiku AI, ~$0.03
 *   4. Builder specs PDF — text extraction + Haiku AI, ~$0.03
 *   5. Mood board PDF    — vision API for image-heavy, ~$0.10
 *   6. Feature sheet IMG — vision API for designer sheets, ~$0.10
 *
 * Pipeline: [File] → [Detect Format] → [Extract Text/Image] → [AI Parse] → [Normalize] → [DB Check] → [Queue]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const SPEC_UPLOAD_DIR = path.join(WORKSPACE, 'spec_uploads');

// Ensure upload directory exists
if (!fs.existsSync(SPEC_UPLOAD_DIR)) fs.mkdirSync(SPEC_UPLOAD_DIR, { recursive: true });

// ── Logging ──────────────────────────────────────────────────────────────────

function log(msg) {
  const line = `[SPEC] ${new Date().toISOString()} ${msg}`;
  console.log(line);
  fs.appendFileSync(path.join(WORKSPACE, 'spec_parser.log'), line + '\n');
}

// ── Format Detection ─────────────────────────────────────────────────────────

function detectFormat(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath).toLowerCase();

  // CSV → DesignSpec fast-path
  if (ext === '.csv') return 'designspec_csv';

  // Image files → vision path
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff', '.bmp'].includes(ext)) {
    return 'image_vision';
  }

  // PDF → need to check content
  if (ext === '.pdf') {
    return 'pdf_auto'; // Will be refined during text extraction
  }

  // Plain text
  if (['.txt', '.md', '.text'].includes(ext)) return 'text_direct';

  return 'unknown';
}

// ── Text Extraction ──────────────────────────────────────────────────────────

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (['.txt', '.md', '.text'].includes(ext)) {
    return { text: fs.readFileSync(filePath, 'utf8'), method: 'direct', needsVision: false };
  }

  if (ext === '.csv') {
    return { text: fs.readFileSync(filePath, 'utf8'), method: 'csv', needsVision: false };
  }

  if (ext === '.pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer); // pdf-parse v1.1.1 — function call, not class
      const text = (data.text || '').trim();
      const pages = data.numpages || 1;
      const charsPerPage = text.length / pages;

      log(`PDF: ${pages} pages, ${text.length} chars total, ${Math.round(charsPerPage)} chars/page`);

      // If very few characters per page, it's likely image-heavy (mood boards, feature sheets)
      if (charsPerPage < 100 && pages > 1) {
        log('PDF detected as image-heavy — will use vision path');
        return { text, method: 'pdf_sparse', needsVision: true, pageCount: pages };
      }

      return { text, method: 'pdf_text', needsVision: false, pageCount: pages };
    } catch (e) {
      log('PDF parse error: ' + e.message);
      return { text: '', method: 'pdf_error', needsVision: true, error: e.message };
    }
  }

  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff', '.bmp'].includes(ext)) {
    return { text: '', method: 'image', needsVision: true };
  }

  return { text: '', method: 'unknown', needsVision: false };
}

// ── DesignSpec CSV Parser (Zero AI Cost) ─────────────────────────────────────

function parseDesignSpecCSV(csvText) {
  const lines = csvText.split('\n').map(l => l.replace(/\r/g, '').trim()).filter(l => l);
  if (lines.length < 2) return { products: [], ambiguous: [], source: 'DesignSpec CSV' };

  // DesignSpec exports have a complex layout:
  // Row 0 = internal field names (SpecCodeHeader, SpecDescriptionHeader, etc.)
  // Row 1+ = data rows with repeated header labels embedded
  // The actual data columns are at known positions:
  //   [13]=SpecType, [14]=SpecCode, [15]=SpecDescription, [16]=SpecQuantity,
  //   [17]=SpecAreas, [18]=SpecColor, [19]=SpecFinish, [20]=SpecDimensions,
  //   [21]=UnitPrice, [22]=VENDOR label, [23]=Vendor value, [24]=MANUFACTURER label,
  //   [25]=Manufacturer value, [26]=Notes

  const products = [];
  const ambiguous = [];

  // Parse header row to find column positions dynamically
  const headerRow = parseCSVRow(lines[0]);
  const colMap = {};
  headerRow.forEach((h, idx) => {
    const key = h.trim().toLowerCase();
    if (key) colMap[key] = idx;
  });

  // Try dynamic mapping first, fall back to known positions
  const getCol = (row, ...names) => {
    for (const name of names) {
      if (colMap[name] !== undefined && row[colMap[name]]) return row[colMap[name]].trim();
    }
    return '';
  };

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    if (row.length < 15) continue;

    // Try dynamic column mapping
    let type = getCol(row, 'spectype', 'type', 'category');
    let code = getCol(row, 'speccode', 'code');
    let description = getCol(row, 'specdescription', 'description', 'name', 'item');
    let areas = getCol(row, 'specareas', 'areas', 'area', 'room', 'location');
    let color = getCol(row, 'speccolor', 'color/model', 'color', 'model');
    let finish = getCol(row, 'specfinish', 'finish');

    // Fall back to fixed positions for DesignSpec format
    if (!type && row[13]) type = row[13].trim();
    if (!code && row[14]) code = row[14].trim();
    if (!description && row[15]) description = row[15].trim();
    if (!areas && row[17]) areas = row[17].trim();
    if (!color && row[18]) color = row[18].trim();
    if (!finish && row[19]) finish = row[19].trim();

    // Extract manufacturer — in DesignSpec it's the value after "MANUFACTURER:" label
    let manufacturer = '';
    let vendor = '';
    for (let j = 0; j < row.length; j++) {
      const val = (row[j] || '').trim();
      if (val === 'MANUFACTURER:' && row[j+1]) manufacturer = row[j+1].trim();
      if (val === 'VENDOR:' && row[j+1]) vendor = row[j+1].trim();
    }
    // Also try dynamic columns
    if (!manufacturer) manufacturer = getCol(row, 'manufacturer', 'mfr');
    if (!vendor) vendor = getCol(row, 'vendor', 'supplier');

    // Skip header-like rows and empty rows
    if (type === 'CODE' || code === 'CODE' || description === 'DESCRIPTION') continue;
    if (!description && !manufacturer && !code) continue;

    // Determine category from type field or description
    const category = mapCategory(type || description);

    products.push({
      raw_text: [code, description, manufacturer, color].filter(Boolean).join(' — '),
      brand: manufacturer || extractBrand(description),
      product_line: description,
      model: color || null,
      configuration: null,
      category: category,
      location: areas || null,
      finish: finish || null,
      vendor: vendor || null,
      is_upgrade: false,
      confidence: manufacturer ? 'high' : 'medium',
      source_format: 'designspec_csv'
    });
  }

  return { products, ambiguous, source: 'DesignSpec CSV' };
}

function parseCSVRow(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { result.push(current); current = ''; continue; }
    current += ch;
  }
  result.push(current);
  return result;
}

// ── Claude AI Extraction ─────────────────────────────────────────────────────

const EXTRACTION_SYSTEM = `You extract building products from spec sheets. Return ONLY valid JSON, no markdown.

RULES: Brand+product required. Skip TBD/vague. Fix spelling (Anderson→Andersen, Kolher→Kohler). Config: Casement=CSM, Double Hung=DH, Single Hung=SH, Sliding=SLD. Categories: Windows, Faucets, Cabinets, Countertops, or "other". Confidence: high/medium/low.

Keep raw_text under 30 chars. Omit null fields to save space.

JSON format:
{"source":"builder","products":[{"raw_text":"short","brand":"X","product_line":"Y","category":"Windows","confidence":"high"}],"ambiguous":[]}`;

// Attempt to repair truncated JSON (common when output hits token limit)
function repairJSON(str) {
  // Strategy: find the last complete product object, discard the partial one,
  // then close the arrays/objects properly.
  
  // Step 1: Find the last complete product object boundary
  // Look for the pattern },{ or },\n    { which separates product objects in the array
  const lastCompleteObj = str.lastIndexOf('},');
  const lastFullObj = str.lastIndexOf('}\n');
  
  let trimmed = str;
  
  // If we can find a clean boundary after the products array starts, trim there
  if (lastCompleteObj > str.length * 0.5) {
    // Trim to just after the last complete object
    trimmed = str.slice(0, lastCompleteObj + 1);
  } else if (lastFullObj > str.length * 0.5) {
    trimmed = str.slice(0, lastFullObj + 1);
  }
  
  // Step 2: Count open/close braces and brackets to know what to append
  let openBraces = 0, openBrackets = 0;
  let inString = false;
  let escape = false;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') openBraces++;
    if (ch === '}') openBraces--;
    if (ch === '[') openBrackets++;
    if (ch === ']') openBrackets--;
  }
  
  // Step 3: If we're inside a string, close it first
  if (inString) {
    trimmed += '"';
  }
  
  // Step 4: Close any remaining open structures
  // Need to close in reverse order: } for objects, ] for arrays
  // But we need to figure out the nesting order from the remaining structure
  // Simple approach: close braces first (inner objects), then brackets (arrays), then outer brace
  while (openBraces > 1) { trimmed += '}'; openBraces--; }
  while (openBrackets > 0) { trimmed += ']'; openBrackets--; }
  while (openBraces > 0) { trimmed += '}'; openBraces--; }
  
  return trimmed;
}

function callClaude(messages, model = 'claude-haiku-4-5-20251001', maxTokens = 2000) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: EXTRACTION_SYSTEM,
      messages
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`Claude API error: ${parsed.error.message}`));
            return;
          }
          const text = parsed.content?.[0]?.text || '';
          resolve({
            text,
            inputTokens: parsed.usage?.input_tokens || 0,
            outputTokens: parsed.usage?.output_tokens || 0,
            model: parsed.model
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function aiExtractFromText(text, context = {}) {
  const contextStr = [
    context.builder ? `Builder: ${context.builder}` : '',
    context.address ? `Property: ${context.address}` : '',
    context.filename ? `Filename: ${context.filename}` : ''
  ].filter(Boolean).join('\n');

  const prompt = `Extract all building products from this spec sheet.${contextStr ? '\n\nContext:\n' + contextStr : ''}

DOCUMENT TEXT:
${text.slice(0, 15000)}`; // Cap at ~15k chars to keep costs low

  log(`AI text extraction: ~${text.length} chars input`);

  const result = await callClaude([{ role: 'user', content: prompt }], 'claude-haiku-4-5-20251001', 8192);

  log(`AI response: ${result.inputTokens} in / ${result.outputTokens} out tokens`);

  // Parse JSON from response (handle markdown code blocks)
  let jsonStr = result.text;
  // Strip markdown code fences
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) jsonStr = jsonMatch[1];
  jsonStr = jsonStr.trim();
  const braceStart = jsonStr.indexOf('{');
  const braceEnd = jsonStr.lastIndexOf('}');
  if (braceStart >= 0 && braceEnd > braceStart) {
    jsonStr = jsonStr.slice(braceStart, braceEnd + 1);
  }

  try {
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e1) {
      log('JSON parse failed, attempting repair: ' + e1.message);
      // Try to repair truncated JSON
      const repaired = repairJSON(jsonStr);
      parsed = JSON.parse(repaired);
      log('JSON repair successful');
    }
    // Add source_format to each product
    if (parsed.products) {
      parsed.products.forEach(p => { p.source_format = 'ai_text'; });
    }
    parsed.ai_cost = {
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      model: result.model,
      estimatedCost: ((result.inputTokens * 0.25 + result.outputTokens * 1.25) / 1000000).toFixed(4)
    };
    return parsed;
  } catch (e) {
    log('JSON parse error from AI response: ' + e.message);
    log('Raw response tail: ' + jsonStr.slice(-200));
    return { products: [], ambiguous: [{ raw_text: 'AI parse failed', reason: e.message, category: 'error' }], ai_cost: { error: e.message } };
  }
}

async function aiExtractFromImage(filePath, context = {}) {
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const mediaType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const imageData = fs.readFileSync(filePath).toString('base64');

  const contextStr = [
    context.builder ? `Builder: ${context.builder}` : '',
    context.address ? `Property: ${context.address}` : '',
    context.filename ? `Filename: ${path.basename(filePath)}` : ''
  ].filter(Boolean).join('\n');

  log(`AI vision extraction: ${path.basename(filePath)} (${mediaType})`);

  const result = await callClaude([{
    role: 'user',
    content: [
      {
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: imageData }
      },
      {
        type: 'text',
        text: `Extract all building products from this builder spec sheet / feature sheet image.${contextStr ? '\n\nContext:\n' + contextStr : ''}\n\nIdentify every brand name, product line, model number, and configuration visible.`
      }
    ]
  }]);

  log(`Vision response: ${result.inputTokens} in / ${result.outputTokens} out tokens`);

  let jsonStr = result.text;
  // Strip markdown code fences — handle ```json ... ``` and ``` ... ```
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) jsonStr = jsonMatch[1];
  // Also strip any leading/trailing non-JSON characters
  jsonStr = jsonStr.trim();
  const braceStart = jsonStr.indexOf('{');
  const braceEnd = jsonStr.lastIndexOf('}');
  if (braceStart >= 0 && braceEnd > braceStart) {
    jsonStr = jsonStr.slice(braceStart, braceEnd + 1);
  }

  try {
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e1) {
      log('Vision JSON parse failed, attempting repair: ' + e1.message);
      const repaired = repairJSON(jsonStr);
      parsed = JSON.parse(repaired);
      log('Vision JSON repair successful');
    }
    if (parsed.products) {
      parsed.products.forEach(p => { p.source_format = 'ai_vision'; });
    }
    parsed.ai_cost = {
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      model: result.model,
      estimatedCost: ((result.inputTokens * 0.25 + result.outputTokens * 1.25) / 1000000).toFixed(4)
    };
    return parsed;
  } catch (e) {
    log('Vision JSON parse error: ' + e.message);
    log('Raw response tail: ' + jsonStr.slice(-200));
    return { products: [], ambiguous: [{ raw_text: 'Vision parse failed', reason: e.message, category: 'error' }], ai_cost: { error: e.message } };
  }
}

// ── Category Mapping ─────────────────────────────────────────────────────────

const CATEGORY_MAP = {
  // Windows
  'window': 'windows', 'windows': 'windows', 'casement': 'windows', 'double hung': 'windows',
  'single hung': 'windows', 'sliding': 'windows', 'awning': 'windows', 'fixed': 'windows',
  'skylight': 'windows', 'egress': 'windows',
  // Faucets
  'faucet': 'faucets', 'faucets': 'faucets', 'plumbing': 'faucets', 'fixture': 'faucets',
  'fixtures': 'faucets', 'tap': 'faucets', 'lavatory': 'faucets', 'kitchen faucet': 'faucets',
  'bath faucet': 'faucets',
  // Cabinets
  'cabinet': 'cabinets', 'cabinets': 'cabinets', 'cabinetry': 'cabinets',
  'kitchen cabinet': 'cabinets', 'bath cabinet': 'cabinets', 'vanity': 'cabinets',
  // Countertops
  'countertop': 'countertops', 'countertops': 'countertops', 'counter': 'countertops',
  'counters': 'countertops', 'granite': 'countertops', 'quartz': 'countertops',
  'marble': 'countertops', 'solid surface': 'countertops', 'laminate counter': 'countertops'
};

function mapCategory(text) {
  const lower = (text || '').toLowerCase().trim();
  // Direct match
  if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower];
  // Partial match
  for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return cat;
  }
  return 'other';
}

// ── Brand Extraction (fallback when no manufacturer column) ──────────────────

const KNOWN_BRANDS = [
  'Andersen', 'Pella', 'Marvin', 'Milgard', 'JELD-WEN', 'Simonton', 'Alpen', 'Reliabilt',
  'Window World', 'Sierra Pacific', 'Kolbe', 'Therma-Tru', 'Masonite',
  'Moen', 'Delta', 'Kohler', 'Pfister', 'American Standard', 'Grohe', 'Hansgrohe', 'Brizo',
  'KraftMaid', 'Merillat', 'Thomasville', 'Diamond', 'Aristokraft', 'Waypoint', 'Fabuwood', 'Wolf',
  'Cambria', 'Caesarstone', 'Silestone', 'Corian', 'LG Viatera', 'MSI', 'Wilsonart',
  'Owens Corning', 'GAF', 'CertainTeed', 'Lennox', 'Carrier', 'Trane',
  'LP', 'James Hardie', 'Sub-Zero', 'Viking', 'Bosch', 'GE', 'Whirlpool',
  'Heat N Glo', 'Napoleon', 'Clopay', 'Sherwin-Williams', 'Benjamin Moore',
  'Shaw', 'Mohawk', 'Armstrong', 'Daltile', 'Schluter'
];

function extractBrand(text) {
  const lower = (text || '').toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    if (lower.includes(brand.toLowerCase())) return brand;
  }
  return null;
}

// ── Product Normalization ────────────────────────────────────────────────────

function normalizeProducts(rawProducts) {
  return rawProducts.map(p => {
    // Normalize category
    const cat = mapCategory(p.category);

    // Normalize brand spelling
    let brand = p.brand || '';
    const brandFixes = {
      'anderson': 'Andersen', 'andersan': 'Andersen', 'jeld wen': 'JELD-WEN',
      'jeldwen': 'JELD-WEN', 'jeld-wen': 'JELD-WEN', 'kolher': 'Kohler',
      'heat n glo': 'Heat N Glo', 'heatnglo': 'Heat N Glo',
      'kraftmade': 'KraftMaid', 'james hardy': 'James Hardie',
      'sierra pacific': 'Sierra Pacific', 'lp smartside': 'LP SmartSide'
    };
    const lowerBrand = brand.toLowerCase().trim();
    if (brandFixes[lowerBrand]) brand = brandFixes[lowerBrand];

    // Normalize configuration codes
    let config = p.configuration || null;
    const configMap = {
      'casement': 'CSM', 'double hung': 'DH', 'double-hung': 'DH', 'single hung': 'SH',
      'single-hung': 'SH', 'sliding': 'SLD', 'awning': 'AWN', 'fixed': 'FIX',
      'picture': 'FIX', 'hopper': 'HOP', 'bay': 'BAY', 'bow': 'BOW'
    };
    if (config) {
      const lowerConfig = config.toLowerCase().trim();
      if (configMap[lowerConfig]) config = configMap[lowerConfig];
    }

    // Build pipeline-compatible name
    const pipelineName = [brand, p.product_line].filter(Boolean).join(' ').trim();

    return {
      ...p,
      brand,
      category: cat,
      configuration: config,
      pipeline_name: pipelineName,
      scoreable: ['windows', 'faucets', 'cabinets', 'countertops'].includes(cat)
    };
  });
}

// ── DB Integration ───────────────────────────────────────────────────────────

function checkExistingProducts(products) {
  let db;
  try {
    db = require('./db');
  } catch (e) {
    log('DB not available: ' + e.message);
    return products.map(p => ({ ...p, db_status: 'unknown' }));
  }

  return products.map(p => {
    if (!p.scoreable) return { ...p, db_status: 'not_scoreable' };

    const scored = db.isScored(p.pipeline_name, p.configuration || 'DH');
    if (scored) {
      const score = db.getScore(p.pipeline_name, p.configuration || 'DH');
      return {
        ...p,
        db_status: 'scored',
        existing_score: score ? score.overall : null,
        existing_grade: score ? score.grade : null
      };
    }
    return { ...p, db_status: 'new' };
  });
}

// ── Auto-Queue ───────────────────────────────────────────────────────────────

function queueNewProducts(products, autoQueue = true) {
  if (!autoQueue) {
    log('Auto-queue disabled — skipping');
    return products;
  }

  const toQueue = products.filter(p => p.db_status === 'new' && p.scoreable);
  if (toQueue.length === 0) {
    log('No new products to queue');
    return products;
  }

  log(`Auto-queuing ${toQueue.length} new products`);

  for (const p of toQueue) {
    try {
      const { spawn } = require('child_process');
      const child = spawn('node', ['auto_runner.js', p.pipeline_name, p.configuration || 'DH', p.category], {
        cwd: WORKSPACE, detached: true, stdio: 'ignore'
      });
      child.unref();
      p.db_status = 'queued';
      log(`Queued: ${p.pipeline_name} (${p.configuration || 'DH'}) — ${p.category}`);
    } catch (e) {
      log(`Queue error for ${p.pipeline_name}: ${e.message}`);
      p.db_status = 'queue_error';
    }
  }

  return products;
}

// ── Main Parse Function ──────────────────────────────────────────────────────

async function parseSpecSheet(filePath, options = {}) {
  const {
    builder = null,
    address = null,
    autoQueue = true,  // Default ON per Ray's decision
    specId = null
  } = options;

  const startTime = Date.now();
  const filename = path.basename(filePath);

  log(`\n${'═'.repeat(60)}`);
  log(`PARSING: ${filename}`);
  log(`Builder: ${builder || 'unknown'} | Address: ${address || 'unknown'}`);
  log(`Auto-queue: ${autoQueue ? 'ON' : 'OFF'}`);

  // Step 1: Detect format
  const format = detectFormat(filePath);
  log(`Format detected: ${format}`);

  let result;

  // Step 2: Route by format
  if (format === 'designspec_csv') {
    // Fast path — no AI needed
    const csvText = fs.readFileSync(filePath, 'utf8');
    result = parseDesignSpecCSV(csvText);
    result.ai_cost = { inputTokens: 0, outputTokens: 0, estimatedCost: '0.0000', model: 'none' };
    log(`CSV parse: ${result.products.length} products, ${result.ambiguous.length} ambiguous`);

  } else if (format === 'image_vision') {
    // Vision path for images
    result = await aiExtractFromImage(filePath, { builder, address, filename });

  } else {
    // PDF or text — try text extraction first
    const extraction = await extractText(filePath);

    if (extraction.needsVision || extraction.text.length < 50) {
      // Image-heavy or no text — use vision
      if (format === 'pdf_auto') {
        // For PDFs, we can't directly send to vision API, but we can send the sparse text
        // plus note that the document is image-heavy
        if (extraction.text.length > 20) {
          result = await aiExtractFromText(
            `[NOTE: This is an image-heavy document. The following text was extracted but may be incomplete.]\n\n${extraction.text}`,
            { builder, address, filename }
          );
        } else {
          // Truly no text — try converting first page to image if possible
          log('PDF has almost no extractable text — attempting image conversion');
          try {
            // Try sips (macOS built-in) for simple conversion
            const tmpImg = path.join(SPEC_UPLOAD_DIR, `_tmp_${Date.now()}.jpg`);
            // Use qlmanage for macOS thumbnail generation
            execSync(`qlmanage -t -s 2000 -o "${SPEC_UPLOAD_DIR}" "${filePath}" 2>/dev/null`, { timeout: 10000 });
            const thumbName = filename + '.png';
            const thumbPath = path.join(SPEC_UPLOAD_DIR, thumbName);
            if (fs.existsSync(thumbPath)) {
              result = await aiExtractFromImage(thumbPath, { builder, address, filename });
              try { fs.unlinkSync(thumbPath); } catch(e) {}
            } else {
              result = { products: [], ambiguous: [{ raw_text: filename, reason: 'Image-heavy PDF with no extractable text — manual review needed', category: 'unknown' }] };
            }
          } catch (e) {
            log('Image conversion failed: ' + e.message);
            result = { products: [], ambiguous: [{ raw_text: filename, reason: 'Could not extract text or images from PDF', category: 'unknown' }] };
          }
        }
      } else {
        result = { products: [], ambiguous: [{ raw_text: filename, reason: 'Unsupported format', category: 'unknown' }] };
      }
    } else {
      // Good text — use AI text extraction
      result = await aiExtractFromText(extraction.text, { builder, address, filename });
    }
  }

  // Step 3: Normalize products
  if (result.products && result.products.length > 0) {
    result.products = normalizeProducts(result.products);
  }

  // Step 4: Check DB for existing scores
  if (result.products && result.products.length > 0) {
    result.products = checkExistingProducts(result.products);
  }

  // Step 5: Auto-queue new scoreable products
  if (result.products && result.products.length > 0) {
    result.products = queueNewProducts(result.products, autoQueue);
  }

  // Step 6: Build summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const scored = (result.products || []).filter(p => p.db_status === 'scored');
  const queued = (result.products || []).filter(p => p.db_status === 'queued');
  const newUnqueued = (result.products || []).filter(p => p.db_status === 'new');
  const notScoreable = (result.products || []).filter(p => p.db_status === 'not_scoreable');
  const ambiguousItems = result.ambiguous || [];

  const summary = {
    filename,
    source: result.source || builder || filename,
    property: result.property || address || null,
    total_products: (result.products || []).length,
    already_scored: scored.length,
    newly_queued: queued.length,
    new_unqueued: newUnqueued.length,
    other_category: notScoreable.length,
    ambiguous: ambiguousItems.length,
    elapsed_seconds: parseFloat(elapsed),
    ai_cost: result.ai_cost || null
  };

  log(`\nRESULTS: ${summary.total_products} products found`);
  log(`  Scored: ${summary.already_scored} | Queued: ${summary.newly_queued} | New: ${summary.new_unqueued} | Other: ${summary.other_category} | Ambiguous: ${summary.ambiguous}`);
  log(`  Time: ${elapsed}s | AI cost: $${result.ai_cost?.estimatedCost || '0'}`);
  log('═'.repeat(60));

  return {
    success: true,
    summary,
    products: result.products || [],
    ambiguous: ambiguousItems,
    ai_cost: result.ai_cost || null
  };
}

// ── Telegram Formatting ──────────────────────────────────────────────────────

function formatTelegramMessage(result) {
  const s = result.summary;
  const lines = [];

  lines.push(`📋 *Spec Sheet Parsed: ${s.source}*`);
  if (s.property) lines.push(`📍 ${s.property}`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Already scored
  const scored = result.products.filter(p => p.db_status === 'scored');
  if (scored.length > 0) {
    lines.push(`\n✅ *Already Scored (${scored.length}):*`);
    for (const p of scored) {
      const grade = p.existing_grade || '';
      const score = p.existing_score ? p.existing_score.toFixed(2) : '?';
      lines.push(`   • ${p.pipeline_name}${p.configuration ? ' ' + p.configuration : ''} — ${score} (${grade})`);
    }
  }

  // Newly queued
  const queued = result.products.filter(p => p.db_status === 'queued');
  if (queued.length > 0) {
    lines.push(`\n🆕 *Queued for Scoring (${queued.length}):*`);
    for (const p of queued) {
      lines.push(`   • ${p.pipeline_name}${p.configuration ? ' ' + p.configuration : ''} — _Queued_`);
    }
  }

  // New but not queued
  const newP = result.products.filter(p => p.db_status === 'new');
  if (newP.length > 0) {
    lines.push(`\n📝 *New — Not Queued (${newP.length}):*`);
    for (const p of newP) {
      lines.push(`   • ${p.pipeline_name} — ${p.category}`);
    }
  }

  // Other categories
  const other = result.products.filter(p => p.db_status === 'not_scoreable');
  if (other.length > 0) {
    lines.push(`\n📦 *Other Categories (${other.length}):*`);
    for (const p of other.slice(0, 10)) {
      lines.push(`   • ${p.pipeline_name} — ${p.category}`);
    }
    if (other.length > 10) lines.push(`   ... and ${other.length - 10} more`);
  }

  // Ambiguous
  if (result.ambiguous.length > 0) {
    lines.push(`\n⚠️ *Ambiguous (${result.ambiguous.length}):*`);
    for (const a of result.ambiguous.slice(0, 5)) {
      lines.push(`   • "${a.raw_text}" — ${a.reason}`);
    }
    if (result.ambiguous.length > 5) lines.push(`   ... and ${result.ambiguous.length - 5} more`);
  }

  lines.push(`\n⏱ ${s.elapsed_seconds}s | 💰 $${result.ai_cost?.estimatedCost || '0'}`);

  return lines.join('\n');
}

// ── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  parseSpecSheet,
  formatTelegramMessage,
  detectFormat,
  extractText,
  parseDesignSpecCSV,
  normalizeProducts,
  mapCategory,
  SPEC_UPLOAD_DIR,
  log
};

// ── CLI Mode ─────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node spec_parser.js <file> [--builder "Name"] [--address "123 Main St"] [--no-queue]');
    process.exit(1);
  }

  const filePath = args[0];
  const builder = args.includes('--builder') ? args[args.indexOf('--builder') + 1] : null;
  const address = args.includes('--address') ? args[args.indexOf('--address') + 1] : null;
  const autoQueue = !args.includes('--no-queue');

  parseSpecSheet(filePath, { builder, address, autoQueue })
    .then(result => {
      console.log(formatTelegramMessage(result));
      console.log('\n--- Raw JSON ---');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(err => {
      console.error('Parse error:', err);
      process.exit(1);
    });
}