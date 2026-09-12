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

const LAYER_NAMES = ['brand', 'presenter', 'story', 'math', 'discovery', 'comparison', 'takeaways'];
const ASPECTS = [['16x9', '16:9'], ['9x16', '9:16'], ['1x1', '1:1']];
const BACKGROUNDS = [['studio', 'Studio'], ['paper', 'Paper'], ['transparent', 'Transparent']];

export async function mountControl(root) {
  const store = createStore(snapshot.load() || {});
  const bus = createBus({ role: 'control' });
  let lesson = await loadLesson(store.get().lessonId).catch(() => null);
  let popped = [];

  /* ---------- P5: Foundation Release 1 (schema-v1) selector ---------- */
  let fr1Catalog = null;
  let fr1Unit = null;
  let fr1Id = null;
  let fr1Active = false;
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

  /* P5: Foundation Release 1 messages travel over the SAME bus as every
     other control->overlay message (no second transport). See
     docs/lesson-authoring/RUNTIME_INTEGRATION.md "OBS usage". */
  function sendFr1Select() {
    if (!fr1Id) return;
    fr1Active = true;
    bus.send('fr1-select', { id: fr1Id });
    render();
  }
  function sendFr1Stage(action) { bus.send('fr1-stage', { action }); }
  function sendFr1Exit() { fr1Active = false; bus.send('fr1-exit', {}); render(); }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 1800);
  }

  /* ---------- render ---------- */
  function render() {
    const s = store.get();
    clear(controls);

    controls.appendChild(el('div', {},
      el('h1', { class: 'cp__title' }, 'Lesson control'),
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

    /* --- P5: Foundation Release 1 (schema-v1 production corpus) --- */
    if (fr1Catalog) {
      controls.appendChild(el('section', { class: 'cp__panel' },
        el('h2', { class: 'cp__legend' }, 'Foundation Release 1 (schema v1)'),
        el('div', { class: 'field' },
          el('label', {}, 'Unit'),
          el('select', {
            onchange: (e) => { fr1Unit = e.target.value; fr1Id = fr1Catalog.listByUnit(fr1Unit)[0].id; render(); },
          }, fr1Catalog.listUnits().map((u) => el('option', { value: u, selected: u === fr1Unit }, u))),
        ),
        el('div', { class: 'field' },
          el('label', {}, 'Experience'),
          el('select', {
            onchange: (e) => { fr1Id = e.target.value; },
          }, fr1Catalog.listByUnit(fr1Unit).map((entry) => el('option', { value: entry.id, selected: entry.id === fr1Id },
            `${entry.id} — ${entry.title} (${entry.type})`))),
        ),
        el('div', { class: 'row' },
          el('button', { class: 'btn btn--primary', onclick: () => sendFr1Select() }, 'Load into overlay'),
          el('button', { class: 'btn', onclick: () => sendFr1Exit() }, 'Return to legacy lesson'),
        ),
        fr1Active ? el('div', { class: 'row', style: { marginTop: 'var(--s-2)' } },
          el('button', { class: 'btn', onclick: () => sendFr1Stage('previous') }, '← Stage'),
          el('button', { class: 'btn', onclick: () => sendFr1Stage('next') }, 'Stage →'),
          el('button', { class: 'btn', onclick: () => sendFr1Stage('reset') }, 'Reset'),
          el('button', { class: 'btn', onclick: () => sendFr1Stage('reveal') }, 'Reveal / hide'),
        ) : null,
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

  bus.on((msg) => { if (msg.type === 'hello' && msg.from !== 'control') push(); });
  window.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
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
