import os
import sys;sys.path.insert(0,os.environ['BS_HOME']+'/rb')
import rebuild,glob,importlib,subprocess
subprocess.run(['node',os.environ['BS_HOME']+'/etl/fix_img.js'],cwd=os.environ['BS_HOME']+'/etl')
subprocess.run(['node',os.environ['BS_HOME']+'/etl/cat.js'],cwd=os.environ['BS_HOME']+'/etl',stdout=subprocess.DEVNULL)
P=[];POST={};_chain={}
for f in sorted(glob.glob(os.environ['BS_HOME']+'/rb/patches_*.py')):
    ns={};exec(open(f).read(),ns);P+=ns['P']
    for k,v in ns.get('POST',{}).items():_chain.setdefault(k,[]).append(v)
def _mk(fs):
    def g(t):
        for f in fs:t=f(t)
        return t
    return g
POST={k:_mk(v) for k,v in _chain.items()}
rebuild.build(patches=P,post=POST,onsite=os.environ['BS_HOME']+'/etl/out/ONSITE.js',tiktok=os.environ['BS_HOME']+'/etl/out/TIKTOK.js',out=os.environ['BS_HOME']+'/rb/out.html')
print('built',len(P))
import add_imgs;add_imgs.run(os.environ['BS_HOME']+'/rb/out.html')
import add_hero;add_hero.run(os.environ['BS_HOME']+'/rb/out.html')
