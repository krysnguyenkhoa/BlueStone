const fs=require('fs'),vm=require('vm');
const r=require(process.env.BS_HOME+'/work/orders26.json');const C=require('./cost.json');
const LAST=process.env.BS_LAST;
const dt=s=>{const [d,m,y]=s.split('/');return y+'-'+m+'-'+d};
// channel index per uploaded: Shopee0,Tiktok1,Harasocial2,Website3,Lazada4,Khác5
const chOf=c=>c==='Shopee'?0:c==='Tiktok Shop'?1:c==='Harasocial'?2:(c==='Web'||c==='Website - Carez'||c==='Google Shop')?3:(c==='Lazada'||c==='Tiki')?4:5;
const dates=[];for(let d=new Date('2026-01-01T00:00:00Z');d<=new Date(LAST+'T00:00:00Z');d=new Date(d.getTime()+864e5))dates.push(d.toISOString().slice(0,10));
const di={};dates.forEach((d,i)=>di[d]=i);
const A={};
for(let i=1;i<r.length;i++){const x=r[i];const d=dt(x[0]);if(!(d in di))continue;const k=di[d]+'|'+chOf(x[5]);const o=A[k]||(A[k]={nmv:0,gmv:0,ld:0,od:0});o.gmv+=x[10];o.ld++;if(x[7]==='Không hủy'){o.nmv+=x[10];o.od++}}
const spendSrc=dates.map(d=>[C.shopeeOn[d]||0,C.offsite[d]||0,C.tiktok[d]||0,C.fb[d]||0,C.google[d]||0]);
const spOf=(i,ch)=>{const s=spendSrc[i];return ch===0?s[0]+s[1]:ch===1?s[2]:ch===2?s[3]:ch===3?s[4]:0};
const rows=[];
for(let i=0;i<dates.length;i++)for(let ch=0;ch<6;ch++){const a=A[i+'|'+ch];const sp=spOf(i,ch);if(!a&&!sp)continue;const o=a||{nmv:0,gmv:0,ld:0,od:0};rows.push([i,ch,Math.round(sp),Math.round(o.nmv),Math.round(o.gmv),o.ld,o.od,sp>0?1:0])}
// compare to uploaded
const w={};vm.runInNewContext(fs.readFileSync(process.env.BS_HOME+'/assets/ov_asset_a58bebe0.js','utf8'),{window:w});const B=w.BSDATA;
const U={};B.rows.forEach(x=>U[B.dates[x[0]]+'|'+x[1]]=x);
let same=0,diff=0,miss=0,flagMis=0;const dd=[];
for(const x of rows){const k=dates[x[0]]+'|'+x[1];const u=U[k];if(dates[x[0]]>'2026-09-22')continue;if(!u){miss++;continue}
 if(u[2]===x[2]&&u[3]===x[3]&&u[4]===x[4]&&u[5]===x[5]&&u[6]===x[6])same++;else{diff++;if(dd.length<6)dd.push([k,u.join(),x.join()])}
 if(u[7]!==x[7])flagMis++}
console.log({same,diff,miss,flagMis,upRows:B.rows.filter(x=>B.dates[x[0]]<='2026-09-22').length});console.log(dd.join('\n'));
fs.writeFileSync('core.json',JSON.stringify({dates,rows,spendSrc}));
