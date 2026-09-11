# Foundation Release 1 — Misconception Map

Release-level consolidation of the misconceptions flagged inline throughout the unit
blueprints, using the `docs/CURRICULUM_ARCHITECTURE.md` §11 six-field model. Every
misconception named in the P2.14 checklist is covered.

---

### 1. Counting objects twice (or skipping one)
- **Where it first appears:** 0.1.1 (How Many?).
- **Error:** recounts the same group and gets a different total each time.
- **Likely mental model:** treats counting as reciting a sequence of words alongside
  vague pointing, rather than a strict one-to-one match between each word and exactly
  one object.
- **Diagnostic question:** "Can you touch each one as you say its number, just once?"
- **Best representation:** physical objects the learner can physically move aside as
  they're counted (removes the ambiguity of "have I touched this one yet?").
- **Teacher response:** model moving each object to a "counted" pile while saying its
  number; have the learner repeat with the moving-aside physically enforced.
- **Follow-up problem:** a slightly larger group (8–10) counted with the same
  move-aside method, then without it, to check the correspondence has generalized.

### 2. Thinking rearrangement changes quantity
- **Where it first appears:** 0.1.3 (Same Amount, Different Look).
- **Error:** claims a spread-out or differently-shaped group has "more" or "less" than
  the same group before it was rearranged.
- **Likely mental model:** judging quantity by the visual footprint (length, area, or
  spread) the group occupies, not by count — a normal developmental stage (Piagetian
  conservation), not carelessness.
- **Diagnostic question:** "Did anyone add or take away any objects when I moved them?"
- **Best representation:** the exact same physical objects, rearranged in full view of
  the learner (never a picture substituted mid-task, which would reopen the "did it
  really stay the same objects" question).
- **Teacher response:** have the learner do the rearranging themselves and predict the
  count *before* recounting, repeated across several different rearrangements until the
  prediction is reliably correct.
- **Follow-up problem:** rearrange into a shape that looks deliberately "bigger" (a wide
  spread) and a shape that looks deliberately "smaller" (a tight cluster), same count
  both times.

### 3. Confusing the numeral with the quantity
- **Where it first appears:** 2.1.2 (Tens and Ones Names); resurfaces as "place-value
  digit/value confusion" in 2.1.5.
- **Error:** reads a numeral's digits without connecting them to the amount each
  represents (e.g., cannot say which digit in "34" represents the bundles of ten).
- **Likely mental model:** numeral literacy (reading/writing the symbol) has outrun
  place-value understanding (what the symbol quantifies) — common when symbol
  recognition is drilled before or faster than quantity work.
- **Diagnostic question:** "Which part of '34' tells us the bundles? Which part tells us
  the loose ones?"
- **Best representation:** `PlaceValueBreakdown`, built from physical bundles first,
  numeral written only after the bundles are counted.
- **Teacher response:** cover the numeral; ask the learner to state the tens and ones
  count from the objects alone, then reveal the numeral and match each digit to what was
  just said.
- **Follow-up problem:** a new two-digit number, numeral shown first this time — can the
  learner build it from objects, reversing the direction of the original task?

### 4. Whole vs. part reversal
- **Where it first appears:** 1.1.5 ("number-bond direction confusion").
- **Error:** places a part-sized number in the whole's position of a bond, or vice
  versa, especially when the diagram's usual layout changes.
- **Likely mental model:** relying on the diagram's spatial position (top vs. bottom, or
  left vs. right) rather than the size relationship (the whole is always the largest of
  the three numbers, equal to the sum of the parts).
- **Diagnostic question:** "Which number should be the biggest one here — the whole, or
  one of the parts?"
- **Best representation:** `NumberBond`, deliberately drawn in an unfamiliar orientation
  (parts stacked vertically, or the diagram rotated) to force reasoning from the
  size/sum relationship instead of memorized position.
- **Teacher response:** ask the learner to add the two numbers they've called "parts" —
  does the sum match the number they've called "the whole"?
- **Follow-up problem:** a bond presented with all three numbers filled in but the
  diagram rotated 90°, asking the learner to identify which is the whole by evidence,
  not position.

### 5. Missing-part confusion (adding instead of finding the difference)
- **Where it first appears:** 1.1.4 (Missing Part Puzzles); recurs in 1.2.1.
- **Error:** given the whole and one part, adds the two known numbers instead of finding
  the difference (e.g., whole 8, known part 5 → answers "13").
- **Likely mental model:** over-applies "put together" (composing) reasoning to a
  "what's left" (decomposing) situation — the two operations haven't yet been
  distinguished by the *question being asked*, only by surface similarity of "two
  numbers, find a third."
- **Diagnostic question:** "If the whole is 8 and we already have 5, would the missing
  part be bigger or smaller than 8?"
- **Best representation:** physical objects — build the known part, then physically add
  more (one at a time) until the whole is reached, counting how many were added.
- **Teacher response:** before solving, ask the learner to predict whether the missing
  part will be larger or smaller than the given whole — a wrong prediction ("13, which
  is bigger than 8") surfaces the error before it's computed.
- **Follow-up problem:** a missing-part bond where the known part is very close to the
  whole (e.g., whole 9, part 8), so an addition-error answer (17) is obviously
  unreasonable, building the reasonableness-check habit.

### 6. Make-10 decomposition errors
- **Where it first appears:** 1.3.1 (splitting toward the wrong target, or adding the
  split pieces in the wrong order); directly exercised in 1.3.6 (Error Analysis).
- **Error:** splits the correct addend but adds the pieces in the wrong order (the
  ten-completing piece added second instead of first), or splits toward a number other
  than 10.
- **Likely mental model:** has memorized "split one number into two pieces" as the
  action, without tracking *which* piece exists specifically to complete the benchmark —
  the split is procedurally recalled but disconnected from its purpose.
- **Diagnostic question:** "Which piece did we split off to finish the ten? Let's add
  that piece first."
- **Best representation:** a ten-frame plus loose counters for the second addend,
  physically dropped into the frame first — the "which piece fills the frame" question
  answers itself visually.
- **Teacher response:** require the learner to say out loud, before adding anything,
  "this piece will make a ten" — narrate the purpose before executing the arithmetic.
- **Follow-up problem:** a fresh bridging problem where both addends are further from a
  ten than usual (e.g., 6 + 8), so the split is less "obvious" and must be reasoned
  through rather than pattern-matched from a familiar case.

### 7. Changing a number without compensating
- **Where it first appears:** 3.2.2 (moves an amount to one number but doesn't take it
  from the other); directly exercised in 3.2.7 (Error Analysis).
- **Error:** rounds one addend up to a friendly number but never adjusts the total or
  the other addend to correct for the change, silently inflating the answer.
- **Likely mental model:** treats "make it friendlier" as the whole strategy, without
  tracking that a change made to preserve *ease* must be paired with an equal-and-
  opposite change to preserve *value* — the core equivalence idea (D4) has not yet been
  made explicit enough at the point this error occurs, which is exactly why 3.2.7 exists
  before Foundation Release 2's formal Equivalence domain.
- **Diagnostic question:** "You changed one number — where did that same amount need to
  go to keep the total fair?"
- **Best representation:** `NumberLine`, showing the adjustment as a physical jump in
  one direction that must be balanced by an equal jump in the other direction (or off
  the total, depending on which compensation structure is in play).
- **Teacher response:** have the learner compute the "friendlier" version and the
  original version by two fully independent methods and compare — the mismatch itself
  becomes the evidence something was lost or gained.
- **Follow-up problem:** a compensation problem embedded in the money context of 3.2.8,
  where an uncorrected total is easy to sanity-check against a rough estimate.

### 8. Place-value digit/value confusion
- See item 3 above (the same underlying misconception, listed separately here only
  because P2.14 names it distinctly — no separate treatment is warranted; treating it
  twice would duplicate content rather than add insight).

### 9. Zero-ones confusion
- **Where it first appears:** 2.1.4 (Expanded Form).
- **Error:** writes a number with zero ones in expanded form with a fake trailing
  addend, e.g. `40 = 40 + 0`, instead of `40 = 40`.
- **Likely mental model:** pattern-matching the *shape* of expanded form (always two
  addends, because every prior example had two) rather than reasoning from each place's
  actual value — this is the same root confusion documented at the production-code
  level in `docs/DESIGN_SYSTEM_HANDOFF.md` for `PlaceValueBreakdown` (`790 = 700 + 90`,
  never `700 + 90 + 0`), now traced back to its earliest curricular origin.
- **Diagnostic question:** "What is the value of the ones place here? If it's zero, do
  we need to write anything for it?"
- **Best representation:** `PlaceValueBreakdown` (expanded form), built from a physical
  ten-bundle count that visibly has zero loose ones remaining.
- **Teacher response:** ask the learner to physically point to the "zero ones" pile —
  when there's nothing there to point to, ask whether writing "+ 0" adds anything real to
  the picture.
- **Follow-up problem:** a second zero-ones number in a different tens range (e.g., 60,
  after 40 was used in the original lesson), to confirm the correction generalized
  rather than being memorized for one specific number.

### 10. Near-double errors
- **Where it first appears:** 3.1.3/3.1.4 (applying the wrong direction, +1 vs. −1,
  relative to a known double).
- **Error:** uses the same adjustment direction learned first (typically +1, from 3.1.3)
  regardless of whether the actual problem needs +1 or −1.
- **Likely mental model:** over-generalizing the first-learned rule as if it were
  universal, rather than re-checking which side of the double the target number falls
  on each time.
- **Diagnostic question:** "Which double are we near, and is our number bigger or
  smaller than the double's matching part?"
- **Best representation:** `NumberBond`, with the known double's bond shown alongside
  the target problem so the "one more" or "one less" relationship is visually explicit.
- **Teacher response:** require the learner to state, before adjusting, whether the
  target number is one more or one less than the nearby double's repeated part.
- **Follow-up problem:** two near-double problems given back to back, one needing +1 and
  one needing −1, specifically to test whether the direction check happens each time
  rather than being locked to the first-seen case.

### 11. Compensation changing the answer
- See item 7 above — "changing a number without compensating" and "compensation
  changing the answer" describe the same underlying failure (an uncorrected adjustment),
  documented once rather than twice to avoid duplicating the follow-up plan.

---

**Note on coverage:** P2.14 lists 11 misconceptions; two pairs (3≈8, 7≈11) describe the
same underlying error at the level of detail useful for this document, so 9 distinct
entries are documented above rather than 11 — each of the 11 named items is explicitly
accounted for, with cross-references where two names point to one root cause.
