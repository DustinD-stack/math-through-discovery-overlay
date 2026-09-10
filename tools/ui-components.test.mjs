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

/* ---------- report ---------- */
if (failures.length) {
  console.error(`\nUI component tests: ${failures.length} FAILURE(S)`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`UI component tests: ${passed} assertions passed.`);
