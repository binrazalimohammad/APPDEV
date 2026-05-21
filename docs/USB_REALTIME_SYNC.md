# USB debugging + real-time sync (mobile ↔ website)

When you develop with a **USB-connected phone**, mobile actions and the **website use the same database** on your PC. Nothing is uploaded to the cloud — both talk to `npm run casaclick:serve` on port **8000**.

## How “real-time” works

There is no WebSocket yet. Both sides **poll every 8 seconds** and refresh when data changes:

| Where | What updates |
|-------|----------------|
| **Mobile** Dashboard | `GET /api/mobile/sync/revision` → reloads bookings, payments, listings |
| **Mobile** Browse listings | `GET /api/mobile/listings/revision` |
| **Mobile** My bookings | `GET /api/mobile/applications/revision` |
| **Website** Customer dashboard | `GET /customer/dashboard/feed` → auto reload |
| **Website** Admin → Manage Bookings | `GET /admin/bookings/feed` → auto reload |
| **Website** Admin → Activity Logs | `GET /admin/logs/feed` (already live) |

Typical delay: **up to ~8 seconds** after an action on the phone.

## USB setup (your choice)

### Option A — USB + adb reverse (simple)

In `src/app/api/config.ts`:

```ts
export const ANDROID_CONNECT_MODE = 'usb-adb';
```

```powershell
npm run casaclick:serve
npm run android:reverse
npm run android
```

Phone API URL: `http://127.0.0.1:8000`

### Option B — USB + PC IP (ipconfig)

```ts
export const ANDROID_CONNECT_MODE = 'usb-lan';
```

```powershell
npm run sync:pc-ip
npm run casaclick:serve
npm run android:reverse   # Metro only
npm run android
```

Phone API URL: `http://<YOUR_PC_IP>:8000` (e.g. `192.168.137.200`)

## Prove real-time sync

1. **PC:** `npm run casaclick:serve`
2. **Browser:** open `http://127.0.0.1:8000/admin/logs` or `/customer/dashboard` (sign in as tenant or admin)
3. **Phone:** sign in as `tenant@example.com` / `tenant2222`
4. On the phone: open **Listings** → apply to a property, or open **Profile** (activity log)
5. On the website: within ~8s you should see a new booking row or activity log line (page may auto-refresh)

## What syncs both ways

| Action on mobile | Appears on website |
|------------------|-------------------|
| Apply to listing (booking) | Customer dashboard, Admin bookings, Applications |
| Payment submitted | Customer dashboard payments |
| Register / login / logout | Admin Activity Logs |
| Admin approves listing (web) | Mobile Browse listings (~8s) |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Website never updates | Same backend: only `casaclick:serve`, not another project on 8000 |
| Mobile cannot connect | `npm run android:reverse` + correct `ANDROID_CONNECT_MODE` |
| Delay feels long | Normal — 8s poll; pull to refresh on mobile for instant load |

See also: `docs/ANDROID_USB_DEBUG.md`, `docs/CASACLICK_MOBILE_SYNC.md`.
