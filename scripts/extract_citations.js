#!/usr/bin/env node
/**
 * extract_citations.js — Citation extraction pass for sonar-deep-research outputs
 *
 * sonar-deep-research synthesizes from training data and often returns 0 citation URLs.
 * This script takes that output, extracts key claims, sends them to sonar-pro (which
 * always searches the live web and returns citations), and appends those citations to
 * the source registry.
 *
 * Usage:
 *   node scripts/extract_citations.js <category> <markdown_file>
 *   node scripts/extract_citations.js cabinets knowledge/cabinets/cabinets_testing_framework.md
 *
 *   Batch mode — process all 0-citation files in a category:
 *   node scripts/extract_citations.js <category> --batch
 *
 *   Batch mode — all categories:
 *   node scripts/extract_citations.js --all
 */

'use strict';

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const { appendToRegistry } = require('./source_registry');

const ROOT     = path.resolve(__dirname, '..');
const KNOW_DIR = path.join(ROOT, 'knowledge');
const API_KEY  = process.env.PERPLEXITY_API_KEY;
const MODEL    = 'sonar-pro';
const TIMEOUT  = 120000; // 2 min

// ── Claim extraction ─────────────────────────────────────────────────────────

function extractClaims(markdown, maxClaims = 20) {
  const claims = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip headings, empty lines, metadata lines
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('*Sources:') ||
        trimmed.startsWith('*Model:') || trimmed.startsWith('*Query') ||
        trimmed.startsWith('---') || trimmed.startsWith('|') ||
        trimmed.length < 40) continue;

    // Strip markdown formatting
    let clean = trimmed
      .replace(/^\s*[-*+]\s*/, '')   // list bullets
      .replace(/^\d+\.\s*/, '')       // numbered lists
      .replace(/\*\*/g, '')           // bold
      .replace(/\*/g, '')             // italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .trim();

    // Only keep substantive claims (contain factual assertions)
    if (clean.length >= 50 && clean.length <= 300 &&
        !clean.startsWith('Note:') && !clean.startsWith('Source:') &&
        !clean.startsWith('Citation') && !clean.startsWith('http')) {
      claims.push(clean);
    }

    if (claims.length >= maxClaims) break;
  }

  return claims;
}

// ── Category disambiguation ─────────────────────────────────────────────────
// Some category names are ambiguous in search context. Map them to specific terms.
const CATEGORY_DISAMBIGUATION = {
  'windows': 'residential architectural windows (not Microsoft Windows or software)',
};

function disambiguate(category) {
  return CATEGORY_DISAMBIGUATION[category] || category;
}

// ── Determine context from filename ─────────────────────────────────────────

function contextFromFilename(filename, category) {
  const base = path.basename(filename, '.md');
  const cat = disambiguate(category);
  if (base.includes('deep_dive_')) {
    const product = base.replace('deep_dive_', '').replace(/_/g, ' ');
    return { type: 'product', label: `${product} (${cat})`, productSlug: base.replace('deep_dive_', '') };
  }
  if (base.includes('testing_framework')) return { type: 'category', label: `${cat} testing and standards` };
  if (base.includes('component_analysis')) return { type: 'category', label: `${cat} components and construction` };
  if (base.includes('hierarchy_top')) return { type: 'category', label: `top-tier ${cat} brands` };
  if (base.includes('hierarchy_bottom')) return { type: 'category', label: `mid and budget ${cat} brands` };
  if (base.includes('eval_knowledge')) return { type: 'category', label: `${cat} evaluation criteria` };
  if (base.includes('material_safety')) return { type: 'category', label: `${cat} material safety` };
  return { type: 'category', label: cat };
}

// ── Perplexity API ──────────────────────────────────────────────────────────

function callPerplexity(query) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: query }],
    });

    const req = https.request({
      hostname: 'api.perplexity.ai',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Perplexity ${res.statusCode}: ${data.substring(0, 300)}`));
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.message?.content || '';
          const citations = parsed.citations || [];
          resolve({ content, citations });
        } catch (e) {
          reject(new Error(`Parse: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(TIMEOUT, () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(payload);
    req.end();
  });
}

const MAX_RETRIES = 2;
const RETRY_DELAYS = [10000, 20000];

async function callWithRetry(query) {
  for (let i = 0; i <= MAX_RETRIES; i++) {
    try {
      return await callPerplexity(query);
    } catch (err) {
      const retryable = /ECONNRESET|ETIMEDOUT|ECONNREFUSED|socket hang up|Timeout/i.test(err.message);
      if (!retryable || i === MAX_RETRIES) throw err;
      console.log(`    ⚠️  ${err.message} — retry ${i + 1}/${MAX_RETRIES}`);
      await new Promise(r => setTimeout(r, RETRY_DELAYS[i]));
    }
  }
}

// ── Process one file ────────────────────────────────────────────────────────

async function processFile(filePath, category) {
  const filename = path.basename(filePath);
  const markdown = fs.readFileSync(filePath, 'utf8');
  const ctx = contextFromFilename(filename, category);
  const claims = extractClaims(markdown);

  if (claims.length < 3) {
    console.log(`    ⏭  ${filename}: only ${claims.length} claims — skipping`);
    return 0;
  }

  const claimBlock = claims.map((c, i) => `${i + 1}. ${c}`).join('\n');

  const prompt = `Find the original published sources for the following claims about ${ctx.label}. For each claim, return the specific article or page URL — not author pages, homepages, or category indexes. Only return URLs you can verify exist.

Claims:
${claimBlock}

Return specific, linkable sources — trade publications, testing organizations, professional reviews, government agencies, industry associations, or technical references. Prioritize institutional and expert sources over consumer blogs.`;

  process.stdout.write(`    ${filename} (${claims.length} claims)... `);

  const result = await callWithRetry(prompt);
  const citCount = result.citations.length;

  if (citCount === 0) {
    console.log(`0 citations returned`);
    return 0;
  }

  const capturedFrom = 'citation_extraction';
  const productSlug = ctx.productSlug || null;
  const added = appendToRegistry(category, result.citations, capturedFrom, productSlug);

  console.log(`${citCount} citations, ${added} new → registry`);
  return added;
}

// ── Batch: find files with 0 citations ──────────────────────────────────────

function findZeroCitationFiles(category) {
  const catDir = path.join(KNOW_DIR, category);
  if (!fs.existsSync(catDir)) return [];

  const mdFiles = fs.readdirSync(catDir).filter(f => f.endsWith('.md') && !f.startsWith('investigator'));
  const files = [];

  for (const f of mdFiles) {
    const fpath = path.join(catDir, f);
    const content = fs.readFileSync(fpath, 'utf8');

    // Check if file has a ## Citations block with URLs
    const citMatch = content.match(/## Citations\n([\s\S]+)$/);
    if (citMatch) {
      const citUrls = citMatch[1].match(/https?:\/\/[^\s)>\]",]+/g) || [];
      if (citUrls.length > 0) continue; // Has citations — skip
    }

    files.push(fpath);
  }

  return files;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!API_KEY) {
    console.error('Set PERPLEXITY_API_KEY');
    process.exit(1);
  }

  const args = process.argv.slice(2);

  // --all mode: batch every category
  if (args[0] === '--all') {
    const categories = fs.readdirSync(KNOW_DIR)
      .filter(d => fs.statSync(path.join(KNOW_DIR, d)).isDirectory() && d !== 'system')
      .sort();

    console.log(`\n╔══════════════════════════════════════════════════╗`);
    console.log(`║  CITATION EXTRACTION — ALL CATEGORIES            ║`);
    console.log(`║  Categories: ${String(categories.length).padEnd(35)}║`);
    console.log(`╚══════════════════════════════════════════════════╝\n`);

    const results = [];
    for (const cat of categories) {
      const regPath = path.join(KNOW_DIR, cat, 'sources_registry.json');
      let before = 0;
      if (fs.existsSync(regPath)) {
        try { before = JSON.parse(fs.readFileSync(regPath, 'utf8')).length; } catch {}
      }

      const files = findZeroCitationFiles(cat);
      if (files.length === 0) {
        console.log(`  ${cat}: no 0-citation files — skipping`);
        results.push({ cat, before, after: before, added: 0, files: 0 });
        continue;
      }

      console.log(`  ${cat}: ${files.length} files need citation extraction`);
      let totalAdded = 0;
      for (const f of files) {
        try {
          totalAdded += await processFile(f, cat);
        } catch (err) {
          console.log(`    ❌ ${path.basename(f)}: ${err.message}`);
        }
        await new Promise(r => setTimeout(r, 3000)); // rate limit
      }

      let after = before;
      if (fs.existsSync(regPath)) {
        try { after = JSON.parse(fs.readFileSync(regPath, 'utf8')).length; } catch {}
      }
      results.push({ cat, before, after, added: after - before, files: files.length });
      console.log(`  → ${cat}: ${before} → ${after} (+${after - before})\n`);
    }

    // Summary table
    console.log('═'.repeat(80));
    console.log('Category'.padEnd(22) + 'Before'.padStart(8) + 'After'.padStart(8) + 'Added'.padStart(8) + 'Files'.padStart(8));
    console.log('─'.repeat(80));
    let tB=0, tA=0, tD=0, tF=0;
    for (const r of results) {
      console.log(r.cat.padEnd(22) + String(r.before).padStart(8) + String(r.after).padStart(8) +
        String(r.added).padStart(8) + String(r.files).padStart(8));
      tB += r.before; tA += r.after; tD += r.added; tF += r.files;
    }
    console.log('─'.repeat(80));
    console.log('TOTAL'.padEnd(22) + String(tB).padStart(8) + String(tA).padStart(8) +
      String(tD).padStart(8) + String(tF).padStart(8));
    console.log('═'.repeat(80));
    return;
  }

  const category = args[0];
  if (!category) {
    console.error('Usage: node extract_citations.js <category> <file|--batch|--all>');
    process.exit(1);
  }

  // --batch mode: all 0-citation files in one category
  if (args[1] === '--batch') {
    const files = findZeroCitationFiles(category);
    console.log(`\n  ${category}: ${files.length} files with 0 citations\n`);
    let totalAdded = 0;
    for (const f of files) {
      try {
        totalAdded += await processFile(f, category);
      } catch (err) {
        console.log(`    ❌ ${path.basename(f)}: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 3000));
    }
    console.log(`\n  Total new sources: ${totalAdded}`);
    return;
  }

  // Single file mode
  const filePath = path.resolve(args[1]);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const added = await processFile(filePath, category);
  console.log(`\nDone. ${added} new sources appended to registry.`);
}

main().catch(err => { console.error('FATAL:', err); process.exit(1); });
