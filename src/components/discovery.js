/* ============================================================
   Layer 6 — SEE / BREAK / BUILD / TRANSFORM / CHECK
   Plus the equation card and the taped paper answer note.

   The five-step renderers below now delegate to the canonical
   TeachingRail (src/components/teaching-rail.js). Step meaning is
   defined once in src/components/steps.js. Public signatures are
   unchanged, and STEP_META is re-exported for existing importers
   (e.g. src/controllers/control-app.js).
   ============================================================ */

import { el, svg } from '../utils/dom.js';
import { renderMath } from '../utils/math-render.js';
import { STEP_KEYS } from '../utils/lesson-loader.js';
import { STEP_META, withLesson } from './steps.js';
import { TeachingRail } from './teaching-rail.js';

export { STEP_META };

/**
 * @param step  current progress, 0–5. A step is revealed when n <= step.
 */
export function DiscoveryStepper(lesson, { step = 5, compact = false } = {}) {
  return TeachingRail({
    variant: 'rows',
    current: step,
    compact,
    steps: withLesson(lesson.steps),
  });
}

export function DiscoveryStep(key, data = {}, step = 5) {
  const meta = STEP_META[key];
  const revealed = meta.n <= step;
  const active = meta.n === step;
  return el('div', {
    class: [
      'step', meta.cls,
      revealed ? 'step--reveal' : 'step--pending',
      active ? 'step--active' : '',
    ].join(' ').trim(),
  },
    el('div', { class: 'step__num' }, meta.n),
    el('div', {},
      el('div', { class: 'step__label' }, data.label || meta.label),
      data.text && el('div', { class: 'step__text' }, data.text),
    ),
    el('div', { class: 'step__math' },
      data.annotation && el('div', { class: 'step__annot' }, data.annotation),
      data.equation ? renderMath(data.equation) : null,
      data.note && el('div', { class: 'step__annot', style: { color: 'var(--t-low)' } }, data.note),
      key === 'check' && data.equation && revealed ? el('span', { style: { color: 'var(--c-correct)', marginLeft: '.3em' } }, '\u2713') : null,
    ),
  );
}

/** Preset D/E variant: the five steps as a row of cards. */
export function MethodCards(lesson, { step = 5, keys = STEP_KEYS } = {}) {
  return TeachingRail({
    variant: 'cards',
    current: step,
    keys,
    steps: withLesson(lesson.steps, keys),
  });
}

/** Big centred equation, used by Presets D, G, H. */
export function EquationCard(expr, { caption = '', large = false, display = true } = {}) {
  if (!expr) return null;
  return el('div', { class: `equation-card${large ? ' equation-card--lg' : ''} eq-reveal` },
    el('div', { class: 'equation-card__eq' }, renderMath(expr, { display })),
    caption && el('div', { class: 'equation-card__caption' }, caption),
  );
}

/** The taped slip of paper with the circled answer. */
export function PaperNote(lesson, { revealed = true } = {}) {
  const a = lesson.answer;
  if (!a) return null;
  return el('div', { class: 'paper-note anim-pop' },
    a.work && el('div', { class: 'paper-note__eq' }, renderMath(a.work)),
    revealed
      ? el('div', { class: 'paper-note__answer' },
          renderMath(a.value),
          AnswerRing(),
        )
      : el('div', { class: 'paper-note__answer', style: { opacity: .28 } }, '= ?'),
    a.unit && el('div', { class: 'paper-note__unit' }, a.unit),
  );
}

function AnswerRing() {
  return el('span', { class: 'answer-ring-wrap', style: { position: 'absolute', inset: '-14% -10%', pointerEvents: 'none' } },
    svg('svg', { viewBox: '0 0 240 90', preserveAspectRatio: 'none', style: 'width:100%;height:100%' },
      svg('ellipse', {
        cx: 120, cy: 45, rx: 112, ry: 38,
        fill: 'none', stroke: 'var(--c-correct)', 'stroke-width': 5,
        transform: 'rotate(-2 120 45)', class: 'ring-draw',
      }),
    ),
  );
}

/** Small progress pips, handy in vertical formats. */
export function StepProgress(step = 5) {
  return el('div', { style: { display: 'flex', gap: 'var(--s-2)', justifyContent: 'center' } },
    STEP_KEYS.map((key) => {
      const meta = STEP_META[key];
      return el('span', {
        class: meta.cls,
        style: {
          width: '2.2em', height: '.35em', borderRadius: 'var(--r-pill)',
          background: meta.n <= step ? 'var(--step-color)' : 'var(--line-2)',
        },
      });
    }),
  );
}

export function StepHeadline(lesson, step) {
  return TeachingRail({
    variant: 'headline',
    current: step,
    steps: withLesson(lesson.steps),
  });
}
