import re,json,gzip,base64
def _blk(t,kind):
    m=re.search(r'<script type="__bundler/%s">(.*?)</script>'%kind,t,re.S);return m
def _enc(b):return base64.b64encode(gzip.compress(b,mtime=0)).decode()
def _dec(s):return gzip.decompress(base64.b64decode(s))
class Doc:
    def __init__(self,html):
        self.html=html
        self.man=json.loads(_blk(html,'manifest').group(1))
        self.tpl=json.loads(_blk(html,'template').group(1))
    def get(self,uuid):
        e=self.man[uuid];raw=base64.b64decode(e['data']);return gzip.decompress(raw) if e.get('compressed') else raw
    def set(self,uuid,data):
        e=self.man[uuid];
        if e.get('compressed'):e['data']=_enc(data)
        else:e['data']=base64.b64encode(data).decode()
    def find(self,needle):
        res=[]
        for u,e in self.man.items():
            if e['mime'].endswith('javascript'):
                if needle.encode() in self.get(u)[:400]:res.append(u)
        return res
    def dump(self):
        h=self.html
        def rep(kind,payload):
            nonlocal h
            m=_blk(h,kind);o=m.group(1);lead=o[:len(o)-len(o.lstrip())];trail=o[len(o.rstrip()):];h=h[:m.start(1)]+lead+payload+trail+h[m.end(1):]
        rep('manifest',json.dumps(self.man,ensure_ascii=False,separators=(',',':')).replace('</','<\\u002F'))
        rep('template',json.dumps(self.tpl,ensure_ascii=False).replace('</','<\\u002F'))
        return h
class Outer(Doc):
    def pages(self):
        return {p['id']:p['uuid'] for p in json.loads(_blk(self.html,'ext_resources').group(1))}
