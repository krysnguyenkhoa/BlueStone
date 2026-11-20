const X=require('xlsx'),fs=require('fs'),path=require('path');
const DIR=process.env.BS_DATA+'/Onsite_Shopee/';
const num=s=>{if(s===''||s==null)return null;s=String(s).trim();if(s==='-')return null;let p=false;if(s.endsWith('%')){p=true;s=s.slice(0,-1);}
 s=s.replace(/\./g,'').replace(',','.');const v=parseFloat(s);if(isNaN(v))return null;return p?Math.round(v)/100===v/100?v/100:v/100:v;};
const rnd=(v,d)=>v==null?v:Math.round(v*10**d)/10**d;
const pct=s=>{const v=num(s);return v==null?null:rnd(v,4)};
const isD=s=>/^\d\d-\d\d-\d{4}$/.test(String(s));
const iso=s=>{const m=String(s).match(/^(\d\d)-(\d\d)-(\d{4})$/);return `${m[3]}-${m[2]}-${m[1]}`};
const load=(f,i)=>{const wb=f.__wb||X.readFile(f);return X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[i]],{header:1,raw:false,defval:''})};
const wbs={};const getWb=m=>wbs[m]||(wbs[m]=X.readFile(DIR+`Total_Shopee_T${m}.xlsx`));
const sh=(m,i)=>{const wb=getWb(m);return X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[i]],{header:1,raw:false,defval:''})};

function dayRow(x){const o={gmv:num(x[1]),gmvNoSub:num(x[2]),orders:num(x[3]),aov:rnd(num(x[4]),2),clicks:num(x[5]),visits:num(x[6]),cr:pct(x[7]),cancelOrders:num(x[8]),cancelGmv:num(x[9]),returnOrders:num(x[10]),returnGmv:num(x[11]),buyers:num(x[12]),newBuyers:num(x[13]),existingBuyers:num(x[14]),potentialBuyers:num(x[15]),returnRate:pct(x[16])};return o}
const KIND=['placed','confirmed','paid'];
function sheetOverview(m,k){const r=sh(m,k);const tot=r.find(x=>/^\d\d-\d\d-\d{4}-\d\d-\d\d-\d{4}$/.test(x[0]));const days=r.filter(x=>isD(x[0])).map(x=>({date:iso(x[0]),...dayRow(x)}));
 return {range:tot?tot[0]:null,total:tot?dayRow(tot):null,days}}

// ---- sources (summary sheet) ----
function parseSources(m,si){const r=sh(m,si);const groups=[];let cur=null;
 for(let i=0;i<r.length;i++){const x=r[i];
  if(x[0]&&x.slice(1).every(c=>c==='')&&r[i+1]&&r[i+1][0]==='Nguồn lưu lượng'){cur={group:x[0],isAds:/Dịch vụ Hiển thị/.test(x[0]),subs:[],total:null};groups.push(cur);i++;continue;}
  if(cur&&x[0]&&x[1]!==''){
   if(cur.isAds){cur.subs.push({name:x[0],share:pct(x[1]),gmv:num(x[2]),impressions:num(x[3]),orders:num(x[4]),cr:pct(x[5]),cost:num(x[6]),roas:num(x[7])})}
   else{const o={name:x[0],share:pct(x[1]),gmv:num(x[2]),views:num(x[3]),clicks:num(x[4]),orders:num(x[5]),skus:num(x[6]),ctr:pct(x[7]),cr:pct(x[8]),aov:rnd(num(x[9]),2),buyers:num(x[10]),uniqViews:num(x[11]),uniqClicks:num(x[12])};
    if(!cur.total)cur.total=o;else cur.subs.push(o);}
  }}
 for(const g of groups)if(g.isAds){const s=g.subs;const gmv=s.reduce((a,b)=>a+(b.gmv||0),0),cost=s.reduce((a,b)=>a+(b.cost||0),0);g.total={name:'Tổng Ads',gmv,cost,orders:s.reduce((a,b)=>a+(b.orders||0),0),impressions:s.reduce((a,b)=>a+(b.impressions||0),0),roas:cost?gmv/cost:0}}
 const head=r[1];const grossGmv=num(head[2]);const groupTotals={};for(const g of groups)groupTotals[g.group]=g.total.gmv;
 return {groupTotals,gmv:grossGmv,groups}}

// ---- daily by source ----
function parseSourcesDaily(m,si){const r=sh(m,si);const groups=[];let cur=null,sub=null;
 for(let i=0;i<r.length;i++){const x=r[i];
  if(x[0]&&!isD(x[0])&&x.slice(1).every(c=>c==='')&&r[i+1]&&r[i+1][0]==='Nguồn lưu lượng'){cur={group:x[0],isAds:/Dịch vụ Hiển thị/.test(x[0]),subs:[]};groups.push(cur);sub=null;i++;continue;}
  if(!cur)continue;
  if(x[0]&&!isD(x[0])&&x[1]!==''){sub={name:x[0],isTotal:!cur.isAds&&cur.subs.length===0,days:[]};cur.subs.push(sub);continue;}
  if(sub&&isD(x[0])){
   if(cur.isAds)sub.days.push({date:iso(x[0]),gmv:num(x[2]),impressions:num(x[3]),orders:num(x[4]),cr:pct(x[5]),cost:num(x[6]),roas:num(x[7])});
   else sub.days.push({date:iso(x[0]),share:pct(x[1]),gmv:num(x[2]),views:num(x[3]),clicks:num(x[4]),orders:num(x[5]),ctr:pct(x[7]),cr:pct(x[8]),aov:rnd(num(x[9]),2),buyers:num(x[10])});}
 }
 return groups}

// ---- products ----
const SKU=require('./sku.json').skus;const IK=new Set(require('./imgkeys.json').shopee);const pngx=x=>x.replace(/\.(jpe?g|webp)$/i,'.png');const byModel={};for(const s of SKU)byModel[s.model]=s;
const codeOf=n=>{const m=String(n).match(/\b([A-Z]{3}-\d{3,4}[A-Z]?)\b/);return m?m[1]:null};
function parseProducts(m,si){const r=sh(m,si);const out=[];let inG=false;
 for(let i=0;i<r.length;i++){const x=r[i];
  if(x[0]==='Mã sản phẩm'){inG=true;continue;}
  if(inG&&/^\d{6,}$/.test(x[0])){const code=codeOf(x[1]);const sk=code&&byModel[code.replace('-','')];
   out.push({id:x[0],name:x[1],status:x[2],share:pct(x[3]),gmv:num(x[4]),impressions:num(x[5]),clicks:num(x[6]),orders:num(x[7]),skus:null,ctr:pct(x[9]),cr:pct(x[10]),aov:rnd(num(x[11]),2),buyers:num(x[12]),code,img:sk&&sk.img&&IK.has('thumbs/'+pngx(sk.img))?sk.img:null});}
  else if(inG&&x[0]==='')inG=false;
 }return out}

module.exports={sh,sheetOverview,parseSources,parseSourcesDaily,parseProducts,num,pct,KIND,rnd,getWb};

if(require.main===module){
 const DET=+process.env.BS_SHM,LASTMONTH=DET-1;
 const O={source:'Onsite_Shopee: Total_Shopee_T1..T'+LASTMONTH+'.xlsx (tổng tháng) + Total_Shopee_T'+DET+'.xlsx (theo ngày)',months:{},sept:{},sources:{},sourcesDaily:{},ads:{},products:{},totals:{}};
 KIND.forEach((k,ki)=>{
  O.months[k]=[];
  for(let m=1;m<=LASTMONTH;m++){const ov=sheetOverview(m,ki);O.months[k].push({month:m,partial:false,...ov.total});}
  const d=sheetOverview(DET,ki);O.sept[k]={total:d.total,days:d.days,range:d.range};
  O.sources[k]=parseSources(DET,3+ki*3);O.sourcesDaily[k]=parseSourcesDaily(DET,4+ki*3);O.products[k]=parseProducts(DET,5+ki*3);
  const tt={};const rows=[...O.months[k],{...d.total}];
  for(const f of ['gmv','gmvNoSub','orders','clicks','visits','cancelOrders','cancelGmv','returnOrders','returnGmv'])tt[f]=rows.reduce((a,b)=>a+(b[f]||0),0);
  tt.aov=rnd(tt.gmv/tt.orders,2);tt.cr=rnd(tt.orders/tt.clicks,4);
  Object.assign(tt,{buyers:null,newBuyers:null,existingBuyers:null,potentialBuyers:null,returnRate:null});O.totals[k]=tt;
 });
 // products flat (old schema: 20 items per kind in group order)
 // crossCheck from core
 const sdays=O.sept.placed.days.map(x=>x.date).sort();const c=require('./core.json');const i0=c.dates.indexOf(sdays[0]),i1=c.dates.indexOf(sdays[sdays.length-1]);const rl=sdays[0].slice(8,10)+'–'+sdays[sdays.length-1].slice(8,10)+'/'+sdays[0].slice(5,7);let nm=0,sp=0,ln=0;
 for(const r of c.rows)if(r[1]===0&&r[0]>=i0&&r[0]<=i1){nm+=r[3];sp+=r[2];ln+=r[6]}
 O.crossCheck={label:'NMV Shopee (Order_data) '+rl,nmv:nm,spend:sp,orders:ln};
 // order-data (NMV) theo ngày/tháng cho Shopee + KPI tháng
 {const dd={},mm={};const c2=require('./core.json');
  for(const r of c2.rows)if(r[1]===0){const iso=c2.dates[r[0]],m=+iso.slice(5,7);
   if(m===DET)dd[iso]={nmv:r[3],gmv:r[4],orders:r[6],spend:r[2]};
   const o=mm[m]||(mm[m]={nmv:0,gmv:0,orders:0,spend:0});o.nmv+=r[3];o.gmv+=r[4];o.orders+=r[6];o.spend+=r[2];}
  O.orderDaily=dd;O.orderMonth=mm;
  const K0=JSON.parse(fs.readFileSync('./kpi.json','utf8'));const K=K0.TG||K0;const KM=K.months||{};
  const kk={};for(const k of Object.keys(KM)){const x=KM[k];if(x&&x.ch&&x.ch.Shopee)kk[+k]={nmv:x.ch.Shopee.nmv,spend:x.ch.Shopee.spend}};
  O.kpiMonths=kk;O.kpi=Object.assign({month:DET},kk[DET]||{nmv:null,spend:null});}
 O.note='Cột "Doanh số không bao gồm trợ giá bởi Shopee" dùng để tính % trợ giá. T'+DET+' mới có '+rl+' nên đánh dấu T'+DET+'*.';
 O.t9Days=O.sept.placed.days.length;
 fs.writeFileSync(process.env.BS_HOME+'/etl/onsite.json',JSON.stringify(O));
 fs.writeFileSync(process.env.BS_HOME+'/etl/out/ONSITE.js','window.BSONSITE = '+JSON.stringify(O)+';\n');
 console.log('ok',O.t9Days,JSON.stringify(O.sept.placed.total).slice(0,200),O.products.placed.length,O.products.placed.filter(p=>!p.code||!p.img).map(p=>p.id+':'+p.name.slice(0,40)));
 console.log(JSON.stringify(O.months.placed.map(m=>[m.month,m.gmv,m.buyers])),JSON.stringify(O.totals.placed));
 console.log(O.sources.placed.groups.map(g=>g.group+':'+g.subs.length),O.sourcesDaily.placed.map(g=>g.group+':'+g.subs.length+'/'+g.subs[0].days.length));
}
