import os
import json
P=[]
def _fn(tpl):
    a=tpl.index('<script type="text/x-dc" data-dc-script')
    gt=tpl.index('>',a)+1
    b=tpl.index('</script>',gt)
    old=tpl[gt:b]
    i1=old.index('  D() {');i2=old.index('  kpi(label');i3=old.index('  // In a bundled/offline');i4=old.index('  renderVals() {')
    head=old[:i1].replace("hover: null }","hover: null, mtab: 'gmv' }")
    methods=open(os.environ['BS_HOME']+'/rb/ov_new_methods.js',encoding='utf8').read()
    cat=open(os.environ['BS_HOME']+'/etl/out/OVCAT.json',encoding='utf8').read()
    new=head+old[i1:i2]+old[i3:i4]+methods.replace('/*OVCAT*/null',cat)
    tpl=tpl[:gt]+new+tpl[b:]
    # template: keep header + pacing bar, replace the rest of <main> with a mount point
    ph=tpl.index('BlueStonePerformanceDesignSystem_fd579b.PageHeader');ph=tpl.rindex('<x-import',0,ph)
    e0=tpl.index('</x-import>',ph)+len('</x-import>')
    pb=tpl.index('BlueStonePerformanceDesignSystem_fd579b.PacingBar');p1=tpl.rindex('<x-import',0,pb)
    e1=tpl.index('</x-import>',p1)+len('</x-import>')
    me=tpl.index('</main>')
    return tpl[:e0]+'\n'+tpl[p1:e1]+'\n<div id="ovx"></div>\n'+tpl[me:]
POST={'ov':_fn}
