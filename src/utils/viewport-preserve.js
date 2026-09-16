/* ============================================================
   Viewport preservation (post-V1 Control fix)

   Root cause (see docs/lesson-authoring or the fix's commit message for
   the full reproduction): src/controllers/control-app.js's `render()`
   fully clears and rebuilds the entire `.cp__col` controls column on
   every state update (`clear(controls)` + re-`appendChild`). control.html
   sets `body.control { overflow: auto }` while `html, body { height:
   100% }` from base.css keeps `<html>` itself at `overflow: hidden`
   (base.css is shared with the OBS overlay/preview stage, which must
   never scroll) — so `document.body`, not `window`/`<html>`, is the
   real scrolling element on this page.

   Destroying and recreating that whole column removes whatever element
   currently held focus. Empirically (real, non-headless-safe Chromium
   clicks — synthetic `element.click()` calls do not reproduce this),
   whenever the rebuild happens as a result of an event arriving
   asynchronously (a WebSocket `fr1-status` message, i.e. every FR1
   teaching action: Next/Previous/Reveal/Reset/representation/Start
   Lesson) rather than synchronously inside the same click's call stack,
   the browser subsequently adjusts `document.body.scrollTop` on its own
   (consistent with Chromium's scroll-anchoring re-targeting after the
   old focused/anchor node disappears) — never to a fixed value, just
   away from wherever the operator actually was. Purely-synchronous
   local re-renders (the Unit/Experience selects) do not exhibit this,
   which is why the bug reads as "some buttons randomly bounce the page
   while others don't."

   Rather than rewrite control-app.js's render() into an incremental/
   diffed update (a much larger change to a still-evolving Control
   panel), this file provides the small, reusable, non-flickering fix
   the milestone calls for: snapshot the real scroll container's
   position and the focused element's identity, run the render, then
   restore both — including a second restore on the next animation
   frame to override any post-hoc browser scroll adjustment that lands
   after this synchronous function returns but before the next paint.
   ============================================================ */

/**
 * @param scrollContainer the actual scrolling element (see header comment
 *   for why this is `document.body` on control.html, not `window`)
 * @param renderFn the render/update function to run; may fully replace
 *   descendants of `scrollContainer`
 */
export function preserveViewport(scrollContainer, renderFn) {
  const scrollTop = scrollContainer.scrollTop;
  const active = document.activeElement;
  const activeId = active && active.id ? active.id : null;
  const selectionStart = active && 'selectionStart' in active ? active.selectionStart : null;
  const selectionEnd = active && 'selectionEnd' in active ? active.selectionEnd : null;

  renderFn();

  scrollContainer.scrollTop = scrollTop;
  restoreFocus(activeId, selectionStart, selectionEnd);

  // Scroll-anchoring-style adjustments from a fully-replaced subtree can
  // land on the next layout pass, after this function has already
  // returned — reassert just before that paint so nothing is visibly
  // reverted (this still runs before the frame is shown, so there is no
  // visible flicker).
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => { scrollContainer.scrollTop = scrollTop; });
  }
}

function restoreFocus(activeId, selectionStart, selectionEnd) {
  if (!activeId) return;
  const restored = document.getElementById(activeId);
  if (!restored || typeof restored.focus !== 'function') return;

  // `preventScroll` is essential here — a plain .focus() call is itself
  // allowed to scroll the element into view, which would reintroduce
  // exactly the jump this function exists to prevent.
  restored.focus({ preventScroll: true });

  if (selectionStart != null && selectionEnd != null && typeof restored.setSelectionRange === 'function') {
    try { restored.setSelectionRange(selectionStart, selectionEnd); } catch (_) { /* not a text-selectable control */ }
  }
}
