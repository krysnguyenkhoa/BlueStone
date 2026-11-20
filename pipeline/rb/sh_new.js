class Component extends DCLogic {
  __bsTick = (() => { const t = () => { try { this._sets = null; this.forceUpdate(); } catch (e) {} }; [300, 1200, 3000, 6000].forEach(ms => setTimeout(t, ms)); })();
  state = { mo: null, tab: 'ov', cg: ['rev', 'traf'], sort: 'date', dir: 1, mcg: 'rev', mm: 'gp', full: false, hm: 'gmv', sg: null, skuAll: false, skuG: 'all', ln: ['gP', 'gT'], srcTab: 'src', skuOpen: {} };
  C3 = { p: '#141F63', c: '#2f9bf0', t: '#12b981' };
  GCL = { 'Thẻ sản phẩm': '#7c8cf8', 'Live': '#1566C4', 'Video': '#a78bfa', 'Tiếp thị liên kết': '#2f9bf0', 'Dịch vụ Hiển thị Shopee': '#f472b6' };
  O() { return window.BSONSITE || {}; }
  dataReady() { const O = this.O(); return !!(O.months && O.months.placed && O.months.placed.length && O.sept && O.sept.placed && O.sept.placed.days); }
/*HELPERS_A*/
/*HELPERS_B*/
  money(v) { if (v == null || !isFinite(v)) return '—'; const a = Math.abs(v), g = v < 0 ? '−' : ''; if (a >= 1e9) return g + (a / 1e9).toFixed(2) + ' tỷ'; if (a >= 1e6) return g + (a / 1e6).toFixed(1) + ' tr'; if (a >= 1e3) return g + (a / 1e3).toFixed(0) + ' nghìn'; return g + Math.round(a) + 'đ'; }
  short(v) { const a = Math.abs(v); if (a >= 1e9) return +(v / 1e9).toFixed(2) + ' tỷ'; if (a >= 1e6) return +(v / 1e6).toFixed(a >= 1e8 ? 0 : 1) + ' tr'; if (a >= 1e3) return +(v / 1e3).toFixed(0) + 'K'; return String(Math.round(v)); }
  chip(l, t, rows) { return '<span class="sh-chip ' + l + '"' + (rows ? this.tipAttr(this.tipT(t, rows)) : '') + '>' + this.esc(t) + '</span>'; }
  moNote(X, k, vals) {
    const L = X.LASTM, last = vals[vals.length - 1], mxF = Math.max.apply(null, vals.slice(0, -1).filter(v => v != null).concat([0])), sl = X.sale.map(r => r.dd).join(', ');
    if (['gp', 'gc', 'gt', 'ord', 'vis'].includes(k)) return last >= mxF ? 'T' + L + '* mới có ' + X.nd + '/' + this.dimOf(L) + ' ngày nhưng đã cao hơn mọi tháng đủ nhờ ngày sale ' + sl + '. Chọn "GMV đặt TB/ngày" để so công bằng với tháng đủ.' : 'T' + L + '* mới có ' + X.nd + '/' + this.dimOf(L) + ' ngày nên cột thấp hơn các tháng đủ là bình thường; đừng đọc như một tháng giảm.';
    return 'Đây là chỉ số tỷ lệ hoặc trung bình nên T' + L + '* so được với tháng đủ, nhưng T' + L + '* có ngày sale ' + sl + ' nên có thể lệch.';
  }
  // ---- tiện ích ---------------------------------------------------------------------------------------------
  pad(n) { return String(n).padStart(2, '0'); }
  num(v) { return v == null || !isFinite(v) ? '—' : Math.round(v).toLocaleString('en-US'); }
  med(a) { const s = a.filter(x => x != null && isFinite(x)).sort((p, q) => p - q), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; }
  mean(a) { return a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0; }
  short2(v) { return this.money(v).replace('₫', ''); }
  nmS(s) { return String(s || '').replace(/\[BlueStone\]\s*/i, '').replace(/BlueStone\s*/i, '').trim(); }
  dimOf(m) { return new Date(Date.UTC(2026, m, 0)).getUTCDate(); }
  der(o) {
    o.ctr = o.visits ? o.clicks / o.visits : null; o.crP = o.clicks ? o.ordP / o.clicks : null; o.crT = o.clicks ? o.ordT / o.clicks : null;
    o.cancR = (o.ordP + o.canc) ? o.canc / (o.ordP + o.canc) : null; o.tPct = o.gP ? o.gT / o.gP : null; o.cPct = o.gP ? o.gC / o.gP : null;
    o.aovT = o.ordT ? o.gT / o.ordT : null; o.newPct = o.buyers ? o.newB / o.buyers : null; o.roas = o.cost ? o.adsG / o.cost : null; o.cir = o.nmv ? o.cost / o.nmv : null; return o;
  }
  agg(l) {
    const o = { n: l.length };
    ['visits', 'clicks', 'ordP', 'ordC', 'ordT', 'gP', 'gC', 'gT', 'canc', 'cancG', 'buyers', 'newB', 'exB', 'pot', 'cost', 'adsG', 'nmv'].forEach(k => { o[k] = l.reduce((s, r) => s + (r[k] || 0), 0); });
    return this.der(o);
  }
  // ---- tính toán -------------------------------------------------------------------------------------------
  calc() {
    const O = this.O(), st = this.state, LASTM = O.months.placed.length + 1, nd = O.t9Days || O.sept.placed.days.length;
    const mo = st.mo == null ? LASTM : Math.max(1, Math.min(LASTM, st.mo)), isDet = mo === LASTM;
    const K3 = ['placed', 'confirmed', 'paid'], M = {};
    K3.forEach(k => { M[k] = O.months[k].map(x => Object.assign({}, x)); M[k].push(Object.assign({ month: LASTM, partial: true }, O.sept[k].total)); });
    const daysIn = m => m === LASTM ? nd : this.dimOf(m);
    const ms = m => {
      const p = M.placed[m - 1], c = M.confirmed[m - 1], t = M.paid[m - 1], dd = daysIn(m), om = (O.orderMonth || {})[m] || {}, km = (O.kpiMonths || {})[m] || {};
      const o = { m, days: dd, partial: m === LASTM, gP: p.gmv, gC: c.gmv, gT: t.gmv, ordP: p.orders, ordC: c.orders, ordT: t.orders, visits: p.visits, clicks: p.clicks, canc: p.cancelOrders, cancG: p.cancelGmv, ret: p.returnOrders, retG: p.returnGmv, buyers: t.buyers, newB: t.newBuyers, exB: t.existingBuyers, pot: t.potentialBuyers, retRate: t.returnRate, nmv: om.nmv || 0, kpi: km.nmv || null };
      this.der(o); o.gpd = o.gP / dd; o.ordd = o.ordP / dd; o.kpiPct = o.kpi ? o.nmv / o.kpi : null; return o;
    };
    const months = []; for (let m = 1; m <= LASTM; m++) months.push(ms(m));
    const cur = months[mo - 1];
    const X = { O, st, LASTM, nd, mo, isDet, M, months, cur, daysIn, bS: 'T' + mo, bL: 'T' + mo + '/2026' + (isDet ? ' (01–' + this.pad(nd) + '/' + this.pad(mo) + ')' : '') };
    const lastM = months[LASTM - 1];
    // theo ngày (chỉ tháng cuối)
    const days = O.sept.placed.days, dc = O.sept.confirmed.days, dt = O.sept.paid.days;
    const adsG = (O.sourcesDaily && O.sourcesDaily.placed || []).find(g => g.isAds), adsMap = {};
    if (adsG) adsG.subs.forEach(s => (s.days || []).forEach(x => { const a = adsMap[x.date] || (adsMap[x.date] = { cost: 0, gmv: 0 }); a.cost += x.cost || 0; a.gmv += x.gmv || 0; }));
    const medG = this.med(days.map(d => d.gmv));
    const rows = days.map((d, i) => {
      const c = dc[i] || {}, t = dt[i] || {}, od = (O.orderDaily || {})[d.date] || {}, a = adsMap[d.date] || {};
      return this.der({ i, iso: d.date, dd: d.date.slice(8, 10) + '/' + d.date.slice(5, 7), sale: medG > 0 && d.gmv >= 3 * medG, visits: d.visits || 0, clicks: d.clicks || 0, ordP: d.orders || 0, ordC: c.orders || 0, ordT: t.orders || 0, gP: d.gmv || 0, gC: c.gmv || 0, gT: t.gmv || 0, canc: d.cancelOrders || 0, cancG: d.cancelGmv || 0, buyers: t.buyers || 0, newB: t.newBuyers || 0, exB: t.existingBuyers || 0, pot: t.potentialBuyers || 0, cost: a.cost || 0, adsG: a.gmv || 0, nmv: od.nmv || 0 });
    });
    X.rows = rows; X.hasAds = !!adsG; X.sale = rows.filter(r => r.sale);
    const nor = rows.filter(r => !r.sale); X.nor = nor;
    X.aN = this.agg(nor); X.tot = this.agg(rows);
    X.avgN = {}; ['visits', 'clicks', 'ordP', 'ordC', 'ordT', 'gP', 'gC', 'gT', 'canc', 'buyers', 'newB', 'cost', 'adsG', 'nmv'].forEach(k => { X.avgN[k] = nor.length ? X.aN[k] / nor.length : 0; });
    X.medN = {}; ['visits', 'clicks', 'ordP', 'gP', 'gC', 'gT', 'crP', 'crT', 'cancR', 'ctr', 'cost', 'roas', 'cir', 'buyers', 'aovT', 'tPct'].forEach(k => { X.medN[k] = this.med(nor.map(r => r[k])); });
    // KPI + dự phóng (NMV Order_data) cho tháng cuối
    const km = lastM.kpi, rem = Math.max(0, this.dimOf(LASTM) - nd);
    X.kp = { kpi: km, nmv: lastM.nmv, rem, avgNor: X.avgN.nmv, proj: lastM.nmv + X.avgN.nmv * rem, projFlat: nd ? lastM.nmv / nd * this.dimOf(LASTM) : 0, need: km && rem ? Math.max(0, (km - lastM.nmv) / rem) : null, kpiCir: (O.kpi && O.kpi.spend && O.kpi.nmv) ? O.kpi.spend / O.kpi.nmv : null };
    X.alerts = this.alertsCalc(X);
    return X;
  }
  alertsCalc(X) {
    const A = [], m = v => this.money(v), cur = X.cur, p1 = v => this.pct(v, 1);
    if (cur.cancR != null && cur.cancR > 0.2) {
      let sub = 'Ngưỡng 20% · GMV hủy ' + m(cur.cancG) + ' · ' + this.num(cur.canc) + ' đơn hủy';
      if (X.isDet) { const w = X.nor.slice().sort((a, b) => (b.cancR || 0) - (a.cancR || 0))[0]; if (w) sub += ' · ngày cao nhất ' + w.dd + ' (' + p1(w.cancR) + ')'; }
      A.push({ l: 'r', b: p1(cur.cancR), t: 'Tỷ lệ hủy cao', s: sub, act: 'tab:fc', lab: 'Xem Phễu & Hủy' });
    }
    if (X.isDet) {
      const lowCr = X.nor.filter(r => X.medN.crP && r.crP != null && r.crP < X.medN.crP * 0.7);
      if (lowCr.length) A.push({ l: 'y', b: lowCr.length + ' ngày', t: 'Ngày có CR thấp bất thường', s: 'CR đặt (đơn / click SP) dưới 70% mức giữa ngày thường (' + this.pct(X.medN.crP, 2) + '): ' + lowCr.slice(0, 4).map(r => r.dd).join(', ') + (lowCr.length > 4 ? '…' : ''), act: 'daily:crP', lab: 'Xem trong bảng ngày' });
      const lowTr = X.nor.filter(r => X.medN.visits && r.visits < X.medN.visits * 0.6);
      if (lowTr.length) A.push({ l: 'y', b: lowTr.length + ' ngày', t: 'Ngày truy cập thấp bất thường', s: 'Dưới 60% mức giữa ngày thường (' + this.num(X.medN.visits) + '): ' + lowTr.slice(0, 4).map(r => r.dd).join(', ') + (lowTr.length > 4 ? '…' : ''), act: 'daily:visits', lab: 'Xem trong bảng ngày' });
      const k = X.kp;
      if (k.kpi) { const pr = k.proj / k.kpi; A.push({ l: pr >= 0.95 ? 'g' : pr >= 0.7 ? 'y' : 'r', b: this.pct(k.nmv / k.kpi, 0), t: 'Tiến độ KPI NMV', s: 'Dự phóng cuối tháng ' + m(k.proj) + ' (' + this.pct(pr, 0) + ' KPI ' + m(k.kpi) + ')' + (k.need ? ' · cần ' + m(k.need) + '/ngày' : ''), act: 'scroll:shkpi', lab: 'Xem tiến độ' }); }
      if (X.sale.length) { const sg = X.sale.reduce((s, r) => s + r.gP, 0); A.push({ l: 'n', b: X.sale.length + ' ngày', t: 'Ngày sale chi phối kỳ', s: X.sale.map(r => r.dd).join(', ') + ' chiếm ' + this.pct(X.tot.gP ? sg / X.tot.gP : null, 0) + ' GMV đặt cả kỳ. Trung bình và dự phóng đã loại các ngày này', act: 'daily:gP', lab: 'Xem theo ngày' }); }
    } else if (cur.kpiPct != null) A.push({ l: cur.kpiPct >= 0.95 ? 'g' : cur.kpiPct >= 0.7 ? 'y' : 'r', b: this.pct(cur.kpiPct, 0), t: 'Đạt KPI NMV tháng', s: 'NMV ' + m(cur.nmv) + ' / KPI ' + m(cur.kpi), act: 'tab:mo', lab: 'Xem theo tháng' });
    const ord = { r: 0, y: 1, g: 2, n: 3 };
    return A.sort((a, b) => ord[a.l] - ord[b.l]).slice(0, 5);
  }
  // ---- bộ lọc + tab ----------------------------------------------------------------------------------------
  ctlHtml(X) {
    let h = '<div class="pp-row"><span class="pp-lab">Tháng</span>';
    for (let m = 1; m <= X.LASTM; m++) h += '<button type="button" class="ox-tab' + (m === X.mo ? ' on' : '') + '" data-mo="' + m + '">T' + m + (m === X.LASTM ? '*' : '') + '</button>';
    const scTx = X.isDet ? 'T' + X.mo + '* mới có 01–' + this.pad(X.nd) + '/' + this.pad(X.mo) + ' (' + X.nd + '/' + this.dimOf(X.mo) + ' ngày), chưa so được với tháng đủ. Dùng "GMV đặt TB/ngày" để so công bằng.' : 'Tháng đủ: chỉ có số tổng tháng, không có theo ngày.';
    h += '<span class="pp-scope">' + (X.isDet ? 'T' + X.mo + '* · ' + X.nd + '/' + this.dimOf(X.mo) + ' ngày' : 'Tháng đủ') + ' <span class="sh-info" tabindex="0" role="note" aria-label="' + this.esc(scTx) + '"' + this.tipAttr('<div class="ox-tt">Phạm vi dữ liệu</div><div style="max-width:260px;white-space:normal">' + scTx + '</div>') + '>i</span></span><span class="pp-acts pp-noprint" style="margin-left:auto"><button type="button" class="pp-btn" data-print="1">In / lưu PDF</button></span></div>';
    return '<div class="ok-chips pp-noprint">' + h + '</div>';
  }
  tabsHtml() {
    const t = this.state.tab, T = [['ov', 'Tổng quan'], ['fc', 'Phễu & Hủy'], ['daily', 'Theo ngày'], ['mo', 'Theo tháng'], ['buy', 'Người mua'], ['src', 'Nguồn & SKU']];
    return '<div class="pp-tabbar pp-noprint"><div class="ox-tabs" role="tablist">' + T.map(x => '<button type="button" role="tab" aria-selected="' + (t === x[0]) + '" class="ox-tab pp-tab' + (t === x[0] ? ' on' : '') + '" data-tab="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
      '</div>';
  }
  noDaily(X, what) {
    return '<div class="ox-panel ox-c12"><div class="ok-empty">' + this.esc(what) + ' chỉ có cho T' + X.LASTM + '* (01–' + this.pad(X.nd) + '/' + this.pad(X.LASTM) + '). T' + X.mo + ' chỉ có số tổng tháng.<br><button type="button" class="pp-btn" data-mo="' + X.LASTM + '" style="margin-top:12px">Chuyển sang T' + X.LASTM + '*</button></div></div>';
  }
  // ---- Tổng quan ---------------------------------------------------------------------------------------------
  heroHtml(X) {
    const c = X.cur, m = v => this.money(v);
    const L = '<div class="pp-hl"><div class="ox-hl">GMV xác nhận · ' + this.esc(X.bL) + '</div><div class="ox-hv">' + m(c.gC) + '</div><div class="ox-hrow"><span class="ox-hk">' + this.num(c.ordC) + ' đơn xác nhận · AOV ' + m(c.ordC ? c.gC / c.ordC : null) + '</span></div>' +
      '</div>';
    let M = '<div class="pp-hmid"><div class="pp-ht">' + (X.isDet ? 'GMV xác nhận theo ngày' : 'GMV xác nhận theo tháng') + '</div>';
    const vals = X.isDet ? X.rows.map(r => r.gC) : X.months.map(x => x.gC), flags = X.isDet ? X.rows.map(r => r.sale) : X.months.map((x, i) => i === X.mo - 1), n = vals.length;
    const W = 420, H = 130, PB = 18, PT = 16, bw = W / n, nv = X.isDet ? vals.filter((v, i) => !flags[i]) : vals, cap = X.isDet ? Math.max.apply(null, nv.concat([1])) * 1.25 : Math.max.apply(null, vals.concat([1]));
    let sv = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg pp-spark" role="img" aria-label="GMV xác nhận">';
    vals.forEach((v, i) => {
      const cl = X.isDet && v > cap, hh = Math.max(v > 0 ? 2 : 0, Math.min(v, cap) / cap * (H - PB - PT)), x = i * bw + bw * 0.14, w = bw * 0.72, y = H - PB - hh;
      const lab = X.isDet ? X.rows[i].dd : 'T' + (i + 1), tip = this.tipT(lab, [['GMV xác nhận', m(v), null]]);
      sv += '<g class="ox-hit"' + this.tipAttr(tip) + '><rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + hh.toFixed(1) + '" rx="3" fill="' + (X.isDet ? (flags[i] ? '#f59e0b' : '#2f6df0') : (flags[i] ? '#2f6df0' : '#a9c8ff')) + '"/><rect class="ox-hov" x="' + (i * bw).toFixed(1) + '" y="0" width="' + bw.toFixed(1) + '" height="' + H + '"/></g>';
      if (cl && v === Math.max.apply(null, vals)) sv += '<text x="' + (i * bw + bw / 2).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" text-anchor="middle" class="ox-val" style="fill:#b45309">' + this.short2(v) + '</text>';
      if (X.isDet ? (i % 2 === 0 || i === n - 1) : true) sv += '<text x="' + (i * bw + bw / 2).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="middle" class="ox-ax' + (!X.isDet && i === X.mo - 1 ? ' ox-axon' : '') + '">' + (X.isDet ? X.rows[i].dd.slice(0, 2) : 'T' + (i + 1)) + '</text>';
    });
    sv += '</svg>';
    M += sv + '<div class="pp-hs">' + (X.isDet ? 'Cột cam là ngày sale, được cắt ngắn để các ngày thường vẫn đọc được. Rê chuột để xem giá trị thật.' : 'Cột đậm là tháng đang xem. T' + X.LASTM + '* mới có ' + X.nd + ' ngày.') + '</div></div>';
    const vr = (lab, v, base, col) => '<div class="sh-vr"><span>' + lab + '</span><b>' + m(v) + '</b><span class="sh-vt"><i style="width:' + Math.max(1.5, base ? v / base * 100 : 0) + '%;background:' + col + '"></i></span></div>';
    const R = '<div class="pp-hr"><div class="pp-ht">Giá trị rơi qua từng trạng thái</div>' + vr('GMV đặt', c.gP, c.gP, this.C3.p) + vr('GMV xác nhận', c.gC, c.gP, this.C3.c) + vr('GMV thanh toán', c.gT, c.gP, this.C3.t) +
      '<div class="pp-hs">Xác nhận bằng ' + this.pct(c.cPct, 1) + ' GMV đặt, thanh toán bằng ' + this.pct(c.tPct, 1) + '. Phần chênh là GMV bị hủy hoặc chưa thanh toán.</div></div>';
    return '<div class="pp-hero">' + L + M + R + '</div>';
  }
  cardsHtml(X) {
    const c = X.cur, m = v => this.money(v), pay = c.ordP ? c.ordT / c.ordP : null, cr = X.isDet && X.medN.crP && c.crP != null ? c.crP / X.medN.crP : null;
    const chC = c.cancR == null ? '' : this.chip(c.cancR > 0.2 ? 'r' : 'g', c.cancR > 0.2 ? 'Cao' : 'Ổn', [['Ngưỡng', '20%', null], ['Hiện tại', this.pct(c.cancR, 1), null]]);
    const chP = pay != null && pay < 0.6 ? this.chip('y', 'Thấp', [['Thanh toán / đặt', this.pct(pay, 1), null], ['Mốc cảnh báo', '60%', null]]) : '';
    const chR = cr == null ? '' : cr < 0.85 ? this.chip('y', 'Thấp', [['CR cả kỳ', this.pct(c.crP, 2), null], ['Giữa các ngày thường', this.pct(X.medN.crP, 2), null]]) : cr > 1.15 ? this.chip('g', 'Tốt', [['CR cả kỳ', this.pct(c.crP, 2), null], ['Giữa các ngày thường', this.pct(X.medN.crP, 2), null]]) : '';
    const C = [
      { ic: 'gmv', l: 'GMV đặt', v: m(c.gP), e: this.num(c.ordP) + ' đơn đặt', g: 'rev' },
      { ic: 'spend', l: 'GMV thanh toán', v: m(c.gT), e: 'AOV ' + m(c.aovT), g: 'rev' },
      { ic: 'paid orders', l: 'Đơn thanh toán', v: this.num(c.ordT), e: this.pct(pay, 1) + ' đơn đặt', g: 'q', c: chP },
      { ic: 'visit', l: 'Lượt truy cập', v: this.num(c.visits), e: this.pct(c.ctr, 1) + ' click SP / truy cập', g: 'q' },
      { ic: 'conversion', l: 'CR đặt', v: this.pct(c.crP, 2), e: 'Đơn đặt / click SP', g: 'q', c: chR },
      { ic: 'cancel', l: 'Tỷ lệ hủy', v: this.pct(c.cancR, 1), e: 'GMV hủy ' + m(c.cancG), g: 'cost', c: chC }
    ];
    return '<div class="pp-cards">' + C.map(k => '<div class="ox-card pp-card g-' + k.g + '"><div class="ox-cl">' + this.ic(k.ic) + '<span>' + this.esc(k.l) + '</span></div><div class="ox-cv">' + k.v + (k.c || '') + '</div><div class="ox-ce"><span>' + this.esc(k.e) + '</span></div></div>').join('') + '</div>';
  }
  adsCardsHtml(X) {
    if (!X.isDet || !X.hasAds) return '';
    const t = X.tot, m = v => this.money(v), kc = X.kp.kpiCir;
    const chI = kc != null && t.cir != null ? (t.cir > kc * 1.25 ? this.chip('r', 'Vượt KH', [['CIR', this.pct(t.cir, 1), null], ['Kế hoạch', this.pct(kc, 1), null]]) : t.cir > kc ? this.chip('y', 'Vượt KH', [['CIR', this.pct(t.cir, 1), null], ['Kế hoạch', this.pct(kc, 1), null]]) : this.chip('g', 'Đạt KH', [['CIR', this.pct(t.cir, 1), null], ['Kế hoạch', this.pct(kc, 1), null]])) : '';
    const C = [
      { ic: 'spend', l: 'Chi phí Ads', v: m(t.cost), e: 'Shopee Ads · ' + X.nd + ' ngày' },
      { ic: 'nmv/gmv', l: 'GMV từ Ads', v: m(t.adsG), e: this.pct(t.gP ? t.adsG / t.gP : null, 0) + ' GMV đặt (tính chồng)' },
      { ic: 'roas', l: 'ROAS Ads', v: t.roas == null ? '—' : '×' + t.roas.toFixed(1), e: 'GMV từ Ads / chi phí Ads' },
      { ic: 'cir', l: 'CIR', v: this.pct(t.cir, 1), e: kc != null ? 'Kế hoạch ' + this.pct(kc, 1) + ' · Chi phí / NMV' : 'Chi phí Ads / NMV', c: chI }
    ];
    return '<div class="ox-panel"><div class="ox-ph"><div><div class="ox-pt">Hiệu quả quảng cáo</div><div class="ox-ps">Shopee Ads T' + X.mo + ' (01–' + this.pad(X.nd) + '/' + this.pad(X.mo) + ') · chi phí tiêu thụ trong ngày, lấy từ báo cáo Business Insights</div></div></div><div class="sh-ads">' +
      C.map(k => '<div class="ox-card pp-card"><div class="ox-cl">' + this.ic(k.ic) + '<span>' + this.esc(k.l) + '</span></div><div class="ox-cv">' + k.v + (k.c || '') + '</div><div class="ox-ce"><span>' + this.esc(k.e) + '</span></div></div>').join('') + '</div></div>';
  }
  alertsHtml(X) {
    if (!X.alerts.length) return '';
    return '<div class="ox-panel pp-alp sh-alw"><div class="ox-ph"><div><div class="ox-pt">Điều cần chú ý</div><div class="ox-ps">Tự phát hiện theo số liệu đang xem · bấm nút bên phải để tới nơi xử lý</div></div></div><div class="sh-alr">' +
      X.alerts.map(a => '<div class="sh-ai ' + a.l + '"><span class="sh-ab">' + this.esc(a.b) + '</span><div class="sh-at"><b>' + this.esc(a.t) + '</b><span>' + this.esc(a.s) + '</span></div><button type="button" class="pp-link pp-noprint" data-act="' + a.act + '">' + this.esc(a.lab) + '</button></div>').join('') + '</div></div>';
  }
  kpiPanel(X) {
    const m = v => this.money(v), c = X.cur;
    if (X.isDet) {
      const k = X.kp; if (!k.kpi) return '';
      const a = k.nmv / k.kpi, pr = k.proj / k.kpi, mxp = Math.max(1, pr, a), pa = Math.min(100, a / mxp * 100), pp = Math.min(100, pr / mxp * 100), pk = Math.min(100, 1 / mxp * 100);
      const lab = (pos, txt) => '<span class="sh-lt' + (pos > 90 ? ' e' : pos < 8 ? ' s' : '') + '" style="left:' + pos.toFixed(1) + '%">' + txt + '</span>';
      const bar = '<div class="sh-pw"><div class="sh-pwt">' + lab(pa, 'Thực tế <b>' + this.pct(a, 0) + '</b>') + lab(pk, 'KPI <b>' + m(k.kpi) + '</b>') + '</div><div class="ox-prog sh-prog"><span style="width:' + pa.toFixed(1) + '%"></span><i style="left:' + pp.toFixed(1) + '%;background:#0f1b3a" title="Dự phóng"></i><i style="left:' + pk.toFixed(1) + '%;background:#2fc7b8" title="KPI"></i></div><div class="sh-pwb">' + lab(pp, 'Dự phóng <b>' + this.pct(pr, 0) + '</b>') + '</div></div>';
      const g = '<div class="sh-kg k3"><div><span>NMV thực tế (Order_data)</span><b>' + m(k.nmv) + '</b><u>' + this.pct(a, 0) + ' KPI · ' + X.nd + '/' + this.dimOf(X.mo) + ' ngày</u></div>' +
        '<div><span>Dự phóng cuối tháng</span><b>' + m(k.proj) + '</b><u>' + this.pct(pr, 0) + ' KPI · thực tế + TB ngày thường ' + m(k.avgNor) + ' × ' + k.rem + ' ngày</u></div>' +
        '<div><span>Cần mỗi ngày còn lại</span><b>' + (k.need == null ? '—' : m(k.need)) + '</b><u>để đạt KPI ' + m(k.kpi) + ' · so với TB ngày thường ' + m(k.avgNor) + '</u></div></div>';
      return this.panel('ox-c12', 'Tiến độ KPI và dự phóng cuối tháng', 'NMV Shopee theo Order_data, cùng định nghĩa với Overview KPI', bar + g, 'Dự phóng không nhân tuyến tính vì ngày sale ' + X.sale.map(r => r.dd).join(', ') + ' kéo trung bình lên; trung bình ngày thường tính trên ' + X.nor.length + ' ngày còn lại. Nếu giữ nguyên trung bình cả kỳ (gồm ngày sale) thì đạt ' + m(k.projFlat) + ' (' + this.pct(k.kpi ? k.projFlat / k.kpi : null, 0) + ' KPI), có thể cao hơn thực tế.').replace('<div class="ox-panel ox-c12"', '<div id="shkpi" class="ox-panel ox-c12"');
    }
    if (c.kpi == null) return '';
    return this.panel('ox-c12', 'Đạt KPI NMV tháng', 'NMV Shopee theo Order_data', '<div class="sh-kg"><div><span>NMV thực tế</span><b>' + m(c.nmv) + '</b><u>' + this.pct(c.kpiPct, 0) + ' KPI</u></div><div><span>KPI tháng</span><b>' + m(c.kpi) + '</b><u>Kế hoạch KPI Monthly Plan 2026</u></div></div>');
  }
  ovHtml(X) { return this.heroHtml(X) + this.alertsHtml(X) + this.cardsHtml(X) + this.adsCardsHtml(X) + this.kpiPanel(X); }
  // ---- Phễu & Hủy --------------------------------------------------------------------------------------------
  funnelHtml(X) {
    const c = X.cur, O = X.O, S = [['Truy cập shop', c.visits], ['Click sản phẩm', c.clicks], ['Đơn đặt', c.ordP], ['Đơn xác nhận', c.ordC], ['Đơn thanh toán', c.ordT]];
    const rows = S.map((s, i) => {
      const pass = i ? (S[i - 1][1] ? s[1] / S[i - 1][1] : null) : 1, top = S[0][1] ? s[1] / S[0][1] : null, drop = i ? S[i - 1][1] - s[1] : 0;
      const good = pass != null && i >= 3 ? pass >= 0.8 : null;
      const tip = this.tipT(s[0], [['Số lượng', this.num(s[1]), null], ['% so với tầng đầu', this.pct(top, 2), null], i ? ['Qua từ tầng trước', this.pct(pass, 1) + ' (' + this.num(S[i - 1][1]) + ' → ' + this.num(s[1]) + ')', null] : null, i ? ['Rơi', this.num(drop), null] : null]);
      return '<div class="sh-fr"' + this.tipAttr(tip) + '><span class="sh-fn"><b>' + s[0] + '</b><small>' + this.num(s[1]) + (i ? ' · ' + this.pct(top, 2) + ' tầng đầu' : '') + '</small></span><span class="sh-ft"><i style="width:' + Math.max(1.2, (pass || 0) * 100) + '%;background:' + (i === 0 ? '#9db8ee' : good === false ? '#f59e0b' : '#2f6df0') + '"></i></span><b class="sh-fp">' + (i ? this.pct(pass, 1) : '100%') + '</b><span class="sh-fd">' + (i ? '−' + this.num(drop) + ' rơi' : 'mốc 100%') + '</span></div>';
    }).join('');
    const head = '<div class="sh-fr sh-fh"><span>Tầng</span><span>Thanh dài = % qua từ tầng trước</span><span>Qua tầng</span><span>Rơi</span></div>';
    const imp = X.isDet ? (((O.sources || {}).placed || {}).groups || []).filter(g => !g.isAds).reduce((s, g) => s + ((g.total || {}).views || 0), 0) : 0;
    const strip = X.isDet && imp ? '<div class="sh-dstrip"><b>Khám phá</b><span>Hiển thị sản phẩm <b>' + this.num(imp) + '</b></span><span>Click sản phẩm <b>' + this.num(c.clicks) + '</b></span><span>CTR <b>' + this.pct(imp ? c.clicks / imp : null, 2) + '</b></span><small>Nằm ngoài phễu: hiển thị tính theo cấp sản phẩm của 4 nhóm nguồn nên lớn hơn Lượt truy cập shop.</small></div>' : '';
    return this.panel('ox-c12', 'Phễu mua hàng', X.bL + ' · từ truy cập đến thanh toán', strip + '<div class="sh-fw">' + head + rows + '</div>', 'Mỗi thanh cho biết bao nhiêu phần trăm số lượng của tầng trước đi tiếp sang tầng này. Màu cam là tầng sau xác nhận có tỷ lệ qua dưới 80%.');
  }
  cancelHtml(X) {
    const c = X.cur, m = v => this.money(v), O = X.O;
    const cards = '<div class="sh-c4">' + [['Đơn hủy', this.num(c.canc), 'trên ' + this.num(c.ordP + c.canc) + ' đơn đặt', ''], ['Tỷ lệ hủy', this.pct(c.cancR, 1), c.cancR > 0.2 ? 'cao hơn ngưỡng 20%' : 'trong ngưỡng 20%', c.cancR > 0.2 ? 'bad' : ''], ['GMV hủy', m(c.cancG), this.pct(c.gP + c.cancG ? c.cancG / (c.gP + c.cancG) : null, 1) + ' GMV phát sinh', 'bad'], ['Đơn hoàn', this.num(c.ret), m(c.retG) + ' · ' + this.pct(c.ordP ? c.ret / c.ordP : null, 2) + ' đơn đặt', '']].map(k => '<div class="sh-mc ' + k[3] + '"><span>' + k[0] + '</span><b>' + k[1] + '</b><small>' + k[2] + '</small></div>').join('') + '</div>';
    const tb = '<div class="ox-tw"><table class="ox-t pp-t"><thead><tr><th class="l">Trạng thái</th><th>Đơn</th><th>Đơn hủy</th><th>Tỷ lệ hủy</th><th>GMV hủy</th><th>Đơn hoàn</th><th>Tỷ lệ hoàn</th><th>GMV hoàn</th></tr></thead><tbody>' +
      [['Đã đặt', 'placed'], ['Đã xác nhận', 'confirmed'], ['Đã thanh toán', 'paid']].map(r => { const t = X.M[r[1]][X.mo - 1], cr = (t.orders + t.cancelOrders) ? t.cancelOrders / (t.orders + t.cancelOrders) : null; return '<tr><td class="l">' + r[0] + '</td><td>' + this.num(t.orders) + '</td><td>' + this.num(t.cancelOrders) + '</td><td class="' + (cr > 0.2 ? 'badw' : '') + '">' + this.pct(cr, 1) + '</td><td>' + m(t.cancelGmv) + '</td><td>' + this.num(t.returnOrders) + '</td><td>' + this.pct(t.orders ? t.returnOrders / t.orders : null, 2) + '</td><td>' + m(t.returnGmv) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    const P1 = this.panel('ox-c12', 'Hủy và hoàn', X.bL + ' · đơn rơi ra do hủy hoặc chưa thanh toán', cards + tb, 'Tỷ lệ hủy = đơn hủy / (đơn còn lại + đơn hủy) trong cùng trạng thái. Số đơn hủy giảm dần theo trạng thái vì đơn bị hủy trước khi xác nhận không vào sheet sau.');
    const bars = (vals, labs, tips, thr, selI) => {
      const n = vals.length, W = 560, H = 190, L = 40, R = 8, T = 14, Bm = 24, pw = W - L - R, ph = H - T - Bm, bw = pw / n, mx = Math.max(0.4, Math.max.apply(null, vals.map(v => v || 0)) * 1.15);
      let sv = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg" role="img" aria-label="Tỷ lệ hủy">';
      [0, 0.5, 1].forEach(f => { const y = T + ph * (1 - f); sv += '<line class="ox-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text class="ox-ax" x="' + (L - 5) + '" y="' + (y + 4) + '" text-anchor="end">' + Math.round(mx * f * 100) + '%</text>'; });
      vals.forEach((v, i) => { const h = (v || 0) / mx * ph, x = L + i * bw + bw * 0.16, w = bw * 0.68; sv += '<g class="ox-hit"' + this.tipAttr(tips[i]) + '><rect x="' + x.toFixed(1) + '" y="' + (T + ph - h).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="' + (v > thr ? '#e5546b' : '#7aa8f5') + '" opacity="' + (selI == null || selI === i ? 1 : 0.55) + '"/><rect class="ox-hov" x="' + (L + i * bw).toFixed(1) + '" y="' + T + '" width="' + bw.toFixed(1) + '" height="' + ph + '"/></g><text class="ox-ax" x="' + (L + i * bw + bw / 2).toFixed(1) + '" y="' + (H - 7) + '" text-anchor="middle">' + labs[i] + '</text>'; });
      const ty = T + ph * (1 - thr / mx); sv += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + ty + '" y2="' + ty + '" stroke="#d6334f" stroke-width="1.4" stroke-dasharray="5 4"/></svg>';
      return sv;
    };
    const lg = this.legend([{ c: '#e5546b', t: 'Vượt ngưỡng 20%' }, { c: '#7aa8f5', t: 'Trong ngưỡng' }, { c: '#d6334f', t: 'Đường ngưỡng 20%', line: true }]);
    const mv = X.months.map(x => x.cancR), mt = X.months.map(x => this.tipT('T' + x.m + (x.partial ? '*' : ''), [['Tỷ lệ hủy', this.pct(x.cancR, 1), null], ['Đơn hủy', this.num(x.canc), null], ['GMV hủy', m(x.cancG), null]]));
    const PM = this.panel('ox-c6', 'Tỷ lệ hủy theo tháng', 'Cột đỏ là tháng vượt ngưỡng 20%', lg + '<div class="sh-sv">' + bars(mv, X.months.map(x => 'T' + x.m + (x.partial ? '*' : '')), mt, 0.2, X.mo - 1) + '</div>');
    let PD;
    if (X.isDet) { const dv = X.rows.map(r => r.cancR), dtp = X.rows.map(r => this.tipT(r.dd + (r.sale ? ' · ngày sale' : ''), [['Tỷ lệ hủy', this.pct(r.cancR, 1), null], ['Đơn hủy', this.num(r.canc), null], ['GMV hủy', m(r.cancG), null]])); PD = this.panel('ox-c6', 'Tỷ lệ hủy theo ngày', X.bL, lg + '<div class="sh-sv">' + bars(dv, X.rows.map(r => r.dd.slice(0, 2)), dtp, 0.2, null) + '</div>'); }
    else PD = this.panel('ox-c6', 'Tỷ lệ hủy theo ngày', '', '<div class="ok-empty">Theo ngày chỉ có cho T' + X.LASTM + '*.<br><button type="button" class="pp-btn" data-mo="' + X.LASTM + '" style="margin-top:12px">Chuyển sang T' + X.LASTM + '*</button></div>');
    return P1 + '<section class="ox-charts">' + PM + PD + '</section>';
  }
  fcHtml(X) { return this.funnelHtml(X) + this.cancelHtml(X); }
  // ---- Theo ngày ---------------------------------------------------------------------------------------------
  COLS() {
    const m = v => this.money(v), n = v => this.num(v), p1 = v => this.pct(v, 1), p2 = v => this.pct(v, 2);
    return [
      { k: 'visits', g: 'traf', l: 'Lượt truy cập', f: n, a: 'hl' }, { k: 'vsn', g: 'traf', l: 'So với TB ngày thường', f: v => v == null ? '—' : this.signedPct(v, 0), d: 1 }, { k: 'clicks', g: 'traf', l: 'Click SP', f: n, a: 'hl' }, { k: 'ctr', g: 'traf', l: 'Click / truy cập', f: p1, a: 'hl' },
      { k: 'ordP', g: 'ord', l: 'Đơn đặt', f: n, a: 'hl' }, { k: 'ordC', g: 'ord', l: 'Đơn xác nhận', f: n }, { k: 'ordT', g: 'ord', l: 'Đơn thanh toán', f: n }, { k: 'crP', g: 'ord', l: 'CR đặt', f: p2, a: 'hl' }, { k: 'crT', g: 'ord', l: 'CR thanh toán', f: p2 }, { k: 'cancR', g: 'ord', l: 'Tỷ lệ hủy', f: p1, a: 'bad' },
      { k: 'gP', g: 'rev', l: 'GMV đặt', f: m, a: 'hl' }, { k: 'gC', g: 'rev', l: 'GMV xác nhận', f: m, a: 'hl' }, { k: 'gT', g: 'rev', l: 'GMV thanh toán', f: m, a: 'hl' }, { k: 'aovT', g: 'rev', l: 'AOV thanh toán', f: m },
      { k: 'buyers', g: 'buy', l: 'Người mua', f: n, a: 'hl' }, { k: 'newB', g: 'buy', l: 'Người mua mới', f: n }, { k: 'newPct', g: 'buy', l: '% mới', f: v => this.pct(v, 0) }, { k: 'pot', g: 'buy', l: 'Người mua tiềm năng', f: n },
      { k: 'cost', g: 'ads', l: 'Chi phí Ads', f: m, a: 'bad' }, { k: 'adsG', g: 'ads', l: 'GMV từ Ads', f: m }, { k: 'roas', g: 'ads', l: 'ROAS', f: v => v == null ? '—' : '×' + v.toFixed(1), a: 'hl' }, { k: 'cir', g: 'ads', l: 'CIR', f: p1, a: 'bad' }
    ];
  }
  GL = { traf: 'Lưu lượng', ord: 'Đơn & CR', rev: 'Doanh thu', buy: 'Người mua', ads: 'Ads' };
  cellCls(X, c, r) {
    if (r.sale || !c.a) return '';
    const v = r[c.k], md = X.medN[c.k]; if (v == null || !md) return '';
    const ratio = v / md, isRate = ['crP', 'crT', 'ctr', 'cancR', 'roas', 'cir'].includes(c.k), hi = isRate ? 1.4 : 1.6, lo = isRate ? 0.7 : 0.55;
    if (c.a === 'bad') return ratio > hi ? 'an-bad' : ratio < lo ? 'an-good' : '';
    return ratio > hi ? 'an-hi' : ratio < lo ? 'an-lo' : '';
  }
  dailyRows(X) {
    const st = this.state, avg = X.avgN.visits;
    const rs = X.rows.map(r => Object.assign({}, r, { vsn: r.sale || !avg ? null : r.visits / avg - 1 }));
    const c = this.COLS().find(x => x.k === st.sort);
    if (st.sort !== 'date' && c) rs.sort((a, b) => ((a[c.k] == null ? -1e18 : a[c.k]) - (b[c.k] == null ? -1e18 : b[c.k])) * st.dir); else rs.sort((a, b) => (a.i - b.i) * (st.sort === 'date' ? st.dir : 1));
    return rs;
  }
  dayChart(X) {
    const rows = X.rows, st = this.state, n = rows.length, W = 920, H = 300, L = 62, R = 16, T = 26, Bm = 30, pw = W - L - R, ph = H - T - Bm, bw = pw / n;
    const m = v => this.money(v), AK = st.ln && st.ln.length ? st.ln : ['gP'], pk = AK.includes('gP') ? 'gP' : AK[0], mxK = r => Math.max.apply(null, AK.map(k => r[k]));
    const allMax = Math.max.apply(null, rows.map(mxK).concat([1])), LN = [['gP', this.C3.p], ['gC', this.C3.c], ['gT', this.C3.t]].filter(q => AK.includes(q[0]));
    const norMax = Math.max.apply(null, X.nor.map(mxK).concat([1]));
    const clip = !st.full && allMax > norMax * 1.6, cap = this.niceMax(clip ? norMax * 1.12 : allMax);
    const xs = i => L + (i + 0.5) * bw, ys = v => T + ph * (1 - Math.min(v, cap) / cap);
    let sv = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg" role="img" aria-label="GMV theo ngày, ba trạng thái đơn">';
    [0, 0.5, 1].forEach(f => { const y = T + ph * (1 - f); sv += '<line class="ox-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text class="ox-ax" x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + this.short(cap * f) + '</text>'; });
    rows.forEach((r, i) => { if (r.sale) sv += '<rect x="' + (L + i * bw).toFixed(1) + '" y="' + T + '" width="' + bw.toFixed(1) + '" height="' + ph + '" fill="#f59e0b" opacity=".13"/><text class="ox-ax" x="' + xs(i).toFixed(1) + '" y="' + (T - 8) + '" text-anchor="middle" style="fill:#b45309;font-weight:700">SALE</text>'; });
    const by = ys(X.avgN[pk]); sv += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + by + '" y2="' + by + '" stroke="#64748b" stroke-width="1.3" stroke-dasharray="5 4"/>';
    LN.forEach(s => { sv += '<polyline fill="none" stroke="' + s[1] + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" points="' + rows.map((r, i) => xs(i).toFixed(1) + ',' + ys(r[s[0]]).toFixed(1)).join(' ') + '"/>'; });
    rows.forEach((r, i) => {
      LN.forEach(s => { sv += '<circle cx="' + xs(i).toFixed(1) + '" cy="' + ys(r[s[0]]).toFixed(1) + '" r="' + (r[s[0]] > cap ? 3.6 : 2.4) + '" fill="' + (r[s[0]] > cap ? '#fff' : s[1]) + '" stroke="' + s[1] + '" stroke-width="1.6"/>'; });
      if (r[pk] > cap) { const nx = rows[i + 1] && rows[i + 1][pk] > cap, pv = rows[i - 1] && rows[i - 1][pk] > cap; sv += '<text class="ox-val" x="' + (xs(i) + (nx ? -8 : pv ? 8 : 0)).toFixed(1) + '" y="' + (T + 14) + '" text-anchor="' + (nx ? 'end' : pv ? 'start' : 'middle') + '" style="fill:#141F63">▲ ' + this.short2(r[pk]) + (nx || pv ? '' : ' (vượt trục)') + '</text>'; }
      const tip = this.tipT(r.dd + (r.sale ? ' · ngày sale' : ''), [['GMV đặt', m(r.gP), this.C3.p], ['GMV xác nhận', m(r.gC), this.C3.c], ['GMV thanh toán', m(r.gT), this.C3.t], ['Đơn đặt / thanh toán', this.num(r.ordP) + ' / ' + this.num(r.ordT), null], ['Lượt truy cập', this.num(r.visits), null]]);
      sv += '<g class="ox-hit"' + this.tipAttr(tip) + '><rect class="ox-hov" x="' + (L + i * bw).toFixed(1) + '" y="' + T + '" width="' + bw.toFixed(1) + '" height="' + ph + '"/></g><text class="ox-ax" x="' + xs(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + r.dd.slice(0, 2) + '</text>';
    });
    sv += '</svg>';
    const LNL = [['gP', 'GMV đặt', this.C3.p], ['gC', 'GMV xác nhận', this.C3.c], ['gT', 'GMV thanh toán', this.C3.t]];
    const leg = '<div class="ox-leg sh-lg">' + LNL.map(x => '<button type="button" class="sh-lb' + (AK.includes(x[0]) ? ' on' : '') + '" data-ln="' + x[0] + '" aria-pressed="' + AK.includes(x[0]) + '"><i style="background:' + x[2] + '"></i>' + x[1] + '</button>').join('') + '<span><i style="background:#64748b;height:3px;margin-top:5px"></i>TB ngày thường (' + LNL.find(x => x[0] === pk)[1] + ') ' + this.short2(X.avgN[pk]) + '</span></div>';
    const tg = '<button type="button" class="ox-tab' + (st.full ? ' on' : '') + ' pp-noprint" data-full="1">' + (st.full ? 'Đang hiện đủ trục' : 'Hiện đủ trục') + '</button>';
    return this.panel('ox-c12', 'GMV theo ngày · ba trạng thái đơn', X.bL + ' · ' + (clip ? 'trục cắt ở ' + this.short(cap) + ' để các ngày thường vẫn đọc được' : 'trục đủ') + ' · bấm tên đường để bật/tắt', leg + '<div class="sh-sv">' + sv + '</div>', 'Ba đường lấy từ các sheet Đơn đã đặt, Đã xác nhận, Đã thanh toán của file Total Sàn T' + X.LASTM + '. Khoảng cách giữa đường trên và đường dưới là GMV bị hủy hoặc chưa thanh toán. Ngày sale được tô cam và không tính vào trung bình ngày thường.', tg);
  }
  dayTable(X) {
    const st = this.state, cols = this.COLS().filter(c => st.cg.includes(c.g) && (c.g !== 'ads' || X.hasAds)), rs = this.dailyRows(X);
    const tr = (lab, o, cls) => '<tr class="sh-tr ' + cls + '"><td class="l"><b>' + lab + '</b></td>' + cols.map(c => '<td>' + c.f(o[c.k]) + (cls === 'tot' && (c.k === 'visits' || c.k === 'ctr') ? '<sup class="sh-dag">†</sup>' : '') + '</td>').join('') + '</tr>';
    const total = Object.assign({}, X.tot, { buyers: X.cur.buyers, newB: X.cur.newB, newPct: X.cur.newPct, pot: X.cur.pot, vsn: null, visits: X.cur.visits, ctr: X.cur.ctr });
    const avgN = Object.assign({}, X.aN); ['visits', 'clicks', 'ordP', 'ordC', 'ordT', 'gP', 'gC', 'gT', 'buyers', 'newB', 'pot', 'cost', 'adsG'].forEach(k => { avgN[k] = X.nor.length ? X.aN[k] / X.nor.length : 0; });
    avgN.vsn = null;
    const th = (k, t, d) => '<th class="' + (st.sort === k ? 'on' : '') + '" data-dsort="' + k + '" aria-sort="' + (st.sort === k ? (st.dir < 0 ? 'descending' : 'ascending') : 'none') + '"><button type="button">' + t + '<i>' + (st.sort === k ? (st.dir < 0 ? '▾' : '▴') : '') + '</i></button></th>';
    const head = '<tr><th class="l ' + (st.sort === 'date' ? 'on' : '') + '" data-dsort="date"><button type="button">Ngày<i>' + (st.sort === 'date' ? (st.dir < 0 ? '▾' : '▴') : '') + '</i></button></th>' + cols.map(c => th(c.k, c.l)).join('') + '</tr>';
    const body = rs.map(r => '<tr class="sh-tr' + (r.sale ? ' sale' : '') + '"><td class="l"><b>' + r.dd + '</b>' + (r.sale ? '<span class="sh-sale">SALE</span>' : '') + '</td>' + cols.map(c => '<td class="' + this.cellCls(X, c, r) + '">' + c.f(r[c.k]) + '</td>').join('') + '</tr>').join('');
    const foot = tr('Tổng cả kỳ', total, 'tot') + tr('TB ngày thường <small>(' + X.nor.length + ' ngày)</small>', avgN, 'avg');
    const chips = Object.keys(this.GL).filter(g => g !== 'ads' || X.hasAds).map(g => '<button type="button" class="ox-tab' + (st.cg.includes(g) ? ' on' : '') + '" data-cg="' + g + '">' + this.GL[g] + '</button>').join('') + '<button type="button" class="ox-tab" data-cg="*">Tất cả</button>';
    const ctl = '<div class="ok-chips pp-noprint"><div class="pp-row"><span class="pp-lab">Nhóm cột (chọn nhiều)</span>' + chips + '<span class="pp-acts" style="margin-left:auto"><button type="button" class="pp-btn" data-copyd="1">Sao chép bảng</button><button type="button" class="pp-btn" data-csvd="1">Tải CSV</button></span></div></div>';
    const note = 'Ô xanh/đỏ là ngày lệch mạnh so với mức giữa các ngày thường (từ 1.6 lần hoặc dưới 0.55 lần, với tỷ lệ là 1.4 và 0.7 lần). Ngày sale không tô màu. † Dòng Tổng dùng ' + this.num(X.cur.visits) + ' lượt truy cập khử trùng lặp của Shopee (cùng số ở thẻ KPI) nên nhỏ hơn tổng cộng từng ngày (' + this.num(X.tot.visits) + '); Click / truy cập của cả kỳ tính theo số này. Ngày sale: ' + X.sale.map(r => r.dd).join(', ') + '.';
    return this.panel('ox-c12', 'Chỉ số theo ngày', X.bL + ' · bấm tiêu đề cột để sắp xếp · chọn nhóm cột để bảng không quá rộng', ctl + '<div class="ox-tw pp-tw sh-tw"><table class="ox-t pp-t sh-t"><thead>' + head + '</thead><tbody>' + body + '</tbody><tfoot>' + foot + '</tfoot></table></div>', note);
  }
  dailyHtml(X) {
    if (!X.isDet) return this.noDaily(X, 'Số liệu theo ngày');
    return this.dayChart(X) + this.dayTable(X);
  }
  csvDaily(X, tsv) {
    const cols = this.COLS(), rs = this.dailyRows(X), sep = tsv ? '\t' : ',', q = v => tsv ? String(v) : '"' + String(v).replace(/"/g, '""') + '"';
    const raw = (c, r) => { const v = r[c.k]; if (v == null || !isFinite(v)) return ''; return ['ctr', 'crP', 'crT', 'cancR', 'tPct', 'newPct', 'cir', 'vsn'].includes(c.k) ? +(v * 100).toFixed(2) : c.k === 'roas' ? +v.toFixed(2) : Math.round(v); };
    return [['Ngày'].concat(cols.filter(c => c.g !== 'ads' || X.hasAds).map(c => c.l + (['ctr', 'crP', 'crT', 'cancR', 'tPct', 'newPct', 'cir', 'vsn'].includes(c.k) ? ' (%)' : ''))).map(q).join(sep)].concat(rs.map(r => [r.dd + (r.sale ? ' (sale)' : '')].concat(cols.filter(c => c.g !== 'ads' || X.hasAds).map(c => raw(c, r))).map(q).join(sep))).join('\n');
  }
  // ---- Theo tháng --------------------------------------------------------------------------------------------
  MM() { return { gp: ['GMV đặt', x => x.gP, v => this.money(v)], gc: ['GMV xác nhận', x => x.gC, v => this.money(v)], gt: ['GMV thanh toán', x => x.gT, v => this.money(v)], gpd: ['GMV đặt TB/ngày', x => x.gpd, v => this.money(v)], ord: ['Đơn đặt', x => x.ordP, v => this.num(v)], vis: ['Truy cập', x => x.visits, v => this.num(v)], cr: ['CR đặt', x => x.crP, v => this.pct(v, 2)], aov: ['AOV thanh toán', x => x.aovT, v => this.money(v)], canc: ['Tỷ lệ hủy', x => x.cancR, v => this.pct(v, 1)] }; }
  monthChart(X) {
    const st = this.state, MM = this.MM(), def = MM[st.mm] || MM.gp, vals = X.months.map(x => def[1](x)), n = vals.length, W = 920, H = 270, L = 62, R = 12, T = 28, Bm = 30, pw = W - L - R, ph = H - T - Bm, bw = pw / n;
    const mx = this.niceMax(Math.max.apply(null, vals.map(v => v || 0).concat([0.0001])));
    let sv = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg" role="img" aria-label="' + def[0] + ' theo tháng"><defs><pattern id="shh" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#a9c8ff"/><line x1="0" y1="0" x2="0" y2="6" stroke="#fff" stroke-width="2.4"/></pattern></defs>';
    [0, 0.5, 1].forEach(f => { const y = T + ph * (1 - f); sv += '<line class="ox-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text class="ox-ax" x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + (st.mm === 'cr' || st.mm === 'canc' ? this.pct(mx * f, st.mm === 'cr' ? 1 : 0) : (['ord', 'vis'].includes(st.mm) ? this.short(mx * f) : this.short2(mx * f))) + '</text>'; });
    vals.forEach((v, i) => {
      const x = L + i * bw, w = bw * 0.62, x0 = x + (bw - w) / 2, h = (v || 0) / mx * ph, y = T + ph - h, mo = X.months[i], on = i === X.mo - 1;
      const tip = this.tipT('T' + mo.m + (mo.partial ? '* · ' + mo.days + '/' + this.dimOf(mo.m) + ' ngày' : '') + ' · ' + def[0], [[def[0], def[2](v), null], ['GMV đặt TB/ngày', this.money(mo.gpd), null], ['Đơn đặt', this.num(mo.ordP), null], ['Tỷ lệ hủy', this.pct(mo.cancR, 1), null]]);
      if (on) sv += '<rect class="ox-sel" x="' + (x + 2) + '" y="' + (T - 16) + '" width="' + (bw - 4) + '" height="' + (ph + 16 + Bm - 6) + '"/>';
      sv += '<g class="ox-hit" data-mo="' + mo.m + '"' + this.tipAttr(tip) + '><rect x="' + x0.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(0.5, h).toFixed(1) + '" rx="4" fill="' + (mo.partial ? 'url(#shh)' : '#2f6df0') + '"' + (mo.partial ? ' stroke="#2f6df0" stroke-width="1.4"' : '') + '/><rect class="ox-hov" x="' + x.toFixed(1) + '" y="' + (T - 16) + '" width="' + bw.toFixed(1) + '" height="' + (ph + Bm + 16) + '"/></g><text class="ox-val" x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="middle">' + (st.mm === 'cr' || st.mm === 'canc' ? this.pct(v, st.mm === 'cr' ? 2 : 1) : (['ord', 'vis'].includes(st.mm) ? this.short(v) : this.short2(v))) + '</text><text class="ox-ax' + (on ? ' ox-axon' : '') + '" x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">T' + mo.m + (mo.partial ? '*' : '') + '</text>';
    });
    sv += '</svg>';
    const chips = Object.keys(MM).map(k => '<button type="button" class="ox-tab' + (st.mm === k ? ' on' : '') + '" data-mm="' + k + '">' + MM[k][0] + '</button>').join('');
    return this.panel('ox-c12', def[0] + ' theo tháng', 'Cột gạch chéo là T' + X.LASTM + '*, mới có ' + X.nd + '/' + this.dimOf(X.LASTM) + ' ngày · bấm cột để chọn tháng · chọn "GMV đặt TB/ngày" để so công bằng với tháng đủ', '<div class="pp-row pp-noprint" style="margin-bottom:6px">' + chips + '</div><div class="sh-sv">' + sv + '</div>', this.moNote(X, st.mm, vals));
  }
  monthTable(X) {
    const st = this.state, m = v => this.money(v), n = v => this.num(v);
    const G = {
      rev: ['Doanh thu', [['GMV đặt', x => m(x.gP)], ['GMV xác nhận', x => m(x.gC)], ['GMV thanh toán', x => m(x.gT)], ['Thanh toán / đặt', x => x.partial ? '<span class="sh-dim"' + this.tipAttr(this.tipT('Chưa chốt', [['Lý do', 'Đơn đặt gần đây chưa kịp thanh toán', null]])) + '>' + this.pct(x.tPct, 1) + '*</span>' : this.pct(x.tPct, 1)], ['GMV đặt TB/ngày', x => m(x.gpd)]]],
      ord: ['Đơn & CR', [['Đơn đặt', x => n(x.ordP)], ['Đơn thanh toán', x => n(x.ordT)], ['CR đặt', x => this.pct(x.crP, 2)], ['CR thanh toán', x => this.pct(x.crT, 2)], ['AOV thanh toán', x => m(x.aovT)]]],
      traf: ['Lưu lượng', [['Lượt truy cập', x => n(x.visits)], ['Click SP', x => n(x.clicks)], ['Click / truy cập', x => this.pct(x.ctr, 1)], ['Truy cập TB/ngày', x => n(x.visits / x.days)]]],
      canc: ['Hủy & hoàn', [['Đơn hủy', x => n(x.canc)], ['Tỷ lệ hủy', x => this.pct(x.cancR, 1)], ['GMV hủy', x => m(x.cancG)], ['Đơn hoàn', x => n(x.ret)], ['GMV hoàn', x => m(x.retG)]]],
      kpi: ['KPI NMV', [['NMV (Order_data)', x => m(x.nmv)], ['KPI tháng', x => x.kpi ? m(x.kpi) : '—'], ['% đạt KPI', x => this.pct(x.kpiPct, 0)]]]
    };
    const g = G[st.mcg] || G.rev, mxg = Math.max.apply(null, X.months.map(x => x.gpd).concat([1]));
    const head = '<tr><th class="l">Tháng</th><th>Số ngày</th>' + g[1].map(c => '<th>' + c[0] + '</th>').join('') + '</tr>';
    const body = X.months.map(x => '<tr class="pp-r' + (x.m === X.mo ? ' sel' : '') + '" data-mo="' + x.m + '" tabindex="0"><td class="l"><b>T' + x.m + (x.partial ? '*' : '') + '</b></td><td>' + x.days + (x.partial ? '/' + this.dimOf(x.m) : '') + '</td>' + g[1].map(c => '<td>' + c[1](x) + '</td>').join('') + '</tr>').join('');
    const chips = Object.keys(G).map(k => '<button type="button" class="ox-tab' + (st.mcg === k ? ' on' : '') + '" data-mcg="' + k + '">' + G[k][0] + '</button>').join('');
    return this.panel('ox-c12', 'Chỉ số theo tháng', 'T1–T' + X.LASTM + ' · chọn nhóm cột để bảng gọn, bấm một dòng để chọn tháng', '<div class="ok-chips pp-noprint"><div class="pp-row"><span class="pp-lab">Nhóm cột</span>' + chips + '</div></div><div class="ox-tw pp-tw"><table class="ox-t pp-t"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>', 'KPI tháng lấy từ KPI Monthly Plan 2026, kênh Shopee. NMV theo Order_data (đơn không hủy), khác với GMV đặt/xác nhận/thanh toán trong báo cáo Business Insights của Shopee. T' + X.LASTM + '* mới có ' + X.nd + ' ngày; dấu * ở cột Thanh toán / đặt nghĩa là đơn đặt gần đây chưa kịp thanh toán nên tỷ lệ còn thấp, chưa phải mức cuối.');
  }
  moHtml(X) { return this.monthChart(X) + this.monthTable(X); }
  // ---- Người mua ---------------------------------------------------------------------------------------------
  buyHtml(X) {
    const c = X.cur, n = v => this.num(v);
    const cards = '<div class="pp-cards sh-c5">' + [['buyer', 'Người mua', n(c.buyers), X.isDet ? n(c.buyers / X.nd) + ' người/ngày' : 'trong tháng'], ['aov', 'Người mua mới', n(c.newB), this.pct(c.newPct, 1) + ' tổng người mua'], ['phủ', 'Người mua cũ', n(c.exB), this.pct(c.buyers ? c.exB / c.buyers : null, 1) + ' tổng người mua'], ['roas', 'Tỷ lệ quay lại', this.pct(c.retRate, 2), 'Người mua cũ / tiềm năng'], ['target', 'Tiềm năng', n(c.pot), 'Đã xem sản phẩm nhưng chưa mua']].map(k => '<div class="ox-card pp-card"><div class="ox-cl">' + this.ic(k[0]) + '<span>' + k[1] + '</span></div><div class="ox-cv">' + k[2] + '</div><div class="ox-ce"><span>' + k[3] + '</span></div></div>').join('') + '</div>';
    const stack = (data, labs, tips, W, selI, capV, flagI, compact, pctRow) => {
      const nn = data.length, H = 250, L = 46, R = 10, T = 26, Bm = 52, pw = W - L - R, ph = H - T - Bm, bw = pw / nn, mx = this.niceMax(capV);
      let sv = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg" role="img" aria-label="Người mua mới và cũ">';
      [0, 0.5, 1].forEach(f => { const y = T + ph * (1 - f); sv += '<line class="ox-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text class="ox-ax" x="' + (L - 5) + '" y="' + (y + 4) + '" text-anchor="end">' + this.num(mx * f) + '</text>'; });
      data.forEach((d, i) => {
        const x = L + i * bw, w = bw * 0.66, x0 = x + (bw - w) / 2, tot = d[0] + d[1], hN = Math.min(d[0], mx) / mx * ph, hE = Math.max(0, Math.min(tot, mx) - Math.min(d[0], mx)) / mx * ph, clip = tot > mx;
        sv += '<g class="ox-hit"' + this.tipAttr(tips[i]) + '><rect x="' + x0.toFixed(1) + '" y="' + (T + ph - hN).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + hN.toFixed(1) + '" rx="3" fill="#2f6df0" opacity="' + (selI == null || selI === i ? 1 : 0.6) + '"/><rect x="' + x0.toFixed(1) + '" y="' + (T + ph - hN - hE).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + hE.toFixed(1) + '" rx="3" fill="#9bd0ff"/><rect class="ox-hov" x="' + x.toFixed(1) + '" y="' + T + '" width="' + bw.toFixed(1) + '" height="' + ph + '"/></g><text class="ox-val" x="' + (x + bw / 2).toFixed(1) + '" y="' + (T + ph - hN - hE - 5).toFixed(1) + '" text-anchor="middle"' + (clip ? ' style="fill:#b45309"' : '') + '>' + (clip ? '▲' : '') + (compact && tot >= 1000 ? (tot / 1000).toFixed(1) + 'K' : this.num(tot)) + '</text><text class="ox-ax' + (flagI && flagI[i] ? '" style="fill:#b45309;font-weight:700' : '') + '" x="' + (x + bw / 2).toFixed(1) + '" y="' + (pctRow === false ? H - 24 : H - 32) + '" text-anchor="middle">' + labs[i] + '</text>' + (pctRow === false ? '' : '<text class="ox-ax" x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 17) + '" text-anchor="middle" style="fill:#5b6b85">' + (tot ? Math.round(d[0] / tot * 100) + '%' : '') + '</text>');
      });
      return sv + '</svg>';
    };
    const leg = this.legend([{ c: '#2f6df0', t: 'Người mua mới' }, { c: '#9bd0ff', t: 'Người mua cũ' }]);
    const mD = X.months.map(x => [x.newB || 0, x.exB || 0]), mT = X.months.map(x => this.tipT('T' + x.m + (x.partial ? '*' : ''), [['Người mua', n(x.buyers), null], ['Mới', n(x.newB) + ' (' + this.pct(x.newPct, 0) + ')', '#2f6df0'], ['Cũ', n(x.exB), '#9bd0ff'], ['Tiềm năng', n(x.pot), null]]));
    const PM = this.panel(X.isDet ? 'ox-c5' : 'ox-c12', 'Người mua theo tháng', 'Mới và cũ · % người mua mới xem ở bảng bên dưới · T' + X.LASTM + '* mới có ' + X.nd + ' ngày', leg + '<div class="sh-sv">' + stack(mD, X.months.map(x => 'T' + x.m + (x.partial ? '*' : '')), mT, X.isDet ? 440 : 920, X.mo - 1, Math.max.apply(null, mD.map(d => d[0] + d[1]).concat([1])), null, !X.isDet ? false : true, false) + '</div>', 'Người mua mới luôn chiếm khoảng ' + this.pct(Math.min.apply(null, X.months.map(x => x.newPct == null ? 1 : x.newPct)), 0) + '–' + this.pct(Math.max.apply(null, X.months.map(x => x.newPct || 0)), 0) + ' người mua mỗi tháng.');
    let PD = '';
    if (X.isDet) {
      const nm = X.nor.map(r => r.buyers), cap = Math.max.apply(null, nm.concat([1])) * 1.3;
      const dD = X.rows.map(r => [r.newB, r.exB]), dT = X.rows.map(r => this.tipT(r.dd + (r.sale ? ' · ngày sale' : ''), [['Người mua', n(r.buyers), null], ['Mới', n(r.newB) + ' (' + this.pct(r.newPct, 0) + ')', '#2f6df0'], ['Cũ', n(r.exB), '#9bd0ff'], ['Tiềm năng', n(r.pot), null]]));
      PD = this.panel('ox-c7', 'Người mua theo ngày', X.bL + ' · cột cắt ở ' + n(this.niceMax(cap)) + ' để ngày thường đọc được', leg + '<div class="sh-sv">' + stack(dD, X.rows.map(r => r.dd.slice(0, 2)), dT, 640, null, cap, X.rows.map(r => r.sale)) + '</div>', 'Người mua mới chiếm ' + this.pct(c.newPct, 1) + ' cả kỳ nên được tách thành hai màu thay vì cộng chung. Mũi tên ▲ là ngày vượt trục (ngày sale).');
    }
    const head = '<tr><th class="l">Tháng</th><th>Người mua</th><th>Mới</th><th>Cũ</th><th>% mới</th><th>Tiềm năng</th><th>Tỷ lệ quay lại</th></tr>';
    const body = X.months.map(x => '<tr class="pp-r' + (x.m === X.mo ? ' sel' : '') + '" data-mo="' + x.m + '" tabindex="0"><td class="l"><b>T' + x.m + (x.partial ? '*' : '') + '</b></td><td>' + n(x.buyers) + '</td><td>' + n(x.newB) + '</td><td>' + n(x.exB) + '</td><td>' + this.pct(x.newPct, 0) + '</td><td>' + n(x.pot) + '</td><td>' + this.pct(x.retRate, 2) + '</td></tr>').join('');
    const PT = this.panel('ox-c12', 'Bảng người mua theo tháng', 'Trạng thái đã thanh toán · bấm một dòng để chọn tháng', '<div class="ox-tw pp-tw"><table class="ox-t pp-t"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>');
    return cards + '<section class="ox-charts">' + PM + PD + '</section>' + PT;
  }
  // ---- Nguồn & SKU -------------------------------------------------------------------------------------------
  thumb(p, z) {
    const u = p.img && typeof window.__img === 'function' ? window.__img('thumbs/' + String(p.img).replace(/\.(jpe?g|webp)$/i, '.png')) : null;
    if (u) return '<span class="pp-im" style="width:' + z + 'px;height:' + z + 'px;background:#fff url(\'' + u + '\') center/contain no-repeat"></span>';
    return '<span class="pp-im pp-ph" style="width:' + z + 'px;height:' + z + 'px;font-size:' + Math.round(z * 0.4) + 'px">' + this.esc((String(p.code || p.name || '?')[0] || '?').toUpperCase()) + '</span>';
  }
  srcHtml(X) {
    if (!X.isDet) return this.noDaily(X, 'Nguồn lưu lượng, ads và SKU');
    const O = X.O, S = (O.sources || {}).placed || { groups: [] }, st = this.state, m = v => this.money(v), n = v => this.num(v);
    const gs = S.groups.filter(g => !g.isAds), ads = S.groups.find(g => g.isAds), tot = gs.reduce((s, g) => s + ((g.total || {}).gmv || 0), 0);
    const tR = g => { const t = g.total || {}; return '<tr><td class="l"><i class="sh-dot" style="background:' + (this.GCL[g.group] || '#8a93ab') + '"></i>' + this.esc(g.group) + '</td><td>' + m(t.gmv) + '</td><td>' + this.pct(tot ? t.gmv / tot : null, 1) + '</td><td>' + n(t.views) + '</td><td>' + n(t.clicks) + '</td><td>' + this.pct(t.ctr, 2) + '</td><td>' + this.pct(t.cr, 2) + '</td><td>' + n(t.orders) + '</td><td>' + m(t.aov) + '</td></tr>'; };
    const bar = '<div class="sh-sb">' + gs.map(g => { const t = g.total || {}; return '<span style="width:' + (tot ? t.gmv / tot * 100 : 0) + '%;background:' + (this.GCL[g.group] || '#8a93ab') + '"' + this.tipAttr(this.tipT(g.group, [['GMV đặt', m(t.gmv), null], ['Tỷ trọng', this.pct(tot ? t.gmv / tot : null, 1), null]])) + '></span>'; }).join('') + '</div>' + this.legend(gs.map(g => ({ c: this.GCL[g.group] || '#8a93ab', t: g.group + ' · ' + this.pct(tot ? (g.total || {}).gmv / tot : null, 1) })));
    const allT = gs.reduce((o, g) => { const t = g.total || {}; o.views += t.views || 0; o.clicks += t.clicks || 0; o.orders += t.orders || 0; return o; }, { views: 0, clicks: 0, orders: 0 });
    const tb = '<div class="ox-tw"><table class="ox-t pp-t"><thead><tr><th class="l">Nhóm nguồn</th><th>GMV đặt</th><th>Tỷ trọng</th><th>Hiển thị</th><th>Click SP</th><th>CTR</th><th>CR</th><th>Đơn</th><th>AOV</th></tr></thead><tbody>' + gs.map(tR).join('') + '<tr class="sh-tr tot"><td class="l"><b>Tổng 4 nhóm</b></td><td>' + m(tot) + '</td><td>100%</td><td>' + n(allT.views) + '</td><td>' + n(allT.clicks) + '</td><td>' + this.pct(allT.views ? allT.clicks / allT.views : null, 2) + '</td><td>' + this.pct(allT.clicks ? allT.orders / allT.clicks : null, 2) + '</td><td>' + n(allT.orders) + '</td><td>' + m(allT.orders ? tot / allT.orders : null) + '</td></tr></tbody></table></div>';
    const P1 = this.panel('ox-c12', 'GMV theo nhóm nguồn lưu lượng', X.bL + ' · trạng thái đơn đã đặt · tổng ' + m(tot), bar + tb, 'Bốn nhóm cộng lại bằng GMV shop, tức mỗi đơn chỉ thuộc một nhóm. Dịch vụ Hiển thị Shopee (' + (ads ? m((ads.total || {}).gmv) : '—') + ') tính chồng lên các nhóm trên nên không cộng vào tổng.');
    // heatmap
    const sd = ((O.sourcesDaily || {}).placed || []).filter(g => !g.isAds).map(g => ({ g: g.group, d: (g.subs.find(s => s.isTotal) || g.subs[0]).days || [] }));
    const hmMode = st.hm, nD = X.rows.length;
    const colSum = i => sd.reduce((s, r) => s + ((r.d[i] || {}).gmv || 0), 0);
    const hm = '<div class="sh-hm" style="grid-template-columns:130px repeat(' + nD + ',minmax(34px,1fr))"><span></span>' + X.rows.map(r => '<span class="sh-hh' + (r.sale ? ' sale' : '') + '">' + r.dd.slice(0, 2) + '</span>').join('') + sd.map(r => {
      const vals = r.d.map((x, i) => hmMode === 'gmv' ? (x.gmv || 0) : (colSum(i) ? (x.gmv || 0) / colSum(i) : 0)), mx = Math.max.apply(null, vals.concat([0.0001]));
      return '<span class="sh-hn"><i class="sh-dot" style="background:' + (this.GCL[r.g] || '#8a93ab') + '"></i>' + this.esc(r.g) + '</span>' + vals.map((v, i) => { const t = this.tipT(r.g + ' · ' + X.rows[i].dd, [['GMV đặt', m((r.d[i] || {}).gmv || 0), null], ['Tỷ trọng ngày', this.pct(colSum(i) ? ((r.d[i] || {}).gmv || 0) / colSum(i) : null, 0), null], ['Đơn', n((r.d[i] || {}).orders || 0), null]]); return '<span class="sh-hc"' + this.tipAttr(t) + ' style="background:rgba(37,99,235,' + (0.07 + 0.78 * v / mx).toFixed(2) + ');color:' + (v / mx > 0.55 ? '#fff' : '#0f1b3a') + '">' + (hmMode === 'gmv' ? (v >= 1e6 ? this.short(v) : '') : (v >= 0.05 ? Math.round(v * 100) + '%' : '')) + '</span>'; }).join('');
    }).join('') + '</div>';
    const hch = '<div class="pp-row pp-noprint" style="margin-bottom:8px"><button type="button" class="ox-tab' + (hmMode === 'gmv' ? ' on' : '') + '" data-hm="gmv">GMV (chuẩn hóa từng hàng)</button><button type="button" class="ox-tab' + (hmMode === 'share' ? ' on' : '') + '" data-hm="share">Tỷ trọng trong ngày</button></div>';
    const P2 = this.panel('ox-c12', 'Nhóm nguồn theo ngày', X.bL + ' · ô càng đậm càng cao · cột cam là ngày sale', hch + '<div class="sh-hmw">' + hm + '</div>', 'Chế độ GMV chuẩn hóa riêng từng hàng vì Tiếp thị liên kết lớn hơn Video hàng trăm lần; chế độ Tỷ trọng cho biết trong một ngày nhóm nào đóng góp nhiều nhất.');
    // sub-source
    const sg = st.sg && gs.find(g => g.group === st.sg) ? st.sg : (gs[0] || {}).group, cur = gs.find(g => g.group === sg) || { subs: [], total: {} }, ct = cur.total || {};
    const subs = (cur.subs || []).filter(s => (s.gmv || 0) > 0 || (s.clicks || 0) > 0), smx = Math.max.apply(null, subs.map(s => s.gmv || 0).concat([1]));
    const sch = gs.map(g => '<button type="button" class="ox-tab' + (g.group === sg ? ' on' : '') + '" data-sg="' + this.esc(g.group) + '"><i class="pp-dot" style="background:' + (this.GCL[g.group] || '#8a93ab') + '"></i>' + this.esc(g.group) + '</button>').join('');
    const sc = '<div class="sh-c4">' + [['GMV đặt', m(ct.gmv)], ['Đơn', n(ct.orders)], ['CTR', this.pct(ct.ctr, 2)], ['CR', this.pct(ct.cr, 2)]].map(k => '<div class="sh-mc"><span>' + k[0] + '</span><b>' + k[1] + '</b></div>').join('') + '</div>';
    const st2 = '<div class="ox-tw"><table class="ox-t pp-t"><thead><tr><th class="l">Nguồn con</th><th>GMV đặt</th><th>Tỷ trọng</th><th>Click SP</th><th>CTR</th><th>CR</th><th>Đơn</th><th>AOV</th></tr></thead><tbody>' + subs.map(s => '<tr><td class="l">' + this.esc(s.name) + '</td><td class="sh-bc"><i style="width:' + ((s.gmv || 0) / smx * 100).toFixed(0) + '%"></i><span>' + m(s.gmv) + '</span></td><td>' + this.pct(s.share, 1) + '</td><td>' + n(s.clicks) + '</td><td>' + this.pct(s.ctr, 2) + '</td><td>' + this.pct(s.cr, 2) + '</td><td>' + n(s.orders) + '</td><td>' + m(s.aov) + '</td></tr>').join('') + '</tbody></table></div>';
    const P3 = this.panel('ox-c12', 'Nguồn con trong nhóm', 'Chọn nhóm để xem chi tiết · ' + subs.length + ' nguồn con có phát sinh', '<div class="pp-row pp-noprint" style="margin-bottom:6px">' + sch + '</div>' + sc + st2, 'CTR trên 100% ở Live và Affiliate xảy ra vì Shopee tính click theo lượt người xem cả luồng phát trực tiếp, nên nên đọc để so sánh nội bộ giữa các nguồn.');
    // ads types
    let P4 = '';
    if (ads) {
      const all = (ads.subs || []).filter(s => (s.cost || 0) > 0 || (s.gmv || 0) > 0), at = ads.total || {}, tc = at.cost || 0;
      const as = all.filter(s => !tc || (s.cost || 0) >= tc * 0.01), sm = all.filter(s => tc && (s.cost || 0) < tc * 0.01);
      if (sm.length) { const o = { name: 'Khác (' + sm.length + ' loại, mỗi loại dưới 1% chi phí)', cost: 0, gmv: 0, impressions: 0, orders: 0, cr: null, roas: null }; sm.forEach(s => { o.cost += s.cost || 0; o.gmv += s.gmv || 0; o.impressions += s.impressions || 0; o.orders += s.orders || 0; }); o.roas = o.cost && o.gmv ? o.gmv / o.cost : null; as.push(o); }
      const amx = Math.max.apply(null, as.map(s => s.cost || 0).concat([1]));
      P4 = this.panel('ox-c12', 'Ads theo loại quảng cáo', X.bL + ' · chi phí ' + m(at.cost) + ' · ROAS ×' + (at.roas || 0).toFixed(1), '<div class="ox-tw"><table class="ox-t pp-t"><thead><tr><th class="l">Loại Ads</th><th>Chi phí</th><th>GMV</th><th>ROAS</th><th>Hiển thị</th><th>CR</th><th>Đơn</th></tr></thead><tbody>' + as.map(s => '<tr><td class="l">' + this.esc(s.name) + '</td><td class="sh-bc"><i style="width:' + ((s.cost || 0) / amx * 100).toFixed(0) + '%"></i><span>' + m(s.cost) + '</span></td><td>' + m(s.gmv) + '</td><td class="' + (s.roas >= 10 ? 'goodw' : s.roas > 0 && s.roas < 5 ? 'badw' : '') + '">' + (s.roas == null ? '—' : '×' + s.roas.toFixed(2)) + '</td><td>' + n(s.impressions) + '</td><td>' + this.pct(s.cr, 2) + '</td><td>' + n(s.orders) + '</td></tr>').join('') + '<tr class="sh-tr tot"><td class="l"><b>Tổng Ads</b></td><td>' + m(at.cost) + '</td><td>' + m(at.gmv) + '</td><td>×' + (at.roas || 0).toFixed(2) + '</td><td>' + n(at.impressions) + '</td><td>—</td><td>' + n(at.orders) + '</td></tr></tbody></table></div>', 'ROAS = GMV do Ads mang lại / chi phí Ads, theo cách Shopee tính. Chi phí là mức tiêu thụ thực trong kỳ, khác số tiền nạp ví Ads dùng trong tab Daily Tracking.');
    }
    // SKU: 20 dòng = top 5 listing của từng nhóm nguồn (4 nhóm x 5), nên gộp theo mã và cho xem theo từng nhóm
    const ps = ((O.products || {}).placed || []).slice(), sk = st.skuG && (st.skuG === 'all' || gs.find(g => g.group === st.skuG)) ? st.skuG : 'all', open = st.skuOpen || {};
    const rowsAll = ps.map((p, i) => Object.assign({}, p, { src: (gs[Math.floor(i / 5)] || {}).group || '' }));
    const cell = (o, pmax, shv) => '<td class="sh-bc"><i style="width:' + ((o.gmv || 0) / pmax * 100).toFixed(0) + '%"></i><span>' + m(o.gmv) + '</span></td><td>' + this.pct(shv, 1) + '</td><td>' + n(o.impressions) + '</td><td>' + n(o.clicks) + '</td><td>' + this.pct(o.ctr, 2) + '</td><td>' + this.pct(o.cr, 2) + '</td><td>' + n(o.orders) + '</td><td>' + m(o.aov) + '</td>';
    const skuNm = p => '<b title="' + this.esc(this.nmS(p.name)) + '">' + this.esc(this.nmS(p.name)) + '</b>';
    let skuRows = '', skuTitle, skuSub, skuFoot, shHead, skuBtn = '';
    if (sk === 'all') {
      const G = {};
      rowsAll.forEach(p => { const k = p.code || this.nmS(p.name), g = G[k] || (G[k] = { k, code: p.code || '', items: [], gmv: 0, impressions: 0, clicks: 0, orders: 0 }); g.items.push(p); g.gmv += p.gmv || 0; g.impressions += p.impressions || 0; g.clicks += p.clicks || 0; g.orders += p.orders || 0; });
      const gl = Object.keys(G).map(k => G[k]).sort((a, b) => b.gmv - a.gmv);
      gl.forEach(g => { g.items.sort((a, b) => (b.gmv || 0) - (a.gmv || 0)); g.top = g.items[0]; g.ctr = g.impressions ? g.clicks / g.impressions : null; g.cr = g.clicks ? g.orders / g.clicks : null; g.aov = g.orders ? g.gmv / g.orders : null; });
      const show = st.skuAll ? gl : gl.slice(0, 10), pm = Math.max.apply(null, gl.map(g => g.gmv).concat([1]));
      skuRows = show.map(g => {
        const p = g.top, multi = g.items.length > 1, isOpen = !!open[g.k];
        let h = '<tr><td class="l pp-c-sku">' + this.thumb(p, 38) + '<span class="pp-sn">' + skuNm(p) + '<small>' + this.esc(g.code || '') + (multi ? '' : ' · ' + this.esc(p.src)) + '</small>' + (multi ? '<button type="button" class="sh-ex pp-noprint" aria-expanded="' + isOpen + '" data-skuex="' + this.esc(g.k) + '">' + (isOpen ? '▾ Ẩn' : '▸ Xem') + ' ' + g.items.length + ' nguồn</button>' : '') + '</span></td>' + cell(g, pm, tot ? g.gmv / tot : null) + '</tr>';
        if (multi && isOpen) g.items.forEach(q => { h += '<tr class="sh-sub"><td class="l pp-c-sku"><span class="pp-sn">' + skuNm(q) + '<small><em class="sh-src">' + this.esc(q.src) + '</em>' + (q.status ? ' · ' + this.esc(q.status) : '') + '</small></span></td>' + cell(q, pm, tot ? q.gmv / tot : null) + '</tr>'; });
        return h;
      }).join('');
      skuTitle = 'GMV theo mã SKU · Top ' + show.length; shHead = '% GMV shop';
      skuSub = X.bL + ' · trạng thái đơn đã đặt · ' + gl.length + ' mã, cộng từ ' + ps.length + ' dòng top 5 của 4 nhóm nguồn · bấm "Xem … nguồn" để thấy mã đó bán qua nhóm nào';
      skuFoot = 'Mỗi nhóm nguồn chỉ cung cấp 5 listing hàng đầu, nên GMV của một mã là mức tối thiểu (chưa gồm phần nằm ngoài top 5 của từng nhóm). Tỷ trọng tính trên GMV cả shop ' + m(tot) + '.';
      if (gl.length > 10) skuBtn = '<button type="button" class="pp-btn pp-noprint" data-skuall="1">' + (st.skuAll ? 'Chỉ hiện Top 10' : 'Hiện cả ' + gl.length + ' mã') + '</button>';
    } else {
      const its = rowsAll.filter(p => p.src === sk).sort((a, b) => (b.gmv || 0) - (a.gmv || 0)), pm = Math.max.apply(null, its.map(p => p.gmv || 0).concat([1])), grp = gs.find(g => g.group === sk) || { total: {} }, gt = (grp.total || {}).gmv || 0, sum5 = its.reduce((a, p) => a + (p.gmv || 0), 0);
      skuRows = its.map(p => '<tr><td class="l pp-c-sku">' + this.thumb(p, 38) + '<span class="pp-sn">' + skuNm(p) + '<small>' + this.esc(p.code || '') + (p.status ? ' · ' + this.esc(p.status) : '') + '</small></span></td>' + cell(p, pm, p.share) + '</tr>').join('');
      skuTitle = 'Top listing · ' + this.esc(sk); shHead = '% trong nhóm';
      skuSub = X.bL + ' · trạng thái đơn đã đặt · 5 listing hàng đầu của nhóm ' + this.esc(sk) + ' · nhóm này có GMV ' + m(gt);
      skuFoot = '5 listing hàng đầu chiếm ' + this.pct(gt ? sum5 / gt : null, 0) + ' GMV của nhóm ' + this.esc(sk) + '. Tỷ trọng tính trên GMV của riêng nhóm này.';
    }
    const skch = '<div class="pp-row pp-noprint" style="margin-bottom:6px"><button type="button" class="ox-tab' + (sk === 'all' ? ' on' : '') + '" data-skug="all">Tổng hợp theo mã</button>' + gs.map(g => '<button type="button" class="ox-tab' + (g.group === sk ? ' on' : '') + '" data-skug="' + this.esc(g.group) + '"><i class="pp-dot" style="background:' + (this.GCL[g.group] || '#8a93ab') + '"></i>' + this.esc(g.group) + '</button>').join('') + '</div>';
    const P5 = this.panel('ox-c12', skuTitle, skuSub, skch + '<div class="ox-tw pp-tw"><table class="ox-t pp-t"><thead><tr><th class="l">SKU</th><th>GMV đặt</th><th>' + shHead + '</th><th>Hiển thị</th><th>Click</th><th>CTR</th><th>CR</th><th>Đơn</th><th>AOV</th></tr></thead><tbody>' + skuRows + '</tbody></table></div>', skuFoot, skuBtn);
    const stt = st.srcTab || 'src', nav = '<div class="ok-chips pp-noprint"><div class="pp-row"><span class="pp-lab">Xem</span>' + [['src', 'Nguồn lưu lượng'], ['ads', 'Quảng cáo (Ads)'], ['sku', 'SKU']].map(x => '<button type="button" class="ox-tab' + (stt === x[0] ? ' on' : '') + '" data-srct="' + x[0] + '">' + x[1] + '</button>').join('') + '</div></div>';
    return nav + (stt === 'ads' ? (P4 || '<div class="ox-panel ox-c12"><div class="ok-empty">Chưa có dữ liệu Ads.</div></div>') : stt === 'sku' ? P5 : P1 + P2 + P3);
  }
  // ---- CSS ----------------------------------------------------------------------------------------------------
/*PPUTIL*/
  SH_CSS() { const o = this.OX_CSS(), k = o.indexOf('</style>'); return o.slice(0, k) + this.OK_OWN() + this.PP_OWN() + this.SH_OWN() + o.slice(k); }
/*PPOWN*/
  SH_OWN() {
    return '' +
      '.sh-vr{display:grid;grid-template-columns:96px auto minmax(60px,1fr);gap:10px;align-items:center;font-size:13px;color:#0f1b3a}.sh-vr>span:first-child{color:var(--ox-mut)}.sh-vr b{white-space:nowrap}.sh-vt{height:10px;border-radius:99px;background:rgba(37,99,235,.12);overflow:hidden;display:block}.sh-vt i{display:block;height:100%;border-radius:99px}' +
      '.sh-ads{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.sh-ads .ox-cv{font-size:26px}' +
      '.sh-algrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}.pp-al .pp-link{margin-top:auto}' +
      '.sh-kg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:6px}.sh-kg>div{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.7);border:1px solid #dbe7fb;min-width:0}.sh-kg span{font-size:12.5px;color:var(--ox-mut)}.sh-kg b{font-family:var(--font-heading);font-size:21px;color:#0b1530}.sh-kg u{text-decoration:none;font-size:12px;color:var(--ox-mut);line-height:1.4}.sh-prog{margin:12px 4px 8px}' +
      '.sh-fw{display:flex;flex-direction:column;gap:4px}.sh-fr{display:grid;grid-template-columns:minmax(150px,1fr) minmax(200px,3fr) 66px 110px;gap:12px;align-items:center;padding:9px 8px;border-radius:14px;font-size:13px}.sh-fr:not(.sh-fh):hover{background:rgba(255,255,255,.65)}.sh-fh{font-size:11.5px;font-weight:600;color:var(--ox-mut);padding:0 8px 4px}.sh-fn{display:flex;flex-direction:column;min-width:0}.sh-fn b{color:#0f1b3a;font-size:14px}.sh-fn small{font-size:12px;color:var(--ox-mut)}.sh-ft{height:14px;border-radius:99px;background:rgba(37,99,235,.10);display:block;overflow:hidden}.sh-ft i{display:block;height:100%;border-radius:99px}.sh-fp{text-align:right;font-family:var(--font-heading);font-size:16px;color:#0b1530}.sh-fd{text-align:right;font-size:12px;color:#d6334f}.sh-fh span:nth-child(n+3){text-align:right}' +
      '.sh-disc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.sh-disc>div{display:flex;flex-direction:column;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.7);border:1px solid #dbe7fb;min-width:0}.sh-disc span{font-size:12px;color:var(--ox-mut)}.sh-disc b{font-family:var(--font-heading);font-size:20px;color:#0b1530}' +
      '.sh-c4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:10px}.sh-mc{display:flex;flex-direction:column;gap:2px;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.7);border:1px solid #dbe7fb;min-width:0}.sh-mc span{font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:var(--ox-mut)}.sh-mc b{font-family:var(--font-heading);font-size:22px;color:#0b1530}.sh-mc.bad b{color:#d6334f}.sh-mc small{font-size:12px;color:var(--ox-mut)}' +
      '.sh-c5{grid-template-columns:repeat(5,minmax(0,1fr))}' +
      '.sh-tw{max-height:70vh}.sh-t td.l,.sh-t th.l{min-width:150px;white-space:nowrap;position:sticky;left:0;z-index:2;background:#f1f6ff;text-align:left}.sh-t th.l{z-index:4;background:#eaf2ff}.sh-t td{text-align:right;white-space:nowrap}.sh-t th{text-align:right}.sh-sale{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:99px;font-size:10.5px;font-weight:700;background:#fde8c4;color:#b45309}.sh-tr.sale td{background:rgba(245,158,11,.09)}.sh-tr.sale td.l{background:#fdf1dc}' +
      '.sh-t td.an-hi{background:rgba(18,146,79,.14);color:#0b6b3a;font-weight:600}.sh-t td.an-lo{background:rgba(214,51,79,.12);color:#b3243d;font-weight:600}.sh-t td.an-bad{background:rgba(214,51,79,.12);color:#b3243d;font-weight:600}.sh-t td.an-good{background:rgba(18,146,79,.14);color:#0b6b3a;font-weight:600}' +
      '.sh-t tfoot td{font-weight:700;background:#e8f0fd;position:sticky;bottom:0;z-index:1}.sh-t tfoot tr.avg td{bottom:0;background:#f4f8ff;font-weight:600}.sh-t tfoot td.l{z-index:3}' +
      '.sh-sb{display:flex;height:22px;border-radius:99px;overflow:hidden;background:rgba(37,99,235,.10);margin-bottom:6px}.sh-sb span{display:block;height:100%}.sh-dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:8px;vertical-align:0}' +
      '.sh-hmw{overflow-x:auto}.sh-hm{display:grid;gap:3px;min-width:640px;align-items:stretch}.sh-hh{font-size:11.5px;text-align:center;color:var(--ox-mut);padding-bottom:2px}.sh-hh.sale{color:#b45309;font-weight:700}.sh-hn{display:flex;align-items:center;font-size:12.5px;font-weight:600;color:#0f1b3a;white-space:nowrap}.sh-hc{display:flex;align-items:center;justify-content:center;min-height:34px;border-radius:7px;font-size:11px;font-weight:600}' +
      '.sh-bc{position:relative;text-align:right}.sh-bc i{position:absolute;right:0;top:20%;bottom:20%;background:rgba(47,109,240,.16);border-radius:6px}.sh-bc span{position:relative}.goodw{color:#12924f;font-weight:700}.badw{color:#d6334f;font-weight:700}' +
      '.sh-t th button,.pp-t th button{text-align:inherit}.ox-t.pp-t td,.ox-t.pp-t th{white-space:nowrap}.ox-t.pp-t td.l,.ox-t.pp-t th.l{text-align:left}.ox-t.pp-t td:not(.l),.ox-t.pp-t th:not(.l){text-align:right}.ox-t.pp-t td.pp-c-sku{white-space:normal}.ox-t.pp-t:not(.sh-t) td.l{white-space:normal;max-width:300px;min-width:110px}' +
      '.sh-sticky{position:sticky;top:0;z-index:30;margin:0 -10px 14px;padding:8px 10px 2px;background:rgba(241,246,255,.86);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-radius:0 0 18px 18px}.sh-sticky .ok-chips{margin-bottom:6px}.sh-sticky .pp-tabbar{margin-bottom:6px}.sh-info{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;margin-left:4px;border-radius:50%;border:1px solid #9db8ee;color:#2f6df0;font-size:11px;font-style:italic;font-weight:700;cursor:help;vertical-align:1px}' +
      '.sh-chip{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:99px;font:700 11px/1.5 var(--font-body,inherit);vertical-align:middle;letter-spacing:0;cursor:help}.sh-chip.r{background:#fde4e8;color:#b3243d}.sh-chip.y{background:#fdf0d2;color:#9a5b00}.sh-chip.g{background:#dcf5e7;color:#0b6b3a}' +
      '.sh-alr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.sh-ai{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.78);border:1px solid #dbe7fb}.sh-ab{min-width:54px;text-align:center;padding:6px 8px;border-radius:10px;font:700 13px/1.2 var(--font-heading,inherit);background:#e8eefb;color:#34456b}.sh-ai.r .sh-ab{background:#fde4e8;color:#b3243d}.sh-ai.y .sh-ab{background:#fdf0d2;color:#9a5b00}.sh-ai.g .sh-ab{background:#dcf5e7;color:#0b6b3a}.sh-at b{display:block;font-size:13.5px;color:#0f1b3a}.sh-at span{display:block;font-size:12px;line-height:1.4;color:var(--ox-mut)}.sh-ai .pp-link{white-space:nowrap;margin:0}' +
      '.sh-pw{position:relative;padding:20px 0 22px}.sh-pwt,.sh-pwb{position:absolute;left:0;right:0;height:16px}.sh-pwt{top:0}.sh-pwb{bottom:0}.sh-lt{position:absolute;transform:translateX(-50%);font-size:12px;color:var(--ox-mut);white-space:nowrap}.sh-lt b{color:#0f1b3a}.sh-lt.e{transform:translateX(-100%)}.sh-lt.s{transform:none}.sh-pw .sh-prog{margin:0}.sh-kg.k3{grid-template-columns:repeat(3,minmax(0,1fr))}' +
      '.sh-dstrip{display:flex;flex-wrap:wrap;gap:6px 18px;align-items:baseline;padding:10px 14px;margin-bottom:10px;border-radius:14px;background:rgba(255,255,255,.62);border:1px dashed #b9cdf3;font-size:13px;color:var(--ox-mut)}.sh-dstrip b{color:#0b1530}.sh-dstrip>b:first-child{font-family:var(--font-heading);font-size:14px}.sh-dstrip small{flex-basis:100%;font-size:12px}' +
      '.sh-lg{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.sh-lb{display:inline-flex;gap:7px;align-items:center;padding:3px 11px;border-radius:99px;border:1px solid #cfdcf5;background:rgba(255,255,255,.7);color:#0f1b3a;font:inherit;font-size:12.5px;cursor:pointer;opacity:.55}.sh-lb.on{opacity:1;border-color:#2f6df0;background:#eef4ff}.sh-lb i{width:10px;height:10px;border-radius:50%;display:inline-block}.sh-lb:focus-visible{outline:2px solid #2f6df0;outline-offset:2px}' +
      '.sh-t thead th{position:sticky;top:0;z-index:3;background:#eaf2ff}.sh-dag{margin-left:2px;color:#2f6df0;font-size:11px}.sh-dim{color:#8a93ab;font-style:italic;cursor:help}' +
      '.sh-bc{min-width:150px}.pp-sn b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.sh-ex{display:block;margin-top:3px;padding:0;border:0;background:none;color:#2f6df0;font:inherit;font-size:12px;font-weight:600;cursor:pointer;text-align:left}.sh-sub td{background:rgba(235,243,255,.65)}.sh-sub td.l{padding-left:34px!important}.sh-src{font-style:normal;font-weight:700;color:#1f4fbf}' +
      '@media (max-width:1280px){.sh-kg,.sh-ads,.sh-c5{grid-template-columns:repeat(2,minmax(0,1fr))}.sh-c4{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
      '@media (max-width:1100px){.ox-c7,.ox-c5,.ox-c6{grid-column:span 12}.sh-alr{grid-template-columns:1fr}.sh-kg.k3{grid-template-columns:1fr}}' +
      '@media (max-width:700px){.sh-sticky{position:static;margin:0 0 10px;padding:0;background:none;backdrop-filter:none}.sh-ai{grid-template-columns:auto minmax(0,1fr)}.sh-ai .pp-link{grid-column:1 / -1}.sh-sv{overflow-x:auto}.sh-sv>svg{min-width:620px}.sh-disc{grid-template-columns:1fr 1fr}.sh-disc b{font-size:17px}.ox-tw{overflow-x:auto}.ox-t.pp-t{display:table;width:max-content;min-width:100%}.ox-t.pp-t thead{display:table-header-group}.ox-t.pp-t tbody{display:table-row-group}.ox-t.pp-t tfoot{display:table-footer-group}.ox-t.pp-t tr{display:table-row;padding:0}.ox-t.pp-t td,.ox-t.pp-t th{display:table-cell;padding:8px 8px!important}.ox-t.pp-t td.pp-c-sku{display:table-cell;min-width:240px}.sh-kg,.sh-ads{grid-template-columns:1fr}.sh-c5{grid-template-columns:repeat(2,minmax(0,1fr))}.sh-fr{grid-template-columns:minmax(0,1fr) 56px;grid-template-areas:"n p" "t t" "d d"}.sh-fr .sh-fn{grid-area:n}.sh-fr .sh-ft{grid-area:t}.sh-fr .sh-fp{grid-area:p}.sh-fr .sh-fd{grid-area:d;text-align:left}.sh-fh{display:none}}' +
      '';
  }
  // ---- vẽ -----------------------------------------------------------------------------------------------------
  paintSH() {
    const root = document.getElementById('shx');
    if (!root) return false;
    if (!root._ok) {
      root._ok = 1;
      root.addEventListener('click', ev => {
        const T = ev.target.closest ? ev.target : null; if (!T) return; const q = s => T.closest(s), st = this.state; let e;
        if ((e = q('[data-mo]'))) { this.setState({ mo: +e.getAttribute('data-mo') }); return; }
        if ((e = q('[data-tab]'))) { this.setState({ tab: e.getAttribute('data-tab') }); return; }
        if ((e = q('[data-dsort]'))) { const k = e.getAttribute('data-dsort'); this.setState(st.sort === k ? { dir: -st.dir } : { sort: k, dir: k === 'date' || k === 'cancR' || k === 'cost' || k === 'cir' ? 1 : -1 }); return; }
        if ((e = q('[data-cg]'))) { const g = e.getAttribute('data-cg'); const all = ['traf', 'ord', 'rev', 'buy', 'ads']; let cg; if (g === '*') cg = all; else { cg = st.cg.includes(g) ? st.cg.filter(x => x !== g) : st.cg.concat([g]); if (!cg.length) cg = [g]; } this.setState({ cg }); return; }
        if ((e = q('[data-mm]'))) { this.setState({ mm: e.getAttribute('data-mm') }); return; }
        if ((e = q('[data-mcg]'))) { this.setState({ mcg: e.getAttribute('data-mcg') }); return; }
        if ((e = q('[data-hm]'))) { this.setState({ hm: e.getAttribute('data-hm') }); return; }
        if ((e = q('[data-sg]'))) { this.setState({ sg: e.getAttribute('data-sg') }); return; }
        if ((e = q('[data-srct]'))) { this.setState({ srcTab: e.getAttribute('data-srct') }); return; }
        if ((e = q('[data-skug]'))) { this.setState({ skuG: e.getAttribute('data-skug') }); return; }
        if ((e = q('[data-ln]'))) { const k = e.getAttribute('data-ln'); let ln = st.ln.includes(k) ? st.ln.filter(x => x !== k) : st.ln.concat([k]); if (!ln.length) ln = [k]; this.setState({ ln }); return; }
        if ((e = q('[data-skuex]'))) { const k = e.getAttribute('data-skuex'); this.setState({ skuOpen: Object.assign({}, st.skuOpen, { [k]: !(st.skuOpen || {})[k] }) }); return; }
        if (q('[data-full]')) { this.setState({ full: !st.full }); return; }
        if (q('[data-skuall]')) { this.setState({ skuAll: !st.skuAll }); return; }
        if ((e = q('[data-act]'))) {
          const a = e.getAttribute('data-act').split(':');
          if (a[0] === 'scroll') { const el = document.getElementById(a[1]); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else if (a[0] === 'tab') this.setState({ tab: a[1] }); else if (a[0] === 'daily') this.setState({ tab: 'daily', sort: a[1], dir: (a[1] === 'crP' || a[1] === 'visits') ? 1 : -1 });
          return;
        }
        if (q('[data-print]')) { try { window.print(); } catch (x) { this.toast('Không mở được hộp thoại in, hãy dùng Ctrl/Cmd + P'); } return; }
        if (q('[data-csvd]')) { const X = this.calc(); this.download('shopee-theo-ngay-T' + X.mo + '-2026.csv', this.csvDaily(X, false)); return; }
        if (q('[data-copyd]')) { const X = this.calc(); this.copyText(this.csvDaily(X, true), 'Đã sao chép bảng theo ngày'); return; }
      });
      root.addEventListener('keydown', ev => { const r = ev.target.closest && ev.target.closest('tr[data-mo]'); if (r && (ev.key === 'Enter' || ev.key === ' ') && ev.target === r) { ev.preventDefault(); this.setState({ mo: +r.getAttribute('data-mo') }); } });
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
    const X = this.calc(), tab = this.state.tab;
    const main = tab === 'fc' ? this.fcHtml(X) : tab === 'daily' ? this.dailyHtml(X) : tab === 'mo' ? this.moHtml(X) : tab === 'buy' ? this.buyHtml(X) : tab === 'src' ? this.srcHtml(X) : this.ovHtml(X);
    const html = this.SH_CSS() + '<div class="ox"><div class="sh-sticky pp-noprint">' + this.ctlHtml(X) + this.tabsHtml() + '</div>' + main +
      '<div class="pp-foot">' + this.esc('Nguồn: Shopee Business Insights (Total_Shopee_T1–T' + (X.LASTM - 1) + ' theo tháng, Total_Shopee_T' + X.LASTM + ' theo ngày, 01–' + this.pad(X.nd) + '/' + this.pad(X.LASTM) + '), NMV và KPI lấy từ Order_data và KPI Monthly Plan 2026. GMV đặt, xác nhận, thanh toán là ba trạng thái đơn của Shopee; NMV là doanh thu thuần đơn không hủy của Order_data.') + '</div></div>';
    if (root._h !== html) { root._h = html; root.innerHTML = html; }
    return true;
  }
  renderVals() {
    const R = React.createElement, O = this.O();
    if (this.dataReady()) {
      clearTimeout(this._pt); let tries = 0;
      const go = () => { try { if (!this.paintSH() && tries++ < 40) this._pt = setTimeout(go, 100); } catch (e) { console.error('shopee paint', e); } };
      this._pt = setTimeout(go, 0);
    }
    const LASTM = O.months && O.months.placed ? O.months.placed.length + 1 : 11, mo = this.state.mo == null ? LASTM : Math.min(this.state.mo, LASTM), nd = O.t9Days || 15, part = mo === LASTM;
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
        R('div', { className: 'tabular', style: { fontSize: 14.5, color: 'var(--text-secondary)' } }, 'T' + mo + '/2026' + (part ? ' · 01–' + this.pad(nd) : ' · cả tháng')),
        R('div', { style: { fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.4 } }, 'Nguồn: Shopee Business Insights · thư mục Onsite_Shopee')),
      headerSubtitle: 'Shopee Business Insights · số liệu shop, nguồn lưu lượng, ads và SKU · T' + mo + '/2026' + (part ? ' (01–' + this.pad(nd) + '/' + this.pad(mo) + ')' : '')
    };
  }
}
