path = "/Users/Residentialist/.openclaw/workspace/residentialist/dashboard/dashboard_server.js"
with open(path, "r") as f:
    lines = f.readlines()

# Target: line 466 (0-indexed: 465) has the score line for professional_consensus
# Insert quarantined_count and quarantine_reasons after it
target_idx = 465  # 0-indexed line 466

if "detScoresRaw.professional_consensus" in lines[target_idx] and "score:" in lines[target_idx]:
    # Check not already patched
    if "quarantined_count" in lines[target_idx + 1]:
        print("ALREADY PATCHED")
    else:
        new_lines = [
            "              quarantined_count: detScoresRaw.quarantined_count || 0,\n",
            "              quarantine_reasons: detScoresRaw.quarantine_reasons || {},\n"
        ]
        lines = lines[:target_idx + 1] + new_lines + lines[target_idx + 1:]
        with open(path, "w") as f:
            f.writelines(lines)
        print("PATCHED OK")
else:
    print("LINE 466 MISMATCH: " + repr(lines[target_idx][:80]))
