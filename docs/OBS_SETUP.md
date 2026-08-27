# OBS setup

## 1. Serve the kit

Run a local server so OBS, your browser and the control panel all share one origin:

```bash
npm start        # http://localhost:3000
```

If you cannot run a server, OBS can load the file directly — tick **Local file** in the
browser source and pick `overlay.html`. Lessons still load, and the control panel still
drives the overlay through its own preview window.

## 2. Canvas sizes

| Content | OBS canvas | Browser source | Preset |
| --- | --- | --- | --- |
| Long-form YouTube | 1920 × 1080 | 1920 × 1080 | A, B, C, D, E, H |
| Shorts / Reels / TikTok | 1080 × 1920 | 1080 × 1920 | F |
| Square post | 1080 × 1080 | 1080 × 1080 | B, G |

Always match the browser source size to the canvas exactly. The overlay draws on a
fixed pixel stage and scales to whatever box it is given, so a mismatched source
produces soft text rather than a broken layout — but exact is sharp.

## 3. Add the browser source

1. **Sources → + → Browser**, name it `Lesson overlay`.
2. URL:
   ```
   http://localhost:3000/overlay.html?lesson=unit-rate&preset=C&aspect=16x9&bg=transparent
   ```
3. Width `1920`, Height `1080`.
4. Leave **Custom CSS** empty. The `bg=transparent` parameter already removes the
   background; OBS composites the rest over your camera.
5. Tick **Shutdown source when not visible** and **Refresh browser when scene becomes
   active** so each scene starts clean.

## 4. Layer order

```
  Lesson overlay      (browser source, transparent)
  Camera              (your webcam or capture card)
  Room / backdrop     (optional video or still)
```

With preset A or C, the left 35% of the overlay is deliberately empty — that is your
camera zone. Position the camera source under it and crop to taste. The rounded frame,
vignette and lower third are drawn by the overlay on top.

## 5. One layout per scene

Build a scene per shot and change only the URL:

| Scene | URL tail |
| --- | --- |
| Talking head | `?lesson=unit-rate&preset=C&bg=transparent` |
| Full board | `?lesson=unit-rate&preset=B&bg=studio` |
| Whiteboard | `?lesson=unit-rate&preset=H&bg=studio` |
| Vertical clip | `?lesson=unit-rate&preset=F&aspect=9x16&bg=transparent` |

Because all scenes read the same lesson id, switching scenes never loses your place.

## 6. Switching lessons

Three ways, in order of convenience:

- **Control panel** — pick a lesson from the dropdown; every open overlay updates.
- **Edit the URL** — change `?lesson=` and refresh the source.
- **Multiple sources** — one browser source per lesson, toggle visibility.

## 7. Refresh behaviour

The overlay saves its state as you go. A refreshed browser source comes back on the
same lesson, preset and step. To force a clean start, add `&step=0` to the URL, or press
**Reset lesson** in the control panel.

Use **Reload overlays** in the control panel to refresh every open source at once after
editing a lesson JSON file.

## 8. Recording checklist

- Set the OBS output to the same resolution as the canvas (no downscale) for crisp math.
- 60 fps if you use the reveal animations; 30 fps is fine with `&anim=0`.
- Do a colour check: the transparent overlay assumes a dark room. On a bright set,
  switch to `bg=studio` and key your camera into the presenter zone instead.

## 9. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Black box instead of transparency | The URL is missing `bg=transparent`. |
| Math shows as raw `\frac{}{}` | KaTeX could not load; the fallback renderer handles fractions, powers and roots. Check the network, or keep the fallback — it is sharp at 4K. |
| Fonts look generic | Google Fonts is blocked. Drop the font files into `assets/` and point `--font-*` in `tokens.css` at local `@font-face` rules. |
| Control panel does not move the overlay | Serve both pages from the same origin, or drive the overlay window opened by **Open overlay window** in the panel. |
| Layout overflows | You changed the browser source size without changing `aspect`. Match them. |
