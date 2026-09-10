/* ============================================================
   AnswerReveal
   The controlled reveal of the final answer. It is written so the
   answer reads as the CONCLUSION of the reasoning - a connector
   leads into it and (on the paper / panel skins) the value is
   circled or lit in the "confirmed" colour - rather than an
   unrelated answer box.

   revealed:false shows a placeholder in the same footprint, so
   nothing shifts when the answer appears.

   Reusable: it takes work / value / unit, not a lesson.

   Skins:
     paper   the taped slip with the circled answer  (legacy PaperNote)
     panel   a "so ..." conclusion panel
     inline  a compact  work = value  line
   ============================================================ */

import { el, svg } from '../utils/dom.js';
import { renderMath } from '../utils/math-render.js';

/** The hand-drawn ellipse around a revealed answer. */
export function AnswerRing() {
  return el('span', {
    class: 'answer-ring-wrap',
    style: { position: 'absolute', inset: '-14% -10%', pointerEvents: 'none' },
  },
    svg('svg', { viewBox: '0 0 240 90', preserveAspectRatio: 'none', style: 'width:100%;height:100%' },
      svg('ellipse', {
        cx: 120, cy: 45, rx: 112, ry: 38,
        fill: 'none', stroke: 'var(--c-correct)', 'stroke-width': 5,
        transform: 'rotate(-2 120 45)', class: 'ring-draw',
      }),
    ),
  );
}

function ariaLabel(revealed, value, unit) {
  if (!revealed) return 'Answer hidden';
  return `Answer: ${String(value || '').replace(/\\[a-z]+|[{}]/gi, ' ').replace(/\s+/g, ' ').trim()}${unit ? ' ' + unit : ''}`;
}

/* ---------- skin: paper (legacy PaperNote markup) ---------- */
function paperSkin({ work, value, unit, revealed, ring }) {
  return el('div', {
    class: 'paper-note anim-pop',
    'aria-live': 'polite',
    'aria-label': ariaLabel(revealed, value, unit),
  },
    work ? el('div', { class: 'paper-note__eq' }, renderMath(work)) : null,
    revealed
      ? el('div', { class: 'paper-note__answer' },
          renderMath(value),
          ring ? AnswerRing() : null,
        )
      : el('div', { class: 'paper-note__answer', style: { opacity: .28 } }, '= ?'),
    unit ? el('div', { class: 'paper-note__unit' }, unit) : null,
  );
}

/* ---------- skin: panel ---------- */
function panelSkin({ work, value, unit, revealed, ring, lead }) {
  return el('div', {
    class: `areveal areveal--panel is-${revealed ? 'revealed' : 'hidden'}`,
    role: 'group',
    'aria-live': 'polite',
    'aria-label': ariaLabel(revealed, value, unit),
  },
    el('span', { class: 'areveal__flow', 'aria-hidden': 'true' }, '↓'),
    el('span', { class: 'areveal__lead' }, `${lead || 'So'}:`),
    work ? el('span', { class: 'areveal__work' }, renderMath(work)) : null,
    el('span', { class: 'areveal__value' },
      revealed ? renderMath(value) : el('span', { class: 'areveal__q' }, '?'),
      (revealed && ring) ? AnswerRing() : null,
    ),
    (revealed && unit) ? el('span', { class: 'areveal__unit' }, unit) : null,
  );
}

/* ---------- skin: inline ---------- */
function inlineSkin({ work, value, unit, revealed }) {
  return el('span', {
    class: `areveal areveal--inline is-${revealed ? 'revealed' : 'hidden'}`,
    'aria-live': 'polite',
    'aria-label': ariaLabel(revealed, value, unit),
  },
    work ? el('span', { class: 'areveal__work' }, renderMath(work)) : null,
    work ? el('span', { class: 'areveal__eq', 'aria-hidden': 'true' }, ' = ') : null,
    el('span', { class: 'areveal__value' }, revealed ? renderMath(value) : '?'),
    (revealed && unit) ? el('span', { class: 'areveal__unit' }, ' ' + unit) : null,
  );
}

/**
 * AnswerReveal(opts) -> Node
 *
 * opts.work      optional expression that produced the answer
 * opts.value     the answer (LaTeX or friendly text)
 * opts.unit      optional unit / suffix
 * opts.revealed  boolean
 * opts.skin      'paper' (default) | 'panel' | 'inline'
 * opts.ring      draw the ellipse; default true for paper, false otherwise
 * opts.lead      connective word for the panel skin, default 'So'
 */
export function AnswerReveal({
  work = '',
  value = '',
  unit = '',
  revealed = false,
  skin = 'paper',
  ring,
  lead,
} = {}) {
  const drawRing = ring === undefined ? skin === 'paper' : !!ring;
  const args = { work, value, unit, revealed, ring: drawRing, lead };
  if (skin === 'panel') return panelSkin(args);
  if (skin === 'inline') return inlineSkin(args);
  return paperSkin(args);
}

export default AnswerReveal;
