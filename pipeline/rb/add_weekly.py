import os, sys, json, re, uuid
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bundle, add_hero

RB = os.path.dirname(os.path.abspath(__file__))
HREF = 'Weekly Tracking.dc.html'
OLD = "{ id: 'ovkpi', label: 'Overview KPI', href: 'Overview KPI.dc.html' },"
NEW = OLD + " { id: 'weekly', label: 'Weekly Tracking', href: '" + HREF + "' },"


def run(path, data_path):
    o = bundle.Outer(open(path, encoding='utf8').read())
    pages = o.pages()
    # 1) thêm mục Weekly Tracking vào menu của mọi trang (ngay sau Overview KPI)
    for pid, u in pages.items():
        d = bundle.Doc(o.get(u).decode('utf8'))
        n = d.tpl.count(OLD)
        if n < 1:
            raise SystemExit('weekly nav anchor missing in %s' % pid)
        d.tpl = d.tpl.replace(OLD, NEW)
        o.set(u, d.dump().encode('utf8'))
    # 2) nhân bản trang Product Performance thành trang Weekly Tracking
    d = bundle.Doc(o.get(pages['pp']).decode('utf8')); t = d.tpl
    a = t.index('<script type="text/x-dc" data-dc-script'); gt = t.index('>', a) + 1; b = t.index('</script>', gt)
    s = t[gt:b]
    assert s.count('class Component extends DCLogic {') == 1
    s = s.replace('class Component extends DCLogic {', 'class PPBase extends DCLogic {')
    W = json.load(open(data_path))
    lm, ld = int(W['last'][5:7]), int(W['last'][8:10])
    wk = 1 if ld <= 7 else 2 if ld <= 14 else 3 if ld <= 21 else 4
    nav = add_hero.NAVJS.replace(OLD, NEW)
    js = open(os.path.join(RB, 'weekly.js'), encoding='utf8').read()
    js = js.replace('__WK_MO__', str(lm)).replace('__WK_WK__', str(wk)).replace('__NAV__', nav)
    js = js.replace('__WEEKLY_DATA__', json.dumps(W, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/'))
    t = t[:gt] + s.rstrip() + '\n\n' + js + '\n' + t[b:]
    for old, new in [('active="ppnew"', 'active="weekly"'), ('kicker="Trang 05 · Nhóm hàng và SKU"', 'kicker="Báo cáo tổng hợp · theo tuần"'),
                     ('title="Product Performance"', 'title="Weekly Tracking"'), ('data-screen-label="Product Performance"', 'data-screen-label="Weekly Tracking"'),
                     ('<div id="ppx"></div>', '<div id="wkx"></div>')]:
        if t.count(old) != 1:
            raise SystemExit('weekly anchor %r %d' % (old, t.count(old)))
        t = t.replace(old, new)
    t = re.sub(r'<title>[^<]*</title>', '<title>Weekly Tracking</title>', t, count=1)
    d.tpl = t
    nu = str(uuid.uuid5(uuid.NAMESPACE_URL, 'bluestone-weekly-page'))
    o.man[nu] = dict(o.man[pages['pp']]); o.set(nu, d.dump().encode('utf8'))
    # 3) đăng ký trang trong bộ định tuyến ngoài
    m = bundle._blk(o.html, 'ext_resources'); er = json.loads(m.group(1))
    er = [x for x in er if x['id'] != 'weekly'] + [{'id': 'weekly', 'uuid': nu}]
    o.html = o.html[:m.start(1)] + json.dumps(er) + o.html[m.end(1):]
    k = "'Overview KPI.dc.html': 'ovkpi',"
    if o.tpl.count(k) != 1:
        raise SystemExit('router anchor missing')
    o.tpl = o.tpl.replace(k, k + " '" + HREF + "': 'weekly',")
    open(path, 'w', encoding='utf8').write(o.dump())
    print('weekly page added', nu)


if __name__ == '__main__':
    run(sys.argv[1], sys.argv[2])
