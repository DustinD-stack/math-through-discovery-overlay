/* ============================================================
   TeachingRail
   The one canonical presentation of the Math Through Discovery
   reasoning framework:

     SEE -> BREAK -> BUILD -> TRANSFORM -> CHECK

   It is deliberately a single connected path, not five separate
   buttons - the styling (src/styles/teaching.css) fills the path
   as the learner progresses so it reads as one continuous line of
   thinking.

   Reusable: the rail takes an ordered `steps` array and a `current`
   pointer. It does not hard-code SEE..CHECK, so the same component
   can present any ordered process. Step meaning comes from
   src/components/steps.js when the caller passes canonical ids.

   Variants:
     rail      new connected node track (horizontal or vertical)
     rows      the numbered explanation list  (legacy DiscoveryStepper)
     cards     the five step-coloured cards   (legacy MethodCards)
     headline  just the current step, large   (legacy StepHeadline)

   State per step number n, given `current`:
     n <  current  -> complete
     n === current -> active
     n >  current  -> inactive
   current = 0 means nothing started; current > steps.length means
   every step is complete.
   ============================================================ */

import { el, markup } from '../utils/dom.js';
import { renderMath } from '../utils/math-render.js';
import { STEP_BY_ID, STEP_IDS } from './steps.js';

const FALLBACK = (id, i) => ({
  id, number: i + 1, label: String(id || i + 1), prompt: '', description: '',
  cls: '', stageClass: '',
});

function normalizeSteps(steps, keys) {
  const list = (steps && steps.length)
    ? steps
    : (keys || STEP_IDS).map((id) => ({ id }));
  return list.map((s, i) => {
    const base = STEP_BY_ID[s.id] || FALLBACK(s.id, i);
    return { ...base, ...s, number: base.number ?? i + 1 };
  });
}

function stateOf(n, current) {
  if (n < current) return 'complete';
  if (n === current) return 'active';
  return 'inactive';
}

const STATE_WORD = { complete: 'complete', active: 'in progress', inactive: 'not started' };

function ariaFor(step, total, state) {
  const head = `Step ${step.number} of ${total}, ${step.label}, ${STATE_WORD[state]}`;
  return step.prompt ? `${head}. ${step.prompt}` : head;
}

/* ---------- variant: rail ---------- */
function railVariant(steps, current, { orientation, showText }) {
  const total = steps.length;
  return el('ol', {
    class: `trail trail--rail trail--${orientation}`,
    role: 'list',
    'aria-label': `Discovery path: ${steps.map((s) => s.label).join(', ')}`,
  }, steps.map((s, i) => {
    const state = stateOf(s.number, current);
    return el('li', {
      class: `trail__node ${s.stageClass} is-${state}`,
      style: { '--i': i },
      role: 'listitem',
      'aria-current': state === 'active' ? 'step' : null,
      'aria-label': ariaFor(s, total, state),
    },
      el('span', { class: 'trail__marker', 'aria-hidden': 'true' },
        state === 'complete' ? '\u2713' : String(s.number)),
      el('span', { class: 'trail__label', 'aria-hidden': 'true' }, s.label),
      (showText && s.prompt)
        ? el('span', { class: 'trail__prompt', 'aria-hidden': 'true' }, s.prompt)
        : null,
    );
  }));
}

/* ---------- variant: rows (legacy DiscoveryStepper markup) ---------- */
function rowsVariant(steps, current, { compact }) {
  return el('div', {
    class: `trail trail--rows panel panel--flush stepper${compact ? ' stepper--compact' : ''}`,
    role: 'list',
  }, steps.map((s) => {
    const revealed = s.number <= current;
    const active = s.number === current;
    return el('div', {
      class: [
        'step', s.cls, s.stageClass,
        revealed ? 'step--reveal' : 'step--pending',
        active ? 'step--active' : '',
      ].join(' ').trim(),
      role: 'listitem',
      'aria-current': active ? 'step' : null,
      'aria-label': ariaFor(s, steps.length, stateOf(s.number, current)),
    },
      el('div', { class: 'step__num', 'aria-hidden': 'true' }, s.number),
      el('div', {},
        el('div', { class: 'step__label' }, s.label),
        s.text ? el('div', { class: 'step__text' }, s.text) : null,
      ),
      el('div', { class: 'step__math' },
        s.annotation ? el('div', { class: 'step__annot' }, s.annotation) : null,
        s.equation ? renderMath(s.equation) : null,
        s.note ? el('div', { class: 'step__annot', style: { color: 'var(--t-low)' } }, s.note) : null,
        (s.id === 'check' && s.equation && revealed)
          ? el('span', { style: { color: 'var(--c-correct)', marginLeft: '.3em' } }, '\u2713')
          : null,
      ),
    );
  }));
}

/* ---------- variant: cards (legacy MethodCards markup) ---------- */
function cardsVariant(steps, current) {
  return el('div', { class: 'trail trail--cards method-cards', role: 'list' },
    steps.map((s) => {
      const revealed = s.number <= current;
      const active = s.number === current;
      return el('div', {
        class: `method-card ${s.cls} ${s.stageClass} `
          + `${revealed ? 'anim-slide-up stagger' : 'step--pending'}${active ? ' is-active' : ''}`,
        style: { '--i': s.number },
        role: 'listitem',
        'aria-current': active ? 'step' : null,
        'aria-label': ariaFor(s, steps.length, stateOf(s.number, current)),
      },
        el('div', { class: 'method-card__label' }, `${s.number}. ${s.label}`),
        s.text ? el('div', { class: 'method-card__text' }, s.text) : null,
        s.equation ? el('div', { class: 'method-card__math' }, renderMath(s.equation)) : null,
      );
    }),
  );
}

/* ---------- variant: headline (legacy StepHeadline markup) ---------- */
function headlineVariant(steps, current) {
  const idx = Math.max(0, Math.min(steps.length - 1, current - 1));
  const s = steps[idx];
  return el('div', {
    class: `trail trail--headline ${s.cls} ${s.stageClass}`,
    style: { textAlign: 'center' },
    role: 'group',
    'aria-label': ariaFor(s, steps.length, stateOf(s.number, current)),
  },
    el('div', { class: 'step__label', style: { fontSize: 'var(--fs-xl)' } }, s.label),
    s.text
      ? el('div', { class: 'step__text', style: { fontSize: 'var(--fs-md)' }, html: markup(s.text) })
      : null,
  );
}

/**
 * TeachingRail(opts) -> Node
 *
 * opts.steps        ordered step data; each item needs at least { id }.
 *                   Canonical fields (label, number, prompt, description, cls,
 *                   stageClass) are filled from steps.js for known ids. Lesson
 *                   fields (text, equation, annotation, note) pass through.
 * opts.current      active step number; 0 = not started; > steps.length = all done.
 * opts.variant      'rail' | 'rows' | 'cards' | 'headline'   (default 'rail')
 * opts.orientation  'horizontal' | 'vertical'   (rail only, default 'horizontal')
 * opts.showText     show each step's prompt   (rail only, default true)
 * opts.compact      stepper--compact   (rows only, default false)
 * opts.keys         id ordering used when opts.steps is omitted
 */
export function TeachingRail({
  steps,
  current = 0,
  variant = 'rail',
  orientation = 'horizontal',
  showText = true,
  compact = false,
  keys,
} = {}) {
  const model = normalizeSteps(steps, keys);
  const cur = Number.isFinite(current) ? current : 0;
  switch (variant) {
    case 'rows': return rowsVariant(model, cur, { compact });
    case 'cards': return cardsVariant(model, cur);
    case 'headline': return headlineVariant(model, cur);
    case 'rail':
    default: return railVariant(model, cur, { orientation, showText });
  }
}

export default TeachingRail;
