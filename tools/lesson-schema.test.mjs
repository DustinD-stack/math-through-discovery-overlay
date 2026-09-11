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

/* ---------- PILOT: every committed pilot lesson under
   lessons/foundation-release-1/ validates cleanly ---------- */
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
  assert(files.length >= 5, `at least 5 pilot lesson files exist (found ${files.length})`);
  const entries = files.map((f) => ({ file: path.relative(root, f), raw: JSON.parse(fs.readFileSync(f, 'utf8')) }));
  const { lessons, errors } = loadCorpus(entries);
  const hardErrors = errors.filter((e) => e.severity !== 'warning');
  assert(hardErrors.length === 0, `all pilot lessons validate with zero hard errors (got: ${JSON.stringify(hardErrors)})`);
  assert(lessons.length === files.length, 'every pilot lesson file loaded successfully');

  const types = new Set(lessons.map((l) => l.lesson.type));
  assert(types.has('discovery'), 'pilot set includes a discovery lesson');
  assert(types.has('error-analysis') || types.has('connection'), 'pilot set includes a connection or error-analysis lesson');
  assert(types.has('mastery-check'), 'pilot set includes a mastery-check lesson');
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
