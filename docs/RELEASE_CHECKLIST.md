# Release Checklist — Foundation Release 1 → V1.0

Concrete pass/fail items for the P9 final-acceptance milestone. Items
marked **(P8)** are already verified as of this checklist's creation;
items marked **(P9)** are explicitly deferred and must not be marked
complete now.

## REPOSITORY
- [x] (P8) Working tree clean, `HEAD == origin/main`, no force-pushes used.
- [x] (P8) No stray/debug files committed.
- [ ] (P9) Final `v1.0.0` tag created.

## CURRICULUM
- [x] (P8) 78/78 production experiences present (57 lessons, 8 mastery checks, 13 reviews).
- [x] (P8) `npm run lessons:validate` reports 0 warnings, 0 errors.
- [x] (P8) Capability gap count is 0.
- [x] (P8) Curriculum content unmodified since P7 acceptance.

## RUNTIME
- [x] (P8) Schema-v1 adapter/player/catalog/resolver unchanged in behavior (regression suites pass).
- [x] (P8) Legacy lesson-loader/preset runtime unchanged and still passes its own suite.
- [x] (P8) Invalid stage/representation requests fail safely without corrupting the active session.
- [x] (P8) A failed lesson load never silently substitutes another lesson.
- [x] (P8) A failed lesson load preserves the prior valid session where one exists.

## WORKFLOW
- [x] (P8) Operator can complete the full START → SELECT → TEACH → RESET/RETAKE → SWITCH → STOP flow with no developer knowledge.
- [x] (P8) Connection status is visible in plain language (Connected / Connecting / Offline).
- [x] (P8) Reconnect re-syncs to the overlay's authoritative state, never a stale guess.
- [x] (P8) The one high-disruption control (Exit Foundation Mode) asks for confirmation; Next/Previous/Reveal remain confirmation-free.
- [x] (P8) Keyboard shortcuts are fully usable and disabled while typing.

## OBS
- [x] (P8) Recommended Browser Source URL documented (`http://localhost:3000/overlay.html`).
- [x] (P8) 16:9, 9:16, and 1:1 aspect behavior verified live.
- [x] (P8) Clean/transparent output verified free of developer chrome (no safe-zone label, no debug text).
- [x] (P8) Long-session stress (200+ operations) produces no exceptions, no runaway DOM growth, no duplicated status broadcasts.
- [x] (P8) Reconnect stress produces no duplicated actions.

## ACCESSIBILITY
- [x] (P8) Critical controls (Reveal, stage buttons, representation buttons, Presenter) expose `aria-pressed` state.
- [x] (P8) Unit/Experience selects have linked, accessible labels.
- [x] (P8) Current-state display is an `aria-live` region.
- [x] (P8) Keyboard focus is visible (`:focus-visible` outline) on all interactive controls.
- [x] (P8) No keyboard traps; Escape remains safe (never destructive).

## DOCUMENTATION
- [x] (P8) `docs/TEACHING_WORKFLOW.md` (P7) and `docs/PRODUCTION_GUIDE.md` (P8) exist, teacher/operator-facing.
- [x] (P8) `docs/RELEASE_CHECKLIST.md` (this file) exists.
- [ ] (P9) Formal release notes for v1.0 written.

## TESTS
- [x] (P8) All required regression baselines hold: 78/78 lessons, 77 lesson-schema, 82 curriculum-runtime, 167 visual-capability, 64 workflow, 1152 render combinations, 427 UI assertions.
- [x] (P8) New P8 hardening suite passes (`npm run hardening:test`).
- [x] (P8) `npm run verify:release` exists and passes end-to-end.

## VERSION
- [x] (P8) Current `package.json` version (`1.0.0`) reviewed; left unchanged in P8 per the schema/version guard.
- [ ] (P9) Confirm `1.0.0` is the intended final release version (recommendation: keep as-is — it was never a placeholder pre-1.0 number).

## TAG
- [ ] (P9) Create the final release tag, following the existing `design-system-v1-accepted` naming convention (e.g. `foundation-release-1-v1.0.0`).

## RELEASE
- [ ] (P9) Publish/announce release notes pointing at `docs/PRODUCTION_GUIDE.md` and `docs/TEACHING_WORKFLOW.md`.
- [ ] (P9) Formal project freeze / V1 sign-off.
