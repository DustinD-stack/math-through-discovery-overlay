# Foundation Release 1 — Visual Capabilities (P6)

```
Milestone:   P6 — Visual Capability Completion & Teaching Experience Integration
Status:      The 3 known Foundation Release 1 visual gaps (ten-frame, number-path,
             bundling-visual) are closed with real production components.
             Foundation Release 1 known capability gap count: 0.
Depends on:  docs/lesson-authoring/RUNTIME_INTEGRATION.md (P5 — runtime flow, catalog,
             player, resolver architecture — not repeated here)
```

This document covers only what P6 added: the three new visual components, the
resolver's stage-hint mechanism, and presenter integration. See
`RUNTIME_INTEGRATION.md` for the schema-v1 data flow, catalog, and player itself.

## 1. Representation capability architecture (recap, unchanged shape)

`resolveRepresentation({type, role?, data?}, context?)` still returns exactly one of
three outcomes — `'component'`, `'concrete'`, `'gap'` — established in P5. P6 changes
which types fall into which bucket; it does not change the mechanism. All three new
components are registered in `src/modules/diagrams.js` `DIAGRAMS` and referenced from
`src/curriculum/constants.js` `REPRESENTATION_TYPES` exactly like every pre-existing
diagram (`{ status: 'component', source: 'diagram', diagramKey: '<key>' }`).

## 2. TenFrame

`TenFrame({ size, filled, emphasize, caption })` — `src/modules/diagrams.js`.

- `size`: `10` (default, 2×5) or `5` (1×5, a five-frame).
- `filled`: `0..size`, clamped (never thrown) if out of range.
- `emphasize`: `'filled' | 'empty' | 'total' | null` — presentation-only, supplied by
  the composer from the active teaching stage (§5), never stored in lesson data.
- Filled vs. empty cells are a **structural** distinction, not color alone: filled =
  solid circle; empty = hollow circle (`fill: none`) with a dashed stroke — the exact
  filled/hollow convention `NumberLine` already uses for active/inactive marks.
- Used by `0.2.8`, `1.2.1` (as a five-frame), `1.2.3`.

## 3. NumberPath

`NumberPath({ start, end, current, marks, jump, caption })` — `src/modules/diagrams.js`.

- Discrete, evenly-spaced stepping stones from `start` to `end` (inclusive), each
  **numbered inside the marker**.
- `current`: one emphasized "you are here" stone (larger, thicker ring).
- `marks`: an array of benchmark positions, filled/colored but not "current".
- `jump`: `{ from, to, label? }` — an arced step above the path, reusing the same
  `arcPath()` helper `NumberLine`'s jumps use (shared helper, not a duplicate).
- A small arrow at the path's end is the non-color "more this way" direction cue.
- `end < start` is clamped to a minimal one-position path rather than throwing.
- Used by `0.2.6`, `0.2.7`, `1.2.5`.

## 4. BundlingVisual

`BundlingVisual({ ones, bundleSize, bundled, caption })` — `src/modules/diagrams.js`.

- Draws `ones` individual dots, always — **bundling never removes or hides them**, so
  the picture itself argues "same quantity" rather than asserting it in a caption alone.
- `bundled: true` adds one enclosing rounded band around the dots (the non-color
  grouping cue — enclosure, not a color change) and labels `"1 ten = 10 ones"`;
  `bundled: false` shows the same dots loose, labeled `"10 ones"`.
- Used by `2.1.1`.

## 5. Semantic distinction: NumberPath vs. NumberLine

Deliberately **not** the same component under two names:

| | NumberPath (new, P6) | NumberLine (existing) |
|---|---|---|
| Axis | dashed "footpath" (`.npath__trail`), no ruled ticks | solid ruled `svg-axis`, tick marks at every value |
| Position labels | printed **inside** each stepping-stone marker | printed **above** the axis, marker plain below |
| Scale | discrete positions, not proportionally scaled to value | proportional pixel mapping from a numeric domain |
| Instructional role | early/concrete: "step from here to there," informal location | formal: intervals, negative/decimal domains, same-location equivalence |

`resolveRepresentation` never conflates the two — they are separate registry entries
(`number-path` / `number-line`) resolving to separate functions. A test in
`tools/visual-capabilities.test.mjs` asserts NumberPath never renders the `svg-axis`
class NumberLine uses, precisely to keep this distinction from eroding later.

## 6. Capability-gap fallback mechanism (unchanged, now unused by this release)

The `'gap'` status and its `gapPlaceholder()` renderer (`src/curriculum/
representations.js`) were **not removed**. Closing Foundation Release 1's three known
gaps only removed their entries from the `status: 'gap'` bucket in
`REPRESENTATION_TYPES` — the mechanism itself (an honest "VISUAL MODEL PENDING"
placeholder, never a fake model, never a crash) remains exactly as P3/P5 built it, for
any future representation type that still lacks a component.

## 7. How components receive semantic data

Unchanged from P5: `rep.data` (already-authored, semantically-neutral numbers mirroring
the lesson's own accepted example — see §12 for exactly what was added and why) is
passed to the component function as-is. P6 adds one thing: `resolveRepresentation`
optionally accepts a second `context` argument, `{ stageId }`, and — **only for
`ten-frame` and `bundling-visual`, and only as presentation logic keyed by
representation *type*, never by lesson id** — layers a small set of stage-driven hints
on top of `rep.data` before rendering (`stageHints()` in `representations.js`):

| Type | Stage | Hint |
|---|---|---|
| `ten-frame` | break / build | `emphasize: 'empty'` |
| `ten-frame` | transform | `emphasize: 'filled'` |
| `ten-frame` | check | `emphasize: 'total'` |
| `bundling-visual` | build / transform / check | `bundled: true` |

This mirrors the milestone's pedagogical guidance (SEE notices the amount as given;
BREAK/BUILD separates what's present from what's needed; TRANSFORM/CHECK shows the
bundled/verified form) without hardcoding any lesson's script into the component.

## 8. Aspect behavior

All three components are plain SVG with a `viewBox` and no fixed pixel sizing beyond
their internal drawing — they scale with their container exactly like every other
`src/modules/diagrams.js` diagram (`.diagram svg { width:100%; height:auto; }`,
unchanged). Verified rendering under `16x9`/`9x16`/`1x1` in
`tools/visual-capabilities.test.mjs`'s render sweep.

## 9. Presenter behavior

Foundation Release 1 lesson data still carries **no** camera/layout information — this
is presentation-layer state (`state.layers.presenter`, the exact same boolean the
legacy runtime and control panel's existing "Presenter" layer toggle already control).

P6 adds `wrapWithPresenter(node, {aspect, showPresenter})` (`src/curriculum/
render-experience.js`), producing a new, small, additive `.fr1-shell` (`src/styles/
curriculum-runtime.css`) — not a reuse of the legacy `.stage-content` preset grid,
because that grid's 16:9 38/62 split is keyed to specific presets (`preset-A`/`
preset-C`) that schema-v1 experiences don't have:

- **16:9, presenter ON** — camera ~38% left, workspace ~62% right (same percentage the
  accepted Phase 6 language uses).
- **16:9, presenter OFF** — workspace alone, centered, `max-width: 62rem` — no dead
  camera-shaped rectangle.
- **9:16, presenter ON** — workspace leads; a ~22%-height camera strip sits *below* it.
- **9:16, presenter OFF** — workspace fills the full height.
- **1:1** — camera is **always** hidden, regardless of the toggle (verified live: an
  explicit `showPresenter:true` request under `1x1` still renders zero presenter nodes).

The presenter zone itself is a clearly labeled "PRESENTER · SAFE ZONE" dashed box —
never a fake camera image, matching the placeholder convention already accepted in
earlier Penpot baselines.

Live-verified over the real WebSocket transport (`server/server.js`, no second server):
loading a lesson, toggling `patch {layers:{presenter:true/false}}`, and switching
`aspect` between all three values all update the rendered shell correctly in place.

## 10. Accessibility / non-color cues

| Component | Cue |
|---|---|
| TenFrame | solid vs. hollow (dashed) circle — never fill color alone; `aria-label` states the spoken filled/empty count |
| NumberPath | number printed inside every stone; a distinct larger/thicker ring for the current position; an explicit arrow shape for direction; `aria-label` states position/marks/jump |
| BundlingVisual | an enclosing band (shape), not a color change, is the only thing that changes between "loose" and "bundled" — the ones themselves are always visible; `aria-label` states the count and bundled state |

## 11. Testing

`tools/visual-capabilities.test.mjs` (167 assertions) covers: TenFrame at 0/5/10/7/partial
fill and a five-frame, out-of-range clamping, the solid/hollow structural distinction,
stage-emphasis highlighting; NumberPath position count, current/marks/jump rendering,
inverted-bounds handling, the dashed-trail-vs-solid-axis distinction from NumberLine;
BundlingVisual's 10-ones-always-visible guarantee, the band-only-when-bundled cue, and
the "1 ten = 10 ones" label; resolver status for all three (`'component'`, not `'gap'`);
a full 78-experience capability audit (gap count == 0); and a render sweep of all 7
gap-using lessons × 3 aspects × every teaching stage. `tools/curriculum-runtime.test.mjs`
was updated in two places only (the former "known gap" example and the corpus gap-count
expectation, both now reflecting `'component'`/`0`) — nothing else in P5's suite changed.

## 12. Curriculum data note (read before assuming "no curriculum change")

The 7 Foundation Release 1 representation entries that requested these 3 types
(`0.2.8`, `1.2.1`, `1.2.3` → ten-frame; `0.2.6`, `0.2.7`, `1.2.5` → number-path;
`2.1.1` → bundling-visual) all had `representation.data: undefined` — the schema
already allowed a `data` object, but P4 had never populated it for these seven,
because no renderer existed yet to consume it.

**This is a mapping problem (category 1), not a curriculum change.** Each of the 7
representations was given a `data` object containing **only the numbers already
stated in that lesson's own accepted `examples.primary`/`teaching.setup` text** — e.g.
`0.2.8`'s primary example "7 on a ten-frame (3 away from 10)" became
`{ "size": 10, "filled": 7 }`. No new pedagogy, no new numbers, no schema field added
(`data` already existed as an optional key on every representation) — exactly the same
kind of structured-mirror-of-an-already-decided-example addition made for `1.3.1`'s
`equation-workspace` representation back in P4. `npm run lessons:validate` confirms all
78 experiences remain valid; the P4 corpus content (objective, teaching prose, examples,
mastery evidence, prerequisites) is byte-for-byte unchanged in these 7 files — only the
`representations[].data` field was added.

## 13. Remaining known visual limitations / what P7 should address

- **No manipulatives/interaction** — none of the 3 components support drag/drop or
  student input; they are teaching-presentation visuals only, by explicit P6 scope.
- **No 20-frame** — not requested by any accepted lesson; not built.
- **NumberPath does not yet support non-integer or negative domains** — no accepted
  Foundation Release 1 lesson needs this; `NumberLine` already covers that formal case
  for later domains.
- **Presenter composition is new and untested against a real camera feed** — the
  `.fr1-shell` presenter zone is verified structurally (correct percentages, correct
  show/hide behavior, correct 1:1 hiding) but has not been visually confirmed in an
  actual OBS Browser Source composited over a live camera — a human verification step,
  consistent with every prior baseline's OBS acceptance language.
- **P7 — Presenter Workflow, Lesson Flow & Recording Polish** is the next milestone;
  it was not started here.
