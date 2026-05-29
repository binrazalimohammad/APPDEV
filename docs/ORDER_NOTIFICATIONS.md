# Order status notifications — runbook

Real-time order (booking) status updates for the CasaClick mobile app and Symfony API.

## What it does

| Layer | Behavior |
|-------|----------|
| **Landlord** | Approves/rejects at website **Applications** (`/application`) — admin view-only at `/admin/bookings` |
| **Symfony** | Saves `notification` row + POSTs to Socket.IO |
| **Socket.IO** | Emits `order_updated` to the tenant’s phone |
| **Mobile** | Updates booking list/detail + bell; Alert in foreground |
| **FCM** | Push when app is backgrounded/closed (optional) |

## Status labels (admin → customer)

| Admin value | Customer label |
|-------------|----------------|
| `pending` | Pending |
| `accepted` / `approved` | Accepted |
| `processing` | Processing |
| `ready_for_pickup` | Ready for Pickup |
| `completed` | Completed |
| `cancelled` | Cancelled |
| `rejected` | Rejected |
| `refunded` | Refund |

Legacy keys (`approved`, etc.) remain valid so existing data is not broken.

## `order_updated` payload

```json
{
  "order_id": 42,
  "customer_id": 7,
  "status": "processing",
  "message": "Your order for Unit A is now: Processing",
  "timestamp": "2026-05-28T12:00:00+00:00",
  "statusLabel": "Processing"
}
```

## Local development

1. `USE_PRODUCTION_API = false` in `src/app/api/config.ts`
2. `casaclick/.env.local`:
   ```env
   WS_BROADCAST_URL=http://127.0.0.1:8082
   WS_INTERNAL_SECRET=casaclick-ws-dev-secret
   ```
3. Migrate casaclick: `php bin/console doctrine:migrations:migrate`
4. From BinRazali:
   ```powershell
   npm run dev:all
   npm run android:reverse
   npm start
   npm run android
   ```
5. Sign in on mobile → **landlord** approves on website Applications → tenant UI updates within ~1s.

## Production (Railway)

See **[DEPLOYMENT_RAILWAY_REALTIME.md](./DEPLOYMENT_RAILWAY_REALTIME.md)**.

After deploy, set `PRODUCTION_REALTIME_ORIGIN` in `src/app/api/config.ts` to your realtime service HTTPS URL.

## Key files

| Area | Path |
|------|------|
| Symfony broadcast | `casaclick/src/Service/RealtimeBroadcastService.php` |
| Status subscriber | `casaclick/src/EventSubscriber/StatusChangeNotificationSubscriber.php` |
| FCM token API | `casaclick/src/Controller/Api/Mobile/PushTokenController.php` |
| Socket.IO server | `scripts/socketio-notification-server.js` |
| Railway service | `services/realtime-notification/` |
| Mobile WS client | `src/services/notificationWebSocket.ts` |
| Order UI hook | `src/hooks/useOrderStatusListener.ts` |

## Website auto-refresh

All logged-in Twig pages (via `base.html.twig`) poll `GET /sync/feed` every **~5 seconds**. When bookings, listings, payments, or notifications change (mobile app or another browser), the page **reloads automatically** — no manual refresh.

- Pauses while you are typing in a form field.
- Admin **Activity Logs** uses its own incremental feed (full-page reload disabled there).

## Verify

```powershell
# Socket.IO health (local)
curl http://127.0.0.1:8082/health

# Symfony notifications API (JWT required)
curl -H "Authorization: Bearer <token>" https://YOUR-API/api/mobile/notifications
```

## Troubleshooting

| Symptom | Check |
|---------|--------|
| No instant update | `WS_BROADCAST_URL` on Symfony; `io:server` or Railway realtime running |
| Bell updates, bookings don’t | Open Applications screen; `useOrderStatusListener` only patches visible list |
| Works on Wi‑Fi, not USB | `npm run android:reverse`; `USE_PRODUCTION_API = false` for local |
| Production only polls | Set `PRODUCTION_REALTIME_ORIGIN` (must differ from API origin) |
| No push when closed | `google-services.json`, `FIREBASE_SERVICE_ACCOUNT_JSON` on realtime service, token registered |

## Security

- Broadcast endpoint requires header `X-WS-Secret` (same value on Symfony + Socket.IO).
- Mobile connects with JWT; server validates via `/api/mobile/me`.
- Do not commit Firebase service account JSON; use Railway variables.
