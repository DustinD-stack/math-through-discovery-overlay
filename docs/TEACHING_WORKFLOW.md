# Teaching & Recording Workflow

A guide for the person actually teaching a lesson or recording an episode —
not a developer document. If you can use a web browser, you can run a
Math Through Discovery session.

## 1. Starting the system

From the project folder, run:

```
npm start
```

You'll see:

```
Math Through Discovery running at http://localhost:3000
Control: http://localhost:3000/control.html
Overlay: http://localhost:3000/overlay.html
```

Leave this window open the whole time you're teaching or recording — it's the
local server everything else talks to.

## 2. Opening Control

Open `http://localhost:3000/control.html` in a browser tab on the computer
you're operating from (your laptop, a second monitor, or a tablet on the
desk next to you). This is **your** screen — students/viewers never see it.

## 3. Setting up OBS

In OBS, add a **Browser Source** with the URL:

```
http://localhost:3000/overlay.html
```

**Never** use a `file:///` path — it will not receive live updates. Set the
Browser Source's width/height to match the aspect you're recording (see §10
below for the three supported canvas sizes). If you want the overlay to
composite transparently over your camera, set the background to
**Transparent** from the Layout panel in Control — this also automatically
switches off the developer-facing presenter label (§9).

## 4. Choosing a lesson

In Control, scroll to **Foundation Release 1 — Teaching**. Near the bottom
of that panel, under **Change lesson**, pick:

1. **Unit** (e.g. "1.3 · Make 10")
2. **Experience** (e.g. "1.3.1 — Bridging Through Ten: 7 + 5 (discovery)")

## 5. Starting the lesson

Press **▶ Start Lesson**. The overlay updates immediately — no page reload,
ever. Starting always begins at the lesson's first state (SETUP if the
lesson has one, otherwise SEE), with the answer hidden and the default
visual model showing. Your chosen **aspect** and **presenter** setting are
never reset when you start a new lesson — only the lesson content is.

If you pick a different lesson later, pressing Start Lesson again is exactly
as clean a start as the first time — there's no "leftover" state from the
previous lesson.

## 6. Navigating stages

Once a lesson is running, the panel's top section shows big **← Previous**
and **Next →** buttons — these are the two buttons you'll use for almost the
entire lesson. They:

- update the overlay the instant you press them
- disable themselves at the very start/end (you can't go past either end)
- never wrap around back to the beginning

Below them is a row of direct-stage buttons (**SETUP** if the lesson has
one, then **SEE BREAK BUILD TRANSFORM CHECK**) — useful for retakes,
demonstrations, or jumping straight to a specific part of the reasoning
without stepping through everything before it.

**SETUP is not a sixth reasoning stage** — it's a presentation stage that
sits before SEE. The rail marker for the current reasoning stage highlights
SEE→CHECK the same way it always has; SETUP just doesn't light one up yet.

When you reach the final stage (CHECK), the panel shows **✓ Complete** —
this is a status readout only. It never auto-advances to a different lesson;
you decide when to move on.

## 7. Reveal / hide

The **Reveal** button shows the lesson's result; pressing it again hides it.
**Moving to a different stage automatically hides a shown answer** — so you
never accidentally carry a revealed answer into a stage where it doesn't
belong. Re-visiting the *same* stage you're already on (pressing a stage
button you're already sitting on) does **not** hide it. Reset always hides
it.

## 8. Representations

Most lessons have one visual model, and it just appears — no extra clicks.
When a lesson offers more than one (for example, a Number Bond *and* an
Equation Workspace for the same idea), Control shows a row of buttons with
plain-language names — **Number Bond**, **Ten Frame**, **Number Line**,
**Place Value** — never the internal component name. Switching representations:

- keeps you on the same stage
- keeps your reveal state exactly as it was
- keeps the presenter setting and aspect
- updates instantly, no reload

## 9. Presenter toggle

The **Presenter** button lives in the existing **Layers** panel further down
in Control (it isn't duplicated inside the Foundation Release 1 panel) —
toggling it works immediately, live, without touching your lesson, stage,
reveal state, or representation.

- **16:9** — camera safe zone on the left (~38% of the frame), your teaching
  content on the right (~62%).
- **9:16** — the teaching board leads; the camera zone is a strip along the
  bottom (~22% of the frame height).
- **1:1 (square)** — the camera is **always** hidden, even if the Presenter
  toggle is on. Square compositions are prompt → visual → result only.

Turning presenter **off** doesn't leave a dead empty rectangle — the
teaching content recomposes to use the full space.

**About the "PRESENTER · SAFE ZONE" label:** that dashed box with a label is
a *rehearsal aid* — it shows you exactly where your camera needs to sit
before you're actually compositing a real camera feed. The moment your
Background is set to **Transparent** (i.e. you're layering the overlay over
a real OBS camera source), that label disappears automatically — the space
is still reserved, but nothing is drawn there, so your actual recording
never shows a developer label.

## 10. Aspect selection

Also in the Layout panel: **16:9**, **9:16**, **1:1**. Switching aspect is
live and instant, and does not reset your lesson, stage, or reveal state.

| Aspect | Canvas |
|---|---|
| 16:9 | 1920×1080 — long-form / sit-down teaching |
| 9:16 | 1080×1920 — vertical shorts |
| 1:1 | 1080×1080 — square/social |

## 11. Keyboard shortcuts

While Control's browser tab has focus (and you're not typing into a text
field or dropdown), these work the moment a Foundation Release 1 lesson is
running:

| Key | Action |
|---|---|
| → or Space | Next |
| ← | Previous |
| R | Reveal / hide |
| Home | Reset |
| 1–5 | Jump directly to SEE / BREAK / BUILD / TRANSFORM / CHECK |
| 0 | Jump to SETUP (only if the lesson has one) |

**Escape does nothing on purpose** — it will never exit Foundation Release 1
mode or discard your place mid-recording. Shortcuts are automatically
disabled while your cursor is in a text box, dropdown, or any editable
field, so normal typing is never interrupted.

## 12. Long-form workflow (16:9)

A typical 10–20 minute sit-down lesson (e.g. `1.3.1 — Bridging Through Ten:
7 + 5`): Start the lesson, turn Presenter on, and teach primarily with
**Next** and **Reveal**. Use direct-stage buttons only for retakes or
demonstrations. This is the default, best-supported workflow — everything
else in this document is a variation on it.

## 13. Shorts workflow (9:16)

Switch Aspect to 9:16. The teaching board still leads; if Presenter is on,
your camera sits in the lower strip. Controls behave identically — there is
no separate "shorts mode" to learn. Math stays fully legible; nothing
requires a workaround for the narrower frame.

## 14. Square workflow (1:1)

Switch Aspect to 1:1. Presenter is always hidden here, by design — don't
try to turn it on for square content. The composition is simply prompt →
visual → result. Controls are identical to every other aspect.

## 15. Mastery checks

Select a mastery-check experience (e.g. `MC-1.2`) the same way you select
any lesson, then press Start. Instead of SEE→CHECK stages, you'll see
**← Previous task / Next task →** and a **Reset assessment** button, plus a
task counter ("Task 2 of 4"). Control also shows the pass evidence and
reteach-trigger text for your own reference — that's operator-facing
guidance, not something shown on the student-facing overlay unless you've
specifically built a display for it. There is no automatic scoring.

## 16. Reviews

Select a review experience (e.g. `R7`) and press Start. You'll see the
retrieval prompt immediately; press **Reveal retrieves** to show which
earlier lessons it's pulling from, and **Reset** to hide them again. Reviews
never pretend to have SEE/BREAK/BUILD/TRANSFORM/CHECK stages — they're a
single retrieval prompt by design.

## 17. Retakes

Messed up BUILD and only want to redo that part? Press the **BUILD** button
directly — you do not need to replay SETUP, SEE, or BREAK first. The correct
representation for that stage comes back automatically, and reveal state is
handled the same as any other stage change (hidden, unless you explicitly
press Reveal again). Record just that section and continue.

## 18. Recording checklist

**Before recording**
- [ ] `npm start` is running
- [ ] OBS Browser Source points at `http://localhost:3000/overlay.html` (not a file path)
- [ ] Correct lesson selected and **Started**
- [ ] Correct aspect selected (16:9 / 9:16 / 1:1)
- [ ] Presenter mode set the way you want it (and hidden for 1:1)
- [ ] Camera physically aligned with the safe zone (rehearse with the dev label visible, i.e. Background not yet set to Transparent)
- [ ] Lesson **Reset** to the state you want to open on
- [ ] Answer hidden unless you intend to open already-revealed
- [ ] Starting stage confirmed (SETUP or SEE, typically)
- [ ] Microphone checked

**After recording**
- [ ] Press Reset (or Start a fresh lesson) to return to a clean, ready state for the next take
- [ ] Note which stage you'd need to retake, if any, before your next session

## 19. Troubleshooting

**Control shows "Not currently teaching a Foundation Release 1 lesson"** —
you haven't pressed Start Lesson yet, or you pressed "Exit Foundation Mode."
Pick a lesson and press Start.

**Overlay looks blank or shows an error message** — the lesson id couldn't
be found or loaded; nothing was silently swapped in for it. Re-select a
lesson from the dropdown and press Start again. Check that `npm start`'s
terminal window is still running.

**Buttons in Control don't seem to match what's on screen** — Control only
ever displays what the overlay itself reports back, so a mismatch usually
means the overlay hasn't loaded yet (wait a moment) or the WebSocket
connection dropped and is reconnecting (it retries automatically every
~1.2 seconds; no action needed).

**Presenter toggle doesn't seem to do anything on 1:1** — that's correct;
1:1 always hides the camera by design.

**Keyboard shortcuts aren't responding** — check that your cursor isn't
sitting inside a text field or dropdown in Control; shortcuts are
intentionally disabled there so normal typing works.

**I need the legacy (pre–Foundation Release 1) lessons** — press "Exit
Foundation Mode" in Control; every legacy lesson, preset, and control
continues to work exactly as it always has.
