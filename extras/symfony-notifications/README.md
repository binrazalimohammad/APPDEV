# Symfony notifications (reference → casaclick)

Copy these patterns into the live API at `../casaclick` (sibling folder). The production implementation lives there.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/mobile/notifications` | Notification history |
| POST | `/api/mobile/push-token` | Register FCM device token |
| DELETE | `/api/mobile/push-token` | Clear token on logout |

## Realtime flow

1. Admin changes booking status in `/admin/bookings`.
2. `StatusChangeNotificationSubscriber` calls `NotificationService::notifyOrderStatusChange`.
3. Row saved in `notification` table.
4. `RealtimeBroadcastService` POSTs to Socket.IO `POST /broadcast` with `event: order_updated`.
5. Mobile app (`notificationWebSocket.ts`) updates UI + optional FCM.

## Environment (casaclick `.env`)

```env
WS_BROADCAST_URL=http://127.0.0.1:8082
WS_INTERNAL_SECRET=casaclick-ws-dev-secret
```

Run `php bin/console doctrine:migrations:migrate` after adding `fcm_token` migration.
