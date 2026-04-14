import sys, json

files = sys.argv[1:]
for f in files:
    with open(f) as fh:
        d = json.load(fh)
    s = d["scores"]
    print("=" * 60)
    print("FILE:", f.split("/")[-2])
    print("Overall: %s  Grade: %s  Outlook: %s" % (d["overall_score"], d["grade"], d.get("outlook","?")))
    print()
    
    for axis in ["quality", "durability", "performance"]:
        print("%s (axis: %s):" % (axis.upper(), s[axis]["axis_score"]))
        for k, v in s[axis].items():
            if isinstance(v, dict) and "score" in v:
                r = str(v.get("reasoning", ""))[:200]
                print("  %s: %s" % (k, v["score"]))
                print("    %s" % r)
        print()
    
    tr = d.get("transparency_report", {})
    if tr:
        print("TRANSPARENCY: %s" % tr.get("data_completeness", "N/A"))
        for e in tr.get("performance_evidence", []):
            print("  %s: %s -> %s" % (e.get("metric","?"), e.get("evidence_level","?"), e.get("score_given","?")))
    
    ndf = d.get("non_disclosure_flags", [])
    if ndf:
        print("NON-DISCLOSURE FLAGS:")
        for f2 in ndf:
            print("  %s: %s -> %s" % (f2.get("subscore","?"), f2.get("metric","?"), f2.get("score_given","?")))
    print()
