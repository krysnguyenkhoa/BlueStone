const X=require('xlsx'),fs=require('fs');
const wb=X.readFile(process.env.BS_DATA+'/KPI/KPI Monthly Plan 2026.xlsx');
const sh=n=>X.utils.sheet_to_json(wb.Sheets[n],{header:1,defval:null});
const iso=v=>new Date(Math.floor(v-25569)*864e5).toISOString().slice(0,10);
const CHN=['Shopee','Tiktok Shop','Lazada','Website/Social','Seller','VN Shop','Droppii'];
const SRC='KPI Monthly Plan 2026.xlsx';
// ---- overview sheet
const ov=sh('KPI Ecom 2026');const serial=ov[1];const find=(l,m)=>{const i=ov.findIndex(x=>String(x[0]||'').trim()===l&&x[1]===m);return ov[i]};
const months={};
for(let c=2;c<serial.length;c++){if(typeof serial[c]!=='number')continue;const m=+iso(serial[c]).slice(5,7);
  const tN=find('Total','NMV')[c],i0=ov.findIndex(x=>String(x[0]||'').trim()==='Total');const tS=ov[i0+1][c];
  const o={month:m,year:2026,nmv:tN,spend:tS,cir:tN?tS/tN:null,ch:{}};
  for(const n of CHN){const i=ov.findIndex(x=>String(x[0]||'').trim()===n&&x[1]==='NMV');const nm=ov[i][c]||0,sp=ov[i+2][c]||0;o.ch[n]={nmv:nm,spend:sp,cir:nm?sp/nm:null}}
  months[m]=o}
// ---- month sheets (Oct/Nov content swapped vs labels)
const sheetFor={};for(let m=1;m<=9;m++)sheetFor[m]=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'][m-1]+'-2026';
sheetFor[10]='Nov-2026\t';sheetFor[11]='Oct-2026';
const DOW=['SUN','MON','TUE','WED','THU','FRI','SAT'];
const dim=m=>new Date(Date.UTC(2026,m,0)).getUTCDate();
const byMonth={},notes=[];
for(let m=1;m<=11;m++){
  const r=sh(sheetFor[m]);const hi=r.findIndex(x=>x[0]==='Channel'&&x[1]==='Metric');const alloc=r[hi+1].slice(3).map(v=>v||0);
  const n=dim(m);
  const row=(l,met)=>{const i=r.findIndex(x=>String(x[0]||'').trim()===l&&x[1]===met);return i<0?null:r[i]};
  const grab=(l)=>{const i=r.findIndex(x=>String(x[0]||'').trim()===l);const nm=r[i].slice(3),sp=r[i+(l==='Total'?1:2)].slice(3);return{nmv:nm,spend:sp}};
  const T=months[m];let scaleNote=null;
  const fit=(arr,target)=>{let a=arr.slice(0,n).map(v=>+v||0);while(a.length<n)a.push(0);const s=a.reduce((x,y)=>x+y,0);const f=s&&target?target/s:1;if(Math.abs(f-1)>0.002)scaleNote=(scaleNote||'')+'';return {a:a.map(v=>v*f),f}};
  const out={source:`${SRC} · sheet "${sheetFor[m].trim()}"`+(m>=10?` (nội dung là kế hoạch T${m}; nhãn sheet đang bị đảo T10↔T11)`:''),unitNote:'Đơn vị đồng',month:m,monthNmv:T.nmv,monthSpend:T.spend,cirTarget:T.cir,ch:{},days:[]};
  const tot=grab('Total');const tn=fit(tot.nmv,T.nmv),ts=fit(tot.spend,T.spend);
  for(const nme of ['Shopee','Tiktok Shop','Lazada','Website/Social','Seller']){const g=grab(nme);const cn=fit(g.nmv,T.ch[nme].nmv),cs=fit(g.spend,T.ch[nme].spend);out.ch[nme]={nmv:T.ch[nme].nmv,spend:T.ch[nme].spend,cir:T.ch[nme].cir,days:cn.a,spendDays:cs.a}}
  const al=alloc.slice(0,n);
  for(let d=1;d<=n;d++){const date=`2026-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const a=al[d-1]||0;
    const type=a>=0.25?'Double Day':d===15?'Mid-month':d===25?'Payday':a>=0.045?'Sale':'BAU';
    out.days.push({date,type,dow:DOW[new Date(date+'T00:00:00Z').getUTCDay()],nmv:tn.a[d-1],spend:ts.a[d-1]})}
  byMonth[m]=out;
}
const LASTM=+process.env.BS_LASTM;
const KPI={...byMonth[LASTM],byMonth};
// BSTARGETS
const TG={source:SRC+' · sheet "KPI Ecom 2026"',unitNote:'Đơn vị đồng',months:months};
// BSDAILYTRACK
const KEYS=[['total','Total'],['shopee','Shopee'],['tts','Tiktok Shop'],['websocial','Website/Social'],['lazada','Lazada'],['seller','Seller']];
function trackMonth(m){const b=byMonth[m];const mt={};KEYS.forEach(([k,n])=>{mt[k]=n==='Total'?{nmv:b.monthNmv,spend:b.monthSpend,cir:b.cirTarget}:{nmv:b.ch[n].nmv,spend:b.ch[n].spend,cir:b.ch[n].cir}});
 const days=b.days.map((d,i)=>{const tgt={};KEYS.forEach(([k,n])=>{tgt[k]=n==='Total'?{nmv:d.nmv,spend:d.spend}:{nmv:b.ch[n].days[i],spend:b.ch[n].spendDays[i]}});return{date:d.date,dow:d.dow,type:d.type,tgt}});
 return{month:m,cirTarget:b.cirTarget,monthTargets:mt,days}}
const bm={};for(let m=1;m<=LASTM;m++)bm[m]=trackMonth(m);
const DT={source:SRC+' (sheet theo tháng, % phân bổ ngày)',unitNote:'đơn vị đồng',year:2026,channels:[{key:'total',label:'Total EC',actual:null},{key:'shopee',label:'Shopee',actual:['Shopee']},{key:'tts',label:'TikTok Shop',actual:['Tiktok Shop']},{key:'websocial',label:'Website/Social',actual:['Harasocial','Website']},{key:'lazada',label:'Lazada · Tiki',actual:['Lazada']},{key:'seller',label:'Seller',actual:[]}],
 restNote:'Website/Social = Harasocial + Website. Lazada · Tiki = Lazada + Tiki. Seller có KPI nhưng file đơn hàng chưa có kênh tương ứng nên actual để trống. Ngưỡng CIR theo CIR target của kênh trong tháng.',...bm[LASTM],byMonth:bm};
fs.writeFileSync('kpi.json',JSON.stringify({TG,KPI,DT}));
for(let m=1;m<=11;m++)console.log(m,Math.round(byMonth[m].monthNmv/1e6),Math.round(byMonth[m].days.reduce((s,d)=>s+d.nmv,0)/1e6),byMonth[m].days.filter(d=>d.type!=='BAU').map(d=>d.type[0]+d.date.slice(8)).join(' '));
