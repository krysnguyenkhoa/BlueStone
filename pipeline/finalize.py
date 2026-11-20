"""Gắn bộ tự kiểm tra bản mới vào dashboard và xuất ra docs/ cho GitHub Pages."""
import os, json, hashlib

HOME = os.environ['BS_HOME']
DOCS = os.path.join(HOME, '..', 'docs')
os.makedirs(DOCS, exist_ok=True)
cfg = json.load(open(os.path.join(HOME, 'work', 'cfg.json'), encoding='utf8'))
html = open(os.path.join(HOME, 'rb', 'out.html'), encoding='utf8').read()
ver = hashlib.sha1(html.encode('utf8')).hexdigest()[:12]
last = cfg['last'][8:10] + '/' + cfg['last'][5:7] + '/' + cfg['last'][:4]

# Mỗi 5 phút hỏi version.json; nếu có bản dựng mới thì hiện thanh báo và tự tải lại sau 60 giây.
probe = r'''<script>(function(){var V=%s,BUILT=%s,LAST=%s,T=5*60*1000;
function bar(nv){if(document.getElementById('bs-upd'))return;var b=document.createElement('div');b.id='bs-upd';b.setAttribute('role','status');
b.style.cssText='position:fixed;left:50%%;bottom:18px;transform:translateX(-50%%);z-index:2147483647;display:flex;gap:12px;align-items:center;padding:10px 16px;border-radius:14px;background:#141F63;color:#fff;font:600 14px/1.3 system-ui,sans-serif;box-shadow:0 10px 30px rgba(20,31,99,.35)';
var n=60;b.innerHTML='<span>Đã có dữ liệu mới'+(nv.last?' (đến '+nv.last+')':'')+'. Tự tải lại sau <b id="bs-cd">60</b> giây.</span>';
var r=document.createElement('button');r.textContent='Tải lại ngay';r.style.cssText='border:0;border-radius:10px;padding:6px 12px;background:#fff;color:#141F63;font:inherit;cursor:pointer';r.onclick=function(){location.reload()};
var x=document.createElement('button');x.textContent='Để sau';x.style.cssText='border:1px solid rgba(255,255,255,.5);border-radius:10px;padding:6px 10px;background:none;color:#fff;font:inherit;cursor:pointer';x.onclick=function(){clearInterval(t);b.remove();V=nv.v};
b.appendChild(r);b.appendChild(x);document.body.appendChild(b);var t=setInterval(function(){n--;var c=document.getElementById('bs-cd');if(c)c.textContent=n;if(n<=0){clearInterval(t);location.reload()}},1000)}
function check(){if(location.protocol==='file:')return;fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j&&j.v&&j.v!==V)bar(j)}).catch(function(){})}
setInterval(check,T);document.addEventListener('visibilitychange',function(){if(!document.hidden)check()});
window.BS_BUILD={v:V,built:BUILT,last:LAST};})();</script>''' % (json.dumps(ver), json.dumps(cfg['built']), json.dumps(last))

i = html.rfind('</body>')
html = html[:i] + probe + html[i:] if i >= 0 else html + probe
open(os.path.join(DOCS, 'index.html'), 'w', encoding='utf8').write(html)
json.dump({'v': ver, 'built': cfg['built'], 'last': last}, open(os.path.join(DOCS, 'version.json'), 'w'))
open(os.path.join(DOCS, '.nojekyll'), 'w').close()
print('docs/index.html', len(html), 'bytes · version', ver, '· data đến', last)
