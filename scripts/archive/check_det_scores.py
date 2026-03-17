import json
path = "/Users/Residentialist/.openclaw/workspace/residentialist/outputs/marvin_signature_ultimate_2026-03-16T18-58-08/DETERMINISTIC_SCORES.json"
d = json.load(open(path))
print("quarantined_count:", d.get("quarantined_count"))
print("quarantine_reasons:", d.get("quarantine_reasons"))
print("top-level keys:", list(d.keys())[:20])
