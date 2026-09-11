/* ============================================================
   Production Lesson Schema V1 — validator (P3)

   Pure functions only: no file I/O, no rendering, no mutation of the
   input. `tools/lesson-validate.mjs` is the CLI that wires this to the
   filesystem; `loader.js` wires it to normalization.

   Every error is { file, path, reason } — never a bare "Invalid lesson."
   ============================================================ */

import {
  SCHEMA_VERSION, LESSON_TYPES, TEACHING_TYPES, STAGE_KEYS, REQUIRED_STAGE_KEYS,
  REPRESENTATION_TYPES, REPRESENTATION_ROLES, PRESENTER_VALUES, FORMAT_VALUES,
  MASTERY_FACETS, CHECK_STRATEGIES,
} from './constants.js';
import misconceptions from './misconceptions.json' with { type: 'json' };
import language from './language.json' with { type: 'json' };

const err = (file, path, reason, severity = 'error') => ({ file, path, reason, severity });

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Validate one lesson object already parsed from JSON. Does not
 *  require other lessons to exist — see `validateCorpus` for
 *  cross-lesson checks (duplicate IDs, unresolved references). */
export function validateLesson(lesson, file = '(unknown file)') {
  const errors = [];
  const add = (path, reason) => errors.push(err(file, path, reason));

  if (!isPlainObject(lesson)) {
    add('$', 'Expected the lesson to be a JSON object.');
    return errors; // nothing else is checkable
  }

  // ---- schemaVersion ----
  if (lesson.schemaVersion === undefined) {
    add('schemaVersion', 'Missing. Every lesson must declare "schemaVersion": 1.');
  } else if (lesson.schemaVersion !== SCHEMA_VERSION) {
    add('schemaVersion', `Unsupported schema version ${JSON.stringify(lesson.schemaVersion)}. This codebase only understands schemaVersion ${SCHEMA_VERSION}. Do not silently reinterpret — upgrade the loader or the lesson.`);
  }

  // ---- id / unitId ----
  if (!isNonEmptyString(lesson.id)) add('id', 'Expected a non-empty string.');
  if (!isNonEmptyString(lesson.unitId)) add('unitId', 'Expected a non-empty string.');

  // ---- sequence (optional, but must be a positive integer if present) ----
  if (lesson.sequence !== undefined) {
    if (!Number.isInteger(lesson.sequence) || lesson.sequence < 1) {
      add('sequence', 'Expected a positive integer when present.');
    }
  }

  // ---- title ----
  if (!isNonEmptyString(lesson.title)) add('title', 'Expected a non-empty string.');

  // ---- domain ----
  if (!isNonEmptyString(lesson.domain)) add('domain', 'Expected a non-empty string (e.g. "D0").');

  // ---- type ----
  if (!isNonEmptyString(lesson.type)) {
    add('type', 'Expected a non-empty string.');
  } else if (!LESSON_TYPES.includes(lesson.type)) {
    add('type', `"${lesson.type}" is not a recognized lesson type. Allowed: ${LESSON_TYPES.join(', ')}.`);
  }
  const type = lesson.type;
  const isTeachingType = TEACHING_TYPES.includes(type);

  // ---- objective ----
  if (!isNonEmptyString(lesson.objective)) add('objective', 'Expected a non-empty string.');

  // ---- prerequisites / unlocks (arrays of id-like strings; existence
  //      across the corpus is checked in validateCorpus) ----
  for (const [key, val] of [['prerequisites', lesson.prerequisites], ['unlocks', lesson.unlocks]]) {
    if (val === undefined) continue; // optional
    if (!Array.isArray(val) || val.some((v) => !isNonEmptyString(v))) {
      add(key, 'Expected an array of non-empty id strings when present.');
    }
  }

  // ---- representations ----
  if (lesson.representations !== undefined) {
    if (!Array.isArray(lesson.representations) || lesson.representations.length === 0) {
      add('representations', 'Expected a non-empty array when present.');
    } else {
      lesson.representations.forEach((rep, i) => {
        const p = `representations[${i}]`;
        if (!isPlainObject(rep)) { add(p, 'Expected an object with at least a "type".'); return; }
        if (!isNonEmptyString(rep.type)) {
          add(`${p}.type`, 'Expected a non-empty string.');
        } else if (!Object.prototype.hasOwnProperty.call(REPRESENTATION_TYPES, rep.type)) {
          add(`${p}.type`, `"${rep.type}" is not a recognized representation type. See src/curriculum/constants.js REPRESENTATION_TYPES.`);
        }
        if (rep.role !== undefined && !REPRESENTATION_ROLES.includes(rep.role)) {
          add(`${p}.role`, `Expected one of: ${REPRESENTATION_ROLES.join(', ')}.`);
        }
        if (rep.data !== undefined && !isPlainObject(rep.data)) {
          add(`${p}.data`, 'Expected an object when present.');
        }
      });
    }
  }

  // ---- vocabulary (optional array of strings) ----
  if (lesson.vocabulary !== undefined) {
    if (!Array.isArray(lesson.vocabulary) || lesson.vocabulary.some((v) => !isNonEmptyString(v))) {
      add('vocabulary', 'Expected an array of non-empty strings when present.');
    }
  }

  // ---- teaching / assessment / review — mutually exclusive by type ----
  if (isTeachingType) {
    validateTeaching(lesson.teaching, add);
    if (lesson.assessment !== undefined) add('assessment', `"assessment" is only valid for type "mastery-check", not "${type}".`);
    if (lesson.review !== undefined) add('review', `"review" is only valid for type "review", not "${type}".`);
  } else if (type === 'mastery-check') {
    validateAssessment(lesson.assessment, add);
    if (lesson.teaching !== undefined) add('teaching', '"teaching" is not used by type "mastery-check" — use "assessment" instead.');
  } else if (type === 'review') {
    validateReview(lesson.review, add);
    if (lesson.teaching !== undefined) add('teaching', '"teaching" is not used by type "review" — use "review" instead.');
  }

  // ---- examples (recommended for teaching types, optional otherwise) ----
  if (lesson.examples !== undefined) {
    if (!isPlainObject(lesson.examples)) {
      add('examples', 'Expected an object with primary/second/transfer when present.');
    } else {
      for (const k of ['primary', 'second', 'transfer']) {
        if (lesson.examples[k] !== undefined && !isNonEmptyString(lesson.examples[k])) {
          add(`examples.${k}`, 'Expected a non-empty string when present.');
        }
      }
    }
  }

  // ---- misconceptions (array of registry ids) ----
  if (lesson.misconceptions !== undefined) {
    if (!Array.isArray(lesson.misconceptions)) {
      add('misconceptions', 'Expected an array of misconception ids.');
    } else {
      lesson.misconceptions.forEach((id, i) => {
        if (!isNonEmptyString(id)) { add(`misconceptions[${i}]`, 'Expected a non-empty string id.'); return; }
        if (!Object.prototype.hasOwnProperty.call(misconceptions, id)) {
          add(`misconceptions[${i}]`, `"${id}" is not defined in src/curriculum/misconceptions.json.`);
        }
      });
    }
  }

  // ---- language references ----
  if (lesson.language !== undefined) {
    if (!isPlainObject(lesson.language)) {
      add('language', 'Expected an object with teacherPrompts/studentFrames when present.');
    } else {
      validateLanguageRefs(lesson.language.teacherPrompts, 'language.teacherPrompts', language.teacherPrompts, add);
      validateLanguageRefs(lesson.language.studentFrames, 'language.studentFrames', language.studentFrames, add);
      if (lesson.language.custom !== undefined
        && (!Array.isArray(lesson.language.custom) || lesson.language.custom.some((v) => !isNonEmptyString(v)))) {
        add('language.custom', 'Expected an array of non-empty strings when present.');
      }
    }
  }

  // ---- mastery (evidence for ordinary lessons; full block for mastery-check) ----
  if (type === 'mastery-check') {
    validateMasteryCheckBlock(lesson.mastery, add);
  } else if (lesson.mastery !== undefined) {
    if (!isPlainObject(lesson.mastery) || !isNonEmptyString(lesson.mastery.evidence)) {
      add('mastery.evidence', 'Expected an object with a non-empty "evidence" string when "mastery" is present.');
    }
  }

  // ---- production metadata ----
  if (lesson.production !== undefined) {
    if (!isPlainObject(lesson.production)) {
      add('production', 'Expected an object when present.');
    } else {
      const fs = lesson.production.formatSupport;
      if (fs !== undefined) {
        if (!Array.isArray(fs) || fs.length === 0 || fs.some((v) => !FORMAT_VALUES.includes(v))) {
          add('production.formatSupport', `Expected a non-empty array drawn from: ${FORMAT_VALUES.join(', ')}.`);
        }
      }
      if (lesson.production.presenter !== undefined && !PRESENTER_VALUES.includes(lesson.production.presenter)) {
        add('production.presenter', `Expected one of: ${PRESENTER_VALUES.join(', ')}.`);
      }
    }
  }

  // ---- patterns (optional, canonical slugs) ----
  if (lesson.patterns !== undefined) {
    if (!Array.isArray(lesson.patterns)) {
      add('patterns', 'Expected an array of canonical pattern slugs when present.');
    }
    // Note: pattern slugs are advisory (REASONING_PATTERNS), not hard-enforced here —
    // new patterns are expected to be added over time; unknown slugs are a lint
    // opportunity for tools/lesson-validate.mjs's warning output, not a hard failure.
  }

  return errors;
}

function validateTeaching(teaching, add) {
  if (!isPlainObject(teaching)) {
    add('teaching', 'Expected an object with see/break/build/transform/check (and optionally setup).');
    return;
  }
  for (const key of Object.keys(teaching)) {
    if (!STAGE_KEYS.includes(key)) {
      add(`teaching.${key}`, `"${key}" is not a recognized teaching stage. Allowed: ${STAGE_KEYS.join(', ')}.`);
    }
  }
  for (const key of REQUIRED_STAGE_KEYS) {
    const v = teaching[key];
    if (v === undefined) { add(`teaching.${key}`, 'Missing. Every teaching-type lesson needs see/break/build/transform/check.'); continue; }
    validateStageValue(v, `teaching.${key}`, key, add);
  }
  if (teaching.setup !== undefined) validateStageValue(teaching.setup, 'teaching.setup', 'setup', add);
}

function validateStageValue(v, path, stageKey, add) {
  if (isNonEmptyString(v)) return; // a plain narrative string is always valid
  if (isPlainObject(v)) {
    if (!isNonEmptyString(v.prompt)) add(`${path}.prompt`, 'Expected a non-empty string.');
    if (stageKey === 'check' && v.strategy !== undefined && !CHECK_STRATEGIES.includes(v.strategy)) {
      add(`${path}.strategy`, `"${v.strategy}" is not a recognized check strategy. Allowed: ${CHECK_STRATEGIES.join(', ')}.`);
    }
    return;
  }
  add(path, 'Expected a non-empty string, or an object with a "prompt" string.');
}

function validateAssessment(assessment, add) {
  if (!isPlainObject(assessment)) {
    add('assessment', 'Expected an object with a non-empty "tasks" array (type "mastery-check").');
    return;
  }
  if (!Array.isArray(assessment.tasks) || assessment.tasks.length === 0) {
    add('assessment.tasks', 'Expected a non-empty array.');
    return;
  }
  assessment.tasks.forEach((task, i) => {
    const p = `assessment.tasks[${i}]`;
    if (!isPlainObject(task)) { add(p, 'Expected an object with facet/prompt.'); return; }
    if (!isNonEmptyString(task.facet) || !MASTERY_FACETS.includes(task.facet)) {
      add(`${p}.facet`, `Expected one of: ${MASTERY_FACETS.join(', ')}.`);
    }
    if (!isNonEmptyString(task.prompt)) add(`${p}.prompt`, 'Expected a non-empty string.');
  });
}

function validateReview(review, add) {
  if (!isPlainObject(review)) {
    add('review', 'Expected an object with "retrieves" (array of lesson ids) and a "prompt" (type "review").');
    return;
  }
  if (!Array.isArray(review.retrieves) || review.retrieves.length === 0 || review.retrieves.some((v) => !isNonEmptyString(v))) {
    add('review.retrieves', 'Expected a non-empty array of non-empty lesson-id strings.');
  }
  if (!isNonEmptyString(review.prompt)) add('review.prompt', 'Expected a non-empty string.');
}

function validateMasteryCheckBlock(mastery, add) {
  if (!isPlainObject(mastery)) {
    add('mastery', 'Expected an object with facets/passEvidence/reteachTrigger (type "mastery-check").');
    return;
  }
  if (!Array.isArray(mastery.facets) || mastery.facets.length === 0 || mastery.facets.some((f) => !MASTERY_FACETS.includes(f))) {
    add('mastery.facets', `Expected a non-empty array drawn from: ${MASTERY_FACETS.join(', ')}.`);
  }
  if (!isNonEmptyString(mastery.passEvidence)) add('mastery.passEvidence', 'Expected a non-empty string.');
  if (!isNonEmptyString(mastery.reteachTrigger)) add('mastery.reteachTrigger', 'Expected a non-empty string.');
}

function validateLanguageRefs(refs, path, registry, add) {
  if (refs === undefined) return;
  if (!Array.isArray(refs) || refs.some((v) => !isNonEmptyString(v))) {
    add(path, 'Expected an array of non-empty registry-key strings when present.');
    return;
  }
  refs.forEach((key, i) => {
    if (!Object.prototype.hasOwnProperty.call(registry, key)) {
      add(`${path}[${i}]`, `"${key}" is not defined in src/curriculum/language.json.`);
    }
  });
}

/**
 * Cross-lesson checks that require the whole loaded set: duplicate IDs
 * and unresolved prerequisite/unlocks references. `entries` is an array
 * of { file, lesson } for already-parsed (not necessarily individually
 * valid) lessons.
 */
export function validateCorpus(entries) {
  const errors = [];
  const seen = new Map(); // id -> file
  const ids = new Set();
  for (const { lesson } of entries) {
    if (isPlainObject(lesson) && isNonEmptyString(lesson.id)) ids.add(lesson.id);
  }
  for (const { file, lesson } of entries) {
    if (!isPlainObject(lesson) || !isNonEmptyString(lesson.id)) continue;
    if (seen.has(lesson.id)) {
      errors.push(err(file, 'id', `Duplicate lesson id "${lesson.id}" — already used by ${seen.get(lesson.id)}.`));
    } else {
      seen.set(lesson.id, file);
    }
    for (const key of ['prerequisites', 'unlocks']) {
      const refs = lesson[key];
      if (!Array.isArray(refs)) continue;
      refs.forEach((ref, i) => {
        if (typeof ref === 'string' && !ids.has(ref)) {
          // A WARNING, not an error: during a partial pilot/migration it is
          // expected and correct for a lesson to reference a P2 blueprint id
          // that has not been converted to schema V1 yet. Duplicate ids
          // (above) are the only corpus-level condition that fails the build.
          errors.push(err(file, `${key}[${i}]`, `References lesson id "${ref}", which does not exist in the loaded set. This is expected while only a pilot subset of lessons has been converted to schema V1 (see docs/lesson-authoring/README.md) and does not fail validation — it will become a hard error once Foundation Release 1 is fully migrated and every id is expected to resolve.`, 'warning'));
        }
      });
    }
  }
  return errors;
}
