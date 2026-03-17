import sys

path = sys.argv[1]
with open(path, "r") as f:
    content = f.read()

# Step 1: Add getQuarantineStats helper function after readJsonFile
helper_fn = '''
function getQuarantineStats(product) {
  const slug = product.slug || product.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const evidenceDir = path.join(WORKSPACE, 'evidence');
  const evData = readJsonFile(evidenceDir, new RegExp(slug + '.*\\\\.json$'));
  if (!evData) return { count: 0, reasons: {} };
  const sources = (evData.professional_consensus && evData.professional_consensus.sources) || [];
  const quarantined = sources.filter(s => s.quarantined && !s.restored);
  const reasons = {};
  quarantined.forEach(s => {
    const r = s.quarantine_reason || 'unknown';
    reasons[r] = (reasons[r] || 0) + 1;
  });
  return { count: quarantined.length, reasons };
}
'''

if 'getQuarantineStats' not in content:
    # Insert after readJsonFile function
    lines = content.split('\n')
    insert_idx = None
    for i, line in enumerate(lines):
        if 'function readJsonFile' in line:
            brace_count = 0
            for j in range(i, len(lines)):
                brace_count += lines[j].count('{') - lines[j].count('}')
                if brace_count == 0 and j > i:
                    insert_idx = j + 1
                    break
            break
    if insert_idx:
        lines.insert(insert_idx, helper_fn)
        content = '\n'.join(lines)
        print(f"Inserted helper at line {insert_idx + 1}")
    else:
        print("ERROR: Could not find readJsonFile")
        sys.exit(1)
else:
    print("Helper already exists")

# Step 2: Add qStats computation before the response building
marker = '    const runDir = findLatestRunDir(product.product_name);\n    const detScoresRaw = readJsonFile(runDir'
if 'const qStats = getQuarantineStats' not in content and marker in content:
    content = content.replace(
        marker,
        '    const qStats = getQuarantineStats(product);\n    const runDir = findLatestRunDir(product.product_name);\n    const detScoresRaw = readJsonFile(runDir'
    )
    print("Added qStats computation")
elif 'const qStats' in content:
    print("qStats already present")
else:
    print("WARNING: Could not find marker for qStats insertion")

# Step 3: Replace the detScoresRaw-based quarantine fields with qStats
old_q = '              quarantined_count: detScoresRaw.quarantined_count || 0,\n              quarantine_reasons: detScoresRaw.quarantine_reasons || {},'
new_q = '              quarantined_count: qStats.count,\n              quarantine_reasons: qStats.reasons,'

if old_q in content:
    content = content.replace(old_q, new_q)
    print("Replaced quarantine fields with qStats")
elif new_q in content:
    print("Already using qStats fields")
else:
    print("WARNING: Could not find quarantine fields to replace")

with open(path, 'w') as f:
    f.write(content)
print("DONE")
