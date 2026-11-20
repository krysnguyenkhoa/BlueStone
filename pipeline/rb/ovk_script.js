class Component extends DCLogic {
  __bsTick = (() => { const t = () => { try { this._sets = null; this.forceUpdate(); } catch (e) {} }; [300, 1200, 3000, 6000].forEach(ms => setTimeout(t, ms)); })();
  state = { ch: null, mo: 'ytd', dtab: 'nmv' };
  CH = [
    { key: 'total', label: 'Total Ecom', kpi: null, act: null },
    { key: 'shopee', label: 'Shopee', kpi: 'Shopee', act: [0] },
    { key: 'tts', label: 'TikTok Shop', kpi: 'Tiktok Shop', act: [1] },
    { key: 'ws', label: 'Website/Social', kpi: 'Website/Social', act: [2, 3] },
    { key: 'lz', label: 'Lazada · Tiki', kpi: 'Lazada', act: [4] },
    { key: 'seller', label: 'Seller', kpi: 'Seller', act: [] }
  ];
  D() { return window.BSDATA || { dates: [], rows: [], channels: [], lastIso: '2026-09-23' }; }
  TM() { return (window.BSTARGETS || {}).months || {}; }
  dataReady() { const D = this.D(); return !!(D.rows && D.rows.length && D.dates && D.dates.length && window.BSTARGETS); }
  esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  money(v) {
    if (v == null || !isFinite(v)) return '—';
    const a = Math.abs(v), s = v < 0 ? '−' : '';
    if (a >= 1e9) return s + (a / 1e9).toFixed(2) + 'B₫';
    if (a >= 1e6) return s + (a / 1e6).toFixed(1) + 'M₫';
    if (a >= 1e3) return s + (a / 1e3).toFixed(0) + 'K₫';
    return s + Math.round(a) + '₫';
  }
  pct(v, d) { return v == null || !isFinite(v) ? '—' : (v * 100).toFixed(d == null ? 0 : d) + '%'; }
  short(v) { const a = Math.abs(v); if (a >= 1e9) return +(v / 1e9).toFixed(2) + 'B'; if (a >= 1e6) return +(v / 1e6).toFixed(0) + 'M'; if (a >= 1e3) return +(v / 1e3).toFixed(0) + 'K'; return String(Math.round(v)); }
  niceMax(v) { if (!(v > 0)) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
  dm(iso) { return iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : '—'; }
  chan() { return this.CH.find(c => c.key === (this.state.ch || this.props.channel || 'total')) || this.CH[0]; }
  // ---- data ------------------------------------------------------------------------------------
  actuals(act) {
    const D = this.D(), out = {};
    if (act && !act.length) return out;
    for (const r of D.rows) {
      if (act && act.indexOf(r[1]) < 0) continue;
      const m = +D.dates[r[0]].slice(5, 7); const o = out[m] || (out[m] = { n: 0, s: 0, g: 0, ld: 0, od: 0 });
      o.n += r[3]; o.s += r[2]; o.g += r[4]; o.ld += r[5]; o.od += r[6];
    }
    return out;
  }
  kpi(c, m, dMax) {
    const T = this.TM()[m]; if (!T) return null;
    const o = c.kpi ? (T.ch || {})[c.kpi] : T; if (!o || !o.nmv) return null;
    const res = { n: o.nmv, s: o.spend, cir: o.cir != null ? o.cir : (o.nmv ? o.spend / o.nmv : null), nd: o.nmv, sd: o.spend };
    if (dMax) {
      const B = window.BSDailyKpiFor ? window.BSDailyKpiFor(m) : null;
      if (B) {
        const src = c.kpi ? (B.ch || {})[c.kpi] : null; let n = 0, s = 0;
        B.days.forEach((d, j) => { if (+d.date.slice(8, 10) > dMax) return; if (src) { n += src.days[j] || 0; s += src.spendDays[j] != null ? src.spendDays[j] : (src.days[j] || 0) * (res.cir || 0); } else { n += d.nmv || 0; s += d.spend || 0; } });
        res.nd = n; res.sd = s;
      } else { const dim = new Date(Date.UTC(2026, m, 0)).getUTCDate(); res.nd = o.nmv * dMax / dim; res.sd = o.spend * dMax / dim; }
    }
    return res;
  }
  dimOf(m) { return new Date(Date.UTC(2026, m, 0)).getUTCDate(); }
  series(c) {
    const D = this.D(), last = D.lastIso || '2026-09-23', lm = +last.slice(5, 7), ld = +last.slice(8, 10);
    const partial = ld < this.dimOf(lm);
    const A = this.actuals(c.act), out = [];
    for (let m = 1; m <= 12; m++) {
      const future = m > lm, isP = m === lm && partial;
      const k = this.kpi(c, m, isP ? ld : null), a = future ? null : (A[m] || (c.act && !c.act.length ? null : { n: 0, s: 0, g: 0, ld: 0, od: 0 }));
      out.push({ m, future, partial: isP, ld, k, a,
        att: k && a && k.nd ? a.n / k.nd : null, use: k && a && k.sd ? a.s / k.sd : null, cir: a && a.n && a.s > 0 ? a.s / a.n : null });
    }
    return { rows: out, lm, ld, partial };
  }
  // tập hợp số liệu của kỳ đang chọn (YTD hoặc một tháng)
  period(c, S) {
    const mo = this.state.mo, done = S.rows.filter(r => !r.future);
    let rows = mo === 'ytd' ? done : done.filter(r => 'm' + r.m === mo);
    const ytd = mo === 'ytd' || !rows.length; if (!rows.length) rows = done;
    const sum = f => rows.reduce((t, r) => t + (f(r) || 0), 0), hasA = !(c.act && !c.act.length);
    const P = { rows, ytd, hasA, S, c, aN: hasA ? sum(r => r.a && r.a.n) : null, aS: hasA ? sum(r => r.a && r.a.s) : null, aG: hasA ? sum(r => r.a && r.a.g) : null,
      aLd: hasA ? sum(r => r.a && r.a.ld) : null, aOd: hasA ? sum(r => r.a && r.a.od) : null,
      kNd: sum(r => r.k && r.k.nd), kN: sum(r => r.k && r.k.n), kSd: sum(r => r.k && r.k.sd), kS: sum(r => r.k && r.k.s) };
    P.hasK = rows.some(r => r.k) && P.kNd > 0;
    P.att = hasA && P.kNd ? P.aN / P.kNd : null; P.use = hasA && P.kSd ? P.aS / P.kSd : null;
    P.cir = hasA && P.aN && P.aS > 0 ? P.aS / P.aN : null; P.kCir = P.kNd ? P.kSd / P.kNd : null;
    P.partial = rows.some(r => r.partial);
    P.yearK = S.rows.reduce((t, r) => t + (r.k ? r.k.n : 0), 0);
    P.m = ytd ? null : rows[0].m;
    P.label = ytd ? 'YTD T1–' + this.dm(this.D().lastIso) : 'T' + rows[0].m + (rows[0].partial ? '* (1–' + S.ld + ')' : '');
    const lb = this.dm(this.D().lastIso); P.til = ytd || P.partial ? 'đến ' + lb : 'cả tháng'; P.moc = ytd || P.partial ? 'mốc ' + lb : 'KPI tháng';
    P.short = ytd ? 'YTD' : 'T' + rows[0].m + (rows[0].partial ? '*' : '');
    return P;
  }
  lvl(att) { return att == null ? '' : att >= 1 ? 'g' : att >= 0.7 ? 'y' : 'r'; }
  // ---- helpers markup --------------------------------------------------------------------------
  tipAttr(html) { return ' data-tip="' + this.esc(html) + '"'; }
  tipT(title, rows) {
    return '<div class="ox-tt">' + this.esc(title) + '</div>' + rows.filter(Boolean).map(r => '<div class="ox-tr' + (r[3] ? ' ' + r[3] : '') + '"><i style="background:' + (r[2] || 'transparent') + '"></i><span>' + this.esc(r[0]) + '</span><b>' + this.esc(r[1]) + '</b><em></em></div>').join('');
  }
  panel(cls, title, sub, body, foot, right) {
    return '<div class="ox-panel ' + cls + '"><div class="ox-ph"><div><div class="ox-pt">' + title + '</div>' + (sub ? '<div class="ox-ps">' + sub + '</div>' : '') + '</div><div class="ox-pr">' + (right || '') + '</div></div>' + body + (foot ? '<div class="ox-foot">' + foot + '</div>' : '') + '</div>';
  }
  legend(items) { return '<div class="ox-leg">' + items.map(i => '<span><i style="background:' + i.c + (i.line ? ';height:3px;margin-top:5px' : '') + '"></i>' + this.esc(i.t) + '</span>').join('') + '</div>'; }
  axT(x, t) { return '<text x="' + x + '" y="12" class="ox-axt">' + this.esc(t) + '</text>'; }
  isOpen(k) { return !(this._fold && this._fold[k]); }
  foldBtn(k) { const o = this.isOpen(k); return '<button type="button" class="ox-fold" data-fold="' + k + '" aria-expanded="' + o + '"><span class="ox-ft">' + (o ? 'Thu gọn' : 'Mở rộng') + '</span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>'; }
  ic(n) { return '<span class="bsi">' + (window.BSICON ? window.BSICON(n) : '') + '</span>'; }
  pill(txt, cls) { return '<span class="ox-pill ' + (cls || 'flat') + '">' + txt + '</span>'; }
  signedPct(v, d) { return v == null || !isFinite(v) ? '—' : (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(d == null ? 1 : d) + '%'; }
  // ---- cards --------------------------------------------------------------------------------------
  cardsHtml(P) {
    const m = this.money.bind(this), p = this.pct.bind(this), c = P.c, S = P.S, lbl = this.dm(this.D().lastIso);
    const dim = this.dimOf(S.lm), single = !P.ytd, partialM = single && P.partial;
    const noA = !P.hasA, na = '—';
    const card = (grp, icon, label, value, pillTxt, pillCls, sub, extra) => '<div class="ox-card g-' + grp + '"><div class="ox-cl">' + this.ic(icon) + label + '</div><div class="ox-cv">' + value + '</div><div class="ox-cd">' + (pillTxt ? this.pill(pillTxt, pillCls) : '') + (sub ? '<span class="ox-cp">' + sub + '</span>' : '') + '</div>' + (extra ? '<div class="ox-ce">' + extra + '</div>' : '') + '</div>';
    const cards = [];
    // 1 NMV
    const left = P.kNd - (P.aN || 0);
    let ex1 = '';
    if (P.hasK && P.hasA) {
      ex1 = left > 0 ? 'Còn thiếu ' + m(left) + ' đến ' + P.moc : 'Vượt ' + P.moc + ' ' + m(-left);
      if (partialM && P.kN > P.aN) { const dl = dim - S.ld; if (dl > 0) ex1 += ' · cần ' + m((P.kN - P.aN) / dl) + '/ngày trong ' + dl + ' ngày còn lại'; }
      else if (P.ytd) ex1 += ' · KPI cả năm T1–T12 ' + m(P.yearK);
    }
    cards.push(card('rev', 'nmv', 'NMV · ' + P.short, noA ? na : m(P.aN), P.hasK && P.hasA ? 'Đạt ' + p(P.att) + ' KPI ' + (P.ytd || P.partial ? 'đến ngày' : 'tháng') : (noA ? 'Chưa có đơn hàng' : 'Chưa có KPI'), P.att == null ? 'flat' : P.att >= 1 ? 'up' : 'down', P.hasK ? 'KPI ' + (P.ytd || P.partial ? 'đến ' + lbl : 'tháng') + ' ' + m(P.kNd) : '', ex1));
    // 2 dự kiến / đạt KPI cả kỳ
    if (partialM && P.hasA && P.kN) { const proj = P.aN * dim / S.ld; cards.push(card('rev', 'run-rate', 'Dự kiến cả tháng', m(proj), p(proj / P.kN) + ' KPI tháng', proj >= P.kN ? 'up' : 'down', 'KPI tháng ' + m(P.kN), 'Run-rate = NMV × ' + (dim / S.ld).toFixed(2) + ' · ' + (proj >= P.kN ? 'dự kiến vượt ' + m(proj - P.kN) : 'dự kiến hụt ' + m(P.kN - proj)))); }
    else if (single) cards.push(card('rev', 'target', 'Đạt KPI cả tháng', noA || !P.kN ? na : p(P.aN / P.kN), P.hasK && P.hasA ? (P.aN >= P.kN ? 'Đạt' : 'Chưa đạt') : 'Chưa có KPI', P.aN >= P.kN ? 'up' : 'down', 'KPI tháng ' + m(P.kN), P.hasA && P.kN ? (P.aN >= P.kN ? 'Vượt ' + m(P.aN - P.kN) : 'Thiếu ' + m(P.kN - P.aN)) : ''));
    else cards.push(card('rev', 'target', 'Đạt KPI cả năm', noA || !P.yearK ? na : p(P.aN / P.yearK), '', 'flat', 'KPI năm T1–T12 ' + m(P.yearK), P.hasA && P.yearK ? 'Còn thiếu ' + m(Math.max(0, P.yearK - P.aN)) + ' cho cả năm' : ''));
    // 3 spend
    cards.push(card('cost', 'spend', 'Spend · ' + P.short, noA ? na : m(P.aS), P.use != null ? 'Dùng ' + p(P.use) + ' ngân sách' : 'Chưa có KPI', P.use == null ? 'flat' : P.use <= 1 ? 'up' : 'down', P.kSd ? 'KPI Spend đến ngày ' + m(P.kSd) : '', P.use != null ? (P.use <= 1 ? 'Còn dư ' + m(P.kSd - P.aS) : 'Vượt ' + m(P.aS - P.kSd)) : ''));
    // 4 CIR
    const dpp = P.cir != null && P.kCir != null ? (P.cir - P.kCir) * 100 : null;
    cards.push(card('cost', 'cir', 'CIR · ' + P.short, noA ? na : p(P.cir, 2), dpp == null ? 'Chưa có target' : (dpp <= 0 ? '▼ ' : '▲ +') + dpp.toFixed(2) + 'pp so với target', dpp == null ? 'flat' : dpp <= 0 ? 'up' : 'down', P.kCir != null ? 'Target ' + p(P.kCir, 2) : '', 'CIR = Spend / NMV'));
    // 5 ROAS
    const roas = P.hasA && P.aS ? P.aN / P.aS : null, kRoas = P.kSd ? P.kNd / P.kSd : null;
    const dr = roas != null && kRoas ? roas / kRoas - 1 : null;
    cards.push(card('cost', 'roas', 'ROAS · ' + P.short, roas == null ? na : '×' + roas.toFixed(1), dr == null ? 'Chưa có target' : (dr >= 0 ? '▲ ' : '▼ ') + this.signedPct(dr, 1).slice(1) + ' so với target', dr == null ? 'flat' : dr >= 0 ? 'up' : 'down', kRoas ? 'Target ×' + kRoas.toFixed(1) : '', 'ROAS = NMV / Spend'));
    // 6 tháng đạt KPI
    const full = S.rows.filter(r => !r.future && !r.partial && r.k && r.att != null), hit = full.filter(r => r.att >= 1).length, cur = S.rows.find(r => r.partial);
    cards.push(card('q', 'target', 'Tháng đạt KPI NMV', full.length ? hit + '/' + full.length : na, full.length ? p(hit / full.length) + ' số tháng đủ' : 'Chưa có KPI', full.length && hit / full.length >= 0.5 ? 'up' : 'down', 'Chỉ tính tháng đủ ngày', cur && cur.att != null ? 'T' + cur.m + ' đang chạy: ' + p(cur.att) + ' KPI đến ngày' : ''));
    // 7 CPO, 8 cancel
    const cpo = P.hasA && P.aOd ? P.aS / P.aOd : null;
    cards.push(card('cost', 'cpo', 'CPO · ' + P.short, cpo == null ? na : m(cpo), 'Chưa có KPI', 'flat', P.hasA ? 'Spend / ' + (P.aOd || 0).toLocaleString('en-US') + ' đơn không hủy' : ''));
    const canc = P.hasA && P.aG ? 1 - P.aN / P.aG : null;
    cards.push(card('q', 'cancel', 'Cancel rate · ' + P.short, canc == null ? na : p(canc, 1), 'Chưa có KPI', 'flat', P.hasA ? 'GMV hủy ' + m(P.aG - P.aN) : '', 'Cancel rate = 1 − NMV / GMV'));
    return '<section class="ok-cards">' + cards.join('') + '</section>';
  }
  // ---- kết luận + cảnh báo ------------------------------------------------------------------------
  chanPeriods() { return this.CH.slice(1).map(ch => { const S = this.series(ch); return { ch, S, P: this.period(ch, S) }; }); }
  concl(P, chp) {
    const m = this.money.bind(this), p = this.pct.bind(this), lbl = this.dm(this.D().lastIso), c = P.c;
    let t, lv = 'y';
    if (!P.hasA) { t = c.label + ': chưa có dữ liệu đơn hàng, chỉ có KPI NMV.'; }
    else if (!P.hasK) { t = c.label + ' · ' + P.short + ': NMV ' + m(P.aN) + ' · chưa có KPI NMV cho kỳ này.'; }
    else {
      const left = P.kNd - P.aN; lv = this.lvl(P.att);
      t = c.label + ' · ' + P.short + ': đạt ' + p(P.att) + ' KPI ' + P.til + ' · ' + (left > 0 ? 'còn thiếu ' + m(left) : 'vượt ' + m(-left));
      if (c.key === 'total') { const w = chp.filter(x => x.P.att != null).sort((a, b) => a.P.att - b.P.att)[0]; if (w && w.P.att < 1) t += ' · chậm nhất: ' + w.ch.label + ' ' + p(w.P.att); }
      if (P.cir != null && P.kCir != null) t += ' · CIR ' + p(P.cir, 2) + (P.cir <= P.kCir ? ' trong target ' : ' vượt target ') + p(P.kCir, 2);
    }
    return '<div class="ok-concl ' + lv + '"><span class="ok-cd"></span>' + this.esc(t) + '</div>';
  }
  alerts(P, chp) {
    const m = this.money.bind(this), p = this.pct.bind(this), lbl = this.dm(this.D().lastIso), c = P.c, out = [], S = P.S;
    const nmvA = (name, Q) => { if (Q.att == null || Q.att >= 0.95) return; out.push({ lv: Q.att < 0.5 ? 'Critical' : 'Watch', t: name + ' đạt ' + p(Q.att) + ' KPI ' + Q.til, d: 'NMV ' + m(Q.aN) + ' / ' + Q.moc + ' ' + m(Q.kNd) + ' · còn thiếu ' + m(Q.kNd - Q.aN) + ' · ' + Q.short }); };
    const cirA = (name, Q) => { if (Q.cir == null || Q.kCir == null || !Q.aS || Q.cir <= Q.kCir) return; out.push({ lv: Q.cir > Q.kCir * 1.5 ? 'Critical' : 'Watch', t: name + ' vượt target CIR ' + p(Q.kCir, 1) + ' — ' + p(Q.cir, 1), d: 'Spend ' + m(Q.aS) + ' · NMV ' + m(Q.aN) + ' · ' + Q.short }); };
    if (c.key === 'total') { chp.forEach(x => nmvA(x.ch.label, x.P)); chp.forEach(x => cirA(x.ch.label, x.P)); }
    else {
      nmvA(c.label, P); cirA(c.label, P);
      const full = S.rows.filter(r => !r.future && !r.partial && r.k && r.att != null), bad = full.filter(r => r.att < 1);
      if (full.length && bad.length) out.push({ lv: bad.length > full.length / 2 ? 'Watch' : 'Info', t: bad.length + '/' + full.length + ' tháng chưa đạt KPI NMV', d: bad.map(r => 'T' + r.m + ' ' + p(r.att)).join(' · ') });
      const ov = S.rows.filter(r => !r.future && r.cir != null && r.k && r.k.cir != null && r.a && r.a.s > 0 && r.cir > r.k.cir);
      if (ov.length) out.push({ lv: 'Info', t: ov.length + ' tháng CIR vượt target', d: ov.map(r => 'T' + r.m + ' ' + p(r.cir, 1) + ' > ' + p(r.k.cir, 1)).join(' · ') });
    }
    if (!P.hasA) out.push({ lv: 'Info', t: c.label + ' chưa có dữ liệu đơn hàng', d: 'File đơn hàng chưa có kênh này, chỉ hiển thị KPI.' });
    else if (!P.hasK) out.push({ lv: 'Info', t: c.label + ' chưa có KPI NMV cho kỳ ' + P.short, d: 'Hiển thị actual, chưa tính % đạt.' });
    if (c.key === 'total' || c.key === 'ws') {
      const last = this.D().lastIso;
      (this.D().channels || []).filter(x => x.spendable && x.spendLast && x.spendLast < last && (c.key === 'total' || x.key === 'Harasocial' || x.key === 'Website')).forEach(x => out.push({ lv: 'Watch', t: x.name + ' thiếu Spend từ ' + this.dm(this.nextDay(x.spendLast)), d: 'CIR, ROAS, CPO của ' + (c.key === 'total' ? 'Total Ecom' : c.label) + ' đang thấp/cao hơn thực tế.' }));
    }
    return out.slice(0, 8);
  }
  nextDay(iso) { return new Date(Date.parse(iso + 'T00:00:00Z') + 864e5).toISOString().slice(0, 10); }
  alertsHtml(list) {
    const crit = list.filter(a => a.lv === 'Critical').length, watch = list.filter(a => a.lv === 'Watch').length;
    if (!list.length) list = [{ lv: 'Checked', t: 'Không có cảnh báo cho bộ lọc này', d: 'NMV theo kịp KPI và CIR trong target.' }];
    const sum = '<span class="ox-asum">' + list.length + ' mục' + (crit ? ' · <i class="c">' + crit + ' Critical</i>' : '') + (watch ? ' · <i class="w">' + watch + ' Watch</i>' : '') + '</span>';
    return this.panel('ox-alw ok-alw' + (this.isOpen('alerts') ? '' : ' ox-closed'), 'Cảnh báo', 'Tự tạo từ KPI và actual của bộ lọc hiện tại', '<div class="ox-al">' + list.map(a => '<div class="ox-a ' + a.lv.toLowerCase() + '"><span>' + a.lv + '</span><div><b>' + this.esc(a.t) + '</b><em>' + this.esc(a.d) + '</em></div></div>').join('') + '</div>', '', sum + this.foldBtn('alerts')).replace('<div class="ox-panel', '<div data-fbox="alerts" class="ox-panel');
  }
  wsHtml(P) {
    const D = this.D(), m = this.money.bind(this), p = this.pct.bind(this), S = P.S;
    const subs = [{ k: 'Harasocial', n: 'Harasocial · Facebook', idx: 2 }, { k: 'Website', n: 'Website · Google', idx: 3 }];
    const months = P.rows.map(r => r.m), tot = P.aN || 0;
    const rows = subs.map(s => {
      let n = 0, sp = 0; for (const r of D.rows) { if (r[1] !== s.idx) continue; if (months.indexOf(+D.dates[r[0]].slice(5, 7)) < 0) continue; n += r[3]; sp += r[2]; }
      const ch = (D.channels || []).find(x => x.key === s.k);
      return '<tr><td class="l">' + this.esc(s.n) + '</td><td>' + m(n) + '</td><td>' + p(tot ? n / tot : null, 1) + '</td><td>' + m(sp) + '</td><td>' + (n && sp ? p(sp / n, 1) : '—') + '</td><td>' + (ch && ch.spendLast ? this.dm(ch.spendLast) : '—') + '</td></tr>';
    }).join('');
    return this.panel('ox-c12', 'Chi tiết 2 kênh con của Website/Social · ' + P.short, 'KPI được giao chung cho cả nhóm nên chỉ chia actual, không chia % đạt', '<div class="ox-tw"><table class="ox-t"><thead><tr><th class="l">Kênh con</th><th>NMV</th><th>% nhóm</th><th>Spend</th><th>CIR</th><th>Spend đến ngày</th></tr></thead><tbody>' + rows + '</tbody></table></div>', '', '');
  }
  // ---- chart A: NMV actual vs KPI theo tháng -------------------------------------------------------
  chNmv(P) {
    const S = P.S, rows = S.rows, W = 720, H = 300, L = 54, R = 14, T = 40, B = 46, sel = this.state.mo, m = this.money.bind(this), p = this.pct.bind(this);
    const mx = this.niceMax(Math.max.apply(null, rows.map(r => Math.max(r.a ? r.a.n : 0, r.k ? r.k.n : 0)).concat([1])));
    const pw = W - L - R, ph = H - T - B, bw = pw / rows.length, Y = v => T + ph - v / mx * ph;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg"><defs><linearGradient id="okg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ea8ff"/><stop offset="1" stop-color="#2f6df0"/></linearGradient></defs>' + this.axT(L, 'NMV (₫) · cột = NMV thực tế, mỗi cột = 1 tháng');
    for (let i = 0; i <= 4; i++) { const y = T + ph - ph * i / 4; s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + this.short(mx * i / 4) + '</text>'; }
    rows.forEach((r, i) => {
      const x0 = L + bw * i, bx = x0 + bw * 0.2, w = bw * 0.6, a = r.a ? r.a.n : 0, isSel = sel === 'm' + r.m, lab = 'T' + r.m + (r.partial ? '*' : '');
      const tip = this.tipT(lab + ' · ' + (r.partial ? '01–' + String(S.ld).padStart(2, '0') + '/' + String(r.m).padStart(2, '0') : 'cả tháng'), [
        r.a ? ['NMV thực tế', m(a), '#2f6df0'] : null, r.k ? ['KPI tháng', m(r.k.n), '#2fc7b8', 'kpi'] : ['KPI tháng', 'chưa có', '#94a3b8'],
        r.partial && r.k ? ['KPI đến ngày', m(r.k.nd), '#0f1b3a'] : null,
        r.att != null ? ['% đạt KPI' + (r.partial ? ' đến ngày' : ''), p(r.att), r.att >= 1 ? '#12924f' : '#d6334f'] : null,
        r.att != null ? [r.a.n >= r.k.nd ? 'Vượt KPI' : 'Còn thiếu', m(Math.abs(r.k.nd - a)), '#94a3b8'] : null,
        r.a && r.a.s ? ['Spend · CIR', m(r.a.s) + ' · ' + p(r.cir, 2), '#94a3b8'] : null]);
      s += '<g class="ox-hit" data-mo="m' + r.m + '"' + this.tipAttr(tip) + '><rect class="ox-hov' + (isSel ? ' ox-sel' : '') + '" x="' + x0 + '" y="' + T + '" width="' + bw + '" height="' + (ph + B - 6) + '" rx="10" ' + (isSel ? 'style="fill:rgba(47,109,240,.12)"' : '') + '/>';
      if (a > 0) s += '<rect x="' + bx + '" y="' + Y(a) + '" width="' + w + '" height="' + Math.max(1, T + ph - Y(a)) + '" rx="6" fill="url(#okg)"' + (r.partial ? ' opacity=".62" stroke="#2f6df0" stroke-dasharray="4 3"' : '') + '/>';
      if (r.k) s += '<line x1="' + (bx - 4) + '" x2="' + (bx + w + 4) + '" y1="' + Y(r.k.n) + '" y2="' + Y(r.k.n) + '" stroke="var(--kpi-mark)" stroke-width="3" stroke-linecap="round"/>';
      if (r.partial && r.k) s += '<line x1="' + (bx - 4) + '" x2="' + (bx + w + 4) + '" y1="' + Y(r.k.nd) + '" y2="' + Y(r.k.nd) + '" stroke="#0f1b3a" stroke-width="2.4" stroke-linecap="round"/>';
      s += (r.att != null ? '<text x="' + (x0 + bw / 2) + '" y="' + (T - 10) + '" text-anchor="middle" class="ok-att ' + this.lvl(r.att) + '">' + p(r.att) + '</text>' : '') +
        '<text x="' + (x0 + bw / 2) + '" y="' + (H - 24) + '" text-anchor="middle" class="ox-ax' + (isSel ? ' ox-axon' : '') + '">' + lab + '</text>' +
        '<text x="' + (x0 + bw / 2) + '" y="' + (H - 9) + '" text-anchor="middle" class="ox-axw">' + (r.a ? this.short(a) : '—') + '</text></g>';
    });
    s += '</svg>';
    return this.panel('ox-c7', 'NMV thực tế so với KPI theo tháng', (S.partial ? 'T' + S.lm + '* mới có 1–' + S.ld + ': % đạt so với KPI đến ngày, không so với KPI cả tháng' : 'Tất cả tháng đã đủ ngày') + ' · bấm cột để lọc theo tháng', s, '% trên đầu cột = NMV thực tế / KPI đến ngày (xanh ≥ 100%, vàng 70–100%, đỏ < 70%).',
      this.legend([{ c: 'var(--series-nmv)', t: 'Cột = NMV thực tế' }, { c: 'var(--kpi-mark)', t: 'Vạch cyan = KPI tháng', line: 1 }, { c: '#0f1b3a', t: 'Vạch đen = KPI đến ngày', line: 1 }]));
  }
  // ---- chart B: CIR thực tế + target ----------------------------------------------------------------
  chCir(P) {
    const S = P.S, rows = S.rows.filter(r => !r.future), W = 560, H = 300, L = 46, R = 14, T = 40, B = 34, sel = this.state.mo, p = this.pct.bind(this), m = this.money.bind(this);
    const vals = rows.map(r => r.cir).concat(rows.map(r => r.k && r.k.cir)).filter(v => v != null && isFinite(v));
    if (!vals.length || !rows.some(r => r.a && r.a.s > 0)) return this.panel('ox-c5', 'CIR thực tế so với target', '', '<div class="ox-ps">Kênh này chưa có Spend.</div>', '', '');
    const mx = this.niceMax(Math.max.apply(null, vals) * 1.1), pw = W - L - R, ph = H - T - B, bw = pw / rows.length, Y = v => T + ph - v / mx * ph, X = i => L + bw * i + bw / 2;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg"><defs><linearGradient id="okc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ea8ff"/><stop offset="1" stop-color="#2f6df0"/></linearGradient></defs>' + this.axT(L, 'CIR (%) = Spend / NMV · cột = thực tế, đường = target');
    for (let i = 0; i <= 4; i++) { const y = T + ph - ph * i / 4; s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + (mx * i / 4 * 100).toFixed(0) + '%</text>'; }
    const pts = [];
    rows.forEach((r, i) => { if (r.k && r.k.cir != null) pts.push(X(i).toFixed(1) + ',' + Y(r.k.cir).toFixed(1)); });
    rows.forEach((r, i) => {
      const x0 = L + bw * i, isSel = sel === 'm' + r.m, over = r.cir != null && r.k && r.k.cir != null && r.cir > r.k.cir;
      const tip = this.tipT('T' + r.m + (r.partial ? '*' : '') + ' · CIR', [r.cir != null ? ['CIR thực tế', p(r.cir, 2), over ? '#ff7a8a' : '#2f6df0'] : ['CIR thực tế', 'chưa có Spend', '#94a3b8'], r.k && r.k.cir != null ? ['Target CIR', p(r.k.cir, 2), '#2fc7b8', 'kpi'] : null, r.cir != null && r.k && r.k.cir != null ? [over ? 'Vượt target' : 'Trong target', ((r.cir - r.k.cir) * 100).toFixed(2) + 'pp', over ? '#d6334f' : '#12924f'] : null, r.a && r.a.s ? ['Spend', m(r.a.s), '#94a3b8'] : null]);
      s += '<g class="ox-hit" data-mo="m' + r.m + '"' + this.tipAttr(tip) + '><rect class="ox-hov" x="' + x0 + '" y="' + T + '" width="' + bw + '" height="' + (ph + B - 6) + '" rx="8" ' + (isSel ? 'style="fill:rgba(47,109,240,.12)"' : '') + '/>';
      if (r.cir != null) s += '<rect x="' + (x0 + bw * 0.2) + '" y="' + Y(r.cir) + '" width="' + (bw * 0.6) + '" height="' + Math.max(1, T + ph - Y(r.cir)) + '" rx="5" fill="' + (over ? '#ff7a8a' : 'url(#okc)') + '"/><text x="' + X(i) + '" y="' + (Y(r.cir) - 5) + '" text-anchor="middle" class="ok-v' + (over ? ' r' : '') + '">' + (r.cir * 100).toFixed(1) + '</text>';
      s += '<text x="' + X(i) + '" y="' + (H - 12) + '" text-anchor="middle" class="ox-ax' + (isSel ? ' ox-axon' : '') + '">T' + r.m + (r.partial ? '*' : '') + '</text></g>';
    });
    if (pts.length) s += '<polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--kpi-mark)" stroke-width="2.6" stroke-linejoin="round" pointer-events="none"/>' + rows.map((r, i) => r.k && r.k.cir != null ? '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(r.k.cir).toFixed(1) + '" r="3.6" fill="#fff" stroke="var(--kpi-mark)" stroke-width="2" pointer-events="none"/>' : '').join('');
    s += '</svg>';
    const over = rows.filter(r => r.cir != null && r.k && r.k.cir != null && r.cir > r.k.cir).map(r => 'T' + r.m);
    return this.panel('ox-c5', 'CIR thực tế so với target', 'Cột đỏ = vượt target của tháng đó', s, over.length ? 'Tháng vượt target CIR: ' + over.join(', ') + '.' : 'Không tháng nào vượt target CIR.',
      this.legend([{ c: 'var(--series-nmv)', t: 'Cột = CIR thực tế' }, { c: '#ff7a8a', t: 'Cột đỏ = vượt target' }, { c: 'var(--kpi-mark)', t: 'Đường = target CIR', line: 1 }]));
  }
  // ---- chart C: % đạt KPI từng kênh ------------------------------------------------------------------
  chChan(P, chp) {
    const m = this.money.bind(this), p = this.pct.bind(this), cur = this.chan().key;
    const rows = chp.filter(x => x.P.hasA || x.P.hasK);
    const scaleMax = Math.max(1.2, ...rows.map(x => x.P.kN && x.P.hasA ? x.P.aN / x.P.kN : 0)) * 1.05;
    const body = '<div class="ok-hb">' + rows.map(x => {
      const Q = x.P, full = Q.kN, bar = Q.hasA && full ? Q.aN / full : null, mark = full ? Q.kNd / full : null, X = v => Math.min(100, v / scaleMax * 100).toFixed(1) + '%';
      const tip = this.tipT(x.ch.label + ' · ' + Q.short, [Q.hasA ? ['NMV thực tế', m(Q.aN), '#2f6df0'] : ['NMV thực tế', 'chưa có đơn hàng', '#94a3b8'], full ? ['KPI cả kỳ', m(full), '#2fc7b8', 'kpi'] : ['KPI', 'chưa có', '#94a3b8'], full ? ['Mốc cần đạt đến ngày', m(Q.kNd), '#0f1b3a'] : null, Q.att != null ? ['% đạt KPI đến ngày', p(Q.att), Q.att >= 1 ? '#12924f' : '#d6334f'] : null]);
      return '<div class="ok-hrow' + (x.ch.key === cur ? ' on' : '') + '" data-ch="' + x.ch.key + '"' + this.tipAttr(tip) + '><span class="ok-hn">' + this.esc(x.ch.label) + '</span>' +
        '<span class="ok-ht">' + (bar != null ? '<span class="ok-hf ' + this.lvl(Q.att) + '" style="width:' + X(bar) + '"></span>' : '') + (full ? '<i class="ok-hm k" style="left:' + X(mark) + '"></i><i class="ok-hm h" style="left:' + X(1) + '"></i>' : '') + '</span>' +
        '<span class="ok-hv ' + this.lvl(Q.att) + '">' + (Q.att != null ? p(Q.att) : '—') + '</span><span class="ok-hs">' + (Q.hasA ? m(Q.aN) : 'chưa có đơn') + (full ? ' / ' + m(full) : ' · chưa có KPI') + '</span></div>';
    }).join('') + '</div>';
    return this.panel('ox-c5', '% đạt KPI theo kênh · ' + P.short, 'Bấm một kênh để lọc cả trang', body, 'Số bên phải = % đạt KPI đến ngày hôm nay; thanh = NMV / KPI cả kỳ.',
      this.legend([{ c: '#12924f', t: 'Thanh = NMV / KPI cả kỳ' }, { c: 'var(--kpi-mark)', t: 'Cyan = mốc cần đạt đến ngày', line: 1 }, { c: '#0f1b3a', t: 'Đen = 100% KPI', line: 1 }]));
  }
  // ---- chart D: burn-up theo ngày (chỉ khi chọn một tháng) -----------------------------------------
  chBurn(P) {
    const c = P.c, S = P.S, m = this.money.bind(this), p = this.pct.bind(this);
    const mo = P.ytd ? S.lm : P.m, dim = this.dimOf(mo), D = this.D(), r0 = S.rows[mo - 1], endD = r0.partial ? S.ld : dim;
    const day = {}; for (const r of D.rows) { if (c.act && c.act.indexOf(r[1]) < 0) continue; const d = D.dates[r[0]]; if (+d.slice(5, 7) !== mo) continue; day[+d.slice(8, 10)] = (day[+d.slice(8, 10)] || 0) + r[3]; }
    const act = [], kp = []; let cum = 0;
    for (let d = 1; d <= dim; d++) { if (d <= endD) { cum += day[d] || 0; act.push(P.hasA ? cum : null); } const k = this.kpi(c, mo, d); kp.push(k ? k.nd : null); }
    const kFull = r0.k ? r0.k.n : null, proj = r0.partial && P.hasA ? cum * dim / endD : null;
    const W = 720, H = 300, L = 54, R = 16, T = 28, B = 34, mx = this.niceMax(Math.max(kFull || 0, proj || 0, cum, 1) * 1.04), pw = W - L - R, ph = H - T - B, X = d => L + pw * (d - 1) / Math.max(1, dim - 1), Y = v => T + ph - v / mx * ph;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">' + this.axT(L, 'NMV lũy kế (₫) · đường liền = thực tế, đứt = KPI, chấm = dự kiến');
    for (let i = 0; i <= 4; i++) { const y = T + ph - ph * i / 4; s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + this.short(mx * i / 4) + '</text>'; }
    for (let d = 1; d <= dim; d += (dim > 20 ? 3 : 2)) s += '<text x="' + X(d) + '" y="' + (H - 12) + '" text-anchor="middle" class="ox-ax">' + d + '</text>';
    const kpts = kp.map((v, i) => v != null ? X(i + 1).toFixed(1) + ',' + Y(v).toFixed(1) : null).filter(Boolean);
    if (kpts.length) s += '<polyline points="' + kpts.join(' ') + '" fill="none" stroke="var(--kpi-mark)" stroke-width="2.4" stroke-dasharray="6 4"/>';
    const apts = act.map((v, i) => v != null ? X(i + 1).toFixed(1) + ',' + Y(v).toFixed(1) : null).filter(Boolean);
    if (apts.length) { s += '<polygon points="' + X(1).toFixed(1) + ',' + Y(0) + ' ' + apts.join(' ') + ' ' + X(endD).toFixed(1) + ',' + Y(0) + '" fill="rgba(47,109,240,.14)"/><polyline points="' + apts.join(' ') + '" fill="none" stroke="#2f6df0" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>'; }
    if (proj != null) s += '<line x1="' + X(endD) + '" y1="' + Y(cum) + '" x2="' + X(dim) + '" y2="' + Y(proj) + '" stroke="#64748b" stroke-width="2.4" stroke-dasharray="2 5" stroke-linecap="round"/><circle cx="' + X(dim) + '" cy="' + Y(proj) + '" r="4.5" fill="#64748b"/><text x="' + (X(dim) - 6) + '" y="' + (Y(proj) - 9) + '" text-anchor="end" class="ok-v">' + this.short(proj) + '</text>';
    if (kFull != null) s += '<text x="' + (X(dim) - 6) + '" y="' + (Y(kFull) - 8) + '" text-anchor="end" class="ok-v k">KPI ' + this.short(kFull) + '</text>';
    for (let d = 1; d <= dim; d++) {
      const a = d <= endD && P.hasA ? act[d - 1] : null, k = kp[d - 1];
      const tip = this.tipT('Ngày ' + String(d).padStart(2, '0') + '/' + String(mo).padStart(2, '0'), [a != null ? ['NMV ngày', m(day[d] || 0), '#94a3b8'] : null, a != null ? ['NMV lũy kế', m(a), '#2f6df0'] : null, k != null ? ['KPI lũy kế', m(k), '#2fc7b8', 'kpi'] : null, a != null && k ? ['% đạt KPI lũy kế', p(a / k), a >= k ? '#12924f' : '#d6334f'] : null]);
      s += '<g class="ox-hit"' + this.tipAttr(tip) + '><rect class="ox-hov" x="' + (X(d) - pw / dim / 2) + '" y="' + T + '" width="' + (pw / dim) + '" height="' + ph + '"/></g>';
    }
    s += '</svg>';
    const foot = r0.partial && P.hasA ? 'Dự kiến cuối tháng = NMV lũy kế × ' + (dim / endD).toFixed(2) + (kFull ? ' = ' + m(proj) + ' (' + p(proj / kFull) + ' KPI tháng).' : '.') : 'Tháng đã kết thúc: đường thực tế kết thúc tại ' + m(cum) + '.';
    return this.panel('ox-c7', 'Tiến độ lũy kế theo ngày · T' + mo + (r0.partial ? '*' : ''), P.ytd ? 'Đang hiển thị tháng đang chạy · bấm cột, ô heatmap hoặc chip Kỳ để xem tháng khác' : 'Có kịp KPI tháng không', s, foot, this.legend([{ c: '#2f6df0', t: 'Đường liền = NMV lũy kế thực tế' }, { c: 'var(--kpi-mark)', t: 'Đường đứt = KPI lũy kế', line: 1 }, { c: '#64748b', t: 'Chấm = dự kiến cuối tháng', line: 1 }]));
  }
  // ---- heatmap kênh × tháng --------------------------------------------------------------------------
  heatHtml(P, chp) {
    const m = this.money.bind(this), p = this.pct.bind(this), S = P.S, mo = this.state.mo, curCh = this.chan().key, cols = S.rows.filter(r => !r.future);
    const nC = cols.length + 1, all = [{ ch: this.CH[0], S: this.series(this.CH[0]) }].concat(chp.map(x => ({ ch: x.ch, S: x.S })));
    const gtc = 'grid-template-columns:150px repeat(' + nC + ',minmax(58px,1fr))';
    const head = '<div class="ok-hr ok-hh" style="' + gtc + '"><div class="ok-hl">Kênh</div>' + cols.map(r => '<div class="' + (mo === 'm' + r.m ? 'on' : '') + '" data-mo="m' + r.m + '">T' + r.m + (r.partial ? '*' : '') + '</div>').join('') + '<div class="' + (mo === 'ytd' ? 'on' : '') + '" data-mo="ytd">YTD</div></div>';
    const body = all.map(x => {
      const ch = x.ch, hasA = !(ch.act && !ch.act.length), dn = x.S.rows.filter(r => !r.future);
      const cell = (att, aN, kNd, aS, label, key, sel) => {
        const lv = att == null ? 'n' : this.lvl(att);
        const tip = this.tipT(ch.label + ' · ' + label, [hasA ? ['NMV thực tế', m(aN), '#2f6df0'] : null, kNd ? ['KPI đến ngày', m(kNd), '#2fc7b8', 'kpi'] : ['KPI', 'chưa có', '#94a3b8'], att != null ? ['% đạt KPI', p(att), att >= 1 ? '#12924f' : '#d6334f'] : null, att != null ? [aN >= kNd ? 'Vượt KPI' : 'Còn thiếu', m(Math.abs(kNd - aN)), '#94a3b8'] : null, aS ? ['Spend · CIR', m(aS) + ' · ' + (aN ? p(aS / aN, 2) : '—'), '#94a3b8'] : null, ['Bấm để lọc cả trang', '', '#fff']]);
        return '<div class="ok-hc ' + lv + (sel ? ' sel' : '') + '" data-cell="' + ch.key + '|' + key + '"' + this.tipAttr(tip) + '><b>' + (att != null ? p(att) : '—') + '</b><small>' + (hasA && aN ? this.short(aN) : '') + '</small></div>';
      };
      const cells = dn.map(r => cell(hasA ? r.att : null, r.a ? r.a.n : 0, r.k ? r.k.nd : 0, r.a ? r.a.s : 0, 'T' + r.m + (r.partial ? '*' : ''), 'm' + r.m, curCh === ch.key && mo === 'm' + r.m)).join('');
      const kd = dn.reduce((a, r) => a + (r.k ? r.k.nd : 0), 0), an = dn.reduce((a, r) => a + (r.a ? r.a.n : 0), 0), as = dn.reduce((a, r) => a + (r.a ? r.a.s : 0), 0);
      return '<div class="ok-hr" style="' + gtc + '"><div class="ok-hl' + (curCh === ch.key ? ' on' : '') + '" data-ch="' + ch.key + '">' + this.esc(ch.label) + '</div>' + cells + cell(hasA && kd ? an / kd : null, an, kd, as, 'YTD', 'ytd', curCh === ch.key && mo === 'ytd') + '</div>';
    }).join('');
    const lg = this.legend([{ c: '#ffc4cc', t: 'Đỏ < 70% KPI' }, { c: '#ffe7a1', t: 'Vàng 70–100%' }, { c: '#bdeed0', t: 'Xanh ≥ 100%' }, { c: '#e2e8f0', t: 'Chưa có KPI' }]);
    return this.panel('ox-c12', '% đạt KPI NMV · kênh × tháng', 'Bấm một ô để lọc cả trang theo kênh và tháng đó · số nhỏ dưới % là NMV thực tế', '<div class="ox-tw"><div class="ok-heat">' + head + body + '</div></div>', 'T11* so với KPI cộng dồn đến ngày ' + this.dm(this.D().lastIso) + ', không so với KPI cả tháng. YTD = tổng KPI đến ngày của các tháng đã chạy.', lg);
  }
  // ---- bảng chi tiết (tab NMV | Spend | CIR) ----------------------------------------------------------
  tableHtml(P) {
    const m = this.money.bind(this), p = this.pct.bind(this), S = P.S, c = P.c, tab = this.state.dtab || 'nmv', mo = this.state.mo, rows = S.rows.filter(r => !r.future), dim = this.dimOf(S.lm);
    const hasA = P.hasA, rr = r => r.partial && r.a ? dim / S.ld : 1;
    const prevOf = (r, f) => { const q = rows.find(x => x.m === r.m - 1); return q && q.a ? f(q) : null; };
    const dv = (cur, prev, fmt) => prev ? '<span class="' + (cur / prev - 1 >= 0 ? 'okw' : 'badw') + '">' + (cur / prev - 1 >= 0 ? '▲ ' : '▼ ') + Math.abs((cur / prev - 1) * 100).toFixed(1) + '%</span>' : '—';
    const tabs = [['nmv', 'NMV'], ['spend', 'Spend'], ['cir', 'CIR']].map(x => '<button type="button" class="ox-tab' + (x[0] === tab ? ' on' : '') + '" data-dtab="' + x[0] + '">' + x[1] + '</button>').join('');
    let head, body = '';
    const ytdA = { n: rows.reduce((t, r) => t + (r.a ? r.a.n : 0), 0), s: rows.reduce((t, r) => t + (r.a ? r.a.s : 0), 0) };
    const kN = rows.reduce((t, r) => t + (r.k ? r.k.n : 0), 0), kNd = rows.reduce((t, r) => t + (r.k ? r.k.nd : 0), 0), kS = rows.reduce((t, r) => t + (r.k ? r.k.s : 0), 0), kSd = rows.reduce((t, r) => t + (r.k ? r.k.sd : 0), 0);
    const tr = (cls, label, key, cells) => '<tr class="' + cls + (mo === key ? ' sel' : '') + '" data-mo="' + key + '"><td class="l">' + label + '</td>' + cells.map(x => '<td>' + x + '</td>').join('') + '</tr>';
    const bar = (v, good) => '<span class="ok-mb"><i class="' + good + '" style="width:' + Math.min(100, (v || 0) * 100).toFixed(0) + '%"></i></span>';
    if (tab === 'nmv') {
      head = ['Tháng', 'KPI tháng', 'KPI đến ngày', 'Actual', '% đạt', 'Chênh vs KPI', 'Δ so với tháng trước'];
      rows.forEach(r => {
        const a = r.a ? r.a.n : null, diff = r.k && a != null ? a - r.k.nd : null, pv = prevOf(r, q => q.a.n);
        body += tr('', 'T' + r.m + (r.partial ? ' (1–' + S.ld + ')' : ''), 'm' + r.m, [r.k ? m(r.k.n) : '—', r.k ? m(r.k.nd) : '—', hasA ? '<b>' + m(a) + '</b>' : '—', r.att != null ? '<span class="' + (r.att >= 1 ? 'okw' : 'badw') + '">' + p(r.att) + '</span>' + bar(r.att, r.att >= 1 ? 'g' : 'r') : '—', diff != null ? '<span class="' + (diff >= 0 ? 'okw' : 'badw') + '">' + (diff >= 0 ? '+' : '−') + m(Math.abs(diff)) + '</span>' : '—', hasA && a != null ? dv(a * rr(r), pv) + (r.partial ? '<small title="So sánh NMV ước cả tháng với cả tháng trước"> *</small>' : '') : '—']);
      });
      body += tr('tot', 'YTD', 'ytd', [m(kN), m(kNd), hasA ? '<b>' + m(ytdA.n) + '</b>' : '—', hasA && kNd ? '<span class="' + (ytdA.n >= kNd ? 'okw' : 'badw') + '">' + p(ytdA.n / kNd) + '</span>' : '—', hasA && kNd ? (ytdA.n >= kNd ? '+' : '−') + m(Math.abs(ytdA.n - kNd)) : '—', '—']);
    } else if (tab === 'spend') {
      head = ['Tháng', 'KPI Spend tháng', 'KPI đến ngày', 'Actual', '% dùng', 'Chênh vs KPI', 'Δ so với tháng trước'];
      rows.forEach(r => {
        const a = r.a ? r.a.s : null, diff = r.k && a != null ? a - r.k.sd : null, pv = prevOf(r, q => q.a.s);
        body += tr('', 'T' + r.m + (r.partial ? ' (1–' + S.ld + ')' : ''), 'm' + r.m, [r.k ? m(r.k.s) : '—', r.k ? m(r.k.sd) : '—', hasA ? '<b>' + m(a) + '</b>' : '—', r.use != null ? '<span class="' + (r.use <= 1 ? 'okw' : 'badw') + '">' + p(r.use) + '</span>' + bar(r.use, r.use <= 1 ? 'g' : 'r') : '—', diff != null ? '<span class="' + (diff <= 0 ? 'okw' : 'badw') + '">' + (diff >= 0 ? '+' : '−') + m(Math.abs(diff)) + '</span>' : '—', hasA && a != null ? dv(a * rr(r), pv) + (r.partial ? '<small> *</small>' : '') : '—']);
      });
      body += tr('tot', 'YTD', 'ytd', [m(kS), m(kSd), hasA ? '<b>' + m(ytdA.s) + '</b>' : '—', hasA && kSd ? '<span class="' + (ytdA.s <= kSd ? 'okw' : 'badw') + '">' + p(ytdA.s / kSd) + '</span>' : '—', hasA && kSd ? (ytdA.s >= kSd ? '+' : '−') + m(Math.abs(ytdA.s - kSd)) : '—', '—']);
    } else {
      head = ['Tháng', 'Target CIR', 'CIR thực tế', 'Chênh (pp)', 'Trạng thái', 'Δ so với tháng trước (pp)'];
      rows.forEach(r => {
        const dpp = r.cir != null && r.k && r.k.cir != null ? (r.cir - r.k.cir) * 100 : null, pc = prevOf(r, q => q.cir);
        body += tr('', 'T' + r.m + (r.partial ? ' (1–' + S.ld + ')' : ''), 'm' + r.m, [r.k && r.k.cir != null ? p(r.k.cir, 2) : '—', r.cir != null ? '<b>' + p(r.cir, 2) + '</b>' : '—', dpp != null ? '<span class="' + (dpp <= 0 ? 'okw' : 'badw') + '">' + (dpp <= 0 ? '' : '+') + dpp.toFixed(2) + 'pp</span>' : '—', dpp != null ? '<span class="ok-st ' + (dpp <= 0 ? 'g' : 'r') + '">' + (dpp <= 0 ? 'Đạt' : 'Vượt target') + '</span>' : '—', r.cir != null && pc != null ? '<span class="' + (r.cir - pc <= 0 ? 'okw' : 'badw') + '">' + (r.cir - pc >= 0 ? '▲ +' : '▼ ') + ((r.cir - pc) * 100).toFixed(2) + 'pp</span>' : '—']);
      });
      const yc = ytdA.n ? ytdA.s / ytdA.n : null, kc = kNd ? kSd / kNd : null, dd = yc != null && kc != null ? (yc - kc) * 100 : null;
      body += tr('tot', 'YTD', 'ytd', [kc != null ? p(kc, 2) : '—', yc != null ? '<b>' + p(yc, 2) + '</b>' : '—', dd != null ? (dd <= 0 ? '' : '+') + dd.toFixed(2) + 'pp' : '—', dd != null ? '<span class="ok-st ' + (dd <= 0 ? 'g' : 'r') + '">' + (dd <= 0 ? 'Đạt' : 'Vượt target') + '</span>' : '—', '—']);
    }
    const tbl = '<div class="ox-tw"><table class="ox-t ok-t"><thead><tr>' + head.map((h, i) => '<th' + (i ? '' : ' class="l"') + '>' + h + '</th>').join('') + '</tr></thead><tbody>' + body + '</tbody></table></div>';
    const note = tab === 'nmv' ? '% đạt và Chênh so với KPI đến cùng ngày. Δ so với tháng trước = Actual (tháng dở quy ra cả tháng *) so với NMV cả tháng liền trước.' : tab === 'spend' ? '% dùng = Spend thực tế / KPI Spend đến cùng ngày (≤ 100% là trong ngân sách). Spend Facebook và Google có thể chưa đầy đủ.' : 'CIR = Spend / NMV. Target = KPI Spend / KPI NMV của kênh trong tháng. Δ (pp) là chênh lệch CIR so với tháng trước, âm là tốt.';
    return this.panel('ox-c12', 'Chi tiết theo tháng · ' + c.label, 'Bấm một dòng để lọc cả trang theo tháng đó', '<div class="ox-tabs ok-tabs">' + tabs + '</div>' + tbl, note, '');
  }
  // ---- CSS ---------------------------------------------------------------------------------------------
  OK_CSS() { const o = this.OX_CSS(), k = o.indexOf('</style>'); return o.slice(0, k) + this.OK_OWN() + o.slice(k); }
  OK_OWN() {
    return ''+
      '.ok-chips{display:flex;flex-direction:column;gap:10px}.ok-chrow{display:flex;gap:8px 10px;align-items:center;flex-wrap:wrap}.ok-chl{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ox-mut);min-width:54px}.ok-scope{margin-left:auto;font-size:13px;color:var(--ox-mut)}' +
      '.ok-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.ok-card-wide{grid-column:span 1}' +
      '.ok-concl{display:flex;align-items:center;gap:12px;padding:12px 18px;border-radius:20px;font-size:14.5px;font-weight:600;color:#0f1b3a;background:rgba(255,255,255,.8);border:1px solid #c5dbfa;box-shadow:0 6px 18px rgba(37,99,235,.08)}.ok-cd{flex:none;width:12px;height:12px;border-radius:50%;background:#94a3b8}.ok-concl.g .ok-cd{background:#12b76a}.ok-concl.y .ok-cd{background:#f5b301}.ok-concl.r .ok-cd{background:#e5484d}' +
      '.ok-alw{grid-column:auto !important}.ok-alw .ox-al{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:10px;max-height:none;overflow:visible}.ox-a.info span{background:#e3edfb;color:#2563eb}' +
      '.ok-att{font:700 12.5px var(--font-body)}.ok-att.g{fill:#12924f}.ok-att.y{fill:#c27a0e}.ok-att.r{fill:#d6334f}.ok-v{font:700 11px var(--font-body);fill:#1d4ed8}.ok-v.r{fill:#d6334f}.ok-v.k{fill:#0e9f8f}' +
      '.ok-hb{display:flex;flex-direction:column;gap:12px;margin-top:6px}.ok-hrow{display:grid;grid-template-columns:110px minmax(0,1fr) 52px;grid-template-rows:auto auto;gap:3px 10px;align-items:center;padding:6px 8px;border-radius:14px;cursor:pointer}.ok-hrow:hover,.ok-hrow.on{background:rgba(255,255,255,.7)}.ok-hrow.on{box-shadow:inset 0 0 0 1px #9dbcf7}.ok-hn{font-weight:600;font-size:13px;color:#0f1b3a}.ok-ht{position:relative;height:14px;border-radius:99px;background:rgba(37,99,235,.10)}.ok-hf{position:absolute;left:0;top:0;bottom:0;border-radius:99px;background:#9ec5ff}.ok-hf.g{background:linear-gradient(90deg,#6fdba0,#12b76a)}.ok-hf.y{background:linear-gradient(90deg,#ffd978,#f5b301)}.ok-hf.r{background:linear-gradient(90deg,#ffa3ad,#e5484d)}.ok-hm{position:absolute;top:-4px;bottom:-4px;width:2.5px;border-radius:2px;transform:translateX(-50%)}.ok-hm.k{background:var(--kpi-mark)}.ok-hm.h{background:#0f1b3a}.ok-hv{font-weight:700;text-align:right;font-size:13.5px}.ok-hv.g{color:#12924f}.ok-hv.y{color:#c27a0e}.ok-hv.r{color:#d6334f}.ok-hs{grid-column:2/4;font-size:12px;color:var(--ox-mut)}' +
      '.ok-empty{padding:40px 24px;text-align:center;color:var(--ox-mut);font-size:14px;line-height:1.6;background:rgba(255,255,255,.55);border-radius:18px}' +
      '.ok-heat{min-width:860px;display:flex;flex-direction:column;gap:6px}.ok-hr{display:grid;gap:6px;align-items:stretch}.ok-hh>div{font-size:12.5px;font-weight:600;color:var(--ox-mut);text-align:center;padding:6px 4px;border-radius:10px;cursor:pointer}.ok-hh>div.on{background:#2f6df0;color:#fff}.ok-hh>.ok-hl{text-align:left;cursor:default;padding-left:12px}' +
      '.ok-hl{display:flex;align-items:center;padding:0 12px;font-weight:600;font-size:13.5px;border-radius:12px;cursor:pointer;color:#0f1b3a}.ok-hl:hover{background:rgba(255,255,255,.6)}.ok-hl.on{background:#fff;box-shadow:inset 3px 0 0 #2f6df0;color:#1d4ed8}' +
      '.ok-hc{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:7px 4px;border-radius:12px;cursor:pointer;min-height:48px;transition:transform .12s}.ok-hc:hover{transform:translateY(-1px);box-shadow:0 6px 14px rgba(37,99,235,.18)}.ok-hc b{font-size:13.5px}.ok-hc small{font-size:10.5px;opacity:.8}' +
      '.ok-hc.r{background:#ffd9de;color:#b4233b}.ok-hc.y{background:#fff0c2;color:#8a5a00}.ok-hc.g{background:#d3f5e0;color:#0f7a43}.ok-hc.n{background:#e8eef8;color:#7b8aa5}.ok-hc.sel{outline:2.5px solid #2f6df0;outline-offset:1px}' +
      '.ok-t tr{cursor:pointer}.ok-t tbody tr:hover td{background:rgba(255,255,255,.55)}.ok-t tr.sel td{background:rgba(47,109,240,.12)}.ok-t small{opacity:.6}.ok-mb{display:block;height:4px;border-radius:99px;background:rgba(37,99,235,.12);margin-top:3px;min-width:56px;overflow:hidden}.ok-mb i{display:block;height:100%;border-radius:99px}.ok-mb i.g{background:#12b76a}.ok-mb i.r{background:#e5484d}.ok-st{display:inline-block;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600}.ok-st.g{background:#d9f7e6;color:#12924f}.ok-st.r{background:#ffe3e8;color:#d6334f}.ok-tabs{margin-bottom:10px}' +
      '@media (max-width:1100px){.ok-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.ok-scope{margin-left:0;width:100%}.ok-alw .ox-al{grid-template-columns:1fr}}@media (max-width:560px){.ok-cards{grid-template-columns:1fr}.ok-hrow{grid-template-columns:92px minmax(0,1fr) 46px}}' +
      '';
  }
  // ---- paint ---------------------------------------------------------------------------------------------
  paintOK() {
    const root = document.getElementById('ovk');
    if (!root) return false;
    if (!root._ok) {
      root._ok = 1;
      root.addEventListener('click', ev => {
        const T = ev.target.closest ? ev.target : null; if (!T) return;
        const fb = T.closest('[data-fold]');
        if (fb) {
          const k = fb.getAttribute('data-fold'); this._fold = this._fold || {}; this._fold[k] = !this._fold[k];
          const box = root.querySelector('[data-fbox="' + k + '"]'); if (box) box.classList.toggle('ox-closed', !!this._fold[k]);
          fb.setAttribute('aria-expanded', String(!this._fold[k])); const ft = fb.querySelector('.ox-ft'); if (ft) ft.textContent = this._fold[k] ? 'Mở rộng' : 'Thu gọn';
          return;
        }
        const cell = T.closest('[data-cell]');
        if (cell) { const v = cell.getAttribute('data-cell').split('|'); this.setState({ ch: v[0], mo: v[1] }); return; }
        const dt = T.closest('[data-dtab]'); if (dt) { this.setState({ dtab: dt.getAttribute('data-dtab') }); return; }
        const c = T.closest('[data-ch]'), mo = T.closest('[data-mo]');
        if (c || mo) { const st = {}; if (c) st.ch = c.getAttribute('data-ch'); if (mo) st.mo = mo.getAttribute('data-mo'); this.setState(st); }
      });
    }
    if (!root._tip) {
      root._tip = 1;
      const hide = () => { const t = document.getElementById('oxtip'); if (t) t.style.display = 'none'; };
      root.addEventListener('mousemove', ev => {
        const el = ev.target.closest && ev.target.closest('[data-tip]');
        if (!el) { hide(); return; }
        let tip = document.getElementById('oxtip');
        if (!tip) { tip = document.createElement('div'); tip.id = 'oxtip'; tip.className = 'ox-tip'; document.body.appendChild(tip); }
        const h = el.getAttribute('data-tip'); if (tip._h !== h) { tip._h = h; tip.innerHTML = h; }
        tip.style.display = 'block';
        const w = tip.offsetWidth, hh = tip.offsetHeight; let x = ev.clientX + 16, y = ev.clientY + 16;
        if (x + w > window.innerWidth - 8) x = ev.clientX - w - 16; if (y + hh > window.innerHeight - 8) y = ev.clientY - hh - 16;
        tip.style.left = Math.max(8, x) + 'px'; tip.style.top = Math.max(8, y) + 'px';
      });
      root.addEventListener('mouseleave', hide);
    }
    if (!this.dataReady()) return false;
    const c = this.chan(), S = this.series(c), P = this.period(c, S), chp = this.chanPeriods(), cur = c.key, mo = this.state.mo;
    const D = this.D(), done = S.rows.filter(r => !r.future);
    const chips = '<div class="ok-chips"><div class="ok-chrow"><span class="ok-chl">Kênh</span>' + this.CH.map(x => '<button type="button" class="ox-tab' + (x.key === cur ? ' on' : '') + '" data-ch="' + x.key + '">' + x.label + '</button>').join('') +
      '<span class="ok-scope">' + this.esc({ total: 'Tất cả 6 kênh bán hàng', shopee: 'Actual: Shopee', tts: 'Actual: TikTok Shop', ws: 'Actual: Harasocial + Website', lz: 'Actual: Lazada + Tiki', seller: 'File đơn hàng chưa có kênh Seller, chỉ hiện KPI' }[cur]) + '</span></div>' +
      '<div class="ok-chrow"><span class="ok-chl">Kỳ</span><button type="button" class="ox-tab' + (mo === 'ytd' ? ' on' : '') + '" data-mo="ytd">YTD</button>' + done.map(r => '<button type="button" class="ox-tab' + (mo === 'm' + r.m ? ' on' : '') + '" data-mo="m' + r.m + '">T' + r.m + (r.partial ? '*' : '') + '</button>').join('') + '</div></div>';
    const html = this.OK_CSS() + '<div class="ox">' + chips + this.concl(P, chp) + this.cardsHtml(P) + this.alertsHtml(this.alerts(P, chp)) +
      (cur === 'ws' ? this.wsHtml(P) : '') +
      '<section class="ox-charts">' + this.chNmv(P) + this.chCir(P) + this.chBurn(P) + this.chChan(P, chp) + this.heatHtml(P, chp) + this.tableHtml(P) + '</section>' +
      '<div class="ok-foot">' + this.esc('Actual: NMV = doanh thu thuần dòng Không hủy (Order_data). Spend = Shopee Onsite tiền nạp + Offsite, TikTok |Amount|, Facebook → Harasocial, Google → Website. Kênh không có chi phí để Spend = 0.') + '<br>' +
      this.esc('KPI: KPI Monthly Plan 2026.xlsx, sheet "KPI Ecom 2026" (KPI tháng) và sheet từng tháng (KPI ngày theo % phân bổ, dùng cho KPI đến ngày của tháng đang chạy). T12 mới có KPI tháng, chưa có KPI ngày. CIR target = KPI Spend / KPI NMV của kênh trong tháng.') + '</div></div>';
    if (root._h !== html) { root._h = html; root.innerHTML = html; }
    return true;
  }
  renderVals() {
    const R = React.createElement, D = this.D(), c = this.chan();
    if (this.dataReady()) {
      clearTimeout(this._pt); let tries = 0;
      const go = () => { try { if (!this.paintOK() && tries++ < 40) this._pt = setTimeout(go, 100); } catch (e) { console.error('ovk paint', e); } };
      this._pt = setTimeout(go, 0);
    }
    const mo = this.state.mo, lastLbl = this.dm(D.lastIso);
    return {
      navItems: [
        { id: 'ovnew', label: 'Overview', href: 'Overview New.dc.html' },
        { id: 'ovkpi', label: 'Overview KPI', href: 'Overview KPI.dc.html' },
        { id: 'dailynew', label: 'Daily Tracking', href: 'Daily Tracking New.dc.html' },
        { id: 'onsite', label: 'Onsite Shopee', href: 'Onsite Shopee.dc.html' },
        { id: 'tiktok', label: 'Onsite TikTok Shop', href: 'Onsite Tiktok Shop.dc.html' },
        { id: 'ppnew', label: 'Product Performance', href: 'PP New.dc.html' }, { id: 'dataraw', label: 'Data Raw', href: 'Data Raw.dc.html' }],
      railFooter: R('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' } },
        R('div', { style: { fontSize: 12, letterSpacing: 'var(--tracking-kicker)', textTransform: 'uppercase', color: 'var(--text-faint)' } }, 'Data period'),
        R('div', { className: 'tabular', style: { fontSize: 14.5, color: 'var(--text-secondary)' } }, (D.dataFrom || '01/01/2026') + ' – ' + (D.dataTo || '')),
        R('div', { style: { fontSize: 13.5, color: 'var(--text-faint)', lineHeight: 1.45 } }, 'KPI: KPI Monthly Plan 2026.xlsx (T1–T12).')),
      headerSubtitle: 'KPI và actual năm 2026 · ' + c.label + ' · ' + (mo === 'ytd' ? 'YTD' : mo.toUpperCase()) + ' · data đến ' + lastLbl + '/2026'
    };
  }
}
