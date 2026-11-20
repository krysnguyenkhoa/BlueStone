class Component extends DCLogic {
  __bsTick = (() => { const t = () => { try { this._sets = null; this.forceUpdate(); } catch (e) {} }; [300, 1200, 3000, 6000].forEach(ms => setTimeout(t, ms)); })();
  state = { ch: 'total', mo: null, types: {}, from: 1, to: 31, day: null, ctab: 'scale', cg: { plan: true, fc: true, cost: true, eff: false }, dtab: 'rev', spOpen: false };
  CH = [
    { key: 'total', label: 'Total Ecom', act: null, sc: null },
    { key: 'shopee', label: 'Shopee', act: [0], sc: 'Shopee' },
    { key: 'tts', label: 'TikTok Shop', act: [1], sc: 'TikTok Shop' },
    { key: 'websocial', label: 'Website/Social', act: [2, 3], sc: 'Website/Social' },
    { key: 'lazada', label: 'Lazada · Tiki', act: [4], sc: 'Lazada · Tiki' },
    { key: 'seller', label: 'Seller', act: [], sc: 'Seller' }
  ];
  TYPEC = { 'Double Day': '#d9cbff', 'Sale': '#ffe0a0', 'Mid-month': '#c4efd8', 'Payday': '#c9e4ff' };
  D() { return window.BSDATA || { dates: [], rows: [], channels: [], lastIso: '2026-11-15' }; }
  dataReady() { const D = this.D(); return !!(D.rows && D.rows.length && D.dates && D.dates.length && window.BSDAILYTRACK); }
/*HELPERS_A*/
/*HELPERS_B*/
/*HELPERS_C*/
  // ---- dữ liệu -------------------------------------------------------------------------------------
  chan() { return this.CH.find(c => c.key === this.state.ch) || this.CH[0]; }
  lastIso() { const D = this.D(); return D.lastIso || D.dates[D.dates.length - 1]; }
  lastMonth() { return +this.lastIso().slice(5, 7); }
  mo() { return this.state.mo || this.lastMonth(); }
  dimOf(m) { return new Date(Date.UTC(2026, m, 0)).getUTCDate(); }
  ldOf(m) { const lm = this.lastMonth(); if (m < lm) return this.dimOf(m); if (m > lm) return 0; return +this.lastIso().slice(8, 10); }
  isoOf(m, d) { return '2026-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
  addDays(iso, k) { return new Date(Date.parse(iso + 'T00:00:00Z') + k * 864e5).toISOString().slice(0, 10); }
  BM(m) { const B = window.BSDAILYTRACK || {}; return (B.byMonth || {})[m] || null; }
  thr(m, ch) {
    const b = this.BM(m) || {}, t = (b.monthTargets || {})[ch.key], tot = (b.monthTargets || {}).total;
    if (t && t.cir > 0) return t.cir;
    return (tot && tot.cir > 0 ? tot.cir : null) || b.cirTarget || (window.BSDAILYTRACK || {}).cirTarget || 0.088;
  }
  mt(m, ch) { const b = this.BM(m), t = b && (b.monthTargets || {})[ch.key]; return t && t.nmv > 0 ? { nmv: t.nmv, spend: t.spend != null ? t.spend : t.nmv * this.thr(m, ch) } : null; }
  ix() {
    const D = this.D(); if (this._ix && this._ixn === D.rows.length) return this._ix;
    const ix = {}; for (const r of D.rows) { const iso = D.dates[r[0]]; if (!iso) continue; const o = ix[iso] || (ix[iso] = {}); const a = o[r[1]] || (o[r[1]] = [0, 0, 0, 0, 0]); a[0] += r[2]; a[1] += r[3]; a[2] += r[4]; a[3] += r[5]; a[4] += r[6]; }
    this._ix = ix; this._ixn = D.rows.length; return ix;
  }
  agg(iso, act) {
    const out = { s: 0, n: 0, g: 0, l: 0, o: 0, nc: 0 }, o = this.ix()[iso]; if (!o) return out;
    const CH = this.D().channels || [];
    for (const k in o) { if (act && act.indexOf(+k) < 0) continue; const a = o[k]; out.s += a[0]; out.n += a[1]; out.g += a[2]; out.l += a[3]; out.o += a[4]; const c = CH[+k]; if (c && c.spendable && c.spendLast && c.spendLast >= iso) out.nc += a[1]; }
    return out;
  }
  rows(m, ch) {
    const b = this.BM(m), dim = this.dimOf(m), ld = this.ldOf(m), plan = (b && b.days) || [], thr = this.thr(m, ch), hasA = !(ch.act && !ch.act.length), dw = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'], out = [];
    let pc = 0, ac = 0;
    for (let d = 1; d <= dim; d++) {
      const iso = this.isoOf(m, d), pd = plan[d - 1] || null, tg = pd && pd.tgt && pd.tgt[ch.key] || null;
      const tN = tg && tg.nmv > 0 ? tg.nmv : null, tS = tN != null ? (tg.spend != null ? tg.spend : tN * thr) : null;
      const has = hasA && d <= ld, a = has ? this.agg(iso, ch.act) : null;
      if (tN != null) pc += tN; if (has) ac += a.n;
      out.push({ d, iso, dow: dw[new Date(iso + 'T00:00:00Z').getUTCDay()], type: pd && pd.type && pd.type !== '—' ? pd.type : '', tN, tS, a, has, future: d > ld, planCum: pc, actCum: has ? ac : null });
    }
    return out;
  }
  typesOf(m) { const b = this.BM(m), s = {}; ((b && b.days) || []).forEach(x => { if (x.type && x.type !== '—') s[x.type] = 1; }); return ['BAU', 'Sale', 'Double Day', 'Mid-month', 'Payday'].filter(t => s[t]); }
  typesSel() { return Object.keys(this.state.types).filter(k => this.state.types[k]); }
  hasFilter(dim) { return this.state.from > 1 || Math.min(this.state.to, dim) < dim || this.typesSel().length > 0; }
  inScope(r) {
    const s = this.state; if (s.day) return r.d === s.day;
    if (r.d < s.from || r.d > s.to) return false;
    const ty = this.typesSel(); return !ty.length || ty.indexOf(r.type) >= 0;
  }
  sum(arr, f) { return arr.reduce((t, r) => t + (f(r) || 0), 0); }
  calc(ch) {
    const m = this.mo(), dim = this.dimOf(m), ld = this.ldOf(m), R = this.rows(m, ch), thr = this.thr(m, ch), mt = this.mt(m, ch), hasA = !(ch.act && !ch.act.length), S = this.sum.bind(this);
    const sc = R.filter(r => r.has && this.inScope(r)), pl = sc.filter(r => r.tN != null);
    const A = { n: S(sc, r => r.a.n), nc: S(sc, r => r.a.nc), s: S(sc, r => r.a.s), g: S(sc, r => r.a.g), l: S(sc, r => r.a.l), o: S(sc, r => r.a.o), pN: S(pl, r => r.tN), pS: S(pl, r => r.tS), days: sc.length, pdays: pl.length, hit: pl.filter(r => r.a.n >= r.tN).length };
    const done = R.filter(r => r.has), M = { n: S(done, r => r.a.n), pTo: S(R.filter(r => r.d <= ld && r.tN != null), r => r.tN), pRest: S(R.filter(r => r.d > ld && r.tN != null), r => r.tN) };
    M.proj = M.n + M.pRest; M.avg = ld ? M.n / ld : null; M.rr = ld ? M.n / ld * dim : null;
    let Pv = null, PM = null;
    if (m > 1 && hasA) {
      const PR = this.rows(m - 1, ch), pdim = this.dimOf(m - 1), set = sc.map(r => r.d).filter(d => d <= pdim), pr = PR.filter(r => set.indexOf(r.d) >= 0), ppl = pr.filter(r => r.tN != null);
      if (pr.length) Pv = { n: S(pr, r => r.a.n), nc: S(pr, r => r.a.nc), s: S(pr, r => r.a.s), g: S(pr, r => r.a.g), o: S(pr, r => r.a.o), hit: ppl.filter(r => r.a.n >= r.tN).length, pdays: ppl.length };
      const pmt = this.mt(m - 1, ch); if (pmt && ld) PM = { n: S(PR.filter(r => r.d <= ld), r => r.a.n), t: pmt.nmv };
    }
    const scopeLbl = this.state.day ? this.dm(this.isoOf(m, this.state.day)) : this.hasFilter(dim) ? 'lọc ' + sc.length + ' ngày' : ld < dim ? '1–' + ld : 'cả tháng';
    return { ch, m, dim, ld, R, sc, A, M, Pv, PM, thr, mt, hasA, hasPlan: R.some(r => r.tN != null), scopeLbl };
  }
  // ---- thẻ chỉ số ------------------------------------------------------------------------------------
  cmp(cur, prev, lbl, good) {
    if (cur == null || prev == null || !prev) return '';
    const v = cur / prev - 1, up = v >= 0, cls = good == null ? 'flat' : (up === good ? 'up' : 'down');
    return this.pill((up ? '▲ +' : '▼ −') + Math.abs(v * 100).toFixed(1) + '%', cls) + '<span>' + lbl + '</span>';
  }
  pb(v, good) {
    if (v == null || !isFinite(v)) return '';
    return '<span class="dy-pb"><i class="' + (good ? 'g' : v >= 0.7 ? 'y' : 'r') + '" style="width:' + Math.max(3, Math.min(100, v * 100)).toFixed(0) + '%"></i></span>';
  }
  meter(v, mark, cls, max) {
    if (v == null || !isFinite(v)) return '';
    const w = Math.max(2, Math.min(100, v / (max || 1) * 100)), mk = mark == null ? '' : '<b style="left:' + Math.min(100, mark / (max || 1) * 100).toFixed(0) + '%"></b>';
    return '<div class="dy-mt"><i class="' + cls + '" style="width:' + w.toFixed(0) + '%"></i>' + mk + '</div>';
  }
  cardsHtml(X) {
    const m = this.money.bind(this), p = this.pct.bind(this), A = X.A, M = X.M, Pv = X.Pv, hasA = X.hasA, na = '—', pmL = 'T' + (X.m - 1), st = this.state;
    const lbl = 'so với ' + pmL + (st.day ? ' cùng ngày' : ' cùng kỳ');
    const card = (grp, icon, label, value, pillTxt, pillCls, sub, extra) => '<div class="ox-card g-' + grp + '"><div class="ox-cl">' + this.ic(icon) + label + '</div><div class="ox-cv">' + value + '</div><!--M--><div class="ox-cd">' + (pillTxt ? this.pill(pillTxt, pillCls) : '') + (sub ? '<span class="ox-cp">' + sub + '</span>' : '') + '</div>' + (extra ? '<div class="ox-ce">' + extra + '</div>' : '') + '</div>';
    const noA = 'Chưa có đơn hàng', cards = [];
    // 1 NMV vs plan
    const left = A.pN - A.n;
    cards.push(card('rev', 'nmv', 'NMV MTD vs plan · ' + X.scopeLbl, hasA ? m(A.n) : na, hasA ? (A.pN ? 'Đạt ' + p(A.n / A.pN, 1) + ' plan' : 'Chưa có plan') : noA, hasA && A.pN ? (A.n >= A.pN ? 'up' : 'down') : 'flat', A.pN ? 'Plan ' + m(A.pN) + ' · ' + (left > 0 ? 'gap −' : 'vượt +') + m(Math.abs(left)) : '', hasA ? this.cmp(A.n, Pv && Pv.n, lbl, true) + (A.pdays ? '<span class="dy-hit">Đạt KPI ngày: <b>' + A.hit + '/' + A.pdays + '</b>' + (Pv && Pv.pdays ? ' · ' + pmL + ' cùng kỳ ' + Pv.hit + '/' + Pv.pdays : '') + '</span>' : '') : ''));
    // 2 cuối tháng
    const done = X.ld >= X.dim, mt = X.mt, tgt = mt ? mt.nmv : null, fin = done ? M.n : M.proj;
    cards.push(card('rev', 'run-rate', done ? 'Kết quả cả tháng' : 'Run-rate cuối tháng', hasA && X.hasPlan ? m(fin) : na, tgt && hasA ? (done ? 'Đạt ' : '') + p(fin / tgt, 1) + ' target tháng' : (hasA ? 'Chưa có target' : noA), tgt && hasA ? (fin >= tgt ? 'up' : 'down') : 'flat', tgt ? 'Target ' + m(tgt) + (hasA && fin < tgt ? ' · thiếu ' + m(tgt - fin) : '') : '', hasA && !done && M.rr != null && tgt ? 'Theo tốc độ TB: ' + m(M.rr) + ' (' + p(M.rr / tgt, 0) + ' target)' : (done ? '' : '')));
    // 3 CIR
    const cir = A.n && A.s > 0 ? A.s / (A.nc || A.n) : null, dpp = cir != null ? (cir - X.thr) * 100 : null, pcir = Pv && Pv.n && Pv.s > 0 ? Pv.s / (Pv.nc || Pv.n) : null;
    cards.push(card('cost', 'cir', 'CIR MTD vs ngưỡng · ' + X.scopeLbl, hasA ? p(cir, 2) : na, dpp == null ? (hasA ? 'Chưa có Spend' : noA) : (dpp <= 0 ? 'Trong ngưỡng · −' : 'Vượt ngưỡng · +') + Math.abs(dpp).toFixed(2) + 'pp', dpp == null ? 'flat' : dpp <= 0 ? 'up' : 'down', 'Ngưỡng ' + p(X.thr, 2),
      cir != null && pcir != null ? this.pill((cir - pcir <= 0 ? '▼ −' : '▲ +') + Math.abs((cir - pcir) * 100).toFixed(2) + 'pp', cir - pcir <= 0 ? 'up' : 'down') + '<span>' + lbl + '</span>' : ''));
    // 4 cần/ngày để đạt target
    const rest = X.dim - X.ld, need = tgt && rest > 0 ? (tgt - M.n) / rest : null, planRest = rest > 0 && M.pRest ? M.pRest / rest : null, cov = need != null && need > 0 && M.avg != null ? M.avg / need : null;
    cards.push(card('rev', 'target', 'Cần/ngày để đạt target tháng', hasA && need != null ? (need > 0 ? m(need) : 'Đã đạt') : na,
      !hasA ? noA : !tgt ? 'Chưa có target' : rest <= 0 ? 'Đã hết tháng' : cov == null ? '' : 'TB hiện tại = ' + p(cov, 0) + ' mức cần', cov == null ? 'flat' : cov >= 1 ? 'up' : cov >= 0.8 ? 'flat' : 'down',
      hasA && need != null && M.avg != null ? 'TB ' + m(M.avg) + '/ngày · còn ' + rest + ' ngày' : '',
      hasA && planRest != null && need > 0 ? 'Plan các ngày còn lại TB ' + m(planRest) + '/ngày' + (need > planRest * 1.02 ? ' · cần cao hơn plan ' + p(need / planRest - 1, 0) : '') : ''));
    // 5 ROAS · CPO
    const roas = A.s > 0 ? (A.nc || A.n) / A.s : null, proas = Pv && Pv.s > 0 ? (Pv.nc || Pv.n) / Pv.s : null, cpo = A.s > 0 && A.o ? A.s / A.o : null, pcpo = Pv && Pv.s > 0 && Pv.o ? Pv.s / Pv.o : null;
    cards.push(card('cost', 'nmv', 'ROAS · CPO · ' + X.scopeLbl, hasA && roas != null ? '×' + roas.toFixed(1) : na, hasA ? (cpo != null ? 'CPO ' + m(cpo) : 'Chưa có Spend') : noA, 'flat', 'NMV / Spend · Spend / đơn không hủy',
      hasA ? this.cmp(roas, proas, 'ROAS so với ' + pmL, true) + this.cmp(cpo, pcpo, 'CPO so với ' + pmL, false) : ''));
    // 6 chi phí vs plan
    cards.push(card('cost', 'spend', 'Spend MTD vs plan · ' + X.scopeLbl, hasA ? m(A.s) : na, hasA ? (A.pS ? 'Dùng ' + p(A.s / A.pS, 0) + ' plan' : 'Chưa có plan Spend') : noA, hasA && A.pS ? (A.s <= A.pS ? 'up' : 'down') : 'flat', A.pS ? 'Plan ' + m(A.pS) : '', hasA ? this.cmp(A.s, Pv && Pv.s, lbl, null) : ''));
    // 7 ngày gần nhất / ngày chọn
    const dS = st.day || (X.ld > 0 ? X.ld : null), rw = dS ? X.R[dS - 1] : null; let m6 = '';
    if (rw && rw.has) {
      let pv = 0, c = 0; for (let k = 1; k <= 7; k++) { const iso = this.addDays(rw.iso, -k); if (this.ix()[iso]) { pv += this.agg(iso, X.ch.act).n; c++; } }
      const att = rw.tN ? rw.a.n / rw.tN : null; if (att != null) m6 = this.meter(att, 1, att >= 1 ? 'g' : att >= 0.7 ? 'y' : 'r', 1.5);
      cards.push(card('q', 'nmv', (st.day ? 'Ngày đã chọn ' : 'Ngày gần nhất ') + this.dm(rw.iso), m(rw.a.n), att != null ? p(att, 0) + ' KPI ngày' : 'Chưa có KPI ngày', att == null ? 'flat' : att >= 1 ? 'up' : 'down', (rw.tN ? 'KPI ngày ' + m(rw.tN) + ' · ' : '') + (rw.type || rw.dow), (c ? this.cmp(rw.a.n, pv / c, 'so với TB ' + c + ' ngày trước (' + m(pv / c) + ')', true) : '') + (rw.a.s > 0 && rw.a.n ? this.pill('Spend ' + m(rw.a.s), 'flat') + '<span>CIR ' + p(rw.a.s / (rw.a.nc || rw.a.n), 1) + (rw.a.s / (rw.a.nc || rw.a.n) > X.thr ? ' · vượt ngưỡng' : ' · trong ngưỡng') + '</span>' : '')));
    } else cards.push(card('q', 'nmv', 'Ngày gần nhất', na, hasA ? 'Chưa có dữ liệu ngày' : noA, 'flat', '', ''));
    // 8 AOV
    const aov = A.o ? A.n / A.o : null, paov = Pv && Pv.o ? Pv.n / Pv.o : null, canc = A.g ? 1 - A.n / A.g : null;
    cards.push(card('q', 'cancel', 'AOV MTD · ' + X.scopeLbl, hasA && aov != null ? m(aov) : na, hasA ? (canc != null ? 'Cancel rate ' + p(canc, 1) : 'Chưa có GMV') : noA, 'flat', hasA ? A.o.toLocaleString('en-US') + ' đơn không hủy' : '', hasA ? this.cmp(aov, paov, lbl, true) : ''));
    const mts = {
      0: A.pN && hasA ? this.meter(A.n / A.pN, null, A.n >= A.pN ? 'g' : A.n / A.pN >= 0.7 ? 'y' : 'r') : '',
      1: tgt && hasA && X.hasPlan ? this.meter(fin / tgt, null, fin >= tgt ? 'g' : fin / tgt >= 0.9 ? 'y' : 'r') : '',
      2: cir != null ? this.meter(cir / (X.thr * 2), 0.5, cir <= X.thr ? 'g' : cir <= X.thr * 1.5 ? 'y' : 'r') : '',
      3: hasA && cov != null ? this.meter(cov, null, cov >= 1 ? 'g' : cov >= 0.8 ? 'y' : 'r') : '',
      5: hasA && A.pS ? this.meter(A.s / A.pS, null, A.s <= A.pS ? 'g' : 'r') : '',
      6: m6
    };
    cards.forEach((h, i) => { cards[i] = h.replace('<!--M-->', mts[i] || ''); });
    const gp = (t, ix) => '<div class="dy-cg">' + t + '</div><section class="ok-cards dy-cards">' + ix.map(i => cards[i]).join('') + '</section>';
    return gp('Doanh thu · tiến độ', [0, 1, 3, 6]) + gp('Chi phí · chất lượng', [5, 2, 4, 7]);
  }
  // ---- kết luận + cảnh báo ------------------------------------------------------------------------------
  concl(X) {
    const m = this.money.bind(this), p = this.pct.bind(this), A = X.A, ch = X.ch, last = X.ld > 0 ? X.R[X.ld - 1] : null, st = this.state;
    let t, lv = 'y';
    if (!X.hasA) t = ch.label + ': chưa có dữ liệu đơn hàng trong file Order_data, chỉ hiện KPI.';
    else if (!X.hasPlan) t = ch.label + ' · T' + X.m + ': NMV ' + m(A.n) + ' · chưa có KPI ngày cho kênh này.';
    else {
      const att = A.pN ? A.n / A.pN : null; lv = this.lvl(att);
      t = ch.label + ' · T' + X.m + ' ' + X.scopeLbl + ': NMV ' + m(A.n) + (att != null ? ' đạt ' + p(att, 1) + ' plan · ' + (A.pN > A.n ? 'gap −' + m(A.pN - A.n) : 'vượt +' + m(A.n - A.pN)) : '');
      if (!st.day && !this.hasFilter(X.dim) && last && last.has && last.tN) t += ' · ngày ' + this.dm(last.iso) + ' đạt ' + p(last.a.n / last.tN, 0) + ' KPI ngày';
      if (A.pdays) t += ' · ' + A.hit + '/' + A.pdays + ' ngày đạt KPI';
      const cir = A.n && A.s > 0 ? A.s / (A.nc || A.n) : null; if (cir != null) t += ' · CIR ' + p(cir, 2) + (cir <= X.thr ? ' trong ngưỡng ' : ' vượt ngưỡng ') + p(X.thr, 1);
    }
    return '<div class="ok-concl ' + lv + '"><span class="ok-cd"></span>' + this.esc(t) + '</div>';
  }
  alerts(X) {
    const m = this.money.bind(this), p = this.pct.bind(this), A = X.A, M = X.M, ch = X.ch, out = [], st = this.state, dm = this.dm.bind(this), R = X.R;
    if (!X.hasA) { out.push({ lv: 'Info', t: ch.label + ' chưa có dữ liệu đơn hàng', d: 'File Order_data chưa có kênh này, chỉ hiển thị KPI.' }); return out; }
    if (!X.hasPlan) out.push({ lv: 'Info', t: ch.label + ' chưa có KPI ngày', d: 'Hiển thị actual, chưa tính % đạt và gap.' });
    if (A.pN && A.n / A.pN < 0.95) out.push({ lv: A.n / A.pN < 0.5 ? 'Critical' : 'Watch', t: ch.label + ' đạt ' + p(A.n / A.pN, 1) + ' plan ' + X.scopeLbl, d: 'NMV ' + m(A.n) + ' / plan ' + m(A.pN) + ' · gap −' + m(A.pN - A.n) });
    const tgt = X.mt ? X.mt.nmv : null;
    if (tgt && X.ld > 0 && X.ld < X.dim && M.proj < tgt) {
      const need = (tgt - M.n) / (X.dim - X.ld);
      out.push({ lv: M.proj / tgt < 0.9 ? 'Critical' : 'Watch', t: 'Cuối tháng dự kiến ' + m(M.proj) + ' · thiếu ' + m(tgt - M.proj) + ' so với target', d: 'Cần ' + m(need) + '/ngày trong ' + (X.dim - X.ld) + ' ngày còn lại · TB hiện tại ' + m(M.avg) + '/ngày (' + p(M.avg ? M.avg / need : null, 0) + ' mức cần)' });
    }
    const cir = A.n && A.s > 0 ? A.s / (A.nc || A.n) : null;
    if (cir != null && cir > X.thr) out.push({ lv: cir > X.thr * 1.5 ? 'Critical' : 'Watch', t: 'CIR ' + p(cir, 2) + ' vượt ngưỡng ' + p(X.thr, 1), d: 'Spend ' + m(A.s) + ' · NMV ' + m(A.n) + ' · ' + X.scopeLbl });
    const ov = X.sc.filter(r => r.a.n > 0 && r.a.s > 0 && r.a.s / (r.a.nc || r.a.n) > X.thr);
    if (ov.length) out.push({ lv: 'Info', t: ov.length + ' ngày CIR vượt ngưỡng ' + p(X.thr, 1), d: ov.slice(-6).map(r => dm(r.iso) + ' ' + p(r.a.s / (r.a.nc || r.a.n), 1)).join(' · ') + (ov.length > 6 ? ' · …' : '') });
    let k = X.ld; while (k >= 1 && R[k - 1].tN != null && R[k - 1].a.n < R[k - 1].tN) k--;
    const streak = X.ld - k;
    if (!st.day && streak >= 3) out.push({ lv: streak >= 5 ? 'Critical' : 'Watch', t: streak + ' ngày liên tiếp dưới KPI ngày', d: dm(R[k].iso) + ' → ' + dm(R[X.ld - 1].iso) });
    const worst = X.sc.filter(r => r.tN).map(r => ({ r, a: r.a.n / r.tN })).sort((a, b) => a.a - b.a)[0];
    if (worst && worst.a < 0.5) out.push({ lv: 'Info', t: 'Ngày thấp nhất: ' + dm(worst.r.iso) + ' chỉ đạt ' + p(worst.a, 0) + ' KPI ngày', d: (worst.r.type || worst.r.dow) + ' · NMV ' + m(worst.r.a.n) + ' / KPI ' + m(worst.r.tN) });
    const up = R.filter(r => r.d > X.ld && r.d <= X.ld + 12 && r.type && r.type !== 'BAU');
    if (up.length) out.push({ lv: 'Info', t: 'Sắp tới: ' + up.map(r => r.type + ' ' + dm(r.iso)).join(', '), d: 'KPI ngày: ' + up.map(r => dm(r.iso) + ' ' + (r.tN ? m(r.tN) : '—')).join(' · ') });
    if (X.m === this.lastMonth() && (ch.key === 'total' || ch.key === 'websocial')) {
      const last = this.lastIso();
      (this.D().channels || []).filter(x => x.spendable && x.spendLast && x.spendLast < last && (ch.key === 'total' || x.key === 'Harasocial' || x.key === 'Website')).forEach(x => out.push({ lv: 'Watch', t: x.name + ' thiếu Spend từ ' + dm(this.nextDay(x.spendLast)), d: 'CIR, ROAS, CPO của ' + (ch.key === 'total' ? 'Total Ecom' : 'Website/Social') + ' đang thiếu phần chi phí này.' }));
    }
    return out.slice(0, 8);
  }
  // ---- biểu đồ -------------------------------------------------------------------------------------------
  bands(X, L, bw, T, ph, labY) {
    let s = '', k = 0;
    X.R.forEach((r, i) => { if (!r.type || r.type === 'BAU') return; const c = this.TYPEC[r.type] || '#e3edfb'; s += '<rect x="' + (L + bw * i).toFixed(1) + '" y="' + T + '" width="' + bw.toFixed(1) + '" height="' + ph + '" fill="' + c + '" opacity=".55"/>'; if (labY != null) s += '<text x="' + (L + bw * i + bw / 2).toFixed(1) + '" y="' + (labY + (k++ % 2) * 11) + '" text-anchor="middle" class="dy-ev">' + this.esc(r.type) + '</text>'; });
    return s;
  }
  evLegend(X) { const t = {}; X.R.forEach(r => { if (r.type && r.type !== 'BAU') t[r.type] = 1; }); return Object.keys(t).map(k => ({ c: this.TYPEC[k] || '#e3edfb', t: k })); }
  dayTip(X, r) {
    const m = this.money.bind(this), p = this.pct.bind(this), a = r.a;
    return this.tipT(this.dm(r.iso) + ' · ' + r.dow + (r.type ? ' · ' + r.type : ''), r.has ? [
      ['NMV', m(a.n), '#2f6df0'], r.tN != null ? ['KPI ngày', m(r.tN), '#2fc7b8', 'kpi'] : ['KPI ngày', 'chưa có', '#94a3b8'],
      r.tN != null ? ['% đạt KPI', p(a.n / r.tN, 0), a.n >= r.tN ? '#12924f' : '#d6334f'] : null, r.tN != null ? [a.n >= r.tN ? 'Vượt KPI' : 'Còn thiếu', m(Math.abs(r.tN - a.n)), '#94a3b8'] : null,
      a.s > 0 ? ['Spend · CIR', m(a.s) + ' · ' + (a.n ? p(a.s / (a.nc || a.n), 2) : '—'), '#94a3b8'] : null, a.o ? ['Đơn không hủy · AOV', a.o + ' · ' + m(a.n / a.o), '#94a3b8'] : null
    ] : [r.tN != null ? ['KPI ngày (kế hoạch)', m(r.tN), '#2fc7b8', 'kpi'] : ['KPI ngày', 'chưa có', '#94a3b8'], ['Trạng thái', 'chưa có số liệu', '#94a3b8']]);
  }
  wrap(cls, svg) { return '<div class="ox-tw"><div class="' + cls + '">' + svg + '</div></div>'; }
  // chart 1: NMV theo ngày
  chDay(X) {
    const R = X.R, n = R.length, m = this.money.bind(this), p = this.pct.bind(this), W = 1180, H = 340, L = 58, Rr = 12, T = 66, B = 50, pw = W - L - Rr, ph = H - T - B, bw = pw / n;
    const vs = R.map(r => Math.max(r.a ? r.a.n : 0, r.tN || 0)).filter(v => v > 0).sort((a, b) => a - b), top = vs.length ? vs[vs.length - 1] : 1, p85 = vs.length ? vs[Math.floor(0.85 * (vs.length - 1))] : 1, cap = this.niceMax(p85 * 1.7);
    let mx = this.niceMax(top * 1.06), clip = false; if (top > cap * 1.25) { mx = cap; clip = true; }
    const Y = v => T + ph - Math.min(v, mx) / mx * ph, cx = i => L + bw * i + bw / 2;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg"><defs><linearGradient id="dyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ea8ff"/><stop offset="1" stop-color="#2f6df0"/></linearGradient></defs>' + this.axT(L, 'NMV mỗi ngày (₫) · cột = NMV thực tế, đường = KPI ngày');
    s += this.bands(X, L, bw, T, ph, 22);
    for (let i = 0; i <= 4; i++) { const y = T + ph - ph * i / 4; s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + this.short(mx * i / 4) + '</text>'; }
    R.forEach((r, i) => {
      const sc = this.inScope(r), sel = this.state.day === r.d, a = r.has ? r.a.n : 0, miss = r.tN != null && r.has && a < r.tN;
      s += '<g class="ox-hit' + (sc ? '' : ' dy-out') + '"' + (r.has ? ' data-day="' + r.d + '"' : '') + this.tipAttr(this.dayTip(X, r)) + '><rect class="ox-hov' + (sel ? ' ox-sel' : '') + '" x="' + (L + bw * i) + '" y="' + T + '" width="' + bw + '" height="' + (ph + B - 6) + '" rx="6" ' + (sel ? 'style="fill:rgba(47,109,240,.16)"' : '') + '/>';
      if (a > 0) s += '<rect x="' + (L + bw * i + bw * 0.17).toFixed(1) + '" y="' + Y(a).toFixed(1) + '" width="' + (bw * 0.66).toFixed(1) + '" height="' + Math.max(1, T + ph - Y(a)).toFixed(1) + '" rx="4" fill="' + (miss ? '#ff9aa8' : 'url(#dyg)') + '"/>';
      if (r.has && a > mx) s += '<text x="' + cx(i).toFixed(1) + '" y="' + (T - 17) + '" text-anchor="middle" class="ok-v">▲ ' + this.short(a) + '</text>';
      if (r.has && r.tN) s += '<text x="' + cx(i).toFixed(1) + '" y="' + (a > mx ? T - 5 : Y(a) - 5).toFixed(1) + '" text-anchor="middle" class="ok-att ' + this.lvl(a / r.tN) + '">' + Math.round(a / r.tN * 100) + '%</text>';
      s += '<text x="' + cx(i).toFixed(1) + '" y="' + (H - 30) + '" text-anchor="middle" class="ox-ax' + (sel ? ' ox-axon' : '') + '">' + r.d + '</text><text x="' + cx(i).toFixed(1) + '" y="' + (H - 15) + '" text-anchor="middle" class="ox-axw' + (r.dow === 'CN' || r.dow === 'T7' ? ' dy-we' : '') + '">' + r.dow + '</text></g>';
    });
    const kp = R.map((r, i) => r.tN != null ? [i, cx(i).toFixed(1) + ',' + Y(r.tN).toFixed(1)] : null).filter(Boolean), pastK = kp.filter(q => !R[q[0]].future).map(q => q[1]), futK = kp.filter(q => q[0] >= Math.max(0, X.ld - 1)).map(q => q[1]);
    if (pastK.length > 1) s += '<polyline points="' + pastK.join(' ') + '" fill="none" stroke="var(--kpi-mark)" stroke-width="2.6" stroke-linejoin="round" pointer-events="none"/>';
    if (futK.length > 1) s += '<polyline points="' + futK.join(' ') + '" fill="none" stroke="var(--kpi-mark)" stroke-width="2.2" stroke-dasharray="5 4" opacity=".55" pointer-events="none"/>';
    s += kp.map(q => '<circle cx="' + q[1].split(',')[0] + '" cy="' + q[1].split(',')[1] + '" r="3" fill="#fff" stroke="var(--kpi-mark)" stroke-width="2" ' + (R[q[0]].future ? 'opacity=".55"' : '') + ' pointer-events="none"/>').join('');
    s += '</svg>';
    const done = R.filter(r => r.has && r.tN != null), hit = done.filter(r => r.a.n >= r.tN), best = done.slice().sort((a, b) => b.a.n - a.a.n)[0];
    return this.panel('ox-c12', 'NMV theo ngày · Actual so với KPI ngày', 'Bấm một cột để xem riêng ngày đó trên cả trang · ngày mờ nằm ngoài bộ lọc · ' + (X.ld < X.dim ? 'đường đứt = KPI các ngày chưa tới' : 'tháng đã kết thúc') + (clip ? ' · trục cắt ở ' + this.short(mx) + ', cột có ▲ vượt trục (ghi giá trị thật)' : ''),
      this.wrap('dy-wide', s), done.length ? 'Đạt KPI ' + hit.length + '/' + done.length + ' ngày' + (best ? ' · cao nhất ' + this.dm(best.iso) + ' ' + m(best.a.n) : '') + '. Số % trên đầu cột = NMV / KPI của đúng ngày đó.' : 'Chưa có ngày nào có KPI và dữ liệu.',
      this.legend([{ c: '#2f6df0', t: 'Cột xanh = đạt KPI ngày' }, { c: '#ff9aa8', t: 'Cột hồng = trượt KPI ngày' }, { c: 'var(--kpi-mark)', t: 'Đường cyan = KPI ngày', line: 1 }].concat(this.evLegend(X))));
  }
  // chart 2: lũy kế
  chCum(X) {
    const R = X.R, dim = X.dim, ld = X.ld, M = X.M, tgt = X.mt ? X.mt.nmv : null, m = this.money.bind(this), p = this.pct.bind(this), W = 720, H = 330, L = 58, Rr = 22, T = 48, B = 38, pw = W - L - Rr, ph = H - T - B;
    if (!X.hasPlan && !X.hasA) return this.panel('ox-c7', 'Tiến độ lũy kế theo ngày', '', '<div class="ok-empty">Kênh này chưa có dữ liệu.</div>', '', '');
    const endPlan = R[dim - 1].planCum, cumA = ld ? R[ld - 1].actCum : 0, rr = ld ? cumA / ld * dim : null;
    const mx = this.niceMax(Math.max(endPlan || 0, tgt || 0, cumA, rr || 0, 1) * 1.05), x = d => L + pw * (d - 1) / Math.max(1, dim - 1), Y = v => T + ph - v / mx * ph, bw = pw / Math.max(1, dim - 1);
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">' + this.axT(L, 'NMV lũy kế (₫) · liền = thực tế, đứt = plan, chấm = nếu giữ tốc độ TB');
    R.forEach((r, i) => { if (r.type && r.type !== 'BAU') s += '<rect x="' + (x(r.d) - bw / 2).toFixed(1) + '" y="' + T + '" width="' + bw.toFixed(1) + '" height="' + ph + '" fill="' + (this.TYPEC[r.type] || '#e3edfb') + '" opacity=".5"/>'; });
    for (let i = 0; i <= 4; i++) { const y = T + ph - ph * i / 4; s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + this.short(mx * i / 4) + '</text>'; }
    for (let d = 1; d <= dim; d += (dim > 20 ? 3 : 2)) s += '<text x="' + x(d) + '" y="' + (H - 14) + '" text-anchor="middle" class="ox-ax">' + d + '</text>';
    const pp = R.filter(r => r.tN != null).map(r => x(r.d).toFixed(1) + ',' + Y(r.planCum).toFixed(1));
    if (pp.length > 1) s += '<polyline points="' + pp.join(' ') + '" fill="none" stroke="var(--kpi-mark)" stroke-width="2.4" stroke-dasharray="6 4"/>';
    const ap = R.filter(r => r.has).map(r => x(r.d).toFixed(1) + ',' + Y(r.actCum).toFixed(1));
    if (ap.length) s += '<polygon points="' + x(1).toFixed(1) + ',' + Y(0).toFixed(1) + ' ' + ap.join(' ') + ' ' + x(ld).toFixed(1) + ',' + Y(0).toFixed(1) + '" fill="rgba(47,109,240,.14)"/><polyline points="' + ap.join(' ') + '" fill="none" stroke="#2f6df0" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
    if (X.hasA && ld > 0 && ld < dim) {
      s += '<line x1="' + x(ld) + '" y1="' + Y(cumA) + '" x2="' + x(dim) + '" y2="' + Y(rr) + '" stroke="#64748b" stroke-width="2.4" stroke-dasharray="2 5" stroke-linecap="round"/><circle cx="' + x(dim) + '" cy="' + Y(rr) + '" r="4.5" fill="#64748b"/>';
      if (tgt) s += '<line x1="' + x(ld) + '" y1="' + Y(cumA) + '" x2="' + x(dim) + '" y2="' + Y(tgt) + '" stroke="#f59e0b" stroke-width="2.4" stroke-linecap="round"/><circle cx="' + x(dim) + '" cy="' + Y(tgt) + '" r="4.5" fill="#f59e0b"/><text x="' + (x(dim) - 8) + '" y="' + (Y(tgt) - 9) + '" text-anchor="end" class="ok-v" style="fill:#b45309">Target ' + this.short(tgt) + '</text>';
      s += '<circle cx="' + x(ld) + '" cy="' + Y(cumA) + '" r="4.5" fill="#2f6df0" stroke="#fff" stroke-width="2"/>';
    }
    R.forEach(r => {
      const sel = this.state.day === r.d, tip = this.tipT(this.dm(r.iso) + ' · ' + r.dow + (r.type ? ' · ' + r.type : ''), [r.has ? ['NMV lũy kế', m(r.actCum), '#2f6df0'] : null, r.tN != null ? ['Plan lũy kế', m(r.planCum), '#2fc7b8', 'kpi'] : null, r.has && r.tN != null ? ['% đạt plan lũy kế', p(r.actCum / r.planCum, 1), r.actCum >= r.planCum ? '#12924f' : '#d6334f'] : null, r.has ? ['NMV ngày', m(r.a.n), '#94a3b8'] : null]);
      s += '<g class="ox-hit"' + (r.has ? ' data-day="' + r.d + '"' : '') + this.tipAttr(tip) + '><rect class="ox-hov' + (sel ? ' ox-sel' : '') + '" x="' + (x(r.d) - bw / 2).toFixed(1) + '" y="' + T + '" width="' + bw.toFixed(1) + '" height="' + ph + '" ' + (sel ? 'style="fill:rgba(47,109,240,.16)"' : '') + '/></g>';
    });
    s += '</svg>';
    let foot;
    if (!X.hasA) foot = 'Chưa có dữ liệu đơn hàng.';
    else if (tgt && ld > 0 && ld < dim) { const need = (tgt - cumA) / (dim - ld), avg = cumA / ld; foot = 'Cần ' + m(need) + '/ngày trong ' + (dim - ld) + ' ngày còn lại để chạm target ' + m(tgt) + ' · TB hiện tại ' + m(avg) + '/ngày = ' + p(avg / need, 0) + ' mức cần. Nếu giữ tốc độ TB: ' + m(rr) + ' (' + p(rr / tgt, 0) + ' target).'; }
    else foot = ld >= dim && tgt ? 'Tháng đã kết thúc: ' + m(cumA) + ' (' + p(cumA / tgt, 0) + ' target tháng).' : 'Chưa có target tháng cho kênh này.';
    return this.panel('ox-c7', 'Tiến độ lũy kế theo ngày', 'Có kịp target tháng không · bấm một điểm để chọn ngày', this.wrap('dy-w7', s), foot,
      this.legend([{ c: '#2f6df0', t: 'Liền = NMV lũy kế', line: 1 }, { c: 'var(--kpi-mark)', t: 'Đứt = plan lũy kế', line: 1 }, { c: '#f59e0b', t: 'Cam = đường cần đi để đạt target', line: 1 }, { c: '#64748b', t: 'Chấm = nếu giữ TB/ngày', line: 1 }]));
  }
  // chart 3: CIR theo ngày
  chCirDay(X) {
    const R = X.R, n = R.length, p = this.pct.bind(this), thr = X.thr, vals = R.filter(r => r.has && r.a.n > 0 && r.a.s > 0).map(r => r.a.s / (r.a.nc || r.a.n));
    if (!vals.length) return this.panel('ox-c5', 'CIR theo ngày so với ngưỡng', '', '<div class="ok-empty">' + (X.hasA ? 'Kênh này chưa có Spend trong tháng.' : 'Chưa có dữ liệu đơn hàng.') + '</div>', '', '');
    const W = 560, H = 330, L = 46, Rr = 10, T = 48, B = 44, pw = W - L - Rr, ph = H - T - B, bw = pw / n, mx = this.niceMax(Math.max.apply(null, vals.concat([thr])) * 1.12), Y = v => T + ph - v / mx * ph, cx = i => L + bw * i + bw / 2;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg"><defs><linearGradient id="dyc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ea8ff"/><stop offset="1" stop-color="#2f6df0"/></linearGradient></defs>' + this.axT(L, 'CIR = Spend / NMV mỗi ngày · cột = thực tế, đường = ngưỡng');
    s += this.bands(X, L, bw, T, ph, null);
    for (let i = 0; i <= 4; i++) { const y = T + ph - ph * i / 4; s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + (mx * i / 4 * 100).toFixed(0) + '%</text>'; }
    const maxV = Math.max.apply(null, vals);
    R.forEach((r, i) => {
      const c = r.has && r.a.n > 0 && r.a.s > 0 ? r.a.s / (r.a.nc || r.a.n) : null, over = c != null && c > thr, sc = this.inScope(r), sel = this.state.day === r.d;
      const tip = this.tipT(this.dm(r.iso) + ' · ' + r.dow + (r.type ? ' · ' + r.type : ''), r.has ? [c != null ? ['CIR ngày', p(c, 2), over ? '#ff7a8a' : '#2f6df0'] : ['CIR ngày', 'chưa có Spend', '#94a3b8'], ['Ngưỡng', p(thr, 2), '#2fc7b8', 'kpi'], c != null ? [over ? 'Vượt ngưỡng' : 'Dưới ngưỡng', Math.abs((c - thr) * 100).toFixed(2) + 'pp', '#94a3b8'] : null, ['Spend · NMV', this.money(r.a.s) + ' · ' + this.money(r.a.n), '#94a3b8']] : [['Trạng thái', 'chưa có số liệu', '#94a3b8']]);
      s += '<g class="ox-hit' + (sc ? '' : ' dy-out') + '"' + (r.has ? ' data-day="' + r.d + '"' : '') + this.tipAttr(tip) + '><rect class="ox-hov" x="' + (L + bw * i) + '" y="' + T + '" width="' + bw + '" height="' + (ph + B - 6) + '" rx="5" ' + (sel ? 'style="fill:rgba(47,109,240,.16)"' : '') + '/>';
      if (c != null) s += '<rect x="' + (L + bw * i + bw * 0.2).toFixed(1) + '" y="' + Y(c).toFixed(1) + '" width="' + (bw * 0.6).toFixed(1) + '" height="' + Math.max(1, T + ph - Y(c)).toFixed(1) + '" rx="3" fill="' + (over ? '#ff7a8a' : 'url(#dyc)') + '"/>' + (over || c === maxV ? '<text x="' + cx(i).toFixed(1) + '" y="' + (Y(c) - 4).toFixed(1) + '" text-anchor="middle" class="ok-v' + (over ? ' r' : '') + '">' + (c * 100).toFixed(1) + '</text>' : '');
      if (r.d === 1 || r.d % 2 === 1) s += '<text x="' + cx(i).toFixed(1) + '" y="' + (H - 18) + '" text-anchor="middle" class="ox-ax' + (sel ? ' ox-axon' : '') + '">' + r.d + '</text>';
      s += '</g>';
    });
    s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + Y(thr) + '" y2="' + Y(thr) + '" stroke="var(--kpi-mark)" stroke-width="2.4" stroke-dasharray="6 4" pointer-events="none"/><text x="' + (W - Rr - 16) + '" y="' + (Y(thr) - 6) + '" text-anchor="end" class="ok-v k">Ngưỡng ' + (thr * 100).toFixed(1) + '%</text></svg>';
    const nOver = R.filter(r => r.has && r.a.n > 0 && r.a.s > 0 && r.a.s / (r.a.nc || r.a.n) > thr).length;
    return this.panel('ox-c5', 'CIR theo ngày so với ngưỡng', 'Cột đỏ = ngày vượt ngưỡng ' + (thr * 100).toFixed(1) + '%', this.wrap('dy-w5', s), nOver ? nOver + ' ngày vượt ngưỡng. Ngày không có Spend (hoặc chưa ghi nhận) không hiện cột.' : 'Không ngày nào vượt ngưỡng. Ngày không có Spend không hiện cột.',
      this.legend([{ c: '#2f6df0', t: 'Cột xanh = trong ngưỡng' }, { c: '#ff7a8a', t: 'Cột đỏ = vượt ngưỡng' }, { c: 'var(--kpi-mark)', t: 'Đường = ngưỡng CIR', line: 1 }]));
  }
  // chart 4: cột chồng theo kênh
  chStack(X) {
    const R = X.R, n = R.length, D = this.D(), m = this.money.bind(this), p = this.pct.bind(this), W = 1180, H = 340, L = 58, Rr = 12, T = 66, B = 50, pw = W - L - Rr, ph = H - T - B, bw = pw / n;
    const G = [{ k: 'Shopee', a: [0], f: D.channels[0] && D.channels[0].fill }, { k: 'TikTok Shop', a: [1], f: D.channels[1] && D.channels[1].fill }, { k: 'Website/Social', a: [2, 3], f: D.channels[2] && D.channels[2].fill }, { k: 'Lazada · Tiki', a: [4], f: D.channels[4] && D.channels[4].fill }, { k: 'Khác', a: [5], f: D.channels[5] && D.channels[5].fill }];
    const days = R.map(r => { const by = G.map(g => r.future ? 0 : this.agg(r.iso, g.a).n); return { r, by, tot: by.reduce((a, b) => a + b, 0) }; });
    const tv = days.map(x => x.tot).filter(v => v > 0).sort((a, b) => a - b), ttop = tv.length ? tv[tv.length - 1] : 1, tcap = this.niceMax((tv.length ? tv[Math.floor(0.9 * (tv.length - 1))] : 1) * 1.7);
    let mx = this.niceMax(ttop * 1.08), clip = false; if (ttop > tcap * 1.25) { mx = tcap; clip = true; }
    const Y = v => T + ph - Math.min(v, mx) / mx * ph, cx = i => L + bw * i + bw / 2;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">' + this.axT(L, 'NMV mỗi ngày (₫) · mỗi màu = 1 kênh bán hàng');
    s += this.bands(X, L, bw, T, ph, 22);
    for (let i = 0; i <= 4; i++) { const y = T + ph - ph * i / 4; s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + this.short(mx * i / 4) + '</text>'; }
    const totals = G.map(() => 0);
    days.forEach((x, i) => {
      const r = x.r, sc = this.inScope(r), sel = this.state.day === r.d, k = x.tot > mx ? ph / x.tot : ph / mx; let acc = 0;
      x.by.forEach((v, j) => { if (sc) totals[j] += v; });
      const tip = this.tipT(this.dm(r.iso) + ' · ' + r.dow + (r.type ? ' · ' + r.type : ''), x.tot ? G.map((g, j) => x.by[j] ? [g.k, m(x.by[j]) + ' · ' + p(x.by[j] / x.tot, 0), g.f] : null).concat([['Tổng NMV', m(x.tot), '#0f1b3a']]) : [['Trạng thái', 'chưa có số liệu', '#94a3b8']]);
      s += '<g class="ox-hit' + (sc ? '' : ' dy-out') + '"' + (r.has ? ' data-day="' + r.d + '"' : '') + this.tipAttr(tip) + '><rect class="ox-hov' + (sel ? ' ox-sel' : '') + '" x="' + (L + bw * i) + '" y="' + T + '" width="' + bw + '" height="' + (ph + B - 6) + '" rx="6" ' + (sel ? 'style="fill:rgba(47,109,240,.16)"' : '') + '/>';
      x.by.forEach((v, j) => { if (!v) return; const h = v * k, y = T + ph - acc - h; acc += h; s += '<rect x="' + (L + bw * i + bw * 0.17).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw * 0.66).toFixed(1) + '" height="' + h.toFixed(1) + '" style="rx:2" fill="' + G[j].f + '"/>'; });
      if (x.tot) s += '<text x="' + cx(i).toFixed(1) + '" y="' + (Y(x.tot) - 5).toFixed(1) + '" text-anchor="middle" class="ox-val">' + (x.tot > mx ? '▲ ' : '') + this.short(x.tot) + '</text>';
      s += '<text x="' + cx(i).toFixed(1) + '" y="' + (H - 30) + '" text-anchor="middle" class="ox-ax' + (sel ? ' ox-axon' : '') + '">' + r.d + '</text><text x="' + cx(i).toFixed(1) + '" y="' + (H - 15) + '" text-anchor="middle" class="ox-axw' + (r.dow === 'CN' || r.dow === 'T7' ? ' dy-we' : '') + '">' + r.dow + '</text></g>';
    });
    s += '</svg>';
    const tot = totals.reduce((a, b) => a + b, 0);
    return this.panel('ox-c12', 'NMV theo kênh mỗi ngày', 'Kênh nào kéo hoặc làm tụt ngày đó · luôn hiện đủ các kênh, không đổi theo chip kênh · bấm cột để chọn ngày' + (clip ? ' · trục cắt ở ' + this.short(mx) + ', cột có ▲ vượt trục' : ''), this.wrap('dy-wide', s), 'Tỷ trọng trong phạm vi đang lọc (' + X.scopeLbl + '). Seller chưa có dữ liệu đơn hàng. Khác = đơn không gán được kênh.',
      this.legend(G.map((g, j) => ({ c: g.f, t: g.k + (tot ? ' ' + p(totals[j] / tot, 0) : '') }))));
  }
  // chart 5: heatmap kênh × ngày
  chHeat(X) {
    const R = X.R, n = R.length, p = this.pct.bind(this), m = this.money.bind(this), st = this.state, gtc = 'grid-template-columns:116px repeat(' + n + ',minmax(26px,1fr))';
    const head = '<div class="dy-hr dy-hh" style="' + gtc + '"><div class="dy-hl" style="cursor:default">Kênh</div>' + R.map(r => '<div class="' + (st.day === r.d ? 'on' : '') + '"' + (r.has ? ' data-day="' + r.d + '"' : '') + (r.type && r.type !== 'BAU' ? ' style="box-shadow:inset 0 3px 0 ' + (this.TYPEC[r.type] || '#cbd5e1') + '"' : '') + '>' + r.d + '<small>' + r.dow + '</small></div>').join('') + '</div>';
    const body = this.CH.map(ch => {
      const C = ch.key === X.ch.key ? X : this.calc(ch), hasA = C.hasA;
      const cells = C.R.map(r => {
        const att = r.has && r.tN ? r.a.n / r.tN : null, sel = st.ch === ch.key && st.day === r.d, sc = this.inScope(r);
        const tip = this.tipT(ch.label + ' · ' + this.dm(r.iso) + ' · ' + r.dow, r.has ? [['NMV', m(r.a.n), '#2f6df0'], r.tN ? ['KPI ngày', m(r.tN), '#2fc7b8', 'kpi'] : ['KPI ngày', 'chưa có', '#94a3b8'], att != null ? ['% đạt KPI', p(att, 0), att >= 1 ? '#12924f' : '#d6334f'] : null] : [['Trạng thái', hasA ? 'chưa có số liệu' : 'chưa có đơn hàng', '#94a3b8']]);
        const cls = !r.has ? 'f' : att == null ? 'n' : this.lvl(att);
        return '<div class="dy-hc ' + cls + (sel ? ' sel' : '') + '"' + (r.has ? ' data-cell="' + ch.key + '|' + r.d + '"' : '') + (sc ? '' : ' style="opacity:.35"') + this.tipAttr(tip) + '>' + (att != null ? Math.round(att * 100) : (r.has ? '–' : '')) + '</div>';
      }).join('');
      return '<div class="dy-hr" style="' + gtc + '"><div class="dy-hl' + (st.ch === ch.key ? ' on' : '') + '" data-ch="' + ch.key + '">' + this.esc(ch.label) + '</div>' + cells + '</div>';
    }).join('');
    return this.panel('ox-c12', '% đạt KPI ngày · kênh × ngày', 'Số trong ô = NMV / KPI ngày (%) · bấm một ô để chọn kênh và ngày đó cho cả trang', '<div class="ox-tw"><div class="dy-hm">' + head + body + '</div></div>', 'Dải màu trên đầu ngày = ngày sự kiện (Sale, Double Day, Mid-month, Payday). Ô xám = kênh chưa có KPI ngày; ô nhạt = ngày chưa tới.',
      this.legend([{ c: '#ffc4cc', t: 'Đỏ < 70% KPI' }, { c: '#ffe7a1', t: 'Vàng 70–100%' }, { c: '#bdeed0', t: 'Xanh ≥ 100%' }, { c: '#e2e8f0', t: 'Chưa có KPI' }]));
  }
  // ---- bảng theo kênh (tab Quy mô | Hiệu quả) ---------------------------------------------------------------
  tblChan(X) {
    const m = this.money.bind(this), p = this.pct.bind(this), cur = X.ch.key, cg = this.state.cg;
    const sg = v => v == null ? '—' : '<span class="' + (v >= 0 ? 'okw' : 'badw') + '">' + (v >= 0 ? '+' : '−') + m(Math.abs(v)) + '</span>';
    const GN = { plan: 'Kế hoạch', fc: 'Dự kiến cuối tháng', cost: 'Chi phí', eff: 'Hiệu quả' };
    const cn = C => { const A = C.A; return { A, hasA: C.hasA, fin: C.ld >= C.dim ? C.M.n : C.M.proj, att: A.pN ? A.n / A.pN : null, cir: A.n && A.s > 0 ? A.s / (A.nc || A.n) : null, use: A.pS ? A.s / A.pS : null }; };
    const COLS = [
      { g: 'fix', h: 'Actual MTD', f: (C, o) => o.hasA ? '<b>' + m(o.A.n) + '</b>' : '—' },
      { g: 'plan', h: 'Plan MTD', f: (C, o) => o.A.pN ? m(o.A.pN) : '—' },
      { g: 'plan', h: '% đạt plan', f: (C, o) => o.att != null ? '<span class="' + (o.att >= 1 ? 'okw' : 'badw') + '">' + p(o.att, 1) + '</span>' + this.pb(o.att, o.att >= 1) : '—' },
      { g: 'plan', h: 'Gap', f: (C, o) => o.A.pN && o.hasA ? sg(o.A.n - o.A.pN) : '—' },
      { g: 'fc', h: 'Cuối tháng (dự kiến)', f: (C, o) => o.hasA && C.hasPlan ? m(o.fin) : '—' },
      { g: 'fc', h: '% target', f: (C, o) => C.mt && o.hasA && C.hasPlan ? p(o.fin / C.mt.nmv, 1) : '—' },
      { g: 'cost', h: 'Spend MTD', f: (C, o) => o.hasA && o.A.s > 0 ? '<span class="dy-sp">' + m(o.A.s) + '</span>' : '—' },
      { g: 'cost', h: 'CIR', f: (C, o) => o.cir != null ? '<b class="' + (o.cir <= C.thr ? 'okw' : 'badw') + '">' + p(o.cir, 2) + '</b>' : '—' },
      { g: 'cost', h: '% dùng Spend', f: (C, o) => o.use != null ? '<span class="' + (o.use <= 1 ? 'okw' : 'badw') + '">' + p(o.use, 0) + '</span>' + this.pb(o.use, o.use <= 1) : '—' },
      { g: 'eff', h: 'Plan Spend', f: (C, o) => o.A.pS ? m(o.A.pS) : '—' },
      { g: 'eff', h: 'Ngưỡng CIR', f: (C, o) => C.mt ? p(C.thr, 2) : '—' },
      { g: 'eff', h: 'ROAS', f: (C, o) => o.cir != null ? '×' + ((o.A.nc || o.A.n) / o.A.s).toFixed(1) : '—' },
      { g: 'eff', h: 'CPO', f: (C, o) => o.A.s > 0 && o.A.o ? m(o.A.s / o.A.o) : '—' },
      { g: 'eff', h: 'AOV', f: (C, o) => o.A.o ? m(o.A.n / o.A.o) : '—' }
    ].filter(c => c.g === 'fix' || cg[c.g]);
    const cs = this.CH.map(ch => ch.key === cur ? X : this.calc(ch));
    const body = cs.map(C => { const o = cn(C); return '<tr class="' + (C.ch.key === cur ? 'sel ' : '') + (C.hasA ? '' : 'na') + '" data-ch="' + C.ch.key + '"><td class="l"><b>' + this.esc(C.ch.label) + '</b></td>' + COLS.map(c => '<td>' + c.f(C, o) + '</td>').join('') + '</tr>'; }).join('');
    const chips = '<div class="dy-row dy-cc"><span class="dy-lab">Hiển thị cột</span>' + Object.keys(GN).map(k => '<button type="button" class="ox-tab' + (cg[k] ? ' on' : '') + '" data-cg="' + k + '" aria-pressed="' + !!cg[k] + '">' + GN[k] + '</button>').join('') + '</div>';
    const tbl = '<div class="ox-tw"><table class="ox-t dy-t dy-wrp"><thead><tr><th class="l">Kênh</th>' + COLS.map(c => '<th>' + c.h + '</th>').join('') + '</tr></thead><tbody>' + body + '</tbody></table></div>';
    return this.panel('ox-c12', 'Bảng theo kênh · ' + X.scopeLbl, 'Bấm một dòng để chọn kênh cho cả trang · chọn nhóm cột muốn xem', chips + tbl,
      'MTD tính theo phạm vi lọc. Cuối tháng = MTD + plan các ngày còn lại (cả tháng, không đổi theo lọc ngày). CIR = Spend / NMV; ROAS = NMV / Spend; CPO = Spend / đơn không hủy. CIR và ROAS chỉ tính NMV của kênh có Spend trong ngày đó (giống thẻ CIR ở Overview), để không bị kéo thấp bởi kênh thiếu Spend. Total Ecom gồm cả đơn kênh Khác nên có thể lớn hơn tổng các kênh. Kênh thiếu Spend hiện — thay vì 0.', '');
  }
  // ---- Plan vs Actual Spend theo kênh -------------------------------------------------------------------------
  tblSpendPlan(X) {
    const m = this.money.bind(this), p = this.pct.bind(this), cur = X.ch.key, D = this.D(), S = this.sum.bind(this);
    const gaps = (D.channels || []).filter(c => c.spendable && c.spendLast && c.spendLast < this.lastIso()).map(c => c.key);
    const cs = this.CH.filter(c => c.key !== 'seller').map(ch => ch.key === cur ? X : this.calc(ch));
    const rows = cs.map(C => {
      const A = C.A, done = C.R.filter(r => r.has), spM = S(done, r => r.a.s), planM = S(C.R, r => r.tS), rr = C.ld && spM > 0 ? spM / C.ld * C.dim : null, use = A.pS ? A.s / A.pS : null;
      const gap = (C.ch.key === 'total' || C.ch.key === 'websocial') && gaps.length;
      let st, cl; if (!C.hasA) { st = 'Chưa có đơn'; cl = 'flat'; } else if (!A.pS) { st = 'Chưa có plan'; cl = 'flat'; } else if (use > 1.1) { st = 'Vượt plan'; cl = 'down'; } else if (use < 0.8) { st = 'Chưa dùng hết'; cl = 'flat'; } else { st = 'Đúng nhịp'; cl = 'up'; }
      return '<tr class="' + (C.ch.key === cur ? 'sel ' : '') + (C.hasA ? '' : 'na') + '" data-ch="' + C.ch.key + '"><td class="l"><b>' + this.esc(C.ch.label) + '</b></td><td>' + (A.pS ? m(A.pS) : '—') + '</td><td class="dy-sp">' + (C.hasA && A.s > 0 ? m(A.s) : '—') + (gap ? ' <i class="ox-gap" title="Thiếu Spend Facebook/Google sau mốc dữ liệu cuối">⚠</i>' : '') + '</td><td>' + (A.pS && C.hasA && A.s > 0 ? '<span class="' + (A.s <= A.pS ? 'okw' : 'badw') + '">' + (A.s <= A.pS ? '−' : '+') + m(Math.abs(A.s - A.pS)) + '</span>' : '—') + '</td><td>' + (use != null && A.s > 0 ? '<span class="' + (use <= 1 ? 'okw' : 'badw') + '">' + p(use, 0) + '</span>' + this.pb(use, use <= 1) : '—') + '</td><td>' + (planM ? m(planM) : '—') + '</td><td>' + (rr != null ? m(rr) : '—') + '</td><td>' + (planM && C.hasA ? (planM - spM >= 0 ? m(planM - spM) : '<span class="badw">−' + m(spM - planM) + '</span>') : '—') + '</td><td>' + this.pill(st, cl) + '</td></tr>';
    }).join('');
    const head = ['Kênh', 'Plan Spend MTD', 'Actual Spend MTD', 'Chênh', '% dùng plan', 'Plan Spend cả tháng', 'Run-rate cuối tháng', 'Plan còn lại', 'Trạng thái'];
    const tbl = '<div class="ox-tw"><table class="ox-t dy-t dy-wrp"><thead><tr>' + head.map((h, i) => '<th' + (i ? '' : ' class="l"') + '>' + h + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    return this.panel('ox-c12', 'Plan vs Actual Spend theo kênh · ' + X.scopeLbl, 'Kênh nào đang chi vượt hoặc chưa dùng hết plan · bấm một dòng để chọn kênh', tbl,
      'Actual và Plan MTD theo phạm vi lọc; Plan cả tháng và Run-rate tính cả tháng (Run-rate = Spend TB/ngày × số ngày tháng). Trạng thái: Vượt plan > 110%, Chưa dùng hết < 80%, còn lại là Đúng nhịp. Total Ecom và Website/Social có ⚠ khi Facebook/Google còn thiếu dữ liệu chi phí.', '');
  }
  // ---- sự kiện sắp tới ---------------------------------------------------------------------------------------
  tblEvents(X) {
    if (X.m !== this.lastMonth() || !X.hasA) return '';
    const m = this.money.bind(this), p = this.pct.bind(this), last = this.lastIso(), ch = X.ch;
    let cand = X.R.filter(r => r.d > X.ld);
    if (this.BM(X.m + 1)) cand = cand.concat(this.rows(X.m + 1, ch));
    const ev = cand.filter(r => r.type && r.type !== 'BAU' && r.tN != null && r.iso > last && r.iso <= this.addDays(last, 35)).slice(0, 8);
    if (!ev.length) return '';
    const bau = X.R.concat(X.m > 1 ? this.rows(X.m - 1, ch) : []).filter(r => r.has && (!r.type || r.type === 'BAU')).sort((a, z) => a.iso < z.iso ? 1 : -1).slice(0, 14); const base = bau.length ? this.sum(bau, r => r.a.n) / bau.length : null;
    const hist = {}; for (let mm = X.m; mm >= 1; mm--) { this.rows(mm, ch).forEach(r => { if (r.has && r.type && r.type !== 'BAU' && r.tN) (hist[r.type] = hist[r.type] || []).push(r); }); }
    const rows = ev.map(r => {
      const hs = (hist[r.type] || []).sort((a, z) => a.iso < z.iso ? 1 : -1)[0], days = Math.round((Date.parse(r.iso) - Date.parse(last)) / 864e5), x = base ? r.tN / base : null;
      return '<tr><td class="l">' + this.dm(r.iso) + ' · ' + r.dow + '</td><td class="l"><span class="dy-ty" style="background:' + (this.TYPEC[r.type] || '#e3edfb') + '">' + this.esc(r.type) + '</span></td><td>' + (days === 1 ? 'Ngày mai' : 'Sau ' + days + ' ngày') + '</td><td><b>' + m(r.tN) + '</b></td><td>' + (r.tS ? m(r.tS) : '—') + '</td><td>' + (x != null ? '<span class="' + (x >= 4 ? 'badw' : '') + '">×' + x.toFixed(1) + '</span>' : '—') + '</td><td class="l dy-last">' + (hs ? this.dm(hs.iso) + ' (' + hs.type + '): <b>' + m(hs.a.n) + '</b> · <span class="' + (hs.a.n >= hs.tN ? 'okw' : 'badw') + '">' + p(hs.a.n / hs.tN, 0) + ' KPI</span>' : 'Chưa có sự kiện cùng loại trước đó') + '</td></tr>';
    }).join('');
    const head = ['Ngày', 'Loại ngày', 'Còn lại', 'KPI NMV', 'KPI Spend', 'Gấp ngày thường', 'Lần gần nhất cùng loại'];
    const tbl = '<div class="ox-tw"><table class="ox-t dy-t"><thead><tr>' + head.map((h, i) => '<th' + (i === 0 || i === 1 || i === 6 ? ' class="l"' : '') + '>' + h + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    return this.panel('ox-c12', 'Sự kiện sắp tới · ' + ch.label, 'Các ngày Sale, Double Day, Mid-month, Payday trong 35 ngày tới', tbl,
      'Gấp ngày thường = KPI NMV ngày sự kiện ÷ NMV trung bình các ngày thường (BAU) trong 14 ngày gần nhất' + (base ? ' (' + m(base) + '/ngày)' : '') + ' — càng cao càng cần chuẩn bị tồn kho, ngân sách và nội dung sớm. Lần gần nhất cùng loại lấy từ dữ liệu thực tế đã có.', '');
  }
  // ---- bảng theo ngày (tab Doanh thu | Hiệu quả | Đơn hàng) ---------------------------------------------------
  tblDay(X) {
    const m = this.money.bind(this), p = this.pct.bind(this), st = this.state, tab = st.dtab, A = X.A, hasA = X.hasA, thr = X.thr;
    const tabs = [['rev', 'Doanh thu'], ['eff', 'Hiệu quả'], ['ord', 'Đơn hàng'], ['dow', 'Theo thứ']].map(x => '<button type="button" class="ox-tab' + (x[0] === tab ? ' on' : '') + '" data-dtab="' + x[0] + '">' + x[1] + '</button>').join('');
    const ty = this.typesSel(), fl = r => r.d >= st.from && r.d <= st.to && (!ty.length || ty.indexOf(r.type) >= 0);
    const sg = v => v == null ? '—' : '<span class="' + (v >= 0 ? 'okw' : 'badw') + '">' + (v >= 0 ? '+' : '−') + m(Math.abs(v)) + '</span>';
    const pc = (v, good) => v == null ? '—' : '<span class="' + (good ? 'okw' : 'badw') + '">' + p(v, 0) + '</span>';
    const chip = r => r.type ? '<span class="dy-ty" style="background:' + (this.TYPEC[r.type] || '#e3edfb') + '">' + this.esc(r.type) + '</span>' : '<span class="dy-ty" style="background:#eef3fb;color:#7b8aa5">BAU</span>';
    if (tab === 'dow') return this.tblDow(X, tabs, fl);
    let head, cellsOf, tot;
    const cir = (a) => a.n && a.s > 0 ? a.s / (a.nc || a.n) : null;
    if (tab === 'rev') {
      head = ['Ngày', 'Loại ngày', 'KPI NMV', 'NMV', '% đạt', 'Chênh vs KPI', 'GMV', 'Spend', 'CIR', 'Cancel rate'];
      cellsOf = r => { const a = r.a, att = r.has && r.tN ? a.n / r.tN : null; const c = r.has ? cir(a) : null; return [r.tN ? m(r.tN) : '—', r.has ? '<b>' + m(a.n) + '</b>' : '—', pc(att, att >= 1) + this.pb(att, att >= 1), r.has && r.tN ? sg(a.n - r.tN) : '—', r.has ? m(a.g) : '—', r.has && a.s > 0 ? '<span class="dy-sp">' + m(a.s) + '</span>' : '—', c != null ? '<span class="' + (c <= thr ? 'okw' : 'badw') + '">' + p(c, 1) + '</span>' : '—', r.has && a.g ? p(1 - a.n / a.g, 1) : '—']; };
      tot = ['<b>' + (A.pN ? m(A.pN) : '—') + '</b>', '<b>' + (hasA ? m(A.n) : '—') + '</b>', A.pN ? pc(A.n / A.pN, A.n >= A.pN) : '—', A.pN && hasA ? sg(A.n - A.pN) : '—', hasA ? m(A.g) : '—', hasA && A.s > 0 ? '<b>' + m(A.s) + '</b>' : '—', cir(A) != null ? p(cir(A), 1) : '—', hasA && A.g ? p(1 - A.n / A.g, 1) : '—'];
    } else if (tab === 'eff') {
      head = ['Ngày', 'Loại ngày', 'Plan Spend', 'Spend', '% dùng plan', 'CIR', 'vs ngưỡng', 'ROAS', 'CPO'];
      cellsOf = r => { const a = r.a, c = r.has ? cir(a) : null; return [r.tS ? m(r.tS) : '—', r.has ? '<b>' + m(a.s) + '</b>' : '—', r.has && r.tS ? pc(a.s / r.tS, a.s <= r.tS) : '—', c != null ? '<b class="' + (c <= thr ? 'okw' : 'badw') + '">' + p(c, 2) + '</b>' : '—', c != null ? '<span class="' + (c <= thr ? 'okw' : 'badw') + '">' + (c <= thr ? '−' : '+') + Math.abs((c - thr) * 100).toFixed(2) + 'pp</span>' : '—', c != null ? '×' + ((a.nc || a.n) / a.s).toFixed(1) : '—', r.has && a.s > 0 && a.o ? m(a.s / a.o) : '—']; };
      const tc = cir(A); tot = [A.pS ? '<b>' + m(A.pS) + '</b>' : '—', hasA ? '<b>' + m(A.s) + '</b>' : '—', A.pS ? pc(A.s / A.pS, A.s <= A.pS) : '—', tc != null ? '<b>' + p(tc, 2) + '</b>' : '—', tc != null ? (tc <= thr ? '−' : '+') + Math.abs((tc - thr) * 100).toFixed(2) + 'pp' : '—', tc != null ? '×' + ((A.nc || A.n) / A.s).toFixed(1) : '—', A.s > 0 && A.o ? m(A.s / A.o) : '—'];
    } else {
      head = ['Ngày', 'Loại ngày', 'Đơn đặt', 'Đơn không hủy', 'Đơn hủy', 'Tỷ lệ hủy', 'AOV'];
      cellsOf = r => { const a = r.a; return [r.has ? a.l.toLocaleString('en-US') : '—', r.has ? '<b>' + a.o.toLocaleString('en-US') + '</b>' : '—', r.has ? (a.l - a.o).toLocaleString('en-US') : '—', r.has && a.l ? p(1 - a.o / a.l, 1) : '—', r.has && a.o ? m(a.n / a.o) : '—']; };
      tot = [hasA ? '<b>' + A.l.toLocaleString('en-US') + '</b>' : '—', hasA ? '<b>' + A.o.toLocaleString('en-US') + '</b>' : '—', hasA ? (A.l - A.o).toLocaleString('en-US') : '—', hasA && A.l ? p(1 - A.o / A.l, 1) : '—', hasA && A.o ? m(A.n / A.o) : '—'];
    }
    const rows = X.R.filter(fl);
    const wr = {}; rows.filter(r => r.has && r.tN != null).map(r => ({ d: r.d, g: r.a.n - r.tN })).sort((a, z) => a.g - z.g).slice(0, 3).forEach((x, i) => { if (x.g < 0) wr[x.d] = i + 1; });
    const body = '<tr class="tot"><td class="l" colspan="2"><b>Tổng ' + X.scopeLbl + '</b> · ' + A.days + ' ngày</td>' + tot.map(x => '<td>' + x + '</td>').join('') + '</tr>' +
      rows.map(r => '<tr class="' + (r.future ? 'fut ' : '') + (st.day === r.d ? 'sel ' : '') + (wr[r.d] ? 'worst' : '') + '"' + (r.has ? ' data-day="' + r.d + '"' : '') + '><td class="l">' + this.dm(r.iso) + ' · ' + r.dow + (wr[r.d] ? ' <span class="dy-wb" title="Ngày lệch KPI nhiều nhất (theo số tiền)">▼ lệch #' + wr[r.d] + '</span>' : '') + '</td><td class="l">' + chip(r) + '</td>' + cellsOf(r).map(x => '<td>' + x + '</td>').join('') + '</tr>').join('');
    const tbl = '<div class="ox-tw dy-ts"><table class="ox-t dy-t"><thead><tr>' + head.map((h, i) => '<th' + (i > 1 ? '' : ' class="l"') + '>' + h + '</th>').join('') + '</tr></thead><tbody>' + body + '</tbody></table></div>';
    return this.panel('ox-c12', 'Chi tiết theo ngày · ' + X.ch.label + ' · T' + X.m, 'Bấm một dòng để chọn ngày · dòng mờ = ngày chưa tới · nhãn ▼ lệch #1–#3 = 3 ngày hụt KPI nhiều nhất (theo số tiền)', '<div class="ox-tabs ok-tabs">' + tabs + '</div>' + tbl,
      tab === 'rev' ? 'NMV = doanh thu thuần dòng Không hủy; GMV = tất cả dòng; Cancel rate = 1 − NMV / GMV.' : tab === 'eff' ? 'Plan Spend = KPI Spend ngày (hoặc KPI NMV ngày × ngưỡng CIR nếu chưa có). CIR vượt ngưỡng tô đỏ.' : 'Đơn hủy = đơn đặt − đơn không hủy. AOV = NMV / đơn không hủy.', '');
  }
  // ---- bảng trung bình theo thứ ------------------------------------------------------------------------------
  tblDow(X, tabs, fl) {
    const m = this.money.bind(this), p = this.pct.bind(this), st = this.state, S = this.sum.bind(this), order = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const dr = X.R.filter(r => r.has && fl(r));
    const g = order.map(w => { const R = dr.filter(r => r.dow === w), pl = R.filter(r => r.tN != null), n = R.length; return { w, n, R, kpi: pl.length ? S(pl, r => r.tN) / pl.length : null, nmv: n ? S(R, r => r.a.n) / n : null, att: pl.length && S(pl, r => r.tN) ? S(pl, r => r.a.n) / S(pl, r => r.tN) : null, sp: n ? S(R, r => r.a.s) / n : null, cir: S(R, r => r.a.n) && S(R, r => r.a.s) > 0 ? S(R, r => r.a.s) / S(R, r => r.a.n) : null, hit: pl.filter(r => r.a.n >= r.tN).length, pd: pl.length, od: n ? S(R, r => r.a.o) / n : null }; });
    const atts = g.filter(x => x.att != null), best = atts.length ? atts.reduce((a, z) => z.att > a.att ? z : a) : null, worst = atts.length ? atts.reduce((a, z) => z.att < a.att ? z : a) : null;
    const rows = g.map(x => '<tr class="' + (worst && x.w === worst.w && atts.length > 1 ? 'worst' : '') + (!x.n ? ' na' : '') + '"><td class="l"><b>' + x.w + '</b>' + (best && x.w === best.w && atts.length > 1 ? ' <span class="dy-bb">▲ tốt nhất</span>' : '') + (worst && x.w === worst.w && atts.length > 1 ? ' <span class="dy-wb">▼ hụt nhất</span>' : '') + '</td><td>' + x.n + '</td><td>' + (x.kpi != null ? m(x.kpi) : '—') + '</td><td><b>' + (x.nmv != null ? m(x.nmv) : '—') + '</b></td><td>' + (x.att != null ? '<span class="' + (x.att >= 1 ? 'okw' : 'badw') + '">' + p(x.att, 0) + '</span>' + this.pb(x.att, x.att >= 1) : '—') + '</td><td>' + (x.pd ? x.hit + '/' + x.pd : '—') + '</td><td class="dy-sp">' + (x.sp > 0 ? m(x.sp) : '—') + '</td><td>' + (x.cir != null ? '<span class="' + (x.cir <= X.thr ? 'okw' : 'badw') + '">' + p(x.cir, 1) + '</span>' : '—') + '</td><td>' + (x.od != null && x.n ? Math.round(x.od).toLocaleString('en-US') : '—') + '</td></tr>').join('');
    const head = ['Thứ', 'Số ngày', 'KPI NMV TB', 'NMV TB', '% đạt KPI', 'Ngày đạt KPI', 'Spend TB', 'CIR', 'Đơn TB'];
    const tbl = '<div class="ox-tw"><table class="ox-t dy-t"><thead><tr>' + head.map((h, i) => '<th' + (i ? '' : ' class="l"') + '>' + h + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    return this.panel('ox-c12', 'Chi tiết theo ngày · ' + X.ch.label + ' · T' + X.m, 'Trung bình theo thứ trong tuần, trong phạm vi lọc hiện tại · ngày nào hay hụt KPI', '<div class="ox-tabs ok-tabs">' + tabs + '</div>' + tbl,
      'Trung bình = tổng các ngày cùng thứ trong phạm vi lọc ÷ số ngày có số liệu. % đạt KPI = NMV ÷ KPI NMV của đúng các ngày đó. Chỉ tính ngày đã có dữ liệu. Ngày sự kiện (Sale, Double Day) kéo lệch trung bình — chọn Loại ngày = BAU ở bộ lọc phía trên để so sánh thuần ngày thường.', '');
  }
  // ---- chi phí theo nguồn (biểu đồ + bảng thu gọn) -------------------------------------------------------
  spendHtml(X) {
    const D = this.D(), SK = D.spendSrcKeys || [], SC = ['var(--channel-shopee)', 'var(--color-accent-300)', 'var(--channel-tiktok)', 'var(--channel-facebook)', 'var(--channel-google)'], m = this.money.bind(this), p = this.pct.bind(this), st = this.state;
    const idx = {}; D.dates.forEach((d, i) => { idx[d] = i; });
    const days = X.R.filter(r => r.has).map(r => { const i = idx[r.iso], v = i != null && D.spendSrc ? D.spendSrc[i] : null; return { r, v: v || SK.map(() => 0) }; });
    if (!days.length) return this.panel('ox-c12', 'Chi phí theo nguồn mỗi ngày', '', '<div class="ok-empty">Chưa có dữ liệu chi phí cho tháng này.</div>', '', '');
    const tot = SK.map((_, j) => days.reduce((a, x) => a + (x.v[j] || 0), 0)), all = tot.reduce((a, b) => a + b, 0), n = X.R.length, last = SK.map((_, j) => { const l = days.filter(x => x.v[j] > 0); return l.length ? l[l.length - 1].r.iso : null; });
    const W = 1180, H = 260, L = 58, Rr = 12, T = 34, B = 34, pw = W - L - Rr, ph = H - T - B, bw = pw / n, mx = this.niceMax(Math.max.apply(null, days.map(x => x.v.reduce((a, b) => a + b, 0)).concat([1])) * 1.06), Y = v => T + ph - v / mx * ph;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">' + this.axT(L, 'Chi phí mỗi ngày (₫) · mỗi màu = 1 nguồn, cộng toàn bộ Ecom, không đổi theo chip kênh');
    for (let i = 0; i <= 4; i++) { const y = T + ph - ph * i / 4; s += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + this.short(mx * i / 4) + '</text>'; }
    X.R.forEach((r, i) => {
      const x = days.find(q => q.r.d === r.d); const sel = st.day === r.d;
      if (x) { const sum = x.v.reduce((a, b) => a + b, 0), tip = this.tipT(this.dm(r.iso) + ' · ' + r.dow, SK.map((k, j) => x.v[j] ? [k, m(x.v[j]), SC[j]] : null).concat([['Tổng chi phí', m(sum), '#0f1b3a']])); let acc = 0;
        s += '<g class="ox-hit" data-day="' + r.d + '"' + this.tipAttr(tip) + '><rect class="ox-hov" x="' + (L + bw * i) + '" y="' + T + '" width="' + bw + '" height="' + (ph + 20) + '" rx="5" ' + (sel ? 'style="fill:rgba(47,109,240,.16)"' : '') + '/>';
        x.v.forEach((v, j) => { if (!v) return; const h = ph * v / mx, y = T + ph - acc / mx * ph - h; acc += v; s += '<rect x="' + (L + bw * i + bw * 0.17).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw * 0.66).toFixed(1) + '" height="' + h.toFixed(1) + '" style="rx:2" fill="' + SC[j] + '"/>'; });
        s += '</g>'; }
      s += '<text x="' + (L + bw * i + bw / 2).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" class="ox-ax' + (sel ? ' ox-axon' : '') + '">' + r.d + '</text>';
    });
    s += '</svg>';
    const th = ['Ngày'].concat(SK, ['Tổng']);
    const rows = days.map(x => '<tr data-day="' + x.r.d + '" class="' + (st.day === x.r.d ? 'sel' : '') + '"><td class="l">' + this.dm(x.r.iso) + '</td>' + x.v.map(v => '<td>' + (v ? m(v) : '—') + '</td>').join('') + '<td><b>' + m(x.v.reduce((a, b) => a + b, 0)) + '</b></td></tr>').join('') + '<tr class="tot"><td class="l">Tổng</td>' + tot.map(v => '<td>' + m(v) + '</td>').join('') + '<td>' + m(all) + '</td></tr>';
    const btn = '<button type="button" class="ox-fold dy-sbtn" data-sp="1" aria-expanded="' + !!st.spOpen + '"><span class="ox-ft">' + (st.spOpen ? 'Thu gọn bảng' : 'Xem bảng chi tiết') + '</span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>';
    const tbl = st.spOpen ? '<div class="ox-tw dy-ts"><table class="ox-t dy-t"><thead><tr>' + th.map((h, i) => '<th' + (i ? '' : ' class="l"') + '>' + this.esc(h) + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>' : '';
    return this.panel('ox-c12', 'Chi phí theo nguồn mỗi ngày · T' + X.m, 'Shopee nạp tiền, Shopee Offsite, TikTok Amount, Facebook, Google · bảng chi tiết thu gọn mặc định', this.wrap('dy-wide', s) + tbl,
      'Shopee Onsite tính theo ngày nạp tiền, không theo ngày chi tiêu. Chi phí Facebook mới có đến ' + this.dm(((D.channels || []).find(c => c.key === 'Harasocial') || {}).spendLast) + ', Google đến ' + this.dm(((D.channels || []).find(c => c.key === 'Website') || {}).spendLast) + ' (chưa có file chi phí sau mốc này).', btn + this.legend(SK.map((k, j) => ({ c: SC[j], t: k + ' ' + m(tot[j]) + (all ? ' · ' + p(tot[j] / all, 0) : '') + (last[j] ? '' : ' · không có') }))));
  }
  // ---- bộ lọc ---------------------------------------------------------------------------------------------
  ctlHtml(X) {
    const st = this.state, lm = this.lastMonth(), dim = X.dim, tys = this.typesOf(X.m), cur = X.ch.key, sel = this.typesSel();
    let mo = '<div class="dy-row"><span class="dy-lab">Tháng</span>'; for (let k = 1; k <= lm; k++) mo += '<button type="button" class="ox-tab' + (k === X.m ? ' on' : '') + '" data-mo="' + k + '">T' + k + (k === lm && this.ldOf(k) < this.dimOf(k) ? '*' : '') + '</button>';
    mo += '<span class="ok-scope">' + this.esc('T' + X.m + '/2026 · ' + (X.ld ? 'có số liệu 01–' + String(X.ld).padStart(2, '0') + '/' + String(X.m).padStart(2, '0') : 'chưa có số liệu') + ' · ' + ({ total: 'tất cả kênh', shopee: 'Actual: Shopee', tts: 'Actual: TikTok Shop', websocial: 'Actual: Harasocial + Website', lazada: 'Actual: Lazada + Tiki', seller: 'Seller: chưa có đơn hàng, chỉ hiện KPI' }[cur])) + '</span></div>';
    const chRow = '<div class="dy-row"><span class="dy-lab">Kênh</span>' + this.CH.map(c => '<button type="button" class="ox-tab' + (c.key === cur ? ' on' : '') + '" data-ch="' + c.key + '">' + c.label + '</button>').join('') + '</div>';
    const opt = (a, b, v) => { let o = ''; for (let i = a; i <= b; i++) o += '<option value="' + i + '"' + (i === v ? ' selected' : '') + '>' + i + '/' + String(X.m).padStart(2, '0') + '</option>'; return o; };
    let f = '<div class="dy-row"><span class="dy-lab">Lọc ngày</span>';
    if (tys.length) f += '<button type="button" class="ox-tab' + (!sel.length ? ' on' : '') + '" data-type="*">Mọi loại ngày</button>' + tys.map(t => '<button type="button" class="ox-tab' + (st.types[t] ? ' on' : '') + '" data-type="' + this.esc(t) + '"><i class="dy-dot" style="background:' + (this.TYPEC[t] || '#e3edfb') + '"></i>' + this.esc(t) + '</button>').join('');
    f += '<span class="dy-rng">Từ <select class="dy-sel" data-sel="from">' + opt(1, dim, Math.min(st.from, dim)) + '</select> đến <select class="dy-sel" data-sel="to">' + opt(1, dim, Math.min(st.to, dim)) + '</select></span>';
    if (st.day) f += '<button type="button" class="dy-x" data-clearday="1">Đang xem riêng ngày ' + this.dm(this.isoOf(X.m, st.day)) + ' · bỏ chọn ✕</button>';
    if (this.hasFilter(dim)) f += '<button type="button" class="dy-x" data-reset="1">Xóa lọc ngày ✕</button>';
    f += '</div>';
    return '<div class="ok-chips">' + mo + chRow + f + '</div>';
  }
  // ---- CSS --------------------------------------------------------------------------------------------------
  DY_CSS() { const o = this.OX_CSS(), k = o.indexOf('</style>'); return o.slice(0, k) + this.OK_OWN() + this.DY_OWN() + o.slice(k); }
  DY_OWN() {
    return '' +
      '.dy-wide{min-width:820px}.dy-w7{min-width:540px}.dy-w5{min-width:440px}.dy-ev{font:600 10px var(--font-body);fill:#475569}.dy-we{fill:#d6334f}.dy-out{opacity:.3}' +
      '.dy-row{display:flex;gap:8px 10px;align-items:center;flex-wrap:wrap}.dy-lab{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ox-mut);min-width:68px}.dy-dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:7px;vertical-align:-1px;box-shadow:inset 0 0 0 1px rgba(15,27,58,.18)}' +
      '.dy-rng{display:inline-flex;align-items:center;gap:8px;margin-left:6px;font-size:13px;color:var(--ox-mut)}.dy-sel{border:1px solid #c5dbfa;background:#fff;border-radius:99px;padding:5px 10px;font:600 12.5px var(--font-body);color:#0f1b3a;cursor:pointer}' +
      '.dy-x{border:1px solid #ffc4cc;background:#fff1f3;color:#b4233b;border-radius:99px;padding:5px 13px;font:600 12.5px var(--font-body);cursor:pointer}.dy-x:hover{background:#ffe3e8}' +
      '.dy-ty{display:inline-block;padding:2px 9px;border-radius:99px;font-size:11.5px;font-weight:600;color:#0f1b3a}' +
      '.dy-t tr.fut td{opacity:.42}.dy-t tr.sel td{background:rgba(47,109,240,.14)}.dy-t tr[data-day],.dy-t tr[data-ch]{cursor:pointer}.dy-t tbody tr[data-day]:hover td,.dy-t tbody tr[data-ch]:hover td{background:rgba(255,255,255,.6)}.dy-t tr.sel td{font-weight:600}' +
      '.dy-ts{max-height:620px;overflow:auto}.dy-t thead th{position:sticky;top:0;z-index:3;background:#e4eefc}.dy-t tr.tot td{position:sticky;top:34px;z-index:2;background:#dbe9ff}' +
      '.dy-hm{min-width:980px;display:flex;flex-direction:column;gap:5px}.dy-hr{display:grid;gap:3px;align-items:stretch}.dy-hh>div{font-size:11.5px;font-weight:600;color:var(--ox-mut);text-align:center;padding:4px 0;border-radius:8px;cursor:pointer;line-height:1.25}.dy-hh>div small{display:block;font-weight:500;font-size:10px;opacity:.75}.dy-hh>div.on{background:#2f6df0;color:#fff}' +
      '.dy-hl{display:flex;align-items:center;padding:0 10px;font-weight:600;font-size:13px;border-radius:10px;cursor:pointer;color:#0f1b3a}.dy-hl:hover{background:rgba(255,255,255,.6)}.dy-hl.on{background:#fff;box-shadow:inset 3px 0 0 #2f6df0;color:#1d4ed8}' +
      '.dy-hc{display:flex;align-items:center;justify-content:center;border-radius:8px;min-height:34px;font-size:12px;font-weight:700;cursor:pointer}.dy-hc:hover{box-shadow:0 4px 12px rgba(37,99,235,.2)}.dy-hc.r{background:#ffd9de;color:#b4233b}.dy-hc.y{background:#fff0c2;color:#8a5a00}.dy-hc.g{background:#d3f5e0;color:#0f7a43}.dy-hc.n{background:#e8eef8;color:#7b8aa5}.dy-hc.f{background:rgba(255,255,255,.4);color:#b6c2d8;cursor:default}.dy-hc.sel{outline:2.5px solid #2f6df0;outline-offset:1px}' +
      '.dy-cg{font:600 13px var(--font-body);color:var(--ox-mut);margin:6px 2px -4px;display:flex;align-items:center;gap:10px}.dy-cg::after{content:"";flex:1;height:1px;background:rgba(15,27,58,.10)}' +
      '#dly .dy-cards{gap:14px;align-items:stretch}#dly .dy-cards .ox-card{padding:18px 18px 16px;gap:10px;justify-content:flex-start}#dly .dy-cards .ox-cl{font-size:13.5px;font-weight:600;color:#33415f;line-height:1.25}#dly .dy-cards .ox-cv{font-size:32px}' +
      '#dly .dy-cards .ox-cd{gap:6px 8px}#dly .dy-cards .ox-cp{font-size:13px;line-height:1.35}#dly .dy-cards .ox-ce{font-size:12.5px;line-height:1.4;gap:6px 8px}#dly .dy-cards .ox-pill{font-size:12.5px}' +
      '.dy-mt{position:relative;height:7px;border-radius:99px;background:rgba(15,27,58,.09);margin:1px 0 2px}.dy-mt i{display:block;height:100%;border-radius:99px;background:#2f6df0}.dy-mt i.g{background:#16a863}.dy-mt i.y{background:#f0a419}.dy-mt i.r{background:#e5484d}.dy-mt b{position:absolute;top:-3px;bottom:-3px;width:2px;margin-left:-1px;border-radius:2px;background:#0f1b3a}' +
      '#dly .ox-t.dy-t{font-size:13px;font-variant-numeric:tabular-nums}#dly .dy-t th,#dly .dy-t td{padding:10px 8px;border-bottom:1px solid rgba(15,27,58,.06)}#dly .dy-t th{font-size:12px;font-weight:600;color:#5b6b85;line-height:1.3;white-space:nowrap;height:38px;box-sizing:border-box;border-bottom:1px solid rgba(15,27,58,.12);vertical-align:middle}' +
      '#dly .dy-t td.l{font-size:13.5px;color:#0f1b3a}#dly .dy-t td.l b{font-weight:600}#dly .dy-t td.dy-sp,#dly .dy-t .dy-sp{font-weight:600;color:#0f1b3a}#dly .dy-t tr.na td{opacity:.5}#dly .dy-t tr.tot td{top:38px;font-weight:700;color:#1d4ed8;border-bottom:1px solid rgba(37,99,235,.2)}#dly .dy-t tr.tot td b{font-weight:700}' +
      '.dy-pb{display:block;width:100%;max-width:64px;height:4px;border-radius:99px;background:rgba(15,27,58,.09);margin:4px 0 0 auto;overflow:hidden}.dy-pb i{display:block;height:100%;border-radius:99px;background:#2f6df0}.dy-pb i.g{background:#16a863}.dy-pb i.y{background:#f0a419}.dy-pb i.r{background:#e5484d}' +
      '#dly .dy-wrp th{white-space:normal;line-height:1.25;vertical-align:bottom;padding-top:8px;padding-bottom:8px}' +
      '.dy-hit{flex-basis:100%;font-size:12.5px;color:var(--ox-mut)}.dy-hit b{color:#0f1b3a}.dy-cc{margin:0 0 12px}' +
      '#dly .dy-t tr.worst td{background:rgba(229,72,77,.07)}.dy-wb,.dy-bb{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:99px;font-size:11px;font-weight:700;vertical-align:1px;white-space:nowrap}.dy-wb{background:#ffe3e8;color:#d6334f}.dy-bb{background:#d9f7e6;color:#12924f}.dy-last{white-space:normal !important;min-width:240px}' +
      '.dy-foot{font-size:12.5px;color:var(--ox-mut);line-height:1.65;padding:4px 10px 10px}.dy-sbtn{margin-right:10px}.dy-sbtn[aria-expanded=true] svg{transform:rotate(180deg)}' +
      '@media (max-width:560px){.dy-lab{min-width:100%}.dy-rng{margin-left:0}}' +
      '';
  }
  // ---- paint ------------------------------------------------------------------------------------------------
  paintDY() {
    const root = document.getElementById('dly');
    if (!root) return false;
    if (!root._ok) {
      root._ok = 1;
      root.addEventListener('click', ev => {
        const T = ev.target.closest ? ev.target : null; if (!T) return;
        const q = s => T.closest(s), st = this.state;
        const fb = q('[data-fold]');
        if (fb) {
          const k = fb.getAttribute('data-fold'); this._fold = this._fold || {}; this._fold[k] = !this._fold[k];
          const box = root.querySelector('[data-fbox="' + k + '"]'); if (box) box.classList.toggle('ox-closed', !!this._fold[k]);
          fb.setAttribute('aria-expanded', String(!this._fold[k])); const ft = fb.querySelector('.ox-ft'); if (ft) ft.textContent = this._fold[k] ? 'Mở rộng' : 'Thu gọn';
          return;
        }
        let e;
        if (q('[data-reset]')) { this.setState({ from: 1, to: 31, types: {} }); return; }
        if (q('[data-clearday]')) { this.setState({ day: null }); return; }
        if ((e = q('[data-mo]'))) { this.setState({ mo: +e.getAttribute('data-mo'), day: null, from: 1, to: 31, types: {} }); return; }
        if ((e = q('[data-type]'))) { const t = e.getAttribute('data-type'); if (t === '*') this.setState({ types: {}, day: null }); else { const ty = Object.assign({}, st.types); ty[t] = !ty[t]; this.setState({ types: ty, day: null }); } return; }
        if ((e = q('[data-cell]'))) { const v = e.getAttribute('data-cell').split('|'), d = +v[1]; this.setState({ ch: v[0], day: st.ch === v[0] && st.day === d ? null : d }); return; }
        if ((e = q('[data-cg]'))) { const k = e.getAttribute('data-cg'), cg = Object.assign({}, st.cg); cg[k] = !cg[k]; this.setState({ cg }); return; }
        if ((e = q('[data-dtab]'))) { this.setState({ dtab: e.getAttribute('data-dtab') }); return; }
        if (q('[data-sp]')) { this.setState({ spOpen: !st.spOpen }); return; }
        if ((e = q('[data-day]'))) { const d = +e.getAttribute('data-day'); this.setState({ day: st.day === d ? null : d }); return; }
        if ((e = q('[data-ch]'))) { this.setState({ ch: e.getAttribute('data-ch') }); return; }
      });
      root.addEventListener('change', ev => {
        const T = ev.target; if (!T || !T.getAttribute) return; const k = T.getAttribute('data-sel'); if (!k) return;
        const v = +T.value, st = this.state; let f = st.from, t = Math.min(st.to, this.dimOf(this.mo()));
        if (k === 'from') { f = v; if (t < f) t = f; } else { t = v; if (f > t) f = t; }
        this.setState({ from: f, to: t, day: null });
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
    const X = this.calc(this.chan());
    const html = this.DY_CSS() + '<div class="ox">' + this.ctlHtml(X) + this.concl(X) + this.cardsHtml(X) + this.alertsHtml(this.alerts(X)) +
      '<section class="ox-charts">' + this.chDay(X) + this.chCum(X) + this.chCirDay(X) + this.chStack(X) + this.chHeat(X) + this.tblChan(X) + this.tblSpendPlan(X) + this.tblEvents(X) + this.tblDay(X) + this.spendHtml(X) + '</section>' +
      '<div class="dy-foot">' + this.esc('Actual: NMV = doanh thu thuần dòng Không hủy (Order_data). Spend = Shopee Onsite tiền nạp + Offsite, TikTok |Amount|, Facebook → Harasocial, Google → Website. Kênh không có chi phí để Spend = 0 và CIR hiện —.') + '<br>' +
      this.esc('Plan: KPI Monthly Plan 2026.xlsx, sheet từng tháng (KPI NMV ngày theo % phân bổ, loại ngày BAU/Sale/Double Day/Mid-month/Payday). Ngưỡng CIR = KPI Spend / KPI NMV của kênh trong tháng; Cuối tháng = MTD + plan các ngày còn lại. Ngày dữ liệu cuối ' + this.dm(this.lastIso()) + '.') + '</div></div>';
    if (root._h !== html) { root._h = html; root.innerHTML = html; }
    return true;
  }
  renderVals() {
    const R = React.createElement, D = this.D(), c = this.chan(), m = this.mo();
    if (this.dataReady()) {
      clearTimeout(this._pt); let tries = 0;
      const go = () => { try { if (!this.paintDY() && tries++ < 40) this._pt = setTimeout(go, 100); } catch (e) { console.error('daily paint', e); } };
      this._pt = setTimeout(go, 0);
    }
    const ld = this.ldOf(m);
    return {
      navItems: [
        { id: 'ovnew', label: 'Overview', href: 'Overview New.dc.html' }, { id: 'ovkpi', label: 'Overview KPI', href: 'Overview KPI.dc.html' },
        { id: 'dailynew', label: 'Daily Tracking', href: 'Daily Tracking New.dc.html' },
        { id: 'onsite', label: 'Onsite Shopee', href: 'Onsite Shopee.dc.html' },
        { id: 'tiktok', label: 'Onsite TikTok Shop', href: 'Onsite Tiktok Shop.dc.html' },
        { id: 'ppnew', label: 'Product Performance', href: 'PP New.dc.html' }, { id: 'dataraw', label: 'Data Raw', href: 'Data Raw.dc.html' }
      ],
      railFooter: R('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' } },
        R('div', { style: { fontSize: 12, letterSpacing: 'var(--tracking-kicker)', textTransform: 'uppercase', color: 'var(--text-faint)' } }, 'Current period'),
        R('div', { className: 'tabular', style: { fontSize: 14.5, color: 'var(--text-secondary)' } }, 'T' + m + '/2026 · 01–' + String(ld).padStart(2, '0') + '/' + String(m).padStart(2, '0')),
        R('div', { style: { fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.4 } }, 'Plan: KPI Monthly Plan 2026 (sheet T' + m + '). Actual: Order_data + 5 nguồn chi phí.')),
      headerSubtitle: 'Daily plan vs actual · T' + m + '/2026 · ' + c.label + ' · data đến ' + this.dm(this.lastIso()) + '/2026'
    };
  }
}
