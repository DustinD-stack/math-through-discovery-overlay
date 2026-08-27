/* ============================================================
   View state
   Lesson content lives in JSON. This is everything else:
   which preset, which aspect, which layers, how far along.
   ============================================================ */

export const DEFAULT_STATE = {
  lessonId: 'unit-rate',
  preset: 'A',            // A–H
  aspect: '16x9',         // 16x9 | 9x16 | 1x1
  background: 'studio',   // studio | paper | transparent
  step: 5,                // 0 = nothing revealed … 5 = all five steps
  revealAnswer: true,
  animations: true,
  diagram: 'auto',        // 'auto' uses lesson.diagram.type, or force a module
  layers: {
    brand: true,
    presenter: true,
    story: true,
    math: true,
    discovery: true,
    comparison: true,
    takeaways: true,
  },
  overrides: {},          // live text edits from the control panel
};

const KEY_ALIASES = { bg: 'background', ratio: 'aspect', lesson: 'lessonId', anim: 'animations' };

export function createStore(initial = {}) {
  let state = deepMerge(structuredClone(DEFAULT_STATE), initial);
  const subs = new Set();
  return {
    get: () => state,
    set(patch, meta = {}) {
      state = deepMerge(structuredClone(state), patch);
      subs.forEach((fn) => fn(state, meta));
      return state;
    },
    replace(next, meta = {}) {
      state = deepMerge(structuredClone(DEFAULT_STATE), next);
      subs.forEach((fn) => fn(state, meta));
      return state;
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
}

export function deepMerge(base, patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return patch === undefined ? base : patch;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(patch)) {
    out[k] = (v && typeof v === 'object' && !Array.isArray(v) && typeof out[k] === 'object' && out[k] !== null)
      ? deepMerge(out[k], v) : v;
  }
  return out;
}

/** Read ?lesson=…&preset=…&aspect=…&bg=…&step=…&anim=0&hide=presenter,quote */
export function stateFromURL(search = window.location.search) {
  const p = new URLSearchParams(search);
  const out = {};
  for (let [k, v] of p.entries()) {
    k = KEY_ALIASES[k] || k;
    if (k === 'lessonId' || k === 'preset' || k === 'aspect' || k === 'background' || k === 'diagram') out[k] = v;
    else if (k === 'step') out.step = clampStep(v);
    else if (k === 'animations') out.animations = truthy(v);
    else if (k === 'revealAnswer' || k === 'answer') out.revealAnswer = truthy(v);
    else if (k === 'hide') {
      out.layers = out.layers || {};
      v.split(',').map((s) => s.trim()).filter(Boolean).forEach((n) => { out.layers[n] = false; });
    } else if (k === 'show') {
      out.layers = out.layers || {};
      v.split(',').map((s) => s.trim()).filter(Boolean).forEach((n) => { out.layers[n] = true; });
    }
  }
  if (p.get('bg') === 'transparent' || p.get('background') === 'transparent') out.background = 'transparent';
  if (out.preset) out.preset = out.preset.toUpperCase();
  return out;
}

export function stateToURL(state, base = 'overlay.html') {
  const p = new URLSearchParams();
  p.set('lesson', state.lessonId);
  p.set('preset', state.preset);
  p.set('aspect', state.aspect);
  p.set('bg', state.background);
  p.set('step', String(state.step));
  if (!state.animations) p.set('anim', '0');
  const hidden = Object.entries(state.layers).filter(([, on]) => !on).map(([n]) => n);
  if (hidden.length) p.set('hide', hidden.join(','));
  return `${base}?${p.toString()}`;
}

const truthy = (v) => !(v === '0' || v === 'false' || v === 'no' || v === 'off');
export const clampStep = (v) => Math.max(0, Math.min(5, parseInt(v, 10) || 0));
