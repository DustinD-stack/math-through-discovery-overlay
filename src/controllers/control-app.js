/* ============================================================
   Live control panel
   Sends the whole view state to every connected overlay on
   each change. Overlays are stateless receivers, so a browser
   source can be reloaded mid-lesson and catch straight up.
   ============================================================ */

import { el, clear } from '../utils/dom.js';
import { createStore, stateToURL, clampStep, DEFAULT_STATE } from '../app/state.js';
import { createBus, snapshot } from '../app/bus.js';
import { loadLesson, lessonIndex, STEP_KEYS } from '../utils/lesson-loader.js';
import { PRESETS, PRESET_KEYS } from '../layouts/presets.js';
import { DIAGRAM_NAMES } from '../modules/diagrams.js';
import { STEP_META } from '../components/discovery.js';
import { buildCatalog } from '../curriculum/catalog.js';
import { labelForRepresentation, labelForStage, titleForUnit } from '../curriculum/labels.js';
import { resolveFr1Shortcut, isTypingTarget } from '../curriculum/shortcuts.js';
import { resolveConnectionStatus, connectionStatusLabel } from '../curriculum/connection-status.js';
import { preserveViewport } from '../utils/viewport-preserve.js';

const LAYER_NAMES = ['brand', 'presenter', 'story', 'math', 'discovery', 'comparison', 'takeaways'];
const ASPECTS = [['16x9', '16:9'], ['9x16', '9:16'], ['1x1', '1:1']];
const BACKGROUNDS = [['studio', 'Studio'], ['paper', 'Paper'], ['transparent', 'Transparent']];

export async function mountControl(root) {
  const store = createStore(snapshot.load() || {});
  const bus = createBus({ role: 'control' });
  let lesson = await loadLesson(store.get().lessonId).catch(() => null);
  let popped = [];

  /* ---------- P5/P7: Foundation Release 1 (schema-v1) selector ---------- */
  let fr1Catalog = null;
  let fr1Unit = null;
  let fr1Id = null;
  /* `fr1Status` is the overlay's own last-broadcast snapshot (see
     src/app/overlay-app.js `broadcastFr1Status`) — control never
     guesses overlay state from its own local variables, precisely to
     close the "control and overlay could disagree" gap the P7
     workflow audit identified (docs/TEACHING_WORKFLOW.md). */
  let fr1Status = { active: false };
  /* P8: operator-facing connection status. `lastPeerSeenAt` is the
     timestamp of the last message actually received from a non-control
     peer (an overlay tab) — a periodic `ping` (already understood by
     the overlay, see src/app/overlay-app.js) keeps this fresh even
     between lesson actions. See src/curriculum/connection-status.js. */
  let serverConnected = bus.wsConnected;
  let lastPeerSeenAt = 0;
  /* Post-V1 fix: a persistent, standalone connection-status node,
     mutated in place. The periodic connectivity check below used to
     call the full, destructive `render()` (clear+rebuild of the entire
     controls column) purely to refresh this one-line status label —
     meaning the whole panel, including any currently-open native
     <select> dropdown (Unit/Experience), whose underlying DOM node
     would be destroyed out from under it and forced closed by the
     browser, was torn down every 3 seconds regardless of what the
     operator was doing. `updateConnectionBadge` never touches anything
     else on the page. */
  const connectionBadge = el('div', { role: 'status', 'aria-live': 'polite' });
  function updateConnectionBadge() {
    const status = resolveConnectionStatus({ serverConnected, lastPeerSeenAt });
    connectionBadge.className = `conn-badge conn-badge--${status}`;
    connectionBadge.textContent = connectionStatusLabel(status);
  }
  updateConnectionBadge();
  bus.onConnection((ok) => { serverConnected = ok; updateConnectionBadge(); });
  setInterval(() => { bus.send('ping', {}); updateConnectionBadge(); }, 3000);
  try {
    const res = await fetch('lessons/foundation-release-1/manifest.json');
    if (res.ok) {
      fr1Catalog = buildCatalog(await res.json());
      fr1Unit = fr1Catalog.listUnits()[0];
      fr1Id = fr1Catalog.listByUnit(fr1Unit)[0].id;
    }
  } catch (_) { fr1Catalog = null; } // control panel still works with legacy-only if this fails

  const controls = el('div', { class: 'cp__col' });
  const previewCol = el('div', { class: 'cp__col' });
  clear(root).appendChild(el('div', { class: 'cp' }, controls, previewCol));

  const iframe = el('iframe', { class: 'preview__frame', title: 'Overlay preview', src: 'overlay.html' });
  const urlCode = el('code', {});
  const toast = el('div', { class: 'toast' });
  document.body.appendChild(toast);

  iframe.addEventListener('load', () => {
    bus.addTarget(iframe.contentWindow);
    push();
  });

  previewCol.appendChild(el('div', { class: 'preview' },
    el('div', { class: 'preview__bar' },
      el('span', { class: 'preview__label' }, 'Live preview'),
      el('div', { class: 'row' },
        el('button', { class: 'btn', onclick: openOverlay }, 'Open overlay window'),
        el('button', { class: 'btn', onclick: () => bus.send('reload', {}) }, 'Reload overlays'),
      ),
    ),
    iframe,
    el('div', { class: 'urlbar' },
      el('span', { class: 'preview__label' }, 'OBS URL'),
      urlCode,
      el('button', { class: 'btn', onclick: copyURL }, 'Copy'),
    ),
  ));

  /* ---------- helpers ---------- */
  function push() {
    const state = store.get();
    snapshot.save(state);
    bus.send('state', state);
    bus.addTarget(iframe.contentWindow);
    popped = popped.filter((w) => w && !w.closed);
    popped.forEach((w) => bus.addTarget(w));
    urlCode.textContent = absoluteURL(stateToURL(state));
    iframe.className = `preview__frame a${state.aspect}`;
  }

  function set(patch) { store.set(patch); render(); push(); }

  async function setLesson(id) {
    lesson = await loadLesson(id).catch((e) => { showToast(e.message); return lesson; });
    store.set({ lessonId: id, overrides: {} });
    render(); push();
  }

  function openOverlay() {
    const w = window.open(stateToURL(store.get()), `mtd-overlay-${Date.now()}`, 'width=1280,height=760');
    if (w) { popped.push(w); setTimeout(push, 800); }
  }

  async function copyURL() {
    const url = absoluteURL(stateToURL(store.get()));
    try { await navigator.clipboard.writeText(url); showToast('URL copied'); }
    catch (_) { window.prompt('Copy this URL into OBS:', url); }
  }

  /* P5/P7: Foundation Release 1 messages travel over the SAME bus as
     every other control->overlay message (no second transport). See
     docs/lesson-authoring/RUNTIME_INTEGRATION.md "OBS usage". */
  function sendFr1Select() {
    if (!fr1Id) return;
    bus.send('fr1-select', { id: fr1Id });
  }
  function sendFr1Stage(action) { bus.send('fr1-stage', { action }); }
  function sendFr1Exit() {
    // P8: the one control in this panel that is both high-disruption
    // (fully discards the current teaching position) and easy to hit by
    // accident right next to Start Lesson — everything else the P8
    // accidental-action audit reviewed (Reset, presenter, aspect) is a
    // normal, reversible, already-secondary-styled part of the
    // documented workflow and stays confirmation-free.
    if (!fr1Status.active) { bus.send('fr1-exit', {}); return; }
    if (window.confirm('Exit Foundation Release 1 mode? This leaves the current lesson position.')) {
      bus.send('fr1-exit', {});
    }
  }

  /* ---------- P7: current-state display ----------
     Never inferred from button color alone (docs/TEACHING_WORKFLOW.md
     "Current state display") — always the overlay's own reported
     status. (The connection badge itself is the persistent
     `connectionBadge` node declared above, not rendered here.) */
  function renderFr1State() {
    if (!fr1Status.active) {
      return el('div', { class: 'fr1-state fr1-state--empty', role: 'status', 'aria-live': 'polite' }, 'Not currently teaching a Foundation Release 1 lesson.');
    }
    const stageLine = fr1Status.kind === 'teaching'
      ? el('div', { class: 'fr1-state__meta' },
        el('span', { class: 'fr1-state__stage' }, labelForStage(fr1Status.stageId)),
        el('span', { class: 'fr1-state__progress' }, `${fr1Status.stageIndex + 1} of ${fr1Status.stageCount}`),
        fr1Status.sessionStatus === 'complete' ? el('span', { class: 'fr1-state__complete' }, '✓ Complete') : null,
        fr1Status.revealed ? el('span', { class: 'fr1-state__complete' }, 'Revealed') : null)
      : fr1Status.kind === 'mastery-check'
        ? el('div', { class: 'fr1-state__meta' },
          el('span', { class: 'fr1-state__stage' }, 'TASK'),
          el('span', { class: 'fr1-state__progress' }, `${fr1Status.taskIndex + 1} of ${fr1Status.taskCount}`))
        : el('div', { class: 'fr1-state__meta' },
          el('span', { class: 'fr1-state__stage' }, 'REVIEW'),
          fr1Status.revealed ? el('span', { class: 'fr1-state__complete' }, 'Retrieves shown') : null);
    return el('div', { class: 'fr1-state', role: 'status', 'aria-live': 'polite' },
      el('div', { class: 'fr1-state__unit' }, `Unit ${fr1Status.unitId} · ${titleForUnit(fr1Status.unitId)}`),
      el('div', { class: 'fr1-state__id' }, `${fr1Status.id} · ${fr1Status.type}`),
      el('div', { class: 'fr1-state__title' }, fr1Status.title),
      stageLine,
    );
  }

  function renderFr1TeachingControls() {
    const order = fr1Status.order || [];
    return el('div', {},
      el('div', { class: 'fr1-primary' },
        el('button', { class: 'btn btn--xl', disabled: fr1Status.atStart, onclick: () => sendFr1Stage('previous') }, '← Previous'),
        el('button', { class: 'btn btn--xl btn--primary', disabled: fr1Status.atEnd, onclick: () => sendFr1Stage('next') }, 'Next →'),
      ),
      el('div', { class: 'fr1-reveal-reset' },
        el('button', {
          class: `btn btn--xl${fr1Status.revealed ? ' is-on' : ''}`,
          'aria-pressed': fr1Status.revealed ? 'true' : 'false',
          onclick: () => sendFr1Stage('reveal'),
        }, fr1Status.revealed ? 'Hide' : 'Reveal'),
        el('button', { class: 'btn btn--xl', onclick: () => sendFr1Stage('reset') }, 'Reset'),
      ),
      el('div', { class: 'fr1-stage-row' },
        order.map((stageId) => el('button', {
          class: `btn${fr1Status.stageId === stageId ? ' is-on' : ''}`,
          'aria-pressed': fr1Status.stageId === stageId ? 'true' : 'false',
          onclick: () => sendFr1Stage(`goto:${stageId}`),
        }, labelForStage(stageId).toUpperCase())),
      ),
      (fr1Status.representations && fr1Status.representations.length > 1)
        ? el('div', { class: 'fr1-repr-row' },
          fr1Status.representations.map((type) => el('button', {
            class: `btn${fr1Status.activeRepresentation === type ? ' is-on' : ''}`,
            'aria-pressed': fr1Status.activeRepresentation === type ? 'true' : 'false',
            onclick: () => sendFr1Stage(`repr:${type}`),
          }, labelForRepresentation(type))))
        : null,
    );
  }

  function renderFr1MasteryControls() {
    return el('div', {},
      el('div', { class: 'fr1-primary' },
        el('button', { class: 'btn btn--xl', disabled: fr1Status.atStart, onclick: () => sendFr1Stage('previous') }, '← Previous task'),
        el('button', { class: 'btn btn--xl btn--primary', disabled: fr1Status.atEnd, onclick: () => sendFr1Stage('next') }, 'Next task →'),
      ),
      el('div', { class: 'row' }, el('button', { class: 'btn', onclick: () => sendFr1Stage('reset') }, 'Reset assessment')),
    );
  }

  function renderFr1ReviewControls() {
    return el('div', { class: 'row', style: { marginBottom: 'var(--s-3)' } },
      el('button', {
        class: `btn btn--xl${fr1Status.revealed ? ' is-on' : ''}`,
        'aria-pressed': fr1Status.revealed ? 'true' : 'false',
        onclick: () => sendFr1Stage('reveal'),
      }, fr1Status.revealed ? 'Hide retrieves' : 'Reveal retrieves'),
    );
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 1800);
  }

  /* ---------- render ----------
     `render()` fully clears and rebuilds `controls` on every call
     (`renderInner`), which destroys and recreates whatever the operator
     had focused. Wrapping it in `preserveViewport` stops that rebuild
     from silently moving `document.body`'s scroll position — see
     src/utils/viewport-preserve.js for the full root-cause writeup and
     why `document.body` (not `window`) is the real scroll container on
     this page. */
  function render() {
    preserveViewport(document.body, renderInner);
  }

  function renderInner() {
    const s = store.get();
    clear(controls);

    controls.appendChild(el('div', {},
      el('div', { class: 'cp__head-row' },
        el('h1', { class: 'cp__title' }, 'Lesson control'),
        connectionBadge,
      ),
      el('p', { class: 'cp__sub' }, 'Changes appear on every open overlay the moment you tap.'),
    ));

    /* --- lesson --- */
    controls.appendChild(el('section', { class: 'cp__panel' },
      el('h2', { class: 'cp__legend' }, 'Lesson'),
      el('div', { class: 'field' },
        el('label', { for: 'cp-lesson' }, 'Choose lesson'),
        el('select', { id: 'cp-lesson', onchange: (e) => setLesson(e.target.value) },
          lessonIndex().map((L) => el('option', { value: L.id, selected: L.id === s.lessonId },
            `${L.topic}${L.episode ? ` · Ep ${L.episode}` : ''}`)),
        ),
      ),
      el('div', { class: 'row' },
        el('button', { class: 'btn', onclick: () => { store.set({ overrides: {} }); render(); push(); } }, 'Undo live edits'),
        el('button', { class: 'btn btn--danger', onclick: () => { store.replace({ ...DEFAULT_STATE, lessonId: s.lessonId }); render(); push(); } }, 'Reset lesson'),
      ),
    ));

    /* --- transport --- */
    controls.appendChild(el('section', { class: 'cp__panel' },
      el('h2', { class: 'cp__legend' }, 'Discovery path'),
      el('div', { class: 'grid grid--2', style: { marginBottom: 'var(--s-2)' } },
        el('button', { class: 'btn btn--xl', onclick: () => set({ step: clampStep(s.step - 1) }) }, '\u2190 Back'),
        el('button', { class: 'btn btn--xl btn--primary', onclick: () => set({ step: clampStep(s.step + 1) }) }, 'Next step \u2192'),
      ),
      el('div', { class: 'grid grid--3' },
        STEP_KEYS.map((k) => {
          const meta = STEP_META[k];
          return el('button', {
            class: `btn btn-step ${meta.cls}${s.step === meta.n ? ' is-on' : ''}`,
            onclick: () => set({ step: meta.n }),
          }, el('span', { class: 'dot' }), meta.label.toUpperCase());
        }),
        el('button', { class: `btn${s.step === 0 ? ' is-on' : ''}`, onclick: () => set({ step: 0 }) }, 'Hide all'),
      ),
      el('div', { class: 'grid grid--2', style: { marginTop: 'var(--s-2)' } },
        el('button', { class: `btn${s.revealAnswer ? ' is-on' : ''}`, onclick: () => set({ revealAnswer: !s.revealAnswer }) },
          s.revealAnswer ? 'Answer showing' : 'Answer hidden'),
        el('button', { class: 'btn', onclick: () => set({ step: 5, revealAnswer: true }) }, 'Show everything'),
      ),
    ));

    /* --- layout --- */
    controls.appendChild(el('section', { class: 'cp__panel' },
      el('h2', { class: 'cp__legend' }, 'Layout'),
      el('div', { class: 'grid grid--2' },
        PRESET_KEYS.map((k) => el('button', {
          class: `btn${s.preset === k ? ' is-on' : ''}`,
          onclick: () => set({ preset: k }),
        }, `${k} · ${PRESETS[k].name}`)),
      ),
      el('div', { class: 'grid grid--3', style: { marginTop: 'var(--s-3)' } },
        ASPECTS.map(([v, label]) => el('button', {
          class: `btn${s.aspect === v ? ' is-on' : ''}`, onclick: () => set({ aspect: v }),
        }, label)),
      ),
      el('div', { class: 'grid grid--3', style: { marginTop: 'var(--s-2)' } },
        BACKGROUNDS.map(([v, label]) => el('button', {
          class: `btn${s.background === v ? ' is-on' : ''}`, onclick: () => set({ background: v }),
        }, label)),
      ),
      el('div', { class: 'grid grid--2', style: { marginTop: 'var(--s-2)' } },
        el('button', { class: `btn${s.animations ? ' is-on' : ''}`, onclick: () => set({ animations: !s.animations }) },
          s.animations ? 'Motion on' : 'Motion off'),
        el('div', { class: 'field', style: { margin: 0 } },
          el('select', { onchange: (e) => set({ diagram: e.target.value }) },
            el('option', { value: 'auto', selected: s.diagram === 'auto' }, 'Diagram: from lesson'),
            DIAGRAM_NAMES.map((n) => el('option', { value: n, selected: s.diagram === n }, `Diagram: ${n}`)),
          ),
        ),
      ),
    ));

    /* --- P5/P7: Foundation Release 1 (schema-v1 production corpus) ---
       Teaching controls first and biggest; lesson selection is
       secondary chrome underneath (docs/TEACHING_WORKFLOW.md "Control
       hierarchy"). Presenter/aspect/background live in the existing
       Layout panel below and already apply to Foundation Release 1
       mode — no duplicate controls were added for those. */
    if (fr1Catalog) {
      controls.appendChild(el('section', { class: 'cp__panel' },
        el('h2', { class: 'cp__legend' }, 'Foundation Release 1 — Teaching'),
        renderFr1State(),
        fr1Status.active && fr1Status.kind === 'teaching' ? renderFr1TeachingControls() : null,
        fr1Status.active && fr1Status.kind === 'mastery-check' ? renderFr1MasteryControls() : null,
        fr1Status.active && fr1Status.kind === 'review' ? renderFr1ReviewControls() : null,
        el('div', { class: 'fr1-secondary' },
          el('h3', { class: 'cp__legend' }, 'Change lesson'),
          el('div', { class: 'field' },
            el('label', { for: 'fr1-unit' }, 'Unit'),
            el('select', {
              id: 'fr1-unit',
              onchange: (e) => { fr1Unit = e.target.value; fr1Id = fr1Catalog.listByUnit(fr1Unit)[0].id; render(); },
            }, fr1Catalog.listUnits().map((u) => el('option', { value: u, selected: u === fr1Unit }, `${u} · ${titleForUnit(u)}`))),
          ),
          el('div', { class: 'field' },
            el('label', { for: 'fr1-experience' }, 'Experience'),
            el('select', {
              id: 'fr1-experience',
              onchange: (e) => { fr1Id = e.target.value; },
            }, fr1Catalog.listByUnit(fr1Unit).map((entry) => el('option', { value: entry.id, selected: entry.id === fr1Id },
              `${entry.id} — ${entry.title} (${entry.type})`))),
          ),
          el('div', { class: 'row' },
            el('button', { class: 'btn btn--primary', onclick: () => sendFr1Select() }, '▶ Start Lesson'),
            fr1Status.active ? el('button', { class: 'btn', onclick: () => sendFr1Exit() }, 'Exit Foundation Mode') : null,
          ),
          el('p', { class: 'hint', style: { marginTop: 'var(--s-2)' } },
            'Shortcuts while teaching: → / space next · ← previous · R reveal · Home reset · 1–5 jump to SEE…CHECK'
            + (fr1Status.order && fr1Status.order[0] === 'setup' ? ' · 0 Setup' : '') + '.'),
        ),
      ));
    }

    /* --- layers --- */
    controls.appendChild(el('section', { class: 'cp__panel' },
      el('h2', { class: 'cp__legend' }, 'Layers'),
      el('div', { class: 'grid grid--2' },
        LAYER_NAMES.map((n) => el('button', {
          class: `btn${s.layers[n] ? ' is-on' : ''}`,
          onclick: () => set({ layers: { [n]: !s.layers[n] } }),
        }, capitalize(n))),
      ),
    ));

    /* --- live edits --- */
    if (lesson) controls.appendChild(buildEditor(s, lesson, set, store));
  }

  render();
  push();
  if (fr1Catalog) bus.send('fr1-status-request', {});

  bus.on((msg) => {
    // P8: any message actually received from a non-control peer proves
    // an overlay is alive and reachable right now — this is what powers
    // the "Overlay Connected" badge (src/curriculum/connection-status.js),
    // deliberately reusing this existing bus rather than a second
    // heartbeat system.
    if (msg.from !== 'control') lastPeerSeenAt = Date.now();

    if (msg.type === 'hello' && msg.from !== 'control') { push(); if (fr1Catalog) bus.send('fr1-status-request', {}); }
    // P7: the overlay is the single source of truth for Foundation
    // Release 1 state — control only ever displays what it reports,
    // never a locally-guessed value (docs/TEACHING_WORKFLOW.md
    // "Control/overlay sync").
    else if (msg.type === 'fr1-status') { fr1Status = msg.payload; render(); }
    // P8: an operator-safe notice for a load/action failure that left
    // the previous valid session untouched (docs/PRODUCTION_GUIDE.md
    // "Load failure"). Never a stack trace — overlay-app.js only ever
    // sends a short, plain-language message here.
    else if (msg.type === 'fr1-error') { showToast(msg.payload.message); }
  });

  window.addEventListener('keydown', (e) => {
    if (isTypingTarget(e.target)) return;

    // P7 recording-friendly shortcuts. `resolveFr1Shortcut` is pure and
    // unit-tested (tools/workflow.test.mjs); dispatch uses the exact
    // same sendFr1Stage() a button press uses — never a separate
    // shortcut-only code path, per the architecture guard.
    if (fr1Status.active) {
      const action = resolveFr1Shortcut(e.key, fr1Status);
      if (action) { e.preventDefault(); sendFr1Stage(action); }
      // Escape is intentionally unmapped — it must never exit
      // Foundation Release 1 mode or discard lesson state.
      return;
    }

    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); set({ step: clampStep(store.get().step + 1) }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); set({ step: clampStep(store.get().step - 1) }); }
    if (e.key === '0') set({ step: 0 });
    if (/^[1-5]$/.test(e.key)) set({ step: Number(e.key) });
    if (e.key.toLowerCase() === 'a') set({ revealAnswer: !store.get().revealAnswer });
  });

  return { store, bus };
}

/* ------------------------------------------------------------
   Live text editing. Every field writes a dot-path override,
   so the lesson JSON on disk is never modified.
   ------------------------------------------------------------ */
function buildEditor(s, lesson, set, store) {
  const val = (path, fallback) => {
    const o = store.get().overrides;
    return o[path] !== undefined ? o[path] : fallback;
  };
  const edit = (path) => (e) => set({ overrides: { [path]: e.target.value } });

  const text = (label, path, current, multiline = false) => el('div', { class: 'field' },
    el('label', {}, label),
    multiline
      ? el('textarea', { oninput: edit(path) }, val(path, current) || '')
      : el('input', { type: 'text', value: val(path, current) || '', oninput: edit(path) }),
  );

  return el('section', { class: 'cp__panel' },
    el('h2', { class: 'cp__legend' }, 'Live edits'),
    text('Topic', 'topic', lesson.topic),
    text('Board title', 'title', lesson.title),
    text('Subtitle / sticky note', 'headline', lesson.headline),
    text('Quote', 'quote', lesson.quote, true),
    text('Question', 'question', lesson.question, true),

    el('details', { class: 'cp__group' },
      el('summary', {}, 'Scenario numbers'),
      lesson.facts.map((f, i) => el('div', { class: 'field field--inline' },
        el('input', { type: 'text', value: val(`facts.${i}.label`, f.label), oninput: edit(`facts.${i}.label`) }),
        el('input', { type: 'text', value: val(`facts.${i}.value`, f.value), oninput: edit(`facts.${i}.value`) }),
      )),
      lesson.answer && el('div', { class: 'field field--inline' },
        el('input', { type: 'text', value: val('answer.work', lesson.answer.work || ''), oninput: edit('answer.work') }),
        el('input', { type: 'text', value: val('answer.value', lesson.answer.value || ''), oninput: edit('answer.value') }),
      ),
    ),

    el('details', { class: 'cp__group' },
      el('summary', {}, 'The five steps'),
      STEP_KEYS.map((k) => el('div', {},
        el('div', { class: `step__label ${STEP_META[k].cls}`, style: { margin: '.6rem 0 .3rem' } }, STEP_META[k].label),
        el('div', { class: 'field' },
          el('input', { type: 'text', value: val(`steps.${k}.text`, lesson.steps[k].text || ''), oninput: edit(`steps.${k}.text`), placeholder: 'Explanation' }),
        ),
        el('div', { class: 'field' },
          el('input', { type: 'text', value: val(`steps.${k}.equation`, lesson.steps[k].equation || ''), oninput: edit(`steps.${k}.equation`), placeholder: 'Math (e.g. 1200 / 160)' }),
        ),
      )),
    ),

    lesson.comparison && el('details', { class: 'cp__group' },
      el('summary', {}, 'Comparison'),
      text('What they think', 'comparison.think', lesson.comparison.think, true),
      text('What the math says', 'comparison.math', lesson.comparison.math, true),
    ),

    el('details', { class: 'cp__group' },
      el('summary', {}, 'Takeaways'),
      lesson.takeaways.map((t, i) => el('div', { class: 'field' },
        el('input', {
          type: 'text',
          value: val(`takeaways.${i}`, typeof t === 'string' ? t : t.text),
          oninput: edit(`takeaways.${i}`),
        }),
      )),
    ),
  );
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const absoluteURL = (rel) => new URL(rel, window.location.href).href;
