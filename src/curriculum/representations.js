/* ============================================================
   Semantic representation resolver (P5, extended P6)

   Maps a schema-v1 representation descriptor ({ type, role?, data? })
   onto an existing renderer — never a lesson id. See
   src/curriculum/constants.js REPRESENTATION_TYPES for the closed
   registry this resolves against.

   Three outcomes, always explicit:
     'component' — a real existing diagram/teaching-component renders it
                   (as of P6 this includes ten-frame, number-path and
                   bundling-visual — see docs/lesson-authoring/
                   VISUAL_CAPABILITIES.md)
     'concrete'  — deliberately no diagram (Object stage, D0 lessons)
     'gap'       — an as-yet-unbuilt visual; renders an honest,
                   development-safe placeholder, never a fake model.
                   The mechanism itself is NOT retired by P6 closing
                   the three known Foundation Release 1 gaps — a
                   future representation type can still be registered
                   with { status: 'gap' } the same way.

   Unknown representation types are a hard failure (UnknownRepresentationError),
   never silently ignored — an unregistered type is a corpus/schema
   problem, not a capability gap.

   `context.stageId` (optional) lets a diagram-sourced renderer receive
   presentation-only stage hints (e.g. "emphasize the empty ten-frame
   cells during BREAK") — see `stageHints()` below. This is generic,
   type-keyed presentation logic, never a lesson-id branch, and it is
   never stored in lesson data.
   ============================================================ */

import { el } from '../utils/dom.js';
import { DIAGRAMS } from '../modules/diagrams.js';
import { TeachingRail } from '../components/teaching-rail.js';
import { PromptCard } from '../components/prompt-card.js';
import { EquationWorkspace } from '../components/equation-workspace.js';
import { AnswerReveal } from '../components/answer-reveal.js';
import { NumberJobs } from '../components/number-jobs.js';
import { TransformationChain } from '../components/transformation-chain.js';
import { REPRESENTATION_TYPES } from './constants.js';

export class UnknownRepresentationError extends Error {}

const TEACHING_COMPONENTS = {
  TeachingRail, PromptCard, EquationWorkspace, AnswerReveal, NumberJobs, TransformationChain,
};

const GAP_LABELS = {
  // Populated as future representation types are registered with
  // { status: 'gap' } — empty now that P6 closed the three Foundation
  // Release 1 gaps (ten-frame, number-path, bundling-visual).
};

/**
 * @param rep { type, role?, data? } — one entry of lesson.representations
 * @param context { stageId? } — optional, presentation-only (see header)
 * @returns { status: 'component'|'concrete'|'gap', type, render(): Node|null }
 */
export function resolveRepresentation(rep, context = {}) {
  if (!rep || typeof rep.type !== 'string') {
    throw new UnknownRepresentationError('A representation descriptor requires a string "type".');
  }
  const meta = REPRESENTATION_TYPES[rep.type];
  if (!meta) {
    throw new UnknownRepresentationError(`"${rep.type}" is not a registered representation type. See src/curriculum/constants.js REPRESENTATION_TYPES — this is a corpus/schema problem, not a capability gap.`);
  }

  if (meta.status === 'gap') {
    return { status: 'gap', type: rep.type, render: () => gapPlaceholder(rep.type) };
  }

  if (meta.status === 'concrete') {
    return { status: 'concrete', type: rep.type, render: () => concretePlaceholder(rep) };
  }

  if (meta.source === 'diagram') {
    const fn = DIAGRAMS[meta.diagramKey];
    if (!fn) return { status: 'gap', type: rep.type, render: () => gapPlaceholder(rep.type) };
    const data = { ...(rep.data || {}), ...stageHints(rep.type, context.stageId) };
    return { status: 'component', type: rep.type, render: () => fn(data) || null };
  }

  if (meta.source === 'teaching-component') {
    const fn = TEACHING_COMPONENTS[meta.component];
    if (!fn) return { status: 'gap', type: rep.type, render: () => gapPlaceholder(rep.type) };
    return { status: 'component', type: rep.type, render: () => fn(rep.data || {}) || null };
  }

  throw new UnknownRepresentationError(`"${rep.type}" has no resolvable renderer source.`);
}

/**
 * Presentation-only stage hints, keyed by representation TYPE (never a
 * lesson id) and the currently active teaching-stage id. Purely
 * additive props layered on top of `rep.data`; a type with no hints
 * defined here behaves exactly as it did before P6.
 */
function stageHints(type, stageId) {
  if (!stageId) return {};
  if (type === 'ten-frame') {
    if (stageId === 'break' || stageId === 'build') return { emphasize: 'empty' };
    if (stageId === 'transform') return { emphasize: 'filled' };
    if (stageId === 'check') return { emphasize: 'total' };
    return {};
  }
  if (type === 'bundling-visual') {
    return { bundled: ['build', 'transform', 'check'].includes(stageId) };
  }
  return {};
}

function gapPlaceholder(type) {
  const label = GAP_LABELS[type] || type;
  return el('div', { class: 'repr-gap', role: 'note', 'aria-label': `Visual model pending: ${label}` },
    el('div', { class: 'repr-gap__badge' }, 'VISUAL MODEL PENDING'),
    el('div', { class: 'repr-gap__label' }, label),
    el('div', { class: 'repr-gap__note' }, 'No production component exists for this representation yet (see docs/lesson-authoring/RUNTIME_INTEGRATION.md "Known visual gaps"). The lesson itself still loads and plays normally.'),
  );
}

function concretePlaceholder(rep) {
  return el('div', { class: 'repr-concrete', role: 'note' },
    el('div', { class: 'repr-concrete__badge' }, 'OBJECT-BASED REASONING'),
    el('div', { class: 'repr-concrete__note' }, 'This stage is deliberately concrete/pre-symbolic — no diagram is used by design.'),
  );
}
