# Recording, shorts and static exports

## Prerecorded lessons

1. Open OBS with the 1920×1080 canvas and the transparent overlay source
   (`docs/OBS_SETUP.md`).
2. Set the control panel to step `0`, answer hidden.
3. Record in one take, advancing steps with `→` as you teach. The panel's keyboard
   shortcuts mean you never look at the mouse.
4. If you fluff a step, keep rolling — press `←`, redo the beat, and cut in the edit.

Recording without a camera at all: use preset **B** or **H** with `bg=studio` and record
the browser window directly (OBS window capture, or a screen recorder). At 1920×1080
with `anim=1` this produces finished lesson footage with no compositing.

## Making shorts from the same lesson

The short is the same JSON. Nothing is rewritten.

```
overlay.html?lesson=unit-rate&preset=F&aspect=9x16&bg=transparent&step=0
```

A reliable 30-second structure:

| Seconds | Beat | Control |
| --- | --- | --- |
| 0–3 | the claim | step `0`, quote on screen |
| 3–8 | name the numbers | `1` |
| 8–16 | break and build | `2`, `3` |
| 16–22 | transform | `4` |
| 22–26 | reveal | `A` |
| 26–30 | check and takeaway | `5` |

For a silent auto-caption cut, use preset **G** — claim, equation, answer, takeaway —
and hold each state for two seconds.

Square posts: `aspect=1x1`, preset **B** or **G**. The 1:1 canvas drops the presenter
zone and the comparison strip automatically so nothing crowds.

## Static exports (screenshots, worksheets)

- **Screenshot**: open the overlay at the size you want, set `bg=paper` for a light
  background that prints, and take a full-page capture.
- **Print / PDF**: `bg=paper&anim=0`, then print the overlay page. The stage scales to
  the paper size.
- **Worksheet**: `preset=B&bg=paper&step=5&hide=presenter,comparison`, print, and let
  students fill in the paper note. Set the answer hidden with `&answer=0` for a blank
  version and print again with it showing for the key.
- **Thumbnail**: `preset=C&step=5`, answer showing, screenshot, crop.

## Batch generation

Every output is a URL, so generation is a loop. With any headless browser:

```bash
for lesson in unit-rate percentages fractions; do
  shot-scraper "http://localhost:3000/overlay.html?lesson=$lesson&preset=B&step=5" \
    --width 1920 --height 1080 --output "out/$lesson.png"
done
```

The same loop with `aspect=9x16` produces the vertical set, and with `step=1..5`
produces a frame per step for an animated export. This is the hook for automated lesson
generation later: write JSON, render URLs, capture frames.

## QA checklist

Run `npm test` first — it renders every lesson in every preset, aspect and step through
a DOM shim and fails on errors, empty stages or unregistered diagrams. Then check by eye:

- [ ] No overlapping text at 1920×1080, 1080×1920 and 1080×1080
- [ ] No clipped equations — long expressions wrap or shrink, never crop
- [ ] Math symbols render (fractions stacked, exponents raised, √ closed)
- [ ] `bg=transparent` shows the camera through, including the presenter zone
- [ ] Every layer toggle removes its layer and the layout closes the gap
- [ ] Changing a number in a lesson JSON changes the screen with no code edit
- [ ] The control panel moves the overlay within a beat
- [ ] All lessons appear in the dropdown and load
- [ ] Console is clean on load and after ten step changes
- [ ] The OBS browser source renders identically to the browser
- [ ] Fonts fall back sensibly with the network disconnected
- [ ] `anim=0` and OS reduced-motion both produce a still, complete board

## Known limitations

- The presenter frame is a zone, not a camera — cropping and keying happen in OBS.
- KaTeX and the fonts come from CDNs. Both degrade gracefully, but for a permanently
  offline machine, vendor them into `assets/` and update the `<head>` links.
- Cross-window sync needs a shared origin. Straight from `file://`, drive the overlay
  window that the control panel opens.
- Live edits are session state. To keep a change, write it into the lesson JSON.
- Preset H's whiteboard is a display surface, not an ink canvas — draw in OBS or on a
  tablet layer above it.
