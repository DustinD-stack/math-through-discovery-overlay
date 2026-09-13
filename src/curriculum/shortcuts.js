/* ============================================================
   Recording-friendly keyboard shortcuts (P7)

   Pure mapping only — no DOM, no bus. src/controllers/control-app.js's
   keydown listener calls `resolveFr1Shortcut()` and then dispatches
   through the exact same `sendFr1Stage()` a button press uses (never a
   separate shortcut-only code path — see docs/TEACHING_WORKFLOW.md
   "Keyboard shortcuts" / the P7 architecture guard). Being pure, this
   is directly unit-testable without simulating real keyboard events.
   ============================================================ */

const TEACHING_KEYS = ['see', 'break', 'build', 'transform', 'check'];

/**
 * @param key the raw `KeyboardEvent.key` value
 * @param status the overlay's last-broadcast fr1-status payload
 *   (src/app/overlay-app.js `buildFr1Status`), or `{active:false}`
 * @returns an fr1Stage() action string, or null if this key has no
 *   meaning in the current context (caller should fall back to legacy
 *   shortcut handling, or do nothing).
 */
export function resolveFr1Shortcut(key, status) {
  if (!status || !status.active) return null;

  if (key === 'ArrowRight' || key === ' ') return 'next';
  if (key === 'ArrowLeft') return 'previous';
  if (key === 'Home') return 'reset';
  if (key && key.toLowerCase() === 'r') return 'reveal';

  if (status.kind === 'teaching' && Array.isArray(status.order)) {
    if (/^[1-5]$/.test(key)) {
      const stageId = TEACHING_KEYS[Number(key) - 1];
      return status.order.includes(stageId) ? `goto:${stageId}` : null;
    }
    if (key === '0' && status.order.includes('setup')) return 'goto:setup';
  }

  // Escape is deliberately unmapped: it must never exit Foundation
  // Release 1 mode or discard lesson state mid-recording.
  return null;
}

/** True when keyboard shortcuts must be suppressed — typing focus. */
export function isTypingTarget(target) {
  if (!target) return false;
  if (typeof target.matches === 'function' && target.matches('input, textarea, select')) return true;
  return !!target.isContentEditable;
}
