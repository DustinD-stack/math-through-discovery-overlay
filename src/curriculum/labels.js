/* ============================================================
   Presentation-only label lookups (P7)

   Human-readable names for representation types and unit ids, used
   only by control/preview chrome (docs/TEACHING_WORKFLOW.md). These
   are NOT curriculum data — a lesson never contains a "display name,"
   only its semantic `type`/`unitId`; this module is the one place
   that turns those into words an operator reads, so the mapping
   exists exactly once.
   ============================================================ */

export const REPRESENTATION_LABELS = {
  'number-bond': 'Number Bond',
  'fraction-bar': 'Fraction Bar',
  'fraction-bar-model': 'Fraction Bar',
  'percent-bar': 'Percent Bar',
  'number-line': 'Number Line',
  'double-number-line': 'Double Number Line',
  'place-value-breakdown': 'Place Value',
  'array-model': 'Array Model',
  'area-model': 'Area Model',
  'ratio-table': 'Ratio Table',
  'unit-rate-table': 'Unit Rate Table',
  'balance-model': 'Balance Model',
  'coordinate-graph': 'Coordinate Graph',
  'bar-graph': 'Bar Graph',
  'pie-chart': 'Pie Chart',
  'receipt': 'Receipt',
  'formula-block': 'Formula',
  'equation-diagram': 'Equation',
  'teaching-rail': 'Teaching Rail',
  'prompt-card': 'Prompt Card',
  'equation-workspace': 'Equation Workspace',
  'answer-reveal': 'Answer Reveal',
  'transformation-chain': 'Transformation Chain',
  'number-jobs': 'Number Jobs',
  'objects': 'Objects (Concrete)',
  'ten-frame': 'Ten Frame',
  'number-path': 'Number Path',
  'bundling-visual': 'Bundling / Ten',
};

/** Foundation Release 1's 8 accepted unit titles (docs/foundation-release-1/README.md). */
export const UNIT_TITLES = {
  '0.1': 'Quantity Before Symbols',
  '0.2': 'Parts, Wholes & Number Location',
  '1.1': 'Number Bonds',
  '1.2': 'Benchmark Numbers',
  '1.3': 'Make 10',
  '2.1': 'Tens and Ones',
  '3.1': 'Doubles & Halves',
  '3.2': 'Compensation',
};

const STAGE_WORDS = { setup: 'Setup', see: 'See', break: 'Break', build: 'Build', transform: 'Transform', check: 'Check' };

export const labelForRepresentation = (type) => REPRESENTATION_LABELS[type] || type;
export const titleForUnit = (unitId) => UNIT_TITLES[unitId] || unitId;
export const labelForStage = (stageId) => STAGE_WORDS[stageId] || stageId;
