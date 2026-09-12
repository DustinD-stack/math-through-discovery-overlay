/* ============================================================
   Overlay application
   Renders one stage and keeps it in sync with the control panel.
   ============================================================ */

import { el, clear } from '../utils/dom.js';
import { installFallbackStyles } from '../utils/math-render.js';
import { loadLesson, normalize } from '../utils/lesson-loader.js';
import { createStore, stateFromURL, clampStep } from './state.js';
import { createBus, snapshot } from './bus.js';
import { buildStageContent, PRESETS, usesPresenter } from '../layouts/presets.js';
import { buildCatalog, getExperience, makeFetchReader } from '../curriculum/catalog.js';
import { adaptExperience } from '../curriculum/adapter.js';
import { createPlayer, UnknownStageError } from '../curriculum/player.js';
import { renderExperience } from '../curriculum/render-experience.js';

const SIZES = { '16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080] };

export async function mountOverlay(root, { role = 'overlay', listen = true, initial = {} } = {}) {
  installFallbackStyles();

  const fromUrl = stateFromURL();
  const saved = (listen && !Object.keys(fromUrl).length) ? snapshot.load() : null;
  const store = createStore({ ...(saved || {}), ...initial, ...fromUrl });

  const wrap = el('div', { class: 'stage-wrap' });
  const stage = el('div', { class: 'stage' });
  const bgLayer = el('div', { class: 'layer layer-bg' });
  stage.appendChild(bgLayer);
  wrap.appendChild(stage);
  clear(root).appendChild(wrap);

  let lesson = null;
  let lessonId = null;

  /* ---------- P5: Foundation Release 1 (schema-v1) mode ----------
     A parallel, ephemeral runtime path — see docs/lesson-authoring/
     RUNTIME_INTEGRATION.md. Entirely additive: when inactive, the
     overlay behaves exactly as before. State here is intentionally
     NOT part of `store` (state.js) — it is presenter-driven runtime
     UI state, not persisted view state, per P5's scope boundary. */
  let fr1Catalog = null;
  let fr1Player = null;
  let fr1Active = false;

  async function ensureFr1Catalog() {
    if (fr1Catalog) return fr1Catalog;
    const res = await fetch('lessons/foundation-release-1/manifest.json');
    fr1Catalog = buildCatalog(await res.json());
    return fr1Catalog;
  }

  async function fr1Select(id) {
    const catalog = await ensureFr1Catalog();
    const raw = await getExperience(id, { catalog, readLesson: makeFetchReader() });
    fr1Player = createPlayer(adaptExperience(raw));
    fr1Active = true;
    renderFr1();
  }

  function fr1Stage(action) {
    if (!fr1Active || !fr1Player) return;
    try {
      if (fr1Player.kind === 'teaching') {
        if (action === 'next') fr1Player.next();
        else if (action === 'previous') fr1Player.previous();
        else if (action === 'reset') fr1Player.reset();
        else if (action === 'reveal') (fr1Player.isRevealed() ? fr1Player.hideAnswer() : fr1Player.revealAnswer());
        else if (action && action.startsWith('goto:')) fr1Player.goTo(action.slice(5));
      } else if (fr1Player.kind === 'mastery-check') {
        if (action === 'next') fr1Player.next();
        else if (action === 'previous') fr1Player.previous();
        else if (action === 'reset') fr1Player.reset();
      } else if (fr1Player.kind === 'review') {
        if (action === 'reveal') (fr1Player.isRevealed() ? fr1Player.reset() : fr1Player.revealRetrieves());
      }
    } catch (err) {
      if (!(err instanceof UnknownStageError)) throw err;
      renderError(stage, bgLayer, err.message);
      return;
    }
    renderFr1();
  }

  function fr1Exit() {
    fr1Active = false;
    fr1Player = null;
    render();
  }

  function renderFr1() {
    const state = store.get();
    document.body.classList.toggle('transparent', state.background === 'transparent');
    document.body.classList.toggle('no-anim', !state.animations);
    stage.className = ['stage', `a${state.aspect}`, `bg-${state.background}`, 'fr1-mode'].join(' ');
    clear(stage);
    stage.appendChild(bgLayer);
    stage.appendChild(renderExperience(fr1Player));
    fit();
  }

  async function ensureLesson(state) {
    if (state.lessonId !== lessonId) {
      lesson = await loadLesson(state.lessonId);
      lessonId = state.lessonId;
    }
    return applyOverrides(lesson, state.overrides);
  }

  async function render() {
    if (fr1Active && fr1Player) { renderFr1(); return; }
    const state = store.get();
    let view;
    try {
      view = await ensureLesson(state);
    } catch (err) {
      renderError(stage, bgLayer, err.message);
      return;
    }

    document.body.classList.toggle('transparent', state.background === 'transparent');
    document.body.classList.toggle('no-anim', !state.animations);

    const cfg = PRESETS[state.preset] || PRESETS.A;
    const hasPresenter = usesPresenter(state);
    /* Only presets that normally carry a camera need the collapse rules. */
    const collapsed = cfg.presenter && !hasPresenter;

    stage.className = [
      'stage',
      `a${state.aspect}`,
      `preset-${state.preset}`,
      `bg-${state.background}`,
      hasPresenter ? 'has-presenter' : '',
      collapsed ? 'no-presenter' : '',
    ].join(' ').replace(/\s+/g, ' ').trim();

    clear(stage);
    stage.appendChild(bgLayer);
    stage.appendChild(buildStageContent(state, view));
    fit();
  }

  function fit() {
    const [w, h] = SIZES[store.get().aspect] || SIZES['16x9'];
    const scale = Math.min(window.innerWidth / w, window.innerHeight / h);
    stage.style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', fit);
  store.subscribe(() => { render(); snapshot.save(store.get()); });

  /* ---------- control panel wiring ---------- */
  const bus = createBus({ role });
  if (listen) {
    bus.on((msg) => {
      if (msg.from === role) return;
      const { type, payload } = msg;
      if (type === 'state') store.replace(payload);
      else if (type === 'patch') store.set(payload);
      else if (type === 'step') store.set({ step: clampStep(payload.step) });
      else if (type === 'reload') window.location.reload();
      else if (type === 'ping') bus.send('pong', { role });
      else if (type === 'fr1-select') fr1Select(payload.id).catch((err) => renderError(stage, bgLayer, err.message));
      else if (type === 'fr1-stage') fr1Stage(payload.action);
      else if (type === 'fr1-exit') fr1Exit();
    });
    bus.send('hello', { role });
  }

  await render();
  return {
    store, bus, stage, refresh: render,
    // P5: exposed for tests and for callers that want to drive
    // Foundation Release 1 mode without a live WebSocket round trip.
    fr1: {
      select: fr1Select, stage: fr1Stage, exit: fr1Exit,
      player: () => fr1Player, isActive: () => fr1Active,
    },
  };
}

/* ------------------------------------------------------------
   Live text edits from the control panel are stored as
   dot-paths so the lesson JSON on disk is never touched.
   ------------------------------------------------------------ */
export function applyOverrides(lesson, overrides = {}) {
  const keys = Object.keys(overrides || {});
  if (!keys.length) return lesson;
  const copy = normalize(JSON.parse(JSON.stringify(lesson)), lesson.id);
  for (const path of keys) {
    const value = overrides[path];
    const parts = path.split('.');
    let node = copy;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      if (node[k] === undefined || node[k] === null) node[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      node = node[k];
    }
    node[parts[parts.length - 1]] = value;
  }
  return copy;
}

function renderError(stage, bgLayer, message) {
  clear(stage);
  stage.appendChild(bgLayer);
  stage.appendChild(el('div', {
    style: {
      position: 'absolute', inset: '0', display: 'grid', placeItems: 'center',
      padding: '4rem', textAlign: 'center', gap: '1rem', color: 'var(--t-hi)',
    },
  },
    el('div', { class: 'section-title', style: { color: 'var(--c-error)' } }, 'Lesson did not load'),
    el('div', { style: { maxWidth: '48ch', color: 'var(--t-mid)', fontSize: '1.1rem', lineHeight: 1.5 } }, message),
  ));
}
