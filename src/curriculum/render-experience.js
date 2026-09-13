/* ============================================================
   Foundation Release 1 composer (P5)

   Turns a lesson-player's current state into DOM, reusing the exact
   existing teaching components and diagrams (via representations.js) —
   this file adds no new visual design, only composition.

   This is a NEW, small, additive composition path for schema-v1
   experiences. It deliberately does NOT run schema-v1 lessons through
   src/layouts/presets.js `buildStageContent`, because that function is
   semantically tied to the legacy lesson shape (lesson.steps.<id>.equation,
   lesson.diagram, lesson.answer) — forcing schema-v1 data into that
   shape would mean synthesizing structure from prose, which P5 is
   explicitly told not to do. See docs/lesson-authoring/RUNTIME_INTEGRATION.md
   "Why a new composer, not buildStageContent" for the full reasoning.

   No pixel coordinates or preset names appear here or in lesson JSON —
   this only decides WHAT is shown; aspect scaling/backgrounds remain the
   presentation layer's job (src/app/overlay-app.js `fit()`/`.stage`).
   ============================================================ */

import { el } from '../utils/dom.js';
import { TeachingRail } from '../components/teaching-rail.js';
import { resolveRepresentation } from './representations.js';
import { labelForStage, labelForRepresentation } from './labels.js';

/** Render the current state of a teaching/mastery-check/review player. */
export function renderExperience(player) {
  switch (player.kind) {
    case 'teaching': return renderTeaching(player);
    case 'mastery-check': return renderAssessment(player);
    case 'review': return renderReview(player);
    default: throw new Error(`renderExperience: unrecognized player kind "${player.kind}".`);
  }
}

function renderTeaching(player) {
  const exp = player.experience;
  const stage = player.current();
  const complete = player.sessionStatus() === 'complete';

  return el('div', {
    class: `fr1-experience fr1-experience--teaching${complete ? ' is-complete' : ''}`,
    // A stage-keyed key lets CSS run a restrained transition whenever
    // the DOM is rebuilt for a new stage (see .fr1-stage transition
    // rules in curriculum-runtime.css) — presentation-only, no lesson
    // data involved. See docs/TEACHING_WORKFLOW.md "Transition polish".
    'data-stage': stage.id,
  },
    el('div', { class: 'fr1-header' },
      el('div', { class: 'fr1-header__eyebrow' }, `${exp.unitId} · ${exp.type}`),
      el('div', { class: 'fr1-header__title' }, exp.title),
      exp.objective ? el('div', { class: 'fr1-header__objective' }, exp.objective) : null,
    ),
    railNode(exp, player),
    el('div', { class: 'fr1-stage' },
      el('div', { class: 'fr1-stage__label' }, labelForStage(stage.id)),
      el('div', { class: 'fr1-stage__prompt' }, stage.prompt),
    ),
    renderActiveRepresentation(player, stage.id),
    stage.id === 'check' && exp.examples && exp.examples.primary
      ? el('div', { class: `fr1-result${player.isRevealed() ? ' is-revealed' : ' is-hidden'}` },
        el('div', { class: 'fr1-result__label' }, 'Result'),
        el('div', { class: 'fr1-result__value' }, player.isRevealed() ? exp.examples.primary : '?'))
      : null,
    complete ? el('div', { class: 'fr1-complete', role: 'status' }, '✓ Lesson complete') : null,
  );
}

/** Reuses the real TeachingRail component, synced to the current canonical
 *  stage. SETUP maps to `current: 0` (nothing yet active) — no sixth node
 *  is ever added; the five canonical stages are always exactly what's shown. */
function railNode(exp, player) {
  const current = player.railStage();
  const steps = exp.railStages.map((id) => ({ id }));
  const currentNumber = current ? exp.railStages.indexOf(current) + 1 : 0;
  return el('div', { class: 'fr1-rail' }, TeachingRail({ steps, current: currentNumber, variant: 'rail', showText: false }));
}

function renderActiveRepresentation(player, stageId) {
  const rep = player.activeRepresentation();
  if (!rep) return null;
  const context = { stageId };
  let resolved;
  try { resolved = resolveRepresentation(rep, context).render(); } catch (_) { resolved = null; }
  if (!resolved) return null;
  let status = 'unknown';
  try { status = resolveRepresentation(rep, context).status; } catch (_) { /* keep 'unknown' */ }
  // Human-readable label only — the internal type string (e.g.
  // "ten-frame") is never shown to a teacher (docs/TEACHING_WORKFLOW.md
  // "Representations"). Multiple representations are silently listed
  // as buttons by the control panel, not here — this only ever shows
  // the single ACTIVE one.
  return el('div', { class: `fr1-representation fr1-representation--${status}` },
    player.experience.representations.length > 1
      ? el('div', { class: 'fr1-representation__label' }, labelForRepresentation(rep.type))
      : null,
    resolved,
  );
}

function renderAssessment(player) {
  const exp = player.experience;
  const task = player.current();
  return el('div', { class: 'fr1-experience fr1-experience--mastery-check' },
    el('div', { class: 'fr1-header' },
      el('div', { class: 'fr1-header__eyebrow' }, `${exp.unitId} · mastery check`),
      el('div', { class: 'fr1-header__title' }, exp.title),
    ),
    el('div', { class: 'fr1-task' },
      el('div', { class: 'fr1-task__index' }, `Task ${player.currentIndex() + 1} of ${player.taskCount}`),
      el('div', { class: 'fr1-task__facet' }, task.facet),
      el('div', { class: 'fr1-task__prompt' }, task.prompt),
    ),
    el('div', { class: 'fr1-mastery-meta' },
      el('div', {}, el('strong', {}, 'Pass evidence: '), exp.passEvidence),
      el('div', {}, el('strong', {}, 'Reteach trigger: '), exp.reteachTrigger),
    ),
  );
}

function renderReview(player) {
  const exp = player.experience;
  return el('div', { class: 'fr1-experience fr1-experience--review' },
    el('div', { class: 'fr1-header' },
      el('div', { class: 'fr1-header__eyebrow' }, `${exp.unitId} · review`),
      el('div', { class: 'fr1-header__title' }, exp.title),
    ),
    el('div', { class: 'fr1-stage' },
      el('div', { class: 'fr1-stage__label' }, 'Retrieval prompt'),
      el('div', { class: 'fr1-stage__prompt' }, player.prompt),
    ),
    player.isRevealed()
      ? el('div', { class: 'fr1-review-retrieves' },
        el('div', { class: 'fr1-review-retrieves__label' }, 'Retrieves'),
        el('ul', {}, player.retrieves.map((id) => el('li', {}, id))))
      : null,
  );
}

/**
 * Presenter/camera composition (P6). Foundation Release 1 lesson data
 * carries no camera/layout information (per the schema's own
 * layout-independence rule) — `showPresenter` is state the presentation
 * layer already owns (the same `state.layers.presenter` toggle the
 * legacy runtime and control panel already use), never lesson data.
 *
 * Percentages match the accepted Phase 6 presenter language documented
 * in docs/FIGMA_BUILD_SPEC.md / the frozen Design System: ~38% left
 * camera / ~62% workspace for 16:9, a lower ~22%-height camera strip
 * for 9:16 (workspace leads), and no camera at all for 1:1. This is a
 * new, small, additive shell (`.fr1-shell`, src/styles/curriculum-
 * runtime.css) rather than a reuse of the legacy `.stage-content`
 * preset grid, because that grid's non-9:16 rules are keyed to a
 * specific preset (A/C) that schema-v1 experiences don't have — see
 * docs/lesson-authoring/VISUAL_CAPABILITIES.md "Presenter behavior".
 *
 * `clean` (P7): true when the overlay is composited transparently over
 * a real camera in OBS (`state.background === 'transparent'` — see
 * src/app/overlay-app.js) — the labeled dashed "PRESENTER · SAFE ZONE"
 * box is a development/rehearsal aid and must not appear in actual
 * recorded output; the safe area still reserves its space (an empty
 * transparent region a real camera source sits behind in OBS), it is
 * simply not drawn. Preview always passes `clean:false` — there is no
 * real camera behind it there. See docs/TEACHING_WORKFLOW.md
 * "Presenter safe-zone label".
 */
export function wrapWithPresenter(node, { aspect = '16x9', showPresenter = false, clean = false } = {}) {
  const show = showPresenter && aspect !== '1x1'; // 1x1: camera always hidden
  const presenterBox = () => clean
    ? el('div', { class: 'fr1-presenter fr1-presenter--clean', 'aria-hidden': 'true' })
    : el('div', { class: 'fr1-presenter', role: 'note', 'aria-label': 'Presenter safe zone' },
      el('div', { class: 'fr1-presenter__badge' }, 'PRESENTER'),
      el('div', { class: 'fr1-presenter__label' }, 'SAFE ZONE'),
    );
  const workspace = el('div', { class: 'fr1-workspace' }, node);

  if (aspect === '9x16') {
    // Board leads; camera (when on) is the lower ~22% strip.
    return el('div', { class: `fr1-shell fr1-shell--9x16${show ? ' has-presenter' : ' no-presenter'}` },
      workspace, show ? presenterBox() : null);
  }
  if (aspect === '1x1') {
    return el('div', { class: 'fr1-shell fr1-shell--1x1' }, workspace);
  }
  // 16:9 — camera left ~38%, workspace right ~62%; OFF recomposes to a
  // centered workspace with no dead camera-shaped rectangle.
  return el('div', { class: `fr1-shell fr1-shell--16x9${show ? ' has-presenter' : ' no-presenter'}` },
    show ? presenterBox() : null, workspace);
}
