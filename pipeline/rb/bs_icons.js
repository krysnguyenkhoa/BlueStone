;(function(){
  var S='fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
  var I={
    money:'<circle cx="12" cy="12" r="10"/><path d="M15 9.2c-.6-.8-1.6-1.2-3-1.2-1.7 0-3 .8-3 2s1.3 1.8 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.4-.4-3-1.2M12 5.8V8M12 16v2.2"/>',
    bag:'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    check:'<circle cx="12" cy="12" r="10"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
    tag:'<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.3"/>',
    wallet:'<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v3"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    percent:'<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    trend:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    cancel:'<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    pie:'<path d="M21.2 15.9A10 10 0 1 1 8 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
    funnel:'<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    gauge:'<path d="m12 14 4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
    updown:'<path d="m21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16"/>',
    cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
    live:'<circle cx="12" cy="12" r="2"/><path d="M4.9 19.1a10 10 0 0 1 0-14.2M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M19.1 4.9a10 10 0 0 1 0 14.2"/>',
    video:'<path d="m22 8-6 4 6 4z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    pkg:'<path d="m7.5 4.3 9 5.2"/><path d="M21 8v8a2 2 0 0 1-1 1.7l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.7l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
    receipt:'<path d="M5 2h14v20l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 7h6M9 11h6"/>',
    chart:'<path d="M3 3v18h18"/><path d="M7 15v3M12 9v9M17 12v6"/>'
  };
  var RULES=[
    [/cancel|hủy/i,'cancel'],[/run-rate/i,'gauge'],[/^cir|\bcir\b/i,'percent'],[/roas/i,'trend'],[/cpo/i,'receipt'],
    [/cr orders|conversion|cvr/i,'funnel'],[/visit|impression/i,'eye'],[/buyer/i,'users'],[/live/i,'live'],[/video/i,'video'],[/sku/i,'pkg'],
    [/nmv\s*\/\s*gmv|nmv%rate/i,'pie'],[/gap/i,'updown'],[/days/i,'cal'],[/months on|target|% hit|% of monthly/i,'target'],
    [/spend|cost|chi phí/i,'wallet'],[/aov/i,'tag'],[/(completed|paid)\s*orders?/i,'check'],[/orders?/i,'bag'],[/gmv|nmv|revenue/i,'money'],[/phủ/i,'layers']
  ];
  function pick(l){l=String(l||'');for(var i=0;i<RULES.length;i++){if(RULES[i][0].test(l))return I[RULES[i][1]]}return I.chart}
  window.BSICON=function(label){return '<svg viewBox="0 0 24 24" width="18" height="18" '+S+' aria-hidden="true">'+pick(label)+'</svg>'};
  var busy=false;
  function enhance(){
    if(busy||!document.body)return;busy=true;
    try{
      var els=document.querySelectorAll('div[style*="tracking-label"]');
      for(var i=0;i<els.length;i++){
        var e=els[i],st=e.getAttribute('style')||'';
        if(!/uppercase/.test(st)||e.querySelector('.bsi'))continue;
        var p=e.parentElement;if(!p||!/border-radius/.test(p.getAttribute('style')||''))continue;
        var t=(e.textContent||'').trim();if(!t||t.length>42||e.children.length>1)continue;
        var sp=document.createElement('span');sp.className='bsi';sp.innerHTML=window.BSICON(t);
        e.insertBefore(sp,e.firstChild);e.classList.add('bsl');
      }
    }catch(err){}
    busy=false;
  }
  var tm=null;function sched(){if(tm)return;tm=setTimeout(function(){tm=null;enhance()},60)}
  function start(){enhance();try{new MutationObserver(sched).observe(document.body,{childList:true,subtree:true})}catch(e){}setTimeout(enhance,400);setTimeout(enhance,1500)}
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
