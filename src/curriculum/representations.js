/* ============================================================
   Semantic representation resolver (P5)

   Maps a schema-v1 representation descriptor ({ type, role?, data? })
   onto an existing renderer — never a lesson id. See
   src/curriculum/constants.js REPRESENTATION_TYPES for the closed
   registry this resolves against (established in P3, unchanged here).

   Three outcomes, always explicit:
     'component' — a real existing diagram/teaching-component renders it
     'concrete'  — deliberately no diagram (Object stage, D0 lessons)
     'gap'       — a P2-identified visual gap; renders an honest,
                   development-safe placeholder, never a fake model

   Unknown representation types are a hard failure (UnknownRepresentationError),
   never silently ignored — an unregistered type is a corpus/schema
   problem, not a capability gap.
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
  'ten-frame': 'Ten Frame',
  'number-path': 'Number Path',
  'bundling-visual': 'Bundling / Unitizing Visual',
};

/**
 * @param rep { type, role?, data? } — one entry of lesson.representations
 * @returns { status: 'component'|'concrete'|'gap', type, render(): Node|null }
 */
export function resolveRepresentation(rep) {
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
    return { status: 'component', type: rep.type, render: () => fn(rep.data || {}) || null };
  }

  if (meta.source === 'teaching-component') {
    const fn = TEACHING_COMPONENTS[meta.component];
    if (!fn) return { status: 'gap', type: rep.type, render: () => gapPlaceholder(rep.type) };
    return { status: 'component', type: rep.type, render: () => fn(rep.data || {}) || null };
  }

  throw new UnknownRepresentationError(`"${rep.type}" has no resolvable renderer source.`);
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
