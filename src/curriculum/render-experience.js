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

const STAGE_LABEL = {
  setup: 'Setup', see: 'See', break: 'Break', build: 'Build', transform: 'Transform', check: 'Check',
};

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

  return el('div', { class: 'fr1-experience fr1-experience--teaching' },
    el('div', { class: 'fr1-header' },
      el('div', { class: 'fr1-header__eyebrow' }, `${exp.unitId} · ${exp.type}`),
      el('div', { class: 'fr1-header__title' }, exp.title),
      exp.objective ? el('div', { class: 'fr1-header__objective' }, exp.objective) : null,
    ),
    railNode(exp, player),
    el('div', { class: 'fr1-stage' },
      el('div', { class: 'fr1-stage__label' }, STAGE_LABEL[stage.id] || stage.id),
      el('div', { class: 'fr1-stage__prompt' }, stage.prompt),
    ),
    renderActiveRepresentation(player),
    stage.id === 'check' && exp.examples && exp.examples.primary
      ? el('div', { class: `fr1-result${player.isRevealed() ? ' is-revealed' : ' is-hidden'}` },
        el('div', { class: 'fr1-result__label' }, 'Result'),
        el('div', { class: 'fr1-result__value' }, player.isRevealed() ? exp.examples.primary : '?'))
      : null,
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

function renderActiveRepresentation(player) {
  const rep = player.activeRepresentation();
  if (!rep) return null;
  let resolved;
  try { resolved = resolveRepresentation(rep).render(); } catch (_) { resolved = null; }
  if (!resolved) return null;
  let status = 'unknown';
  try { status = resolveRepresentation(rep).status; } catch (_) { /* keep 'unknown' */ }
  return el('div', { class: `fr1-representation fr1-representation--${status}` }, resolved);
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
