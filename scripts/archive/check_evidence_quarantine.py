import json
path = "/Users/Residentialist/.openclaw/workspace/residentialist/evidence/marvin_signature_ultimate_dh.json"
d = json.load(open(path))
pc = d.get("professional_consensus", {})
sources = pc.get("sources", [])
quarantined = [s for s in sources if s.get("quarantined") and not s.get("restored")]
reasons = {}
for s in quarantined:
    r = s.get("quarantine_reason", "unknown")
    reasons[r] = reasons.get(r, 0) + 1
print("total sources:", len(sources))
print("quarantined:", len(quarantined))
print("reasons:", reasons)
