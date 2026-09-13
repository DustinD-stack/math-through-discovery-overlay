/* ============================================================
   Operator-facing connection status (P8)

   Pure — no DOM, no bus. src/controllers/control-app.js tracks two
   raw facts (its own WebSocket open/closed, and the timestamp of the
   last message actually received from a non-control peer) and asks
   this module what to tell the operator. Never exposes WebSocket/JSON
   terminology to the operator (docs/PRODUCTION_GUIDE.md "Reconnect
   behavior").
   ============================================================ */

export const CONNECTION_STATES = ['connected', 'connecting', 'offline'];

/**
 * @param serverConnected this client's own WebSocket to the local server
 * @param lastPeerSeenAt   timestamp of the last message received from a
 *   non-control peer (an overlay), or 0/falsy if none yet this session
 * @param now              injectable for deterministic testing
 * @param timeoutMs         how long a peer may stay silent before we stop
 *   treating it as connected (a live overlay confirms itself every ping)
 */
export function resolveConnectionStatus({ serverConnected, lastPeerSeenAt = 0, now = Date.now(), timeoutMs = 6000 } = {}) {
  if (!serverConnected) return 'offline';
  if (!lastPeerSeenAt) return 'connecting';
  if (now - lastPeerSeenAt > timeoutMs) return 'offline';
  return 'connected';
}

const LABELS = {
  connected: 'Overlay Connected',
  connecting: 'Connecting…',
  offline: 'Overlay Offline',
};

export function connectionStatusLabel(status) {
  return LABELS[status] || LABELS.offline;
}
