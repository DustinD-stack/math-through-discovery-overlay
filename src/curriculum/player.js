/* ============================================================
   Lesson-player state machine (P5)

   Ephemeral runtime UI state only — no persistence, no student
   accounts, no mastery database (explicitly out of scope; see
   docs/lesson-authoring/RUNTIME_INTEGRATION.md). A player is created
   fresh for whatever experience is currently loaded and discarded
   when the presenter switches lessons.

   Dispatches on the adapted experience's `.kind` (see adapter.js).
   Mastery checks and reviews are never forced through the teaching
   five-stage model — they get their own small, honest navigation.
   ============================================================ */

export class UnknownStageError extends Error {}
export class PlayerTypeError extends Error {}

/**
 * Teaching-lesson player: SETUP (optional) -> SEE -> BREAK -> BUILD ->
 * TRANSFORM -> CHECK. SETUP is a presentation state, never counted
 * among the five canonical reasoning stages the TeachingRail displays.
 */
export function createTeachingPlayer(experience) {
  if (experience.kind !== 'teaching') {
    throw new PlayerTypeError(`createTeachingPlayer requires a "teaching" experience, got "${experience.kind}".`);
  }
  const order = experience.stages.map((s) => s.id);
  let index = 0;
  let revealed = false;
  let activeRepresentation = pickDefaultRepresentation(experience.representations);

  const stageAt = (i) => experience.stages[i];

  return {
    kind: 'teaching',
    experience,
    order: order.slice(),

    current: () => stageAt(index),
    currentIndex: () => index,
    atStart: () => index === 0,
    atEnd: () => index === order.length - 1,

    /** The current canonical rail stage (see/break/build/transform/check),
     *  or null while at the optional leading SETUP — never a sixth node. */
    railStage: () => {
      const id = order[index];
      return id === 'setup' ? null : id;
    },

    next() {
      if (index < order.length - 1) index += 1;
      return stageAt(index);
    },
    previous() {
      if (index > 0) index -= 1;
      return stageAt(index);
    },
    goTo(stageId) {
      const i = order.indexOf(stageId);
      if (i === -1) {
        throw new UnknownStageError(`"${stageId}" is not a stage of lesson "${experience.id}". Valid stages: ${order.join(', ')}.`);
      }
      index = i;
      return stageAt(index);
    },
    reset() {
      index = 0;
      revealed = false;
      activeRepresentation = pickDefaultRepresentation(experience.representations);
    },

    isRevealed: () => revealed,
    /** There is no structured "answer" object in schema-v1 (see
     *  RUNTIME_INTEGRATION.md) — reveal is a display toggle a
     *  presenter controls, most naturally used at CHECK. */
    revealAnswer() { revealed = true; return revealed; },
    hideAnswer() { revealed = false; return revealed; },

    activeRepresentation: () => activeRepresentation,
    selectRepresentation(type) {
      const rep = experience.representations.find((r) => r.type === type);
      if (!rep) {
        throw new UnknownStageError(`Lesson "${experience.id}" does not declare a "${type}" representation.`);
      }
      activeRepresentation = rep;
      return activeRepresentation;
    },
  };
}

/** Mastery-check player: a small task index, never a fake stage rail. */
export function createAssessmentPlayer(experience) {
  if (experience.kind !== 'mastery-check') {
    throw new PlayerTypeError(`createAssessmentPlayer requires a "mastery-check" experience, got "${experience.kind}".`);
  }
  const tasks = experience.tasks;
  let index = 0;
  return {
    kind: 'mastery-check',
    experience,
    taskCount: tasks.length,
    current: () => tasks[index],
    currentIndex: () => index,
    atStart: () => index === 0,
    atEnd: () => index === tasks.length - 1,
    next() { if (index < tasks.length - 1) index += 1; return tasks[index]; },
    previous() { if (index > 0) index -= 1; return tasks[index]; },
    goTo(i) {
      if (!Number.isInteger(i) || i < 0 || i >= tasks.length) {
        throw new UnknownStageError(`Task index ${i} is out of range for mastery check "${experience.id}" (0..${tasks.length - 1}).`);
      }
      index = i;
      return tasks[index];
    },
    reset() { index = 0; },
  };
}

/** Review player: a single retrieval prompt — no stage navigation to fake. */
export function createReviewPlayer(experience) {
  if (experience.kind !== 'review') {
    throw new PlayerTypeError(`createReviewPlayer requires a "review" experience, got "${experience.kind}".`);
  }
  let revealed = false;
  return {
    kind: 'review',
    experience,
    prompt: experience.prompt,
    retrieves: experience.retrieves.slice(),
    isRevealed: () => revealed,
    revealRetrieves() { revealed = true; return revealed; },
    reset() { revealed = false; },
  };
}

/** Dispatches to the right player constructor by experience.kind. */
export function createPlayer(experience) {
  switch (experience.kind) {
    case 'teaching': return createTeachingPlayer(experience);
    case 'mastery-check': return createAssessmentPlayer(experience);
    case 'review': return createReviewPlayer(experience);
    default: throw new PlayerTypeError(`Unrecognized experience kind "${experience.kind}".`);
  }
}

function pickDefaultRepresentation(representations) {
  if (!representations || !representations.length) return null;
  return representations.find((r) => r.role === 'primary') || representations[0];
}
