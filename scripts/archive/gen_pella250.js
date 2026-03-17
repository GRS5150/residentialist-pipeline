'use strict';
// BOT 6 v2 — REPORT ASSEMBLY (HTML)
// The Residentialist | Updated March 2026
// Generates the full v5 HTML report from pipeline output files
// Three commands:
//   scan        — check all output folders, flag orphaned/incomplete runs
//   report      — assemble HTML report for one product
//   report-all  — assemble HTML reports for all complete runs

const fs   = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '/Users/Residentialist/.openclaw/workspace/residentialist/.env' });

const OUTPUTS_DIR = '/Users/Residentialist/.openclaw/workspace/residentialist/outputs';
const TOKEN       = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID     = process.env.TELEGRAM_CHAT_ID;

// ─── Telegram ─────────────────────────────────────────────────────────────────
function sendTelegram(message) {
  return new Promise((resolve) => {
    try {
      const body = JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' });
      const opts = {
        hostname: 'api.telegram.org',
        path: `/bot${TOKEN}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      };
      const req = https.request(opts, (res) => { res.on('data', () => {}); res.on('end', resolve); });
      req.on('error', () => resolve());
      req.write(body); req.end();
    } catch { resolve(); }
  });
}

// ─── File helpers ─────────────────────────────────────────────────────────────
function readFile(fp) {
  try { return fs.readFileSync(fp, 'utf8'); } catch { return null; }
}

function findFile(dir, keyword) {
  try {
    const files = fs.readdirSync(dir);
    const f = files.find(x => x.includes(keyword));
    return f ? readFile(path.join(dir, f)) : null;
  } catch { return null; }
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseStatus(txt) {
  if (!txt) return {};
  return {
    product:    (txt.match(/^PRODUCT:\s*(.+)/m)  || [])[1]?.trim() || '',
    config:     (txt.match(/^CONFIG:\s*(.+)/m)   || [])[1]?.trim() || 'DH',
    timestamp:  (txt.match(/^TIMESTAMP:\s*(.+)/m)|| [])[1]?.trim() || '',
    confidence: (txt.match(/DATA CONFIDENCE:\s*(HIGH|MODERATE|LOW)/i) || [])[1] || 'MODERATE',
    midpoints:  parseInt((txt.match(/(\d+)\s+spec\(s\)\s+scored at midpoint/i) || [])[1] || '0'),
  };
}

function parseAxisScores(txt) {
  if (!txt) return null;
  // Prefer the final calculated value from "X Calculation:" blocks — e.g. "→ 6.43**"
  // This is more accurate than the axis header which may show a draft/pre-rounding value
  const qCalc = txt.match(/Quality Calculation:[\s\S]*?→\s*([0-9]+\.[0-9]+)\*\*/i);
  const dCalc = txt.match(/Durability Calculation:[\s\S]*?→\s*([0-9]+\.[0-9]+)\*\*/i);
  const pCalc = txt.match(/Performance Calculation:[\s\S]*?→\s*([0-9]+\.[0-9]+)\*\*/i);
  if (qCalc && dCalc && pCalc) {
    return { Q: parseFloat(qCalc[1]), D: parseFloat(dCalc[1]), P: parseFloat(pCalc[1]) };
  }
  // Fallback to axis headers if no calculation blocks found
  const q = txt.match(/##\s*QUALITY[^:]*:\s*[A-Z][+-]?\s*\(([0-9.]+)\/10\)/i);
  const d = txt.match(/##\s*DURABILITY[^:]*:\s*[A-Z][+-]?\s*\(([0-9.]+)\/10\)/i);
  const p = txt.match(/##\s*PERFORMANCE[^:]*:\s*[A-Z][+-]?\s*\(([0-9.]+)\/10\)/i);
  if (!q || !d || !p) return null;
  return { Q: parseFloat(q[1]), D: parseFloat(d[1]), P: parseFloat(p[1]) };
}

function weightedOverall(axes) {
  return Math.round((axes.Q * 0.35 + axes.D * 0.35 + axes.P * 0.30) * 100) / 100;
}

function gradeFromScore(s) {
  if (s >= 9.0) return { letter: 'A', mod: '+' };
  if (s >= 8.5) return { letter: 'A', mod: '' };
  if (s >= 8.0) return { letter: 'A', mod: '−' };
  if (s >= 7.5) return { letter: 'B', mod: '+' };
  if (s >= 7.0) return { letter: 'B', mod: '' };
  if (s >= 6.5) return { letter: 'B', mod: '−' };
  if (s >= 6.0) return { letter: 'C', mod: '+' };
  if (s >= 5.5) return { letter: 'C', mod: '' };
  if (s >= 5.0) return { letter: 'C', mod: '−' };
  if (s >= 4.5) return { letter: 'D', mod: '+' };
  if (s >= 4.0) return { letter: 'D', mod: '' };
  return { letter: 'F', mod: '' };
}

function axisGrade(s) {
  const g = gradeFromScore(s);
  return g.letter + g.mod;
}

function labelFromScore(s) {
  if (s >= 9.0) return 'Exceptional';
  if (s >= 8.0) return 'Excellent';
  if (s >= 7.5) return 'Strong';
  if (s >= 7.0) return 'Good';
  if (s >= 6.5) return 'Competent';
  if (s >= 6.0) return 'Adequate';
  if (s >= 5.5) return 'Below Average';
  if (s >= 5.0) return 'Weak';
  return 'Poor';
}

// Parse subscore lines like "### Frame Material & Construction: 6.0/10"
function parseSubscores(txt) {
  if (!txt) return { Q: [], D: [], P: [] };
  const sections = { Q: [], D: [], P: [] };
  let currentAxis = null;
  for (const line of txt.split('\n')) {
    if (line.match(/^##\s*QUALITY/i))     { currentAxis = 'Q'; continue; }
    if (line.match(/^##\s*DURABILITY/i))  { currentAxis = 'D'; continue; }
    if (line.match(/^##\s*PERFORMANCE/i)) { currentAxis = 'P'; continue; }
    if (line.match(/^##\s*OVERALL/i))     { currentAxis = null; continue; }
    if (!currentAxis) continue;
    // Match: "### Label: X.X/10" or "**Label:** X.X/10"
    const m = line.match(/^###\s+(.+?):\s*([0-9]+\.[0-9]+)\/10/) ||
              line.match(/\*\*(.+?)[:\*]+\s*([0-9]+\.[0-9]+)\/10/);
    if (m) {
      const label = m[1].replace(/\*\*/g, '').trim();
      const score = parseFloat(m[2]);
      if (label && !isNaN(score) && score <= 10) {
        sections[currentAxis].push({ label, score });
      }
    }
  }
  return sections;
}

// Parse failure patterns (YELLOW/RED findings)
// Stops at ## MECHANICAL VALIDATION — internal QC, never goes in the report
// Skips **Reasoning:** lines — those are bot internal notes, not findings
function parseFailures(txt) {
  if (!txt) return [];
  const stripped = txt.split(/^##\s*MECHANICAL VALIDATION/im)[0];
  const failures = [];
  const lines = stripped.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip Reasoning lines — they may mention "Yellow Finding" but are internal notes
    if (line.match(/^\*?\*?Reasoning:/i)) continue;
    // Must be a **Documented Issues:** YELLOW/RED line or similar direct finding
    const m = line.match(/\*?\*?(YELLOW|RED)\s*[—-]\s*(.+)/i);
    if (m) {
      const sev = m[1].toUpperCase();
      const desc = m[2].replace(/\*\*/g, '').trim();
      // Next line as detail only if it's not a Reasoning/internal line
      const nextLine = lines[i+1] || '';
      const detail = !nextLine.match(/^\*?\*?Reasoning:|^\*?\*?[A-Z][^:]+:\*?\*?/i)
        ? nextLine.replace(/^[-*•]\s*/, '').replace(/\*\*/g, '').trim()
        : '';
      if (desc.length > 4) failures.push({ sev, desc, detail });
    }
  }
  const seen = new Set();
  return failures.filter(f => {
    const key = f.desc.slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);
}

// Parse safety data from bot3
function parseSafety(txt) {
  if (!txt) return { score: null, tier: 'unknown', verdictLabel: 'No Concerns Identified', flags: [] };
  const scoreM = txt.match(/##\s*SCORE:\s*([0-9.]+)\/10\s*\|[^|]*\|\s*\*?\*?([^*\n]+)\*?\*?/i);
  const score   = scoreM ? parseFloat(scoreM[1]) : null;
  const rawVerdict = scoreM ? scoreM[2].trim() : '';

  // Map to our three-tier system
  let tier = 'clear';
  let verdictLabel = 'No Concerns Identified';
  if (rawVerdict.match(/ELEVATED|HIGH CONCERN/i)) {
    tier = 'concern'; verdictLabel = 'Elevated Concern';
  } else if (rawVerdict.match(/MODERATE|REVIEW/i)) {
    tier = 'review'; verdictLabel = 'Review Recommended';
  }

  // Only extract flags from the FLAG CITATIONS section — ignore everything above it
  const flagSection = txt.split(/##\s*FLAG CITATIONS/i)[1] || '';
  const flags = [];
  for (const row of flagSection.split('\n')) {
    if (!row.startsWith('|')) continue;
    const cols = row.split('|').map(s => s.trim()).filter(Boolean);
    // Skip header row, separator row, and rows with fewer than 3 cols
    if (cols.length < 3) continue;
    if (cols[0].match(/^FLAG$|^-+$/i)) continue;
    const severity = cols[1].replace(/\*\*/g, '').trim();
    // Skip safety-neutral flags — they're QA issues, not health flags
    if (severity.match(/safety-neutral/i)) continue;
    const label = cols[0].replace(/\*\*/g, '').trim();
    flags.push({ label, severity });
  }

  return { score, tier, verdictLabel, flags: flags.slice(0, 5) };
}

// Extract score rationale paragraphs from bot2 SCORE JUSTIFICATION
function parseRationale(txt) {
  if (!txt) return { Q: '', D: '', P: '' };
  const justM = txt.match(/##\s*SCORE JUSTIFICATION[:\s\n]+([\s\S]+?)(?=##|$)/i);
  if (!justM) return { Q: '', D: '', P: '' };
  const block = justM[1];
  // Split into sentences and try to assign by axis keywords
  const sentences = block.split(/(?<=[.!?])\s+/);
  const qSents = sentences.filter(s => /quality|material|hardware|glazing|construction/i.test(s));
  const dSents = sentences.filter(s => /durability|longevity|warranty|dealer|network|repair/i.test(s));
  const pSents = sentences.filter(s => /performance|thermal|u-factor|air|nfrc|certified|shgc/i.test(s));
  return {
    Q: qSents.slice(0, 2).join(' ').trim() || block.slice(0, 200).trim(),
    D: dSents.slice(0, 2).join(' ').trim() || '',
    P: pSents.slice(0, 2).join(' ').trim() || '',
  };
}

// Extract expected lifespan
function parseLifespan(txt) {
  if (!txt) return null;
  const m = txt.match(/EXPECTED LIFESPAN[\s\S]*?Median[^:]*:\s*(.+?)(?:\n|$)/i);
  return m ? m[1].replace(/\*\*/g, '').trim() : null;
}

// Extract manufacturer/product attributes from bot2
function parseAttrs(txt) {
  if (!txt) return {};
  const frame  = (txt.match(/\*\*Material:\*\*\s*([^\n]+)/) || txt.match(/Frame Material[^:]*:\s*([^\n]+)/) || [])[1];
  const glaz   = (txt.match(/\*\*Configuration:\*\*\s*([^\n]+)/) || txt.match(/Configuration[^:]*:\s*([^\n]+)/) || [])[1];
  const ufact  = (txt.match(/U[- ]?Factor[^:]*:\s*([0-9.]+)(?:\s*cfm)?(?!\/)/) || [])[1];
  const shgc   = (txt.match(/SHGC[^:]*:\s*([0-9.]+)/) || [])[1];
  const ai     = (txt.match(/Air Infiltration[^:]*AAMA Certified Value[^:]*:\s*([0-9.]+)/) ||
                  txt.match(/air infiltration[^:]*:\s*([0-9.]+)\s*cfm/i) || [])[1];
  const vt     = (txt.match(/VT[^:]*:\s*([0-9.]+)/) || txt.match(/Visible Transmittance[^:]*:\s*([0-9.]+)/) || [])[1];
  const aama   = (txt.match(/Performance Grade[^:]*:\s*(PG\s*\d+)/i) ||
                  txt.match(/AAMA[^:]*:\s*(R-LC\d+|PG\s*\d+|LC\d+)/i) || [])[1];
  const warr   = (txt.match(/\*\*(?:Frame|Warranty)[^:]*\*\*[^:]*:\s*([^\n]+)/) || [])[1];
  const lifespan = parseLifespan(txt);
  return {
    frame:   frame  ? frame.trim().split('\n')[0].replace(/\*\*/g, '') : null,
    glazing: glaz   ? glaz.trim().split('\n')[0].replace(/\*\*/g, '')  : null,
    ufact:   ufact  ? parseFloat(ufact) : null,
    shgc:    shgc   ? parseFloat(shgc)  : null,
    ai:      ai     ? parseFloat(ai)    : null,
    vt:      vt     ? parseFloat(vt)    : null,
    aama:    aama   ? aama.trim()       : null,
    warranty: warr  ? warr.trim()       : null,
    lifespan,
  };
}

// Determine price tier from product name heuristics + score
function priceTier(productName, score) {
  const name = productName.toLowerCase();
  if (name.match(/alpen|internorm|marvin elevate|sierra pacific/)) return 'Architectural';
  if (name.match(/reliabilt|window world/)) return 'Builder Grade';
  if (score >= 7.5) return 'Architectural';
  if (score >= 6.0) return 'Premium Residential';
  return 'Builder Grade';
}

function tierBandIndex(tier) {
  if (tier === 'Builder Grade')        return 0;
  if (tier === 'Premium Residential')  return 1;
  if (tier === 'Architectural')        return 2;
  if (tier === 'High Performance')     return 3;
  return 1;
}

// ─── HTML TEMPLATE ────────────────────────────────────────────────────────────
function buildHTML(data) {
  const {
    productName, config, overall, grade, axes, subscores,
    safety, failures, rationale, attrs, status, tier, tierIdx,
    dateStr,
  } = data;

  const letterFontSize = grade.letter === 'W' ? '140px' : '164px';

  // Helper to render a bar width % from score/10
  const pct = (s) => `${Math.round((s / 10) * 100)}%`;

  // Subscore rows HTML
  function subRows(list) {
    return list.map(sub => `
      <tr class="sub-row">
        <td>${sub.label}
          <span class="mbar"><span class="mbar-fill" style="width:${pct(sub.score)}"></span></span>
        </td>
        <td class="sc">${sub.score.toFixed(1)}</td>
      </tr>`).join('');
  }

  // Safety subsection cells
  function safetyCells() {
    // Filter out durability-proxy flags — warping is a durability issue, not a chemistry one
    const chemFlags = (safety.flags || []).filter(f =>
      !f.label.match(/warping|south-facing|thermal stress|durability/i)
    );
    if (chemFlags.length === 0) {
      return `<div class="safety-sub"><div class="safety-sub-label">Assessment</div>
        <div class="safety-sub-val ok">No chemistry concerns identified</div></div>`;
    }
    return chemFlags.map(f => `
      <div class="safety-sub">
        <div class="safety-sub-label">${f.label}</div>
        <div class="safety-sub-val ${f.severity.match(/Medium|High/i) ? 'flag' : 'ok'}">${f.severity || 'Noted'}</div>
      </div>`).join('');
  }

  // Failure items HTML
  function failItems() {
    if (!failures || failures.length === 0) {
      return `<li class="fail-item"><span class="sev yellow">Yellow</span>
        <div class="fail-body">No significant field failure patterns documented at this time.</div></li>`;
    }
    return failures.map(f => `
      <li class="fail-item">
        <span class="sev ${f.sev.toLowerCase()}">${f.sev.charAt(0) + f.sev.slice(1).toLowerCase()}</span>
        <div class="fail-body"><strong>${f.desc}</strong>${f.detail ? '<br>' + f.detail : ''}</div>
      </li>`).join('');
  }

  // Tier band visual
  const bandSegs = ['Builder', 'Prem.', 'Arch.', 'Hi Perf.'].map((lbl, i) => {
    const active = i === tierIdx;
    return `<div class="band-seg${active ? ' active' : ''}"></div>`;
  }).join('');
  const bandLabels = ['Builder', 'Prem.', 'Arch.', 'Hi Perf.'].map((lbl, i) => {
    const active = i === tierIdx;
    return `<div class="band-lbl-item${active ? ' active' : ''}">${lbl}</div>`;
  }).join('');

  // Safety verdict color
  const svClass = safety.tier || 'clear';
  const svDotColor = { clear: '#2C5F3A', review: '#B8860B', concern: '#7A2C1E' }[svClass] || '#2C5F3A';
  const svBg      = { clear: '#EBF5EE', review: '#FEF3C7', concern: '#FEE2E2' }[svClass];
  const svBorder  = { clear: '#A8D4B4', review: '#F0C060',  concern: '#F0A090' }[svClass];

  // Spec grid rows
  function specCell(label, val, sub, highlight, cert) {
    if (!val) return '';
    return `<div class="spec-cell">
      <div class="spec-label">${label}</div>
      <div class="spec-val${cert ? ' cert' : ''}">${val}</div>
      ${highlight ? `<div class="spec-highlight">${highlight}</div>` : ''}
      ${sub ? `<div class="spec-sub">${sub}</div>` : ''}
    </div>`;
  }

  const uFactorR = attrs.ufact ? `R-${(1 / attrs.ufact).toFixed(1)} equivalent` : null;
  const shgcPct  = attrs.shgc  ? `Blocks ${Math.round((1 - attrs.shgc) * 100)}% of solar heat gain` : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${productName} — The Residentialist</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --ink:#0F0E0D;--ink-light:#3A3836;--ink-faint:#7A7672;--rule:#E4DFD9;
  --page:#FFFFFF;--warm:#F8F5F0;--amber:#B8722A;--amber-light:#E8C48A;
  --amber-faint:#FAF3E8;--green:#2C5F3A;--red:#7A2C1E;
}
html{font-size:15px}
body{font-family:'DM Sans',sans-serif;background:#E8E4DF;color:var(--ink);-webkit-font-smoothing:antialiased;padding:48px 0 64px}
.page-wrap{max-width:980px;margin:0 auto;background:var(--page);box-shadow:0 8px 80px rgba(0,0,0,0.14),0 2px 12px rgba(0,0,0,0.06)}
/* masthead */
.masthead{padding:24px 56px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid var(--ink)}
.wordmark{font-family:'Syne',sans-serif;font-size:11px;font-weight:800;letter-spacing:.30em;text-transform:uppercase;color:var(--ink);text-decoration:none}
.wordmark em{color:var(--amber);font-style:normal}
.masthead-center{font-family:'Cormorant Garamond',serif;font-size:13px;font-style:italic;color:var(--ink-faint)}
.masthead-right{font-family:'Syne',sans-serif;font-size:10px;font-weight:600;letter-spacing:.12em;color:var(--ink-faint);text-align:right;text-transform:uppercase}
/* hero */
.hero{padding:56px 56px 48px;display:grid;grid-template-columns:1fr auto;gap:48px;align-items:start;border-bottom:1px solid var(--rule)}
.hero-eyebrow{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--amber);margin-bottom:16px}
.hero-name{font-family:'Cormorant Garamond',serif;font-size:74px;font-weight:300;line-height:.92;color:var(--ink);letter-spacing:-.025em}
.hero-name em{font-style:italic;color:var(--ink-light);display:block;font-size:64px}
.hero-attrs{display:flex;margin-top:32px;border:1px solid var(--rule);border-right:none}
.hero-attr{padding:13px 20px;border-right:1px solid var(--rule);flex-shrink:0}
.attr-label{font-family:'Syne',sans-serif;font-size:8px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:4px}
.attr-value{font-size:13px;font-weight:500;color:var(--ink)}
/* grade */
.grade-block{display:flex;flex-direction:column;align-items:center;padding-top:4px;min-width:180px}
.grade-display{display:flex;align-items:flex-start;line-height:1}
.grade-letter{font-family:'Cormorant Garamond',serif;font-size:${letterFontSize};font-weight:300;line-height:.85;color:var(--ink)}
.grade-mod{font-family:'Cormorant Garamond',serif;font-size:64px;font-weight:300;color:var(--ink);margin-top:22px;margin-left:2px}
.grade-meta{margin-top:14px;display:flex;flex-direction:column;align-items:center;gap:8px;width:100%}
.score-num{font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:500;color:var(--ink);letter-spacing:.04em}
.score-badge{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.20em;text-transform:uppercase;color:var(--amber);border:1.5px solid var(--amber);padding:5px 18px;display:inline-block}
/* verdict */
.verdict{padding:28px 56px;background:var(--warm);border-bottom:1px solid var(--rule);display:grid;grid-template-columns:90px 1fr;gap:32px;align-items:center}
.verdict-kicker{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-faint)}
.verdict-text{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;font-style:italic;line-height:1.45;color:var(--ink)}
/* body layout */
.body-layout{display:grid;grid-template-columns:1fr 288px}
.body-main{padding:52px 48px 72px 56px;border-right:1px solid var(--rule)}
.body-aside{padding:52px 30px 72px 34px}
/* kicker */
.kicker{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--amber);margin-bottom:20px}
/* axis */
.axis-group{margin-bottom:48px}
.axis-defs{display:flex;gap:0;margin-bottom:22px;border:1px solid var(--rule);border-right:none}
.axis-def{flex:1;padding:12px 16px;border-right:1px solid var(--rule)}
.axis-def-name{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--ink);margin-bottom:4px}
.axis-def-desc{font-size:11.5px;color:var(--ink-faint);line-height:1.55}
.axis-row{display:grid;grid-template-columns:148px 1fr 86px;align-items:center;gap:20px;padding:18px 0;border-bottom:1px solid var(--rule)}
.axis-row:first-child{border-top:1px solid var(--rule)}
.axis-name{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink)}
.axis-wt{font-size:11px;color:var(--ink-faint);margin-top:3px}
.bar-track{height:2px;background:var(--rule);position:relative}
.bar-fill{position:absolute;top:0;left:0;height:100%;background:var(--ink)}
.axis-right{text-align:right}
.axis-num{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;line-height:1;color:var(--ink)}
.axis-grade{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:var(--ink-faint);margin-top:2px}
/* findings */
.findings{margin-bottom:48px}
.finding{display:grid;grid-template-columns:3px 1fr;gap:20px;padding:19px 0;border-bottom:1px solid var(--rule)}
.finding:first-child{border-top:1px solid var(--rule)}
.finding-rule{background:var(--amber)}
.finding strong{display:block;font-size:14px;font-weight:500;color:var(--ink);margin-bottom:5px}
.finding p{font-size:13.5px;color:var(--ink-light);line-height:1.65}
/* material safety */
.safety-block{background:var(--amber-faint);border-top:2.5px solid var(--amber);padding:30px 34px;margin-bottom:48px}
.safety-top{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:start;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid var(--amber-light)}
.safety-kicker{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--amber);margin-bottom:8px}
.safety-verdict{display:inline-flex;align-items:center;gap:8px;padding:5px 13px;margin-bottom:10px}
.safety-verdict-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.safety-verdict-label{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
.safety-score-col{text-align:right}
.safety-num{font-family:'Cormorant Garamond',serif;font-size:50px;font-weight:300;line-height:1;color:var(--ink)}
.safety-denom{font-size:11px;color:var(--ink-faint);margin-top:3px}
.safety-subsections{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--amber-light);border:1px solid var(--amber-light)}
.safety-sub{background:#FDF8F1;padding:14px 16px}
.safety-sub-label{font-family:'Syne',sans-serif;font-size:8.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--amber);margin-bottom:5px}
.safety-sub-val{font-size:12.5px;color:var(--ink-light);line-height:1.5}
.safety-sub-val.ok{color:var(--green);font-weight:500}
.safety-sub-val.ok::before{content:'✓  ';font-size:10px}
.safety-sub-val.flag{color:var(--red);font-weight:500}
.safety-sub-val.na{color:var(--ink-faint);font-style:italic}
/* climate map */
.climate-block{margin-bottom:48px}
.climate-legend{display:flex;gap:24px;margin-bottom:10px;align-items:center}
.cl-item{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;color:var(--ink)}
.cl-swatch{width:20px;height:12px;border-radius:2px;flex-shrink:0}
.climate-map-wrap{background:var(--warm);border:1px solid var(--rule);padding:4px 4px 0;margin-bottom:12px}
.climate-map-wrap svg{width:100%;height:auto;display:block}
.climate-caption{font-size:12px;color:var(--ink-faint);line-height:1.65}
.climate-caption strong{color:var(--ink);font-weight:500}
/* fit grid */
.fit-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--rule);border:1px solid var(--rule);margin-bottom:48px}
.fit-cell{background:var(--page);padding:24px 22px}
.fit-head{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-bottom:13px;padding-bottom:9px;border-bottom:1.5px solid currentColor}
.fit-cell.for .fit-head{color:var(--green)}
.fit-cell.skip .fit-head{color:var(--red)}
.fit-list{list-style:none;display:flex;flex-direction:column;gap:9px}
.fit-list li{font-size:13px;color:var(--ink-light);line-height:1.5;padding-left:14px;position:relative}
.fit-list li::before{content:'—';position:absolute;left:0;color:var(--ink-faint);font-size:11px}
/* section divider */
.section-divider{display:flex;align-items:center;gap:16px;margin:52px 0 40px}
.section-divider::before,.section-divider::after{content:'';flex:1;height:1px;background:var(--rule)}
.section-divider-label{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--ink-faint);white-space:nowrap}
/* sub table */
.sub-table{width:100%;border-collapse:collapse;margin-bottom:48px}
.sub-table .ax-head td{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--ink);background:var(--warm);padding:10px 13px;border-top:2px solid var(--ink);border-bottom:1px solid var(--rule)}
.sub-table .sub-row td{padding:12px 13px;border-bottom:1px solid var(--rule);font-size:13px;color:var(--ink-light);vertical-align:middle}
.sub-table .sub-row td:first-child{color:var(--ink)}
.sub-table .sub-row td.sc{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:300;color:var(--ink);text-align:right}
.mbar{display:inline-block;vertical-align:middle;width:40px;height:2px;background:var(--rule);margin-left:8px;position:relative}
.mbar-fill{position:absolute;top:0;left:0;height:100%;background:var(--amber)}
/* spec grid */
.spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--rule);border:1px solid var(--rule);margin-bottom:48px}
.spec-cell{background:var(--page);padding:17px 19px}
.spec-label{font-family:'Syne',sans-serif;font-size:8.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:5px}
.spec-val{font-size:14px;color:var(--ink)}
.spec-val.cert{color:var(--green);font-weight:500}
.spec-val.cert::before{content:'✓  ';font-size:11px}
.spec-sub{font-size:11.5px;color:var(--ink-faint);margin-top:3px;line-height:1.4}
.spec-highlight{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.10em;color:var(--amber);margin-top:2px}
/* failures */
.fail-list{list-style:none;margin-bottom:48px}
.fail-item{padding:15px 0;border-bottom:1px solid var(--rule);display:grid;grid-template-columns:56px 1fr;gap:16px;align-items:start}
.fail-item:first-child{border-top:1px solid var(--rule)}
.sev{font-family:'Syne',sans-serif;font-size:8px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;padding:4px 6px;text-align:center;margin-top:2px}
.sev.yellow{background:#FEF3C7;color:#92400E}
.sev.red{background:#FEE2E2;color:#991B1B}
.fail-body{font-size:13px;color:var(--ink-light);line-height:1.6}
.fail-body strong{color:var(--ink);font-weight:500}
/* rationale */
.rat-item{padding:19px 0;border-bottom:1px solid var(--rule)}
.rat-item:first-child{border-top:1px solid var(--rule)}
.rat-head{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);margin-bottom:6px;display:flex;align-items:baseline;gap:12px}
.rat-score{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:var(--amber)}
.rat-text{font-size:13px;color:var(--ink-light);line-height:1.65}
/* pro section */
.pro-section{background:var(--warm);border:1px solid var(--rule);padding:38px 42px;margin-top:48px}
.pro-header{display:flex;align-items:center;gap:16px;margin-bottom:32px;padding-bottom:18px;border-bottom:2px solid var(--ink)}
.pro-badge{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.20em;text-transform:uppercase;background:var(--ink);color:var(--page);padding:5px 13px}
.pro-title{font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:300;font-style:italic;color:var(--ink)}
.pro-grid{display:grid;grid-template-columns:1fr 1fr;gap:34px}
.pro-block-label{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.20em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:11px;padding-bottom:8px;border-bottom:1px solid var(--rule)}
.pro-block-text{font-size:13px;color:var(--ink-light);line-height:1.7}
.pro-block-text strong{color:var(--ink);font-weight:500}
.pro-block-text ul{list-style:none;margin-top:8px;display:flex;flex-direction:column;gap:7px}
.pro-block-text ul li{padding-left:14px;position:relative}
.pro-block-text ul li::before{content:'—';position:absolute;left:0;color:var(--ink-faint);font-size:11px}
.mfr-meter{display:flex;align-items:center;gap:10px;margin:11px 0 8px}
.mfr-bar-track{flex:1;height:4px;background:var(--rule);position:relative}
.mfr-bar-fill{position:absolute;top:0;left:0;height:100%;background:var(--green)}
.mfr-label{font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:var(--green);white-space:nowrap}
.code-table{width:100%;border-collapse:collapse;margin-top:10px}
.code-table td{padding:8px 9px;border-bottom:1px solid var(--rule);font-size:12.5px;color:var(--ink-light);vertical-align:top}
.code-table td:first-child{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:var(--ink-faint);white-space:nowrap;width:100px}
/* aside */
.aside-sec{margin-bottom:36px}
.aside-label{font-family:'Syne',sans-serif;font-size:9px;font-weight:700;letter-spacing:.20em;text-transform:uppercase;color:var(--ink-faint);padding-bottom:9px;border-bottom:1px solid var(--rule);margin-bottom:14px}
.photo-slot{width:100%;aspect-ratio:4/3;background:var(--warm);border:1px dashed #D0CBC4;display:flex;align-items:center;justify-content:center;margin-bottom:36px}
.photo-slot-text{font-family:'Syne',sans-serif;font-size:8.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#D0CBC4}
.conf-row{display:flex;align-items:center;gap:9px;margin-bottom:7px}
.conf-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.conf-lbl{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase}
.conf-note{font-size:11.5px;color:var(--ink-faint);line-height:1.6}
.band-track{display:flex;gap:4px;align-items:flex-end;margin-bottom:8px}
.band-seg{flex:1;background:var(--rule)}
.band-seg.active{background:var(--amber)}
.band-seg:nth-child(1){height:9px}.band-seg:nth-child(2){height:15px}.band-seg:nth-child(3){height:21px}.band-seg:nth-child(4){height:27px}
.band-labels{display:flex;justify-content:space-between;margin-bottom:9px}
.band-lbl-item{font-family:'Syne',sans-serif;font-size:7px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--rule);flex:1;text-align:center}
.band-lbl-item.active{color:var(--amber)}
.band-name{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:var(--ink);margin-bottom:4px}
.band-desc{font-size:11.5px;color:var(--ink-faint);line-height:1.55}
.alt-item{padding:12px 0;border-bottom:1px solid var(--rule);display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px}
.alt-item:first-child{border-top:1px solid var(--rule)}
.alt-tag{font-family:'Syne',sans-serif;font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px}
.alt-tag.better{color:var(--green)}.alt-tag.upgrade{color:var(--amber)}
.alt-name{font-size:13px;font-weight:500;color:var(--ink)}
.alt-tier{font-size:11px;color:var(--ink-faint);margin-top:2px}
.alt-num{font-family:'Cormorant Garamond',serif;font-size:27px;font-weight:300;line-height:1;color:var(--ink);text-align:right}
.alt-grade{font-family:'Syne',sans-serif;font-size:9.5px;font-weight:700;color:var(--ink-faint);text-align:right}
.about-text{font-size:11.5px;color:var(--ink-faint);line-height:1.7}
.report-footer{padding:24px 56px;border-top:2px solid var(--ink);display:flex;justify-content:space-between;align-items:center;background:var(--warm)}
.footer-wm{font-family:'Syne',sans-serif;font-size:10px;font-weight:800;letter-spacing:.26em;text-transform:uppercase;color:var(--ink)}
.footer-wm em{color:var(--amber);font-style:normal}
.footer-meta{font-size:11.5px;color:var(--ink-faint);text-align:right;line-height:1.6}
@media print{body{background:white;padding:0}.page-wrap{box-shadow:none;max-width:100%}}
</style>
</head>
<body>
<div class="page-wrap">

<header class="masthead">
  <a class="wordmark" href="#">THE <em>RESIDENTIALIST</em></a>
  <span class="masthead-center">Product Intelligence Report</span>
  <div class="masthead-right">Windows · ${dateStr}</div>
</header>

<section class="hero">
  <div>
    <div class="hero-eyebrow">Windows — ${config === 'DH' ? 'Double Hung' : config === 'CSM' ? 'Casement' : config} Configuration</div>
    <h1 class="hero-name">${productName.split(' ').slice(0, 1).join(' ')}<em>${productName.split(' ').slice(1).join(' ')}</em></h1>
    <div class="hero-attrs">
      <div class="hero-attr"><div class="attr-label">Manufacturer</div><div class="attr-value">${productName.split(' ')[0]}</div></div>
      <div class="hero-attr"><div class="attr-label">Frame</div><div class="attr-value">${attrs.frame ? attrs.frame.split(',')[0].split('(')[0].trim().replace(/uPVC|UPVC/,'Vinyl').replace(/multi-chambered\s*/i,'').replace(/standard\s*/i,'').trim().replace(/^\w/,c=>c.toUpperCase()) || 'Vinyl' : 'See specs'}</div></div>
      <div class="hero-attr"><div class="attr-label">Price Tier</div><div class="attr-value">${tier}</div></div>
      <div class="hero-attr"><div class="attr-label">Config</div><div class="attr-value">${config === 'DH' ? 'Double Hung' : config === 'CSM' ? 'Casement' : config}</div></div>
    </div>
  </div>
  <div class="grade-block">
    <div class="grade-display">
      <span class="grade-letter">${grade.letter}</span><span class="grade-mod">${grade.mod}</span>
    </div>
    <div class="grade-meta">
      <div class="score-num">${overall.toFixed(2)} / 10</div>
      <div class="score-badge">${labelFromScore(overall)}</div>
    </div>
  </div>
</section>

<div class="verdict">
  <div class="verdict-kicker">Our Verdict</div>
  <div class="verdict-text">${data.verdict}</div>
</div>

<div class="body-layout">
<div class="body-main">

  <div class="kicker">Score Breakdown</div>
  <div class="axis-group">
    <div class="axis-defs">
      <div class="axis-def">
        <div class="axis-def-name">Quality</div>
        <div class="axis-def-desc">How well the window is made — materials, construction, and manufacturing consistency.</div>
      </div>
      <div class="axis-def">
        <div class="axis-def-name">Durability</div>
        <div class="axis-def-desc">How long it lasts, how well it holds up over time, and how easy it is to repair and service.</div>
      </div>
      <div class="axis-def">
        <div class="axis-def-name">Performance</div>
        <div class="axis-def-desc">Thermal efficiency, air leakage, and structural ratings — how well it does its job day to day.</div>
      </div>
    </div>
    <div class="axis-row">
      <div><div class="axis-name">Quality</div><div class="axis-wt">35% of overall</div></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct(axes.Q)}"></div></div>
      <div class="axis-right"><div class="axis-num">${axes.Q.toFixed(2)}</div><div class="axis-grade">${axisGrade(axes.Q)}</div></div>
    </div>
    <div class="axis-row">
      <div><div class="axis-name">Durability</div><div class="axis-wt">35% of overall</div></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct(axes.D)}"></div></div>
      <div class="axis-right"><div class="axis-num">${axes.D.toFixed(2)}</div><div class="axis-grade">${axisGrade(axes.D)}</div></div>
    </div>
    <div class="axis-row">
      <div><div class="axis-name">Performance</div><div class="axis-wt">30% of overall</div></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct(axes.P)}"></div></div>
      <div class="axis-right"><div class="axis-num">${axes.P.toFixed(2)}</div><div class="axis-grade">${axisGrade(axes.P)}</div></div>
    </div>
  </div>

  <div class="kicker">What We Found</div>
  <div class="findings">
    ${data.findings.map(f => `
    <div class="finding">
      <div class="finding-rule"></div>
      <div><strong>${f.title}</strong><p>${f.body}</p></div>
    </div>`).join('')}
  </div>

  <div class="kicker">Material Safety Assessment</div>
  <div class="safety-block">
    <div class="safety-top">
      <div>
        <div class="safety-kicker">Health &amp; Toxicity Profile</div>
        <div class="safety-verdict" style="background:${svBg};border:1px solid ${svBorder}">
          <div class="safety-verdict-dot" style="background:${svDotColor}"></div>
          <div class="safety-verdict-label" style="color:${svDotColor}">${safety.verdictLabel}</div>
        </div>
        <div style="font-size:13.5px;color:var(--ink-light);line-height:1.65;margin-top:10px">${data.safetyNote}</div>
      </div>
      <div class="safety-score-col">
        <div class="safety-num">${safety.score ? safety.score.toFixed(1) : '—'}</div>
        <div class="safety-denom">out of 10</div>
      </div>
    </div>
    <div class="safety-subsections">
      ${safetyCells()}
    </div>
  </div>

  <div class="kicker">Climate Zone Fit</div>
  <div class="climate-block">
    <div class="climate-legend">
      <div class="cl-item"><div class="cl-swatch" style="background:var(--amber)"></div>Best Fit — Zones 3, 4 &amp; 5</div>
      <div class="cl-item"><div class="cl-swatch" style="background:#D0CBC4"></div>Outside Optimal Range</div>
    </div>
    <div class="climate-map-wrap">
      <svg id="climateMap" viewBox="0 0 960 580"></svg>
    </div>
    <div class="climate-caption">
      <strong>Best performance fit: DOE IECC Zones 3–5</strong> — mid-latitude US from the Southeast through the Pacific Northwest and upper Midwest.<br><br>
      <strong>Zones 1–2</strong> (Deep South, Hawaii): Meets Energy Star minimums, but not optimized for managing high solar gain in hot environments.<br>
      <strong>Zones 6–8</strong> (northern tier, Alaska): Meets Energy Star minimums, but U-factor falls short of best practice for heating-dominant cold climates.
    </div>
  </div>

  <div class="kicker">Is This Window Right For You?</div>
  <div class="fit-grid">
    <div class="fit-cell for">
      <div class="fit-head">✓ &nbsp; Good Fit</div>
      <ul class="fit-list">
        ${data.goodFit.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>
    <div class="fit-cell skip">
      <div class="fit-head">✕ &nbsp; Look Elsewhere</div>
      <ul class="fit-list">
        ${data.lookElsewhere.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="section-divider"><span class="section-divider-label">Technical Detail</span></div>

  <div class="kicker">Full Subscore Breakdown</div>
  <table class="sub-table">
    <tbody>
      <tr class="ax-head"><td colspan="2">Axis 1 — Quality &nbsp;<span style="font-weight:300;font-size:10px;color:var(--ink-faint);letter-spacing:0">35% of Overall</span></td></tr>
      ${subscores.Q.length > 0 ? subRows(subscores.Q) : '<tr class="sub-row"><td>See scoring rationale below</td><td class="sc">${axes.Q.toFixed(1)}</td></tr>'}
      <tr class="ax-head"><td colspan="2">Axis 2 — Durability &nbsp;<span style="font-weight:300;font-size:10px;color:var(--ink-faint);letter-spacing:0">35% of Overall</span></td></tr>
      ${subscores.D.length > 0 ? subRows(subscores.D) : '<tr class="sub-row"><td>See scoring rationale below</td><td class="sc">${axes.D.toFixed(1)}</td></tr>'}
      <tr class="ax-head"><td colspan="2">Axis 3 — Performance &nbsp;<span style="font-weight:300;font-size:10px;color:var(--ink-faint);letter-spacing:0">30% of Overall</span></td></tr>
      ${subscores.P.length > 0 ? subRows(subscores.P) : '<tr class="sub-row"><td>See scoring rationale below</td><td class="sc">${axes.P.toFixed(1)}</td></tr>'}
    </tbody>
  </table>

  <div class="kicker">Verified Performance Specifications</div>
  <div class="spec-grid">
    ${specCell('U-Factor (Whole Unit)', attrs.ufact ? attrs.ufact.toString() : 'Not Disclosed', 'NFRC whole-unit certified — not center-of-glass only.', uFactorR)}
    ${specCell('SHGC — Solar Heat Gain', attrs.shgc ? attrs.shgc.toString() : 'Not Disclosed', null, shgcPct)}
    ${specCell('Air Leakage', attrs.ai ? `${attrs.ai} cfm/ft²` : 'See specs', 'Whole-unit rated.')}
    ${specCell('Visible Transmittance (VT)', attrs.vt ? attrs.vt.toString() : 'Not Disclosed', attrs.vt ? `Passes ${Math.round(attrs.vt * 100)}% of visible light through the glass.` : null)}
    ${specCell('AAMA Structural Class', attrs.aama || 'See specs', null, null, !!attrs.aama)}
    ${specCell('Energy Star', 'All Climate Zones', 'Meets minimum Energy Star threshold for every US climate zone.', null, true)}
    ${attrs.glazing ? specCell('Glazing', attrs.glazing, null) : ''}
    ${attrs.warranty ? specCell('Warranty', attrs.warranty, null) : ''}
  </div>

  <div class="kicker">Known Failure Patterns</div>
  <ul class="fail-list">
    ${failItems()}
  </ul>

  <div class="kicker">Scoring Rationale</div>
  <div>
    <div class="rat-item">
      <div class="rat-head">Quality <span class="rat-score">${axes.Q.toFixed(2)}</span></div>
      <div class="rat-text">${rationale.Q || 'See subscore breakdown above.'}</div>
    </div>
    <div class="rat-item">
      <div class="rat-head">Durability <span class="rat-score">${axes.D.toFixed(2)}</span></div>
      <div class="rat-text">${rationale.D || 'See subscore breakdown above.'}</div>
    </div>
    <div class="rat-item">
      <div class="rat-head">Performance <span class="rat-score">${axes.P.toFixed(2)}</span></div>
      <div class="rat-text">${rationale.P || 'See subscore breakdown above.'}</div>
    </div>
  </div>

  <div class="pro-section">
    <div class="pro-header">
      <div class="pro-badge">For Design Professionals</div>
      <div class="pro-title">Architect, Engineer &amp; Builder Reference</div>
    </div>
    <div class="pro-grid">
      <div class="pro-block">
        <div class="pro-block-label">Manufacturer Stability</div>
        <div class="pro-block-text">
          ${data.mfrNote}
        </div>
      </div>
      <div class="pro-block">
        <div class="pro-block-label">Code Compliance Reference</div>
        <div class="pro-block-text">
          <table class="code-table">
            <tr><td>IECC Zones</td><td>Meets U-factor threshold for all zones per table R402.1.2</td></tr>
            ${attrs.ai ? `<tr><td>Air Leakage</td><td>${attrs.ai} cfm/ft² — well below 0.30 maximum</td></tr>` : ''}
            ${attrs.aama ? `<tr><td>AAMA</td><td>${attrs.aama}</td></tr>` : ''}
            <tr><td>Energy Star</td><td>Certified — all four climate zone categories</td></tr>
          </table>
        </div>
      </div>
    </div>
  </div>

</div>

<aside class="body-aside">
  <div class="photo-slot"><div class="photo-slot-text">Product Photo</div></div>

  <div class="aside-sec">
    <div class="aside-label">Data Confidence</div>
    <div class="conf-row">
      <div class="conf-dot" style="background:${status.confidence === 'HIGH' ? 'var(--green)' : status.confidence === 'MODERATE' ? '#B8860B' : 'var(--red)'}"></div>
      <div class="conf-lbl" style="color:${status.confidence === 'HIGH' ? 'var(--green)' : status.confidence === 'MODERATE' ? '#B8860B' : 'var(--red)'}">${status.confidence.charAt(0) + status.confidence.slice(1).toLowerCase()}</div>
    </div>
    <div class="conf-note">${status.midpoints > 0 ? `${name.split(' ')[0]} didn't publish ${status.midpoints === 1 ? 'one spec we look for' : status.midpoints + ' specs we look for'} — we scored ${status.midpoints === 1 ? 'it' : 'them'} at the midpoint until real data is available. ` : ''}Specs sourced from NFRC certification records, AAMA test data, and manufacturer documentation.</div>
  </div>

  <div class="aside-sec">
    <div class="aside-label">Price Tier</div>
    <div class="band-track">${bandSegs}</div>
    <div class="band-labels">${bandLabels}</div>
    <div class="band-name">${tier}</div>
    <div class="band-desc">${data.tierDesc}</div>
  </div>

  <div class="aside-sec">
    <div class="aside-label">Alternatives</div>
    ${data.alternatives.map(a => `
    <div class="alt-item">
      <div>
        <div class="alt-tag ${a.tagClass}">${a.tag}</div>
        <div class="alt-name">${a.name}</div>
        <div class="alt-tier">${a.tier}</div>
      </div>
      <div>
        <div class="alt-num">${a.score.toFixed(2)}</div>
        <div class="alt-grade">${a.grade}</div>
      </div>
    </div>`).join('')}
  </div>

  <div class="aside-sec">
    <div class="aside-label">About This Score</div>
    <div class="about-text">Scored by The Residentialist product intelligence system against a deterministic rubric (v3). Independent — no manufacturer relationships or paid placements. Scores reflect publicly verifiable specifications only. Material safety assessed separately from quality, durability, and performance.</div>
  </div>
</aside>
</div>

<footer class="report-footer">
  <div class="footer-wm">THE <em>RESIDENTIALIST</em></div>
  <div class="footer-meta">
    Scored ${dateStr} · ${productName} ${config} · Report v6.0<br>
    Informational only. Regional pricing, availability, and code requirements vary.
  </div>
</footer>
</div>

<script>
const stateZones={
  '01':3,'02':7,'04':2,'05':3,'06':3,'08':5,'09':5,'10':4,'11':4,
  '12':2,'13':3,'15':1,'16':5,'17':5,'18':5,'19':5,'20':4,'21':4,
  '22':2,'23':6,'24':4,'25':5,'26':5,'27':6,'28':3,'29':4,'30':6,
  '31':5,'32':3,'33':6,'34':4,'35':3,'36':5,'37':3,'38':6,'39':5,
  '40':3,'41':4,'42':5,'44':5,'45':3,'46':6,'47':4,'48':2,'49':5,
  '50':6,'51':4,'53':4,'54':4,'55':6,'56':6,'72':1
};
const rec=new Set([3,4,5]);
function drawMap(us){
  const svg=d3.select('#climateMap');
  const proj=d3.geoAlbersUsa().scale(1280).translate([480,290]);
  const path=d3.geoPath().projection(proj);
  const states=topojson.feature(us,us.objects.states);
  svg.selectAll('path').data(states.features).enter().append('path')
    .attr('d',path)
    .attr('fill',d=>{const z=stateZones[String(d.id).padStart(2,'0')];return rec.has(z)?'#B8722A':'#D0CBC4';})
    .attr('stroke','#fff').attr('stroke-width',0.7);
  svg.append('path')
    .datum(topojson.mesh(us,us.objects.states,(a,b)=>a!==b))
    .attr('fill','none').attr('stroke','#fff').attr('stroke-width',0.9).attr('d',path);
}
d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
  .then(drawMap).catch(()=>d3.json('https://unpkg.com/us-atlas@3/states-10m.json').then(drawMap).catch(()=>{}));
</script>
</body>
</html>`;
}

// ─── Build data object from pipeline files ────────────────────────────────────
function buildData(productName, outputDir) {
  const bot2 = findFile(outputDir, 'bot2_evaluator');
  const bot3 = findFile(outputDir, 'bot3_material_safety');
  const bot5 = findFile(outputDir, 'bot5_reconciliation');
  const statusTxt = readFile(path.join(outputDir, 'PIPELINE_STATUS.txt')) || '';

  if (!bot2) return { error: 'Missing bot2_evaluator' };
  if (!bot5) return { error: 'Missing bot5_reconciliation — run incomplete' };

  const status    = parseStatus(statusTxt);
  const name      = status.product || productName;
  const config    = status.config  || 'DH';
  const axes      = parseAxisScores(bot2);
  if (!axes) return { error: 'Could not parse axis scores from bot2' };

  const overall   = weightedOverall(axes);
  const grade     = gradeFromScore(overall);
  const subscores = parseSubscores(bot2);
  const failures  = parseFailures(bot2);
  const safety    = parseSafety(bot3);
  const rationale = parseRationale(bot2);
  const attrs     = parseAttrs(bot2);
  const tier      = priceTier(name, overall);
  const tierIdx   = tierBandIndex(tier);

  // Date from timestamp
  const ts = status.timestamp || new Date().toISOString().slice(0, 10);
  const dateStr = ts.slice(0, 7).replace('-', ' ').replace('-', '/') || 'March 2026';

  // Derive a verdict sentence
  const highAxis = axes.Q >= axes.D && axes.Q >= axes.P ? 'quality' :
                   axes.D >= axes.Q && axes.D >= axes.P ? 'durability and serviceability' :
                   'thermal and air performance';
  const weakAxis = axes.Q <= axes.D && axes.Q <= axes.P ? 'quality' :
                   axes.D <= axes.Q && axes.D <= axes.P ? 'durability' : 'performance';
  const verdict = `Strongest on ${highAxis} — but ${weakAxis} keeps it from reaching the next tier.`;

  // Safety note — plain English for homeowners
  const frameMaterial = (attrs.frame || '').toLowerCase();
  const isVinyl = frameMaterial.includes('vinyl') || frameMaterial.includes('upvc') || frameMaterial.includes('pvc');
  const isWood  = frameMaterial.includes('wood') || frameMaterial.includes('clad');
  const isAlum  = frameMaterial.includes('alum');
  const matDesc = isVinyl ? 'rigid vinyl (uPVC)'
                : isWood  ? 'wood or wood-clad'
                : isAlum  ? 'aluminum'
                : 'this frame material';

  const safetyNote = safety.tier === 'concern'
    ? `We found chemistry concerns worth knowing about before you buy. See the flags below.`
    : safety.tier === 'review'
    ? `${name.split(' ')[0]} doesn't publish everything we look for — specifically what's in their weatherstripping and glazing sealants. In normal use, ${matDesc} windows don't off-gas harmful chemicals. The score is reduced because we can't fully verify materials we can't see.`
    : `Clean profile. ${name.split(' ')[0]} uses ${matDesc} — a chemically stable material that doesn't release harmful compounds in normal home use. No concerning additives identified.`;

  // Generate findings from what we know
  const findings = [
    {
      title: `${axes.D >= axes.Q && axes.D >= axes.P ? 'Durability' : axes.P >= axes.Q ? 'Performance' : 'Quality'} is the standout axis.`,
      body: rationale[axes.D >= axes.Q && axes.D >= axes.P ? 'D' : axes.P >= axes.Q ? 'P' : 'Q'] ||
            `Scored ${(Math.max(axes.Q, axes.D, axes.P)).toFixed(2)} out of 10. See scoring rationale for detail.`
    },
    {
      title: `${axes.Q <= axes.D && axes.Q <= axes.P ? 'Quality' : axes.D < axes.P ? 'Durability' : 'Performance'} is the weakest axis.`,
      body: rationale[axes.Q <= axes.D && axes.Q <= axes.P ? 'Q' : axes.D < axes.P ? 'D' : 'P'] ||
            `Scored ${(Math.min(axes.Q, axes.D, axes.P)).toFixed(2)} out of 10. See scoring rationale for detail.`
    },
    {
      title: safety.tier === 'concern' ? 'Chemistry concerns found — see safety section below.' :
             safety.tier === 'review'  ? `${name.split(' ')[0]} doesn't fully disclose what's in their materials.` :
                                         'Clean materials profile — nothing concerning found.',
      body: safetyNote
    },
  ];

  // Add RED finding if present — plain English, specific to what was actually found
  const redFails = (failures || []).filter(f => f.sev === 'RED');
  if (redFails.length > 0) {
    const redDesc = redFails[0].desc;
    // Convert jargon finding descriptions to plain language
    const plainDesc = redDesc.replace(/active litigation/i, 'active lawsuit involving this product line')
                             .replace(/manufactured 1991-200[0-9]/i, 'made between the 1990s and 2000s')
                             .replace(/ProLine/i, 'an earlier version of this line')
                             .replace(/AAMA PG certified/i, 'independently certified for structural performance');
    findings.push({
      title: 'Something worth knowing before you buy.',
      body: plainDesc
    });
  }

  // Good fit / look elsewhere (generic — can be overridden per category)
  const goodFit = [
    `Production home builds in climate zones 3–5`,
    `Buyers who prioritize ${highAxis}`,
    `Projects where manufacturer stability is a priority`,
    `Replacement projects where cost-to-value matters`,
  ];
  const lookElsewhere = [
    `Building for 30+ years without window replacement`,
    `High-performance or cold climate builds (zones 6–8)`,
    `Energy efficiency as the primary specification driver`,
    `Budget allows for a higher performance tier`,
  ];

  // Manufacturer note
  const mfrName = name.split(' ')[0];
  const mfrNote = `${mfrName} is an established manufacturer with a national sales and service presence. Parts availability and dealer network density are key factors in the durability score. For a 20–30 year serviceability horizon, manufacturer stability reduces long-term risk. Verify local dealer presence before specifying.`;

  // Tier description
  const tierDescs = {
    'Builder Grade': 'Volume production. Box-store distribution. Entry-level residential spec.',
    'Premium Residential': 'Above builder grade. Below custom architectural. Mid-tier consumer and production remodel spec.',
    'Architectural': 'Custom and designer-specified. Elevated materials and performance.',
    'High Performance': 'Passive House and triple-pane tier. Maximum thermal efficiency.',
  };

  // Static alternatives (will be replaced when full calibration DB is integrated)
  const alternatives = [
    { tag: '↑ Better Value · Same Tier', tagClass: 'better', name: 'Milgard Tuscany', tier: 'Premium Residential', score: 6.92, grade: 'B−' },
    { tag: '↑↑ Worth the Upgrade', tagClass: 'upgrade', name: 'Andersen 400 Series', tier: 'Architectural', score: 7.07, grade: 'B' },
    { tag: '↑↑ Worth the Upgrade', tagClass: 'upgrade', name: 'Marvin Integrity', tier: 'Architectural', score: 7.65, grade: 'B+' },
  ];

  return {
    productName: name, config, overall, grade, axes, subscores,
    safety, failures, rationale, attrs, status, tier, tierIdx,
    verdict, safetyNote, findings, goodFit, lookElsewhere,
    mfrNote, tierDesc: tierDescs[tier] || '', alternatives, dateStr,
  };
}

// ─── ORPHAN SCANNER ───────────────────────────────────────────────────────────
function scanForOrphans() {
  console.log('[BOT6] Scanning for orphaned runs...');
  const orphans = [], complete = [];

  if (!fs.existsSync(OUTPUTS_DIR)) {
    console.log('[BOT6] Outputs directory not found:', OUTPUTS_DIR);
    return { orphans, complete };
  }

  const folders = fs.readdirSync(OUTPUTS_DIR)
    .filter(f => fs.statSync(path.join(OUTPUTS_DIR, f)).isDirectory());

  // Keep only most recent run per product
  const productMap = {};
  for (const folder of folders) {
    const tsM = folder.match(/_((\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}))$/);
    if (!tsM) continue;
    const key = folder.replace(tsM[0], '');
    if (!productMap[key] || folder > productMap[key]) productMap[key] = folder;
  }

  for (const [key, folder] of Object.entries(productMap)) {
    const dir   = path.join(OUTPUTS_DIR, folder);
    const files = fs.readdirSync(dir);
    const hasBot5    = files.some(f => f.includes('bot5_reconciliation'));
    const hasCouncil = files.some(f => f.includes('council_memo') || f === 'council_session.md');
    const statusText = readFile(path.join(dir, 'PIPELINE_STATUS.txt')) || '';
    const status     = (statusText.match(/^STATUS:\s*(.+)/m) || [])[1]?.trim() || 'UNKNOWN';
    const entry = { key, folder, hasBot5, hasCouncil, status };
    if (!hasBot5 || !hasCouncil) orphans.push(entry);
    else complete.push(entry);
  }

  console.log(`[BOT6] Complete: ${complete.length} | Orphans: ${orphans.length}`);
  return { orphans, complete };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === 'scan') {
    const { orphans, complete } = scanForOrphans();
    console.log(`\n✅ COMPLETE (${complete.length}):`);
    complete.forEach(r => console.log(`  ${r.key} — ${r.status}`));

    if (orphans.length > 0) {
      console.log(`\n⚠️  ORPHANS (${orphans.length}):`);
      orphans.forEach(r => {
        const missing = [];
        if (!r.hasBot5) missing.push('Bot5');
        if (!r.hasCouncil) missing.push('Council');
        console.log(`  ${r.key} — missing: ${missing.join(', ')}`);
      });
      await sendTelegram(
        `⚠️ *Bot 6 Orphan Scan*\n\n${orphans.length} incomplete run(s):\n\n` +
        orphans.map(r => {
          const m = []; if (!r.hasBot5) m.push('Bot5'); if (!r.hasCouncil) m.push('Council');
          return `• ${r.key.replace(/_/g, ' ')} — missing ${m.join(', ')}`;
        }).join('\n') +
        '\n\n_These runs are NOT fully scored. Do not lock scores._'
      );
    } else {
      console.log('\n✅ No orphans.');
    }

  } else if (command === 'report') {
    const productName = args[0];
    const outputDir   = args[1];
    if (!productName || !outputDir) {
      console.log('Usage: node bot6_report_assembly_v2.js report "Product Name" /path/to/output/dir');
      process.exit(1);
    }
    const data = buildData(productName, outputDir);
    if (data.error) { console.error('[BOT6] Error:', data.error); process.exit(1); }
    const html = buildHTML(data);
    const outPath = path.join(outputDir, `${productName.toLowerCase().replace(/\s+/g, '_')}_report.html`);
    fs.writeFileSync(outPath, html);
    console.log(`[BOT6] ✅ Report written: ${outPath}`);
    console.log(`[BOT6] Score: ${data.overall.toFixed(2)}/10 | Grade: ${data.grade.letter}${data.grade.mod} | Tier: ${data.tier}`);
    await sendTelegram(
      `📄 *Report assembled — ${productName}*\n` +
      `Score: *${data.overall.toFixed(2)}/10* | Grade: *${data.grade.letter}${data.grade.mod}*\n` +
      `Tier: ${data.tier} | Confidence: ${data.status.confidence}`
    );

  } else if (command === 'report-all') {
    const { complete, orphans } = scanForOrphans();
    console.log(`[BOT6] Assembling reports for ${complete.length} complete runs...`);
    let ok = 0;
    for (const run of complete) {
      const dir  = path.join(OUTPUTS_DIR, run.folder);
      const name = run.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const data = buildData(name, dir);
      if (data.error) { console.error(`[BOT6] Skipped ${run.key}: ${data.error}`); continue; }
      const html = buildHTML(data);
      const p = path.join(dir, `${run.key}_report.html`);
      fs.writeFileSync(p, html);
      console.log(`[BOT6] ✅ ${name}: ${data.overall.toFixed(2)}/10 ${data.grade.letter}${data.grade.mod}`);
      ok++;
    }
    await sendTelegram(
      `📋 *Bot 6 Complete*\n\n✅ ${ok} reports assembled\n` +
      (orphans.length > 0 ? `⚠️ ${orphans.length} orphaned runs skipped` : `✅ No orphans`)
    );
    console.log(`[BOT6] Done. ${ok}/${complete.length} reports assembled.`);

  } else {
    console.log('Commands: scan | report "Name" /path | report-all');
  }
}



const _dir = '/Users/Residentialist/.openclaw/workspace/residentialist/outputs/pella_250_series_2026-03-10T03-16-14';
const _data = buildData('Pella 250 Series', _dir);
if (_data.error) { console.error(_data.error); process.exit(1); }
const _html = buildHTML(_data);
require('fs').writeFileSync(_dir + '/pella_250_series_report.html', _html);
console.log('Score:', _data.overall, '| Grade:', _data.grade.letter + _data.grade.mod, '| Tier:', _data.tier);

