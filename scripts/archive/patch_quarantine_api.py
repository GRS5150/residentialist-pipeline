import sys

path = "/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/dashboard_server.js"
with open(path, "r") as f:
    lines = f.readlines()

# Find the professional_consensus block near line 464
# We need to add quarantined_count and quarantine_reasons after the score line
patched = False
for i, line in enumerate(lines):
    if "professional_consensus: {" in line and not patched:
        # Check if the next few lines match our target block
        if i+2 < len(lines) and "detScoresRaw.professional_consensus" in lines[i+1] and "score:" in lines[i+1]:
            # Check if quarantined_count is already there
            if i+3 < len(lines) and "quarantined_count" in lines[i+2]:
                print("ALREADY PATCHED")
                sys.exit(0)
            # Insert two new lines after the score line
            indent = "              "
            new_lines = [
                indent + "quarantined_count: detScoresRaw.quarantined_count || 0,\n",
                indent + "quarantine_reasons: detScoresRaw.quarantine_reasons || {},\n"
            ]
            lines = lines[:i+2] + new_lines + lines[i+2:]
            patched = True

if patched:
    with open(path, "w") as f:
        f.writelines(lines)
    print("PATCHED OK")
else:
    print("TARGET NOT FOUND")
