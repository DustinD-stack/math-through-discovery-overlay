# Figma design handoff — Math Through Discovery overlay

Status: the **functional component system is complete and composed into
production layouts** (UI plan phases 1–6). This document hands the
implemented UI to a designer. Figma may redesign appearance and
composition; every design must map back to the component architecture
described in §11.

Nothing here is a Figma deliverable yet — see §12 for what we will
request next.

---

## 1. Product purpose

**Math Through Discovery** — an OBS teaching overlay for a seated
presenter working through mathematics on a digital whiteboard.

> "Math gets easier when you start seeing the patterns."

The overlay is the presenter's board: a visual reasoning system that
sits over a camera (or on its own) for long-form YouTube lessons,
Shorts / Reels, and square posts. The mathematics is always the visual
focus; the interface must never read as a dashboard.

## 2. Core pedagogy

Two ideas drive every screen.

**The reasoning path** — one continuous line of thinking, not five
buttons:

```
SEE  ->  BREAK  ->  BUILD  ->  TRANSFORM  ->  CHECK
```

| Stage | The learner asks | Colour token |
| --- | --- | --- |
| SEE | What do I notice? | `--stage-see` = `--c-structure` (blue) |
| BREAK | What can I take apart? | `--stage-break` = `--c-correct` (green) |
| BUILD | What can I build from the pieces? | `--stage-build` = `--c-adjust` (orange) |
| TRANSFORM | Same value, a more useful form? | `--stage-transform` = `--c-transform` (purple) |
| CHECK | Does the result make sense? | `--stage-check` = `--c-discover` (yellow) |

**The principle**:

```
SAME VALUE  ->  DIFFERENT FORM
```

Every component reinforces one or both, but neither is hard-coded so
the components stay reusable (`TeachingRail` takes any ordered steps;
`TransformationChain` takes any ordered forms).

## 3. Target audience

**3rd grade through adults rebuilding fundamentals.** Clean, modern,
educational, broadcast-ready — *not* childish, somewhat fun, readable
on video and on a phone.

## 4. Implemented component inventory

All framework-free (`el()` DOM builder), `fn(data) -> Node`, no build
step. Styles live in `src/styles/teaching.css` (one file, section
index at the top) plus the legacy `src/styles/*.css`.

### Reasoning components (`src/components/`)

| Component | File | Role |
| --- | --- | --- |
| **TeachingRail** | `teaching-rail.js` | The SEE→CHECK path. Variants: `rail` (connected node track — production default, "where we are"), `rows` (numbered explanation list — legacy `DiscoveryStepper`), `cards` (legacy `MethodCards`), `headline`. States complete / active / inactive distinguished by fill, border style, size and a glyph — never colour alone. |
| **EquationWorkspace** | `equation-workspace.js` | Working *through* maths. `flow` variant = **GIVEN → WORK → RESULT** vertical stack with a `↓` connector and kind tags; step-by-step reveal by `current` with every line kept in the DOM (no layout jump). `card` variant reproduces the legacy `.equation-card`. |
| **AnswerReveal** | `answer-reveal.js` | The answer as the *conclusion* of the reasoning. Skins: `paper` (taped slip + circled answer — legacy `PaperNote`), `panel` ("So: …" box, lights green on reveal, connector in), `inline`. Hidden state holds the same footprint; `aria-live` announces the reveal. |
| **PromptCard** | `prompt-card.js` | Learner-thinking beats: `question` / `predict` / `try` / `notice`. Built on `.panel`, per-kind accent, optional revealable hint. |
| **NumberJobs** | `number-jobs.js` | **WHOLE / SPLIT / TAKE** — what each number is *doing*. The role words + descriptions are always shown; `--job-*` colour only reinforces. `active` emphasises one job while the others stay readable (dimmed, not hidden). Two-job layout supported. |
| **TransformationChain** | `transformation-chain.js` | Makes SAME VALUE → DIFFERENT FORM visible: ordered `links` joined by `=` (never a bare arrow), on an equivalence baseline tagged "same value". `flow` / `stack` layouts; > 5 links or a narrow canvas auto-stacks; never scrolls horizontally. |

### Visual math models (`src/modules/diagrams.js` registry + `src/components/`)

| Component | Registry key(s) | Role |
| --- | --- | --- |
| **NumberBond** | `numberBond` | WHOLE ↙↘ PART PART. Progressive reveal (`whole` / `parts` / n), `highlightPart`, `?` for unknowns (dashed ring + glyph), `+` between parts as a non-colour "combine" cue. |
| **FractionBarModel** | `fractionBar`, `fractionBarModel` | Whole → equal parts → selected parts. Selected cells carry a filled `■`, unselected an outline `□`. `marker` draws an equal-length guide so `1/2 = 4/8` is *seen* before it is calculated. Multi-row, `activeRow`, progressive reveal. |
| **NumberLine** | `numberLine` | Reasoning surface. Major + `minorTicks`, multiple `jumps` (per-jump label/state), progressive reveal, and marks with `labels: [..]` — many forms at **one location** (`1/2 = 2/4 = 0.5`). Negatives / decimals supported. |
| **PlaceValueBreakdown** | `placeValueBreakdown` | Decomposition (the BREAK move). `columns` / `expanded` / `both`, auto place detection, progressive reveal, `regroup` note, `highlightPlace`. Place WORDS (HUNDREDS/TENS/ONES) are primary; tint reinforces. Expanded form skips zero places (`790 = 700 + 90`). |
| _plus legacy diagram modules_ | `percentBar, doubleNumberLine, arrayModel, areaModel, ratioTable, unitRateTable, balanceModel, coordinateGraph, barGraph, pieChart, receipt, formulaBlock, equation` | Unchanged. |

### Chrome / structure (`src/components/core.js`, `src/layouts/`)

`Header` (wordmark + episode badge), `TopicTag`, `PresenterFrame`
(camera zone + vignette + lower third), `QuoteCard`, `ScenarioFacts`,
`ComparisonPanel` (what they think ✕ / what the math says ✓),
`TakeawayPanel`, `FooterWorkflow` (SEE→CHECK chain + series mark).

Phase-6 composition helpers (`src/layouts/workspace.js`): `TopRail`,
`PromptRegion`, `EquationRegion`, `VisualRegion`, `ResultRegion`,
`PhilosophyStrip`, plus `deriveFlowLines` / `deriveChain` that map the
existing lesson JSON onto the new components (no schema change).

## 5. Design tokens (as implemented, `src/styles/tokens.css`)

The palette is fixed; a **semantic alias layer** points reusable
components at it. `.bg-paper` re-points the palette for a light surface
and every alias follows automatically.

### Surfaces
`--c-navy-900 #070b14` (app / stage ground) · `--c-navy-800 #0c121f` ·
`--c-navy-700 #121a2b` · `--c-board #0b0e14` · `--c-board-2 #10141d`
(raised panel) · `--c-paper #f4f1e6` · `--c-paper-ink #1b1b18`.
Aliases: `--ui-bg`, `--ui-panel`, `--ui-panel-quiet`.

### Meaning colours (never decorative)
| Token | Hex | Meaning |
| --- | --- | --- |
| `--c-structure` | `#4aa3ff` | structure / place value / SEE / WHOLE |
| `--c-correct` | `#57c86a` | correct / confirmed / BREAK / success |
| `--c-adjust` | `#ff9d3d` | the nearby number / BUILD / TAKE / warning |
| `--c-transform` | `#b07bff` | equivalence / TRANSFORM / SPLIT |
| `--c-error` | `#ff5a5a` | misconception |
| `--c-discover` | `#ffd23f` | discovery / highlight / CHECK / accent |
| `--c-strategy` | `#35d0c4` | strategy / build |

Aliases: `--ui-text #fff` / `--ui-text-muted rgba(255,255,255,.56)` /
`--ui-text-faint .34` · `--ui-accent` = discover · `--ui-success` =
correct · `--ui-warning` = adjust · `--ui-error` = error ·
`--ui-border rgba(255,255,255,.18)` / `--ui-border-faint .10`.
Stage aliases `--stage-see/break/build/transform/check` +
`--stage-color`. Job aliases `--job-whole/split/take`.

### Type
| Role | Token | Face |
| --- | --- | --- |
| Logo / labels | `--font-logo` | Archivo Narrow |
| Marker headlines | `--font-marker` | Permanent Marker |
| Handwriting (quotes, worked math, annotations) | `--font-hand` | Caveat |
| Interface (explanations, facts) | `--font-ui` | Inter |
| Math | KaTeX (offline fallback) | — |

Scale (rem, relative to a per-aspect stage root font-size of 16 / 15 /
15 px): `--fs-xs .72` `--fs-sm .86` `--fs-base 1.00` `--fs-md 1.18`
`--fs-lg 1.45` `--fs-xl 1.85` `--fs-2xl 2.40` `--fs-3xl 3.20`
`--fs-4xl 4.20`. Line-heights `--lh-tight 1.08 / --lh-snug 1.28 /
--lh-body 1.45`. Tracking `--tr-wide .06em / --tr-wider .14em`.
Intent aliases: `--fs-value` (2xl) · `--fs-value-lg` (4xl) ·
`--fs-label` (xs) · `--fs-explain` (sm).

### Spacing / radius / border / shadow / motion
Spacing `--s-1 .25rem … --s-8 3.5rem`. Border widths
`--bw-hair 1 / --bw-thin 2 / --bw-bold 3`. Radius
`--r-sm 6 / --r-md 12 / --r-lg 18 / --r-xl 26 / --r-pill 999`;
`--r-card` = `--r-lg`. Shadow `--sh-1/2/3` + `--sh-glow-yellow` /
`--sh-glow-green`. Motion `--dur-fast 180 / --dur-base 340 /
--dur-slow 620 / --dur-draw 900`; eases `--ease-out cubic-bezier(.16,.84,.28,1)`,
`--ease-soft cubic-bezier(.34,.9,.32,1)`; `--stagger 90ms`;
`--tr-state` = `--dur-base --ease-out`.

### Z-index (9 layers)
bg 0 · presenter 10 · story 20 · math 30 · discovery 40 · compare 50 ·
takeaway 60 · brand 70 · stamp 80 · controls 90.

## 6. Canvases

| Aspect | Pixels | Root font-size | Use |
| --- | --- | --- | --- |
| 16:9 | 1920 × 1080 | 16px | long-form seated teaching |
| 9:16 | 1080 × 1920 | 15px | Shorts / Reels / TikTok |
| 1:1 | 1080 × 1080 | 15px | square social |

The overlay draws on a fixed-pixel `.stage` and is scaled with a CSS
`transform` to fit any viewport, so it stays pixel-exact for OBS.
Background modes: `studio` (dark gradient), `paper` (light), or
`transparent` (nothing behind — for compositing over a camera in OBS).

## 7. Presenter safe zones (as implemented)

The presenter layer is independently hideable (`state.layers.presenter`
/ `?hide=presenter`). `usesPresenter()` is the single source of truth:
a camera zone shows only when the preset allows it, the layer is on,
and the aspect is not 1:1.

| Canvas / preset | Camera region | Teaching workspace | Notes |
| --- | --- | --- | --- |
| **16:9, preset A / C** | left column **38%** | right **~62%** (minus `--s-6` gutters) | Critical maths lives entirely in the right column. Brand top-left, compact top rail spans the workspace only (starts at 40%). |
| **16:9, presets B / D / E / G / H** | none | full width, centred to a comfortable measure (`ws-col--focus` ≈ 68rem, `ws-col--quick` ≈ 60rem) | Rail starts at 26% (after the brand block). |
| **9:16, preset F** | **22% height, lower** in the stack (`board → presenter → compare → footer`) — a calm framed strip, not the star | full width above the camera | Full-width rail under the small brand block. |
| **1:1** | hidden (by design — tightest canvas) | full square, `prompt (board head) → visual → result` | No rail (no room); philosophy strip hidden. |

**Camera-off rule**: when the presenter layer is off on a preset that
normally has one (`.no-presenter`), the workspace recomposes to a
centred measure (`max-width: 62rem; margin: 0 auto`) rather than
stretching the full 1920 or leaving a dead rectangle.

**Do not** place critical mathematical information under the presenter
region on any canvas.

## 8. Component states

| State family | Where | Visual language (colour is never the only cue) |
| --- | --- | --- |
| `inactive` | TeachingRail node, EquationWorkspace line, TransformationChain link, PlaceValueBreakdown column, NumberBond circle | opacity ≈ .2–.45, dashed border, value hidden / shown as `?` or `_` or `•••`, space reserved (no jump) |
| `active` | same | solid accent border + halo + slight scale + `aria-current`; the "path" is lit up to here |
| `complete` | same | filled / solid; a `✓` glyph on the rail; full opacity, no wash |
| `hidden` | any region | its `state.layers` flag is off → not rendered; empty regions collapse |
| answer `hidden` ↔ `revealed` | AnswerReveal, ComparisonPanel | hidden = `= ?` / `?` in the same footprint; revealed = value + green + `ring-draw` ellipse (paper) or glow (panel), `aria-live` announcement |
| `dark` ↔ `paper` | whole stage (`.bg-paper`) | palette re-points; all `--ui-*` / `color-mix()` follow with no extra rules |
| motion `on` ↔ `off` | everything | class-based (`anim-*`, `eq-reveal`); killed by `body.no-anim` and `@media (prefers-reduced-motion)`; nothing loops except one optional active-node pulse |
| NumberJobs `active` job | the WHOLE / SPLIT / TAKE row | chosen tile washed + lifted; the other two dimmed to .55 but fully readable |

## 9. Representative screens to capture for Figma reference

All served by `npm start` → `http://localhost:3000`.

### Component gallery — `/preview.html`
Every component in every variant/state, plus the composed teaching
stories. Use the **Animations on/off** and **Sample surface dark/paper**
toggles. Sections: TeachingRail, EquationWorkspace, AnswerReveal,
PromptCard, NumberJobs, TransformationChain, NumberBond,
FractionBarModel, NumberLine, PlaceValueBreakdown, and the Phase 6
**"Production compositions"** section (full stages via `buildStageContent`).

### Live overlay — `/overlay.html?…`
Real composed presets. Capture at least:

| # | URL tail | What it shows |
| --- | --- | --- |
| 1 | `?lesson=unit-rate&preset=A&aspect=16x9&step=3` | 16:9 Presenter + Workspace, mid-reasoning |
| 2 | `?lesson=unit-rate&preset=A&aspect=16x9&step=5&hide=presenter` | camera-off recompose (no dead rectangle) |
| 3 | `?lesson=unit-rate&preset=A&aspect=16x9&bg=transparent&step=4` | transparent overlay for OBS |
| 4 | `?lesson=percentages&preset=B&aspect=16x9&step=4` | Workspace Focus |
| 5 | `?lesson=algebra&preset=D&aspect=16x9&step=4` | Pattern Breakdown (TransformationChain in the visual slot) |
| 6 | `?lesson=place-value&preset=E&aspect=16x9&step=3` | Visual Model Focus |
| 7 | `?lesson=division&preset=G&aspect=16x9&step=5` | Quick Explanation (chrome-free) |
| 8 | `?lesson=geometry&preset=H&aspect=16x9&step=4` | Whiteboard / Deep Work |
| 9 | `?lesson=fractions&preset=F&aspect=9x16&step=3` | vertical, presenter on |
| 10 | `?lesson=fractions&preset=F&aspect=9x16&step=3&hide=presenter` | vertical, presenter off |
| 11 | `?lesson=number-sense&preset=A&aspect=1x1&step=3` | square |
| 12 | any of the above with `&bg=paper` and with `&anim=0` | paper + reduced motion |
| 13 | any with `&step=0…5` and `&answer=0` | rail progression + answer hidden |

### Composed discovery stories (gallery, Phase 6 section)
`3/8 of 20`, `790 ÷ 2`, `7 + 5` — rendered as real production stages
at 16:9 / 9:16 / 1:1, presenter on and off. These are the reference
sequences for the Figma lesson-sequence deliverables (§12).

## 10. Design questions for Figma

We want Figma to explore, within the constraints of §11:

1. **Typography hierarchy** — the four faces (Archivo Narrow / Permanent
   Marker / Caveat / Inter) and the 9-step scale. How loud should the
   board title be vs the current reasoning step vs the equation?
2. **Spacing rhythm** — `--s-*` is a plain geometric-ish scale; is a
   modular scale or an 8pt grid better for broadcast?
3. **Card shapes** — panels, the paper slip, prompt cards, the
   equation lines. Radius, elevation, borders, torn-paper vs clean.
4. **Visual-model styling** — NumberBond / FractionBarModel /
   NumberLine / PlaceValueBreakdown: stroke weights, fills, label
   placement, how "hand-drawn" vs "engineered" they should feel at 4K.
5. **TeachingRail styling** — the connected node track. Marker shape,
   connector treatment, how the "lit path" reads, compact vs full.
6. **Camera framing** — the presenter region: frame, vignette, lower
   third, how it meets the workspace seam at 38% / 22%.
7. **Transitions between reasoning states** — reveal of a line, a jump,
   a chain link; the answer reveal. Currently one settle, no loop.
8. **Background treatments** — studio gradient, paper, transparent;
   grid overlay; how much texture is broadcast-safe.
9. **Subtle brand identity** — the "SAME VALUE → DIFFERENT FORM" strip,
   the footer chain, the wordmark. How present should the brand be
   without competing with the maths?
10. **Long-form vs Shorts visual relationship** — how the 16:9 and 9:16
    compositions should feel like the same product, not two products.

## 11. Non-negotiable engineering constraints

Figma may redesign **appearance and composition**. Figma must **not**
assume or require:

- React, Vue, Svelte, or any component framework
- Tailwind or any utility-CSS framework / build step
- a different state model — state is a plain object
  (`lessonId, preset A–H, aspect, background, step 0–5, revealAnswer,
  animations, diagram, layers{brand,presenter,story,math,discovery,
  comparison,takeaways}, overrides`), synced over a **local WebSocket**
  (`src/app/bus.js` → `server/server.js`). This transport is fixed.
- a different lesson schema — lessons are JSON with
  `series, topic, title, headline, quote, facts[], question,
  answer{work,value,unit}, steps{see,break,build,transform,check}{text,
  equation,annotation}, diagram{type,…}, comparison, takeaways[]`.
  Phase 6 derives all new-component props from these fields.

Every screen must map to: the **preset system** (A–H, `PRESETS` in
`src/layouts/presets.js`), the **aspect system** (16x9 / 9x16 / 1x1),
the **layer flags**, and the **diagram registry**. New visual ideas
land as CSS token changes + component styling in
`src/styles/teaching.css` + composition tweaks in
`src/layouts/presets.js` / `workspace.js` / `layouts.css`. No second
layout system.

## 12. Figma deliverables we will request next

1. **Design system page** — palette, type, spacing, elevation, the
   meaning-colour legend, motion.
2. **Component variants** — every component in §4 at
   inactive / active / complete, dark / paper, and the reveal states.
3. **16:9 teaching screen** — presenter-on and presenter-off, at a
   mid-reasoning step and at CHECK.
4. **9:16 teaching screen** — presenter-on and presenter-off.
5. **1:1 teaching screen**.
6. **dark / paper variants** of 3–5.
7. **3/8-of-20 lesson sequence** — SEE (NumberJobs) → BREAK
   (`20 ÷ 8 = 2 R4`) → TRANSFORM the remainder
   (`2 R4 = 2 + 4/8 = 2 + 1/2 = 2.5`) → BUILD → TAKE 3 → RESULT (7.5) →
   CHECK (3/8 < 1/2; 1/2 of 20 = 10; 7.5 < 10). Both solution paths.
8. **790÷2 lesson sequence** — SEE (PlaceValueBreakdown
   `790 = 700 + 90`) → BUILD (`700÷2=350`, `90÷2=45`) → TRANSFORM
   (`350 + 45 = 395`) → RESULT → CHECK (`395 × 2 = 790`).
9. **7+5 lesson sequence** — SEE → BREAK (NumberBond `5 = 3 + 2`) →
   BUILD (NumberLine `7 → 10 → 12`) → TRANSFORM
   (`7 + 5 = 7 + 3 + 2 = 10 + 2 = 12`) → CHECK (`12 − 5 = 7`).
10. **Teacher control UI exploration** — later; not in this round.

---

*Prepared from the implemented system. Engineering owns §11; Figma owns
everything visual within it.*
