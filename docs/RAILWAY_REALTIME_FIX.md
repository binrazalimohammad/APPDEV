# Fix: mobile actions not showing on the website (Railway)

## Root cause

Railway deploys **`casaclick`** on GitHub. That repo was **missing** features that exist in your local **`websitedev`** folder:

| Missing on Railway (`casaclick`) | Effect |
|----------------------------------|--------|
| `POST /api/mobile/activity` | Mobile login / screen views never logged |
| `MOBILE_APPLY` on apply | Apply actions invisible in Activity Logs |
| `GET /api/mobile/sync/revision` | Mobile + web revision sync incomplete |
| `GET /sync/feed` + `live-sync.js` | Website pages do not auto-refresh |
| Activity Logs `/admin/logs/feed` | Admin logs page does not live-update |
| **Manage Bookings** admin page | New mobile applications hard to find |

The mobile app **was** calling Railway, but the **server** did not record or expose live updates.

## Fix (one-time)

### 1. Sync backend from `websitedev` → `casaclick`

In PowerShell, from the BinRazali folder:

```powershell
cd "C:\Users\Maligalig\APP DEV\BinRazali"
powershell -ExecutionPolicy Bypass -File scripts\sync-railway-backend.ps1
```

### 2. Migrate DB on Railway (or locally against Railway `DATABASE_URL`)

```powershell
cd "C:\Users\Maligalig\APP DEV\casaclick"
php bin/console doctrine:migrations:migrate --no-interaction
```

### 3. Rebuild frontend assets (live-sync script)

```powershell
cd "C:\Users\Maligalig\APP DEV\casaclick"
npm run build
# or: npm run dev  (if using encore dev)
```

### 4. Push to GitHub (triggers Railway redeploy)

```powershell
cd "C:\Users\Maligalig\APP DEV\casaclick"
git add -A
git commit -m "feat: mobile activity logs and live sync with website"
git push origin main
```

Wait for Railway deploy to finish (~2–5 min).

### 5. Reload the mobile app

```powershell
cd "C:\Users\Maligalig\APP DEV\BinRazali"
npm start
npm run android
```

Confirm `USE_PRODUCTION_API = true` in `src/app/api/config.ts`.

## Verify on the website

1. Log in as **admin** on `https://web-production-6bdab.up.railway.app`
2. Open **Admin → Activity Logs** — subtitle should say **updates every 8s**
3. On the phone: sign in as **tenant**, open **Listings**, **Submit application**
4. Within ~8 seconds: new row `MOBILE_APPLY` (and `MOBILE_LOGIN` / `MOBILE_VIEW`) appears
5. Open **Admin → Manage Bookings** — new pending booking appears; page auto-reloads when data changes (~5s on most pages)

## Where to look

| Mobile action | Website |
|---------------|---------|
| Apply to listing | Admin → **Manage Bookings** |
| Login / browse screens | Admin → **Activity Logs** |
| Payments | Admin bookings + tenant **Payments** |

## Still empty?

- Railway **MySQL** must have listings (run fixtures once on production DB).
- Mobile user must be **tenant** (`ROLE_TENANT`) to apply.
- Use a user that exists on **Railway DB** (register on mobile or load fixtures).
