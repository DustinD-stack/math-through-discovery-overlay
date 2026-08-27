/* ============================================================
   Control panel <-> overlay messaging
   Transport priority:
     1. WebSocket        — reliable for OBS Browser Source and LAN clients.
     2. BroadcastChannel — same-origin browser tabs/windows.
     3. postMessage      — iframe / popped-out windows.
     4. localStorage     — fallback for ordinary browser tabs.

   The local WebSocket server also remembers the newest `state`
   message so an OBS Browser Source can reconnect/reload and catch up.
   ============================================================ */

const CHANNEL = 'mtd-overlay';
const LS_KEY = 'mtd:message';

export function createBus({ role = 'peer' } = {}) {
  const listeners = new Set();
  const seen = new Set();
  const targets = new Set();
  let bc = null;
  let ws = null;
  let wsTimer = null;
  let closed = false;
  let wsConnected = false;

  try { bc = new BroadcastChannel(CHANNEL); } catch (_) { bc = null; }

  const deliver = (msg) => {
    if (!msg || msg.__mtd !== CHANNEL) return;
    if (msg.id && seen.has(msg.id)) return;
    if (msg.id) {
      seen.add(msg.id);
      if (seen.size > 800) seen.clear();
    }
    listeners.forEach((fn) => fn(msg));
  };

  if (bc) bc.onmessage = (e) => deliver(e.data);

  window.addEventListener('message', (e) => {
    if (e.data && e.data.__mtd === CHANNEL) {
      if (e.source && e.source !== window) targets.add(e.source);
      deliver(e.data);
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key !== LS_KEY || !e.newValue) return;
    try { deliver(JSON.parse(e.newValue)); } catch (_) {}
  });

  function wsURL() {
    if (!/^https?:$/.test(window.location.protocol)) return null;
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/ws`;
  }

  function connectWebSocket() {
    const url = wsURL();
    if (!url || closed) return;

    try { ws = new WebSocket(url); } catch (_) { scheduleReconnect(); return; }

    ws.addEventListener('open', () => {
      wsConnected = true;
      if (wsTimer) clearTimeout(wsTimer);
      wsTimer = null;
      // Announce ourselves so the controller can push its latest state.
      sendWS(makeMessage('hello', { role, transport: 'websocket' }));
    });

    ws.addEventListener('message', (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch (_) { return; }
      if (msg && msg.__mtd === CHANNEL) deliver(msg);
    });

    ws.addEventListener('close', () => {
      wsConnected = false;
      scheduleReconnect();
    });

    ws.addEventListener('error', () => {
      try { ws.close(); } catch (_) {}
    });
  }

  function scheduleReconnect() {
    if (closed || wsTimer) return;
    wsTimer = setTimeout(() => {
      wsTimer = null;
      connectWebSocket();
    }, 1200);
  }

  function makeMessage(type, payload = {}) {
    return {
      __mtd: CHANNEL,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      from: role,
      type,
      payload,
    };
  }

  function sendWS(msg) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify(msg)); return true; } catch (_) {}
    }
    return false;
  }

  function send(type, payload = {}) {
    const msg = makeMessage(type, payload);
    seen.add(msg.id);

    // Reliable OBS/LAN transport first.
    sendWS(msg);

    // Browser-local fallbacks are intentionally retained.
    try { bc && bc.postMessage(msg); } catch (_) {}
    for (const t of targets) {
      try { t.postMessage(msg, '*'); }
      catch (_) { targets.delete(t); }
    }
    for (const w of [window.parent, window.opener]) {
      if (w && w !== window) {
        try { w.postMessage(msg, '*'); } catch (_) {}
      }
    }
    try { localStorage.setItem(LS_KEY, JSON.stringify(msg)); } catch (_) {}
    return msg;
  }

  connectWebSocket();

  return {
    send,
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    addTarget(win) { if (win) targets.add(win); },
    removeTarget(win) { targets.delete(win); },
    hasChannel: !!bc,
    get wsConnected() { return wsConnected; },
    close() {
      closed = true;
      if (wsTimer) clearTimeout(wsTimer);
      try { ws && ws.close(); } catch (_) {}
      try { bc && bc.close(); } catch (_) {}
    },
  };
}

/** Snapshot persistence for regular browsers. OBS primarily receives
    its recovered state from the WebSocket server. */
export const snapshot = {
  save(state) { try { localStorage.setItem('mtd:state', JSON.stringify(state)); } catch (_) {} },
  load() { try { return JSON.parse(localStorage.getItem('mtd:state') || 'null'); } catch (_) { return null; } },
  clear() { try { localStorage.removeItem('mtd:state'); } catch (_) {} },
};
