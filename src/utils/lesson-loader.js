/* ============================================================
   Lesson loading
   1. Try fetch("lessons/<id>.json")  — works over http(s).
   2. Fall back to window.MTD_LESSONS — works over file:// with
      no server at all (lessons/lessons.bundle.js).
   ============================================================ */

const cache = new Map();

export function bundledLessons() {
  return (typeof window !== 'undefined' && window.MTD_LESSONS) || {};
}

export function lessonIndex() {
  const b = bundledLessons();
  return Object.keys(b).map((id) => ({
    id,
    topic: b[id].topic || id,
    subject: b[id].subject || '',
    episode: b[id].episode || '',
  })).sort((a, z) => a.topic.localeCompare(z.topic));
}

export async function loadLesson(id) {
  if (!id) id = 'unit-rate';
  if (cache.has(id)) return cache.get(id);

  let data = null;
  try {
    const res = await fetch(new URL(`../../lessons/${id}.json`, import.meta.url));
    if (res.ok) data = await res.json();
  } catch (_) { /* file:// or offline — use the bundle */ }

  if (!data) data = bundledLessons()[id] || null;
  if (!data) throw new Error(`Lesson "${id}" not found. Add lessons/${id}.json and register it in lessons/lessons.bundle.js.`);

  data = normalize(data, id);
  cache.set(id, data);
  return data;
}

export const STEP_KEYS = ['see', 'break', 'build', 'transform', 'check'];

/** Fill in defaults so a partial lesson file still renders cleanly. */
export function normalize(raw, id) {
  const l = JSON.parse(JSON.stringify(raw));
  l.id = l.id || id;
  l.series = l.series || 'Math Through Discovery';
  l.seriesLine = l.seriesLine || 'Reality Check Series';
  l.episode = l.episode ?? '';
  l.topic = l.topic || 'Untitled';
  l.subtitle = l.subtitle || '';
  l.title = l.title || 'Reality Check';
  l.headline = l.headline || '';
  l.quote = l.quote || '';
  l.facts = Array.isArray(l.facts) ? l.facts : [];
  l.question = l.question || '';
  l.answer = l.answer || null;
  l.steps = l.steps || {};
  for (const k of STEP_KEYS) l.steps[k] = l.steps[k] || { text: '' };
  l.diagram = l.diagram || null;
  l.comparison = l.comparison || null;
  l.takeaways = Array.isArray(l.takeaways) ? l.takeaways : [];
  l.presenter = l.presenter || { name: '', role: '' };
  return l;
}
