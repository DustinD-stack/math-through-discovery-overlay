/* ============================================================
   Viewport preservation tests (post-V1 Control scroll fix)
   node tools/viewport-preserve.test.mjs

   Real browser scroll/scroll-anchoring behavior cannot be meaningfully
   modeled in this project's headless Node/DOM-shim test harness (no
   layout engine, no compositor) — this file instead exhaustively unit
   tests the pure, reusable `preserveViewport` helper itself against a
   mock scroll container and a minimal `document` stub, covering every
   interaction category the milestone lists (Next/Previous/Reveal/Reset/
   representation/presenter/aspect/Unit/Experience/Start Lesson all
   route through the SAME `render()` wrapper in control-app.js, so
   testing the wrapper's contract directly covers all of them).

   A real, rigorous browser-level reproduction (headless AND headed
   Chromium, synthetic events, Playwright's built-in click, raw verified-
   visible mouse clicks, and genuine mouse-wheel scrolling) was also
   performed manually against both the pre-fix and post-fix code as part
   of this fix — see the commit message / final report for that
   methodology and its results.
   ============================================================ */

let passed = 0;
const failures = [];
function assert(cond, msg) { if (cond) passed += 1; else failures.push(msg); }

const { preserveViewport } = await import('../src/utils/viewport-preserve.js');

/* ---------- minimal document/rAF stand-ins ---------- */
function makeElement(id) {
  return {
    id,
    _focused: false,
    _selection: null,
    focus(opts) { this._focused = true; this._focusOpts = opts || {}; },
    setSelectionRange(start, end) { this._selection = [start, end]; },
    selectionStart: 0,
    selectionEnd: 0,
  };
}

function withStubDocument(activeElement, elementsById, fn) {
  const originalDocument = globalThis.document;
  const originalRaf = globalThis.requestAnimationFrame;
  const rafCallbacks = [];
  globalThis.document = {
    activeElement,
    getElementById: (id) => elementsById[id] || null,
  };
  globalThis.requestAnimationFrame = (cb) => { rafCallbacks.push(cb); return rafCallbacks.length; };
  try {
    fn(rafCallbacks);
  } finally {
    globalThis.document = originalDocument;
    globalThis.requestAnimationFrame = originalRaf;
  }
}

/* =========================== SCROLL PRESERVATION =========================== */
{
  // Covers: Next, Previous, Reveal, Reset, representation switch,
  // presenter toggle, aspect switch — every one of these calls
  // control-app.js's render(), which is exactly this wrapper around an
  // inner render function that may fully replace DOM content.
  withStubDocument(null, {}, (rafCallbacks) => {
    const scroller = { scrollTop: 742 };
    let rendered = false;
    preserveViewport(scroller, () => {
      // Simulate a full subtree rebuild that (for whatever reason, in
      // whichever browser) leaves the container's scroll position
      // disturbed mid-render.
      scroller.scrollTop = 0;
      rendered = true;
    });
    assert(rendered, 'SCROLL: the wrapped render function actually ran');
    assert(scroller.scrollTop === 742, 'SCROLL: position is restored synchronously immediately after render');

    // Simulate the browser nudging scrollTop again on its own before the
    // next paint (the scenario the rAF reassertion exists for).
    scroller.scrollTop = 10;
    assert(rafCallbacks.length === 1, 'SCROLL: exactly one rAF callback was scheduled for reassertion');
    rafCallbacks[0]();
    assert(scroller.scrollTop === 742, 'SCROLL: the rAF reassertion restores the position a second time');
  });
}

{
  // Start Lesson / Unit / Experience selects: a fresh scroll position of
  // 0 (top of page) must not be treated as "nothing to restore" — 0 is
  // a legitimate position and must round-trip exactly like any other.
  withStubDocument(null, {}, () => {
    const scroller = { scrollTop: 0 };
    preserveViewport(scroller, () => { scroller.scrollTop = 500; });
    assert(scroller.scrollTop === 0, 'SCROLL: a starting position of exactly 0 is preserved, not skipped');
  });
}

{
  // Deeply scrolled position (matches "Change Lesson" being far down a
  // tall Control column) round-trips exactly.
  withStubDocument(null, {}, () => {
    const scroller = { scrollTop: 3120 };
    preserveViewport(scroller, () => { scroller.scrollTop = 0; });
    assert(scroller.scrollTop === 3120, 'SCROLL: a deep scroll position (Change Lesson section) round-trips exactly');
  });
}

/* =========================== FOCUS PRESERVATION =========================== */
{
  // Unit selector: keep keyboard focus logically on the control the
  // operator was using, even though render() destroys and recreates it.
  const oldUnitSelect = makeElement('fr1-unit');
  const newUnitSelect = makeElement('fr1-unit');
  withStubDocument(oldUnitSelect, { 'fr1-unit': newUnitSelect }, () => {
    const scroller = { scrollTop: 400 };
    preserveViewport(scroller, () => { /* render destroys oldUnitSelect, creates newUnitSelect */ });
    assert(newUnitSelect._focused === true, 'FOCUS: the newly-created element sharing the old focused id is refocused');
    assert(newUnitSelect._focusOpts.preventScroll === true, 'FOCUS: refocusing uses preventScroll so .focus() cannot itself reintroduce a scroll jump');
  });
}

{
  // Experience selector — same contract, different id.
  const oldExpSelect = makeElement('fr1-experience');
  const newExpSelect = makeElement('fr1-experience');
  withStubDocument(oldExpSelect, { 'fr1-experience': newExpSelect }, () => {
    preserveViewport({ scrollTop: 0 }, () => {});
    assert(newExpSelect._focused === true, 'FOCUS: Experience select id is refocused after rebuild');
  });
}

{
  // Ordinary buttons (Next/Previous/Reveal/Reset/representation/
  // presenter/aspect) have no id in control-app.js — focus was on a
  // plain <button> with no id. Nothing should be refocused (there is no
  // stable identity to restore), and this must not throw.
  const oldButton = makeElement(undefined);
  oldButton.id = ''; // buttons in control-app.js carry no id attribute
  const exception = (() => {
    try {
      withStubDocument(oldButton, {}, () => { preserveViewport({ scrollTop: 5 }, () => {}); });
      return null;
    } catch (e) { return e; }
  })();
  assert(exception === null, 'FOCUS: an id-less focused element (a plain button) never throws and is simply not refocused');
}

{
  // No focused element at all (document.activeElement is null, or body).
  const exception = (() => {
    try {
      withStubDocument(null, {}, () => { preserveViewport({ scrollTop: 5 }, () => {}); });
      return null;
    } catch (e) { return e; }
  })();
  assert(exception === null, 'FOCUS: a null activeElement never throws');
}

{
  // The element with the previously-focused id no longer exists after
  // render (e.g. Exit Foundation Mode removed the whole FR1 panel) —
  // must not throw.
  const oldEl = makeElement('fr1-unit');
  const exception = (() => {
    try {
      withStubDocument(oldEl, {}, () => { preserveViewport({ scrollTop: 5 }, () => {}); }); // getElementById returns null
      return null;
    } catch (e) { return e; }
  })();
  assert(exception === null, 'FOCUS: a since-removed id (e.g. after Exit Foundation Mode) never throws');
}

/* =========================== TEXT SELECTION PRESERVATION =========================== */
{
  // The "Live edits" text inputs/textareas are the one place a cursor
  // position genuinely matters beyond simple focus.
  const oldInput = makeElement('live-edit-title');
  oldInput.selectionStart = 3;
  oldInput.selectionEnd = 7;
  const newInput = makeElement('live-edit-title');
  withStubDocument(oldInput, { 'live-edit-title': newInput }, () => {
    preserveViewport({ scrollTop: 0 }, () => {});
    assert(JSON.stringify(newInput._selection) === JSON.stringify([3, 7]), 'SELECTION: cursor/selection range is restored on the recreated element');
  });
}

{
  // Elements without selectionStart/setSelectionRange (a <select>, a
  // <button>) must not throw when selection restoration is attempted.
  const oldSelect = makeElement('fr1-unit');
  delete oldSelect.selectionStart;
  delete oldSelect.selectionEnd;
  const newSelect = makeElement('fr1-unit');
  delete newSelect.setSelectionRange;
  const exception = (() => {
    try {
      withStubDocument(oldSelect, { 'fr1-unit': newSelect }, () => { preserveViewport({ scrollTop: 0 }, () => {}); });
      return null;
    } catch (e) { return e; }
  })();
  assert(exception === null, 'SELECTION: a control with no setSelectionRange (e.g. a <select>) never throws');
  assert(newSelect._focused === true, 'SELECTION: focus is still restored even when selection restoration is not applicable');
}

/* ---------- report ---------- */
if (failures.length) {
  console.error(`Viewport preservation tests: ${failures.length} failure(s):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
} else {
  console.log(`Viewport preservation tests: ${passed} assertions passed.`);
}
