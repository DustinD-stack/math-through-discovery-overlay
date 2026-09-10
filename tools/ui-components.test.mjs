/* ============================================================
   UI component regression tests — structure + accessibility.
   No browser: a tiny DOM shim (same idea as smoke-test.mjs),
   then assertions on the nodes each component returns.

       node tools/ui-components.test.mjs

   Runs after tools/smoke-test.mjs in `npm test`.
   ============================================================ */

/* ---------- minimal DOM ---------- */
class Node {
  constructor(tag, ns) {
    this.tagName = tag; this.ns = ns; this.children = [];
    this.attrs = {}; this.style = {}; this.dataset = {}; this.text = '';
  }
  appendChild(c) { this.children.push(c); return c; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  addEventListener() {}
  set className(v) { this.attrs.class = v; }
  get className() { return this.attrs.class || ''; }
  set innerHTML(v) { this.attrs.html = v; }
  get innerHTML() { return this.attrs.html || ''; }
  get firstChild() { return this.children[0] || null; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); }
  get classList() {
    const self = this;
    return {
      add(...c) { self.attrs.class = ((self.attrs.class || '') + ' ' + c.join(' ')).trim(); },
      remove() {}, toggle() {}, contains(c) { return String(self.attrs.class || '').split(/\s+/).includes(c); },
    };
  }
  matches() { return false; }
  count() { return 1 + this.children.reduce((s, c) => s + (c.count ? c.count() : 1), 0); }
  textAll() { return (this.text || '') + this.children.map((c) => (c.textAll ? c.textAll() : c.text || '')).join(' '); }
  /* helpers for assertions */
  hasClass(c) { return String(this.className).split(/\s+/).includes(c); }
  findAll(pred, acc = []) {
    if (pred(this)) acc.push(this);
    for (const c of this.children) if (c.findAll) c.findAll(pred, acc);
    return acc;
  }
  byClass(c) { return this.findAll((n) => n.hasClass && n.hasClass(c)); }
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
  location: { search: '', href: 'http://localhost/preview.html' },
  addEventListener: () => {},
  innerWidth: 1920, innerHeight: 1080,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
};
globalThis.localStorage = globalThis.window.localStorage;

/* ---------- tiny assert harness ---------- */
let passed = 0;
const failures = [];
function check(cond, msg) { if (cond) passed++; else failures.push(msg); }
function group(name, fn) {
  try { fn(); } catch (err) { failures.push(`${name}: threw ${err && err.stack || err}`); }
}

/* ---------- imports under test ---------- */
const { TeachingRail } = await import('../src/components/teaching-rail.js');
const { STEPS, STEP_IDS, STEP_META, withLesson } = await import('../src/components/steps.js');

const SAMPLE = {
  see: { text: 'A total and a count.', equation: '144 \\text{ and } 4', annotation: 'money' },
  break: { text: 'Split into friendly parts.', equation: '144 = 120 + 24' },
  build: { text: 'Divide each part.', equation: '120/4 + 24/4' },
  transform: { text: 'Same value, easier form.', equation: '30 + 6' },
  check: { text: 'Multiply back.', equation: '36 \\times 4 = 144' },
};

/* ============================================================
   steps.js — the canonical model
   ============================================================ */
group('steps model', () => {
  check(STEP_IDS.join(',') === 'see,break,build,transform,check', 'STEP_IDS order');
  check(STEPS.length === 5, 'five steps');
  check(STEPS.every((s, i) => s.number === i + 1), 'numbers are 1..5');
  check(STEPS.every((s) => s.label && s.prompt && s.description), 'every step has label + prompt + description');
  check(STEPS.every((s) => s.cls === `step-${s.id}` && s.stageClass === `stage-${s.id}`), 'legacy + stage classes');
  // legacy STEP_META shape unchanged (control-app.js depends on it)
  check(STEP_META.see.label === 'See' && STEP_META.see.n === 1 && STEP_META.see.cls === 'step-see', 'STEP_META legacy shape');
  check(STEP_META.check.n === 5 && STEP_META.transform.cls === 'step-transform', 'STEP_META values');
});

/* ============================================================
   TeachingRail — variant: rail
   ============================================================ */
group('rail: state partition + progression', () => {
  for (let current = 0; current <= 6; current++) {
    const n = TeachingRail({ variant: 'rail', current });
    const nodes = n.byClass('trail__node');
    check(nodes.length === 5, `rail current=${current}: 5 nodes (got ${nodes.length})`);

    const complete = nodes.filter((x) => x.hasClass('is-complete'));
    const active = nodes.filter((x) => x.hasClass('is-active'));
    const inactive = nodes.filter((x) => x.hasClass('is-inactive'));
    check(complete.length + active.length + inactive.length === 5,
      `rail current=${current}: states partition cleanly`);
    check(complete.length === Math.max(0, Math.min(5, current - 1)),
      `rail current=${current}: ${complete.length} complete`);
    check(active.length === (current >= 1 && current <= 5 ? 1 : 0),
      `rail current=${current}: ${active.length} active`);

    // aria-current only on the active node
    const ariaCurrent = nodes.filter((x) => x.getAttribute('aria-current') === 'step');
    check(ariaCurrent.length === (current >= 1 && current <= 5 ? 1 : 0),
      `rail current=${current}: exactly the active node carries aria-current`);
    if (ariaCurrent.length) check(ariaCurrent[0].hasClass('is-active'),
      `rail current=${current}: aria-current is on the active node`);

    // marker glyph: check when complete, digit otherwise — a non-colour state cue
    for (const nd of nodes) {
      const marker = nd.byClass('trail__marker')[0];
      const t = marker.textAll().trim();
      if (nd.hasClass('is-complete')) check(t === '✓', `rail current=${current}: complete marker shows check`);
      else check(/^[1-5]$/.test(t), `rail current=${current}: non-complete marker shows its number`);
    }
  }
});

group('rail: list semantics + labels', () => {
  const n = TeachingRail({ variant: 'rail', current: 3 });
  check(n.tagName === 'ol' && n.getAttribute('role') === 'list', 'rail root is a list');
  const nodes = n.byClass('trail__node');
  check(nodes.every((x) => x.getAttribute('role') === 'listitem'), 'nodes are listitems');
  check(nodes.every((x) => /^Step [1-5] of 5, \w+, (complete|in progress|not started)/.test(x.getAttribute('aria-label') || '')),
    'every node has a descriptive aria-label');
  // prompt text is carried in the label so screen readers get the reasoning
  check(nodes.some((x) => /notice/i.test(x.getAttribute('aria-label') || '')), 'prompts reach the aria-label');
  // decorative spans are hidden from AT
  check(n.byClass('trail__marker').every((x) => x.getAttribute('aria-hidden') === 'true'), 'markers aria-hidden');
});

group('rail: showText + orientation', () => {
  check(TeachingRail({ variant: 'rail', current: 2, showText: false }).byClass('trail__prompt').length === 0,
    'showText:false hides prompts');
  check(TeachingRail({ variant: 'rail', current: 2, showText: true }).byClass('trail__prompt').length === 5,
    'showText:true shows five prompts');
  check(TeachingRail({ variant: 'rail', current: 1, orientation: 'vertical' }).hasClass('trail--vertical'),
    'orientation:vertical applies modifier');
  check(TeachingRail({ variant: 'rail', current: 1 }).hasClass('trail--horizontal'),
    'default orientation horizontal');
  check(TeachingRail({ current: 1 }).hasClass('trail--rail'), 'default variant is rail');
});

/* ============================================================
   TeachingRail — legacy variants keep their contract
   ============================================================ */
group('rows: legacy DiscoveryStepper markup', () => {
  for (const current of [0, 3, 5]) {
    const n = TeachingRail({ variant: 'rows', current, steps: withLesson(SAMPLE) });
    check(n.hasClass('stepper') && n.hasClass('panel') && n.hasClass('panel--flush'),
      `rows current=${current}: legacy container classes`);
    const steps = n.byClass('step').filter((x) => x.hasClass('step__num') === false && x.hasClass('step'));
    check(steps.length === 5, `rows current=${current}: 5 .step rows`);
    check(steps.filter((x) => x.hasClass('step--pending')).length === Math.max(0, 5 - current),
      `rows current=${current}: pending count`);
    check(steps.filter((x) => x.hasClass('step--active')).length === (current >= 1 && current <= 5 ? 1 : 0),
      `rows current=${current}: one active row`);
    check(steps.every((x) => x.byClass('step__num').length === 1 && x.byClass('step__label').length === 1),
      `rows current=${current}: each row has a number + label`);
    check(steps.filter((x) => x.getAttribute('aria-current') === 'step').length === (current >= 1 && current <= 5 ? 1 : 0),
      `rows current=${current}: aria-current on the active row`);
  }
  check(TeachingRail({ variant: 'rows', current: 3, compact: true, steps: withLesson(SAMPLE) }).hasClass('stepper--compact'),
    'rows compact modifier');
});

group('cards: legacy MethodCards markup', () => {
  const n = TeachingRail({ variant: 'cards', current: 3, steps: withLesson(SAMPLE) });
  check(n.hasClass('method-cards'), 'cards container class');
  const cards = n.byClass('method-card');
  check(cards.length === 5, 'five method cards');
  check(cards.filter((x) => x.hasClass('is-active')).length === 1, 'one card flagged active (non-colour cue)');
  check(cards.filter((x) => x.hasClass('step--pending')).length === 2, 'two cards pending');
  check(cards.every((x) => x.byClass('method-card__label').length === 1), 'each card has a label');
});

group('headline: legacy StepHeadline markup', () => {
  for (const [current, want] of [[0, 'See'], [1, 'See'], [2, 'Break'], [4, 'Transform'], [5, 'Check']]) {
    const n = TeachingRail({ variant: 'headline', current, steps: withLesson(SAMPLE) });
    check(n.byClass('step__label')[0].textAll().includes(want),
      `headline current=${current}: shows "${want}"`);
    check(n.hasClass(`step-${want.toLowerCase()}`) && n.hasClass(`stage-${want.toLowerCase()}`),
      `headline current=${current}: carries colour classes`);
  }
});

/* ---------- report ---------- */
if (failures.length) {
  console.error(`\nUI component tests: ${failures.length} FAILURE(S)`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`UI component tests: ${passed} assertions passed.`);
