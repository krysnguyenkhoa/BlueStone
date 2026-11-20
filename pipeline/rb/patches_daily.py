import os
import re
P=[]
def _fn(tpl):
    a=tpl.index('<script type="text/x-dc" data-dc-script')
    gt=tpl.index('>',a)+1
    b=tpl.index('</script>',gt)
    ok=open(os.environ['BS_HOME']+'/rb/ovk_script.js',encoding='utf8').read()
    ov=open(os.environ['BS_HOME']+'/rb/ov_new_methods.js',encoding='utf8').read()
    src=open(os.environ['BS_HOME']+'/rb/daily_new.js',encoding='utf8').read()
    def part(s,x,y):
        i=s.index(x); j=s.index(y,i); return s[i:j]
    A=part(ok,'  esc(s) {','  chan() {')
    B=part(ok,'  lvl(att) {','  // ---- cards')
    C=part(ok,'  nextDay(','  wsHtml(')
    OKO=part(ok,'  OK_OWN() {','  // ---- paint')
    src=src.replace('/*HELPERS_A*/',A).replace('/*HELPERS_B*/',B).replace('/*HELPERS_C*/',C)
    k=src.rindex('}')
    i=ov.index('  OX_CSS() {'); j=ov.index('\n  paintOX() {')
    new=src[:k]+'\n'+OKO+'\n'+ov[i:j]+'\n}\n'
    tpl=tpl[:gt]+new+tpl[b:]
    ph=tpl.index('BlueStonePerformanceDesignSystem_fd579b.PageHeader');ph=tpl.rindex('<x-import',0,ph)
    e0=tpl.index('</x-import>',ph)+len('</x-import>')
    me=tpl.index('</main>')
    return tpl[:e0]+'\n<div id="dly"></div>\n'+tpl[me:]
POST={'daily':_fn}
