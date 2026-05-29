# Realtime notifications — production checklist

## Railway **web** (casaclick)

Variables → add or update:

```env
WS_BROADCAST_URL=https://appdev-production-1e32.up.railway.app
WS_INTERNAL_SECRET=<same as APPDEV>
```

Redeploy **web** after saving.

Verify:

```text
GET https://web-production-6bdab.up.railway.app/api/mobile/realtime-config
→ { "data": { "realtimeOrigin": "https://appdev-production-1e32.up.railway.app" } }
```

## Railway **APPDEV** (realtime)

```env
SYMFONY_API_ORIGIN=https://web-production-6bdab.up.railway.app
WS_INTERNAL_SECRET=<same as web>
FIREBASE_SERVICE_ACCOUNT_JSON=<optional one-line JSON>
```

Verify: `GET https://appdev-production-1e32.up.railway.app/health` → `"ok": true`

## Mobile app

1. `PRODUCTION_REALTIME_ORIGIN` in `src/app/api/config.ts` (or `npm run finish:realtime`)
2. `npm run android:release`
3. Install APK; tenant must log in (same account as booking)

## Test

1. Phone: tenant logged in, app open or background
2. Website admin: approve booking on Manage Bookings
3. Within ~8s: bell updates (polling); ~1s if WebSocket + broadcast wired

## Helper

```powershell
# Writes .local-secrets\railway-web-WS-vars.env (gitignored) for paste into Railway web
$env:WS_INTERNAL_SECRET = 'your-secret'
npm run finish:realtime -- -RealtimeUrl "https://appdev-production-1e32.up.railway.app"
```
