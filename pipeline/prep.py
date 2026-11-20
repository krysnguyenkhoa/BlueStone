"""Chuẩn bị dữ liệu cho pipeline từ thư mục Drive đã đồng bộ (BS_DATA).

Ghi ra:
  work/orders26.json       đơn hàng 2026 (file Order_data mới nhất)
  etl/shopee_topup_new.json  top-up Shopee Onsite từ file sổ ví tiếng Việt ("Thứ tự")
  work/tt_new/             file Cost_Tiktok chồng lấn kỳ (bản tổng hợp, ghi đè theo ngày × campaign)
  work/psku/2026-MM.xlsx   file parentskudetail theo tháng + work/psku/meta.json
  work/imgs/<SKU>.png      ảnh sản phẩm mới (chưa có trong bản gốc)
  work/cfg.json            các mốc ngày dùng cho ETL và nhãn giao diện
"""
import os, re, json, glob, shutil, subprocess, statistics, collections, unicodedata, datetime, calendar, warnings
warnings.filterwarnings('ignore')
import openpyxl

HOME = os.environ['BS_HOME']
DATA = os.environ['BS_DATA']
WORK = os.path.join(HOME, 'work')
YEAR = 2026


def rng(name):
    """'01012026.18112026.xlsx' -> ('2026-01-01', '2026-11-18'); None nếu không đúng mẫu."""
    m = re.match(r'^(\d{2})\.?(\d{2})(\d{4})\.(\d{2})(\d{2})(\d{4})', os.path.basename(name))
    if not m:
        return None
    return f'{m[3]}-{m[2]}-{m[1]}', f'{m[6]}-{m[5]}-{m[4]}'


def xlsx(d):
    return sorted(f for f in glob.glob(os.path.join(DATA, d, '*')) if f.lower().endswith('.xlsx'))


def reset(p):
    shutil.rmtree(p, ignore_errors=True)
    os.makedirs(p, exist_ok=True)


os.makedirs(WORK, exist_ok=True)
cfg = {}

# ---- 1. Order_data ---------------------------------------------------------------------------------
od = [f for f in xlsx('Order_data') if rng(f) and rng(f)[0].startswith(str(YEAR))]
if not od:
    raise SystemExit('Không tìm thấy file Order_data năm %d' % YEAR)
od.sort(key=lambda f: (rng(f)[1], rng(f)[0]))
src = od[-1]
subprocess.run(['node', os.path.join(HOME, 'etl', 'orders.js'), src, os.path.join(WORK, 'orders26.json')], check=True)
rows = json.load(open(os.path.join(WORK, 'orders26.json')))
cnt = collections.Counter()
for x in rows[1:]:
    d = str(x[0] or '')
    if re.match(r'^\d\d/\d\d/\d{4}$', d):
        cnt[f'{d[6:]}-{d[3:5]}-{d[0:2]}'] += 1
days = sorted(cnt)
ref = statistics.median([cnt[d] for d in days[-29:-1]] or [1])
last = days[-1]
# bỏ ngày cuối nếu mới xuất một phần (ít hơn 25% số dòng trung vị 4 tuần gần nhất)
while len(days) > 1 and cnt[last] < 0.25 * ref:
    days.pop()
    last = days[-1]
cfg.update(orderFile=os.path.basename(src), last=last, lastM=int(last[5:7]), lastD=int(last[8:10]))
print('Order_data', os.path.basename(src), 'LAST', last)

# ---- 2. Shopee Onsite top-up (sổ ví tiếng Việt) ---------------------------------------------------------
def iso_vn(v):
    # Excel có thể đọc ngày ≤ 12 thành datetime bị đảo tháng/ngày
    if isinstance(v, datetime.datetime):
        return f'{v.year}-{v.day:02d}-{v.month:02d}'
    dd, mm, yy = str(v).split('/')
    return f'{yy}-{mm}-{dd}'

top = collections.defaultdict(lambda: {'m': 0.0, 'a': 0.0})
A = B = None
for f in xlsx('Cost/Cost_Shopee/Onsite'):
    r = rng(f)
    try:
        ws = openpyxl.load_workbook(f, read_only=True, data_only=True).worksheets[0]
        rr = list(ws.iter_rows(values_only=True))
    except Exception as e:
        print('skip', f, e)
        continue
    hi = [i for i, x in enumerate(rr) if x and x[0] == 'Thứ tự']
    if not hi or not r:
        continue
    A = min(A or r[0], r[0]); B = max(B or r[1], r[1])
    for x in rr[hi[0] + 1:]:
        if not x[1] or x[3] is None:
            continue
        try:
            d = iso_vn(x[1]); a = float(x[3])
        except Exception:
            continue
        if d < r[0] or d > r[1] or a <= 0:
            continue
        ds = unicodedata.normalize('NFC', str(x[2]))
        if ds.startswith('Tiền Dịch vụ Hiển thị đã nạp'):
            top[d]['m'] += a
        elif ds.startswith('Nạp tiền tự'):
            top[d]['a'] += a
json.dump({k: v for k, v in sorted(top.items())}, open(os.path.join(HOME, 'etl', 'shopee_topup_new.json'), 'w'))
cfg.update(shA=A or '', shB=B or '')
print('Shopee top-up', len(top), 'ngày', A, B)

# ---- 3. TikTok cost: file chồng lấn kỳ = bản tổng hợp, đưa vào tt_new ------------------------------------
tt = [f for f in xlsx('Cost/Cost_Tiktok') if rng(f)]
tt.sort(key=lambda f: (rng(f)[1], rng(f)[0]))
reset(os.path.join(WORK, 'tt_new'))
cover = None
for f in tt:
    a, b = rng(f)
    span = (datetime.date.fromisoformat(b) - datetime.date.fromisoformat(a)).days
    if span > 31 or (cover and a < cover):
        shutil.copy(f, os.path.join(WORK, 'tt_new', os.path.basename(f)))
    cover = max(cover or b, b)
print('TikTok tổng hợp', sorted(os.listdir(os.path.join(WORK, 'tt_new'))))

# ---- 4. Onsite Shopee: tháng chi tiết = file Total_Shopee_T lớn nhất ------------------------------------
ts = [int(m[1]) for f in xlsx('Onsite_Shopee') for m in [re.search(r'Total_Shopee_T(\d+)\.xlsx$', f)] if m]
cfg['shM'] = max(ts)
# Onsite TikTok: tháng cuối có dữ liệu
tk = [rng(f)[1] for f in xlsx('Onsite_Tiktok Shop') if rng(f)]
cfg['ttM'] = int(max(tk)[5:7]) if tk else cfg['lastM']

# ---- 5. SKU Shopee Performance (parentskudetail) -------------------------------------------------------
reset(os.path.join(WORK, 'psku'))
meta = {}
for f in xlsx('SKU Shopee Performance'):
    m = re.search(r'parentskudetail\.(\d{8})_(\d{8})', os.path.basename(f))
    if not m or not m[1].startswith(str(YEAR)):
        continue
    mo, d1 = int(m[1][4:6]), int(m[2][6:8])
    shutil.copy(f, os.path.join(WORK, 'psku', f'{YEAR}-{mo:02d}.xlsx'))
    meta[mo] = d1 if d1 < calendar.monthrange(YEAR, mo)[1] else calendar.monthrange(YEAR, mo)[1]
json.dump(meta, open(os.path.join(WORK, 'psku', 'meta.json'), 'w'))
cfg['pskuMonths'] = meta
print('parentskudetail', meta)

# ---- 6. Ảnh sản phẩm mới ---------------------------------------------------------------------------------
reset(os.path.join(WORK, 'imgs'))
ik_path = os.path.join(HOME, 'etl', 'imgkeys.json')
ik = json.load(open(ik_path))
base_keys = set(json.load(open(os.path.join(HOME, 'assets', 'imgkeys_base.json'))))
codes = {str(x[3]) for x in rows[1:] if x[3] and str(x[3]).startswith('BLU')}
for f in glob.glob(os.path.join(WORK, 'psku', '*.xlsx')):
    try:
        ws = openpyxl.load_workbook(f, read_only=True, data_only=True).worksheets[0]
        it = ws.iter_rows(values_only=True); h = next(it)
        if 'SKU sản phẩm' in h:
            i = h.index('SKU sản phẩm'); codes |= {str(x[i]) for x in it if x[i] and str(x[i]).startswith('BLU')}
    except Exception as e:
        print('skip', f, e)
codes = sorted(codes)
added = []
try:
    from PIL import Image
    for f in sorted(glob.glob(os.path.join(DATA, 'Product_images', '*'))):
        stem, ext = os.path.splitext(os.path.basename(f))
        if ext.lower() not in ('.png', '.jpg', '.jpeg', '.webp'):
            continue
        s = stem.strip().upper()
        if s.startswith('BLU'):
            code = s
        else:
            hit = [c for c in codes if re.search(r'\D' + re.escape(s) + r'$', c)] if re.fullmatch(r'\d{3,5}', s) else []
            if len(hit) != 1:
                continue
            code = hit[0]
        key = 'thumbs/' + code + '.png'
        if key in base_keys:
            continue
        im = Image.open(f).convert('RGBA')
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
        mask = Image.eval(Image.alpha_composite(bg, im).convert('L'), lambda p: 255 if p < 245 else 0)
        bb = mask.getbbox() or (0, 0) + im.size
        c = im.crop(bb); n = max(c.size)
        sq = Image.new('RGBA', (n, n), (255, 255, 255, 0)); sq.paste(c, ((n - c.size[0]) // 2, (n - c.size[1]) // 2))
        sq.resize((96, 96), Image.LANCZOS).save(os.path.join(WORK, 'imgs', code + '.png'), optimize=True)
        for p in ('pp', 'shopee'):
            if key not in ik[p]:
                ik[p].append(key)
        added.append(code)
except ImportError:
    print('Không có Pillow, bỏ qua ảnh')
json.dump(ik, open(ik_path, 'w'))
print('ảnh mới', added)

cfg['built'] = datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
json.dump(cfg, open(os.path.join(WORK, 'cfg.json'), 'w'), ensure_ascii=False, indent=1)
# xuất biến môi trường cho các bước sau
with open(os.path.join(WORK, 'env.sh'), 'w') as fh:
    fh.write(f"export BS_ORDERFILE={cfg['orderFile']}\nexport BS_LAST={cfg['last']}\nexport BS_LASTM={cfg['lastM']}\nexport BS_SHM={cfg['shM']}\nexport BS_TTM={cfg['ttM']}\nexport BS_SHA={cfg['shA']}\nexport BS_SHB={cfg['shB']}\nexport TT_NEW={os.path.join(WORK, 'tt_new')}\n")
print(json.dumps(cfg, ensure_ascii=False))
