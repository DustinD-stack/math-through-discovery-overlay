import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const CHANNEL = 'mtd-overlay';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function safeFilePath(urlPath) {
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  const rel = clean === '/' ? '/index.html' : clean;
  const resolved = path.resolve(ROOT, `.${rel}`);
  if (!resolved.startsWith(ROOT + path.sep) && resolved !== ROOT) return null;
  return resolved;
}

const server = http.createServer((req, res) => {
  const filePath = safeFilePath(req.url);
  if (!filePath) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(filePath, (statErr, stat) => {
    if (statErr) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }

    const target = stat.isDirectory() ? path.join(filePath, 'index.html') : filePath;
    fs.readFile(target, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
        return;
      }
      const ext = path.extname(target).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(data);
    });
  });
});

const wss = new WebSocketServer({ server, path: '/ws' });
let latestStateMessage = null;

function isMtdMessage(msg) {
  return msg && msg.__mtd === CHANNEL && typeof msg.type === 'string';
}

function broadcast(msg, except = null) {
  const encoded = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client === except || client.readyState !== WebSocket.OPEN) continue;
    client.send(encoded);
  }
}

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({
    __mtd: CHANNEL,
    id: `server-${Date.now()}`,
    from: 'server',
    type: 'ws-status',
    payload: { connected: true },
  }));

  // New OBS/browser clients immediately recover the most recent controller state.
  if (latestStateMessage) socket.send(JSON.stringify(latestStateMessage));

  socket.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch (_) { return; }
    if (!isMtdMessage(msg)) return;

    if (msg.type === 'state') latestStateMessage = msg;
    broadcast(msg, socket);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Math Through Discovery running at http://localhost:${PORT}`);
  console.log(`Control: http://localhost:${PORT}/control.html`);
  console.log(`Overlay: http://localhost:${PORT}/overlay.html`);
  console.log(`WebSocket: ws://localhost:${PORT}/ws`);
});
