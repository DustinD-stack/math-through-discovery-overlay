/* ============================================================
   TransformationChain
   Makes SAME VALUE -> DIFFERENT FORM visible.

     20 / 8  =  2 R4  =  2 4/8  =  2 1/2  =  2.5

   These are not five answers. They are five ways to write ONE
   quantity. The visual language says so:

     - an equivalence baseline runs the length of the chain, tagged
       "same value"
     - links are joined by "=" , never a bare arrow (an arrow would
       suggest the value changed)
     - each link can carry a label (what form this is) and a note
       (the move that produced it)

   Reveal is progressive (`current`) and never drops a link from the
   layout, so nothing jumps.

   Layout:
     flow   a horizontal row (16:9)
     stack  a vertical column (9:16, narrow, or > 5 links)
   Narrow canvases auto-stack in CSS. The chain never scrolls
   horizontally - flow wraps.

   Reusable: it takes an ordered `links` array and knows nothing
   about fractions, remainders or lessons.
   ============================================================ */

import { el } from '../utils/dom.js';
import { renderMath } from '../utils/math-render.js';

const STACK_THRESHOLD = 5; // more links than this always stacks

/** revealed-count -> per-index state (mirrors EquationWorkspace) */
function makeStateOf(total, current) {
  const revealed = current == null ? total : Math.max(0, Math.min(total, current));
  const activeIdx = (current == null || current <= 0 || current >= total) ? -1 : current - 1;
  return (i) => {
    if (i >= revealed) return 'inactive';
    if (i === activeIdx) return 'active';
    return 'complete';
  };
}

/** rough spoken form of a math string, for aria-label */
function speak(form) {
  return String(form || '')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1 over $2')
    .replace(/\\times/g, ' times ').replace(/\\div/g, ' divided by ')
    .replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

/**
 * TransformationChain(opts) -> Node
 *
 * opts.links   [{ form, label?, note?, equals? }]
 *   form    the representation (LaTeX or friendly text)
 *   label   what this form is        ("as a fraction", "as a decimal")
 *   note    the move that produced it ("same amount, split into 8ths")
 *   equals  default true. false renders this link's connector as an
 *           arrow instead of "=" - use only when the step genuinely
 *           is not an equivalence.
 * opts.current  count of revealed links; omit to reveal all
 * opts.layout   'flow' (default) | 'stack'
 * opts.title    names the shared value; shown on the baseline tag
 *               ("same value" -> "same value = 2.5")
 */
export function TransformationChain({
  links = [],
  current,
  layout = 'flow',
  title = '',
} = {}) {
  const list = (Array.isArray(links) ? links : []).filter(Boolean);
  if (!list.length) return null;

  const effLayout = (layout === 'stack' || list.length > STACK_THRESHOLD) ? 'stack' : 'flow';
  const total = list.length;
  const stateOf = makeStateOf(total, current);

  const items = list.map((ln, i) => {
    const state = stateOf(i);
    const revealed = state !== 'inactive';
    const isEquiv = ln.equals !== false;
    return el('li', {
      class: `tchain__link is-${state}${revealed ? ' eq-reveal' : ''}`,
      role: 'listitem',
      'aria-current': state === 'active' ? 'step' : null,
      'aria-hidden': state === 'inactive' ? 'true' : null,
      'aria-label': `Form ${i + 1} of ${total}: ${speak(ln.form)}`
        + `${ln.label ? `, ${ln.label}` : ''}${ln.note ? `. ${ln.note}` : ''}`,
    },
      i > 0
        ? el('span', {
            class: `tchain__join${isEquiv ? '' : ' tchain__join--arrow'}`,
            'aria-hidden': 'true',
          }, isEquiv ? '=' : '→')
        : null,
      el('span', { class: 'tchain__form' },
        revealed ? renderMath(ln.form || '') : el('span', { class: 'tchain__hidden' }, '•••'),
      ),
      ln.label ? el('span', { class: 'tchain__label', 'aria-hidden': 'true' }, ln.label) : null,
      ln.note ? el('span', { class: 'tchain__note', 'aria-hidden': 'true' }, ln.note) : null,
    );
  });

  return el('div', {
    class: `tchain tchain--${effLayout}`,
    role: 'group',
    'aria-label': `${title ? title + ': ' : ''}the same value in different forms`,
  },
    el('ol', { class: 'tchain__links', role: 'list' }, items),
    el('div', { class: 'tchain__base', 'aria-hidden': 'true' },
      el('span', { class: 'tchain__base-tag' }, title ? `same value = ${title}` : 'same value'),
    ),
  );
}

export default TransformationChain;
