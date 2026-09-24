/* ============================================================
   Live edits stability regression test (post-V1 Control fix)
   node tools/live-edit-stability.test.mjs

   Root cause: every `oninput` handler in buildEditor() (Live edits
   panel) went through `set()`, which calls the full destructive
   `render()` on every keystroke — rebuilding the entire controls
   column, resetting every <details> section to closed, and destroying
   the exact <input>/<textarea> the operator was typing into (dropping
   focus and cursor position every character).

   Real typing/focus/cursor/<details>-toggle behavior isn't something
   this project's headless Node/DOM-shim harness can model — this file
   locks in the source-level contract the fix depends on. A full live
   verification (continuous typing in a single-line and a multiline
   field, an expanded section surviving a genuine async WebSocket
   'fr1-status' event mid-edit, the section closing only when the
   operator explicitly closes it, and the overlay preview receiving the
   completed edit) was performed manually in a real Chromium browser as
   part of this fix — see the commit message for that methodology.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'src', 'controllers', 'control-app.js'), 'utf8');

let passed = 0;
const failures = [];
function assert(cond, msg) { if (cond) passed += 1; else failures.push(msg); }

/* =========================== NO RENDER ON KEYSTROKE =========================== */
{
  assert(/function setQuiet\(patch\)\s*\{\s*store\.set\(patch\);\s*push\(\);\s*\}/.test(src),
    'setQuiet updates state and pushes to the overlay, without calling render()');

  const buildEditorStart = src.indexOf('function buildEditor(');
  assert(buildEditorStart !== -1, 'buildEditor() still exists');
  const buildEditorBody = src.slice(buildEditorStart, buildEditorStart + 4000);

  assert(/const edit = \(path\) => \(e\) => set\(/.test(buildEditorBody),
    'buildEditor\'s edit() still writes overrides through the injected "set" parameter');
  assert(/buildEditor\(s, lesson, setQuiet, store, openLiveEditSections\)/.test(src),
    'buildEditor is invoked with setQuiet (not the full render-triggering set) as its update function');
}

/* =========================== STABLE FIELD IDS =========================== */
{
  const buildEditorStart = src.indexOf('function buildEditor(');
  const buildEditorBody = src.slice(buildEditorStart, buildEditorStart + 4000);

  assert(/const fieldId = \(path\) => `live-edit-\$\{path\}`/.test(buildEditorBody),
    'every live-edit field gets a stable, path-derived id (so existing focus/selection restoration by id already covers it)');
  assert(/el\('input', \{ id: fieldId\(path\)/.test(buildEditorBody) || /id: fieldId\(path\)/.test(buildEditorBody),
    'the generic text()/textarea helper assigns a field id');
  // Every dynamically-generated field (facts, steps, takeaways) also
  // carries an id, not just the single top-level fields.
  for (const needle of ["fieldId(`facts.${i}.label`)", "fieldId(`facts.${i}.value`)", "fieldId('answer.work')", "fieldId('answer.value')", "fieldId(`steps.${k}.text`)", "fieldId(`steps.${k}.equation`)", "fieldId(`takeaways.${i}`)"]) {
    assert(buildEditorBody.includes(needle), `dynamically-generated field carries a stable id: ${needle}`);
  }
}

/* =========================== SECTION OPEN/CLOSED STATE =========================== */
{
  assert(/const openLiveEditSections = new Set\(\);/.test(src),
    'a persistent Set tracks which Live-edit <details> sections are open, surviving re-renders');

  const buildEditorStart = src.indexOf('function buildEditor(');
  const buildEditorBody = src.slice(buildEditorStart, buildEditorStart + 4000);

  assert(/const section = \(sectionId, summaryText, \.\.\.children\) => el\('details'/.test(buildEditorBody),
    'a section() helper builds every <details> consistently with persisted state');
  assert(/open: openSections\.has\(sectionId\)/.test(buildEditorBody),
    'a rebuilt <details> section restores its open attribute from the persistent set, not a hardcoded default');
  assert(/ontoggle: \(e\) => \{ if \(e\.target\.open\) openSections\.add\(sectionId\); else openSections\.delete\(sectionId\); \}/.test(buildEditorBody),
    'the operator toggling a section (their own choice) is the only thing that updates the persisted open/closed state');

  for (const sectionId of ["'facts'", "'steps'", "'comparison'", "'takeaways'"]) {
    assert(buildEditorBody.includes(`section(${sectionId}`), `every Live-edit <details> group uses the persisted section() helper: ${sectionId}`);
  }
  // No raw, un-persisted <details class="cp__group"> should remain in buildEditor.
  const rawDetailsCount = (buildEditorBody.match(/el\('details', \{ class: 'cp__group' \}/g) || []).length;
  assert(rawDetailsCount === 0, 'no Live-edit <details> section bypasses the persisted section() helper');
}

/* =========================== UNDO / RESET / DROPDOWN FIX UNCHANGED =========================== */
{
  assert(/onclick: \(\) => \{ store\.set\(\{ overrides: \{\} \}\); render\(\); push\(\); \} \}, 'Undo live edits'/.test(src),
    'Undo live edits still forces a real full render() (it must redraw every field back to its non-override value)');
  assert(/onclick: \(\) => \{ store\.replace\(\{ \.\.\.DEFAULT_STATE, lessonId: s\.lessonId \}\); render\(\); push\(\); \} \}, 'Reset lesson'/.test(src),
    'Reset lesson still forces a real full render()');

  // The previously-fixed dropdown/timer behavior must remain intact —
  // this fix must not reintroduce a periodic full render.
  const intervalMatch = src.match(/setInterval\(\(\)\s*=>\s*\{.*?\},\s*3000\);/);
  assert(!!intervalMatch && !/render\(\)/.test(intervalMatch[0]),
    'the connection-status interval still never calls the full render() (previous dropdown-stability fix intact)');
}

/* ---------- report ---------- */
if (failures.length) {
  console.error(`Live edit stability tests: ${failures.length} failure(s):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
} else {
  console.log(`Live edit stability tests: ${passed} assertions passed.`);
}
