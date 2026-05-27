# WebSocket notifications (instant mobile bell updates)

Local dev uses a **Node WebSocket server** alongside Symfony. When a notification is saved, Symfony POSTs to the WS server, which pushes to the logged-in mobile client instantly.

## Architecture

```
Admin updates status (Symfony)
    → NotificationService saves to MySQL
    → POST http://127.0.0.1:8082/broadcast
    → WebSocket push to mobile app
    → Bell badge updates immediately
```

Polling (`/api/mobile/sync/revision` every 8s) remains as **fallback** when WebSocket is disconnected.

## Start (local dev)

1. Set `USE_PRODUCTION_API = false` in `src/app/api/config.ts`

2. Terminal 1 — Symfony + WebSocket:
   ```powershell
   cd BinRazali
   npm run dev:all
   ```
   Or separately: `npm run server` and `npm run ws:server`

3. Terminal 2 — Metro + app:
   ```powershell
   npm run android:reverse   # forwards 8081, 8000, 8082
   npm start
   npm run android
   ```

4. **websitedev** `.env` (or `.env.local`):
   ```env
   WS_BROADCAST_URL=http://127.0.0.1:8082
   WS_INTERNAL_SECRET=casaclick-ws-dev-secret
   ```

## Ports

| Service | Port | Path |
|---------|------|------|
| Symfony API | 8000 | `/api/mobile/...` |
| WebSocket | 8082 | `/notifications` |
| Metro | 8081 | — |

## Production (Railway)

WebSocket is **disabled** when `USE_PRODUCTION_API = true` (no WS server on Railway yet). The app falls back to 8-second polling.

To enable on Railway later: deploy the WS server as a second service and set `WS_BROADCAST_URL` + expose `wss://` to the app.

## Verify

```powershell
curl http://127.0.0.1:8082/health
```

Sign in on mobile → admin changes booking status → bell updates within ~1 second (not 8s).
