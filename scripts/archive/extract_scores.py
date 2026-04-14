import sys, json
f = sys.argv[1]
with open(f) as fh:
    d = json.load(fh)
s = d["scores"]
print("Quality:", s["quality"]["axis_score"])
print("Durability:", s["durability"]["axis_score"])
print("Performance:", s["performance"]["axis_score"])
print("Overall:", d["overall_score"])
print("Grade:", d["grade"])
print("Outlook:", d.get("outlook","N/A"))
tr = d.get("transparency_report", {})
print("")
print("Data Completeness:", tr.get("data_completeness","N/A"))
for e in tr.get("performance_evidence", []):
    metric = e.get("metric","?")
    level = e.get("evidence_level","?")
    score = e.get("score_given","?")
    print("  %s: %s -> %s" % (metric, level, score))
    pn = e.get("professional_note")
    if pn:
        print("    Note:", str(pn)[:150])
print("")
print("Performance subscores:")
for k,v in s["performance"].items():
    if isinstance(v, dict) and "score" in v:
        r = str(v.get("reasoning",""))[:120]
        print("  %s: %s - %s" % (k, v["score"], r))
