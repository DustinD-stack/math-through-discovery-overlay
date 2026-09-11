# Math Through Discovery — Design System Handoff

```
Status:                 ACCEPTED BASELINE
Baseline:                A–G
Acceptance:              PASS WITH NON-BLOCKING ITEMS
Acceptance date:         2026-09-10
Engineering authority:   Production repository (src/, server/, *.html)
Design reference:        Penpot (00 — Foundations & System · 01 — Components ·
                         02 — Teaching Frames & Sequences)
Production target:       Browser / OBS Browser Source
Repository baseline:     e783303578c02d9f396f2318fa31dc3ea1705478  (commit before this document)
```

Wherever this document, `docs/FIGMA_BUILD_SPEC.md`, `docs/FIGMA_HANDOFF.md`, or Penpot
disagree with the code in `src/`, `server/`, `overlay.html`, `control.html` or
`preview.html` — **the production code wins**. This document records the accepted
design system; it does not define new behavior.

---

## 1. Product purpose

Math Through Discovery is a teaching system for learners from approximately 3rd grade
upward, including older learners rebuilding fundamentals they missed. It is built as an
OBS-ready overlay kit — the same lesson data drives a live stream, a recorded video, a
vertical short, and a static export — because the pedagogy, not the output format, is
the product.

The central idea the whole system serves:

> **Math gets easier when you start seeing the patterns.**

The interface exists to support reasoning and teaching, not to behave like a generic
dashboard or slide deck. Every component either shows a step of reasoning, names what a
number is doing, or makes an equivalence visible. Nothing on screen is decorative chrome
competing with the mathematics.

## 2. Teaching philosophy

The permanent five-stage reasoning framework, used everywhere in the codebase
(`src/components/steps.js`, `TeachingRail`) and never extended or shortened:

| Stage | What happens |
|---|---|
| **SEE** | Identify the whole, the structure, or what's being asked. Read the problem before doing anything to it. |
| **BREAK** | Split the quantity into friendlier, place-value, or part-whole pieces. |
| **BUILD** | Operate on the friendly pieces — the easy arithmetic the break made possible. |
| **TRANSFORM** | Recombine into a simpler equivalent form. This is where the value's *form* changes while its *amount* does not. |
| **CHECK** | Verify the answer by an independent route — a bound, an inverse operation, commutativity, or a second representation. |

The intellectual backbone underneath every lesson:

> **SAME VALUE. DIFFERENT FORM.**

A transformation is never presented as changing an amount — only its written shape. This
is stated in-product (`PhilosophyStrip`: "Same value → different form") and reinforced by
`TransformationChain`'s baseline tag and `PlaceValueBreakdown`'s decomposition.

Two supporting reasoning lenses (not additional stages):

- **WHOLE → SPLIT → TAKE** — names what each number in a problem is *doing* (the intact
  amount, how many equal parts it's divided into, how many of those parts we want).
  Implemented as the standalone `NumberJobs` component — see §17 for its schema boundary.
- **OBJECT → PICTURE → NUMBER / SYMBOL** — a representation should support reasoning at
  the level a learner needs: physical/concrete, a diagram (bar model, place-value
  columns, number bond, number line), or pure symbolic notation. Diagrams in
  `src/modules/diagrams.js` occupy the PICTURE stage between object and symbol.

These are teaching structures the production code is organized around, not decorative UI
labels — `steps.js`, `presets.js`, and every reasoning component read directly from them.

## 3. Curriculum / reasoning foundation

The design system is built to carry this progression (current and future lesson content
follows this order; no schema change is implied by this list):

1. Quantity & magnitude
2. Number bonds
3. Make 5 / Make 10
4. Place value
5. Equivalence
6. Compensation
7. Doubles / halves
8. Multiplicative structure
9. Division & sharing
10. Remainders as quantities
11. Fractions
12. Fractions ↔ decimals ↔ percent
13. Ratios & scaling
14. Unknowns & algebra
15. Estimation & checking

**Equivalence is the thread underneath all of it** — every topic above is, at some point,
an instance of "same value, different form": a number bond regroups a total; place value
decomposes a number; a fraction and a decimal name the same quantity; compensation
shifts an amount between two numbers without changing the sum or difference.

## 4. Design tokens

The production source of truth for every value is **`src/styles/tokens.css`** (with
`.bg-paper` in the same file re-pointing a subset for the light/paper background). Penpot
mirrors these natively as design tokens on page **00 — Foundations & System**:

**8 token sets / 105 tokens**, verified against `tokens.css` during Baseline F with no
transcription errors found:

| Set | Count | Contents |
|---|---|---|
| `mtd/color` | 50 | primitives, alpha ramp, step/stage/ui/job aliases |
| `mtd/color-paper` | 17 | `.bg-paper` override values (inactive set — alt light context) |
| `mtd/spacing` | 8 | `s-1`…`s-8` = 4 / 8 / 12 / 16 / 24 / 32 / 44 / 56 px |
| `mtd/radius` | 7 | `r-sm/md/lg/xl/pill` + `r-card`, `panel-radius` aliases |
| `mtd/border-width` | 3 | `bw-hair/thin/bold` = 1 / 2 / 3 px |
| `mtd/font-size` | 13 | `fs-xs`…`fs-4xl` + `fs-value`, `fs-value-lg`, `fs-label`, `fs-explain` aliases |
| `mtd/tracking` | 2 | `tr-wide` .06em, `tr-wider` .14em |
| `mtd/shadow` | 5 | `sh-1/2/3`, `sh-glow-yellow`, `sh-glow-green` |

Semantic families that matter for future component work:

- **Teaching stages** — `--stage-see/break/build/transform/check`, aliasing
  `--c-structure/correct/adjust/transform/discover` (blue / green / orange / purple /
  yellow). Any element carrying `.stage-<id>` exposes `--stage-color` to its subtree.
- **Number jobs** — `--job-whole` (structure blue), `--job-split` (transform purple),
  `--job-take` (adjust orange). Reinforce, never replace, the role word.
- **Core surfaces** — `--c-navy-900` `#070b14` (app background), `--c-board-2` `#10141d`
  (raised panel, aliased as `--ui-panel`), `--c-paper` `#f4f1e6` (paper mode).
- **Text** — `--t-hi/mid/low/faint` (white at 100/82/56/34%), aliased as
  `--ui-text/-muted/-faint`.
- **Borders** — `--line-1/2` (white at 10/18%), aliased as `--ui-border-faint/-border`.
- **Meaning primitives** — `--c-structure` blue, `--c-correct` green (also `--ui-success`),
  `--c-adjust` orange (`--ui-warning`), `--c-transform` purple, `--c-error` red
  (`--ui-error`), `--c-discover` yellow (`--ui-accent`), `--c-strategy` teal.
- **Studio background** — `.bg-studio` radial gradient `#0c121f → #070b14 → #04060c`
  (the endpoint `#04060c` is a `base.css` literal, not a token — has no Penpot token type).
- **Radii** — 6 / 12 / 18 / 26 / 999 px (`sm/md/lg/xl/pill`); panels use `r-lg`/`r-card`.
- **Key spacing** — the `s-1`…`s-8` scale above; layout gaps and paddings are always
  expressed as multiples of it.
- **Font-size scale** — a ~1.24 ratio scale, `fs-xs` 11.52px through `fs-4xl` 67.2px at a
  16px root (the 9:16/1:1 stages use a 15px root — see `base.css .stage.a9x16/.a1x1`).
- **Tracking** — `tr-wide` .06em (moderate uppercase), `tr-wider` .14em (labels/eyebrows).
- **Shadows/glows** — `sh-1/2/3` are ambient drop shadows of increasing depth;
  `sh-glow-yellow`/`sh-glow-green` are the "discovery highlight" and "confirmed correct"
  glows used on active/result states.

**Production token values in the repository (`src/styles/tokens.css`) remain
authoritative.** This document intentionally does not reproduce all 105 raw values —
`tokens.css` is the single file to edit to re-skin the system, and Penpot's `mtd/*` sets
are kept in sync with it by hand during design-system baselines.

## 5. Typography

Four accepted families, all present and verified in both the production font stack and
Penpot's font library:

| Family | Token | Role |
|---|---|---|
| **Archivo Narrow** | `--font-logo` | Headings, labels, eyebrows, step/method-card labels — the "signage" voice. Always paired with uppercase + tracking (`tr-wide`/`tr-wider`). |
| **Permanent Marker** | `--font-marker` | A single hand-marker accent (e.g. the paper-note topic stamp) — used sparingly, never for body copy. |
| **Caveat** | `--font-hand` | The hand-written feel for worked math and step annotations on the paper surface (`.paper-note__eq`, `.step__annot`, `.method-card__math`). |
| **Inter** | `--font-ui` | All body and UI text — prompts, descriptions, contextual copy. |

**Math rendering** goes through KaTeX (`src/utils/math-render.js`), not through the
`--font-math` token directly: `renderMath()` calls `window.katex.render()` when KaTeX has
loaded (`overlay.html`/`preview.html` load it from the jsDelivr CDN). If KaTeX is
unavailable — offline machine, blocked CDN — `renderMath()` falls back to a small
plain-text pretty-printer (`prettyPlain()`) so a lesson **never renders raw LaTeX source
on stream**. The `--font-math` token (`KaTeX_Main, Latin Modern Math, Cambria Math,
Georgia, serif`) documents the intended fallback stack for that plain-text path.

No new typography is introduced by this document.

## 6. Component inventory

All ten reusable components live in `src/components/` (plus `src/modules/diagrams.js`
for the three SVG visual models) and each has a canonical `MTD / <Name>` master plus a
`<Name> — STATES` reference board on Penpot page 01.

### TeachingRail — `src/components/teaching-rail.js`
- **Purpose:** the single canonical presentation of SEE→BREAK→BUILD→TRANSFORM→CHECK as
  one connected path, not five separate buttons.
- **Important states:** per-step `inactive` / `active` / `complete`, driven by a
  `current` pointer; four variants (`rail`, `rows`, `cards`, `headline`).
- **Teaching role:** always answers "where are we in the reasoning?"
- **Accessibility / non-color cue:** complete = `✓` glyph; active = digit in a solid
  ring; inactive = digit in a dashed/dim marker. Full `aria-label` per node
  ("Step 2 of 5, Break, in progress").
- **Production source:** `src/components/teaching-rail.js` + `steps.js`.

### PromptCard — `src/components/prompt-card.js`
- **Purpose:** presents a learner-thinking prompt as its own beat in the lesson.
- **Important states:** four real kinds — `question`, `predict`, `try`, `notice` — each
  with its own eyebrow label and accent; optional hidden `hint`.
- **Teaching role:** frames what the student is being asked to do before math starts.
- **Accessibility / non-color cue:** the eyebrow word (e.g. "Predict", "What do you
  notice?") is always shown, not implied by color alone.
- **Production source:** `src/components/prompt-card.js`.

### EquationWorkspace — `src/components/equation-workspace.js`
- **Purpose:** the reusable visual language for *working through* mathematics as a
  vertical flow, not just displaying a static equation.
- **Important states:** `given` / `work` / `result` line kinds; per-line
  `inactive`/`active`/`complete`; sizes `md`/`lg`/`xl`.
- **Teaching role:** shows the shape of a worked solution — one line at a time, without
  the block ever changing height (unrevealed lines keep their space).
- **Accessibility / non-color cue:** a `Given`/`Working`/`Result` tag word precedes the
  first line of each kind; `aria-current`/`aria-hidden` mirror state.
- **Production source:** `src/components/equation-workspace.js`.

### AnswerReveal — `src/components/answer-reveal.js`
- **Purpose:** the controlled reveal of the final answer as the *conclusion* of the
  reasoning, not an unrelated answer box.
- **Important states:** `revealed:false` shows a same-footprint placeholder (`= ?` / `?`);
  three skins — `paper` (taped slip + circled answer), `panel` ("So: …" conclusion),
  `inline` (compact `work = value`).
- **Teaching role:** confirms the answer only after the reasoning has been shown.
- **Accessibility / non-color cue:** placeholder glyphs (`?`) instead of blank space;
  `aria-live="polite"` announces the reveal; work/value have distinct type hierarchy.
- **Production source:** `src/components/answer-reveal.js`.

### NumberJobs — `src/components/number-jobs.js`
- **Purpose:** names what each number in a problem is *doing* — WHOLE / SPLIT / TAKE —
  before any method is chosen. See §17 for its lesson-schema boundary.
- **Important states:** `active` job emphasised; the other two are dimmed (`is-muted`),
  never hidden; `neutral` (no `active`) shows all three at equal weight.
- **Teaching role:** a reasoning-language aid, independent of any specific fraction/
  division/etc. method.
- **Accessibility / non-color cue:** the role word (`Whole`/`Split`/`Take`) is always
  rendered; color only reinforces it.
- **Production source:** `src/components/number-jobs.js`.

### TransformationChain — `src/components/transformation-chain.js`
- **Purpose:** makes SAME VALUE → DIFFERENT FORM visible as a chain of equivalent forms.
- **Important states:** progressive reveal (`current`); per-link `inactive`/`active`/
  `complete`; `flow` (horizontal) vs `stack` (vertical, forced above 5 links).
- **Teaching role:** the primary visual carrier of the equivalence thread.
- **Accessibility / non-color cue:** links are joined by `=` (never a bare arrow, which
  would imply the value changed); a baseline tag reads "same value [= <result>]"; hidden
  links show `•••` rather than disappearing.
- **Production source:** `src/components/transformation-chain.js`.

### NumberBond — `src/modules/diagrams.js`
- **Purpose:** the classic part-whole circle-and-lines model.
- **Important states:** known whole/parts; unknown whole; unknown part.
- **Teaching role:** primary representation for Make-10/Make-5 and part-whole reasoning.
- **Accessibility / non-color cue:** unknown values render as dashed circles with a `?`
  glyph (`stroke-dasharray`), not merely a different fill color; `+` labels the combine.
- **Production source:** `NumberBond()` in `src/modules/diagrams.js`.

### FractionBarModel — `src/modules/diagrams.js`
- **Purpose:** an equal-parts bar model for fractions and fractions-of-a-whole.
- **Important states:** selected/unselected cells; an equivalence "same length" guide row.
- **Teaching role:** the picture-stage representation for fraction lessons.
- **Accessibility / non-color cue:** selected cells render the glyph `■`, unselected `□`
  — never fill color alone.
- **Production source:** `FractionBar()` in `src/modules/diagrams.js`.

### NumberLine — `src/modules/diagrams.js`
- **Purpose:** a labelled number line supporting marks, jumps, and same-location
  equivalence (e.g. 1/2 = 2/4 = 0.5 stacked at one point).
- **Important states:** revealed/hidden jumps; active vs inactive marks.
- **Teaching role:** an independent confirmation representation (see Lesson 3, §12),
  and the home for negative/decimal number lines.
- **Accessibility / non-color cue:** active marks are filled and larger; inactive marks
  are hollow (`fill:none`) and dashed; every mark/jump carries a text label.
- **Production source:** `NumberLine()` in `src/modules/diagrams.js`.

### PlaceValueBreakdown — `src/components/place-value-breakdown.js`
- **Purpose:** shows a number as its place-value parts — one of the foundational BREAK
  moves.
- **Important states:** `columns` / `expanded` / `both` forms; per-column reveal state;
  optional `regroup` note between two columns.
- **Teaching role:** the primary representation for decomposition-based division and
  addition/subtraction across place value.
- **Accessibility / non-color cue:** the place-name word (`Hundreds`, `Tens`, `Ones`, …)
  is printed above every column, always — not inferred from position alone.
- **Production source:** `src/components/place-value-breakdown.js`.

## 7. Component state system

Accepted from Baseline C. The canonical reusable `MTD / <Name>` masters on Penpot page 01
remain the core components; each family's `<Name> — STATES` board is a **documentation**
reference showing the behavior below, not a second implementation:

| Component | States documented |
|---|---|
| TeachingRail | `inactive` / `active` / `complete` per step |
| PromptCard | the four real production kinds — `question`, `predict`, `try`, `notice` (no invented kinds) |
| EquationWorkspace | `given` / `work` (active/complete/inactive) / `result` |
| AnswerReveal | `hidden` / `revealed`, across the `paper` / `panel` / `inline` skins |
| NumberJobs | `neutral` (no emphasis) and each of `WHOLE` / `SPLIT` / `TAKE` active |
| TransformationChain | `complete` / `active` / `inactive` per link (equivalence never breaks) |
| NumberBond | known whole+parts / unknown-whole / unknown-part structures |
| FractionBarModel | selected / unselected cells, plus the equivalence "same length" guide |
| NumberLine | marks, jumps, and same-location equivalence labels |
| PlaceValueBreakdown | `columns` / `expanded` / `both` |

## 8. Responsive compositions

Three supported canvases, each a fixed-pixel stage the overlay scales to any viewport:

| Aspect | Canvas |
|---|---|
| 16:9 | 1920 × 1080 |
| 9:16 | 1080 × 1920 |
| 1:1 | 1080 × 1080 |

**Presenter behavior:**
- **16:9 presenter layouts** — a left camera column of **approximately 38%** of the
  width, with the teaching workspace occupying the remaining **~62%**.
- **9:16** — the presenter region sits **approximately in the lower 22%** of the frame
  height, below the teaching board (the board leads; the camera does not).
- **1:1** — **no presenter** at any time.

**Presenter OFF recomposition:** turning the presenter off on a preset that supports one
(A, C on 16:9; F on 9:16) collapses the grid to a single column, hides the camera
region, and re-centers the teaching workspace (16:9: `max-width: 62rem`, margin auto) —
**no dead camera rectangle is left on screen.**

## 9. Preset map

| Preset | Name |
|---|---|
| **A** | Presenter + Workspace |
| **B** | Workspace Focus |
| **C** | Presenter + Workspace |
| **D** | Pattern Breakdown |
| **E** | Visual Model Focus |
| **F** | Vertical / 9:16 |
| **G** | Quick Explanation |
| **H** | Whiteboard / Deep Work |

Aspect → preset availability:

- **16:9** — A / B / C / D / E / G / H
- **9:16** — F
- **1:1** — a square composition (no dedicated letter preset; presenter forced off, no
  rail, prompt → visual → result)

No preset beyond A–H exists or is planned by this document.

## 10. Production layout regions

Six composition regions, implemented as builder functions in `src/layouts/workspace.js`
and arranged (never re-implemented) by `src/layouts/presets.js`:

- **TopRail** — `TeachingRail(rail, current=state.step, compact)`; "where are we".
- **PromptRegion** — `PromptCard(kind:'question', …)`; gated on `layers.story`.
- **EquationRegion** — `EquationWorkspace(flow)`; lines derived from `lesson.steps` +
  `answer` by `deriveFlowLines()`.
- **VisualRegion** — the lesson's own diagram, or a derived `TransformationChain` when
  the lesson is plainly about equivalence; `deriveChain()` produces the chain.
- **ResultRegion** — `AnswerReveal`; gated on an existing `answer`.
- **PhilosophyStrip** — the persistent "Same value → different form" footer reminder.

These are composition regions inside the current layout architecture (`workspace.js` /
`presets.js`), not a separate runtime abstraction — no new architecture is introduced
here beyond what the code already implements.

## 11. Lesson sequence model

A lesson storyboard is presented as:

**SETUP → SEE → BREAK → BUILD → TRANSFORM → CHECK**

**SETUP is a presentation state — it is NOT a sixth reasoning stage.** The reasoning
system remains exactly five stages (SEE, BREAK, BUILD, TRANSFORM, CHECK); SETUP exists
only to present the problem before reasoning begins (rail shows no active stage there).

**State-change principle:** each state should preserve context from the one before it
wherever useful — avoid replacing the entire screen on every transition. A viewer should
be able to see, moving from one state to the next:

- what stayed the same
- what changed
- why it changed

## 12. Accepted reference lessons

Three lessons are accepted as the canonical demonstration of the reasoning system, each
verified mathematically and structurally during Baseline F.

### Lesson 1 — 3/8 of 20

```
WHOLE = 20        SPLIT = 8        TAKE = 3

20 ÷ 8 = 2 R4

2 R4
= 2 + 4/8
= 2 + 1/2
= 2.5

2.5 × 3 = 7.5

Therefore:  3/8 of 20 = 7.5

Check:  3/8 < 1/2, so the result should be less than 10.  7.5 < 10.  ✓
```

### Lesson 2 — 790 ÷ 2

```
790 = 700 + 90

700 ÷ 2 = 350
90 ÷ 2 = 45

350 + 45 = 395

Check:  395 × 2 = 790

Therefore:  790 ÷ 2 = 395
```

The zero ones-place remains **visible in the place-value columns** (Ones: 0) but is
**omitted from the expanded form** — `790 = 700 + 90`, never `700 + 90 + 0`
(`PlaceValueBreakdown`'s expanded form filters zero-value places).

### Lesson 3 — 7 + 5

```
5 = 3 + 2

7 + 3 = 10

10 + 2 = 12

Therefore:  7 + 5 = 12

Check:  5 + 7 = 12
```

The NumberLine confirmation (7 → +3 → 10 → +2 → 12) is **secondary** — Make 10 via the
NumberBond split remains the primary strategy; the number line only appears at CHECK.

## 13. Penpot structure

**Page 00 — Foundations & System**
`00.1` Foundations · `00.2` Design System · `00.3` Tokens · `00.4` Typography ·
`00.5` Surfaces & Colors

**Page 01 — Components**
`01.1` TeachingRail · `01.2` PromptCard · `01.3` EquationWorkspace · `01.4` AnswerReveal ·
`01.5` NumberJobs · `01.6` TransformationChain · `01.7` NumberBond ·
`01.8` FractionBarModel · `01.9` NumberLine · `01.10` PlaceValueBreakdown
— each containing its canonical `MTD / <Name>` master plus a `<Name> — STATES` reference.

**Page 02 — Teaching Frames & Sequences**
`02.1` 16x9 Teaching · `02.2` 9x16 Shorts · `02.3` 1x1 Square ·
`02.4` Lesson Sequences · `02.5` Experiments · `02.6` Approved for Dev

**`02.5 — Experiments` intentionally remains available for future exploratory work.**
Work placed there is exploration only — changes made in Experiments do not automatically
become part of the accepted production baseline; promoting something out of Experiments
is a separate, deliberate decision.

## 14. Production architecture

```
LESSON DATA  ->  STATE / TEACHING ENGINE  ->  UI COMPONENTS  ->  LAYOUTS  ->  ADAPTERS  ->  BROWSER / OBS
```

- **Lesson data** — JSON files in `lessons/*.json`, bundled to `lessons/lessons.bundle.js`
  by `npm run lessons` (`tools/build-lessons.cjs`).
- **State / teaching engine** — `src/app/state.js` (URL-param state, `DEFAULT_STATE`,
  `?lesson=&preset=&aspect=&bg=&step=&hide=`).
- **UI components** — `src/components/*.js`.
- **Layouts** — `src/layouts/workspace.js` (regions) + `src/layouts/presets.js`
  (composition per preset).
- **Adapters / browser / OBS** — `src/app/overlay-app.js`, `src/controllers/control-app.js`,
  `src/app/bus.js` (message bus), `server/server.js` (static file + WebSocket server).

**Verified communication mechanisms** (`src/app/bus.js`, `server/server.js`):

- **WebSocket** — the reliable transport for OBS Browser Source and LAN clients, at
  `ws://<host>/ws`; the server remembers the newest `state` message and replays it to
  every new connection so a Browser Source that reloads catches up automatically.
- **BroadcastChannel** — same-browser, cross-tab fallback.
- **postMessage** — targets and `window.parent`/`window.opener`, for embedded contexts.
- **localStorage** — a last-resort same-browser fallback (`LS_KEY`).

No communication mechanism is claimed here beyond what is present in `src/app/bus.js`
and `server/server.js`.

## 15. OBS integration

**Server:** `npm start` (equivalently `npm run dev`) → `node server/server.js`.
Verified output:

```
Math Through Discovery running at http://localhost:3000
Control: http://localhost:3000/control.html
Overlay: http://localhost:3000/overlay.html
WebSocket: ws://localhost:3000/ws
```

**Browser Source URL** must be `http://localhost:3000/overlay.html…` — **never**
`file:///…`. The `file://` bundled-lessons comment in `overlay.html` exists purely as an
offline fallback path; the production/OBS workflow is always the `http://` server.

**Page roles:**
- **`overlay.html`** — the actual OBS Browser Source: renders the current lesson state
  full-canvas, transparent-capable, driven entirely by the WebSocket/URL state.
- **`control.html`** — the presenter-facing controller: picks lesson/preset/aspect/step
  and broadcasts state changes over the same channel.
- **`preview.html`** — the component/lesson gallery used for design and engineering
  review (not part of the live OBS path).

**WebSocket state propagation** (verified live during Baseline F): a control client's
`state` message is broadcast to all connected overlay clients; a client that connects
late (e.g. OBS reloading a Browser Source) immediately receives the server's cached
`latestStateMessage` — no manual refresh is required to resynchronize.

**Manual OBS visual acceptance** (an actual Browser Source inside OBS, transparency
compositing over a live camera, presenter safe-zone framing against a real camera,
on-scene aspect switching) is a **human-only verification step** and has not been
performed by this milestone.

## 16. Accessibility / non-color language

| Component | Non-color cue |
|---|---|
| TeachingRail | `✓` (complete) / solid-ring digit (active) / dashed-dim digit (inactive) |
| NumberJobs | role words (`Whole`/`Split`/`Take`) always visible |
| NumberBond | `?` for unknowns, `+` for combine, dashed circles, branch geometry |
| FractionBarModel | `■` selected / `□` unselected glyphs |
| NumberLine | text labels on every mark/jump; hollow vs filled states |
| PlaceValueBreakdown | the place-name word above every column |
| EquationWorkspace | `Given` / `Working` / `Result` tag words |
| AnswerReveal | distinct text/value type hierarchy, `= ?` / `?` placeholders |
| TransformationChain | `=` joiners (never a bare arrow) + "same value" language |

**Color reinforces meaning. Color must never be the only carrier of meaning.** Every
state above has a shape, glyph, word, or structural cue that survives grayscale.

## 17. NumberJobs boundary

`NumberJobs` (`src/components/number-jobs.js`) is a reusable teaching/design component
that names WHOLE / SPLIT / TAKE for any problem with that structure.

**It is NOT currently automatically wired into production lessons** — the lesson schema
(`lessons/*.json`, `src/utils/lesson-loader.js`, `deriveFlowLines`/`buildStageContent`)
contains no `numberJobs` block, and no preset instantiates it from lesson data. Where it
appears in Penpot storyboards (e.g. Baseline E's `01 / See` frame) it is explicitly
labelled a **teaching reference**, not a rendered production region.

This is a factual boundary, not a limitation to "fix" here. Wiring `NumberJobs` into the
lesson schema — if ever wanted — is a **separate, future engineering milestone** that
would need its own schema design and test coverage.

## 18. Known non-blocking limitations

Carried forward from the verified Baseline F acceptance (no items added or removed):

- Penpot MCP plugin **2.15.4** against Penpot host **2.18.0** — no observed functional
  blocker during any baseline (A–F).
- A handful of Penpot text nodes (e.g. `TransformationChain`, `TeachingRail` labels) use
  exact literal font sizes rather than a native `fontSize` token binding, where binding
  every text node was impractical inside the MCP's ~30s response ceiling; the literals
  are source-exact. `PromptCard`, `EquationWorkspace`, and `NumberJobs` do carry native
  `fontSize`/`letterSpacing` bindings.
- The four SVG-based visual models (`NumberBond`, `FractionBarModel`, `NumberLine`,
  `PlaceValueBreakdown`) are imported into Penpot as SVG groups and retain exact source
  literals rather than per-primitive token bindings — Penpot has no native way to bind a
  token inside an imported SVG group's primitives.
- The Baseline E storyboard "reasoning region" (equation lines as styled text with an
  active-line accent bar and a green result line) is an **accepted design shorthand** for
  `EquationWorkspace(flow)` — it preserves the component's flow direction, active-line
  accent, result-success treatment, and dimmed-prior-line behavior, while compressing the
  per-line `Given`/`Working`/`Result` tag chrome into one section label. The full tag
  hierarchy remains fully specified on the Page 01 master and STATES board.
- Preset **E** ("Visual Model Focus"): the Baseline D storyboard frame caps the entire
  workspace column at a fixed width, where production only caps the *visual* child at
  `min(100%, 60rem)` (`.ws-col--visual`). Recorded as a minor representational looseness,
  not a mismatch — no code change was made because of it.
- **Manual OBS visual acceptance** (see §15) has not been performed and must be
  represented as outstanding, not passed, until a human confirms it against a real OBS
  Browser Source.

## 19. Design authority rules

- **Production code** (`src/`, `server/`, `overlay.html`, `control.html`,
  `preview.html`) = the engineering source of truth. When anything disagrees with it,
  the code wins.
- **Penpot** = the accepted visual/design reference — what the system is documented to
  look like, including its state matrices and responsive compositions.
- **`docs/DESIGN_SYSTEM_HANDOFF.md`** (this document) = the permanent architecture and
  design-system handoff — a snapshot of the accepted baseline, not a live spec.
- **`02.5 — Experiments`** = non-production exploration space. Changes made there do
  **not** automatically become production changes; promoting an experiment requires a
  deliberate, separate step.

## 20. Future lesson authoring

Every future lesson should identify, before any Penpot or code work begins:

1. Teaching goal
2. Starting quantity/problem
3. SEE moment
4. BREAK strategy
5. BUILD step
6. TRANSFORM / equivalence moment
7. CHECK strategy
8. Appropriate visual representation (bar model / place value / number bond / number
   line / transformation chain — chosen to support the reasoning, not decorate it)
9. Responsive requirements (which aspects/presets it needs to work in)
10. Presenter requirements (does it need a camera column at all?)

And ask, at every TRANSFORM and CHECK:

- **What stayed the same?**
- **What changed?**
- **Why did it change?**
- **How do we know the answer is reasonable?**

## 21. Verification commands

Only commands that exist in `package.json` are documented here:

```
npm test     node tools/smoke-test.mjs && node tools/ui-components.test.mjs
npm start    node server/server.js        (serves http://localhost:3000)
npm run dev  node server/server.js        (alias of start)
npm run lessons  node tools/build-lessons.cjs   (rebuild lessons.bundle.js)
```

There is no `npm run verify`, `npm run check`, or `npm run build` script — none is
invented here.

**Current verified test result** (re-run immediately before this document was written):

```
Rendered 1152 lesson/preset/aspect/step combinations.
All combinations rendered cleanly.
UI component tests: 427 assertions passed.
```
0 failures, 0 warnings.

## 22. Acceptance record

| Baseline | Scope | Result |
|---|---|---|
| A | Foundations | PASS |
| B | Component Masters | PASS |
| C | States / Token Binding | PASS |
| D | Responsive Compositions | PASS |
| E | Lesson Storyboards | PASS |
| F | Design ↔ Code ↔ OBS Acceptance | PASS WITH NON-BLOCKING ITEMS |
| G | Final Handoff | PASS *(this document; see the Baseline G report for the frozen commit hash and tag)* |

The commit that adds this file is the frozen baseline commit for Design System v1;
its hash and the `design-system-v1-accepted` tag are recorded in the Baseline G report.
