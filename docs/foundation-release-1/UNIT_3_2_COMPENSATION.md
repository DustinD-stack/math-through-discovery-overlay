# Unit 3.2 — Compensation

- **Unit:** 3.2
- **Domain:** D3 — Addition & Subtraction Strategies
- **Purpose:** develop compensation — adjusting one number up (or down) while adjusting
  the total in the opposite direction to keep the result correct — as a *justified*
  strategy (why it works), not a rule to apply blindly. Closes Foundation Release 1.
- **Prerequisites:** Unit 1.3 (Make 10 — compensation is often compared against it),
  Unit 2.1 (place value, for the "friendly number" targets like 50/100).
- **Unlocks:** D3.3 (Multi-Digit Mental Strategies, Foundation Release 2); D4
  (Equivalence, formal domain) — this unit is compensation's most concentrated informal
  rehearsal of "same value, different form" before that domain names it directly.
- **Primary patterns:** Compensate, Equivalence.
- **Primary representations:** `NumberLine`, `TransformationChain`, `EquationWorkspace`.
- **Lesson count:** 8 instructional lessons (+ 1 unit mastery check).

---

### 3.2.1 — Give and Take: A Simple Adjustment
- **Type / Difficulty:** Discovery · Entry
- **Teaching goal:** moving an amount from one number to another, and back, in a sum
  keeps the total the same — introduced with small, easy numbers before any "big number"
  examples.
- **Student question:** "If I give some from one pile to the other, does the total
  change?"
- **Prerequisites:** 0.1.3 (conservation), 1.3 (bridging, for contrast).
- **New idea:** compensation's core mechanism (give from one addend, take to the other),
  shown at the smallest possible scale.
- **Reuses:** conservation of quantity (0.1.3), composing (0.2.3).
- **Reasoning pattern(s):** Compensate.
- **Representation:** Object → `NumberLine`.
- **Vocabulary:** give, take, adjust.
- **SETUP:** two small piles, 8 and 5, already known to total 13 (via counting).
- **SEE:** "What if I move 2 counters from the 5-pile to the 8-pile?"
- **BREAK:** move 2 counters across; recount both new piles (10 and 3).
- **BUILD:** total the new piles: 10 + 3 = 13.
- **TRANSFORM:** `8 + 5` and `10 + 3` — same total (13), different-looking addends.
- **CHECK:** the original piles (8 and 5) are recreated and recounted to confirm they
  also total 13.
- **Primary example:** `8 + 5 → 10 + 3` (both = 13).
- **Second example:** `7 + 6 → 10 + 3` (both = 13).
- **Transfer example:** `9 + 4 → 10 + 3` (both = 13) — the learner chooses how much to
  move.
- **Misconception:** moves counters across but only recounts *one* pile afterward,
  assuming the total is preserved without checking. *Why:* trusts the "give and take"
  idea before it's actually verified — the CHECK step in this lesson exists specifically
  to build that verification habit from the very first example.
- **Teacher response:** "Let's count both new piles and add them — does it still make
  13?"
- **Check strategy:** recount (both new piles, added).
- **Mastery evidence:** correctly predicts the total is unchanged after a give-and-take
  move, and verifies it, for 2 examples.
- **Unlocks:** 3.2.2.
- **Visual:** physical objects, `NumberLine`.
- **Format:** Both. **Presenter:** Recommended.

### 3.2.2 — Moving to a Friendly Number: 49 + 27
- **Type / Difficulty:** Strategy · Developing
- **Teaching goal:** deliberately choose *how much* to move so that one addend becomes a
  clean benchmark (like 50), making the addition easier.
- **Student question:** "How much would we need to move to make 49 into a nice, round
  number?"
- **Prerequisites:** 3.2.1, Unit 2.1 (place value — recognizing 50 as a landmark).
- **New idea:** purposeful compensation — choosing the adjustment size to reach a
  specific friendly target, not moving an arbitrary amount.
- **Reuses:** 3.2.1's mechanism, complements to a benchmark (1.2.3's method, applied to
  50 instead of 10).
- **Reasoning pattern(s):** Compensate, Make a Benchmark.
- **Representation:** `NumberLine` → `EquationWorkspace`.
- **Vocabulary:** friendly number, round number.
- **SETUP:** `49 + 27`, unsolved.
- **SEE:** "49 is so close to 50 — what if it were exactly 50?"
- **BREAK:** move 1 from 27 to 49: `49 + 1 = 50`, leaving `27 - 1 = 26`.
- **BUILD:** `50 + 26 = 76`.
- **TRANSFORM:** `49 + 27` and `50 + 26` — same total (76), a friendlier form.
- **CHECK:** add the original numbers directly (or via a second method) to confirm 76.
- **Primary example:** `49 + 27 = 76`.
- **Second example:** `59 + 34 = 93`.
- **Transfer example:** `69 + 18`.
- **Misconception:** moves 1 *to* 49 correctly, but also adds 1 to 27 (giving `50 + 28`)
  instead of subtracting it — moving the amount without taking it *from* the other
  number. *Why:* this is the central compensation error — treating "give" as only an
  addition step, not a paired give-and-take — flagged as "changing a number without
  compensating" in `MISCONCEPTION_MAP.md`.
- **Teacher response:** "If you gave 1 to this number, where did that 1 come from? What
  should happen to the other number?"
- **Check strategy:** alternate representation / direct addition check.
- **Mastery evidence:** correctly compensates `49 + 27` and one further example without
  the give/take pairing error.
- **Unlocks:** 3.2.3.
- **Visual:** `NumberLine`, `EquationWorkspace`.
- **Format:** Both. **Presenter:** Recommended (this is the release's flagship
  compensation example).

### 3.2.3 — Give, Then Take Back: 38 + 19
- **Type / Difficulty:** Strategy · Developing/Secure
- **Teaching goal:** when a number is just *below* a friendly one (like 19, just below
  20), it can be easier to round it up and then subtract the extra back off — a variant
  compensation structure, not the same move as 3.2.2's "give then subtract from the
  other addend."
- **Student question:** "What if we made 19 into 20 first — what would we need to do
  afterward to fix it?"
- **Prerequisites:** 3.2.2.
- **New idea:** the "round up, then subtract back" compensation structure — distinct
  from 3.2.2's "move between the two addends," and deliberately contrasted with it.
- **Reuses:** 3.2.2's core idea, complements to a benchmark.
- **Reasoning pattern(s):** Compensate, Make a Benchmark.
- **Representation:** `NumberLine` → `EquationWorkspace`.
- **Vocabulary:** round up, take back.
- **SETUP:** `38 + 19`, unsolved.
- **SEE:** "19 is 1 away from 20. What if we just used 20 instead?"
- **BREAK:** `38 + 20 = 58` (deliberately using 1 more than the real second addend).
- **BUILD:** since 1 extra was added, 1 must now be subtracted back off the *total*, not
  from either original addend: `58 - 1 = 57`.
- **TRANSFORM:** `38 + 19` and `38 + 20 - 1` — same total (57), a friendlier
  intermediate form.
- **CHECK:** add the original numbers directly to confirm 57.
- **Primary example:** `38 + 19 = 57`.
- **Second example:** `47 + 29 = 76`.
- **Transfer example:** `56 + 39`.
- **Misconception:** confuses this structure with 3.2.2's and tries to subtract 1 from
  38 as well as from the total (double-compensating). *Why:* the two compensation
  structures (move-between-addends vs. round-up-then-correct-the-total) look similar but
  require different bookkeeping — this lesson exists specifically to keep them distinct
  through explicit contrast with 3.2.2.
- **Teacher response:** "This time, did we move an amount between the two numbers, or
  did we add too much to the total and need to take it back off the total?"
- **Check strategy:** alternate representation / direct addition check.
- **Mastery evidence:** correctly applies the round-up-then-correct-total structure for
  2 examples without confusing it with 3.2.2's structure.
- **Unlocks:** 3.2.4.
- **Visual:** `NumberLine`, `EquationWorkspace`.
- **Format:** Both. **Presenter:** Optional.

### 3.2.4 — Almost a Hundred: 99 + 36
- **Type / Difficulty:** Strategy · Secure
- **Teaching goal:** apply the round-up-then-correct-total structure (3.2.3) to a
  bigger, more dramatic benchmark jump (99 → 100), showing the strategy scales.
- **Student question:** "99 is almost 100 — how does that help us here?"
- **Prerequisites:** 3.2.3.
- **New idea:** none new procedurally — confirms 3.2.3's structure generalizes to a
  bigger benchmark and bigger numbers.
- **Reuses:** 3.2.3's method directly.
- **Reasoning pattern(s):** Compensate, Make a Benchmark.
- **Representation:** `NumberLine` → `EquationWorkspace`.
- **Vocabulary:** (reinforce round up, take back).
- **SETUP:** `99 + 36`, unsolved.
- **SEE:** "99 is only 1 away from 100."
- **BREAK:** `99 + 1 = 100` — treat the problem as if it were `100 + 36`, remembering 1
  extra was added.
- **BUILD:** `100 + 36 = 136`.
- **TRANSFORM:** `99 + 36` and `100 + 36 - 1` — same total (135), reached via the
  friendlier hundred.
- **CHECK:** `135 + 1 = 136`? — the lesson deliberately requires the learner to catch
  that the final subtraction step (`136 - 1 = 135`) must still happen; this is
  restated correctly in the worked model to avoid an authored error: `100 + 36 = 136`,
  then `136 - 1 = 135`, matching `99 + 36 = 135`.
- **Primary example:** `99 + 36 = 135`.
- **Second example:** `98 + 47 = 145`.
- **Transfer example:** `199 + 58` (extends the same idea one place-value step further,
  informally, without requiring full three-digit instruction).
- **Misconception:** forgets the final "take back" subtraction after reaching the
  hundred, reporting 136 instead of 135 for `99 + 36`. *Why:* the earlier steps (rounding
  up) are satisfying and benchmark-flavored; the final correction step is easy to treat
  as optional cleanup rather than a required part of the strategy.
- **Teacher response:** "You added 1 extra to get to 100 — have you taken that 1 back off
  yet?"
- **Check strategy:** direct addition check (a second method, e.g. place-value addition,
  confirms 135).
- **Mastery evidence:** correctly executes the full round-up-and-correct structure,
  including the final subtraction, for 2 examples.
- **Unlocks:** 3.2.5.
- **Visual:** `NumberLine`, `EquationWorkspace`.
- **Format:** Both. **Presenter:** Optional.

### 3.2.5 — Compensation in Subtraction
- **Type / Difficulty:** Strategy · Secure
- **Teaching goal:** compensation applies to subtraction too, but both numbers must
  adjust in the *same* direction to preserve the difference (unlike addition, where
  addends adjust in opposite directions).
- **Student question:** "In subtraction, if I add 1 to this number, what do I need to do
  to the other one?"
- **Prerequisites:** 3.2.2–3.2.4 (addition compensation secure).
- **New idea:** the subtraction compensation rule — adjust both numbers the *same* way
  (both up, or both down) to keep the *distance* between them (the difference) fixed —
  contrasted explicitly with addition's opposite-direction rule.
- **Reuses:** distance between numbers (0.2.7), addition compensation (3.2.2–3.2.4).
- **Reasoning pattern(s):** Compensate.
- **Representation:** `NumberLine` (distance/gap framing is essential here).
- **Vocabulary:** (reinforce adjust), same direction.
- **SETUP:** `52 - 19`, unsolved.
- **SEE:** "19 is close to 20 — what if both numbers moved up together?"
- **BREAK:** add 1 to *both*: `52 + 1 = 53`; `19 + 1 = 20`.
- **BUILD:** `53 - 20 = 33`.
- **TRANSFORM:** `52 - 19` and `53 - 20` — same difference (33), because the *gap*
  between the two numbers didn't change when both moved the same amount, the same
  direction.
- **CHECK:** `33 + 19 = 52` (inverse operation).
- **Primary example:** `52 - 19 = 33`.
- **Second example:** `71 - 28 = 43`.
- **Transfer example:** `84 - 39`.
- **Misconception:** applies addition's opposite-direction rule here too (adds 1 to 52
  but subtracts 1 from 19), which changes the difference. *Why:* over-generalizing
  3.2.2's rule to a structurally different situation — this is exactly why the lesson
  opens with an explicit contrast question rather than presenting the rule directly.
- **Teacher response:** "In addition we moved the amount between the two numbers — does
  subtraction work the same way, or does the *gap* need to stay the same instead?"
- **Check strategy:** inverse operation.
- **Mastery evidence:** correctly compensates a subtraction problem using the
  same-direction rule, distinct from the addition rule, for 2 examples.
- **Unlocks:** 3.2.6.
- **Visual:** `NumberLine`.
- **Format:** Both. **Presenter:** Recommended (the gap/distance framing benefits from a
  visible number line walkthrough).

### 3.2.6 — Compensation vs. Make Ten: Which Fits Better?
- **Type / Difficulty:** Connection · Secure/Transfer
- **Teaching goal:** compare compensation and Make 10 directly, and choose whichever
  strategy fits a given problem more naturally — extends Unit 1.3.5's strategy-selection
  skill to a second strategy family.
- **Student question:** "Would Make 10 or compensation be the better tool here?"
- **Prerequisites:** Unit 1.3 (Make 10), 3.2.2–3.2.5 (compensation).
- **New idea:** choosing *between two different named strategies*, not just deciding
  whether to apply one strategy (1.3.5's scope).
- **Reuses:** the Make 10 bridge (1.3) and compensation (3.2) in full.
- **Reasoning pattern(s):** Make a Benchmark, Compensate.
- **Representation:** `EquationWorkspace` (side-by-side comparison of both approaches on
  the same problem).
- **Vocabulary:** (reinforce efficient, fits).
- **SETUP:** two problems: `7 + 5` (small, single-digit — Make 10 territory) and
  `49 + 27` (two-digit, near a landmark — compensation territory).
- **SEE:** "Which of these feels more like our Make 10 work, and which feels more like
  our compensation work?"
- **BREAK:** solve `7 + 5` with Make 10, and `49 + 27` with compensation.
- **BUILD:** solve each with the *other* strategy too (Make 10 can technically be
  applied to `49+27` via place value; compensation can technically be applied to `7+5`)
  to see both work, but one is clearly more efficient for each.
- **TRANSFORM:** the same two totals, reached via either strategy — confirms neither
  strategy is "more correct," only more or less efficient for a given problem.
- **CHECK:** both strategies' results agree with each other on each problem.
- **Primary example:** `7 + 5` (Make 10 fits better) vs. `49 + 27` (compensation fits
  better).
- **Second example:** `8 + 6` vs. `98 + 45`.
- **Transfer example:** a new pair the learner sorts and solves themselves.
- **Misconception:** treats the two strategies as interchangeable and picks one at
  random rather than reasoning about which numbers make which strategy easier. *Why:*
  hasn't yet developed the judgment that strategy selection depends on the *specific*
  numbers in a problem, not personal preference — the explicit point of
  `CURRICULUM_ARCHITECTURE.md` §9.
- **Teacher response:** "Which numbers here are close to 5 or 10? Which are close to a
  landmark like 50 or 100? Does that tell you anything?"
- **Check strategy:** cross-check (both strategies should agree when both are applied).
- **Mastery evidence:** correctly matches strategy to problem for 3 of 4 mixed pairs,
  with a stated reason.
- **Unlocks:** 3.2.7.
- **Visual:** `EquationWorkspace`.
- **Format:** Both. **Presenter:** Optional.

### 3.2.7 — Proving Compensation Doesn't Change the Answer
- **Type / Difficulty:** Error Analysis · Transfer
- **Teaching goal:** examine a compensation move that *breaks* — where an adjustment
  actually does change the answer — and explain precisely why, to secure genuine
  understanding of *why* correct compensation works (not just that it does).
- **Student question:** "This move looks like compensation, but the answer changed —
  what went wrong?"
- **Prerequisites:** 3.2.1–3.2.6.
- **New idea:** none new procedurally — this lesson is the unit's explicit "why does
  this work" capstone, directly responding to the milestone's instruction that
  compensation must not be reduced to "move one because it's easier."
- **Reuses:** the entire unit.
- **Reasoning pattern(s):** Compensate, Equivalence.
- **Representation:** `EquationWorkspace` / `NumberLine`, shown with a broken move.
- **Vocabulary:** proof, why.
- **SETUP:** a shown (incorrect) "compensation": `49 + 27` solved as `50 + 27 = 77`
  (added 1 to 49 to make 50, but never took the 1 back off 27) — deliberately the exact
  error flagged in 3.2.2.
- **SEE:** "Does 77 match what we know `49 + 27` should be?"
- **BREAK:** compute `49 + 27` directly (or via correct compensation) to get the true
  answer, 76.
- **BUILD:** compare 77 to 76 and locate exactly where the extra 1 came from.
- **TRANSFORM:** the broken move, repaired into a true compensation (`50 + 26 = 76`) —
  same problem, corrected form, with an explicit account of *why* the repair is
  necessary: 1 was added to the *total* without being removed from anywhere, so the
  total quietly grew by 1.
- **CHECK:** the corrected version (`50 + 26`) is checked against a direct addition of
  `49 + 27`.
- **Primary example (broken):** `49 + 27 → 50 + 27 = 77` (wrong — should be 76).
- **Second example (broken):** `38 + 19 → 38 + 20 = 58` (stops here without subtracting
  the extra 1 back off — should be 57).
- **Transfer example:** the learner is given a new, not-yet-seen broken compensation
  attempt and must diagnose it independently.
- **Misconception (the one being diagnosed):** the exact "changing a number without
  compensating" error flagged across 3.2.2–3.2.4.
- **Teacher response:** "You changed one number — where did that same amount need to go
  to keep the total fair?"
- **Check strategy:** direct addition check (recompute from scratch).
- **Mastery evidence:** correctly diagnoses and repairs 2 of 2 broken compensation
  attempts, stating in their own words why the original total changed.
- **Unlocks:** 3.2.8.
- **Visual:** `EquationWorkspace`, `NumberLine`.
- **Format:** Both. **Presenter:** Optional.

### 3.2.8 — Compensation at the Store
- **Type / Difficulty:** Application · Transfer
- **Teaching goal:** apply compensation inside a real, motivating context (paying with
  money / totaling a small receipt) — the unit's, and Foundation Release 1's, capstone
  application lesson.
- **Student question:** "How much did we spend in all — is there a friendlier way to add
  it up?"
- **Prerequisites:** 3.2.1–3.2.7.
- **New idea:** none new mathematically — the point of an Application lesson (§7) is
  applying already-secure skills in a motivating context, not introducing content.
- **Reuses:** the entire unit; connects forward to the existing production `budget-
  receipt` lesson's context.
- **Reasoning pattern(s):** Compensate, Make a Benchmark.
- **Representation:** `EquationWorkspace`; a simple receipt-style list of prices.
- **Vocabulary:** total, spend, in all.
- **SETUP:** a short receipt: two items priced $19 and $26.
- **SEE:** "How much did both items cost together?"
- **BREAK:** notice $19 is close to $20; round up and plan to correct.
- **BUILD:** `$20 + $26 = $46`.
- **TRANSFORM:** `$19 + $26` and `$20 + $26 - $1` — same total ($45), reached via a
  friendlier round number (with the required correction: `$46 - $1 = $45`).
- **CHECK:** add the original prices directly to confirm $45.
- **Primary example:** $19 + $26 = $45.
- **Second example:** $38 + $47 = $85 (round 38→40, correct by 2).
- **Transfer example:** a three-item receipt, applying compensation to whichever price
  is closest to a landmark.
- **Misconception:** forgets the correction step in the excitement of a "real" context
  with money, the same error pattern as 3.2.4, now under added context load. *Why:*
  applying a skill in a new context (money, a receipt) temporarily raises cognitive load
  even when the underlying math is secure — expected, not a sign the skill regressed.
- **Teacher response:** "Which number did you round, and by how much — has that amount
  been accounted for?"
- **Check strategy:** direct addition check.
- **Mastery evidence:** correctly totals 2 receipt-style problems using compensation,
  including the correction step, in a real-context wrapper.
- **Unlocks:** the Unit 3.2 Mastery Check, and the Foundation Release 1 completion
  milestone (`README.md`); Foundation Release 2's D3.3 (Multi-Digit Mental Strategies)
  and D4 (formal Equivalence).
- **Visual:** `EquationWorkspace`.
- **Format:** Both. **Presenter:** Recommended (a real-context capstone lesson benefits
  from presenter framing).
