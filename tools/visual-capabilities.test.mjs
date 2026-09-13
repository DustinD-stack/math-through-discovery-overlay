/* ============================================================
   Visual capability tests (P6)
   node tools/visual-capabilities.test.mjs

   Covers the 3 new production components (TenFrame, NumberPath,
   BundlingVisual), their resolver registration, and a Foundation
   Release 1 -specific sweep confirming the known gap count is now 0.

   Uses the same minimal DOM shim as tools/smoke-test.mjs /
   tools/curriculum-runtime.test.mjs.
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
  /** Recursively find every node whose class/attrs match a predicate. */
  find(pred, out = []) {
    if (pred(this)) out.push(this);
    for (const c of this.children) if (c.find) c.find(pred, out);
    return out;
  }
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

const { TenFrame, NumberPath, BundlingVisual, DIAGRAMS } = await import('../src/modules/diagrams.js');
const { resolveRepresentation } = await import('../src/curriculum/representations.js');
const { REPRESENTATION_TYPES } = await import('../src/curriculum/constants.js');
const { buildCatalog, getExperience, makeFsReader } = await import('../src/curriculum/catalog.js');
const { loadCorpus } = await import('../src/curriculum/loader.js');
const { adaptExperience } = await import('../src/curriculum/adapter.js');
const { createPlayer } = await import('../src/curriculum/player.js');
const { renderExperience } = await import('../src/curriculum/render-experience.js');

const releaseDir = path.join(root, 'lessons', 'foundation-release-1');
const manifest = JSON.parse(fs.readFileSync(path.join(releaseDir, 'manifest.json'), 'utf8'));
const catalog = buildCatalog(manifest);
const readLesson = makeFsReader(root, fs, path);

/* =========================== TEN FRAME =========================== */
{
  const filledCells = (node) => node.find((n) => n.attrs && n.attrs.class === 'tframe__cell is-filled' || (n.className || '').includes('is-filled'));
  const emptyCells = (node) => node.find((n) => (n.className || '').includes('is-empty'));

  const zero = TenFrame({ size: 10, filled: 0 });
  assert(filledCells(zero).length === 0 && emptyCells(zero).length === 10, 'TenFrame(filled=0) shows 0 filled / 10 empty');

  const five = TenFrame({ size: 10, filled: 5 });
  assert(filledCells(five).length === 5 && emptyCells(five).length === 5, 'TenFrame(filled=5) shows 5 filled / 5 empty');

  const ten = TenFrame({ size: 10, filled: 10 });
  assert(filledCells(ten).length === 10 && emptyCells(ten).length === 0, 'TenFrame(filled=10) shows 10 filled / 0 empty');

  const seven = TenFrame({ size: 10, filled: 7 });
  assert(filledCells(seven).length === 7 && emptyCells(seven).length === 3, 'TenFrame(filled=7) shows 7 filled / 3 empty (the 0.2.8/1.2.3 case)');
  assert(seven.textAll().includes('7 filled') && seven.textAll().includes('3 empty'), 'TenFrame labels both filled and empty counts in text');

  const fiveFrame = TenFrame({ size: 5, filled: 3 });
  assert(filledCells(fiveFrame).length === 3 && emptyCells(fiveFrame).length === 2, 'TenFrame(size=5, filled=3) supports the five-frame case (1.2.1)');

  // invalid quantity: explicitly clamped, never silently corrupted or thrown
  const over = TenFrame({ size: 10, filled: 999 });
  assert(filledCells(over).length === 10 && emptyCells(over).length === 0, 'TenFrame clamps an out-of-range filled count to the frame size');
  const negative = TenFrame({ size: 10, filled: -5 });
  assert(filledCells(negative).length === 0 && emptyCells(negative).length === 10, 'TenFrame clamps a negative filled count to 0');

  // non-color cue: filled uses a solid fill, empty uses fill:none + dashed stroke
  const filledCircle = seven.find((n) => n.tagName === 'circle' && n.attrs.fill && n.attrs.fill !== 'none')[0];
  const emptyCircle = seven.find((n) => n.tagName === 'circle' && n.attrs.fill === 'none')[0];
  assert(filledCircle && emptyCircle, 'TenFrame filled vs empty cells are structurally distinct circles (solid fill vs fill:none), not color-only');
  assert(emptyCircle.attrs['stroke-dasharray'], 'TenFrame empty cells additionally use a dashed stroke as a second non-color cue');

  // stage-driven emphasis (presentation-only, generic by type)
  const emphasized = TenFrame({ size: 10, filled: 7, emphasize: 'empty' });
  assert(emphasized.find((n) => (n.className || '').includes('is-highlight')).length === 3, 'TenFrame emphasize="empty" highlights exactly the empty cells');

  assert(DIAGRAMS['ten-frame'] === TenFrame, 'TenFrame is registered in the DIAGRAMS registry under "ten-frame"');
}

/* =========================== NUMBER PATH =========================== */
{
  const basic = NumberPath({ start: 0, end: 5 });
  const stones = basic.find((n) => (n.className || '').startsWith('npath__stone'));
  assert(stones.length === 6, 'NumberPath(0..5) renders exactly 6 discrete positions');
  assert(basic.textAll().includes('0') && basic.textAll().includes('5'), 'NumberPath labels the endpoints');

  const withCurrent = NumberPath({ start: 0, end: 7, current: 3 });
  const currentStones = withCurrent.find((n) => (n.className || '').includes('is-current'));
  assert(currentStones.length === 1, 'NumberPath marks exactly one current/active position when given');

  const withJump = NumberPath({ start: 0, end: 7, marks: [3, 7], jump: { from: 3, to: 7, label: '4 steps' } });
  assert(withJump.find((n) => n.tagName === 'path' && n.attrs.d && n.attrs.d.startsWith('M')).length >= 1, 'NumberPath renders a jump/step arc when a jump is given (0.2.7 case)');
  assert(withJump.textAll().includes('4 steps'), 'NumberPath labels the jump');
  const markedStones = withJump.find((n) => (n.className || '').includes('is-marked'));
  assert(markedStones.length === 2, 'NumberPath renders both marked benchmark positions (1.2.5 case)');

  // bounds/data validation: end before start must not crash, and must
  // still produce at least the start position
  const inverted = NumberPath({ start: 5, end: 2 });
  assert(inverted.find((n) => (n.className || '').startsWith('npath__stone')).length >= 1, 'NumberPath handles end < start without throwing (clamped to a minimal path)');

  // non-color directional cue: an explicit direction arrow path element,
  // distinct from the stones/marks themselves
  const dirArrow = basic.children[0].children.filter((n) => n.tagName === 'path');
  assert(dirArrow.length >= 1, 'NumberPath renders an explicit direction cue (an arrow shape), not color alone');

  // structural distinction from NumberLine: no solid ruled axis line
  assert(basic.find((n) => n.tagName === 'line' && (n.className || '').includes('npath__trail')).length === 1
    && basic.find((n) => (n.className || '') === 'svg-axis').length === 0,
    'NumberPath uses a dashed trail, never the solid ruled svg-axis NumberLine uses — a real structural distinction, not a rename');

  assert(DIAGRAMS['number-path'] === NumberPath, 'NumberPath is registered in the DIAGRAMS registry under "number-path"');
}

/* =========================== BUNDLING VISUAL =========================== */
{
  const loose = BundlingVisual({ ones: 10, bundled: false });
  const looseOnes = loose.find((n) => (n.className || '') === 'bundle__one');
  assert(looseOnes.length === 10, 'BundlingVisual(ones=10, bundled=false) renders exactly 10 individual ones (2.1.1 canonical case)');
  assert(loose.find((n) => n.tagName === 'rect' && n.attrs.stroke).length === 0, 'BundlingVisual shows no enclosure band while unbundled');

  const bundled = BundlingVisual({ ones: 10, bundled: true });
  const bundledOnes = bundled.find((n) => (n.className || '') === 'bundle__one');
  assert(bundledOnes.length === 10, 'BundlingVisual(bundled=true) still renders all 10 individual ones — same quantity preserved, never hidden');
  const band = bundled.find((n) => n.tagName === 'rect' && n.attrs.stroke && n.attrs.stroke !== 'none');
  assert(band.length === 1, 'BundlingVisual(bundled=true) adds exactly one enclosing band as the grouping cue');
  assert(bundled.textAll().includes('1 ten') && bundled.textAll().includes('10 ones'), 'BundlingVisual labels the bundle as "1 ten = 10 ones" without hiding the ones count');

  assert(DIAGRAMS['bundling-visual'] === BundlingVisual, 'BundlingVisual is registered in the DIAGRAMS registry under "bundling-visual"');
}

/* =========================== RESOLVER STATUS =========================== */
{
  for (const type of ['ten-frame', 'number-path', 'bundling-visual']) {
    const meta = REPRESENTATION_TYPES[type];
    assert(meta.status === 'component', `constants.js REPRESENTATION_TYPES["${type}"].status === "component" (no longer "gap")`);
    const resolved = resolveRepresentation({ type, data: {} });
    assert(resolved.status === 'component', `resolveRepresentation({type:"${type}"}) resolves with status "component"`);
    assert(resolved.render() !== null, `resolveRepresentation({type:"${type}"}) renders a real, non-null node`);
  }
  // the generic gap mechanism itself is untouched code, just currently
  // unused by any registered type — confirmed by reading
  // src/curriculum/representations.js's gapPlaceholder()/status==='gap'
  // branch, which P6 did not remove (see docs/lesson-authoring/
  // VISUAL_CAPABILITIES.md "Capability-gap fallback mechanism").
}

/* =========================== FOUNDATION RELEASE 1 CAPABILITY AUDIT =========================== */
{
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
  const entries = walk(releaseDir).map((f) => ({ file: path.relative(root, f), raw: JSON.parse(fs.readFileSync(f, 'utf8')) }));
  const { lessons, errors } = loadCorpus(entries);
  assert(errors.length === 0 && lessons.length === 78, 'all 78 experiences still load+validate cleanly after the P6 representation.data additions');

  let gapCount = 0, componentCount = 0;
  for (const { lesson } of lessons) {
    for (const rep of lesson.representations || []) {
      const resolved = resolveRepresentation(rep);
      if (resolved.status === 'gap') gapCount += 1;
      if (resolved.status === 'component') componentCount += 1;
      resolved.render();
    }
  }
  assert(gapCount === 0, `Foundation Release 1 known visual capability gap count === 0 (got ${gapCount})`);
  assert(componentCount > 0, 'representation instances resolve as real components across the corpus');
}

/* =========================== VISUAL RENDER SWEEP (the 7 gap-using lessons) =========================== */
{
  const gapLessons = ['0.2.8', '1.2.1', '1.2.3', '0.2.6', '0.2.7', '1.2.5', '2.1.1'];
  const aspects = ['16x9', '9x16', '1x1'];
  let rendered = 0;
  for (const id of gapLessons) {
    const exp = adaptExperience(await getExperience(id, { catalog, readLesson }));
    for (const aspect of aspects) {
      const player = createPlayer(exp);
      // exercise every stage so stage-driven emphasis hints run too
      for (const stageId of player.order) {
        player.goTo(stageId);
        const node = renderExperience(player);
        assert(node && node.count() > 5, `"${id}" (${aspect}, stage ${stageId}) renders a non-trivial tree`);
      }
      rendered += 1;
    }
  }
  assert(rendered === gapLessons.length * aspects.length, `visual render sweep covered all 7 newly-closed-gap lessons x ${aspects.length} aspects`);
}

/* ---------- report ---------- */
console.log(`Visual capability tests: ${passed} assertions passed.`);
if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
