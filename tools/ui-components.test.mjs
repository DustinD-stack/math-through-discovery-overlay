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
const { EquationWorkspace } = await import('../src/components/equation-workspace.js');
const { AnswerReveal } = await import('../src/components/answer-reveal.js');
const { PromptCard } = await import('../src/components/prompt-card.js');
const { EquationCard, PaperNote } = await import('../src/components/discovery.js');
const { ProblemCard } = await import('../src/components/core.js');
const { TransformationChain } = await import('../src/components/transformation-chain.js');
const { NumberJobs, JOB_IDS } = await import('../src/components/number-jobs.js');
const { DIAGRAMS, DIAGRAM_NAMES, NumberBond, FractionBar, NumberLine } = await import('../src/modules/diagrams.js');
const { PlaceValueBreakdown, decompose } = await import('../src/components/place-value-breakdown.js');
const { buildStageContent } = await import('../src/layouts/presets.js');
const { DEFAULT_STATE } = await import('../src/app/state.js');
const { normalize } = await import('../src/utils/lesson-loader.js');

/* deep text of an SVG/DOM subtree, including #text nodes */
const allText = (n) => (n.text || '') + (n.children || []).map(allText).join(' ');
/* every descendant with a given tagName */
const byTag = (n, tag, acc = []) => {
  if (n.tagName === tag) acc.push(n);
  (n.children || []).forEach((c) => byTag(c, tag, acc));
  return acc;
};

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

/* ============================================================
   EquationWorkspace  (Phase 3)
   ============================================================ */
const EQ = [
  { expr: '\\frac{3}{8} \\text{ of } 20', kind: 'given' },
  { expr: '20 \\div 8 = 2.5', kind: 'work' },
  { expr: '2.5 \\times 3 = 7.5', kind: 'work' },
  { expr: '\\frac{3}{8} \\text{ of } 20 = 7.5', kind: 'result' },
];

group('EquationWorkspace flow: reveal without dropping lines', () => {
  for (const current of [0, 1, 2, 3, 4, undefined]) {
    const n = EquationWorkspace({ variant: 'flow', lines: EQ, current });
    const lines = n.byClass('eqw__line');
    check(lines.length === EQ.length,
      `eqw current=${current}: all ${EQ.length} lines always rendered (no layout jump) — got ${lines.length}`);
    const revealed = current == null ? EQ.length : Math.max(0, Math.min(EQ.length, current));
    const expectInactive = EQ.length - revealed;
    const expectActive = (current != null && current >= 1 && current < EQ.length) ? 1 : 0;
    check(lines.filter((x) => x.hasClass('is-inactive')).length === expectInactive,
      `eqw current=${current}: ${expectInactive} inactive`);
    check(lines.filter((x) => x.hasClass('is-active')).length === expectActive,
      `eqw current=${current}: ${expectActive} active`);
    check(lines.filter((x) => x.getAttribute('aria-current') === 'step').length === expectActive,
      `eqw current=${current}: aria-current tracks active`);
    check(lines.filter((x) => x.getAttribute('aria-hidden') === 'true').length === expectInactive,
      `eqw current=${current}: inactive lines are aria-hidden`);
  }
});

group('EquationWorkspace flow: GIVEN / WORK / RESULT distinction', () => {
  const n = EquationWorkspace({ variant: 'flow', lines: EQ });
  check(n.getAttribute('role') === 'group', 'flow root is a group');
  check(n.byClass('eqw__lines')[0].getAttribute('role') === 'list', 'lines are a list');
  check(n.byClass('eqw__line--given').length === 1, 'one given line');
  check(n.byClass('eqw__line--work').length === 2, 'two work lines');
  check(n.byClass('eqw__line--result').length === 1, 'one result line');
  // a kind tag on the first line of each run
  const tags = n.byClass('eqw__tag').map((t) => t.textAll().trim());
  check(tags.join('|') === 'Given|Working|Result', `kind tags in order (got ${tags.join('|')})`);
  check(n.byClass('eqw__line--result')[0].hasClass('anim-pop'), 'result line pops in');
});

group('EquationWorkspace card variant = legacy shape', () => {
  const c = EquationWorkspace({ variant: 'card', lines: [{ expr: '1200 / 160' }] });
  check(c.hasClass('equation-card') && c.hasClass('eq-reveal'), 'legacy .equation-card .eq-reveal');
  check(c.byClass('equation-card__eq').length === 1, 'has .equation-card__eq');
  check(!c.hasClass('equation-card--lg'), 'md size: no --lg');
  check(EquationWorkspace({ variant: 'card', lines: [{ expr: 'x' }], size: 'lg' }).hasClass('equation-card--lg'),
    'lg size adds --lg');
  check(EquationWorkspace({ variant: 'card', lines: [{ expr: '' }] }) === null, 'empty card returns null');
});

/* ============================================================
   AnswerReveal  (Phase 3)
   ============================================================ */
group('AnswerReveal paper skin: hidden vs revealed, same footprint', () => {
  const hidden = AnswerReveal({ work: '1200 / 160', value: '= 7.50', unit: 'per hour', revealed: false, skin: 'paper' });
  const shown = AnswerReveal({ work: '1200 / 160', value: '= 7.50', unit: 'per hour', revealed: true, skin: 'paper' });
  check(hidden.hasClass('paper-note') && shown.hasClass('paper-note'), 'legacy .paper-note class both states');
  check(hidden.byClass('paper-note__answer').length === 1 && shown.byClass('paper-note__answer').length === 1,
    'answer slot present in both states (no reflow on reveal)');
  check(hidden.textAll().includes('= ?'), 'hidden shows the placeholder');
  check(hidden.byClass('answer-ring-wrap').length === 0, 'no ring while hidden');
  check(shown.byClass('answer-ring-wrap').length === 1, 'ring drawn when revealed');
  check(hidden.getAttribute('aria-live') === 'polite', 'aria-live for the reveal');
  check(/hidden/i.test(hidden.getAttribute('aria-label')) && /Answer:/.test(shown.getAttribute('aria-label')),
    'aria-label reflects state');
});

group('AnswerReveal panel + inline skins', () => {
  const p = AnswerReveal({ work: 'x', value: '7.5', unit: 'each', revealed: true, skin: 'panel', lead: 'So' });
  check(p.hasClass('areveal--panel') && p.hasClass('is-revealed'), 'panel revealed classes');
  check(p.byClass('areveal__flow').length === 1, 'panel has the connector into the conclusion');
  check(p.byClass('areveal__lead')[0].textAll().toLowerCase().includes('so'), 'panel lead word');
  const ph = AnswerReveal({ value: '7.5', revealed: false, skin: 'panel' });
  check(ph.hasClass('is-hidden') && ph.byClass('areveal__q').length === 1, 'panel hidden placeholder');
  const inl = AnswerReveal({ work: 'x', value: '7.5', revealed: true, skin: 'inline' });
  check(inl.hasClass('areveal--inline') && inl.hasClass('is-revealed'), 'inline classes');
});

/* ============================================================
   PromptCard  (Phase 3)
   ============================================================ */
group('PromptCard: four kinds + hint reveal', () => {
  for (const [kind, label] of [['question', 'Question'], ['predict', 'Predict'], ['try', 'Try it'], ['notice', 'What do you notice?']]) {
    const n = PromptCard({ kind, text: 'the prompt' });
    check(n.hasClass(`prompt--${kind}`) && n.hasClass('panel'), `${kind}: classes`);
    check(n.byClass('prompt__eyebrow')[0].textAll().trim() === label, `${kind}: eyebrow "${label}"`);
    check(n.getAttribute('role') === 'group' && n.getAttribute('aria-label') === label, `${kind}: group + aria-label`);
  }
  const noHint = PromptCard({ kind: 'notice', text: 't', hint: 'the hint', revealHint: false });
  check(noHint.byClass('prompt__hint')[0].getAttribute('hidden') === '', 'hint hidden by default');
  const withHint = PromptCard({ kind: 'notice', text: 't', hint: 'the hint', revealHint: true });
  check(withHint.byClass('prompt__hint')[0].getAttribute('hidden') === null, 'hint shown when revealHint');
  check(PromptCard({ kind: 'question', text: 't', state: 'active' }).getAttribute('aria-current') === 'step',
    'active state sets aria-current');
});

/* ============================================================
   Backward-compatible delegations still render their old shape
   ============================================================ */
group('delegations: EquationCard / PaperNote / ProblemCard', () => {
  const ec = EquationCard('1200 / 160', { large: true });
  check(ec.hasClass('equation-card') && ec.hasClass('equation-card--lg'), 'EquationCard -> legacy .equation-card--lg');
  check(EquationCard('') === null || EquationCard('').tagName === undefined || EquationCard('') == null,
    'EquationCard("") stays falsy (preset guards rely on it)');

  const lesson = { answer: { work: '1200 / 160', value: '= 7.50', unit: 'per hour' } };
  const pnHidden = PaperNote(lesson, { revealed: false });
  const pnShown = PaperNote(lesson, { revealed: true });
  check(pnHidden.hasClass('paper-note') && pnShown.hasClass('paper-note'), 'PaperNote -> .paper-note');
  check(pnShown.byClass('answer-ring-wrap').length === 1, 'PaperNote revealed keeps the ring');
  check(PaperNote({}, { revealed: true }) === null, 'PaperNote with no answer returns null');

  const pc = ProblemCard({ question: 'What is the rate?' });
  // markup() text is written via innerHTML; the shim stores it as .innerHTML
  check(pc.byClass('prompt__text')[0].innerHTML.includes('What is the rate?'),
    'ProblemCard renders the question');
});

/* ============================================================
   TransformationChain  (Phase 4)
   ============================================================ */
const CHAIN = [
  { form: '20 \\div 8', label: 'the division' },
  { form: '2 \\text{ R} 4', label: 'quotient and remainder', note: '4 left over, out of 8' },
  { form: '2 \\tfrac{4}{8}', label: 'as a mixed number', note: 'the remainder is 4 eighths' },
  { form: '2 \\tfrac{1}{2}', label: 'simplified', note: '4/8 = 1/2' },
  { form: '2.5', label: 'as a decimal' },
];

group('TransformationChain: progressive reveal + states', () => {
  for (const current of [0, 1, 3, 5, undefined]) {
    const n = TransformationChain({ links: CHAIN, current });
    const links = n.byClass('tchain__link');
    check(links.length === CHAIN.length,
      `chain current=${current}: all ${CHAIN.length} links kept (no layout jump) — got ${links.length}`);
    const revealed = current == null ? CHAIN.length : Math.max(0, Math.min(CHAIN.length, current));
    const expInactive = CHAIN.length - revealed;
    const expActive = (current != null && current >= 1 && current < CHAIN.length) ? 1 : 0;
    check(links.filter((x) => x.hasClass('is-inactive')).length === expInactive, `chain current=${current}: ${expInactive} inactive`);
    check(links.filter((x) => x.hasClass('is-active')).length === expActive, `chain current=${current}: ${expActive} active`);
    check(links.filter((x) => x.hasClass('is-complete')).length === revealed - expActive, `chain current=${current}: complete count`);
    check(links.filter((x) => x.getAttribute('aria-current') === 'step').length === expActive, `chain current=${current}: aria-current`);
    check(links.filter((x) => x.getAttribute('aria-hidden') === 'true').length === expInactive, `chain current=${current}: inactive links aria-hidden`);
    // hidden links show a placeholder, not their form -> reserve space, no jump
    links.forEach((x, i) => {
      if (x.hasClass('is-inactive')) check(x.byClass('tchain__hidden').length === 1, `chain current=${current}: link ${i} placeholder`);
    });
  }
});

group('TransformationChain: equivalence language, not "value changed"', () => {
  const n = TransformationChain({ links: CHAIN });
  // joiners between links are "=", never a bare arrow, unless equals:false
  const joins = n.byClass('tchain__join');
  check(joins.length === CHAIN.length - 1, 'one joiner between each pair of links');
  check(joins.every((j) => j.textAll().trim() === '='), 'every joiner is "=" by default');
  check(joins.every((j) => j.getAttribute('aria-hidden') === 'true'), 'joiners are decorative');
  // the equivalence baseline + its "same value" tag
  check(n.byClass('tchain__base').length === 1 && n.byClass('tchain__base-tag').length === 1, 'baseline + tag present');
  check(/same value/i.test(n.byClass('tchain__base-tag')[0].textAll()), 'baseline tag says "same value"');
  check(/different forms/i.test(n.getAttribute('aria-label') || ''), 'group aria-label frames it as forms of one value');
  // title threads the shared value into the tag
  const t = TransformationChain({ links: CHAIN, title: '2.5' });
  check(/2\.5/.test(t.byClass('tchain__base-tag')[0].textAll()), 'title appears on the baseline tag');
  // equals:false -> arrow joiner (opt-in only)
  const a = TransformationChain({ links: [{ form: 'a' }, { form: 'b', equals: false }] });
  check(a.byClass('tchain__join--arrow').length === 1, 'equals:false renders an arrow joiner');
});

group('TransformationChain: flow / stack / no horizontal scroll', () => {
  check(TransformationChain({ links: CHAIN, layout: 'flow' }).hasClass('tchain--flow'), 'flow layout');
  check(TransformationChain({ links: CHAIN, layout: 'stack' }).hasClass('tchain--stack'), 'stack layout');
  // > 5 links always stacks, even if flow was asked for
  const many = Array.from({ length: 7 }, (_, i) => ({ form: `f${i}` }));
  check(TransformationChain({ links: many, layout: 'flow' }).hasClass('tchain--stack'),
    '> 5 links forces stack (never a wide row that could scroll)');
  check(TransformationChain({ links: CHAIN }).hasClass('tchain--flow'), '<= 5 links + default = flow');
  // structure is a list; the row is a flex container in CSS (wraps, not scrolls)
  const n = TransformationChain({ links: CHAIN });
  check(n.byClass('tchain__links')[0].tagName === 'ol' && n.byClass('tchain__links')[0].getAttribute('role') === 'list',
    'links are a semantic list');
});

group('TransformationChain: accessibility', () => {
  const n = TransformationChain({ links: CHAIN, current: 3, title: '2.5' });
  check(n.getAttribute('role') === 'group', 'root is a group');
  const links = n.byClass('tchain__link');
  check(links.every((x) => x.getAttribute('role') === 'listitem'), 'links are listitems');
  check(links.every((x) => /^Form \d of 5/.test(x.getAttribute('aria-label') || '')), 'each link has a positional aria-label');
  check(/remainder is 4 eighths/.test(links[2].getAttribute('aria-label') || ''), 'link note reaches the aria-label');
  check(n.byClass('tchain__label').every((x) => x.getAttribute('aria-hidden') === 'true'), 'visible labels are aria-hidden (in the listitem label already)');
});

/* ============================================================
   NumberJobs  (Phase 4)
   ============================================================ */
group('NumberJobs: three jobs, words primary', () => {
  const n = NumberJobs({ whole: { value: 20 }, split: { value: 8 }, take: { value: 3 } });
  check(n.tagName === 'ol' && n.getAttribute('role') === 'list', 'root is a list');
  check(n.getAttribute('aria-label') === 'What each number is doing', 'group label');
  const jobs = n.byClass('njobs__job');
  check(jobs.length === 3, 'three job tiles');
  check(n.hasClass('njobs--n3'), 'n3 layout class');
  const names = n.byClass('njobs__name').map((x) => x.textAll().trim());
  check(names.join(',') === 'Whole,Split,Take', `role words present and in order (got ${names.join(',')})`);
  // every tile carries its role word AND a description regardless of colour
  check(jobs.every((x) => x.byClass('njobs__name').length === 1 && x.byClass('njobs__desc')[0].textAll().trim().length > 0),
    'each tile: role word + description (not colour-only)');
  check(n.byClass('njobs__value').map((x) => x.textAll().replace(/\s/g, '')).join(',') === '20,8,3', 'values render');
  // canonical descriptions, and SPLIT is not defined as "divide by this number"
  const splitDesc = jobs[1].byClass('njobs__desc')[0].textAll();
  check(/equal parts/.test(splitDesc) && !/divide by/i.test(splitDesc), 'SPLIT described as equal parts, not "divide by"');
});

group('NumberJobs: two-job configuration', () => {
  const n = NumberJobs({ whole: { value: 12 }, split: { value: 4 } });
  check(n.byClass('njobs__job').length === 2 && n.hasClass('njobs--n2'), 'two tiles, n2 layout');
  check(n.byClass('njobs__job--take').length === 0, 'no take tile when take omitted');
});

group('NumberJobs: active job emphasises without hiding the rest', () => {
  for (const active of JOB_IDS) {
    const n = NumberJobs({ whole: { value: 20 }, split: { value: 8 }, take: { value: 3 }, active });
    const jobs = n.byClass('njobs__job');
    check(jobs.filter((x) => x.hasClass('is-active')).length === 1, `active=${active}: one active`);
    check(jobs.find((x) => x.hasClass(`njobs__job--${active}`)).hasClass('is-active'), `active=${active}: the right tile`);
    check(jobs.filter((x) => x.hasClass('is-muted')).length === 2, `active=${active}: the other two are dimmed, still rendered`);
    check(jobs.every((x) => x.byClass('njobs__name')[0].textAll().trim().length > 0), `active=${active}: all role words still present`);
    check(jobs.find((x) => x.hasClass('is-active')).getAttribute('aria-current') === 'true', `active=${active}: aria-current`);
  }
});

group('NumberJobs: no active job', () => {
  const n = NumberJobs({ whole: { value: 20 }, split: { value: 8 }, take: { value: 3 }, active: null });
  const jobs = n.byClass('njobs__job');
  check(jobs.filter((x) => x.hasClass('is-active')).length === 0, 'nothing active');
  check(jobs.filter((x) => x.hasClass('is-muted')).length === 0, 'nothing dimmed - all equal weight');
  check(jobs.every((x) => x.hasClass('is-rest')), 'all tiles in the rest state');
});

group('NumberJobs: reusable with arbitrary values / descriptions', () => {
  const n = NumberJobs({
    whole: { value: '$144', desc: 'The whole bill.' },
    split: { value: 4, context: 'people', desc: 'Shared equally between 4.' },
    take: { value: 1, desc: 'One person’s share.' },
  });
  check(n.byClass('njobs__value')[0].textAll().includes('$144'), 'custom value renders');
  check(n.byClass('njobs__desc')[0].textAll().includes('whole bill'), 'custom description renders');
  check(n.byClass('njobs__context')[0].textAll().trim() === 'people', 'per-value context renders');
  // the role words are still the fixed reasoning language
  check(n.byClass('njobs__name').map((x) => x.textAll().trim()).join(',') === 'Whole,Split,Take',
    'role words stay WHOLE / SPLIT / TAKE regardless of content');
});

group('NumberJobs: stack layout + narrow-canvas class', () => {
  check(NumberJobs({ whole: { value: 1 }, split: { value: 2 }, layout: 'stack' }).hasClass('njobs--stack'), 'stack layout class');
});

/* ============================================================
   Phase 5 - visual math models
   ============================================================ */

group('DIAGRAMS registry compatibility', () => {
  // every legacy key still present and pointing at a function
  for (const k of ['numberBond', 'fractionBar', 'numberLine', 'doubleNumberLine',
    'percentBar', 'arrayModel', 'areaModel', 'ratioTable', 'unitRateTable',
    'balanceModel', 'coordinateGraph', 'barGraph', 'pieChart', 'receipt',
    'formulaBlock', 'equation']) {
    check(typeof DIAGRAMS[k] === 'function', `registry key "${k}" preserved`);
  }
  check(typeof DIAGRAMS.placeValueBreakdown === 'function', 'new key placeValueBreakdown');
  check(DIAGRAMS.fractionBarModel === DIAGRAMS.fractionBar, 'fractionBarModel aliases fractionBar');
  check(DIAGRAM_NAMES.includes('placeValueBreakdown') && DIAGRAM_NAMES.includes('fractionBarModel'),
    'DIAGRAM_NAMES exposes the new keys (control-panel dropdown + smoke test)');
});

group('NumberBond: legacy spec unchanged', () => {
  const n = NumberBond({ total: 462, parts: [400, 60, 2], caption: 'Expanded form' });
  const svgs = byTag(n, 'svg');
  check(svgs.length === 1 && svgs[0].getAttribute('viewBox') === '0 0 460 250', 'legacy viewBox 0 0 460 250');
  check(/Number bond: 462 splits into 400 and 60 and 2/.test(svgs[0].getAttribute('aria-label') || ''), 'legacy aria-label');
  check(byTag(n, 'circle').length === 4, 'whole + 3 parts = 4 circles');
  check(allText(n).includes('462') && allText(n).includes('400'), 'values rendered');
  check(n.byClass('nb__circle').length === 0, 'legacy path emits no rich state classes');
});

group('NumberBond: rich reveal / unknown / highlight', () => {
  // whole-only reveal
  const wo = NumberBond({ total: 10, parts: [7, 3], reveal: 'whole' });
  const circ = wo.byClass('nb__circle');
  check(circ.length === 3, 'rich path: 3 state-tagged circles');
  check(circ.filter((c) => c.hasClass('is-complete')).length === 1, 'whole-only: 1 revealed circle');
  check(circ.filter((c) => c.hasClass('is-inactive')).length === 2, 'whole-only: 2 hidden parts');
  check((byTag(wo, 'text').map(allText).join(' ').match(/\?/g) || []).length >= 2, 'hidden parts show "?"');

  // unknown part via "?"
  const unk = NumberBond({ total: 10, parts: ['?', 3] });
  check(byTag(unk, 'text').map(allText).join(' ').includes('?'), 'explicit "?" part renders as ?');
  check(unk.byClass('nb__circle').filter((c) => c.hasClass('is-inactive')).length === 1, 'the ? part is inactive');

  // progressive numeric reveal
  const p1 = NumberBond({ total: 20, parts: [16, 4], reveal: 1 });
  check(p1.byClass('nb__circle').filter((c) => c.hasClass('is-complete')).length === 2, 'reveal:1 -> whole + first part');
  check(p1.byClass('nb__circle').filter((c) => c.hasClass('is-inactive')).length === 1, 'reveal:1 -> 2nd part hidden');

  // highlighted part
  const hi = NumberBond({ total: 20, parts: [16, 4], highlightPart: 1 });
  check(hi.byClass('nb__circle').filter((c) => c.hasClass('is-active')).length === 1, 'highlightPart -> 1 active circle');

  // "combine" cue: + signs between parts, plus a spoken aria-label
  check(byTag(NumberBond({ total: 342, parts: [300, 42], reveal: 2 }), 'text').map(allText).join('').includes('+'),
    'rich bond shows a + between parts (non-colour "combine" cue)');
  check(/parts .*combine to the whole/i.test(byTag(hi, 'svg')[0].getAttribute('aria-label') || ''),
    'aria-label states the parts combine to the whole');
});

group('FractionBar: legacy fractionBar unchanged', () => {
  const n = FractionBar({ rows: [{ label: '1/2', denominator: 2, shaded: 1 }, { label: '3/6', denominator: 6, shaded: 3 }], caption: 'x' });
  check(n.byClass('fbar-stack').length === 1 && n.byClass('fbar-stack--rich').length === 0, 'legacy fbar-stack, not rich');
  check(n.byClass('fbar__cell').length === 8, '2 + 6 cells');
  check(n.byClass('fbar__cell').filter((c) => c.hasClass('is-on')).length === 1, 'row 0 shaded cell -> is-on');
  check(n.byClass('fbar__cell').filter((c) => c.hasClass('is-on-alt')).length === 3, 'row 1 shaded cells -> is-on-alt');
  check(allText(n).replace(/\s/g, '') === 'x' || allText(n).includes('x'), 'caption present, no cell glyphs in legacy');
});

group('FractionBarModel: selected distinction + equivalence marker + reveal', () => {
  const eq = DIAGRAMS.fractionBarModel({
    marker: true,
    rows: [{ label: '1/2', denominator: 2, shaded: 1 }, { label: '4/8', denominator: 8, shaded: 4 }],
  });
  check(eq.byClass('fbar-stack--rich').length === 1, 'rich stack');
  const cells = eq.byClass('fbar__cell');
  // non-colour: selected cells carry a filled glyph, unselected an outline glyph
  const sel = cells.filter((c) => c.hasClass('fbar__cell--sel'));
  check(sel.length === 5, '1 + 4 selected cells flagged');
  check(sel.every((c) => allText(c).includes('■')), 'selected cells show a filled square (not colour-only)');
  check(cells.filter((c) => !c.hasClass('fbar__cell--sel')).every((c) => allText(c).includes('□')), 'unselected cells show an outline square');
  check(eq.byClass('fbar__guide').length === 2, 'an equal-length guide per row');
  check(/same length/i.test(allText(eq)), 'guide is labelled "same length"');
  // guides at the same % prove 1/2 = 4/8
  const lefts = eq.byClass('fbar__guide').map((g) => g.style.left);
  check(lefts[0] === lefts[1] && lefts[0] === '50%', 'both guides land at 50% -> 1/2 = 4/8 visible');

  // reveal + active row
  const r = DIAGRAMS.fractionBar({ activeRow: 0, rows: [{ denominator: 8, shaded: 3, reveal: 2 }, { denominator: 8, shaded: 3 }] });
  check(r.byClass('fbar-row--rich')[0].hasClass('is-active'), 'activeRow 0 -> is-active');
  check(r.byClass('fbar-row--rich')[1].hasClass('is-muted'), 'other row -> is-muted (still rendered)');
  check(r.byClass('fbar')[0].children.filter((c) => c.hasClass && c.hasClass('is-pending')).length === 6, 'row 0 reveal:2 -> 6 pending cells');
  check(r.byClass('fbar-row--rich')[0].getAttribute('role') === 'img', 'rich rows are labelled images');
});

group('NumberLine: legacy numberLine unchanged', () => {
  const n = NumberLine({ min: 60, max: 100, ticks: 8, jump: { from: 68, to: 95, label: '+27' }, marks: [{ value: 70, label: 'friendly' }] });
  const s = byTag(n, 'svg')[0];
  check(s.getAttribute('viewBox') === '0 0 520 120', 'legacy viewBox 0 0 520 120');
  check(byTag(n, 'path').length === 1, 'one jump arc');
  check(allText(n).includes('+27') && allText(n).includes('friendly'), 'jump + mark labels');
  check(n.byClass('nline__mark').length === 0, 'legacy path emits no rich mark classes');
});

group('NumberLine: rich jumps / same-location labels / reveal', () => {
  // 7 + 5 as +3 then +2
  const j = NumberLine({ min: 5, max: 14, ticks: 9, jumps: [
    { from: 7, to: 10, label: '+3', state: 'complete' },
    { from: 10, to: 12, label: '+2', state: 'active' },
  ] });
  check(byTag(j, 'path').length === 2, 'two jump arcs');
  check(allText(j).includes('+3') && allText(j).includes('+2'), 'both jump labels');
  check(/Number line from 5 to 14/.test(byTag(j, 'svg')[0].getAttribute('aria-label') || ''), 'spoken aria-label');

  // reveal gates jumps
  const jr = NumberLine({ min: 5, max: 14, ticks: 9, reveal: 1, jumps: [{ from: 7, to: 10, label: '+3' }, { from: 10, to: 12, label: '+2' }] });
  check(byTag(jr, 'path').length === 2, 'both arcs present (reserve space)');
  check(byTag(jr, 'path').filter((p) => (p.getAttribute('stroke-dasharray') || '') !== '').length === 1, 'reveal:1 -> 2nd jump dashed');

  // same location, different labels
  const same = NumberLine({ min: 0, max: 1, ticks: 4, minorTicks: 1, marks: [{ value: 0.5, labels: ['1/2', '2/4', '0.5'] }] });
  check(byTag(same, 'circle').length === 1, 'one dot for three labels');
  const txt = byTag(same, 'text').map(allText);
  check(txt.some((t) => t.includes('1/2')) && txt.some((t) => t.includes('2/4')) && txt.some((t) => t.includes('0.5')),
    'all three forms rendered at one location -> SAME VALUE, different form');
  check(same.byClass('nline__mark').length === 1, 'rich mark class present');

  // minor ticks
  check(byTag(same, 'line').length > (4 + 1) + 1, 'minor ticks add lines');

  // negatives still work in the rich path
  const neg = NumberLine({ min: -5, max: 5, ticks: 10, marks: [{ value: -3, label: '-3', state: 'active' }] });
  check(byTag(neg, 'svg').length === 1 && allText(neg).includes('-3'), 'negative domain renders in rich path');
});

group('NumberLine: accessibility', () => {
  const n = NumberLine({ min: 5, max: 14, ticks: 9, jumps: [{ from: 7, to: 10, label: '+3' }], marks: [{ value: 12, label: 'answer' }] });
  const s = byTag(n, 'svg')[0];
  check(s.getAttribute('role') === 'img', 'rich number line is role=img');
  check(/jumps: 7 to 10 \(\+3\)/.test(s.getAttribute('aria-label') || ''), 'jumps described');
  check(/points: answer/.test(s.getAttribute('aria-label') || ''), 'points described');
});

group('PlaceValueBreakdown: decomposition', () => {
  check(JSON.stringify(decompose(342).map((p) => [p.name, p.digit, p.placeValue]))
    === JSON.stringify([['hundreds', 3, 300], ['tens', 4, 40], ['ones', 2, 2]]), 'auto-decompose 342');
  check(decompose(9182).map((p) => p.placeValue).join(',') === '9000,100,80,2', 'thousands supported');
  check(decompose(790).map((p) => p.placeValue).join(',') === '700,90,0', 'columns keep the zero place');
});

group('PlaceValueBreakdown: forms + reveal + regroup + a11y', () => {
  const both = PlaceValueBreakdown({ value: 342 });
  check(both.getAttribute('role') === 'group', 'root is a group');
  check(/342 is 3 hundreds, 4 tens, 2 ones/.test(both.getAttribute('aria-label') || ''), 'spoken decomposition');
  check(both.byClass('pvb__col').length === 3, 'columns present (both)');
  check(both.byClass('pvb__expanded').length === 1, 'expanded present (both)');
  check(both.byClass('pvb__place').map((x) => allText(x).trim()).join(',') === 'Hundreds,Tens,Ones',
    'place WORDS present (primary signal, not colour)');
  // expanded skips the zero place
  const t790 = PlaceValueBreakdown({ value: 790, form: 'expanded' });
  check(t790.byClass('pvb__col').length === 0 && t790.byClass('pvb__expanded').length === 1, 'expanded-only form');
  check(t790.byClass('pvb__addend').length === 2, '790 -> 700 + 90 (no + 0)');
  const cOnly = PlaceValueBreakdown({ value: 930, form: 'columns' });
  check(cOnly.byClass('pvb__col').length === 3 && cOnly.byClass('pvb__expanded').length === 0, 'columns-only form');
  // progressive reveal
  const rv = PlaceValueBreakdown({ value: 342, reveal: 2 });
  const cols = rv.byClass('pvb__col');
  check(cols.filter((c) => c.hasClass('is-inactive')).length === 1, 'reveal:2 -> last column inactive');
  check(cols.filter((c) => c.hasClass('is-active')).length === 1, 'reveal:2 -> one active column');
  check(allText(cols[2]).includes('_'), 'unrevealed digit shown as _');
  // regroup
  const rg = PlaceValueBreakdown({ value: 342, regroup: { from: 1, to: 2 } });
  check(rg.byClass('pvb__regroup').length === 1 && /regroup/i.test(allText(rg)), 'regroup note rendered');
  check(rg.byClass('pvb__col')[1].hasClass('is-regroup-from') && rg.byClass('pvb__col')[2].hasClass('is-regroup-to'),
    'regroup marks the two columns');
  // highlighted place
  check(PlaceValueBreakdown({ value: 342, highlightPlace: 0 }).byClass('pvb__col')[0].hasClass('is-active'),
    'highlightPlace -> active column');
});

/* ============================================================
   Phase 6 - production teaching composition
   ============================================================ */
const LESSON = normalize({
  topic: 'Unit Rate', title: 'Reality Check', question: 'What is the hourly rate?',
  steps: {
    see: { text: 'notice the numbers', equation: '1200 \\text{ and } 160' },
    break: { text: 'one hour', equation: '160 \\to 1' },
    build: { text: 'divide', equation: '1200 / 160' },
    transform: { text: 'easier', equation: '120 / 16 = 7.5' },
    check: { text: 'multiply back', equation: '7.5 \\times 160 = 1200' },
  },
  answer: { work: '1200 / 160', value: '= 7.50', unit: 'per hour' },
  diagram: { type: 'numberBond', total: 1200, parts: [1120, 80] },
  comparison: { think: 'good money', math: '{$7.50} per hour' },
  takeaways: ['big totals mislead'],
}, 'unit-rate');

const st = (over = {}) => ({ ...structuredClone(DEFAULT_STATE), ...over });

group('Phase 6: preset A composes the teaching-workspace hierarchy', () => {
  const n = buildStageContent(st({ preset: 'A', aspect: '16x9', step: 3, revealAnswer: true }), LESSON);
  check(n.byClass('r-rail').length === 1, 'top rail present');
  check(n.byClass('trail--rail').length >= 1, 'rail uses TeachingRail rail variant');
  check(n.byClass('ws-col').length === 1, 'workspace column present');
  check(n.byClass('ws-equation').length === 1, 'equation region (EquationWorkspace)');
  check(n.byClass('eqw').length >= 1, 'EquationWorkspace rendered');
  check(n.byClass('ws-visual').length === 1, 'visual model region');
  check(n.byClass('ws-result').length === 1, 'result region (AnswerReveal)');
  check(n.byClass('r-philosophy').length === 1, 'philosophy strip present');
  check(/Same value/i.test(allText(n.byClass('r-philosophy')[0])), 'philosophy strip says "same value / different form"');
});

group('Phase 6: rail + workspace track state.step', () => {
  const railNodes = (step) => buildStageContent(st({ preset: 'A', step }), LESSON)
    .byClass('trail__node');
  check(railNodes(0).filter((x) => x.hasClass('is-active')).length === 0, 'step 0 -> no active rail node');
  check(railNodes(3).filter((x) => x.hasClass('is-active')).length === 1, 'step 3 -> BUILD active');
  check(railNodes(3).filter((x) => x.hasClass('is-complete')).length === 2, 'step 3 -> SEE + BREAK complete');
});

group('Phase 6: layer flags gate the composed regions', () => {
  const off = (layer) => {
    const s = st({ preset: 'A', step: 3 });
    s.layers = { ...s.layers, [layer]: false };
    return buildStageContent(s, LESSON);
  };
  check(off('discovery').byClass('r-rail').length === 0, 'discovery:false -> no rail');
  check(off('math').byClass('ws-equation').length === 0 && off('math').byClass('ws-visual').length === 0,
    'math:false -> no equation / visual regions');
  check(off('presenter').byClass('r-presenter').length === 0, 'presenter:false -> no camera region');
  // philosophy strip is the persistent backbone - always there
  check(off('math').byClass('r-philosophy').length === 1, 'philosophy strip survives layer toggles');
});

group('Phase 6: answer reveal gating + aspect gating', () => {
  const hidden = buildStageContent(st({ preset: 'A', step: 5, revealAnswer: false }), LESSON);
  check(/Answer hidden/i.test(hidden.byClass('ws-result')[0].getAttribute('aria-label') || allText(hidden)),
    'revealAnswer:false -> answer placeholder, no value leaked');
  const sq = buildStageContent(st({ preset: 'A', aspect: '1x1', step: 3 }), LESSON);
  check(sq.byClass('r-rail').length === 0, '1:1 does not carry the 16:9 top rail (own composition lands later)');
});

group('Phase 6: visual-reasoning families (B / D / E / G / H)', () => {
  const compose = (preset) => buildStageContent(st({ preset, step: 3, revealAnswer: true }), LESSON);
  for (const p of ['B', 'D', 'E', 'G', 'H']) {
    const n = compose(p);
    check(n.byClass('ws-col').length === 1, `preset ${p}: composes a workspace column`);
    check(n.byClass('eqw').length >= 1, `preset ${p}: EquationWorkspace present`);
    check(n.byClass('stepper').length === 0, `preset ${p}: legacy row stepper retired`);
  }
  // rail: yes for B/D/E/H, no for the quick-explanation beat (G)
  check(compose('B').byClass('r-rail').length === 1, 'B carries the top rail');
  check(compose('D').byClass('r-rail').length === 1, 'D carries the top rail');
  check(compose('G').byClass('r-rail').length === 0, 'G stays chrome-free (no rail)');
  // D leans on the equivalence chain for its visual slot
  check(compose('D').byClass('tchain').length >= 1, 'D shows a TransformationChain');
  // E leads with the model
  check(compose('E').byClass('ws-col--visual').length === 1, 'E uses the visual-lead column');
  // H keeps its dashed whiteboard frame
  check(compose('H').byClass('whiteboard').length === 1, 'H keeps the whiteboard frame');
});

group('Phase 6: vertical (F / 9:16) and square (1:1) compositions', () => {
  const fv = buildStageContent(st({ preset: 'F', aspect: '9x16', step: 3, revealAnswer: true }), LESSON);
  check(fv.byClass('ws-col--vertical').length === 1, 'F composes a deliberate vertical column');
  check(fv.byClass('stepper').length === 0, 'F no longer uses the legacy stepper');
  check(fv.byClass('eqw').length >= 1 && fv.byClass('ws-visual').length === 1, 'F stacks visual + equation');
  check(fv.byClass('r-rail').length === 1, 'F carries the vertical top rail');
  check(fv.byClass('r-presenter').length === 1, 'F keeps a (smaller, lower) camera region');

  // presenter OFF on the phone canvas still looks intentional (no dead rect)
  const fvOff = st({ preset: 'F', aspect: '9x16', step: 3 });
  fvOff.layers = { ...fvOff.layers, presenter: false };
  const fvOffN = buildStageContent(fvOff, LESSON);
  check(fvOffN.byClass('r-presenter').length === 0, 'F presenter hidden -> camera region dropped');
  check(fvOffN.byClass('ws-col--vertical').length === 1, 'F presenter hidden -> workspace still composes');

  // square: no rail, board head carries the prompt, workspace stays
  const sq = buildStageContent(st({ preset: 'A', aspect: '1x1', step: 3, revealAnswer: true }), LESSON);
  check(sq.byClass('r-rail').length === 0, '1:1 drops the rail for room');
  check(sq.byClass('ws-col').length === 1 && sq.byClass('ws-visual').length === 1, '1:1 keeps prompt/visual/result workspace');
  check(sq.byClass('r-philosophy').length === 1, 'philosophy strip still in the DOM (CSS-hidden on 1:1)');
});

/* ---------- report ---------- */
if (failures.length) {
  console.error(`\nUI component tests: ${failures.length} FAILURE(S)`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`UI component tests: ${passed} assertions passed.`);
