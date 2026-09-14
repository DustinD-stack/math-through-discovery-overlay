# Release Checklist — Foundation Release 1 → V1.0

Concrete pass/fail items for release acceptance. Items are marked PASS
only once actually verified — not merely because they were planned.
The two items under TAG/RELEASE that require the tag to already exist
are left unchecked until immediately after the tag is pushed.

## REPOSITORY
- [x] Working tree clean, `HEAD == origin/main`, no force-pushes used.
- [x] No stray/debug files committed (temporary audit/test scripts used during verification were deleted, never staged).

## CURRICULUM
- [x] 78/78 production experiences present (57 lessons, 8 mastery checks, 13 reviews).
- [x] `npm run lessons:validate` reports 0 warnings, 0 errors.
- [x] Capability gap count is 0.
- [x] Curriculum content unmodified through P8 and P9 (zero lesson JSON files touched).

## RUNTIME
- [x] Schema-v1 adapter/player/catalog/resolver unchanged in behavior (regression suites pass).
- [x] Legacy lesson-loader/preset runtime unchanged and still passes its own suite.
- [x] Invalid stage/representation requests fail safely without corrupting the active session.
- [x] A failed lesson load never silently substitutes another lesson.
- [x] A failed lesson load preserves the prior valid session where one exists.

## VISUALS
- [x] Modular layout collision audit performed across 16:9/9:16/1:1 × presenter on/off, using the real corpus's worst cases (densest representation data, longest title/prompt/objective, most representations, longest mastery/review).
- [x] Zero real component/asset collisions found — presenter and workspace are structurally separate flow regions everywhere; no lesson-specific pixel-position hacks exist or were added.
- [x] Presenter-off reclaims full workspace width/height (no phantom empty presenter region).
- [x] 1:1 always renders with presenter absent, even when explicitly requested on.
- [x] Dense real-corpus content (longest title 46 chars, longest prompt/objective 317 chars) remains readable and unclipped at native OBS-recommended resolutions.
- [x] Structural collision regression tests added (`npm run layout:test`, 53 assertions) — region ownership, no forbidden absolute positioning, min-width/min-height sizing contract, dense-content soundness.

## WORKFLOW
- [x] Operator can complete the full START → SELECT → TEACH → RESET/RETAKE → SWITCH → STOP flow with no developer knowledge.
- [x] Connection status is visible in plain language (Connected / Connecting / Offline).
- [x] Reconnect re-syncs to the overlay's authoritative state, never a stale guess.
- [x] The one high-disruption control (Exit Foundation Mode) asks for confirmation; Next/Previous/Reveal remain confirmation-free.
- [x] Keyboard shortcuts are fully usable and disabled while typing.

## OBS
- [x] Recommended Browser Source URL and native canvas sizes documented (1920×1080 / 1080×1920 / 1080×1080).
- [x] 16:9, 9:16, and 1:1 aspect behavior verified live, including at native (non-scaled) resolution.
- [x] Clean/transparent output verified free of developer chrome (no safe-zone label, no debug text).
- [x] Long-session stress (200+ operations) produces no exceptions, no runaway DOM growth, no duplicated status broadcasts.
- [x] Reconnect stress produces no duplicated actions.

## ACCESSIBILITY
- [x] Critical controls (Reveal, stage buttons, representation buttons, Presenter) expose `aria-pressed` state.
- [x] Unit/Experience selects have linked, accessible labels.
- [x] Current-state display is an `aria-live` region.
- [x] Keyboard focus is visible (`:focus-visible` outline) on all interactive controls.
- [x] No keyboard traps; Escape remains safe (never destructive).

## DOCUMENTATION
- [x] `docs/TEACHING_WORKFLOW.md`, `docs/PRODUCTION_GUIDE.md`, and this checklist exist, teacher/operator-facing.
- [x] `docs/RELEASE_NOTES_V1.md` written.
- [x] README, TEACHING_WORKFLOW, and PRODUCTION_GUIDE cross-checked for agreement on startup command, Control/Overlay/Preview URLs, OBS workflow, keyboard shortcuts, aspect/presenter behavior, and recovery procedure; README's stale docs listing and a corrupted trailing byte sequence were fixed.

## TESTS
- [x] All required regression baselines hold: 78/78 lessons, 77 lesson-schema, 82 curriculum-runtime, 167 visual-capability, 64 workflow, 54 hardening, 53 layout-collision, 1152 render combinations, 427 UI assertions.
- [x] `npm run verify:release` exists and passes end-to-end (lesson validation + all eight test suites).

## VERSION
- [x] `package.json` version confirmed as the intended v1.0.0 release version; not changed merely to create a diff (it was already `1.0.0`, not a placeholder).

## CLEAN-ROOM INSTALL
- [x] Verified `npm install`/`npm ci`, `npm run verify:release`, and `npm start` from a clean checkout (see P9 final report, "CLEAN-ROOM INSTALL STATUS").
- [x] Package-lock decision made explicitly and documented (see P9 final report, "PACKAGE LOCK DECISION") — not silently committed.

## TAG
- [ ] Annotated tag `foundation-release-1-v1.0.0` created and pushed to `origin`. *(Checked immediately after Part T completes — see PUSH RESULT / TAG RESULT in the P9 final report.)*

## RELEASE
- [ ] Foundation Release 1 formally declared frozen. *(Checked at the same point as the TAG item above.)*
