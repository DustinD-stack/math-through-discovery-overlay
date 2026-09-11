/* ============================================================
   Production Lesson Schema V1 — loader (P3)

   load -> validate -> normalize -> stable runtime object.

   This module is intentionally independent of
   src/utils/lesson-loader.js (the legacy overlay/control/preview
   loader). Legacy lessons (lessons/*.json + lessons/lessons.bundle.js)
   are untouched and continue to load exactly as before — see
   docs/lesson-authoring/README.md "Legacy compatibility strategy"
   for why schema V1 is additive, not a replacement, in P3.

   No rendering logic lives here. No DOM. No fetch. Node and browser
   safe (pure functions over already-parsed JSON).
   ============================================================ */

import { validateLesson, validateCorpus } from './validate.js';

export class LessonValidationError extends Error {
  constructor(errors) {
    const summary = errors.map((e) => `${e.file} ${e.path}: ${e.reason}`).join('\n');
    super(`Lesson validation failed:\n${summary}`);
    this.name = 'LessonValidationError';
    this.errors = errors;
  }
}

/**
 * Normalize a validated lesson into a stable shape: every optional
 * block is present (as an empty/default value) so downstream code
 * never needs `lesson.foo && lesson.foo.bar` guards. Does not mutate
 * the input object.
 */
export function normalizeLesson(lesson) {
  const l = structuredClone(lesson);
  l.sequence = l.sequence ?? null;
  l.prerequisites = l.prerequisites ?? [];
  l.unlocks = l.unlocks ?? [];
  l.representations = l.representations ?? [];
  l.vocabulary = l.vocabulary ?? [];
  l.examples = l.examples ?? {};
  l.misconceptions = l.misconceptions ?? [];
  l.language = l.language ?? {};
  l.language.teacherPrompts = l.language.teacherPrompts ?? [];
  l.language.studentFrames = l.language.studentFrames ?? [];
  l.language.custom = l.language.custom ?? [];
  l.patterns = l.patterns ?? [];
  l.production = l.production ?? {};
  l.production.formatSupport = l.production.formatSupport ?? ['long', 'short'];
  l.production.presenter = l.production.presenter ?? 'optional';
  if (l.type !== 'mastery-check' && l.type !== 'review') {
    l.teaching = l.teaching ?? {};
    if (l.mastery === undefined) l.mastery = null;
  }
  return l;
}

/**
 * Load one already-parsed lesson object. Throws LessonValidationError
 * on any structural problem — malformed required structure and
 * unsupported schema versions FAIL CLEARLY, never silently degrade.
 * `file` is used only for error reporting.
 */
export function loadLesson(raw, file = '(unknown file)') {
  const errors = validateLesson(raw, file);
  if (errors.length) throw new LessonValidationError(errors);
  return normalizeLesson(raw);
}

/**
 * Load a whole corpus of { file, raw } entries. Returns
 * { lessons, errors } rather than throwing, so a caller (the CLI
 * validator, or a future authoring preview tool) can report every
 * problem across every file in one pass instead of stopping at the
 * first invalid file.
 */
export function loadCorpus(entries) {
  const perFileErrors = [];
  const parsedForCorpusCheck = entries.map(({ file, raw }) => ({ file, lesson: raw }));
  const corpusErrors = validateCorpus(parsedForCorpusCheck);

  const lessons = [];
  for (const { file, raw } of entries) {
    const fileErrors = validateLesson(raw, file);
    if (fileErrors.length) {
      perFileErrors.push(...fileErrors);
      continue;
    }
    lessons.push({ file, lesson: normalizeLesson(raw) });
  }

  return { lessons, errors: [...perFileErrors, ...corpusErrors] };
}
