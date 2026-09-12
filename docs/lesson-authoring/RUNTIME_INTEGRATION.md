# Foundation Release 1 — Runtime Integration (P5)

```
Milestone:   P5 — Production Corpus Runtime Integration & Lesson Player
Status:      schema-v1 corpus is live in preview.html and control.html/overlay.html,
             coexisting with the unmodified legacy runtime.
Depends on:  docs/lesson-authoring/README.md (schema v1 contract, P3)
             docs/foundation-release-1/ (accepted P2 curriculum, unchanged)
```

This document covers the **runtime** that consumes the schema-v1 corpus. It does not
repeat the field-by-field contract — see `docs/lesson-authoring/README.md` for that.

## 1. Schema-v1 runtime flow

```
schema-v1 lesson JSON
    -> validate/normalize    src/curriculum/loader.js        (P3, unchanged)
    -> adapt                 src/curriculum/adapter.js        (P5, new)
    -> lesson-player state   src/curriculum/player.js         (P5, new)
    -> representation        src/curriculum/representations.js(P5, new)
    -> composed DOM          src/curriculum/render-experience.js (P5, new)
    -> presentation layer    preview.html / overlay.html (aspect scaling, background)
```

Each arrow is a real module boundary. `adapter.js` is the **only** file that knows the
schema-v1 field shape; `player.js`/`representations.js`/`render-experience.js` only know
the small runtime model it produces. Lesson JSON never contains DOM structure, pixel
coordinates, or layout/preset names — that boundary was a hard requirement of this
milestone and is enforced by construction (nothing downstream of `adapter.js` reads
`lesson.teaching`, `lesson.representations[].data`, etc. directly).

## 2. Catalog loading

`src/curriculum/catalog.js` discovers the corpus from
`lessons/foundation-release-1/manifest.json` — the same **generated** index P3/P4
established (`npm run lessons:index`; never hand-edited). `buildCatalog(manifest)` is a
pure, synchronous view over it: `list()`, `listByUnit(unitId)`, `listUnits()`,
`getEntry(id)`, `has(id)`.

Reading the actual lesson content is environment-agnostic by design — `getExperience(id,
{ catalog, readLesson })` takes an injected reader:
- `makeFsReader(root, fs, path)` — Node (tests, tooling).
- `makeFetchReader()` — browser (`fetch`, same convention as the legacy loader's
  over-the-wire path in `src/utils/lesson-loader.js`).

## 3. Lesson lookup

`getExperience(id, {...})` resolves one entry by exact id, validates and normalizes it
(reusing `loader.js`), and returns the schema-v1 lesson object. An **unknown id throws
`CatalogError`** — it never substitutes another lesson. Both `preview-app.js` and
`overlay-app.js`'s `fr1-select` handler surface that error to the presenter/developer
(a visible message; the previously-loaded experience, if any, is left untouched).

## 4. Adapter

`src/curriculum/adapter.js` `adaptExperience(lesson)` converts a normalized schema-v1
lesson into a runtime model discriminated by `.kind`:

| `lesson.type` | `.kind` | Extra fields |
|---|---|---|
| discovery / strategy / fluency / connection / error-analysis / application | `'teaching'` | `stages[]` (optional leading `setup` + the 5 canonical), `railStages` (always the 5), `examples`, `misconceptions`, `masteryEvidence` |
| mastery-check | `'mastery-check'` | `tasks[]`, `facets[]`, `passEvidence`, `reteachTrigger` |
| review | `'review'` | `retrieves[]`, `prompt` |

Pure function; never mutates its input (tested explicitly). It never converts a
schema-v1 lesson into legacy shape — see §17.

## 5. Lesson-player state

`src/curriculum/player.js` exports three constructors plus a dispatcher:

- `createTeachingPlayer(experience)` — `current()`, `currentIndex()`, `atStart()`,
  `atEnd()`, `railStage()`, `next()`/`previous()` (both bounds-clamped, never move past
  either end), `goTo(stageId)` (throws `UnknownStageError` for an unrecognized stage —
  never silently maps to SEE), `reset()`, `revealAnswer()`/`hideAnswer()`/`isRevealed()`,
  `selectRepresentation(type)`/`activeRepresentation()`.
- `createAssessmentPlayer(experience)` — the same task-index shape (`current`,
  `next`/`previous`/`goTo`/`reset`) over `experience.tasks`, with **no** stage/rail
  concept at all.
- `createReviewPlayer(experience)` — exposes `prompt`/`retrieves` and a single
  `revealRetrieves()`/`reset()` toggle. No stage navigation to fake.
- `createPlayer(experience)` dispatches on `.kind`.

All state is **ephemeral runtime UI state** — a player is created fresh per loaded
experience and discarded on lesson switch. No persistence, no student accounts, no
mastery database — explicitly out of scope for P5 (and P6, per the acceptance gates).

Passing the wrong experience kind to a specific constructor throws `PlayerTypeError`
(e.g. `createTeachingPlayer` on a mastery-check) — verified in
`tools/curriculum-runtime.test.mjs`.

## 6. Teaching-stage behavior

Canonical order: **SETUP (optional) → SEE → BREAK → BUILD → TRANSFORM → CHECK.** SETUP
is a presentation state; `railStage()` returns `null` while on it and the TeachingRail
is synced to a "nothing active yet" state (`current: 0`) — **never a sixth rail node.**
The five canonical stages are always exactly `experience.railStages` regardless of
whether SETUP is present.

`goTo()` rejects unknown stage ids explicitly; `next()`/`previous()` are bounds-checked
so navigation can never move before the first or past the last stage. Loading a new
lesson means constructing a new player (index 0 by definition) — there is no shared
mutable "current lesson" object to reset.

## 7. Mastery-check behavior

Mastery checks are **never** forced through the teaching model. `assessment.tasks[]`,
`mastery.facets`, `mastery.passEvidence`, `mastery.reteachTrigger`, and `unlocks` are
carried through unchanged and displayed (`render-experience.js` `renderAssessment`).
P5 implements **only** navigation/display — no grading, no persistence, no unlock
enforcement. `MC-1.2`'s gate (blocking `1.3.1` until Unit 1.2 is secure) is data the
runtime displays; the runtime does not enforce or weaken it (there is no student-state
system in P5 to enforce it against).

## 8. Review behavior

Reviews show `review.prompt` and, on request (`revealRetrieves()`), the retrieved
lesson ids (`review.retrieves[]`). No automatic loading of the referenced earlier
lessons, no automatic review generation — exactly the P5 boundary.

## 9. Representation resolver

`src/curriculum/representations.js` `resolveRepresentation({ type, role?, data? })`
returns `{ status, type, render() }` with three possible statuses:

- **`'component'`** — a real existing renderer handles it. Two sources, both reused
  verbatim rather than duplicated:
  - `src/modules/diagrams.js` `DIAGRAMS` registry (`number-bond`, `fraction-bar`,
    `fraction-bar-model`, `number-line`, `place-value-breakdown`, `receipt`, …).
  - Phase 6 teaching components (`teaching-rail`, `prompt-card`, `equation-workspace`,
    `answer-reveal`, `transformation-chain`, `number-jobs`).
- **`'concrete'`** — `objects`: deliberately no diagram (Unit 0.1/0.2's pre-symbolic
  stages). Renders a small "OBJECT-BASED REASONING" note, not fabricated clipart.
- **`'gap'`** — a P2-identified visual gap (`ten-frame`, `number-path`,
  `bundling-visual`). Renders an explicit "VISUAL MODEL PENDING" placeholder (§10).

An **unregistered** type (not in `src/curriculum/constants.js` `REPRESENTATION_TYPES`)
throws `UnknownRepresentationError` — a corpus/schema problem, never silently ignored
and never confused with a documented capability gap.

When a `data` payload exists (e.g. `1.3.1`'s `equation-workspace` representation
carries real `{expr, kind}` lines authored in P4), the real component renders real
structured content. When a representation has no `data` (most of the corpus — P4
deliberately left prose as prose, per the schema's own "don't force prose into
structure" rule), the underlying component naturally renders nothing
(`EquationWorkspace({lines:[]})` returns `null` by its own existing logic) and the
composer falls back to the stage's plain prompt text. **No fragile string-to-equation
parsing was written for P5** — this was a hard instruction and is honored exactly.

## 10. Capability-gap handling

| Representation | Status | Why |
|---|---|---|
| `ten-frame` | **gap** | No production component exists. Placeholder only. |
| `number-path` | **gap** | No production component exists. Placeholder only. |
| `bundling-visual` | **gap** | No production component exists. Placeholder only. |
| `receipt` | **existing capability** | `DIAGRAMS.receipt -> ReceiptCard` already exists in `src/modules/diagrams.js` (used by the legacy `budget-receipt` lesson) — **not** a gap. Resolved as an ordinary `'component'`. |
| `objects` | **concrete, by design** | Not a gap — Unit 0.1/0.2 lessons are pre-symbolic on purpose. |

A gap placeholder (`.repr-gap` in `src/styles/curriculum-runtime.css`) always: (a) lets
the lesson load and play normally, (b) never crashes the runtime, (c) is visibly labeled
"VISUAL MODEL PENDING" plus the model name, (d) never pretends to be the real model.
**No gap component was built in P5** — this is intentionally temporary capability
reporting for a future, separately-scoped design milestone (P6, per its own name).
Verified across the full corpus: **7** representation instances resolve as gaps (see the
full-corpus sweep test); none of them are treated as failures.

## 11. Legacy coexistence

`src/utils/lesson-loader.js`, `lessons/*.json`, `lessons/lessons.bundle.js`, and the
Phase 6 `buildStageContent`/preset pipeline (`src/layouts/presets.js`,
`src/layouts/workspace.js`) are **completely unmodified**. Regression is verified two
ways: (1) `tools/smoke-test.mjs`'s 1152-combination sweep runs unchanged and still
passes; (2) `tools/curriculum-runtime.test.mjs` imports `normalize()` and
`buildStageContent` directly and asserts they still behave as before.

The explicit source discriminator is `runtimeModel.source`: `'foundation-v1'` for every
adapted schema-v1 experience. Legacy lesson objects carry no such field and are never
adapted — the two paths never cross. `src/app/overlay-app.js` uses a boolean
(`fr1Active`) rather than field-sniffing to decide which render path is active.

### Why a new composer, not `buildStageContent`

`src/layouts/presets.js` `buildStageContent` is semantically tied to the **legacy**
lesson shape: `deriveFlowLines` reads `lesson.steps.<id>.equation`, `VisualRegion` reads
`lesson.diagram`, `ResultRegion` reads `lesson.answer.value`. None of those fields exist
in schema-v1 (which has `teaching.<stage>` prose/prompts, `representations[]`, and no
lesson-level answer object at all). Forcing schema-v1 through that pipeline would mean
either (a) synthesizing legacy-shaped fake data from prose — explicitly forbidden — or
(b) rewriting `buildStageContent` to understand two incompatible schemas at once, which
is a redesign of an accepted, frozen presentation layer, also out of scope. `src/
curriculum/render-experience.js` is therefore a small, additive, new composition path
that reuses the exact same underlying components (`TeachingRail`, the diagram registry,
teaching components) without touching or replacing the legacy one. This is a documented
**runtime integration gap**, resolved the way the milestone's own escalation rules
prefer: a new adapter/presentation module, not a schema change and not a legacy rewrite.

## 12. Preview usage

`preview.html` — "P5 · Foundation Release 1 — production corpus (schema v1, live)"
section, mounted by `src/curriculum/preview-app.js`. A unit selector and an experience
selector are populated **entirely from the manifest** (no hardcoded lesson list); picking
any of the 78 experiences loads it through the real catalog/adapter/player/resolver and
renders it with working stage/task navigation, reveal toggle, and reset — no OBS, no
server-side state, just the module graph running in the browser.

## 13. OBS usage

`control.html`'s new "Foundation Release 1 (schema v1)" panel (`src/controllers/
control-app.js`) sends three new message types over the **existing** bus
(`src/app/bus.js` — WebSocket primary, BroadcastChannel/postMessage/localStorage
fallback; no second transport was added):

| Message | Payload | Effect in `overlay-app.js` |
|---|---|---|
| `fr1-select` | `{ id }` | Loads and activates a Foundation Release 1 experience |
| `fr1-stage` | `{ action }` (`next`/`previous`/`reset`/`reveal`/`goto:<id>`) | Advances the active player |
| `fr1-exit` | `{}` | Deactivates Foundation Release 1 mode, returns to the legacy stage exactly as it was |

Verified live against the real `server/server.js` over a genuine WebSocket connection
(not just unit tests): select → stage-advance → reveal → an unrelated `patch` (aspect
change) applied *while* Foundation Release 1 mode is active → exit → a second
`fr1-select` for a `mastery-check` experience → an **unknown id**, which fails with a
visible error and leaves the previously-loaded experience's player object untouched
(never silently swapped for something else). All behaved as designed.

Existing `state`/`patch`/`step`/`reload`/`ping` messages are untouched. `usesPresenter`/
`PRESETS`/aspect scaling continue to operate on the legacy `store` exactly as before;
Foundation Release 1 mode reads the same `store` for aspect/background (so an aspect
change from the control panel still applies while a schema-v1 experience is shown) but
does not participate in the preset/presenter system, since no accepted Foundation
Release 1 experience defines camera/preset composition (see §16, known limitation).

## 14. Query parameters

Not implemented in P5. `overlay.html`/`preview.html` already have a query convention
(`?lesson=&preset=&aspect=&bg=&step=&hide=`, `src/app/state.js`) for the **legacy**
runtime; extending it with `?lesson=1.3.1&stage=build`-style params for schema-v1 would
require deciding how the two id spaces coexist in one query string (legacy ids are
bare strings like `unit-rate`; schema-v1 ids like `1.3.1` don't collide today, but a
future legacy lesson id could). This is a small, well-defined follow-up left for P6/a
later milestone rather than an ad hoc addition here — the control panel and preview
selector already give a complete, working entry point for this milestone's scope.

## 15. Debugging

- `window.MTD` in the browser console (set by `overlay.html`) exposes the mounted app,
  including `window.MTD.fr1.select(id)`, `.stage(action)`, `.exit()`, `.player()`,
  `.isActive()` — the exact functions the bus messages call, usable directly without a
  control panel.
- `npm run lessons:validate` — corpus structural validation (unchanged from P3/P4).
- `node tools/curriculum-runtime.test.mjs` — the full P5 test suite standalone.
- A thrown `CatalogError`/`LessonValidationError`/`UnknownStageError`/
  `UnknownRepresentationError` always carries a specific, actionable message (never a
  bare "something went wrong").

## 16. Known visual gaps (carried forward, not resolved here)

`ten-frame`, `number-path`, `bundling-visual` — see §10. Building real components for
these remains for a future, separately-scoped design milestone. Also carried forward as
a known limitation: Foundation Release 1 experiences currently define no
presenter/camera composition (P2's `production.presenter` field is a recommendation,
not a layout instruction), so schema-v1 mode does not yet participate in the A–H preset
system the legacy runtime uses for camera layout.

## 17. What remains for P6

Per the milestone name **P6 — Visual Capability Completion & Teaching Experience
Integration**:

1. Real components for the three visual gaps (ten-frame, number-path, bundling-visual),
   as a properly-scoped design milestone (not invented here per P5's explicit boundary).
2. Deciding whether/how Foundation Release 1 experiences participate in the A–H preset
   system for camera/layout composition, if presenter integration is wanted.
3. `?lesson=&stage=` query-parameter support for schema-v1 experiences in
   preview/overlay, once the id-space question (§14) is resolved.
4. Bulk conversion of the remaining legacy lesson library, if/when schema-v1 is judged
   ready to become the sole authoring format — an explicit, separate decision, not an
   automatic consequence of P5.

None of the above is started in P5.
