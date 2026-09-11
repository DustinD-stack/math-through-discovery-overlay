# Production Lesson Schema V1 & Authoring Pipeline

```
Milestone:            P3 — Production Lesson Schema & Authoring Pipeline
Curriculum baseline:  docs/foundation-release-1/ (P2, accepted)
Design System:        FROZEN — design-system-v1-accepted (unrelated to this milestone)
Status:               Schema, validator, loader, and a 6-lesson pilot are implemented
                       and tested. Bulk conversion of the remaining 51 Foundation
                       Release 1 lessons is explicitly NOT part of P3 — see P4.
```

This is the schema and tooling reference for turning accepted
`docs/foundation-release-1/` lesson blueprints into validated,
machine-readable lesson data. It is **additive** — nothing in
`src/utils/lesson-loader.js`, `lessons/*.json`, `lessons/lessons.bundle.js`,
or the live overlay/control/preview runtime was changed to build this.

## 1. Schema overview

A schema V1 lesson is one JSON object. Every lesson declares
`"schemaVersion": 1`; the loader (`src/curriculum/loader.js`) rejects
any other value outright rather than guessing what it means. Lesson
data is **semantic, not layout-coupled** — no pixel coordinates, no CSS
class names, no preset/aspect selection (those remain the presentation
layer's responsibility, exactly as in the legacy schema).

The envelope is one shared shape for every lesson **type** (discovery,
strategy, fluency, connection, error-analysis, application,
mastery-check, review) — see §4. Ordinary teaching-type lessons carry a
`teaching` block (SETUP→SEE→BREAK→BUILD→TRANSFORM→CHECK, §5);
`mastery-check` lessons carry an `assessment` block instead;
`review` lessons carry a `review` block instead. This was a deliberate
choice over separate schemas per type, made because the three families
share ~90% of their fields (id, unit, title, domain, prerequisites,
unlocks, representations, mastery, production) and only genuinely
differ in what replaces the narrative stage content.

## 2. Field reference

| Field | Type | Meaning |
|---|---|---|
| `schemaVersion` | integer | Must be `1`. |
| `id` | string | Globally unique. Convention: `unit.lesson` (e.g. `1.3.1`), `MC-unit` for mastery checks, `R-n` for reviews — not enforced by regex, only by uniqueness. |
| `unitId` | string | The P2 unit this lesson belongs to (e.g. `1.3`). |
| `sequence` | integer (optional) | Position within the unit. Omitted for mastery-check/review (they conceptually sit at the unit's end/interleaved, not at a fixed instructional position). |
| `title` | string | The lesson's name. |
| `domain` | string | The P1 domain id (e.g. `D1`). |
| `type` | enum | One of `discovery`, `strategy`, `fluency`, `connection`, `error-analysis`, `application`, `mastery-check`, `review`. |
| `objective` | string | The teaching goal, one or two sentences. |
| `studentQuestion` | string (optional) | The framing question a student hears. |
| `prerequisites` | string[] (optional) | Lesson ids that must be secure first. |
| `unlocks` | string[] (optional) | Lesson ids this lesson enables. |
| `newIdea` | string (optional) | What's genuinely new — omit for pure Fluency lessons. |
| `reuses` | string[] (optional) | Known ideas/lesson ids being reused. |
| `patterns` | string[] (optional) | Canonical reasoning-pattern slugs (`src/curriculum/constants.js REASONING_PATTERNS`). |
| `representations` | object[] (optional) | See §6. |
| `vocabulary` | string[] (optional) | New terms introduced. |
| `teaching` | object | See §5. Required for teaching-type lessons; not used by `mastery-check`/`review`. |
| `assessment` | object | Required for `type: "mastery-check"` only. See §9. |
| `review` | object | Required for `type: "review"` only. See §10. |
| `examples` | `{primary, second, transfer}` (optional) | Worked examples, as prose — see §1's semantic/prose boundary note below. |
| `misconceptions` | string[] (optional) | Ids into `src/curriculum/misconceptions.json`. See §7. |
| `language` | object (optional) | References into `src/curriculum/language.json`, plus lesson-specific `custom` wording. See §8. |
| `mastery` | object | `{evidence}` for ordinary lessons; the full facets/passEvidence/reteachTrigger block for `mastery-check`. See §9. |
| `production` | object (optional) | `{formatSupport, presenter}`. See §10. |

**Where prose stays prose, deliberately:** the full multi-sentence
narrative behind each `teaching` stage, each example, and the
`objective` are free-text strings, not further decomposed into
structured sub-fields — per this milestone's explicit instruction not
to encode prose that doesn't need to be structured. What P3 makes
structured is exactly what the validator, a future authoring UI, or a
prerequisite-graph tool would need to *check or index* mechanically:
ids, types, references, enums.

## 3. Required vs. optional

**Required for every lesson:** `schemaVersion`, `id`, `unitId`, `title`,
`domain`, `type`, `objective`.

**Required conditionally by type:** `teaching` (all types except
`mastery-check`/`review`); `assessment` (only `mastery-check`);
`review` block (only `review`); `mastery` with the full facets block
(only `mastery-check`).

**Optional for every lesson:** everything else in §2. The validator
accepts a lesson with only the required fields — see
`lessons/foundation-release-1/_template/lesson.template.json` for a
filled-in starting point rather than a minimal one, since a real
lesson should use most of the optional fields.

## 4. Lesson types

`src/curriculum/constants.js LESSON_TYPES`. One shared schema, per §1.
Mastery checks and reviews are genuinely structurally different (an
assessment task list, and a retrieval-target list, respectively, rather
than a five-stage teaching narrative) — that's the one axis where a
type-specific block was worth introducing; every other declared "lesson
type" (Discovery/Strategy/Fluency/Connection/Error Analysis/
Application) is identical in structure and differs only in *how the
author fills in* `teaching`, `examples`, and `misconceptions` — no
schema branching was needed for those.

## 5. Teaching stages

`teaching.{setup, see, break, build, transform, check}` —
`src/curriculum/constants.js STAGE_KEYS`. `see`/`break`/`build`/
`transform`/`check` are required; `setup` is optional, matching P2's
finding that several Unit 0.1/0.2 lessons have no SETUP meaningfully
distinct from SEE. **`setup` is never counted as a sixth reasoning
stage** — the validator has no special handling that would imply
otherwise, and any unrecognized key inside `teaching` (a typo, or an
invented stage) is a hard validation error.

Each stage value is either a plain string (the common case) or an
object `{ prompt, strategy? }` — `strategy` is only meaningful for
`check`, and must be one of `src/curriculum/constants.js
CHECK_STRATEGIES` (the canonical list from
`docs/CURRICULUM_ARCHITECTURE.md` §12). Using an object for `check`
lets tooling programmatically know *which* check strategy a lesson
uses without parsing prose.

**Stages may be intentionally minimal.** The validator only requires a
non-empty string or a valid `{prompt}` object — it has no minimum
length and never manufactures filler.

## 6. Representation format

`representations: [{ type, role?, data? }, ...]`.
`src/curriculum/constants.js REPRESENTATION_TYPES` is the closed
vocabulary, in three groups:

1. **Existing diagram-registry types** (`number-bond`, `fraction-bar`,
   `place-value-breakdown`, `number-line`, etc.) — these map 1:1 onto
   `src/modules/diagrams.js`'s `DIAGRAMS` registry keys (kebab-case in
   the schema, camelCase in the registry — see the `diagramKey` in each
   entry). This registry already existed as a clean, public "type
   string → renderer" contract, so P3 reused it rather than inventing a
   parallel one, per the instruction to inspect the existing registry
   first.
2. **Phase 6 teaching components** (`teaching-rail`, `prompt-card`,
   `equation-workspace`, `answer-reveal`, `transformation-chain`,
   `number-jobs`) — not part of `DIAGRAMS` (they're composed directly
   by `src/layouts/workspace.js`), but given the same semantic-type
   treatment rather than a raw component name + CSS class, per the
   instruction to prefer `representation: { type: ... }` over
   `component: "ComponentName"` — the type strings are the schema's own
   vocabulary, decoupled from the exact export name in `src/components/`.
3. **Concrete/gap types** (`objects`, `ten-frame`, `number-path`,
   `bundling-visual`) — `objects` has `status: 'concrete'` (no
   component is expected — Units 0.1/0.2 use this by design). The other
   three have `status: 'gap'`: they are the visual gaps
   `docs/foundation-release-1/README.md` identified (ten-frame,
   informal number path, bundling/unitizing visual). **A schema V1
   lesson may declare one of these — the validator accepts it as valid
   semantic data — but no rendering component exists for it, and P3
   does not invent one.** A future presentation layer must decide what
   to do with a `status: 'gap'` representation (e.g., fall back to a
   generic caption); that decision is out of scope here.

`data` is an open object per representation — its shape follows the
existing `diagram` spec conventions for diagram-registry types (e.g.
`{whole, parts}` for `number-bond`, matching `NumberBond()`'s existing
`{total, parts}`-shaped spec closely enough to translate mechanically
in a future P4/production-wiring step) and is lesson-author's choice
for teaching-component types, since those aren't fed through a single
generic spec object in the current runtime.

## 7. Misconception references

`misconceptions: ["MC-..."]` — ids into `src/curriculum/
misconceptions.json`, which mirrors the 9 root-cause entries in
`docs/foundation-release-1/MISCONCEPTION_MAP.md`. **The full map is
never copied into a lesson file** — only a reference. The validator
fails a lesson that cites an id not present in the registry.

Not every misconception mentioned in a P2 blueprint has (or needs) a
central registry entry — several are lesson-specific enough that they
don't recur elsewhere (e.g., Unit 1.1.1's "diagram feels disconnected
from objects" concern is real but unique to that one lesson's framing).
**Decision:** only misconceptions that recur across multiple lessons or
appear in the release-level `MISCONCEPTION_MAP.md` get a registry
entry and a `misconceptions[]` reference; a lesson-unique concern stays
as prose inside that lesson's `teaching` narrative (e.g., embedded in
the `see`/`transform` stage text) rather than being forced into a
one-off registry entry that nothing else would ever reference. This
keeps the registry a genuinely reusable asset instead of a 1:1 dump of
every blueprint's prose.

## 8. Language references

`language.teacherPrompts` / `language.studentFrames` — ids into
`src/curriculum/language.json`, mirroring
`docs/foundation-release-1/TEACHER_LANGUAGE.md`. `language.custom` is
an array of free-text strings for lesson-specific wording that doesn't
belong in the shared registry. **Global reusable wording lives in the
registry; lesson-specific wording lives in the lesson** — enforced only
by convention and code review, not by the validator (there's no
mechanical way to tell "should this have been a registry reference"
from a plain string).

## 9. Mastery metadata

For ordinary lessons: `mastery: { evidence }` — optional, one string.
For `type: "mastery-check"`: `mastery: { facets, passEvidence,
reteachTrigger }` is **required**, plus `assessment.tasks: [{ facet,
prompt }, ...]` (at least one task; `facet` must be one of the 8
`MASTERY_FACETS`). This directly preserves
`docs/foundation-release-1/MASTERY_CHECKS.md`'s three required fields
per check (PASS EVIDENCE, RETEACH TRIGGER, WHAT IT UNLOCKS — the third
is the lesson's ordinary top-level `unlocks[]`, reused rather than
duplicated).

**MC-1.2 remains the release's gate, unweakened in schema:** its
`prerequisites` list every Unit 1.2 lesson, and its `unlocks` names
`1.3.1` — nothing in the schema makes a gate "softer" than a prose
description would; a future runtime is expected to honor
`prerequisites`/`unlocks` as real gating data, not decoration.

## 10. Production metadata

`production: { formatSupport: ["long"|"short", ...], presenter:
"recommended"|"optional"|"not-needed" }`. This is the only
presentation-facing metadata the schema carries, and it is
deliberately thin: **no preset name, no aspect ratio, no pixel
layout.** Preset/aspect selection remains the runtime's job (as it
already is for legacy lessons — `state.js`'s URL params, not lesson
data), consistent with the instruction not to encode layout/preset
coordinates into lesson data absent an existing architectural decision
that requires it (none does).

## 11. File naming

`lessons/foundation-release-1/<unit-dir>/<lesson-id>.json`, where
`<unit-dir>` is the unit id with dots replaced by dashes (`unit-1-3`
for unit `1.3`) and `<lesson-id>.json` is the lesson's `id` verbatim
(e.g. `1.3.1.json`). Mastery checks live in a shared
`mastery-checks/` directory (they aren't "inside" a single numbered
unit conceptually — they gate the unit from outside it). Existing
legacy lessons in `lessons/*.json` are untouched and use their own
flat, topic-named convention — the two schemes coexist without
conflict because the loaders are entirely separate (§14).

## 12. ID rules

- Must be a non-empty string.
- Must be **globally unique** across the whole `lessons/
  foundation-release-1/` tree — `tools/lesson-validate.mjs` /
  `src/curriculum/validate.js validateCorpus()` checks this and fails
  the build (a hard error, not a warning) on any duplicate.
- No enforced regex — the `unit.lesson` / `MC-unit` / `R-n` shapes
  above are conventions, not constraints, so ids can evolve as the
  curriculum does.
- `prerequisites`/`unlocks` referencing an id that doesn't (yet) exist
  in the loaded set produce a **warning**, not a failure — expected
  during a partial migration (see §17); this becomes a hard error only
  once a corpus is declared fully migrated (a future P4/P5 decision,
  not implemented in P3).

## 13. Validation command

```
npm run lessons:validate
```

Runs `tools/lesson-validate.mjs`, which walks every subdirectory of
`lessons/foundation-release-1/` (skipping `_template` and the
generated `manifest.json`), loads and validates every file, and prints
every problem it finds — grouped as warnings (non-blocking) and hard
errors (exit code 1) — each with **file, path, and reason**, never a
bare "Invalid lesson." `npm test` also runs the schema test suite
(`node tools/lesson-schema.test.mjs`) as part of the standard
regression pass.

## 14. Adding a lesson

1. Copy `lessons/foundation-release-1/_template/lesson.template.json`
   into the right `unit-X-Y/` directory (or `mastery-checks/` for a
   mastery check), named `<id>.json`.
2. Fill in the required fields (§3) from the accepted P2 blueprint —
   never invent new pedagogy; the blueprint in
   `docs/foundation-release-1/UNIT_*.md` is the source of truth for
   *what* the lesson says, this schema only decides *how it's
   structured*.
3. Reference existing `misconceptions`/`language` registry entries
   where the blueprint's misconception/language matches one; add a new
   registry entry only if it will recur (§7/§8).
4. Run `npm run lessons:validate`. Fix every hard error; warnings about
   not-yet-converted prerequisite/unlock ids are expected and fine.
5. Run `npm run lessons:index` to refresh the generated manifest.
6. Run `npm test` to confirm nothing else regressed.

## 15. Previewing a lesson

P3 does not add a rendering preview (that would start pulling schema V1
data into the live overlay/control/preview runtime, which is explicitly
P4+ work). The closest available preview today is structural, not
visual:

```js
import { loadLesson } from './src/curriculum/loader.js';
import fs from 'node:fs';
const lesson = loadLesson(JSON.parse(fs.readFileSync('lessons/foundation-release-1/unit-1-3/1.3.1.json')), '1.3.1.json');
console.log(lesson); // the normalized, defaulted lesson object
```

A visual preview tool (rendering a schema V1 lesson through the actual
`EquationWorkspace`/`NumberBond`/etc. components) is recommended future
scope for P4, once enough lessons exist to make a preview worth
building and once the representation-`data` shape has been exercised
by more than the 6-lesson pilot.

## 16. Common errors

| Error | Likely cause |
|---|---|
| `schemaVersion — Missing.` | Forgot to add `"schemaVersion": 1` (easy to omit when copy-pasting from a legacy lesson, which has no such field). |
| `teaching.<stage> — Missing.` | One of `see`/`break`/`build`/`transform`/`check` was left out — every teaching-type lesson needs all five. |
| `teaching.<key> — "<key>" is not a recognized teaching stage.` | Typo'd a stage name (e.g. `"transfrom"`), or tried to add a stage the schema doesn't have (there is no sixth stage). |
| `representations[n].type — "<x>" is not a recognized representation type.` | Used a raw component export name (e.g. `"NumberBond"`) instead of the schema's kebab-case type string (`"number-bond"`) — see §6. |
| `misconceptions[n] — "<id>" is not defined` | Typo'd an id, or the misconception hasn't been added to `src/curriculum/misconceptions.json` yet (§7 — add it only if it will recur). |
| `<ref> — References lesson id "<id>", which does not exist` (warning) | Expected during partial migration — the referenced lesson hasn't been converted to schema V1 yet. Not a failure. |
| `id — Duplicate lesson id` | Two files declare the same `id` — this is a hard error; ids must be unique across the whole tree. |

## 17. Legacy compatibility

**Decision: (C) schema V1 applies only to new Foundation Release 1
lessons; the legacy schema remains fully and separately supported,
indefinitely, until a future milestone explicitly decides to migrate
it.**

Why C, not A or B:
- **(A) full legacy migration** would touch all 16 production lesson
  files and the live overlay/control/preview rendering path in the same
  milestone that's explicitly scoped to *not* convert bulk content —
  far outside P3's boundary and a large regression-risk surface for no
  benefit yet (no schema V1 consumer exists in the runtime).
- **(B) in-place migration** has the same risk profile as (A) with the
  added danger of losing legacy fields (`philosophy`, `facts`,
  `comparison`, `takeaways`, etc. — confirmed still in active use by
  `src/components/core.js` and `tools/ui-components.test.mjs` during
  the P3 audit) that schema V1 doesn't yet model, since Foundation
  Release 1's blueprints don't need them.
- **(C)** costs nothing today: `src/curriculum/*` and `lessons/
  foundation-release-1/*` are entirely new, additive files.
  `src/utils/lesson-loader.js`, `lessons/*.json`, and
  `lessons/lessons.bundle.js` are untouched, so every existing render
  path, test, and OBS behavior is provably unaffected (§ P3 audit,
  and the regression test in `tools/lesson-schema.test.mjs` that
  imports the legacy loader directly to confirm it still works).

## 18. What P4 will do

P4 — Foundation Release 1 Production Authoring — is expected to:

1. Convert the remaining 51 Foundation Release 1 lessons (57 total
   minus this milestone's 5 pilot lessons) plus the remaining 7 mastery
   checks and 13 review slots into schema V1 JSON, using this pipeline.
2. Decide, with evidence from a fuller corpus, whether unresolved
   `prerequisites`/`unlocks` warnings should become hard errors once
   the corpus is declared complete (§12).
3. Decide how (and whether) schema V1 lessons get wired into the live
   overlay/control/preview runtime — an adapter from schema V1 to the
   legacy `buildStageContent`/`workspace.js` region builders, or a
   parallel rendering path — this is a real design decision this
   milestone deliberately leaves open rather than pre-deciding.
4. Build the visual preview tool noted in §15, once justified by
   corpus size.
5. Revisit the three flagged visual gaps (ten-frame, number-path,
   bundling-visual) as a possible small, separately-reviewed design
   milestone if Foundation Release 1 content genuinely needs them
   rendered (not merely declared).

---

## Blueprint → schema field mapping

| P2 blueprint field (`docs/foundation-release-1/`) | Schema V1 field | Classification |
|---|---|---|
| Lesson ID (unit.lesson numbering, implicit in headings) | `id` | Required structured data |
| Unit (`UNIT_*.md` header) | `unitId` | Required structured data |
| Title (blueprint heading) | `title` | Required structured data |
| Domain (unit header) | `domain` | Required structured data |
| Type / Difficulty | `type` (type) + informal difficulty ladder | `type`: required structured data. The Entry/Developing/Secure/Transfer difficulty ladder (P2.12) is **not** a schema field — it's a sequencing/authoring concern already expressed by `sequence` order within a unit, not a value a lesson needs to declare about itself. Classified as **derived data** (inferrable from position) rather than encoded redundantly. |
| Teaching goal | `objective` | Required structured data |
| Student-facing question | `studentQuestion` | Optional structured data |
| Prerequisites | `prerequisites` | Optional structured data (machine-checkable) |
| New idea | `newIdea` | Optional structured data |
| Known ideas being reused | `reuses` | Optional structured data |
| Reasoning pattern(s) | `patterns` | Optional structured data |
| Representation progression | `representations` | Optional structured data |
| Vocabulary | `vocabulary` | Optional structured data |
| Setup / See / Break / Build / Transform / Check | `teaching.*` | Required structured data (teaching types) |
| Primary / second / transfer example | `examples.*` | Optional structured data — deliberately left as prose (§2 note) |
| Common misconception + why + teacher response | `misconceptions[]` (reference) | The *id* is required structured data when the misconception recurs; the prose (why/response) is **human documentation only**, living in `misconceptions.json`'s registry entry or the blueprint itself, never duplicated per-lesson |
| Check strategy | `teaching.check.strategy` | Optional structured data (enum) |
| Mastery evidence | `mastery.evidence` | Optional structured data |
| Next lesson unlocked | `unlocks` | Optional structured data (machine-checkable) |
| OBS / visual notes | `representations[].data`, gap `status` | Optional structured data / derived (gap flag is derived from the type registry, not authored per-lesson) |
| Presenter notes | `production.presenter` | Optional structured data |
| Long-form / short-form suitability | `production.formatSupport` | Optional structured data |
| Teacher language (canonical prompts) | `language.teacherPrompts` (reference) | Authoring-only metadata, by reference — the prompt text itself lives once in `language.json` |
| Student explanation language (sentence frames) | `language.studentFrames` (reference) | Authoring-only metadata, by reference |
| Pass evidence / Reteach trigger (mastery checks) | `mastery.passEvidence` / `mastery.reteachTrigger` | Required structured data (mastery-check type only) |
| Review "retrieves" (interleaved review) | `review.retrieves` | Required structured data (review type only) |
| Unit-level purpose / prerequisites / unlocks / patterns / representations | *(not a lesson field)* | Belongs at **unit level**, not lesson level — P3 does not introduce a separate "unit" JSON file in this milestone (out of scope; every pilot lesson currently repeats its own `domain`/prerequisites rather than inheriting them), and this is explicitly flagged as future schema work, not a P3 gap to silently work around. |
