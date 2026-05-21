# CasaClick mobile ↔ website API setup

Aligned with [khrings/Appdev API_SETUP_GUIDE](https://github.com/khrings/Appdev/blob/main/API_SETUP_GUIDE.md) structure; backend is **Symfony** (not Express in this repo).

## Mobile connection files (from [khrings/Appdev](https://github.com/khrings/Appdev))

| File | Role |
|------|------|
| `src/app/api/config.ts` | `getBaseUrls()` + `DEV_API_PC_IP` + `API_CONFIG.ENDPOINTS` |
| `src/app/api/client.ts` | `apiClient` / `apiPost` — tries every IP until one works |
| `src/app/api/auth.ts` | Login via `apiPost` → `/api/login_check` |
| `src/app/api/listing.ts` | Properties |
| `src/app/api/application.ts` | Bookings |
| `src/app/api/payment.ts` | Payments |
| `src/app/reducers/auth.ts` | JWT in Redux |
| `src/navigations/Index.tsx` | Auth vs main stack by token |

## Backend (websitedev)

Run from BinRazali root:

```bash
npm run server
npm run casaclick:fixtures   # first time
npm run api:ping
```

## USB phone

```bash
npm run sync:pc-ip
npm run android:reverse
npm run android
```

## Endpoints (CasaClick)

| Appdev | CasaClick |
|--------|-----------|
| `POST /api/auth/login` | `POST /api/login_check` |
| `POST /api/auth/register` | `POST /api/mobile/register` |
| `GET /api/health` | `GET /api/mobile/health` |
| Products | `GET /api/mobile/listings` |
| Orders | `GET /api/mobile/applications` |

Demo renter: `tenant@example.com` / `tenant2222`

See `docs/PROJECT_STRUCTURE.md` and `docs/APPDEV_CONNECTION_PATTERN.md`.
