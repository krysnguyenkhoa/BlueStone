global.window={};require('./out/SKUNEW.js');require('./out/BSDATA.js');
const S=window.BSSKUNEW,D=window.BSDATA;
const out={groups:S.groups,m:{}};
for(const sku of S.skus){const g=S.groups.indexOf(sku.group);for(const [k,v] of Object.entries(sku.d)){if(k[0]==='p')continue;const [m0]=k.split('_');const m=+m0+1;out.m[m]=out.m[m]||S.groups.map(()=>0);out.m[m][g]+=v[6]||0;}}
// cross check vs BSDATA nmv
const chk={};for(const r of D.rows){const m=+D.dates[r[0]].slice(5,7);chk[m]=(chk[m]||0)+r[3];}
for(const m of Object.keys(out.m)){const a=out.m[m].reduce((x,y)=>x+y,0);console.log(m,Math.round(a/1e6),Math.round((chk[m]||0)/1e6),((a/(chk[m]||1))).toFixed(3));out.m[m]=out.m[m].map(x=>Math.round(x))}
require('fs').writeFileSync('out/OVCAT.json',JSON.stringify(out));
