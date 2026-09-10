/* ============================================================
   EquationWorkspace
   The reusable visual language for working THROUGH mathematics -
   not just displaying an equation. A worked solution reads as a
   vertical flow:

       GIVEN
         v
       WORK / REASONING   (one or more lines)
         v
       RESULT

   Lines can be revealed one at a time (`current`) without the
   block changing height - unrevealed lines keep their space, so
   nothing below them jumps.

   Reusable: it takes an ordered `lines` array. It does not know
   about SEE..CHECK or any particular lesson; a caller that wants
   step colour can wrap it in a .stage-* element.

   Variants:
     flow  the GIVEN / WORK / RESULT reasoning stack (default)
     card  legacy single-expression card - the shape EquationCard
           and the `equation` diagram module have always produced
   ============================================================ */

import { el } from '../utils/dom.js';
import { renderMath } from '../utils/math-render.js';

const KINDS = new Set(['given', 'work', 'result']);
const KIND_LABEL = { given: 'Given', work: 'Working', result: 'Result' };
const SIZE_CLASS = { md: '', lg: ' eqw--lg', xl: ' eqw--xl' };

/**
 * `current` is a count of revealed lines (like TeachingRail's `current`):
 *   0            nothing revealed
 *   1..total-1   that many revealed; the last one is "active"
 *   >= total     every line revealed and settled (none active)
 *   undefined    same as >= total
 */
function makeStateOf(total, current) {
  const revealed = current == null ? total : Math.max(0, Math.min(total, current));
  const activeIdx = (current == null || current <= 0 || current >= total) ? -1 : current - 1;
  return (i) => {
    if (i >= revealed) return 'inactive';
    if (i === activeIdx) return 'active';
    return 'complete';
  };
}

/* ---------- variant: flow ---------- */
function flowVariant(lines, { current, size, display, caption }) {
  const total = lines.length;
  const stateOf = makeStateOf(total, current);
  const items = lines.map((ln, i) => {
    const kind = KINDS.has(ln.kind) ? ln.kind : 'work';
    const state = stateOf(i);
    const firstOfKind = i === 0 || (KINDS.has(lines[i - 1].kind) ? lines[i - 1].kind : 'work') !== kind;
    const revealed = state !== 'inactive';
    return el('li', {
      class: `eqw__line eqw__line--${kind} is-${state}${revealed ? ' eq-reveal' : ''}`
        + `${kind === 'result' && revealed ? ' anim-pop' : ''}`,
      role: 'listitem',
      'aria-current': state === 'active' ? 'step' : null,
      'aria-hidden': state === 'inactive' ? 'true' : null,
      'aria-label': `${KIND_LABEL[kind]}${total > 1 ? `, line ${i + 1} of ${total}` : ''}`,
    },
      firstOfKind ? el('span', { class: 'eqw__tag', 'aria-hidden': 'true' }, KIND_LABEL[kind]) : null,
      el('span', { class: 'eqw__expr' }, renderMath(ln.expr || '', { display })),
      ln.note ? el('span', { class: 'eqw__note' }, ln.note) : null,
    );
  });

  return el('div', {
    class: `eqw eqw--flow${SIZE_CLASS[size] || ''}`,
    role: 'group',
    'aria-label': 'Worked solution',
  },
    el('ol', { class: 'eqw__lines', role: 'list' }, items),
    caption ? el('div', { class: 'eqw__caption' }, caption) : null,
  );
}

/* ---------- variant: card (legacy passthrough) ---------- */
function cardVariant(lines, { size, display, caption }) {
  const expr = lines[0] && lines[0].expr;
  if (!expr && !caption) return null;
  const lg = size === 'lg' || size === 'xl';
  return el('div', { class: `equation-card${lg ? ' equation-card--lg' : ''} eq-reveal eqw eqw--card` },
    el('div', { class: 'equation-card__eq' }, renderMath(expr || '', { display })),
    caption ? el('div', { class: 'equation-card__caption' }, caption) : null,
  );
}

/**
 * EquationWorkspace(opts) -> Node | null
 *
 * opts.lines    [{ expr, kind?: 'given'|'work'|'result', note? }]
 * opts.current  reveal count; omit to reveal every line
 * opts.size     'md' | 'lg' | 'xl'   (default 'md')
 * opts.display  KaTeX display mode   (default true)
 * opts.variant  'flow' (default) | 'card'
 * opts.caption  small line under the block
 */
export function EquationWorkspace({
  lines = [],
  current,
  size = 'md',
  display = true,
  variant = 'flow',
  caption = '',
} = {}) {
  const list = Array.isArray(lines) ? lines.filter(Boolean) : [];
  if (variant === 'card') return cardVariant(list, { size, display, caption });
  if (!list.length) return null;
  return flowVariant(list, { current, size, display, caption });
}

export default EquationWorkspace;
