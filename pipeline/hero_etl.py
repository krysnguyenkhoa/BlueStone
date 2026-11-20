import os
import openpyxl,json,re,collections,warnings
warnings.filterwarnings('ignore')
T=['BLUNCHAFB5851','BLUSHDSMB7327','BLUNCHAFB5895','BLUBEBICB6949','BLUSTOBLB6036','BLUBEBICB6845','BLUNDTRCB5996','BLUNDTRCB5958','BLUTDAHSB1768','BLUHNCGSB4018']
SN={'BLUNCHAFB5851':'Nồi chiên không dầu AFB-5851','BLUSHDSMB7327':'Máy làm sữa hạt SMB-7327','BLUNCHAFB5895':'Nồi chiên hơi nước AFB-5895','BLUBEBICB6949':'Bếp từ đôi ICB-6949','BLUSTOBLB6036':'Máy làm sữa hạt BLB-6036','BLUBEBICB6845':'Bếp âm từ đa vùng ICB-6845','BLUNDTRCB5996':'Nồi cơm cao tần RCB-5996','BLUNDTRCB5958':'Nồi cơm điện tử RCB-5958','BLUTDAHSB1768':'Máy tạo kiểu tóc HSB-1768','BLUHNCGSB4018':'Bàn ủi hơi nước cầm tay GSB-4018'}
import glob,os,calendar
MO={}
for f in sorted(glob.glob(os.environ['BS_HOME']+'/work/psku/2026-*.xlsx')):
    m=int(os.path.basename(f)[5:7]);MO[m]=(os.path.basename(f),int(json.load(open(os.environ['BS_HOME']+'/work/psku/meta.json')).get(str(m),calendar.monthrange(2026,m)[1])))
MO=dict(sorted(MO.items()))
F={'gP':'Doanh số (Đơn đã đặt) (VND)','gC':'Doanh số (Đơn đã xác nhận) (VND)','views':'Lượt xem sản phẩm','clicks':'Lượt nhấp vào sản phẩm','ordP':'Đơn hàng đã đặt','ordC':'Đơn đã xác nhận','unitP':'Sản phẩm (Đơn đã đặt)','unitC':'Sản phẩm (Đơn đã xác nhận)','buyP':'Người mua đã đặt hàng','buyC':'Người mua có đơn đã xác nhận','visits':'Lượt truy cập sản phẩm','pv':'Lượt xem trang sản phẩm','bounce':'Số lượng khách thoát trang sản phẩm','search':'Lượt click từ Trang tìm kiếm','likes':'Lượt thích','atcV':'Lượt truy cập sản phẩm (Thêm vào giỏ hàng)','atcU':'Sản phẩm (Thêm vào giỏ hàng)','rep':'Tỷ lệ mua lại (Đơn đã đặt)','repC':'Tỷ lệ đặt hàng lặp lại (Đơn hàng đã được xác nhận)'}
def num(v):
    if v is None: return 0.0
    if isinstance(v,(int,float)): return float(v)
    s=str(v).strip()
    if s in ('-',''): return 0.0
    pc=s.endswith('%'); s=s.replace('%','').replace('.','').replace(',','.')
    try: x=float(s)
    except: return 0.0
    return x/100 if pc else x
def kind(name):
    n=name.upper()
    if '[LIVE]' in n: return 'Listing LIVE'
    if 'MỞ QUÁN' in n: return 'Combo "Mở quán tại gia"'
    if 'TẶNG' in n: return 'Listing quà tặng'
    if '[NEW]' in n: return 'Listing [NEW]'
    return 'Listing chính'
out={'skus':T,'short':SN,'months':sorted(MO),'days':{m:MO[m][1] for m in MO},'lastIso':os.environ.get('BS_LAST',''),'pm':max(MO) if MO[max(MO)][1]<calendar.monthrange(2026,max(MO))[1] else None,'pd':MO[max(MO)][1],'exportDate':__import__('datetime').date.today().strftime('%d/%m'),'shop':{},'rows':{},'flags':{},'nmv':{}}
for m,(f,dd) in MO.items():
    wb=openpyxl.load_workbook(os.environ['BS_HOME']+'/work/psku/'+f,read_only=True,data_only=True)
    rows=list(wb.worksheets[0].iter_rows(values_only=True));h=rows[0];I={k:h.index(v) for k,v in F.items()}
    iS=h.index('SKU sản phẩm')
    sh={k:0.0 for k in F if k not in ('rep','repC')}; sh['n']=0
    for r in rows[1:]:
        if r[3] not in ('-',None): continue
        sh['n']+=1
        for k in sh:
            if k!='n': sh[k]+=num(r[I[k]])
        s=r[iS]
        if s in T:
            o={k:num(r[I[k]]) for k in F}; o['id']=str(r[0]); o['name']=str(r[1]); o['kind']=kind(str(r[1])); o['status']=str(r[2])
            out['rows'].setdefault(s,{}).setdefault(m,[]).append(o)
    out['shop'][m]=sh
    if m==max(MO):
        ids={}
        for s,v in out['rows'].items():
            for o in v.get(11,[]): ids[o['id']]=s
        for sn in wb.sheetnames[1:]:
            ws=wb[sn];rr=list(ws.iter_rows(values_only=True))
            if not rr: continue
            hh=rr[0]
            for r in rr[1:]:
                pid=str(r[0]); s=ids.get(pid)
                if not s: continue
                fl={'sheet':sn.replace('...','…'),'id':pid}
                if 'Giá đang bán' in hh: fl['price']=num(r[hh.index('Giá đang bán')])
                if 'Ngày tạo' in hh: fl['created']=str(r[hh.index('Ngày tạo')])
                out['flags'].setdefault(s,[]).append(fl)
# Order_data NMV Shopee per SKU per month (đơn không hủy)
od=json.load(open(os.environ['BS_HOME']+'/work/orders26.json'))
for x in od[1:]:
    if x[5]!='Shopee' or x[3] not in T: continue
    d=x[0];m=int(d[3:5]);y=d[6:]
    if y!='2026' or m not in MO: continue
    o=out['nmv'].setdefault(x[3],{}).setdefault(m,{'nmv':0,'ord':0,'gmv':0})
    o['gmv']+=x[10] or 0
    if x[7]=='Không hủy': o['nmv']+=x[10] or 0; o['ord']+=1
json.dump(out,open(os.environ['BS_HOME']+'/work/HERO.json','w'),ensure_ascii=False)
for s in T:
    print(s, {m:(len(out['rows'].get(s,{}).get(m,[])), round(sum(o['gP'] for o in out['rows'].get(s,{}).get(m,[]))/1e6,1), round(out['nmv'].get(s,{}).get(m,{}).get('nmv',0)/1e6,1)) for m in MO}, out['flags'].get(s))
print({m:(out['shop'][m]['n'],round(out['shop'][m]['gP']/1e6)) for m in MO})
# ---- ngày sale theo tháng (Shopee toàn shop, Order_data, NMV ≥ 3× trung vị ngày) + NMV ngày sale theo SKU
import statistics
day=collections.defaultdict(float)
for x in od[1:]:
    if x[5]!='Shopee' or x[7]!='Không hủy': continue
    d=x[0]
    if d[6:]!='2026': continue
    day[d[6:]+'-'+d[3:5]+'-'+d[0:2]]+=x[10] or 0
sale={}
for m,(f,dd) in MO.items():
    vals=[day.get('2026-%02d-%02d'%(m,i),0) for i in range(1,dd+1)]
    md=statistics.median(vals)
    sale[m]=['2026-%02d-%02d'%(m,i+1) for i,v in enumerate(vals) if md>0 and v>=3*md]
out['saleDays']=sale
for x in od[1:]:
    if x[5]!='Shopee' or x[3] not in T or x[7]!='Không hủy': continue
    d=x[0];m=int(d[3:5])
    if d[6:]!='2026' or m not in MO: continue
    if (d[6:]+'-'+d[3:5]+'-'+d[0:2]) in sale[m]:
        o=out['nmv'].setdefault(x[3],{}).setdefault(m,{'nmv':0,'ord':0,'gmv':0}); o['sale']=o.get('sale',0)+(x[10] or 0)
json.dump(out,open(os.environ['BS_HOME']+'/work/HERO.json','w'),ensure_ascii=False)
print('sale days',sale)
for s in T: print(s,{m:round(((out['nmv'].get(s,{}).get(m) or {}).get('sale',0))/max(1,(out['nmv'].get(s,{}).get(m) or {}).get('nmv',0)),2) for m in MO})
