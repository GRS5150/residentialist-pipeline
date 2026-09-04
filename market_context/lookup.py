#!/usr/bin/env python3
"""Price-band lookup for a brand/category. Usage: lookup.py BRAND [CATEGORY]"""
import json, sys, os
BANDS = [('under_1m','Under $1M'),('1_2m','$1-2M'),('2_3.5m','$2-3.5M'),('3.5_5m','$3.5-5M'),('5m_plus','$5M+')]
idx = json.load(open(os.path.join(os.path.dirname(__file__),'market-context-index.json')))
brand = sys.argv[1].lower(); cat = sys.argv[2].lower() if len(sys.argv)>2 else None
hits = {k:v for k,v in idx['brands'].items() if k.split('|')[0].lower()==brand and (cat is None or k.split('|')[1].lower()==cat)}
if not hits: print(f"No data for {sys.argv[1]}"); sys.exit(0)
for k,v in hits.items():
    b,c = k.split('|'); bands=v['bands']; priced=sum(bands.get(x,0) for x,_ in BANDS)
    print(f"\n{b} ({c}) — {priced} priced sightings, {v['bands'].get('total',0)} total")
    if priced < 15: print("  INSUFFICIENT MARKET DATA (min 15) — do not quote a band profile"); continue
    for key,label in BANDS:
        n=bands.get(key,0); pct=100*n/priced
        print(f"  {label:<10}{n:>5}  {pct:5.1f}%  {'#'*int(pct/2)}")
    top_states=sorted(v['states'].items(), key=lambda x:-x[1])[:4]
    print("  Top states:", ", ".join(f"{s} ({n})" for s,n in top_states))
