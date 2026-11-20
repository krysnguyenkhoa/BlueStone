class Component extends PPBase {
  state = { mo: __HERO_MO__, open: {}, hm: 'gP', hs: 'all', sort: 'v', dir: -1, fsel: 'all', tab: 'ov', base: 'prev', ns: true, mxOpen: { 'Doanh số': true, 'Phễu': true } };
  HD = __HERO_DATA__;
  CATS = [['Nồi chiên', ['BLUNCHAFB5851', 'BLUNCHAFB5895']], ['Máy làm sữa hạt', ['BLUSHDSMB7327', 'BLUSTOBLB6036']], ['Bếp từ', ['BLUBEBICB6949', 'BLUBEBICB6845']], ['Nồi cơm điện', ['BLUNDTRCB5996', 'BLUNDTRCB5958']], ['Máy tạo kiểu tóc', ['BLUTDAHSB1768']], ['Bàn ủi hơi nước', ['BLUHNCGSB4018']]];
  dataReady() { return !!(this.HD && this.HD.skus); }
  money(v) { if (v == null || !isFinite(v)) return '—'; const a = Math.abs(v), g = v < 0 ? '−' : ''; if (a >= 1e9) return g + (a / 1e9).toFixed(2) + ' tỷ'; if (a >= 1e6) return g + (a / 1e6).toFixed(1) + ' tr'; if (a >= 1e3) return g + (a / 1e3).toFixed(0) + ' nghìn'; if (a === 0) return '0'; return g + Math.round(a) + 'đ'; }
  short(v) { const a = Math.abs(v); if (a >= 1e9) return +(v / 1e9).toFixed(2) + ' tỷ'; if (a >= 1e6) return +(v / 1e6).toFixed(a >= 1e8 ? 0 : 1) + ' tr'; if (a >= 1e3) return +(v / 1e3).toFixed(0) + 'K'; return String(Math.round(v)); }
  num(v) { return v == null || !isFinite(v) ? '—' : Math.round(v).toLocaleString('en-US'); }
  mL(m) { return 'T' + m + (m === this.HD.pm ? '*' : ''); }
  pLab(m, sep) { return m === this.HD.pm ? '01–' + String(this.HD.pd).padStart(2, '0') + (sep === false ? '' : '/' + String(m).padStart(2, '0')) : ''; }
  KEYS() { return ['gP', 'gC', 'views', 'clicks', 'ordP', 'ordC', 'unitP', 'unitC', 'buyP', 'buyC', 'visits', 'pv', 'bounce', 'search', 'likes', 'atcV', 'atcU']; }
  // ---- số liệu nền ------------------------------------------------------------------------------------------
  sdN(m) { return ((this.HD.saleDays || {})[m] || []).length; }
  grpSS(m) { const H = this.HD; let a = 0, b = 0; H.skus.forEach(s => { const o = ((H.nmv[s] || {})[m]) || {}; a += o.sale || 0; b += o.nmv || 0; }); return b ? a / b : 0; }
  der(o, d, m) {
    o.days = d; o.gPd = d ? o.gP / d : null; o.gCd = d ? o.gC / d : null;
    o.ctr = o.views ? o.clicks / o.views : null; o.cr = o.visits ? o.buyP / o.visits : null; o.crC = o.visits ? o.buyC / o.visits : null;
    o.atcR = o.visits ? o.atcV / o.visits : null; o.bR = o.visits ? o.bounce / o.visits : null; o.xn = o.gP ? o.gC / o.gP : null;
    o.aov = o.ordP ? o.gP / o.ordP : null; o.aovC = o.ordC ? o.gC / o.ordC : null; return o;
  }
  aggL(list, d, m) {
    const o = { n: list.length }; this.KEYS().forEach(k => { o[k] = list.reduce((s, r) => s + (r[k] || 0), 0); });
    const wb = list.reduce((s, r) => s + (r.buyP || 0), 0);
    o.rep = wb ? list.reduce((s, r) => s + (r.rep || 0) * (r.buyP || 0), 0) / wb : (list.length ? list[0].rep || 0 : null);
    return this.der(o, d, m);
  }
  // tỷ trọng ngày sale: lấy từ Order_data của chính SKU; nếu NMV Order_data quá thấp so với Shopee (< 20% doanh số xác nhận) thì dùng tỷ trọng chung của 10 mã
  saleAdj(o, sk, m) {
    const H = this.HD; let a = 0, b = 0; sk.forEach(s => { const x = ((H.nmv[s] || {})[m]) || {}; a += x.sale || 0; b += x.nmv || 0; });
    let nOrd = 0; sk.forEach(s => { nOrd += ((((H.nmv[s] || {})[m]) || {}).ord || 0); }); const own = b > 0 && b >= 0.2 * o.gC && nOrd >= 15; o.ss = own ? a / b : this.grpSS(m); o.ssOwn = own; o.nmv = b;
    const nd = o.days - this.sdN(m); o.nsDays = nd; o.gPdN = nd > 0 ? o.gP * (1 - o.ss) / nd : null; o.gCdN = nd > 0 ? o.gC * (1 - o.ss) / nd : null; o.recon = o.gC ? b / o.gC : null; return o;
  }
  grp(sk, m) {
    const H = this.HD, L = [].concat.apply([], sk.map(s => ((H.rows[s] || {})[m]) || [])), o = this.aggL(L, H.days[m], m), sh = H.shop[m];
    o.share = sh.gP ? o.gP / sh.gP : null; o.shareC = sh.gC ? o.gC / sh.gC : null; o.nL = L.length; o.exists = L.length > 0; o.listings = L.map(r => this.der(Object.assign({}, r), H.days[m], m));
    return this.saleAdj(o, sk, m);
  }
  vKey(c) { return this.state.ns ? (c === 'C' ? 'gCdN' : 'gPdN') : (c === 'C' ? 'gCd' : 'gPd'); }
  baseMonths(m) { const ms = this.HD.months.filter(x => x < m); return this.state.base === 'avg3' ? ms.slice(-3) : ms.slice(-1); }
  baseLabel(m) { const b = this.baseMonths(m); if (!b.length) return '—'; return b.length === 1 ? this.mL(b[0]) : 'TB ' + this.mL(b[0]) + '–' + this.mL(b[b.length - 1]); }
  baseVal(sk, m, k) { const b = this.baseMonths(m); if (!b.length) return null; const v = b.map(x => this.grp(sk, x)[k]).filter(x => x != null && isFinite(x)); return v.length ? v.reduce((a, x) => a + x, 0) / v.length : null; }
  fSkus(f) { const H = this.HD; if (!f || f === 'all') return H.skus.slice(); if (f.indexOf('cat:') === 0) { const c = this.CATS.find(x => x[0] === f.slice(4)); return c ? c[1].slice() : H.skus.slice(); } return H.skus.indexOf(f.slice(4)) >= 0 ? [f.slice(4)] : H.skus.slice(); }
  fLabel(f) { if (!f || f === 'all') return 'Tất cả 10 mã'; if (f.indexOf('cat:') === 0) return 'Nhóm ' + f.slice(4); return this.HD.short[f.slice(4)] || f; }
  calc() {
    const H = this.HD, st = this.state, mo = st.mo, kP = this.vKey('P'), kC = this.vKey('C');
    const shop = {}; H.months.forEach(m => { shop[m] = this.der(Object.assign({}, H.shop[m]), H.days[m], m); });
    const S = shop[mo];
    const list = H.skus.map((s, i) => {
      const c = this.grp([s], mo); c.code = s; c.idx = i; c.name = H.short[s]; c.model = s.replace(/^BLU[A-Z]{3}/, ''); c.img = (window.__imgMap || {})['thumbs/' + s + '.png'] ? s + '.png' : '';
      c.hist = H.months.map(m => this.grp([s], m)); c.v = c[kP]; c.vC = c[kC];
      c.bv = this.baseVal([s], mo, kP); c.bvC = this.baseVal([s], mo, kC); c.mom = c.bv > 0 && c.v != null ? c.v / c.bv - 1 : null; c.momC = c.bvC > 0 && c.vC != null ? c.vC / c.bvC - 1 : null;
      c.delta = (c.v || 0) - (c.bv || 0); c.flags = H.flags[s] || [];
      const first = H.months.find(m => this.grp([s], m).exists); c.first = first; c.isNew = first != null && first === mo && mo > H.months[0];
      this.health(c, S, mo); return c;
    });
    const k = st.sort === 'v' ? 'v' : st.sort === 'vC' ? 'vC' : st.sort, dir = st.dir;
    list.sort((a, b) => { const x = a[k], y = b[k]; if (x == null && y == null) return a.idx - b.idx; if (x == null) return 1; if (y == null) return -1; return (x - y) * dir || a.idx - b.idx; });
    list.forEach((r, i) => { r.rank = i + 1; });
    const tot = this.grp(H.skus, mo); tot.v = tot[kP]; tot.vC = tot[kC]; tot.bv = this.baseVal(H.skus, mo, kP); tot.bvC = this.baseVal(H.skus, mo, kC);
    tot.mom = tot.bv > 0 ? tot.v / tot.bv - 1 : null; tot.momC = tot.bvC > 0 ? tot.vC / tot.bvC - 1 : null; tot.bShare = this.baseVal(H.skus, mo, 'share');
    return { H, st, mo, shop, S, list, tot, kP, kC, bl: this.baseLabel(mo), hasBase: this.baseMonths(mo).length > 0 };
  }
  // ---- sức khỏe + gợi ý ------------------------------------------------------------------------------------
  health(c, S, mo) {
    const R = [], Y = [], G = [], created = (c.flags.find(f => f.created) || {}).created, bl = this.baseLabel(mo);
    c.types = [];
    if (!c.exists) { c.lvl = 'n'; c.lvlT = 'Chưa mở bán'; c.reasons = [['Chưa có listing trong file ' + this.mL(mo), 'exist']]; c.acts = []; return; }
    if (c.isNew) {
      c.lvl = 'b'; c.lvlT = 'Mã mới'; c.types.push('new');
      c.reasons = [['Tháng đầu có listing' + (created && +String(created).slice(4, 6) === mo ? ' (tạo ' + String(created).slice(6, 8) + '/' + String(created).slice(4, 6) + ')' : ''), 'new'], [c.ordP ? this.num(c.ordP) + ' đơn đặt, ' + this.money(c.gP) : 'Chưa có đơn · ' + this.num(c.views) + ' lượt xem', 'new']];
      c.acts = c.ordP ? [['Mục tiêu 30 ngày đầu: đạt 30 đơn và CR ≥ TB shop', 'Hiện ' + this.num(c.ordP) + ' đơn, CR ' + this.pct(c.cr, 2) + ' (shop ' + this.pct(S.cr, 2) + ').']] : [['Đẩy hiển thị cho mã mới: DVHT khám phá, gắn vào live, voucher ra mắt', 'Mới có ' + this.num(c.views) + ' lượt xem và ' + this.num(c.clicks) + ' lượt nhấp, chưa có đơn.']];
      return;
    }
    if (c.gP === 0 && c.bv > 0) { R.push(['Mất doanh số: 0 đ (' + bl + ' ' + this.money(c.bv) + '/ngày)', 'zero']); c.types.push('zero'); }
    else if (c.gP === 0) { R.push(['Chưa có doanh số', 'zero']); c.types.push('zero'); }
    if (c.gP > 0) {
      if (c.mom != null && c.mom <= -0.3) { R.push(['Đặt/ngày ' + this.signedPct(c.mom, 0) + ' so ' + bl, 'drop']); c.types.push('drop'); }
      if (c.xn != null && c.xn < 0.7) { Y.push(['Tỷ lệ xác nhận ' + this.pct(c.xn, 0) + ' (< 70%)', 'xn']); c.types.push('xn'); }
      if (c.mom != null && c.mom >= 0.3) G.push(['Đặt/ngày ' + this.signedPct(c.mom, 0) + ' so ' + bl, 'up']);
    }
    c.flags.forEach(f => { if (/không cạnh tranh/i.test(f.sheet)) { Y.push(['Shopee: giá không cạnh tranh' + (f.price ? ' (đang bán ' + this.money(f.price) + ')' : ''), 'price']); c.types.push('price'); } });
    c.lvl = R.length ? 'r' : Y.length ? 'y' : 'g'; c.lvlT = { r: 'Báo động', y: 'Cần theo dõi', g: 'Tốt' }[c.lvl];
    c.reasons = R.concat(Y).concat(G);
    const A = [];
    if (c.gP === 0 && c.bv > 0) A.push(['Kiểm tra trạng thái listing, tồn kho và ads', 'Doanh số về 0 trong khi ' + bl + ' có ' + this.money(c.bv) + '/ngày.']);
    if (c.gP > 0) {
      if (c.ctr != null && S.ctr && c.ctr < S.ctr * 0.7 && c.views > 1000) A.push(['Đổi ảnh bìa và tối ưu tên sản phẩm', 'CTR ' + this.pct(c.ctr, 2) + ' thấp hơn TB shop ' + this.pct(S.ctr, 2) + '.']);
      if (c.atcR != null && S.atcR && c.atcR >= S.atcR && c.cr != null && S.cr && c.cr < S.cr * 0.7) A.push(['Xem lại giá và voucher ở bước chốt đơn', 'Thêm giỏ ' + this.pct(c.atcR, 1) + ' (≥ shop) nhưng CR chỉ ' + this.pct(c.cr, 2) + ' (shop ' + this.pct(S.cr, 2) + ').']);
      if (c.xn != null && c.xn < 0.7) A.push(['Rà đơn hủy và đơn chưa xác nhận (COD, thanh toán)', 'Chỉ ' + this.pct(c.xn, 0) + ' doanh số đặt được xác nhận.']);
      if (c.bR != null && S.bR && c.bR > S.bR + 0.1) A.push(['Cải thiện trang sản phẩm: ảnh, video, mô tả', 'Tỷ lệ thoát ' + this.pct(c.bR, 0) + ' cao hơn shop ' + this.pct(S.bR, 0) + '.']);
      if (c.ss != null && c.ss >= 0.6 && c.ssOwn) A.push(['Giảm phụ thuộc ngày sale: chạy DVHT đều các ngày thường', this.pct(c.ss, 0) + ' NMV tháng đến từ ' + this.sdN(mo) + ' ngày sale.']);
      if (c.mom != null && c.mom >= 0.3) A.push(['Giữ đà: tăng ngân sách DVHT và kiểm tồn kho', 'Đặt/ngày ' + this.signedPct(c.mom, 0) + ' so ' + bl + '.']);
    }
    c.flags.forEach(f => { if (/không cạnh tranh/i.test(f.sheet)) A.push(['So giá với đối thủ cùng phân khúc', 'Shopee xếp mã vào nhóm giá không cạnh tranh' + (f.price ? ', giá đang bán ' + this.money(f.price) : '') + '.']); });
    c.acts = A.slice(0, 2);
  }
  chipL(c) { return '<span class="hr-h ' + c.lvl + '"' + this.tipAttr(this.tipT(c.lvlT, c.reasons.map(r => [r[0], '', r[1] === 'up' ? '#12924f' : r[1] === 'xn' || r[1] === 'price' ? '#d99a1e' : r[1] === 'new' ? '#2f6df0' : '#d6334f']).concat(c.reasons.length ? [] : [['Không có cảnh báo', '', '#12924f']]))) + '>' + c.lvlT + '</span>'; }
  dlt(v, inv) { if (v == null || !isFinite(v)) return '<span class="hr-mut">—</span>'; const good = inv ? v < 0 : v > 0; return '<span class="' + (Math.abs(v) < 0.005 ? 'hr-mut' : good ? 'goodw' : 'badw') + '">' + this.signedPct(v, 0) + '</span>'; }
  vLab() { return this.state.ns ? 'không tính ngày sale' : 'tính cả ngày sale'; }
  // ---- thanh điều khiển ----------------------------------------------------------------------------------------
  ctlHtml(X) {
    const st = X.st, ch = (attr, val, cur, l, tip) => '<button type="button" class="ok-chip' + (val === cur ? ' on' : '') + '" ' + attr + '="' + val + '" aria-pressed="' + (val === cur) + '"' + (tip ? this.tipAttr(this.tipT(l, [[tip, '']])) : '') + '>' + l + '</button>';
    const mo = X.H.months.map(m => ch('data-mo', String(m), String(X.mo), this.mL(m))).join('');
    const tabs = [['ov', 'Tổng quan'], ['mx', 'Tháng × chỉ số'], ['tr', 'Xu hướng']].map(t => '<button type="button" role="tab" class="hr-tab' + (st.tab === t[0] ? ' on' : '') + '" data-tab="' + t[0] + '" aria-selected="' + (st.tab === t[0]) + '">' + t[1] + '</button>').join('');
    return '<div class="hr-ctl"><div class="ok-chips" role="group" aria-label="Chọn tháng">' + mo + '</div>' +
      '<div class="ok-chips hr-g2" role="group" aria-label="Mốc so sánh"><span class="hr-gl">So với</span>' + ch('data-base', 'prev', st.base, 'Tháng trước') + ch('data-base', 'avg3', st.base, 'TB 3 tháng trước', 'Trung bình doanh số/ngày của 3 tháng liền trước, tránh so với một tháng bất thường') + '</div>' +
      '<button type="button" class="hr-sw' + (st.ns ? ' on' : '') + '" data-ns role="switch" aria-checked="' + st.ns + '"' + this.tipAttr(this.tipT('Bỏ ngày sale', [['Doanh số/ngày tính trên các ngày thường, loại ngày sale lớn (NMV Shopee ≥ 3× trung vị ngày, ví dụ 10/11 và 11/11). Tỷ trọng ngày sale lấy từ Order_data.', '']])) + '><i></i>Bỏ ngày sale</button>' +
      '<span class="hr-sp"></span><button type="button" class="pp-btn" data-csv>' + this.ic('download') + 'CSV</button><button type="button" class="pp-btn" data-print>' + this.ic('print') + 'In / PDF</button></div>' +
      '<div class="hr-tabs" role="tablist">' + tabs + '<span class="hr-scope">' + (X.mo === X.H.pm ? this.mL(X.mo) + ' có số liệu ' + this.pLab(X.mo) : 'T' + X.mo + '/2026 đủ ' + X.H.days[X.mo] + ' ngày') + ' · ngày sale: ' + (((X.H.saleDays || {})[X.mo]) || []).map(d => d.slice(8, 10) + '/' + d.slice(5, 7)).join(', ') + '</span></div>';
  }
  // ---- Tổng quan --------------------------------------------------------------------------------------------
  heroHtml(X) {
    const t = X.tot, L = X.list, cnt = l => L.filter(r => r.lvl === l).length, bm = this.baseMonths(X.mo), B = bm.map(m => this.grp(X.H.skus, m));
    const bAvg = k => { const v = B.map(o => o[k]).filter(x => x != null && isFinite(x)); return v.length ? v.reduce((a, x) => a + x, 0) / v.length : null; };
    const I = n => '<span class="bsi">' + (window.BSICON ? window.BSICON(n) : '') + '</span>';
    const pill = (d, lower, txt) => d == null || !isFinite(d) ? '<span class="ox-pill flat">—</span>' : '<span class="ox-pill ' + (Math.abs(d) < 0.0005 ? 'flat' : ((d >= 0) !== !!lower) ? 'up' : 'down') + '">' + (Math.abs(d) < 0.0005 ? '' : d >= 0 ? '▲ ' : '▼ ') + (txt || this.pct(Math.abs(d), 1)) + '</span>';
    const pp = (a, b) => a == null || b == null ? null : a - b, ppT = d => d == null ? '' : Math.abs(d * 100).toFixed(1) + ' đ%';
    const card = (g, lab, icon, val, pl, prev, extra) => '<div class="ox-card g-' + g + '"><div class="ox-cl">' + I(icon) + lab + '</div><div class="ox-cv">' + val + '</div><div class="ox-cd">' + pl + '<span class="ox-cp">' + prev + '</span></div>' + (extra ? '<div class="ox-ce">' + extra + '</div>' : '') + '</div>';
    const sd = (((X.H.saleDays || {})[X.mo]) || []).map(d => d.slice(8, 10) + '/' + d.slice(5, 7)).join(', ');
    const mx = Math.max(1, ...X.H.months.map(m => this.grp(X.H.skus, m)[X.kP] || 0));
    const bars = '<div class="hr-hbars">' + X.H.months.map(m => { const v = this.grp(X.H.skus, m)[X.kP] || 0; return '<div class="' + (m === X.mo ? 'on' : '') + '"' + this.tipAttr(this.tipT(this.mL(m), [['Đặt/ngày (' + this.vLab() + ')', this.money(v)]])) + '><i style="height:' + (v / mx * 100).toFixed(1) + '%"></i><span>' + this.mL(m) + '</span></div>'; }).join('') + '</div>';
    const hero = '<div class="ox-hero hr-heroc"><div class="ox-hl bsl">' + I('nmv') + 'Doanh số đặt · 10 Super Hero · ' + this.mL(X.mo) + (X.mo === X.H.pm ? ' (' + this.pLab(X.mo) + ')' : '') + '</div>' +
      '<div class="ox-hv">' + this.money(t.gP) + '</div>' +
      '<div class="ox-hrow">' + pill(t.mom) + '<span class="ox-hk">' + (X.st.ns ? 'TB/ngày thường' : 'TB/ngày') + ' so với ' + X.bl + '</span></div>' + bars +
      '<div class="ox-hgrid">' +
      '<div>' + this.ic('run-rate') + '<span>Đặt / ngày ' + (X.st.ns ? 'thường' : '') + '</span><b>' + this.money(t.v) + '</b><u>' + X.bl + ': ' + this.money(t.bv) + '/ngày · cả tháng ' + this.money(t.gPd) + '/ngày</u></div>' +
      '<div>' + this.ic('target') + '<span>Ngày sale chiếm</span><b>' + this.pct(t.ss, 0) + '</b><u>NMV từ ' + this.sdN(X.mo) + ' ngày sale' + (sd ? ' (' + sd + ')' : '') + '</u></div>' +
      '<div>' + this.ic('gap') + '<span>Đơn đặt</span><b>' + this.num(t.ordP) + '</b><u>AOV ' + this.money(t.aov) + ' · ' + this.num(t.ordC) + ' đơn xác nhận</u></div></div></div>';
    const bShare = bAvg('share'), bXn = bAvg('xn');
    const cards =
      card('rev', 'Doanh số xác nhận', 'NMV', this.money(t.gC), pill(t.momC), X.hasBase ? X.bl + ' ' + this.money(t.bvC) + '/ngày' : '', this.money(t.vC) + '/ngày ' + (X.st.ns ? 'thường' : '')) +
      card('rev', 'Tỷ trọng shop', 'Orders', this.pct(t.share, 1), pill(pp(t.share, bShare), false, ppT(pp(t.share, bShare))), bShare != null ? X.bl + ' ' + this.pct(bShare, 1) : '', 'xác nhận ' + this.pct(t.shareC, 1) + ' · shop ' + this.money(X.S.gP)) +
      card('q', 'Tỷ lệ xác nhận', 'CIR', this.pct(t.xn, 1), pill(pp(t.xn, bXn), false, ppT(pp(t.xn, bXn))), bXn != null ? X.bl + ' ' + this.pct(bXn, 1) : '', 'TB shop ' + this.pct(X.S.xn, 1) + ' · ngưỡng cảnh báo 70%') +
      card('cost', 'Sức khỏe nhóm', 'Cancel rate', cnt('r') + ' <small class="hr-cvs">báo động</small>', '<span class="ox-pill ' + (cnt('y') ? 'flat' : 'up') + '">' + cnt('y') + ' theo dõi</span>', cnt('g') + ' tốt' + (cnt('b') ? ' · ' + cnt('b') + ' mã mới' : '') + (cnt('n') ? ' · ' + cnt('n') + ' chưa bán' : ''), 'Bấm thẻ cảnh báo bên dưới để mở mã');
    return '<div class="ox-top hr-top">' + hero + cards + '<div class="hr-topal">' + this.alertsHtml(X) + '</div></div>';
  }
  alertsHtml(X) {
    const G = [['zero', 'Mất doanh số', 'r', 'Kiểm tra trạng thái listing, tồn kho và ads ngay.'], ['drop', 'Giảm từ 30% so ' + X.bl, 'r', 'Xem lại giá, voucher và ngân sách DVHT so với tháng mốc.'], ['xn', 'Tỷ lệ xác nhận dưới 70%', 'y', 'Rà đơn hủy, đơn COD và đơn chưa thanh toán.'], ['price', 'Shopee gắn cờ giá không cạnh tranh', 'y', 'So giá với đối thủ cùng phân khúc.'], ['new', 'Mã mới đang theo dõi', 'b', 'Mục tiêu 30 ngày đầu: 30 đơn, CR ≥ TB shop.']];
    const cards = G.map(g => { const L = X.list.filter(r => (r.types || []).includes(g[0])); if (!L.length) return ''; return '<div class="hr-ag ' + g[2] + '"><div class="hr-agh"><span class="hr-dot ' + g[2] + '"></span><b>' + g[1] + '</b><span class="hr-agn">' + L.length + ' mã</span></div><div class="hr-agl">' + L.map(r => '<button type="button" data-goto="' + r.code + '"' + this.tipAttr(this.tipT(r.name, r.reasons.map(x => [x[0], '']))) + '>' + this.esc(r.model) + '</button>').join('') + '</div><span class="hr-ags">' + g[3] + '</span></div>'; }).join('');
    return cards ? '<div class="hr-agw">' + cards + '</div>' : '';
  }
  contribHtml(X) {
    if (!X.hasBase) return '';
    const L = X.list.filter(r => r.exists || r.bv).slice().sort((a, b) => b.delta - a.delta), tot = X.tot.v - (X.tot.bv || 0), mx = Math.max(1, ...L.map(r => Math.abs(r.delta)));
    const rows = L.map(r => { const w = Math.abs(r.delta) / mx * 50, pos = r.delta >= 0; return '<div class="hr-cr"' + this.tipAttr(this.tipT(r.name, [[this.mL(X.mo) + ' /ngày', this.money(r.v)], [X.bl + ' /ngày', this.money(r.bv)], ['Chênh lệch', (pos ? '+' : '') + this.money(r.delta)], ['Phần trong thay đổi của nhóm', tot ? this.pct(r.delta / tot, 0) : '—']])) + '><span class="hr-crn">' + this.esc(r.name) + '</span><span class="hr-crb"><i class="' + (pos ? 'p' : 'n') + '" style="' + (pos ? 'left:50%' : 'right:50%') + ';width:' + w.toFixed(1) + '%"></i><em></em></span><b class="' + (pos ? 'goodw' : 'badw') + '">' + (pos ? '+' : '') + this.short(r.delta) + '</b></div>'; }).join('');
    const top = L[0], topShare = tot && top ? top.delta / tot : null;
    return this.panel('ox-c12', 'Đóng góp vào thay đổi doanh số đặt/ngày · ' + this.mL(X.mo) + ' so ' + X.bl, 'Cả nhóm ' + (tot >= 0 ? '+' : '') + this.money(tot) + '/ngày (' + this.vLab() + ')' + (top && topShare != null && Math.abs(topShare) >= 0.4 ? '. ' + this.esc(top.name) + ' chiếm ' + this.pct(topShare, 0) + ' mức thay đổi.' : '.'), '<div class="hr-cw">' + rows + '</div>');
  }
  COLS(X) {
    return [
      ['v', 'Đặt', r => this.money(r.v) + '<small>' + this.money(r.gP) + ' cả tháng</small>', 'Doanh số đơn đã đặt trung bình/ngày (' + this.vLab() + ')'],
      ['vC', 'Xác nhận', r => this.money(r.vC) + '<small>' + this.money(r.gC) + ' cả tháng</small>', 'Doanh số đơn đã xác nhận trung bình/ngày (' + this.vLab() + ')'],
      ['xn', 'Tỷ lệ XN', r => r.gP ? '<span class="' + (r.xn < 0.7 ? 'badw' : '') + '">' + this.pct(r.xn, 0) + '</span>' : '—', 'Doanh số xác nhận / doanh số đặt. Dưới 70% bị cảnh báo'],
      ['mom', 'vs ' + X.bl.replace('TB ', 'TB '), r => this.dlt(r.mom), 'So doanh số đặt/ngày với ' + X.bl + ' của chính SKU'],
      ['ss', 'Ngày sale', r => r.gP ? '<span class="' + (r.ss >= 0.6 ? 'hr-yw' : '') + '">' + this.pct(r.ss, 0) + '</span>' + (r.ssOwn ? '' : '<sup class="hr-dag">†</sup>') : '—', 'Tỷ trọng NMV đến từ các ngày sale (Order_data). † = dùng tỷ trọng chung của nhóm vì mã có dưới 15 đơn trong Order_data'],
      ['share', 'Tỷ trọng', r => this.pct(r.share, 1), 'Doanh số đặt / tổng doanh số đặt của shop Shopee'],
      ['ctr', 'CTR', r => this.pct(r.ctr, 2), 'Lượt nhấp / lượt xem'],
      ['cr', 'CR', r => this.pct(r.cr, 2), 'Người mua đặt hàng / lượt truy cập'],
      ['aov', 'AOV', r => this.money(r.aov), 'Doanh số đặt / đơn đặt']
    ];
  }
  th(c, X, gs) { const on = X.st.sort === c[0]; return '<th scope="col"' + (gs ? ' class="gs"' : '') + (c[3] ? this.tipAttr(this.tipT(c[1], [[c[3], '']])) : '') + '><button type="button" data-sort="' + c[0] + '" aria-sort="' + (on ? (X.st.dir > 0 ? 'ascending' : 'descending') : 'none') + '">' + c[1] + (on ? (X.st.dir > 0 ? ' ▲' : ' ▼') : '') + '</button></th>'; }
  nameCell(r) {
    const full = r.listings.map(l => [l.name.slice(0, 70), '']);
    return '<td class="l"><div class="hr-sk">' + this.thumb({ img: r.img, code: r.model }, 40) + '<div class="hr-sn"' + (full.length ? this.tipAttr(this.tipT(r.code, full)) : '') + '><b>' + this.esc(r.name) + '</b><span>' + r.code + (r.listings.length > 1 ? ' · ' + r.listings.length + ' listing' : '') + ' · <button type="button" class="hr-lk" data-mxsku="' + r.code + '">Theo tháng</button></span></div></div></td>';
  }
  tableHtml(X) {
    const C = this.COLS(X), t = X.tot;
    const rows = X.list.map(r => {
      const op = !!X.st.open[r.code];
      return '<tr id="hr-' + r.code + '" class="hr-r ' + r.lvl + (op ? ' op' : '') + '" data-ex="' + r.code + '" tabindex="0" aria-expanded="' + op + '"><td class="hr-rk">' + r.rank + '<span class="hr-car">' + (op ? '▾' : '▸') + '</span></td>' + this.nameCell(r) + '<td>' + this.chipL(r) + '</td>' + C.map((c, i) => '<td' + ([0, 2, 5].includes(i) ? ' class="gs"' : '') + '>' + c[2](r) + '</td>').join('') + '</tr>' +
        (op ? '<tr class="hr-dx"><td colspan="' + (C.length + 3) + '">' + this.detailHtml(X, r) + '</td></tr>' : '');
    }).join('');
    const foot = '<tr><td></td><td class="l"><b>10 Super Hero</b></td><td></td>' + C.map((c, i) => '<td' + ([0, 2, 5].includes(i) ? ' class="gs"' : '') + '>' + c[2](t) + '</td>').join('') + '</tr>' +
      '<tr class="avg"><td></td><td class="l">TB shop (' + this.num(X.S.n) + ' SP)</td><td></td>' + C.map((c, i) => '<td' + ([0, 2, 5].includes(i) ? ' class="gs"' : '') + '>' + (['ctr', 'cr', 'aov', 'xn'].includes(c[0]) ? c[2](X.S) : '') + '</td>').join('') + '</tr>';
    return this.panel('ox-c12', 'Bảng xếp hạng 10 Super Hero · ' + this.mL(X.mo), 'Bấm một dòng để xem listing, phễu và gợi ý. "Theo tháng" mở bảng tháng × chỉ số của mã đó. Doanh số/ngày đang ' + this.vLab() + '.',
      '<div class="hr-tw"><table class="ox-t pp-t hr-t"><colgroup><col class="c-rk"><col class="c-sku"><col class="c-h">' + C.map((c, i) => '<col class="' + ([2, 5].includes(i) ? 'gs' : '') + '">').join('') + '</colgroup><thead><tr class="hr-th1"><th scope="col" rowspan="2">#</th><th scope="col" rowspan="2" class="l">Sản phẩm</th><th scope="col" rowspan="2">Sức khỏe</th><th scope="colgroup" colspan="2" class="g">Doanh số / ngày <small>' + (X.st.ns ? 'ngày thường' : 'cả ngày sale') + '</small></th><th scope="colgroup" colspan="3" class="g">Chất lượng &amp; xu hướng</th><th scope="colgroup" colspan="4" class="g">Hiệu quả trên Shopee</th></tr><tr class="hr-th2">' + C.map((c, i) => this.th(c, X, [0, 2, 5].includes(i))).join('') + '</tr></thead><tbody>' + rows + '</tbody><tfoot>' + foot + '</tfoot></table></div>' + this.mobileList(X));
  }
  mobileList(X) {
    return '<div class="hr-ml">' + X.list.map(r => {
      const op = !!X.st.open[r.code];
      return '<div class="hr-mc ' + r.lvl + '" id="hrm-' + r.code + '"><button type="button" class="hr-mh" data-ex="' + r.code + '" aria-expanded="' + op + '"><span class="hr-rk">' + r.rank + '</span>' + this.thumb({ img: r.img, code: r.model }, 36) + '<span class="hr-sn"><b>' + this.esc(r.name) + '</b><span>' + this.chipL(r) + '</span></span><span class="hr-car">' + (op ? '▾' : '▸') + '</span></button>' +
        '<div class="hr-mg"><div><span>Đặt/ngày</span><b>' + this.money(r.v) + '</b></div><div><span>Xác nhận/ngày</span><b>' + this.money(r.vC) + '</b></div><div><span>vs ' + X.bl + '</span><b>' + this.dlt(r.mom) + '</b></div><div><span>% xác nhận</span><b>' + (r.gP ? this.pct(r.xn, 0) : '—') + '</b></div></div>' +
        '<div class="hr-mlk"><button type="button" class="hr-lk" data-mxsku="' + r.code + '">Xem theo tháng</button></div>' + (op ? this.detailHtml(X, r) : '') + '</div>';
    }).join('') + '</div>';
  }
  funnel(X, r) {
    const S = X.S;
    const steps = [['Lượt xem', r.views, null], ['Lượt nhấp', r.clicks, ['CTR', r.ctr, S.ctr]], ['Lượt truy cập', r.visits, null], ['Truy cập có thêm giỏ', r.atcV, ['Thêm giỏ', r.atcR, S.atcR]], ['Người mua đặt', r.buyP, ['CR đặt', r.cr, S.cr]], ['Người mua xác nhận', r.buyC, ['CR xác nhận', r.crC, S.crC]]];
    const mx = Math.max(1, r.views);
    return '<div class="hr-fn">' + steps.map(s => {
      const w = s[1] > 0 ? Math.max(2, Math.sqrt(s[1] / mx) * 100) : 0;
      const rt = s[2] ? '<em class="' + (s[2][1] == null ? '' : s[2][1] >= s[2][2] ? 'goodw' : 'badw') + '">' + s[2][0] + ' ' + this.pct(s[2][1], 2) + ' <i>shop ' + this.pct(s[2][2], 2) + '</i></em>' : '<em></em>';
      return '<div class="hr-fr"><span>' + s[0] + '</span><span class="hr-fb"><i style="width:' + w.toFixed(1) + '%"></i></span><b>' + this.num(s[1]) + '</b>' + rt + '</div>';
    }).join('') + '<div class="hr-fnote">Thanh dùng thang căn bậc hai để các bước nhỏ vẫn nhìn thấy được.</div></div>';
  }
  detailHtml(X, r) {
    const S = X.S;
    const lst = r.listings.length ? '<table class="ox-t pp-t hr-lt"><thead><tr><th class="l">Listing</th><th>Đặt</th><th>Xác nhận</th><th>% XN</th><th>Lượt xem</th><th>CTR</th><th>CR</th><th>AOV</th></tr></thead><tbody>' +
      r.listings.map(l => '<tr><td class="l"><b>' + this.esc(l.kind) + '</b><span class="hr-mut"' + this.tipAttr(this.tipT(l.id, [[l.name, '']])) + '> · ' + this.esc(l.name.slice(0, 48)) + '…</span></td><td>' + this.money(l.gP) + '</td><td>' + this.money(l.gC) + '</td><td>' + (l.gP ? this.pct(l.xn, 0) : '—') + '</td><td>' + this.num(l.views) + '</td><td>' + this.pct(l.ctr, 2) + '</td><td>' + this.pct(l.cr, 2) + '</td><td>' + this.money(l.aov) + '</td></tr>').join('') + '</tbody></table>' : '<p class="hr-mut">Không có listing trong file ' + this.mL(X.mo) + '.</p>';
    const kv = (l, v, tip) => '<div' + (tip ? this.tipAttr(this.tipT(l, [[tip, '']])) : '') + '><span>' + l + '</span><b>' + v + '</b></div>';
    const cust = '<div class="hr-kv">' + kv('AOV đặt', this.money(r.aov) + ' <i>shop ' + this.money(S.aov) + '</i>') + kv('Tỷ lệ mua lại', this.pct(r.rep, 2), 'Theo file Shopee, gộp listing theo trọng số người mua') + kv('Click từ tìm kiếm', this.num(r.search) + ' <i>' + this.pct(r.clicks ? r.search / r.clicks : null, 0) + ' lượt nhấp</i>') + kv('Lượt thích', this.num(r.likes)) + kv('Tỷ lệ thoát trang', '<span class="' + (r.bR != null && S.bR && r.bR > S.bR + 0.1 ? 'badw' : '') + '">' + this.pct(r.bR, 0) + '</span> <i>shop ' + this.pct(S.bR, 0) + '</i>') + kv('Ngày sale chiếm', this.pct(r.ss, 0) + ' <i>NMV' + (r.ssOwn ? '' : ', TB nhóm') + '</i>') + kv('NMV Order_data', this.money(r.nmv) + ' <i>' + (r.recon == null ? '' : this.pct(r.recon, 0) + ' doanh số XN') + '</i>', 'NMV là doanh thu thuần sau giảm giá nên thường thấp hơn doanh số xác nhận của Shopee') + '</div>';
    const k = X.kP, mx = Math.max(1, ...r.hist.map(h => h[k] || 0));
    const hist = '<div class="hr-hb" style="grid-template-columns:repeat(' + r.hist.length + ',1fr)">' + r.hist.map((h, i) => { const m = X.H.months[i]; return '<div class="' + (m === X.mo ? 'on' : '') + '"' + this.tipAttr(this.tipT(this.mL(m), [['Đặt/ngày', this.money(h[X.kP])], ['Xác nhận/ngày', this.money(h[X.kC])]])) + '><span class="hr-hbb"><i style="height:' + ((h[X.kP] || 0) / mx * 100).toFixed(1) + '%"></i><i class="c" style="height:' + ((h[X.kC] || 0) / mx * 100).toFixed(1) + '%"></i></span><b>' + this.short(h[X.kP] || 0) + '</b><span>' + this.mL(m) + '</span></div>'; }).join('') + '</div><div class="hr-lgd"><span><i></i>Đặt/ngày</span><span><i class="c"></i>Xác nhận/ngày</span></div>';
    const acts = r.acts.length ? r.acts.map(a => '<li><b>' + this.esc(a[0]) + '</b><span>' + this.esc(a[1]) + '</span></li>').join('') : '<li><b>Chưa có gợi ý</b><span>Các chỉ số không vượt ngưỡng cảnh báo.</span></li>';
    const flags = r.flags.length ? '<div class="hr-flags">' + r.flags.map(f => '<span class="hr-fl">Shopee · ' + this.esc(f.sheet) + (f.price ? ' · giá ' + this.money(f.price) : '') + (f.created ? ' · tạo ' + f.created.slice(6, 8) + '/' + f.created.slice(4, 6) : '') + '</span>').join('') + '</div>' : '';
    return '<div class="hr-det"><div class="hr-dg"><div class="hr-dbox w2"><h4>Listing ' + this.mL(X.mo) + '</h4>' + lst + flags + '</div><div class="hr-dbox"><h4>Xu hướng ' + this.mL(X.H.months[0]) + ' → ' + this.mL(X.H.months[X.H.months.length - 1]) + ' (' + this.vLab() + ')</h4>' + hist + '</div>' +
      '<div class="hr-dbox"><h4>Phễu ' + this.mL(X.mo) + ' so với TB shop</h4>' + this.funnel(X, r) + '</div><div class="hr-dbox"><h4>Khách hàng</h4>' + cust + '</div><div class="hr-dbox hr-act"><h4>Gợi ý hành động</h4><ul>' + acts + '</ul></div></div></div>';
  }
  // ---- Tháng × chỉ số ------------------------------------------------------------------------------------------
  MXROWS() {
    const M = v => this.money(v), N = v => this.num(v), P1 = v => this.pct(v, 1), P2 = v => this.pct(v, 2);
    return [
      ['Doanh số', [['gP', 'Doanh số đặt', M, 'd'], ['gC', 'Doanh số xác nhận', M, 'd'], ['gPd', 'Đặt TB/ngày', M, 'v'], ['gPdN', 'Đặt TB/ngày thường (ước tính)', M, 'v'], ['gCd', 'Xác nhận TB/ngày', M, 'v'], ['gCdN', 'Xác nhận TB/ngày thường (ước tính)', M, 'v'], ['ss', 'Ngày sale chiếm (% NMV)', P1, 'r', 1], ['xn', '% xác nhận / đặt', P1, 'r'], ['share', 'Tỷ trọng shop (đặt)', P1, 'r'], ['shareC', 'Tỷ trọng shop (xác nhận)', P1, 'r']]],
      ['Đơn hàng', [['ordP', 'Đơn đặt', N, 'd'], ['ordC', 'Đơn xác nhận', N, 'd'], ['unitP', 'Sản phẩm bán (đặt)', N, 'd'], ['buyP', 'Người mua đặt', N, 'd'], ['aov', 'AOV đặt', M, 'v'], ['aovC', 'AOV xác nhận', M, 'v']]],
      ['Phễu', [['views', 'Lượt xem', N, 'd'], ['clicks', 'Lượt nhấp', N, 'd'], ['ctr', 'CTR', P2, 'r'], ['visits', 'Lượt truy cập', N, 'd'], ['atcR', 'Tỷ lệ thêm giỏ', P1, 'r'], ['cr', 'CR đặt', P2, 'r'], ['crC', 'CR xác nhận', P2, 'r'], ['bR', 'Tỷ lệ thoát trang', P1, 'r', 1]]],
      ['Khách hàng', [['search', 'Click từ tìm kiếm', N, 'd'], ['likes', 'Lượt thích', N, 'd'], ['rep', 'Tỷ lệ mua lại', P2, 'r']]],
      ['Đối soát', [['nmv', 'NMV Order_data (Shopee)', M, 'd'], ['recon', 'NMV / doanh số xác nhận', P1, 'r']]]
    ];
  }
  spark(vals, cur) {
    const w = 84, h = 22, v = vals.map(x => x == null || !isFinite(x) ? null : x), f = v.filter(x => x != null); if (f.length < 2) return '';
    const mn = Math.min(...f), mx = Math.max(...f), rg = mx - mn || 1, st = w / (v.length - 1);
    let d = '', on = false; v.forEach((x, i) => { if (x == null) { on = false; return; } const px = (i * st).toFixed(1), py = (h - 3 - (x - mn) / rg * (h - 6)).toFixed(1); d += (on ? 'L' : 'M') + px + ' ' + py; on = true; });
    const lx = (v.length - 1) * st, ly = v[v.length - 1] == null ? null : h - 3 - (v[v.length - 1] - mn) / rg * (h - 6);
    return '<svg class="hr-spk" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" aria-hidden="true"><path d="' + d + '" fill="none" stroke="#2563eb" stroke-width="1.6" stroke-linejoin="round"/>' + (ly != null ? '<circle cx="' + lx + '" cy="' + ly.toFixed(1) + '" r="2.4" fill="#141F63"/>' : '') + '</svg>';
  }
  MXMAIN() {
    const M = v => this.money(v), N = v => this.num(v), P1 = v => this.pct(v, 1), P2 = v => this.pct(v, 2), ns = this.state.ns;
    return [
      ['Doanh số', [['gP', 'Doanh số đặt', M, 'd'], ['gC', 'Doanh số xác nhận', M, 'd'], [ns ? 'gPdN' : 'gPd', ns ? 'Đặt TB/ngày thường' : 'Đặt TB/ngày', M, 'v'], ['xn', '% xác nhận / đặt', P1, 'r'], ['share', 'Tỷ trọng shop (đặt)', P1, 'r']]],
      ['Đơn hàng', [['ordP', 'Đơn đặt', N, 'd'], ['aov', 'AOV đặt', M, 'v']]],
      ['Phễu', [['views', 'Lượt xem', N, 'd'], ['ctr', 'CTR', P2, 'r'], ['visits', 'Lượt truy cập', N, 'd'], ['cr', 'CR đặt', P2, 'r']]]
    ];
  }
  mxHtml(X) {
    const H = this.HD, f = X.st.fsel, sk = this.fSkus(f), ms = H.months, A = ms.map(m => this.grp(sk, m)), mi = ms.indexOf(X.mo), cu = A[mi], bms = this.baseMonths(X.mo), B = bms.map(m => A[ms.indexOf(m)]);
    const opt = (v, l) => '<option value="' + this.esc(v) + '"' + (v === f ? ' selected' : '') + '>' + this.esc(l) + '</option>';
    const sel = '<label class="hr-fl2"><span>Phân loại SKU</span><select data-fsel aria-label="Lọc theo phân loại SKU">' + opt('all', 'Tất cả 10 mã') +
      '<optgroup label="Theo nhóm hàng">' + this.CATS.map(c => opt('cat:' + c[0], c[0] + ' (' + c[1].length + ' mã)')).join('') + '</optgroup>' +
      '<optgroup label="Từng SKU">' + H.skus.map(s => opt('sku:' + s, H.short[s])).join('') + '</optgroup></select></label>';
    const bAvg = (k, perDay) => { const v = B.map(o => perDay ? (o[k] || 0) / o.days : o[k]).filter(x => x != null && isFinite(x)); return v.length ? v.reduce((a, x) => a + x, 0) / v.length : null; };
    const cmp = r => {
      const k = r[0], t = r[3], inv = r[4]; if (!B.length) return '<span class="hr-mut">—</span>';
      if (t === 'r') { const a = cu[k], b = bAvg(k, false); if (a == null || b == null || !isFinite(a)) return '<span class="hr-mut">—</span>'; const d = (a - b) * 100; if (Math.abs(d) < 0.005) return '<span class="hr-mut">0 đ%</span>'; const good = inv ? d < 0 : d > 0; return '<span class="' + (Math.abs(d) < 0.05 ? 'hr-mut' : good ? 'goodw' : 'badw') + '">' + (d >= 0 ? '+' : '−') + Math.abs(d).toFixed(Math.abs(d) < 1 ? 2 : 1) + ' đ%</span>'; }
      const a = t === 'd' ? (cu[k] || 0) / cu.days : cu[k], b = bAvg(k, t === 'd');
      return b ? this.dlt(a / b - 1, inv) : '<span class="hr-mut">—</span>';
    };
    const body = this.MXMAIN().map(g => {
      return '<tr class="hr-mxg"><th colspan="' + (ms.length + 3) + '" scope="rowgroup">' + g[0] + '</th></tr>' + (g[1].map(r => {
        const vals = A.map(o => o[r[0]]), per = A.map(o => r[3] === 'd' ? (o[r[0]] || 0) / o.days : o[r[0]]), fin = per.filter(v => v != null && isFinite(v) && v !== 0);
        const best = fin.length > 1 ? (r[4] ? Math.min.apply(null, fin) : Math.max.apply(null, fin)) : null;
        return '<tr><th scope="row" class="l">' + r[1] + '</th><td class="spk">' + this.spark(per) + '</td>' + A.map((o, i) => { const v = vals[i], isB = best != null && per[i] != null && Math.abs(per[i] - best) < 1e-9; const t = r[3] === 'd' ? this.tipAttr(this.tipT(r[1] + ' · ' + this.mL(ms[i]), [['Tổng', r[2](v)], ['TB/ngày (' + o.days + ' ngày)', r[2]((v || 0) / o.days)]])) : ''; return '<td class="' + (i === mi ? 'cur' : '') + (isB ? ' best' : '') + '"' + t + '>' + (v == null || !isFinite(v) ? '—' : r[2](v)) + '</td>'; }).join('') + '<td class="cmp">' + cmp(r) + '</td></tr>';
      }).join(''));
    }).join('');
    const head = '<tr><th scope="col" class="l">Chỉ số</th><th scope="col">Xu hướng<small>' + this.mL(ms[0]) + '→' + this.mL(ms[ms.length - 1]) + '</small></th>' + ms.map(m => '<th scope="col" class="' + (m === X.mo ? 'cur' : '') + '">' + this.mL(m) + '<small>' + H.days[m] + ' ngày</small></th>').join('') + '<th scope="col">' + this.mL(X.mo) + ' vs ' + X.bl + '<small>theo ngày / điểm %</small></th></tr>';
    const note = sk.length === 1 ? 'SKU ' + sk[0] + ' · ' + cu.nL + ' listing trong ' + this.mL(X.mo) : sk.length + ' mã: ' + sk.map(s => s.replace(/^BLU[A-Z]{3}/, '')).join(', ');
    return this.panel('ox-c12', 'Tháng × chỉ số · ' + this.esc(this.fLabel(f)), note + '. Ô chữ xanh là tháng tốt nhất của chỉ số (chỉ số cộng dồn xét theo TB/ngày). Cột so sánh: chỉ số cộng dồn theo TB/ngày, tỷ lệ theo điểm %. Bảng chỉ giữ 11 chỉ số chính; CSV xuất đủ 29 chỉ số.',
      '<div class="hr-mxw"><table class="ox-t pp-t hr-mx"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>', '', '<div class="hr-mxc">' + sel + '<button type="button" class="pp-btn" data-mxcsv>' + this.ic('download') + 'CSV đầy đủ</button></div>');
  }
  mxCsv(X) {
    const H = this.HD, sk = this.fSkus(X.st.fsel), A = H.months.map(m => this.grp(sk, m)), q = v => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const out = [['Bộ lọc: ' + this.fLabel(X.st.fsel)], ['Nhóm', 'Chỉ số'].concat(H.months.map(m => this.mL(m) + ' (' + H.days[m] + ' ngày)'))];
    this.MXROWS().forEach(g => g[1].forEach(r => out.push([g[0], r[1]].concat(A.map(o => { const v = o[r[0]]; return v == null || !isFinite(v) ? '' : r[3] === 'r' ? +v.toFixed(4) : Math.round(v); })))));
    return out.map(r => r.map(q).join(',')).join('\n');
  }
  // ---- Xu hướng -----------------------------------------------------------------------------------------------
  heatHtml(X) {
    const H = this.HD, ms = H.months, key = X.st.hm === 'gP' ? X.kP : X.kC, row = X.st.hs === 'row';
    const grid = H.skus.map(s => ms.map(m => this.grp([s], m)));
    const gmx = Math.max(1, ...[].concat.apply([], grid.map(r => r.map(o => o[key] || 0))));
    const order = X.list.map(r => H.skus.indexOf(r.code));
    const head = '<div></div>' + ms.map(m => '<div class="hr-hh' + (m === X.mo ? ' on' : '') + '">' + this.mL(m) + '</div>').join('');
    const body = order.map(i => { const s = H.skus[i], rmx = Math.max(1, ...grid[i].map(o => o[key] || 0)), mx = row ? rmx : gmx; return '<div class="hr-hn">' + this.esc(H.short[s]) + '</div>' + grid[i].map((o, j) => { const v = o[key] || 0, a = v / mx, prev = j ? grid[i][j - 1][key] : null, d = prev ? v / prev - 1 : null; return '<div class="hr-hc' + (a > 0.55 ? ' dk' : '') + (!o.exists ? ' na' : v === 0 ? ' z' : '') + '" style="background:rgba(37,99,235,' + (v ? (0.08 + a * 0.82).toFixed(3) : 0) + ')"' + this.tipAttr(this.tipT(H.short[s] + ' · ' + this.mL(ms[j]), [[(X.st.hm === 'gP' ? 'Đặt' : 'Xác nhận') + '/ngày', this.money(v)], ['Ngày sale chiếm', this.pct(o.ss, 0)], d != null ? ['So tháng trước', this.signedPct(d, 0)] : null])) + '>' + (!o.exists ? '·' : v ? this.short(v) : '0') + '</div>'; }).join(''); }).join('');
    const tg = '<div class="hr-tg" role="group" aria-label="Chỉ số heatmap"><button type="button" class="ok-chip' + (X.st.hm === 'gP' ? ' on' : '') + '" data-hm="gP">Đặt/ngày</button><button type="button" class="ok-chip' + (X.st.hm === 'gC' ? ' on' : '') + '" data-hm="gC">Xác nhận/ngày</button></div><div class="hr-tg" role="group" aria-label="Thang màu"><button type="button" class="ok-chip' + (!row ? ' on' : '') + '" data-hs="all">So cả nhóm</button><button type="button" class="ok-chip' + (row ? ' on' : '') + '" data-hs="row">So trong từng SKU</button></div>';
    return this.panel('ox-c7', 'Heatmap doanh số TB/ngày · SKU × tháng', (row ? 'Màu so trong từng dòng: ô đậm nhất là tháng mạnh nhất của chính SKU.' : 'Màu so trên cả nhóm.') + ' Doanh số ' + this.vLab() + '. Dấu · là tháng chưa mở bán.', '<div class="hr-hmw"><div class="hr-hm" style="--hn:' + ms.length + '">' + head + body + '</div></div>', '', '<div class="hr-tgw">' + tg + '</div>');
  }
  shareHtml(X) {
    const H = this.HD, rows = H.months.map(m => { const o = this.grp(H.skus, m), sh = H.shop[m]; return { m, p: o.share || 0, c: o.shareC || 0, gP: o.gP, gC: o.gC, sP: sh.gP, sC: sh.gC }; });
    const mx = Math.max(0.05, ...rows.map(r => Math.max(r.p, r.c))) * 1.1;
    return this.panel('ox-c5', 'Tỷ trọng 10 Super Hero trên shop', 'Doanh số của 10 mã / tổng doanh số shop Shopee, theo tháng',
      '<div class="hr-sh">' + rows.map(r => '<div class="hr-shr' + (r.m === X.mo ? ' on' : '') + '"' + this.tipAttr(this.tipT(this.mL(r.m), [['10 mã · đặt', this.money(r.gP), '#2563eb'], ['Shop · đặt', this.money(r.sP)], ['10 mã · xác nhận', this.money(r.gC), '#12b981'], ['Shop · xác nhận', this.money(r.sC)]])) + '><span class="hr-shm">' + this.mL(r.m) + '</span><div class="hr-shb"><span><i style="width:' + (r.p / mx * 100).toFixed(1) + '%"></i><b>' + this.pct(r.p, 1) + '</b></span><span class="c"><i style="width:' + (r.c / mx * 100).toFixed(1) + '%"></i><b>' + this.pct(r.c, 1) + '</b></span></div></div>').join('') + '</div><div class="hr-lgd"><span><i></i>Đặt</span><span><i class="c"></i>Xác nhận</span></div>');
  }
  csv(X) {
    const h = ['Hạng', 'SKU', 'Tên', 'Sức khỏe', 'Lý do', 'Số listing', 'Doanh số đặt', 'Doanh số xác nhận', 'Đặt/ngày (' + this.vLab() + ')', 'Xác nhận/ngày (' + this.vLab() + ')', '% xác nhận', 'Đặt/ngày vs ' + X.bl, 'Ngày sale chiếm (% NMV)', 'Tỷ trọng shop (đặt)', 'Lượt xem', 'Lượt nhấp', 'CTR', 'Lượt truy cập', 'Thêm giỏ (truy cập)', 'CR đặt', 'CR xác nhận', 'AOV đặt', 'Tỷ lệ thoát', 'Click tìm kiếm', 'Lượt thích', 'Tỷ lệ mua lại', 'NMV Order_data (Shopee)', 'Gợi ý'];
    const q = v => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }, f = v => v == null || !isFinite(v) ? '' : +v.toFixed(4);
    const L = X.list.map(r => [r.rank, r.code, r.name, r.lvlT, r.reasons.map(x => x[0]).join('; '), r.listings.length, Math.round(r.gP), Math.round(r.gC), Math.round(r.v || 0), Math.round(r.vC || 0), f(r.xn), f(r.mom), f(r.ss), f(r.share), r.views, r.clicks, f(r.ctr), r.visits, r.atcV, f(r.cr), f(r.crC), Math.round(r.aov || 0), f(r.bR), r.search, r.likes, f(r.rep), Math.round(r.nmv), (r.acts || []).map(a => a[0]).join('; ')]);
    return [h].concat(L).map(r => r.map(q).join(',')).join('\n');
  }
/*HR_CSS0*/
  HR_CSS() {
    const o = this.HR_CSS0(), k = o.indexOf('</style>');
    return o.slice(0, k) +
      '.hr-ctl{row-gap:10px}.hr-g2{align-items:center}.hr-gl{font-size:12.5px;color:var(--ox-mut);margin-right:2px}' +
      '.hr-sw{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:99px;border:1px solid #cfdcf5;background:rgba(255,255,255,.8);font:inherit;font-size:13px;font-weight:600;color:#0f1b3a;cursor:pointer}.hr-sw i{position:relative;width:28px;height:16px;border-radius:99px;background:#c9d4ea;transition:background .15s}.hr-sw i::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff;transition:left .15s}.hr-sw.on i{background:#141F63}.hr-sw.on i::after{left:14px}.hr-sw:focus-visible{outline:2px solid #2f6df0;outline-offset:2px}' +
      '.hr-tabs{display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center;margin-top:10px;border-top:1px solid #dbe7fb;padding-top:8px}.hr-tab{padding:7px 14px;border:0;border-radius:10px;background:none;font:inherit;font-size:14px;font-weight:600;color:var(--ox-mut);cursor:pointer}.hr-tab.on{background:#fff;color:#141F63;box-shadow:0 1px 0 #dbe7fb,inset 0 -2px 0 #141F63}.hr-tab:focus-visible{outline:2px solid #2f6df0}.hr-tabs .hr-scope{margin-left:auto}' +
      '.hr-h.b{background:#e3edff;color:#1f4fbf}.hr-mc.b{border-left:4px solid #2f6df0}.hr-dot.b{background:#2f6df0}' +
      '.hr-agw{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin-bottom:16px}.hr-ag{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:16px;background:#fff5f7;border:1px solid #f3c6cf}.hr-ag.y{background:#fffaf0;border-color:#f2dca6}.hr-ag.b{background:#f2f7ff;border-color:#c9dbfb}.hr-agh{display:flex;align-items:center;gap:8px;font-size:13.5px;color:#0b1530}.hr-agn{margin-left:auto;font-size:12px;color:var(--ox-mut)}.hr-agl{display:flex;flex-wrap:wrap;gap:6px}.hr-agl button{padding:3px 10px;border-radius:99px;border:1px solid #cfdcf5;background:#fff;font:inherit;font-size:12.5px;font-weight:700;color:#0f1b3a;cursor:pointer}.hr-agl button:hover,.hr-agl button:focus-visible{border-color:#2f6df0;outline:none}.hr-ags{font-size:12.5px;color:var(--ox-mut)}' +
      '.hr-cw{display:flex;flex-direction:column;gap:6px}.hr-cr{display:grid;grid-template-columns:minmax(150px,240px) 1fr 72px;gap:10px;align-items:center;font-size:13px;cursor:help}.hr-crn{color:#0f1b3a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hr-crb{position:relative;height:16px}.hr-crb em{position:absolute;left:50%;top:-3px;bottom:-3px;width:1px;background:#9fb3d9}.hr-crb i{position:absolute;top:0;bottom:0;border-radius:4px}.hr-crb i.p{background:#12b981}.hr-crb i.n{background:#e86a80}.hr-cr b{text-align:right;font-variant-numeric:tabular-nums}' +
      '.hr-t td small{display:block;font-size:11px;font-weight:400;color:var(--ox-mut)}.hr-lk{border:0;background:none;padding:0;font:inherit;font-size:12px;font-weight:600;color:#2f6df0;cursor:pointer;text-decoration:underline;text-underline-offset:2px}.hr-lk:focus-visible{outline:2px solid #2f6df0}.hr-dag{color:#2f6df0;font-size:10px;margin-left:1px}.hr-mlk{padding:0 12px 10px}' +
      '.hr-mx td.spk{padding:4px 8px!important}.hr-spk{display:block;margin-left:auto}.hr-mx thead th.cur{color:#141F63}.hr-mx tr.hr-mxg th button{border:0;background:none;font:inherit;font-weight:700;color:#2f6df0;cursor:pointer;padding:0}.hr-mx tr.hr-mxg th small{font-weight:400;color:var(--ox-mut);margin-left:4px}' +
      '.hr-t{border-collapse:separate;border-spacing:0;width:100%}.hr-t thead th{background:#eef3fc!important;color:#41507a;font-size:12.5px!important;font-weight:600;border-bottom:1px solid #d5e1f6;white-space:nowrap}.hr-t thead tr.hr-th1 th{padding:10px 10px 4px!important;vertical-align:bottom}.hr-t thead tr.hr-th1 th.g{text-align:center;color:#141F63;font-weight:700;border-bottom:2px solid #c5d5f3}.hr-t thead tr.hr-th1 th.g small{display:block;font-weight:400;font-size:11px;color:var(--ox-mut)}.hr-t thead tr.hr-th2 th{padding:6px 10px 8px!important;text-align:right}.hr-t thead th button{color:inherit;font-weight:600}.hr-t thead th[aria-sort] button,.hr-t thead th button[aria-sort=ascending],.hr-t thead th button[aria-sort=descending]{color:#141F63}' +
      '.hr-t .gs{border-left:1px solid #dbe5f7}.hr-t thead th.gs{border-left:1px solid #d5e1f6}.hr-t tbody tr.hr-r:nth-child(4n+1) td{background:#fbfdff}.hr-t tbody tr.hr-r td{border-bottom:1px solid #edf2fb;vertical-align:middle}.hr-t td{padding:10px!important}.hr-t col.c-rk{width:44px}.hr-t col.c-sku{width:250px}.hr-t col.c-h{width:110px}.hr-t td.hr-rk{font-size:13px}' +
      '.hr-mx{border-collapse:separate;border-spacing:0}.hr-mx thead th{background:#eef3fc!important;color:#41507a;font-weight:600;border-bottom:2px solid #c5d5f3;white-space:nowrap}.hr-mx thead th.cur{background:#e2ebfb!important}.hr-mx tbody tr:not(.hr-mxg):nth-child(even) td,.hr-mx tbody tr:not(.hr-mxg):nth-child(even) th.l{background:#fbfdff}.hr-mx tbody td,.hr-mx tbody th.l{border-bottom:1px solid #edf2fb}.hr-mx th.l{min-width:190px}.hr-mx td.cmp,.hr-mx thead th:last-child{border-left:2px solid #c5d5f3;background:#f6f9ff}' +
      '.hr-mxc{flex-wrap:nowrap;justify-content:flex-end}.hr-fl2>span{white-space:nowrap}.hr-fl2 select{min-width:210px}.hr-t thead tr.hr-th2 th{white-space:nowrap}' +
      '.hr-top{margin-bottom:18px;grid-template-rows:auto 1fr!important}.hr-top .ox-hero{grid-row:span 2;grid-column:auto}.hr-topal{grid-column:2 / -1;min-width:0}.hr-topal .hr-agw{margin:0;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}.hr-top .ox-cv small.hr-cvs{font-size:15px;font-weight:600;color:var(--ox-mut);letter-spacing:0}.hr-top .ox-hv{font-size:clamp(40px,3.6vw,54px)}' +
      '.hr-hbars{display:flex;gap:6px;align-items:flex-end;height:70px;padding:6px 2px 0}.hr-hbars>div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:3px;cursor:help}.hr-hbars i{display:block;width:70%;max-width:26px;min-height:2px;border-radius:6px 6px 2px 2px;background:rgba(47,109,240,.35)}.hr-hbars .on i{background:#2f6df0}.hr-hbars span{font-size:10.5px;color:var(--ox-mut)}.hr-hbars .on span{color:#0b1530;font-weight:700}' +
      '@media (max-width:1280px){.hr-top{grid-template-columns:repeat(2,minmax(0,1fr))!important}.hr-top .ox-hero{grid-column:1 / -1;grid-row:auto}.hr-topal{grid-column:1 / -1}}' +
      '.ox .hr-hm{grid-template-columns:minmax(140px,1.5fr) repeat(var(--hn,4),minmax(52px,1fr))!important;min-width:560px}' +
      '.ox .hr-hb{display:flex!important;gap:6px}.ox .hr-hb>div{flex:1 1 0;min-width:0}' +
      '.hr-tgw{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}.hr-hc.na{background:#f4f6fa!important;color:#a3acc0}' +
      '@media (max-width:700px){.hr-tabs .hr-scope{margin-left:0;flex-basis:100%}.hr-cr{grid-template-columns:110px 1fr 56px;font-size:12px}.hr-g2{flex-basis:100%}}' +
      o.slice(k);
  }
  notesHtml(X) {
    return '<div class="hr-notes"><b>Nguồn và cách tính</b><ul>' +
      '<li>Nguồn: Shopee "Hiệu quả sản phẩm" (parentskudetail) trong thư mục SKU Shopee Performance, T' + X.H.months[0] + ' đến T' + X.H.months[X.H.months.length - 1] + (X.H.pm ? ', riêng ' + this.mL(X.H.pm) + ' mới có ' + this.pLab(X.H.pm) : '') + '. Chỉ tính dòng sản phẩm cha, gộp các listing cùng "SKU sản phẩm".</li>' +
      '<li>Ngày sale: ngày có NMV Shopee (Order_data, đơn không hủy) ≥ 3 lần trung vị ngày trong tháng. Doanh số/ngày thường (ước tính) = doanh số Shopee × (1 − tỷ trọng NMV ngày sale của mã trong Order_data) / số ngày thường. Mã có dưới 15 đơn trong Order_data hoặc NMV dưới 20% doanh số xác nhận dùng tỷ trọng chung của 10 mã (†), vì vài đơn rơi vào ngày sale có thể làm lệch số.</li>' +
      '<li>So sánh: "Tháng trước" hoặc "TB 3 tháng trước" (trung bình doanh số/ngày của 3 tháng liền trước). Tỷ lệ so bằng điểm %.</li>' +
      '<li>CTR = lượt nhấp / lượt xem. CR = người mua đặt hàng / lượt truy cập. Thêm giỏ = lượt truy cập có thêm giỏ / lượt truy cập. AOV = doanh số đặt / đơn đặt.</li>' +
      '<li>Sức khỏe: <b>Báo động</b> khi doanh số về 0 hoặc doanh số đặt/ngày giảm từ 30% so với mốc. <b>Cần theo dõi</b> khi tỷ lệ xác nhận dưới 70% hoặc Shopee gắn cờ giá không cạnh tranh. <b>Mã mới</b> là tháng đầu tiên mã có listing, không tính vào báo động. <b>Chưa mở bán</b> khi tháng đó chưa có listing.</li>' +
      '<li>Gợi ý hành động theo luật: CTR dưới 70% TB shop → đổi ảnh bìa; thêm giỏ ≥ shop nhưng CR dưới 70% shop → xem giá và voucher; xác nhận dưới 70% → rà đơn hủy; thoát trang cao hơn shop 10 điểm % → cải thiện trang; ngày sale chiếm từ 60% NMV → chạy đều ngày thường; tăng từ 30% → giữ đà. Tối đa 2 gợi ý mỗi mã.</li>' +
      '<li>Cờ Shopee là trạng thái Shopee gắn lúc xuất file gần nhất (' + X.H.exportDate + '), không theo từng tháng. NMV Order_data là doanh thu thuần đơn không hủy, đã trừ giảm giá nên thấp hơn doanh số xác nhận của Shopee.</li>' +
      '<li>Ảnh lấy từ thư mục Product_images trên Drive.</li></ul></div>';
  }
  paintHR() {
    const root = document.getElementById('hrx'); if (!root) return false;
    if (!root._ok) {
      root._ok = 1;
      const tog = c => this.setState({ open: Object.assign({}, this.state.open, { [c]: !this.state.open[c] }) });
      root.addEventListener('click', ev => {
        const T = ev.target.closest ? ev.target : null; if (!T) return; const q = s => T.closest(s), st = this.state; let e;
        if ((e = q('[data-mo]'))) { this.setState({ mo: +e.getAttribute('data-mo') }); return; }
        if ((e = q('[data-tab]'))) { this.setState({ tab: e.getAttribute('data-tab') }); return; }
        if ((e = q('[data-base]'))) { this.setState({ base: e.getAttribute('data-base') }); return; }
        if (q('[data-ns]')) { this.setState({ ns: !st.ns }); return; }
        if ((e = q('[data-hm]'))) { this.setState({ hm: e.getAttribute('data-hm') }); return; }
        if ((e = q('[data-hs]'))) { this.setState({ hs: e.getAttribute('data-hs') }); return; }
        if ((e = q('[data-mxg]'))) { const g = e.getAttribute('data-mxg'); this.setState({ mxOpen: Object.assign({}, st.mxOpen, { [g]: !st.mxOpen[g] }) }); return; }
        if (q('[data-mxall]')) { const all = this.MXROWS().every(g => st.mxOpen[g[0]]), o = {}; this.MXROWS().forEach(g => { o[g[0]] = !all; }); this.setState({ mxOpen: o }); return; }
        if ((e = q('[data-mxsku]'))) { ev.stopPropagation(); this.setState({ fsel: 'sku:' + e.getAttribute('data-mxsku'), tab: 'mx' }); setTimeout(() => { const p = root.querySelector('.hr-mx'); if (p && p.closest('.ox-panel')) p.closest('.ox-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80); return; }
        if (q('[data-mxcsv]')) { const X = this.calc(); const f = X.st.fsel.replace(/^(cat|sku):/, '').replace(/\s+/g, '-'); this.download('super-hero-thang-x-chi-so-' + f + '.csv', this.mxCsv(X)); return; }
        if ((e = q('[data-sort]'))) { const k = e.getAttribute('data-sort'); this.setState(st.sort === k ? { dir: -st.dir } : { sort: k, dir: -1 }); return; }
        if ((e = q('[data-goto]'))) { const c = e.getAttribute('data-goto'); this.setState({ tab: 'ov', open: Object.assign({}, st.open, { [c]: true }) }); setTimeout(() => { const a = document.getElementById('hr-' + c), b = document.getElementById('hrm-' + c), el = a && a.offsetParent !== null ? a : b; if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80); return; }
        if (q('.hr-dx') || q('.hr-det')) return;
        if ((e = q('[data-ex]'))) { tog(e.getAttribute('data-ex')); return; }
        if (q('[data-print]')) { try { window.print(); } catch (x) { this.toast('Không mở được hộp thoại in, hãy dùng Ctrl/Cmd + P'); } return; }
        if (q('[data-csv]')) { const X = this.calc(); this.download('top-super-hero-sku-T' + X.mo + '-2026.csv', this.csv(X)); return; }
      });
      root.addEventListener('change', ev => { const e = ev.target.closest && ev.target.closest('[data-fsel]'); if (e) this.setState({ fsel: e.value }); });
      root.addEventListener('keydown', ev => { const r = ev.target.closest && ev.target.closest('tr[data-ex]'); if (r && ev.target === r && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); tog(r.getAttribute('data-ex')); } });
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
    const X = this.calc(), tab = X.st.tab;
    const main = tab === 'mx' ? this.mxHtml(X) : tab === 'tr' ? '<div class="hr-grid">' + this.heatHtml(X) + this.shareHtml(X) + '</div>' : this.heroHtml(X) + this.tableHtml(X) + '<div class="hr-sp16"></div>' + this.contribHtml(X);
    const html = this.HR_CSS() + '<div class="ox"><div class="hr-sticky">' + this.ctlHtml(X) + '</div>' + main + this.notesHtml(X) + '</div>';
    if (root._h !== html) { root._h = html; root.innerHTML = html; }
    const tw = root.querySelector('.hr-tw'); if (tw && tw.clientWidth > 0) root.style.setProperty('--hr-dw', tw.clientWidth + 'px'); else root.style.removeProperty('--hr-dw');
    return true;
  }
  renderVals() {
    const R = React.createElement;
    clearTimeout(this._pt); let tries = 0;
    const go = () => { try { if (!this.paintHR() && tries++ < 40) this._pt = setTimeout(go, 100); } catch (e) { console.error('hero paint', e); } };
    this._pt = setTimeout(go, 0);
    const mo = this.state.mo;
    return {
      navItems: __NAV__,
      railFooter: R('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' } },
        R('div', { style: { fontSize: 12, letterSpacing: 'var(--tracking-kicker)', textTransform: 'uppercase', color: 'var(--text-faint)' } }, 'Current period'),
        R('div', { className: 'tabular', style: { fontSize: 14.5, color: 'var(--text-secondary)' } }, 'T' + mo + '/2026' + (mo === this.HD.pm ? ' · ' + this.pLab(mo, false) : ' · cả tháng')),
        R('div', { style: { fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.4 } }, 'Nguồn: Shopee · thư mục SKU Shopee Performance')),
      headerSubtitle: '10 mã Super Hero trên Shopee · doanh số đặt và xác nhận, phễu, sức khỏe và gợi ý · T' + mo + '/2026' + (mo === this.HD.pm ? ' (' + this.pLab(mo) + ')' : '')
    };
  }
}
