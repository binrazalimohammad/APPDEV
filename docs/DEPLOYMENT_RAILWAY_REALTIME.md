# Deploy realtime notifications on Railway

Deploy the Socket.IO service as a **second Railway service** alongside the Symfony API (`casaclick`).

## Overview

```
┌─────────────────────┐     POST /broadcast      ┌──────────────────────────┐
│  Symfony (casaclick)│ ───────────────────────► │  realtime-notification   │
│  web-production-…   │     X-WS-Secret          │  (Socket.IO + FCM)       │
└─────────────────────┘                        └────────────┬─────────────┘
         ▲                                                    │
         │ REST                                               │ wss order_updated
         │                                                    ▼
┌────────┴────────────┐                              ┌─────────────────┐
│  React Native app   │ ◄──────────────────────────│  Mobile clients │
└─────────────────────┘                              └─────────────────┘
```

## Part 1 — Deploy the realtime service

1. Open your **BinRazali** GitHub repo in Railway (same repo as the mobile project).
2. **New** → **Service** → connect the repo.
3. **Settings** → **Root Directory**: `services/realtime-notification`
4. Railway reads `services/realtime-notification/railway.toml` automatically.
5. **Networking** → generate a **public domain**, e.g.  
   `https://realtime-production-xxxx.up.railway.app`
6. **Variables** (realtime service):

   | Variable | Example |
   |----------|---------|
   | `SYMFONY_API_ORIGIN` | `https://web-production-6bdab.up.railway.app` |
   | `WS_INTERNAL_SECRET` | Long random string (copy for Symfony) |
   | `FIREBASE_SERVICE_ACCOUNT_JSON` | *(optional)* Full Firebase service account JSON one line |

   Railway sets `PORT` automatically.

7. Deploy and confirm health:
   ```text
   GET https://YOUR-REALTIME-DOMAIN/health
   → {"ok":true,"clients":0,"fcm":true|false}
   ```

## Part 2 — Wire Symfony (casaclick web service)

On the **existing** Symfony Railway service, add:

| Variable | Value |
|----------|--------|
| `WS_BROADCAST_URL` | `https://YOUR-REALTIME-DOMAIN` (no trailing slash) |
| `WS_INTERNAL_SECRET` | Same secret as realtime service |

Redeploy Symfony after saving variables.

Ensure migration `Version20260528120000` ( `user.fcm_token` ) has run:

```bash
railway run php bin/console doctrine:migrations:migrate --no-interaction
```

## Part 3 — Point the mobile app

In `src/app/api/config.ts`:

```typescript
export const PRODUCTION_REALTIME_ORIGIN =
  'https://realtime-production-xxxx.up.railway.app'; // your realtime domain
```

Rules:

- Must be **HTTPS** (app uses `wss://`).
- Must **not** equal `PRODUCTION_API_ORIGIN` unless Socket.IO is actually served on that host.
- Leave empty to disable production WebSocket (8s polling fallback only).

Rebuild or reload Metro after changing config.

## Part 4 — FCM on Railway (optional)

1. Firebase Console → Project settings → Service accounts → **Generate new private key**.
2. Minify JSON to one line.
3. Paste into realtime service variable `FIREBASE_SERVICE_ACCOUNT_JSON`.
4. Mobile app must have `google-services.json` and register token on login.

## Part 5 — Smoke test

1. Install app with `USE_PRODUCTION_API = true` and `PRODUCTION_REALTIME_ORIGIN` set.
2. Log in as tenant on a physical device (FCM needs real device).
3. On website admin, change a booking status for that tenant.
4. **Foreground:** booking status + alert within ~1s.
5. **Background:** system notification with order title/message.

## Helper script (optional)

After `railway link` on the realtime service:

```powershell
npm run railway:realtime-env
```

Prints suggested env vars (does not push secrets automatically).

## Costs

- Second Railway service (small Node process).
- FCM is free within Firebase quotas.

## Related docs

- [ORDER_NOTIFICATIONS.md](./ORDER_NOTIFICATIONS.md) — full runbook
- [WEBSOCKET.md](./WEBSOCKET.md) — local dev
- [DEPLOYMENT_RAILWAY.md](./DEPLOYMENT_RAILWAY.md) — Symfony API deploy
- [FCM_PUSH.md](./FCM_PUSH.md) — Firebase setup
