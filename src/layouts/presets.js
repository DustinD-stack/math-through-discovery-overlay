/* ============================================================
   Layout presets
   A preset decides which regions exist and what goes in the
   board. It never contains lesson text — only structure.
   ============================================================ */

import { el } from '../utils/dom.js';
import {
  Header, TopicTag, PresenterFrame, QuoteCard, ScenarioFacts,
  ComparisonPanel, TakeawayPanel, FooterWorkflow, Sticky,
} from '../components/core.js';
import {
  DiscoveryStepper, MethodCards, EquationCard, PaperNote, StepHeadline, StepProgress,
} from '../components/discovery.js';
import { renderDiagram } from '../modules/diagrams.js';
import {
  TopRail, PromptRegion, EquationRegion, VisualRegion, ResultRegion, PhilosophyStrip,
} from './workspace.js';

/* Presets whose board is composed from the Phase 6 teaching-workspace
   hierarchy (and therefore carry the top rail). Grows one commit at a
   time so each change stays inside its family. */
const COMPOSED_PRESETS = ['A', 'C'];

export const PRESETS = {
  A: { name: 'Presenter + Board', presenter: true, quote: true },
  B: { name: 'Full Lesson Board', presenter: false, quote: true },
  C: { name: 'Reality Check', presenter: true, quote: true },
  D: { name: 'Pattern Breakdown', presenter: false, quote: false },
  E: { name: 'Number Bond Lesson', presenter: false, quote: false },
  F: { name: 'Short Vertical', presenter: true, quote: true },
  G: { name: 'Quick Reveal', presenter: false, quote: false },
  H: { name: 'Live Whiteboard', presenter: false, quote: false },
};

export const PRESET_KEYS = Object.keys(PRESETS);

/** Single source of truth: does this state show a camera zone? */
export function usesPresenter(state) {
  const cfg = PRESETS[state.preset] || PRESETS.A;
  return !!(cfg.presenter && state.layers.presenter && state.aspect !== '1x1');
}

export function buildStageContent(state, lesson) {
  const L = state.layers;
  const cfg = PRESETS[state.preset] || PRESETS.A;
  const compact = state.aspect !== '16x9' || state.preset === 'F';
  const usePresenter = usesPresenter(state);
  /* The quote only floats over the seam between camera and board on the wide
     canvas. Everywhere else it sits in the board so nothing collides. */
  const floatQuote = usePresenter && state.aspect === '16x9'
    && ['A', 'C'].includes(state.preset) && cfg.quote && L.story && !!lesson.quote;

  const content = el('div', { class: 'stage-content' });

  /* Topic tag and lower third both live in the bottom-left of the camera zone,
     so only one of them is ever drawn. The topic tag wins when brand is on. */
  const showTopicTag = L.brand && usePresenter && state.aspect === '16x9' && ['A', 'C'].includes(state.preset);

  if (L.brand) {
    content.appendChild(el('div', { class: 'r-brand' }, Header(lesson)));
    if (showTopicTag) content.appendChild(el('div', { class: 'r-topic' }, TopicTag(lesson)));
  }

  if (usePresenter) {
    content.appendChild(el('div', { class: 'r-presenter' },
      PresenterFrame(lesson, { showLowerThird: !showTopicTag && state.aspect === '16x9' })));
  }

  /* Top rail — WHERE WE ARE. Compact so it never competes with the maths.
     Composed 16:9 presets only for now; vertical/square land in later
     Phase 6 commits. */
  if (L.discovery && COMPOSED_PRESETS.includes(state.preset) && state.aspect === '16x9') {
    content.appendChild(TopRail(state, { compact: true }));
  }

  /* Sibling of the presenter, not a child — otherwise the presenter's own
     stacking context would trap it underneath the board panel. */
  if (floatQuote) content.appendChild(el('div', { class: 'r-quote' }, QuoteCard(lesson.quote)));

  content.appendChild(buildBoard(state, lesson, {
    compact,
    showQuoteInBoard: !floatQuote && cfg.quote && L.story && !!lesson.quote,
  }));

  if (L.comparison && lesson.comparison && state.preset !== 'G' && state.preset !== 'H') {
    content.appendChild(el('div', { class: 'r-compare', style: { padding: '0 var(--s-6) var(--s-3)' } },
      el('div', { style: { display: 'grid', gridTemplateColumns: L.takeaways && lesson.takeaways.length ? '1.6fr 1fr' : '1fr', gap: 'var(--s-4)' } },
        ComparisonPanel(lesson.comparison, { revealed: state.revealAnswer }),
        L.takeaways && lesson.takeaways.length ? TakeawayPanel(lesson.takeaways, { stamp: lesson.stamp, revealed: state.revealAnswer }) : null,
      ),
    ));
  } else if (L.takeaways && lesson.takeaways.length && state.preset !== 'G') {
    content.appendChild(el('div', { class: 'r-compare', style: { padding: '0 var(--s-6) var(--s-3)' } },
      TakeawayPanel(lesson.takeaways, { stamp: lesson.stamp, revealed: state.revealAnswer })));
  }

  content.appendChild(el('div', { class: 'r-footer' }, PhilosophyStrip(), FooterWorkflow(lesson)));
  return content;
}

/* ------------------------------------------------------------ */

function buildBoard(state, lesson, { compact, showQuoteInBoard }) {
  const L = state.layers;
  const board = el('div', { class: 'r-board' });
  const head = el('div', { class: 'board__head' },
    el('h2', { class: 'section-title underline-chalk' }, lesson.title || 'Reality Check'),
    lesson.headline ? Sticky(lesson.headline) : null,
  );
  board.appendChild(head);

  const main = el('div', { class: 'board__main' });
  const diagram = L.math ? renderDiagram(lesson.diagram, lesson, state.diagram) : null;

  switch (state.preset) {
    /* ---- Phase 6: Presenter + Workspace (A) and Reality Check (C) ----
       The board is the teaching-workspace hierarchy: the head carries
       the question, then equation -> visual model -> result. The top
       rail (added in buildStageContent) shows WHERE WE ARE. */
    case 'A':
    case 'C': {
      main.appendChild(el('div', { class: 'ws-col' },
        EquationRegion(state, lesson, { size: 'md' }),
        VisualRegion(state, lesson),
        ResultRegion(state, lesson, { skin: 'panel' }),
      ));
      break;
    }
    case 'D': {
      main.appendChild(el('div', { class: 'board__col', style: { justifyItems: 'center', alignContent: 'center' } },
        L.math && EquationCard(lesson.answer?.work || lesson.steps.build?.equation, {
          caption: lesson.question, large: true,
        }),
        diagram,
      ));
      if (L.discovery) main.appendChild(MethodCards(lesson, { step: state.step }));
      break;
    }
    case 'E': {
      main.appendChild(el('div', { class: 'board__col', style: { justifyItems: 'center', alignContent: 'center' } },
        diagram || EquationCard(lesson.steps.build?.equation, { large: true }),
      ));
      if (L.discovery) main.appendChild(MethodCards(lesson, { step: state.step }));
      break;
    }
    case 'G': {
      main.appendChild(el('div', { class: 'board__col', style: { justifyItems: 'center' } },
        L.story && lesson.quote ? QuoteCard(lesson.quote) : null,
        L.math ? EquationCard(lesson.answer?.work, { large: true }) : null,
        L.math ? PaperNote(lesson, { revealed: state.revealAnswer }) : null,
        L.takeaways && lesson.takeaways.length
          ? el('div', { class: 'panel panel--quiet', style: { textAlign: 'center', maxWidth: '70%' } },
              el('div', { class: 'takeaways__head', style: { justifyContent: 'center' } }, 'The takeaway'),
              el('div', { class: 'comparison__body' }, textOf(lesson.takeaways[0])))
          : null,
      ));
      break;
    }
    case 'H': {
      main.appendChild(el('div', { class: 'whiteboard' },
        el('div', { class: 'board__col', style: { justifyItems: 'center', gap: 'var(--s-6)' } },
          L.discovery ? StepHeadline(lesson, Math.max(1, state.step)) : null,
          L.math ? EquationCard(currentEquation(lesson, state.step), { large: true }) : null,
          diagram,
          L.discovery ? StepProgress(state.step) : null,
        ),
      ));
      break;
    }
    default: {
      /* A, B, C, F — scenario column + discovery column.
         Vertical and square canvases stack these and drop the diagram, which
         would otherwise push the five steps off the bottom of the stage. */
      const roomForDiagram = state.aspect === '16x9';
      main.appendChild(el('div', { class: 'board__col' },
        showQuoteInBoard ? QuoteCard(lesson.quote) : null,
        L.story ? ScenarioFacts(lesson) : null,
        L.math ? PaperNote(lesson, { revealed: state.revealAnswer }) : null,
        L.math && roomForDiagram ? diagram : null,
      ));
      main.appendChild(el('div', { class: 'board__col board__col--fill' },
        L.discovery ? DiscoveryStepper(lesson, { step: state.step, compact }) : null,
      ));
    }
  }

  board.appendChild(main);
  return board;
}

function currentEquation(lesson, step) {
  const order = ['see', 'break', 'build', 'transform', 'check'];
  for (let i = Math.max(0, step - 1); i >= 0; i--) {
    const eq = lesson.steps[order[i]]?.equation;
    if (eq) return eq;
  }
  return lesson.answer?.work || '';
}

const textOf = (t) => (typeof t === 'string' ? t : t.text);
