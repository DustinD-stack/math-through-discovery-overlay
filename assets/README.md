# Assets

Optional drop-in files. The kit renders fully without any of them.

- `icons/` — SVG marks used by components. `mtd-logo.svg` is the wordmark for
  thumbnails and end cards; the step icons are available if you want to replace the
  numbered circles in the discovery stepper.
- `backgrounds/` — still images for the background layer. To use one, point
  `.bg-studio .layer-bg` in `src/styles/base.css` at the file.
- `placeholders/` — the camera-zone silhouette used in preview mode only. It is never
  visible in transparent OBS mode.

## Going fully offline

To cut the CDN dependencies, put the font files and `katex.min.css` / `katex.min.js`
in this folder and swap the `<head>` links in `overlay.html`, `control.html` and
`index.html` for local paths. Without them the kit still runs — fonts fall back to
system faces and math falls back to the built-in renderer.
