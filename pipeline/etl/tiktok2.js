const X=require('xlsx'),fs=require('fs'),vm=require('vm');
const DIR=process.env.BS_DATA+'/Onsite_Tiktok Shop/';
const w={};vm.runInNewContext(fs.readFileSync(process.env.BS_HOME+'/assets/tiktok_asset_143c55d6.js','utf8'),{window:w});const U=w.BSTIKTOK;
const files=fs.readdirSync(DIR).filter(f=>/xlsx$/.test(f)).sort((a,b)=>{const k=f=>f.slice(4,8)+f.slice(2,4)+f.slice(0,2);return k(a)<k(b)?-1:1});
const h0=X.utils.sheet_to_json(X.readFile(DIR+files[0]).Sheets.Sheet1,{header:1,defval:null})[8];
const fields=Object.keys(U.days[0]).slice(1);const map={};h0.slice(1).forEach((h,i)=>map[h]=fields[i]);map['GMV thẻ sản phẩm']='card';
const num=v=>{if(v==null||v==='')return null;const s=String(v);const n=Number(s.replace('%',''));return isNaN(n)?null:(s.includes('%')?n/100:n)};
const days={};
for(const f of files){const r=X.utils.sheet_to_json(X.readFile(DIR+f).Sheets.Sheet1,{header:1,defval:null});const hi=r.findIndex(x=>x[0]==='Ngày');const h=r[hi];
 for(let i=hi+1;i<r.length;i++){const x=r[i];if(!x||!/^\d\d\/\d\d\/\d{4}$/.test(String(x[0]||'')))continue;const [d,m,y]=x[0].split('/');const o={date:`${y}-${m}-${d}`};h.forEach((c,j)=>{if(j===0)return;const k=map[c];if(!k){console.log('unmapped',c);return}o[k]=num(x[j])});days[o.date]=o}}
const arr=Object.keys(days).sort().map(d=>{const o={date:d};fields.forEach(k=>o[k]=days[d][k]??0);return o});
// total convention check on uploaded
const add=['gmv','orders','customers','units','refund','skuOrders','revenue','pageViews','visitors','impr','imprU','clicks','clicksU','liveCreator','liveCreatorDirect','liveCreatorIndirect','liveConnected','liveSeller','liveSellerIndirect','video','videoCreator','videoCreatorIndirect','videoConnected','videoSeller','videoSellerIndirect'];
const tot=(A)=>{const t={};add.forEach(k=>t[k]=A.reduce((s,d)=>s+(d[k]||0),0));t.cvr=t.visitors?t.customers/t.visitors:null;t.aov=t.orders?t.gmv/t.orders:null;return t};
const tu=tot(U.days);let bad=[];for(const k of Object.keys(U.total)){const a=tu[k],b=U.total[k];if(Math.abs(a-b)>1e-6*Math.abs(b)+1)bad.push([k,a,b])}console.log('uploaded-total mismatch',bad);
const T=tot(arr);
const BS={source:'Onsite_Tiktok Shop: 01012026.21092026.xlsx + các file tuần/ngày đến 02112026.15112026.xlsx',periodFrom:arr[0].date,periodTo:arr[arr.length-1].date,comparePeriod:U.comparePeriod,total:T,yoy:U.yoy,days:arr,yoyNote:'YoY chỉ có trong file 01/01–21/09/2026 (so 12/04–31/12/2025); các file sau so với kỳ liền trước nên không đưa vào YoY'};
fs.writeFileSync('out/TIKTOK.js','window.BSTIKTOK = '+JSON.stringify(BS)+';\n');
console.log(arr.length,arr[arr.length-1].date,T.gmv,T.orders);
