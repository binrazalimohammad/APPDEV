# 5-minute defense demo script

Use **real login** (not `123/123` — demo login is disabled in `src/constants/demoAuth.ts`).

## Before class

```powershell
cd BinRazali
npm run sync:pc-ip
npm run server
npm run android:reverse
npm run android
```

MySQL running (`websitedev` → `DATABASE_URL` in `.env`).

## 1. Login (30 s) — JWT / Auth

- Open app → **Continue with email**
- `tenant@example.com` / `tenant2222`
- Mention: Lexik JWT, password hashed on server

## 2. Listings & booking (60 s) — Customer API + DB

- **Listings** → open a unit → **Apply**
- Say: `POST /api/mobile/listings/{id}/apply` writes to MySQL

## 3. Web / DB sync (45 s) — Criterion 5

- Open web admin or phpMyAdmin → `user`, `application` tables
- Show new application row (or refresh web customer dashboard)
- Say: shared database + revision polling on listings

## 4. Profile update (30 s)

- **Profile** → change name → **Save profile**
- `PATCH /api/mobile/me` → refresh web user name if shown

## 5. RBAC (30 s) — Criterion 4

- Option A: Log in as staff on web only; explain mobile blocks staff (`MobileAccessGate`)
- Option B: Call `GET /api/mobile/customer/bookings` with staff JWT in Postman → **403**

## 6. Payment (optional, 45 s)

- Approved application → **Paymongo** or record payment
- `docs/PAYMONGO_SETUP.md` if asked

## 7. Google (optional)

- **Continue with Google** if USB + Google Console configured; else skip and use email

## Backup if API down

- Show `docs/API.md` endpoint table
- Show `npm run api:ping` on laptop
