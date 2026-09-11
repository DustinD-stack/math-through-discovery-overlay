/* ============================================================
   Production Lesson Schema V1 — automated tests (P3)

   No test framework dependency, matching tools/smoke-test.mjs and
   tools/ui-components.test.mjs's existing convention: a tiny local
   assert harness, run with `node tools/lesson-schema.test.mjs`.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateLesson, validateCorpus } from '../src/curriculum/validate.js';
import { loadLesson, loadCorpus, normalizeLesson, LessonValidationError } from '../src/curriculum/loader.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
const failures = [];

function assert(cond, label) {
  if (cond) { passed++; return; }
  failures.push(label);
}

function isValid(lesson, label, file = 'test-fixture.json') {
  const errors = validateLesson(lesson, file);
  assert(errors.length === 0, `${label} (expected valid, got: ${errors.map((e) => e.reason).join(' | ')})`);
}

function isInvalid(lesson, label, expectedPathFragment) {
  const errors = validateLesson(lesson, 'test-fixture.json');
  const hit = errors.some((e) => e.path.includes(expectedPathFragment));
  assert(errors.length > 0 && hit, `${label} (expected an error mentioning "${expectedPathFragment}", got: ${JSON.stringify(errors.map((e) => e.path))})`);
}

/* ---------- fixtures ---------- */

const validBase = () => ({
  schemaVersion: 1,
  id: 'X.X.X',
  unitId: 'X.X',
  title: 'Test Lesson',
  domain: 'D0',
  type: 'discovery',
  objective: 'A test objective.',
  teaching: {
    see: 'see', break: 'break', build: 'build', transform: 'transform',
    check: { strategy: 'recount', prompt: 'check' },
  },
});

const validMasteryCheck = () => ({
  schemaVersion: 1,
  id: 'MC-X.X',
  unitId: 'X.X',
  title: 'Test Mastery Check',
  domain: 'D0',
  type: 'mastery-check',
  objective: 'A test objective.',
  assessment: { tasks: [{ facet: 'recognize', prompt: 'do a thing' }] },
  mastery: { facets: ['recognize'], passEvidence: 'did the thing', reteachTrigger: 'did not do the thing' },
});

const validReview = () => ({
  schemaVersion: 1,
  id: 'R-X',
  unitId: 'X.X',
  title: 'Test Review',
  domain: 'D0',
  type: 'review',
  objective: 'A test objective.',
  review: { retrieves: ['0.1.1'], prompt: 'retrieve something earlier' },
});

/* ---------- VALID cases ---------- */

isValid(validBase(), 'plain valid base lesson');
isValid(validMasteryCheck(), 'valid mastery-check lesson');
isValid(validReview(), 'valid review lesson');
for (const type of ['discovery', 'strategy', 'fluency', 'connection', 'error-analysis', 'application']) {
  isValid({ ...validBase(), type }, `valid lesson of type "${type}"`);
}
isValid({ ...validBase(), teaching: { see: 'see', break: 'break', build: 'build', transform: 'transform', check: 'a plain string check is also valid' } }, 'plain-string check stage is valid');
isValid({
  ...validBase(),
  representations: [{ type: 'number-bond', role: 'primary', data: { whole: 7, parts: [5, 2] } }],
  misconceptions: ['MC-BOND-DIRECTION'],
  language: { teacherPrompts: ['stage.see'], studentFrames: ['frame.i-see'] },
  mastery: { evidence: 'some evidence' },
  production: { formatSupport: ['long', 'short'], presenter: 'optional' },
}, 'lesson with representations/misconceptions/language/mastery/production all populated');

/* ---------- INVALID cases ---------- */

isInvalid({ ...validBase(), schemaVersion: undefined }, 'missing schemaVersion', 'schemaVersion');
isInvalid({ ...validBase(), schemaVersion: 2 }, 'unknown schemaVersion', 'schemaVersion');
isInvalid({ ...validBase(), id: undefined }, 'missing id', 'id');
isInvalid({ ...validBase(), title: '' }, 'missing title', 'title');
isInvalid({ ...validBase(), type: 'not-a-real-type' }, 'bad lesson type', 'type');
isInvalid({ ...validBase(), teaching: { see: 'see', build: 'build', transform: 't', check: 'c' } }, 'malformed stage (missing break)', 'teaching.break');
isInvalid({ ...validBase(), teaching: { ...validBase().teaching, notAStage: 'x' } }, 'unknown stage name', 'teaching.notAStage');
isInvalid({ ...validBase(), representations: [{ type: 'not-a-real-representation' }] }, 'malformed representation', 'representations[0].type');
isInvalid({ ...validMasteryCheck(), mastery: { facets: [], passEvidence: '', reteachTrigger: '' } }, 'invalid mastery block', 'mastery');
isInvalid({ ...validBase(), misconceptions: ['MC-DOES-NOT-EXIST'] }, 'invalid referenced misconception', 'misconceptions[0]');
isInvalid({ ...validBase(), production: { presenter: 'sometimes' } }, 'invalid production metadata', 'production.presenter');
isInvalid('not an object', 'lesson is not an object at all', '$');

// sequence must be a positive integer when present
isInvalid({ ...validBase(), sequence: 0 }, 'sequence zero is invalid', 'sequence');
isInvalid({ ...validBase(), sequence: 'first' }, 'sequence as string is invalid', 'sequence');

/* ---------- duplicate ID detection (corpus-level) ---------- */
{
  const a = validBase();
  const b = { ...validBase() }; // same id "X.X.X" as a
  const corpusErrors = validateCorpus([{ file: 'a.json', lesson: a }, { file: 'b.json', lesson: b }]);
  const dup = corpusErrors.find((e) => e.path === 'id' && e.severity === 'error');
  assert(!!dup, `duplicate id detection (got: ${JSON.stringify(corpusErrors)})`);
}

/* ---------- unresolved reference is a WARNING, not a hard error ---------- */
{
  const a = { ...validBase(), prerequisites: ['does-not-exist'] };
  const corpusErrors = validateCorpus([{ file: 'a.json', lesson: a }]);
  const warn = corpusErrors.find((e) => e.path === 'prerequisites[0]');
  assert(!!warn && warn.severity === 'warning', `unresolved reference is a warning (got: ${JSON.stringify(corpusErrors)})`);
}

/* ---------- LOADER: valid lessons normalize correctly ---------- */
{
  const normalized = loadLesson(validBase(), 'x.json');
  assert(Array.isArray(normalized.prerequisites) && Array.isArray(normalized.unlocks), 'loader fills default arrays for prerequisites/unlocks');
  assert(normalized.production.presenter === 'optional' && Array.isArray(normalized.production.formatSupport), 'loader fills default production metadata');
  assert(normalized.mastery === null, 'loader defaults mastery to null for ordinary lessons when absent');
}

/* ---------- LOADER: throws LessonValidationError on invalid input ---------- */
{
  let threw = null;
  try { loadLesson({ ...validBase(), title: '' }, 'bad.json'); } catch (e) { threw = e; }
  assert(threw instanceof LessonValidationError, 'loader throws LessonValidationError for invalid lessons');
  assert(threw && threw.errors.some((e) => e.path === 'title'), 'thrown error carries the structured error list');
}

/* ---------- LOADER: does not mutate the source object ---------- */
{
  const source = validBase();
  const frozenCopy = JSON.parse(JSON.stringify(source));
  loadLesson(source, 'x.json');
  assert(JSON.stringify(source) === JSON.stringify(frozenCopy), 'loadLesson does not mutate its input');
}

/* ---------- LOADER: loadCorpus reports per-file + corpus errors together ---------- */
{
  const good = validBase();
  const bad = { ...validBase(), id: 'X.X.X', title: '' }; // duplicate id AND missing title
  const { lessons, errors } = loadCorpus([{ file: 'good.json', raw: good }, { file: 'bad.json', raw: bad }]);
  assert(lessons.length === 1, 'loadCorpus keeps only structurally valid lessons in the result set');
  assert(errors.some((e) => e.file === 'bad.json' && e.path === 'title'), 'loadCorpus surfaces the per-file structural error');
}

/* ---------- FULL CORPUS (P4): the complete Foundation Release 1
   production corpus validates cleanly, with ZERO unresolved
   references, and matches the exact accepted counts. ---------- */
{
  const releaseDir = path.join(root, 'lessons', 'foundation-release-1');
  function walk(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('_')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(full));
      else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'manifest.json') out.push(full);
    }
    return out;
  }
  const files = walk(releaseDir);
  const entries = files.map((f) => ({ file: path.relative(root, f), raw: JSON.parse(fs.readFileSync(f, 'utf8')) }));
  const { lessons, errors } = loadCorpus(entries);

  assert(errors.length === 0, `full corpus has ZERO unresolved references or errors, warnings included (got ${errors.length}: ${JSON.stringify(errors.slice(0, 5))})`);
  assert(lessons.length === files.length, 'every corpus file loaded successfully');
  assert(lessons.length === 78, `total production experiences === 78 (got ${lessons.length})`);

  const byType = {};
  for (const { lesson } of lessons) byType[lesson.type] = (byType[lesson.type] || 0) + 1;
  const expectedTypes = { discovery: 21, strategy: 25, fluency: 2, connection: 6, 'error-analysis': 2, application: 1, 'mastery-check': 8, review: 13 };
  for (const [type, expected] of Object.entries(expectedTypes)) {
    assert(byType[type] === expected, `lesson type "${type}" count === ${expected} (got ${byType[type] || 0})`);
  }
  const instructionalTotal = ['discovery', 'strategy', 'fluency', 'connection', 'error-analysis', 'application']
    .reduce((sum, t) => sum + (byType[t] || 0), 0);
  assert(instructionalTotal === 57, `instructional lesson total === 57 (got ${instructionalTotal})`);

  const byUnit = {};
  for (const { lesson } of lessons) {
    if (lesson.type === 'mastery-check' || lesson.type === 'review') continue;
    byUnit[lesson.unitId] = (byUnit[lesson.unitId] || 0) + 1;
  }
  const expectedUnits = { '0.1': 8, '0.2': 8, '1.1': 7, '1.2': 5, '1.3': 7, '2.1': 7, '3.1': 7, '3.2': 8 };
  for (const [unit, expected] of Object.entries(expectedUnits)) {
    assert(byUnit[unit] === expected, `unit ${unit} instructional lesson count === ${expected} (got ${byUnit[unit] || 0})`);
  }

  const ids = new Set(lessons.map((l) => l.lesson.id));
  assert(ids.size === lessons.length, 'every lesson id in the corpus is globally unique');

  // MC-1.2 remains the release's gate, unweakened: it must require every
  // Unit 1.2 lesson and unlock 1.3.1.
  const mc12 = lessons.find((l) => l.lesson.id === 'MC-1.2').lesson;
  assert(['1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5'].every((id) => mc12.prerequisites.includes(id)), 'MC-1.2 still requires every Unit 1.2 lesson as a prerequisite');
  assert(mc12.unlocks.includes('1.3.1'), 'MC-1.2 still unlocks 1.3.1 — the release\'s single most important gate is unweakened');

  // Every review retrieves at least one lesson that is NOT its own
  // immediate prerequisite (i.e. it is not merely re-teaching the lesson
  // that precedes it).
  const reviews = lessons.filter((l) => l.lesson.type === 'review').map((l) => l.lesson);
  assert(reviews.length === 13, `exactly 13 review experiences exist (got ${reviews.length})`);
  for (const r of reviews) {
    const onlyRetrievesImmediatePrereq = r.review.retrieves.length === 1
      && r.prerequisites.length === 1
      && r.review.retrieves[0] === r.prerequisites[0];
    assert(!onlyRetrievesImmediatePrereq, `review ${r.id} retrieves earlier material, not merely its immediately preceding lesson`);
  }
  // Unit-transition reviews that retrieve from more than one PRIOR unit,
  // per docs/foundation-release-1/INTERLEAVED_REVIEW.md's actual table
  // (R4 is the one transition review that, by design, only retrieves
  // multiple lessons from the single preceding unit 0.2 — still multiple
  // lessons, just not multiple units, which the general "not merely the
  // immediate prerequisite" assertion above already covers for it).
  const transitionReviewIds = ['R7', 'R9', 'R11', 'R13'];
  for (const rid of transitionReviewIds) {
    const r = reviews.find((x) => x.id === rid);
    const unitsSpanned = new Set(r.review.retrieves.map((id) => id.split('.').slice(0, 2).join('.')));
    assert(unitsSpanned.size > 1, `unit-transition review ${rid} retrieves from more than one earlier unit (got ${JSON.stringify([...unitsSpanned])})`);
  }
}

/* ---------- REGRESSION: existing legacy runtime is untouched ---------- */
{
  const { normalize } = await import('../src/utils/lesson-loader.js');
  const legacy = normalize({ topic: 'Test' }, 'test-id');
  assert(legacy.id === 'test-id' && legacy.series === 'Math Through Discovery', 'legacy src/utils/lesson-loader.js normalize() still works unchanged');
}

/* ---------- report ---------- */
console.log(`Lesson schema tests: ${passed} assertions passed.`);
if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
