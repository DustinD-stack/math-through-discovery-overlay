/* ============================================================
   Teaching workflow tests (P7)
   node tools/workflow.test.mjs

   Covers: session start/reset/switch determinism, keyboard shortcut
   mapping, reveal policy, representation-switch behavior, presenter
   toggle state preservation, mastery/review navigation, and failure
   handling for the P7 workflow layer (session semantics, shortcuts,
   presenter composition) built on top of the P5/P6 player/resolver.

   Uses the same minimal DOM shim as the other tools/*.test.mjs files.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

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
  find(pred, out = []) { if (pred(this)) out.push(this); for (const c of this.children) if (c.find) c.find(pred, out); return out; }
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

let passed = 0;
const failures = [];
function assert(cond, msg) { if (cond) passed += 1; else failures.push(msg); }

const { buildCatalog, getExperience, makeFsReader } = await import('../src/curriculum/catalog.js');
const { adaptExperience } = await import('../src/curriculum/adapter.js');
const {
  createPlayer, createTeachingPlayer, UnknownStageError, PlayerTypeError,
} = await import('../src/curriculum/player.js');
const { renderExperience, wrapWithPresenter } = await import('../src/curriculum/render-experience.js');
const { resolveFr1Shortcut, isTypingTarget } = await import('../src/curriculum/shortcuts.js');
const { labelForRepresentation, titleForUnit, labelForStage } = await import('../src/curriculum/labels.js');

const releaseDir = path.join(root, 'lessons', 'foundation-release-1');
const manifest = JSON.parse(fs.readFileSync(path.join(releaseDir, 'manifest.json'), 'utf8'));
const catalog = buildCatalog(manifest);
const readLesson = makeFsReader(root, fs, path);

/* =========================== SESSION =========================== */
{
  // START = a fresh player instance: deterministic index 0, no reveal,
  // default representation — matches docs/TEACHING_WORKFLOW.md
  // "Starting a lesson" and src/app/overlay-app.js fr1Select().
  const exp = adaptExperience(await getExperience('1.3.1', { catalog, readLesson }));
  const started = createPlayer(exp);
  assert(started.currentIndex() === 0, 'START: a fresh player begins at stage/task 0');
  assert(!started.isRevealed(), 'START: a fresh player begins with reveal hidden');
  assert(started.sessionStatus() === 'teaching', 'START: a fresh multi-stage player reports sessionStatus "teaching"');

  // advance, reveal, then RESET must return to the initial state
  started.next(); started.next(); started.revealAnswer();
  assert(started.currentIndex() === 2 && started.isRevealed(), 'sanity: player actually advanced and revealed before reset');
  started.reset();
  assert(started.currentIndex() === 0 && !started.isRevealed(), 'RESET returns stage and reveal to the initial teaching state');

  // RESET must not require recreating the player or touching the
  // experience/id — same object, same identity, only internal pointers move.
  assert(started.experience.id === '1.3.1', 'RESET preserves the loaded lesson identity (does not silently substitute another lesson)');

  // Lesson SWITCH = load a different experience -> a brand-new player;
  // the old player's state cannot leak into the new one.
  const other = createPlayer(adaptExperience(await getExperience('1.1.1', { catalog, readLesson })));
  assert(other.experience.id === '1.1.1' && other.currentIndex() === 0, 'SWITCH: loading a different lesson yields an independent, freshly-initialized player');

  // Completion signal at the final stage (always CHECK), non-gamified.
  const atEnd = createPlayer(adaptExperience(await getExperience('1.2.4', { catalog, readLesson })));
  for (const s of atEnd.order) atEnd.goTo(s);
  assert(atEnd.atEnd() && atEnd.sessionStatus() === 'complete', 'reaching the final stage reports sessionStatus "complete"');
  assert(atEnd.current().id === 'check', 'the final stage is always CHECK (no lesson jumps ahead automatically)');
}

/* =========================== KEYBOARD =========================== */
{
  const teaching = { active: true, kind: 'teaching', order: ['see', 'break', 'build', 'transform', 'check'] };
  const teachingWithSetup = { active: true, kind: 'teaching', order: ['setup', 'see', 'break', 'build', 'transform', 'check'] };
  const mastery = { active: true, kind: 'mastery-check' };
  const inactive = { active: false };

  assert(resolveFr1Shortcut('ArrowRight', teaching) === 'next', 'ArrowRight -> next');
  assert(resolveFr1Shortcut(' ', teaching) === 'next', 'Space -> next');
  assert(resolveFr1Shortcut('ArrowLeft', teaching) === 'previous', 'ArrowLeft -> previous');
  assert(resolveFr1Shortcut('r', teaching) === 'reveal', '"r" -> reveal');
  assert(resolveFr1Shortcut('R', teaching) === 'reveal', '"R" (shift) -> reveal too');
  assert(resolveFr1Shortcut('Home', teaching) === 'reset', 'Home -> reset');
  assert(resolveFr1Shortcut('3', teaching) === 'goto:build', '"3" -> goto:build (SEE=1..CHECK=5)');
  assert(resolveFr1Shortcut('1', teaching) === 'goto:see', '"1" -> goto:see');
  assert(resolveFr1Shortcut('5', teaching) === 'goto:check', '"5" -> goto:check');
  assert(resolveFr1Shortcut('0', teaching) === null, '"0" is a no-op when the lesson has no SETUP stage');
  assert(resolveFr1Shortcut('0', teachingWithSetup) === 'goto:setup', '"0" -> goto:setup only when SETUP exists');
  assert(resolveFr1Shortcut('6', teaching) === null, 'digits outside 1-5 map to nothing');
  assert(resolveFr1Shortcut('Escape', teaching) === null, 'Escape is never bound to an action (must not exit/discard state)');
  assert(resolveFr1Shortcut('3', mastery) === null, 'direct-stage digits do nothing for a mastery-check player (no fake stages)');
  assert(resolveFr1Shortcut('ArrowRight', mastery) === 'next', 'ArrowRight still means next for a mastery-check player');
  assert(resolveFr1Shortcut('ArrowRight', inactive) === null, 'no shortcut fires when Foundation Release 1 mode is inactive');

  // form-field focus safety
  const fakeInput = { matches: (sel) => sel.includes('input'), isContentEditable: false };
  const fakeSelect = { matches: (sel) => sel.includes('select'), isContentEditable: false };
  const fakeContentEditable = { matches: () => false, isContentEditable: true };
  const fakeDiv = { matches: () => false, isContentEditable: false };
  assert(isTypingTarget(fakeInput) === true, 'isTypingTarget: <input> focus suppresses shortcuts');
  assert(isTypingTarget(fakeSelect) === true, 'isTypingTarget: <select> focus suppresses shortcuts');
  assert(isTypingTarget(fakeContentEditable) === true, 'isTypingTarget: contenteditable focus suppresses shortcuts');
  assert(isTypingTarget(fakeDiv) === false, 'isTypingTarget: ordinary elements do not suppress shortcuts');
  assert(isTypingTarget(null) === false, 'isTypingTarget: no target (e.g. document body) does not suppress shortcuts');
}

/* =========================== REVEAL POLICY =========================== */
{
  const exp = adaptExperience(await getExperience('1.3.1', { catalog, readLesson }));
  const p = createTeachingPlayer(exp);
  p.goTo('check');
  p.revealAnswer();
  assert(p.isRevealed(), 'sanity: revealed at CHECK');
  p.next(); // at bounds, next() is a no-op (already at the last stage)
  assert(p.isRevealed(), 'next() at the final stage (a no-op move) does not clear an existing reveal');
  p.previous();
  assert(!p.isRevealed(), 'moving to a DIFFERENT stage (previous) hides a prior reveal');
  p.goTo('check');
  p.revealAnswer();
  p.goTo('check'); // goTo the SAME stage again
  assert(p.isRevealed(), 'goTo() the current stage again (not a real move) does not clear reveal');
  p.goTo('see');
  assert(!p.isRevealed(), 'goTo() a genuinely different stage clears reveal');
  p.revealAnswer();
  p.reset();
  assert(!p.isRevealed(), 'reset() always clears reveal');
}

/* =========================== REPRESENTATION WORKFLOW =========================== */
{
  // single representation: no selection needed, default is immediate
  const single = createTeachingPlayer(adaptExperience(await getExperience('1.1.1', { catalog, readLesson })));
  assert(single.experience.representations.length >= 1, 'sanity: 1.1.1 declares at least one representation');
  assert(single.activeRepresentation() !== null, 'a lesson with representations has an active one immediately, no selector interaction required');

  // multiple representations: deliberate switching preserves stage
  const multi = createTeachingPlayer(adaptExperience(await getExperience('1.3.1', { catalog, readLesson })));
  assert(multi.experience.representations.length > 1, 'sanity: 1.3.1 declares multiple representations');
  multi.next(); multi.next(); // move to some non-zero stage
  const stageBefore = multi.currentIndex();
  const otherType = multi.experience.representations.find((r) => r.type !== multi.activeRepresentation().type).type;
  multi.selectRepresentation(otherType);
  assert(multi.activeRepresentation().type === otherType, 'selectRepresentation switches the active representation');
  assert(multi.currentIndex() === stageBefore, 'switching representation does not change the current stage');

  let err = null;
  try { multi.selectRepresentation('not-a-real-representation-of-this-lesson'); } catch (e) { err = e; }
  assert(err instanceof UnknownStageError, 'selecting a representation the lesson does not declare fails clearly');

  // human-readable labels, never internal type strings, per docs/TEACHING_WORKFLOW.md
  assert(labelForRepresentation('ten-frame') === 'Ten Frame', 'labelForRepresentation gives a human label, not the raw type string');
  assert(labelForRepresentation('number-bond') === 'Number Bond', 'labelForRepresentation covers number-bond');
  assert(titleForUnit('1.3') === 'Make 10', 'titleForUnit gives the accepted Unit 1.3 title');
  assert(labelForStage('build') === 'Build', 'labelForStage capitalizes the stage word');
}

/* =========================== PRESENTER TOGGLE =========================== */
{
  const exp = adaptExperience(await getExperience('1.3.1', { catalog, readLesson }));
  const p = createTeachingPlayer(exp);
  p.next(); p.selectRepresentation(p.experience.representations[0].type); p.revealAnswer();
  const stageBefore = p.currentIndex();
  const revealBefore = p.isRevealed();
  const reprBefore = p.activeRepresentation().type;

  // Toggling presenter is presentation-layer only (wrapWithPresenter) —
  // it must never touch the player's own state.
  const onNode = wrapWithPresenter(renderExperience(p), { aspect: '16x9', showPresenter: true });
  const offNode = wrapWithPresenter(renderExperience(p), { aspect: '16x9', showPresenter: false });
  assert(p.currentIndex() === stageBefore && p.isRevealed() === revealBefore && p.activeRepresentation().type === reprBefore,
    'wrapping/unwrapping the presenter zone never mutates player (stage/reveal/representation) state');
  assert(onNode.find((n) => (n.className || '').includes('fr1-presenter')).length > 0, 'presenter ON renders a presenter zone');
  assert(offNode.find((n) => (n.className || '').includes('fr1-presenter')).length === 0, 'presenter OFF renders no presenter zone (no dead rectangle)');

  // 1:1 stays hidden even when explicitly requested
  const square = wrapWithPresenter(renderExperience(p), { aspect: '1x1', showPresenter: true });
  assert(square.find((n) => (n.className || '').includes('fr1-presenter')).length === 0, '1:1 keeps the presenter hidden even when showPresenter is requested true');

  // clean/production mode: reserves the space, draws no dev label
  const clean = wrapWithPresenter(renderExperience(p), { aspect: '16x9', showPresenter: true, clean: true });
  const cleanZone = clean.find((n) => (n.className || '').includes('fr1-presenter'))[0];
  assert(cleanZone && !clean.textAll().includes('SAFE ZONE'), 'clean mode reserves the presenter area but omits the "SAFE ZONE" dev label');
  const devZone = wrapWithPresenter(renderExperience(p), { aspect: '16x9', showPresenter: true, clean: false }).textAll();
  assert(devZone.includes('SAFE ZONE'), 'non-clean (preview/rehearsal) mode still shows the dev-facing safe-zone label');
}

/* =========================== MASTERY WORKFLOW =========================== */
{
  const exp = adaptExperience(await getExperience('MC-1.2', { catalog, readLesson }));
  const p = createPlayer(exp);
  assert(p.kind === 'mastery-check' && p.taskCount > 0, 'mastery player loads all tasks');
  assert(p.currentIndex() === 0, 'mastery player starts at task 0');
  p.next();
  assert(p.currentIndex() === 1, 'mastery next() advances one task');
  p.previous();
  assert(p.currentIndex() === 0, 'mastery previous() returns one task');
  for (let i = 0; i < p.taskCount + 3; i++) p.next(); // overshoot
  assert(p.currentIndex() === p.taskCount - 1, 'mastery next() never advances past the final task');
  p.reset();
  assert(p.currentIndex() === 0, 'mastery reset() returns to task 0');
}

/* =========================== REVIEW WORKFLOW =========================== */
{
  const exp = adaptExperience(await getExperience('R7', { catalog, readLesson }));
  const p = createPlayer(exp);
  assert(!p.isRevealed(), 'review starts with retrieves hidden');
  p.revealRetrieves();
  assert(p.isRevealed() && p.sessionStatus() === 'complete', 'revealing retrieves marks the review complete');
  p.reset();
  assert(!p.isRevealed() && p.sessionStatus() === 'teaching', 'reset hides retrieves again');
}

/* =========================== FAILURE HANDLING =========================== */
{
  const teachingExp = adaptExperience(await getExperience('1.3.1', { catalog, readLesson }));
  const p = createTeachingPlayer(teachingExp);
  let e1 = null;
  try { p.goTo('not-a-stage'); } catch (e) { e1 = e; }
  assert(e1 instanceof UnknownStageError, 'invalid direct-stage navigation fails clearly');

  const mcExp = adaptExperience(await getExperience('MC-1.2', { catalog, readLesson }));
  let e2 = null;
  try { createTeachingPlayer(mcExp); } catch (e) { e2 = e; }
  assert(e2 instanceof PlayerTypeError, 'a mastery-check experience cannot be driven as a teaching player');

  assert(resolveFr1Shortcut('ArrowRight', undefined) === null, 'resolveFr1Shortcut tolerates a missing status object rather than throwing');
}

/* ---------- report ---------- */
console.log(`Workflow tests: ${passed} assertions passed.`);
if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
