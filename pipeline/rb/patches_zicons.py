import os
# Inject the icon library + card-label enhancer into every page script.
import re
P=[]
_ICONS=open(os.environ['BS_HOME']+'/rb/bs_icons.js',encoding='utf8').read()
def _fn(tpl):
    m=re.search(r'<script type="text/x-dc" data-dc-script[^>]*>',tpl)
    assert m,'no dc script'
    return tpl[:m.end()]+'\n'+_ICONS+'\n'+tpl[m.end():]
POST={pid:_fn for pid in ['ov','ovkpi','daily','shopee','tiktok','pp','raw']}
