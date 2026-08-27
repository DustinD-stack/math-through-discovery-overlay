# Teaching live with the control panel

Open `control.html` on a second screen, a laptop or a tablet. The panel has a live
preview built in, so you always see exactly what the audience sees.

## Connecting overlays

| Setup | How the panel reaches the overlay |
| --- | --- |
| Served over `http://localhost:3000` | Automatically — all pages share a channel. |
| Opened from disk (`file://`) | Use **Open overlay window** in the panel, and drive that window. |
| OBS browser source | Same origin as the panel; served over http it connects on its own. |

The panel also writes the current state to the browser, so a browser source that
reloads mid-lesson comes back exactly where you left it.

## The controls

**Lesson** — choose any lesson. *Undo live edits* drops on-air text changes; *Reset
lesson* returns every control to its default.

**Discovery path** — the transport. `Next step` advances SEE → BREAK → BUILD →
TRANSFORM → CHECK. Steps that have not arrived yet sit dimmed on the board, so the
audience can see the shape of the path without the answer. Jump directly to any step
with its button. `Hide all` clears back to nothing.

**Answer showing / hidden** — controls the circled answer on the paper note and the
right-hand side of the comparison panel. Hide it while the class works, reveal on the
beat.

**Show everything** — one button for step 5 plus the answer. Useful for thumbnails.

**Layout** — preset, canvas ratio, background, motion, and the diagram override.
Setting the diagram to anything other than *from lesson* forces that module, which is a
fast way to reteach the same numbers with a different visual.

**Layers** — independently toggle brand, presenter, story, math, discovery, comparison
and takeaways. Turning off `presenter` gives the board the full width immediately.

**Live edits** — type new numbers, questions, steps or takeaways mid-lesson. Edits are
overlays on top of the JSON, so the lesson file on disk is never modified, and *Undo
live edits* restores it.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `→` or `Space` | next step |
| `←` | previous step |
| `1`–`5` | jump to that step |
| `0` | hide all steps |
| `A` | toggle the answer |

Shortcuts are ignored while you are typing in a field.

## A live lesson, start to finish

1. Pick the lesson. Set preset **C**, background **Transparent**, step **0**.
2. Read the quote on camera. Press `1` — SEE appears with the numbers named.
3. Work the room. `2`, `3`, `4` as you talk through the reasoning.
4. Ask for predictions. Press `A` to reveal the circled answer.
5. Press `5` for CHECK and let the confirmation land.
6. Switch to preset **B** for a clean full-board recap while you summarise.
7. Switch the canvas to **9:16**, preset **F**, and record the same beats again for the
   short — same lesson data, no rebuild.

## If something goes wrong on air

- Overlay frozen → **Reload overlays**.
- Wrong lesson on screen → pick the right one; the change is instant.
- Text too long and wrapping → edit it in *Live edits* rather than stopping.
- Animations distracting → **Motion off**. Everything renders in its final state.
