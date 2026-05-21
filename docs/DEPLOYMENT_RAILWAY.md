# Deploy CasaClick (Symfony API) on Railway

This guide deploys **`websitedev`** (Symfony + MySQL). The **React Native app** stays on your phone/emulator and points to the Railway URL (you do not deploy the mobile app to Railway).

**Time:** ~30–45 minutes the first time.

---

## Overview

| Piece | Where it runs |
|--------|----------------|
| Symfony API + web admin | Railway (one service) |
| MySQL database | Railway (MySQL plugin) |
| BinRazali mobile app | Your PC / phone (APK), calls `https://your-app.up.railway.app` |

---

## Part 1 — Prepare the backend repo

### 1.1 Push `websitedev` to GitHub

Railway deploys from Git. Use **one** of these:

**Option A (recommended):** Separate repo containing only `websitedev`.

**Option B:** Monorepo — in Railway set **Root Directory** to `websitedev` (if `websitedev` lives inside a parent folder on GitHub).

Do **not** commit secrets:

- `websitedev/.env.local`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- JWT `.pem` files (gitignored)

### 1.2 Files already in `websitedev` for Railway

- `railway.toml` — build/start commands
- `Procfile` — fallback start command

---

## Part 2 — Create the Railway project

1. Go to [https://railway.app](https://railway.app) and sign in (GitHub is easiest).
2. **New Project** → **Deploy from GitHub repo** → select your `websitedev` repo.
3. Railway creates a service. Open it → **Settings**:
   - **Root Directory:** leave empty if repo root *is* `websitedev`, else set `websitedev`.
   - **Watch Paths:** optional, e.g. `/websitedev/**`.

---

## Part 3 — Add MySQL

1. In the project canvas: **+ New** → **Database** → **MySQL**.
2. Wait until MySQL is **Active**.
3. Open the **Symfony service** → **Variables** → **Add Reference** (or **Raw**):
   - Add variable **`DATABASE_URL`** and reference the MySQL plugin’s URL.

   Railway often exposes something like:

   ```text
   ${{MySQL.MYSQL_URL}}
   ```

   If you must build it manually:

   ```text
   mysql://${{MySQL.MYSQLUSER}}:${{MySQL.MYSQLPASSWORD}}@${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?serverVersion=8.0&charset=utf8mb4
   ```

4. Click **Deploy** after saving variables.

---

## Part 4 — Environment variables (Symfony service)

In the **websitedev** service → **Variables**, set:

| Variable | Value |
|----------|--------|
| `APP_ENV` | `prod` |
| `APP_DEBUG` | `0` |
| `APP_SECRET` | Long random string (32+ chars) |
| `DATABASE_URL` | Reference to MySQL (above) |
| `DEFAULT_URI` | `https://YOUR-SERVICE.up.railway.app` (your public URL, no trailing slash) |
| `JWT_PASSPHRASE` | Same as local `.env` or generate new |
| `CORS_ALLOW_ORIGIN` | `^https?://(.*\.railway\.app\|localhost\|127\.0\.0\.1)(:[0-9]+)?$` |
| `GOOGLE_OAUTH_CLIENT_ID` | From Google Cloud |
| `GOOGLE_OAUTH_CLIENT_SECRET` | From Google Cloud |
| `GOOGLE_MOBILE_WEB_CLIENT_ID` | Same as `src/config/google.ts` in mobile |
| `PAYMONGO_SECRET_KEY` | Optional; leave empty + `PAYMONGO_DEV_MOCK=1` for demo |
| `PAYMONGO_DEV_MOCK` | `1` for coursework demo without Paymongo |

**JWT keys:** Build runs `lexik:jwt:generate-keypair` (see `railway.toml`). Set `JWT_PASSPHRASE` to match what you use locally, or only use Railway-generated keys (do not mix local and prod tokens).

Optional mailer (skip for demo):

| Variable | Value |
|----------|--------|
| `MAILER_DSN` | Your Brevo/SMTP DSN |
| `MAILER_DEFAULT_EMAIL` | Verified sender |

---

## Part 5 — Deploy and run migrations

1. **Deploy** the service (Railway redeploys on git push or **Deploy** button).
2. Open **Deployments** → latest → **View logs**. You should see:
   - `composer install`
   - `doctrine:migrations:migrate`
   - `Server running on 0.0.0.0:PORT`
3. **Settings** → **Networking** → **Generate Domain** (e.g. `casaclick-api-production.up.railway.app`).
4. Update **`DEFAULT_URI`** to `https://that-domain` and redeploy once.

### 5.1 Smoke test (browser or PC)

```text
https://YOUR-DOMAIN.up.railway.app/api/mobile/health
```

Expect JSON with `"success": true` or similar.

```text
https://YOUR-DOMAIN.up.railway.app/api/login_check
```

POST with Postman:

```json
{ "email": "tenant@example.com", "password": "tenant2222" }
```

(Only works if you loaded fixtures or created that user — see 5.2.)

### 5.2 Load demo data (one-time)

**Deployments** → three dots → **Run command** (or use Railway CLI):

```bash
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console doctrine:fixtures:load --no-interaction
```

Or run fixtures locally against Railway DB (advanced).

---

## Part 6 — Google OAuth on Railway

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → your **Web** OAuth client.
2. **Authorized JavaScript origins:**
   - `https://YOUR-DOMAIN.up.railway.app`
3. **Authorized redirect URIs:**
   - `https://YOUR-DOMAIN.up.railway.app/connect/google/check`
4. Save. Wait 1–2 minutes.

Mobile browser Google sign-in will use this host (no `127.0.0.1` on a physical phone in production).

---

## Part 7 — Point the mobile app at Railway

### 7.1 Set production API URL

Edit `src/app/api/config.ts`:

```ts
export const PRODUCTION_API_ORIGIN = 'https://YOUR-DOMAIN.up.railway.app';
```

(Already wired: release builds use this when `PRODUCTION_API_ORIGIN` is set.)

### 7.2 Connect mode on a real phone

For a **production** APK talking to Railway:

- Use **Wi‑Fi** (phone has internet).
- Set `ANDROID_CONNECT_MODE` to `'wifi'` (or keep `usb-adb` only for local dev).
- Do **not** use `127.0.0.1` for Railway — that only works with `adb reverse` to your PC.

### 7.3 Build / run

```powershell
# Dev still uses local server:
npm run server

# Release APK (uses PRODUCTION_API_ORIGIN when not __DEV__):
npm run android:release
```

Install the release APK, or run debug build after setting the Railway URL and rebuilding.

### 7.4 Verify from the phone

1. Open app → **Continue with email**.
2. Login with a user that exists on **Railway DB** (fixtures or register on production).
3. Browse listings — data comes from Railway MySQL.

---

## Part 8 — Paymongo (optional)

For real payments on Railway:

1. Set `PAYMONGO_SECRET_KEY` in Railway variables.
2. Set `PAYMONGO_DEV_MOCK=0`.
3. In Paymongo dashboard, webhook URL:  
   `https://YOUR-DOMAIN.up.railway.app/api/paymongo/webhook`

---

## Part 9 — Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on `composer` | Ensure **Root Directory** is correct; PHP 8.2+ in Railway |
| 500 on every route | Check logs; `APP_SECRET`, `DATABASE_URL`, run migrations |
| DB connection refused | `DATABASE_URL` must reference MySQL service; redeploy both |
| Login 401 | User not in prod DB — run fixtures or register via app |
| Mobile cannot connect | Use `https://` domain; phone on internet; `PRODUCTION_API_ORIGIN` set |
| Google OAuth error | Add Railway HTTPS redirect URI; `DEFAULT_URI` matches domain |
| JWT invalid | Regenerate keys on Railway or match `JWT_PASSPHRASE` |

**Logs:** Service → **Deployments** → deployment → **View logs**.

**CLI (optional):**

```bash
npm i -g @railway/cli
railway login
railway link
railway logs
railway run php bin/console doctrine:migrations:migrate --no-interaction
```

---

## Part 10 — Demo checklist (instructor)

1. Show Railway dashboard (service + MySQL green).
2. Open `https://YOUR-DOMAIN/api/mobile/health`.
3. Mobile app: login → listing → apply → show admin/web or Railway MySQL.
4. Mention: shared DB, JWT auth, RBAC (`docs/API.md`).

---

## What Railway does *not* host

- Metro bundler (dev only).
- Android emulator.
- Local `npm run server` — replaced by Railway HTTPS URL.

Keep local dev as-is; use Railway for **production-like** demo and rubric criterion **Deployment & stability**.
