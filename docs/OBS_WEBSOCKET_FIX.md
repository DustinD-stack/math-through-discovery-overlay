# OBS WebSocket Live-Control Fix

The overlay now uses a local WebSocket connection as its primary transport. This avoids OBS Browser Source isolation problems with `BroadcastChannel`, `postMessage`, and `localStorage`.

## Install once

```powershell
npm install
```

## Start the kit

```powershell
npm start
```

Expected output includes:

```text
Math Through Discovery running at http://localhost:3000
Control: http://localhost:3000/control.html
Overlay: http://localhost:3000/overlay.html
WebSocket: ws://localhost:3000/ws
```

## Browser controller

Open:

```text
http://localhost:3000/control.html
```

## OBS Browser Source

Use:

```text
http://localhost:3000/overlay.html
```

Do not use a `file:///` URL.

Recommended browser source size:

- Width: 1920
- Height: 1080

Reload the Browser Source after starting the new server.

## Test

Click these buttons in the control page:

1. SEE
2. BREAK
3. BUILD
4. TRANSFORM
5. CHECK

The OBS Browser Source should update immediately.

Then reload the OBS Browser Source. It should recover the latest state automatically because the WebSocket server retains the most recent `state` message.

## Architecture

```text
Control page
    │
    │ WebSocket
    ▼
Local Node server
    │
    ├── OBS Browser Source
    ├── Chrome preview
    └── future LAN controller
```

Browser-local fallbacks remain available:

```text
WebSocket → BroadcastChannel → postMessage → localStorage
```
