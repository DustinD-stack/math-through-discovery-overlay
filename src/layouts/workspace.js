/* ============================================================
   Teaching workspace
   Phase 6 composition helpers. These build the five hierarchy
   regions of a Math Through Discovery teaching screen from the
   EXISTING lesson JSON - no schema change, everything derived:

     1. PROMPT / QUESTION      PromptCard
     2. WHERE WE ARE           TeachingRail (top rail)
     3. EQUATION / WORKSPACE   EquationWorkspace (flow)
     4. VISUAL MODEL           renderDiagram, or TransformationChain
     5. RESULT / CHECK         AnswerReveal

   Every builder is null-safe and honours state.layers, so a
   preset can place any subset and empty regions simply collapse.
   Presets arrange these; they do not re-implement them.
   ============================================================ */

import { el } from '../utils/dom.js';
import { TeachingRail } from '../components/teaching-rail.js';
import { PromptCard } from '../components/prompt-card.js';
import { EquationWorkspace } from '../components/equation-workspace.js';
import { AnswerReveal } from '../components/answer-reveal.js';
import { TransformationChain } from '../components/transformation-chain.js';
import { renderDiagram } from '../modules/diagrams.js';

/* ---------- 2. WHERE WE ARE ---------- */

/**
 * Top rail. `compact` (production default) shows markers + labels only,
 * so it says WHERE WE ARE without competing with the mathematics.
 */
export function TopRail(state, { compact = true, orientation = 'horizontal' } = {}) {
  return el('div', { class: `r-rail${compact ? ' r-rail--compact' : ''}` },
    TeachingRail({ variant: 'rail', current: state.step, showText: !compact, orientation }));
}

/* ---------- 1. PROMPT ---------- */

export function PromptRegion(state, lesson) {
  if (!state.layers.story) return null;
  const text = lesson.question || lesson.headline || '';
  if (!text) return null;
  return el('div', { class: 'ws-prompt' },
    PromptCard({ kind: 'question', text, context: lesson.subtitle || '' }));
}

/* ---------- 3. EQUATION / WORKSPACE ---------- */

/** Derive EquationWorkspace flow lines from lesson.steps + answer. */
export function deriveFlowLines(lesson, { includeResult = true } = {}) {
  const S = lesson.steps || {};
  const lines = [];
  const given = S.see?.equation || lesson.answer?.work || S.build?.equation;
  if (given) lines.push({ expr: given, kind: 'given' });
  for (const id of ['break', 'build', 'transform']) {
    if (S[id]?.equation) lines.push({ expr: S[id].equation, kind: 'work', note: S[id].text || '' });
  }
  if (includeResult) {
    if (lesson.answer?.value) {
      const w = lesson.answer.work;
      lines.push({ expr: `${w ? w + ' ' : ''}${lesson.answer.value}`.trim(), kind: 'result' });
    } else if (S.check?.equation) {
      lines.push({ expr: S.check.equation, kind: 'result' });
    }
  }
  return lines;
}

export function EquationRegion(state, lesson, { size = 'md' } = {}) {
  if (!state.layers.math) return null;
  const lines = deriveFlowLines(lesson, { includeResult: state.revealAnswer });
  if (!lines.length) return null;
  const current = state.step <= 0 ? 0 : Math.min(lines.length, state.step);
  return el('div', { class: 'ws-equation' }, EquationWorkspace({ lines, current, size }));
}

/* ---------- 4. VISUAL MODEL ---------- */

/** Derive a TransformationChain when a lesson step spells out an equivalence. */
export function deriveChain(lesson) {
  const S = lesson.steps || {};
  for (const id of ['transform', 'build', 'check']) {
    const eq = S[id]?.equation || '';
    const parts = eq.split(/\s*=\s*/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 3) {
      return parts.map((form, i) => ({ form, note: i === 0 ? (S[id].text || '') : '' }));
    }
  }
  const forms = [S.see?.equation, S.build?.equation, S.transform?.equation, lesson.answer?.value]
    .map((s) => (s || '').trim()).filter(Boolean);
  return forms.length >= 2 ? forms.map((form) => ({ form })) : null;
}

/**
 * The visual model. Prefers the lesson's own diagram; when the lesson is
 * plainly about equivalence (or has no diagram) a TransformationChain
 * takes the slot instead.
 */
export function VisualRegion(state, lesson, { preferChain = false } = {}) {
  if (!state.layers.math) return null;
  const diagram = renderDiagram(lesson.diagram, lesson, state.diagram);
  let node = (!preferChain && diagram) ? diagram : null;
  if (!node) {
    const chain = deriveChain(lesson);
    if (chain) {
      node = TransformationChain({
        links: chain,
        current: state.step >= 4 ? chain.length : Math.max(0, state.step),
        title: (lesson.answer?.value || '').replace(/^=\s*/, '') || '',
      });
    } else {
      node = diagram;
    }
  }
  if (!node) return null;
  return el('div', { class: 'ws-visual' }, node);
}

/* ---------- 5. RESULT / CHECK ---------- */

export function ResultRegion(state, lesson, { skin = 'panel' } = {}) {
  if (!state.layers.math) return null;
  const a = lesson.answer;
  if (!a || (!a.value && !a.work)) return null;
  return el('div', { class: 'ws-result' },
    AnswerReveal({ work: a.work, value: a.value, unit: a.unit, revealed: state.revealAnswer, skin, lead: 'So' }));
}

/* ---------- philosophy strip ---------- */

/**
 * A quiet, persistent reminder of the backbone. Sits in the footer band.
 * Not advertising - it never competes with the current problem.
 */
export function PhilosophyStrip() {
  return el('div', { class: 'r-philosophy', 'aria-label': 'Same value, different form' },
    el('span', { class: 'r-philosophy__a' }, 'Same value'),
    el('span', { class: 'r-philosophy__arrow', 'aria-hidden': 'true' }, '→'),
    el('span', { class: 'r-philosophy__b' }, 'different form'),
  );
}

/* ---------- ordered hierarchy helper ---------- */

/**
 * The teaching-workspace column in canonical order, empties removed.
 * `only` / `omit` let a preset narrow the set.
 */
export function WorkspaceColumn(state, lesson, opts = {}) {
  const { only, omit = [], eqSize = 'md', preferChain = false, resultSkin = 'panel' } = opts;
  const want = (k) => (only ? only.includes(k) : !omit.includes(k));
  const regions = [
    want('prompt') ? PromptRegion(state, lesson) : null,
    want('equation') ? EquationRegion(state, lesson, { size: eqSize }) : null,
    want('visual') ? VisualRegion(state, lesson, { preferChain }) : null,
    want('result') ? ResultRegion(state, lesson, { skin: resultSkin }) : null,
  ].filter(Boolean);
  return regions;
}
