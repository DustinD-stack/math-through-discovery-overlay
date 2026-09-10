/* ============================================================
   PromptCard
   A learner-thinking prompt, presented as its own beat in the
   lesson. Four kinds, matching how Math Through Discovery asks a
   student to engage:

     question  what is being asked
     predict   estimate / guess before computing
     try       attempt a method yourself
     notice    what patterns or structure do you see

   Reusable: it takes plain text, not a lesson. The kind only
   changes the eyebrow label and accent.
   ============================================================ */

import { el, markup } from '../utils/dom.js';

const KIND = {
  question: 'Question',
  predict: 'Predict',
  try: 'Try it',
  notice: 'What do you notice?',
};

/**
 * PromptCard(opts) -> Node
 *
 * opts.kind        'question' (default) | 'predict' | 'try' | 'notice'
 * opts.text        the prompt itself (supports markup: {highlight} *em* _underline_)
 * opts.context     one supporting line, shown under the prompt
 * opts.hint        a hint, hidden until revealHint
 * opts.revealHint  boolean
 * opts.state       optional 'active' | 'complete' | 'inactive'
 */
export function PromptCard({
  kind = 'question',
  text = '',
  context = '',
  hint = '',
  revealHint = false,
  state,
} = {}) {
  const k = KIND[kind] ? kind : 'question';
  return el('div', {
    class: `prompt prompt--${k} panel${state ? ` is-${state}` : ''}`,
    role: 'group',
    'aria-label': KIND[k],
    'aria-current': state === 'active' ? 'step' : null,
  },
    el('div', { class: 'prompt__eyebrow' }, KIND[k]),
    el('div', { class: 'prompt__text', html: markup(text) }),
    context ? el('div', { class: 'prompt__context', html: markup(context) }) : null,
    hint
      ? el('div', { class: 'prompt__hint', hidden: !revealHint, html: markup(hint) })
      : null,
  );
}

export default PromptCard;
