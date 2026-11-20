
  // =====================================================================
  //  OVERVIEW REWORK — hero NMV vs KPI, 12 cards, 10 charts, channel table
  // =====================================================================
  ovcat() { return /*OVCAT*/null; }
  esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  ytdScope() { return this.state.gran === 'ytd' || this.monthKey() === 'ytd'; }
  nextDay(iso) { return new Date(Date.parse(iso + 'T00:00:00Z') + 864e5).toISOString().slice(0, 10); }
  kpiGroup(key) { return key === 'Harasocial' || key === 'Website' ? 'Website/Social' : key; }
  dk(m) {
    const DK = window.BSDailyKpiFor ? window.BSDailyKpiFor(m) : null;
    return DK && DK.days && DK.days.length && +DK.days[0].date.slice(5, 7) === m ? DK : null;
  }
  tgt(m) { return (((window.BSTARGETS || {}).months || {})[m]) || null; }

  // KPI NMV of month m (whole month + the part that should be done by the last data day).
  kpiNmv(m, group) {
    const DK = this.dk(m), T = this.tgt(m);
    let total = null;
    if (group) total = DK && DK.ch && DK.ch[group] ? DK.ch[group].nmv : (T && T.ch && T.ch[group] ? T.ch[group].nmv : null);
    else { const P = this.planOf(m); total = P && P.nmv != null ? P.nmv : null; }
    if (total == null) return null;
    const dim = this.daysIn(m), lm = this.lastMonth();
    const n = m === lm ? this.lastDay() : (m > lm ? 0 : dim);
    const arr = DK ? (group ? (DK.ch && DK.ch[group] && DK.ch[group].days) : DK.days.map(d => d.nmv)) : null;
    const toDate = arr && arr.length ? arr.slice(0, n).reduce((s, v) => s + (v || 0), 0) : total * n / dim;
    return { total: total, toDate: toDate, dim: dim, n: n };
  }
  kpiScope(group) {
    const m = this.monthNum(), from = this.ytdScope() ? 1 : m;
    let total = 0, toDate = 0, have = false;
    for (let k = from; k <= m; k++) { const r = this.kpiNmv(k, group); if (!r) continue; have = true; total += r.total; toDate += r.toDate; }
    return have ? { total: total, toDate: toDate } : null;
  }
  cirTargetOf(group) {
    const m = this.monthNum();
    if (group) {
      const DK = this.dk(m), T = this.tgt(m);
      const c = DK && DK.ch && DK.ch[group] && DK.ch[group].cir != null ? DK.ch[group].cir : (T && T.ch && T.ch[group] ? T.ch[group].cir : null);
      return c > 0 ? c : null;
    }
    if (this.ytdScope()) { const t = this.target('cir', this.agg(this.scopeRows())); return t ? t.value : null; }
    const p = this.planOf(m); return p && p.cir ? p.cir : null;
  }
  spendGaps() {
    const D = this.D(), m = this.monthNum();
    const end = this.ytdScope() || m === this.lastMonth() ? this.lastIso() : '2026-' + String(m).padStart(2, '0') + '-' + String(this.daysIn(m)).padStart(2, '0');
    return D.channels.filter(c => c.spendable && c.spendLast && c.spendLast < end).map(c => ({
      key: c.key, name: (c.name.split('· ')[1] || c.name), from: this.dayLabel(this.nextDay(c.spendLast)) }));
  }
  warnBadge() { return ''; }
  isOpen(k) { return !(this._fold && this._fold[k]); }
  foldBtn(k) { const o = this.isOpen(k); return '<button type="button" class="ox-fold" data-fold="' + k + '" aria-expanded="' + o + '"><span class="ox-ft">' + (o ? 'Thu gọn' : 'Mở rộng') + '</span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>'; }
  warnBanner(names) {
    const g = this.spendGaps();
    if (!g.length) return '';
    const li = (t, d) => '<li><b>' + t + '</b><span>' + d + '</span></li>';
    return '<div class="ox-banner' + (this.isOpen('banner') ? '' : ' ox-closed') + '" data-fbox="banner"><span class="ox-bi">⚠</span><div class="ox-ww"><div class="ox-wh"><b class="ox-wt">Chi phí chưa đầy đủ — CIR, ROAS, CPO cần đọc thận trọng</b><span class="ox-wsum">' + g.length + ' kênh thiếu Spend</span>' + this.foldBtn('banner') + '</div><ul class="ox-wl">' +
      g.map(x => li(this.esc(x.name) + ' thiếu Spend từ ' + this.esc(x.from), 'Chi phí quảng cáo của kênh này sau mốc đó chưa có trong file Spend nên không tính được CIR kênh.')).join('') +
      li('Thẻ CIR, ROAS, CPO', 'Chỉ tính trên kênh có Spend đầy đủ (' + this.esc(names) + '), nên không bị kéo lệch bởi phần thiếu.') +
      li('CIR theo tháng và bảng kênh', 'Tính trên toàn bộ NMV nhưng thiếu một phần Spend nên thấp hơn thực tế.') +
      li('Cách xử lý', 'Bổ sung chi phí Facebook, Google vào file Spend để số liệu được tính lại đầy đủ.') +
      '</ul></div></div>';
  }
  tipCh(title, by, tot, kpi) {
    const rows = by.filter(x => x.a.nmv > 0).sort((a, b) => b.a.nmv - a.a.nmv).map(x => '<div class="ox-tr"><i style="background:' + x.ch.fill + '"></i><span>' + this.esc(x.ch.name) + '</span><b>' + this.money(x.a.nmv) + '</b><em>' + this.pct(tot ? x.a.nmv / tot : 0, 1) + '</em></div>').join('');
    return '<div class="ox-tt">' + this.esc(title) + '</div>' + rows + '<div class="ox-tr tot"><span>Tổng NMV</span><b>' + this.money(tot) + '</b><em></em></div>' +
      (kpi ? '<div class="ox-tr kpi"><span>KPI NMV</span><b>' + this.money(kpi) + '</b><em>' + this.pct(tot / kpi, 0) + '</em></div>' : '');
  }
  axT(x, t) { return '<text x="' + x + '" y="12" class="ox-axt">' + this.esc(t) + '</text>'; }
  tipAttr(html) { return ' data-tip="' + this.esc(html) + '"'; }
  niceMax(v) {
    if (!(v > 0)) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }
  short(v) { // axis money, no currency sign
    const a = Math.abs(v);
    if (a >= 1e9) return +(v / 1e9).toFixed(2) + 'B';
    if (a >= 1e6) return +(v / 1e6).toFixed(0) + 'M';
    if (a >= 1e3) return +(v / 1e3).toFixed(0) + 'K';
    return String(Math.round(v));
  }
  panel(cls, title, sub, body, foot, right) {
    return '<div class="ox-panel ' + cls + '"><div class="ox-ph"><div><div class="ox-pt">' + title + '</div>' +
      (sub ? '<div class="ox-ps">' + sub + '</div>' : '') + '</div><div class="ox-pr">' + (right || '') + '</div></div>' +
      body + (foot ? '<div class="ox-foot">' + foot + '</div>' : '') + '</div>';
  }
  legend(items) {
    return '<div class="ox-leg">' + items.map(i => '<span><i style="background:' + i.c + (i.line ? ';height:3px;margin-top:5px' : '') + '"></i>' + this.esc(i.t) + '</span>').join('') + '</div>';
  }
  monthStats() {
    const lm = this.lastMonth(), out = [];
    for (let m = 1; m <= lm; m++) out.push({ m: m, a: this.agg(this.pick({ month: m })), plan: this.planOf(m) });
    return out;
  }

  // ---- chart 1: NMV & Spend by month -----------------------------------------------------
  chMonthly() {
    const ms = this.monthStats(), W = 660, H = 280, L = 52, R = 14, T = 22, B = 34, sel = this.monthNum(), ytd = this.ytdScope();
    const maxN = this.niceMax(Math.max.apply(null, ms.map(x => Math.max(x.a.nmv, (x.plan && x.plan.nmv) || 0)).concat([1])));
    const pw = W - L - R, ph = H - T - B, bw = pw / ms.length;
    const X = i => L + bw * i + bw / 2, YN = v => T + ph - (v / maxN) * ph;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">' + this.axT(L, 'NMV (₫) · mỗi cột = 1 tháng');
    for (let i = 0; i <= 4; i++) {
      const y = T + ph - ph * i / 4;
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/>' +
        '<text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + this.short(maxN * i / 4) + '</text>';
    }
    ms.forEach((x, i) => {
      const part = this.isPartial(x.m), on = !ytd && x.m === sel, bwid = bw * 0.54, h = ph * x.a.nmv / maxN;
      const byM = this.byChannel(this.pick({ month: x.m }));
      s += '<g data-m="' + x.m + '" class="ox-hit"' + this.tipAttr(this.tipCh('T' + x.m + (part ? '* (dở)' : '') + ' · NMV theo kênh', byM, x.a.nmv, x.plan && x.plan.nmv)) + '>' +
        '<rect x="' + (X(i) - bw / 2) + '" y="' + T + '" width="' + bw + '" height="' + ph + '" class="ox-hov"/>' +
        (on ? '<rect x="' + (X(i) - bw / 2 + 2) + '" y="' + T + '" width="' + (bw - 4) + '" height="' + ph + '" class="ox-sel"/>' : '') +
        '<rect x="' + (X(i) - bwid / 2) + '" y="' + (T + ph - h) + '" width="' + bwid + '" height="' + Math.max(h, 0) + '" fill="url(#oxg)"' +
        (part ? ' opacity="0.55" stroke="#2f6df0" stroke-dasharray="3 2"' : '') + '></rect>' +
        '<text x="' + X(i) + '" y="' + (T + ph - h - 5) + '" text-anchor="middle" class="ox-val">' + this.short(x.a.nmv) + '</text>' +
        '<text x="' + X(i) + '" y="' + (H - 12) + '" text-anchor="middle" class="ox-ax' + (on ? ' ox-axon' : '') + '">T' + x.m + (part ? '*' : '') + '</text></g>';
      if (x.plan && x.plan.nmv) s += '<line x1="' + (X(i) - bw * 0.36) + '" x2="' + (X(i) + bw * 0.36) + '" y1="' + YN(x.plan.nmv) + '" y2="' + YN(x.plan.nmv) + '" stroke="var(--kpi-mark)" stroke-width="2.5"><title>KPI NMV T' + x.m + ' ' + this.money(x.plan.nmv) + '</title></line>';
    });
    s += '</svg>';
    const lm = this.lastMonth();
    return this.panel('ox-c7', 'NMV theo tháng so với KPI',
      'T1–T' + lm + '/2026' + (this.isPartial(lm) ? ' · T' + lm + '* là tháng dở (' + this.lastDay() + '/' + this.daysIn(lm) + ' ngày)' : '') + ' · bấm cột để chọn tháng',
      s, 'Cột = NMV · vạch cyan = KPI NMV của tháng.',
      this.legend([{ c: 'var(--series-nmv)', t: 'Cột = NMV thực tế' }, { c: 'var(--kpi-mark)', t: 'Vạch = KPI NMV tháng', line: 1 }]) + this.warnBadge());
  }

  // ---- chart 2: CIR by month vs KPI CIR --------------------------------------------------
  chCirMonth() {
    const ms = this.monthStats(), W = 470, H = 270, L = 40, R = 14, T = 22, B = 34, sel = this.monthNum(), ytd = this.ytdScope();
    const vals = ms.map(x => x.a.cir || 0).concat(ms.map(x => (x.plan && x.plan.cir) || 0));
    const maxV = this.niceMax(Math.max.apply(null, vals.concat([0.05])) * 1.1);
    const pw = W - L - R, ph = H - T - B, step = pw / ms.length;
    const X = i => L + step * i + step / 2, Y = v => T + ph - (v / maxV) * ph;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">' + this.axT(L, 'CIR (%) = Spend / NMV');
    for (let i = 0; i <= 4; i++) {
      const y = T + ph - ph * i / 4;
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + (maxV * i / 4 * 100).toFixed(0) + '%</text>';
    }
    const bwid = step * 0.52;
    ms.forEach((x, i) => {
      const over = x.plan && x.plan.cir && x.a.cir > x.plan.cir, on = !ytd && x.m === sel, part = this.isPartial(x.m), h = ph * (x.a.cir || 0) / maxV;
      s += '<g data-m="' + x.m + '" class="ox-hit"' + this.tipAttr('<div class="ox-tt">T' + x.m + (part ? '* (dở)' : '') + ' · CIR</div><div class="ox-tr"><span>CIR thực tế</span><b>' + this.pct(x.a.cir, 2) + '</b><em></em></div>' + (x.plan && x.plan.cir ? '<div class="ox-tr kpi"><span>KPI CIR</span><b>' + this.pct(x.plan.cir, 2) + '</b><em>' + (over ? 'vượt' : 'đạt') + '</em></div>' : '')) + '>' +
        '<rect x="' + (X(i) - step / 2) + '" y="' + T + '" width="' + step + '" height="' + ph + '" class="ox-hov"/>' +
        (on ? '<rect x="' + (X(i) - step / 2 + 2) + '" y="' + T + '" width="' + (step - 4) + '" height="' + ph + '" class="ox-sel"/>' : '') +
        '<rect x="' + (X(i) - bwid / 2) + '" y="' + (T + ph - h) + '" width="' + bwid + '" height="' + Math.max(h, 0) + '" rx="5" fill="' + (over ? '#ff7a8a' : 'url(#oxg)') + '"' + (part ? ' opacity="0.55" stroke="#2f6df0" stroke-dasharray="3 2"' : '') + '></rect>' +
        '<text x="' + X(i) + '" y="' + (T + ph - h - 5) + '" text-anchor="middle" class="ox-val' + (over ? ' ox-bad' : '') + '">' + ((x.a.cir || 0) * 100).toFixed(1) + '</text>' +
        '<text x="' + X(i) + '" y="' + (H - 12) + '" text-anchor="middle" class="ox-ax' + (on ? ' ox-axon' : '') + '">T' + x.m + (part ? '*' : '') + '</text></g>';
    });
    const tp = ms.filter(x => x.plan && x.plan.cir);
    if (tp.length) s += '<polyline fill="none" stroke="var(--kpi-mark)" stroke-width="2.6" stroke-linejoin="round" pointer-events="none" points="' + tp.map(x => X(x.m - 1) + ',' + Y(x.plan.cir)).join(' ') + '"/>' +
      tp.map(x => '<circle cx="' + X(x.m - 1) + '" cy="' + Y(x.plan.cir) + '" r="3.6" fill="#fff" stroke="var(--kpi-mark)" stroke-width="2.2" pointer-events="none"/>').join('');
    s += '</svg>';
    const over = ms.filter(x => !this.isPartial(x.m) && x.plan && x.plan.cir && x.a.cir > x.plan.cir);
    return this.panel('ox-c5', 'CIR theo tháng so với KPI CIR', 'Cột = CIR thực tế (Spend / NMV) · đường = KPI CIR · cột đỏ = vượt KPI', s,
      over.length ? 'Tháng vượt KPI CIR: ' + over.map(x => 'T' + x.m).join(', ') + '.' : 'Không tháng đủ nào vượt KPI CIR.',
      this.legend([{ c: 'var(--series-nmv)', t: 'Cột = CIR thực tế' }, { c: '#ff7a8a', t: 'Cột đỏ = vượt KPI' }, { c: 'var(--kpi-mark)', t: 'Đường = KPI CIR', line: 1 }]) + this.warnBadge());
  }

  // ---- chart 3: metric tabs (GMV / Orders / Cancel / AOV / CVR) --------------------------
  chMetrics() {
    const tab = this.state.mtab || 'gmv';
    const defs = {
      gmv: { t: 'GMV', f: a => a.gmv, fmt: v => this.money(v), ax: v => this.short(v), kind: 'bar' },
      orders: { t: 'Orders', f: a => a.ld, fmt: v => this.num(v), ax: v => this.short(v), kind: 'bar' },
      cancel: { t: 'Cancel rate', f: a => a.cancel, fmt: v => this.pct(v, 1), ax: v => (v * 100).toFixed(0) + '%', kind: 'line' },
      aov: { t: 'AOV', f: a => a.aov, fmt: v => this.money(v), ax: v => this.short(v), kind: 'bar' },
      cvr: { t: 'Sale CVR', f: a => a.cvr, fmt: v => this.pct(v, 1), ax: v => (v * 100).toFixed(0) + '%', kind: 'line' }
    };
    const d = defs[tab] || defs.gmv, ms = this.monthStats(), sel = this.monthNum(), ytd = this.ytdScope();
    const W = 660, H = 250, L = 52, R = 14, T = 22, B = 34;
    const vals = ms.map(x => d.f(x.a) || 0), maxV = this.niceMax(Math.max.apply(null, vals.concat([0.0001])) * 1.05);
    const pw = W - L - R, ph = H - T - B, bw = pw / ms.length;
    const X = i => L + bw * i + bw / 2, Y = v => T + ph - (v / maxV) * ph;
    const unit = { gmv: '₫', orders: 'đơn', cancel: '%', aov: '₫', cvr: '%' }[tab] || '';
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">' + this.axT(L, d.t + ' (' + unit + ') · mỗi ' + (d.kind === 'bar' ? 'cột' : 'điểm') + ' = 1 tháng');
    for (let i = 0; i <= 4; i++) {
      const y = T + ph - ph * i / 4;
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + d.ax(maxV * i / 4) + '</text>';
    }
    if (d.kind === 'bar') {
      ms.forEach((x, i) => {
        const v = vals[i], part = this.isPartial(x.m), on = !ytd && x.m === sel, h = ph * v / maxV, w = bw * 0.54;
        s += '<g data-m="' + x.m + '" class="ox-hit">' + (on ? '<rect x="' + (X(i) - bw / 2 + 2) + '" y="' + T + '" width="' + (bw - 4) + '" height="' + ph + '" class="ox-sel"/>' : '') +
          '<rect x="' + (X(i) - w / 2) + '" y="' + (T + ph - h) + '" width="' + w + '" height="' + Math.max(h, 0) + '" fill="url(#oxg)"' + (part ? ' opacity="0.55"' : '') + '><title>T' + x.m + ' · ' + d.t + ' ' + d.fmt(v) + '</title></rect>' +
          '<text x="' + X(i) + '" y="' + (T + ph - h - 5) + '" text-anchor="middle" class="ox-val">' + d.ax(v) + '</text>' +
          '<text x="' + X(i) + '" y="' + (H - 12) + '" text-anchor="middle" class="ox-ax' + (on ? ' ox-axon' : '') + '">T' + x.m + (part ? '*' : '') + '</text></g>';
      });
    } else {
      s += '<polyline fill="none" stroke="var(--series-nmv)" stroke-width="2.4" points="' + vals.map((v, i) => X(i) + ',' + Y(v)).join(' ') + '"/>';
      ms.forEach((x, i) => {
        const on = !ytd && x.m === sel;
        s += '<g data-m="' + x.m + '" class="ox-hit"><circle cx="' + X(i) + '" cy="' + Y(vals[i]) + '" r="' + (on ? 6 : 4.2) + '" fill="var(--series-nmv)"><title>T' + x.m + ' · ' + d.t + ' ' + d.fmt(vals[i]) + '</title></circle>' +
          '<text x="' + X(i) + '" y="' + (Y(vals[i]) - 9) + '" text-anchor="middle" class="ox-val">' + (vals[i] * 100).toFixed(1) + '</text>' +
          '<text x="' + X(i) + '" y="' + (H - 12) + '" text-anchor="middle" class="ox-ax' + (on ? ' ox-axon' : '') + '">T' + x.m + (this.isPartial(x.m) ? '*' : '') + '</text></g>';
      });
    }
    s += '</svg>';
    const tabs = Object.keys(defs).map(k => '<button type="button" class="ox-tab' + (k === tab ? ' on' : '') + '" data-tab="' + k + '">' + defs[k].t + '</button>').join('');
    return this.panel('ox-c7', 'Chỉ số đơn hàng theo tháng', 'Chọn chỉ số: GMV, Orders, Cancel rate, AOV, Sale CVR · bấm cột để chọn tháng', '<div class="ox-tabs">' + tabs + '</div>' + s,
      tab === 'cancel' ? 'Cancel rate = 1 − NMV / GMV.' : tab === 'cvr' ? 'Sale CVR = đơn không hủy / đơn đặt.' : tab === 'orders' ? 'Orders = số đơn đặt (gồm cả đơn hủy).' : '', this.legend([{ c: 'var(--series-nmv)', t: (d.kind === 'bar' ? 'Cột' : 'Đường') + ' = ' + d.t + ' (' + unit + ')' }]));
  }

  // ---- chart 4: waterfall GMV -> NMV -> after spend --------------------------------------
  chWaterfall(cur) {
    const W = 470, H = 250, L = 44, R = 12, T = 24, B = 40;
    const cancel = Math.max(0, cur.gmv - cur.nmv);
    const steps = [
      { k: 'GMV', v: cur.gmv, a: 0, b: cur.gmv, c: '#b6cff7' },
      { k: 'Hủy', v: -cancel, a: cur.nmv, b: cur.gmv, c: '#ff8fa3' },
      { k: 'NMV', v: cur.nmv, a: 0, b: cur.nmv, c: '#2f6df0' }
    ];
    const maxV = this.niceMax(cur.gmv * 1.05 || 1), pw = W - L - R, ph = H - T - B, bw = pw / steps.length;
    const Y = v => T + ph - (v / maxV) * ph;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">' + this.axT(L, 'Giá trị (₫)');
    for (let i = 0; i <= 4; i++) { const y = T + ph - ph * i / 4; s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + this.short(maxV * i / 4) + '</text>'; }
    steps.forEach((x, i) => {
      const cx = L + bw * i + bw / 2, w = bw * 0.6, y1 = Y(x.b), y2 = Y(x.a);
      s += '<rect x="' + (cx - w / 2) + '" y="' + y1 + '" width="' + w + '" height="' + Math.max(1, y2 - y1) + '" fill="' + x.c + '"><title>' + x.k + ' ' + this.money(x.v) + '</title></rect>' +
        '<text x="' + cx + '" y="' + (y1 - 6) + '" text-anchor="middle" class="ox-val">' + (x.v < 0 ? '−' : '') + this.short(Math.abs(x.v)) + '</text>' +
        '<text x="' + cx + '" y="' + (H - 18) + '" text-anchor="middle" class="ox-ax">' + x.k + '</text>';
      if (i < steps.length - 1) { const nxt = i === 0 ? cur.gmv : cur.nmv; s += '<line x1="' + (cx + w / 2) + '" x2="' + (cx + bw - w / 2) + '" y1="' + Y(nxt) + '" y2="' + Y(nxt) + '" class="ox-link"/>'; }
    });
    s += '</svg>';
    return this.panel('ox-c5', 'Từ GMV đến NMV', this.scopeLabel(), s,
      'Hủy = ' + this.pct(cur.gmv ? cancel / cur.gmv : 0, 1) + ' GMV · NMV còn lại ' + this.pct(cur.gmv ? cur.nmv / cur.gmv : 0, 1) + ' GMV.', this.legend([{ c: '#b6cff7', t: 'GMV = mọi dòng' }, { c: '#ff8fa3', t: 'Hủy = dòng bị hủy' }, { c: '#2f6df0', t: 'NMV = dòng không hủy' }]));
  }

  // ---- chart 5: CIR by channel ------------------------------------------------------------
  chCirChannel(chTable) {
    const rows = chTable.filter(x => x.a.sp > 0).sort((a, b) => b.a.cir - a.a.cir);
    const gaps = {}; this.spendGaps().forEach(g => { gaps[g.key] = g; });
    const maxV = this.niceMax(Math.max.apply(null, rows.map(x => Math.max(x.a.cir, this.cirTargetOf(this.kpiGroup(x.ch.key)) || 0)).concat([0.05])) * 1.1);
    const W = 470, rowH = 44, L = 150, R = 60, T = 8, H = T + rows.length * rowH + 22;
    const pw = W - L - R, X = v => L + pw * v / maxV;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">';
    rows.forEach((x, i) => {
      const y = T + i * rowH, tg = this.cirTargetOf(this.kpiGroup(x.ch.key)), over = tg != null && x.a.cir > tg;
      s += '<text x="' + (L - 8) + '" y="' + (y + 19) + '" text-anchor="end" class="ox-lab">' + this.esc(x.ch.name) + '</text>' +
        '<rect x="' + L + '" y="' + (y + 6) + '" width="' + pw + '" height="18" class="ox-track"/>' +
        '<rect x="' + L + '" y="' + (y + 6) + '" width="' + Math.max(2, X(x.a.cir) - L) + '" height="18" fill="' + (over ? '#ff7a8a' : x.ch.fill) + '"><title>' + this.esc(x.ch.name) + ' · CIR ' + this.pct(x.a.cir, 2) + (tg ? ' · KPI ' + this.pct(tg, 2) : '') + '</title></rect>' +
        (tg ? '<line x1="' + X(tg) + '" x2="' + X(tg) + '" y1="' + (y + 1) + '" y2="' + (y + 29) + '" stroke="var(--kpi-mark)" stroke-width="3"><title>KPI CIR ' + this.pct(tg, 2) + '</title></line>' : '') +
        '<text x="' + (W - R + 8) + '" y="' + (y + 20) + '" class="ox-val' + (over ? ' ox-bad' : '') + '" text-anchor="start">' + this.pct(x.a.cir, 1) + '</text>' +
        '<text x="' + L + '" y="' + (y + 40) + '" class="ox-sub">' + (tg ? 'KPI ' + this.pct(tg, 1) : 'chưa có KPI CIR') + (gaps[x.ch.key] ? ' · ⚠ thiếu Spend từ ' + gaps[x.ch.key].from : '') + '</text>';
    });
    s += '</svg>';
    return this.panel('ox-c5', 'CIR theo kênh', 'Vạch cyan = KPI CIR của kênh · thanh đỏ = vượt KPI', s,
      'Chỉ kênh có Spend. Kênh đang thiếu dữ liệu chi phí sẽ có CIR thấp giả.', this.warnBadge());
  }

  // ---- chart 6: NMV by channel stacked by month --------------------------------------------
  chStack() {
    const D = this.D(), lm = this.lastMonth(), sel = this.monthNum(), ytd = this.ytdScope();
    const cols = []; for (let m = 1; m <= lm; m++) { const by = this.byChannel(this.pick({ month: m })); cols.push({ m: m, by: by, tot: by.reduce((s, x) => s + x.a.nmv, 0) }); }
    const W = 760, H = 280, L = 52, R = 12, T = 20, B = 34;
    const maxV = this.niceMax(Math.max.apply(null, cols.map(c => c.tot).concat([1])) * 1.02);
    const pw = W - L - R, ph = H - T - B, bw = pw / cols.length, Y = v => T + ph - (v / maxV) * ph;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">' + this.axT(L, 'NMV (₫) · mỗi cột = 1 tháng, mỗi màu = 1 kênh');
    for (let i = 0; i <= 4; i++) { const y = T + ph - ph * i / 4; s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + this.short(maxV * i / 4) + '</text>'; }
    cols.forEach((c, i) => {
      const cx = L + bw * i + bw / 2, w = bw * 0.6, on = !ytd && c.m === sel, part = this.isPartial(c.m);
      let acc = 0;
      const kp = (this.planOf(c.m) || {}).nmv;
      s += '<g data-m="' + c.m + '" class="ox-hit"' + this.tipAttr(this.tipCh('T' + c.m + (part ? '* (dở)' : '') + ' · NMV theo kênh', c.by, c.tot, kp)) + '><rect x="' + (cx - bw / 2) + '" y="' + T + '" width="' + bw + '" height="' + ph + '" class="ox-hov"/>' + (on ? '<rect x="' + (cx - bw / 2 + 2) + '" y="' + T + '" width="' + (bw - 4) + '" height="' + ph + '" class="ox-sel"/>' : '');
      c.by.slice().reverse().forEach(x => {
        if (!x.a.nmv) return;
        const h = ph * x.a.nmv / maxV, y = T + ph - (acc / maxV) * ph - h; acc += x.a.nmv;
        s += '<rect x="' + (cx - w / 2) + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + x.ch.fill + '"' + (part ? ' opacity="0.6"' : '') + '></rect>';
      });
      s += '<text x="' + cx + '" y="' + (Y(c.tot) - 5) + '" text-anchor="middle" class="ox-val">' + this.short(c.tot) + '</text><text x="' + cx + '" y="' + (H - 12) + '" text-anchor="middle" class="ox-ax' + (on ? ' ox-axon' : '') + '">T' + c.m + (part ? '*' : '') + '</text></g>';
    });
    s += '</svg>';
    return this.panel('ox-c7', 'NMV theo kênh, xếp chồng theo tháng', 'Cơ cấu kênh thay đổi thế nào qua T1–T' + lm, s,
      'Shopee chiếm phần lớn NMV; các kênh nhỏ (Lazada, Facebook, Website) nằm ở lớp trên cùng.',
      this.legend(D.channels.map(c => ({ c: c.fill, t: c.name }))));
  }

  // ---- chart 7: Spend by channel (donut) ----------------------------------------------------
  chSpendDonut(chTable, cur) {
    const rows = chTable.filter(x => x.a.sp > 0).sort((a, b) => b.a.sp - a.a.sp);
    const C = 2 * Math.PI * 62; let acc = 0, arcs = '';
    rows.forEach(x => {
      const f = cur.sp ? x.a.sp / cur.sp : 0, len = f * C;
      arcs += '<circle r="62" cx="100" cy="100" fill="none" stroke="' + x.ch.fill + '" stroke-width="30" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-acc).toFixed(2) + '" transform="rotate(-90 100 100)"><title>' + this.esc(x.ch.name) + ' ' + this.money(x.a.sp) + ' · ' + this.pct(f, 1) + '</title></circle>';
      acc += len;
    });
    const svg = '<svg viewBox="0 0 200 200" class="ox-donut"><circle r="62" cx="100" cy="100" fill="none" stroke="rgba(20,31,88,0.08)" stroke-width="30"/>' + arcs +
      '<text x="100" y="94" text-anchor="middle" class="ox-dl">TỔNG SPEND</text><text x="100" y="116" text-anchor="middle" class="ox-dv">' + this.money(cur.sp) + '</text></svg>';
    const list = '<div class="ox-list">' + rows.map(x => '<div><i style="background:' + x.ch.fill + '"></i><span>' + this.esc(x.ch.name) + '</span><b>' + this.money(x.a.sp) + '</b><em>' + this.pct(cur.sp ? x.a.sp / cur.sp : 0, 1) + '</em></div>').join('') + '</div>';
    return this.panel('ox-c4', 'Cơ cấu Spend theo kênh', this.scopeLabel(), '<div class="ox-donutwrap">' + svg + list + '</div>', '', this.warnBadge());
  }

  // ---- chart 8: scatter Spend vs NMV per channel ----------------------------------------------
  chScatter(chTable, cur) {
    const rows = chTable.filter(x => x.a.sp > 0 && x.a.nmv > 0);
    const W = 380, H = 250, L = 50, R = 16, T = 16, B = 38;
    const mx = this.niceMax(Math.max.apply(null, rows.map(x => x.a.sp).concat([1])) * 1.1), my = this.niceMax(Math.max.apply(null, rows.map(x => x.a.nmv).concat([1])) * 1.1);
    const pw = W - L - R, ph = H - T - B, X = v => L + pw * v / mx, Y = v => T + ph - ph * v / my, tg = this.cirTargetOf(null) || 0.1;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">';
    for (let i = 0; i <= 4; i++) {
      const y = T + ph - ph * i / 4, x = L + pw * i / 4;
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" class="ox-grid"/><text x="' + (L - 6) + '" y="' + (y + 4) + '" text-anchor="end" class="ox-ax">' + this.short(my * i / 4) + '</text>' +
        '<text x="' + x + '" y="' + (H - 18) + '" text-anchor="middle" class="ox-ax">' + this.short(mx * i / 4) + '</text>';
    }
    const xe = Math.min(mx, my * tg); // NMV = Spend / tg
    s += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(xe) + '" y2="' + Y(xe / tg) + '" stroke="var(--kpi-mark)" stroke-width="2" stroke-dasharray="6 4"><title>CIR = KPI ' + this.pct(tg, 1) + '</title></line>';
    const mo = Math.max.apply(null, rows.map(x => x.a.od).concat([1]));
    rows.forEach(x => {
      const r = 6 + 12 * Math.sqrt(x.a.od / mo);
      s += '<circle cx="' + X(x.a.sp) + '" cy="' + Y(x.a.nmv) + '" r="' + r + '" fill="' + x.ch.fill + '" fill-opacity="0.82" stroke="#fff" stroke-width="1.5"><title>' + this.esc(x.ch.name) + ' · Spend ' + this.money(x.a.sp) + ' · NMV ' + this.money(x.a.nmv) + ' · CIR ' + this.pct(x.a.cir, 1) + '</title></circle>' +
        '<text x="' + (X(x.a.sp) > W - 90 ? X(x.a.sp) - r - 4 : X(x.a.sp) + r + 4) + '" y="' + (Y(x.a.nmv) + 4) + '" text-anchor="' + (X(x.a.sp) > W - 90 ? 'end' : 'start') + '" class="ox-lab2">' + this.esc((x.ch.name.split(' · ')[0])) + '</text>';
    });
    s += '<text x="' + (L + pw / 2) + '" y="' + (H - 3) + '" text-anchor="middle" class="ox-ax">Spend →</text><text x="12" y="' + (T + ph / 2) + '" transform="rotate(-90 12 ' + (T + ph / 2) + ')" text-anchor="middle" class="ox-ax">NMV →</text></svg>';
    return this.panel('ox-c4', 'Spend so với NMV theo kênh', 'Kênh càng cao và càng gần trục dọc càng hiệu quả', s,
      'Đường nét đứt = CIR theo KPI (' + this.pct(tg, 1) + '). Kích thước bóng = số đơn không hủy.', this.warnBadge());
  }

  // ---- chart 9: % KPI by channel --------------------------------------------------------------
  chKpiChannel() {
    const by = this.byChannel(this.scopeRows()), D = this.D();
    const groups = [
      { g: 'Shopee', name: 'Shopee', keys: ['Shopee'], fill: 'var(--channel-shopee)' },
      { g: 'Tiktok Shop', name: 'Tiktok Shop', keys: ['Tiktok Shop'], fill: 'var(--channel-tiktok)' },
      { g: 'Website/Social', name: 'Website/FB', keys: ['Harasocial', 'Website'], fill: 'var(--channel-facebook)' },
      { g: 'Lazada', name: 'Lazada/Tiki', keys: ['Lazada'], fill: 'var(--channel-lazada)' }
    ].map(x => {
      const nmv = by.filter(b => x.keys.indexOf(b.ch.key) >= 0).reduce((s, b) => s + b.a.nmv, 0), k = this.kpiScope(x.g);
      return Object.assign(x, { nmv: nmv, k: k });
    });
    const W = 400, rowH = 56, L = 96, R = 14, T = 10, H = T + groups.length * rowH + 6, pw = W - L - R - 40;
    const maxP = Math.max.apply(null, groups.map(x => x.k && x.k.total ? x.nmv / x.k.total : 0).concat([1])), top = Math.max(1, maxP) * 1.08;
    const X = p => L + pw * Math.min(p, top) / top;
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ox-svg">';
    groups.forEach((x, i) => {
      const y = T + i * rowH;
      s += '<text x="' + (L - 8) + '" y="' + (y + 20) + '" text-anchor="end" class="ox-lab">' + this.esc(x.name) + '</text><rect x="' + L + '" y="' + (y + 7) + '" width="' + pw + '" height="18" class="ox-track"/>';
      if (x.k && x.k.total) {
        const p = x.nmv / x.k.total, pace = x.k.toDate / x.k.total, good = x.nmv >= x.k.toDate * 0.95;
        s += '<rect x="' + L + '" y="' + (y + 7) + '" width="' + Math.max(2, X(p) - L) + '" height="18" fill="' + x.fill + '"><title>' + x.name + ' · NMV ' + this.money(x.nmv) + ' / KPI ' + this.money(x.k.total) + '</title></rect>' +
          '<line x1="' + X(1) + '" x2="' + X(1) + '" y1="' + (y + 2) + '" y2="' + (y + 30) + '" stroke="var(--text-primary)" stroke-width="1.5"><title>100% KPI tháng</title></line>' +
          (pace < 1 ? '<line x1="' + X(pace) + '" x2="' + X(pace) + '" y1="' + (y + 2) + '" y2="' + (y + 30) + '" stroke="var(--kpi-mark)" stroke-width="3"><title>Tiến độ phải đạt đến hôm nay: ' + this.money(x.k.toDate) + '</title></line>' : '') +
          '<text x="' + L + '" y="' + (y + 45) + '" class="ox-sub">' + this.money(x.nmv) + ' / KPI ' + this.money(x.k.total) + ' · ' + (good ? 'đúng tiến độ' : 'chậm') + '</text>' +
          '<text x="' + (W - R) + '" y="' + (y + 20) + '" text-anchor="end" class="ox-val ' + (good ? 'ox-good' : 'ox-bad') + '">' + (p * 100).toFixed(0) + '%</text>';
      } else s += '<text x="' + (L + 8) + '" y="' + (y + 20) + '" class="ox-sub">Chưa có KPI NMV cho kênh này</text><text x="' + L + '" y="' + (y + 45) + '" class="ox-sub">NMV ' + this.money(x.nmv) + '</text>';
    });
    s += '</svg>';
    return this.panel('ox-c5', '% đạt KPI theo kênh', 'NMV ' + this.scopeLabel() + ' so với KPI NMV', s,
      'Seller chưa có kênh tương ứng.', this.legend([{ c: '#9ec5ff', t: 'Thanh = NMV đạt / KPI NMV tháng' }, { c: 'var(--kpi-mark)', t: 'Cyan = mốc cần đạt đến ' + this.dayLabel(this.lastIso()), line: 1 }, { c: '#0f1b3a', t: 'Đen = 100% KPI', line: 1 }]));
  }

  // ---- chart 10: top categories ---------------------------------------------------------------
  chCategory() {
    const C = this.ovcat();
    if (!C) return this.panel('ox-c12', 'Top ngành hàng theo NMV', '', '<div class="ox-ps">Chưa có dữ liệu ngành hàng.</div>', '', '');
    const m = this.monthNum(), from = this.ytdScope() ? 1 : m, sum = C.groups.map(() => 0);
    for (let k = from; k <= m; k++) (C.m[k] || []).forEach((v, i) => { sum[i] += v; });
    const tot = sum.reduce((s, v) => s + v, 0), rows = C.groups.map((g, i) => ({ g: g, v: sum[i], i: i })).sort((a, b) => b.v - a.v).filter(x => x.v > 0).slice(0, 8);
    const prevSum = C.groups.map(() => 0), pm = m - 1;
    if (!this.ytdScope() && pm >= 1) (C.m[pm] || []).forEach((v, i) => { prevSum[i] = v; });
    const mx = Math.max.apply(null, rows.map(x => x.v).concat([1]));
    const ok = !this.ytdScope() && pm >= 1, part = ok && this.isPartial(m), rr = part ? this.runRate(m) : 1, pl = 'T' + pm;
    const delta = x => {
      if (!ok) return '<i class="ox-d">—</i>';
      const pv = prevSum[x.i], cv = x.v * rr;
      if (!pv) return '<i class="ox-d up" title="Không có doanh thu ' + pl + '">mới</i>';
      const d = cv / pv - 1;
      return '<i class="ox-d ' + (d >= 0 ? 'up' : 'dn') + '" title="' + (part ? 'Ước cả tháng ' + this.money(cv) : 'NMV ' + this.money(x.v)) + ' so với ' + pl + ' ' + this.money(pv) + '">' + (d >= 0 ? '▲ +' : '▼ ') + (d * 100).toFixed(1) + '%</i>';
    };
    const body = '<div class="ox-bars"><div class="ox-bar ox-barh"><span>Ngành hàng</span><span></span><span>NMV</span><span>% tổng</span><span>' + (ok ? 'so với ' + pl : 'so với tháng trước') + '</span></div>' + rows.map(x => '<div class="ox-bar"><span class="ox-bl">' + this.esc(x.g) + '</span><span class="ox-bt"><span style="width:' + (x.v / mx * 100).toFixed(1) + '%"></span></span><b>' + this.money(x.v) + '</b><em>' + this.pct(tot ? x.v / tot : 0, 1) + '</em>' + delta(x) + '</div>').join('') + '</div>';
    return this.panel('ox-c12', 'Top ngành hàng theo NMV', this.scopeLabel() + ' · ' + rows.length + ' nhóm lớn nhất · thanh dài = NMV cao', body,
      'Nhóm ngành lấy từ file sản phẩm đã phân loại (Product Classify); tổng NMV các nhóm khớp NMV tổng. ' + (ok ? (part ? 'Tăng/giảm = NMV ước cả tháng (×' + rr.toFixed(2) + ') so với NMV cả ' + pl + '; tháng dở nên không so thẳng số ngày. ' : 'Tăng/giảm = NMV so với cả ' + pl + '. ') : 'YTD không có tháng liền trước để so. ') + 'Chi tiết SKU xem tab Product Performance.', this.legend([{ c: '#2f6df0', t: 'Thanh = NMV theo ngành (₫)' }, { c: '#a9bad6', t: 'Số bên phải = % tổng NMV' }, { c: '#12924f', t: '▲/▼ = tăng/giảm so với tháng trước' }]));
  }

  // ---- alerts -----------------------------------------------------------------------------------
  buildAlerts(chCur, chPrev, cur) {
    const D = this.D(), out = [], staleDays = 7;
    chCur.filter(x => x.a.sp > 0 && x.a.cir != null).forEach(x => {
      const tg = this.cirTargetOf(this.kpiGroup(x.ch.key)) || this.cirTargetOf(null) || 0.1;
      if (x.a.cir > tg) { const p = chPrev[x.ch.key]; out.push({ lv: x.a.cir > tg * 2 ? 'Critical' : 'Watch', t: x.ch.name + ' vượt KPI CIR ' + this.pct(tg, 1) + ' — ' + this.pct(x.a.cir, 1), d: 'Spend ' + this.money(x.a.sp) + ' · NMV ' + this.money(x.a.nmv) + ' · ' + this.prevLabel() + ' ' + (p && p.cir != null ? this.pct(p.cir, 1) : '—') }); }
    });
    const byKpi = this.byChannel(this.scopeRows());
    [{ g: 'Shopee', name: 'Shopee', keys: ['Shopee'] }, { g: 'Tiktok Shop', name: 'Tiktok Shop', keys: ['Tiktok Shop'] },
     { g: 'Website/Social', name: 'Website + Facebook', keys: ['Harasocial', 'Website'] }, { g: 'Lazada', name: 'Lazada · Tiki', keys: ['Lazada'] }].forEach(x => {
      const nmv = byKpi.filter(b => x.keys.indexOf(b.ch.key) >= 0).reduce((t, b) => t + b.a.nmv, 0), k = this.kpiScope(x.g);
      if (k && k.toDate > 0 && k.total > 0 && nmv < k.toDate * 0.95)
        out.push({ lv: nmv < k.toDate * 0.5 ? 'Critical' : 'Watch', t: x.name + ' chậm KPI NMV: ' + (nmv / k.total * 100).toFixed(0) + '% KPI, mốc hôm nay ' + (k.toDate / k.total * 100).toFixed(0) + '%', d: 'NMV ' + this.money(nmv) + ' · cần ' + this.money(k.toDate) + ' đến ' + this.dayLabel(this.lastIso()) });
    });
    if (!out.some(a => /KPI CIR/.test(a.t))) out.push({ lv: 'Checked', t: 'Không kênh nào vượt KPI CIR', d: 'CIR toàn kênh ' + this.pct(cur.cir, 2) + ' · ' + this.scopeLabel() });
    const cutoff = new Date(Date.parse(this.lastIso() + 'T00:00:00Z') - staleDays * 864e5).toISOString().slice(0, 10);
    const stale = D.channels.filter(c => c.last <= cutoff);
    if (stale.length) out.push({ lv: 'Watch', t: stale.length + ' kênh không có dữ liệu ≥ ' + staleDays + ' ngày', d: stale.map(c => c.name + ' ' + this.dayLabel(c.last)).join(' · ') });
    return out;
  }

  // ---- hero + cards -----------------------------------------------------------------------------
  heroHtml(cur, prev) {
    const m = this.monthNum(), ytd = this.ytdScope(), K = this.kpiScope(null), part = !ytd && this.isPartial(m);
    const dim = this.daysIn(m), ld = this.lastDay();
    const proj = part ? cur.nmv * dim / ld : cur.nmv;
    const pTot = K ? cur.nmv / K.total : null, pTo = K && K.toDate ? cur.nmv / K.toDate : null;
    const left = K ? K.total - cur.nmv : null, daysLeft = part ? dim - ld : 0;
    const pace = K && K.total ? K.toDate / K.total : null;
    const kl = ytd ? 'KPI lũy kế' : 'KPI T' + m, ic = n => '<span class="bsi">' + (window.BSICON ? window.BSICON(n) : '') + '</span>';
    const good = pTo != null && pTo >= 0.95;
    const dRel = prev.nmv ? (cur.nmv - prev.nmv) / prev.nmv : null;
    let concl = '', conclBad = false;
    if (K) {
      if (part) { conclBad = proj < K.total; concl = 'Run-rate ' + this.money(proj) + ' = ' + (proj / K.total * 100).toFixed(0) + '% KPI · ' + (conclBad ? 'dự kiến hụt ' + this.money(K.total - proj) : 'dự kiến vượt ' + this.money(proj - K.total)); }
      else { conclBad = cur.nmv < K.total; concl = conclBad ? 'Đạt ' + (cur.nmv / K.total * 100).toFixed(0) + '% KPI · còn thiếu ' + this.money(K.total - cur.nmv) : 'Đã đạt KPI · vượt ' + this.money(cur.nmv - K.total); }
    }
    // mini chart: daily NMV vs daily KPI (month) or monthly NMV vs KPI (YTD)
    let mini = '';
    const W = 520, H = 120, items = [];
    if (!ytd) {
      const DKm = this.dk(m), map = {};
      this.pick({ month: m }).forEach(r => { const d = this.D().dates[r[0]]; map[d] = (map[d] || 0) + r[3]; });
      Object.keys(map).sort().forEach((d, i) => items.push({ l: d.slice(8, 10), v: map[d], k: DKm ? DKm.days[+d.slice(8, 10) - 1] && DKm.days[+d.slice(8, 10) - 1].nmv : (K ? K.total / dim : null) }));
    } else this.monthStats().forEach(x => items.push({ l: 'T' + x.m, v: x.a.nmv, k: x.plan && x.plan.nmv }));
    if (items.length > 1) {
      const sv = items.map(x => x.v).sort((p2, q) => q - p2), cap = Math.max((sv[1] || sv[0] || 1) * 1.45, 1), n = items.length;
      const px = i => 14 + (W - 28) * i / (n - 1), py = v => 10 + (H - 10) * (1 - Math.min(v, cap) / cap);
      const pts = items.map((x, i) => [px(i), py(x.v)]), line = this.smoothPath(pts);
      const area = line + ' L' + px(n - 1).toFixed(1) + ' ' + H + ' L' + px(0).toFixed(1) + ' ' + H + ' Z';
      let pk = 0; items.forEach((x, i) => { if (x.v > items[pk].v) pk = i; });
      const kp = items.map((x, i) => x.k != null ? px(i).toFixed(1) + ',' + py(x.k).toFixed(1) : null).filter(Boolean).join(' ');
      const bx = Math.min(W - 78, Math.max(78, px(pk))), by = Math.max(24, py(items[pk].v) - 14);
      mini = '<svg viewBox="0 0 ' + W + ' ' + (H + 20) + '" class="ox-svg ox-mini"><defs><linearGradient id="oxA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#60a5fa" stop-opacity=".55"/><stop offset="1" stop-color="#9bc4ff" stop-opacity="0"/></linearGradient><linearGradient id="oxL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fb4ff"/><stop offset="1" stop-color="#2f6df0"/></linearGradient></defs>' +
        '<path d="' + area + '" fill="url(#oxA)"/>' + (kp ? '<polyline points="' + kp + '" fill="none" stroke="#2fc7b8" stroke-width="1.8" stroke-dasharray="5 4"/>' : '') +
        '<path d="' + line + '" fill="none" stroke="url(#oxL)" stroke-width="3" stroke-linecap="round"/>' +
        '<line x1="' + px(pk) + '" x2="' + px(pk) + '" y1="' + py(items[pk].v) + '" y2="' + H + '" stroke="#2f6df0" stroke-width="1.2" stroke-dasharray="3 3" opacity=".6"/>' +
        '<circle cx="' + px(pk) + '" cy="' + py(items[pk].v) + '" r="6.5" fill="#fff" stroke="#2f6df0" stroke-width="3"/>' +
        '<rect x="' + (bx - 62) + '" y="' + (by - 22) + '" width="124" height="24" rx="12" fill="#fff" opacity=".95"/><text x="' + bx + '" y="' + (by - 6) + '" text-anchor="middle" class="ox-bub">' + (items[pk].l) + (ytd ? '' : '/' + String(m).padStart(2, '0')) + ' · ' + this.short(items[pk].v) + '</text>' +
        items.map((x, i) => (i % Math.ceil(n / 6) === 0 || i === n - 1) ? '<text x="' + px(i) + '" y="' + (H + 16) + '" text-anchor="middle" class="ox-axw">' + x.l + '</text>' : '').join('') + '<title>NMV theo ' + (ytd ? 'tháng' : 'ngày') + '</title></svg>';
    }
    return '<div class="ox-hero"><div class="ox-hl bsl"><span class="bsi">' + (window.BSICON ? window.BSICON('nmv') : '') + '</span>NMV so với KPI · ' + this.esc(this.scopeLabel()) + '</div>' +
      '<div class="ox-hv">' + this.money(cur.nmv) + '</div>' +
      '<div class="ox-hrow"><span class="ox-pill ' + (dRel == null ? 'flat' : dRel >= 0 ? 'up' : 'down') + '">' + (dRel == null ? '—' : (dRel >= 0 ? '▲ ' : '▼ ') + this.signed(Math.abs(dRel)).slice(1)) + '</span><span class="ox-hk">so với ' + this.esc(this.prevLabel()) + '</span></div>' +
      (concl ? '<div class="ox-concl ' + (conclBad ? 'bad' : 'ok') + '">' + concl + '</div>' : '') +
      '<div class="ox-minibox">' + mini + '</div>' +
      (K ? '<div class="ox-hrow2"><span>KPI ' + (ytd ? 'lũy kế' : 'tháng') + ' <b>' + this.money(K.total) + '</b></span><span class="ox-hp">' + (pTot * 100).toFixed(0) + '%</span></div>' +
        '<div class="ox-prog"><span style="width:' + Math.min(100, pTot * 100).toFixed(1) + '%"></span>' + (pace != null && pace < 1 ? '<i style="left:' + (pace * 100).toFixed(1) + '%" title="Tiến độ cần đạt đến hôm nay"></i>' : '') + '</div>' +
        '<div class="ox-hgrid">' +
        '<div>' + ic('target') + '<span>Đạt vs tiến độ' + (part || ytd ? '' : ' (cả kỳ)') + '</span><b class="' + (good ? 'okw' : 'warnw') + '">' + (pTo != null ? (pTo * 100).toFixed(0) + '%' : '—') + '</b><u>' + (part || ytd ? 'Mốc đến ' + this.dayLabel(this.lastIso()) + ': ' + this.money(K.toDate) + ' (' + (pace != null ? (pace * 100).toFixed(0) : '—') + '% × ' + kl + ' ' + this.money(K.total) + ')' : 'NMV ' + this.money(cur.nmv) + ' / ' + kl + ' ' + this.money(K.total)) + '</u></div>' +
        '<div>' + ic('run-rate') + '<span>' + (part ? 'Run-rate' : 'NMV kỳ') + ' / ' + kl + '</span><b>' + this.money(proj) + '</b><u>' + (proj / K.total * 100).toFixed(0) + '% của ' + kl + ' ' + this.money(K.total) + '</u></div>' +
        '<div>' + ic('gap') + '<span>Còn thiếu đến ' + kl + '</span><b>' + this.money(Math.max(0, left)) + '</b><u>' + (left <= 0 ? 'đã đạt ' + kl : this.money(K.total) + ' − ' + this.money(cur.nmv) + (daysLeft ? ' · cần ' + this.money(left / daysLeft) + '/ngày trong ' + daysLeft + ' ngày còn lại' : '')) + '</u></div></div>' : '<div class="ox-hk">Chưa có KPI NMV cho kỳ này</div>') +
      '<div class="ox-mini-t">' + (ytd ? 'Đường = NMV theo tháng · nét đứt teal = KPI' : 'Đường = NMV theo ngày · nét đứt teal = KPI ngày') + '</div></div>';
  }

  smoothPath(p) {
    if (p.length < 2) return '';
    let d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1);
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }

  cardHtml(c) {
    const has = c.pv != null && isFinite(c.pv) && c.pv !== 0 && c.cv != null && isFinite(c.cv);
    const d = has ? (c.cv - c.pv) / Math.abs(c.pv) : null;
    const good = d == null ? null : ((d >= 0) === !c.lower);
    return '<div class="ox-card g-' + c.grp + '"><div class="ox-cl"><span class="bsi">' + (window.BSICON ? window.BSICON(c.label) : '') + '</span>' + c.label + '</div><div class="ox-cv">' + c.fmt(c.cv) + '</div>' +
      '<div class="ox-cd">' + (d == null ? (c.pv == null ? '' : '<span class="ox-pill flat">—</span>') : '<span class="ox-pill ' + (good ? 'up' : 'down') + '">' + (d >= 0 ? '▲ ' : '▼ ') + this.signed(Math.abs(d)).slice(1) + '</span>') +
      '<span class="ox-cp">' + (c.pv != null && isFinite(c.pv) ? 'kỳ trước ' + c.fmt(c.pv) : '') + '</span></div>' +
      (c.extra ? '<div class="ox-ce">' + c.extra + '</div>' : '') + '</div>';
  }

  // ---- channel table ------------------------------------------------------------------------------
  tableHtml(cur, chTable, chPrev) {
    const m = this.monthNum(), ytd = this.ytdScope(), dim = this.daysIn(m);
    const el = ytd ? 1 : Math.min(1, cur.nDays / dim);
    const est = a => el > 0 ? a.nmv / el : null;
    const maxN = Math.max.apply(null, chTable.map(x => x.a.nmv).concat([1]));
    const kpiOf = key => { if (ytd) return null; const r = this.kpiNmv(m, key); return r ? r.total : null; };
    const pvTot = Object.keys(chPrev).reduce((t, k) => t + (chPrev[k].nmv || 0), 0), hasPv = pvTot > 0 && !ytd;
    const gapOn = this.spendGaps().length > 0;
    const row = (name, a, key, total) => {
      const pv = hasPv ? (total ? pvTot : (chPrev[key] ? chPrev[key].nmv : 0)) : null, dl = pv ? a.nmv / pv - 1 : null;
      const ck = total ? (this.kpiNmv(m, null) || {}).total : (key ? kpiOf(this.kpiGroup(key)) : null), e = est(a), cr = ck && e != null && !ytd ? e / ck : null;
      const tg = total ? this.cirTargetOf(null) : this.cirTargetOf(this.kpiGroup(key)), over = tg != null && a.cir > tg;
      const can = a.gmv ? Math.max(0, 1 - a.nmv / a.gmv) : null;
      return '<tr class="' + (total ? 'tot' : '') + '"><td class="l">' + this.esc(name) + '</td>' +
        '<td><span class="ox-db" style="width:' + (total ? 100 : a.nmv / maxN * 100).toFixed(0) + '%"></span>' + this.money(a.nmv) + '</td>' +
        (ytd ? '' : '<td>' + (pv != null ? this.money(pv) : '—') + '</td><td class="' + (dl == null ? '' : dl >= 0 ? 'okw' : 'badw') + '">' + (dl != null ? (dl >= 0 ? '▲ +' : '▼ ') + (dl * 100).toFixed(1) + '%' : (pv === 0 && a.nmv ? 'mới' : '—')) + '</td>') +
        '<td>' + this.money(a.gmv) + '</td><td>' + (total ? '100%' : this.pct(cur.nmv ? a.nmv / cur.nmv : 0, 1)) + '</td>' +
        '<td>' + (e != null ? this.money(e) : '—') + '</td>' +
        '<td class="' + (cr == null ? '' : cr >= 1 ? 'okw' : 'badw') + '">' + (cr != null ? (cr * 100).toFixed(0) + '%<small class="ox-s">KPI ' + this.money(ck) + '</small>' : '—') + '</td>' +
        '<td class="ox-sp">' + (a.sp > 0 ? this.money(a.sp) + (total && gapOn ? ' <i class="ox-gap" title="Một số kênh thiếu Spend">⚠</i>' : '') : '—') + '</td>' +
        '<td class="' + (a.sp > 0 ? (over ? 'badw' : 'okw') : '') + '">' + (a.sp > 0 ? this.pct(a.cir, 1) : '—') + '</td>' +
        '<td>' + (a.sp > 0 && a.nmv ? '×' + (a.nmv / a.sp).toFixed(1) : '—') + '</td><td>' + (a.sp > 0 && a.od ? this.money(a.sp / a.od) : '—') + '</td>' +
        '<td class="' + (can != null && can > 0.3 ? 'badw' : '') + '">' + (can != null ? this.pct(can, 1) : '—') + '</td><td>' + this.money(a.aov) + '</td></tr>';
    };
    const head = ['Kênh', 'NMV'].concat(ytd ? [] : ['NMV cùng kỳ<small class="ox-s">' + this.prevLabel() + '</small>', 'Tăng/giảm']).concat(['GMV', '%Contr', 'Est. cả tháng', '%KPI (est)', 'Spend', 'CIR', 'ROAS', 'CPO', 'Cancel rate', 'AOV']);
    const tbl = '<div class="ox-tw"><table class="ox-t"><thead><tr>' + head.map((h, i) => '<th' + (i ? '' : ' class="l"') + '>' + h + '</th>').join('') + '</tr></thead><tbody>' +
      row('Tổng — ' + chTable.length + ' kênh', cur, null, true) + chTable.map(x => row(x.ch.name, x.a, x.ch.key, false)).join('') + '</tbody></table></div>';
    const D = this.D(), spNote = D.channels.filter(c => c.spendable).map(c => c.name + ' đến ' + (c.spendLast ? this.dayLabel(c.spendLast) : '—')).join(' · ');
    return this.panel('ox-c12', 'Bảng dữ liệu theo kênh', 'Sắp theo NMV giảm dần · ' + this.scopeLabel(), tbl,
      'Est. cả tháng = NMV ÷ ' + (el * 100).toFixed(0) + '% ngày đã đi (' + cur.nDays + '/' + dim + ' ngày), ước tính tuyến tính. %KPI (est) so KPI NMV tháng của từng kênh. CIR đỏ = vượt KPI CIR của kênh. Tăng/giảm = NMV kỳ này so với NMV ' + this.prevLabel() + ' cùng số ngày' + (ytd ? ' (ẩn ở YTD vì không có kỳ so sánh)' : '') + '.', this.warnBadge());
  }

  methodHtml() {
    const D = this.D(), spNote = D.channels.filter(c => c.spendable).map(c => c.name + ' đến ' + (c.spendLast ? this.dayLabel(c.spendLast) : '—')).join(' · ');
    const rows = [
      ['NMV', 'Doanh thu thuần của dòng Không hủy', 'Theo ngày đặt'], ['GMV', 'Doanh thu thuần mọi dòng', 'Gồm cả dòng Hủy'],
      ['Cancel rate', '1 − NMV / GMV', 'Phần GMV nằm ở dòng Hủy'], ['NMV%rate', 'NMV / GMV', 'Tỷ lệ doanh thu giữ lại sau hủy'],
      ['Orders · Completed', 'Đơn đặt · đơn không hủy', 'Sale CVR = đơn không hủy / đơn đặt'],
      ['CIR · ROAS · CPO', 'Spend / NMV · NMV / Spend · Spend / đơn không hủy', 'Chỉ 4 kênh có Spend. Spend dừng: ' + spNote + ' nên CIR kỳ dở thấp hơn thực tế'],
      ['AOV', 'NMV / đơn không hủy', ''], ['Run-rate', 'NMV ÷ tỷ lệ ngày đã đi', 'Tuyến tính, không tính ngày sale sàn'],
      ['KPI', 'KPI Monthly Plan 2026 · KPI ngày theo % phân bổ', 'Website/Social so Harasocial + Website · Lazada so Lazada + Tiki · Seller chưa có kênh tương ứng · đơn vị đồng'],
      ['KPI CIR', 'CIR mục tiêu từng tháng/kênh', 'Lấy từ KPI Monthly Plan, đổi theo tháng và kênh']
    ];
    return '<details class="ox-panel ox-c12 ox-det"><summary>Công thức &amp; nguồn dữ liệu</summary><div class="ox-tw"><table class="ox-t ox-tm"><thead><tr><th class="l">Chỉ số</th><th class="l">Công thức</th><th class="l">Ghi chú</th></tr></thead><tbody>' +
      rows.map(r => '<tr><td class="l"><b>' + r[0] + '</b></td><td class="l">' + this.esc(r[1]) + '</td><td class="l">' + this.esc(r[2]) + '</td></tr>').join('') + '</tbody></table></div></details>';
  }

  alertsHtml(alerts) {
    const crit = alerts.filter(a => a.lv === 'Critical').length, watch = alerts.filter(a => a.lv === 'Watch').length;
    const sum = '<span class="ox-asum">' + alerts.length + ' cảnh báo' + (crit ? ' · <i class="c">' + crit + ' Critical</i>' : '') + (watch ? ' · <i class="w">' + watch + ' Watch</i>' : '') + '</span>';
    return this.panel('ox-alw' + (this.isOpen('alerts') ? '' : ' ox-closed'), 'Cảnh báo kênh', 'Tự tạo từ dữ liệu · KPI CIR theo kênh', '<div class="ox-al">' + alerts.map(a => '<div class="ox-a ' + a.lv.toLowerCase() + '"><span>' + a.lv + '</span><div><b>' + this.esc(a.t) + '</b><em>' + this.esc(a.d) + '</em></div></div>').join('') + '</div>', '', sum + this.foldBtn('alerts')).replace('<div class="ox-panel', '<div data-fbox="alerts" class="ox-panel');
  }

  OX_CSS() {
    return '<style>' +
      '.ox{--kpi-mark:#2fc7b8;--ox-ink:#0b1530;--ox-mut:#5b6b85;--ox-pur:#2f6df0;display:flex;flex-direction:column;gap:20px;font-family:var(--font-body)}' +
      '.ox *{box-sizing:border-box}' +
      '.ox-top{display:grid;grid-template-columns:minmax(330px,1.1fr) repeat(4,minmax(0,1fr));gap:16px;align-items:stretch}' +
      '.ox-top{grid-template-rows:auto 1fr auto}.ox-extra{grid-column:2/-1;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}.ox-hero{grid-row:span 3;border-radius:34px;padding:26px 26px 22px;display:flex;flex-direction:column;gap:10px;color:var(--ox-ink);background:linear-gradient(115deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.75) 30%,rgba(255,255,255,0) 46%),linear-gradient(150deg,#b9d4ff 0%,#dbeafe 48%,#bcd6ff 100%);border:1px solid #bcd3f7;box-shadow:0 18px 44px rgba(37,99,235,.16),inset 0 1px 0 #fff}' +
      '.ox-hl{font-size:15px;color:var(--ox-mut)}.ox-hv{font-family:var(--font-heading);font-weight:700;letter-spacing:-.02em;font-size:clamp(44px,4.2vw,60px);line-height:1;font-weight:800;letter-spacing:-.03em}' +
      '.ox-hrow{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.ox-hk{font-size:14px;color:var(--ox-mut)}.ox-hrow2{display:flex;justify-content:space-between;align-items:baseline;font-size:14px;color:var(--ox-mut)}.ox-hrow2 b{color:var(--ox-ink);font-weight:600}.ox-hp{font-family:var(--font-heading);font-weight:700;letter-spacing:-.02em;font-size:22px;color:var(--ox-pur)}' +
      '.ox-minibox{margin:2px -6px 0}' +
      '.ox-prog{position:relative;height:10px;background:rgba(37,99,235,.14);border-radius:99px;overflow:visible}.ox-prog span{display:block;height:100%;background:linear-gradient(90deg,#8fb4ff,#2f6df0);border-radius:99px}.ox-prog i{position:absolute;top:-5px;bottom:-5px;width:3px;background:#2fc7b8;border-radius:2px}' +
      '.ox-hgrid{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}.ox-hgrid>div{min-width:0;background:rgba(255,255,255,.62);border-radius:16px;padding:9px 14px;display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:12px;row-gap:1px;align-items:center;border:1px solid rgba(255,255,255,.9);box-shadow:0 8px 22px rgba(37,99,235,.10)}' +
      '.ox-hgrid>div{grid-template-columns:auto minmax(0,1fr) auto !important;column-gap:10px !important}.ox-hgrid .bsi{grid-column:1;grid-row:1/3;width:30px;height:30px;border-radius:10px}.ox-hgrid .bsi svg{width:17px;height:17px}.ox-hgrid span:not(.bsi){grid-column:2;grid-row:1;font-size:12.5px;font-weight:600;color:var(--ox-mut)}.ox-hgrid b{grid-column:3;grid-row:1/3;text-align:right}.ox-hgrid u{grid-column:2;grid-row:2;line-height:1.35}.ox-hero{justify-content:space-between}.ox-hgrid b{font-family:var(--font-heading);font-weight:700;letter-spacing:-.02em;font-size:19px;line-height:1.15;white-space:nowrap}.ox-hgrid u{text-decoration:none;font-size:11px;color:var(--ox-mut)}.okw{color:#12924f}.warnw{color:#d9822b}' +
      '.ox-mini-t{font-size:12px;color:var(--ox-mut);margin-top:auto}.ox-mini{width:100%;height:auto;overflow:visible}.ox-axw{font-size:11px;fill:#5b6b85}.ox-bub{font-size:12px;font-weight:600;fill:#1d4ed8}' +
      '.ox-card,.ox-panel{background:linear-gradient(115deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.9) 24%,rgba(255,255,255,0) 42%),linear-gradient(150deg,#d3e5ff 0%,#e9f2ff 50%,#c9deff 100%);border:1px solid #c5dbfa;border-radius:26px;box-shadow:0 10px 28px rgba(37,99,235,.10),inset 0 1px 0 #fff}.ox-panel{background:linear-gradient(115deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.85) 30%,rgba(255,255,255,0) 46%),linear-gradient(150deg,#e6f0ff 0%,#f5f9ff 52%,#dbe9ff 100%)}' +
      '.ox-card{padding:16px 15px;display:flex;flex-direction:column;gap:8px;min-width:0}.ox-cl{font-size:14px;color:var(--ox-mut);display:flex;align-items:center;gap:9px;font-weight:500}' +
      '' +
      '.ox-cv{font-family:var(--font-heading);font-weight:700;letter-spacing:-.02em;font-size:30px;color:var(--ox-ink);line-height:1.1;white-space:nowrap}.ox-cd{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ox-cp{font-size:12px;color:var(--ox-mut)}.ox-ce{font-size:12px;color:var(--ox-mut);display:flex;gap:6px;flex-wrap:wrap;align-items:center}' +
      '.ox-pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:12.5px;font-weight:600;white-space:nowrap;background:#e3edfb;color:#475569}.ox-pill.up{background:#d9f7e6;color:#12924f}.ox-pill.down{background:#ffe3e8;color:#d6334f}.ox-pill.flat{background:#e3edfb;color:#475569}' +
      '.ox-warn{display:inline-flex;align-items:center;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;background:#fff3c9;color:#8a5a00;white-space:normal;max-width:100%;line-height:1.3;overflow:hidden}' +
      '.ox-banner{display:flex;gap:12px;align-items:flex-start;padding:12px 16px;border-radius:20px;background:linear-gradient(120deg,#fff7dd,#fff1c2);border:1px solid #f3dc92;color:#6b4a00;font-size:13.5px;line-height:1.5;box-shadow:0 6px 18px rgba(217,160,30,.12)}.ox-wh{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}.ox-wh .ox-wt{margin:0;flex:1 1 auto}.ox-wsum{display:none;font-size:12.5px;color:#7a5a12}.ox-closed .ox-wsum{display:inline}.ox-banner.ox-closed .ox-wl{display:none}.ox-banner.ox-closed .ox-wh{margin-bottom:0}.ox-banner.ox-closed .ox-bi{align-self:center}.ox-fold{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(37,99,235,.28);background:rgba(255,255,255,.75);color:#1d4ed8;border-radius:99px;padding:5px 11px;font:600 12px var(--font-body);cursor:pointer;flex:none}.ox-fold:hover{background:#fff;box-shadow:0 3px 10px rgba(37,99,235,.18)}.ox-fold:focus-visible{outline:2px solid #2563eb;outline-offset:2px}.ox-fold svg{transition:transform .2s}.ox-closed .ox-fold svg{transform:rotate(-90deg)}.ox-banner .ox-fold{border-color:#e3c46a;color:#7a5a12;background:rgba(255,255,255,.6)}.ox-pr{display:flex;align-items:center;gap:10px}.ox-asum{font-size:12.5px;color:var(--ox-mut)}.ox-asum i{font-style:normal;font-weight:700}.ox-asum i.c{color:#d6334f}.ox-asum i.w{color:#c27a0e}.ox-alw.ox-closed{align-self:start}.ox-alw.ox-closed .ox-al{display:none}.ox-alw.ox-closed .ox-ph{margin-bottom:0}.ox-ww{min-width:0;flex:1}.ox-wt{display:block;font-weight:700;font-size:14px;margin-bottom:6px}.ox-wl{margin:0;padding:0 0 0 18px;display:grid;gap:5px}.ox-wl li{line-height:1.45}.ox-wl li b{font-weight:700}.ox-wl li b::after{content:"\u00a0—\u00a0";font-weight:400}.ox-wl li span{color:#7a5a12}.ox-banner b{font-weight:700}.ox-bi{flex:none;width:26px;height:26px;border-radius:9px;background:#ffe9a3;display:inline-flex;align-items:center;justify-content:center;font-size:14px}' +
      '.ox-concl{font-size:14px;font-weight:600;padding:9px 13px;border-radius:14px;background:rgba(255,255,255,.72);border:1px solid rgba(255,255,255,.95);color:#12924f}.ox-concl.bad{color:#c2410c}' +
      '.ox-alw{grid-column:2/-1}.ox-alw .ox-al{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));max-height:none;overflow:visible}' +
      '.ox-card{position:relative}.ox-card::before{content:"";position:absolute;left:0;top:20px;bottom:20px;width:4px;border-radius:0 4px 4px 0;background:var(--gc,#2f6df0)}.g-rev{--gc:#2f6df0}.g-cost{--gc:#0ea5e9}.g-q{--gc:#14b8a6}' +
      '.ox-more summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:999px;background:#fff;border:1px solid #c5dbfa;font-weight:600;font-size:14px;color:#1e293b;box-shadow:0 4px 12px rgba(37,99,235,.10)}.ox-more summary::-webkit-details-marker{display:none}.ox-more summary::before{content:"+";font-weight:700;color:#2563eb}.ox-more[open] summary::before{content:"−"}' +
      '.ox-moregrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px;margin-top:14px}' +
      '.ox-charts{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px}.ox-c4{grid-column:span 4}.ox-c5{grid-column:span 5}.ox-c7{grid-column:span 7}.ox-c12{grid-column:span 12}' +
      '.ox-panel{padding:22px 24px;display:flex;flex-direction:column;gap:12px;min-width:0}.ox-ph{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.ox-pt{font-family:var(--font-heading);font-weight:700;letter-spacing:-.02em;font-size:20px;color:var(--ox-ink);line-height:1.2}.ox-ps{font-size:13px;color:var(--ox-mut);margin-top:4px}.ox-pr{display:flex;flex-direction:column;align-items:flex-end;gap:6px}' +
      '.ox-leg{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:var(--ox-mut);justify-content:flex-end}.ox-leg span{display:inline-flex;align-items:center;gap:5px}.ox-leg i{width:10px;height:10px;border-radius:99px;display:inline-block}' +
      '.ox-foot{font-size:12.5px;color:var(--ox-mut);line-height:1.5;border-top:1px solid rgba(37,99,235,.14);padding-top:10px;margin-top:auto}' +
      '.ox-svg{width:100%;height:auto;display:block}.ox-grid{stroke:rgba(37,99,235,.12);stroke-width:1}.ox-ax{font-size:12px;fill:#5b6b85}.ox-axr{fill:#5b6b85}.ox-axon{fill:#2563eb;font-weight:700}.ox-val{font-size:12px;font-weight:600;fill:#0f1b3a}.ox-bad{fill:#d6334f}.ox-good{fill:#12924f}' +
      '.ox-lab{font-size:13px;font-weight:600;fill:#0f1b3a}.ox-lab2{font-size:12px;font-weight:600;fill:#0f1b3a}.ox-sub{font-size:12px;fill:#5b6b85}.ox-track{fill:rgba(37,99,235,.10);rx:9}.ox-sel{fill:rgba(37,99,235,.10);rx:12}.ox-link{stroke:#a9bad6;stroke-width:1;stroke-dasharray:3 3}.ox-svg rect{rx:7}' +
      '.ox-axt{font-size:11.5px;font-weight:700;fill:#2563eb}.ox-hov{fill:transparent}.ox-hit:hover .ox-hov{fill:rgba(47,109,240,.09)}' +
      '.ox-tip{position:fixed;z-index:9999;display:none;min-width:210px;max-width:300px;padding:11px 13px;border-radius:16px;background:rgba(11,21,48,.94);color:#fff;font-size:12.5px;line-height:1.4;box-shadow:0 14px 36px rgba(11,21,48,.35);pointer-events:none;font-family:var(--font-body)}' +
      '.ox-tt{font-weight:700;font-size:13px;margin-bottom:7px}.ox-tr{display:grid;grid-template-columns:10px 1fr auto 46px;gap:8px;align-items:center;padding:2px 0}.ox-tr i{width:9px;height:9px;border-radius:50%}.ox-tr span{grid-column:2;opacity:.92}.ox-tr b{font-weight:700;text-align:right}.ox-tr em{font-style:normal;opacity:.7;text-align:right;font-size:12px}' +
      '.ox-tr.tot{margin-top:6px;padding-top:7px;border-top:1px solid rgba(255,255,255,.22)}.ox-tr.kpi{color:#6ee7d7}' +
      '.ox-hit{cursor:pointer}.ox-hit:hover rect:not(.ox-sel){opacity:.85}' +
      '.ox-tabs{display:flex;gap:6px;flex-wrap:wrap}.ox-tab{border:1px solid rgba(255,255,255,.95);background:rgba(255,255,255,.7);color:#334155;font:600 12.5px var(--font-body);padding:6px 15px;border-radius:99px;cursor:pointer;box-shadow:0 6px 16px rgba(37,99,235,.10)}.ox-tab.on{background:linear-gradient(135deg,#60a5fa,#4d8dff);color:#fff;border-color:transparent}' +
      '.ox-donutwrap{display:flex;align-items:center;gap:14px;flex-wrap:wrap}.ox-donut{width:170px;height:170px;flex:none}.ox-dl{font-size:9px;letter-spacing:.06em;fill:#5b6b85}.ox-dv{font-family:var(--font-heading);font-weight:700;letter-spacing:-.02em;font-size:19px;fill:#0b1530}' +
      '.ox-list{flex:1;min-width:150px;display:flex;flex-direction:column;gap:8px}.ox-list>div{display:grid;grid-template-columns:12px 1fr auto auto;gap:8px;align-items:center;font-size:13px}.ox-list i{width:10px;height:10px;border-radius:99px}.ox-list em{font-style:normal;color:#5b6b85;min-width:42px;text-align:right}' +
      '.ox-bars{display:flex;flex-direction:column;gap:10px}.ox-bar{display:grid;grid-template-columns:130px 1fr 84px 52px 92px;gap:10px;align-items:center;font-size:13px}.ox-bt{height:14px;background:rgba(37,99,235,.10);border-radius:99px;overflow:hidden}.ox-bt span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#b7c9ff,#2f6df0)}.ox-barh{font-size:11.5px;color:#5b6b85;font-weight:600}.ox-barh span:nth-child(n+3){text-align:right}.ox-d{font-style:normal;font-weight:700;font-size:12.5px;text-align:right;white-space:nowrap}.ox-d.up{color:#12924f}.ox-d.dn{color:#d6334f}.ox-bar em{font-style:normal;color:#5b6b85;text-align:right}.ox-bl{font-weight:600;color:#0f1b3a}' +
      '.ox-al{display:flex;flex-direction:column;gap:8px;max-height:330px;overflow:auto}.ox-a{display:flex;gap:10px;padding:10px 12px;border-radius:18px;background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.9);font-size:13px}.ox-a span{flex:none;align-self:flex-start;font-size:11px;font-weight:600;padding:2px 9px;border-radius:99px;color:#475569;background:#e3edfb}.ox-a.critical span{background:#ffe3e8;color:#d6334f}.ox-a.watch span{background:#fff3c9;color:#8a5a00}.ox-a.checked span{background:#d9f7e6;color:#12924f}.ox-a b{display:block;color:#0f1b3a;font-weight:600}.ox-a em{font-style:normal;color:#5b6b85;font-size:12px}' +
      '.ox-tw{overflow:auto}.ox-t{width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums}.ox-t th,.ox-t td{padding:10px 5px;text-align:right;white-space:nowrap;position:relative}.ox-t th{font-size:12px;font-weight:600;color:#5b6b85;line-height:1.3;white-space:normal;vertical-align:bottom;border-bottom:1px solid rgba(15,27,58,.10)}.ox-t td{border-bottom:1px solid rgba(15,27,58,.05)}.ox-t .l{text-align:left;min-width:104px;max-width:150px;white-space:normal;line-height:1.25;font-size:13.5px;font-weight:600;color:#0f1b3a}.ox-t td.ox-sp{font-weight:600;color:#0f1b3a}.ox-s{display:block;font-size:11px;font-weight:400;color:#5b6b85;margin-top:1px}.ox-t tr.tot .ox-s{color:#5b78b8}.ox-t th:not(.l){min-width:58px}.ox-gap{font-style:normal;color:#b45309;cursor:help}.ox-t tr.tot td{font-weight:700;color:#1d4ed8;background:rgba(37,99,235,.08)}.ox-t tr.tot td.l{color:#1d4ed8}.ox-t tr.tot td.ox-sp{color:#1d4ed8}.ox-tm td{white-space:normal}.badw{color:#d6334f;font-weight:600}.ox-t td.okw{color:#12924f}' +
      '.ox-db{position:absolute;left:10px;top:50%;height:60%;transform:translateY(-50%);background:rgba(37,99,235,.14);border-radius:99px;max-width:calc(100% - 20px);z-index:0}.ox-db.cost{background:rgba(120,150,210,.22)}.ox-t td{z-index:1}' +
      '.ox-det summary{cursor:pointer;font-family:var(--font-heading);font-weight:700;letter-spacing:-.02em;font-size:22px;color:var(--ox-ink)}' +
      '@media (max-width:1100px){.ox-extra{grid-column:1/-1;grid-template-columns:repeat(2,minmax(0,1fr))}.ox-alw{grid-column:1/-1}.ox-alw .ox-al{grid-template-columns:1fr}.ox-top{grid-template-rows:none}.ox-hero .ox-minibox svg,.ox-hero svg{max-height:190px}.ox-top{grid-template-columns:repeat(2,minmax(0,1fr))}.ox-hgrid b{font-size:19px}}' +
      '@media (max-width:560px){.ox-top{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.ox-hero{padding:18px}.ox-hv{font-size:44px !important}}' +
      '@media (max-width:1100px){.ox-top{grid-template-columns:repeat(2,minmax(0,1fr))}.ox-hero{grid-column:span 2;grid-row:auto}.ox-c4,.ox-c5,.ox-c7{grid-column:span 12}}' +
      '</style><svg width="0" height="0" style="position:absolute"><defs><linearGradient id="oxg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f86f7"/><stop offset="1" stop-color="#a9c8ff"/></linearGradient></defs></svg>';
  }

  paintOX() {
    const root = document.getElementById('ovx');
    if (!root) return false;
    if (!root._ox) {
      root._ox = 1;
      root.addEventListener('click', ev => {
        const fb = ev.target.closest && ev.target.closest('[data-fold]');
        if (fb) {
          const k = fb.getAttribute('data-fold'); this._fold = this._fold || {}; this._fold[k] = !this._fold[k];
          const box = root.querySelector('[data-fbox="' + k + '"]');
          if (box) box.classList.toggle('ox-closed', !!this._fold[k]);
          fb.setAttribute('aria-expanded', String(!this._fold[k])); const ft = fb.querySelector('.ox-ft'); if (ft) ft.textContent = this._fold[k] ? 'Mở rộng' : 'Thu gọn';
          return;
        }
        const t = ev.target.closest && ev.target.closest('[data-tab]');
        if (t) { this.setState({ mtab: t.getAttribute('data-tab') }); return; }
        const g = ev.target.closest && ev.target.closest('[data-m]');
        if (g) this.setState({ month: 'm' + g.getAttribute('data-m') });
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
        const h = el.getAttribute('data-tip');
        if (tip._h !== h) { tip._h = h; tip.innerHTML = h; }
        tip.style.display = 'block';
        const w = tip.offsetWidth, hh = tip.offsetHeight;
        let x = ev.clientX + 16, y = ev.clientY + 16;
        if (x + w > window.innerWidth - 8) x = ev.clientX - w - 16;
        if (y + hh > window.innerHeight - 8) y = ev.clientY - hh - 16;
        tip.style.left = Math.max(8, x) + 'px'; tip.style.top = Math.max(8, y) + 'px';
      });
      root.addEventListener('mouseleave', hide);
    }
    if (!this.dataReady()) return false;
    const cur = this.agg(this.scopeRows()), prev = this.agg(this.prevRows());
    const chCur = this.byChannel(this.scopeRows()).filter(x => x.a.nmv > 0 || x.a.od > 0).sort((a, b) => b.a.nmv - a.a.nmv);
    const chTable = chCur.filter(x => x.a.nmv > 0 || x.a.gmv > 0);
    const chPrev = {}; this.byChannel(this.prevRows()).forEach(x => { chPrev[x.ch.key] = x.a; });
    const spendCh = chTable.filter(x => x.a.sp > 0);
    const gapOn = this.spendGaps().length > 0;
    const sName = x => (x.ch.name.split('· ')[1] || x.ch.name);
    const names = spendCh.map(sName).join(' + ');
    const base = a => ({ nmv: a.nmv, od: a.od, sp: a.sp });
    const sum = list => list.reduce((t, a) => ({ nmv: t.nmv + a.nmv, od: t.od + a.od, sp: t.sp + a.sp }), { nmv: 0, od: 0, sp: 0 });
    const cs = gapOn ? sum(spendCh.map(x => base(x.a))) : base(cur);
    const ps = gapOn ? sum(spendCh.map(x => chPrev[x.ch.key]).filter(Boolean).map(base)) : base(prev);
    const cirS = cs.nmv ? cs.sp / cs.nmv : null, cirP = ps.nmv ? ps.sp / ps.nmv : null;
    const roasS = cs.sp > 0 && cs.nmv ? cs.nmv / cs.sp : null, roasP = ps.sp > 0 && ps.nmv ? ps.nmv / ps.sp : null;
    const cpoS = cs.sp > 0 && cs.od ? cs.sp / cs.od : null, cpoP = ps.sp > 0 && ps.od ? ps.sp / ps.od : null;
    const money = v => this.money(v), num = v => this.num(v);
    const cirT = this.cirTargetOf(null);
    const note = gapOn ? 'trên ' + names : '';
    const card = (grp, label, cv, pv, fmt, o) => Object.assign({ grp: grp, label: label, cv: cv, pv: pv, fmt: fmt }, o || {});
    const main = [
      card('rev', 'Orders (đặt)', cur.ld, prev.ld, num),
      card('cost', 'CIR', cirS, cirP, v => this.pct(v, 2), { lower: true, extra: (cirT && cirS != null ? 'KPI ' + this.pct(cirT, 2) + (cirS > cirT ? ' · vượt' : ' · đạt') : '') + (note ? (cirT ? ' · ' : '') + note : '') }),
      card('cost', 'ROAS', roasS, roasP, v => v == null ? '—' : '×' + v.toFixed(1), { extra: note }),
      card('q', 'Cancel rate', cur.cancel, prev.cancel, v => this.pct(v, 1), { lower: true, extra: 'GMV hủy ' + money(cur.gmv - cur.nmv) })
    ];
    const more = [
      card('rev', 'GMV', cur.gmv, prev.gmv, money),
      card('rev', 'Completed orders', cur.od, prev.od, num),
      card('rev', 'AOV', cur.aov, prev.aov, money),
      card('cost', 'CPO', cpoS, cpoP, money, { lower: true, extra: note }),
      card('q', 'Sale CVR', cur.cvr, prev.cvr, v => this.pct(v, 1))
    ];
    const html = this.OX_CSS() + '<div class="ox">' + this.warnBanner(names) +
      '<section class="ox-top">' + this.heroHtml(cur, prev) + main.map(c => this.cardHtml(c)).join('') + this.alertsHtml(this.buildAlerts(chCur, chPrev, cur)) + '<div class="ox-extra">' + more.map(c => this.cardHtml(c)).join('') + '</div></section>' +
      '<section class="ox-charts">' +
      this.tableHtml(cur, chTable, chPrev) +
      this.chMonthly() + this.chCirMonth() +
      this.chMetrics() + this.chWaterfall(cur) +
      this.chStack() + this.chKpiChannel() +
      this.chCategory() + this.methodHtml() + '</section></div>';
    if (root._html !== html) { root._html = html; root.innerHTML = html; }
    return true;
  }

  renderVals() {
    if (!this.dataReady()) return {};
    const D = this.D(), R = React.createElement;
    const DS = window.BlueStonePerformanceDesignSystem_fd579b || {};
    clearTimeout(this._pt);
    let tries = 0;
    const go = () => { try { if (!this.paintOX() && tries++ < 40) this._pt = setTimeout(go, 100); } catch (e) { console.error('ox paint', e); } };
    this._pt = setTimeout(go, 0);

    const cur = this.agg(this.scopeRows());
    const mNum = this.monthNum();
    const months = [];
    for (let m = 1; m <= this.lastMonth(); m++) months.push({ value: 'm' + m, label: 'T' + m + (this.isPartial(m) ? '*' : '') });
    months.push({ value: 'ytd', label: 'YTD' });
    const periodChips = DS.FilterChips ? R(DS.FilterChips, { label: 'Period', options: months, value: this.monthKey(), onChange: v => this.setState({ month: v }) }) : null;
    const pacing = this.ytdScope()
      ? { tag: 'Cumulative', share: D.dates.length / (D.dates.length + (this.daysIn(mNum) - this.lastDay())),
          text: 'YTD ' + this.vnDate(D.dates[0]) + ' – ' + this.vnDate(this.lastIso()) + ' · ' + D.dates.length + ' days with data' + (this.isPartial(mNum) ? ' · T' + mNum + ' chỉ có ' + this.lastDay() + '/' + this.daysIn(mNum) + ' ngày — không so T' + mNum + ' trực diện với tháng đủ.' : '.') }
      : (this.isPartial(mNum)
        ? { tag: 'Day ' + this.lastDay() + '/' + this.daysIn(mNum), share: this.lastDay() / this.daysIn(mNum),
            text: 'Left ' + (this.daysIn(mNum) - this.lastDay()) + ' ngày · đã đi ' + (this.lastDay() / this.daysIn(mNum) * 100).toFixed(0) + '% tháng · hệ số ước tính cả tháng ×' + this.runRate(mNum).toFixed(2) + ' · delta vs ' + this.prevLabel() + ' cùng số ngày.' }
        : { tag: 'Full ' + cur.nDays + ' days', share: 1, text: 'Tháng đã kết thúc — số liệu đầy đủ, không cần ước tính.' });
    return {
      navItems: [
        { id: 'ovnew', label: 'Overview', href: 'Overview New.dc.html' }, { id: 'ovkpi', label: 'Overview KPI', href: 'Overview KPI.dc.html' },
        { id: 'dailynew', label: 'Daily Tracking', href: 'Daily Tracking New.dc.html' },
        { id: 'onsite', label: 'Onsite Shopee', href: 'Onsite Shopee.dc.html' },
        { id: 'tiktok', label: 'Onsite TikTok Shop', href: 'Onsite Tiktok Shop.dc.html' },
        { id: 'ppnew', label: 'Product Performance', href: 'PP New.dc.html' }, { id: 'dataraw', label: 'Data Raw', href: 'Data Raw.dc.html' }],
      railFooter: R('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' } },
        R('div', { style: { fontSize: 12, letterSpacing: 'var(--tracking-kicker)', textTransform: 'uppercase', color: 'var(--text-faint)' } }, 'Data period'),
        R('div', { className: 'tabular', style: { fontSize: 14.5, color: 'var(--text-secondary)' } }, this.vnDate(D.dates[0]) + ' – ' + this.vnDate(this.lastIso())),
        R('div', { style: { fontSize: 13.5, color: 'var(--text-faint)', lineHeight: 1.45 } }, 'Nguồn: New Project (Order_data + chi phí Shopee Onsite/Offsite, TikTok, Facebook, Google). Spend: ' + D.channels.filter(c => c.spendable).map(c => c.key + ' → ' + (c.spendLast ? this.dayLabel(c.spendLast) : '—')).join(', ') + '. KPI: KPI Monthly Plan 2026.xlsx (T1–T12).')),
      headerSubtitle: 'Hiệu quả chi phí và tiến độ KPI toàn kênh Ecom — ' + this.scopeLabel() + (!this.ytdScope() && this.isPartial(mNum) ? ' · T' + mNum + '* = tháng dở (' + this.lastDay() + '/' + this.daysIn(mNum) + ' ngày), so sánh cùng số ngày với ' + this.prevLabel() : ''),
      periodChips: periodChips,
      pacing: pacing
    };
  }
}
