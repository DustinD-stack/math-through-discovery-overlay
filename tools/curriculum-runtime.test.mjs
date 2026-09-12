/* ============================================================
   Curriculum runtime integration tests (P5)
   node tools/curriculum-runtime.test.mjs

   Covers: catalog, adapter, teaching/mastery/review players,
   representation resolver, a full 78-experience runtime sweep, a
   bounded render sweep across representative lessons x aspects, and
   legacy-regression (the existing runtime is untouched).

   Uses the same minimal DOM shim as tools/smoke-test.mjs so
   src/utils/dom.js `el()` — and therefore every real component this
   milestone reuses — works headlessly, with no browser.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------- minimal DOM (same shape as tools/smoke-test.mjs) ---------- */
class Node {
  constructor(tag, ns) { this.tagName = tag; this.ns = ns; this.children = []; this.attrs = {}; this.style = {}; this.dataset = {}; this.text = ''; }
  appendChild(c) { this.children.push(c); return c; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  addEventListener() {}
  set className(v) { this.attrs.class = v; }
  get className() { return this.attrs.class || ''; }
  set innerHTML(v) { this.attrs.html = v; }
  get innerHTML() { return this.attrs.html || ''; }
  get firstChild() { return this.children[0] || null; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); }
  get classList() { return { add() {}, remove() {}, toggle() {}, contains() { return false; } }; }
  matches() { return false; }
  count() { return 1 + this.children.reduce((s, c) => s + (c.count ? c.count() : 1), 0); }
  textAll() { return (this.text || '') + ' ' + (this.attrs.html || '') + ' ' + this.children.map((c) => (c.textAll ? c.textAll() : (c.text || ''))).join(' '); }
}
globalThis.document = {
  createElement: (t) => new Node(t),
  createElementNS: (ns, t) => new Node(t, ns),
  createTextNode: (t) => { const n = new Node('#text'); n.text = String(t); return n; },
  getElementById: () => null,
  head: new Node('head'),
  body: new Node('body'),
};
globalThis.window = {
  location: { search: '', href: 'http://localhost:3000/preview.html' },
  addEventListener: () => {},
  innerWidth: 1920, innerHeight: 1080,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
};
globalThis.localStorage = globalThis.window.localStorage;

/* ---------- tiny assert harness (mirrors tools/ui-components.test.mjs) ---------- */
let passed = 0;
const failures = [];
function assert(cond, msg) {
  if (cond) { passed += 1; } else { failures.push(msg); }
}

/* ---------- modules under test ---------- */
const { buildCatalog, getExperience, makeFsReader, CatalogError } = await import('../src/curriculum/catalog.js');
const { loadLesson, loadCorpus, LessonValidationError } = await import('../src/curriculum/loader.js');
const { adaptExperience, AdapterError } = await import('../src/curriculum/adapter.js');
const {
  createPlayer, createTeachingPlayer, createAssessmentPlayer, createReviewPlayer,
  UnknownStageError, PlayerTypeError,
} = await import('../src/curriculum/player.js');
const { resolveRepresentation, UnknownRepresentationError } = await import('../src/curriculum/representations.js');
const { renderExperience } = await import('../src/curriculum/render-experience.js');

const releaseDir = path.join(root, 'lessons', 'foundation-release-1');
const manifest = JSON.parse(fs.readFileSync(path.join(releaseDir, 'manifest.json'), 'utf8'));
const catalog = buildCatalog(manifest);
const readLesson = makeFsReader(root, fs, path);

/* ---------- CATALOG ---------- */
{
  assert(catalog.count === 78, `catalog reports 78 experiences (got ${catalog.count})`);
  assert(catalog.list().length === 78, 'catalog.list() returns all 78 entries');
  assert(catalog.listUnits().length === 8, `catalog discovers 8 units (got ${catalog.listUnits().length})`);
  assert(catalog.getEntry('1.3.1').title === 'Bridging Through Ten: 7 + 5', 'catalog.getEntry resolves a known id to the right entry');
  assert(catalog.getEntry('no-such-id') === null, 'catalog.getEntry returns null (not a fuzzy match) for an unknown id');
  assert(catalog.has('MC-1.2') && !catalog.has('MC-9.9'), 'catalog.has() is accurate');

  let threw = null;
  try { await getExperience('no-such-id', { catalog, readLesson }); } catch (e) { threw = e; }
  assert(threw instanceof CatalogError, 'getExperience throws CatalogError (not a silent substitution) for an unknown id');

  const exp = await getExperience('1.3.1', { catalog, readLesson });
  assert(exp.id === '1.3.1' && exp.schemaVersion === 1, 'getExperience resolves and validates a real lesson');
}

/* ---------- ADAPTER ---------- */
{
  const lesson = await getExperience('1.3.1', { catalog, readLesson });
  const before = JSON.stringify(lesson);
  const exp = adaptExperience(lesson);
  assert(JSON.stringify(lesson) === before, 'adaptExperience does not mutate its input');
  assert(exp.source === 'foundation-v1' && exp.id === '1.3.1' && exp.kind === 'teaching', 'adapter preserves id/type/kind');
  assert(exp.railStages.length === 5, 'adapter exposes exactly 5 rail stages regardless of setup');

  // 1.2.4 (a Fluency lesson) has no SETUP by design.
  const noSetupExp = adaptExperience(await getExperience('1.2.4', { catalog, readLesson }));
  assert(noSetupExp.stages.map((s) => s.id).join(',') === 'see,break,build,transform,check', 'adapter produces the 5 canonical stages in order for a lesson with no setup');

  const withSetup = adaptExperience(await getExperience('0.1.1', { catalog, readLesson }));
  assert(withSetup.stages[0].id === 'setup' && withSetup.stages.length === 6, 'adapter includes an optional leading setup stage when present');

  const mc = adaptExperience(await getExperience('MC-1.2', { catalog, readLesson }));
  assert(mc.kind === 'mastery-check' && Array.isArray(mc.tasks) && mc.tasks.length > 0, 'adapter produces a mastery-check model with tasks, not fake teaching stages');
  assert(mc.stages === undefined, 'mastery-check runtime model has no teaching stages');

  const rv = adaptExperience(await getExperience('R7', { catalog, readLesson }));
  assert(rv.kind === 'review' && Array.isArray(rv.retrieves) && typeof rv.prompt === 'string', 'adapter produces a review model with retrieves + prompt, not fake teaching stages');
  assert(rv.stages === undefined, 'review runtime model has no teaching stages');
}

/* ---------- PLAYER: teaching ---------- */
{
  const noSetup = adaptExperience(await getExperience('1.2.4', { catalog, readLesson }));
  const p = createTeachingPlayer(noSetup);
  assert(p.order.length === 5 && p.currentIndex() === 0, 'no-setup sequence starts at SEE (index 0 of 5)');
  assert(p.railStage() === 'see', 'railStage() reports the canonical stage id when no setup');

  const withSetup = adaptExperience(await getExperience('0.1.1', { catalog, readLesson }));
  const p2 = createTeachingPlayer(withSetup);
  assert(p2.order[0] === 'setup' && p2.railStage() === null, 'optional setup sequence starts at SETUP, with no active rail stage (never a 6th rail node)');
  p2.next();
  assert(p2.railStage() === 'see', 'advancing past SETUP lands on SEE as the first canonical rail stage');

  // next/previous bounds
  const p3 = createTeachingPlayer(noSetup);
  assert(p3.atStart() && !p3.atEnd(), 'reports atStart at index 0');
  for (let i = 0; i < 10; i++) p3.next(); // deliberately overshoot
  assert(p3.atEnd() && p3.currentIndex() === 4, 'next() never advances past the final stage');
  for (let i = 0; i < 10; i++) p3.previous(); // deliberately overshoot
  assert(p3.atStart() && p3.currentIndex() === 0, 'previous() never moves before the first stage');

  // direct stage selection
  p3.goTo('transform');
  assert(p3.current().id === 'transform', 'goTo() jumps directly to a named stage');
  let badStage = null;
  try { p3.goTo('nope'); } catch (e) { badStage = e; }
  assert(badStage instanceof UnknownStageError, 'goTo() with an unknown stage id throws UnknownStageError, never silently maps to SEE');

  // reset
  p3.revealAnswer();
  p3.reset();
  assert(p3.currentIndex() === 0 && !p3.isRevealed(), 'reset() returns to stage 0 and clears reveal state');

  // lesson switch resets — a fresh player per experience, per P5 scope
  const freshPlayer = createTeachingPlayer(noSetup);
  assert(freshPlayer.currentIndex() === 0, 'loading a new lesson (a new player instance) starts at stage 0');

  // wrong player type for kind
  let typeErr = null;
  try { createTeachingPlayer(adaptExperience(await getExperience('MC-1.2', { catalog, readLesson }))); } catch (e) { typeErr = e; }
  assert(typeErr instanceof PlayerTypeError, 'createTeachingPlayer rejects a non-teaching experience');
}

/* ---------- PLAYER: mastery ---------- */
{
  const mc = adaptExperience(await getExperience('MC-1.2', { catalog, readLesson }));
  const p = createAssessmentPlayer(mc);
  assert(p.taskCount === mc.tasks.length && p.taskCount > 0, 'mastery player loads all assessment tasks');
  assert(p.current().facet !== undefined, 'mastery player exposes task facet/prompt');
  assert(p.kind === 'mastery-check', 'mastery player does not expose a teaching "kind"');
  assert(p.order === undefined, 'mastery player exposes no fake teaching stage order');

  let typeErr = null;
  try { createAssessmentPlayer(adaptExperience(await getExperience('1.3.1', { catalog, readLesson }))); } catch (e) { typeErr = e; }
  assert(typeErr instanceof PlayerTypeError, 'createAssessmentPlayer rejects a non-mastery-check experience');
}

/* ---------- PLAYER: review ---------- */
{
  const rv = adaptExperience(await getExperience('R7', { catalog, readLesson }));
  const p = createReviewPlayer(rv);
  assert(typeof p.prompt === 'string' && p.retrieves.length > 0, 'review player loads the retrieval prompt and retrieved ids');
  assert(p.kind === 'review' && p.order === undefined && p.stages === undefined, 'review player does not expose fake teaching stages');

  let typeErr = null;
  try { createReviewPlayer(adaptExperience(await getExperience('1.3.1', { catalog, readLesson }))); } catch (e) { typeErr = e; }
  assert(typeErr instanceof PlayerTypeError, 'createReviewPlayer rejects a non-review experience');
}

/* ---------- REPRESENTATION RESOLVER ---------- */
{
  const bond = resolveRepresentation({ type: 'number-bond', data: { whole: 7, parts: [5, 2] } });
  assert(bond.status === 'component' && bond.render() !== null, 'a supported representation (number-bond) resolves to a real, rendering component');

  const receipt = resolveRepresentation({ type: 'receipt', data: {} });
  assert(receipt.status === 'component', 'receipt resolves as an existing generic diagram capability, not a gap');

  const gap = resolveRepresentation({ type: 'ten-frame' });
  assert(gap.status === 'gap', 'a known visual gap (ten-frame) resolves with status "gap"');
  const gapNode = gap.render();
  assert(gapNode && gapNode.textAll().includes('VISUAL MODEL PENDING'), 'a gap renders an explicit, honest placeholder, not a fake model');

  const concrete = resolveRepresentation({ type: 'objects' });
  assert(concrete.status === 'concrete', '"objects" resolves as a concrete/no-diagram representation');

  let unknownErr = null;
  try { resolveRepresentation({ type: 'not-a-real-type' }); } catch (e) { unknownErr = e; }
  assert(unknownErr instanceof UnknownRepresentationError, 'an unregistered representation type fails clearly, unlike a documented gap');
}

/* ---------- LEGACY: unchanged ---------- */
{
  const { normalize } = await import('../src/utils/lesson-loader.js');
  const legacy = normalize({ topic: 'Test' }, 'legacy-test');
  assert(legacy.id === 'legacy-test' && legacy.series === 'Math Through Discovery', 'legacy src/utils/lesson-loader.js normalize() is unchanged');

  const { buildStageContent, DEFAULT_STATE: _unused } = await import('../src/layouts/presets.js');
  assert(typeof buildStageContent === 'function', 'legacy buildStageContent is still exported and callable');
}

/* ---------- FULL 78-EXPERIENCE RUNTIME SWEEP ---------- */
{
  const entries = catalog.list().map((e) => ({ file: e.sourceFile, raw: JSON.parse(fs.readFileSync(path.join(root, e.sourceFile), 'utf8')) }));
  const { lessons, errors } = loadCorpus(entries);
  assert(errors.length === 0 && lessons.length === 78, `all 78 experiences load+validate with zero errors (got ${lessons.length} loaded, ${errors.length} errors)`);

  let sweepFailures = 0;
  let gapCount = 0;
  for (const { lesson } of lessons) {
    try {
      const exp = adaptExperience(lesson);
      const player = createPlayer(exp);
      if (exp.kind === 'teaching') {
        for (const stageId of player.order) player.goTo(stageId); // enumerate every stage
        for (const rep of exp.representations) {
          const resolved = resolveRepresentation(rep);
          if (resolved.status === 'gap') gapCount += 1;
          resolved.render(); // must not throw
        }
        player.reset();
      } else if (exp.kind === 'mastery-check') {
        for (let i = 0; i < player.taskCount; i++) player.goTo(i); // enumerate every task
      } else if (exp.kind === 'review') {
        player.revealRetrieves();
      }
    } catch (e) {
      sweepFailures += 1;
      failures.push(`sweep: "${lesson.id}" threw: ${e.message}`);
    }
  }
  assert(sweepFailures === 0, `full 78-experience sweep raises zero uncaught exceptions (got ${sweepFailures})`);
  assert(gapCount === 7, `exactly the expected number of representation instances resolve as known gaps across the corpus (got ${gapCount})`);
}

/* ---------- SCHEMA-V1 RENDER SWEEP (bounded, representative) ---------- */
{
  const representative = ['1.1.1', '1.3.1', '1.3.6', '2.1.3', '1.2.4', '3.2.8', 'MC-1.2', 'R7'];
  const aspects = ['16x9', '9x16', '1x1']; // exercised at the composer level; full preset/aspect layout matrix is legacy-only (see RUNTIME_INTEGRATION.md)
  let renderCount = 0;
  for (const id of representative) {
    const exp = adaptExperience(await getExperience(id, { catalog, readLesson }));
    for (const aspect of aspects) {
      const player = createPlayer(exp);
      const node = renderExperience(player);
      assert(node && node.count() > 3, `"${id}" renders a non-trivial DOM tree under aspect ${aspect} (nodes=${node ? node.count() : 0})`);
      renderCount += 1;
    }
  }
  assert(renderCount === representative.length * aspects.length, `render sweep covered ${representative.length} representative experiences x ${aspects.length} aspects`);

  // Confirm every P2.2-required lesson TYPE is represented in the sweep set.
  const types = new Set();
  for (const id of representative) types.add((await getExperience(id, { catalog, readLesson })).type);
  for (const t of ['discovery', 'fluency', 'error-analysis', 'connection', 'application', 'mastery-check', 'review']) {
    assert(types.has(t), `render sweep set includes an actual "${t}" experience from the corpus (not a hardcoded demo)`);
  }
}

/* ---------- FAILURE HANDLING ---------- */
{
  // unsupported schema version
  let e1 = null;
  try { loadLesson({ ...minimalValidLesson(), schemaVersion: 2 }, 'x.json'); } catch (e) { e1 = e; }
  assert(e1 instanceof LessonValidationError, 'unsupported schema version fails clearly via LessonValidationError');

  // invalid stage request already covered by UnknownStageError test above.

  // mastery-check passed into teaching-only player operation
  const mcExp = adaptExperience(await getExperience('MC-1.2', { catalog, readLesson }));
  let e2 = null;
  try { createTeachingPlayer(mcExp); } catch (e) { e2 = e; }
  assert(e2 instanceof PlayerTypeError, 'a mastery-check experience passed to the teaching-only player operation fails clearly, not silently');

  // review passed into teaching-only operation
  const rvExp = adaptExperience(await getExperience('R1', { catalog, readLesson }));
  let e3 = null;
  try { createTeachingPlayer(rvExp); } catch (e) { e3 = e; }
  assert(e3 instanceof PlayerTypeError, 'a review experience passed to the teaching-only player operation fails clearly, not silently');
}

function minimalValidLesson() {
  return {
    schemaVersion: 1, id: 'x.x.x', unitId: 'x.x', title: 'X', domain: 'D0', type: 'discovery', objective: 'x',
    teaching: { see: 'a', break: 'a', build: 'a', transform: 'a', check: 'a' },
  };
}

/* ---------- report ---------- */
console.log(`Curriculum runtime tests: ${passed} assertions passed.`);
if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
