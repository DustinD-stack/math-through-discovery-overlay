# Foundation Release 1 — Detailed Scope & Lesson Blueprints

```
Milestone:          P2 — Foundation Release 1 Detailed Scope & Lesson Blueprints
Curriculum baseline: docs/CURRICULUM_ARCHITECTURE.md (P1, accepted)
Design System:       FROZEN — design-system-v1-accepted (fbe1c2de671f7c9a842cd41b848b9d73f1b37333)
Status:              Instructional blueprints complete. No production lesson data
                     authored. No schema changed. No UI/Penpot touched.
```

This directory is the detailed instructional blueprint package for **Foundation
Release 1** — the first content release recommended in
`docs/CURRICULUM_ARCHITECTURE.md` §16. It turns that release's ~62-lesson placeholder
outline into fully specified lesson blueprints, ready for a future P3 milestone to
design the production authoring/data system around, **without guessing what a lesson
needs.**

## Release scope

Exactly the 8 units accepted in P1 §16, blueprinted in full:

| Unit | Domain | Title | Lessons | Doc |
|---|---|---|---|---|
| 0.1 | D0 | Quantity Before Symbols | 8 | [UNIT_0_1_QUANTITY_BEFORE_SYMBOLS.md](UNIT_0_1_QUANTITY_BEFORE_SYMBOLS.md) |
| 0.2 | D0 | Parts, Wholes & Number Location | 8 | [UNIT_0_2_PARTS_WHOLES_LOCATION.md](UNIT_0_2_PARTS_WHOLES_LOCATION.md) |
| 1.1 | D1 | Number Bonds | 7 | [UNIT_1_1_NUMBER_BONDS.md](UNIT_1_1_NUMBER_BONDS.md) |
| 1.2 | D1 | Benchmark Numbers | 5 | [UNIT_1_2_BENCHMARK_NUMBERS.md](UNIT_1_2_BENCHMARK_NUMBERS.md) |
| 1.3 | D1 | Make 10 | 7 | [UNIT_1_3_MAKE_10.md](UNIT_1_3_MAKE_10.md) |
| 2.1 | D2 | Tens and Ones | 7 | [UNIT_2_1_TENS_AND_ONES.md](UNIT_2_1_TENS_AND_ONES.md) |
| 3.1 | D3 | Doubles & Halves | 7 | [UNIT_3_1_DOUBLES_HALVES.md](UNIT_3_1_DOUBLES_HALVES.md) |
| 3.2 | D3 | Compensation | 8 | [UNIT_3_2_COMPENSATION.md](UNIT_3_2_COMPENSATION.md) |

Plus release-wide systems:

- [MASTERY_CHECKS.md](MASTERY_CHECKS.md) — 1 mastery-check blueprint per unit (8 total).
- [INTERLEAVED_REVIEW.md](INTERLEAVED_REVIEW.md) — 13 review slots across the release.
- [MISCONCEPTION_MAP.md](MISCONCEPTION_MAP.md) — release-level misconception table.
- [TEACHER_LANGUAGE.md](TEACHER_LANGUAGE.md) — canonical teacher prompts and student
  explanation sentence frames.

Nothing outside this scope was expanded — no extended place value, no written
algorithms, no formal Equivalence domain, no multiplication, no division, no fractions
(per the milestone's explicit boundary). Where an earlier lesson naturally *previews* a
later domain without teaching it (e.g., 3.1.6's honest "doesn't split evenly" moment
previewing remainders; 2.1.3's regrouping preview), that preview is noted inline in the
relevant lesson blueprint and is never treated as having taught the later domain.

## P2.22 — Final release size (replaces P1's ≈62 estimate)

P1 estimated ≈62 lesson-slots (which bundled mastery checks into unit lesson counts) +
≈12–15 interleaved reviews. Detailed blueprinting separates these into distinct
experience types, per the milestone's request:

| Category | Count |
|---|---|
| **New instruction lessons** (Discovery, Strategy, Fluency types) | 48 |
| **Connection lessons** | 6 |
| **Error Analysis lessons** | 2 |
| **Application lessons** | 1 |
| **Total instructional lessons** | **57** |
| **Mastery checks** | 8 |
| **Interleaved review slots** | 13 |
| **TOTAL FOUNDATION RELEASE 1 EXPERIENCES** | **78** |

**Comparison to P1's estimate:** P1's ≈62 lesson-slots included the 8 mastery checks
inline within unit lists — normalizing for that, P1 implied ≈54 non-mastery lessons.
Detailed blueprinting arrived at 57 — a modest, expected increase (+3) from
placeholder titles to fully specified blueprints, not a scope failure or a sign P1's
estimate was wrong. The review-slot count (13) lands squarely inside P1's 12–15
estimate. **No revision to `docs/CURRICULUM_ARCHITECTURE.md` is warranted by this
result.**

Per-unit lesson-type breakdown (instructional lessons only, excluding mastery checks):

| Unit | Discovery | Strategy | Fluency | Connection | Error Analysis | Application | Total |
|---|---|---|---|---|---|---|---|
| 0.1 | 4 | 4 | 0 | 0 | 0 | 0 | 8 |
| 0.2 | 7 | 1 | 0 | 0 | 0 | 0 | 8 |
| 1.1 | 2 | 4 | 0 | 1 | 0 | 0 | 7 |
| 1.2 | 2 | 2 | 1 | 0 | 0 | 0 | 5 |
| 1.3 | 1 | 4 | 0 | 1 | 1 | 0 | 7 |
| 2.1 | 2 | 3 | 0 | 2 | 0 | 0 | 7 |
| 3.1 | 2 | 3 | 1 | 1 | 0 | 0 | 7 |
| 3.2 | 1 | 4 | 0 | 1 | 1 | 1 | 8 |
| **Total** | **21** | **25** | **2** | **6** | **2** | **1** | **57** |

## P2.21 — Release dependency audit

Every lesson, in sequence, was checked against: *does it require a concept not yet
taught? does a representation appear before its conceptual foundation? does symbolic
notation arrive too early?* Full pass, with **one genuine finding** (below) and three
confirmations worth recording explicitly:

- ✅ **Make 10 depends on secure part-whole reasoning** — confirmed. Unit 1.3 lists Unit
  1.1 (bonds) and 1.2 (complements to 10) as hard prerequisites; MC-1.2's reteach trigger
  explicitly blocks progression to Unit 1.3 without fluent complements to 10 — this is
  called out in `MASTERY_CHECKS.md` as "the single most important gate in the release."
- ✅ **Compensation requires equivalence understanding made explicit enough** — this was
  a real risk (compensation is arguably the release's most equivalence-dependent
  strategy, taught before D4's formal Equivalence domain exists). Mitigated by 3.2.7
  (Error Analysis), added specifically to force an explicit "why does this preserve
  value" justification rather than deferring that justification to D4 in a later
  release. No lesson in this unit teaches compensation as "just move one because it's
  easier," per the milestone's explicit instruction.
- ✅ **Place value depends on unitizing 10** — confirmed. Unit 2.1 opens with 2.1.1
  (bundling ten ones into one new unit), directly reusing Unit 1.3's "10" as an
  already-meaningful quantity before any two-digit numeral is introduced.
- ⚠️ **Does doubles/halves introduce multiplicative thinking too early?** — reviewed and
  judged **acceptable, not a finding**: Unit 3.1 treats doubling strictly as "the same
  amount added to itself" (an addition/part-whole frame), never introduces the word
  "multiply" or `×` notation, and 3.1.7's distribution-across-place-value reasoning is
  explicitly flagged as "a concrete instance of the Distribute pattern, well before D5
  formalizes it" rather than teaching D5 content ahead of schedule.

### P2 Prerequisite Finding — Unit 1.3's original transfer example

**Finding:** P1/P2's brief for Unit 1.3 suggested extending Make 10 to a two-digit
transfer example (e.g., `27 + 5`). Detailed blueprinting found this **cannot correctly
sit inside Unit 1.3**, because decomposing a two-digit number by place value
(recognizing `27` as `20 + 7`) is Unit 2.1 content, which is sequenced **after** Unit
1.3 in both P1's domain order (D1 before D2) and this release's unit order.

**Recommended smallest correction (applied):** Unit 1.3's transfer lesson (1.3.7) uses a
same-scale transfer example (`6 + 9`) instead, keeping the unit's scope internally
consistent. The two-digit extension is preserved — not discarded — as **Unit 2.1's
lesson 2.1.6 ("Building a Ten From Ones")**, placed immediately after place value is
established, exactly where the prerequisite is actually satisfied. This required no
change to `docs/CURRICULUM_ARCHITECTURE.md`'s domain/unit order — only a lesson-level
placement decision within P2's own scope, per the instruction not to silently rewrite
P1 or hide the problem.

### P2 Refinement Note — Unit 0.1 / 0.2 content boundary

P1's placeholder titles for Unit 0.1 included "Parts Inside a Whole," "Break a Quantity
Apart," and "Put Quantities Back Together." This milestone's own brief (P2.4/P2.5)
redefines Unit 0.1 as purely quantity/counting/comparison content and moves
compose/decompose/part-whole content fully into Unit 0.2. This is recorded as a
**refinement**, not a **prerequisite finding** — Unit 0.1's underlying *purpose* in P1
§14 (establish quantity before any operation) is unchanged; only which lessons carry
which sub-topic shifted, and P2's own explicit instructions are the direct source of the
change, not a defect discovered independently.

## P2.19 / P2.20 — Visual assignment & format planning summary

Every lesson blueprint states its primary representation and OBS/format classification
inline. Aggregated:

**Component usage across the release:**

| Component | Lessons using it (approx.) |
|---|---|
| `NumberBond` | ~19 (all of Unit 1.1, most of 1.2–1.3, 3.1.5, 3.2.7's split framing) |
| `EquationWorkspace` | ~18 (Unit 1.1.7 onward, most of 1.3, 2.1.6, 3.1.3–3.1.4, all of 3.2) |
| `PlaceValueBreakdown` | ~11 (all of Unit 2.1, referenced in 3.1.7) |
| `TransformationChain` | ~4 (1.3's flagship examples, 3.2.7) |
| `NumberLine` (informal precursor in D0, full component from D1 onward) | ~6 |
| Physical objects / dots / bundles only (no MTD component) | ~19, concentrated in
  Units 0.1 and 0.2, where the entire pedagogical point is *pre-symbolic* representation |

**Visual gaps flagged (no new component invented, per instruction):**

1. **Ten-frame / five-frame** — used conceptually across Units 0.2 and 1.2 as the
   primary tool for benchmark reasoning, but the design system has no dedicated
   component for it; represented as generic object/picture work throughout this
   package. Strong candidate for a future, separately-reviewed design milestone.
2. **Informal number path (pre-`NumberLine`)** — Unit 0.2 needs a very stripped-down
   number line (no ticks, no units, just ordered position) before the full `NumberLine`
   component's conventions (which assume numeric labels and jump arithmetic) are
   meaningful. Currently represented as an unstyled picture; flagged for the same future
   design review.
3. **Bundling/unitizing visual** (loose objects → a bundled "ten" object) — Unit 2.1's
   opening lesson (2.1.1) has no dedicated component; represented with physical objects
   only, which is appropriate for this specific concrete lesson but has no
   picture-stage bridge before `PlaceValueBreakdown` takes over at 2.1.2.

None of these gaps block Foundation Release 1 — every affected lesson is explicitly
scoped to use physical/pictorial representation *because* it precedes symbolic work, per
the Object→Picture→Symbol progression. They are noted here as forward-looking design
input, not release blockers, and **no new design-system component was created to fill
them**, per this milestone's constraints.

**Format planning (aggregated from all 57 lessons):**

- **Both (long-form and short-form):** the overwhelming majority (54 of 57) — Foundation
  Release 1's content is short, concrete, and works at any length.
- **Long-form only:** none identified — no lesson in this release requires extended
  runtime.
- **Presenter Recommended:** 15 lessons — concentrated in Unit 0.1/0.2 (physical-object
  demonstrations benefit from a visible presenter) and each unit's flagship worked
  example (1.3.1, 2.1.6, 3.2.2, 3.2.8).
- **Presenter Optional:** 39 lessons — the default for symbolic/strategy work once
  concrete grounding is established.
- **Presenter Not Needed:** 2 lessons (1.2.4, 3.1.2) — both Fluency-type drills,
  explicitly the only lesson type in this release judged not to benefit from a camera.

## P2.23 — Machine-readable future check

The lesson blueprint contract (`docs/CURRICULUM_ARCHITECTURE.md` §13's proposed fields,
exercised concretely across all 57 lessons in this package) proved **regular enough** to
become structured metadata in a future P3 schema — every field below was filled for
every lesson without needing an escape hatch, though field *length* varied
intentionally (per the instruction not to make every field artificially long).

**Fields that are universal** (present and meaningful for every single lesson):
`lessonId` (unit.lesson number), `title`, `domain`, `unit`, `lessonType`,
`teachingGoal`, `studentQuestion`, `prerequisites`, `primaryExample`,
`secondExample`, `transferExample`, `checkStrategy`, `masteryEvidence`,
`nextLessonUnlocked`, `format` (long/short/both), `presenterNote`.

**Fields that are optional** (present for most, but genuinely absent or trivial for
some — e.g., the earliest Unit 0.1 lessons have no prior "known idea" to reuse, and the
Fluency-type lessons deliberately have no `newIdea`):
`newIdea` (absent/trivial for pure Fluency lessons: 1.2.4, 3.1.2), `commonMisconception`
+ `whyItHappens` + `teacherResponse` (present for nearly all, but a small number of
purely procedural drill lessons have no distinct misconception beyond ones already
logged elsewhere), `vocabulary` (empty for lessons that introduce no new term, e.g.
2.1.6, 3.1.7).

**Fields that belong at unit level, not lesson level** (repeated identically across
every lesson in a unit in this package — a schema should store them once per unit and
inherit down): `domain`, `unit purpose`, `unit prerequisites`, `unit unlocks`,
`primary patterns` (the unit-level set; individual lessons select from it rather than
defining new ones), `primary representations` (the unit-level set).

**Fields that belong at lesson level** (genuinely vary lesson to lesson within a unit):
`title`, `lessonType`, `teachingGoal`, `studentQuestion`, `prerequisites` (lesson-
specific, often a subset of the unit's), `newIdea`, `knownIdeasReused`, `vocabulary`,
`primaryExample`/`secondExample`/`transferExample`, `commonMisconception` +
`whyItHappens` + `teacherResponse`, `checkStrategy`, `masteryEvidence`,
`nextLessonUnlocked`, `format`, `presenterNote`.

**Fields that belong at step level** (vary *within* a single lesson, one entry per
SEE/BREAK/BUILD/TRANSFORM/CHECK stage — this is new structure not present in either the
unit or lesson level above, and not present at all in the current production schema):
the SETUP/SEE/BREAK/BUILD/TRANSFORM/CHECK narrative content itself. Every lesson in this
package defines this as five-to-six short prose statements; a future schema should model
it as an ordered list of `{stage, teacherPurpose, studentQuestion, visualPurpose,
mathContent}` records (the exact shape proposed in `docs/CURRICULUM_ARCHITECTURE.md`
§8's table), rather than five separate flat fields — this is the one place this
package's blueprint contract implies genuinely nested structure, not just a flat field
list.

This analysis is input to P3 and does not itself define or implement a schema.

## Verification performed for this milestone

All 13 verification items from the P2 prompt were checked against the finished package:

1. **Exactly the accepted 8 units are detailed** — confirmed above.
2. **Every instructional lesson has a blueprint** — 57 of 57, each with all required
   contract fields (§ P2.2 of the milestone).
3. **Every lesson has explicit prerequisites** — stated in every blueprint; entry
   lessons (0.1.1, 0.2.1, 1.1.1, 1.2.1, 1.3.1, 2.1.1, 3.1.1, 3.2.1) correctly list only
   the prior unit's capstone or "none."
4. **Every lesson has a genuine CHECK** — every blueprint's CHECK field uses a named
   strategy from `docs/CURRICULUM_ARCHITECTURE.md` §12 (recount, inverse operation,
   commutativity, or alternate representation), never "the teacher confirms it's right."
5. **Examples are mathematically correct** — every worked example (7+5=12, 8+6=14,
   9+7=16, 49+27=76, 38+19=57, 99+36=135, 52-19=33, 34=30+4, double 23=46, etc.) was
   computed and re-checked while authoring.
6. **No fake reasoning stages were introduced** — per P2.3, several Unit 0.1/0.2 lessons
   redefine TRANSFORM as "same quantity → different arrangement" or "two separate known
   parts → one combined whole" rather than forcing an algebraic-looking step where none
   exists; Fluency lessons (1.2.4, 3.1.2) explicitly state their TRANSFORM step drills an
   already-established equivalence rather than adding a new one.
7. **Representations follow conceptual development** — no `NumberBond` before Unit
   1.1.1's explicit "this is a model of what you already know" framing; no
   `PlaceValueBreakdown` before Unit 2.1.1's concrete bundling; symbolic equations appear
   only from Unit 1.1.7 onward.
8. **Mastery checks test reasoning, not answer-only performance** — every check in
   `MASTERY_CHECKS.md` requires narration, diagnosis of a broken example, or translation
   between representations, not merely a final numeric answer.
9. **Reviews are interleaved** — `INTERLEAVED_REVIEW.md`'s 13 slots each retrieve
   material at least one full lesson removed from where they sit, per its stated design
   rules.
10. **Misconceptions are diagnostically useful** — every entry in `MISCONCEPTION_MAP.md`
    names a specific likely mental model and a diagnostic question, not just "wrong."
11. **Design System V1 remains untouched** — no Penpot access this milestone; no edit to
    `docs/DESIGN_SYSTEM_HANDOFF.md`.
12. **Production code remains untouched** — no file under `src/`, `server/`, or
    `overlay.html`/`control.html`/`preview.html` changed.
13. **Current lesson schema remains untouched** — `lessons/*.json` and
    `src/utils/lesson-loader.js` are unmodified; §"P2.23" above is analysis only.

`npm test` was re-run after this package was written; result recorded in the Milestone
P2 report.
