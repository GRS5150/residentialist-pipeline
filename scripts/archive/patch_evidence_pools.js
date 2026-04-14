/**
 * Phase 7b: Patch existing evidence files to reclassify 'unknown' pool sources.
 * 
 * The source_parser.js now has expanded domain lists (POOL_B, POOL_C, EXCLUDED).
 * This script applies those same rules to existing evidence files so they don't
 * need a full re-run of the source parser.
 *
 * Usage: node patch_evidence_pools.js [evidence_file_path]
 * If no path, patches all evidence files in ./evidence/
 *
 * Run on Mac Mini: node patch_evidence_pools.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Import the classification tables from source_parser
// (We duplicate them here for safety — this script should work standalone)

const POOL_A_DOMAINS = [
  'greenbuildingadvisor.com',
  'finehomebuilding.com',
  'jlconline.com',
  'buildingscience.com',
];

const POOL_B_DOMAINS = [
  'youtube.com', 'youtu.be',
  'passivehouse.com', 'phius.org',
  'windowpurchase.com',
  'dwmmag.com',
  'brennancorp.com',
  // Phase 7b additions — trade publications
  'usglassmag.com',
  'architectmagazine.com',
  'buildshownetwork.com',
  'inspectapedia.com',
  'woodworkingnetwork.com',
  'facilityexecutive.com',
];

const POOL_C_DOMAINS = [
  'houzz.com', 'trustpilot.com', 'thewindowdog.com', 'todayshomeowner.com',
  'thisoldhouse.com', 'replacementwindowreviews.co', 'replacementwindowdiscussions.com',
  'consumeraffairs.com', 'yelp.com', 'bbb.org', 'home.google.com', 'homedepot.com', 'lowes.com',
  // Phase 7 first pass
  'replacement-windows.com', 'vinyl-replacement-windows.com', '1stwindows.com',
  'cougarwindows.com', 'discountwd.com', 'vistaza.com', 'swisco.com',
  'azwindowreplacement.com', 'constructionwindows.com', 'lakewashingtonwindows.com',
  'newmanwindows.com', 'uswindow-door.com',
  // Phase 7b second pass
  'windowrama.com', 'windowhardwaredirect.com', 'thewindowanddoorshoppe.com',
  'justanswer.com', 'replacementwindowsprices.com', 'ralphsway.com',
  'proreplacementwindows.com', 'complaintsboard.com', 'pissedconsumer.com',
  'diychatroom.com', 'opalexteriors.com', 'themenwithtools.com',
  'windowpartscenter.com', 'windowparts.com', 'qualitysmith.com',
  'sidingwizard.com', 'bogleheads.org', 'unifiedhomeremodeling.com',
  'ringsend.com', 'windowsolutionsplus.com', 'hometownewindows.com',
  'familyhomeimprovements.net', 'harrisexteriors.com', 'avenueswindow.com',
  'lamoriaconstruction.com', 'mnwindows.com', 'morningstardoorsandwindows.com',
  'northeastarchitectural.com', 'toulmincabinetry.com', 'rbamilwaukee.com',
  'rbacentralpa.com', 'westernproducts.com', 'consumerreports.org', 'amazon.com',
  // Phase 7b third pass
  'arcat.com', 'simplexhomes.com', 'constructioncoverage.com', 'fairvu.com',
  'shepleywood.com', 'builddirect.com', 'mpglobalproducts.com', 'manualzz.com',
  'mychemicalfreehouse.net', 'jjonesdesignco.com', 'parlorcityfurniture.com',
  'identifyparts.xyz', 'replacementwindowsreviews.co',
];

const CERTIFICATION_DOMAINS = [
  'nfrc.org', 'energystar.gov', 'aama.net', 'declare.living-future.org',
  'database.passivehouse.com', 'recalls.cpsc.gov', 'cpsc.gov', 'greenguard.org', 'ul.com',
];

const EXCLUDED_DOMAINS = [
  // Manufacturer sites
  'milgard.com', 'andersenwindows.com', 'pella.com', 'jeld-wen.com', 'marvin.com',
  'sierrapacificwindows.com', 'simonton.com', 'alpenwindows.com', 'proviaproducts.com', 'plygem.com',
  // Legal / lawsuit sites
  'consumerclassactionlawyers.com', 'fearnotlaw.com', 'law360.com', 'classaction.org',
  // Regulatory / safety databases
  'oehha.ca.gov', 'p65warnings.ca.gov', 'clearinghouse.net',
  // False positives (original)
  'amerisleep.com', 'phifer.com', 'bradleycorp.com', 'aeroflexusa.com',
  'trivantage.com', 'zoominfo.com', 'multiquip.com', 'arcedior.com', 'nytimes.com',
  // Phase 7b — manufacturer subsidiaries & CDNs
  'renewalbyandersen.com', 'renewalbyandersenreplacement.com',
  'andersen.my.site.com', 'cmd-jeld-wen.s3.us-east-2.amazonaws.com',
  'edge.sitecorecloud.io', 'images.thdstatic.com',
  // Industry suppliers (not independent reviewers)
  'cardinalcorp.com', 'quanex.com', 'rochesterinsulatedglass.com',
  'sierraglassfabrication.com', 'energycodeace.com', 'glassforum.org',
  // Legal / news / press
  'prnewswire.com', 'globenewswire.com', 'casetext.com', 'twincities.com',
  'bizjournals.com', 'pennlive.com', 'hbsdealer.com', 'appeal-democrat.com',
  'redding.com', 'lawgud.com',
  // False positives (Phase 7b)
  'naturepedic.com', 'reesehitches.com', 'sierra.com', 'sierrapacificfcu.org',
  'sierrapacificsupply.com', 'cancer.org', 'en.wikipedia.org', 'naag.org',
  'recalls-rappels.canada.ca', 'teachers.sheboygan.k12.wi.us',
  'learnasyougrowccc.com', 'pmc.ncbi.nlm.nih.gov', 'business.pacificgrove.org',
];

function extractDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch { return ''; }
}

function matchesDomainList(domain, list) {
  return list.some(d => domain === d || domain.endsWith('.' + d));
}

function reclassifyPool(url) {
  const domain = extractDomain(url);
  if (!domain) return null; // Can't classify
  
  if (matchesDomainList(domain, CERTIFICATION_DOMAINS)) return 'certification';
  if (matchesDomainList(domain, EXCLUDED_DOMAINS)) return 'excluded';
  if (matchesDomainList(domain, POOL_A_DOMAINS)) return 'A';
  if (matchesDomainList(domain, POOL_B_DOMAINS)) return 'B';
  if (matchesDomainList(domain, POOL_C_DOMAINS)) return 'C';
  
  return null; // Still unknown
}

function patchFile(filePath) {
  console.log(`\nPatching: ${filePath}`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  const sources = data.professional_consensus?.sources;
  if (!sources || sources.length === 0) {
    console.log('  No PC sources found — skipping');
    return;
  }
  
  const unknowns = sources.filter(s => s.pool === 'unknown');
  console.log(`  Total sources: ${sources.length}, Unknown: ${unknowns.length}`);
  
  if (unknowns.length === 0) {
    console.log('  No unknowns to reclassify — skipping');
    return;
  }
  
  let reclassified = 0;
  let stillUnknown = 0;
  const changes = { A: 0, B: 0, C: 0, certification: 0, excluded: 0 };
  
  for (const src of unknowns) {
    const newPool = reclassifyPool(src.url);
    if (newPool) {
      src._previous_pool = src.pool;
      src.pool = newPool;
      changes[newPool] = (changes[newPool] || 0) + 1;
      reclassified++;
    } else {
      stillUnknown++;
    }
  }
  
  console.log(`  Reclassified: ${reclassified}`);
  console.log(`  Still unknown: ${stillUnknown}`);
  console.log(`  Changes: ${JSON.stringify(changes)}`);
  
  if (stillUnknown > 0) {
    const remaining = sources.filter(s => s.pool === 'unknown');
    console.log(`  Remaining unknowns:`);
    for (const s of remaining) {
      const domain = extractDomain(s.url);
      console.log(`    ${domain} — ${s.name?.substring(0, 60)}`);
    }
  }
  
  // Write back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  Written: ${filePath}`);
  
  // Show new pool distribution
  const poolDist = {};
  for (const s of sources) {
    poolDist[s.pool] = (poolDist[s.pool] || 0) + 1;
  }
  console.log(`  New distribution: ${JSON.stringify(poolDist)}`);
}

// Main
const args = process.argv.slice(2);
if (args.length > 0) {
  // Patch specific file(s)
  for (const f of args) {
    patchFile(f);
  }
} else {
  // Patch all evidence files
  const evidenceDir = path.join(__dirname, 'evidence');
  if (!fs.existsSync(evidenceDir)) {
    console.log('No evidence/ directory found');
    process.exit(1);
  }
  const files = fs.readdirSync(evidenceDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} evidence file(s)`);
  for (const f of files) {
    patchFile(path.join(evidenceDir, f));
  }
}

console.log('\nDone.');
