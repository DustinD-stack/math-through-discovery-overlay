/* ============================================================
   Curriculum schema constants — Production Lesson Schema V1 (P3)

   This module defines the closed vocabularies the schema validator
   checks lesson data against. It does NOT render anything and does
   NOT touch the existing overlay/control/preview runtime — it is a
   parallel, additive system for Foundation Release 1 authoring only
   (see docs/lesson-authoring/README.md "Legacy compatibility").
   ============================================================ */

/** The only schema version this codebase understands. An unknown
 *  version must fail validation, never be silently reinterpreted. */
export const SCHEMA_VERSION = 1;

/** Lesson (and lesson-family) types. Mastery checks and interleaved
 *  reviews are represented in the SAME base envelope as ordinary
 *  lessons (see loader.js) rather than as separate schemas — the only
 *  real structural difference is which block replaces `teaching`. */
export const LESSON_TYPES = Object.freeze([
  'discovery',
  'strategy',
  'fluency',
  'connection',
  'error-analysis',
  'application',
  'mastery-check',
  'review',
]);

/** Lesson types that use the ordinary five/six-part `teaching` block. */
export const TEACHING_TYPES = Object.freeze(
  LESSON_TYPES.filter((t) => t !== 'mastery-check' && t !== 'review'),
);

/** Canonical teaching-stage keys, in order. `setup` is presentation
 *  only — never a sixth reasoning stage (docs/CURRICULUM_ARCHITECTURE.md
 *  §11 / Foundation Release 1 README). Any key outside this set inside
 *  a lesson's `teaching` object is a validation error. */
export const STAGE_KEYS = Object.freeze(['setup', 'see', 'break', 'build', 'transform', 'check']);

/** Stages a teaching-type lesson must provide (setup is optional —
 *  P2.3: "a stage may be intentionally minimal when pedagogically
 *  appropriate," and several Unit 0.1/0.2 lessons have no true SETUP
 *  distinct from SEE). */
export const REQUIRED_STAGE_KEYS = Object.freeze(['see', 'break', 'build', 'transform', 'check']);

/**
 * Representation type registry. `status: 'component'` types map onto
 * an existing, real rendering surface (either `src/modules/diagrams.js`
 * DIAGRAMS registry keys, reused verbatim as the public contract per
 * P3's instruction to inspect that registry first, or a Phase 6
 * teaching component from `src/components/`). `status: 'gap'` types
 * are the three visual gaps P2 identified and explicitly forbids P3
 * from inventing — they are valid *semantic* data a lesson may declare,
 * but the schema never pretends a rendering component exists for them.
 */
export const REPRESENTATION_TYPES = Object.freeze({
  // --- existing src/modules/diagrams.js DIAGRAMS registry keys ---
  'number-bond': { status: 'component', source: 'diagram', diagramKey: 'numberBond' },
  'fraction-bar': { status: 'component', source: 'diagram', diagramKey: 'fractionBar' },
  'fraction-bar-model': { status: 'component', source: 'diagram', diagramKey: 'fractionBarModel' },
  'percent-bar': { status: 'component', source: 'diagram', diagramKey: 'percentBar' },
  'number-line': { status: 'component', source: 'diagram', diagramKey: 'numberLine' },
  'double-number-line': { status: 'component', source: 'diagram', diagramKey: 'doubleNumberLine' },
  'place-value-breakdown': { status: 'component', source: 'diagram', diagramKey: 'placeValueBreakdown' },
  'array-model': { status: 'component', source: 'diagram', diagramKey: 'arrayModel' },
  'area-model': { status: 'component', source: 'diagram', diagramKey: 'areaModel' },
  'ratio-table': { status: 'component', source: 'diagram', diagramKey: 'ratioTable' },
  'unit-rate-table': { status: 'component', source: 'diagram', diagramKey: 'unitRateTable' },
  'balance-model': { status: 'component', source: 'diagram', diagramKey: 'balanceModel' },
  'coordinate-graph': { status: 'component', source: 'diagram', diagramKey: 'coordinateGraph' },
  'bar-graph': { status: 'component', source: 'diagram', diagramKey: 'barGraph' },
  'pie-chart': { status: 'component', source: 'diagram', diagramKey: 'pieChart' },
  'receipt': { status: 'component', source: 'diagram', diagramKey: 'receipt' },
  'formula-block': { status: 'component', source: 'diagram', diagramKey: 'formulaBlock' },
  'equation-diagram': { status: 'component', source: 'diagram', diagramKey: 'equation' },

  // --- Phase 6 teaching components (src/components/*.js) — not part
  //     of the DIAGRAMS registry; used directly by src/layouts/workspace.js ---
  'teaching-rail': { status: 'component', source: 'teaching-component', component: 'TeachingRail' },
  'prompt-card': { status: 'component', source: 'teaching-component', component: 'PromptCard' },
  'equation-workspace': { status: 'component', source: 'teaching-component', component: 'EquationWorkspace' },
  'answer-reveal': { status: 'component', source: 'teaching-component', component: 'AnswerReveal' },
  'transformation-chain': { status: 'component', source: 'teaching-component', component: 'TransformationChain' },
  // NumberJobs: available under the generic representation system (decision
  // documented in docs/lesson-authoring/README.md "NumberJobs decision") but
  // NOT referenced by any Foundation Release 1 pilot lesson and NOT wired
  // into any loader/runtime auto-behavior.
  'number-jobs': { status: 'component', source: 'teaching-component', component: 'NumberJobs' },

  // --- pre-symbolic / no rendering component (Unit 0.1–0.2 by design) ---
  'objects': { status: 'concrete', source: 'none' },

  // --- P2-identified visual gaps (docs/foundation-release-1/README.md
  //     "Visual gaps flagged") — valid semantic data, no production
  //     renderer exists; P3 does not invent one. ---
  'ten-frame': { status: 'gap', source: 'none' },
  'number-path': { status: 'gap', source: 'none' },
  'bundling-visual': { status: 'gap', source: 'none' },
});

export const REPRESENTATION_ROLES = Object.freeze(['primary', 'secondary']);

export const PRESENTER_VALUES = Object.freeze(['recommended', 'optional', 'not-needed']);

export const FORMAT_VALUES = Object.freeze(['long', 'short']);

/** The 8-facet mastery model (docs/CURRICULUM_ARCHITECTURE.md §10). */
export const MASTERY_FACETS = Object.freeze([
  'recognize', 'represent', 'break', 'build', 'transform', 'explain', 'check', 'transfer',
]);

/** Canonical CHECK strategy names (docs/CURRICULUM_ARCHITECTURE.md §12). */
export const CHECK_STRATEGIES = Object.freeze([
  'inverse-operation', 'estimation', 'bounds', 'benchmark-comparison',
  'alternate-representation', 'commutativity', 'substitution', 'number-line',
  'mental-reasonableness', 'unit-context-check', 'recount', 'cross-check',
]);

/** Canonical reasoning-pattern slugs (docs/CURRICULUM_ARCHITECTURE.md §5). */
export const REASONING_PATTERNS = Object.freeze([
  'make-a-benchmark', 'break-by-place-value', 'double-half', 'compensate',
  'distribute', 'factor-group', 'scale', 'inverse-operations', 'part-whole',
  'equivalence', 'remainder-to-fraction', 'fraction-to-decimal',
  'ratio-as-relationship', 'unknown-as-missing-quantity', 'balance-equality',
  'estimate-solve-check', 'regroup-rename', 'unitize',
]);
