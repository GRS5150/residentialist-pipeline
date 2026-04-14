import sys, json, os
def gs(data, key):
    return data.get(key, {}).get("score", "N/A")
dirs = sys.argv[1:]
for d in dirs:
    f = os.path.join(d, "DETERMINISTIC_SCORES.json")
    if not os.path.exists(f):
        print("=== %s === NO DETERMINISTIC_SCORES.json" % os.path.basename(d))
        continue
    data = json.load(open(f))
    print("=== %s ===" % os.path.basename(d))
    print("  CQ: %s  MQ: %s  PC: %s  MD: %s  RP: %s" % (
        gs(data, "component_quality"),
        gs(data, "manufacturing_quality"),
        gs(data, "professional_consensus"),
        gs(data, "materials_durability"),
        gs(data, "repairability"),
    ))
    mq = data.get("manufacturing_quality", {})
    print("  MQ: base=%s cert=%s deductions=%s" % (mq.get("base"), mq.get("cert_bonus"), mq.get("complaint_deductions")))
    pc = data.get("professional_consensus", {})
    print("  PC: sources=%s ratio=%s confidence=%s" % (pc.get("sources_processed"), pc.get("consensus_ratio"), pc.get("confidence_multiplier")))
    cq = data.get("component_quality", {})
    print("  CQ: det=%s tier=%s(%s)" % (cq.get("deterministic_score","N/A"), cq.get("quality_tier","N/A"), cq.get("judgment_score","N/A")))
