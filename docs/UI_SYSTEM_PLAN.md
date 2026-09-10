# UI System Plan — Phase 1 (Inventory + Design Plan)

**Status:** proposal only. Nothing in this document has been implemented.
**Scope:** define a reusable, broadcast-quality teaching component set for the
Math Through Discovery overlay. No architecture change, no framework, no rewrite
of working lesson logic, no change to the WebSocket transport.

- Teaching framework: **SEE → BREAK → BUILD → TRANSFORM → CHECK**
- Core principle: **SAME VALUE → DIFFERENT FORM**
- Audience: **3rd grade through adults** — clean, modern, educational,
  broadcast-ready, not childish, somewhat fun, readable on video.

---

## 1. How the current UI is built (facts, not opinions)

### 1.1 Rendering model

| Concern | Where | Notes |
| --- | --- | --- |
| DOM construction | `src/utils/dom.js` — `el()`, `svg()`, `clear()`, `esc()`, `markup()` | No framework. Every component is `fn(data) -> Node`. |
| Stage | `.stage` in `src/styles/base.css` | Fixed-pixel canvas: `1920×1080` (`a16x9`), `1080×1920` (`a9x16`), `1080×1080` (`a1x1`). Scaled to the viewport with `transform: scale()` computed by `fit()` in `src/app/overlay-app.js`. |
| Type scaling | `.stage` root `font-size` = 16px / 15px / 15px per aspect | The whole `--fs-*` scale is `rem`-based, so one component set fits three canvases. `container-type: inline-size` is set on `.stage`. |
| State | `src/app/state.js` — `DEFAULT_STATE`, `createStore`, `stateFromURL`, `stateToURL` | Keys: `lessonId, preset, aspect, background, step (0–5), revealAnswer, animations, diagram, layers{brand,presenter,story,math,discovery,comparison,takeaways}, overrides{}`. |
| Compose | `src/layouts/presets.js` — `buildStageContent(state, lesson)` → `buildBoard(state, lesson, …)` | Emits region wrappers `.r-brand .r-presenter .r-quote .r-board .r-compare .r-footer`; a `switch (state.preset)` chooses the board contents. |
| Layout | `src/styles/layouts.css` | Pure CSS grid via `grid-template-areas` per preset; aspect overrides force a stacked reading order on `a9x16` / `a1x1`. |
| Math | `src/utils/math-render.js` — `renderMath(expr,{display})` | KaTeX when present, offline pretty-printer fallback (`prettyPlain`, real fraction bars) otherwise. Accepts LaTeX or friendly text (`"1200 / 160"`). |
| Motion | `src/styles/animations.css` | Class-based (`anim-*`), `--i` stagger, global kill switch `body.no-anim`, plus `@media (prefers-reduced-motion)`. |
| Tokens | `src/styles/tokens.css` | Single source of truth; `.bg-paper` re-points tokens for a light surface. |

### 1.2 Existing reusable components

**Chrome — `src/components/core.js`**
`Header`, `EpisodeBadge`, `TopicTag`, `PresenterFrame` (+ private `Silhouette`),
`QuoteCard`, `ScenarioFacts`, `ProblemCard`, `Sticky`, `ComparisonPanel`,
`TakeawayPanel`, `RealityCheckStamp` (+ private `Bulb`), `FooterWorkflow`.

**Discovery / math surface — `src/components/discovery.js`**
`STEP_META` (label + number + colour class for the five keys), `DiscoveryStepper`,
`DiscoveryStep`, `MethodCards`, `EquationCard`, `PaperNote` (+ private `AnswerRing`),
`StepProgress`, `StepHeadline`.

**Math visual modules — `src/modules/diagrams.js`** (registry `DIAGRAMS`, dispatched by
`renderDiagram(spec, lesson, override)`; keys are referenced by string from lesson JSON,
the control-panel dropdown, and `tools/smoke-test.mjs`):
`numberBond, fractionBar, percentBar, numberLine, doubleNumberLine, arrayModel,
areaModel, ratioTable, unitRateTable, balanceModel, coordinateGraph, barGraph, pieChart,
receipt, formulaBlock, equation` (16).

Diagram usage across the 16 lessons today: `numberLine` ×5, then one each of
`areaModel, arrayModel, balanceModel, barGraph, formulaBlock, fractionBar, numberBond,
percentBar, ratioTable, receipt, unitRateTable`.

### 1.3 Preset system

`PRESETS` (`src/layouts/presets.js`) is a flat map `A–H` of `{ name, presenter:boolean,
quote:boolean }`. `PRESET_KEYS` drives the control panel. `usesPresenter(state)` is the
single guard for whether a camera zone exists. Board composition is a `switch` on the
preset letter inside `buildBoard()`.

| Preset | Name | Board shape (current) |
| --- | --- | --- |
| A | Presenter + Board | scenario column + discovery stepper column, camera left 35% |
| B | Full Lesson Board | same two columns, no camera |
| C | Reality Check | A + comparison strip emphasis + stamp |
| D | Pattern Breakdown | big `EquationCard` + `MethodCards` row |
| E | Number Bond Lesson | big diagram + `MethodCards` row |
| F | Short Vertical (9:16) | host on top, board stacked |
| G | Quick Reveal | quote → equation → `PaperNote` → takeaway, centred |
| H | Live Whiteboard | `StepHeadline` + huge equation + diagram + `StepProgress`, dashed frame |

Aspect ratios `9x16` / `1x1` override every preset into a single stacked column and
drop the diagram / comparison where they would overflow.

### 1.4 Design tokens that already exist (`tokens.css`)

- **Surfaces:** `--c-navy-900/800/700`, `--c-charcoal`, `--c-board`, `--c-board-2`,
  `--c-paper`, `--c-paper-ink`.
- **Meaning colours:** `--c-structure` (blue), `--c-correct` (green), `--c-adjust`
  (orange), `--c-transform` (purple), `--c-error` (red), `--c-discover` (yellow),
  `--c-strategy` (teal). Colour is semantic, never decorative (see `DESIGN_SYSTEM.md`).
- **Step aliases:** `--c-step-see/break/build/transform/check` → the meaning colours.
- **Text:** `--t-hi/mid/low/faint`. **Lines/fills:** `--line-1/2`, `--fill-1/2`, `--tape`.
- **Type:** `--font-logo` (Archivo Narrow), `--font-marker` (Permanent Marker),
  `--font-hand` (Caveat), `--font-ui` (Inter), `--font-math` (KaTeX). Scale
  `--fs-xs 0.72rem … --fs-4xl 4.2rem`; `--lh-tight/snug/body`; `--tr-wide/wider`.
- **Spacing:** `--s-1 .25rem … --s-8 3.5rem`.
- **Border/radius:** `--bw-hair/thin/bold`; `--r-sm 6 / --r-md 12 / --r-lg 18 / --r-xl 26
  / --r-pill`; `--panel-radius`.
- **Shadow:** `--sh-1/2/3` + `--sh-glow-yellow`, `--sh-glow-green`.
- **Motion:** `--dur-fast 180 / --dur-base 340 / --dur-slow 620 / --dur-draw 900`;
  `--ease-out`, `--ease-soft`; `--stagger 90ms`.
- **Z-index:** `--z-bg … --z-controls` (nine layers).

### 1.5 Duplicated / divergent visual patterns (the reason for Phase 1)

| # | Pattern | Where it is re-implemented | Consolidate into |
| --- | --- | --- | --- |
| D1 | The five-step SEE→CHECK sequence | `DiscoveryStepper` + `DiscoveryStep`, `MethodCards`, `StepProgress`, `StepHeadline`, `FooterWorkflow` (`STEP_NAMES` array), `index.html` inline chain, control panel `.btn-step .dot` | **TeachingRail** (one primitive, several density variants) + shared step model |
| D2 | Step number chip + step-coloured label | `.step__num` / `.step__label`, `.method-card__label`, `StepProgress` pips | TeachingRail internals + tokens |
| D3 | "Revealed vs hidden" answer handling | `PaperNote({revealed})`, `ComparisonPanel({revealed})`, `TakeawayPanel` stamp gate, preset G | **AnswerReveal** |
| D4 | Big centred equation block | `EquationCard` (discovery.js) and `EquationModule` (diagrams.js, key `equation`) are near-identical | **EquationWorkspace** (both become thin wrappers) |
| D5 | Taped-paper surface | `.paper-note` and `.receipt` share gradient/tape/ink but re-declare it | shared `.surface-paper` utility (token-level, not a component) |
| D6 | Labelled numeric pairs | `.facts__row`, `.mtable` rows, `.receipt__row` | out of Phase 1 scope; note for later |
| D7 | Hand-rolled SVG scaffold + geometry | every diagram module re-derives `viewBox`, padding, tick math; shared `svg-axis/grid/label/value/hand` classes exist but are under-used | promote `NumberBond`, `FractionBarModel`, `NumberLine`, add `PlaceValueBreakdown`, on a shared SVG helper |

### 1.6 Gap analysis — requested components vs. what exists

| Requested | Today | Action |
| --- | --- | --- |
| 1. TeachingRail | scattered (D1) | **new** primitive; existing five-step renderers become variants/wrappers |
| 2. NumberJobs (WHOLE / SPLIT / TAKE) | nothing | **new** — no equivalent concept in the codebase |
| 3. TransformationChain | only `currentEquation()` step-walk in preset H | **new** — this is the flagship "SAME VALUE → DIFFERENT FORM" component |
| 4. NumberBond | `NumberBond` diagram module | **promote** to a stateful component; keep registry key `numberBond` |
| 5. FractionBarModel | `fractionBar` diagram module | **promote**; keep registry key `fractionBar` |
| 6. NumberLine | `numberLine` (+ `doubleNumberLine`) | **promote**; keep keys |
| 7. PlaceValueBreakdown | nothing (place-value lesson uses `numberLine`) | **new** diagram module, registry key `placeValueBreakdown` |
| 8. EquationWorkspace | `EquationCard` + `EquationModule` (D4) | **new** unifying component; old names delegate |
| 9. PromptCard | partial: `ProblemCard`, `ScenarioFacts` question, `QuoteCard` | **new** dedicated card; `ProblemCard` delegates |
| 10. AnswerReveal | `PaperNote` + `AnswerRing` + per-component `revealed` (D3) | **new**; `PaperNote` becomes a preset of it |

---

## 2. Design principles for the new system

1. **One stage, three canvases.** Every component must render correctly inside the
   fixed-pixel `.stage` and inherit the per-aspect root `font-size`. No component sets
   an absolute pixel type size; everything is `--fs-*` / `em`.
2. **Colour is meaning.** Reuse the existing semantic palette. Never encode state with
   hue alone — pair colour with a number, a shape, a label, or a position (colour-blind
   and video-compression safe).
3. **Broadcast legibility.** Minimum on-screen text ≈ `--fs-lg` (1.45rem ≈ **23px** at
   1080p) for anything a viewer must read; primary values ≥ `--fs-2xl`. SVG strokes
   ≥ 3px. Keep content inside a **5% safe area** (≈96px at 1080p). Avoid pure `#fff`
   fills directly on the transparent background — use `--t-hi` with the existing
   vignette or a subtle text-shadow so edges don't shimmer over camera.
4. **Two rendering contexts:**
   - **Dark control interface** (`body.control`) — dense, high-contrast, tablet-usable.
   - **Transparent OBS overlay** (`body.transparent`, `bg=transparent`) — component
     backgrounds must be explicitly opaque *panels* or explicitly transparent; no
     component may rely on the studio gradient being present.
5. **Classroom-paced motion.** One idea at a time, `--dur-base` transitions,
   `--stagger` between siblings, `--dur-draw` for "drawing" effects, nothing loops
   except an optional single-element `anim-pulse` on the active step. Everything must
   disappear cleanly under `body.no-anim` and `prefers-reduced-motion`.
6. **Additive only.** New components are new files in the **existing** folders
   (`src/components/`, `src/modules/`) and a new `src/styles/teaching.css`. Existing
   component names keep working (delegation). Registry string keys are never renamed.
   `tools/smoke-test.mjs` must stay green (1,152 combinations).

---

## 3. DESIGN TOKENS

All new tokens are **additive** to `tokens.css`. Requested names are introduced as a
small **semantic alias layer** that points at the existing palette, so components can
depend on stable names while the underlying skin stays configurable. The `.bg-paper`
block gets the matching overrides.

### 3.1 Semantic alias layer (new, additive)

| Requested token | New variable | Resolves to (dark) | Notes |
| --- | --- | --- | --- |
| background | `--ui-bg` | `var(--c-navy-900)` | app / stage ground |
| panel | `--ui-panel` | `var(--c-board-2)` | raised component surface |
| panel (sunken) | `--ui-panel-quiet` | `var(--fill-1)` | quiet/secondary panels |
| text | `--ui-text` | `var(--t-hi)` | primary text |
| muted text | `--ui-text-muted` | `var(--t-low)` | labels, captions |
| faint text | `--ui-text-faint` | `var(--t-faint)` | disabled / placeholder |
| accent | `--ui-accent` | `var(--c-discover)` | highlight, focus, "discovery" |
| success | `--ui-success` | `var(--c-correct)` | correct / confirmed |
| warning | `--ui-warning` | `var(--c-adjust)` | "needs adjustment" (orange already means this) |
| error | `--ui-error` | `var(--c-error)` | misconception / invalid |
| border | `--ui-border` | `var(--line-2)` | component outlines |
| hairline | `--ui-border-faint` | `var(--line-1)` | internal dividers |

### 3.2 Teaching-stage colours (new aliases over existing step colours)

| Stage | New variable | Resolves to | Meaning kept from `DESIGN_SYSTEM.md` |
| --- | --- | --- | --- |
| SEE | `--stage-see` | `var(--c-step-see)` → structure blue | notice the structure |
| BREAK | `--stage-break` | `var(--c-step-break)` → correct green | split into friendly parts |
| BUILD | `--stage-build` | `var(--c-step-build)` → adjust orange | assemble the method |
| TRANSFORM | `--stage-transform` | `var(--c-step-transform)` → transform purple | change the form, keep the value |
| CHECK | `--stage-check` | `var(--c-step-check)` → discover yellow | confirm by another route |
| (per-element) | `--stage-color` | set by a `.stage-*` class | components read this one variable |

`.stage-see/break/build/transform/check` utility classes each set `--stage-color`
(mirrors the existing `.step-*` classes, which are kept as aliases).

### 3.3 NumberJobs colours (new)

| Job | Variable | Resolves to | Rationale |
| --- | --- | --- | --- |
| WHOLE | `--job-whole` | `var(--c-structure)` (blue) | the intact quantity / structure |
| SPLIT | `--job-split` | `var(--c-transform)` (purple) | equivalence, breaking into parts |
| TAKE | `--job-take` | `var(--c-adjust)` (orange) | the part removed / acted on |

### 3.4 Spacing / radius / shadow / font scale / timing

Reuse the existing tokens verbatim; this plan adds **named intents** only, no new
values:

- **Spacing:** component internal padding = `--s-4`; gap between stacked teaching blocks
  = `--s-5`; safe-area inset = `--s-8` (≈56px; the 5% rule adds more at the region level).
- **Radius:** teaching cards = `--r-lg`; chips / pills = `--r-pill`; inner tiles =
  `--r-md`. New alias `--r-card: var(--r-lg)`.
- **Shadow:** resting card = `--sh-2`; lifted / active card = `--sh-3`; "correct" glow =
  `--sh-glow-green`; "discovery" glow = `--sh-glow-yellow`.
- **Font scale:** unchanged. New intent aliases: `--fs-value: var(--fs-2xl)` (a number
  the viewer reads), `--fs-value-lg: var(--fs-4xl)` (the single hero value),
  `--fs-label: var(--fs-xs)` (uppercase label), `--fs-explain: var(--fs-sm)` (sentence).
- **Transition timing:** state change = `--dur-base` `--ease-out`; enter = `--dur-base`;
  draw (rings, branches, chain links) = `--dur-draw`; micro-feedback (hover/press in
  control) = `--dur-fast`. New alias `--tr-state: var(--dur-base) var(--ease-out)`.

### 3.5 Shared state vocabulary (applies to every component below)

| State | Definition | Visual treatment (default) |
| --- | --- | --- |
| `inactive` | not yet reached in the lesson flow | `opacity: .2`; values hidden (`visibility:hidden`), no wash |
| `active` | the element the presenter is on now | full opacity; `--stage-color` left border / underline; faint background wash `color-mix(--stage-color 12%)`; optional single `anim-pulse` |
| `complete` | reached and revealed, now in the past | full opacity; check glyph in `--ui-success`; no wash |
| `hidden` | the owning layer flag is `false` | not rendered at all |

Animation contract: enter with `anim-fade` / `anim-slide-up` + `--i` stagger; state
transitions use `--tr-state`; "draw" sub-elements use the existing `ring-draw` /
`branch-draw` dash technique; **all** of it is nullified by `body.no-anim` and
`prefers-reduced-motion` (already handled globally — new CSS must not use inline
`style="animation:"` that bypasses the kill switch).

---

## 4. Component specifications

> Naming: components are `PascalCase` functions `fn(data, options) -> Node`, matching
> the existing convention. "Data" is plain objects sourced from lesson JSON (or derived
> in `presets.js`); components never read the store directly.

### 4.1 TeachingRail

- **Purpose:** the canonical SEE → BREAK → BUILD → TRANSFORM → CHECK progress element.
  Replaces the five separate renderers (D1). One component, three density variants so
  every preset and aspect uses the same code path.
- **Input data:**
  ```
  TeachingRail({
    steps: [{ key:'see', label?, text?, equation?, annotation?, note? }, …5],
    current: 0..5,              // 0 = nothing revealed
    variant: 'rail'|'rows'|'cards'|'headline',
    orientation: 'horizontal'|'vertical',   // default from aspect
    showText: boolean,         // hide sentences in tight/vertical space
  })
  ```
  `steps` is built from `lesson.steps` + `STEP_META`; `current` is `state.step`.
- **Variants:**
  - `rail` — compact horizontal 5-node track with connectors (replaces
    `StepProgress` + the footer chain + `index.html` chain).
  - `rows` — the full numbered list with explanation + math (replaces
    `DiscoveryStepper` / `DiscoveryStep`).
  - `cards` — five step-coloured cards in a row/grid (replaces `MethodCards`).
  - `headline` — just the current step, large (replaces `StepHeadline`).
- **Visual states (per node):** uses the shared vocabulary. `inactive` node = hollow
  ring in `--ui-border`; `active` = filled `--stage-color` + pulse + connector fills to
  this node; `complete` = filled + check; connector between complete nodes is solid
  `--stage-color`, otherwise `--ui-border-faint`.
- **Active/completed/inactive behaviour:** node `n` is `complete` when `n < current`,
  `active` when `n === current`, `inactive` when `n > current`. `current === 0` → all
  inactive. `current === 5` → all complete, none active.
- **Animation:** on `current` change, the newly-active node runs `anim-pop`, its
  connector runs a `--dur-slow` width/`scaleX` fill, the row/card runs `anim-slide-up`.
  `rail` connectors use `branch-draw`. No looping except the single active-node pulse.
- **OBS-safe sizing:** `rail` node ⌀ ≥ 1.6em, label `--fs-label`, hit-free (display
  only). `rows` min row height driven by `flex: 1 1 0` inside the board (already the
  pattern); math column never below `--fs-lg`. `cards` collapse to 1 column on
  `a9x16`/`a1x1` (mirrors current `.a9x16 .method-cards`). Connectors ≥ 4px.
- **Accessibility / readability:** wrap in `role="list"`, each node `role="listitem"`
  with `aria-current="step"` on the active one and an `aria-label` like
  `"Step 3 of 5, Build, complete"`. Colour always accompanied by the number and the
  label text. Contrast of label on wash ≥ 7:1 (wash capped at 14%).
- **Location:** `src/components/teaching-rail.js`. Styles in `src/styles/teaching.css`
  (`.trail`, `.trail__node`, `.trail__link`, `.trail--rail|rows|cards|headline`).
  `src/components/discovery.js` keeps `DiscoveryStepper`, `MethodCards`, `StepProgress`,
  `StepHeadline` as **one-line wrappers** that call `TeachingRail` with the right
  `variant`, so `presets.js` and the smoke test are untouched.

### 4.2 NumberJobs — WHOLE / SPLIT / TAKE

- **Purpose:** a small triad that names *what each number is doing* in the current
  operation, before any method is chosen. Pedagogic bridge between the scenario and
  BREAK. New concept; nothing like it exists today.
- **Input data:**
  ```
  NumberJobs({
    whole: { value, label? },        // the intact quantity
    split: { value|parts[], label? },// how it is divided (groups / denominator / addends)
    take:  { value, label? } | null,  // the part removed or focused; null when N/A
    operation: '+'|'−'|'×'|'÷'|null,
    active: 'whole'|'split'|'take'|null,
  })
  ```
  Sourced from a new optional `lesson.numberJobs` block (falls back to deriving from
  `lesson.facts` + `lesson.answer.work` when absent — derivation spec in
  `LESSON_CREATION.md` update, later phase).
- **Visual states:** three tiles in a row. Each tile: uppercase job name (`--fs-label`),
  the value (`--fs-value`), optional context label. Colour per `--job-*`. When `take`
  is `null` the component renders two tiles and widens them.
- **Active/completed/inactive:** `active` tile gets the wash + border + pulse; the
  others sit at `opacity: .55` (not the full `.2` — all three stay legible as a set).
  No `complete` check here — this is a framing device, not a progress device.
- **Animation:** tiles enter with `anim-slide-up` + stagger; changing `active` cross-
  fades the wash over `--tr-state`; the operation glyph between tiles fades in with
  `anim-fade`.
- **OBS-safe sizing:** tile min-width ≈ 8ch, value never below `--fs-xl`; row wraps to a
  vertical stack under ~28ch container (i.e. on `a9x16`/`a1x1` and preset F).
- **Accessibility:** `role="group"` `aria-label="What each number is doing"`; each tile
  `aria-label="Whole: 144 dollars"`. Job identity carried by the word, not only colour.
- **Location:** `src/components/number-jobs.js`; styles `.njobs`, `.njobs__tile`,
  `.njobs__op` in `teaching.css`. Placed in `presets.js` behind a new `L.story` /
  `L.math` guard (decide during Phase 2; default under `story`). Also registered as a
  diagram key `numberJobs` so it can appear via the control-panel diagram dropdown.

### 4.3 TransformationChain

- **Purpose:** the flagship **SAME VALUE → DIFFERENT FORM** component. Shows one value
  moving through equivalent forms, e.g.
  `20 ÷ 8  →  2 R4  →  2 4/8  →  2 1/2  →  2.5`.
- **Input data:**
  ```
  TransformationChain({
    links: [
      { form, label?, note?, equals?: boolean },   // form is LaTeX or friendly text
      …
    ],
    current: 0..links.length,     // how many links are revealed
    emphasis: 'value-constant',   // reserved; drives the "= all the way across" rule
    layout: 'flow'|'stack',       // horizontal arrows vs vertical
  })
  ```
  Sourced from a new optional `lesson.chain` block. When absent, `presets.js` can build
  a 2–3 link chain from `lesson.steps.build.equation` → `lesson.steps.transform.equation`
  → `lesson.answer` (keeps existing lessons working without JSON edits).
- **Visual states:** each link is a pill/card containing the rendered form. Between
  links, an arrow (`→`) with an optional micro-label ("same value", "÷ 4 top and
  bottom", "as a decimal"). A persistent thin baseline or a repeated `=` motif
  reinforces "value unchanged".
- **Active/completed/inactive:** link `i < current` = `complete` (full opacity); link
  `i === current-1` = `active` (wash in `--stage-transform`, pulse); links `≥ current`
  = `inactive` (`opacity: .2`, form hidden as `•••`). Arrows draw in only up to
  `current`.
- **Animation:** revealing a link: arrow runs `branch-draw` (`--dur-slow`), then the
  link runs `anim-pop`; the previous active link drops its wash over `--tr-state`.
  `stack` layout uses `anim-slide-up`. Optional one-time horizontal "sweep" highlight
  along the baseline when the final link appears (respects `no-anim`).
- **OBS-safe sizing:** `flow` layout on 16:9 only; auto-switches to `stack` when the
  container is narrower than ~46ch (so `a9x16`, `a1x1`, preset F always stack). Form
  text ≥ `--fs-xl`; arrow glyph ≥ `--fs-2xl`; horizontal scroll is never allowed — if
  more than 5 links don't fit, drop to `stack`.
- **Accessibility:** `role="list"`, `aria-label="Transformation chain: same value in
  different forms"`; each link `aria-label="Form 3 of 5: two and one half"`; arrows
  `aria-hidden`. Equivalence stated in text ("same value") not just implied by colour.
- **Location:** `src/components/transformation-chain.js`; styles `.tchain`,
  `.tchain__link`, `.tchain__arrow`, `.tchain__note`, `.tchain--flow|stack` in
  `teaching.css`. Registered as diagram key `transformationChain`. Natural home is
  preset D/H boards and a future "TRANSFORM" beat of presets A/B.

### 4.4 NumberBond

- **Purpose:** part–part–whole structure. Promotes the existing `NumberBond` diagram
  module to a stateful teaching component.
- **Input data:** keep the current `spec` shape and extend:
  ```
  NumberBond({
    total, parts:[…],           // existing
    labels?: [whole, …parts],
    reveal?: 'all'|'whole'|'parts'|n,   // progressive reveal
    highlightPart?: index|null,
  }, lesson)
  ```
- **Visual states:** whole circle top (`--job-whole`), part circles bottom (part 0
  `--ui-success`, others `--job-take`, matching current colours). `reveal` hides
  not-yet-shown circles as dashed `--ui-border` outlines with `?`. `highlightPart`
  adds the wash + pulse to one part.
- **Active/completed/inactive:** a circle is `complete` when its value is revealed,
  `inactive` (dashed `?`) before, `active` when it is the `highlightPart`.
- **Animation:** branches use the existing `branch-draw`; a revealed circle runs
  `anim-pop`; value text fades in. No change to the current draw timing.
- **OBS-safe sizing:** viewBox `460×250` retained; `.diagram svg { width:100% }` keeps
  it fluid. Circle value text is SVG `26px` on the 460-wide box ≈ readable ≥ 720px
  rendered — enforce a min rendered width via the board column, and bump to `30px` for
  1–2 parts. Stroke ≥ 4px (already).
- **Accessibility:** `<svg role="img" aria-label="Number bond: 100 splits into 60 and
  40">` (already present) — extend label to reflect `reveal` state.
- **Location:** stays in `src/modules/diagrams.js`, key `numberBond` unchanged; state
  props are additive and optional so `tools/smoke-test.mjs` still passes. Shared circle/
  label drawing helpers move to a small `src/modules/_svg.js` (private, additive).

### 4.5 FractionBarModel

- **Purpose:** show a fraction — and fraction *equivalence* — as a divided bar.
  Promotes `fractionBar`.
- **Input data:** keep `spec.rows` and extend:
  ```
  FractionBarModel({
    rows: [{ label?, denominator, shaded, color?: 'structure'|'transform'|… }],
    compareRows?: boolean,      // align two+ rows to the same width for equivalence
    reveal?: n,                 // reveal cells left-to-right up to n
    marker?: { row, at }        // a vertical "same amount" guide line across rows
  }, lesson)
  ```
- **Visual states:** cells use current `.fbar__cell.is-on` / `.is-on-alt`. Row 0
  structure-blue, row 1 transform-purple (already the alternating behaviour). Unrevealed
  cells sit at `--fill-1`. The `marker` draws a dashed vertical rule to show two
  different partitions cover the same length.
- **Active/completed/inactive:** cell `i < reveal` = filled (`complete`), `= reveal-1`
  = `active` (brief pulse), `≥ reveal` = empty. Whole rows dim to `opacity: .2` when
  `inactive` (e.g. the equivalent row before TRANSFORM).
- **Animation:** cells fill with the existing `anim-fade` + `--i` stagger; the
  equivalence marker draws with `branch-draw`.
- **OBS-safe sizing:** cell height `3.2em` retained; enforce a **max ~12 cells** before
  labels are dropped (`showNumbers:false`) to keep dividers ≥ 2px and cells tappable-
  wide on video. Stacked rows gap `--s-3`.
- **Accessibility:** wrap each row `role="img"` `aria-label="3 of 4 shaded, three
  quarters"`; equivalence marker `aria-label="same length as 1 of 2"`.
- **Location:** `src/modules/diagrams.js`, key `fractionBar` unchanged (alias
  `fractionBarModel` added to the registry pointing at the same fn).

### 4.6 NumberLine

- **Purpose:** magnitude, intervals, jumps, and "landing on the same point in a
  different form". Promotes `numberLine` (and stays compatible with `doubleNumberLine`).
- **Input data:** keep current `spec` (`min,max,ticks,marks[],jump{from,to,label}`) and
  extend:
  ```
  NumberLine({
    min, max, ticks, minorTicks?,
    marks: [{ value, label?, color?, state?: 'active'|'complete'|'inactive' }],
    jumps: [{ from, to, label?, state? }],   // was single `jump`
    reveal?: n                                // reveal marks/jumps in order
  }, lesson)
  ```
- **Visual states:** axis always full opacity. Each mark/jump follows the shared
  vocabulary via its `state` (or `reveal` index). `active` mark gets a larger dot +
  pulse; `inactive` mark is a hollow ring.
- **Animation:** jump arcs use `branch-draw` (already); marks `anim-pop`; labels
  `anim-fade`. Multiple jumps stagger by `--i`.
- **OBS-safe sizing:** viewBox `520×120` retained; `.svg-label` is `13px` on a 520 box —
  **raise to 15px** and `.svg-value` to 17px for video, and cap visible ticks at ~12
  (use `minorTicks` for the rest without labels). Arc height ≥ 12px so it reads after
  compression.
- **Accessibility:** `<svg role="img" aria-label="Number line 0 to 10, mark at 2.5">`;
  jump labels included in the description.
- **Location:** `src/modules/diagrams.js`, key `numberLine` unchanged; `doubleNumberLine`
  refactored to reuse the shared axis helper in `src/modules/_svg.js`.

### 4.7 PlaceValueBreakdown

- **Purpose:** decompose a number into place-value parts
  (`342 = 300 + 40 + 2`, or columns H | T | O), the backbone of SEE/BREAK for
  addition, subtraction, decimals, place value. **New** — no current module.
- **Input data:**
  ```
  PlaceValueBreakdown({
    value: number|string,
    places: ['hundreds','tens','ones'] | 'auto',
    form: 'columns'|'expanded'|'both',   // H|T|O grid, or 300 + 40 + 2, or both
    reveal?: n,                          // reveal places left-to-right
    regroup?: { from, to }               // optional "borrow/carry" arrow
  }, lesson)
  ```
- **Visual states:** `columns` = a small grid, each column headed by its place label
  (`--fs-label`, `--ui-text-muted`) with the digit below (`--fs-value`), tinted by a
  repeating structure/strategy/adjust cycle so adjacent places are distinguishable.
  `expanded` = `renderMath('300 + 40 + 2')`. `regroup` draws a curved arrow between two
  columns (reuses `branch-draw`).
- **Active/completed/inactive:** place `i < reveal` = `complete`; `= reveal-1` =
  `active` (wash + pulse); `≥ reveal` = `inactive` (digit shown as `_`).
- **Animation:** columns `anim-slide-up` + stagger; the `+` signs in `expanded` fade in
  after their operands; `regroup` arrow draws last.
- **OBS-safe sizing:** column min-width ≈ 2.5ch, digit ≥ `--fs-2xl`; max ~6 places
  before it switches to `expanded` only. On `a9x16`/`a1x1` prefer `expanded`.
- **Accessibility:** `role="img"` `aria-label="342 is 3 hundreds, 4 tens, 2 ones"`;
  `regroup` announced as "regroup 1 ten from tens to ones".
- **Location:** **new** `src/modules/diagrams.js` entry, registry key
  `placeValueBreakdown` (also add to `DIAGRAM_NAMES` — the control dropdown and smoke
  test pick it up automatically). Drawing helpers in `src/modules/_svg.js`.

### 4.8 EquationWorkspace

- **Purpose:** the single "worked equation" surface — a headline equation with optional
  caption, substitution line, and step-linked progressive display. Unifies
  `EquationCard` (discovery.js) and `EquationModule` (diagrams `equation`) (D4).
- **Input data:**
  ```
  EquationWorkspace({
    lines: [{ expr, kind?: 'given'|'work'|'result', note? }],  // 1..n
    caption?, size?: 'md'|'lg'|'xl',
    current?: n,             // reveal lines up to n; omit = show all
    display?: boolean        // KaTeX display mode (default true for lg/xl)
  })
  ```
  Back-compat: `EquationCard(expr, opts)` → `EquationWorkspace({ lines:[{expr}], … })`;
  diagrams `equation` key → same.
- **Visual states:** `given` line in `--ui-text-muted`, `work` in `--ui-text`, `result`
  in `--ui-success` with a subtle glow (`--sh-glow-green`). Unrevealed lines reserve
  space (`visibility:hidden`) so the block doesn't jump.
- **Active/completed/inactive:** line `i < current` `complete`; `= current-1` `active`
  (left border `--stage-color`); `≥ current` `inactive` (hidden). With no `current`,
  every line is `complete`.
- **Animation:** each revealed line `eq-reveal` (existing `mtd-slide-up`); the `result`
  line adds a one-shot `anim-pop`. Nothing loops.
- **OBS-safe sizing:** `md` = `--fs-2xl`, `lg` = `--fs-3xl`, `xl` = `--fs-4xl`
  (matches current `.equation-card`/`--lg`). Auto-drop one size on `a9x16`/`a1x1`
  (existing rule `.a9x16 .equation-card__eq{font-size:var(--fs-2xl)}` generalised).
  Never wider than the board column; long expressions wrap via KaTeX, no horizontal
  scroll.
- **Accessibility:** container `role="math"` where a single expression;
  `aria-label` with a spoken form when provided (`note`), else rely on KaTeX's own
  MathML output. Fallback pretty-printer already avoids raw LaTeX on screen.
- **Location:** `src/components/equation-workspace.js`; styles reuse `.equation-card*`
  plus new `.eqw__line--given|work|result` in `teaching.css`. `discovery.js`
  `EquationCard` and `diagrams.js` `EquationModule` become wrappers.

### 4.9 PromptCard

- **Purpose:** present the question / the "your turn" ask as its own deliberate beat —
  distinct from the scenario facts and from the quote. Generalises `ProblemCard`.
- **Input data:**
  ```
  PromptCard({
    kind: 'question'|'predict'|'try'|'notice',
    text,                     // the prompt itself
    context?,                 // one supporting line (e.g. the scenario in brief)
    hint?,                    // revealed separately
    revealHint?: boolean
  })
  ```
  Sourced from `lesson.question` / `lesson.headline` today; a richer optional
  `lesson.prompt` block later.
- **Visual states:** a panel (`--ui-panel`) with a small `kind` eyebrow
  (`"Question" / "Predict" / "Try it" / "What do you notice?"`) in `--ui-accent`, the
  prompt in `--fs-lg` `--font-ui`, optional `context` in `--ui-text-muted`. `hint`
  hidden until `revealHint`.
- **Active/completed/inactive:** `active` (presenter is asking) = accent left border +
  faint wash + optional pulse; `complete` (answered) = border neutralises, a small
  `--ui-success` check appears; `inactive` = `opacity:.2` (rare — usually always shown
  once reached).
- **Animation:** enter `anim-slide-up`; `hint` reveal `anim-fade`; state change
  `--tr-state`. No loop.
- **OBS-safe sizing:** min body text `--fs-md`; card max-width ~40ch so lines stay
  readable on video; on vertical canvases it spans full width. Keep off the bottom 12%
  (footer zone).
- **Accessibility:** `role="group"` `aria-label="Question"`; if used as a live ask,
  the mount point may set `aria-live="polite"` (opt-in, off by default — OBS has no AT,
  but the control-panel preview and audits benefit).
- **Location:** `src/components/prompt-card.js`; `core.js` `ProblemCard` delegates.
  Styles `.prompt`, `.prompt__eyebrow`, `.prompt__hint` in `teaching.css`.

### 4.10 AnswerReveal

- **Purpose:** the controlled reveal of a final answer — hidden → shown, with the
  existing "circled answer on taped paper" as one skin. Consolidates
  `PaperNote` + `AnswerRing` + the scattered `revealed` handling (D3).
- **Input data:**
  ```
  AnswerReveal({
    work?,                     // the expression that produces it
    value,                     // the answer
    unit?,
    revealed: boolean,         // from state.revealAnswer
    skin: 'paper'|'panel'|'inline',
    ring?: boolean             // draw the ellipse (paper skin default true)
  })
  ```
- **Visual states:**
  - `revealed === false` → placeholder: `= ?` at `opacity:.28` (current PaperNote
    behaviour), or a blurred/!dashed box for `panel` skin. No layout shift on reveal.
  - `revealed === true` → value at full size; `ring` draws the `--ui-success` ellipse
    (`ring-draw`); `unit` shown; optional `--sh-glow-green`.
- **Active/completed/inactive:** this component is binary (hidden/shown); it does not
  use the 3-state vocabulary. When its layer is off it is `hidden`.
- **Animation:** on `false → true`: `anim-pop` on the value, then `ring-draw` on the
  ellipse (`--dur-draw`). Under `no-anim` the ring is drawn instantly
  (`stroke-dashoffset:0`, already handled). Never animates `true → false` (just swaps).
- **OBS-safe sizing:** value ≥ `--fs-2xl` (`paper`/`panel`), ≥ `--fs-xl` (`inline`);
  ring stroke ≥ 5px (current). Paper skin keeps its ~`-0.6deg` tilt; disable the tilt
  on `a1x1` where space is tight.
- **Accessibility:** container `aria-live="polite"` so a reveal is announced once;
  `aria-label="Answer: 7 dollars 50 cents per hour"` when revealed, `"Answer hidden"`
  when not. Colour (green) always paired with the check glyph and the word "Answer".
- **Location:** `src/components/answer-reveal.js`; `discovery.js` `PaperNote` becomes
  `AnswerReveal({…, skin:'paper'})`. `ComparisonPanel` / preset G call `AnswerReveal`
  for their answer sub-region instead of bespoke markup. Styles: reuse `.paper-note*`,
  add `.areveal--panel|inline` in `teaching.css`.

---

## 5. Where everything lives (file plan)

No folders are renamed or moved. New files only:

```
src/
  components/
    steps.js                 (new) — re-exports STEP_META + step order as the single
                                     source; discovery.js re-exports for back-compat
    teaching-rail.js         (new) — §4.1
    number-jobs.js           (new) — §4.2
    transformation-chain.js  (new) — §4.3
    equation-workspace.js    (new) — §4.8
    prompt-card.js           (new) — §4.9
    answer-reveal.js         (new) — §4.10
    core.js                  (edit) — ProblemCard delegates to PromptCard
    discovery.js             (edit) — DiscoveryStepper/MethodCards/StepProgress/
                                      StepHeadline/EquationCard/PaperNote become
                                      thin wrappers; no signature changes
  modules/
    _svg.js                  (new) — shared axis/circle/grid helpers (private)
    diagrams.js              (edit) — numberBond/fractionBar/numberLine gain optional
                                      state props; add placeValueBreakdown, numberJobs,
                                      transformationChain, fractionBarModel(alias) to
                                      the registry
  styles/
    teaching.css             (new) — all new component CSS; token-only, no raw hex
    tokens.css               (edit) — additive: §3 alias layer + .bg-paper overrides
  app/
    (unchanged)
  controllers/
    (unchanged — the control panel keeps working; a later phase adds buttons)
```

HTML: add `<link rel="stylesheet" href="src/styles/teaching.css">` to `overlay.html`,
`control.html`, `index.html` (one line each).

`presets.js` is **not** restructured in this plan — the new components are dropped into
the existing `switch`/region model behind the existing `state.layers` flags in Phase 2,
one preset at a time, with `npm test` after each.

---

## 6. Non-goals / guardrails

- No React / Vue / Svelte / Tailwind / build step. `el()` + CSS tokens only.
- No change to `src/app/bus.js`, `server/server.js`, or the transport priority.
- No renaming of `DIAGRAMS` registry keys (lessons + smoke test depend on the strings).
- No change to `DEFAULT_STATE` shape in this phase (new optional lesson blocks —
  `numberJobs`, `chain`, `prompt` — are read with fallbacks; no migration needed).
- `tools/smoke-test.mjs` must stay at **1,152 passing** after every step. Wrappers keep
  old signatures so the existing test needs no edits; new components get added coverage
  in a later phase.
- Nothing may bypass `body.no-anim` / `prefers-reduced-motion` (no inline
  `style="animation:…"`).

---

## 7. Phase roadmap

| Phase | Deliverable |
| --- | --- |
| **1 (this doc)** | Inventory + component + token plan. **Approval gate.** |
| 2 | `tokens.css` alias layer + `teaching.css` skeleton + `steps.js`; `TeachingRail` with wrappers; `npm test` green. |
| 3 | `EquationWorkspace`, `AnswerReveal`, `PromptCard` + delegations. |
| 4 | `TransformationChain`, `NumberJobs` (+ registry keys, control dropdown). |
| 5 | Promote `NumberBond`, `FractionBarModel`, `NumberLine`; add `PlaceValueBreakdown`; shared `_svg.js`. |
| 6 | Wire components into presets A–H behind layer flags, one preset per commit. |
| 7 | Control-panel affordances for the new step/reveal/chain interactions. |
| 8 | Docs refresh (`COMPONENTS.md`, `DESIGN_SYSTEM.md`, `LESSON_CREATION.md`) + expand smoke test. |

---

*End of Phase 1 plan. Awaiting approval before any implementation.*
