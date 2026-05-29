# Socket.IO notifications (instant mobile bell updates)

Local dev uses a **Node Socket.IO server** alongside Symfony. When a notification is saved, Symfony POSTs to the server, which pushes to the logged-in mobile client instantly.

## Architecture

```
Admin updates booking/order status (Symfony casaclick)
    → StatusChangeNotificationSubscriber
    → NotificationService saves row + POST http://127.0.0.1:8082/broadcast
    → Socket.IO emits notification + order_updated
    → Mobile: bell, booking list/detail UI, optional FCM if backgrounded
```

### Events

| Event | When | Payload |
|-------|------|---------|
| `notification` | Any saved alert | `{ type, data, event }` |
| `order_updated` | Application status change | `order_id`, `customer_id`, `status`, `message`, `timestamp` |

Polling (`/api/mobile/sync/revision` every 8s) remains as **fallback** when WebSocket is disconnected.

## Start (local dev)

1. Set `USE_PRODUCTION_API = false` in `src/app/api/config.ts`

2. Terminal 1 — Symfony + WebSocket:
   ```powershell
   cd BinRazali
   npm run dev:all
   ```
   Or separately: `npm run server` and `npm run io:server`

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
| Socket.IO | 8082 | `/notifications` |
| Metro | 8081 | — |

## Production (Railway)

1. Deploy **`services/realtime-notification`** as a second Railway service — see **[DEPLOYMENT_RAILWAY_REALTIME.md](./DEPLOYMENT_RAILWAY_REALTIME.md)**.
2. Set Symfony `WS_BROADCAST_URL` + `WS_INTERNAL_SECRET`.
3. Set `PRODUCTION_REALTIME_ORIGIN` in `src/app/api/config.ts` to the realtime HTTPS domain.

Until `PRODUCTION_REALTIME_ORIGIN` is set (and different from the API origin), the app uses **8-second polling** only.

## Verify

```powershell
curl http://127.0.0.1:8082/health
```

Sign in on mobile → admin changes booking status → bell updates within ~1 second (not 8s).
