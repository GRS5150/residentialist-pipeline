import json, os

base = "/Users/Residentialist/.openclaw/workspace/residentialist/outputs"
runs = {
    "Marvin Sig Ultimate": "marvin_signature_ultimate_2026-03-14T06-45-34",
    "Andersen 400": "andersen_400_series_2026-03-16T03-14-31",
    "Pella Impervia": "pella_impervia_2026-03-14T16-54-52"
}

for name, run_dir in runs.items():
    fpath = os.path.join(base, run_dir, "DETERMINISTIC_SCORES.json")
    print(f"\n=== {name} ===")
    try:
        d = json.load(open(fpath))
        for k, v in d.items():
            if k == "meta":
                continue
            if isinstance(v, dict):
                print(f"  {k}: {v.get('score', 'N/A')}")
            else:
                print(f"  {k}: {v}")
    except Exception as e:
        print(f"  Error: {e}")
