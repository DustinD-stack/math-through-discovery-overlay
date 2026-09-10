/* ============================================================
   PlaceValueBreakdown
   Decomposition made visible - one of the foundational Math
   Through Discovery moves (the BREAK step). It shows a number
   as its place-value parts:

       342  ->  columns  H | T | O   and/or   300 + 40 + 2

   The value never changes; only its FORM does. Reusable: it
   takes a number, not a lesson.
   ============================================================ */

import { el } from '../utils/dom.js';
import { renderMath } from '../utils/math-render.js';

const PLACE_NAME = [
  'ones', 'tens', 'hundreds', 'thousands',
  'ten thousands', 'hundred thousands', 'millions',
];
const TINT = ['var(--c-structure)', 'var(--c-strategy)', 'var(--c-adjust)'];

/** value -> [{ name, digit, placeValue, exp }] left-to-right */
export function decompose(value, places = 'auto') {
  const int = Math.abs(Math.trunc(Number(value) || 0));
  const digits = String(int).split('').map(Number);
  const len = digits.length;
  let out = digits.map((digit, i) => {
    const exp = len - 1 - i;
    return {
      exp,
      digit,
      placeValue: digit * (10 ** exp),
      name: PLACE_NAME[exp] || `×10^${exp}`,
    };
  });
  if (Array.isArray(places)) {
    // caller pinned the columns; keep only those, right-aligned
    const wanted = places.map((p) => PLACE_NAME.indexOf(p)).filter((x) => x >= 0);
    const maxExp = Math.max(...wanted, len - 1);
    out = Array.from({ length: maxExp + 1 }, (_, k) => maxExp - k).map((exp) => {
      const found = out.find((o) => o.exp === exp);
      return found || { exp, digit: 0, placeValue: 0, name: PLACE_NAME[exp] || `×10^${exp}` };
    });
  }
  return out;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function stateFor(i, reveal, total) {
  if (reveal == null || reveal >= total) return 'complete';
  if (i >= reveal) return 'inactive';
  if (i === reveal - 1) return 'active';
  return 'complete';
}

/**
 * PlaceValueBreakdown(opts) -> Node
 *
 * opts.value           number or numeric string
 * opts.places          'auto' (default) | ['hundreds','tens','ones']
 * opts.form            'columns' | 'expanded' | 'both' (default)
 * opts.reveal          count of places revealed; omit to reveal all
 * opts.highlightPlace  index into the decomposed places to emphasise
 * opts.regroup         { from, to } - index pair for a "regroup" note
 * opts.caption         small line under the block
 */
export function PlaceValueBreakdown({
  value = 0,
  places = 'auto',
  form = 'both',
  reveal,
  highlightPlace,
  regroup,
  caption = '',
} = {}) {
  const parts = decompose(value, places);
  const total = parts.length;
  const shown = (i) => stateFor(i, reveal, total) !== 'inactive';

  const spoken = `${value} is ${parts.map((p) => `${p.digit} ${p.name}`).join(', ')}`;

  const columns = el('ol', { class: 'pvb__cols', role: 'list' },
    parts.map((p, i) => {
      const st = stateFor(i, reveal, total);
      const active = st === 'active' || highlightPlace === i;
      return el('li', {
        class: `pvb__col is-${active ? 'active' : st}`
          + `${regroup && regroup.from === i ? ' is-regroup-from' : ''}`
          + `${regroup && regroup.to === i ? ' is-regroup-to' : ''}`,
        style: { '--tint': TINT[i % TINT.length] },
        role: 'listitem',
        'aria-current': active ? 'true' : null,
        'aria-label': `${cap(p.name)}: ${shown(i) ? p.digit : 'not yet shown'}`,
      },
        el('span', { class: 'pvb__place', 'aria-hidden': 'true' }, cap(p.name)),
        el('span', { class: 'pvb__digit', 'aria-hidden': 'true' }, shown(i) ? String(p.digit) : '_'),
        el('span', { class: 'pvb__pv', 'aria-hidden': 'true' }, shown(i) ? String(p.placeValue) : ''),
      );
    }),
  );

  const nonZero = parts.filter((p) => p.placeValue !== 0);
  const expanded = el('div', { class: 'pvb__expanded', 'aria-hidden': 'true' },
    el('span', { class: 'pvb__eq' }, '='),
    nonZero.map((p, k) => {
      const idx = parts.indexOf(p);
      const vis = shown(idx);
      return [
        k > 0 ? el('span', { class: 'pvb__plus' }, '+') : null,
        el('span', { class: `pvb__addend${stateFor(idx, reveal, total) === 'active' ? ' is-active' : ''}` },
          vis ? renderMath(String(p.placeValue)) : el('span', { class: 'pvb__blank' }, '_')),
      ];
    }),
  );

  const regroupNote = regroup
    ? el('div', { class: 'pvb__regroup', 'aria-label': `regroup between ${cap(parts[regroup.from].name)} and ${cap(parts[regroup.to].name)}` },
        '↷ ', `regroup ${cap(parts[regroup.from].name)} → ${parts[regroup.to].name}`)
    : null;

  return el('div', {
    class: `pvb pvb--${form}`,
    role: 'group',
    'aria-label': spoken,
  },
    (form === 'columns' || form === 'both') ? columns : null,
    regroupNote,
    (form === 'expanded' || form === 'both') ? expanded : null,
    caption ? el('div', { class: 'pvb__caption' }, caption) : null,
  );
}

export default PlaceValueBreakdown;
