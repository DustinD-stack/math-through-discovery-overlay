# Math Through Discovery — Foundation Release 1 (v1.0.0)

## What this is

A production teaching and recording system for the **Math Through
Discovery** method:

> **SEE → BREAK → BUILD → TRANSFORM → CHECK**

A teacher selects a lesson, presses Start, and teaches with two buttons
— Next and Reveal — while OBS records or streams a clean, camera-ready
composition. Foundation Release 1 is the first complete, versioned
curriculum + runtime built on this method.

## Release scope

**78 learning experiences**, schema v1:

- 57 instructional lessons (discovery, strategy, fluency, connection,
  error-analysis, and application types)
- 8 mastery checks
- 13 interleaved reviews

Capability gaps: **0** — every representation type the corpus calls
for (Number Bond, Ten Frame, Number Path, Bundling Visual, Place Value
Breakdown, Equation Workspace, Transformation Chain, Number Line,
Fraction Bar, Answer Reveal) has a real, working visual component.

## Production capabilities

- Long-form teaching (16:9), Shorts (9:16), and square/social (1:1)
  formats from the same lesson content — no per-format authoring
- Presenter/camera composition that behaves as a real layout region,
  not an overlay, and correctly reclaims space when turned off
- Real-time Control ↔ Overlay synchronization over a single shared
  WebSocket, with automatic reconnect and authoritative state resync
- Deterministic lesson navigation: Next/Previous, direct-stage jumps,
  and retakes, all reveal-policy-safe
- Reveal/hide and Reset, with a well-defined policy for when a shown
  answer is (and isn't) automatically hidden
- A dedicated mastery-check workflow (task navigation, pass-evidence
  and reteach guidance shown to the operator) and a review workflow
  (single retrieval prompt, reveal-retrieves)
- Full keyboard operation with safe form-field suppression, visible
  focus states, and accessible control labeling
- A clean production output mode: zero developer chrome (labels,
  status chips, debug text) in the actual transparent/recorded overlay
- Modular, content-aware teaching compositions: presenter and teaching
  content are structurally separate flex/grid regions everywhere,
  never lesson-specific pixel coordinates, and were swept against the
  real corpus's longest/densest experiences with zero collisions found
- Operator-facing error recovery for load failures, invalid actions,
  and disconnects — the last valid lesson is never silently replaced
  or corrupted

## What this is not

- No learner accounts, sign-in, or per-student progress tracking
- No LMS integration, grading, or analytics
- No AI-assisted or generated content
- No automatic mastery-check scoring (pass/fail is an operator judgment,
  supported by displayed pass-evidence/reteach-trigger text)

## Not in this release

**Foundation Release 2** — additional units, extended place value,
written algorithms, and formal equivalence — is future work and is
explicitly out of scope for v1.0.0.

## Documentation

- [docs/PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md) — start here to teach or record
- [docs/TEACHING_WORKFLOW.md](TEACHING_WORKFLOW.md) — workflow-first walkthrough
- [docs/RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) — release acceptance record

## Verification

`npm run verify:release` runs the complete automated gate: lesson
validation (78/78, schema v1, 0 warnings/errors) plus eight test
suites covering rendering, UI, schema, curriculum runtime, visual
capabilities, teaching workflow, production hardening, and modular
layout/collision safety.
