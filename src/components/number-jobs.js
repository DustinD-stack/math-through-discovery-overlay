/* ============================================================
   NumberJobs  —  WHOLE / SPLIT / TAKE
   A reasoning-language component: it names what each number is
   DOING, before any method is chosen.

     WHOLE  the amount we start with
     SPLIT  how many equal parts the whole is divided into
     TAKE   how many of those equal parts we want

   The WORDS are primary. Colour (--job-*) reinforces meaning but
   is never the only distinction - the role word is always shown.

   It is not a fraction component. "3/8 of 20" is one use; it works
   for any whole / equal-parts / selection structure. The role
   sentences are the fixed part; value, description and context
   are the caller's.

   Independent of TransformationChain: NumberJobs answers "what job
   is each number doing?", the chain answers "how else can this
   quantity be written?".
   ============================================================ */

import { el } from '../utils/dom.js';

export const JOB_IDS = ['whole', 'split', 'take'];

const JOB = {
  whole: { name: 'Whole', desc: 'The amount we start with.' },
  split: { name: 'Split', desc: 'How many equal parts the whole is divided into.' },
  take: { name: 'Take', desc: 'How many of those equal parts we want.' },
};

function jobTile(id, data, active) {
  const meta = JOB[id];
  const state = active == null ? 'rest' : (active === id ? 'active' : 'muted');
  const desc = data.desc || meta.desc;
  return el('li', {
    class: `njobs__job njobs__job--${id} is-${state}`,
    role: 'listitem',
    'aria-current': active === id ? 'true' : null,
    'aria-label': `${meta.name}: ${data.value}${data.context ? ' ' + data.context : ''}. ${desc}`,
  },
    el('span', { class: 'njobs__value', 'aria-hidden': 'true' },
      String(data.value),
      data.context ? el('span', { class: 'njobs__context' }, data.context) : null,
    ),
    el('span', { class: 'njobs__name', 'aria-hidden': 'true' }, meta.name),
    el('span', { class: 'njobs__desc', 'aria-hidden': 'true' }, desc),
  );
}

/**
 * NumberJobs(opts) -> Node
 *
 * opts.whole   { value, desc?, context? }   required
 * opts.split   { value, desc?, context? }   required
 * opts.take    { value, desc?, context? }   optional - omit for a two-job layout
 * opts.active  'whole' | 'split' | 'take' | null
 *              a chosen job is emphasised; the others stay fully readable
 *              (they are dimmed, not hidden).
 * opts.layout  'row' (default) | 'stack'    narrow canvases auto-stack in CSS
 */
export function NumberJobs({
  whole,
  split,
  take = null,
  active = null,
  layout = 'row',
} = {}) {
  const present = [
    ['whole', whole], ['split', split], take ? ['take', take] : null,
  ].filter(Boolean);
  if (!present.length) return null;

  return el('ol', {
    class: `njobs njobs--${layout} njobs--n${present.length}`,
    role: 'list',
    'aria-label': 'What each number is doing',
  }, present.map(([id, data]) => jobTile(id, data, active)));
}

export default NumberJobs;
