import sys,os,json;sys.path.insert(0,os.environ['BS_HOME']+'/rb')
from bundle import *
SRC=os.environ['BS_HOME']+'/assets/base.html'
ET=os.environ['BS_HOME']+'/etl/out/'
def rd(p):return open(p,'rb').read()
def build(patches=None,onsite=None,tiktok=None,out=os.environ['BS_HOME']+'/rb/out.html',post=None):
    t=open(SRC,encoding='utf8').read();o=Outer(t);pg=o.pages()
    rep={'window.BSDATA':rd(ET+'BSDATA.js'),'window.BSTARGETS':rd(ET+'KPI.js'),'window.BSDAILYTRACK':rd(ET+'DAILYTRACK.js'),'window.BSSKUNEW':rd(ET+'SKUNEW.js')}
    if onsite:rep['window.BSONSITE']=rd(onsite)
    if tiktok:rep['window.BSTIKTOK']=rd(tiktok)
    log=[]
    for pid,u in pg.items():
        d=Doc(o.get(u).decode('utf8'))
        for k,data in rep.items():
            for au in d.find(k):d.set(au,data);log.append((pid,k,au[:8]))
        for (pp,old,new,cnt) in (patches or []):
            if pp!=pid:continue
            n=d.tpl.count(old)
            if n!=cnt:raise SystemExit('patch mismatch %s %r found %d expected %d'%(pid,old[:60],n,cnt))
            d.tpl=d.tpl.replace(old,new)
        if post and pid in post:d.tpl=post[pid](d.tpl)
        NR=open(os.environ['BS_HOME']+'/rb/navrail_new.js',encoding='utf8').read().rstrip('\n')
        for au,ae in list(d.man.items()):
            if not ae['mime'].endswith('javascript'):continue
            b=d.get(au)
            if b'function NavRail({' not in b:continue
            s=b.decode('utf8');i=s.index('function NavRail({');j=s.index('Object.assign(__ds_scope, { NavRail });',i)
            d.set(au,(s[:i]+NR+'\n'+s[j:]).encode('utf8'));log.append((pid,'NavRail',au[:8]))
        o.set(u,d.dump().encode('utf8'))
    open(out,'w',encoding='utf8').write(o.dump());return log
if __name__=='__main__':
    print(build())
