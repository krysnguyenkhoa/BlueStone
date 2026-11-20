"""Dữ liệu cho tab Weekly Tracking: số theo ngày × kênh + KPI ngày theo nhóm KPI + lịch ngày sale."""
import os, json, re, sys

HOME = os.environ.get('BS_HOME', '/home/claude')
ETL = os.path.join(HOME, 'etl') if os.path.isdir(os.path.join(HOME, 'etl', 'out')) else '/home/claude/etl'
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HOME, 'work', 'WEEKLY.json')

core = json.load(open(os.path.join(ETL, 'core.json')))
kpi = json.load(open(os.path.join(ETL, 'kpi.json')))
bs = open(os.path.join(ETL, 'out', 'BSDATA.js'), encoding='utf8').read()
B = json.loads(bs[bs.index('=') + 1:].strip().rstrip(';'))

dates = core['dates']
nch = len(B['channels'])
# hàng: [ngày, kênh, spend, nmv, gmv, đơn đặt, đơn không hủy, có spend]
day = {}
for r in core['rows']:
    i, ch, sp, nmv, gmv, ld, od = r[:7]
    a = day.setdefault(i, [[0, 0, 0, 0, 0] for _ in range(nch)])
    a[ch] = [nmv, gmv, ld, od, sp]

KMAP = {'Shopee': 'shopee', 'Tiktok Shop': 'tts', 'Harasocial': 'websocial', 'Website': 'websocial', 'Lazada': 'lazada'}
kdays, ktype, cir = {}, {}, {}
for m, v in kpi['DT']['byMonth'].items():
    cir[int(m)] = {g: (t or {}).get('cir') for g, t in v['monthTargets'].items()}
    for d in v['days']:
        kdays[d['date']] = {g: round(t.get('nmv') or 0) for g, t in d['tgt'].items() if g in ('total', 'shopee', 'tts', 'websocial', 'lazada')}
        if d.get('type') and d['type'] != 'BAU':
            ktype[d['date']] = d['type']

out = {
    'last': B['lastIso'],
    'dates': dates,
    'channels': [{'key': c['key'], 'name': c['name'], 'fill': c['fill'], 'spendable': c['spendable'], 'spendLast': c.get('spendLast'), 'kpi': KMAP.get(c['key'])} for c in B['channels']],
    'd': [day.get(i, [[0, 0, 0, 0, 0] for _ in range(nch)]) for i in range(len(dates))],
    'kpi': kdays,
    'type': {d: t for d, t in ktype.items() if d <= B['lastIso']} | {d: t for d, t in ktype.items() if d > B['lastIso']},
    'cir': cir,
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(out, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
print('weekly data', len(dates), 'ngày ·', nch, 'kênh ·', os.path.getsize(OUT) // 1024, 'KB')
