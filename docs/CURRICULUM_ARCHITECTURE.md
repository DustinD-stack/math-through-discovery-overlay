# Math Through Discovery — Curriculum Architecture

```
Status:                  DRAFT ARCHITECTURE — curriculum content is EVOLVING
Design System:           FROZEN at design-system-v1-accepted (fbe1c2de671f7c9a842cd41b848b9d73f1b37333)
Milestone:                P1 — Production Curriculum Architecture
Scope of this document:  architecture, sequencing, and metadata design only.
                         No lesson content is mass-authored here. No schema is changed here.
```

This document is the **curriculum architecture source of truth**. It is deliberately
separate from `docs/DESIGN_SYSTEM_HANDOFF.md`, which remains the frozen record of the
accepted UI/design system (tokens, components, states, responsive compositions,
Penpot structure). That document is not modified by this milestone.

**Two things are true at once, and this document keeps them distinct:**

- **FROZEN — Design System V1** (`docs/DESIGN_SYSTEM_HANDOFF.md`): the reasoning
  components, tokens, presets, and Penpot pages. Not touched by curriculum work.
- **EVOLVING — Curriculum Content**: domains, units, lessons, prerequisites, and the
  metadata schema they will eventually need. This is what this document defines.

Curriculum work must never justify a design-system change ("we need a new component
because this lesson doesn't fit" is a signal to reconsider the lesson or propose a
*future*, separately-reviewed design milestone — not to alter the frozen baseline here).

---

## 0. Core teaching system (unchanged, inherited from Design System V1)

Every appropriate lesson uses the five-stage reasoning path:

**SEE → BREAK → BUILD → TRANSFORM → CHECK**

under the intellectual backbone **SAME VALUE. DIFFERENT FORM.**, with representations
progressing **OBJECT → PICTURE → NUMBER / SYMBOL**, and the reasoning-language lens
**WHOLE → SPLIT → TAKE** used where it fits the problem's structure (not forced).

The curriculum exists to teach students to **recognize mathematical structure**, not to
memorize isolated procedures. Every domain below is designed so a learner leaves it able
to answer "what kind of problem is this, and what have I seen like it before?" — not just
"what's the next step."

---

## 1. Audience & progression mechanism

Primary entry point is **approximately Grade 3+**, but the architecture must also serve:

- younger learners who already have the prerequisites
- middle-school learners with specific gaps
- teenagers rebuilding fundamentals
- adults rebuilding mathematical understanding

**Grade level is not the organizing mechanism.** The organizing mechanism is a
**skill prerequisite graph** (§4) and a **mastery model** (§10): a learner enters wherever
their demonstrated mastery places them, not wherever their age places them. Grade bands
exist only as an optional navigation aid (§15) layered on top of the skill graph — they
never override a prerequisite gate.

---

## 2. The true foundation before Number Bonds

**What must a learner understand before Number Bonds?** Number Bonds require a learner to
treat a quantity as something that can be held whole *or* seen as parts — that requires
concepts that are usually assumed but frequently are not secure, especially in learners
"rebuilding fundamentals." A student who can recite "seven" does not necessarily
understand what 7 **is**.

The true foundation, in dependency order:

1. **Quantity** — a number names *how many*, independent of what is counted or how it's arranged.
2. **Counting** — a stable, ordered sequence of number words.
3. **Cardinality** — the last count word said names the size of the whole group (not just the last item touched).
4. **One-to-one correspondence** — each object gets exactly one count word; the mechanical basis of accurate counting.
5. **Subitizing** — recognizing small quantities (2–5, sometimes to 6) instantly, without counting — the seed of "seeing structure" instead of counting one-by-one.
6. **More / less / equal** — comparing two quantities without needing to name either one first.
7. **Composing quantities** — putting two groups together makes a new, single quantity.
8. **Decomposing quantities** — a quantity can be pulled apart into smaller quantities and is still the same amount.
9. **Part / whole** — the relationship that composing and decomposing both describe; the direct precursor to a Number Bond.
10. **Number location** — a quantity has a position (this is the seed of the number line, used everywhere from Grade 3 fractions through algebra).
11. **Distance between quantities** — how far apart two quantities are is itself a quantity (seeds subtraction-as-distance and later, comparison/ratio).
12. **Zero** — zero is a legitimate quantity (an empty group), not "nothing to talk about" — a common early misconception that resurfaces at place value ("790 has zero ones") and algebra ("x = 0 is a valid solution").
13. **Benchmark quantities** — 5 and 10 (and later 100) as anchor points for estimation and reasoning, not just numbers to count to.

This foundation is **Domain 0** in the curriculum map (§14) and is a formal, assessed
domain — not an assumed prerequisite skipped in documentation. A learner (of any age)
who cannot reliably decompose a quantity or treat zero as a real amount is not yet ready
for Number Bonds, regardless of grade.

---

## 3. Curriculum spine — analyzed and reordered

The milestone's starting spine (23 items) was analyzed for dependencies rather than
preserved by default. Three structural changes were made, each justified below; nothing
was dropped — every original topic still exists, several were **grouped** into a single
domain instead of standing as isolated numbered items, which better reflects how they
actually depend on each other and avoids the "numbered playlist" problem.

| Change | Why |
|---|---|
| **Compensation** and **Doubles/Halves** are folded into **Addition & Subtraction Strategies** as units, not separate top-level topics | Both *are* addition/subtraction strategies; treating them as separate spine items implied a false sequential gap between them and the domain they belong to. |
| **Fractions ↔ Decimals ↔ Percent** is the capstone *unit* of the Fractions/Decimals/Percent domain, not a fourth separate topic after Fractions, Decimals, Percent | It is literally the connective content between the other three — making it a fourth sequential topic hid that it is the domain's equivalence payoff, not new material. |
| **Estimation & Checking** is treated as a **cross-cutting thread**, not a terminal 23rd topic | Estimation only means something in the context of a specific operation; parking it at the end implied learners only estimate after everything else, when in fact benchmark estimation starts in Domain 0 and a check strategy is required at every lesson's CHECK stage. |

**Equivalence is not renumbered away — it is explicitly the thread**, both as its own
formal domain (Domain 4, where the *general* idea "same value, different form" is named
and practiced directly) and as a required re-appearance in the capstone unit of every
domain that follows it (fractions↔decimals↔percent, ratio tables, equation
transformations). See §4's dependency graph and the "UNLOCKS" field in §14 for exactly
where it resurfaces.

**Two topics present in the current production lesson library are not in the original
23-item spine and are added here rather than silently ignored:** `integers` (negative
numbers) and `exponents`. Both are placed in the reordered architecture (§14, Domain 12
and Domain 9 respectively) so that existing production content has a home in the
architecture, per the instruction not to let any lesson assume an unintroduced concept.
`budget-receipt` (also in the current library) is not a domain — it is an **Application**
lesson type (§7) that draws on Addition/Subtraction and Percent/Decimals; it is noted as
such rather than invented into its own domain.

**Final recommended domain order** (dependency-driven, not spine-order-preserving):

```
D0  Pre-Number Foundations
D1  Number Sense & Composition          (Number Bonds, Make 5, Make 10)
D2  Place Value & Base Ten
D3  Addition & Subtraction Strategies   (incl. Doubles/Halves, Compensation)
D4  Equivalence — Same Value, Different Form   [formal home of the cross-cutting thread]
D5  Multiplicative Reasoning            (Multiplication Structure)
D6  Division, Sharing & Remainders
D7  Fractions, Decimals & Percent
D8  Ratios, Proportions & Scaling
D9  Expressions, Unknowns & Early Algebra   (incl. Exponents)
D10 Geometry & Measurement               [parallel-eligible]
D11 Data & Probability                   [parallel-eligible]
D12 Integers & the Extended Number Line
```

D10 and D11 are **parallel-eligible**: once their own prerequisites are met they do not
need to wait for D5–D9 to finish; a production schedule may interleave them alongside the
main spine rather than strictly after it. Estimation & Checking is not a domain in this
list because it has no single "home" — it is required scaffolding inside every domain's
CHECK stage and is formalized as a reusable library in §12, not a place in the sequence.

---

## 4. Prerequisite graph

```
Quantity → Counting → Cardinality → One-to-One Correspondence → Subitizing
    → More/Less/Equal → Compose/Decompose → Part/Whole
    → Number Bonds → Make 5 → Make 10 → Flexible Addition/Subtraction

Number Location → Distance Between Numbers → Number Line (used from D1 onward)

Zero (as a quantity) → Place Value "empty place" concept → Decimal place value

Part/Whole → Place Value
    → Decomposition
    → Multi-Digit Mental Math
    → Standard Algorithms
    → Decimal Place Value

Compose/Decompose + Number Bonds → Equivalence (formal)
    → Equivalent Fractions
    → Fraction/Decimal/Percent Conversion
    → Equation Transformations (both sides of "=" stay equal)

Flexible Addition (repeated groups) → Equal Groups
    → Multiplication Structure
    → Scaling / Multiplicative Comparison
    → Ratios
    → Proportions & Scaling

Part/Whole + Multiplication (as its inverse) → Equal Sharing
    → Division
    → Remainders as Quantities
    → Remainder-as-Fraction
    → Fractions (feeds Domain 7 directly)

Fractions → Decimals → Percent → Fraction/Decimal/Percent Equivalence
    (each conversion IS an equivalence instance — Domain 4 resurfacing)

Number Location + Compose/Decompose → Integers (extending the line below zero)

Expressions (naming a calculation) + Equivalence (keeping two sides equal)
    → Unknowns & Equations
    → Generalization / Early Algebra
    → Exponents as repeated-multiplication structure

Measurement/Geometry and Data/Probability both depend only on:
    Number Sense + Fractions/Decimals/Percent (for precision and likelihood)
    — they do not gate the main spine and the main spine does not gate them.
```

**Key unlocking relationships** (skill → what it unlocks):

| Skill secured | Unlocks |
|---|---|
| Part/Whole | Number Bonds, Place Value, Fraction concept |
| Make 10 | Flexible mental addition/subtraction, multi-digit strategies |
| Place Value | Multi-digit computation, decimals, rounding/estimation |
| Equivalence (formal) | Equivalent fractions, unit conversion, equation-solving |
| Multiplication structure | Division, scaling, ratios, area |
| Division + Remainders | Fractions-of-a-quantity, ratio tables |
| Fractions | Decimals, percent, ratios, probability |
| Expressions | Equations, generalization, exponents |
| Number location + signed distance | Integers, coordinate work |

This is not a numbered playlist — it is a graph. A learner (of any age) can be placed
anywhere in it based on demonstrated mastery, and a production scheduler can validate a
lesson's prerequisites mechanically once the metadata in §13 exists.

---

## 5. Pattern library — canonical reasoning patterns

Every lesson should reference one of these **named** patterns rather than inventing new
terminology. Canonical name, one-line definition, and a worked example:

| Pattern | Definition | Example |
|---|---|---|
| **Make a Benchmark** | Move to a nearby friendly number (5, 10, 100) first. | `7 + 5 → 10 + 2` |
| **Break by Place Value** | Split a number into its place-value parts. | `790 → 700 + 90` |
| **Double / Half** | Use a known double or half to derive a nearby fact. | `6+7 = 6+6+1`; `48 → 24×2` |
| **Compensate** | Adjust one number up, the other down, by the same amount. | `49 + 27 → 50 + 26` |
| **Distribute** | Split one factor across a sum, multiply each part, recombine. | `48×25 → (50-2)×25` |
| **Factor / Group** | Rewrite a number as a product of friendlier factors. | `48×25 → 12×100` |
| **Scale** | Multiply/divide both quantities in a relationship by the same factor. | `24×50 → 12×100` |
| **Inverse Operations** | Undo an operation with its opposite to solve or check. | `395 × 2 = 790` checks `790 ÷ 2` |
| **Part / Whole** | A quantity is one whole made of named parts. | Number bonds, fraction of a whole |
| **Equivalence** | Two different-looking forms name the same value. | `1/2 = 3/6 = 0.5` |
| **Remainder → Fraction** | A leftover amount is a fraction of the group size, not "extra." | `2 R4 (÷8) = 2 + 4/8` |
| **Fraction → Decimal** | A fraction is a division; a decimal is that division's answer. | `3/4 = 3 ÷ 4 = 0.75` |
| **Ratio as Relationship** | Compare two quantities by their multiplicative relationship, not their difference. | `3 red : 2 blue` |
| **Unknown as Missing Quantity** | A variable stands for a specific, not-yet-known amount. | `x + 3 = 10` |
| **Balance / Equality** | Both sides of `=` must stay equal; whatever you do to one, do to the other. | Solving equations |
| **Estimate → Solve → Check** | Predict a reasonable range before computing, then verify against it. | Every CHECK stage, in principle |
| **Regroup / Rename** | Trade equal value between place-value units (10 ones ⇄ 1 ten). | Carrying/borrowing |
| **Unitize** | Treat a group of items as a single countable unit. | "1 ten" as one thing made of 10 ones |

New lessons should cite the pattern by this exact name in their metadata (§13) so
patterns can be tracked and reused across domains instead of being re-explained from
scratch every time they recur.

---

## 6. Representation library

Representations must **serve the reasoning**, never decorate it, and are never forced
into a lesson where they don't fit the mathematical idea. Concrete/physical
representations precede a design-system visual model wherever the concept is new to the
learner; the design-system component is the PICTURE/SYMBOL bridge, not a replacement for
first encountering the idea concretely.

| Mathematical idea | Object stage (if needed) | Picture stage (design-system component) |
|---|---|---|
| Quantity | counters, fingers, dots, groups | — (usually still concrete at this stage) |
| Part-whole | objects split into two piles | `NumberBond` |
| Place value | bundles of ten (straws, base-ten blocks) | `PlaceValueBreakdown` |
| Addition / subtraction | joining/removing objects | `NumberBond`, `NumberLine` |
| Multiplication | equal groups, arrays of objects | groups / arrays / area (diagram module, no dedicated MTD component yet — see §17 gap note) |
| Division | fair-share dealing out, grouping objects | sharing / grouping bar, then `PlaceValueBreakdown` for decomposition division |
| Fractions | folding/cutting a physical whole | `FractionBarModel`, `NumberLine` |
| Equivalence (general) | side-by-side physical comparison | `TransformationChain` |
| Equations / unknowns | a physical balance/scale | `EquationWorkspace`, balance reasoning (no dedicated balance component yet — see §17 gap note) |

`NumberJobs` (WHOLE/SPLIT/TAKE) is a **reasoning-language overlay**, not a representation
of a mathematical object — it can accompany any of the rows above where naming the job of
each number helps (see §17 of the Design System Handoff: it is not schema-wired).

---

## 7. Lesson types

| Type | Accomplishes |
|---|---|
| **Discovery** | Learner notices a new structure or pattern for the first time, from evidence, before being told a rule. |
| **Strategy** | Learner learns a reusable reasoning strategy (named from §5's pattern library) and practices applying it. |
| **Connection** | Explicitly links two representations or two previously-separate concepts (e.g., fraction ↔ decimal). |
| **Fluency** | Builds efficient retrieval **after** conceptual understanding is already established — never introduces a new idea. |
| **Error Analysis** | Learner is shown an incorrect reasoning path and must diagnose *why* it's wrong, using the misconception model (§11). |
| **Application** | Uses the mathematics inside a real context (e.g., `budget-receipt`); may draw on multiple domains at once. |
| **Review / Retrieval** | Interleaves previously-mastered skills, spaced out, to fight forgetting — not a re-teach. |
| **Mastery Check** | Determines whether the prerequisites for progressing are actually secure; gates advancement in the graph (§4). |

Every unit in §14 ends with a **Mastery Check** lesson; **Review/Retrieval** lessons are
not separately itemized per unit in the preliminary map (§14) — they are a production
scheduling layer applied across units (recommended ratio in §16), not a fixed slot.

---

## 8. Standard production lesson model

Canonical sequence: **SETUP → SEE → BREAK → BUILD → TRANSFORM → CHECK**.

> **SETUP is a presentation state, not a sixth reasoning stage.** The reasoning system
> remains exactly five stages (SEE, BREAK, BUILD, TRANSFORM, CHECK) everywhere in this
> curriculum and in the frozen design system. SETUP only presents the problem before
> reasoning begins.

For each state, the production lesson-authoring template should define:

| State | Teacher purpose | Student question | Visual purpose | Math content | What changes | What stays | Misconception to watch | Check for understanding |
|---|---|---|---|---|---|---|---|---|
| **SETUP** | Present the problem without pre-solving it | "What is this asking?" | Show the problem in its original form | The raw prompt/quantity | — (nothing solved yet) | The problem as given | Learner tries to guess the answer before reasoning | Can the learner restate the question in their own words? |
| **SEE** | Help the learner identify the structure present | "What do I notice?" | Name the whole/parts/roles | The given quantity, named | The learner's framing of the problem | The value itself | Learner sees numbers, not structure | Can the learner name WHOLE/SPLIT/TAKE or the equivalent structure? |
| **BREAK** | Model splitting into friendlier pieces | "How can I split this?" | Show the decomposition | A first transformation of the given value | The *form* of the quantity | The value | Learner thinks breaking apart changes the amount | Can the learner explain why the split is still the same amount? |
| **BUILD** | Operate on the friendly pieces | "What do the parts give me?" | Show the result of operating on each piece | The arithmetic the break enabled | New intermediate values appear | The overall value | Learner loses track of a piece (forgets to recombine it later) | Can the learner say what each new number represents? |
| **TRANSFORM** | Recombine into a simpler equivalent form | "What's the simplest way to say this?" | Chain the forms together, tagged "same value" | The final simplified expression | The written form | The value (explicitly restated) | Learner treats the transform as a new, unrelated fact | Can the learner state the equivalence out loud ("X and Y are the same amount")? |
| **CHECK** | Verify independently | "How do I know this is right?" | Show the check strategy (§12), separate from the solving path | An independent verification | Nothing — this stage exists to confirm, not compute further | The final value, confirmed | Learner treats "I did the steps" as sufficient proof | Did the learner's independent check actually agree? |

This table is the authoring template — filled in per-lesson at content-authoring time
(P2+), not a specification of new runtime behavior.

---

## 9. Multiple solution paths

Math Through Discovery explicitly supports more than one valid strategy for the same
problem (e.g., `48 × 25` via `48 × 100 ÷ 4`, `(50-2) × 25`, `24 × 50`, or `12 × 100` — all
are Same Value, Different Form). Rules for when to introduce, compare, delay, or reject an
additional strategy:

- **Introduce** a second strategy only after the *first* strategy is independently secure
  (a learner should never meet two new strategies for the same problem type in one
  lesson).
- **Compare** two strategies explicitly (a Connection lesson type, §7) once both are
  individually secure — the comparison itself is the lesson's teaching goal ("why would
  you pick one over the other?").
- **Delay** a strategy that depends on a skill not yet secured in the prerequisite graph
  (§4), even if it would be "faster" — e.g., don't show `48 × 100 ÷ 4` before division by
  friendly numbers is secure.
- **Reject** a strategy as unnecessarily complex for the *current* learner and problem
  when it introduces more cognitive load than the benefit it provides (e.g., factoring
  `48×25` into `12×100` is elegant but not worth introducing to a learner who has not yet
  secured basic factoring reasoning) — flexibility is a goal, not a mandate to show every
  possible path in every lesson.

Beginners should see **one clean, well-justified path** per new concept; flexibility
(multiple paths, explicit comparison) is deliberately introduced later, once the base
strategy is fluent — teaching flexibility too early overwhelms rather than empowers.

---

## 10. Mastery model

Mastery is **never** "got the answer right." A learner demonstrates mastery of a skill by
showing some appropriate combination of:

| Facet | Question it answers |
|---|---|
| **Recognize** | What structure is present in this problem? |
| **Represent** | Can I show it another way (object, picture, symbol)? |
| **Break** | Can I decompose it usefully? |
| **Build** | Can I recombine the pieces? |
| **Transform** | Can I produce an equivalent, easier form? |
| **Explain** | Can I say *why* the strategy works, not just that it does? |
| **Check** | Can I verify the result by an independent route? |
| **Transfer** | Can I apply the same pattern to a new, unseen problem? |

Not every facet applies with equal weight to every skill (a pure fluency skill leans on
Recognize/Build/Check; a discovery lesson leans on Recognize/Represent/Explain) — the
per-lesson `masteryCriteria` metadata field (§13) is where a specific lesson states which
facets it actually assesses. This eight-facet rubric is the **reusable** frame; it is not
itself a checklist every single lesson must fully exercise.

---

## 11. Misconception system

Every lesson should eventually record, for its known common errors:

| Field | Purpose |
|---|---|
| **Common error** | The wrong answer/approach actually observed |
| **Why it happens** | The specific reasoning failure, not "carelessness" |
| **What the student may be thinking** | A charitable, specific hypothesis about their mental model |
| **Visual diagnosis** | Which representation would expose the error to the *student* |
| **Teacher response** | What question/prompt surfaces the gap without just stating the correct answer |
| **Follow-up problem** | A problem chosen to specifically re-test the repaired understanding |

Worked example — **`3/8 of 20`, common error `7/32`**:

- **Common error:** `7/32`
- **Why it happens:** the learner treated "3/8 of 20" as a fraction operation on two
  fractions (`3/8` and some fraction representing 20) rather than as "3/8 **of** a
  quantity" — likely multiplying numerators (`3 × ... `) and denominators (`8 × ...`)
  the way they were taught to multiply two fractions, without ever forming a whole
  number from 20 first.
- **What the student may be thinking:** "fraction problems mean multiply across the top
  and across the bottom" — a procedural rule applied without checking whether it fits
  this problem's structure.
- **Visual diagnosis:** show `FractionBarModel` with the whole (20) explicitly drawn and
  split into 8 equal groups of 2.5 each — the learner should be able to see that `7/32`
  isn't even a quantity that relates to a bar of 20 objects.
  Also useful: `NumberJobs` — ask the learner to name what 20, 8, and 3 are each *doing*
  (WHOLE / SPLIT / TAKE). If they cannot, that confirms the diagnosis.
- **Teacher response:** "What is the *whole* in this problem? Is 20 written as a
  fraction anywhere in the question?" — surfaces that 20 is a whole quantity, not a
  fraction to be multiplied against.
- **Follow-up problem:** a structurally identical but numerically different problem
  (e.g., `2/5 of 30`) immediately after the repair, to test transfer rather than rote
  correction of this one instance.

The curriculum treats every mistake as **evidence about the learner's mental model**, to
be diagnosed — never simply marked "wrong."

---

## 12. Checking system — reusable CHECK strategy library

| Strategy | What it does | Example |
|---|---|---|
| **Inverse operation** | Undo the operation that produced the answer | `395 × 2 = 790` checks `790 ÷ 2 = 395` |
| **Estimation** | Compare the exact answer to a rough prediction | Estimate `48×25 ≈ 50×25=1250` before computing `1200` |
| **Bounds** | Show the answer must fall between two known values | `3/8 < 1/2` so `3/8 of 20 < 10` |
| **Benchmark comparison** | Compare to a known easy case | `3/8` is a bit less than `1/2` |
| **Alternate representation** | Re-derive the answer with a different model | Number line jump confirms a number-bond result |
| **Commutativity** | Swap operands and recompute | `5 + 7 = 12` confirms `7 + 5 = 12` |
| **Substitution** | Plug the solution back into the original expression | `x = 7` back into `x + 3 = 10` |
| **Number line** | Use position/distance to confirm a result | `7 → +3 → 10 → +2 → 12` |
| **Mental reasonableness** | Ask "does this even make sense as an answer?" | A "cost per item" answer of $400 for a $12 item is unreasonable |
| **Unit / context check** | Confirm the answer's unit and real-world plausibility | A person's height of 60 meters fails a unit check |

Worked example — **`3/8 of 20 = 7.5`:** since `3/8 < 1/2`, and `1/2 of 20 = 10`, the
answer must be **less than 10** — `7.5 < 10` ✓ (a **Bounds** check, reinforced by a
**Benchmark comparison**).

Each lesson's `checkStrategies` metadata (§13) should name one or more of these by their
canonical label above.

---

## 13. Production lesson metadata

### Currently implemented (verified against `src/utils/lesson-loader.js` and `lessons/*.json`)

The live schema — everything a lesson JSON file may contain today, as filled in by
`normalize()`:

```
id            derived from filename if absent
series        default "Math Through Discovery"
seriesLine    default "Reality Check Series"
episode       string, optional
subject       string
topic         string
subtitle      string, optional
title         string
headline      string, optional (markup-capable)
quote         string, optional
facts[]       [{ label, value, highlight? }]
question      string
answer        { work, value, unit? } | null
steps         { see, break, build, transform, check } each { text, equation? }
diagram       { type, ...type-specific fields } | null
comparison    { think, math } | null
takeaways[]   string[]
presenter     { name, role }
```

**This is the full current schema. Nothing above is changed by this milestone.** There is
no `domain`, `unit`, `skill`, `gradeBand`, `difficulty`, `prerequisites`, `lessonType`,
`reasoningPatterns`, `representations`, `misconceptions`, `checkStrategies`,
`vocabulary`, `examples`, `practice`, or `masteryCriteria` field today.

### Proposed future authoring metadata (NOT implemented — proposal only)

| Field | Purpose |
|---|---|
| `lessonId` | Stable identifier independent of filename (today `id` derives from the filename — fine at 16 lessons, brittle at 200+). |
| `title` | *(already exists — unchanged)* |
| `domain` | One of the Domain names in §14 (e.g. `"Fractions, Decimals & Percent"`). |
| `unit` | The unit within the domain (e.g. `"Fractions as Quantities"`). |
| `skill` | The specific skill statement (e.g. `"Find a fraction of a whole quantity"`). |
| `gradeBand` | One label from §15's crosswalk — navigation only, never a gate. |
| `difficulty` | A relative marker within the unit (e.g. `introductory` / `practice` / `stretch`). |
| `prerequisites[]` | `lessonId`s or `skill` statements that must be secure first — the machine-checkable edge of the §4 graph. |
| `lessonType` | One of §7's eight types. |
| `reasoningPatterns[]` | Canonical §5 pattern names used by this lesson. |
| `representations[]` | Which §6 representations this lesson uses, and in what order. |
| `misconceptions[]` | §11-shaped records for this lesson's known common errors. |
| `checkStrategies[]` | Canonical §12 strategy names this lesson's CHECK stage uses. |
| `vocabulary[]` | New terms this lesson introduces (for a future glossary/search feature). |
| `examples[]` | Additional worked examples beyond the lesson's primary one. |
| `practice[]` | Practice-only items (Fluency/Review lesson types) distinct from the taught example. |
| `masteryCriteria` | Which §10 facets (Recognize/Represent/Break/Build/Transform/Explain/Check/Transfer) this lesson actually assesses, and how. |
| `preset` | A *recommended default* preset (§ Design System Handoff §9) for this lesson's primary composition — a default, not a lock; any lesson can render under any preset. |
| `aspect` | A recommended default aspect (16:9/9:16/1:1). |
| `presenter` | Whether this lesson's default composition expects a presenter camera. |
| `steps` | **Note:** this name collides with the *existing* `steps.{see,break,build,transform,check}` content object. If adopted, this proposed field should be renamed (e.g. `defaultRevealSteps` or folded into `masteryCriteria`) to avoid ambiguity — flagged here rather than silently resolved, since resolving it is itself a schema decision for a future milestone. |

**No production schema change is made by this milestone.** Adopting any of the above is a
future, separately-scoped engineering task (most naturally the first work item of P2 or
a dedicated schema milestone), including its own test coverage in
`tools/ui-components.test.mjs` / `tools/smoke-test.mjs`.

---

## 14. Curriculum map

For each domain: **PURPOSE, PREREQUISITES, UNITS (preliminary lesson sequence),
CORE PATTERNS, REPRESENTATIONS, MASTERY GATE, UNLOCKS.**

Lesson sequences below are **preliminary lesson slots (titles only)** — not scripted
content. Numbers are a planning estimate, not a commitment.

### D0 — Pre-Number Foundations
**Purpose:** establish that a number names a quantity, and that a quantity can be
compared, composed, decomposed, and located — before any arithmetic operation is named.
**Prerequisites:** none (entry domain).
**Core patterns:** Part/Whole, Unitize.
**Representations:** objects, dots, fingers, informal groupings — no design-system
component required yet (see §6).
**Mastery gate:** reliable one-to-one counting to at least 10; can decompose a quantity
≤10 at least two different ways; treats zero as a real (empty) quantity.
**Unlocks:** Number Sense & Composition (D1).

- **Unit 0.1 — Quantity Before Symbols** (10 lessons): How Many? · Same Quantity,
  Different Arrangement · More / Less / Equal · Parts Inside a Whole · Break a Quantity
  Apart · Put Quantities Back Together · Zero Is a Quantity · Where Numbers Live ·
  Distance Between Numbers · Foundation Mastery Check
- **Unit 0.2 — Comparing & Locating Quantities** (8 lessons): Benchmark Quantities (5
  and 10 as Anchors) · Subitizing Small Groups · Counting On and Counting Back · One
  More, One Less · Ordering Quantities · Estimating "About How Many" · Quantities on a
  Line · Foundation Mastery Check II

### D1 — Number Sense & Composition
**Purpose:** formalize part/whole into Number Bonds, then the Make-5/Make-10 anchor
strategies that make flexible mental addition possible.
**Prerequisites:** D0 complete.
**Core patterns:** Part/Whole, Make a Benchmark.
**Representations:** objects → ten frames/bars → `NumberBond` → equation.
**Mastery gate:** can produce and explain multiple decompositions of a number ≤10
without treating them as unrelated facts; can bridge through 10 for addition/subtraction
to 20.
**Unlocks:** Place Value (D2), Addition & Subtraction Strategies (D3).

- **Unit 1.1 — Making and Breaking Numbers** (8 lessons): Ways to Make 6 · Break 7 Apart
  · Every Number Has Many Faces · Part, Part, Whole · Missing Part Puzzles · Fact
  Families Without Symbols · From Objects to a Number Bond · Number Bonds Mastery Check
- **Unit 1.2 — Make 5** (6 lessons): Anchors of 5 · Finger Combinations to 5 · What's
  Missing to Make 5? · Make 5 With Two Groups · Make 5, Then What? · Make 5 Mastery Check
- **Unit 1.3 — Make 10 & Flexible Addition to 20** (9 lessons): Anchors of 10 · Ten
  Frames and Missing Parts · Make 10 to Add (7 + 5) · Bridging Through Ten · Adding
  Across Ten · Subtracting by Making Ten · Flexible Facts to 20 · Choosing an Efficient
  Path · Make 10 Mastery Check

### D2 — Place Value & Base Ten
**Purpose:** extend part/whole thinking to how our number system itself is built —
groups of ten, unitized.
**Prerequisites:** D1 (Make 10) complete.
**Core patterns:** Break by Place Value, Unitize, Regroup/Rename.
**Representations:** bundles of ten → `PlaceValueBreakdown`.
**Mastery gate:** can decompose and recompose a multi-digit number by place value in
both directions; the zero-place case (e.g. "790 has zero ones") does not produce a fake
`+ 0` addend in expanded form.
**Unlocks:** Addition & Subtraction Strategies (multi-digit), Division by Decomposition
(D6), Decimals (D7).

- **Unit 2.1 — Tens and Ones** (8 lessons): Bundles of Ten · Tens and Ones Names · Same
  Number, Different Groupings · Comparing Two-Digit Numbers · Adding Tens · Adding a Ten
  and Some Ones · Regrouping Ones into a Ten · Place Value Mastery Check
- **Unit 2.2 — Extending Place Value** (8 lessons): Hundreds as Bundled Tens · Reading
  and Writing 3-Digit Numbers · Expanded Form · Comparing Larger Numbers · Rounding to a
  Benchmark · Place Value Into the Thousands · Regrouping Across Places · Extended Place
  Value Mastery Check
- **Unit 2.3 — Decimal Place Value Bridge** (6 lessons): Beyond the Ones Place · Tenths
  as a New Kind of Part · Hundredths · Comparing Decimals by Place · Decimals on a Number
  Line · Decimal Place Value Mastery Check *(full decimal treatment continues in D7)*

### D3 — Addition & Subtraction Strategies
**Purpose:** build a flexible toolkit for adding/subtracting any two numbers, not a
single memorized algorithm.
**Prerequisites:** D1 (Make 10), D2.1 (Tens and Ones).
**Core patterns:** Double/Half, Compensate, Break by Place Value, Regroup/Rename.
**Representations:** `NumberBond`, `NumberLine`, `PlaceValueBreakdown`.
**Mastery gate:** can choose an efficient strategy based on the specific numbers in a
problem (not one fixed procedure), and can execute the standard algorithm when it's the
right tool.
**Unlocks:** Equivalence's early informal treatment; Multiplicative Reasoning's
repeated-addition foundation.

- **Unit 3.1 — Doubles & Near-Doubles** (6 lessons): Doubles Facts · Near-Doubles (6+7
  as 6+6+1) · Doubling to Multiply Later · Halving as Undoing Doubling · Half of an Odd
  Number · Doubles/Halves Mastery Check
- **Unit 3.2 — Compensation** (7 lessons): Give and Take (49 + 27) · Moving to a
  Friendly Number · Compensating in Subtraction · Choosing What to Adjust · Compensation
  vs. Make-Ten · When Compensation Isn't Worth It · Compensation Mastery Check
- **Unit 3.3 — Multi-Digit Mental Strategies & Algorithms** (9 lessons): Adding by
  Place Value · Subtracting by Place Value · Mental Math with Landmark Numbers · From
  Mental Strategy to Written Method · The Standard Algorithm as a Shortcut for
  Regrouping · Subtraction With Regrouping · Choosing a Strategy for the Numbers in
  Front of You · Multi-Step Word Problems · Addition & Subtraction Mastery Check
  *(an Application-type lesson such as `budget-receipt` fits naturally at the end of
  this unit or D7's percent unit)*

### D4 — Equivalence: Same Value, Different Form
**Purpose:** name and formalize, directly and explicitly, the idea that has been
implicit since D0 — that a quantity's *form* can change while its *value* does not.
**Prerequisites:** D1–D3 (learner has already experienced several equivalences without
naming the general principle).
**Core patterns:** Equivalence (itself); every pattern in §5 is, at root, an instance of it.
**Representations:** `TransformationChain`.
**Mastery gate:** can identify, name, and defend an equivalence between two different-
looking forms of the same value, and can distinguish it from an actual change in value.
**Unlocks:** everything downstream that involves a conversion or transformation —
explicitly revisited (not "completed and left behind") in the capstone unit of D7
(fraction↔decimal↔percent), D8 (equivalent ratios), and D9 (equation transformations).

- **Unit 4.1 — Same Value, Different Form** (6 lessons): Renaming a Quantity · The Value
  Never Changes · Reading a Transformation Chain · Spotting a Hidden Equivalence ·
  Proving Two Forms Are Equal · Equivalence Mastery Check I
- **Unit 4.2 — Equivalence Toolkit** (6 lessons): Choosing a Friendlier Form · Working
  Backward From a Form · Multiple Equivalent Paths · When a Transformation Changes the
  Value (the error case) · Equivalence Across Representations · Equivalence Mastery
  Check II

### D5 — Multiplicative Reasoning
**Purpose:** build multiplication from equal groups and arrays, as structure, not a
facts table to memorize cold.
**Prerequisites:** D3 (repeated addition fluency), D4 (equivalence, for the commutative/
distributive reasoning below).
**Core patterns:** Distribute, Factor/Group, Double/Half (for derived facts), Scale.
**Representations:** equal groups / arrays (see §17 gap note — no dedicated MTD
component yet; currently expressed via the general diagram module).
**Mastery gate:** can derive an unknown multiplication fact from known ones (distributive/
doubling reasoning), not only recall memorized facts.
**Unlocks:** Division (D6), Ratios (D8), Area (D10).

- **Unit 5.1 — Equal Groups & Arrays** (8 lessons): Groups of the Same Size · Arrays:
  Rows and Columns · Skip Counting as Repeated Addition · From Repeated Addition to
  Multiplication · The Commutative Property, Concretely · Multiplying by 0 and 1 ·
  Multiplying by 10 · Equal Groups Mastery Check
- **Unit 5.2 — Multiplication Facts as Structure** (8 lessons): Doubling to Find ×2 and
  ×4 · Building ×5 From ×10 · ×3 as ×2 Plus One More Group · The Distributive Property,
  Concretely · Breaking Apart a Hard Fact · Square Numbers as Arrays · Fact Families
  for Multiplication · Multiplication Facts Mastery Check
- **Unit 5.3 — Scaling & Multiplicative Comparison** (6 lessons): "Times as Many" vs.
  "More Than" · Scaling Up and Down · Comparing With Multiplication · Estimating
  Products · Multiplicative Reasoning in Context · Multiplicative Reasoning Mastery
  Check

### D6 — Division, Sharing & Remainders
**Purpose:** build division as the inverse of multiplication and as fair sharing, then
treat a remainder as a real quantity rather than a discarded leftover.
**Prerequisites:** D5 (multiplication structure), D2 (place value, for decomposition
division).
**Core patterns:** Inverse Operations, Break by Place Value, Remainder → Fraction.
**Representations:** sharing/grouping (concrete) → `PlaceValueBreakdown` (for
decomposition division) → `FractionBarModel` (remainder as fraction, bridges to D7).
**Mastery gate:** can divide by decomposing into friendly parts, and can correctly
re-express a remainder as a fraction of the divisor (never treats it as "extra").
**Unlocks:** Fractions (D7) directly via remainder-as-fraction; Ratios (D8) via the
fair-share model.

- **Unit 6.1 — Fair Shares & Grouping** (7 lessons): Sharing Equally · How Many Groups?
  vs. How Many in Each Group? · Sharing With Leftovers · Division as the Inverse of
  Multiplication · Fact Families for Division · Estimating a Quotient · Fair Shares
  Mastery Check
- **Unit 6.2 — Division by Decomposition** (8 lessons): Splitting the Whole Into
  Friendly Parts · Dividing Each Part (790 ÷ 2) · Recombining the Parts · Choosing a
  Useful Split · Dividing by Place Value · Checking a Division by Multiplying Back ·
  Division With Larger Numbers · Division by Decomposition Mastery Check
- **Unit 6.3 — Remainders as Quantities** (6 lessons): What a Remainder Really Means ·
  Remainder in Context (People, Objects, Money) · Rounding the Quotient Up or Down · A
  Remainder as a Fraction of the Divisor · From Remainder to Decimal · Remainders
  Mastery Check

### D7 — Fractions, Decimals & Percent
**Purpose:** treat a fraction as a quantity in its own right, then connect it to
decimals and percent as the same value in different forms.
**Prerequisites:** D6 (remainder-as-fraction), D4 (equivalence), D2.3 (decimal place
value bridge).
**Core patterns:** Part/Whole, Equivalence, Fraction → Decimal.
**Representations:** `FractionBarModel`, `NumberLine`, `TransformationChain` (for the
fraction↔decimal↔percent capstone).
**Mastery gate:** can find a fraction of a quantity (e.g. `3/8 of 20`), can convert
fluently among fraction/decimal/percent for common benchmark values, and can check a
fraction-of-a-quantity result against a `1/2` benchmark bound.
**Unlocks:** Ratios & Proportions (D8).

- **Unit 7.1 — Fractions as Quantities** (9 lessons): A Fraction Is an Amount, Not Two
  Numbers · Equal Parts of a Whole · Naming a Fraction From a Picture · Fractions
  Greater Than One · Fractions of a Set · Fraction of a Quantity (3/8 of 20) ·
  Comparing Fractions to a Benchmark (1/2) · Fractions on a Number Line · Fractions as
  Quantities Mastery Check
- **Unit 7.2 — Equivalent Fractions & Operations** (8 lessons): Same Amount, Different
  Slices · Building Equivalent Fractions · Simplifying a Fraction · Comparing Fractions
  With Different Denominators · Adding Fractions With Like Denominators · Adding
  Fractions With Unlike Denominators · Subtracting Fractions · Fraction Operations
  Mastery Check
- **Unit 7.3 — Decimals as Fractions** (7 lessons): Tenths and Hundredths as Fractions ·
  Reading a Decimal as an Amount · Comparing Decimals and Fractions · Adding and
  Subtracting Decimals · Decimals on a Number Line (Revisited) · Rounding Decimals ·
  Decimals as Fractions Mastery Check
- **Unit 7.4 — Percent & Fraction-Decimal-Percent Equivalence** (7 lessons — the domain
  capstone): Percent as "Out of 100" · Common Percent Benchmarks (10%, 25%, 50%) ·
  Converting Fraction to Percent · Converting Decimal to Percent · Choosing the Easiest
  Form for a Problem · Percent of a Quantity · Fraction-Decimal-Percent Mastery Check

### D8 — Ratios, Proportions & Scaling
**Purpose:** compare two quantities multiplicatively and reason proportionally.
**Prerequisites:** D5 (scaling), D7 (fraction/percent as ratio-adjacent forms).
**Core patterns:** Ratio as Relationship, Scale, Equivalence.
**Representations:** ratio tables (no dedicated MTD component — a table/grid built from
the general layout primitives), `TransformationChain` for equivalent ratios.
**Mastery gate:** can distinguish a ratio comparison from an additive comparison, and
can scale a ratio table correctly in both directions.
**Unlocks:** Expressions & Early Algebra (D9) via variable-as-scaling-factor reasoning.

- **Unit 8.1 — Ratio as Relationship** (6 lessons): Comparing Two Quantities · Ratio
  Language (For Every, Per) · Ratio vs. Fraction · Equivalent Ratios · Ratio Tables ·
  Ratio Mastery Check
- **Unit 8.2 — Proportional Reasoning & Scaling** (7 lessons): Scaling a Recipe or Rate
  · Unit Rate · Solving With a Ratio Table · Proportional vs. Non-Proportional
  Situations · Percent as a Ratio · Scale Drawings · Proportional Reasoning Mastery
  Check

### D9 — Expressions, Unknowns & Early Algebra
**Purpose:** name calculations symbolically, solve for unknowns via a balance model, and
generalize arithmetic strategies into algebraic structure.
**Prerequisites:** D4 (equivalence — "both sides stay equal" is an equivalence rule),
D1–D3 (the arithmetic being generalized).
**Core patterns:** Balance/Equality, Unknown as Missing Quantity, Distribute (revisited
symbolically).
**Representations:** `EquationWorkspace`, balance reasoning (no dedicated MTD balance
component yet — see §17 gap note; production code has a legacy `BalanceModel` diagram).
**Mastery gate:** can write and solve a one- or two-step equation, check the solution by
substitution, and explain a numeric pattern as a general rule.
**Unlocks:** Geometry formulas (D10) as an application of expressions.

- **Unit 9.1 — Expressions & Structure** (6 lessons): Describing a Calculation Without
  Solving It · Order of Operations, Concretely · Equivalent Expressions · Using a
  Variable to Represent a Quantity · Evaluating an Expression · Expressions Mastery
  Check
- **Unit 9.2 — Unknowns & Equations** (8 lessons): The Unknown as a Missing Quantity ·
  Balance as a Model for Equality · Keeping Both Sides Equal · Solving a One-Step
  Equation · Solving a Two-Step Equation · Writing an Equation From a Problem ·
  Checking a Solution · Equations Mastery Check
- **Unit 9.3 — Generalization & Early Algebra** (6 lessons): Noticing a Pattern Across
  Examples · Writing a Rule for a Pattern · Functions as Input/Output · Graphing a
  Simple Relationship · Algebraic Structure Behind Arithmetic Strategies · Early
  Algebra Mastery Check
- **Unit 9.4 — Repeated Multiplication & Exponents** (6 lessons — houses the existing
  `exponents` production lesson): Repeated Multiplication as a Shorthand · Reading and
  Writing Exponents · Powers of 10 · Exponents and Place Value · Common Exponent Errors
  (e.g. `2³ ≠ 2×3`) · Exponents Mastery Check

### D10 — Geometry & Measurement *(parallel-eligible)*
**Purpose:** extend number sense and multiplicative reasoning into space and measure.
**Prerequisites:** D5 (area as multiplication), D7 (fractional/decimal measurement
precision) — does not require D8–D9.
**Core patterns:** Unitize, Factor/Group (area as rows × columns).
**Representations:** grid/array diagrams; no dedicated MTD component.
**Mastery gate:** can compute area/perimeter of rectangles and composite shapes and
justify area as repeated multiplication, not a memorized formula alone.
**Unlocks:** nothing gates on this domain; it enriches D9 (area as an applied expression).

- **Unit 10.1 — Measurement & Units** (6 lessons): Choosing an Appropriate Unit ·
  Converting Between Units · Perimeter as Distance Around · Measuring With Precision ·
  Estimating a Measurement · Measurement Mastery Check
- **Unit 10.2 — Shape, Space & Area/Perimeter Structure** (7 lessons): Attributes of 2D
  Shapes · Area as Covering With Units · Area of a Rectangle as Multiplication · Area of
  Composite Shapes · Attributes of 3D Shapes · Volume as an Extension of Area · Geometry
  Mastery Check

### D11 — Data & Probability *(parallel-eligible)*
**Purpose:** represent and reason about collections of quantities, then quantify
likelihood as a fraction.
**Prerequisites:** basic Number Sense (D0–D1) for representing data; D7 (fractions) for
probability as a fraction.
**Core patterns:** Part/Whole (probability as a part of all outcomes), Estimate → Solve
→ Check.
**Representations:** bar/picture graphs; `FractionBarModel` for probability-as-fraction.
**Mastery gate:** can read and construct a simple graph, and express a simple
probability as a fraction with justification.
**Unlocks:** nothing gates on this domain.

- **Unit 11.1 — Representing Data** (5 lessons): Collecting and Sorting Data · Bar
  Graphs and Picture Graphs · Reading a Line Plot · Measures of Center (Mean/Median,
  Concretely) · Data Mastery Check
- **Unit 11.2 — Probability as Quantified Likelihood** (5 lessons): Likely, Unlikely,
  Certain, Impossible · Probability as a Fraction · Simple Experiments and Outcomes ·
  Comparing Probabilities · Probability Mastery Check

### D12 — Integers & the Extended Number Line
**Purpose:** extend the number line below zero, houses the existing `integers`
production lesson.
**Prerequisites:** D0 (number location, distance between numbers), D2 (place value).
**Core patterns:** Distance (as absolute value), Part/Whole (gains/losses as signed
parts).
**Representations:** `NumberLine` extended below zero.
**Mastery gate:** can compare, add, and subtract signed numbers using the extended
number line and explain the result in context (temperature, elevation, balance).
**Unlocks:** algebraic work with negative coefficients/solutions (extends D9).

- **Unit 12.1 — Negative Quantities** (5 lessons): Below Zero — What Negative Means ·
  Comparing Positive and Negative Numbers · Distance From Zero (Absolute Value,
  Concretely) · Adding and Subtracting on the Extended Line · Integers Mastery Check I
- **Unit 12.2 — Operating With Integers** (5 lessons): Combining Gains and Losses ·
  Multiplying Signed Quantities as Repeated Scaling · Real-World Integer Contexts
  (Temperature, Elevation, Budget) · Integer Word Problems · Integers Mastery Check II

---

## 15. Grade / skill crosswalk (navigation only)

This crosswalk is **navigation information for parents/teachers**, never a gate. A
learner's actual position is determined by the prerequisite graph (§4) and mastery
model (§10), not by this table.

| Band | Approximate domains |
|---|---|
| **Foundational** | D0, D1 |
| **Early Elementary** | D2, D3, D4 (introductory) |
| **Upper Elementary** | D5, D6, D7, D4 (revisited), D10/D11 (introductory, parallel) |
| **Middle School** | D8, D12, D10/D11 (extended) |
| **Pre-Algebra** | D9 |

A teenager or adult "rebuilding fundamentals" may need D0–D2 regardless of age; a
younger learner with strong number sense may reach D5–D6 ahead of the "typical" band.
**Grade labels never override a demonstrated prerequisite gap or a demonstrated
readiness.**

---

## 16. First production release recommendation

Do **not** attempt to author hundreds of lessons at once. Based on the completed
dependency analysis, the first release must cover the true foundation through the first
fully-flexible arithmetic milestone — anything less leaves later content standing on an
unverified base; anything more delays shipping.

### FOUNDATION RELEASE 1

| Included | Domains/Units |
|---|---|
| Quantity | D0 (Units 0.1, 0.2) |
| Part/Whole & Number Bonds | D1 (Units 1.1, 1.2) |
| Make 10 | D1 (Unit 1.3) |
| Place Value (introductory) | D2 (Unit 2.1 only — Tens and Ones) |
| Flexible Addition/Subtraction | D3 (Units 3.1, 3.2 — Doubles/Halves, Compensation) |

**Estimated scope:**

- **Units:** 8 (0.1, 0.2, 1.1, 1.2, 1.3, 2.1, 3.1, 3.2)
- **Lessons:** ≈ 62 (18 + 23 + 8 + 13)
- **Mastery checks:** 8 (one per included unit, already counted in the lesson totals above)
- **Recommended interleaved review lessons:** ≈ 12–15 (roughly one review/retrieval
  lesson per 4–5 new lessons — a scheduling layer added on top of the 62 core lessons,
  not a fixed slot per unit)

This scope deliberately **stops before D2.2/D2.3, D3.3, and D4** — extended place value,
written algorithms, and the formal Equivalence domain are reserved for a Foundation
Release 2, once Release 1's content is authored, tested, and reviewed against real
learners.

---

## 17. Proposed machine-readable curriculum structure (proposal only — not implemented)

A future, explicitly-scoped structure such as:

```
content/
  curriculum/
    domains/        one file per domain (§14 fields, machine-readable)
    units/          one file per unit (ordered lesson-slot list)
    lessons/        one file per lesson (existing schema + §13 proposed fields)
    mastery/        mastery-check definitions, keyed to §10 facets
    misconceptions/ §11-shaped records, keyed by skill/lesson
    patterns/        §5 pattern definitions, referenced by name from lessons
```

This would eventually enable:

- a **lesson browser** (navigate by domain/unit, or by prerequisite graph)
- **automatic prerequisite tracking** (validate a lesson's `prerequisites[]` resolve to
  real, already-defined lessons/skills before it can be marked ready)
- **mastery progression** (a learner's recorded mastery facets drive what's recommended next)
- **OBS lesson loading** driven by `domain`/`unit`/`skill` rather than a flat lesson id list
- **worksheet generation** (deriving practice items from a lesson's `practice[]` and
  `reasoningPatterns[]`)
- **short-form / long-form lesson generation** (deriving a 9:16 short from the same
  lesson data that drives a 16:9 long-form recording, exactly as the current
  aspect-agnostic lesson schema already allows)
- **practice generation** (new problems in the same pattern, for Fluency/Review lesson
  types)

**The repository is not restructured during P1.** This is a proposal to be scoped as its
own milestone (most naturally alongside the schema decision in §13) — implementing it
now would be exactly the kind of premature, un-reviewed schema change this milestone is
told not to make.

---

## 18. Verification performed for this milestone

1. **Mathematical progression** — every domain's prerequisite list (§14) was checked
   against the dependency graph (§4); no domain requires a skill from a later domain.
2. **Prerequisite coherence** — the graph in §4 was built bottom-up from §2's true
   foundation and cross-checked against every domain's stated prerequisites in §14;
   no cycles.
3. **No lesson assumes an unintroduced concept** — Number Bonds is gated behind the new
   Domain 0 (not assumed from grade level); Division is gated behind Multiplication;
   Fractions is gated behind Remainders-as-Quantities; Equations are gated behind
   Equivalence; existing production lessons outside the original 23-item spine
   (`integers`, `exponents`, `budget-receipt`) were placed rather than ignored (§3, D9.4,
   D12).
4. **Equivalence as a curriculum-wide thread** — formalized as Domain 4, explicitly
   re-invoked in D7's capstone (fraction/decimal/percent), D8 (equivalent ratios), and
   D9 (equation transformations) — never presented as a topic that "finishes."
5. **Visual representations serve reasoning** — §6 maps every representation to the
   mathematical idea it supports and explicitly documents where no representation (or
   only a concrete/physical one) should be used; §17's gap note records where the
   current design system has no dedicated component (equal-groups/array model, ratio
   table, balance model) rather than forcing an existing component to stand in.
6. **Design-system baseline not modified** — `docs/DESIGN_SYSTEM_HANDOFF.md` was not
   edited; no Penpot page was opened or changed; no component was invented (§6 explicitly
   defers new-component gaps to a future, separate design milestone rather than
   fabricating one here).
7. **Production code not modified** — no file under `src/`, `server/`, or the schema in
   `lessons/*.json` / `src/utils/lesson-loader.js` was changed.
8. **Change scope** — only `docs/CURRICULUM_ARCHITECTURE.md` was added.

`npm test` was re-run after this document was written; result recorded in the Milestone
P1 report.
