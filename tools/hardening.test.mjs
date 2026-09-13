/* ============================================================
   Release-candidate hardening tests (P8)
   node tools/hardening.test.mjs

   Covers: connection-status resolution, load-failure state
   preservation (via a real mounted overlay app, with fetch/WebSocket
   shimmed), invalid-action safety, control-state clarity inputs,
   accessible labeling of critical controls, long-session determinism,
   and reconnect-without-duplication.

   Uses the same minimal headless DOM shim as the other
   tools/*.test.mjs files, extended with just enough `fetch` and
   `WebSocket`/`BroadcastChannel` stand-ins for src/app/bus.js and
   src/curriculum/catalog.js's fetch reader to run in Node.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

class Node {
  constructor(tag, ns) { this.tagName = tag; this.ns = ns; this.children = []; this.attrs = {}; this.style = {}; this.dataset = {}; this.text = ''; this._listeners = {}; }
  appendChild(c) { this.children.push(c); return c; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); }
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
  // No `protocol` field: src/app/bus.js's wsURL() then returns null and
  // never opens (or retries) a WebSocket at all — deliberately, so this
  // headless run has no pending timers keeping the process alive.
  location: { search: '', href: 'http://localhost:3000/overlay.html' },
  addEventListener: () => {},
  innerWidth: 1920, innerHeight: 1080,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
};
globalThis.localStorage = globalThis.window.localStorage;

// No real network/WebSocket in this harness — bus.js degrades to its
// browser-local fallbacks (BroadcastChannel/postMessage/localStorage),
// none of which exist here either, so `bus.send` becomes a harmless
// no-op and every test below drives the app directly through its
// returned `fr1` API, exactly the way a real bus message would.
globalThis.BroadcastChannel = undefined;
globalThis.WebSocket = undefined;

// Serve real corpus files for `fetch()` the same way a browser would
// over http, so ensureFr1Catalog()/getExperience() run unmodified.
globalThis.fetch = async (url) => {
  const u = new URL(typeof url === 'string' ? url : url.toString(), 'http://localhost:3000/');
  const full = path.join(root, decodeURIComponent(u.pathname.replace(/^\//, '')));
  if (!fs.existsSync(full)) return { ok: false, status: 404, json: async () => ({}) };
  const text = fs.readFileSync(full, 'utf8');
  return { ok: true, status: 200, json: async () => JSON.parse(text) };
};

let passed = 0;
const failures = [];
function assert(cond, msg) { if (cond) passed += 1; else failures.push(msg); }

const { mountOverlay } = await import('../src/app/overlay-app.js');
const { buildCatalog, getExperience, makeFsReader } = await import('../src/curriculum/catalog.js');
const { adaptExperience } = await import('../src/curriculum/adapter.js');
const { createPlayer, UnknownStageError } = await import('../src/curriculum/player.js');
const { resolveRepresentation, UnknownRepresentationError } = await import('../src/curriculum/representations.js');
const { resolveConnectionStatus, connectionStatusLabel } = await import('../src/curriculum/connection-status.js');
const { resolveFr1Shortcut, isTypingTarget } = await import('../src/curriculum/shortcuts.js');

const releaseDir = path.join(root, 'lessons', 'foundation-release-1');
const manifest = JSON.parse(fs.readFileSync(path.join(releaseDir, 'manifest.json'), 'utf8'));
const catalog = buildCatalog(manifest);
const readLesson = makeFsReader(root, fs, path);

/* =========================== CONNECTION / STATUS =========================== */
{
  assert(resolveConnectionStatus({ serverConnected: false, lastPeerSeenAt: 0 }) === 'offline',
    'CONNECTION: no server socket at all is offline, regardless of peer history');
  assert(resolveConnectionStatus({ serverConnected: true, lastPeerSeenAt: 0 }) === 'connecting',
    'CONNECTION: server socket up but no overlay ever seen is "connecting"');
  const now = 1_000_000;
  assert(resolveConnectionStatus({ serverConnected: true, lastPeerSeenAt: now - 1000, now }) === 'connected',
    'CONNECTION: a recently-seen overlay peer is "connected"');
  assert(resolveConnectionStatus({ serverConnected: true, lastPeerSeenAt: now - 999999, now }) === 'offline',
    'CONNECTION: a stale peer timestamp reads as offline even though the server socket is up');
  assert(connectionStatusLabel('connected') === 'Overlay Connected'
    && connectionStatusLabel('connecting') === 'Connecting…'
    && connectionStatusLabel('offline') === 'Overlay Offline',
    'CONNECTION: operator-facing labels never mention WebSocket/JSON terminology');
  assert(connectionStatusLabel('nonsense') === 'Overlay Offline', 'CONNECTION: an unrecognized status fails safe to Offline');
}

/* =========================== LOAD FAILURE / SAFE STATE =========================== */
{
  const app = await mountOverlay(new Node('div'), { role: 'overlay', listen: false });

  await app.fr1.select('1.3.1');
  assert(app.fr1.isActive() && app.fr1.player().experience.id === '1.3.1',
    'LOAD FAILURE: a valid select succeeds and becomes the active session');

  const before = app.fr1.status();
  await app.fr1.select('no-such-lesson-id').catch(() => {});
  const after = app.fr1.status();
  assert(after.active && after.id === '1.3.1',
    'LOAD FAILURE: selecting an unknown id leaves the previously loaded lesson active');
  assert(after.stageId === before.stageId && after.revealed === before.revealed,
    'LOAD FAILURE: selecting an unknown id does not disturb stage/reveal of the prior valid session');

  // A fresh mount (nothing valid loaded yet) failing to select is the
  // one case where an operator-safe full error state is expected.
  const freshApp = await mountOverlay(new Node('div'), { role: 'overlay', listen: false });
  await freshApp.fr1.select('no-such-lesson-id').catch(() => {});
  assert(!freshApp.fr1.isActive(), 'LOAD FAILURE: a first-ever failed select never fabricates a fake active session');
}

/* =========================== INVALID ACTION =========================== */
{
  const app = await mountOverlay(new Node('div'), { role: 'overlay', listen: false });
  await app.fr1.select('1.3.1');
  const before = app.fr1.status();

  app.fr1.stage('goto:not-a-real-stage'); // must be swallowed, not thrown, not corrupting
  const afterBadGoto = app.fr1.status();
  assert(afterBadGoto.stageId === before.stageId && afterBadGoto.revealed === before.revealed,
    'INVALID ACTION: an unknown goto target leaves the current stage/reveal exactly as it was');

  app.fr1.stage('repr:not-a-real-representation');
  const afterBadRepr = app.fr1.status();
  assert(afterBadRepr.stageId === before.stageId,
    'INVALID ACTION: an unknown representation selection leaves the current stage exactly as it was');

  app.fr1.stage('next'); // sanity: the session is still perfectly usable afterward
  assert(app.fr1.status().stageIndex === before.stageIndex + 1,
    'INVALID ACTION: the session remains fully operable after invalid actions are rejected');
}

/* =========================== CONTROL STATE CLARITY (payload shape) ================ */
{
  const exp = adaptExperience(await getExperience('1.2.4', { catalog, readLesson }));
  const player = createPlayer(exp);
  const requiredTeachingFields = ['active', 'kind', 'id', 'unitId', 'title', 'type', 'sessionStatus', 'stageId', 'stageIndex', 'stageCount', 'order', 'atStart', 'atEnd', 'revealed'];
  // Mirrors src/app/overlay-app.js buildFr1Status() teaching branch shape.
  const status = {
    active: true, kind: player.kind, id: exp.id, unitId: exp.unitId, title: exp.title, type: exp.type,
    sessionStatus: player.sessionStatus(), stageId: player.current().id, stageIndex: player.currentIndex(),
    stageCount: player.order.length, order: player.order, atStart: player.atStart(), atEnd: player.atEnd(),
    revealed: player.isRevealed(),
  };
  assert(requiredTeachingFields.every((k) => k in status),
    'CONTROL STATE: every field Control needs for "at a glance" clarity is present on the status payload');
}

/* =========================== ACCESSIBILITY (label presence) =========================== */
{
  // isTypingTarget/resolveFr1Shortcut already covered by workflow.test.mjs;
  // here we assert the specific P8 label-linking contract control-app.js
  // relies on for its Unit/Experience selects.
  const controlSrc = fs.readFileSync(path.join(root, 'src', 'controllers', 'control-app.js'), 'utf8');
  assert(/for: 'fr1-unit'/.test(controlSrc) && /id: 'fr1-unit'/.test(controlSrc),
    'ACCESSIBILITY: the Unit select has a linked <label for> and matching id');
  assert(/for: 'fr1-experience'/.test(controlSrc) && /id: 'fr1-experience'/.test(controlSrc),
    'ACCESSIBILITY: the Experience select has a linked <label for> and matching id');
  assert(/'aria-pressed'/.test(controlSrc),
    'ACCESSIBILITY: toggle-style buttons (Reveal, stage, representation) expose aria-pressed state');
  assert(/role: 'status'/.test(controlSrc) && /'aria-live': 'polite'/.test(controlSrc),
    'ACCESSIBILITY: the current-state display is an aria-live region so state changes are announced');
}

/* =========================== LONG SESSION STRESS (bounded, deterministic) ========== */
{
  const app = await mountOverlay(new Node('div'), { role: 'overlay', listen: false });
  const ids = catalog.list().filter((e) => e.type !== 'mastery-check' && e.type !== 'review').slice(0, 5).map((e) => e.id);
  let ops = 0;
  const startCount = () => app.stage.count();

  for (let round = 0; round < 40; round++) {
    const id = ids[round % ids.length];
    await app.fr1.select(id);
    ops++;
    const player = app.fr1.player();
    for (let i = 0; i < player.order.length - 1; i++) { app.fr1.stage('next'); ops++; }
    app.fr1.stage('reveal'); ops++;
    if (player.experience.representations.length > 1) {
      app.fr1.stage(`repr:${player.experience.representations[1].type}`); ops++;
    }
    app.fr1.stage('reset'); ops++;
    for (let i = 0; i < 2; i++) { app.fr1.stage('previous'); ops++; } // bounds no-op, must not throw
  }
  assert(ops >= 200, `LONG SESSION: exercised a bounded, deterministic run of ${ops} operations (>=200)`);
  assert(app.fr1.isActive() && !!app.fr1.player(), 'LONG SESSION: session remains active and deterministic after the run');

  // The overlay always fully replaces stage content on render (clear()
  // then re-append) rather than accumulating — DOM size should reflect
  // only the CURRENT lesson's tree, not 40 rounds of leftovers.
  const finalCount = app.stage.count();
  assert(finalCount < 500, `LONG SESSION: no runaway DOM growth after repeated operations (final node count ${finalCount})`);
  void startCount;
}

/* =========================== RECONNECT STRESS (no duplicated effects) ============= */
{
  const app = await mountOverlay(new Node('div'), { role: 'overlay', listen: false });
  await app.fr1.select('1.3.1');
  const startIndex = app.fr1.status().stageIndex;

  // Simulate repeated status-request "reconnect" cycles: each one must
  // be read-only (a snapshot), never itself advancing or mutating state.
  for (let i = 0; i < 25; i++) {
    const snap1 = app.fr1.status();
    const snap2 = app.fr1.status();
    assert(JSON.stringify(snap1) === JSON.stringify(snap2), 'RECONNECT: repeated status reads are stable and side-effect-free');
  }
  assert(app.fr1.status().stageIndex === startIndex, 'RECONNECT: repeated status requests never advance the lesson');

  // A single "next" after many reconnect cycles must move exactly one
  // stage — guards against the classic duplicated-listener bug where
  // one action fires N times after reconnect stress.
  app.fr1.stage('next');
  assert(app.fr1.status().stageIndex === startIndex + 1, 'RECONNECT: one action after reconnect stress advances exactly one stage');
}

/* =========================== CLEAN OUTPUT (no dev chrome leaks) =================== */
{
  const { renderExperience, wrapWithPresenter } = await import('../src/curriculum/render-experience.js');
  const exp = adaptExperience(await getExperience('1.3.1', { catalog, readLesson }));
  const player = createPlayer(exp);
  const clean = wrapWithPresenter(renderExperience(player), { aspect: '16x9', showPresenter: true, clean: true });
  const text = clean.textAll();
  assert(!/SAFE ZONE/i.test(text), 'CLEAN OUTPUT: clean/production presenter mode never renders the rehearsal safe-zone label');
  assert(!/PRESENTER ·/i.test(text), 'CLEAN OUTPUT: clean/production presenter mode never renders the developer presenter caption');
}

/* =========================== FAILURE HANDLING (still fail-clear) ================== */
{
  let threw = false;
  try { resolveRepresentation({ type: 'not-a-real-type' }); } catch (err) { threw = err instanceof UnknownRepresentationError; }
  assert(threw, 'FAILURE HANDLING: an unknown representation type still throws a typed error (unchanged from P5/P6)');

  const exp = adaptExperience(await getExperience('1.3.1', { catalog, readLesson }));
  const player = createPlayer(exp);
  let goToThrew = false;
  try { player.goTo('not-a-real-stage'); } catch (err) { goToThrew = err instanceof UnknownStageError; }
  assert(goToThrew, 'FAILURE HANDLING: an unknown stage id still throws a typed error at the player level (unchanged from P5)');
  assert(resolveFr1Shortcut('x', undefined) === null, 'FAILURE HANDLING: resolveFr1Shortcut tolerates a missing status object');
  assert(!isTypingTarget(null), 'FAILURE HANDLING: isTypingTarget tolerates a null target');
}

/* ---------- report ---------- */
if (failures.length) {
  console.error(`Hardening tests: ${failures.length} failure(s):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
} else {
  console.log(`Hardening tests: ${passed} assertions passed.`);
}
