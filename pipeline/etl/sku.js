const fs=require('fs'),vm=require('vm');
const r=require(process.env.BS_HOME+'/work/orders26.json');
const w={};vm.runInNewContext(fs.readFileSync(process.env.BS_HOME+'/assets/pp_asset_6960c3d9.js','utf8'),{window:w});const U=w.BSSKUNEW;
const LAST=process.env.BS_LAST,lastDay=+LAST.slice(8,10);
const tg={},bySku={};U.skus.forEach(s=>{tg[s.type]=s.group;bySku[s.sku]=s});
const chIdx=c=>c==='Shopee'?0:c==='Tiktok Shop'?1:(c==='Web'||c==='Website - Carez'||c==='Google Shop')?2:c==='Harasocial'?3:(c==='Lazada'||c==='Tiki')?4:5;
const dt=s=>{const [d,m,y]=s.split('/');return y+'-'+m+'-'+d};
const S={};const newTypes={};const DAY={};
for(let i=1;i<r.length;i++){const x=r[i];const d=dt(x[0]);if(d>LAST)continue;const sku=String(x[2]);const type=x[4];
  let s=S[sku];if(!s){const old=bySku[sku];const bc=String(x[3]||'');const group=old?old.group:(tg[type]||(newTypes[type]=1,'Phụ kiện & Khác'));
   s=S[sku]={sku,name:x[1],type,group,model:old?old.model:bc.slice(6),img:old?old.img:bc+'.png',cells:{}}}
  if(x[7]!=='Hủy'){const dk=DAY[d]||(DAY[d]=[0,0,0,0,0,0]);dk[chIdx(x[5])]+=x[10]}
  if(!s.first||d<s.first)s.first=d;if(!s.last||d>s.last)s.last=d;
  const m=+d.slice(5,7)-1,c=chIdx(x[5]),day=+d.slice(8,10);
  const cancel=x[7]==='Hủy';
  const add=(key)=>{const a=s.cells[key]||(s.cells[key]={l:0,g:0,o:new Set(),cl:0,cg:0,co:new Set(),n:0,no:new Set()});a.l++;a.g+=x[10];a.o.add(x[6]);if(cancel){a.cl++;a.cg+=x[10];a.co.add(x[6])}else{a.n+=x[10];a.no.add(x[6])}};
  add(m+'_'+c);if(day<=lastDay)add('p'+m+'_'+c)}
const skus=Object.values(S).map(s=>{const d={};for(const k in s.cells){const a=s.cells[k];d[k]=[a.l,Math.round(a.g*1000)/1000,a.o.size,a.cl,Math.round(a.cg*1000)/1000,a.co.size,Math.round(a.n*1000)/1000,a.no.size]}return{sku:s.sku,name:s.name,type:s.type,group:s.group,model:s.model,img:s.img,first:s.first,last:s.last,d}});
skus.sort((a,b)=>{const t=s=>Object.entries(s.d).filter(([k])=>k[0]!=='p').reduce((x,[,v])=>x+v[6],0);return t(b)-t(a)});
const out={source:'Order_data/'+(process.env.BS_ORDERFILE||''),from:'2026-01-01',to:LAST,channels:U.channels,groups:U.groups,channelMap:U.channelMap,lastDay,cell:U.cell,notes:U.notes,daily:Object.fromEntries(Object.entries(DAY).sort().map(([k,v])=>[k,v.map(Math.round)])),skus};
console.log(Object.keys(newTypes),skus.length,U.skus.length);
// parity check vs uploaded for months 0..7 non-partial
let ok=0,bad=0;const bs={};skus.forEach(s=>bs[s.sku]=s);
for(const u of U.skus){const s=bs[u.sku];if(!s){bad++;continue}for(const k in u.d){if(k[0]==='p'||+k.split('_')[0]>7)continue;const a=u.d[k],b=s.d[k];if(b&&a.every((v,i)=>Math.abs(v-b[i])<1.01))ok++;else{bad++;if(bad<5)console.log(u.sku,k,a.join(),b&&b.join())}}}
console.log({ok,bad});
fs.writeFileSync('sku.json',JSON.stringify(out));
const imgs=new Set(fs.readdirSync(process.env.BS_HOME+'/assets').filter(f=>0));
