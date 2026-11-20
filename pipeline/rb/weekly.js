class Component extends PPBase {
  state = { mo: __WK_MO__, wk: __WK_WK__, metric: 'nmv', ch: 'all', open: null };
  WD = __WEEKLY_DATA__;
  YEAR = 2026;
  // ---- nền tảng --------------------------------------------------------------------------------------------
  dataReady() { return !!(this.WD && this.WD.dates); }
  num(v) { return v == null || !isFinite(v) ? '—' : Math.round(v).toLocaleString('en-US'); }
  pad(n) { return String(n).padStart(2, '0'); }
  iso(m, d) { return this.YEAR + '-' + this.pad(m) + '-' + this.pad(d); }
  dim(m) { return new Date(this.YEAR, m, 0).getDate(); }
  ix() { if (!this._ix) { this._ix = {}; this.WD.dates.forEach((d, i) => { this._ix[d] = i; }); } return this._ix; }
  lastM() { return +this.WD.last.slice(5, 7); }
  lastD() { return +this.WD.last.slice(8, 10); }
  CH() { return this.WD.channels; }
  // tuần trong tháng: W1 1–7, W2 8–14, W3 15–21, W4 22–hết tháng
  weeks(m) {
    const e = this.dim(m), L = this.WD.last, out = [];
    [[1, 7], [8, 14], [15, 21], [22, e]].forEach((r, i) => {
      const a = this.iso(m, r[0]), b = this.iso(m, r[1]);
      if (a > L) return;
      const end = b > L ? L : b;
      out.push({ m, k: i + 1, a, b, end, n: +end.slice(8, 10) - r[0] + 1, full: r[1] - r[0] + 1, partial: b > L, d1: r[0], d2: r[1] });
    });
    return out;
  }
  wk(m, k) { return this.weeks(m).find(w => w.k === k) || null; }
  wLab(w, star) { return 'W' + w.k + (w.partial && star !== false ? '*' : ''); }
  wRange(w, full) { return this.pad(w.d1) + '–' + (full || !w.partial ? this.pad(w.d2) : w.end.slice(8, 10)) + '/' + this.pad(w.m); }
  mL(m) { return 'T' + m + (m === this.lastM() && this.lastD() < this.dim(m) ? '*' : ''); }
  // khoảng so sánh: tuần trước (hoặc cùng tuần tháng trước) lấy cùng số ngày khi tuần hiện tại chưa đủ
  prevOf(w, mode) {
    let m = w.m, k = w.k;
    if (mode === 'mom') { m = w.m - 1; } else if (k > 1) { k = k - 1; } else { m = w.m - 1; k = 4; }
    if (m < 1) return null;
    const e = this.dim(m), R = [[1, 7], [8, 14], [15, 21], [22, e]][k - 1];
    const len = R[1] - R[0] + 1, n = w.partial ? Math.min(w.n, len) : len;
    return { m, k, a: this.iso(m, R[0]), end: this.iso(m, R[0] + n - 1), n, full: len, d1: R[0], d2: R[1], partial: false };
  }
  // cộng dồn số theo kênh trong khoảng ngày
  agg(chs, a, end) {
    const W = this.WD, ix = this.ix(), C = this.CH();
    const o = { nmv: 0, gmv: 0, ord: 0, ok: 0, spend: 0, kpi: 0, saleN: 0, days: 0, spC: 0, nmvC: 0, chs, sale: [] };
    const kg = this.kgroup(chs);
    let d = new Date(a + 'T00:00:00Z'); const E = new Date(end + 'T00:00:00Z');
    for (; d <= E; d = new Date(d.getTime() + 864e5)) {
      const s = d.toISOString().slice(0, 10), i = ix[s]; o.days++;
      const t = W.type[s];
      if (t) o.sale.push([s, t]);
      const k = W.kpi[s]; if (k && kg) o.kpi += k[kg] || 0;
      if (i == null) continue;
      chs.forEach(c => { const r = W.d[i][c]; if (!r) return; o.nmv += r[0]; o.gmv += r[1]; o.ord += r[2]; o.ok += r[3]; o.spend += r[4]; if (t) o.saleN += r[0]; });
    }
    // CIR chỉ tính trên kênh có đủ spend trong khoảng ngày
    o.spendOk = chs.filter(c => C[c].spendable && C[c].spendLast && C[c].spendLast >= end);
    o.spendMiss = chs.filter(c => C[c].spendable && !(C[c].spendLast && C[c].spendLast >= end));
    if (o.spendOk.length) { const p = this.agg0(o.spendOk, a, end); o.spC = p.spend; o.nmvC = p.nmv; }
    o.cir = o.spendOk.length && o.nmvC > 0 ? o.spC / o.nmvC : null;
    o.roas = o.spendOk.length && o.spC > 0 ? o.nmvC / o.spC : null;
    o.aov = o.ok ? o.nmv / o.ok : null;
    o.cancel = o.gmv ? Math.max(0, 1 - o.nmv / o.gmv) : null;
    o.kpiPct = kg && o.kpi > 0 ? o.nmv / o.kpi : null;
    o.saleShare = o.nmv ? o.saleN / o.nmv : 0;
    o.kg = kg; o.a = a; o.end = end;
    return o;
  }
  agg0(chs, a, end) { const W = this.WD, ix = this.ix(); const o = { nmv: 0, spend: 0 }; let d = new Date(a + 'T00:00:00Z'); const E = new Date(end + 'T00:00:00Z'); for (; d <= E; d = new Date(d.getTime() + 864e5)) { const i = ix[d.toISOString().slice(0, 10)]; if (i == null) continue; chs.forEach(c => { const r = W.d[i][c]; if (r) { o.nmv += r[0]; o.spend += r[4]; } }); } return o; }
  // nhóm KPI: tất cả kênh → total; một kênh → nhóm KPI của kênh; Harasocial/Website chỉ có KPI gộp
  kgroup(chs) { const C = this.CH(); if (chs.length === C.length) return 'total'; if (chs.length === 1) { const g = C[chs[0]].kpi; return g === 'websocial' ? null : g; } return null; }
  allCh() { return this.CH().map((c, i) => i); }
  selCh() { const s = this.state.ch; return s === 'all' ? this.allCh() : [+s]; }
  cirT(m, kg) { const c = (this.WD.cir || {})[m] || {}; return kg ? c[kg] : null; }
  fullKpi(chs, w) { const kg = this.kgroup(chs); if (!kg) return null; let s = 0; for (let d = w.d1; d <= w.d2; d++) { const k = this.WD.kpi[this.iso(w.m, d)]; if (k) s += k[kg] || 0; } return s; }
  // ---- chỉ số -------------------------------------------------------------------------------------------------
  METRICS() {
    const M = v => this.money(v), N = v => this.num(v), P1 = v => this.pct(v, 1), P0 = v => this.pct(v, 0);
    return [
      ['nmv', 'NMV', o => o.nmv, M, 'add'],
      ['gmv', 'GMV', o => o.gmv, M, 'add'],
      ['ord', 'Đơn đặt', o => o.ord, N, 'add'],
      ['aov', 'AOV', o => o.aov, M, 'rel'],
      ['spend', 'Spend', o => o.spend, M, 'add'],
      ['cir', 'CIR', o => o.cir, P1, 'pp', 1],
      ['roas', 'ROAS', o => o.roas, v => v == null ? '—' : '×' + v.toFixed(1), 'rel'],
      ['cancel', 'Tỷ lệ hủy', o => o.cancel, P1, 'pp', 1],
      ['kpiPct', '% KPI NMV', o => o.kpiPct, P0, 'pp']
    ];
  }
  M(k) { return this.METRICS().find(x => x[0] === k); }
  // so sánh: chỉ số cộng dồn theo trung bình/ngày; tỷ lệ theo điểm %; AOV, ROAS theo %
  cmp(mt, cur, prev) {
    if (!prev) return null;
    const a = mt[2](cur), b = mt[2](prev); if (a == null || b == null || !isFinite(a) || !isFinite(b)) return null;
    if (mt[4] === 'add') { const x = a / cur.days, y = b / prev.days; return y > 0 ? { v: x / y - 1, t: 'rel' } : null; }
    if (mt[4] === 'pp') return { v: a - b, t: 'pp' };
    return b > 0 ? { v: a / b - 1, t: 'rel' } : null;
  }
  dTxt(c, inv) {
    if (!c) return '<span class="wk-mut">—</span>';
    const good = inv ? c.v < 0 : c.v > 0, flat = c.t === 'pp' ? Math.abs(c.v) < 0.0005 : Math.abs(c.v) < 0.005;
    const s = c.t === 'pp' ? (c.v >= 0 ? '+' : '−') + Math.abs(c.v * 100).toFixed(1) + ' đ%' : this.signedPct(c.v, 0);
    return '<span class="' + (flat ? 'wk-mut' : good ? 'goodw' : 'badw') + '">' + s + '</span>';
  }
  pill(c, inv) {
    if (!c) return '<span class="ox-pill flat">—</span>';
    const flat = c.t === 'pp' ? Math.abs(c.v) < 0.0005 : Math.abs(c.v) < 0.005, good = inv ? c.v < 0 : c.v > 0;
    const s = c.t === 'pp' ? Math.abs(c.v * 100).toFixed(1) + ' đ%' : this.pct(Math.abs(c.v), 1);
    return '<span class="ox-pill ' + (flat ? 'flat' : good ? 'up' : 'down') + '">' + (flat ? '' : c.v >= 0 ? '▲ ' : '▼ ') + s + '</span>';
  }
  // ---- tính toán cho tuần đang chọn ------------------------------------------------------------------------------
  calc() {
    const st = this.state, ws = this.weeks(st.mo), w = ws.find(x => x.k === st.wk) || ws[ws.length - 1];
    const chs = this.selCh();
    const cur = this.agg(chs, w.a, w.end), pw = this.prevOf(w), mw = this.prevOf(w, 'mom');
    const prev = pw ? this.agg(chs, pw.a, pw.end) : null, mom = mw ? this.agg(chs, mw.a, mw.end) : null;
    return { st, ws, w, chs, cur, pw, prev, mw, mom, kFull: this.fullKpi(chs, w) };
  }
  // ---- giao diện ------------------------------------------------------------------------------------------------
  ctlHtml(X) {
    const st = X.st, ch = (attr, val, cur, lab, extra) => '<button type="button" class="ok-chip' + (String(val) === String(cur) ? ' on' : '') + '" ' + attr + '="' + val + '" aria-pressed="' + (String(val) === String(cur)) + '"' + (extra || '') + '>' + lab + '</button>';
    const months = []; for (let m = 1; m <= this.lastM(); m++) months.push(ch('data-mo', m, st.mo, this.mL(m)));
    const wks = X.ws.map(w => ch('data-wk', w.k, X.w.k, this.wLab(w) + ' <small>' + this.wRange(w) + '</small>')).join('');
    const chs = ch('data-ch', 'all', st.ch, 'Tất cả kênh') + this.CH().map((c, i) => ch('data-ch', i, st.ch, '<i class="wk-sw" style="background:' + c.fill + '"></i>' + this.esc(c.name))).join('');
    return '<div class="wk-ctl"><div class="wk-row"><span class="wk-gl">Tháng</span><div class="ok-chips wk-chips" role="group" aria-label="Chọn tháng">' + months.join('') + '</div><span class="wk-sp"></span><button type="button" class="pp-btn" data-csv>' + this.ic('download') + 'CSV</button><button type="button" class="pp-btn" data-print>' + this.ic('print') + 'In / PDF</button></div>' +
      '<div class="wk-row"><span class="wk-gl">Tuần</span><div class="ok-chips wk-chips" role="group" aria-label="Chọn tuần">' + wks + '</div></div>' +
      '<div class="wk-row"><span class="wk-gl">Kênh</span><div class="ok-chips wk-chips" role="group" aria-label="Lọc kênh">' + chs + '</div></div></div>';
  }
  chLabel(X) { return X.st.ch === 'all' ? 'Tất cả kênh' : this.CH()[+X.st.ch].name; }
  heroHtml(X) {
    const c = X.cur, p = X.prev, w = X.w, I = n => '<span class="bsi">' + (window.BSICON ? window.BSICON(n) : '') + '</span>';
    const M = k => this.M(k), cmpP = k => this.cmp(M(k), c, p);
    const card = (g, lab, icon, val, pl, prevTxt, extra) => '<div class="ox-card g-' + g + '"><div class="ox-cl">' + I(icon) + lab + '</div><div class="ox-cv">' + val + '</div><div class="ox-cd">' + pl + '<span class="ox-cp">' + prevTxt + '</span></div>' + (extra ? '<div class="ox-ce">' + extra + '</div>' : '') + '</div>';
    const pl = X.pw ? 'W' + X.pw.k + (X.pw.m !== w.m ? ' T' + X.pw.m : '') + (w.partial ? ' (' + X.pw.n + ' ngày đầu)' : '') : '';
    const kTo = c.kpi, kF = X.kFull, gap = kF != null ? kF - c.nmv : null, left = w.full - w.n;
    const prog = kF ? Math.min(1, c.nmv / kF) : 0, pace = kF && w.partial ? kTo / kF : null;
    const wsM = X.ws.map(x => ({ w: x, a: this.agg(X.chs, x.a, x.end) }));
    const mx = Math.max(1, ...wsM.map(x => x.a.nmv / x.a.days));
    const bars = '<div class="wk-hbars">' + wsM.map(x => '<div class="' + (x.w.k === w.k ? 'on' : '') + '"' + this.tipAttr(this.tipT(this.wLab(x.w) + ' · ' + this.wRange(x.w), [['NMV', this.money(x.a.nmv)], ['TB/ngày', this.money(x.a.nmv / x.a.days)], ['% KPI', this.pct(x.a.kpiPct, 0)]])) + '><i style="height:' + (x.a.nmv / x.a.days / mx * 100).toFixed(1) + '%"></i><span>' + this.wLab(x.w) + '</span></div>').join('') + '</div>';
    const sale = c.sale.length ? c.sale.map(s => s[0].slice(8, 10) + '/' + s[0].slice(5, 7) + ' ' + s[1]).join(', ') : '';
    const hero = '<div class="ox-hero wk-heroc"><div class="ox-hl bsl">' + I('nmv') + 'NMV · ' + this.wLab(w) + ' · ' + this.wRange(w) + (w.partial ? ' (WTD ' + w.n + '/' + w.full + ' ngày)' : '') + ' · ' + this.esc(this.chLabel(X)) + '</div>' +
      '<div class="ox-hv">' + this.money(c.nmv) + '</div>' +
      '<div class="ox-hrow">' + this.pill(cmpP('nmv')) + '<span class="ox-hk">TB/ngày so với ' + pl + '</span></div>' +
      (kF ? '<div class="ox-hrow2"><span>KPI tuần <b>' + this.money(kF) + '</b></span><span class="ox-hp">' + this.pct(c.nmv / kF, 0) + '</span></div><div class="ox-prog"><span style="width:' + (prog * 100).toFixed(1) + '%"></span>' + (pace != null && pace < 1 ? '<i style="left:' + (pace * 100).toFixed(1) + '%" title="KPI cần đạt đến hôm nay"></i>' : '') + '</div>' : '<div class="ox-hk">' + (X.st.ch !== 'all' && this.CH()[+X.st.ch].kpi === 'websocial' ? 'KPI chỉ có gộp Website/Social' : 'Kênh này không có KPI') + '</div>') +
      bars +
      '<div class="ox-hgrid">' +
      '<div>' + this.ic('target') + '<span>Đạt KPI ' + (w.partial ? 'đến ' + w.end.slice(8, 10) + '/' + w.end.slice(5, 7) : 'tuần') + '</span><b class="' + (c.kpiPct == null ? '' : c.kpiPct >= 1 ? 'okw' : c.kpiPct >= 0.8 ? 'warnw' : 'badw') + '">' + this.pct(c.kpiPct, 0) + '</b><u>' + (c.kpi ? 'KPI ' + (w.partial ? 'đến nay ' : '') + this.money(c.kpi) : 'Chưa có KPI') + '</u></div>' +
      '<div>' + this.ic('gap') + '<span>Còn thiếu đến KPI tuần</span><b>' + (gap == null ? '—' : this.money(Math.max(0, gap))) + '</b><u>' + (gap == null ? '' : gap <= 0 ? 'đã đạt KPI tuần' : left > 0 ? 'cần ' + this.money(gap / left) + '/ngày trong ' + left + ' ngày còn lại' : 'tuần đã kết thúc') + '</u></div>' +
      '<div>' + this.ic('run-rate') + '<span>Ngày sale trong tuần</span><b>' + (c.sale.length ? this.pct(c.saleShare, 0) : '—') + '</b><u>' + (sale ? 'NMV từ ' + this.esc(sale) : 'Không có ngày sale theo lịch KPI') + '</u></div></div></div>';
    const cirT = this.cirT(w.m, c.kg), pv = (k, f) => p ? f(this.M(k)[2](p)) : '';
    const cards =
      card('rev', 'Đơn đặt', 'Orders', this.num(c.ord), this.pill(cmpP('ord')), p ? pl + ': ' + this.num(p.ord) : '', 'AOV ' + this.money(c.aov) + ' · ' + this.num(c.ok) + ' đơn không hủy') +
      card('cost', 'CIR', 'CIR', c.cir == null ? '<span class="wk-na">thiếu spend</span>' : this.pct(c.cir, 2), this.pill(cmpP('cir'), true), p && p.cir != null ? pl + ': ' + this.pct(p.cir, 2) : '', (cirT ? 'KPI CIR ' + this.pct(cirT, 1) + (c.cir != null && c.cir > cirT ? ' · <b class="badw">vượt KPI</b>' : '') : 'Không có KPI CIR') + (c.spendMiss.length && c.spendOk.length ? ' · chỉ tính ' + c.spendOk.map(i => this.CH()[i].key).join(' + ') : '')) +
      card('cost', 'ROAS', 'ROAS', c.roas == null ? '<span class="wk-na">thiếu spend</span>' : '×' + c.roas.toFixed(1), this.pill(cmpP('roas')), p && p.roas != null ? pl + ': ×' + p.roas.toFixed(1) : '', 'Spend ' + this.money(c.spC || 0) + ' trên kênh đủ spend') +
      card('q', 'Tỷ lệ hủy', 'Cancel rate', this.pct(c.cancel, 1), this.pill(cmpP('cancel'), true), p ? pl + ': ' + this.pct(p.cancel, 1) : '', 'GMV hủy ' + this.money(Math.max(0, c.gmv - c.nmv)) + ' / GMV ' + this.money(c.gmv));
    return '<div class="ox-top wk-top">' + hero + cards + '<div class="wk-topr">' + this.alertsHtml(X) + this.commentHtml(X) + '</div></div>';
  }
  // ---- cảnh báo + nhận xét ---------------------------------------------------------------------------------------
  alerts(X) {
    const w = X.w, out = { drop: [], kpi: [], cir: [] }, C = this.CH();
    const rows = C.map((c, i) => i).concat(['all']);
    rows.forEach(r => {
      const chs = r === 'all' ? this.allCh() : [r], name = r === 'all' ? 'Tổng EC' : C[r].name;
      const a = this.agg(chs, w.a, w.end), p = X.pw ? this.agg(chs, X.pw.a, X.pw.end) : null;
      if (p && p.nmv / p.days >= 1e6) { const d = (a.nmv / a.days) / (p.nmv / p.days) - 1; if (d <= -0.2) out.drop.push([name, this.signedPct(d, 0) + ' NMV/ngày', r]); }
      if (a.kpiPct != null && a.kpi > 0 && a.kpiPct < 0.8) out.kpi.push([name, 'đạt ' + this.pct(a.kpiPct, 0) + ' KPI', r]);
      const t = this.cirT(w.m, a.kg); if (a.cir != null && t && a.cir > t) out.cir.push([name, 'CIR ' + this.pct(a.cir, 1) + ' > ' + this.pct(t, 1), r]);
    });
    return out;
  }
  alertsHtml(X) {
    const A = this.alerts(X), G = [['drop', 'NMV giảm từ 20% so tuần trước', 'r'], ['kpi', 'Đạt dưới 80% KPI tuần', 'y'], ['cir', 'CIR vượt KPI CIR', 'r']];
    const h = G.map(g => { const L = A[g[0]]; if (!L.length) return ''; return '<div class="wk-ag ' + g[2] + '"><div class="wk-agh"><span class="wk-dot ' + g[2] + '"></span><b>' + g[1] + '</b><span class="wk-agn">' + L.length + '</span></div><div class="wk-agl">' + L.map(x => '<button type="button" data-cell="' + x[2] + '|' + X.w.k + '"><b>' + this.esc(x[0]) + '</b> ' + this.esc(x[1]) + '</button>').join('') + '</div></div>'; }).join('');
    return h ? '<div class="wk-agw">' + h + '</div>' : '<div class="wk-agw"><div class="wk-ag g"><div class="wk-agh"><span class="wk-dot g"></span><b>Không có cảnh báo cho ' + this.wLab(X.w) + '</b></div></div></div>';
  }
  commentHtml(X) {
    const c = X.cur, p = X.prev, w = X.w, C = this.CH(), L = [];
    const pl = X.pw ? 'W' + X.pw.k + (X.pw.m !== w.m ? ' T' + X.pw.m : '') : 'tuần trước';
    const d = this.cmp(this.M('nmv'), c, p);
    L.push('<b>' + this.esc(this.chLabel(X)) + '</b> ' + (w.partial ? 'đến ' + w.end.slice(8, 10) + '/' + w.end.slice(5, 7) + ' (' + w.n + '/' + w.full + ' ngày)' : 'cả tuần') + ': NMV ' + this.money(c.nmv) + (c.kpiPct != null ? ', đạt ' + this.pct(c.kpiPct, 0) + ' KPI' + (w.partial ? ' đến nay' : ' tuần') : '') + (d ? ', TB/ngày ' + this.signedPct(d.v, 0) + ' so ' + pl : '') + '.');
    if (X.st.ch === 'all' && X.pw) {
      const del = C.map((ch, i) => { const a = this.agg([i], w.a, w.end), b = this.agg([i], X.pw.a, X.pw.end); return { n: ch.name, v: a.nmv / a.days - b.nmv / b.days }; }).sort((x, y) => Math.abs(y.v) - Math.abs(x.v));
      const up = del.filter(x => x.v > 0)[0], dn = del.filter(x => x.v < 0)[0];
      L.push((up ? '<b>' + this.esc(up.n) + '</b> kéo tăng nhiều nhất (' + (up.v >= 0 ? '+' : '') + this.money(up.v) + '/ngày)' : 'Không kênh nào tăng') + (dn ? '; <b>' + this.esc(dn.n) + '</b> giảm nhiều nhất (' + this.money(dn.v) + '/ngày).' : '.'));
    }
    const t = this.cirT(w.m, c.kg);
    if (c.cir != null) L.push('CIR ' + this.pct(c.cir, 2) + (t ? (c.cir > t ? ' <b class="badw">vượt</b> KPI ' : ' trong KPI ') + this.pct(t, 1) : '') + (c.spendMiss.length ? ' (chỉ tính kênh đủ spend; thiếu spend: ' + c.spendMiss.map(i => C[i].key).join(', ') + ')' : '') + '.');
    else if (c.spendMiss.length) L.push('Chưa tính được CIR: thiếu spend ' + c.spendMiss.map(i => C[i].key).join(', ') + '.');
    const kF = X.kFull, left = w.full - w.n;
    if (c.sale.length) L.push('Tuần có ngày sale (' + c.sale.map(s => s[0].slice(8, 10) + '/' + s[0].slice(5, 7) + ' ' + s[1]).join(', ') + '), chiếm ' + this.pct(c.saleShare, 0) + ' NMV.');
    if (kF && w.partial && left > 0 && kF > c.nmv) L.push('Cần thêm ' + this.money(kF - c.nmv) + ' (' + this.money((kF - c.nmv) / left) + '/ngày) trong ' + left + ' ngày còn lại để đạt KPI tuần.');
    return '<div class="wk-com"><h4>Nhận xét ' + this.wLab(w) + '</h4><ul>' + L.slice(0, 4).map(x => '<li>' + x + '</li>').join('') + '</ul></div>';
  }
  // ---- biểu đồ cột chồng ----------------------------------------------------------------------------------------
  chartHtml(X) {
    const C = this.CH(), chs = X.chs, ws = X.ws;
    const data = ws.map(w => ({ w, per: chs.map(i => ({ i, v: this.agg([i], w.a, w.end).nmv })), tot: this.agg(chs, w.a, w.end), kF: this.fullKpi(chs, w) }));
    const mx = Math.max(1, ...data.map(d => Math.max(d.tot.nmv, d.kF || 0))) * 1.12;
    const Wd = 760, H = 230, pl = 54, pb = 44, pt = 16, bw = Math.min(110, (Wd - pl - 20) / ws.length * 0.5), gx = (Wd - pl - 20) / ws.length;
    const y = v => pt + (H - pt - pb) * (1 - v / mx), x = i => pl + gx * i + gx / 2;
    let g = '';
    for (let t = 0; t <= 4; t++) { const v = mx / 1.12 * t / 4, yy = y(v); g += '<line x1="' + pl + '" x2="' + (Wd - 10) + '" y1="' + yy.toFixed(1) + '" y2="' + yy.toFixed(1) + '" stroke="#dbe5f7" stroke-width="1"/><text x="' + (pl - 8) + '" y="' + (yy + 4).toFixed(1) + '" text-anchor="end" class="wk-ax">' + this.short(v) + '</text>'; }
    let bars = '', kp = [];
    data.forEach((d, j) => {
      let base = 0; const cx = x(j);
      d.per.forEach(p => { if (p.v <= 0) return; const y1 = y(base + p.v), y0 = y(base); bars += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + y1.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(0.5, y0 - y1).toFixed(1) + '" fill="' + C[p.i].fill + '"' + (d.w.partial ? ' opacity=".75"' : '') + this.tipAttr(this.tipT(this.wLab(d.w) + ' · ' + C[p.i].name, [['NMV', this.money(p.v)], ['Tỷ trọng', this.pct(d.tot.nmv ? p.v / d.tot.nmv : null, 0)]])) + '/>'; base += p.v; });
      bars += '<text x="' + cx.toFixed(1) + '" y="' + (y(d.tot.nmv) - 6).toFixed(1) + '" text-anchor="middle" class="wk-bl">' + this.short(d.tot.nmv) + '</text>';
      bars += '<text x="' + cx.toFixed(1) + '" y="' + (H - pb + 18) + '" text-anchor="middle" class="wk-ax' + (d.w.k === X.w.k ? ' on' : '') + '">' + this.wLab(d.w) + ' · ' + this.wRange(d.w) + '</text>';
      bars += '<text x="' + cx.toFixed(1) + '" y="' + (H - pb + 34) + '" text-anchor="middle" class="wk-ax2">' + (d.kF ? this.pct(d.tot.nmv / d.kF, 0) + ' KPI' : '') + (d.tot.sale.length ? ' · có ngày sale' : '') + '</text>';
      if (d.kF) kp.push([cx, y(d.kF), d]);
    });
    const kline = kp.length ? kp.map(p => '<g' + this.tipAttr(this.tipT('KPI ' + this.wLab(p[2].w), [['KPI NMV cả tuần', this.money(p[2].kF)], ['Đạt', this.pct(p[2].tot.nmv / p[2].kF, 0)]])) + '><line x1="' + (p[0] - bw / 2 - 6).toFixed(1) + '" x2="' + (p[0] + bw / 2 + 6).toFixed(1) + '" y1="' + p[1].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="var(--kpi-mark,#2fc7b8)" stroke-width="3" stroke-linecap="round"/><circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" fill="#fff" stroke="var(--kpi-mark,#2fc7b8)" stroke-width="2"/></g>').join('') : '';
    const leg = '<div class="ox-leg wk-leg">' + chs.filter(i => data.some(d => d.per.find(p => p.i === i && p.v > 0))).map(i => '<span><i style="background:' + C[i].fill + '"></i>' + this.esc(C[i].name) + '</span>').join('') + '<span><i style="background:var(--kpi-mark,#2fc7b8);height:3px;margin-top:5px"></i>KPI NMV cả tuần</span></div>';
    return this.panel('ox-c12', 'NMV theo tuần × kênh · ' + this.mL(X.st.mo), 'Cột chồng = NMV từng kênh; vạch xanh ngọc = KPI NMV cả tuần (cộng KPI ngày). Tuần chưa hết hiển thị mờ hơn.', '<div class="wk-cw"><svg viewBox="0 0 ' + Wd + ' ' + H + '" class="wk-svg" role="img" aria-label="NMV theo tuần và kênh">' + g + bars + kline + '</svg></div>', '', leg);
  }
  // ---- bảng Kênh × Tuần ---------------------------------------------------------------------------------------
  tableHtml(X) {
    const st = X.st, C = this.CH(), ws = X.ws, last = ws[ws.length - 1], chs = X.chs, rk = st.ch === 'all' ? 'all' : String(st.ch);
    const cname = st.ch === 'all' ? 'Tổng EC' : C[+st.ch].name;
    const chips = '<button type="button" class="ok-chip' + (st.ch === 'all' ? ' on' : '') + '" data-ch="all" aria-pressed="' + (st.ch === 'all') + '">Tổng EC</button>' + C.map((c, i) => '<button type="button" class="ok-chip' + (String(st.ch) === String(i) ? ' on' : '') + '" data-ch="' + i + '" aria-pressed="' + (String(st.ch) === String(i)) + '"><i class="wk-sw" style="background:' + c.fill + '"></i>' + this.esc(c.name) + '</button>').join('');
    const saleOf = w => this.agg([0], w.a, w.end).sale;
    const head = '<tr><th scope="col" class="l">Chỉ số</th>' + ws.map(w => { const sl = saleOf(w); return '<th scope="col" class="' + (w.k === X.w.k ? 'cur' : '') + '"><button type="button" data-wk="' + w.k + '">' + this.wLab(w) + '</button><small>' + this.wRange(w) + (w.partial ? ' · WTD' : '') + '</small>' + (sl.length ? '<em class="wk-sb"' + this.tipAttr(this.tipT('Ngày sale theo lịch KPI', sl.map(s => [s[0].slice(8, 10) + '/' + s[0].slice(5, 7), s[1]]))) + '>sale</em>' : '') + '</th>'; }).join('') + '<th scope="col" class="mtd">' + this.mL(st.mo) + '<small>' + (last.partial ? 'đến ' + last.end.slice(8, 10) + '/' + last.end.slice(5, 7) : 'cả tháng') + '</small></th></tr>';
    // tính sẵn số của từng tuần cho kênh đang chọn
    const A = ws.map(w => { const pw = this.prevOf(w), mw = this.prevOf(w, 'mom'); return { w, pw, a: this.agg(chs, w.a, w.end), p: pw ? this.agg(chs, pw.a, pw.end) : null, mm: mw ? this.agg(chs, mw.a, mw.end) : null }; });
    const MT = this.agg(chs, this.iso(st.mo, 1), last.end);
    const one = chs.length === 1 ? C[chs[0]] : null;
    const row = mt => {
      const noSpend = (mt[0] === 'spend' || mt[0] === 'cir' || mt[0] === 'roas') && one && !one.spendable;
      const kNote = mt[0] === 'kpiPct' && one && (one.kpi === 'websocial' || !one.kpi);
      const cells = A.map(x => {
        const v = mt[2](x.a), c1 = this.cmp(mt, x.a, x.p), c2 = this.cmp(mt, x.a, x.mm);
        const miss = ((mt[0] === 'cir' || mt[0] === 'roas') && v == null || mt[0] === 'spend') && x.a.spendMiss.length && !(mt[0] === 'spend' && x.a.spendOk.length);
        const fmtC = c => c ? (c.t === 'pp' ? (c.v >= 0 ? '+' : '−') + Math.abs(c.v * 100).toFixed(1) + ' đ%' : this.signedPct(c.v, 0)) : '—';
        const tip = this.tipT(mt[1] + ' · ' + cname + ' · ' + this.wLab(x.w) + ' · ' + this.wRange(x.w), [[mt[1], miss ? 'thiếu spend' : mt[3](v)], ['So ' + (x.pw ? 'W' + x.pw.k + (x.pw.m !== x.w.m ? ' T' + x.pw.m : '') : 'tuần trước') + (x.w.partial ? ' (cùng số ngày)' : ''), fmtC(c1)], ['So cùng tuần T' + (x.w.m - 1), fmtC(c2)], x.a.sale.length ? ['Ngày sale chiếm', this.pct(x.a.saleShare, 0) + ' NMV'] : null]);
        const on = st.open && st.open.r === rk && st.open.k === x.w.k;
        const main = noSpend ? '<span class="wk-mut">—</span>' : kNote ? '<span class="wk-mut">' + (one.kpi === 'websocial' ? 'KPI gộp' : '—') + '</span>' : miss ? '<span class="wk-na">thiếu spend</span>' : mt[3](v);
        return '<td class="wk-c' + (x.w.k === X.w.k ? ' cur' : '') + (on ? ' op' : '') + '"><button type="button" data-cell="' + rk + '|' + x.w.k + '"' + this.tipAttr(tip) + '><b>' + main + '</b><small>' + (noSpend || kNote || miss ? '' : this.dTxt(c1, mt[5])) + '</small></button></td>';
      }).join('');
      const mv = mt[2](MT), mmiss = ((mt[0] === 'cir' || mt[0] === 'roas') && mv == null || mt[0] === 'spend') && MT.spendMiss.length && !(mt[0] === 'spend' && MT.spendOk.length);
      const mtd = '<td class="mtd"><b>' + (noSpend || kNote ? '<span class="wk-mut">—</span>' : mmiss ? '<span class="wk-na">thiếu spend</span>' : mt[3](mv)) + '</b></td>';
      return '<tr class="' + (mt[0] === 'nmv' ? 'key' : '') + '"><th scope="row" class="l">' + mt[1] + '</th>' + cells + mtd + '</tr>';
    };
    const G = [['Doanh thu', ['nmv', 'gmv', 'kpiPct']], ['Đơn hàng', ['ord', 'aov', 'cancel']], ['Chi phí', ['spend', 'cir', 'roas']]];
    const body = G.map(g => '<tr class="wk-g"><th colspan="' + (ws.length + 2) + '" scope="rowgroup">' + g[0] + '</th></tr>' + g[1].map(k => row(this.M(k))).join('')).join('');
    const note = (one && one.spendable && one.spendLast && one.spendLast < this.WD.last ? 'Spend ' + this.esc(one.name) + ' chỉ có đến ' + one.spendLast.slice(8, 10) + '/' + one.spendLast.slice(5, 7) + '. ' : '') + (st.ch === 'all' ? 'CIR, ROAS của Tổng EC chỉ tính trên kênh đủ spend trong tuần. ' : '');
    return this.panel('ox-c12', 'Chỉ số × Tuần · ' + this.esc(cname) + ' · ' + this.mL(st.mo), note + 'Dòng nhỏ dưới mỗi số = so tuần trước (chỉ số cộng dồn so theo TB/ngày, tuần chưa hết so cùng số ngày). Bấm một ô để xem từng ngày.',
      '<div class="wk-tw"><table class="ox-t pp-t wk-t"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' + this.dayHtml(X), '', '<div class="ok-chips wk-chips wk-mchips" role="group" aria-label="Chọn kênh cho bảng">' + chips + '</div>');
  }
  dayHtml(X) {
    const o = X.st.open; if (!o) return '';
    const w = this.wk(X.st.mo, o.k); if (!w) return '';
    const C = this.CH(), chs = o.r === 'all' ? this.allCh() : [+o.r], name = o.r === 'all' ? 'Tổng EC' : C[+o.r].name;
    const kg = this.kgroup(chs), cirT = this.cirT(w.m, kg), ix = this.ix(), DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    let rows = '', T = this.agg(chs, w.a, w.end);
    for (let d = w.d1; d <= w.d2; d++) {
      const s = this.iso(w.m, d), fut = s > this.WD.last, a = fut ? null : this.agg(chs, s, s), k = this.WD.kpi[s], kd = kg && k ? k[kg] : null;
      const dw = DOW[new Date(s + 'T00:00:00Z').getUTCDay()], tp = this.WD.type[s];
      rows += '<tr class="' + (fut ? 'fut' : '') + (tp ? ' sale' : '') + '"><td class="l">' + dw + ' ' + this.pad(d) + '/' + this.pad(w.m) + (tp ? ' <em class="wk-sb">' + this.esc(tp) + '</em>' : '') + '</td>' +
        (fut ? '<td colspan="7" class="wk-mut">chưa có dữ liệu' + (kd ? ' · KPI ' + this.money(kd) : '') + '</td>' :
          '<td>' + this.money(a.nmv) + '</td><td>' + (kd ? this.money(kd) : '—') + '</td><td class="' + (kd ? (a.nmv >= kd ? 'goodw' : 'badw') : '') + '">' + (kd ? this.pct(a.nmv / kd, 0) : '—') + '</td><td>' + this.num(a.ord) + '</td><td>' + this.money(a.spend) + '</td><td class="' + (a.cir != null && cirT && a.cir > cirT ? 'badw' : '') + '">' + (a.cir == null ? (a.spendMiss.length ? '<span class="wk-na">thiếu spend</span>' : '—') : this.pct(a.cir, 1)) + '</td><td>' + this.pct(a.cancel, 1) + '</td>') + '</tr>';
    }
    rows += '<tr class="tot"><td class="l">' + this.wLab(w) + (w.partial ? ' (đến nay)' : '') + '</td><td>' + this.money(T.nmv) + '</td><td>' + (T.kpi ? this.money(T.kpi) : '—') + '</td><td>' + this.pct(T.kpiPct, 0) + '</td><td>' + this.num(T.ord) + '</td><td>' + this.money(T.spend) + '</td><td>' + (T.cir == null ? '—' : this.pct(T.cir, 1)) + '</td><td>' + this.pct(T.cancel, 1) + '</td></tr>';
    return '<div class="wk-day" id="wk-day"><div class="wk-dh"><h4>' + this.esc(name) + ' · ' + this.wLab(w) + ' · ' + this.wRange(w, true) + ' theo ngày</h4><button type="button" class="pp-btn" data-close>Đóng</button></div><div class="wk-dw"><table class="ox-t pp-t wk-dt"><thead><tr><th class="l">Ngày</th><th>NMV</th><th>KPI ngày</th><th>% KPI</th><th>Đơn đặt</th><th>Spend</th><th>CIR</th><th>Tỷ lệ hủy</th></tr></thead><tbody>' + rows + '</tbody></table></div>' + (kg === null && chs.length === 1 && C[chs[0]].kpi === 'websocial' ? '<p class="wk-mut wk-pn">KPI của Harasocial và Website chỉ có dạng gộp Website/Social nên không chia theo từng kênh.</p>' : '') + '</div>';
  }
  csv(X) {
    const C = this.CH(), q = v => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }, f = v => v == null || !isFinite(v) ? '' : +v.toFixed(4);
    const out = [['Tháng', 'Tuần', 'Từ ngày', 'Đến ngày', 'Số ngày', 'Kênh', 'NMV', 'GMV', 'Đơn đặt', 'Đơn không hủy', 'AOV', 'Spend', 'CIR (kênh đủ spend)', 'ROAS', 'Tỷ lệ hủy', 'KPI NMV', '% KPI NMV', 'NMV/ngày vs tuần trước', 'Ngày sale chiếm NMV']];
    X.ws.forEach(w => C.map((c, i) => [i, c.name]).concat([['all', 'Tổng EC']]).forEach(([r, n]) => {
      const chs = r === 'all' ? this.allCh() : [r], a = this.agg(chs, w.a, w.end), pw = this.prevOf(w), p = pw ? this.agg(chs, pw.a, pw.end) : null, d = this.cmp(this.M('nmv'), a, p);
      out.push([this.mL(w.m), this.wLab(w), w.a, w.end, w.n, n, Math.round(a.nmv), Math.round(a.gmv), a.ord, a.ok, Math.round(a.aov || 0), Math.round(a.spend), f(a.cir), f(a.roas), f(a.cancel), Math.round(a.kpi || 0), f(a.kpiPct), d ? f(d.v) : '', f(a.saleShare)]);
    }));
    return out.map(r => r.map(q).join(',')).join('\n');
  }
  notesHtml(X) {
    return '<div class="wk-notes"><b>Cách tính</b><ul>' +
      '<li>Tuần trong tháng: W1 = ngày 1–7, W2 = 8–14, W3 = 15–21, W4 = 22 đến hết tháng (8–10 ngày). Tuần chưa hết đánh dấu * và ghi WTD.</li>' +
      '<li>So tuần trước: chỉ số cộng dồn (NMV, GMV, đơn, spend) so theo trung bình/ngày vì W4 dài hơn các tuần khác; tuần chưa hết so với cùng số ngày đầu của tuần trước. W1 so với W4 tháng trước. Tỷ lệ (CIR, tỷ lệ hủy, % KPI) so bằng điểm %.</li>' +
      '<li>KPI tuần = cộng KPI NMV theo ngày đã phân bổ trong file KPI Monthly Plan. Harasocial và Website chỉ có KPI gộp Website/Social. Kênh Khác không có KPI.</li>' +
      '<li>CIR = Spend / NMV, ROAS = NMV / Spend, chỉ tính khi kênh có đủ spend trong tuần (Facebook có spend đến 28/08, Google đến 17/09). Dòng Tổng EC chỉ cộng các kênh đủ spend.</li>' +
      '<li>Tỷ lệ hủy = 1 − NMV / GMV. AOV = NMV / đơn không hủy. Đơn đặt gồm cả đơn hủy.</li>' +
      '<li>Ngày sale lấy theo lịch trong file KPI (Sale, Double Day, Mid-month, Payday).</li>' +
      '<li>Bảng Chỉ số × Tuần hiển thị kênh đang chọn ở chip (mặc định Tổng EC). Xuất CSV gồm đủ mọi kênh × tuần.</li>' +
      '<li>Cảnh báo: NMV/ngày giảm từ 20% so tuần trước (kênh có từ 1M₫/ngày), đạt dưới 80% KPI tuần, CIR vượt KPI CIR của tháng.</li></ul></div>';
  }
  WK_CSS() {
    const o = this.PP_CSS(), k = o.indexOf('</style>');
    return o.slice(0, k) +
      '.wk-ctl{position:sticky;top:0;z-index:30;display:flex;flex-direction:column;gap:8px;margin:0 -10px 16px;padding:10px 10px 10px;background:rgba(241,246,255,.9);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-radius:0 0 18px 18px}' +
      '.wk-row{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}.wk-gl{font-size:12.5px;color:var(--ox-mut);min-width:42px}.wk-sp{flex:1}' +
      '.ox .wk-chips{display:flex!important;flex-direction:row!important;flex-wrap:wrap;gap:6px;margin:0}.wk-chips .ok-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 13px;border-radius:99px;border:1px solid #cfdcf5;background:rgba(255,255,255,.85);font:inherit;font-size:13px;font-weight:600;color:#0f1b3a;cursor:pointer;line-height:1.2}.wk-chips .ok-chip small{font-weight:400;color:var(--ox-mut);font-size:11.5px}.wk-chips .ok-chip.on{background:#141F63;border-color:#141F63;color:#fff}.wk-chips .ok-chip.on small{color:#c9d6ff}.wk-chips .ok-chip:focus-visible{outline:2px solid #2f6df0;outline-offset:2px}' +
      '.wk-sw{display:inline-block;width:10px;height:10px;border-radius:3px;flex:none}' +
      '.wk-top{margin-bottom:18px;grid-template-rows:auto 1fr!important}.wk-top .ox-hero{grid-row:span 2}.wk-topr{grid-column:2 / -1;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:12px;min-width:0}.wk-top .ox-hv{font-size:clamp(38px,3.4vw,52px)}.wk-na{font-size:.62em;font-weight:600;color:#a86d00;background:#fdf0d2;padding:2px 8px;border-radius:99px;letter-spacing:0;white-space:nowrap}' +
      '.wk-hbars{display:flex;gap:8px;align-items:flex-end;height:64px;padding:4px 2px 0}.wk-hbars>div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:3px;cursor:help}.wk-hbars i{display:block;width:60%;max-width:34px;min-height:2px;border-radius:6px 6px 2px 2px;background:rgba(47,109,240,.35)}.wk-hbars .on i{background:#2f6df0}.wk-hbars span{font-size:11px;color:var(--ox-mut)}.wk-hbars .on span{color:#0b1530;font-weight:700}' +
      '.wk-agw{display:flex;flex-direction:column;gap:8px;min-width:0}.wk-ag{padding:10px 12px;border-radius:16px;background:#fff5f7;border:1px solid #f3c6cf}.wk-ag.y{background:#fffaf0;border-color:#f2dca6}.wk-ag.g{background:#effaf4;border-color:#bfe8d1}.wk-agh{display:flex;align-items:center;gap:8px;font-size:13px;color:#0b1530}.wk-agn{margin-left:auto;font-size:12px;color:var(--ox-mut)}.wk-dot{width:9px;height:9px;border-radius:50%;background:#d6334f;flex:none}.wk-dot.y{background:#d99a1e}.wk-dot.g{background:#12b981}.wk-agl{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.wk-agl button{padding:3px 10px;border-radius:99px;border:1px solid #cfdcf5;background:#fff;font:inherit;font-size:12px;color:#0f1b3a;cursor:pointer;text-align:left}.wk-agl button:hover,.wk-agl button:focus-visible{border-color:#2f6df0;outline:none}' +
      '.wk-com{padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.8);border:1px solid #dbe7fb;min-width:0}.wk-com h4{margin:0 0 6px;font-size:13.5px;color:#0b1530}.wk-com ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:5px}.wk-com li{font-size:13px;line-height:1.5;color:#26355c}' +
      '.wk-cw{overflow-x:auto}.wk-svg{width:100%;min-width:560px;height:auto;display:block}.wk-ax{font-size:11.5px;fill:#5b6a8c}.wk-ax.on{fill:#0b1530;font-weight:700}.wk-ax2{font-size:11px;fill:#7a88a8}.wk-bl{font-size:12px;font-weight:700;fill:#0b1530}' +
      '.wk-mchips{justify-content:flex-end}.wk-tw{overflow-x:auto}.wk-t{width:100%;border-collapse:separate;border-spacing:0;min-width:640px}.wk-t thead th{background:#eef3fc!important;color:#41507a;font-size:12.5px;font-weight:600;border-bottom:2px solid #c5d5f3;white-space:nowrap;text-align:right;padding:9px 12px!important;vertical-align:bottom}.wk-t thead th button{border:0;background:none;font:inherit;font-weight:700;color:#141F63;cursor:pointer;padding:0}.wk-t thead th small{display:block;font-weight:400;font-size:11px;color:var(--ox-mut)}.wk-t thead th.cur{background:#dfe9fc!important}.wk-t th.l{text-align:left!important;position:sticky;left:0;z-index:2;background:#f7faff;min-width:170px;font-weight:600;color:#0f1b3a}.wk-t thead th.l{background:#eef3fc!important}.wk-t th.l small{display:block;font-weight:400;font-size:11px}.wk-t tbody th.l{background:#fff!important;border-bottom:1px solid #edf2fb}.wk-t tbody tr.tot th.l{background:#e8f0fd!important}.wk-t tbody th.l{vertical-align:middle;font-weight:600}.wk-t tbody td.mtd{vertical-align:middle}.wk-t tr.wk-g th{text-align:left!important;font-size:12px;font-weight:700;color:#2f6df0;background:#eef4ff!important;padding:6px 12px!important;position:static}.wk-t tr.key th.l,.wk-t tr.key td{background:#f3f7ff!important}.wk-t tr.key .wk-c button b{font-size:14.5px;font-weight:800}.wk-t tbody tr:nth-child(even) td,.wk-t tbody tr:nth-child(odd) td{background-image:none}.wk-svg{max-height:300px}' +
      '.wk-t td{padding:0!important;border-bottom:1px solid #edf2fb;text-align:right}.wk-t td.cur{background:rgba(37,99,235,.05)}.wk-t td.op{background:#dfe9fc}.wk-c button{display:flex;flex-direction:column;align-items:flex-end;gap:1px;width:100%;padding:9px 12px;border:0;background:none;font:inherit;cursor:pointer;color:#0b1530;font-variant-numeric:tabular-nums}.wk-c button b{font-size:13.5px}.wk-c button small{font-size:11.5px}.wk-c button:hover{background:#eef4ff}.wk-c button:focus-visible{outline:2px solid #2f6df0;outline-offset:-2px}.wk-t td.mtd,.wk-t th.mtd{border-left:2px solid #c5d5f3;background:#f6f9ff;padding:9px 12px!important}.wk-t tr.tot th,.wk-t tr.tot td{background:#e8f0fd;font-weight:700}.wk-t tr.tot .wk-c button b{font-weight:800}' +
      '.wk-sb{display:inline-block;margin-left:4px;padding:0 6px;border-radius:99px;background:#fdf0d2;color:#8a5a00;font-style:normal;font-size:10.5px;font-weight:700;cursor:help}.wk-mut{color:var(--ox-mut)}' +
      '.wk-day{margin-top:14px;padding:12px 14px;border-radius:16px;background:#f4f8ff;border:1px solid #dbe7fb}.wk-dh{display:flex;align-items:center;gap:10px;margin-bottom:8px}.wk-dh h4{margin:0;font-size:14px;color:#0b1530;flex:1}.wk-dw{overflow-x:auto}.wk-dt{width:100%;min-width:620px}.wk-dt td,.wk-dt th{padding:7px 10px!important;font-size:12.5px;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.wk-dt td.l,.wk-dt th.l{text-align:left}.wk-dt tr.fut td{color:#a3acc0}.wk-dt tr.sale td{background:#fffaf0}.wk-dt tr.tot td{font-weight:700;background:#e8f0fd}.wk-pn{font-size:12px;margin:8px 0 0}' +
      '.wk-leg{flex-wrap:wrap;justify-content:flex-end}.wk-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px;margin-top:16px}' +
      '.wk-notes{margin-top:16px;font-size:12.5px;line-height:1.6;color:var(--ox-mut)}.wk-notes b{color:#0f1b3a}.wk-notes ul{margin:4px 0 0;padding-left:18px}' +
      '@media (max-width:1280px){.wk-top{grid-template-columns:repeat(2,minmax(0,1fr))!important}.wk-top .ox-hero{grid-column:1 / -1;grid-row:auto}.wk-topr{grid-column:1 / -1}}' +
      '@media (max-width:900px){.wk-topr{grid-template-columns:1fr}}' +
      '@media (max-width:700px){.wk-ctl{position:static;margin:0 0 12px;padding:0;background:none;backdrop-filter:none}.wk-gl{min-width:0;flex-basis:100%}.wk-row .wk-chips{flex-wrap:nowrap!important;overflow-x:auto;max-width:100%;padding-bottom:2px}.wk-chips .ok-chip{white-space:nowrap}.wk-mchips{justify-content:flex-start}.wk-top .ox-card .ox-cv{font-size:22px}.wk-t th.l{min-width:120px}}' +
      '@media print{.wk-ctl{position:static;background:none}.wk-ctl .pp-btn,.wk-dh .pp-btn{display:none!important}.wk-tw,.wk-cw{overflow:visible}.ox-panel{break-inside:avoid}}' +
      o.slice(k);
  }
  paintWK() {
    const root = document.getElementById('wkx'); if (!root) return false;
    if (!root._ok) {
      root._ok = 1;
      root.addEventListener('click', ev => {
        const T = ev.target.closest ? ev.target : null; if (!T) return; const q = s => T.closest(s), st = this.state; let e;
        if ((e = q('[data-mo]'))) { const m = +e.getAttribute('data-mo'), ws = this.weeks(m); this.setState({ mo: m, wk: ws.length ? ws[ws.length - 1].k : 1, open: null }); return; }
        if ((e = q('[data-wk]'))) { this.setState({ wk: +e.getAttribute('data-wk') }); return; }
        if ((e = q('[data-ch]'))) { const c = e.getAttribute('data-ch'); this.setState({ ch: c, open: st.open ? { r: c, k: st.open.k } : null }); return; }
        if ((e = q('[data-metric]'))) { this.setState({ metric: e.getAttribute('data-metric') }); return; }
        if ((e = q('[data-cell]'))) { const [r, k] = e.getAttribute('data-cell').split('|'); const same = st.open && st.open.r === r && st.open.k === +k; this.setState({ ch: r === 'all' ? 'all' : r, wk: +k, open: same ? null : { r, k: +k } }); if (!same) setTimeout(() => { const d = document.getElementById('wk-day'); if (d) d.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 60); return; }
        if (q('[data-close]')) { this.setState({ open: null }); return; }
        if (q('[data-print]')) { try { window.print(); } catch (x) { this.toast('Không mở được hộp thoại in, hãy dùng Ctrl/Cmd + P'); } return; }
        if (q('[data-csv]')) { const X = this.calc(); this.download('weekly-tracking-T' + X.st.mo + '-2026.csv', this.csv(X)); return; }
      });
      const hide = () => { const t = document.getElementById('oxtip'); if (t) t.style.display = 'none'; };
      root.addEventListener('mousemove', ev => {
        const el = ev.target.closest && ev.target.closest('[data-tip]'); if (!el) { hide(); return; }
        let tip = document.getElementById('oxtip'); if (!tip) { tip = document.createElement('div'); tip.id = 'oxtip'; tip.className = 'ox-tip'; document.body.appendChild(tip); }
        const h = el.getAttribute('data-tip'); if (tip._h !== h) { tip._h = h; tip.innerHTML = h; }
        tip.style.display = 'block'; const w = tip.offsetWidth, hh = tip.offsetHeight; let x = ev.clientX + 16, y = ev.clientY + 16;
        if (x + w > window.innerWidth - 8) x = ev.clientX - w - 16; if (y + hh > window.innerHeight - 8) y = ev.clientY - hh - 16;
        tip.style.left = Math.max(8, x) + 'px'; tip.style.top = Math.max(8, y) + 'px';
      });
      root.addEventListener('mouseleave', hide);
    }
    if (!this.dataReady()) return false;
    const X = this.calc();
    const html = this.WK_CSS() + '<div class="ox">' + this.ctlHtml(X) + this.heroHtml(X) + this.chartHtml(X) + '<div class="wk-sp16" style="height:16px"></div>' + this.tableHtml(X) + this.notesHtml(X) + '</div>';
    if (root._h !== html) { root._h = html; root.innerHTML = html; }
    return true;
  }
  renderVals() {
    const R = React.createElement;
    clearTimeout(this._pt); let tries = 0;
    const go = () => { try { if (!this.paintWK() && tries++ < 40) this._pt = setTimeout(go, 100); } catch (e) { console.error('weekly paint', e); } };
    this._pt = setTimeout(go, 0);
    const st = this.state, w = this.dataReady() ? this.wk(st.mo, st.wk) : null;
    return {
      navItems: __NAV__,
      railFooter: R('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' } },
        R('div', { style: { fontSize: 12, letterSpacing: 'var(--tracking-kicker)', textTransform: 'uppercase', color: 'var(--text-faint)' } }, 'Current period'),
        R('div', { className: 'tabular', style: { fontSize: 14.5, color: 'var(--text-secondary)' } }, w ? this.wLab(w) + ' · ' + this.wRange(w) : 'T' + st.mo + '/2026'),
        R('div', { style: { fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.4 } }, 'Nguồn: Order_data · Cost · KPI Monthly Plan')),
      headerSubtitle: 'NMV, đơn, chi phí và % KPI theo tuần × kênh · ' + (w ? this.wLab(w) + ' · ' + this.wRange(w) + (w.partial ? ' (WTD)' : '') : '')
    };
  }
}
