// Quick script to check remaining unknown pool sources across evidence files
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'evidence');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let totalUnk = 0;
const allDomains = {};

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f)));
  const srcs = data.professional_consensus?.sources || [];
  const unk = srcs.filter(s => s.pool === 'unknown');
  console.log(`${f}: ${unk.length} unknowns / ${srcs.length} total`);
  totalUnk += unk.length;
  if (unk.length > 0) {
    const domains = {};
    for (const s of unk) {
      try {
        const u = new URL(s.url);
        let dom = u.hostname.replace(/^www\./, '');
        domains[dom] = (domains[dom] || 0) + 1;
        allDomains[dom] = (allDomains[dom] || 0) + 1;
      } catch {}
    }
    Object.entries(domains).sort((a, b) => b[1] - a[1]).forEach(([d, c]) => console.log(`  ${d} (${c})`));
  }
}

console.log(`\nTOTAL UNKNOWNS: ${totalUnk}`);
console.log('\n=== ALL UNKNOWN DOMAINS (sorted by frequency) ===');
Object.entries(allDomains).sort((a, b) => b[1] - a[1]).forEach(([d, c]) => console.log(`  ${d} (${c})`));
