# Design system

Everything visual comes from `src/styles/tokens.css`. Change a token there and the
whole kit — every preset, every diagram, every aspect ratio — follows.

## Colour meaning

Colour is never decorative in this system. Each hue means one thing.

| Token | Meaning | Used by |
| --- | --- | --- |
| `--c-navy-*`, `--c-charcoal` | core UI, studio surfaces | backgrounds, panels |
| `--c-structure` (blue) | structure, place value | SEE, tables, first bond part |
| `--c-correct` (green) | correct, confirmed, friendly values | BREAK, checks, answer ring |
| `--c-adjust` (orange) | adjustment, the nearby number | BUILD, compensation jumps |
| `--c-transform` (purple) | equivalence, transformation | TRANSFORM, second fraction bar |
| `--c-error` (red) | misconception, warning | "What they think", stamps |
| `--c-discover` (yellow) | discovery, highlight | CHECK, marker underlines, episode badge |
| `--c-strategy` (teal) | strategy, build | formulas, unit rows, percent fills |
| `--c-paper` | teaching surface | paper note, receipt, paper background |

The five step colours are aliased so you can re-map a step without hunting through CSS:

```css
--c-step-see: var(--c-structure);
--c-step-break: var(--c-correct);
--c-step-build: var(--c-adjust);
--c-step-transform: var(--c-transform);
--c-step-check: var(--c-discover);
```

## Type

| Role | Token | Face | Where |
| --- | --- | --- | --- |
| Logo / labels | `--font-logo` | Archivo Narrow | wordmark, step labels, footer |
| Marker headlines | `--font-marker` | Permanent Marker | board titles, VS, stamps |
| Handwriting | `--font-hand` | Caveat | quotes, worked math, annotations |
| Interface | `--font-ui` | Inter | explanations, facts, takeaways |
| Math | KaTeX | — | rendered equations |

Every family has a system fallback, so the kit stays legible offline. The scale runs
`--fs-xs` (0.72rem) to `--fs-4xl` (4.2rem) and is relative to the stage root font size,
which changes per aspect ratio — that is how one set of components fits three canvases.

The handwriting face is the point of the design: the printed interface states the
structure, the handwriting shows a person actually working the problem. Keep it for
math, quotes and annotations. Do not set explanations in it.

## Spacing, radius, shadow

`--s-1` … `--s-8` (0.25rem → 3.5rem). Panels use `--panel-radius`; cards and buttons use
`--r-md`; pills use `--r-pill`. Three shadow depths (`--sh-1/2/3`) plus two coloured
glows for the discovery and correct states.

## Layers and z-index

| Layer | Token | Contents |
| --- | --- | --- |
| 1 Background | `--z-bg` | studio gradient, paper, or nothing |
| 2 Brand | `--z-brand` | wordmark, episode badge, topic tag, footer |
| 3 Presenter | `--z-presenter` | camera zone, crop, lower third |
| 4 Story | `--z-story` | quote, claim, scenario facts |
| 5 Main math | `--z-math` | diagram modules, equation cards, paper note |
| 6 Discovery | `--z-discovery` | the five steps |
| 7 Comparison | `--z-compare` | what they think vs what the math says |
| 8 Takeaways | `--z-takeaway` | bullets, insight, stamp |
| 9 Controls | `--z-controls` | never rendered into the output |

Each layer is independently toggleable at runtime via `?hide=` or the control panel.

## Motion

Timing tokens: `--dur-fast` 180ms, `--dur-base` 340ms, `--dur-slow` 620ms, `--dur-draw`
900ms, with `--stagger` 90ms between siblings.

Classes in `animations.css`: `anim-fade`, `anim-slide-up/left/right`, `anim-pop`,
`anim-draw`, `anim-stamp`, `anim-fill`, `anim-grow`, `anim-pulse`, plus `hl-number`
(marker swipe), `ring-draw` (answer circle), `branch-draw` (bonds, jumps, lines) and
`stagger` (set `--i` on the element).

Motion is classroom-paced: one idea arrives at a time, nothing bounces, nothing loops
except the optional attention pulse. All of it is disabled by `body.no-anim` or the
operating system's reduced-motion setting.

## Re-skinning

To make a second series (different subject, same method), copy `tokens.css`, change the
palette and the two display faces, and point a new HTML file at it. No component code
changes. To make the whole kit light, add `class="bg-paper"` — the paper block at the
bottom of `tokens.css` re-points text, line and accent colours for a light surface.
