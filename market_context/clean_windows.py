import json, re
from collections import defaultdict

ALIAS = {
    'pella':'Pella',
    'andersen':'Andersen','anderson':'Andersen','anderson windows and doors':'Andersen',
    'renewal by andersen':'Andersen (Renewal)','renewal by anderson':'Andersen (Renewal)',
    'marvin':'Marvin',
    'pgt':'PGT','pgt florida':'PGT','pgt winguards':'PGT','pgt wingaurd':'PGT','pgt wingaurd':'PGT',
    'fleetwood':'Fleetwood',
    'sierra pacific':'Sierra Pacific',
    'milgard':'Milgard','millard':'Milgard','millgard':'Milgard',
    'kolbe':'Kolbe','kolby':'Kolbe',
    'lincoln':'Lincoln','lincoln windows':'Lincoln',
    'jeld-wen':'Jeld-Wen','jeld wen':'Jeld-Wen','jeldwen':'Jeld-Wen','jeldwin':'Jeld-Wen',
    'loewen':'Loewen',
    'western':'Western Windows','western windows':'Western Windows','western window systems':'Western Windows',
    'weather shield':'Weather Shield','weathershield':'Weather Shield','weather-shield':'Weather Shield',
    'windsor':'Windsor','windsor pinnacle':'Windsor',
    'simonton':'Simonton',
    'ply gem':'Ply Gem',
    'velux':'Velux',
    'quaker':'Quaker','quaker edge':'Quaker',
    'ram':'RAM',
    'quantum':'Quantum',
    'anlin':'Anlin',
    'provia':'ProVia',
    'four seasons':'Four Seasons Sunrooms',
    'alpen':'Alpen',
    'drutex':'Drutex','oknoplast':'Oknoplast','schuco':'Schuco','rehau':'Rehau',
    'zola':'Zola','gayko':'Gayko','weru':'Weru','tischler und sohn':"Tischler und Sohn",
    'crittall':'Crittall',
    "hope's windows":"Hope's Windows",'hope glass':"Hope's Windows",
    'cgi':'CGI','impact':'CGI (Impact)','hurricane impact':'CGI (Impact)',
    'iwc':'IWC',
    'nanawall':'NanaWall','nano wall':'NanaWall','nanawalls':'NanaWall','nana wall':'NanaWall','nana':'NanaWall','nano-wall':'NanaWall',
    'la cantina':'La Cantina','lacantina':'La Cantina',
}

# Not window manufacturers at all -- window treatments, screens, film, automation, junk.
EXCLUDE = {
    'hunter douglas','hunter douglass','hunter-douglas','lutron','phantom','phantom screens',
    'motorized phantom','storm smart','storm smart screens','silhouette','plantation',
    'norman','carolina shutters','graber','shade store','the shade store','levolor',
    'luminette','polar shades','somfy','crestron','llumar','3m','solarian','solar industries',
    'solatube','enviroblind','sunburst','noseum','kevlar','techno glass','brown','quality',
    'quartz','lifetime','smart','ez','es','mi','cws','eze-breeze','ez breeze','eze breeze',
    'shade co.',
}

def norm(name):
    key = name.strip().lower()
    if key in EXCLUDE: return None
    return ALIAS.get(key, name.strip())

def price_num(p):
    if not p: return None
    m = re.sub(r'[^\d]', '', str(p))
    return int(m) if m else None

def band(p):
    if p < 1_000_000: return 'under_1m'
    if p < 2_000_000: return '1_2m'
    if p < 3_500_000: return '2_3.5m'
    if p < 5_000_000: return '3.5_5m'
    return '5m_plus'

with open('/home/claude/spec-crawler.json') as f:
    data = json.load(f)

by_brand = defaultdict(lambda: defaultdict(int))
excluded_count = 0
merged_count = 0
raw_total = 0
for s in data['specs']:
    if (s.get('productCategory') or '').strip().lower() != 'windows': continue
    b = (s.get('brand') or '').strip()
    if not b or b.lower() == 'not specified': continue
    raw_total += 1
    clean = norm(b)
    if clean is None:
        excluded_count += 1
        continue
    p = price_num(s.get('homePrice'))
    bd = band(p) if p and p > 100_000 else None
    by_brand[clean]['total'] += 1
    if bd: by_brand[clean][bd] += 1

print(f"Raw named sightings: {raw_total}")
print(f"Excluded (not a window brand): {excluded_count}")
print(f"Distinct clean brands: {len(by_brand)}\n")
rows = sorted(by_brand.items(), key=lambda x: -x[1]['total'])
print(f"{'Brand':<24}{'Total':>7}")
for b, d in rows[:20]:
    print(f"{b:<24}{d['total']:>7}")

out = {'generated':'2026-09-04','category':'Windows','source_specs':raw_total,
       'excluded_non_window':excluded_count,'brands':{b:dict(d) for b,d in by_brand.items()}}
with open('/home/claude/residentialist-pipeline/market_context/windows-cleaned.json','w') as f:
    json.dump(out, f, indent=1)
