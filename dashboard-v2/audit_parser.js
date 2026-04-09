/**
 * Audit Data Aggregator (v2)
 *
 * Reads from THREE sources (replacing the legacy run_full_audit.js parser):
 *
 *  1. Source Independence — computed from curation file per-source classification
 *     fields or source_pool_classification pools.
 *
 *  2. Spec Verification — reads from the verified_specs SQLite table
 *     (spec_spot_check.js writes there). Compares against calibration specs.
 *
 *  3. Red-Team Findings — parses red_team_*.md files in output/audit/.
 *
 * Exports the same { categories, dashboard } shape so the server can drop it in.
 */

const fs = require('fs');
const path = require('path');

let Database;
try {
  Database = require('better-sqlite3');
} catch {
  Database = null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. SOURCE INDEPENDENCE — from curation files
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compute source independence from a curation file.
 * Returns { totalSources, independent, affiliated, manufacturer, ratio, status }
 */
function computeSourceIndependence(curationData) {
  if (!curationData) {
    return { totalSources: 0, independent: 0, affiliated: 0, manufacturer: 0, ratio: 0, status: 'gray' };
  }

  let independent = 0;
  let affiliated = 0;
  let manufacturer = 0;

  // Schema 1 (modern): sources[] with per-source classification
  if (Array.isArray(curationData.sources) && curationData.sources.length > 0) {
    for (const s of curationData.sources) {
      const cls = (s.classification || '').toLowerCase();
      if (cls === 'independent' || cls === 'score') {
        independent++;
      } else if (cls === 'affiliated' || cls === 'report_only') {
        affiliated++;
      } else if (cls === 'manufacturer') {
        manufacturer++;
      } else {
        // Default: treat pool A/B as independent, S/C as affiliated/manufacturer
        const pool = (s.pool || '').toUpperCase();
        if (pool === 'A' || pool === 'B') independent++;
        else if (pool === 'S') manufacturer++;
        else if (pool === 'C') affiliated++;
        else independent++; // unknown → independent by default
      }
    }
  }
  // Schema 2: source_pool_classification { S: [...], A: [...], B: [...], C: [...] }
  else if (curationData.source_pool_classification && typeof curationData.source_pool_classification === 'object') {
    for (const [pool, entries] of Object.entries(curationData.source_pool_classification)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        const name = typeof entry === 'string' ? entry : (entry.source_name || entry.name || '');
        if (name.includes('VACANT') || name.includes('N/A') || !name.trim()) continue;

        const nameLower = name.toLowerCase();
        if (nameLower.includes('(manufacturer)') || pool === 'S') {
          manufacturer++;
        } else if (pool === 'A' || pool === 'B') {
          independent++;
        } else {
          affiliated++;
        }
      }
    }
  }
  // Schema 3: evidence — treat all as independent unless name contains manufacturer
  else if (curationData.evidence && typeof curationData.evidence === 'object') {
    const seen = new Set();
    for (const entries of Object.values(curationData.evidence)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        const name = entry.source || entry.source_name || '';
        if (!name || seen.has(name.toLowerCase())) continue;
        seen.add(name.toLowerCase());
        if (name.toLowerCase().includes('manufacturer')) {
          manufacturer++;
        } else {
          independent++;
        }
      }
    }
  }

  const total = independent + affiliated + manufacturer;
  const ratio = total > 0 ? Math.round((independent / total) * 100) : 0;

  let status = 'green';
  if (ratio < 50) status = 'red';
  else if (ratio < 67) status = 'yellow';
  else if (total === 0) status = 'gray';

  return { totalSources: total, independent, affiliated, manufacturer, ratio, status };
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. SPEC VERIFICATION — from verified_specs SQLite table
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Load all verified specs for a product from the SQLite DB.
 * Returns { specs: [{ name, calibValue, dbValue, unit, confidence, status }], overallStatus }
 */
function loadSpecVerification(dbPath, productSlug, calibSpecs) {
  if (!Database || !fs.existsSync(dbPath)) {
    return { specs: [], status: 'gray', hasDb: false };
  }

  try {
    const db = new Database(dbPath, { readonly: true });
    const rows = db.prepare('SELECT * FROM verified_specs WHERE product_slug = ?').all(productSlug);
    db.close();

    if (rows.length === 0) {
      return { specs: [], status: 'gray', hasDb: true };
    }

    const specs = rows.map(row => {
      const calibVal = calibSpecs ? calibSpecs[row.spec_name] : null;
      let displayStatus;
      if (row.confidence === 'verified') displayStatus = 'verified';
      else if (row.confidence === 'conflicting') displayStatus = 'discrepancy';
      else if (row.confidence === 'high' || row.confidence === 'medium') displayStatus = 'verified';
      else displayStatus = 'unverified';

      return {
        name: row.spec_name,
        calibrationValue: calibVal !== undefined && calibVal !== null ? String(calibVal) : '—',
        dbValue: row.normalized_value || row.raw_value || '—',
        unit: row.normalized_unit || row.raw_unit || '',
        source: row.source_type || '',
        confidence: row.confidence,
        status: displayStatus,
        flagNote: row.flag_note || null
      };
    });

    const hasDiscrepancy = specs.some(s => s.status === 'discrepancy');
    const allVerified = specs.every(s => s.status === 'verified');

    let overallStatus = 'green';
    if (hasDiscrepancy) overallStatus = 'red';
    else if (!allVerified) overallStatus = 'yellow';

    return { specs, status: overallStatus, hasDb: true };
  } catch (err) {
    console.log(`[AUDIT] Spec DB error for ${productSlug}: ${err.message}`);
    return { specs: [], status: 'gray', hasDb: true };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. RED-TEAM FINDINGS — from red_team_*.md files
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse all red-team audit files.
 * Returns a map: { 'product_slug': { verdict, summary, date, category } }
 */
function parseRedTeamReports(baseDir) {
  const auditDir = path.join(baseDir, 'output', 'audit');
  if (!fs.existsSync(auditDir)) return {};

  const files = fs.readdirSync(auditDir)
    .filter(f => f.startsWith('red_team_') && f.endsWith('.md'))
    .sort()
    .reverse(); // newest first

  const results = {};
  const seen = new Set();

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(auditDir, file), 'utf8');
      const parsed = parseRedTeamFile(content, file);
      if (parsed && parsed.slug && !seen.has(parsed.slug)) {
        seen.add(parsed.slug);
        results[parsed.slug] = parsed;
      }
    } catch (err) {
      console.log(`[AUDIT] Failed to parse red-team file ${file}: ${err.message}`);
    }
  }

  return results;
}

/**
 * Parse a single red-team markdown report.
 */
function parseRedTeamFile(content, filename) {
  // Extract metadata from header
  const slugMatch = content.match(/^\*\*Slug:\*\*\s*(.+)$/m);
  const categoryMatch = content.match(/^\*\*Category:\*\*\s*(.+)$/m);
  const dateMatch = content.match(/^##\s*(\d{4}-\d{2}-\d{2})/m);

  const slug = slugMatch ? slugMatch[1].trim() : extractSlugFromFilename(filename);
  const category = categoryMatch ? categoryMatch[1].trim() : null;

  // Detect verdict: CLEAN or has findings
  const isClean = content.includes('**CLEAN**');

  // Extract the summary (everything after the --- delimiter)
  const afterDivider = content.split(/^---$/m);
  const summaryBlock = afterDivider.length > 1 ? afterDivider[afterDivider.length - 1].trim() : '';

  // Extract individual findings (lines that look like findings/issues)
  const findings = [];
  if (!isClean) {
    // Look for bullet points or numbered items as findings
    const findingLines = summaryBlock.match(/^[-*]\s+.+$/gm) || [];
    for (const line of findingLines) {
      findings.push(line.replace(/^[-*]\s+/, '').trim());
    }

    // Also look for bold section headers as findings
    const boldFindings = summaryBlock.match(/^\*\*[^*]+\*\*[^*]*$/gm) || [];
    if (findings.length === 0) {
      for (const bf of boldFindings) {
        findings.push(bf.replace(/\*\*/g, '').trim());
      }
    }
  }

  return {
    slug,
    category,
    date: dateMatch ? dateMatch[1] : null,
    verdict: isClean ? 'CLEAN' : 'FINDINGS',
    isClean,
    summary: summaryBlock.substring(0, 800),
    findings
  };
}

/**
 * Extract product slug from red-team filename.
 * e.g. "red_team_rohl_shaws_rc3618_2026-04-06.md" → "rohl_shaws_rc3618"
 */
function extractSlugFromFilename(filename) {
  const stripped = filename
    .replace(/^red_team_/, '')
    .replace(/_\d{4}-\d{2}-\d{2}\.md$/, '');
  return stripped;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN AGGREGATOR — called by server.js refreshData()
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build audit data for all products.
 *
 * @param {string} baseDir - Workspace root
 * @param {object} categories - The categories map (slug → category data with products)
 * @returns {object} { redTeamReports, dbPath, latestRedTeamDate }
 */
function buildAuditData(baseDir, categories) {
  const dbPath = path.join(baseDir, 'residentialist.db');
  const redTeamReports = parseRedTeamReports(baseDir);

  // Determine latest red-team date
  let latestDate = null;
  for (const report of Object.values(redTeamReports)) {
    if (report.date && (!latestDate || report.date > latestDate)) {
      latestDate = report.date;
    }
  }

  // Attach audit data to each product
  for (const cat of Object.values(categories)) {
    let catSpecIssues = 0;
    let catRedTeamFindings = 0;
    let catRedTeamCount = 0;
    let catSourceFlags = 0;

    for (const product of cat.products || []) {
      // 1. Source independence — from curation file
      const curationPath = findCurationFilePath(baseDir, cat.slug, product.slug);
      const curationData = curationPath ? loadJSON(curationPath) : null;
      const sourceIndependence = computeSourceIndependence(curationData);

      // 2. Spec verification — from SQLite
      const specVerification = loadSpecVerification(dbPath, product.slug, product.specs);

      // 3. Red-team — from markdown
      const redTeam = redTeamReports[product.slug] || null;

      product.audit = {
        sourceIndependence,
        specVerification,
        redTeam
      };

      // Roll up category stats
      if (specVerification.specs.some(s => s.status === 'discrepancy')) catSpecIssues++;
      if (redTeam && !redTeam.isClean) catRedTeamFindings++;
      if (redTeam) catRedTeamCount++;
      if (sourceIndependence.status === 'red') catSourceFlags++;
    }

    // Set category-level audit status
    cat.auditStats = {
      specIssues: catSpecIssues,
      redTeamFindings: catRedTeamFindings,
      redTeamAudited: catRedTeamCount,
      sourceFlags: catSourceFlags
    };

    if (catSpecIssues > 0 || catRedTeamFindings > 0) {
      cat.auditStatus = 'action';
    } else if (catSourceFlags > 0) {
      cat.auditStatus = 'review';
    } else {
      cat.auditStatus = 'clean';
    }
  }

  return {
    redTeamReports,
    dbPath,
    latestRedTeamDate: latestDate
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function findCurationFilePath(baseDir, category, slug) {
  const calibDir = path.join(baseDir, 'calibration', category);
  const curationDir = path.join(calibDir, 'curation_files');

  if (fs.existsSync(curationDir)) {
    const files = fs.readdirSync(curationDir).filter(f => f.endsWith('.json'));
    const match = files.find(f => f.includes(slug));
    if (match) return path.join(curationDir, match);
  }

  if (fs.existsSync(calibDir)) {
    const files = fs.readdirSync(calibDir).filter(f =>
      f.endsWith('.json') && f.includes(slug) &&
      (f.includes('_sources') || f.includes('_curation')) &&
      !f.includes('pipeline_progress') && f !== 'config.json'
    );
    if (files.length) return path.join(calibDir, files[0]);
  }

  const curationRoot = path.join(baseDir, 'curation');
  if (fs.existsSync(curationRoot)) {
    const files = fs.readdirSync(curationRoot).filter(f =>
      f.endsWith('.json') && f.includes(slug) &&
      (f.includes('_sources') || f.includes('_curation'))
    );
    if (files.length) return path.join(curationRoot, files[0]);
  }

  return null;
}

function loadJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return null; }
}

module.exports = { buildAuditData, computeSourceIndependence, loadSpecVerification, parseRedTeamReports };
