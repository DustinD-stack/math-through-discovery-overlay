/* ============================================================
   Core components (Layers 2, 3, 4, 7, 8 + footer)
   Every component takes data and returns a DOM node.
   None of them know where they sit on the stage.
   ============================================================ */

import { el, svg, markup } from '../utils/dom.js';

/* ---------- Layer 2 — Brand ---------- */

export function Header(lesson) {
  const [l1, l2, l3] = splitSeries(lesson.series);
  return el('div', { class: 'brand anim-slide-right' },
    el('div', { class: 'brand__logo' },
      el('span', { class: 'brand__l1' }, l1),
      l2 && el('span', { class: 'brand__l2' }, l2),
      l3 && el('span', { class: 'brand__l3' }, l3),
    ),
    lesson.seriesLine && el('div', { class: 'brand__series' }, lesson.seriesLine),
    lesson.episode !== '' && EpisodeBadge(lesson.episode),
  );
}

export function EpisodeBadge(episode) {
  return el('div', { class: 'episode anim-pop stagger', style: { '--i': 2 } }, `Episode ${episode}`);
}

export function TopicTag(lesson) {
  return el('div', { class: 'topic-tag anim-slide-right stagger', style: { '--i': 3 } },
    el('div', { class: 'topic-tag__label' }, "Today's topic"),
    el('div', { class: 'topic-tag__topic' }, lesson.topic),
    el('div', { class: 'topic-tag__sub', html: markup(lesson.philosophy || 'See the pattern. Change the form. *Keep the value.*') }),
  );
}

/* ---------- Layer 3 — Presenter ---------- */

export function PresenterFrame(lesson, { showLowerThird = true } = {}) {
  const p = lesson.presenter || {};
  return el('div', { class: 'presenter' },
    el('div', { class: 'presenter__placeholder' },
      Silhouette(),
      el('div', {}, 'Camera zone', el('br'), 'transparent in OBS'),
    ),
    el('div', { class: 'presenter__vignette' }),
    showLowerThird && p.name && el('div', { class: 'lower-third anim-slide-right' },
      el('div', { class: 'lower-third__name' }, p.name),
      p.role && el('div', { class: 'lower-third__role' }, p.role),
    ),
  );
}

function Silhouette() {
  return el('div', { class: 'presenter__silhouette' },
    svg('svg', { viewBox: '0 0 120 120', 'aria-hidden': 'true' },
      svg('circle', { cx: 60, cy: 40, r: 22, fill: 'currentColor' }),
      svg('path', { d: 'M14 118c0-27 21-46 46-46s46 19 46 46z', fill: 'currentColor' }),
    ),
  );
}

/* ---------- Layer 4 — Story ---------- */

export function QuoteCard(quote) {
  if (!quote) return null;
  return el('blockquote', { class: 'quote-card anim-pop' },
    el('span', { class: 'quote-card__mark' }, '\u201C'),
    el('div', { class: 'quote-card__text' }, quote),
    el('div', { class: 'quote-card__rule anim-draw' }),
  );
}

export function ScenarioFacts(lesson) {
  return el('div', { class: 'panel' },
    el('h3', { class: 'panel__title underline-chalk' }, lesson.scenarioLabel || 'Scenario:'),
    el('ul', { class: 'facts' },
      lesson.facts.map((f, i) => el('li', { class: 'facts__row anim-slide-up stagger', style: { '--i': i } },
        el('span', { class: 'facts__label' }, `${f.label}:`),
        el('span', { class: `facts__value${f.highlight ? ' facts__value--hl' : ''}` }, f.value),
      )),
    ),
    lesson.question && el('p', { class: 'scenario__q anim-fade stagger', style: { '--i': 3 } },
      el('strong', {}, 'Question: '), lesson.question),
  );
}

export function ProblemCard(lesson) {
  return el('div', { class: 'panel' },
    el('h3', { class: 'panel__title' }, 'The problem'),
    el('p', { class: 'scenario__q' }, lesson.question || lesson.headline || ''),
  );
}

export function Sticky(text) {
  if (!text) return null;
  return el('div', { class: 'sticky anim-pop' }, el('div', { class: 'sticky__text', html: markup(text) }));
}

/* ---------- Layer 7 — Comparison ---------- */

export function ComparisonPanel(comparison, { revealed = true } = {}) {
  if (!comparison) return null;
  return el('div', { class: 'panel panel--quiet' },
    el('div', { class: 'comparison' },
      el('div', { class: 'comparison__side comparison__think anim-slide-right' },
        el('div', {},
          el('div', { class: 'comparison__head' }, comparison.thinkLabel || 'What they think'),
          el('div', { class: 'comparison__body' }, el('span', { class: 'hand' }, `\u201C${comparison.think}\u201D`)),
        ),
        el('div', { class: 'mark-badge mark-badge--x' }, '\u2715'),
      ),
      el('div', { class: 'comparison__vs' }, 'VS'),
      revealed
        ? el('div', { class: 'comparison__side comparison__math anim-slide-left' },
            el('div', {},
              el('div', { class: 'comparison__head' }, comparison.mathLabel || 'What the math says'),
              el('div', { class: 'comparison__body', html: markup(comparison.math) }),
            ),
            el('div', { class: 'mark-badge mark-badge--check anim-pop' }, '\u2713'),
          )
        : el('div', { class: 'comparison__side' },
            el('div', { class: 'comparison__body', style: { color: 'var(--t-faint)' } }, 'Answer hidden')),
    ),
  );
}

/* ---------- Layer 8 — Takeaways ---------- */

export function TakeawayPanel(takeaways, { stamp = null, revealed = true } = {}) {
  if (!takeaways || !takeaways.length) return null;
  return el('div', { class: 'panel panel--quiet' },
    el('div', { class: 'takeaways__head' }, Bulb(), 'Key takeaways'),
    el('ul', { class: 'takeaways__list' },
      takeaways.map((t, i) => {
        const text = typeof t === 'string' ? t : t.text;
        const insight = typeof t === 'object' && t.insight;
        return el('li', {
          class: `${insight ? 'takeaways__insight ' : ''}anim-slide-up stagger`,
          style: { '--i': i },
          html: markup(text),
        });
      }),
    ),
    stamp && revealed && RealityCheckStamp(stamp),
  );
}

export function RealityCheckStamp(text = 'Reality check') {
  return el('div', { class: 'stamp anim-stamp', style: { marginTop: 'var(--s-3)', display: 'inline-block' } }, text);
}

function Bulb() {
  return svg('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true' },
    svg('path', { d: 'M9 21h6v-1H9v1zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z' }),
  );
}

/* ---------- Footer ---------- */

const STEP_NAMES = [
  ['SEE', 'var(--c-step-see)'],
  ['BREAK', 'var(--c-step-break)'],
  ['BUILD', 'var(--c-step-build)'],
  ['TRANSFORM', 'var(--c-step-transform)'],
  ['CHECK', 'var(--c-step-check)'],
];

export function FooterWorkflow(lesson) {
  return el('footer', { class: 'footer' },
    el('div', { class: 'footer__slogan', html: 'Your reality.<br>Your numbers.<br>Your <em>power.</em>' }),
    el('div', { class: 'footer__path' },
      el('div', {},
        el('div', { class: 'footer__path-label', style: { textAlign: 'center', marginBottom: 'var(--s-2)' } }, 'Follow the path every time'),
        el('div', { class: 'footer__chain' },
          STEP_NAMES.flatMap(([name, color], i) => [
            el('span', { style: { color } }, name),
            i < 4 ? el('span', { class: 'arrow' }, '\u2192') : null,
          ]),
        ),
      ),
    ),
    el('div', { class: 'footer__mark' },
      el('div', { class: 'footer__mark-l1' }, lesson.series || 'Math Through Discovery'),
      el('div', { class: 'footer__mark-l2' }, 'See the pattern. Change the form. Keep the value.'),
    ),
  );
}

/* ---------- helpers ---------- */

function splitSeries(series = 'Math Through Discovery') {
  const parts = String(series).trim().split(/\s+/);
  if (parts.length >= 3) return [parts[0], parts[1], parts.slice(2).join(' ')];
  if (parts.length === 2) return [parts[0], '', parts[1]];
  return [parts[0] || '', '', ''];
}
