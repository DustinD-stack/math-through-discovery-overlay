/* ============================================================
   Layer 6 — SEE / BREAK / BUILD / TRANSFORM / CHECK
   Plus the equation card and the taped paper answer note.
   ============================================================ */

import { el, svg, markup } from '../utils/dom.js';
import { renderMath } from '../utils/math-render.js';
import { STEP_KEYS } from '../utils/lesson-loader.js';

export const STEP_META = {
  see:       { label: 'See',       n: 1, cls: 'step-see' },
  break:     { label: 'Break',     n: 2, cls: 'step-break' },
  build:     { label: 'Build',     n: 3, cls: 'step-build' },
  transform: { label: 'Transform', n: 4, cls: 'step-transform' },
  check:     { label: 'Check',     n: 5, cls: 'step-check' },
};

/**
 * @param step  current progress, 0–5. A step is revealed when n <= step.
 */
export function DiscoveryStepper(lesson, { step = 5, compact = false } = {}) {
  return el('div', { class: `panel panel--flush stepper${compact ? ' stepper--compact' : ''}` },
    STEP_KEYS.map((key) => DiscoveryStep(key, lesson.steps[key], step)),
  );
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
  return el('div', { class: 'method-cards' },
    keys.map((key) => {
      const meta = STEP_META[key];
      const data = lesson.steps[key] || {};
      const revealed = meta.n <= step;
      return el('div', {
        class: `method-card ${meta.cls} ${revealed ? 'anim-slide-up stagger' : 'step--pending'}`,
        style: { '--i': meta.n },
      },
        el('div', { class: 'method-card__label' }, `${meta.n}. ${data.label || meta.label}`),
        data.text && el('div', { class: 'method-card__text' }, data.text),
        data.equation && el('div', { class: 'method-card__math' }, renderMath(data.equation)),
      );
    }),
  );
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
  const key = STEP_KEYS[Math.max(0, step - 1)];
  const data = lesson.steps[key] || {};
  const meta = STEP_META[key];
  return el('div', { class: meta.cls, style: { textAlign: 'center' } },
    el('div', { class: 'step__label', style: { fontSize: 'var(--fs-xl)' } }, data.label || meta.label),
    data.text && el('div', { class: 'step__text', style: { fontSize: 'var(--fs-md)' }, html: markup(data.text) }),
  );
}
