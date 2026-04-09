#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const KNOW_DIR = path.join(ROOT, 'knowledge');
const TIMEOUT = 5000;
const CONCURRENCY = 15;

function headCheck(url) {
  return new Promise(resolve => {
    const proto = url.startsWith('https') ? https : http;
    try {
      const req = proto.request(url, {
        method: 'HEAD', timeout: TIMEOUT,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'Accept': 'text/html' },
      }, res => { res.resume(); resolve(res.statusCode); });
      req.on('error', () => resolve(-1));
      req.on('timeout', () => { req.destroy(); resolve(-2); });
      req.end();
    } catch { resolve(-1); }
  });
}

async function checkBatch(urls, concurrency) {
  const results = new Array(urls.length);
  let idx = 0;
  async function worker() {
    while (idx < urls.length) {
      const i = idx++;
      results[i] = await headCheck(urls[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, () => worker()));
  return results;
}

async function main() {
  const categories = fs.readdirSync(KNOW_DIR)
    .filter(d => fs.existsSync(path.join(KNOW_DIR, d, 'sources_registry.json')))
    .sort();

  console.log(`\nURL Health Check — ${categories.length} categories, concurrency=${CONCURRENCY}\n`);

  const rows = [];
  const all404s = {};

  for (const cat of categories) {
    const reg = JSON.parse(fs.readFileSync(path.join(KNOW_DIR, cat, 'sources_registry.json'), 'utf8'));
    const urls = reg.map(s => s.url).filter(u => u && u.startsWith('http'));
    process.stdout.write(`  ${cat} (${urls.length})...`);

    const codes = await checkBatch(urls, CONCURRENCY);

    let ok=0, r3=0, n404=0, other=0, tmo=0, err=0;
    const cat404s = [];
    const otherCodes = {};
    codes.forEach((c, i) => {
      if (c >= 200 && c < 300) ok++;
      else if (c >= 300 && c < 400) { r3++; ok++; }
      else if (c === 404) { n404++; cat404s.push(urls[i]); }
      else if (c === -2) tmo++;
      else if (c === -1) err++;
      else { other++; otherCodes[c] = (otherCodes[c]||0)+1; }
    });

    const health = urls.length > 0 ? Math.round((ok / urls.length) * 100) : 0;
    console.log(` ${ok}ok ${n404}×404 ${other}other ${tmo}tmo ${err}err → ${health}%`);
    rows.push({ cat, total: urls.length, ok, r3, n404, other, tmo, err, health, otherCodes });
    if (cat404s.length) all404s[cat] = cat404s;
  }

  console.log('\n' + '═'.repeat(92));
  console.log(
    'Category'.padEnd(22) + 'Total'.padStart(6) + ' 2xx'.padStart(6) + ' 3xx'.padStart(6) +
    ' 404'.padStart(6) + ' Othr'.padStart(6) + '  Tmo'.padStart(6) + '  Err'.padStart(6) + ' Health'.padStart(8)
  );
  console.log('─'.repeat(92));
  let gT=0,gO=0,gR=0,gN=0,gX=0,gTO=0,gE=0;
  for (const r of rows) {
    const oStr = Object.keys(r.otherCodes).length ? ' ('+Object.entries(r.otherCodes).map(([k,v])=>k+':'+v).join(',')+')' : '';
    console.log(
      r.cat.padEnd(22) + String(r.total).padStart(6) + String(r.ok-r.r3).padStart(6) +
      String(r.r3).padStart(6) + String(r.n404).padStart(6) + String(r.other).padStart(6) +
      String(r.tmo).padStart(6) + String(r.err).padStart(6) + (r.health+'%').padStart(8) + oStr
    );
    gT+=r.total; gO+=r.ok; gR+=r.r3; gN+=r.n404; gX+=r.other; gTO+=r.tmo; gE+=r.err;
  }
  console.log('─'.repeat(92));
  const gH = gT>0 ? Math.round((gO/gT)*100) : 0;
  console.log(
    'TOTAL'.padEnd(22) + String(gT).padStart(6) + String(gO-gR).padStart(6) +
    String(gR).padStart(6) + String(gN).padStart(6) + String(gX).padStart(6) +
    String(gTO).padStart(6) + String(gE).padStart(6) + (gH+'%').padStart(8)
  );
  console.log('═'.repeat(92));

  const cats404 = Object.keys(all404s);
  if (cats404.length) {
    console.log(`\n404 NOT FOUND — ${gN} dead URLs across ${cats404.length} categories:\n`);
    for (const cat of cats404) {
      console.log(`  ${cat} (${all404s[cat].length}):`);
      all404s[cat].forEach(u => console.log(`    ${u}`));
      console.log();
    }
  } else {
    console.log('\n  No 404s found.\n');
  }
  console.log('Done.\n');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
