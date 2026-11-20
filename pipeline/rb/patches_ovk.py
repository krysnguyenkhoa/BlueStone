import os
import re
P=[]
def _fn(tpl):
    a=tpl.index('<script type="text/x-dc" data-dc-script')
    gt=tpl.index('>',a)+1
    b=tpl.index('</script>',gt)
    src=open(os.environ['BS_HOME']+'/rb/ovk_script.js',encoding='utf8').read()
    ov=open(os.environ['BS_HOME']+'/rb/ov_new_methods.js',encoding='utf8').read()
    i=ov.index('  OX_CSS() {'); j=ov.index('\n  paintOX() {')
    css=ov[i:j]
    k=src.rindex('}')   # closing brace of class
    new=src[:k]+'\n'+css+'\n}\n'
    tpl=tpl[:gt]+new+tpl[b:]
    ph=tpl.index('BlueStonePerformanceDesignSystem_fd579b.PageHeader');ph=tpl.rindex('<x-import',0,ph)
    e0=tpl.index('</x-import>',ph)+len('</x-import>')
    me=tpl.index('</main>')
    return tpl[:e0]+'\n<div id="ovk"></div>\n'+tpl[me:]
POST={'ovkpi':_fn}
