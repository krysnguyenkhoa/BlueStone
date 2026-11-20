import sys,json,re,uuid,os,glob;sys.path.insert(0,os.environ['BS_HOME']+'/rb')
import bundle
SRC=os.environ['BS_HOME']+'/work/imgs'
def run(path=os.environ['BS_HOME']+'/rb/out.html'):
    files=sorted(glob.glob(SRC+'/*.png'))
    o=bundle.Outer(open(path,encoding='utf8').read())
    for pid,u in o.pages().items():
        d=bundle.Doc(o.get(u).decode('utf8'))
        m=re.search(r'window.__imgMap=(\{.*?\})',d.tpl)
        if not m: continue
        mp=json.loads(m.group(1));mb=bundle._blk(d.html,'ext_resources');er=json.loads(mb.group(1))
        n=0
        for f in files:
            key='thumbs/'+os.path.basename(f)
            nu=str(uuid.uuid5(uuid.NAMESPACE_URL,'bs-img-'+key))
            rid=mp.get(key) or 'imx'+nu[:8]
            mp[key]=rid
            d.man[nu]={'mime':'image/png','compressed':False};d.set(nu,open(f,'rb').read())
            er=[x for x in er if x['id']!=rid]+[{'id':rid,'uuid':nu}];n+=1
        d.tpl=d.tpl[:m.start(1)]+json.dumps(mp)+d.tpl[m.end(1):]
        d.html=d.html[:mb.start(1)]+json.dumps(er)+d.html[mb.end(1):]
        o.set(u,d.dump().encode('utf8'));print('imgs',pid,n)
    open(path,'w',encoding='utf8').write(o.dump())
if __name__=='__main__':run()
