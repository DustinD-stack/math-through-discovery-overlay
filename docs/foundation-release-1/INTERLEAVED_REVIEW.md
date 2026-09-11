# Foundation Release 1 — Interleaved Review System

P1 estimated ~12–15 interleaved review slots for this release. Detailed blueprinting
confirms **13 review slots**, distributed across all 8 units — within the estimated
range, so no change to P1's estimate was needed.

Reviews are **not** a repeat of the immediately preceding lesson. Each one deliberately
retrieves an **earlier**, structurally different lesson, spaced out to fight forgetting
— per `docs/CURRICULUM_ARCHITECTURE.md` §7's definition of the Review/Retrieval lesson
type. Reviews are a light experience (a handful of quick prompts), not a full new
lesson blueprint, and are not counted among the 57 instructional lessons.

| # | Placement | Retrieves | Sample retrieval prompt |
|---|---|---|---|
| **R1** | After 0.1.4 (Matching to Compare) | Counting, cardinality (0.1.1) | "Count this group twice, in two different orders — does it match?" |
| **R2** | After 0.2.2 (Breaking a Quantity Apart) | Quantity, subitizing, more/less/equal (0.1.2, 0.1.5) | "At a glance, is this group more, less, or equal to that one?" |
| **R3** | After 0.2.5 (Zero Is Still a Quantity) | Composing, comparing (0.2.3, 0.1.5) | "Given these two parts, what's the whole — and is it more or less than the whole from before?" |
| **R4** | Start of Unit 1.1 | Part/whole, decomposition, benchmarks 5/10 (0.2.1–0.2.4, 0.2.8) | "Break this number apart two different ways, then tell me if it's closer to 5 or 10." |
| **R5** | After 1.1.4 (Missing Part Puzzles) | Multiple decompositions, number location (0.2.4, 0.2.6) | "Where would this whole's missing part sit on our number path?" |
| **R6** | After 1.2.3 (What Does 10 Need?) | Number bonds, missing-part reasoning (1.1.4) | "Draw this complement-to-10 fact as a bond instead." |
| **R7** | Start of Unit 1.3 | Quantity, part/whole, number bonds, benchmark complements (0.1–0.2, 1.1, 1.2) — the explicit example from P1 §16 | "Show me 7 as a bond, then tell me what it needs to make 10." |
| **R8** | After 1.3.3 (Bridging Through Ten: 9 + 7) | Doubles-adjacent noticing (light, informal pre-look at 3.1, not taught yet) + benchmark complements (1.2.3) | "Is 6 + 6 easier or harder to picture than 6 + 7? What does 6+7 need to reach a ten?" |
| **R9** | Start of Unit 2.1 | Compose/decompose, part/whole, same value/different form (0.2, 1.1) — the explicit example from P1 §16 | "Show two different ways to split 34 into two parts (not tens and ones yet) — is the value still the same?" |
| **R10** | After 2.1.4 (Expanded Form) | Make 10 (1.3), multiple decompositions (0.2.4) | "34 = 30 + 4. Is there a Make-10 idea hiding in the 4?" |
| **R11** | Start of Unit 3.1 | Part/whole, equal groups from quantity work, compose/decompose (0.1–0.2) | "Split this group into two *equal* parts — is that always possible?" |
| **R12** | After 3.1.4 (Near-Doubles: One Less Than a Double) | Benchmark complements, Make-10 bridging (1.2.3, 1.3) | "Which is closer to a ten — this near-double answer, or the original problem?" |
| **R13** | Start of Unit 3.2 | Same value/different form (1.1 bonds, 2.1.4 expanded form), benchmark numbers 10 and 100 (1.2, 2.1) | "34 = 30 + 4 and 34 = 2 tens + 14 ones — both true. Can two *different-looking* addition problems also give the same total?" |

**Design rules applied:**
- No review immediately follows the lesson it retrieves from — at least one full lesson
  of distance, usually several.
- Every unit transition (R4, R7, R9, R11, R13) opens with a review that retrieves
  material from *multiple* earlier units at once, priming the new unit's prerequisites
  explicitly rather than assuming they're still active in memory.
- Reviews never introduce new content and are never a prerequisite gate themselves —
  a learner who struggles on a review prompt is flagged back to the *original* lesson,
  not taught a new remediation lesson.
