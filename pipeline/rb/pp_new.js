class Component extends DCLogic {
  __bsTick = (() => { const t = () => { try { this._sets = null; this.forceUpdate(); } catch (e) {} }; [300, 1200, 3000, 6000].forEach(ms => setTimeout(t, ms)); })();
  state = { mo: null, grp: 'all', ch: 'all', tab: 'ov', q: '', abc: 'all', st: 'all', zero: false, sort: 'rb', dir: -1, sel: null };
  GC = { 'Nồi cơm & Nấu': '#141F63', 'Nồi chiên': '#1566C4', 'Xay & Ép': '#1CA7EC', 'Bếp từ': '#3A5BD9', 'Chăm sóc cá nhân': '#5158E0', 'Lò vi sóng': '#0E8FA8', 'Giặt ủi': '#4A7FC1', 'Phụ kiện & Khác': '#5F6E8C' };
  CC = ['var(--channel-shopee)', 'var(--channel-tiktok)', 'var(--channel-google)', 'var(--channel-facebook)', 'var(--channel-lazada)', 'var(--channel-other)'];
  CHN = ['Shopee', 'TikTok Shop', 'Website', 'Harasocial', 'Lazada · Tiki', 'Khác'];
  STL = { new: 'Mới', up: 'Đang tăng', down: 'Đang giảm', flat: 'Ổn định', stop: 'Ngừng bán' };
  D() { return window.BSSKUNEW || { skus: [], channels: [], groups: [] }; }
  dataReady() { const D = this.D(); return !!(D.skus && D.skus.length); }
/*HELPERS_A*/
/*HELPERS_B*/
  // ---- tiện ích ---------------------------------------------------------------------------------------------
  pad(n) { return String(n).padStart(2, '0'); }
  dimOf(m0) { return new Date(Date.UTC(2026, m0 + 1, 0)).getUTCDate(); }
  isoOf(m0, d) { return '2026-' + this.pad(m0 + 1) + '-' + this.pad(d); }
  addDays(iso, k) { return new Date(Date.parse(iso + 'T00:00:00Z') + k * 864e5).toISOString().slice(0, 10); }
  num(v) { return v == null || !isFinite(v) ? '—' : Math.round(v).toLocaleString('en-US'); }
  sMoney(v) { return v == null || !isFinite(v) ? '—' : v >= 0 ? '+' + this.money(v) : this.money(v); }
  ppt(v) { return v == null || !isFinite(v) ? '—' : (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(1) + 'pp'; }
  dcls(v, inv) { return v == null || !isFinite(v) || Math.abs(v) < 0.0005 ? 'flat' : ((v > 0) !== !!inv) ? 'up' : 'down'; }
  nm(s) { return String(s.name || '').replace(/BlueStone\s*/i, '').trim(); }
  thumb(s, z) {
    const u = s.img && typeof window.__img === 'function' ? window.__img('thumbs/' + String(s.img).replace(/\.(jpe?g|webp)$/i, '.png')) : null;
    if (u) return '<span class="pp-im" style="width:' + z + 'px;height:' + z + 'px;background:#fff url(\'' + u + '\') center/contain no-repeat"></span>';
    return '<span class="pp-im pp-ph" style="width:' + z + 'px;height:' + z + 'px;font-size:' + Math.round(z * 0.42) + 'px">' + this.esc((this.nm(s)[0] || '?').toUpperCase()) + '</span>';
  }
  stPill(k) { return k ? '<span class="pp-st ' + k + '">' + this.STL[k] + '</span>' : '<span class="pp-mu">—</span>'; }
  abcB(k) { return k ? '<span class="pp-abc ' + k + '">' + k + '</span>' : '<span class="pp-mu">—</span>'; }
  // ---- tính toán -------------------------------------------------------------------------------------------
  calc() {
    const D = this.D(), st = this.state;
    const LI = +String(D.to).slice(5, 7) - 1, ld = D.lastDay || +String(D.to).slice(8, 10);
    const partialLast = ld < this.dimOf(LI);
    const B = st.mo == null ? LI : Math.max(0, Math.min(LI, st.mo)), A = B - 1;
    const partialB = B === LI && partialLast, dim = this.dimOf(B);
    const chs = st.ch === 'all' ? [0, 1, 2, 3, 4, 5] : [+st.ch];
    const bl = () => ({ l: 0, g: 0, o: 0, cl: 0, cg: 0, co: 0, n: 0, no: 0 });
    const ad = (o, c) => { o.l += c[0]; o.g += c[1]; o.o += c[2]; o.cl += c[3]; o.cg += c[4]; o.co += c[5]; o.n += c[6]; o.no += c[7]; return o; };
    const mg = (o, p) => { for (const k in p) o[k] += p[k]; return o; };
    const refEnd = B === LI ? D.to : this.isoOf(B, dim);
    const newFrom = this.addDays(refEnd, -60);
    const rows = D.skus.map(s => {
      const months = Array.from({ length: LI + 1 }, bl), ch6A = Array.from({ length: 6 }, bl), ch6B = Array.from({ length: 6 }, bl);
      for (let m = 0; m <= LI; m++) for (const c of chs) { const cell = s.d[m + '_' + c]; if (cell) ad(months[m], cell); }
      for (let c = 0; c < 6; c++) {
        const cb = s.d[B + '_' + c]; if (cb) ad(ch6B[c], cb);
        if (A >= 0) { const ca = s.d[(partialB ? 'p' : '') + A + '_' + c]; if (ca) ad(ch6A[c], ca); }
      }
      const a = bl(), b = bl(); for (const c of chs) { mg(a, ch6A[c]); mg(b, ch6B[c]); }
      const y = bl(); for (let m = 0; m <= B; m++) mg(y, months[m]);
      return { s, months, a, b, y, ra: a.n, rb: b.n, ch6A, ch6B };
    });
    const inG = rows.filter(x => st.grp === 'all' || x.s.group === st.grp);
    const sumK = (l, k) => l.reduce((o, x) => mg(o, x[k]), bl());
    const TA = sumK(inG, 'a'), TB = sumK(inG, 'b'), TY = sumK(inG, 'y');
    const abc = (key, setKey, cumKey) => {
      const rk = inG.filter(x => x[key] > 0).sort((p, q) => q[key] - p[key]), tot = rk.reduce((s, x) => s + x[key], 0); let cum = 0;
      rk.forEach((x, i) => { const prev = tot ? cum / tot : 0; x[setKey] = prev < 0.8 ? 'A' : prev < 0.95 ? 'B' : 'C'; cum += x[key]; x[cumKey] = tot ? cum / tot : 0; x[setKey + 'r'] = i + 1; });
      return { rk, tot };
    };
    const RB = abc('rb', 'abc', 'cum'), RA = abc('ra', 'abcA', 'cumA');
    const avgCr = TB.g ? TB.cg / TB.g : null;
    rows.forEach(x => {
      if (x.abc === undefined) x.abc = null; if (x.abcA === undefined) x.abcA = null;
      x.dv = x.rb - x.ra; x.dp = x.ra > 0 ? x.rb / x.ra - 1 : null;
      x.isNew = !!x.s.first && x.s.first >= newFrom && x.s.first <= refEnd;
      x.cr = x.b.g ? x.b.cg / x.b.g : null; x.aov = x.b.no ? x.b.n / x.b.no : null;
      x.share = TB.n ? x.rb / TB.n : null;
      let k = null;
      if (x.rb > 0 && x.isNew) k = 'new';
      else if (A >= 0 && (x.ra > 0 || x.rb > 0)) k = x.ra > 0 && x.rb === 0 ? 'stop' : x.ra === 0 ? 'up' : x.dp >= 0.1 ? 'up' : x.dp <= -0.1 ? 'down' : 'flat';
      x.status = k;
    });
    const pool = inG.filter(x => x.ra >= 1e6 || x.rb >= 1e6);
    const ups = pool.filter(x => x.dv > 0).sort((p, q) => q.dv - p.dv), downs = pool.filter(x => x.dv < 0).sort((p, q) => p.dv - q.dv);
    const news = inG.filter(x => x.isNew && x.rb > 0).sort((p, q) => q.rb - p.rb);
    const stops = inG.filter(x => x.status === 'stop').sort((p, q) => q.ra - p.ra);
    const alA = A < 0 ? [] : inG.filter(x => x.abcA === 'A' && x.ra > 0 && x.rb < x.ra * 0.7).sort((p, q) => p.dv - q.dv);
    const alC = inG.filter(x => x.b.g >= 5e6 && x.b.l >= 8 && avgCr != null && x.cr > avgCr * 1.5).sort((p, q) => q.b.cg - p.b.cg);
    const alN = inG.filter(x => x.isNew && x.rb >= 2e6).sort((p, q) => q.rb - p.rb);
    const alS = A < 0 ? [] : inG.filter(x => x.status === 'stop' && x.ra >= 1e6).sort((p, q) => q.ra - p.ra);
    const gs = D.groups.map(g => { const l = rows.filter(x => x.s.group === g); const ra = l.reduce((s, x) => s + x.ra, 0), rb = l.reduce((s, x) => s + x.rb, 0); return { g, l, ra, rb, a: sumK(l, 'a'), b: sumK(l, 'b') }; }).sort((p, q) => q.rb - p.rb);
    const gTA = gs.reduce((s, x) => s + x.ra, 0), gTB = gs.reduce((s, x) => s + x.rb, 0);
    const gm = {}; gs.forEach(g => { gm[g.g] = Array.from({ length: LI + 1 }, (_, m) => g.l.reduce((s, x) => s + x.months[m].n, 0)); });
    // KPI tháng
    let kpi = null; const KT = (window.BSTARGETS || {}).months || {}, k = KT[B + 1];
    if (k && st.grp === 'all' && (st.ch === 'all' || [0, 1, 4].indexOf(+st.ch) >= 0)) {
      if (st.ch === 'all') kpi = k.nmv || null; else { const nm = { 0: 'Shopee', 1: 'Tiktok Shop', 4: 'Lazada' }[+st.ch]; kpi = k.ch && k.ch[nm] ? k.ch[nm].nmv || null : null; }
    }
    const rr = partialB ? TB.n * dim / ld : null;
    const X = { D, st, LI, ld, B, A, partialB, dim, chs, rows, inG, TA, TB, TY, RB, RA, avgCr, ups, downs, news, stops, alA, alC, alN, alS, gs, gTA, gTB, gm, kpi, rr, refEnd };
    X.bL = this.pLabel(X, B); X.aL = A >= 0 ? this.pLabel(X, A) : null;
    X.bS = 'T' + (B + 1); X.aS = A >= 0 ? 'T' + (A + 1) : null;
    X.sum = this.sumLines(X);
    return X;
  }
  pLabel(X, m) { return 'T' + (m + 1) + (X.partialB ? ' (01–' + this.pad(X.ld) + '/' + this.pad(m + 1) + ')' : ''); }
  dailySeries(X) {
    const DY = X.D.daily; if (!DY || X.st.grp !== 'all') return null;
    const days = X.partialB ? X.ld : X.dim, out = [];
    for (let d = 1; d <= days; d++) { const r = DY[this.isoOf(X.B, d)]; out.push(r ? X.chs.reduce((s, c) => s + (r[c] || 0), 0) : 0); }
    return out;
  }
  // ---- tóm tắt tự động -------------------------------------------------------------------------------------
  sumLines(X) {
    const o = [], m = v => this.money(v), p = v => this.signedPct(v, 1), nm = x => this.nm(x.s);
    const rvB = X.TB.n, rvA = X.TA.n, dv = rvA ? rvB / rvA - 1 : null, scope = (X.st.grp === 'all' ? '' : X.st.grp + ' · ') + (X.st.ch === 'all' ? '' : this.CHN[+X.st.ch] + ' · ');
    let l1 = scope + 'NMV ' + X.bL + ': ' + m(rvB) + (X.A >= 0 && rvA ? ', ' + p(dv) + ' so với ' + X.aL + ' (' + m(rvA) + ')' : '') + '.';
    if (X.kpi) l1 += ' Đạt ' + this.pct(rvB / X.kpi, 0) + ' KPI tháng (' + m(X.kpi) + ')' + (X.rr ? '; run-rate cuối tháng ' + m(X.rr) + ' ≈ ' + this.pct(X.rr / X.kpi, 0) + ' KPI' : '') + '.';
    else if (X.rr) l1 += ' Run-rate cuối tháng ≈ ' + m(X.rr) + '.';
    o.push(l1);
    if (X.st.grp === 'all' && X.gs.length && X.gTB) {
      const top = X.gs[0], movers = X.gs.filter(g => g.ra > 0 || g.rb > 0).map(g => ({ g: g.g, d: g.rb - g.ra })).sort((a, b) => b.d - a.d);
      let l2 = top.g + ' dẫn đầu với ' + this.pct(top.rb / X.gTB, 0) + ' NMV';
      if (X.A >= 0 && movers.length > 1) { const up = movers[0], dn = movers[movers.length - 1]; l2 += '; tăng nhiều nhất ' + up.g + ' (' + this.sMoney(up.d) + ')' + (dn.d < 0 ? ', giảm nhiều nhất ' + dn.g + ' (' + this.sMoney(dn.d) + ')' : ''); }
      o.push(l2 + '.');
    }
    if (X.RB.rk.length) {
      const t = X.RB.rk[0], nA = X.RB.rk.filter(x => x.abc === 'A').length;
      o.push('SKU chủ lực: ' + nm(t) + ' (' + m(t.rb) + ', ' + this.pct(t.share, 1) + ' NMV). ' + nA + ' SKU nhóm A tạo 80% NMV, trên ' + X.RB.rk.length + ' SKU có doanh số.');
    }
    const al = [];
    if (X.alA.length) al.push(X.alA.length + ' SKU nhóm A giảm ≥30% (lớn nhất: ' + nm(X.alA[0]) + ', ' + this.sMoney(X.alA[0].dv) + ')');
    if (X.alC.length) al.push(X.alC.length + ' SKU tỷ lệ hủy cao bất thường (cao nhất theo giá trị hủy: ' + nm(X.alC[0]) + ', ' + this.pct(X.alC[0].cr, 0) + ')');
    if (al.length) o.push('Cần chú ý: ' + al.join('; ') + '.');
    const lf = [];
    if (X.news.length) lf.push(X.news.length + ' SKU mới trong 60 ngày (' + m(X.news.reduce((s, x) => s + x.rb, 0)) + ' NMV' + (X.alN.length ? ', nổi bật: ' + nm(X.alN[0]) : '') + ')');
    if (X.stops.length) lf.push(X.stops.length + ' SKU ngừng bán (mất ' + m(X.stops.reduce((s, x) => s + x.ra, 0)) + ' so với kỳ trước)');
    if (lf.length) o.push(lf.join('; ') + '.');
    return o;
  }
  // ---- bộ lọc + tab ----------------------------------------------------------------------------------------
  ctlHtml(X) {
    const st = this.state, LI = X.LI;
    let mo = '<div class="pp-row"><span class="pp-lab">Tháng</span>';
    for (let k = 0; k <= LI; k++) mo += '<button type="button" class="ox-tab' + (k === X.B ? ' on' : '') + '" data-mo="' + k + '">T' + (k + 1) + (k === LI && X.D.lastDay < this.dimOf(LI) ? '*' : '') + '</button>';
    mo += '<span class="pp-scope">' + this.esc(X.bL + (X.aL ? ' · so với ' + X.aL : ' · chưa có tháng trước để so sánh')) + '</span></div>';
    const g = '<div class="pp-row"><span class="pp-lab">Nhóm hàng</span><button type="button" class="ox-tab' + (st.grp === 'all' ? ' on' : '') + '" data-grp="all">Tất cả</button>' + X.D.groups.map(n => '<button type="button" class="ox-tab' + (st.grp === n ? ' on' : '') + '" data-grp="' + this.esc(n) + '"><i class="pp-dot" style="background:' + this.GC[n] + '"></i>' + this.esc(n) + '</button>').join('') + '</div>';
    const c = '<div class="pp-row"><span class="pp-lab">Kênh</span><button type="button" class="ox-tab' + (st.ch === 'all' ? ' on' : '') + '" data-ch="all">Tất cả</button>' + this.CHN.map((n, i) => '<button type="button" class="ox-tab' + (st.ch === String(i) ? ' on' : '') + '" data-ch="' + i + '"><i class="pp-dot" style="background:' + this.CC[i] + '"></i>' + this.esc(n) + '</button>').join('') + '</div>';
    return '<div class="ok-chips pp-noprint">' + mo + g + c + '</div>';
  }
  tabsHtml() {
    const t = this.state.tab, T = [['ov', 'Tổng quan'], ['mv', 'Tăng / Giảm'], ['sku', 'Danh sách SKU']];
    return '<div class="pp-tabbar pp-noprint"><div class="ox-tabs" role="tablist">' + T.map(x => '<button type="button" role="tab" aria-selected="' + (t === x[0]) + '" class="ox-tab pp-tab' + (t === x[0] ? ' on' : '') + '" data-tab="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>' +
      '<div class="pp-tools"><button type="button" class="pp-btn" data-print="1">In / lưu PDF</button></div></div>';
  }
  // ---- Tổng quan ---------------------------------------------------------------------------------------------
  sumHtml(X) {
    return '<div class="ox-panel pp-sum"><div class="ox-ph"><div><div class="ox-pt">Tóm tắt kỳ ' + this.esc(X.bS) + '</div><div class="ox-ps">Tự sinh từ số liệu đang lọc, dán thẳng vào báo cáo tháng</div></div><div class="ox-pr pp-noprint"><button type="button" class="pp-btn" data-copysum="1">Sao chép tóm tắt</button></div></div><ul class="pp-sl">' +
      X.sum.map(s => '<li>' + this.esc(s) + '</li>').join('') + '</ul></div>';
  }
  heroHtml(X) {
    const rvB = X.TB.n, rvA = X.TA.n, dv = rvA ? rvB / rvA - 1 : null, m = v => this.money(v);
    const dly = this.dailySeries(X);
    // cột trái
    let L = '<div class="pp-hl"><div class="ox-hl">NMV · ' + this.esc(X.bL) + '</div><div class="ox-hv">' + m(rvB) + '</div><div class="ox-hrow">' +
      (X.A >= 0 ? this.pill(this.signedPct(dv, 1), this.dcls(dv)) + '<span class="ox-hk">so với ' + this.esc(X.aL) + ' (' + m(rvA) + ')</span>' : '<span class="ox-hk">Chưa có tháng trước để so sánh</span>') + '</div>';
    if (X.kpi) {
      const a = rvB / X.kpi;
      L += '<div class="pp-kp"><div class="ox-hrow2"><span>KPI tháng ' + m(X.kpi) + '</span><b>' + this.pct(a, 0) + '</b></div><div class="ox-prog"><span style="width:' + Math.min(100, a * 100) + '%"></span>' + (X.rr ? '<i style="left:' + Math.min(100, X.rr / X.kpi * 100) + '%;background:#0f1b3a" title="Run-rate"></i>' : '') + '</div></div>';
    }
    if (X.rr) L += '<div class="ox-hgrid"><div>' + this.ic('run-rate') + '<span>Run-rate cuối tháng</span><b>' + m(X.rr) + '</b><u>' + (X.kpi ? this.pct(X.rr / X.kpi, 0) + ' KPI · ' : '') + 'tuyến tính theo ' + X.ld + '/' + X.dim + ' ngày</u></div></div>';
    else L += '<div class="pp-fin">Tháng đã chốt số liệu</div>';
    L += '<div class="pp-hmini">GMV ' + m(X.TB.g) + ' · NMV/GMV ' + this.pct(X.TB.g ? X.TB.n / X.TB.g : null, 1) + '</div></div>';
    // giữa: sparkline
    let M = '<div class="pp-hmid"><div class="pp-ht">' + (dly ? 'NMV theo ngày · ' + this.esc(X.bS) : 'NMV theo tháng · ' + (X.st.grp === 'all' ? 'tất cả nhóm' : this.esc(X.st.grp))) + '</div>';
    const W = 420, H = 130, PB = 18, PT = 18;
    let vals, lab, tipL;
    if (dly) { vals = dly; lab = i => String(i + 1); tipL = i => 'Ngày ' + this.pad(i + 1) + '/' + this.pad(X.B + 1); }
    else { vals = X.inG.length ? Array.from({ length: X.B + 1 }, (_, i) => X.inG.reduce((s, x) => s + x.months[i].n, 0)) : []; lab = i => 'T' + (i + 1); tipL = i => 'Tháng ' + (i + 1); }
    const mx = Math.max.apply(null, vals.concat([1])), n = vals.length || 1, bw = W / n, pk = vals.indexOf(Math.max.apply(null, vals.concat([0])));
    let sv = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg pp-spark" role="img" aria-label="' + (dly ? 'NMV theo ngày' : 'NMV theo tháng') + '">';
    vals.forEach((v, i) => {
      const h = Math.max(v > 0 ? 2 : 0, v / mx * (H - PB - PT)), x = i * bw + bw * 0.14, w = bw * 0.72, y = H - PB - h, last = !dly && i === X.B;
      sv += '<g class="ox-hit"' + this.tipAttr(this.tipT(tipL(i), [['NMV', m(v), null]])) + '><rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" fill="' + (dly ? 'url(#oxg)' : i === X.B ? '#2f6df0' : '#a9c8ff') + '" rx="3"/><rect class="ox-hov" x="' + (i * bw).toFixed(1) + '" y="0" width="' + bw.toFixed(1) + '" height="' + H + '"/></g>';
      if (dly ? (n <= 16 || (i + 1) % 5 === 0 || i === n - 1) : true) sv += '<text x="' + (i * bw + bw / 2).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="middle" class="ox-ax' + (last ? ' ox-axon' : '') + '">' + lab(i) + '</text>';
    });
    if (vals.length && vals[pk] > 0) sv += '<text x="' + Math.min(W - 24, Math.max(24, pk * bw + bw / 2)).toFixed(1) + '" y="' + (H - PB - vals[pk] / mx * (H - PB - PT) - 5).toFixed(1) + '" text-anchor="middle" class="ox-val">' + this.short2(vals[pk]) + '</text>';
    sv += '</svg>';
    M += sv + '<div class="pp-hs">' + (dly ? 'Ngày cao nhất ' + this.pad(pk + 1) + '/' + this.pad(X.B + 1) + ': ' + m(vals[pk]) + '. Lọc theo nhóm hàng sẽ chuyển sang xem theo tháng vì số liệu ngày chỉ có theo kênh.' : 'Số liệu theo ngày chỉ có khi xem tất cả nhóm hàng; đang hiển thị theo tháng.') + '</div></div>';
    // phải: top 3 nhóm
    const gl = X.gs.filter(g => g.rb > 0).slice(0, 3), tot = X.gTB;
    let R = '<div class="pp-hr"><div class="pp-ht">Top 3 nhóm hàng' + (X.st.grp === 'all' ? '' : ' (toàn danh mục)') + '</div>' + gl.map((g, i) => { const dd = g.ra ? g.rb / g.ra - 1 : null; return '<div class="pp-t3"><span class="pp-rk">' + (i + 1) + '</span><span class="pp-t3n"><i style="background:' + this.GC[g.g] + '"></i>' + this.esc(g.g) + '</span>' + (X.A >= 0 ? '<span class="pp-d ' + this.dcls(dd) + '">' + this.signedPct(dd, 0) + '</span>' : '<span></span>') + '<span class="pp-t3v"><b>' + m(g.rb) + '</b> · ' + this.pct(tot ? g.rb / tot : null, 0) + ' tổng NMV</span></div>'; }).join('') + (gl.length ? '' : '<div class="pp-mu">Chưa có doanh số</div>') + '</div>';
    return '<div class="pp-hero">' + L + M + R + '</div>';
  }
  short2(v) { return this.money(v).replace('₫', ''); }
  cardsHtml(X) {
    const TA = X.TA, TB = X.TB, TY = X.TY, m = v => this.money(v), hasA = X.A >= 0;
    const aovB = TB.no ? TB.n / TB.no : null, aovA = TA.no ? TA.n / TA.no : null, aovY = TY.no ? TY.n / TY.no : null;
    const crB = TB.g ? TB.cg / TB.g : null, crA = TA.g ? TA.cg / TA.g : null, crY = TY.g ? TY.cg / TY.g : null;
    const actB = X.inG.filter(x => x.rb > 0).length, actA = X.inG.filter(x => x.ra > 0).length, actY = X.inG.filter(x => x.y.n > 0).length;
    const nwR = X.news, nwV = nwR.reduce((s, x) => s + x.rb, 0), nA = X.RB.rk.filter(x => x.abc === 'A').length, nAa = X.RA.rk.filter(x => x.abcA === 'A').length;
    const dd = (a, b) => a && b != null ? b / a - 1 : null;
    const C = [
      { ic: 'orders', l: 'Số đơn', v: this.num(TB.no), d: hasA ? this.signedPct(dd(TA.no, TB.no), 1) : null, c: this.dcls(dd(TA.no, TB.no)), e: 'Lũy kế T1–' + X.bS.slice(1) + ': ' + this.num(TY.no), e2: 'Đơn không hủy, đếm theo SKU' },
      { ic: 'cpo', l: 'AOV', v: m(aovB), d: hasA ? this.signedPct(dd(aovA, aovB), 1) : null, c: this.dcls(dd(aovA, aovB)), e: 'Lũy kế: ' + m(aovY), e2: 'NMV / đơn theo SKU' },
      { ic: 'cancel', l: 'Tỷ lệ hủy', v: this.pct(crB, 1), d: hasA && crA != null && crB != null ? this.ppt(crB - crA) : null, c: this.dcls(crA != null && crB != null ? crB - crA : null, true), e: 'Lũy kế: ' + this.pct(crY, 1), e2: 'GMV hủy ' + m(TB.cg) },
      { ic: 'sku', l: 'SKU bán ra', v: this.num(actB), d: hasA ? (actB - actA >= 0 ? '+' : '−') + Math.abs(actB - actA) + ' SKU' : null, c: this.dcls(actB - actA), e: 'Lũy kế: ' + this.num(actY) + ' SKU', e2: 'trên ' + X.inG.length + ' SKU danh mục' },
      { ic: 'aov', l: 'SKU mới', v: this.num(nwR.length), d: null, c: 'flat', e: nwR.length ? 'NMV ' + m(nwV) + ' · ' + this.pct(TB.n ? nwV / TB.n : null, 1) + ' cơ cấu' : 'Chưa có SKU mới phát sinh', e2: 'Đơn đầu tiên trong 60 ngày qua' },
      { ic: 'target', l: 'SKU nhóm A', v: this.num(nA), d: hasA && X.RA.rk.length ? (nA - nAa >= 0 ? '+' : '−') + Math.abs(nA - nAa) + ' SKU' : null, c: 'flat', e: 'Tạo 80% NMV · ' + this.pct(X.RB.rk.length ? nA / X.RB.rk.length : null, 0) + ' số SKU bán', e2: 'Kỳ trước: ' + (hasA ? nAa + ' SKU' : '—') }
    ];
    return '<div class="pp-cards">' + C.map((k, i) => '<div class="ox-card pp-card g-' + ['rev', 'rev', 'cost', 'q', 'q', 'q'][i] + '"><div class="ox-cl">' + this.ic(k.ic) + '<span>' + this.esc(k.l) + '</span></div><div class="ox-cv">' + k.v + '</div>' +
      '<div class="ox-cd">' + (k.d ? this.pill(k.d, k.c) + '<span class="ox-cp">so với ' + this.esc(X.aS) + '</span>' : '<span class="ox-cp">' + (hasA ? '' : 'Chưa có kỳ so sánh') + '</span>') + '</div>' +
      '<div class="ox-ce"><span>' + this.esc(k.e) + '</span></div><div class="ox-ce pp-e2"><span>' + this.esc(k.e2) + '</span></div></div>').join('') + '</div>';
  }
  alertsHtml(X) {
    const m = v => this.money(v), item = (x, t) => '<div class="pp-ai" data-sku="' + this.esc(x.s.sku) + '">' + this.thumb(x.s, 30) + '<span class="pp-an">' + this.esc(this.nm(x.s)) + '</span><b>' + t + '</b></div>';
    const card = (cls, ttl, sub, list, fmt, act, label) => '<div class="pp-al ' + cls + '"><div class="pp-ah"><span class="pp-ac">' + list.length + '</span><div><div class="pp-at">' + ttl + '</div><div class="ox-ps">' + sub + '</div></div></div>' +
      (list.length ? list.slice(0, 3).map(x => item(x, fmt(x))).join('') + (list.length > 3 ? '<div class="pp-more">và ' + (list.length - 3) + ' SKU khác</div>' : '') : '<div class="pp-ok">Không có SKU nào</div>') +
      (list.length ? '<button type="button" class="pp-link pp-noprint" data-act="' + act + '">' + label + '</button>' : '') + '</div>';
    const A = X.A >= 0;
    return '<div class="ox-panel pp-alp"><div class="ox-ph"><div><div class="ox-pt">SKU cần chú ý</div><div class="ox-ps">Tự phát hiện theo kỳ đang xem · bấm một SKU để xem chi tiết</div></div></div><div class="pp-algrid">' +
      card('r', 'SKU nhóm A tụt mạnh', A ? 'Nhóm A kỳ trước, NMV giảm từ 30% so với kỳ trước' : 'Cần có tháng trước để so sánh', X.alA, x => this.sMoney(x.dv) + ' · ' + this.signedPct(x.dp, 0), 'down', 'Xem trong danh sách') +
      card('y', 'Tỷ lệ hủy cao bất thường', 'Hủy cao hơn 1.5 lần mức chung (' + this.pct(X.avgCr, 1) + '), GMV từ 5M₫, từ 8 dòng đơn', X.alC, x => this.pct(x.cr, 0) + ' · ' + m(x.b.cg), 'cr', 'Xem trong danh sách') +
      card('g', 'SKU mới đạt doanh số tốt', 'Đơn đầu tiên trong 60 ngày gần nhất, NMV từ 2M₫', X.alN, x => m(x.rb), 'new', 'Xem trong danh sách') +
      card('n', 'SKU ngừng bán', A ? 'Có doanh số kỳ trước từ 1M₫, kỳ này không còn đơn' : 'Cần có tháng trước để so sánh', X.alS, x => 'trước ' + m(x.ra), 'stop', 'Xem trong danh sách') + '</div></div>';
  }
  structHtml(X) {
    const m = v => this.money(v), mx = Math.max.apply(null, X.gs.map(g => Math.max(g.rb, g.ra)).concat([1])), hasA = X.A >= 0;
    const rows = X.gs.map(g => {
      const sh = X.gTB ? g.rb / X.gTB : null, sa = X.gTA ? g.ra / X.gTA : null, dp = g.ra ? g.rb / g.ra - 1 : null, ppv = sh != null && sa != null ? sh - sa : null;
      const dim = X.st.grp !== 'all' && X.st.grp !== g.g;
      const tip = this.tipT(g.g + ' · ' + X.bL, [['NMV', m(g.rb), this.GC[g.g]], hasA ? ['NMV ' + X.aS, m(g.ra), null] : null, ['Cơ cấu', this.pct(sh, 1) + (hasA ? ' (' + this.ppt(ppv) + ')' : ''), null], ['Số đơn', this.num(g.b.no), null], ['AOV', m(g.b.no ? g.b.n / g.b.no : null), null], ['Tỷ lệ hủy', this.pct(g.b.g ? g.b.cg / g.b.g : null, 1), null], ['SKU có doanh số', this.num(g.l.filter(x => x.rb > 0).length) + '/' + g.l.length, null]]);
      return '<div class="pp-gr' + (X.st.grp === g.g ? ' on' : '') + (dim ? ' dim' : '') + '" data-grp="' + this.esc(g.g) + '"' + this.tipAttr(tip) + '><span class="pp-gn"><i style="background:' + this.GC[g.g] + '"></i>' + this.esc(g.g) + '</span>' +
        '<span class="pp-gt"><span class="pp-gf" style="width:' + (g.rb / mx * 100) + '%;background:' + this.GC[g.g] + '"></span>' + (hasA && g.ra > 0 ? '<i class="pp-gm" style="left:' + (g.ra / mx * 100) + '%" title="Kỳ trước"></i>' : '') + '</span>' +
        '<b>' + m(g.rb) + '</b><em>' + this.pct(sh, 1) + '</em>' + (hasA ? '<span class="pp-d ' + this.dcls(dp) + '">' + (dp == null ? (g.rb > 0 ? 'mới' : '—') : this.signedPct(dp, 0)) + '</span><u class="' + this.dcls(g.rb - g.ra) + '">' + this.sMoney(g.rb - g.ra) + '</u>' : '<span></span><u></u>') + '</div>';
    }).join('');
    const head = '<div class="pp-gr pp-gh"><span>Nhóm hàng</span><span>NMV' + (hasA ? ' · vạch đen = kỳ trước' : '') + '</span><span>NMV</span><span>Cơ cấu</span><span>' + (hasA ? 'Δ %' : '') + '</span><span>' + (hasA ? 'Δ ₫' : '') + '</span></div>';
    return this.panel('ox-c7', 'Cơ cấu NMV theo nhóm hàng', this.esc(X.bL) + (X.aL ? ' · so với ' + this.esc(X.aL) : '') + ' · bấm một nhóm để lọc cả trang', '<div class="pp-gb">' + head + rows + '</div>',
      'Cơ cấu tính trên toàn danh mục của kênh đang chọn, không bị thu hẹp khi lọc nhóm hàng. Δ là chênh lệch NMV so với kỳ trước.');
  }
  paretoHtml(X) {
    const rk = X.RB.rk, n = rk.length, W = 360, H = 210, L = 44, R = 10, T = 12, Bm = 48, pw = W - L - R, ph = H - T - Bm;
    const cnt = k => rk.filter(x => x.abc === k), sets = ['A', 'B', 'C'].map(k => { const l = cnt(k); return { k, n: l.length, v: l.reduce((s, x) => s + x.rb, 0) }; });
    let sv = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg" role="img" aria-label="Đường Pareto NMV theo SKU">';
    [0, 0.5, 0.8, 1].forEach(f => { const y = T + ph * (1 - f); sv += '<line class="ox-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text class="ox-ax" x="' + (L - 5) + '" y="' + (y + 4) + '" text-anchor="end">' + Math.round(f * 100) + '%</text>'; });
    if (n) {
      let pts = [[L, T + ph]]; rk.forEach((x, i) => pts.push([L + (i + 1) / n * pw, T + ph * (1 - x.cum)]));
      sv += '<polyline fill="none" stroke="#2f6df0" stroke-width="2.4" stroke-linejoin="round" points="' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + '"/>';
      const nA = sets[0].n, nAB = nA + sets[1].n;
      [[nA, 'A'], [nAB, 'A+B']].forEach(a => { const x = L + a[0] / n * pw; sv += '<line class="ox-link" x1="' + x + '" x2="' + x + '" y1="' + T + '" y2="' + (T + ph) + '"/><text class="ox-axt" x="' + x + '" y="' + (H - 24) + '" text-anchor="middle">' + a[1] + ': ' + a[0] + ' SKU</text>'; });
      sv += '<text class="ox-sub" x="' + (L + pw) + '" y="' + (H - 5) + '" text-anchor="end">' + n + ' SKU có doanh số, xếp từ cao xuống thấp</text>';
    }
    sv += '</svg>';
    const colr = { A: '#1566C4', B: '#787FF6', C: '#8A93AB' }, rule = { A: '80% đầu', B: '15% tiếp theo', C: '5% cuối' };
    const tb = '<div class="pp-abct">' + sets.map(s => '<div><span class="pp-abc ' + s.k + '">' + s.k + '</span><span class="pp-an">' + s.n + ' SKU · ' + rule[s.k] + '</span><b>' + this.money(s.v) + '</b><em>' + this.pct(X.TB.n ? s.v / X.TB.n : null, 0) + '</em></div>').join('') + '</div>';
    return this.panel('ox-c5', 'Pareto ABC theo NMV', n ? 'Một nhóm SKU nhỏ tạo phần lớn doanh thu' : 'Chưa có SKU nào có doanh số trong kỳ', n ? sv + tb : '<div class="ok-empty">Không có dữ liệu</div>', 'A: SKU tạo 80% NMV đầu tiên của kỳ đang xem. B: 15% tiếp theo. C: 5% cuối. Tính trong phạm vi nhóm hàng và kênh đang lọc.');
  }
  trendHtml(X) {
    const n = X.LI + 1, W = 860, H = 280, L = 54, R = 10, T = 26, Bm = 30, pw = W - L - R, ph = H - T - Bm, bw = pw / n;
    const tot = Array.from({ length: n }, (_, i) => X.gs.reduce((s, g) => s + X.gm[g.g][i], 0)), mx = this.niceMax(Math.max.apply(null, tot.concat([1])));
    let sv = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg" role="img" aria-label="NMV theo nhóm hàng và tháng">';
    [0, 0.5, 1].forEach(f => { const y = T + ph * (1 - f); sv += '<line class="ox-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/><text class="ox-ax" x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end">' + this.short(mx * f).replace(/^0$/, '0') + '</text>'; });
    const order = X.gs.slice().reverse();
    for (let i = 0; i < n; i++) {
      const x = L + i * bw, w = bw * 0.62, x0 = x + (bw - w) / 2, isB = i === X.B, isA = i === X.A, part = i === X.LI && X.D.lastDay < this.dimOf(X.LI);
      if (isB || isA) sv += '<rect class="ox-sel" x="' + (x + 2) + '" y="' + (T - 14) + '" width="' + (bw - 4) + '" height="' + (ph + 14 + Bm - 6) + '" opacity="' + (isB ? 1 : 0.5) + '"/>';
      let y = T + ph; const rowsT = [];
      order.forEach(g => { const v = X.gm[g.g][i]; const h = v / mx * ph; if (v > 0) { y -= h; sv += '<rect x="' + x0.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + Math.max(0.5, h).toFixed(1) + '" rx="2" fill="' + this.GC[g.g] + '" opacity="' + (X.st.grp !== 'all' && X.st.grp !== g.g ? 0.22 : part ? 0.78 : 1) + '"/>'; } });
      X.gs.forEach(g => { const v = X.gm[g.g][i]; if (v > 0) rowsT.push([g.g, this.money(v) + ' · ' + this.pct(tot[i] ? v / tot[i] : null, 0), this.GC[g.g]]); });
      const tip = this.tipT('T' + (i + 1) + (part ? ' (01–' + this.pad(X.D.lastDay) + '/' + this.pad(i + 1) + ', chưa đủ tháng)' : '') + ' · ' + this.money(tot[i]), rowsT);
      sv += '<text class="ox-val" x="' + (x + bw / 2).toFixed(1) + '" y="' + (T + ph - tot[i] / mx * ph - 6).toFixed(1) + '" text-anchor="middle">' + this.short2(tot[i]) + '</text><text class="ox-ax' + (isB ? ' ox-axon' : '') + '" x="' + (x + bw / 2).toFixed(1) + '" y="' + (H - 9) + '" text-anchor="middle">T' + (i + 1) + (part ? '*' : '') + '</text>';
      sv += '<g class="ox-hit" data-mo="' + i + '"' + this.tipAttr(tip) + '><rect class="ox-hov" x="' + x.toFixed(1) + '" y="' + (T - 14) + '" width="' + bw.toFixed(1) + '" height="' + (ph + Bm + 14) + '"/></g>';
    }
    sv += '</svg>';
    const leg = this.legend(X.gs.map(g => ({ c: this.GC[g.g], t: g.g })));
    return this.panel('ox-c12', 'NMV theo nhóm hàng · theo tháng', 'Cột sáng nền là tháng đang xem, nền nhạt là tháng so sánh · bấm cột để chuyển tháng', sv, (X.D.lastDay < this.dimOf(X.LI) ? 'T' + (X.LI + 1) + '* mới có số liệu 01–' + this.pad(X.D.lastDay) + '/' + this.pad(X.LI + 1) + ', cột thấp hơn không có nghĩa là giảm. ' : '') + 'Lọc nhóm hàng sẽ làm mờ các nhóm còn lại.', leg);
  }
  // ---- Tăng / Giảm -------------------------------------------------------------------------------------------
  tipSku(X, x) {
    const m = v => this.money(v), hasA = X.A >= 0, r = [];
    for (let c = 0; c < 6; c++) { const a = x.ch6A[c].n, b = x.ch6B[c].n; if (a || b) r.push([a, b, c]); }
    r.sort((p, q) => Math.abs(q[1] - q[0]) - Math.abs(p[1] - p[0]));
    return this.tipT(this.nm(x.s) + ' · NMV theo kênh', r.map(o => [this.CHN[o[2]], (hasA ? m(o[0]) + ' → ' : '') + m(o[1]) + (hasA ? ' (' + this.sMoney(o[1] - o[0]) + ')' : ''), this.CC[o[2]]]).concat([['Tỷ lệ hủy', this.pct(x.cr, 1), null, 'tot']]));
  }
  moverPanel(X, kind) {
    const up = kind === 'up', list = (up ? X.ups : X.downs).slice(0, 10), m = v => this.money(v), all = up ? X.ups : X.downs;
    const body = list.length ? list.map((x, i) => '<div class="pp-mr" data-sku="' + this.esc(x.s.sku) + '"' + this.tipAttr(this.tipSku(X, x)) + '><span class="pp-rk">' + (i + 1) + '</span>' + this.thumb(x.s, 40) + '<span class="pp-mn"><b>' + this.esc(this.nm(x.s)) + '</b><small>' + this.esc((x.s.model || x.s.sku) + ' · ' + m(x.ra) + ' → ' + m(x.rb)) + '</small></span><span class="pp-mv"><b class="' + (up ? 'up' : 'down') + '">' + this.sMoney(x.dv) + '</b><small>' + (x.dp == null ? 'doanh thu mới' : this.signedPct(x.dp, 0)) + '</small></span></div>').join('') : '<div class="ok-empty">Không có SKU nào đạt ngưỡng 1M₫ ở một trong hai kỳ.</div>';
    const sum = list.reduce((s, x) => s + x.dv, 0);
    const foot = list.length ? (up ? '10 SKU tăng mạnh nhất cộng thêm ' + m(sum) + ' NMV. Dẫn đầu: ' + this.nm(list[0].s) + ' (' + this.sMoney(list[0].dv) + ').' : '10 SKU giảm mạnh nhất mất ' + m(-sum) + ' NMV. Giảm nhiều nhất: ' + this.nm(list[0].s) + ' (' + this.sMoney(list[0].dv) + ').') : '';
    return this.panel('ox-c6', up ? 'Top 10 SKU tăng' : 'Top 10 SKU giảm', X.aL ? this.esc(X.aL + ' → ' + X.bL) + ' · xếp theo chênh lệch NMV (₫) · ' + all.length + ' SKU ' + (up ? 'tăng' : 'giảm') : 'Cần có tháng trước để so sánh',
      '<div class="pp-ml">' + body + '</div>', foot, list.length ? '<button type="button" class="pp-btn pp-noprint" data-copy="' + kind + '">Sao chép bảng</button>' : '');
  }
  lifePanel(X, kind) {
    const isN = kind === 'new', list = isN ? X.news : X.stops, m = v => this.money(v);
    const body = list.length ? list.slice(0, 8).map(x => '<div class="pp-mr" data-sku="' + this.esc(x.s.sku) + '">' + this.thumb(x.s, 36) + '<span class="pp-mn"><b>' + this.esc(this.nm(x.s)) + '</b><small>' + this.esc((x.s.model || x.s.sku) + ' · ' + x.s.group + (isN ? ' · đơn đầu ' + this.dm(x.s.first) : ' · đơn cuối ' + this.dm(x.s.last))) + '</small></span><span class="pp-mv"><b>' + m(isN ? x.rb : x.ra) + '</b><small>' + (isN ? 'NMV kỳ này' : 'NMV kỳ trước') + '</small></span></div>').join('') + (list.length > 8 ? '<div class="pp-more">và ' + (list.length - 8) + ' SKU khác</div>' : '') : '<div class="ok-empty">' + (isN ? 'Chưa có SKU mới trong 60 ngày gần nhất.' : (X.A >= 0 ? 'Không có SKU nào ngừng bán so với kỳ trước.' : 'Cần có tháng trước để so sánh.')) + '</div>';
    return this.panel('ox-c6', isN ? 'SKU mới' : 'SKU ngừng bán', isN ? 'Đơn đầu tiên trong 60 ngày gần nhất · ' + list.length + ' SKU' : 'Có doanh số kỳ trước, kỳ này không còn đơn · ' + list.length + ' SKU', '<div class="pp-ml">' + body + '</div>', '', list.length ? '<button type="button" class="pp-link pp-noprint" data-act="' + (isN ? 'new' : 'stop') + '">Xem trong danh sách</button>' : '');
  }
  moversHtml(X) {
    return '<section class="ox-charts" style="align-items:start">' + this.moverPanel(X, 'up') + this.moverPanel(X, 'down') + this.lifePanel(X, 'new') + this.lifePanel(X, 'stop') + '</section>' +
      '<div class="pp-foot">Ngưỡng lọc nhiễu: SKU phải có NMV từ 1M₫ ở ít nhất một trong hai kỳ mới được xếp hạng. Rê chuột vào một dòng để xem NMV theo kênh, bấm để mở chi tiết SKU.</div>';
  }
  // ---- Danh sách SKU -----------------------------------------------------------------------------------------
  skuList(X) {
    const st = this.state, q = (st.q || '').trim().toLowerCase();
    let l = X.inG.filter(x => {
      if (q && !(String(x.s.name).toLowerCase().includes(q) || String(x.s.sku).includes(q) || String(x.s.model || '').toLowerCase().includes(q))) return false;
      if (st.abc !== 'all' && x.abc !== st.abc) return false;
      if (st.st !== 'all' && x.status !== st.st) return false;
      if (!st.zero && x.rb === 0 && st.st !== 'stop') return false;
      return true;
    });
    const key = st.sort, dir = st.dir, so = { new: 0, up: 1, flat: 2, down: 3, stop: 4 };
    const val = x => key === 'name' ? this.nm(x.s).toLowerCase() : key === 'grp' ? x.s.group : key === 'rb' ? x.rb : key === 'share' ? x.share || 0 : key === 'dv' ? x.dv : key === 'ord' ? x.b.no : key === 'aov' ? (x.aov == null ? -1 : x.aov) : key === 'cr' ? (x.cr == null ? -1 : x.cr) : key === 'abc' ? (x.abc ? x.abc.charCodeAt(0) : 99) : key === 'st' ? (x.status ? so[x.status] : 9) : x.rb;
    l = l.slice().sort((p, q2) => { const a = val(p), b = val(q2); return (a < b ? -1 : a > b ? 1 : q2.rb - p.rb) * dir; });
    return l;
  }
  spark6(x, X) {
    const f = Math.max(0, X.B - 5), v = x.months.slice(f, X.B + 1).map(o => o.n), mx = Math.max.apply(null, v.concat([1])), W = 84, H = 24, n = v.length;
    if (n < 2) return '<span class="pp-mu">—</span>';
    const pt = (a, i) => [(i / (n - 1) * (W - 6) + 3).toFixed(1), (H - 3 - a / mx * (H - 6)).toFixed(1)];
    const pts = v.map(pt), tip = this.tipT(this.nm(x.s) + ' · NMV ' + n + ' tháng', v.map((a, i) => ['T' + (f + i + 1), this.money(a), null]));
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" class="pp-sp"' + this.tipAttr(tip) + '><polyline fill="none" stroke="#2f6df0" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" points="' + pts.map(p => p.join(',')).join(' ') + '"/><circle cx="' + pts[n - 1][0] + '" cy="' + pts[n - 1][1] + '" r="2.6" fill="#2f6df0"/></svg>';
  }
  th(k, t, cls) { const s = this.state, on = s.sort === k; return '<th class="' + (cls || '') + (on ? ' on' : '') + '" data-sort="' + k + '" aria-sort="' + (on ? (s.dir < 0 ? 'descending' : 'ascending') : 'none') + '"><button type="button">' + t + '<i>' + (on ? (s.dir < 0 ? '▾' : '▴') : '') + '</i></button></th>'; }
  skuHtml(X) {
    const st = this.state, list = this.skuList(X), m = v => this.money(v), hasA = X.A >= 0;
    const hidden = X.inG.filter(x => x.rb === 0).length;
    const ch = (k, t, cur, att) => '<button type="button" class="ox-tab' + (cur === k ? ' on' : '') + '" ' + att + '="' + k + '">' + t + '</button>';
    const ctl = '<div class="ok-chips pp-noprint"><div class="pp-row"><label class="pp-search"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" data-q="1" value="' + this.esc(st.q) + '" placeholder="Tìm tên, model hoặc mã SKU" aria-label="Tìm SKU"></label>' +
      '<span class="pp-lab">Hạng</span>' + ['all', 'A', 'B', 'C'].map(k => ch(k, k === 'all' ? 'Tất cả' : k, st.abc, 'data-abc')).join('') + '</div>' +
      '<div class="pp-row"><span class="pp-lab">Trạng thái</span>' + ['all', 'new', 'up', 'down', 'flat', 'stop'].map(k => ch(k, k === 'all' ? 'Tất cả' : this.STL[k], st.st, 'data-st')).join('') +
      '<label class="pp-chk"><input type="checkbox" data-zero="1"' + (st.zero ? ' checked' : '') + '> Hiện SKU không phát sinh' + (hidden ? ' (' + hidden + ')' : '') + '</label></div></div>';
    const head = '<tr>' + this.th('name', 'SKU', 'l') + this.th('grp', 'Nhóm hàng', 'pp-hm') + this.th('rb', 'NMV') + this.th('share', '% cơ cấu', 'pp-hm') + (hasA ? this.th('dv', 'Δ so kỳ trước') : '') + this.th('ord', 'Số đơn', 'pp-hm') + this.th('aov', 'AOV', 'pp-hm') + this.th('cr', 'Tỷ lệ hủy', 'pp-hm') + this.th('abc', 'Hạng', 'pp-hm c') + this.th('st', 'Trạng thái', 'pp-hm c') + '<th class="pp-hm c">Xu hướng ' + Math.min(6, X.B + 1) + ' tháng</th></tr>';
    const crHi = x => x.cr != null && X.avgCr != null && x.cr > X.avgCr * 1.5 && x.b.g >= 5e6;
    const body = list.map(x => '<tr class="pp-r' + (st.sel === x.s.sku ? ' sel' : '') + '" data-sku="' + this.esc(x.s.sku) + '" tabindex="0"><td class="l pp-c-sku">' + this.thumb(x.s, 38) + '<span class="pp-sn"><b>' + this.esc(this.nm(x.s)) + '</b><small>' + this.esc((x.s.model || '') + ' · ' + x.s.sku) + '</small></span></td>' +
      '<td class="pp-hm pp-gc"><i style="background:' + this.GC[x.s.group] + '"></i>' + this.esc(x.s.group) + '</td><td class="pp-nv"><b>' + m(x.rb) + '</b></td><td class="pp-hm">' + this.pct(x.share, 2) + '</td>' +
      (hasA ? '<td class="pp-dc"><span class="pp-d ' + this.dcls(x.dv) + '">' + (x.ra > 0 ? this.signedPct(x.dp, 0) : (x.rb > 0 ? 'mới' : '—')) + '</span><small class="' + this.dcls(x.dv) + '">' + this.sMoney(x.dv) + '</small></td>' : '') +
      '<td class="pp-hm">' + this.num(x.b.no) + '</td><td class="pp-hm">' + m(x.aov) + '</td><td class="pp-hm' + (crHi(x) ? ' badw' : '') + '">' + this.pct(x.cr, 1) + '</td><td class="pp-hm c">' + this.abcB(x.abc) + '</td><td class="pp-hm c">' + this.stPill(x.status) + '</td><td class="pp-hm c">' + this.spark6(x, X) + '</td></tr>').join('');
    const tbl = list.length ? '<div class="ox-tw pp-tw"><table class="ox-t pp-t"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' : '<div class="ok-empty">Không có SKU nào khớp bộ lọc. Thử bỏ bớt bộ lọc hoặc bật “Hiện SKU không phát sinh”.</div>';
    const right = '<div class="pp-noprint pp-acts"><span class="ox-ps">' + list.length + ' SKU</span><button type="button" class="pp-btn" data-csv="1">Tải CSV</button></div>';
    return this.panel('ox-c12 pp-skup', 'Danh sách SKU', X.bL + (X.aL ? ' · so với ' + X.aL : '') + ' · bấm tiêu đề cột để sắp xếp, bấm một dòng để xem chi tiết', ctl + tbl,
      'Hạng ABC theo NMV lũy kế của kỳ đang xem. Trạng thái: Mới = đơn đầu tiên trong 60 ngày gần nhất; Đang tăng/Đang giảm = NMV đổi từ 10% trở lên so với kỳ trước; Ngừng bán = có doanh số kỳ trước, không có kỳ này. Số đơn đếm theo SKU nên một đơn nhiều SKU được tính ở từng SKU. Tỷ lệ hủy = GMV hủy / GMV.', right);
  }
  drawerHtml(X) {
    const sku = this.state.sel; if (!sku) return '';
    const x = X.rows.find(r => r.s.sku === sku); if (!x) return '';
    const m = v => this.money(v), hasA = X.A >= 0;
    const W = 380, H = 130, L = 8, T = 16, Bm = 20, n = X.LI + 1, bw = (W - L * 2) / n, v = x.months.map(o => o.n), mx = Math.max.apply(null, v.concat([1])), ph = H - T - Bm;
    let sv = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">';
    v.forEach((a, i) => { const h = a / mx * ph, cx = L + i * bw + bw / 2, on = i === X.B; sv += '<g' + this.tipAttr(this.tipT('Tháng ' + (i + 1), [['NMV', m(a), null], ['Số đơn', this.num(x.months[i].no), null]])) + '><rect x="' + (cx - bw * 0.31).toFixed(1) + '" y="' + (T + ph - h).toFixed(1) + '" width="' + (bw * 0.62).toFixed(1) + '" height="' + Math.max(a > 0 ? 1.5 : 0, h).toFixed(1) + '" rx="2" fill="' + (on ? '#2f6df0' : i === X.A ? '#7fa8f7' : '#bcd2f7') + '"/><rect class="ox-hov" x="' + (cx - bw / 2).toFixed(1) + '" y="0" width="' + bw.toFixed(1) + '" height="' + H + '"/></g><text class="ox-ax' + (on ? ' ox-axon' : '') + '" x="' + cx.toFixed(1) + '" y="' + (H - 5) + '" text-anchor="middle">' + (i + 1) + '</text>'; });
    sv += '</svg>';
    const tot = x.ch6B.reduce((s, o) => s + o.n, 0);
    const chr = [0, 1, 2, 3, 4, 5].map(c => ({ c, a: x.ch6A[c], b: x.ch6B[c] })).filter(o => o.a.n || o.b.n).sort((p, q) => q.b.n - p.b.n).map(o => { const dd = o.a.n ? o.b.n / o.a.n - 1 : null, cr = o.b.g ? o.b.cg / o.b.g : null; return '<div class="pp-dch"><span class="pp-dn"><i style="background:' + this.CC[o.c] + '"></i>' + this.CHN[o.c] + '</span><span class="pp-dt"><span style="width:' + (tot ? o.b.n / tot * 100 : 0) + '%;background:' + this.CC[o.c] + '"></span></span><b>' + m(o.b.n) + '</b><em>' + this.pct(tot ? o.b.n / tot : null, 0) + '</em><span class="pp-d ' + this.dcls(dd) + '">' + (hasA ? (dd == null ? 'mới' : this.signedPct(dd, 0)) : '') + '</span><small class="' + (cr != null && X.avgCr != null && cr > X.avgCr * 1.5 ? 'badw' : '') + '">hủy ' + this.pct(cr, 0) + '</small></div>'; }).join('');
    const kv = (k, val, cls) => '<div><span>' + k + '</span><b' + (cls ? ' class="' + cls + '"' : '') + '>' + val + '</b></div>';
    return '<div class="pp-ov" data-close="1"></div><aside class="pp-dr" role="dialog" aria-modal="true" aria-label="Chi tiết SKU"><div class="pp-dh">' + this.thumb(x.s, 56) + '<div class="pp-dti"><b>' + this.esc(x.s.name) + '</b><small>' + this.esc((x.s.model || '') + ' · ' + x.s.sku + ' · ' + x.s.group) + '</small><div class="pp-dtg">' + this.abcB(x.abc) + this.stPill(x.status) + '</div></div><button type="button" class="pp-x" data-close="1" aria-label="Đóng">✕</button></div>' +
      '<div class="pp-dkv">' + kv('NMV ' + X.bS, m(x.rb)) + (hasA ? kv('NMV ' + X.aS, m(x.ra)) + kv('Chênh lệch', this.sMoney(x.dv) + (x.dp != null ? ' · ' + this.signedPct(x.dp, 0) : ''), this.dcls(x.dv)) : '') + kv('% cơ cấu', this.pct(x.share, 2)) + kv('Số đơn', this.num(x.b.no)) + kv('AOV', m(x.aov)) + kv('Đơn hủy', this.num(x.b.co) + ' · GMV ' + m(x.b.cg)) + kv('Tỷ lệ hủy', this.pct(x.cr, 1), x.cr != null && X.avgCr != null && x.cr > X.avgCr * 1.5 ? 'badw' : '') + kv('Đơn đầu / cuối', this.dm(x.s.first) + ' – ' + this.dm(x.s.last)) + '</div>' +
      '<div class="pp-dsec">NMV theo tháng</div>' + sv + '<div class="pp-dsec">NMV theo kênh · ' + this.esc(X.bL) + '</div><div class="pp-dchs">' + (chr || '<div class="pp-mu">Chưa có doanh số</div>') + '</div></aside>';
  }
  // ---- xuất dữ liệu ------------------------------------------------------------------------------------------
  csvText(X) {
    const q = s => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"', r = v => v == null || !isFinite(v) ? '' : Math.round(v), p = v => v == null || !isFinite(v) ? '' : (v * 100).toFixed(2);
    const H = ['Mã SKU', 'Tên', 'Model', 'Nhóm hàng', 'NMV ' + X.bS, '% cơ cấu', 'NMV ' + (X.aS || 'kỳ trước'), 'Chênh lệch ₫', 'Chênh lệch %', 'Số đơn', 'AOV', 'Tỷ lệ hủy %', 'Hạng ABC', 'Trạng thái'];
    return [H.map(q).join(',')].concat(this.skuList(X).map(x => [q(x.s.sku), q(x.s.name), q(x.s.model), q(x.s.group), r(x.rb), p(x.share), r(x.ra), r(x.dv), p(x.dp), x.b.no, r(x.aov), p(x.cr), q(x.abc || ''), q(x.status ? this.STL[x.status] : '')].join(','))).join('\r\n');
  }
  tsvMovers(X, kind) {
    const list = (kind === 'up' ? X.ups : X.downs).slice(0, 10), r = v => Math.round(v);
    return ['Hạng\tSKU\tModel\tNMV ' + X.aS + '\tNMV ' + X.bS + '\tChênh lệch ₫\tChênh lệch %'].concat(list.map((x, i) => [i + 1, this.nm(x.s), x.s.model || x.s.sku, r(x.ra), r(x.rb), r(x.dv), x.dp == null ? 'mới' : (x.dp * 100).toFixed(1) + '%'].join('\t'))).join('\n');
  }
  toast(msg) {
    let t = document.getElementById('pptoast'); if (!t) { t = document.createElement('div'); t.id = 'pptoast'; t.className = 'pp-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = '1'; clearTimeout(this._tt); this._tt = setTimeout(() => { t.style.opacity = '0'; }, 2400);
  }
  copyText(txt, ok) {
    const fb = () => { const t = document.createElement('textarea'); t.value = txt; t.style.cssText = 'position:fixed;left:-999px;top:0'; document.body.appendChild(t); t.select(); let good = false; try { good = document.execCommand('copy'); } catch (e) {} t.remove(); this.toast(good ? ok : 'Không sao chép được, hãy bôi đen và nhấn Ctrl+C'); };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(() => this.toast(ok), fb); return; } } catch (e) {}
    fb();
  }
  download(name, txt) {
    try { const b = new Blob(['﻿' + txt], { type: 'text/csv;charset=utf-8' }), u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 800); this.toast('Đã tạo file ' + name); }
    catch (e) { this.copyText(txt, 'Không tải được file, đã sao chép nội dung CSV vào clipboard'); }
  }
  // ---- CSS ----------------------------------------------------------------------------------------------------
  PP_CSS() { const o = this.OX_CSS(), k = o.indexOf('</style>'); return o.slice(0, k) + this.OK_OWN() + this.PP_OWN() + o.slice(k); }
  PP_OWN() {
    return '' +
      '.pp-row{display:flex;gap:8px 10px;align-items:center;flex-wrap:wrap}.pp-lab{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ox-mut);min-width:78px}.pp-scope{margin-left:auto;font-size:13px;color:var(--ox-mut)}.pp-dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:7px;vertical-align:-1px;box-shadow:inset 0 0 0 1px rgba(15,27,58,.18)}' +
      '.pp-tabbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.pp-tab{font-size:14px;padding:8px 20px}.pp-btn{border:1px solid rgba(37,99,235,.28);background:rgba(255,255,255,.8);color:#1d4ed8;border-radius:99px;padding:6px 14px;font:600 12.5px var(--font-body);cursor:pointer;white-space:nowrap}.pp-btn:hover{background:#fff;box-shadow:0 3px 10px rgba(37,99,235,.18)}.pp-btn:focus-visible,.pp-tab:focus-visible,.pp-r:focus-visible,.pp-link:focus-visible{outline:2px solid #2563eb;outline-offset:2px}' +
      '.pp-link{border:0;background:none;color:#2563eb;font:600 12.5px var(--font-body);cursor:pointer;padding:4px 0;text-align:left}.pp-link:hover{text-decoration:underline}' +
      '.pp-sum .pp-sl{margin:0;padding:0 0 0 20px;display:grid;gap:7px;font-size:14.5px;line-height:1.55;color:#0f1b3a}.pp-sl li::marker{color:#2f6df0}' +
      '.pp-hero{display:grid;grid-template-columns:minmax(280px,1fr) minmax(260px,1.1fr) minmax(300px,1.1fr);gap:26px;padding:24px 28px;border-radius:34px;color:var(--ox-ink);background:linear-gradient(115deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.75) 30%,rgba(255,255,255,0) 46%),linear-gradient(150deg,#b9d4ff 0%,#dbeafe 48%,#bcd6ff 100%);border:1px solid #bcd3f7;box-shadow:0 18px 44px rgba(37,99,235,.16),inset 0 1px 0 #fff}' +
      '.pp-hl,.pp-hmid,.pp-hr{display:flex;flex-direction:column;gap:12px;min-width:0}.pp-hmid,.pp-hr{border-left:1px solid rgba(37,99,235,.18);padding-left:26px}.pp-hero .ox-hv{font-size:clamp(40px,3.8vw,56px)}.pp-kp{display:flex;flex-direction:column;gap:7px}.pp-fin{font-size:13px;color:var(--ox-mut)}.pp-hmini{font-size:12.5px;color:var(--ox-mut);margin-top:auto}' +
      '.pp-ht{font-size:13px;font-weight:600;color:var(--ox-mut)}.pp-hs{font-size:12px;color:var(--ox-mut);line-height:1.45}.pp-spark{overflow:visible}' +
      '.pp-t3{display:grid;grid-template-columns:22px minmax(0,1fr) auto;grid-template-rows:auto auto;gap:1px 10px;align-items:center;font-size:13.5px;padding:7px 10px;border-radius:14px;background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.9)}.pp-t3n{display:flex;align-items:center;gap:7px;font-weight:600;color:#0f1b3a;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pp-t3n i,.pp-gn i{width:10px;height:10px;border-radius:3px;flex:none}.pp-t3 .pp-rk{grid-row:1/3}.pp-t3v{grid-column:2/4;font-size:12.5px;color:var(--ox-mut)}.pp-t3v b{color:#0f1b3a}.pp-rk{width:22px;height:22px;border-radius:50%;background:#e3edfb;color:#1d4ed8;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex:none}' +
      '.pp-d{font-size:12.5px;font-weight:700;white-space:nowrap;text-align:right}.pp-d.up,.up{color:#12924f}.pp-d.down,.down{color:#d6334f}.pp-d.flat,.flat{color:#64748b}' +
      '.pp-cards{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px}.pp-card .ox-cv{font-size:26px}.pp-card .ox-cl{font-size:13.5px}.pp-card .ox-cl .bsi{width:30px;height:30px;flex:none}.pp-e2{opacity:.8}.pp-card .ox-ce{font-size:12px;line-height:1.4}' +
      '.pp-alp{gap:14px}.pp-algrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.pp-al{display:flex;flex-direction:column;gap:7px;padding:14px;border-radius:20px;background:rgba(255,255,255,.66);border:1px solid rgba(255,255,255,.95);min-width:0}.pp-ah{display:flex;gap:10px;align-items:flex-start}.pp-ac{flex:none;min-width:30px;height:30px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font:800 15px var(--font-heading);background:#e3edfb;color:#475569}.pp-al.r .pp-ac{background:#ffe3e8;color:#d6334f}.pp-al.y .pp-ac{background:#fff3c9;color:#8a5a00}.pp-al.g .pp-ac{background:#d9f7e6;color:#12924f}.pp-at{font-weight:700;font-size:14px;color:#0f1b3a;line-height:1.25}.pp-al .ox-ps{margin-top:2px;font-size:12px;line-height:1.35}' +
      '.pp-ai{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:8px;align-items:center;font-size:12.5px;padding:3px 4px;border-radius:10px;cursor:pointer}.pp-ai:hover{background:rgba(47,109,240,.09)}.pp-ai b{font-weight:700;white-space:nowrap;font-size:12px}.pp-an{min-width:0;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.3}.pp-more{font-size:12px;color:var(--ox-mut);padding-left:4px}.pp-ok{font-size:12.5px;color:#12924f;padding:6px 2px}' +
      '.pp-im{display:inline-flex;align-items:center;justify-content:center;border-radius:9px;border:1px solid rgba(15,27,58,.08);flex:none;overflow:hidden}.pp-ph{background:#e3edfb;color:#2f55d4;font-weight:700;font-family:var(--font-heading)}' +
      '.pp-gb{display:flex;flex-direction:column;gap:2px}.pp-gr{display:grid;grid-template-columns:150px minmax(60px,2fr) 70px 50px 52px 78px;gap:10px;align-items:center;padding:11px 8px;border-radius:14px;font-size:13px;cursor:pointer}.pp-gr:hover{background:rgba(255,255,255,.6)}.pp-gr.on{background:#fff;box-shadow:inset 3px 0 0 #2f6df0}.pp-gr.dim{opacity:.5}.pp-gr.pp-gh{cursor:default;font-size:11.5px;font-weight:600;color:var(--ox-mut);padding:2px 8px 6px}.pp-gh:hover{background:none}.pp-gh span:nth-child(n+3){text-align:right}' +
      '.pp-gn{display:flex;align-items:center;gap:8px;white-space:nowrap;font-weight:600;color:#0f1b3a;min-width:0}.pp-gn small{font-weight:400;font-size:11.5px;color:var(--ox-mut);margin-left:2px;white-space:nowrap}.pp-gt{position:relative;height:14px;border-radius:99px;background:rgba(37,99,235,.10)}.pp-gf{position:absolute;left:0;top:0;bottom:0;border-radius:99px}.pp-gm{position:absolute;top:-4px;bottom:-4px;width:2.5px;border-radius:2px;background:#0f1b3a;transform:translateX(-50%)}.pp-gr b{text-align:right;font-weight:700;color:#0f1b3a}.pp-gr em{font-style:normal;color:var(--ox-mut);text-align:right}.pp-gr u{text-decoration:none;text-align:right;font-weight:600;font-size:12.5px}' +
      '.pp-abct{display:flex;flex-direction:column;gap:6px;margin-top:4px}.pp-abct>div{display:grid;grid-template-columns:26px minmax(0,1fr) auto 40px;gap:9px;align-items:center;font-size:13px;padding:6px 10px;border-radius:12px;background:rgba(255,255,255,.62)}.pp-abct em{font-style:normal;color:var(--ox-mut);text-align:right}' +
      '.pp-abc{display:inline-flex;justify-content:center;align-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:7px;font-size:12px;font-weight:700;color:#fff;background:#8a93ab}.pp-abc.A{background:#1566C4}.pp-abc.B{background:#787FF6}.pp-abc.C{background:#8A93AB}.pp-mu{color:#8a97ad;font-size:12.5px}' +
      '.pp-st{display:inline-block;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600;white-space:nowrap}.pp-st.new{background:#e1e9ff;color:#2f55d4}.pp-st.up{background:#d9f7e6;color:#12924f}.pp-st.down{background:#ffe3e8;color:#d6334f}.pp-st.flat{background:#e8eef8;color:#5b6b85}.pp-st.stop{background:#fff3c9;color:#8a5a00}' +
      '.ox-c6{grid-column:span 6}.pp-ml{display:flex;flex-direction:column;gap:2px}.pp-mr{display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;gap:11px;align-items:center;padding:7px 6px;border-radius:14px;cursor:pointer}.pp-mr:hover{background:rgba(255,255,255,.65)}.pp-mr .pp-rk{grid-column:1}.pp-mr>.pp-im:first-child{grid-column:1}.pp-mn{min-width:0;display:flex;flex-direction:column;gap:1px}.pp-mn b{font-size:13.5px;font-weight:600;color:#0f1b3a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pp-mn small,.pp-mv small{font-size:12px;color:var(--ox-mut)}.pp-mv small{white-space:nowrap}.pp-mv{display:flex;flex-direction:column;align-items:flex-end}.pp-mv b{font-family:var(--font-heading);font-size:16px;white-space:nowrap}' +
      '.pp-foot{font-size:12.5px;color:var(--ox-mut);line-height:1.65;padding:0 6px}' +
      '.pp-search{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:99px;background:rgba(255,255,255,.85);border:1px solid #c5dbfa;color:#5b6b85;min-width:260px;flex:1 1 260px;max-width:380px}.pp-search input{border:0;outline:0;background:transparent;font:500 13.5px var(--font-body);color:#0f1b3a;width:100%}.pp-search:focus-within{box-shadow:0 0 0 2px #2563eb}.pp-chk{display:inline-flex;align-items:center;gap:7px;font-size:13px;color:#334155;margin-left:auto;cursor:pointer}' +
      '.pp-acts{display:flex;align-items:center;gap:10px}.pp-tw{max-height:74vh;overflow:auto;border-radius:14px}.pp-t th{position:sticky;top:0;z-index:3;background:#eaf2ff;padding:9px 6px}.pp-t th{font:600 12px var(--font-body);color:#5b6b85}.pp-t th button{all:unset;cursor:pointer;display:inline-flex;gap:4px;align-items:center;font:600 12px var(--font-body);color:#5b6b85;white-space:normal;text-align:inherit}.pp-t th.on button{color:#1d4ed8}.pp-t th button i{font-style:normal;font-size:10px;width:8px}.pp-t th.l{text-align:left}.pp-t th.c,.pp-t td.c{text-align:center}' +
      '.pp-t td{padding:8px 6px;vertical-align:middle}.pp-t .pp-c-sku{display:flex;gap:10px;align-items:center;max-width:none;min-width:330px;white-space:normal}.pp-sn{display:flex;flex-direction:column;min-width:0}.pp-sn b{font-size:13.5px;font-weight:600;color:#0f1b3a;line-height:1.25}.pp-sn small{font-size:11.5px;color:var(--ox-mut);font-weight:400}.pp-gc{text-align:left!important;white-space:nowrap}.pp-gc i{display:inline-block;width:8px;height:8px;border-radius:3px;margin-right:7px}.pp-nv b{font-weight:700;color:#0f1b3a}.pp-dc{line-height:1.25}.pp-dc small{display:block;font-size:11.5px;font-weight:600}.pp-dc .pp-d{display:block}' +
      '.pp-r{cursor:pointer}.pp-r:hover td{background:rgba(255,255,255,.65)}.pp-r.sel td{background:rgba(47,109,240,.13)}.pp-sp{display:block;margin:0 auto;overflow:visible}' +
      '.pp-ov{position:fixed;inset:0;background:rgba(11,21,48,.35);z-index:60}.pp-dr{position:fixed;top:0;right:0;bottom:0;width:min(460px,100vw);background:#f6faff;z-index:61;box-shadow:-18px 0 44px rgba(11,21,48,.28);padding:20px 22px;overflow:auto;display:flex;flex-direction:column;gap:12px;font-family:var(--font-body)}' +
      '.pp-dh{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px;align-items:start}.pp-dti{display:flex;flex-direction:column;gap:3px;min-width:0}.pp-dti b{font-family:var(--font-heading);font-size:17px;line-height:1.25;color:#0b1530}.pp-dti small{font-size:12.5px;color:var(--ox-mut)}.pp-dtg{display:flex;gap:6px;margin-top:4px}.pp-x{border:1px solid #c5dbfa;background:#fff;border-radius:99px;width:34px;height:34px;cursor:pointer;color:#334155;font-size:14px}.pp-x:hover{background:#eef4ff}' +
      '.pp-dkv{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.pp-dkv>div{display:flex;flex-direction:column;gap:1px;padding:9px 12px;border-radius:14px;background:#fff;border:1px solid #dbe7fb}.pp-dkv span{font-size:12px;color:var(--ox-mut)}.pp-dkv b{font-size:14.5px;color:#0f1b3a}.pp-dsec{font:700 13.5px var(--font-heading);color:#0b1530;margin-top:6px}' +
      '.pp-dchs{display:flex;flex-direction:column;gap:8px}.pp-dch{display:grid;grid-template-columns:96px minmax(0,1fr) 64px 34px 42px;gap:8px;align-items:center;font-size:12.5px}.pp-dch small{grid-column:2/-1;margin-top:-5px;font-size:11.5px;color:var(--ox-mut)}.pp-dn{display:flex;align-items:center;gap:6px;font-weight:600;color:#0f1b3a}.pp-dn i{width:9px;height:9px;border-radius:3px}.pp-dt{height:10px;border-radius:99px;background:rgba(37,99,235,.10);overflow:hidden}.pp-dt span{display:block;height:100%;border-radius:99px}.pp-dch b{text-align:right}.pp-dch em{font-style:normal;color:var(--ox-mut);text-align:right}' +
      '.pp-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:9999;background:rgba(11,21,48,.94);color:#fff;padding:10px 18px;border-radius:99px;font:600 13px var(--font-body);opacity:0;transition:opacity .2s;pointer-events:none}' +
      '@media (max-width:1280px){.pp-cards{grid-template-columns:repeat(3,minmax(0,1fr))}.pp-algrid{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
      '@media (max-width:1100px){.pp-hero{grid-template-columns:1fr 1fr}.pp-hl{grid-column:1/-1}.pp-hmid{border-left:0;padding-left:0}.ox-c6,.ox-c5,.ox-c7{grid-column:span 12}.pp-hmid,.pp-hr{border-left:0;padding-left:0}.pp-gc{display:none}}' +
      '@media (max-width:700px){.pp-hero{grid-template-columns:1fr;padding:20px}.pp-cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pp-algrid{grid-template-columns:1fr}.pp-scope{margin-left:0;width:100%}.pp-gr{grid-template-columns:minmax(100px,1fr) 64px 44px}.pp-gr>.pp-gt,.pp-gr>u,.pp-gr>.pp-d,.pp-gh span:nth-child(2),.pp-gh span:nth-child(5),.pp-gh span:nth-child(6){display:none}.pp-search{max-width:none}.pp-chk{margin-left:0}' +
      '.pp-t thead{display:none}.pp-t,.pp-t tbody{display:block}.pp-tw{max-height:none}.pp-t tr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;align-items:center;padding:10px 4px;border-bottom:1px solid rgba(15,27,58,.08)}.pp-t td{border:0!important;padding:0!important}.pp-t td.pp-hm{display:none}.pp-t .pp-c-sku{min-width:0}.pp-t td.pp-nv{text-align:right}.pp-t td.pp-dc{grid-column:2;text-align:right}.pp-dch{grid-template-columns:84px minmax(0,1fr) 58px 32px}.pp-dch .pp-d{display:none}}' +
      '@media print{div:has(>main[data-screen-label])>:not(main){display:none!important}.pp-noprint,.pp-ov,.pp-dr,.pp-toast{display:none!important}main[data-screen-label]{padding:0!important}.pp-tw{max-height:none!important;overflow:visible!important}.ox-panel,.ox-card,.pp-hero{box-shadow:none!important;break-inside:avoid}.pp-t th{position:static}body{background:#fff!important}}' +
      '';
  }
  // ---- vẽ -----------------------------------------------------------------------------------------------------
  paintPP() {
    const root = document.getElementById('ppx');
    if (!root) return false;
    if (!root._ok) {
      root._ok = 1;
      root.addEventListener('click', ev => {
        const T = ev.target.closest ? ev.target : null; if (!T) return; const q = s => T.closest(s), st = this.state; let e;
        if (q('[data-close]')) { this.setState({ sel: null }); return; }
        if ((e = q('[data-mo]'))) { this.setState({ mo: +e.getAttribute('data-mo'), sel: null }); return; }
        if ((e = q('[data-grp]'))) { const g = e.getAttribute('data-grp'); this.setState({ grp: st.grp === g && g !== 'all' ? 'all' : g }); return; }
        if ((e = q('[data-ch]'))) { this.setState({ ch: e.getAttribute('data-ch') }); return; }
        if ((e = q('[data-tab]'))) { this.setState({ tab: e.getAttribute('data-tab') }); return; }
        if ((e = q('[data-abc]'))) { this.setState({ abc: e.getAttribute('data-abc') }); return; }
        if ((e = q('[data-st]'))) { this.setState({ st: e.getAttribute('data-st') }); return; }
        if ((e = q('[data-sort]'))) { const k = e.getAttribute('data-sort'); this.setState(st.sort === k ? { dir: -st.dir } : { sort: k, dir: k === 'name' || k === 'grp' || k === 'abc' || k === 'st' ? 1 : -1 }); return; }
        if ((e = q('[data-act]'))) {
          const a = e.getAttribute('data-act');
          if (a === 'cr') this.setState({ tab: 'sku', st: 'all', abc: 'all', q: '', zero: false, sort: 'cr', dir: -1 });
          else if (a === 'down') this.setState({ tab: 'sku', st: 'down', abc: 'all', q: '', zero: false, sort: 'dv', dir: 1 });
          else this.setState({ tab: 'sku', st: a, abc: 'all', q: '', zero: true, sort: a === 'stop' ? 'dv' : 'rb', dir: a === 'stop' ? 1 : -1 });
          return;
        }
        if (q('[data-print]')) { try { window.print(); } catch (x) { this.toast('Không mở được hộp thoại in, hãy dùng Ctrl/Cmd + P'); } return; }
        if (q('[data-copysum]')) { const X = this.calc(); this.copyText('Tóm tắt ' + X.bS + '/2026 · Product Performance\n' + X.sum.map(s => '• ' + s).join('\n'), 'Đã sao chép tóm tắt'); return; }
        if ((e = q('[data-copy]'))) { const X = this.calc(), k = e.getAttribute('data-copy'); this.copyText(this.tsvMovers(X, k), 'Đã sao chép bảng Top 10 ' + (k === 'up' ? 'tăng' : 'giảm')); return; }
        if (q('[data-csv]')) { const X = this.calc(); this.download('product-performance-' + X.bS + '-2026.csv', this.csvText(X)); return; }
        if ((e = q('[data-sku]'))) { this.setState({ sel: e.getAttribute('data-sku') }); return; }
      });
      root.addEventListener('keydown', ev => { const r = ev.target.closest && ev.target.closest('tr[data-sku]'); if (r && (ev.key === 'Enter' || ev.key === ' ') && ev.target === r) { ev.preventDefault(); this.setState({ sel: r.getAttribute('data-sku') }); } });
      root.addEventListener('input', ev => { const t = ev.target; if (t && t.getAttribute && t.getAttribute('data-q')) { this._refocus = t.selectionStart; this.setState({ q: t.value }); } });
      root.addEventListener('change', ev => { const t = ev.target; if (t && t.getAttribute && t.getAttribute('data-zero')) this.setState({ zero: !!t.checked }); });
      window.__ppC = this; if (!window.__ppEsc) { window.__ppEsc = 1; document.addEventListener('keydown', ev => { const c = window.__ppC; if (ev.key === 'Escape' && c && c.state.sel) c.setState({ sel: null }); }); }
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
    let main;
    if (tab === 'mv') main = this.moversHtml(X);
    else if (tab === 'sku') main = this.skuHtml(X);
    else main = this.sumHtml(X) + this.heroHtml(X) + this.cardsHtml(X) + this.alertsHtml(X) + '<section class="ox-charts">' + this.structHtml(X) + this.paretoHtml(X) + this.trendHtml(X) + '</section>';
    const html = this.PP_CSS() + '<div class="ox">' + this.ctlHtml(X) + this.tabsHtml() + main + this.drawerHtml(X) +
      '<div class="pp-foot">' + this.esc('NMV = doanh thu thuần của dòng đơn không hủy; GMV = doanh thu thuần mọi dòng đơn; Tỷ lệ hủy = GMV hủy / GMV; AOV = NMV / số đơn không hủy. Nguồn: Order_data ' + this.dm(X.D.from) + '–' + this.dm(X.D.to) + '/2026, ' + X.D.skus.length + ' SKU. Kênh Website gồm Web, Carez, Google Shop; Lazada gồm cả Tiki.') + '</div></div>';
    if (root._h !== html) {
      root._h = html; root.innerHTML = html;
      if (this._refocus != null) { const inp = root.querySelector('[data-q]'); if (inp) { inp.focus(); try { inp.setSelectionRange(this._refocus, this._refocus); } catch (e) {} } this._refocus = null; }
    }
    return true;
  }
  renderVals() {
    const R = React.createElement, D = this.D();
    if (this.dataReady()) {
      clearTimeout(this._pt); let tries = 0;
      const go = () => { try { if (!this.paintPP() && tries++ < 40) this._pt = setTimeout(go, 100); } catch (e) { console.error('pp paint', e); } };
      this._pt = setTimeout(go, 0);
    }
    const LI = +String(D.to || '2026-01-01').slice(5, 7) - 1, B = this.state.mo == null ? LI : Math.min(this.state.mo, LI), ld = D.lastDay || 0;
    const part = B === LI && ld < this.dimOf(LI);
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
        R('div', { className: 'tabular', style: { fontSize: 14.5, color: 'var(--text-secondary)' } }, 'T' + (B + 1) + '/2026' + (part ? ' · 01–' + this.pad(ld) + '/' + this.pad(B + 1) : '')),
        R('div', { style: { fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.4 } }, 'Order_data đến ' + this.dm(D.to) + '/2026 · ' + (D.skus ? D.skus.length : 0) + ' SKU.')),
      headerSubtitle: 'Hiệu quả theo nhóm hàng và SKU · T' + (B + 1) + '/2026' + (part ? ' (01–' + this.pad(ld) + '/' + this.pad(B + 1) + ')' : '') + ' · NMV = doanh thu thuần đơn không hủy · data đến ' + this.dm(D.to) + '/2026'
    };
  }
}
