import os
import sys,json,re,uuid;sys.path.insert(0,os.environ['BS_HOME']+'/rb')
import bundle
HERO_ID='hero';HREF='Super Hero SKU.dc.html'
NAV_OLD="{ id: 'onsite', label: 'Onsite Shopee', href: 'Onsite Shopee.dc.html' },"
NAV_NEW=NAV_OLD+" { id: 'hero', label: 'Top Super Hero SKU', href: '"+HREF+"' },"
NAVJS="[{ id: 'ovnew', label: 'Overview', href: 'Overview New.dc.html' }, { id: 'ovkpi', label: 'Overview KPI', href: 'Overview KPI.dc.html' }, { id: 'dailynew', label: 'Daily Tracking', href: 'Daily Tracking New.dc.html' }, "+NAV_NEW+" { id: 'tiktok', label: 'Onsite TikTok Shop', href: 'Onsite Tiktok Shop.dc.html' }, { id: 'ppnew', label: 'Product Performance', href: 'PP New.dc.html' }, { id: 'dataraw', label: 'Data Raw', href: 'Data Raw.dc.html' }]"
def run(path=os.environ['BS_HOME']+'/rb/out.html'):
    o=bundle.Outer(open(path,encoding='utf8').read())
    pages=o.pages()
    # 1) nav item in every page
    for pid,u in pages.items():
        d=bundle.Doc(o.get(u).decode('utf8'))
        n=d.tpl.count(NAV_OLD)
        if n!=1: raise SystemExit('nav anchor %s %d'%(pid,n))
        d.tpl=d.tpl.replace(NAV_OLD,NAV_NEW);o.set(u,d.dump().encode('utf8'))
    # 2) clone pp page into hero
    d=bundle.Doc(o.get(pages['pp']).decode('utf8'));t=d.tpl
    a=t.index('<script type="text/x-dc" data-dc-script');gt=t.index('>',a)+1;b=t.index('</script>',gt)
    s=t[gt:b];assert s.count('class Component extends DCLogic {')==1
    s=s.replace('class Component extends DCLogic {','class PPBase extends DCLogic {')
    data=json.load(open(os.environ['BS_HOME']+'/work/HERO.json'))
    hj=open(os.environ['BS_HOME']+'/rb/hero.js',encoding='utf8').read().replace('__HERO_MO__',str(max(data['months']))).replace('__HERO_DATA__',json.dumps(data,ensure_ascii=False).replace('</','<\\/')).replace('__NAV__',NAVJS)
    s=s.rstrip()+'\n\n'+hj+'\n'
    t=t[:gt]+s+t[b:]
    for old,new in [('active="ppnew"','active="hero"'),('kicker="Trang 05 · Nhóm hàng và SKU"','kicker="Kênh Shopee · 10 mã trọng điểm"'),('title="Product Performance"','title="Top Super Hero SKU"'),('data-screen-label="Product Performance"','data-screen-label="Top Super Hero SKU"'),('<div id="ppx"></div>','<div id="hrx"></div>')]:
        if t.count(old)!=1: raise SystemExit('hero anchor %r %d'%(old,t.count(old)))
        t=t.replace(old,new)
    t=re.sub(r'<title>[^<]*</title>','<title>Top Super Hero SKU</title>',t,count=1)
    d.tpl=t
    nu=str(uuid.uuid5(uuid.NAMESPACE_URL,'bluestone-hero-page'))
    o.man[nu]=dict(o.man[pages['pp']]);o.set(nu,d.dump().encode('utf8'))
    # 3) outer resources + router map
    m=bundle._blk(o.html,'ext_resources');er=json.loads(m.group(1))
    er=[x for x in er if x['id']!=HERO_ID]+[{'id':HERO_ID,'uuid':nu}]
    o.html=o.html[:m.start(1)]+json.dumps(er)+o.html[m.end(1):]
    k="'Onsite Shopee.dc.html': 'shopee',"
    assert o.tpl.count(k)==1
    o.tpl=o.tpl.replace(k,k+" '"+HREF+"': 'hero',")
    open(path,'w',encoding='utf8').write(o.dump());print('hero page added',nu)
if __name__=='__main__':run()
