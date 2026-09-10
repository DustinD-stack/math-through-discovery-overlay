/* ============================================================
   Shared teaching-step model
   The single canonical definition of the Math Through Discovery
   reasoning framework:

     SEE -> BREAK -> BUILD -> TRANSFORM -> CHECK

   It is one continuous thinking process, not five buttons.
   Nothing else in the codebase should redefine these labels,
   prompts or descriptions - import them from here.

   Core principle: SAME VALUE -> DIFFERENT FORM. That principle
   is expressed by the TRANSFORM step and by the rail styling,
   but it is intentionally NOT hard-coded into TeachingRail, so
   the rail stays reusable for any ordered process.
   ============================================================ */

import { STEP_KEYS } from '../utils/lesson-loader.js';

/* Canonical order. Re-uses the lesson-JSON key order so the two
   never drift apart. */
export const STEP_IDS = STEP_KEYS;

/* id -> { prompt, description }.
   prompt      = the question the learner asks at this step (short, on-rail)
   description = the fuller accessible explanation (used for aria-label) */
const SEMANTICS = {
  see: {
    prompt: 'What do I notice?',
    description:
      'See: what quantities, relationships, patterns or structures are visible ' +
      'before doing anything.',
  },
  break: {
    prompt: 'What can I take apart?',
    description:
      'Break: decompose the number, expression, shape, fraction or problem ' +
      'into smaller pieces.',
  },
  build: {
    prompt: 'What can I build from the pieces?',
    description:
      'Build: construct a useful relationship from those pieces - a friendly ' +
      'number, a known fact, an equal group, a bond or an easier form.',
  },
  transform: {
    prompt: 'Same value, more useful form?',
    description:
      'Transform: represent the same value in a more useful form. ' +
      'Same value, different form.',
  },
  check: {
    prompt: 'Does the result make sense?',
    description:
      'Check: estimate, reverse the operation, compare magnitude, or represent ' +
      'the answer another way to confirm it.',
  },
};

const TITLE = { see: 'See', break: 'Break', build: 'Build', transform: 'Transform', check: 'Check' };

/* The full model. `cls` is the legacy step-colour class kept for
   backward compatibility (components.css / control.css already
   target `.step-see` etc.). `stageClass` / `stageVar` are the
   Phase 2 aliases. */
export const STEPS = STEP_IDS.map((id, i) => ({
  id,
  number: i + 1,
  label: TITLE[id],
  prompt: SEMANTICS[id].prompt,
  description: SEMANTICS[id].description,
  cls: `step-${id}`,
  stageClass: `stage-${id}`,
  stageVar: `--stage-${id}`,
}));

export const STEP_BY_ID = Object.fromEntries(STEPS.map((s) => [s.id, s]));

/* Legacy shape consumed by discovery.js / control-app.js:
   { see: { label, n, cls }, ... }  */
export const STEP_META = Object.fromEntries(
  STEPS.map((s) => [s.id, { label: s.label, n: s.number, cls: s.cls }]),
);

/** Clamp a 0..5 progress value. 0 = nothing revealed. */
export const clampProgress = (v) => Math.max(0, Math.min(STEPS.length, parseInt(v, 10) || 0));

/**
 * Merge lesson step content onto the canonical model.
 * @param lessonSteps  lesson.steps  ({ see: { text, equation, ... }, ... })
 * @param keys         optional id subset / ordering
 * @returns [{ id, number, label, prompt, description, cls, stageClass,
 *             text?, equation?, annotation?, note? }]
 */
export function withLesson(lessonSteps = {}, keys = STEP_IDS) {
  return keys.map((id) => ({ ...STEP_BY_ID[id], ...(lessonSteps[id] || {}) }));
}
