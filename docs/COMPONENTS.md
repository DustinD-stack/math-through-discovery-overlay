# Component reference

Every component is a function that takes data and returns a DOM node. None of them read
global state, and none contain lesson text. Import them from
`src/components/core.js`, `src/components/discovery.js` or `src/modules/diagrams.js`.

## Layer 2 — Brand

| Component | Signature | Notes |
| --- | --- | --- |
| `Header(lesson)` | wordmark + series line + episode badge | splits `lesson.series` into three logo lines |
| `EpisodeBadge(episode)` | yellow marker slab | called by `Header` |
| `TopicTag(lesson)` | today's topic + philosophy line | torn-paper edge, 16:9 presenter presets |
| `FooterWorkflow(lesson)` | slogan, the five-step chain, series mark | pinned to the bottom of every preset |

## Layer 3 — Presenter

| Component | Signature | Notes |
| --- | --- | --- |
| `PresenterFrame(lesson, {showLowerThird})` | camera zone, vignette, lower third | the placeholder silhouette disappears in transparent mode so OBS sees straight through |

## Layer 4 — Story

| Component | Signature | Notes |
| --- | --- | --- |
| `QuoteCard(quote)` | the claim, in handwriting | returns `null` when there is no quote |
| `ScenarioFacts(lesson)` | labelled numbers + the question | `highlight: true` on a fact tints its value |
| `ProblemCard(lesson)` | question-only panel | for presets with no scenario |
| `Sticky(text)` | angled note | accepts `{highlight}` and `_underline_` markup |

## Layer 5 — Main math

| Component | Signature |
| --- | --- |
| `EquationCard(expr, {caption, large, display})` |
| `PaperNote(lesson, {revealed})` — taped slip with the circled answer |
| `renderDiagram(spec, lesson, override)` — dispatches to the registry |

Diagram modules: `NumberBond`, `FractionBar`, `PercentBar`, `NumberLine`,
`DoubleNumberLine`, `ArrayModel`, `AreaModel`, `RatioTable`, `UnitRateTable`,
`BalanceModel`, `CoordinateGraph`, `BarGraph`, `PieChart`, `ReceiptCard`,
`FormulaBlock`, `EquationModule`. Each takes `(spec, lesson)` and returns a node.
Options are listed in `LESSON_CREATION.md`.

## Layer 6 — Discovery

| Component | Signature | Notes |
| --- | --- | --- |
| `DiscoveryStepper(lesson, {step, compact})` | the five numbered rows | rows above `step` render dimmed |
| `DiscoveryStep(key, data, step)` | one row | number, label, explanation, math, annotation |
| `MethodCards(lesson, {step})` | the five steps as a card row | presets D and E |
| `StepProgress(step)` | five colour pips | vertical formats |
| `StepHeadline(lesson, step)` | current step, large | preset H |

`STEP_META` exports the label, number and colour class for each of the five keys.

## Layers 7–8 — Comparison and takeaways

| Component | Signature | Notes |
| --- | --- | --- |
| `ComparisonPanel(comparison, {revealed})` | think ✕ / VS / math ✓ | hides the right side when the answer is hidden |
| `TakeawayPanel(takeaways, {stamp, revealed})` | bullets with an optional insight line | a takeaway can be `{text, insight:true}` |
| `RealityCheckStamp(text)` | angled stamp | animates in with `anim-stamp` |

## Layout

| Function | Signature |
| --- | --- |
| `buildStageContent(state, lesson)` | returns the whole composed stage |
| `PRESETS`, `PRESET_KEYS` | preset metadata: name, whether it has a presenter and a quote |

## App

| Function | Signature | Notes |
| --- | --- | --- |
| `mountOverlay(root, opts)` | renders and keeps a stage in sync | returns `{store, bus, stage, refresh}` |
| `mountControl(root)` | renders the control panel | |
| `createStore(initial)` | `get`, `set`, `replace`, `subscribe` | patches merge deeply |
| `stateFromURL()` / `stateToURL(state)` | URL ⇄ state | |
| `createBus({role})` | `send`, `on`, `addTarget` | BroadcastChannel + postMessage + localStorage |
| `loadLesson(id)` / `lessonIndex()` | fetch with offline bundle fallback | |
| `renderMath(expr, {display})` | KaTeX or fallback | |
| `el`, `svg`, `clear`, `markup` | DOM helpers | `markup` handles `{highlight}`, `_underline_`, `*accent*` |

## Adding a component

1. Write the function in `core.js` (chrome) or a new file under `src/components/`.
2. Style it in `components.css` using tokens only — no raw hex, no fixed pixel type.
3. Place it inside a preset in `src/layouts/presets.js`, guarded by its layer flag:
   `L.story && MyThing(lesson)`.
4. Run `npm test` — it renders every preset and will catch a thrown error immediately.
