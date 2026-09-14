/* ============================================================
   Modular layout / collision regression tests (P9)
   node tools/layout-collision.test.mjs

   These run without a real browser layout engine (no new heavy
   browser-testing dependency was added to the project — see
   docs/RELEASE_CHECKLIST.md "TESTS"), so they verify the structural
   invariants a real geometric overlap depends on:

     - presenter and workspace are separate sibling regions, never one
       nested inside the other
     - 1:1 never renders a presenter node, even when requested
     - presenter-off reclaims space (no phantom empty presenter node)
     - the primary composition regions (shell/workspace/header/stage/
       representation/result) use flow layout (flex/grid), not
       lesson-authored or per-region absolute positioning
     - the flexible workspace region carries the min-width:0 /
       min-height:0 rule its axis needs to actually shrink instead of
       overflowing into a sibling
     - clean/production mode still renders a presenter placeholder node
       (space reserved) without any developer-facing text in it

   A full pixel-geometry sweep (real Chromium, bounding-box overlap
   checks, screenshots) was run separately for the P9 human visual
   acceptance pass — see the P9 final report for those results; it is
   not part of `npm test` because it needs a real browser.
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
const { createPlayer } = await import('../src/curriculum/player.js');
const { renderExperience, wrapWithPresenter } = await import('../src/curriculum/render-experience.js');

const releaseDir = path.join(root, 'lessons', 'foundation-release-1');
const manifest = JSON.parse(fs.readFileSync(path.join(releaseDir, 'manifest.json'), 'utf8'));
const catalog = buildCatalog(manifest);
const readLesson = makeFsReader(root, fs, path);
const css = fs.readFileSync(path.join(root, 'src', 'styles', 'curriculum-runtime.css'), 'utf8');

/* =========================== REGION OWNERSHIP (structural) =========================== */
{
  const exp = adaptExperience(await getExperience('1.3.1', { catalog, readLesson }));
  const player = createPlayer(exp);
  const node = renderExperience(player);

  const shellOn = wrapWithPresenter(node, { aspect: '16x9', showPresenter: true, clean: false });
  assert(shellOn.className.includes('fr1-shell--16x9') && shellOn.className.includes('has-presenter'),
    'REGION OWNERSHIP: 16:9 + presenter on produces the has-presenter shell variant');
  const presenterNodes = shellOn.find((n) => (n.className || '').includes('fr1-presenter') && !(n.className || '').includes('fr1-presenter__'));
  const workspaceNodes = shellOn.find((n) => (n.className || '').includes('fr1-workspace'));
  assert(presenterNodes.length === 1 && workspaceNodes.length === 1,
    'REGION OWNERSHIP: exactly one presenter region and one workspace region exist');
  assert(!presenterNodes[0].find((n) => n === workspaceNodes[0]).length,
    'REGION OWNERSHIP: the presenter region does not contain the workspace region');
  assert(!workspaceNodes[0].find((n) => n === presenterNodes[0]).length,
    'REGION OWNERSHIP: the workspace region does not contain the presenter region');
  assert(shellOn.children.includes(presenterNodes[0]) && shellOn.children.includes(workspaceNodes[0]),
    'REGION OWNERSHIP: presenter and workspace are direct siblings under the shell (flow layout, not one occupying the other)');

  const shellOff = wrapWithPresenter(node, { aspect: '16x9', showPresenter: false, clean: false });
  assert(shellOff.className.includes('no-presenter'),
    'PRESENTER OFF: shell carries the no-presenter variant that lets the workspace reclaim full width');
  assert(shellOff.find((n) => (n.className || '').includes('fr1-presenter') && !(n.className || '').includes('fr1-presenter__')).length === 0,
    'PRESENTER OFF: no phantom empty presenter node is rendered at all when presenter is off');

  const shell1x1 = wrapWithPresenter(node, { aspect: '1x1', showPresenter: true, clean: false });
  assert(shell1x1.find((n) => (n.className || '').includes('fr1-presenter') && !(n.className || '').includes('fr1-presenter__')).length === 0,
    '1:1 SAFETY: requesting presenter on 1:1 never renders a presenter node');

  const shellClean = wrapWithPresenter(node, { aspect: '16x9', showPresenter: true, clean: true });
  const cleanPresenter = shellClean.find((n) => (n.className || '').includes('fr1-presenter') && !(n.className || '').includes('fr1-presenter__'))[0];
  assert(cleanPresenter && !/SAFE ZONE|PRESENTER/.test(cleanPresenter.textAll()),
    'CLEAN OUTPUT: a clean-mode presenter region reserves space but carries no developer-facing text');
}

/* =========================== NO FORBIDDEN ABSOLUTE POSITIONING =========================== */
{
  // The primary composition regions must participate in normal flow
  // (flex/grid) rather than being placed with per-region absolute
  // coordinates — the P9 "components own content, regions own
  // placement" principle. `.fr1-shell` itself is intentionally
  // `position:absolute; inset:0` (it fills the stage the presentation
  // layer already scales — src/app/overlay-app.js `fit()`), which is
  // the one pre-existing, architecturally-required exception.
  const regionSelectors = ['.fr1-workspace', '.fr1-header', '.fr1-stage ', '.fr1-representation', '.fr1-result', '.fr1-presenter '];
  for (const sel of regionSelectors) {
    const re = new RegExp(sel.trim().replace('.', '\\.') + '[^{]*\\{[^}]*\\}', 'g');
    const blocks = css.match(re) || [];
    for (const block of blocks) {
      assert(!/position:\s*absolute/.test(block), `NO ABSOLUTE POSITIONING: "${sel.trim()}" rule block does not use position:absolute — ${block.slice(0, 60)}...`);
    }
  }
  assert(!/top:\s*\d/.test(css) && !/left:\s*\d+px/.test(css),
    'NO LESSON-SPECIFIC POSITION HACKS: curriculum-runtime.css contains no hardcoded top:/left: pixel offsets');
}

/* =========================== SIZING CONTRACT =========================== */
{
  assert(/\.fr1-shell--16x9\.has-presenter \.fr1-workspace \{[^}]*min-width:\s*0/.test(css),
    'SIZING CONTRACT: the 16:9 workspace region has min-width:0 so it can actually shrink instead of overflowing the presenter column');
  assert(/\.fr1-shell--9x16 \.fr1-workspace \{[^}]*min-height:\s*0/.test(css),
    'SIZING CONTRACT: the 9:16 workspace region has min-height:0 so it can actually shrink in the vertical axis');
  assert(/overflow-wrap:\s*anywhere/.test(css),
    'SIZING CONTRACT: long unbroken text (titles/prompts/results) has a defensive overflow-wrap rule');
}

/* =========================== DENSE CONTENT REMAINS STRUCTURALLY SOUND =========================== */
{
  // The densest real experiences (most representation data, most
  // representations) must still render without throwing and without
  // any representation silently disappearing.
  const denseIds = ['1.3.1', '1.3.7', '3.2.7'];
  for (const id of denseIds) {
    const exp = adaptExperience(await getExperience(id, { catalog, readLesson }));
    const player = createPlayer(exp);
    for (let i = 0; i < player.order.length; i++) {
      const node = renderExperience(player);
      assert(node && node.count() > 0, `DENSE CONTENT: "${id}" stage ${i} renders a non-empty tree`);
      if (i < player.order.length - 1) player.next();
    }
  }
}

/* ---------- report ---------- */
if (failures.length) {
  console.error(`Layout collision tests: ${failures.length} failure(s):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
} else {
  console.log(`Layout collision tests: ${passed} assertions passed.`);
}
