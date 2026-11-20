function NavRail({
  brand = 'BlueStone',
  product = 'Performance',
  groupLabel = 'Báo cáo',
  items = [],
  active,
  onSelect,
  footer,
  style
}) {
  const [hover, setHover] = React.useState('');
  const [shut, setShut] = React.useState({});
  const SUM = ['ovnew', 'ovkpi', 'dailynew', 'ppnew'];
  const groups = [{
    key: 'sum',
    label: 'Báo cáo tổng hợp',
    list: SUM.map(id => items.find(it => it.id === id)).filter(Boolean)
  }, {
    key: 'ch',
    label: 'Kênh & dữ liệu',
    list: items.filter(it => SUM.indexOf(it.id) < 0)
  }].filter(g => g.list.length);
  const h = React.createElement;
  return h('aside', {
    style: {
      width: 'var(--rail-width)',
      flex: 'none',
      minHeight: '100vh',
      background: 'var(--surface-rail)',
      borderRight: '1px solid var(--border-hairline)',
      padding: 'var(--space-6) var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-8)',
      ...style
    }
  }, h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, h('div', {
    style: {
      font: 'var(--font-heading-weight) 17px var(--font-heading)',
      letterSpacing: 'var(--tracking-title)'
    }
  }, brand), h('div', {
    style: {
      fontSize: 11,
      letterSpacing: 'var(--tracking-kicker)',
      textTransform: 'uppercase',
      color: 'var(--color-accent)'
    }
  }, product)), h('nav', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 'var(--space-4)'
    }
  }, groups.map(g => {
    const hasActive = g.list.some(it => it.id === active), closed = !!shut[g.key] && !hasActive;
    return h('div', {
      key: g.key,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }
    }, h('button', {
      type: 'button',
      'aria-expanded': !closed,
      onClick: () => setShut(s => ({
        ...s,
        [g.key]: !s[g.key]
      })),
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-2)',
        width: '100%',
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        font: 'inherit',
        fontSize: 10,
        letterSpacing: 'var(--tracking-kicker)',
        textTransform: 'uppercase',
        color: hasActive ? 'var(--color-accent)' : 'var(--text-faint)',
        fontWeight: 700,
        padding: 'var(--space-2) var(--space-2) var(--space-1)',
        textAlign: 'left'
      }
    }, h('span', null, g.label), h('svg', {
      viewBox: '0 0 24 24',
      width: 12,
      height: 12,
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2.6,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      style: {
        transform: closed ? 'rotate(-90deg)' : 'none',
        transition: 'transform .15s'
      },
      'aria-hidden': true
    }, h('path', {
      d: 'm6 9 6 6 6-6'
    }))), !closed && h('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        marginLeft: 'var(--space-2)',
        paddingLeft: 'var(--space-1)',
        borderLeft: '2px solid ' + (hasActive ? 'var(--color-accent)' : 'var(--border-hairline)')
      }
    }, g.list.map((it, i) => h('a', {
      key: it.id || i,
      href: it.href || '#',
      'aria-current': it.id === active ? 'page' : undefined,
      onClick: onSelect ? e => {
        e.preventDefault();
        onSelect(it.id);
      } : undefined,
      onMouseEnter: () => setHover(it.id),
      onMouseLeave: () => setHover(''),
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        borderRadius: 'var(--radius-md)',
        fontSize: 13.5,
        textDecoration: 'none',
        fontWeight: it.id === active ? 600 : 400,
        color: it.id === active ? 'var(--color-accent)' : 'var(--color-text)',
        background: it.id === active ? 'var(--state-hover)' : hover === it.id ? 'var(--state-hover)' : 'transparent'
      }
    }, h('span', null, it.label), h('span', {
      style: {
        fontSize: 10,
        color: 'var(--text-faint)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, String(i + 1).padStart(2, '0'))))));
  })), footer && h('div', {
    style: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }
  }, footer));
}
