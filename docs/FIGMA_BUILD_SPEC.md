# Figma build spec — Math Through Discovery — UI System

Exact construction blueprint for completing the Figma file
`Math Through Discovery — UI System`
(`figma.com/design/TiEoTqFtnIe6GKxhBOc70x`).

- **Engineering source of truth:** `src/styles/tokens.css` + `src/styles/teaching.css`
  (+ `src/layouts/workspace.js`, `src/layouts/presets.js`, `src/styles/layouts.css`,
  `src/modules/diagrams.js`, `src/components/*.js`).
- **This document = faithful transcription only.** No value here is invented; every
  number traces to a repo file cited inline. Redesign happens in a later phase.
- **Units:** the overlay scales rem against a stage root of **16px** on 1920×1080 and
  **15px** on 1080×1920 / 1080×1080 (`src/styles/base.css` `.stage.a*`). All px in this
  doc are at the **16px** root unless noted. Build Figma frames at literal pixel sizes.
- **Repo state when written:** HEAD `41c704cb1cd83cd00415278be30ae505e9792b64`,
  working tree clean.

---

## PART 1 — CURRENT FIGMA STATE  ·  **DO NOT RECREATE ANY OF THIS**

### Pages (3 — Starter plan hard cap)

| Page id | Name |
| --- | --- |
| `0:1` | `00 — Foundations & System` (renamed from the default "Page 1") |
| `6:2` | `01 — Components` |
| `6:3` | `02 — Teaching Frames & Sequences` |

### Sections (21 — empty organizational containers, stacked vertically from y=0)

| Page | Section id → name | size (w×h) | v-gap |
| --- | --- | --- | --- |
| `0:1` | `6:4` 00.1 — Foundations · `6:5` 00.2 — Design System · `6:6` 00.3 — Tokens · `6:7` 00.4 — Typography · `6:8` 00.5 — Surfaces & Colors | 2200×1300 | 240 |
| `6:2` | `6:9` 01.1 — TeachingRail · `6:10` 01.2 — PromptCard · `6:11` 01.3 — EquationWorkspace · `6:12` 01.4 — AnswerReveal · `6:13` 01.5 — NumberJobs · `6:14` 01.6 — TransformationChain · `6:15` 01.7 — NumberBond · `6:16` 01.8 — FractionBarModel · `6:17` 01.9 — NumberLine · `6:18` 01.10 — PlaceValueBreakdown | 2600×1500 | 260 |
| `6:3` | `6:19` 02.1 — 16x9 Teaching · `6:20` 02.2 — 9x16 Shorts · `6:21` 02.3 — 1x1 Square · `6:22` 02.4 — Lesson Sequences · `6:23` 02.5 — Experiments · `6:24` 02.6 — Approved for Dev | 2800×2400 | 300 |

### Variable collections (7) — **DO NOT RECREATE**

| Collection | id | mode | vars | Notes |
| --- | --- | --- | --- | --- |
| `MTD / Color · Dark` | `VariableCollectionId:8:2` | `Dark` | 44 | 15 `primitive/*` + 9 `alpha/*` ({r,g,b,a}) + 20 `semantic/*` (aliases) |
| `MTD / Color · Paper` | `VariableCollectionId:8:27` | `Paper` | 44 | same names; `.bg-paper` values; aliases resolve inside this collection |
| `MTD / Spacing` | — | `Base` | 8 | `s-1`…`s-8` FLOAT px (rem in description) |
| `MTD / Radius` | — | `Base` | 6 | `r-sm`…`r-pill` + `r-card`→`r-lg` alias |
| `MTD / Border` | — | `Base` | 3 | `bw-hair/thin/bold` |
| `MTD / Font Size` | — | `Base` | 9 | `fs-xs`…`fs-4xl` FLOAT px (rem in description) |
| `MTD / Type` | — | `Base` | 5 | `lh-tight/snug/body`, `tr-wide/wider` |

**119 variables total.** Every variable's `description` holds its CSS var name + exact value(s).
Starter plan allows **only 1 mode per collection** → colour is split into `· Dark` and `· Paper` rather than one collection with two modes.

### Effect styles (5) — **DO NOT RECREATE**

`MTD / Shadow / sh-1`, `MTD / Shadow / sh-2`, `MTD / Shadow / sh-3`,
`MTD / Glow / yellow`, `MTD / Glow / green` (all `DROP_SHADOW`, values in Part 2 · 00.3).

### Completed boards

| Where | Node | Status |
| --- | --- | --- |
| Section `6:8` (00.5) | board `9:2` "Semantic colour system" | **COMPLETE** — teaching stages, number jobs, surfaces, text, borders/lines/fills, 7 meaning primitives, paper-treatment note. **Do not rebuild.** |
| Section `6:6` (00.3) | board `10:2` "Token system" | **PARTIAL** — has header/native-variable note + Spacing + Radius + Border-width groups. **Do not recreate those.** Missing: Shadows, Glows, Motion, Z-index (Part 2 · 00.3). |

### Fonts — verified available in this Figma environment (`listAvailableFontsAsync`)

| Family | Styles present | Missing weights vs CSS |
| --- | --- | --- |
| **Archivo Narrow** | Regular, Medium, SemiBold, Bold (+ italics) | none (CSS uses 400/600/700 → Regular/SemiBold/Bold) |
| **Permanent Marker** | Regular only | CSS only ever uses 400 — OK |
| **Caveat** | Regular, Bold only | CSS asks 600/700 in places → use **Bold** |
| **Inter** | full range | style strings: **"Semi Bold"** / **"Extra Bold"** (with space) |
| **KaTeX_Main** (`--font-math`) | **NOT AVAILABLE** | equations render via KaTeX in-app. In Figma: use a mathematical serif (Computer Modern / STIX / Georgia) as a **clearly-labelled fallback**, or flatten rendered equations to images. Do not silently substitute. |

---

## PART 2 — PAGE 00 COMPLETION SPEC

Shared build conventions for every Page 00 board:
Auto Layout **VERTICAL**, fill `primitive/navy-900` `#070b14`, padding L/R **72**, T/B **64**,
itemSpacing **44**, x=80 y=80 inside its section. Title = Archivo Narrow Bold **26px** `#ffffff`.
Group = VERTICAL, itemSpacing 6–12, title = Archivo Narrow Bold **13px** `alpha/t-low`
(uppercase). Body text = Inter Regular **12–13px** `alpha/t-low`. Value text = Inter Regular
12px `primitive/discover` `#ffd23f`.

### 00.1 — Foundations  (section `6:4`)  ·  build a board, 4 reference blocks

Board title: `FOUNDATIONS`. One VERTICAL Auto Layout, itemSpacing 44.

Each block = VERTICAL Auto Layout, itemSpacing 12, padding 24, fill `alpha/fill-1`
(`rgba(255,255,255,.04)`), corner radius `r-md` 12, stroke 1px `alpha/line-1`
(`rgba(255,255,255,.10)`), width HUG (~1400 max via a FIXED 1400 wrapper if needed).

| Block | Eyebrow (Archivo Narrow Bold 13px, `--tr-wider` .14em, uppercase, `alpha/t-low`) | Headline (Archivo Narrow Bold 32px `#ffffff`) | Body (Inter Regular 14px `alpha/t-mid`, `--lh-body` 1.45, max-width ~72ch) |
| --- | --- | --- | --- |
| 1 · Reasoning path | `THE REASONING PATH` | `SEE → BREAK → BUILD → TRANSFORM → CHECK` (arrows `--font-ui`, colour `alpha/t-faint`; each word tinted with its stage colour — SEE `#4aa3ff`, BREAK `#57c86a`, BUILD `#ff9d3d`, TRANSFORM `#b07bff`, CHECK `#ffd23f`) | "One continuous line of thinking, not five buttons. SEE: what do I notice? BREAK: what can I take apart? BUILD: what can I build from the pieces? TRANSFORM: same value, more useful form? CHECK: does the result make sense?" (verbatim prompts from `src/components/steps.js`) |
| 2 · Core principle | `THE PRINCIPLE` | `SAME VALUE → DIFFERENT FORM` (headline; arrow `#ffd23f`, "different form" `alpha/t-low`) | "See the pattern. Change the form. Keep the value. Expressed by the TRANSFORM step and by TransformationChain — but not hard-coded into any component, so each stays reusable." (`steps.js` header comment) |
| 3 · Number jobs | `WHAT EACH NUMBER IS DOING` | `WHOLE → SPLIT → TAKE` (WHOLE `#4aa3ff`, SPLIT `#b07bff`, TAKE `#ff9d3d`) | "WHOLE — the amount we start with.  SPLIT — how many equal parts the whole is divided into.  TAKE — how many of those equal parts we want.  The words are primary; colour only reinforces." (verbatim from `src/components/number-jobs.js` `JOB`) |
| 4 · Representation progression | `HOW WE REPRESENT` | `OBJECT → PICTURE → NUMBER / SYMBOL` (Inter Semi Bold 28px `#ffffff`; arrows `alpha/t-faint`) | "The teaching progression the visual models support: a concrete OBJECT (bar, bond, counters), then a PICTURE / diagram of it, then the NUMBER or SYMBOL. NumberBond / FractionBarModel / NumberLine / PlaceValueBreakdown live at the PICTURE stage; EquationWorkspace and TransformationChain at NUMBER / SYMBOL." *(progression stated by the task; component placement is factual from the repo.)* |

Approx board size: **~1500 × ~1400**.

### 00.2 — Design System  (section `6:5`)  ·  index board

Board title: `DESIGN SYSTEM — BASELINE`. VERTICAL Auto Layout, itemSpacing 32.

1. **Index list** — VERTICAL Auto Layout, itemSpacing 10. Four rows, each a HORIZONTAL
   Auto Layout (itemSpacing 20, counterAxis CENTER): a 12px dot in the item's accent +
   Inter Semi Bold 16px `#ffffff` name + Inter Regular 13px `alpha/t-low` locator.

   | Name | Accent dot | Locator text |
   | --- | --- | --- |
   | Foundations | `#ffd23f` | `Page 00 · Section 00.1` |
   | Tokens | `#4aa3ff` | `Page 00 · Section 00.3 · 7 variable collections, 119 variables, 5 effect styles` |
   | Typography | `#b07bff` | `Page 00 · Section 00.4 · Archivo Narrow / Permanent Marker / Caveat / Inter` |
   | Surfaces & Colors | `#57c86a` | `Page 00 · Section 00.5 · COMPLETE` |

2. **Notes** — two stacked cards, each VERTICAL Auto Layout, padding 20, fill `alpha/fill-1`,
   radius `r-md` 12, stroke 1px `alpha/line-1`:
   - Card A — Inter Semi Bold 13px `alpha/t-low` label `ENGINEERING SOURCE OF TRUTH` +
     Inter Regular 13px `#ffffff` body: **"src/styles/tokens.css + src/styles/teaching.css"**
   - Card B — label `FIGMA BASELINE` + body:
     **"faithful transcription only — redesign happens later."**

No design principles beyond the two note strings. Approx size **~1200 × ~700**.

### 00.3 — Tokens  (section `6:6`)  ·  **append to existing board `10:2` only**

Existing board `10:2` already has: header/native-variable note, `SPACING`, `RADIUS`,
`BORDER WIDTH`. **Do not recreate.** Append these four groups (each: VERTICAL Auto Layout,
itemSpacing 12, title Archivo Narrow Bold 13px `alpha/t-low` uppercase):

**Group `SHADOW & GLOW · effect styles (not variables)`** — 5 rows. Each row = HORIZONTAL
Auto Layout, itemSpacing 28, counterAxis CENTER, padding T/B 14:
a **150×84** rectangle, fill `primitive/board-2` `#10141d`, corner radius `r-md` 12, with
the matching **effect style applied** + Inter Regular 13px two-line label.

| Effect style | CSS token | DROP_SHADOW (offset x,y · blur · spread · color) |
| --- | --- | --- |
| `MTD / Shadow / sh-1` | `--sh-1` | `0, 2 · 10 · 0 · rgba(0,0,0,.35)` |
| `MTD / Shadow / sh-2` | `--sh-2` | `0, 10 · 30 · 0 · rgba(0,0,0,.45)` |
| `MTD / Shadow / sh-3` | `--sh-3` | `0, 22 · 60 · 0 · rgba(0,0,0,.55)` |
| `MTD / Glow / yellow` | `--sh-glow-yellow` | `0, 0 · 22 · 0 · rgba(255,210,63,.30)` — `#ffd23f`@30% |
| `MTD / Glow / green` | `--sh-glow-green` | `0, 0 · 22 · 0 · rgba(87,200,106,.28)` — `#57c86a`@28% |

(all from `tokens.css` lines 93–97.)

**Group `MOTION · documented, no native Figma primitive`** — one Inter Regular 13px
`alpha/t-hi`@.85 multi-line TEXT node, max-width 960, verbatim values from `tokens.css`
lines 100–106:

```
--dur-fast   180ms      micro-feedback (hover / press in the control panel)
--dur-base   340ms      the standard state transition  (--tr-state = --dur-base --ease-out)
--dur-slow   620ms      connector fills, chain links
--dur-draw   900ms      "drawing" effects — answer ring, number-bond branches, jump arcs
--stagger    90ms       delay between sibling reveals (element carries --i)
--ease-out   cubic-bezier(.16,.84,.28,1)     enter / settle
--ease-soft  cubic-bezier(.34,.9,.32,1)      pop / spring

Classroom-paced: one idea at a time; nothing loops except one optional active-step pulse.
All motion is nullified by body.no-anim and @media (prefers-reduced-motion).
Keyframe classes (animations.css): mtd-fade, anim-pop, eq-reveal, ring-draw, branch-draw.
```

**Group `Z-INDEX LAYERS · documented`** — one TEXT node, verbatim from `tokens.css` 109–118:

```
--z-bg 0 · --z-presenter 10 · --z-story 20 · --z-math 30 · --z-discovery 40
--z-compare 50 · --z-takeaway 60 · --z-brand 70 · --z-stamp 80 · --z-controls 90
```

**Group `TYPOGRAPHY TOKENS (sizes only — full specimen in 00.4)`** — one TEXT node listing
the `--fs-*` scale (px @16 root) + `--lh-*` + `--tr-*` (table repeated in 00.4).

### 00.4 — Typography  (section `6:7`)  ·  build a board + text styles

Board title: `TYPOGRAPHY`. VERTICAL Auto Layout, itemSpacing 44.

**A · Font-size scale** — one group, 9 rows. Each row = HORIZONTAL Auto Layout,
itemSpacing 32, counterAxis BASELINE: a specimen "Ag" in **Inter Regular** at the size,
`#ffffff` + Inter Regular 13px `alpha/t-low` meta `--fs-xx · <rem> · <px>px · <bound var>`.

| Token | rem | px @16 | px @15 (9:16 / 1:1) | Figma var (`MTD / Font Size`) |
| --- | --- | --- | --- | --- |
| `--fs-xs` | 0.72 | 11.52 | 10.80 | `fs-xs` |
| `--fs-sm` | 0.86 | 13.76 | 12.90 | `fs-sm` |
| `--fs-base` | 1.00 | 16.00 | 15.00 | `fs-base` |
| `--fs-md` | 1.18 | 18.88 | 17.70 | `fs-md` |
| `--fs-lg` | 1.45 | 23.20 | 21.75 | `fs-lg` |
| `--fs-xl` | 1.85 | 29.60 | 27.75 | `fs-xl` |
| `--fs-2xl` | 2.40 | 38.40 | 36.00 | `fs-2xl` |
| `--fs-3xl` | 3.20 | 51.20 | 48.00 | `fs-3xl` |
| `--fs-4xl` | 4.20 | 67.20 | 63.00 | `fs-4xl` |

Intent aliases (note only): `--fs-value` = `--fs-2xl`, `--fs-value-lg` = `--fs-4xl`,
`--fs-label` = `--fs-xs`, `--fs-explain` = `--fs-sm`.

**B · Line-height & tracking** — one TEXT node:
`--lh-tight 1.08 · --lh-snug 1.28 · --lh-body 1.45  (unitless multipliers)` ·
`--tr-wide .06em · --tr-wider .14em  (letter-spacing)`.
Component line-heights actually used (teaching.css): `1` (labels), `1.25` (equations,
`.eqw__expr` / `.tchain__form`), `1.3`–`1.35` (notes, prompts), `1.4`–`1.45` (captions, hint).

**C · The four families + roles** — one group, one specimen card per family
(VERTICAL Auto Layout, padding 20, fill `alpha/fill-1`, radius `r-md`, stroke 1px `alpha/line-1`):
a large specimen line in the family + Inter Regular 13px `alpha/t-low` role notes.

| CSS var | Family | Figma styles to use | Weights in code | Teaching role (from actual `teaching.css` / `components.css` usage) |
| --- | --- | --- | --- | --- |
| `--font-ui` | **Inter** | Regular / Medium / Semi Bold / Bold | 400·500·600·700 | **Interface & supporting text** — prompt text, explanations, step text, table body, `.eqw__tag`?→no (logo), `.njobs__desc`, `.tchain__label` / `.tchain__base-tag`, `.prompt__eyebrow` (600), `.trail__marker` digit (700), `.pvb__digit` (700), NumberJobs `.njobs__value` (700), SVG `.svg-value` (700) / `.svg-label` (400). |
| `--font-logo` | **Archivo Narrow** | SemiBold / Bold | 600·700 | **Uppercase labels & wordmark** — `.trail__label`, `.eqw__tag`, `.njobs__name`, `.pvb__place`, `.areveal__lead`, footer step chain, brand wordmark, section eyebrows. Always `text-transform: uppercase`, `letter-spacing: --tr-wider`. |
| `--font-marker` | **Permanent Marker** | Regular | 400 | **Teaching headings & marks** — board `.section-title` (components.css), the `=` joiner in `.tchain__join`, `.balance__eq`, stamps. Loud, hand-lettered. |
| `--font-hand` | **Caveat** | Regular / **Bold** (no Medium/SemiBold in Figma) | 400 (·600·700→Bold) | **Handwritten reasoning & annotations** — `.eqw__note`, `.tchain__note`, `.prompt__hint`, `.pvb__regroup`, `.areveal__unit` (panel), `.svg-hand` (jump labels), `.fbar-row__label`, the taped `.paper-note` math. "The printed interface states the structure; the handwriting shows a person working the problem." |
| `--font-math` | **KaTeX_Main** | — **(missing in Figma)** | — | **Equations** — everything `renderMath()` outputs: `.eqw__expr`, `.tchain__form`, `.paper-note__eq`, `.areveal__value`, diagram numerals. Fallback: label a mathematical serif clearly, or use flattened equation images. |

**D · Text styles to create** (name → family/style/size/tracking/case):

| Style name | Family · style | Size | Tracking | Case | Mirrors |
| --- | --- | --- | --- | --- | --- |
| `MTD/Label/xs` | Archivo Narrow · Bold | 11.52 | +0.14em | UPPER | `.trail__label`, `.eqw__tag`, `.pvb__place`, `.areveal__lead` |
| `MTD/Label/md` | Archivo Narrow · Bold | 18.88 | +0.14em | UPPER | `.njobs__name` |
| `MTD/Wordmark/lg` | Archivo Narrow · Bold | 23.20 | +0.02em | UPPER | brand line 2/3 |
| `MTD/Heading/marker-2xl` | Permanent Marker · Regular | 38.40 | 0 | UPPER | board `.section-title` |
| `MTD/UI/base` | Inter · Regular | 16 | 0 | none | body |
| `MTD/UI/md` | Inter · Regular | 18.88 | 0 | none | `.scenario__q`, prompt context |
| `MTD/UI/lg` | Inter · Regular | 23.20 | 0 | none | `.prompt__text`, `.areveal--panel .areveal__work` |
| `MTD/UI/explain-sm` | Inter · Regular | 13.76 | 0 | none | `.eqw__caption`, `.njobs__desc`, notes |
| `MTD/UI/eyebrow` | Inter · Semi Bold | 11.52 | +0.14em | UPPER | `.prompt__eyebrow`, `.tchain__label` |
| `MTD/Value/2xl` | Inter · Bold | 38.40 | 0 | none | `.njobs__value`, `.areveal--panel .areveal__value` |
| `MTD/Value/digit-3xl` | Inter · Bold | 51.20 | 0 | none | `.pvb__digit` |
| `MTD/Hand/note-sm` | Caveat · Regular | 13.76 | 0 | none | `.eqw__note`, `.tchain__note`, `.prompt__hint` |
| `MTD/Hand/quote-2xl` | Caveat · Regular | 38.40 | +0.01em | none | `.quote-card__text`, `.paper-note` |
| `MTD/Math/expr-2xl` *(fallback serif)* | serif · Regular | 38.40 | 0 | none | `.eqw__expr`, `.tchain__form` |

Approx board size **~1600 × ~2000**.

### 00.5 — Surfaces & Colors  ·  **COMPLETE — do not rebuild.**

Board `9:2` already contains all of it (see Part 1). No spec.

---

## PART 3 — PAGE 01 COMPONENT BLUEPRINT

Global conventions:
- Each component master = a **FRAME** inside its section (`6:9`…`6:18`), VERTICAL Auto
  Layout, fill `primitive/navy-900` `#070b14` (dark) with a paper twin using
  `MTD / Color · Paper` `primitive/navy-900` (same `#070b14`) but its children swapped
  to the Paper collection; padding 48; title = `MTD/Heading/marker-2xl` or `MTD/Label/md`.
- **Bind** fills/strokes/radii/spacing to the variables in Part 1 wherever a token exists.
- rem→px at 16px root. `color-mix(in srgb, X n%, transparent)` → in Figma, X at n% opacity.
- `--i` staggered `mtd-fade` (opacity 0→1, 340ms, 90ms step) is a **prototype/Smart-Animate
  note**, not a static property.
- Source of every value: `src/components/<file>.js` (structure) + `src/styles/teaching.css`
  (style) unless noted.

---

### 01.1 — TeachingRail  (`6:9`)

- **PURPOSE:** the one canonical presentation of SEE→BREAK→BUILD→TRANSFORM→CHECK as a
  single connected path ("not five buttons"). Reusable — takes any ordered `steps` + a
  `current` pointer.
- **SOURCE:** `src/components/teaching-rail.js`, `src/components/steps.js`; CSS
  `teaching.css` §1 (lines 30–185).
- **VARIANTS:** `rail` (default, the design target), `rows` (legacy DiscoveryStepper),
  `cards` (legacy MethodCards), `headline`. Build **`rail`** as the master; note the other
  three are legacy compositions rendered by `discovery.js` wrappers.
- **STRUCTURE (`rail`):** `<ol.trail.trail--rail.trail--horizontal>` → 5 × `<li.trail__node.stage-{id}.is-{state}>`
  → `<span.trail__marker>` (digit or ✓) + `<span.trail__label>` (SEE…CHECK) +
  `<span.trail__prompt>` (the step question; hidden when `showText:false`).
- **AUTO LAYOUT:** container HORIZONTAL, itemSpacing **0**, align start; each node
  `flex: 1 1 0` → in Figma: 5 equal columns, node = VERTICAL Auto Layout, itemSpacing
  `--s-2` **8**, padding L/R `--s-2` **8**, align CENTER, text-align center.
  Vertical orientation (`trail--vertical`) → node becomes HORIZONTAL, itemSpacing `--s-3`
  **12**, padding T/B `--s-2` **8**, align start.
- **CONNECTOR:** `::before` on every node except first — a **3px** line, centred on the
  marker (`top: 1.05em`), spanning the gap between markers. Colour `--ui-border-faint`
  `rgba(255,255,255,.10)`; becomes `--stage-color` when the node is `is-complete` or
  `is-active` (the "lit path"). Build as a rectangle behind the markers.
- **MARKER:** `2.1em` circle (at `--fs-base` 16 → **33.6px**), `display:grid;place-items:center`,
  font `700 --fs-base/1 --font-ui` (Inter Bold 16), border `--bw-bold` **3px** `--ui-border`,
  fill `--ui-panel` `#10141d`, text `--ui-text-muted`.
  - Compact (`.r-rail--compact`, used in production): marker **1.7em** (~27px), border
    `--bw-thin` **2px**, font `--fs-sm` 13.76; node gap → `--s-1` **4px**;
    `.trail__prompt` **display:none**; `.trail__label` font-size **0.62rem** (~10px).
    On `.a9x16` the compact marker shrinks further to **1.5em** and the label to
    **0.55rem**. (layouts.css lines 209–213, 279–280)
- **LABEL:** `700 --fs-label(11.52)/1 --font-logo` (Archivo Narrow Bold), `--tr-wider`
  +0.14em, UPPERCASE, `--ui-text-muted`.
- **PROMPT:** `400 --fs-explain(13.76)/1.3 --font-ui`, `--ui-text-muted`, max-width `18ch`.
- **STATES** (per node, `n` vs `current`; `n<current`→complete, `n===current`→active, else inactive):

  | State | Marker | Label | Connector into node |
  | --- | --- | --- | --- |
  | `is-inactive` | dashed border, `opacity .45`, shows digit | `opacity .5` | faint (`--ui-border-faint`) |
  | `is-active` | solid border `--stage-color`, `transform: scale(1.1)`, halo `0 0 0 4px color-mix(--stage-color 24%)`, text `--ui-text`, shows digit | colour `--stage-color` | lit (`--stage-color`) |
  | `is-complete` | filled disc `background: --stage-color`, text `#0a0d14`, shows **✓** (U+2713) | colour `--ui-text` | lit (`--stage-color`) |

  `--stage-color` per node = SEE `#4aa3ff` / BREAK `#57c86a` / BUILD `#ff9d3d` /
  TRANSFORM `#b07bff` / CHECK `#ffd23f` (`semantic/stage-*`).
- **WIDTH/HEIGHT:** container FILL width; height HUG. Nodes equal-width (`1 1 0`).
- **PADDING / GAP:** see Auto Layout above. No radius/border on the container.
- **RESPONSIVE:** on `.a9x16` / `.a1x1` a horizontal rail auto-switches to a vertical
  stack (nodes become rows, connector becomes vertical `3px` on the left). Production
  passes `orientation:'vertical'` explicitly on 9:16.
- **ACCESSIBILITY / NON-COLOUR CUES:** three visually distinct marker treatments
  (dashed-hollow / haloed-hollow-enlarged / filled) + glyph swap (digit ↔ ✓) + opacity —
  state never depends on colour alone. `role=list` / `listitem`, `aria-current="step"` on
  active, `aria-label` "Step 3 of 5, Build, in progress. What can I build from the pieces?".
- **FIGMA VARIANTS to build:** `state=inactive/active/complete` (single node) ×
  `density=full/compact` × `orientation=horizontal/vertical` × `theme=dark/paper`, plus
  one **assembled 5-node rail** at `current = 0,1,2,3,4,5` (6 frames) so the "lit path"
  progression is visible.

---

### 01.2 — PromptCard  (`6:10`)

- **PURPOSE:** a learner-thinking beat — QUESTION / PREDICT / TRY / NOTICE. Reusable, takes
  plain text.
- **SOURCE:** `src/components/prompt-card.js`; CSS `teaching.css` §4 (lines 312–346);
  built on the `.panel` primitive (`components.css`).
- **STRUCTURE:** `<div.prompt.prompt--{kind}.panel.is-{state}?>` → `.prompt__eyebrow` +
  `.prompt__text` + `.prompt__context?` + `.prompt__hint?[hidden]`.
- **PANEL BASE** (`components.css` `.panel`): background
  `linear-gradient(180deg, --c-board-2, --c-board)` → in Figma a vertical gradient
  `#10141d → #0b0e14`; border `--bw-hair` **1px** `--line-2` `rgba(255,255,255,.18)`;
  radius `--panel-radius` = `--r-lg` **18px**; shadow `--sh-2`; padding `--s-5` **24px**.
- **PROMPT ADDITIONS:** `border-left: --bw-bold 3px solid var(--prompt-accent)`;
  Auto Layout VERTICAL, gap `--s-2` **8px**.
- **ACCENT per kind** (`--prompt-accent`): question `--c-structure` `#4aa3ff` ·
  predict `--c-adjust` `#ff9d3d` · try `--c-strategy` `#35d0c4` · notice `--c-discover` `#ffd23f`.
- **TYPOGRAPHY:**
  - eyebrow — `600 --fs-label(11.52)/1 --font-ui` (Inter Semi Bold), `--tr-wider`,
    UPPERCASE, colour = `--prompt-accent`. Text per kind: `Question` / `Predict` /
    `Try it` / `What do you notice?` (verbatim `KIND` map).
  - text — `400 --fs-lg(23.2)/1.35 --font-ui`, `--ui-text`. `{braced}` spans → `.hl-number`
    (font-weight 700 + a marker-swipe highlight, see `animations.css .hl-number`).
  - context — `400 --fs-explain(13.76)/1.45 --font-ui`, `--ui-text-muted`.
  - hint — `400 --fs-explain(13.76)/1.45 --font-hand` (Caveat), `--ui-text`, with a
    `border-top: 1px dashed --ui-border`, padding-top `--s-2` **8px**. Hidden until `revealHint`.
- **STATES:** `is-active` → `box-shadow: --sh-2, inset 0 0 0 1px color-mix(--prompt-accent 40%)`.
  `is-complete` → `--prompt-accent` becomes `--ui-success` `#57c86a`.
  `is-inactive` → `opacity .45`. Default (no state) = resting.
- **WIDTH:** HUG content, practical max ~**40ch** (~520px at 16px). Full-width on 9:16 / 1:1.
- **FIGMA VARIANTS:** `kind = question/predict/try/notice` × `hint = hidden/revealed`
  × `state = default/active/complete` × `theme = dark/paper`.

---

### 01.3 — EquationWorkspace  (`6:11`)

- **PURPOSE:** working *through* mathematics — GIVEN ↓ WORK ↓ RESULT as a vertical flow
  with per-line reveal that never shifts the layout.
- **SOURCE:** `src/components/equation-workspace.js`; CSS `teaching.css` §2 (lines 187–258).
- **VARIANTS:** `flow` (default — the design target), `card` (legacy single-expression
  passthrough — `.equation-card` in components.css). Build **`flow`**.
- **STRUCTURE:** `<div.eqw.eqw--flow.eqw--{size}?>` → `<ol.eqw__lines>` → N ×
  `<li.eqw__line.eqw__line--{kind}.is-{state}>` → `.eqw__tag?` (first line of a kind-run)
  + `.eqw__expr` (KaTeX) + `.eqw__note?`. Optional `.eqw__caption` after the list.
- **AUTO LAYOUT:** `.eqw--flow` VERTICAL, gap `--s-3` **12px**, `justify-items:center`.
  `.eqw__lines` VERTICAL, gap `--s-2` **8px**, centred.
  `.eqw__line` VERTICAL, gap `--s-1` **4px**, padding `--s-2 --s-4` (**8px / 16px**),
  radius `--r-md` **12px**, `border-left: --bw-bold 3px solid transparent`.
- **CONNECTOR:** `.eqw__line + .eqw__line::before` = a "↓" (U+2193) glyph, `--font-ui` 1em,
  colour `--ui-text-faint`, centred, sitting `~0.55em + 8px` above the line. Build as a
  small text node between lines.
- **KIND treatments:**

  | kind | tag text | `.eqw__expr` colour | line background / effect |
  | --- | --- | --- | --- |
  | `given` | `Given` | `--ui-text-muted` | none |
  | `work` | `Working` | `--ui-text` | none |
  | `result` | `Result` | `--ui-success` `#57c86a` | bg `color-mix(--ui-success 12%)`, `box-shadow: --sh-glow-green` |

  tag = `700 --fs-label(11.52)/1 --font-logo` (Archivo Narrow Bold), `--tr-wider`, UPPER,
  `--ui-text-muted` (result tag → `--ui-success`).
- **EXPR sizes** (`--fs` of `.eqw__expr`, line-height 1.25): `md` → `--fs-2xl` **38.4** ·
  `lg` (`.eqw--lg`) → `--fs-3xl` **51.2** · `xl` (`.eqw--xl`) → `--fs-4xl` **67.2**.
  On `.a9x16`/`.a1x1`: xl→`--fs-3xl`, lg→`--fs-2xl`, md→`--fs-xl` **29.6**.
- **NOTE:** `400 --fs-explain(13.76)/1.3 --font-hand` (Caveat), `--ui-text-muted`.
- **CAPTION:** `400 --fs-explain/1.4 --font-ui`, `--ui-text-muted`, centred.
- **STATES** (`current` = revealed-line count; `i<current-1`→complete, `i===current-1`→active,
  `i>=current`→inactive):
  - `is-active` → `border-left-color: --ui-accent` `#ffd23f` (focus accent, *not* a stage
    colour — keeps the component reusable).
  - `is-inactive` → `visibility: hidden` **but keeps its box** → in Figma: render the line
    at **0% opacity, same size/position** so nothing below moves (the no-jump guarantee).
  - complete → plain.
- **WIDTH:** `max-width:100%`, `min-width:0`; content HUG, centred.
- **NON-COLOUR CUES:** GIVEN/WORKING/RESULT tag words; the ↓ flow connector; result also
  carries a glow + tint. `role=group` "Worked solution"; each line `aria-label`
  "Working, line 2 of 4"; `aria-current` on active; `aria-hidden` on inactive.
- **FIGMA VARIANTS:** `size = md/lg/xl` × `current = given only / +1 work / all / result-lit`
  × `theme = dark/paper`. Plus the `card` legacy shape as a labelled reference.

---

### 01.4 — AnswerReveal  (`6:12`)

- **PURPOSE:** the final answer as the *conclusion* of the reasoning (connector leads in;
  value lit/circled in the confirmed colour). Hidden state holds the same footprint.
- **SOURCE:** `src/components/answer-reveal.js`; CSS `teaching.css` §3 (lines 260–310);
  `paper` skin reuses `.paper-note*` (`components.css`).
- **SKINS:** `paper` (legacy taped slip — default), `panel` ("So: …" conclusion box —
  the production default in A/B/C/D/E/F), `inline` (compact `work = value`, used by H).
- **panel STRUCTURE:** `<div.areveal.areveal--panel.is-{revealed|hidden}>` →
  `.areveal__flow` ("↓") + `.areveal__lead` ("So:") + `.areveal__work?` +
  `.areveal__value` (value or "?") + `.areveal__unit?`.
- **panel AUTO LAYOUT:** VERTICAL(ish) grid, `justify-items:center`, gap `--s-2` **8px**,
  padding `--s-4 --s-5` (**16px / 24px**), radius `--r-card` = `--r-lg` **18px**,
  border `--bw-hair` **1px** `--ui-border`, background `--ui-panel-quiet`
  (`rgba(255,255,255,.04)`), text-align center. min-width `min(100%, 24rem)` (**384px**).
- **panel STATES:**
  - `is-hidden` → value = `.areveal__q` "?" at `opacity .4`; resting border/bg.
  - `is-revealed` → border `color-mix(--ui-success 55%)`, bg `color-mix(--ui-success 10%)`,
    `box-shadow: --sh-glow-green`; `.areveal__value` colour → `--ui-success`.
- **panel TYPOGRAPHY:** flow "↓" `400 --fs-lg(23.2)/1 --font-ui` `--ui-text-faint`;
  lead `700 --fs-label(11.52)/1 --font-logo` `--tr-wider` UPPER `--ui-text-muted`;
  work `--fs-lg` `--ui-text-muted`; value `--fs-2xl(38.4)`, `display:inline-block`,
  padding `.1em .55em`, `--ui-text` → `--ui-success` when revealed;
  unit `400 --fs-md/1 --font-hand` `.08em` UPPER `--ui-text-muted`.
- **paper skin** (`.paper-note`): background `linear-gradient(180deg,#fbf7ea,#ece5d2)`,
  colour `--c-paper-ink` `#1b1b18`, padding `--s-5 --s-4`, `transform: rotate(-.6deg)`,
  box-shadow `--sh-2`, radius 2px; a **92×26** tape rect (`--tape` `rgba(214,186,120,.85)`)
  centred at top rotated ~-2°. `.paper-note__eq` + `.paper-note__answer` (Caveat,
  `--fs-2xl`). Revealed → **AnswerRing**: an SVG ellipse, `viewBox 0 0 240 90`,
  `cx120 cy45 rx112 ry38`, `stroke: --c-correct`, `stroke-width 5`, `rotate(-2)`, drawn via
  `ring-draw` (dash animation → Figma: a hand-drawn ellipse outline, stroke `#57c86a` 5px).
  Hidden → "= ?" at `opacity .28`.
- **inline skin:** `inline-flex`, baseline-aligned, gap `.25em`, `--fs-lg`;
  work `--ui-text-muted`, " = " separator, value 700 `--ui-text` → `--ui-success` when
  revealed / `--ui-text-faint` when hidden ("?").
- **WIDTH:** panel HUG to min 384px; inline HUG; paper ~fixed ratio slip.
- **NON-COLOUR CUES:** "So:" lead word + ↓ connector; hidden shows literal "?" / "= ?";
  green is always paired with the glyph + word. `aria-live="polite"`,
  `aria-label` "Answer: 7.5 per hour" / "Answer hidden".
- **FIGMA VARIANTS:** `skin = paper/panel/inline` × `state = hidden/revealed` × `theme = dark/paper`.

---

### 01.5 — NumberJobs  (`6:13`)

- **PURPOSE:** names what each number is *doing* — WHOLE / SPLIT / TAKE — before a method
  is chosen. The words are primary; `--job-*` colour only reinforces.
- **SOURCE:** `src/components/number-jobs.js`; CSS `teaching.css` §5 (lines 348–425).
- **STRUCTURE:** `<ol.njobs.njobs--{row|stack}.njobs--n{2|3}>` → 2–3 ×
  `<li.njobs__job.njobs__job--{whole|split|take}.is-{rest|active|muted}>` →
  `.njobs__value` (+`.njobs__context?`) + `.njobs__name` + `.njobs__desc`.
- **LAYOUT:** container grid — `njobs--row.njobs--n3` = 3 equal columns, `njobs--n2` = 2,
  `njobs--stack` = 1; gap `--s-3` **12px**. On `.a9x16`/`.a1x1` a `row` auto-collapses to
  a single column with each tile in a `auto 1fr` two-column (value beside text).
- **TILE:** grid `justify-items:center`, gap `--s-1` **4px**, text-align center,
  padding `--s-3 --s-3 --s-4` (**12 / 12 / 16**), border `--bw-hair` **1px** `--ui-border`,
  **`border-top: --bw-bold 3px solid var(--job)`**, radius `--r-md` **12px**,
  background `--ui-panel-quiet`. Stack/narrow tiles use `border-left` instead of `border-top`.
- **`--job` per tile:** whole `--job-whole` `#4aa3ff` (→ `--c-structure`) ·
  split `--job-split` `#b07bff` (→ `--c-transform`) · take `--job-take` `#ff9d3d` (→ `--c-adjust`).
- **TYPOGRAPHY:** value `700 --fs-2xl(38.4)/1 --font-ui` (Inter Bold), colour `var(--job)`,
  inline-flex baseline, gap `.25em`; context `400 --fs-sm(13.76)/1 --font-ui` `--ui-text-muted`;
  name `700 --fs-md(18.88)/1 --font-logo` (Archivo Narrow Bold), `--tr-wider`, UPPER,
  `--ui-text`; desc `400 --fs-explain(13.76)/1.35 --font-ui`, `--ui-text-muted`, max-width `26ch`.
- **Fixed role strings** (`JOB` map, verbatim): Whole — "The amount we start with." ·
  Split — "How many equal parts the whole is divided into." ·
  Take — "How many of those equal parts we want." (`desc` overridable per call; `name` fixed).
- **STATES** (`active` prop):
  - none → all tiles `is-rest` (equal weight).
  - `active = <id>` → that tile `is-active`: bg `color-mix(var(--job) 14%)`,
    `box-shadow: 0 0 0 2px color-mix(var(--job) 45%), --sh-2`, `transform: translateY(-2px)`;
    the **other two → `is-muted` `opacity .55`** (dimmed, **not hidden** — still readable).
- **WIDTH:** container `max-width:100%`; tiles equal in a row.
- **NON-COLOUR CUES:** the role WORD (uppercase, always shown) + the full description
  sentence + top-border thickness. `role=list` "What each number is doing"; per-tile
  `aria-label` "Whole: 20. The amount we start with."; `aria-current="true"` on active.
- **FIGMA VARIANTS:** `count = 2/3` × `active = none/whole/split/take` × `layout = row/stack`
  × `theme = dark/paper`. Example data: 3/8 of 20 → whole `20`, split `8` (context "parts"),
  take `3`. Non-fraction twin → whole `$144`, split `4` (context "people"), take `1`.

---

### 01.6 — TransformationChain  (`6:14`)

- **PURPOSE:** makes SAME VALUE → DIFFERENT FORM visible — ordered forms joined by "="
  (never a bare arrow) sitting on an equivalence baseline tagged "same value".
- **SOURCE:** `src/components/transformation-chain.js`; CSS `teaching.css` §6 (lines 427–567).
- **STRUCTURE:** `<div.tchain.tchain--{flow|stack}>` → `<ol.tchain__links>` → N ×
  `<li.tchain__link.is-{state}>` → `.tchain__join?` ("=" / "→") + `.tchain__form` (KaTeX or
  "•••") + `.tchain__label?` + `.tchain__note?`; then `<div.tchain__base>` →
  `.tchain__base-tag` ("same value" / "same value = <title>").
- **LAYOUT:** `.tchain` position relative, `max-width:100%`, `padding-bottom: --s-5` **24px**
  (room for the baseline tag).
  - `flow` — `.tchain__links` = **flex row wrap**, gap `--s-2 --s-3` (**8 / 12**). Never
    horizontal-scrolls: it wraps. Auto-switches to `stack` when **> 5 links** or on
    `.a9x16`/`.a1x1`.
  - `stack` — flex column, gap `--s-4` **16px**, links left-aligned.
  - link — grid `justify-items:center` (flow) / start (stack), gap `--s-1` **4px**,
    padding `--s-2 --s-3` (**8 / 12**), radius `--r-md` **12px**, `border: 1px solid transparent`.
- **JOIN ("="):** `400 --fs-xl(29.6)/1 --font-marker` (Permanent Marker), `--ui-text-muted`;
  absolutely positioned in the gap before its link (flow: to the left; stack: above).
  `--arrow` modifier (only when `equals:false`) → `--font-ui`, `--ui-text-faint`, "→".
- **FORM:** `--fs-xl(29.6)/1.25`, `--ui-text`. Hidden form = `.tchain__hidden` "•••"
  `--ui-text-faint`, letter-spacing .1em.
- **LABEL:** `600 --fs-label(11.52)/1 --font-ui`, `--tr-wide` +0.06em, UPPER, `--ui-text-muted`.
- **NOTE:** `400 --fs-explain(13.76)/1.3 --font-hand` (Caveat), `--ui-text-muted`.
- **BASELINE (`.tchain__base`):** flow → a **`--bw-thin` 2px** top border
  `color-mix(--ui-success 60%)` running the chain's width, sitting at the bottom
  (`height: --s-5`). stack → a 2px **left** border, full height. The path visually
  belongs to one value.
- **BASE-TAG:** `600 --fs-label(11.52)/1 --font-ui`, `--tr-wider`, UPPER,
  colour `--ui-success` `#57c86a`, background `--ui-bg` `#070b14` (knocks out the baseline
  behind it), padding `0 --s-2`. flow → sits at the left end, `top: -0.55em`. stack →
  rotated 180°, `writing-mode: vertical-rl`, bottom-left.
- **STATES** (`current` = revealed link count; mirrors EquationWorkspace):
  - `is-active` (newest revealed) → `border-color: --ui-accent` `#ffd23f`,
    bg `color-mix(--ui-accent 10%)`.
  - `is-inactive` → form shows "•••"; `.tchain__label` / `.tchain__note` `visibility:hidden`;
    the join into it `opacity .25`. Box is **kept** (no jump).
  - complete → plain.
- **NON-COLOUR CUES:** "=" joiners (never "→"); the persistent baseline; the literal words
  "same value" on the tag; the group `aria-label` "…: the same value in different forms".
  Per-link `aria-label` "Form 3 of 5: two and one half, as a fraction. the remainder is 4 eighths."
- **FIGMA VARIANTS:** `layout = flow/stack` × `current = partial/full` × `theme = dark/paper`;
  plus a `>5 links` example proving auto-stack. Canonical example (from `preview.html` +
  `transformation-chain.js` header): links `20 ÷ 8` · `2 R4` (note "4 left over, out of a
  group of 8") · `2 + 4/8` (note "4 out of 8 = four eighths") · `2 + 1/2` (note "4/8 = 1/2")
  · `2.5`; title `2.5`.

---

### 01.7 — NumberBond  (`6:15`)

- **PURPOSE:** part–part–whole — the pieces combine to make the **same** whole.
- **SOURCE:** `src/modules/diagrams.js` `NumberBond` (registry key `numberBond`,
  unchanged); rich/stateful branch + `teaching.css` §7 `.nb__*` (lines 576–578);
  shared helpers `src/modules/_svg.js`. It is an **SVG** module.
- **SVG CANVAS:** `viewBox 0 0 460 250` (rich: `0 0 460 276`). `w=460 h=250`, `cx=230`,
  whole circle `cy=46 r=40`, part circles `cy=196 r=40`, parts evenly spaced
  `x = 460/(n+1) · (i+1)`.
- **ELEMENTS:** branch **lines** cx→each part (`stroke --line-2`, width 3, round caps,
  class `branch-draw`); **whole circle** (`stroke --c-structure` `#4aa3ff`, width 4);
  **part circles** (part 0 `stroke --c-correct` `#57c86a`, others `--c-adjust` `#ff9d3d`,
  width 4); **numerals** `font: 700 26px --font-ui` `fill --t-hi` (rich uses **30px** when a
  value is unknown); rich adds **"+" glyphs** between adjacent parts (`700 22px --font-ui`
  `fill --t-low`) as the non-colour "combine" cue, and optional **sub-labels** under each
  circle (`.svg-label` = `400 13px --font-ui` `fill --t-low`).
- **STATES (rich):** per circle —
  - `is-inactive` (not yet revealed / unknown) → `stroke-dasharray 5 7`, `opacity .5`,
    text shows **"?"**.
  - `is-active` (`highlightPart`) → `stroke-width 6`, `fill: color-mix(stroke 16%)`,
    plus `.nb__circle.is-active { filter: drop-shadow(0 0 6px color-mix(--c-discover 55%)) }`.
  - `is-complete` (revealed) → solid stroke, `fill:none`, shows the number.
  - `reveal`: `'whole'` (only whole), `'parts'` (only parts), a **number** (first n parts),
    `'all'`/undefined; `unknownWhole:true` hides the whole. `labels: [wholeLabel, ...partLabels]`.
- **WIDTH/HEIGHT:** wrapped in `.diagram` (`display:grid; gap --s-3`); `svg { width:100%; height:auto }`.
- **NON-COLOUR CUES:** dashed vs solid strokes, "?" for unknowns, "+" between parts,
  sub-labels, larger numerals for unknowns. `role="img"`, `aria-label` "Number bond. Whole
  10. parts 7, 3. the parts combine to the whole".
- **FIGMA VARIANTS:** `7 + 3 = 10` · `20 = 16 + 4` · `342 = 300 + 42` · an **unknown part**
  (`10` ↙↘ `?` `3`) · `highlightPart` on the whole · `reveal = whole / parts / n`.
  Theme dark/paper (`_svg` colours are CSS vars → swap collection).

---

### 01.8 — FractionBarModel  (`6:16`)

- **PURPOSE:** a whole → equal partitions → selected partitions; with an equal-length guide
  so `1/2 = 4/8` is **seen** before it is calculated.
- **SOURCE:** `src/modules/diagrams.js` `FractionBar` (registry key `fractionBar`, alias
  `fractionBarModel`); rich branch + `teaching.css` §7 `.fbar*--rich`, `.fbar__guide*`
  (lines 580–604); legacy bar styling `src/styles/diagrams.css` `.fbar` / `.fbar__cell`.
- **STRUCTURE (rich):** `<div.fbar-stack.fbar-stack--rich>` → per row
  `<div.fbar-row.fbar-row--rich.is-{active|muted}?>` → `.fbar-row__label` (Caveat `--fs-lg`)
  + `<div.fbar.fbar--rich>` → `denominator` × `<div.fbar__cell …>` (+ optional `.fbar__guide`).
- **BAR:** flex row, full width, `border --bw-thin 2px --line-2`, radius `--r-sm` **6px**,
  `overflow:hidden`. Cell: `flex:1 1 0`, **height `3.2em`** (`--font-ui` context), grid
  centre, `border-right --bw-hair 1px --line-2` (last none), `font: 600 --fs-sm/1 --font-ui`,
  base bg `--fill-1`, base text `--t-low`.
- **CELL STATES:** selected → `.is-on` (row 0) bg `color-mix(--c-structure 62%)` text `#fff`,
  or `.is-on-alt` (odd rows) bg `color-mix(--c-transform 62%)`; glyph **"■"**.
  unselected → glyph **"□"** (or `1/denominator` when `showNumbers`).
  pending (`i >= reveal`) → `.is-pending` `opacity .3` + a 45° `repeating-linear-gradient`
  hatch (`--fill-1` 5px / transparent 5px); empty content.
- **ROW STATES:** `is-active` → `outline: --bw-thin 2px solid --ui-accent`, offset 3px,
  radius `--r-sm`. `is-muted` → `opacity .5`.
- **EQUAL-LENGTH GUIDE (`marker:true`):** a `.fbar__guide` — vertical **`--bw-thin` 2px
  dashed** line in `--ui-success` `#57c86a`, positioned `left: (shaded/denom)·100%`, extends
  6px above/below the bar; row 0 carries a `.fbar__guide-tag` "same length"
  (`600 --fs-label/1 --font-ui`, `--tr-wide`, UPPER, `--ui-success`).
- **NON-COLOUR CUES:** ■ vs □ glyphs in every cell; hatch pattern for pending; the dashed
  guide + literal "same length" tag; row `role="img"` `aria-label` "3/8: 3 of 8 parts selected".
- **FIGMA VARIANTS:** single row `3/8` (`■■■□□□□□`) · equivalence pair `1/2` (`■■■■□□□□`) over
  `4/8` (`■■■■□□□□`) with `marker` guide · a 3-row set `2/4 = 3/6 = 1/2` **only if it stays
  legible at width — otherwise keep to two rows** · `reveal = n` (pending cells) ·
  `activeRow` · theme dark/paper.

---

### 01.9 — NumberLine  (`6:17`)

- **PURPOSE:** magnitude / intervals / jumps; and **different form, same location**
  (`1/2`, `2/4`, `0.5` at one point) — a visual proof of SAME VALUE → DIFFERENT FORM.
- **SOURCE:** `src/modules/diagrams.js` `NumberLine` (registry key `numberLine`); rich
  branch + `teaching.css` §7 `.nline__mark.is-active` (line 607); `_svg.js`
  (`arcPath`, `fmtNum`); legacy SVG classes `diagrams.css` `.svg-axis/grid/label/value/hand`.
- **SVG CANVAS (rich):** `w=560`, `pad=44`, axis `y=96`, `viewBox 0 0 560 (h + jumpBand)`
  where `h = 140`, `jumpBand = 26 + jumps·20` (arcs live above the axis).
  `X(v) = pad + (v-min)/(max-min) · (w - 2·pad)`.
- **ELEMENTS:**
  - axis line + major **ticks** (`.svg-axis` `stroke --line-2` 2px; zero tick 3px) with
    labels below (`.svg-label` `400 13px --font-ui` `fill --t-low`, via `fmtNum`).
  - **minor ticks** (`minorTicks` per interval) `.svg-grid` `stroke --line-1` 1px.
  - **jump arcs** — `arcPath(X(from), X(to), y-10, rise)`, `rise = 20 + (n-i)·16`;
    `stroke --c-adjust` `#ff9d3d` 3px (active: `--c-discover` `#ffd23f` 4px);
    `stroke-dasharray 4 7` + `opacity .35` when not yet revealed; label above in
    `.svg-hand` (`400 20px --font-hand`, Caveat) coloured to match.
  - **marks** — circle `r 8` (active `r 10`), `fill` = mark colour (palette:
    structure, strategy, adjust, transform, correct, discover) or `none` when `inactive`
    (`stroke-dasharray 3 4`); **stacked labels** above (`m.labels: ['1/2','2/4','0.5']`)
    each `.svg-value` (`700 15px --font-ui` `fill --t-hi`), offset `-20 - k·17`.
  - `.nline__mark.is-active { filter: drop-shadow(0 0 5px color-mix(--c-discover 55%)) }`.
- **STATES:** jump `state:'active'`; mark `state: 'active' | 'complete' | 'inactive'`;
  `reveal` = number of jumps shown.
- **NON-COLOUR CUES:** dashed vs solid arcs/marks; hollow (`fill:none`) inactive marks;
  arc rise ordering; stacked text labels for equal-location forms. `role="img"`,
  `aria-label` "Number line from 0 to 12. jumps: 7 to 10 (+3), 10 to 12 (+2). points: 12".
- **FIGMA VARIANTS:** `7 + 5` — axis 0–12, jump `7→10` label "+3", jump `10→12` label "+2",
  mark at 12 · same-location `1/2 = 2/4 = 0.5` (one mark, three stacked labels) ·
  a clean negative example (axis `-5 … 5`) *if it renders cleanly* · `reveal` progressive ·
  theme dark/paper.

---

### 01.10 — PlaceValueBreakdown  (`6:18`)

- **PURPOSE:** decomposition made visible — the BREAK move. `342 → H|T|O columns and/or
  300 + 40 + 2`. The value never changes; only its form.
- **SOURCE:** `src/components/place-value-breakdown.js` (registry key
  `placeValueBreakdown`); CSS `teaching.css` §7 `.pvb*` (lines 609–664).
- **STRUCTURE:** `<div.pvb.pvb--{columns|expanded|both}>` →
  `<ol.pvb__cols>` (N × `.pvb__col`) + `.pvb__regroup?` + `.pvb__expanded` +
  `.pvb__caption?`.
- **COLUMNS:** `.pvb__cols` flex row, gap `--s-2` **8px**, wrap, centred.
  `.pvb__col` grid centre, gap `--s-1` **4px**, min-width `3.2em`, padding
  `--s-2 --s-3 --s-3` (**8 / 12 / 12**), border `1px --ui-border`,
  **`border-top: --bw-bold 3px solid var(--tint)`**, radius `--r-md` **12px**,
  background `--ui-panel-quiet`.
  `--tint` cycles `['var(--c-structure)', 'var(--c-strategy)', 'var(--c-adjust)']`
  (`#4aa3ff`, `#35d0c4`, `#ff9d3d`) — index `i % 3`.
- **COLUMN CONTENT:** `.pvb__place` (`700 --fs-label(11.52)/1 --font-logo`, `--tr-wider`,
  UPPER, `--ui-text-muted`) — "Hundreds" / "Tens" / "Ones" / "Thousands" (from
  `PLACE_NAME`); `.pvb__digit` (`700 --fs-3xl(51.2)/1 --font-ui`, colour `var(--tint)`) —
  the digit, or **"_"** when not yet revealed; `.pvb__pv` (`400 --fs-sm/1 --font-ui`,
  `--ui-text-muted`) — the place value (e.g. `300`), blank when not revealed.
- **COLUMN STATES:** `is-inactive` → `opacity .4`, digit "_". `is-active`
  (`i === reveal-1` or `highlightPlace === i`) → bg `color-mix(--tint 14%)`,
  `box-shadow: 0 0 0 2px color-mix(--tint 45%), --sh-2`, `transform: translateY(-2px)`.
  `is-regroup-from` / `is-regroup-to` → `border-style: dashed`.
- **EXPANDED FORM (`.pvb__expanded`):** flex row wrap centred, `font-size --fs-2xl(38.4)`,
  line-height 1.2. `= ` (`.pvb__eq` `--ui-text-muted`) then, for **non-zero places only**,
  `renderMath(placeValue)` joined by `+` (`.pvb__plus` `--ui-text-muted`). Addend
  `.pvb__addend` `--ui-text`; active addend → `--ui-accent` `#ffd23f` bold; not-yet-shown
  addend → `.pvb__blank` "_" `--ui-text-faint`. → `790 = 700 + 90` (the tens/hundreds only;
  the ones "0" is skipped).
- **REGROUP NOTE (`.pvb__regroup`):** `400 --fs-explain(13.76)/1.3 --font-hand` (Caveat),
  `--ui-text-muted`, text `↷ regroup Tens → ones`.
- **CAPTION:** `400 --fs-explain/1.4 --font-ui`, `--ui-text-muted`, centred.
- **NARROW:** `.a9x16`/`.a1x1` → `.pvb__digit` `--fs-2xl`, `.pvb__expanded` `--fs-xl`.
- **NON-COLOUR CUES:** the place WORD above every column; "_" for unshown digits; dashed
  borders for regroup; expanded-form skips zero places. `role="group"` `aria-label`
  "342 is 3 hundreds, 4 tens, 2 ones"; per-column `aria-label` + `aria-current` on active.
- **FIGMA VARIANTS:** `342 = 300 + 40 + 2` (`form=both`) · `790 = 700 + 90` · `930 = 900 + 30`
  · `form = columns` only · `form = expanded` only · `reveal` progressive · a `regroup`
  example · theme dark/paper.

---

## PART 4 — PAGE 02 TEACHING FRAME BLUEPRINT

Sources: `src/layouts/workspace.js`, `src/layouts/presets.js`, `src/styles/layouts.css`
(Phase 6 section), `docs/FIGMA_HANDOFF.md §7`.

### Shared model

- **Stage** = a fixed-pixel frame; the overlay scales it to any viewport. Build at literal
  size. Background modes: `studio` (dark radial-gradient over `#0c121f → #070b14 → #04060c`,
  from `base.css .bg-studio`), `paper` (`.bg-paper` collection), `transparent`
  (no fill — for compositing over camera in OBS).
- **Regions** (grid areas, `layouts.css`): `.r-brand` (abs top-left) · `.r-presenter`
  (grid area `presenter`) · `.r-rail` (abs, top) · `.r-board` (grid area `board`, holds the
  `.ws-col` hierarchy) · `.r-compare` (grid area `compare`) · `.r-footer` (grid area
  `footer`, holds `.r-philosophy` + `FooterWorkflow`).
- **Teaching-workspace hierarchy** inside `.r-board` → `.ws-col` (VERTICAL Auto Layout,
  gap `--s-5` **24px**, align start):
  1. **PROMPT** `.ws-prompt` → PromptCard(kind question) — gated `layers.story` + a question.
  2. **EQUATION** `.ws-equation` (grid, centre) → EquationWorkspace(flow) — gated `layers.math`.
  3. **VISUAL** `.ws-visual` (grid, centre; `> * { max-width: min(100%, 46rem) }` = **736px**;
     `ws-col--visual` raises to `min(100%,60rem)` = **960px**) → the lesson diagram, or a
     derived TransformationChain — gated `layers.math`.
  4. **RESULT** `.ws-result` (grid, centre; panel `min-width: min(100%,24rem)` = **384px**)
     → AnswerReveal — gated `layers.math` + an `answer`, revealed by `state.revealAnswer`.
  Empty regions collapse (each builder returns null).
- **Top rail** `.r-rail` (abs): `TeachingRail(rail, current = state.step, showText:false)`,
  compact. `left: 26%` normally, **`left: 40%` when `.has-presenter`**, `right: --s-6` **32px**,
  `top: --s-5` **24px**. Boards clear it via padding-top: **A/C** `calc(--s-5 + 3.6em)`
  ≈ **82px** (`layouts.css` 218–219); **B/D/E** keep their pre-existing brand-clearance
  padding-top (`--s-8·2` … `·2.1` ≈ **112–118px**, already larger than the rail);
  **H** `max(calc(--s-8·2), calc(--s-5 + 3.6em))` (223).
- **Philosophy strip** `.r-philosophy` (in footer band): HORIZONTAL, centre, gap `--s-3`
  **12px**, padding `--s-2 --s-6 0` (**8 / 32 / 0**), `700 --fs-label(11.52)/1 --font-logo`
  (Archivo Narrow Bold), `--tr-wider`, UPPER, `--t-faint`. Text: **"Same value"** +
  **"→"** (`--c-discover` `#ffd23f` @ .8) + **"different form"** (`--t-low`).
  Hidden on `.a1x1`.

### Per-canvas structure

| | **02.1 — 16:9  1920 × 1080** | **02.2 — 9:16  1080 × 1920** | **02.3 — 1:1  1080 × 1080** |
| --- | --- | --- | --- |
| Grid (presenter on) | `grid-template-columns: 38% 1fr` (preset A/C); areas `presenter board / compare compare / footer footer`, rows `1fr auto auto` | `grid-template-rows: 1fr 22% auto auto`; areas `board / presenter / compare / footer` — **camera is a 22%-height strip, LOWER in the stack; the workspace leads** | presenter **hidden** (`.a1x1 .r-presenter{display:none}`); areas `board / footer`, rows `1fr auto` |
| Presenter zone | left **38%** column (≈730px), full board height; workspace right **~62%** minus `--s-6` **32px** gutters | full-width strip, **22% height** (≈422px), radius `--r-lg`, `overflow:hidden`; below the board | none (optional/smaller only — not implemented) |
| Rail | compact horizontal, spans the workspace (`left:40%` → `right:32px`), `top ≈ 24px` | compact **full-width** under the small brand block (`left:16px right:16px`, `top: calc(--s-4 + 3.4em)` ≈ **70px**); board `padding-top: calc(--s-4 + 3.6em)` ≈ 74px; auto vertical-stack rules available | **no rail** (`state.aspect !== '1x1'` gate) |
| Board (`.ws-col`) | preset-dependent (see below); centred to `ws-col--focus` **68rem**=1088px / `ws-col--quick` **60rem**=960px where used | `ws-col--vertical`, gap `--s-4` **16px**; order PROMPT → VISUAL → EQUATION(md) → RESULT(panel) | order (board head = prompt) → VISUAL → RESULT; `.ws-col` gap `--s-3` **12px**, vertically centred; `.eqw__expr` & board title step down to `--fs-xl` |
| Footer | `.r-philosophy` + FooterWorkflow (SEE→CHECK chain + series mark) | same, stacked/centred (`.a9x16 .footer` single column) | `.r-philosophy` **hidden**; FooterWorkflow only |
| Brand | `.r-brand` abs `top:24 left:32`; wordmark `--fs-3xl` | abs `top:16 left:16`; `.brand__l1` → `--fs-2xl` | same as 9:16 |
| Safe margins | keep critical maths inside the right 62%; nothing under the camera column | keep critical text ≥ phone-legible (`--fs-md` 17.7px min at 15px root); nothing under the 22% camera strip | tight — prompt / visual / result only; 5% inset |

### Preset → composition map (16:9, `presets.js` Phase 6)

| Preset | `.ws-col` class | Board contents (in order) | Rail? | Notes |
| --- | --- | --- | --- | --- |
| **A / C** — Presenter + Workspace | `.ws-col` | EquationWorkspace(**md**) → Visual → AnswerReveal(**panel**) | yes | head carries the question; camera left 38% |
| **B** — Workspace Focus | `.ws-col--focus` (max 68rem, centred) | PromptCard → EquationWorkspace(**lg**) → Visual → AnswerReveal(panel) | yes | no camera |
| **D** — Pattern Breakdown | `.ws-col--focus` | EquationWorkspace(**lg**) → Visual(**prefer TransformationChain**) → AnswerReveal(panel) | yes | chain fills the visual slot |
| **E** — Visual Model Focus | `.ws-col--visual` (visual max 60rem, col centred) | **Visual** → EquationWorkspace(md) → AnswerReveal(panel) | yes | the model leads |
| **G** — Quick Explanation | `.ws-col--quick` (max 60rem, centred, centre-aligned) | PromptCard → EquationWorkspace(md) → Visual → AnswerReveal(**paper**) | **no** | deliberately chrome-free |
| **H** — Whiteboard | `.whiteboard` (dashed `--bw-thin` border, `--r-lg`) > `.ws-col--board` (gap `--s-7` **44px**) | EquationWorkspace(**xl**, `.eqw__expr` forced `--fs-4xl`) → Visual(chain if no diagram) → AnswerReveal(**inline**) | yes | max reasoning space |
| **F** — Short Vertical (9:16) | `.ws-col--vertical` | PromptCard → Visual → EquationWorkspace(md) → AnswerReveal(panel) | yes (vertical) | camera 22% lower |

### Presenter ON / OFF behaviour

- Toggle = `state.layers.presenter` (`?hide=presenter`). `usesPresenter()` =
  `cfg.presenter && layers.presenter && aspect !== '1x1'`.
- **OFF on A / C / F** (`.no-presenter` class): grid collapses to `1fr`, `.r-presenter`
  `display:none`, board `padding-top: calc(--s-8·2)`; **`.ws-col` gets
  `max-width: 62rem; margin: 0 auto`** so it reads as an intentional centred board — **no
  dead rectangle**. Rail shifts to `left: 26%`.
- B / D / E / G / H never have a camera.
- **02.4–02.6 build:** for every 16:9 / 9:16 frame produce a **presenter-ON** and a
  **presenter-OFF** variant.

### 02.1–02.3 build (structure frames, no lesson content)

Build one **empty-structure reference frame per canvas** (1920×1080, 1080×1920, 1080×1080)
in sections `6:19` / `6:20` / `6:21`: draw the region rectangles + labels + **safe-zone
guides** (dashed) at the measurements above, with the `.ws-col` hierarchy shown as five
stacked placeholder blocks (PROMPT / STEP-RAIL / EQUATION / VISUAL / RESULT/CHECK). Include
both presenter states for 16:9 and 9:16. Studio + paper background swatches noted.

### 02.5 — Experiments  ·  02.6 — Approved for Dev

Leave as **labelled empty sections** with a one-line note frame:
- 02.5: "Experiments — visual redesign explorations. Nothing here is a build target."
- 02.6: "Approved for Dev — only compositions signed off for implementation land here."

---

## PART 5 — REAL LESSON BASELINES

Data is **verbatim** from the synthetic lessons in `preview.html` (Phase 6 section) —
which use only the existing lesson schema and drive the real `buildStageContent` path.
`prodStage` uses `DEFAULT_STATE` (step 5, `revealAnswer:true`, all layers on,
background `studio`) + overrides. In `preview.html` these render at **step 4**.

Reveal mapping (`workspace.js` `EquationRegion`): `current = step<=0 ? 0 : min(lines.length, step)`.
Chain reveal (`VisualRegion`): `current = step >= 4 ? chain.length : max(0, step)`.
`deriveFlowLines`: given = `steps.see.equation` (kind given) → `steps.break/build/transform.equation`
(kind work, note = that step's `text`) → `answer.work + " " + answer.value` (kind result,
only if `revealAnswer`). `deriveChain`: splits the richest of `steps.transform|build|check`
`.equation` on `=` when it yields ≥ 3 parts.

### Lesson 1 — **3/8 of 20**  (`L_38`, id `demo-38`)

| Field | Value (verbatim) |
| --- | --- |
| topic / title | `Fraction of a whole` / `What is 3/8 of 20?` |
| PROMPT (`question`) | **"What is 3/8 of 20?"**  · headline `3/8 of a 20 oz bag.` |
| SEE (`steps.see`) | text `20 is the whole, 8 equal parts, take 3` · eq `\tfrac{3}{8}\ \text{of}\ 20` |
| BREAK | text `one eighth first` · eq `20 \div 8 = 2\ \text{R}\,4` |
| BUILD | text `the remainder is four eighths` · eq `2 + \tfrac{4}{8}` |
| TRANSFORM | text `same value, simpler form` · eq `2 + \tfrac{4}{8} = 2 + \tfrac{1}{2} = 2.5` |
| CHECK | text `take three of them` · eq `2.5 \times 3 = 7.5` |
| EQUATION (flow, derived) | GIVEN `\tfrac{3}{8}\ \text{of}\ 20` → WORK `20 \div 8 = 2 R4` (note "one eighth first") → WORK `2 + \tfrac{4}{8}` (note "the remainder is four eighths") → WORK `2 + \tfrac{4}{8} = 2 + \tfrac{1}{2} = 2.5` (note "same value, simpler form") → RESULT `\tfrac{3}{8}\ \text{of}\ 20 = 7.5` |
| TRANSFORMATION CHAIN (derived from TRANSFORM eq) | `2 + \tfrac{4}{8}` = `2 + \tfrac{1}{2}` = `2.5` ; title from `answer.value` → `7.5` |
| VISUAL MODEL | **FractionBarModel** — `{ marker: true, rows: [{ label: '3/8', denominator: 8, shaded: 3 }] }` → `■■■□□□□□` with the "same length" guide at 3/8 |
| ANSWER | `AnswerReveal` — work `\tfrac{3}{8}\ \text{of}\ 20`, value `= 7.5`, skin per preset, `revealed` = `state.revealAnswer` |
| CHECK panel (`comparison`) | think `3/8 is basically a half` ✕ / math `3/8 is {less than} 1/2, so under 10 — and 7.5 < 10` ✓ |
| takeaway | `A remainder is a fraction of the next group.` |
| 16:9 | preset **A** (`prodStage('A','16x9',L_38,{step:4})`), presenter ON; also presenter-OFF twin |
| 9:16 | preset **F** (`prodStage('F','9x16',L_38,{step:4})`), presenter ON + OFF |
| 1:1 | preset **A** (`prodStage('A','1x1',L_38,{step:4})`), no presenter |

### Lesson 2 — **790 ÷ 2**  (`L_790`, id `demo-790`)

| Field | Value (verbatim) |
| --- | --- |
| topic / title | `Division by decomposition` / `790 ÷ 2` |
| PROMPT (`question`) | **"What do you notice about 790?"** |
| SEE | text `seven hundreds and nine tens` · eq `790` |
| BREAK | text `split into place-value parts` · eq `790 = 700 + 90` |
| BUILD | text `halve each part` · eq `700 \div 2 = 350` |
| TRANSFORM | text `add the parts back` · eq `350 + 45 = 395` |
| CHECK | text `double it back` · eq `395 \times 2 = 790` |
| EQUATION (flow, derived) | GIVEN `790` → WORK `790 = 700 + 90` (note "split into place-value parts") → WORK `700 \div 2 = 350` (note "halve each part") → WORK `350 + 45 = 395` (note "add the parts back") → RESULT `790 \div 2 = 395` |
| TRANSFORMATION CHAIN (derived) | fallback chain `790` … no `=`-triple in one step → chain = `[see.eq, build.eq, transform.eq, answer.value]` filtered → `790` · `700 \div 2 = 350` · `350 + 45 = 395` · `= 395` (used by preset D/H only) |
| VISUAL MODEL | **PlaceValueBreakdown** — `{ value: 790 }`, `form: 'both'` (default) → columns `Hundreds 7 / 700`, `Tens 9 / 90`, `Ones 0 / 0` + expanded `= 700 + 90` (ones skipped) |
| ANSWER | work `790 \div 2`, value `= 395` |
| takeaway | `The value of 790 never changed — only its form.` |
| 16:9 | preset **E** (Visual Model Focus) `prodStage('E','16x9',L_790,{step:4})`; presenter n/a (E has no camera) — build one frame |
| 9:16 | preset **F** `prodStage('F','9x16',L_790,{step:4})`, presenter ON + OFF |
| 1:1 | preset **A** `prodStage('A','1x1',L_790,{step:4})` |
| (also in `preview.html`) | preset **B** and **H** 16:9 variants |

### Lesson 3 — **7 + 5**  (`L_75`, id `demo-75`)

| Field | Value (verbatim) |
| --- | --- |
| topic / title | `Make a ten` / `7 + 5` |
| PROMPT (`question`) | **"How can we make this friendlier?"** |
| SEE | text `two numbers to add` · eq `7 + 5` |
| BREAK | text `break 5 to reach ten` · eq `5 = 3 + 2` |
| BUILD | text `seven plus three is ten` · eq `7 + 3 = 10` |
| TRANSFORM | text `same value, friendlier form` · eq `7 + 5 = 7 + 3 + 2 = 10 + 2 = 12` |
| CHECK | text `subtraction undoes it` · eq `12 - 5 = 7` |
| EQUATION (flow, derived) | GIVEN `7 + 5` → WORK `5 = 3 + 2` (note "break 5 to reach ten") → WORK `7 + 3 = 10` (note "seven plus three is ten") → WORK `7 + 5 = 7 + 3 + 2 = 10 + 2 = 12` (note "same value, friendlier form") → RESULT `7 + 5 = 12` |
| TRANSFORMATION CHAIN (derived from TRANSFORM eq — 4 parts) | `7 + 5` = `7 + 3 + 2` = `10 + 2` = `12` ; title `12` |
| VISUAL MODEL | **NumberBond** — `{ total: 5, parts: [3, 2], labels: ['5', 'to ten', 'the rest'] }` → whole `5` ↙↘ `3` (labelled "to ten") `+` `2` (labelled "the rest"). *Also referenced in `preview.html` composed demo:* a **NumberLine** 0–12, jump `7→10` "+3", jump `10→12` "+2". |
| ANSWER | work `7 + 5`, value `= 12` |
| takeaway | `Break a number to build a ten.` |
| 16:9 | preset **D** (Pattern Breakdown) `prodStage('D','16x9',L_75,{step:4})` — chain in the visual slot; also preset **G** (Quick) `{step:5}` |
| 9:16 | preset **F** `prodStage('F','9x16',L_75,{step:4})`, presenter ON + OFF |
| 1:1 | preset **A** `prodStage('A','1x1',L_75,{step:4})` |

---

## PART 6 — FIGMA BUILD ORDER  (optimised for low MCP usage)

Constraints: Starter plan ≈ **20 MCP tool-calls / month**; `use_figma` write calls count.
`use_figma` `code` accepts up to **50 000 chars**. Goal: **each batch = one `use_figma`
call** where feasible. Read calls (`get_metadata`, `get_screenshot`) are the scarce
resource — batch F spends them deliberately.

| Batch | One `use_figma` call builds… | Target sections | ~nodes | If it errors, split at… |
| --- | --- | --- | --- | --- |
| **A — finish Page 00** | 00.3 append (Shadows, Glows, Motion, Z-index, Type-sizes) to board `10:2`; 00.4 board (size scale + 4 family cards) **+ ~14 text styles**; 00.1 board (4 reference blocks); 00.2 index board (4 rows + 2 note cards) | `6:6` `6:7` `6:4` `6:5` | ~120 | A1 = 00.3+text-styles · A2 = 00.4 · A3 = 00.1+00.2 |
| **B — Page 01 masters** | the **default-state master frame** for all 10 components (§Part 3), dark theme, bound to variables | `6:9`…`6:18` | ~180 | B1 = rail/prompt/eqw/answer/jobs · B2 = tchain/bond/fbar/nline/pvb |
| **C — Page 01 states/variants** | for each component, the state/variant matrix beside its master: inactive/active/complete, hidden/revealed, compact, vertical, **paper twin** | `6:9`…`6:18` | ~220 | C1…C10 (one component each) |
| **D — Page 02 structure frames** | 3 empty-structure canvases (1920×1080, 1080×1920, 1080×1080) with region rects, safe-zone guides, `.ws-col` placeholders, presenter ON+OFF for 16:9 & 9:16, studio/paper notes | `6:19` `6:20` `6:21` | ~90 | D1 = 16:9 · D2 = 9:16 · D3 = 1:1 |
| **E — canonical lessons** | 3/8 of 20, 790÷2, 7+5 — each composed at 16:9 / 9:16 / 1:1 (presenter on+off where the preset has a camera) using the real component masters as instances | `6:22` | ~240 | E1 = 3/8 of 20 · E2 = 790÷2 · E3 = 7+5 |
| **F — verification only** | `get_metadata` on `0:1`, `6:2`, `6:3` (3 reads) + `get_screenshot` of one representative frame per page (3 reads) | — | — | drop screenshots to 1 if quota tight |

**Best case: 6 MCP calls total.** Realistic with fallback splits: **10–16**. Batch F is
~6 read calls — schedule it for a fresh monthly window, or fold a single `get_metadata`
into the end of each build batch's follow-up instead.

**Ordering rule:** A → B → C → D → E → F. B must precede C, D, E (they instance the masters).
Do **not** run a batch until the previous batch's `use_figma` returned created node IDs.

---

## PART 7 — MANUAL BUILD INSTRUCTIONS

Everything above is written to be built by hand in Figma without Claude/MCP. Working rules:

1. **Variables & effect styles already exist** (Part 1) — bind, don't recreate. In the
   Local variables panel: `MTD / Color · Dark` for dark frames, `MTD / Color · Paper` for
   paper twins (same variable names). Effect styles: `MTD / Shadow / *`, `MTD / Glow / *`.
2. **rem → px @ 16** (1920×1080) — table in 00.4 · Part 2. On 1080×1920 / 1080×1080 the
   overlay root is 15px; multiply px by `15/16` (0.9375) if you need pixel-exact vertical
   compositions. Spacing/radius/border tokens are already px and do **not** scale.
3. **`color-mix(in srgb, X n%, transparent)`** → set fill = X, opacity = n%.
   `color-mix(X n%, Y)` → overlay X@n% on Y.
4. **Auto Layout mapping:** CSS `gap` → itemSpacing; CSS `padding` → per-side padding;
   `justify-items: center` / `text-align: center` → align CENTER; `flex: 1 1 0` → equal
   FILL columns; `max-width` → a FIXED-width wrapper or the frame's max-width; `HUG` for
   content-sized, `FILL` for stretch (append child **before** setting FILL — Figma rule).
5. **States** = Figma component **variants** (property `state`) unless noted; theme =
   variant property `theme = dark/paper`; density/orientation = variant properties.
6. **Reveal / no-jump:** an `is-inactive` line/link keeps its exact box — build it at
   **0% opacity, unchanged size & position**, never `display:none`.
7. **Equations:** no KaTeX font in Figma. Either (a) type the plain form in a mathematical
   serif and label the frame "math: fallback serif — not KaTeX", or (b) paste a flattened
   PNG/SVG of the KaTeX render. Never silently substitute Inter for an equation.
8. **SVG diagrams** (NumberBond / NumberLine): rebuild the shapes at the `viewBox`
   coordinates given; strokes/fills use CSS vars → bind to the colour collection.
9. **Do not** move or rename the 21 sections; place each master/frame **inside** its
   section, top-left at ~(80, 80), Auto Layout HUG.
10. **Motion** is documentation only (00.3 · Part 2) — Smart Animate / prototype notes,
    not static properties.

Per-section quick index:

| Section | Build | Spec |
| --- | --- | --- |
| 00.1 Foundations | 1 board, 4 blocks | Part 2 · 00.1 |
| 00.2 Design System | 1 index board | Part 2 · 00.2 |
| 00.3 Tokens | **append 5 groups** to board `10:2` | Part 2 · 00.3 |
| 00.4 Typography | 1 board + ~14 text styles | Part 2 · 00.4 |
| 00.5 Surfaces & Colors | **done — skip** | — |
| 01.1–01.10 | component master + variant matrix | Part 3 |
| 02.1–02.3 | 1 structure frame each (+ presenter on/off) | Part 4 |
| 02.4 Lesson Sequences | 3 lessons × 3 canvases | Part 5 |
| 02.5 Experiments / 02.6 Approved for Dev | label + note frame only | Part 4 |

---

*End of build spec. Figma file, tokens, and the SEE → BREAK → BUILD → TRANSFORM → CHECK /
SAME VALUE → DIFFERENT FORM framework are transcribed, not redesigned. Redesign is the
next phase.*
