import re

path = "/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/dashboard_server.js"
with open(path, "r") as f:
    content = f.read()

# Replace the two lines we just added (detScoresRaw.quarantined_count)
# with logic that reads from the evidence file instead
old_lines = "              quarantined_count: detScoresRaw.quarantined_count || 0,\n              quarantine_reasons: detScoresRaw.quarantine_reasons || {},"

# New: compute from evidence data (which is already loaded as the source for the quarantine API)
new_lines = "              quarantined_count: (() => { const ev = readJsonFile(path.join(WORKSPACE, \"evidence\"), new RegExp(product.slug + \".*\\\\.json$\")); if (!ev) return 0; const srcs = (ev.professional_consensus && ev.professional_consensus.sources) || []; return srcs.filter(s => s.quarantined && !s.restored).length; })(),\n              quarantine_reasons: (() => { const ev = readJsonFile(path.join(WORKSPACE, \"evidence\"), new RegExp(product.slug + \".*\\\\.json$\")); if (!ev) return {}; const srcs = (ev.professional_consensus && ev.professional_consensus.sources) || []; const r = {}; srcs.forEach(s => { if (s.quarantined && !s.restored) { const k = s.quarantine_reason || \"unknown\"; r[k] = (r[k] || 0) + 1; } }); return r; })(),"

if old_lines in content:
    content = content.replace(old_lines, new_lines, 1)
    with open(path, "w") as f:
        f.write(content)
    print("PATCHED OK")
else:
    print("OLD LINES NOT FOUND")
    # Show what we have around the target area
    lines = content.split("\n")
    for i, line in enumerate(lines):
        if "quarantined_count" in line:
            print(f"  Found at line {i+1}: {line.strip()[:100]}")
