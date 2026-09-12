/* ============================================================
   Schema-v1 runtime adapter (P5)

   Converts a VALIDATED, NORMALIZED schema-v1 lesson (loader.js's
   `normalizeLesson` output) into the small runtime model the lesson
   player and presentation layer actually need. This is the one place
   allowed to know the schema-v1 field shape; everything downstream
   (player.js, representations.js, render-experience.js) only knows
   the runtime model below.

   Pure function. Never mutates its input. Never produces legacy-shaped
   lesson objects — see docs/lesson-authoring/RUNTIME_INTEGRATION.md
   "Architecture guard" for why that would defeat the schema.
   ============================================================ */

const CANONICAL_STAGES = Object.freeze(['see', 'break', 'build', 'transform', 'check']);

export class AdapterError extends Error {}

/**
 * @param lesson a normalized schema-v1 lesson (see src/curriculum/loader.js)
 * @returns a runtime experience model, discriminated by `.kind`:
 *   'teaching'      — stages[], the 5 canonical + optional leading setup
 *   'mastery-check' — tasks[]
 *   'review'        — retrieves[] + prompt
 */
export function adaptExperience(lesson) {
  if (!lesson || typeof lesson !== 'object') {
    throw new AdapterError('adaptExperience requires a normalized lesson object.');
  }

  const base = {
    source: 'foundation-v1',
    id: lesson.id,
    unitId: lesson.unitId,
    sequence: lesson.sequence,
    title: lesson.title,
    domain: lesson.domain,
    type: lesson.type,
    objective: lesson.objective,
    prerequisites: lesson.prerequisites,
    unlocks: lesson.unlocks,
    representations: lesson.representations,
    language: lesson.language,
    production: lesson.production,
  };

  if (lesson.type === 'mastery-check') {
    return {
      ...base,
      kind: 'mastery-check',
      tasks: (lesson.assessment && lesson.assessment.tasks) || [],
      facets: (lesson.mastery && lesson.mastery.facets) || [],
      passEvidence: lesson.mastery && lesson.mastery.passEvidence,
      reteachTrigger: lesson.mastery && lesson.mastery.reteachTrigger,
    };
  }

  if (lesson.type === 'review') {
    return {
      ...base,
      kind: 'review',
      retrieves: (lesson.review && lesson.review.retrieves) || [],
      prompt: lesson.review && lesson.review.prompt,
    };
  }

  // Every other lesson type is a teaching-stage experience.
  const teaching = lesson.teaching || {};
  const stages = [];
  if (teaching.setup !== undefined) stages.push(stageEntry('setup', teaching.setup));
  for (const key of CANONICAL_STAGES) {
    if (teaching[key] === undefined) {
      throw new AdapterError(`Lesson "${lesson.id}" is missing required teaching stage "${key}" — the schema-v1 validator should have caught this before the adapter ever ran.`);
    }
    stages.push(stageEntry(key, teaching[key]));
  }

  return {
    ...base,
    kind: 'teaching',
    studentQuestion: lesson.studentQuestion,
    newIdea: lesson.newIdea,
    vocabulary: lesson.vocabulary,
    stages,
    railStages: CANONICAL_STAGES.slice(),
    examples: lesson.examples,
    misconceptions: lesson.misconceptions,
    masteryEvidence: lesson.mastery && lesson.mastery.evidence,
  };
}

function stageEntry(id, value) {
  if (typeof value === 'string') return { id, prompt: value, strategy: null };
  return { id, prompt: value.prompt, strategy: value.strategy || null };
}

export const CANONICAL_TEACHING_STAGES = CANONICAL_STAGES;
