const X=require('xlsx'),fs=require('fs'),path=require('path');
const ROOT=process.env.BS_DATA+'/Cost';
const pad=n=>String(n).padStart(2,'0');
function iso(v){ if(v==null)return null; if(typeof v==='number'){const d=new Date(Math.floor(v-25569)*864e5);return d.toISOString().slice(0,10)}
 const s=String(v).trim();let m;
 if((m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)))return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
 if((m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)))return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;return null}
const rows=(f,sn)=>{const wb=X.readFile(f);return X.utils.sheet_to_json(wb.Sheets[sn||wb.SheetNames[0]],{header:1,defval:null})};
const ls=d=>fs.readdirSync(d).filter(f=>/\.(xlsx|csv)$/i.test(f)).sort().map(f=>path.join(d,f));
const out={shopeeOn:{},shopeeOnCamp:{},offsite:{},tiktok:{},tiktokCamp:{},fb:{},google:{},googleCamp:{}};
const add=(o,d,v)=>{o[d]=(o[d]||0)+v};
// ---- Shopee onsite: top-ups
const norm=s=>String(s||'').normalize('NFC');
const seenSh=new Set();let dupSh=0;
function fileRange(f){const m=path.basename(f).match(/^(\d{2})\.?(\d{2})(\d{4})\.(\d{2})(\d{2})(\d{4})/);if(!m)return null;return [`${m[3]}-${m[2]}-${m[1]}`,`${m[6]}-${m[5]}-${m[4]}`]}
for(const f of ls(ROOT+'/Cost_Shopee/Onsite')){
  const rg=fileRange(f);const r=rows(f);const hi=r.findIndex(x=>x[0]==='Sequence');if(hi<0)continue;
  for(let i=hi+1;i<r.length;i++){const x=r[i];if(!x||x[1]==null)continue;const d=iso(x[1]);const a=Number(x[3])||0;if(!d||a<=0)continue;
    if(rg&&(d<rg[0]||d>rg[1]))continue;
    const ds=norm(x[2]);let cat=null;
    if(/n.p ti.n t. d.ng|N.p Ti.n T. .ng|Top-Up Credit/i.test(ds)&&!/ưu đãi|Free Ads|Rebate|doanh thu/i.test(ds)) cat=/Top-Up Credit/i.test(ds)?'Nạp tiền (Top-Up Credit)':'Nạp tiền tự động';
    else if(/Ti.n D.ch v. Hi.n th. .{1,2} n.p/i.test(ds)||/Dịch vụ Hiển thị đã nạp/.test(ds)) cat='Nạp tiền DV Hiển thị';
    if(!cat)continue;
    const key=[d,ds,a,x[0],path.basename(f)].join('|');
    add(out.shopeeOn,d,a);const m=d.slice(0,7);(out.shopeeOnCamp[m]=out.shopeeOnCamp[m]||{})[cat]=(out.shopeeOnCamp[m][cat]||0)+a;
  }}
// ---- override 2026-06-01..2026-11-18 with consolidated Onsite files (only 'Tiền Dịch vụ Hiển thị đã nạp')
{const NEW=JSON.parse(fs.readFileSync(path.join(__dirname,'shopee_topup_new.json'),'utf8'));const A=process.env.BS_SHA||'9999',B=process.env.BS_SHB||'0000';
 for(const d of Object.keys(out.shopeeOn)) if(d>=A&&d<=B) delete out.shopeeOn[d];
 for(const m of Object.keys(out.shopeeOnCamp)) if(m>=A.slice(0,7)&&m<=B.slice(0,7)) delete out.shopeeOnCamp[m];
 for(const [d,o] of Object.entries(NEW)){ if(d<A||d>B)continue; const m=d.slice(0,7);(out.shopeeOnCamp[m]=out.shopeeOnCamp[m]||{});
   for(const [k,cat] of [['m','Nạp tiền DV Hiển thị'],['a','Nạp tiền tự động']]){const v=o[k]||0;if(!v)continue;add(out.shopeeOn,d,v);out.shopeeOnCamp[m][cat]=(out.shopeeOnCamp[m][cat]||0)+v;} }}
// ---- Shopee offsite
const offSeen={};
for(const f of ls(ROOT+'/Cost_Shopee/Offsite')){const r=rows(f);const h=r[0];const iD=h.indexOf('Ngày'),iC=h.indexOf('Chi phí(VND)');
  for(let i=1;i<r.length;i++){let d=iso(r[i][iD]);if(typeof r[i][iD]==='number'&&d){const [y,m,dd]=d.split('-');if(+dd<=12)d=`${y}-${dd}-${m}`}if(!d)continue;offSeen[d]=Number(r[i][iC])||0}}
Object.assign(out.offsite,offSeen);
// ---- TikTok (weekly files + consolidated files from Drive in TT_NEW; the consolidated ones supersede revised (date,campaign) rows)
const TT_NEW=process.env.TT_NEW||process.env.BS_HOME+'/work/tt_new';
const ttRec={};// pair -> [{d,nm,a}]
const ttSeen=new Set();
const TT_SKIP=new Set(fs.existsSync(process.env.TT_NEW||'')?fs.readdirSync(process.env.TT_NEW):[]);
for(const f of ls(ROOT+'/Cost_Tiktok').filter(f=>!TT_SKIP.has(path.basename(f)))){const r=rows(f);const h=r[0];const iD=h.indexOf('Date'),iA=h.indexOf('Amount'),iI=h.indexOf('Campaign ID'),iN=h.indexOf('Campaign name');
  for(let i=1;i<r.length;i++){const x=r[i];if(!x||x[iD]==null)continue;const d=iso(x[iD]);if(!d)continue;const a=-(Number(x[iA])||0);
    const k=d+'|'+x[iI]+'|'+x[iA];if(ttSeen.has(k))continue;ttSeen.add(k);
    (ttRec[d+'|'+x[iI]]=ttRec[d+'|'+x[iI]]||[]).push({d,nm:String(x[iN]||''),a})}}
if(fs.existsSync(TT_NEW)){const nr={};
  for(const f of ls(TT_NEW)){const r=rows(f);const h=r[0];const iD=h.indexOf('Date'),iA=h.indexOf('Amount'),iI=h.indexOf('Campaign ID'),iN=h.indexOf('Campaign name');const mine={};
    for(let i=1;i<r.length;i++){const x=r[i];if(!x||x[iD]==null)continue;const d=iso(x[iD]);if(!d)continue;(mine[d+'|'+x[iI]]=mine[d+'|'+x[iI]]||[]).push({d,nm:String(x[iN]||''),a:-(Number(x[iA])||0)})}
    Object.assign(nr,mine)}// later file wins per (date,campaign)
  let chg=0,add_=0;for(const [p,v] of Object.entries(nr)){const o=ttRec[p];const sm=q=>Math.round(q.reduce((s,y)=>s+y.a,0));if(!o){ttRec[p]=v;add_++}else if(sm(o)!==sm(v)){ttRec[p]=v;chg++}}
  console.log('tiktok new-files: added pairs',add_,'revised pairs',chg)}
for(const v of Object.values(ttRec))for(const y of v){const nm=y.nm;add(out.tiktok,y.d,y.a);const cat=/^LIVE GMV Max/i.test(nm)?'LIVE GMV Max':/^Product GMV Max/i.test(nm)?'Product GMV Max':'Khác';
  const m=y.d.slice(0,7);const c=out.tiktokCamp[m]=out.tiktokCamp[m]||{};c[cat]=(c[cat]||0)+y.a}
// ---- Facebook
const fbSeen=new Set();
for(const f of ls(ROOT+'/Cost_Facebook')){const r=rows(f,'Raw Data Report');const h=r[0];const iD=h.indexOf('Ngày'),iS=h.indexOf('Số tiền đã chi tiêu (VND)'),iC=h.indexOf('Tên chiến dịch');
  for(let i=1;i<r.length;i++){const x=r[i];if(!x||x[iD]==null)continue;const d=iso(x[iD]);if(!d)continue;const a=Number(x[iS])||0;const k=d+'|'+x[iC]+'|'+a;if(fbSeen.has(k))continue;fbSeen.add(k);add(out.fb,d,a)}}
// ---- Google (two accounts: Ecom, adsplus) — last file wins per account/date
const gAcc={ecom:{},adsplus:{}};
for(const f of ls(ROOT+'/Cost_Google')){const rg=fileRange(f);const acc=/adsplus/i.test(f)?'adsplus':'ecom';const r=rows(f);const hi=r.findIndex(x=>x[0]==='Ngày');if(hi<0)continue;const iS=r[hi].indexOf('Chi phí');
  for(let i=hi+1;i<r.length;i++){const x=r[i];if(!x||x[0]==null)continue;const d=iso(x[0]);if(!d)continue;if(rg&&!/adsplus/i.test(f)&&(d<rg[0]||d>rg[1]))continue;gAcc[acc][d]=Number(x[iS])||0}}
for(const acc of ['ecom','adsplus'])for(const d in gAcc[acc]){add(out.google,d,gAcc[acc][d]);const m=d.slice(0,7);const c=out.googleCamp[m]=out.googleCamp[m]||{};const k=acc==='ecom'?'Tài khoản Ecom':'Tài khoản adsplus';c[k]=(c[k]||0)+gAcc[acc][d]}
fs.writeFileSync('cost.json',JSON.stringify(out));
// compare with uploaded
const vm=require('vm');const w={};vm.runInNewContext(fs.readFileSync(process.env.BS_HOME+'/assets/ov_asset_a58bebe0.js','utf8'),{window:w});const B=w.BSDATA;
const names=['shopeeOn','offsite','tiktok','fb','google'];
const mon={};
B.dates.forEach((d,i)=>{names.forEach((n,k)=>{const m=d.slice(0,7);const o=mon[m]=mon[m]||{};o[n]=o[n]||[0,0];o[n][0]+=B.spendSrc[i][k];o[n][1]+=out[n][d]||0})});
for(const m in mon){console.log(m,names.map(n=>n.padEnd(8)+Math.round(mon[m][n][0]/1e3)+'k/'+Math.round(mon[m][n][1]/1e3)+'k').join('  '))}
