/* ============================================================
   Smoke test — no browser required.
   Builds a tiny DOM shim, renders every lesson in every preset
   and aspect ratio, and fails on any thrown error, empty stage
   or unknown diagram type.
       node tools/smoke-test.mjs
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------- minimal DOM ---------- */
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
  get classList() {
    const self = this;
    return { add() {}, remove() {}, toggle() {}, contains() { return false; } };
  }
  matches() { return false; }
  count() { return 1 + this.children.reduce((s, c) => s + (c.count ? c.count() : 1), 0); }
  textAll() { return (this.text || '') + this.children.map((c) => (c.textAll ? c.textAll() : c.text || '')).join(' '); }
}
const doc = {
  createElement: (t) => new Node(t),
  createElementNS: (ns, t) => new Node(t, ns),
  createTextNode: (t) => { const n = new Node('#text'); n.text = String(t); return n; },
  getElementById: () => null,
  head: new Node('head'),
  body: new Node('body'),
};
globalThis.document = doc;
globalThis.window = {
  location: { search: '', href: 'http://localhost:3000/overlay.html' },
  addEventListener: () => {},
  innerWidth: 1920, innerHeight: 1080,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
};
globalThis.localStorage = globalThis.window.localStorage;

/* ---------- load lessons the way the browser does ---------- */
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'lessons/lessons.bundle.js'), 'utf8'), sandbox);
globalThis.window.MTD_LESSONS = sandbox.window.MTD_LESSONS;

const { normalize } = await import('../src/utils/lesson-loader.js');
const { buildStageContent, PRESET_KEYS } = await import('../src/layouts/presets.js');
const { DEFAULT_STATE } = await import('../src/app/state.js');
const { DIAGRAM_NAMES } = await import('../src/modules/diagrams.js');

const ASPECTS = ['16x9', '9x16', '1x1'];
let checks = 0, failures = [];

for (const [id, raw] of Object.entries(globalThis.window.MTD_LESSONS)) {
  const lesson = normalize(raw, id);
  for (const preset of PRESET_KEYS) {
    for (const aspect of ASPECTS) {
      for (const step of [0, 3, 5]) {
        checks++;
        const state = { ...structuredClone(DEFAULT_STATE), preset, aspect, step, lessonId: id };
        try {
          const node = buildStageContent(state, lesson);
          const n = node.count();
          if (n < 12) failures.push(`${id}/${preset}/${aspect}/step${step}: stage only has ${n} nodes`);
          const txt = node.textAll();
          if (txt.includes('Unknown diagram type')) failures.push(`${id}: ${txt.match(/Unknown diagram type[^"]*/)[0]}`);
        } catch (err) {
          failures.push(`${id}/${preset}/${aspect}/step${step}: ${err.message}`);
        }
      }
    }
  }
  const type = raw.diagram && raw.diagram.type;
  if (type && !DIAGRAM_NAMES.includes(type)) failures.push(`${id}: diagram type "${type}" is not registered`);
}

console.log(`Rendered ${checks} lesson/preset/aspect/step combinations.`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const f of failures.slice(0, 25)) console.error('  - ' + f);
  process.exit(1);
}
console.log('All combinations rendered cleanly.');
