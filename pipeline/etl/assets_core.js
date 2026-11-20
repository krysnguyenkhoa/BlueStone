const fs=require('fs');
const {dates,rows,spendSrc}=require('./core.json');const C=require('./cost.json');const K=require('./kpi.json');const S=require('./sku.json');
const LAST=dates[dates.length-1];
const vn=d=>d.slice(8)+'/'+d.slice(5,7)+'/'+d.slice(0,4);
const chs=[['Shopee','Shopee','var(--channel-shopee)',true],['Tiktok Shop','Tiktok Shop','var(--channel-tiktok)',true],['Harasocial','Harasocial · Facebook','var(--channel-facebook)',true],['Website','Website · Google','var(--channel-google)',true],['Lazada','Lazada · Tiki','var(--channel-lazada)',false],['Khác','Khác','var(--channel-other)',false]];
const lastSales={},lastSpend={};
rows.forEach(x=>{const d=dates[x[0]];if((x[3]||x[5])&&(!lastSales[x[1]]||d>lastSales[x[1]]))lastSales[x[1]]=d;if(x[2]>0&&(!lastSpend[x[1]]||d>lastSpend[x[1]]))lastSpend[x[1]]=d});
const channels=chs.map((c,i)=>({key:c[0],name:c[1],fill:c[2],spendable:c[3],last:lastSales[i]||LAST,spendLast:c[3]?(lastSpend[i]||null):null}));
const camp={};
const mk=m=>m;
for(const m of Object.keys(C.shopeeOnCamp).filter(m=>m>='2026-01'&&m<=LAST.slice(0,7))){camp[m]=camp[m]||{};camp[m]['Shopee']={...C.shopeeOnCamp[m]}}
const offM={};for(const d in C.offsite){if(d<='2026-01-01'&&d>LAST)continue;if(d>LAST)continue;const m=d.slice(0,7);offM[m]=(offM[m]||0)+C.offsite[d]}
// tiktok/facebook/google camps limited to LAST (month totals from daily)
const fbM={},gM={};
for(const d in C.fb){if(d<'2026-01-01'||d>LAST)continue;const m=d.slice(0,7);fbM[m]=(fbM[m]||0)+C.fb[d]}
const ttCamp={};
for(const m of Object.keys(C.tiktokCamp).filter(m=>m>='2026-01'&&m<=LAST.slice(0,7)))ttCamp[m]=C.tiktokCamp[m];
for(const m in offM){if(offM[m]>0){camp[m]=camp[m]||{};(camp[m]['Shopee']=camp[m]['Shopee']||{})['Shopee Offsite']=offM[m]}}
for(const m in ttCamp){camp[m]=camp[m]||{};camp[m]['Tiktok Shop']={...ttCamp[m]}}
for(const m in fbM){camp[m]=camp[m]||{};camp[m]['Harasocial']={'Khác':fbM[m]}}
for(const m of Object.keys(C.googleCamp).filter(m=>m>='2026-01'&&m<=LAST.slice(0,7))){camp[m]=camp[m]||{};camp[m]['Website']={...C.googleCamp[m]}}
const BSDATA={source:'Order_data/'+(process.env.BS_ORDERFILE||'')+' · Cost_Shopee (Onsite + Offsite) · Cost_Tiktok · Cost_Facebook · Cost_Google',dataFrom:vn(dates[0]),dataTo:vn(LAST),lastIso:LAST,dates,channels,rows,camp,spendSrc,spendSrcKeys:['Shopee Onsite (top-ups)','Shopee Offsite','TikTok (Amount)','Facebook','Google']};
fs.writeFileSync('out/BSDATA.js','window.BSDATA = '+JSON.stringify(BSDATA)+';\n');
const kpiTail='window.BSDailyKpiFor = function (m) { var D = window.BSDAILYKPI; return (D && D.byMonth && D.byMonth[m]) || null; };\n';
fs.writeFileSync('out/KPI.js','window.BSTARGETS = '+JSON.stringify(K.TG)+';\nwindow.BSDAILYKPI = '+JSON.stringify(K.KPI)+';\n'+kpiTail);
fs.writeFileSync('out/DAILYTRACK.js','window.BSDAILYTRACK = '+JSON.stringify(K.DT)+';\n');
fs.writeFileSync('out/SKUNEW.js','window.BSSKUNEW='+JSON.stringify(S)+';\n');
console.log(channels.map(c=>c.key+' last '+c.last+' spend '+c.spendLast).join('\n'));console.log(Object.keys(camp).join(' '));
for(const f of fs.readdirSync('out'))console.log(f,fs.statSync('out/'+f).size);
