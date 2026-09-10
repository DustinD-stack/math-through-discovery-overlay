/* ============================================================
   Layer 5 — Main math modules
   Every module has the same shape:  fn(spec, lesson) -> Node
   Register a new one at the bottom and it becomes available to
   every lesson and to the control panel dropdown immediately.
   ============================================================ */

import { el, svg, esc } from '../utils/dom.js';
import { renderMath } from '../utils/math-render.js';
import { EquationWorkspace } from '../components/equation-workspace.js';
import { PlaceValueBreakdown } from '../components/place-value-breakdown.js';
import { fmtNum, arcPath } from './_svg.js';

const C = {
  structure: 'var(--c-structure)', correct: 'var(--c-correct)', adjust: 'var(--c-adjust)',
  transform: 'var(--c-transform)', error: 'var(--c-error)', discover: 'var(--c-discover)',
  strategy: 'var(--c-strategy)', line: 'var(--line-2)', text: 'var(--t-hi)', low: 'var(--t-low)',
};
const palette = [C.structure, C.strategy, C.adjust, C.transform, C.correct, C.discover];

const wrap = (caption, ...kids) =>
  el('div', { class: 'diagram anim-fade' }, kids, caption && el('div', { class: 'diagram__caption' }, caption));

/* ---------- Number bond ----------
   WHOLE decomposes into PARTs that recombine to the same WHOLE.
   Legacy spec { total, parts, caption } renders exactly as before.
   Rich spec adds: labels[], reveal ('all'|'whole'|'parts'|n),
   highlightPart, and '?'/null part values (or unknownWhole) for
   an unknown. */
function bondIsRich(spec) {
  return spec.reveal != null || spec.labels != null || spec.highlightPart != null
    || spec.unknownWhole === true
    || (Array.isArray(spec.parts) && spec.parts.some((p) => p === '?' || p == null));
}

export function NumberBond(spec = {}) {
  const total = spec.total ?? 100;
  const parts = spec.parts ?? [60, 40];
  const w = 460, h = 250;
  const cx = w / 2, topY = 46, botY = 196, r = 40;
  const n = parts.length;
  const xs = parts.map((_, i) => (w / (n + 1)) * (i + 1));

  if (!bondIsRich(spec)) {
    return wrap(spec.caption,
      svg('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': `Number bond: ${total} splits into ${parts.join(' and ')}` },
        xs.map((x) => svg('line', {
          x1: cx, y1: topY + r, x2: x, y2: botY - r,
          stroke: C.line, 'stroke-width': 3, 'stroke-linecap': 'round', class: 'branch-draw',
        })),
        svg('circle', { cx, cy: topY, r, fill: 'none', stroke: C.structure, 'stroke-width': 4 }),
        svg('text', { x: cx, y: topY + 9, 'text-anchor': 'middle', fill: C.text, style: 'font:700 26px var(--font-ui)' }, String(total)),
        xs.map((x, i) => [
          svg('circle', { cx: x, cy: botY, r, fill: 'none', stroke: i === 0 ? C.correct : C.adjust, 'stroke-width': 4 }),
          svg('text', { x, y: botY + 9, 'text-anchor': 'middle', fill: C.text, style: 'font:700 26px var(--font-ui)' }, String(parts[i])),
        ]),
      ),
    );
  }

  /* ---- rich / stateful ---- */
  const labels = spec.labels || [];
  const rv = spec.reveal;
  const wholeShown = spec.unknownWhole !== true && rv !== 'parts'
    && !(typeof rv === 'number' && rv < 0);
  const partShown = (i) => {
    if (parts[i] === '?' || parts[i] == null) return false;
    if (rv === 'whole') return false;
    if (typeof rv === 'number') return i < rv;
    return true; // 'all' | 'parts' | undefined
  };
  const wholeActive = spec.highlightPart === 'whole';
  const circleText = (shown, val) => (shown ? String(val) : '?');

  const nodeCircle = (x, y, shown, active, stroke) => svg('circle', {
    cx: x, cy: y, r,
    fill: active ? `color-mix(in srgb, ${stroke} 16%, transparent)` : 'none',
    stroke, 'stroke-width': active ? 6 : 4,
    'stroke-dasharray': shown ? null : '5 7',
    opacity: shown ? 1 : 0.5,
    class: `nb__circle is-${active ? 'active' : (shown ? 'complete' : 'inactive')}`,
  });
  const nodeText = (x, y, str, shown) => svg('text', {
    x, y: y + 9, 'text-anchor': 'middle',
    fill: shown ? C.text : C.low,
    style: `font:700 ${shown ? 26 : 30}px var(--font-ui)`,
  }, str);
  const subLabel = (x, y, str) => (str
    ? svg('text', { x, y, 'text-anchor': 'middle', class: 'svg-label' }, str)
    : null);

  const spoken = [
    `Number bond. Whole ${circleText(wholeShown, total)}`,
    `parts ${parts.map((p, i) => circleText(partShown(i), p)).join(', ')}`,
    'the parts combine to the whole',
  ].join('. ');

  return wrap(spec.caption,
    svg('svg', { viewBox: `0 0 ${w} ${h + 26}`, role: 'img', 'aria-label': spoken },
      xs.map((x, i) => svg('line', {
        x1: cx, y1: topY + r, x2: x, y2: botY - r,
        stroke: C.line, 'stroke-width': 3, 'stroke-linecap': 'round',
        'stroke-dasharray': partShown(i) || wholeShown ? null : '4 8',
        class: 'branch-draw',
      })),
      /* plus signs between adjacent parts - "combine" cue, not colour */
      xs.slice(1).map((x, i) => svg('text', {
        x: (xs[i] + xs[i + 1]) / 2, y: botY + 8, 'text-anchor': 'middle',
        fill: C.low, style: 'font:700 22px var(--font-ui)',
      }, '+')),
      nodeCircle(cx, topY, wholeShown, wholeActive, C.structure),
      nodeText(cx, topY, circleText(wholeShown, total), wholeShown),
      subLabel(cx, topY + r + 20, labels[0]),
      xs.map((x, i) => {
        const shown = partShown(i);
        const active = spec.highlightPart === i;
        return [
          nodeCircle(x, botY, shown, active, i === 0 ? C.correct : C.adjust),
          nodeText(x, botY, circleText(shown, parts[i]), shown),
          subLabel(x, botY + r + 20, labels[i + 1]),
        ];
      }),
    ),
  );
}

/* ---------- Fraction bar ----------
   WHOLE -> equal partitions -> selected partitions.
   Legacy spec { rows:[{label,denominator,shaded,showNumbers}], caption }
   (or flat { label, denominator, shaded }) renders exactly as before.
   Rich spec adds: per-row `reveal` (cells shown) and `state`;
   top-level `activeRow`, and `marker:true` for an equal-length guide
   that makes 1/2 = 4/8 visible before it is calculated. */
function barIsRich(spec) {
  const rows = spec.rows || [];
  return spec.reveal != null || spec.marker === true || spec.activeRow != null
    || rows.some((r) => r && (r.reveal != null || r.state != null));
}

export function FractionBar(spec = {}) {
  const rows = spec.rows || [{ label: spec.label || '', denominator: spec.denominator ?? 4, shaded: spec.shaded ?? 1 }];

  if (!barIsRich(spec)) {
    return wrap(spec.caption,
      el('div', { class: 'fbar-stack' },
        rows.map((row, ri) => el('div', { class: 'fbar-row' },
          el('div', { class: 'fbar-row__label' }, row.label ? renderMath(row.label) : ''),
          el('div', { class: 'fbar' },
            Array.from({ length: row.denominator }, (_, i) =>
              el('div', {
                class: `fbar__cell${i < row.shaded ? (ri % 2 ? ' is-on-alt' : ' is-on') : ''} anim-fade stagger`,
                style: { '--i': i },
              }, row.showNumbers ? `1/${row.denominator}` : ''),
            ),
          ),
        )),
      ),
    );
  }

  /* ---- rich / stateful ---- */
  const activeRow = spec.activeRow;
  const topReveal = spec.reveal;

  return wrap(spec.caption,
    el('div', { class: 'fbar-stack fbar-stack--rich' },
      rows.map((row, ri) => {
        const denom = row.denominator ?? 4;
        const shaded = row.shaded ?? 0;
        const reveal = row.reveal ?? topReveal ?? denom;
        const state = row.state || (activeRow == null ? null : (activeRow === ri ? 'active' : 'muted'));
        return el('div', {
          class: `fbar-row fbar-row--rich${state ? ` is-${state}` : ''}`,
          role: 'img',
          'aria-label': `${row.label || `${shaded} of ${denom}`}: ${shaded} of ${denom} parts selected`,
        },
          el('div', { class: 'fbar-row__label', 'aria-hidden': 'true' }, row.label ? renderMath(row.label) : ''),
          el('div', { class: 'fbar fbar--rich' },
            Array.from({ length: denom }, (_, i) => {
              const selected = i < shaded;
              const pending = i >= reveal;
              const glyph = row.showNumbers ? `1/${denom}` : (selected ? '■' : '□');
              return el('div', {
                class: `fbar__cell${selected ? (ri % 2 ? ' is-on-alt' : ' is-on') : ''}`
                  + `${selected ? ' fbar__cell--sel' : ''}${pending ? ' is-pending' : ' anim-fade stagger'}`,
                style: { '--i': i },
                'aria-hidden': 'true',
              }, pending ? '' : glyph);
            }),
            spec.marker
              ? el('div', {
                  class: 'fbar__guide',
                  style: { left: `${(shaded / denom) * 100}%` },
                  'aria-hidden': 'true',
                }, el('span', { class: 'fbar__guide-tag' }, ri === 0 ? 'same length' : ''))
              : null,
          ),
        );
      }),
    ),
  );
}

/* ---------- Percent bar ---------- */
export function PercentBar(spec = {}) {
  const pct = Math.max(0, Math.min(100, spec.percent ?? 25));
  return wrap(spec.caption,
    el('div', {},
      el('div', { class: 'pbar' },
        el('div', { class: 'pbar__fill anim-fill', style: { transform: `scaleX(${pct / 100})` } }),
        el('div', { class: 'pbar__label' },
          el('span', {}, spec.leftLabel || `${pct}%`),
          el('span', { style: { color: 'var(--t-mid)' } }, spec.rightLabel || `${100 - pct}%`),
        ),
      ),
      el('div', { class: 'pbar__ticks' }, ['0%', '25%', '50%', '75%', '100%'].map((t) => el('span', {}, t))),
      spec.of && el('div', { class: 'diagram__caption', style: { marginTop: 'var(--s-2)' } }, `of ${spec.of}`),
    ),
  );
}

/* ---------- Number line ----------
   A reasoning surface. Legacy spec { min, max, ticks, jump, marks, caption }
   renders exactly as before. Rich spec adds: minorTicks, jumps[] (with
   per-jump label / state), reveal (count of jumps shown), and marks with
   `labels: [..]` (many forms, one location -> another proof of SAME VALUE)
   or `state`. Negative / fractional / decimal domains work in both paths. */
function lineIsRich(spec) {
  return spec.minorTicks != null || Array.isArray(spec.jumps) || spec.reveal != null
    || (spec.marks || []).some((m) => m && (Array.isArray(m.labels) || m.state != null));
}

export function NumberLine(spec = {}) {
  const min = spec.min ?? 0, max = spec.max ?? 10;
  const ticks = spec.ticks ?? (max - min);
  const marks = spec.marks || [];

  if (!lineIsRich(spec)) {
    const w = 520, h = 120, pad = 34, y = 62;
    const X = (v) => pad + ((v - min) / (max - min)) * (w - pad * 2);
    return wrap(spec.caption,
      svg('svg', { viewBox: `0 0 ${w} ${h}` },
        svg('line', { x1: pad, y1: y, x2: w - pad, y2: y, class: 'svg-axis', 'marker-end': '' }),
        Array.from({ length: ticks + 1 }, (_, i) => {
          const v = min + (i * (max - min)) / ticks;
          return [
            svg('line', { x1: X(v), y1: y - 10, x2: X(v), y2: y + 10, class: 'svg-axis' }),
            svg('text', { x: X(v), y: y + 32, 'text-anchor': 'middle', class: 'svg-label' }, fmtNum(v)),
          ];
        }),
        spec.jump && svg('path', {
          d: arcPath(X(spec.jump.from), X(spec.jump.to), y - 12),
          fill: 'none', stroke: C.adjust, 'stroke-width': 3, class: 'branch-draw',
        }),
        spec.jump && svg('text', { x: (X(spec.jump.from) + X(spec.jump.to)) / 2, y: y - 44, 'text-anchor': 'middle', class: 'svg-hand', style: `fill:${C.adjust}` }, spec.jump.label || ''),
        marks.map((m, i) => [
          svg('circle', { cx: X(m.value), cy: y, r: 8, fill: m.color || palette[i % palette.length] }),
          svg('text', { x: X(m.value), y: y - 20, 'text-anchor': 'middle', class: 'svg-value' }, m.label || fmtNum(m.value)),
        ]),
      ),
    );
  }

  /* ---- rich / stateful ---- */
  const jumps = spec.jumps || (spec.jump ? [spec.jump] : []);
  const reveal = spec.reveal;
  const minor = spec.minorTicks || 0;
  const w = 560, pad = 44, y = 96;
  const jumpBand = jumps.length ? 26 + jumps.length * 20 : 24;
  const h = y + 44;
  const X = (v) => pad + ((v - min) / (max - min || 1)) * (w - pad * 2);
  const jumpShown = (i) => (typeof reveal === 'number' ? i < reveal : true);

  const spoken = [
    `Number line from ${fmtNum(min)} to ${fmtNum(max)}`,
    jumps.length ? `jumps: ${jumps.map((j) => `${fmtNum(j.from)} to ${fmtNum(j.to)}${j.label ? ` (${j.label})` : ''}`).join(', ')}` : '',
    marks.length ? `points: ${marks.map((m) => (m.labels ? m.labels.join(' = ') : (m.label || fmtNum(m.value)))).join(', ')}` : '',
  ].filter(Boolean).join('. ');

  return wrap(spec.caption,
    svg('svg', { viewBox: `0 0 ${w} ${h + jumpBand}`, role: 'img', 'aria-label': spoken },
      /* jump arcs live above the axis */
      svg('g', { transform: `translate(0, ${jumpBand})` },
        svg('line', { x1: pad, y1: y, x2: w - pad, y2: y, class: 'svg-axis' }),
        Array.from({ length: ticks + 1 }, (_, i) => {
          const v = min + (i * (max - min)) / ticks;
          const isZero = Math.abs(v) < 1e-9;
          return [
            svg('line', { x1: X(v), y1: y - 11, x2: X(v), y2: y + 11, class: 'svg-axis', 'stroke-width': isZero ? 3 : 2 }),
            svg('text', { x: X(v), y: y + 32, 'text-anchor': 'middle', class: 'svg-label' }, fmtNum(v)),
            minor && i < ticks
              ? Array.from({ length: minor }, (_, k) => {
                  const mv = v + ((k + 1) * (max - min)) / ticks / (minor + 1);
                  return svg('line', { x1: X(mv), y1: y - 5, x2: X(mv), y2: y + 5, class: 'svg-grid' });
                })
              : null,
          ];
        }),
        jumps.map((j, i) => {
          const shown = jumpShown(i);
          const active = j.state === 'active';
          const stroke = active ? C.discover : C.adjust;
          const rise = 20 + (jumps.length - i) * 16;
          return [
            svg('path', {
              d: arcPath(X(j.from), X(j.to), y - 10, rise),
              fill: 'none', stroke, 'stroke-width': active ? 4 : 3,
              'stroke-dasharray': shown ? null : '4 7',
              opacity: shown ? 1 : 0.35,
              class: 'branch-draw',
            }),
            svg('text', {
              x: (X(j.from) + X(j.to)) / 2, y: y - 8 - rise,
              'text-anchor': 'middle', class: 'svg-hand',
              style: `fill:${stroke}`, opacity: shown ? 1 : 0.35,
            }, j.label || ''),
          ];
        }),
        marks.map((m, i) => {
          const st = m.state || 'complete';
          const labels = Array.isArray(m.labels) ? m.labels : [m.label || fmtNum(m.value)];
          const fill = st === 'inactive' ? 'none' : (m.color || palette[i % palette.length]);
          return [
            svg('circle', {
              cx: X(m.value), cy: y, r: st === 'active' ? 10 : 8,
              fill, stroke: m.color || palette[i % palette.length], 'stroke-width': 3,
              'stroke-dasharray': st === 'inactive' ? '3 4' : null,
              class: `nline__mark is-${st}`,
            }),
            labels.map((t, k) => svg('text', {
              x: X(m.value), y: y - 20 - k * 17, 'text-anchor': 'middle', class: 'svg-value',
            }, t)),
          ];
        }),
      ),
    ),
  );
}

/* ---------- Double number line ---------- */
export function DoubleNumberLine(spec = {}) {
  const top = spec.top || { label: 'Dollars', values: [0, 7.5, 15, 22.5, 30] };
  const bot = spec.bottom || { label: 'Hours', values: [0, 1, 2, 3, 4] };
  const w = 560, pad = 46, y1 = 54, y2 = 132;
  const n = Math.max(top.values.length, bot.values.length);
  const X = (i) => pad + (i * (w - pad * 2)) / (n - 1);
  const line = (row, y, color) => [
    svg('line', { x1: pad, y1: y, x2: w - pad, y2: y, class: 'svg-axis' }),
    svg('text', { x: 4, y: y - 16, class: 'svg-label' }, row.label),
    row.values.map((v, i) => [
      svg('line', { x1: X(i), y1: y - 8, x2: X(i), y2: y + 8, stroke: color, 'stroke-width': 3 }),
      svg('text', { x: X(i), y: y - 16, 'text-anchor': 'middle', class: 'svg-value' }, String(v)),
    ]),
  ];
  return wrap(spec.caption,
    svg('svg', { viewBox: `0 0 ${w} 176` },
      line(top, y1, C.structure),
      line(bot, y2, C.strategy),
      Array.from({ length: n }, (_, i) =>
        svg('line', { x1: X(i), y1: y1 + 8, x2: X(i), y2: y2 - 8, stroke: C.line, 'stroke-width': 1, 'stroke-dasharray': '4 6' })),
    ),
  );
}

/* ---------- Array model ---------- */
export function ArrayModel(spec = {}) {
  const rows = spec.rows ?? 4, cols = spec.cols ?? 6;
  const size = 34, gap = 6, pad = 6;
  const w = cols * (size + gap) + pad * 2, h = rows * (size + gap) + pad * 2;
  return wrap(spec.caption || `${rows} \u00D7 ${cols} = ${rows * cols}`,
    svg('svg', { viewBox: `0 0 ${w} ${h}`, style: `max-width:${w * 1.4}px;margin:0 auto` },
      Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) =>
        svg('rect', {
          x: pad + c * (size + gap), y: pad + r * (size + gap), width: size, height: size, rx: 6,
          fill: spec.split && c >= spec.split ? C.adjust : C.structure,
          opacity: .85,
        }),
      )),
    ),
  );
}

/* ---------- Area model ---------- */
export function AreaModel(spec = {}) {
  const a = spec.rowParts || [10, 4];
  const b = spec.colParts || [10, 3];
  const w = 460, h = 300, pad = 46;
  const totalA = a.reduce((s, v) => s + v, 0), totalB = b.reduce((s, v) => s + v, 0);
  const cw = (w - pad) , ch = (h - pad);
  let yAcc = 0;
  const cells = a.map((av, i) => {
    const cellH = (av / totalA) * ch;
    let xAcc = 0;
    const row = b.map((bv, j) => {
      const cellW = (bv / totalB) * cw;
      const node = [
        svg('rect', { x: pad + xAcc, y: yAcc, width: cellW, height: cellH, fill: palette[(i + j) % palette.length], opacity: .22, stroke: C.line }),
        svg('text', { x: pad + xAcc + cellW / 2, y: yAcc + cellH / 2 + 7, 'text-anchor': 'middle', class: 'svg-value' }, String(av * bv)),
      ];
      xAcc += cellW;
      return node;
    });
    const label = svg('text', { x: pad - 12, y: yAcc + cellH / 2 + 6, 'text-anchor': 'end', class: 'svg-label' }, String(av));
    yAcc += cellH;
    return [row, label];
  });
  let xAcc2 = 0;
  const colLabels = b.map((bv) => {
    const cellW = (bv / totalB) * cw;
    const t = svg('text', { x: pad + xAcc2 + cellW / 2, y: h - 12, 'text-anchor': 'middle', class: 'svg-label' }, String(bv));
    xAcc2 += cellW;
    return t;
  });
  return wrap(spec.caption || `${totalA} \u00D7 ${totalB} = ${totalA * totalB}`,
    svg('svg', { viewBox: `0 0 ${w} ${h}` }, cells, colLabels),
  );
}

/* ---------- Ratio table ---------- */
export function RatioTable(spec = {}) {
  const cols = spec.columns || ['Cups of flour', 'Cups of water'];
  const rows = spec.rows || [[2, 3], [4, 6], [6, 9]];
  return wrap(spec.caption,
    el('table', { class: 'mtable' },
      el('thead', {}, el('tr', {}, cols.map((c) => el('th', {}, c)))),
      el('tbody', {}, rows.map((r, i) => el('tr', { class: 'anim-slide-up stagger', style: { '--i': i } },
        r.map((v) => el('td', { class: spec.keyRow === i ? 'is-key' : '' }, String(v))),
      ))),
    ),
  );
}

/* ---------- Unit rate table ---------- */
export function UnitRateTable(spec = {}, lesson = {}) {
  const label = spec.quantityLabel || 'Hours';
  const valueLabel = spec.valueLabel || 'Pay';
  const rows = spec.rows || [
    [spec.totalQuantity ?? 160, spec.totalValue ?? '$1,200'],
    [1, spec.unitValue ?? '$7.50'],
  ];
  return wrap(spec.caption || 'Compare everything to one unit',
    el('table', { class: 'mtable' },
      el('thead', {}, el('tr', {}, el('th', {}, label), el('th', {}, valueLabel))),
      el('tbody', {}, rows.map((r, i) => el('tr', { class: 'anim-slide-up stagger', style: { '--i': i } },
        el('td', { class: r[0] === 1 ? 'is-unit' : '' }, String(r[0])),
        el('td', { class: r[0] === 1 ? 'is-key' : '' }, String(r[1])),
      ))),
    ),
  );
}

/* ---------- Balance model ---------- */
export function BalanceModel(spec = {}) {
  return wrap(spec.caption,
    el('div', { class: 'balance' },
      el('div', { class: 'balance__pans' },
        el('div', { class: 'balance__pan is-left anim-slide-right' }, renderMath(spec.left ?? '2x + 3')),
        el('div', { class: 'balance__eq' }, spec.relation || '='),
        el('div', { class: 'balance__pan is-right anim-slide-left' }, renderMath(spec.right ?? '11')),
      ),
      spec.move && el('div', { class: 'diagram__caption' }, spec.move),
    ),
  );
}

/* ---------- Coordinate graph ---------- */
export function CoordinateGraph(spec = {}) {
  const xMax = spec.xMax ?? 10, yMax = spec.yMax ?? 10;
  const w = 460, h = 340, pad = 44;
  const X = (v) => pad + (v / xMax) * (w - pad * 1.4);
  const Y = (v) => h - pad - (v / yMax) * (h - pad * 1.5);
  const pts = spec.points || [];
  const lines = spec.lines || [];
  return wrap(spec.caption,
    el('div', { class: 'graph' },
      svg('svg', { viewBox: `0 0 ${w} ${h}` },
        Array.from({ length: xMax + 1 }, (_, i) => svg('line', { x1: X(i), y1: Y(0), x2: X(i), y2: Y(yMax), class: 'svg-grid' })),
        Array.from({ length: yMax + 1 }, (_, i) => svg('line', { x1: X(0), y1: Y(i), x2: X(xMax), y2: Y(i), class: 'svg-grid' })),
        svg('line', { x1: X(0), y1: Y(0), x2: X(xMax), y2: Y(0), class: 'svg-axis' }),
        svg('line', { x1: X(0), y1: Y(0), x2: X(0), y2: Y(yMax), class: 'svg-axis' }),
        lines.map((ln, i) => svg('line', {
          x1: X(ln.from[0]), y1: Y(ln.from[1]), x2: X(ln.to[0]), y2: Y(ln.to[1]),
          stroke: ln.color || palette[i % palette.length], 'stroke-width': 4, 'stroke-linecap': 'round', class: 'branch-draw',
        })),
        pts.map((p, i) => [
          svg('circle', { cx: X(p.x), cy: Y(p.y), r: 7, fill: p.color || C.discover }),
          p.label && svg('text', { x: X(p.x) + 12, y: Y(p.y) - 10, class: 'svg-value' }, p.label),
        ]),
        svg('text', { x: w - 16, y: Y(0) + 26, 'text-anchor': 'end', class: 'svg-label' }, spec.xLabel || 'x'),
        svg('text', { x: 8, y: 18, class: 'svg-label' }, spec.yLabel || 'y'),
      ),
    ),
  );
}

/* ---------- Bar graph ---------- */
export function BarGraph(spec = {}) {
  const data = spec.data || [{ label: 'A', value: 4 }, { label: 'B', value: 7 }, { label: 'C', value: 3 }];
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 460, h = 300, pad = 44, gap = 18;
  const bw = (w - pad * 1.6 - gap * (data.length - 1)) / data.length;
  return wrap(spec.caption,
    el('div', { class: 'graph' },
      svg('svg', { viewBox: `0 0 ${w} ${h}` },
        svg('line', { x1: pad, y1: h - pad, x2: w - 12, y2: h - pad, class: 'svg-axis' }),
        svg('line', { x1: pad, y1: 16, x2: pad, y2: h - pad, class: 'svg-axis' }),
        data.map((d, i) => {
          const bh = ((h - pad - 26) * d.value) / max;
          const x = pad + 12 + i * (bw + gap);
          return [
            svg('rect', {
              x, y: h - pad - bh, width: bw, height: bh, rx: 4,
              fill: d.color || palette[i % palette.length], opacity: .9,
              class: 'anim-grow stagger', style: `--i:${i}`,
            }),
            svg('text', { x: x + bw / 2, y: h - pad - bh - 10, 'text-anchor': 'middle', class: 'svg-value' }, String(d.value)),
            svg('text', { x: x + bw / 2, y: h - pad + 22, 'text-anchor': 'middle', class: 'svg-label' }, d.label),
          ];
        }),
      ),
    ),
  );
}

/* ---------- Pie chart ---------- */
export function PieChart(spec = {}) {
  const data = spec.data || [{ label: 'Rent', value: 45 }, { label: 'Food', value: 25 }, { label: 'Other', value: 30 }];
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 110, cx = 130, cy = 130;
  let angle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const a = (d.value / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += a;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
    return svg('path', {
      d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${a > Math.PI ? 1 : 0},1 ${x2},${y2} Z`,
      fill: d.color || palette[i % palette.length], opacity: .88, stroke: 'var(--c-board)', 'stroke-width': 3,
      class: 'anim-fade stagger', style: `--i:${i}`,
    });
  });
  return wrap(spec.caption,
    el('div', { class: 'graph' },
      svg('svg', { viewBox: '0 0 260 260', style: 'max-width:280px;margin:0 auto' }, slices),
      el('div', { class: 'graph__legend' }, data.map((d, i) => el('span', {},
        el('span', { class: 'graph__swatch', style: { background: d.color || palette[i % palette.length] } }),
        `${d.label} ${Math.round((d.value / total) * 100)}%`,
      ))),
    ),
  );
}

/* ---------- Receipt / money breakdown ---------- */
export function ReceiptCard(spec = {}) {
  const rows = spec.rows || [];
  return wrap(spec.caption,
    el('div', { class: 'receipt anim-slide-up' },
      el('div', { class: 'receipt__head' }, spec.title || 'Breakdown'),
      rows.map((r) => el('div', {
        class: `receipt__row${r.total ? ' receipt__row--total' : ''}${r.minus ? ' receipt__row--minus' : ''}`,
      },
        el('span', {}, r.label),
        el('span', {}, r.value),
      )),
    ),
  );
}

/* ---------- Formula block ---------- */
export function FormulaBlock(spec = {}) {
  return wrap(spec.caption,
    el('div', { class: 'formula anim-slide-up' },
      spec.name && el('div', { class: 'formula__name' }, spec.name),
      el('div', { class: 'formula__body' }, renderMath(spec.formula || 'A = l \\times w', { display: true })),
      spec.substitution && el('div', { class: 'formula__body', style: { marginTop: 'var(--s-3)', color: 'var(--t-mid)' } },
        renderMath(spec.substitution)),
    ),
  );
}

/* ---------- Plain equation ---------- */
export function EquationModule(spec = {}) {
  return wrap(spec.caption,
    EquationWorkspace({ variant: 'card', lines: [{ expr: spec.equation || '' }], display: true }),
  );
}

/* ============================================================
   Registry
   ============================================================ */
export const DIAGRAMS = {
  numberBond: NumberBond,
  fractionBar: FractionBar,
  fractionBarModel: FractionBar,   // Phase 5 alias; same renderer, richer spec
  percentBar: PercentBar,
  numberLine: NumberLine,
  doubleNumberLine: DoubleNumberLine,
  placeValueBreakdown: PlaceValueBreakdown,
  arrayModel: ArrayModel,
  areaModel: AreaModel,
  ratioTable: RatioTable,
  unitRateTable: UnitRateTable,
  balanceModel: BalanceModel,
  coordinateGraph: CoordinateGraph,
  barGraph: BarGraph,
  pieChart: PieChart,
  receipt: ReceiptCard,
  formulaBlock: FormulaBlock,
  equation: EquationModule,
};

export const DIAGRAM_NAMES = Object.keys(DIAGRAMS);

/**
 * @param spec     lesson.diagram  ({ type, ...options })
 * @param override control-panel forced type, or 'auto'
 */
export function renderDiagram(spec, lesson, override = 'auto') {
  const type = override && override !== 'auto' ? override : spec && spec.type;
  if (!type) return null;
  const fn = DIAGRAMS[type];
  if (!fn) {
    return el('div', { class: 'diagram__caption' }, `Unknown diagram type "${esc(type)}"`);
  }
  return fn(spec || {}, lesson);
}
