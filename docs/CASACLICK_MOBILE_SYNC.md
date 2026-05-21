# CasaClick website ↔ BinRazali mobile app

Your **CasaClick** Symfony site and the React Native app share **one MySQL database**. The app reads the same listings, applications, and payments as the website via `/api/mobile/*`.

## Correct GitHub repo

| Repo | What it is |
|------|------------|
| **[binrazalimohammad/casaclick](https://github.com/binrazalimohammad/casaclick)** | CasaClick rental marketplace (use this) |
| [binrazalimohammad/WEBDEV-2](https://github.com/binrazalimohammad/WEBDEV-2.git) | Different project (Task Manager API) — **not** CasaClick |

Local folders (both track `casaclick` git):

- `C:\Users\Maligalig\websitedev` — usual web project (`npm run casaclick:serve` uses this)
- `C:\Users\Maligalig\APP DEV\casaclick` — copy under APP DEV (`npm run casaclick:serve:appdev`)

## Connect the app (USB phone)

1. **Start CasaClick API** (port 8000 — only one server):

   ```bash
   cd "C:\Users\Maligalig\APP DEV\BinRazali"
   npm run casaclick:serve
   ```

2. **Load demo data** (first time or empty listings):

   ```bash
   npm run casaclick:fixtures
   ```

   Creates users + 3 approved sample apartments (same DB as website).

3. **Verify API** (optional):

   ```bash
   npm run api:ping
   ```

   Should show OK for `/api/mobile/home`, `/api/mobile/listings` (count ≥ 3), and login.

4. **Metro** (if not already running):

   ```bash
   npm start
   ```

5. **USB reverse + install**:

   ```bash
   npm run android:usb
   ```

6. **Sign in** in the app: **Sign in with email** → `tenant@example.com` / `tenant2222`

6. **Home screen** → Browse listings, applications, payments, etc. Pull to refresh to sync with the website.

Mobile API URL: `src/app/api/config.ts`. USB default: `usb-lan` → `http://<PC_IP>:8000` (run `npm run sync:pc-ip` after `ipconfig`). Alternative: `usb-adb` + `npm run android:reverse` → `127.0.0.1:8000`.

## Reference rubric features (CasaClick)

| Requirement | CasaClick implementation |
|-------------|-------------------------|
| Register (email/password) | `POST /api/mobile/register` — auto-verified for mobile sign-in |
| Customer dashboard | Mobile: Customer dashboard home; Web: `/customer/dashboard` (tenant only) |
| Customer-only view | No user management / activity logs on customer UI; admin on website only |
| Paymongo payments | `POST /api/mobile/applications/{id}/payments/paymongo` — set `PAYMONGO_SECRET_KEY` in `websitedev/.env.local` |
| Admin sees customer login/logout | Activity Logs: `LOGIN`, `LOGOUT`, `MOBILE_LOGIN`, `MOBILE_LOGOUT` (filter by tenant/customer) |
| Admin booking status | Admin → **Manage Bookings**: Pending, Complete, Refund, Cancelled |

## Role dashboards (same roles as website)

After sign-in, **Dashboard** matches your CasaClick role (brown/cream/gold UI like the website):

| Role | Demo login | Dashboard highlights |
|------|------------|-------------------|
| **Tenant** | `tenant@example.com` / `tenant2222` | Listings, applications, payments, notifications |
| **Landlord** | `landlord@example.com` / `landlord3333` | My listings, pending applications, marketplace |
| **Admin** | `admin@example.com` / `admin1234` | Platform stats (properties, users, landlords), recent listings |

API: `GET /api/mobile/dashboard` (JWT). Landlords also use `GET /api/mobile/my-listings`.

## What syncs with the website

| Website (web) | Mobile API | App screen |
|---------------|------------|------------|
| `/dashboard` | `GET /api/mobile/dashboard` | Dashboard (home) |
| `/home` | `GET /api/mobile/home` | Public marketing copy (legacy) |
| `/product` | `GET /api/mobile/listings` | Browse listings |
| Listing detail | `GET /api/mobile/listings/{id}` | Listing detail + Apply |
| `/application` | `GET /api/mobile/applications` | My applications |
| `/payment` | `GET /api/mobile/payments` | Payments |
| Notifications | `GET /api/mobile/notifications` | Notifications |
| `/about` | `GET /api/mobile/about` | About |
| `/contact` | `GET /api/mobile/contact` | Contact |
| Register | `POST /api/mobile/register` | Create account |
| Login | `POST /api/login_check` | Email sign-in |

Same DB: when admin **approves** a listing on the web, it appears in the app within about **8 seconds** on Dashboard, **Browse listings**, and listing detail (auto-poll). Pull to refresh anytime.

**USB debugging + website live updates:** see `docs/USB_REALTIME_SYNC.md` — mobile bookings/payments poll `sync/revision`; customer dashboard and admin bookings auto-refresh every **8s**.

| Screen | Live sync |
|--------|-----------|
| Dashboard | Polls marketplace revision → refreshes stats & recent listings |
| Browse listings | Polls `/api/mobile/listings/revision` |
| My listings (landlord) | Polls `/api/mobile/my-listings/revision` |
| Listing detail | Polls marketplace revision → reloads listing |

**Note:** Only **approved** listings show in Browse (same as website `/product`). Pending listings appear on the web admin until approved.

## Activity logs (near real-time)

Mobile actions are written to the same `activity_log` table as the website. On **Admin → Activity Logs**, the page polls every **8 seconds** and prepends new rows (login, logout, screen views, apply, payment, register).

| Mobile action | How it is logged |
|---------------|------------------|
| Sign in (email / Google) | `MOBILE_LOGIN` via app after login |
| Sign out | `MOBILE_LOGOUT` via app before clearing session |
| Open a screen | `MOBILE_VIEW` (debounced ~4s per screen) |
| Apply to listing | `MOBILE_APPLY` (server, on submit) |
| Submit payment | `MOBILE_PAYMENT` (server, on submit) |
| Register account | `MOBILE_REGISTER` (server, on create) |

**Try it:** sign in on the phone as `tenant@example.com`, browse **Listings** and **Profile**, keep the website Activity Logs page open — new rows should appear within about 8 seconds.

## Wi‑Fi (no USB)

In `src/app/api/config.ts`:

- `npm run sync:pc-ip` then `ANDROID_CONNECT_MODE = 'wifi'` or `'usb-lan'`
- `ANDROID_PC_LAN_HOST` = your PC IPv4 from `ipconfig`

Run Symfony on `0.0.0.0:8000` or ensure firewall allows port 8000. Phone and PC must be on the same network.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Login: verify email | Run `npm run casaclick:fixtures` or verify demo users in DB |
| Expired JWT token | Sign in again (app auto-logs out). Restart `npm run casaclick:serve` after JWT TTL change (now 24h) |
| Cannot reach API | `npm run casaclick:serve` + `npm run android:reverse` |
| Wrong data / 404 on home | Stop other PHP on port 8000; use CasaClick, not WEBDEV-2 Task Manager |
| Google Developer error | See `docs/GOOGLE_SIGNIN_ANDROID.md` (SHA-1 + Web client ID) |
| Google login “audience does not match” | Align `GOOGLE_MOBILE_WEB_CLIENT_ID` in `websitedev/.env` with `src/config/google.ts` |
| Google as **landlord** | Welcome or Register → choose **Landlord** → **Continue with Google** (new accounts only; existing users keep their role) |

## Theme

Mobile colors match CasaClick `assets/styles/app.css` (`#427C89`, `#F4F3EF`) in `src/utils/theme.ts`.
