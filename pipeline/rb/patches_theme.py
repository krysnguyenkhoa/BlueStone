# Theme: pastel iridescent glass (reference: "08 — Dashboard / Stats")
THEME = r'''
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
:root{
  --font-heading:Inter,"Segoe UI",system-ui,-apple-system,Roboto,Arial,sans-serif;
  --font-body:Inter,"Segoe UI",system-ui,Arial,sans-serif;
  --font-numeric:Inter,"Segoe UI",system-ui,Arial,sans-serif;
  --font-heading-weight:700;
  --color-bg:#ffffff; --surface-page:#ffffff; --color-surface:#f1eeff;
  --surface-card:rgba(255,255,255,0.58); --surface-inset-grad:rgba(255,255,255,0.55); --surface-inset:rgba(255,255,255,0.5); --surface-notice:rgba(255,255,255,0.58);
  --surface-rail:rgba(255,255,255,0.6);
  --color-text:#0b1530; --text-primary:#0b1530; --text-secondary:#334155; --text-muted:#52627d; --text-faint:#6b7c96;
  --color-accent:#2563eb; --color-accent-2:#ff8fb8;
  --color-divider:rgba(37,99,235,0.18); --border-hairline:rgba(37,99,235,0.14); --border-strong:rgba(37,99,235,0.28);
  --color-neutral-100:#0b1530; --color-neutral-200:#0b1530; --color-neutral-300:#334155; --color-neutral-400:#475569; --color-neutral-500:#5b6b85; --color-neutral-600:#5b6b85;
  --color-neutral-700:#d6e4f8; --color-neutral-800:#ebe8fa; --color-neutral-900:#ffffff;
  --color-accent-100:#2b1a7a; --color-accent-200:#3d27a8; --color-accent-300:#2563eb; --color-accent-400:#2f6df0; --color-accent-500:#60a5fa; --color-accent-600:#b9a5ff; --color-accent-700:#d9ceff; --color-accent-800:#ebe5ff; --color-accent-900:#f6f3ff;
  --color-accent-2-100:#a1245a; --color-accent-2-200:#d6457f; --color-accent-2-300:#ff6fa4; --color-accent-2-400:#ff8fb8; --color-accent-2-500:#ffb0cf; --color-accent-2-600:#ffc8dd; --color-accent-2-700:#ffdbe9; --color-accent-2-800:#ffeaf2; --color-accent-2-900:#fff5f9;
  --color-good:#14a25a; --color-alert:#e0364f; --color-alert-soft:#e0364f; --color-alert-deep:#b32840; --color-alert-tint:#ffe3e8; --color-warn:#d9822b; --color-warn-soft:#8a5a00; --color-warn-tint:#fff3c9;
  --text-positive:#12924f; --text-negative:#d6334f; --text-warning:#8a5a00; --text-on-accent:#ffffff;
  --surface-alert:rgba(224,54,79,0.12); --surface-warn:rgba(217,130,43,0.16); --surface-good:rgba(20,162,90,0.14);
  --channel-shopee:#ff7a59; --channel-tiktok:#3b2f8f; --channel-tiktok-ink:#FFFFFF; --channel-facebook:#5b8cff; --channel-google:#35c9b5; --channel-lazada:#a97bff; --channel-other:#b8b6d0;
  --series-nmv:#2f6df0; --series-cost:#8b8fb8; --axis-line:rgba(37,99,235,0.2); --band-fill:#ebe5ff;
  --databar-up:rgba(224,54,79,0.18); --databar-down:rgba(20,162,90,0.18); --databar-cost:rgba(37,99,235,0.2);
  --radius-sm:12px; --radius-md:22px; --radius-lg:30px; --radius-pill:999px;
  --shadow-sm:0 14px 40px rgba(37,99,235,0.14), inset 0 1px 0 #fff;
  --shadow-md:0 20px 56px rgba(37,99,235,0.20), inset 0 1px 0 #fff;
  --shadow-lg:0 26px 70px rgba(37,99,235,0.24);
  --ring-selected:none; --bar-track:10px; --bar-track-sm:8px;
}
html,body{font-family:var(--font-body);line-height:1.45;background:#ffffff;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;font-variant-numeric:tabular-nums}
body{color:#0b1530}
div[style*="min-height"][style*="100vh"]{background:#ffffff !important}
.tabular{font-variant-numeric:tabular-nums;font-weight:500}
[style*="tracking-label"]{letter-spacing:0.05em !important}
.bsl{display:flex !important;align-items:center;gap:9px}
.bsi{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:11px;flex:none;background:linear-gradient(145deg,#ffffff,#cfe2ff);color:#2563eb;box-shadow:0 5px 12px rgba(37,99,235,0.20),inset 0 1px 0 #fff;text-transform:none}
.bsi svg{display:block}
[style*="gradient"] .bsi{background:rgba(255,255,255,0.24);color:#ffffff;box-shadow:inset 0 1px 0 rgba(255,255,255,0.55)}
svg polyline,svg path,svg line{stroke-linejoin:round;stroke-linecap:round}
svg rect{rx:6;ry:6}
/* frosted cards from the other pages */
[style*="--surface-card"],[style*="--surface-notice"]{
  background-image:linear-gradient(115deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.9) 24%,rgba(255,255,255,0) 42%),linear-gradient(150deg,#d3e5ff 0%,#e9f2ff 50%,#c9deff 100%) !important;
  background-color:#e6f0ff !important;
  -webkit-backdrop-filter:none;backdrop-filter:none;
  border:1px solid #c5dbfa !important;box-shadow:0 10px 28px rgba(37,99,235,0.10),inset 0 1px 0 #fff !important}
[style*="--surface-inset"]{background:rgba(255,255,255,0.78) !important;background-image:none !important;border:1px solid #d5e5fb !important;-webkit-backdrop-filter:none;backdrop-filter:none}
[style*="3px solid"]{border-top-width:1px !important}
/* hero tiles on the other pages: blue gradient, white ink */
[style*="rgb(28, 167, 236)"][style*="gradient"],[style*="1CA7EC"][style*="gradient"]{
  background:radial-gradient(420px 220px at 12% 0%,rgba(255,255,255,0.38),transparent 62%),linear-gradient(145deg,#5aa2ff 0%,#2f6df0 55%,#1d4ed8 100%) !important;
  border:1px solid rgba(255,255,255,0.7) !important}
th{color:#475569 !important;font-weight:600 !important;border-bottom:1px solid rgba(37,99,235,0.25) !important;letter-spacing:0.03em}
td{border-bottom:1px solid rgba(37,99,235,0.10) !important}
h1{font-family:var(--font-heading) !important;font-weight:700 !important;font-size:40px !important;color:#0b1530;letter-spacing:-0.025em;line-height:1.1;background:none;-webkit-text-fill-color:#0b1530}
h2,h3{font-family:var(--font-heading) !important;font-weight:700 !important;letter-spacing:-0.015em}
button[style*="--color-divider"]{background:#ffffff !important;border:1px solid #c5dbfa !important;color:#1e293b !important;font-weight:600 !important;box-shadow:0 4px 12px rgba(37,99,235,0.10) !important}
button[style*="ring-selected"]{background:linear-gradient(135deg,#5aa2ff,#2563eb) !important;border-color:transparent !important;color:#FFFFFF !important;box-shadow:0 6px 16px rgba(37,99,235,0.35) !important}
/* nav rail: frosted white */
aside{background:linear-gradient(170deg,#ffffff 0%,#eef5ff 100%) !important;margin:14px 0 14px 14px;border-radius:26px !important;border:1px solid #c5dbfa !important;box-shadow:0 14px 36px rgba(37,99,235,0.12),inset 0 1px 0 #fff !important;
  --color-accent:#2563eb;--color-text:#1e293b;--text-primary:#0b1530;--text-secondary:#334155;--text-muted:#52627d;--text-faint:#6b7c96;--state-hover:rgba(37,99,235,0.08);--border-hairline:rgba(37,99,235,0.14);color:#0b1530}
aside a{color:#1e293b !important}
aside a:hover{background:rgba(37,99,235,0.08) !important}
[style*="--surface-notice"] [style*="--text-on-accent"],[style*="--surface-notice"][style*="--text-on-accent"]{color:#334155 !important}
div[style*="min-height"][style*="100vh"]{max-width:1760px;margin-left:auto !important;margin-right:auto !important}

main{min-width:0 !important}
div:has(>button[style*="--color-divider"]){flex-wrap:wrap !important}
main>*{min-width:0}
/* narrow frames (chat preview, tablet, phone) */
@media (max-width:1100px){
  div[style*="min-height"][style*="100vh"]{flex-direction:column !important}
  aside{width:auto !important;height:auto !important;min-height:0 !important;flex:0 0 auto !important;margin:10px 10px 0 10px !important;padding:14px 16px !important;border-radius:24px !important;flex-direction:column !important;gap:8px !important}
  aside nav{flex-direction:row !important;flex-wrap:wrap !important;gap:4px !important}
  aside nav a{padding:6px 12px !important;border-radius:999px !important;background:#ffffff;border:1px solid #d5e5fb}
  aside nav a span:last-child{display:none}
  aside nav ~ *{display:none !important}
  main{padding-left:16px !important;padding-right:16px !important;max-width:100vw;box-sizing:border-box}
  main{min-width:0 !important;width:100% !important}
  div:has(>button[style*="--color-divider"]){flex-wrap:wrap !important;justify-content:flex-start !important}
  header,main>div:first-child{flex-wrap:wrap !important}
  h1{font-size:38px !important}
}
@media (max-width:560px){ h1{font-size:32px !important} }
/* bento: efficiency row on the other pages */
[style*="repeat(7"]{grid-template-columns:repeat(4,minmax(0,1fr)) !important}
[style*="repeat(7"]>:first-child{grid-column:span 2}
'''
def _css(): return '<style>'+THEME+'</style>'
P=[]
for pg in ['ov','ovkpi','daily','shopee','tiktok','pp','raw']:
    old="a:hover{color:var(--color-accent-300)}</style>"
    P.append((pg,old,old+_css(),1))
    P.append((pg,'brand="BlueStone" product="Performance"','brand="" product="eCom report"',1))
P.append(('ov',"'Scale &amp; Efficiency theo kênh","'Scale & Efficiency theo kênh",1))
