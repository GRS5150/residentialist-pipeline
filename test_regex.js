
const fs = require('fs');
const path = require('path');
const WORKSPACE = '/Users/Residentialist/.openclaw/workspace/residentialist';
const gradeScale = s => s>=9.0?'A+':s>=8.5?'A':s>=8.0?'A-':s>=7.5?'B+':s>=7.0?'B':s>=6.5?'B-':s>=6.0?'C+':s>=5.5?'C':s>=5.0?'C-':s>=4.5?'D+':s>=4.0?'D':'F';

const outputDir = path.join(WORKSPACE, 'outputs');
const dirs = fs.readdirSync(outputDir)
  .filter(f => fs.statSync(path.join(outputDir, f)).isDirectory())
  .sort().reverse();

let found = null;
for (const dir of dirs) {
  if (!dir.includes('andersen_100')) continue;
  const dirPath = path.join(outputDir, dir);
  const statusFile = path.join(dirPath, 'PIPELINE_STATUS.txt');
  if (!fs.existsSync(statusFile)) { console.log('NO STATUS:', dir); continue; }
  const status = fs.readFileSync(statusFile, 'utf8');
  const productM = status.match(/PRODUCT:\s*(.+)/);
  if (!productM) { console.log('NO PRODUCT:', dir); continue; }
  
  let overall = null, Q = null, D = null, P = null;
  const councilFile = path.join(dirPath, 'council_session.md');
  if (fs.existsSync(councilFile)) {
    const council = fs.readFileSync(councilFile, 'utf8');
    const oM = council.match(/\*\*(?:Proposed |Final |Confirmed )?Overall[:\s*]+([0-9]+\.[0-9]+)/i) ||
               council.match(/Overall[:\s]+([0-9]+\.[0-9]+)/i);
    console.log('council match:', dir, oM && oM[0]);
    if (oM) overall = parseFloat(oM[1]);
  }
  console.log('RESULT:', dir, overall, Q, D, P);
  found = { dir, overall };
  break;
}
console.log('DONE:', found);
