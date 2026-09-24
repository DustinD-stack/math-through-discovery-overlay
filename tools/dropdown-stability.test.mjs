/* ============================================================
   Dropdown stability regression test (post-V1 Control fix)
   node tools/dropdown-stability.test.mjs

   Root cause: control-app.js ran `setInterval(() => { ...; render() },
   3000)` purely to refresh the connection-status label. `render()`
   fully clears and rebuilds the entire controls column, including the
   Unit/Experience <select> elements — destroying their DOM node while
   a native dropdown was open forces Chrome to close it immediately
   (confirmed live: the #fr1-unit/#fr1-experience DOM node identity did
   not survive 10s of idle time before this fix, and did survive after).

   That live, real-browser reproduction isn't something this project's
   headless Node/DOM-shim harness can model (no native <select> popup,
   no real timers driving a visible page) — this file instead locks in
   the source-level invariant the fix depends on: the periodic
   connectivity check must never call the full render/renderInner
   pipeline, only the standalone badge updater.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'src', 'controllers', 'control-app.js'), 'utf8');

let passed = 0;
const failures = [];
function assert(cond, msg) { if (cond) passed += 1; else failures.push(msg); }

/* =========================== SOURCE INVARIANTS =========================== */
{
  const intervalMatch = src.match(/setInterval\(\(\)\s*=>\s*\{.*?\},\s*3000\);/);
  assert(!!intervalMatch, 'the 3-second connectivity-ping interval still exists');
  if (intervalMatch) {
    assert(!/render\(\)/.test(intervalMatch[0]),
      'the periodic ping interval never calls the full destructive render() (would tear down any open <select>)');
    assert(/updateConnectionBadge\(\)/.test(intervalMatch[0]),
      'the periodic ping interval updates the connection badge via the standalone, in-place updater');
  }
}

{
  const onConnectionMatch = src.match(/bus\.onConnection\(\(ok\)\s*=>\s*\{.*?\}\);/);
  assert(!!onConnectionMatch, 'the bus.onConnection handler still exists');
  if (onConnectionMatch) {
    assert(!/render\(\)/.test(onConnectionMatch[0]),
      'bus.onConnection never calls the full destructive render() either');
    assert(/updateConnectionBadge\(\)/.test(onConnectionMatch[0]),
      'bus.onConnection updates the connection badge via the standalone updater');
  }
}

{
  assert(/function updateConnectionBadge\(\)/.test(src),
    'a standalone updateConnectionBadge() function exists, separate from the full render pipeline');
  assert(/const connectionBadge = el\(/.test(src),
    'the connection badge is a single persistent DOM node created once, not recreated by render()');
  // The badge must be referenced (reused), not recreated, inside the
  // full render pipeline itself.
  const renderInnerStart = src.indexOf('function renderInner()');
  assert(renderInnerStart !== -1, 'renderInner() still exists');
  const renderInnerBody = src.slice(renderInnerStart, renderInnerStart + 2000);
  assert(/\bconnectionBadge\b/.test(renderInnerBody) && !/renderConnectionBadge\(\)/.test(renderInnerBody),
    'renderInner() reuses the persistent connectionBadge node rather than constructing a fresh one');
}

{
  // No other unconditional periodic full-render exists anywhere.
  const allIntervals = [...src.matchAll(/setInterval\(([\s\S]*?)\},\s*\d+\)/g)];
  assert(allIntervals.length >= 1, 'at least the connectivity interval is present (sanity check on the regex itself)');
  for (const m of allIntervals) {
    assert(!/\brender\(\)/.test(m[1]), `no setInterval callback calls the full render(): ${m[0].slice(0, 60)}...`);
  }
}

/* ---------- report ---------- */
if (failures.length) {
  console.error(`Dropdown stability tests: ${failures.length} failure(s):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
} else {
  console.log(`Dropdown stability tests: ${passed} assertions passed.`);
}
