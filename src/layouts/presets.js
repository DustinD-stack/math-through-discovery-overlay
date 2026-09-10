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
   hierarchy. RAIL_PRESETS is the subset that also carries the top rail
   (Quick Reveal stays chrome-free). F and the square canvas get their
   own compositions in later Phase 6 commits. */
const COMPOSED_PRESETS = ['A', 'B', 'C', 'D', 'E', 'G', 'H'];
const RAIL_PRESETS = ['A', 'B', 'C', 'D', 'E', 'H'];

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
     16:9 rail presets only for now; vertical/square land in a later
     Phase 6 commit. */
  if (L.discovery && RAIL_PRESETS.includes(state.preset) && state.aspect === '16x9') {
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

    /* ---- Phase 6: Workspace Focus (B) ---- */
    case 'B': {
      main.appendChild(el('div', { class: 'ws-col ws-col--focus' },
        PromptRegion(state, lesson),
        EquationRegion(state, lesson, { size: 'lg' }),
        VisualRegion(state, lesson),
        ResultRegion(state, lesson, { skin: 'panel' }),
      ));
      break;
    }

    /* ---- Phase 6: Pattern Breakdown (D) — big equation + the chain ---- */
    case 'D': {
      main.appendChild(el('div', { class: 'ws-col ws-col--focus' },
        EquationRegion(state, lesson, { size: 'lg' }),
        VisualRegion(state, lesson, { preferChain: true }),
        ResultRegion(state, lesson, { skin: 'panel' }),
      ));
      break;
    }

    /* ---- Phase 6: Visual Model Focus (E) — the model leads ---- */
    case 'E': {
      main.appendChild(el('div', { class: 'ws-col ws-col--visual' },
        VisualRegion(state, lesson),
        EquationRegion(state, lesson, { size: 'md' }),
        ResultRegion(state, lesson, { skin: 'panel' }),
      ));
      break;
    }

    /* ---- Phase 6: Quick Explanation (G) — prompt / equation / visual / answer ---- */
    case 'G': {
      main.appendChild(el('div', { class: 'ws-col ws-col--quick' },
        PromptRegion(state, lesson),
        EquationRegion(state, lesson, { size: 'md' }),
        VisualRegion(state, lesson),
        ResultRegion(state, lesson, { skin: 'paper' }),
      ));
      break;
    }

    /* ---- Phase 6: Whiteboard / Deep Work (H) — maximum reasoning space ---- */
    case 'H': {
      main.appendChild(el('div', { class: 'whiteboard' },
        el('div', { class: 'ws-col ws-col--board' },
          EquationRegion(state, lesson, { size: 'xl' }),
          VisualRegion(state, lesson, { preferChain: !diagram }),
          ResultRegion(state, lesson, { skin: 'inline' }),
        ),
      ));
      break;
    }
    default: {
      /* F (Short Vertical) and any unknown preset — scenario column +
         discovery column. F gets its own Phase 6 composition in a later
         commit; this keeps it working until then. */
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
