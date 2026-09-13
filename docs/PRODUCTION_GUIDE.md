# Production Guide — Math Through Discovery

A guide for the person operating a live teaching or recording session.
This document assumes you can open a web browser and OBS. It does not
assume any knowledge of WebSockets, JSON, schemas, or how the app is
built — everything below is written for that.

## 1. Requirements

- A computer that can run Node.js (already set up if you're reading
  this from the project folder) and OBS (or any software that supports
  a Browser Source).
- No internet connection is required — everything runs locally on your
  own machine, at `http://localhost:3000`.

## 2. Starting the server

From the project folder, run:

```
npm start
```

You should see:

```
Math Through Discovery running at http://localhost:3000
Control: http://localhost:3000/control.html
Overlay: http://localhost:3000/overlay.html
Preview: http://localhost:3000/preview.html
WebSocket: ws://localhost:3000/ws (available)
```

That confirms the server started, and lists every URL you'll need.
Leave this terminal window open for the whole session — closing it
shuts everything down.

**If you instead see** `Port 3000 is already in use`, another copy of
the server (maybe from an earlier session you forgot to close) is
already running. Either close that one, or start this one on a
different port: `PORT=3001 npm start` (and use that port number in
every URL below instead of 3000).

## 3. Opening Control

Open `http://localhost:3000/control.html` in a browser tab on the
computer you're operating from. This is **your** screen — students or
viewers never see it.

At the top of Control you'll see a small badge:

| Badge | Meaning |
|---|---|
| **Overlay Connected** | Everything is live and talking to each other. |
| **Connecting…** | Control just started and hasn't heard from an overlay yet — normal for the first second or two. |
| **Overlay Offline** | No overlay tab/browser source is currently reachable. See §21. |

## 4. Adding OBS Browser Source

In OBS, add a **Browser Source** with the URL:

```
http://localhost:3000/overlay.html
```

**Never** use a `file:///` path — it will not receive live updates.
Set width/height to match your recording aspect (see §13–15). If you
want the overlay to composite transparently over your camera, set
Background to **Transparent** in Control's Layout panel.

## 5. Selecting a lesson

In Control, under **Foundation Release 1 — Teaching → Change lesson**,
pick a **Unit**, then an **Experience**.

## 6. Start Lesson

Press **▶ Start Lesson**. The overlay updates instantly, always
starting at the first stage, answer hidden, default visual model
showing — a clean start every time, whether it's your first lesson of
the day or your tenth.

## 7. Next / Previous

The two large buttons at the top are what you'll use almost the entire
time. They disable themselves at either end and never wrap around.

## 8. Reveal

Shows the lesson's result; press again to hide. Moving to a different
stage automatically hides a shown answer, so you never carry a
revealed answer somewhere it doesn't belong.

## 9. Reset

Returns the current lesson to its very first stage, answer hidden —
useful between takes. It does not change your selected lesson, aspect,
or presenter setting.

## 10. Direct stage navigation

Below Next/Previous is a row of stage buttons (SETUP if present, then
SEE BREAK BUILD TRANSFORM CHECK) for retakes or jumping straight to a
part of the lesson.

## 11. Keyboard shortcuts

While Control has focus and you're not typing into a field:

| Key | Action |
|---|---|
| → or Space | Next |
| ← | Previous |
| R | Reveal / hide |
| Home | Reset |
| 1–5 | Jump to SEE / BREAK / BUILD / TRANSFORM / CHECK |
| 0 | Jump to SETUP (if present) |

Escape does nothing on purpose — it will never exit teaching mode or
discard your place mid-recording. Shortcuts are automatically disabled
while you're typing in any text field or dropdown, everywhere in
Control (verified across every field on the panel, not only the lesson
selectors).

## 12. Presenter modes

The **Presenter** toggle lives in the existing **Layers** panel. It
never resets your lesson, stage, reveal, or representation.

- **16:9** — camera at ~38% (left), teaching content at ~62% (right).
- **9:16** — teaching board leads; camera is a strip along the bottom (~22%).
- **1:1** — camera is **always** hidden, even with Presenter on.

## 13. Long-form setup (16:9)

The default, best-supported workflow: Start the lesson, Presenter on,
teach with Next and Reveal.

## 14. Shorts setup (9:16)

Switch Aspect to 9:16. Controls behave identically.

## 15. Square setup (1:1)

Switch Aspect to 1:1. Presenter is always hidden by design here.

## 16. Mastery checks

Select a mastery-check experience (e.g. `MC-1.2`). You'll see
**← Previous task / Next task →** and a task counter instead of
SEE→CHECK stages. There is no automatic scoring — Control shows the
pass evidence and reteach guidance for your own reference.

## 17. Reviews

Select a review experience (e.g. `R7`). You'll see a retrieval prompt;
**Reveal retrieves** shows the earlier lessons it draws on.

## 18. Retakes

Jump directly to any stage (e.g. BUILD) to redo just that section —
you never have to replay earlier stages first.

## 19. Reconnect behavior

If the overlay tab reloads, OBS restarts the browser source, or your
network hiccups: Control's badge changes to **Connecting…** or
**Overlay Offline**, and reconnects automatically (about every 1.2
seconds). The moment the overlay reappears, Control asks it directly
for its current state and displays exactly that — never a guess, and
never a stale leftover from before the disconnect. You do not need to
do anything except wait a moment.

If the **server** itself was restarted (the `npm start` terminal
window closed and reopened), the in-progress lesson position is not
preserved — that's expected; teaching state lives only in the running
overlay tab for the length of a session, on purpose, to keep the
system simple. Re-open Control, re-select your lesson, and press Start
Lesson again.

## 20. Troubleshooting

**Overlay Offline** — check that `npm start`'s terminal window is
still open and showing no errors. If it is, reload the OBS Browser
Source (or the overlay browser tab).

**Control disconnected / badge stuck on Connecting…** — same as
above; also confirm you're using `http://localhost:3000/...` URLs, not
a `file://` path.

**Lesson won't load** — you'll see a brief on-screen message and a
toast in Control (never a stack trace or blank freeze). Your previous
lesson, if any was running, is left exactly as it was — nothing is
silently swapped in. Pick a lesson from the dropdown and press Start
Lesson again.

**OBS source is blank** — the Browser Source URL is probably wrong or
the server isn't running. Confirm the URL is
`http://localhost:3000/overlay.html` and that the terminal window
running `npm start` shows no errors.

**Wrong aspect** — reselect the aspect in Control's Layout panel; it
switches instantly without losing your place.

**Presenter missing** — check you're not on 1:1 (presenter is always
hidden there by design); otherwise toggle Presenter off and back on in
Layers.

**Answer stuck revealed** — press Reveal again to hide it, or press
Reset.

**Wrong stage / need to redo one stage** — use the direct-stage row to
jump straight to the correct stage; no need to replay earlier ones.

## 21. "Overlay Offline" specifically

This means Control's own connection to the local server is down, or no
overlay has responded in the last few seconds. It does **not** mean
your lesson content was lost — reconnecting always re-syncs to the
overlay's real, current state.

## 22. Shutting down

Close the OBS Browser Source (or just stop OBS), close the Control
browser tab, then stop the server with **Ctrl+C** in its terminal
window. There's no separate save step — nothing is written to disk
during a teaching session.
