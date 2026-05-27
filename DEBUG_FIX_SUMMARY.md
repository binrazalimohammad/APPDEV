# Mobile API connection (Appdev pattern + CasaClick)

Based on [khrings/Appdev](https://github.com/khrings/Appdev) `client.ts` / `config.ts`, adapted for **CasaClick Symfony**.

## What we copied from Appdev

| Appdev | BinRazali (kept CasaClick) |
|--------|----------------------------|
| `getBaseUrls()` with Metro + 10.0.2.2 + **PC IP** + localhost | `src/app/api/config.ts` — `DEV_API_PC_IP` |
| `apiClient` + `apiGet` / `apiPost` fallback | `src/app/api/client.ts` |
| `API_CONFIG.ENDPOINTS` | CasaClick: `login_check`, `/api/mobile/*` |
| Auth uses `apiPost` | `src/app/api/auth.ts` |
| `ErrorBoundary` | `src/components/ErrorBoundary.tsx` |
| `src/app/actions.ts`, `reducers/`, `navigations/` | Same layout, **RTK** instead of sagas |

## What we did NOT copy (CasaClick-specific)

| Appdev | Why kept separate |
|--------|-------------------|
| `server.js` + Express | `server.js` at repo root → `npm run server` (Symfony in `websitedev`) |
| `redux-saga` | Redux Toolkit thunks in `src/app/reducers/auth.ts` |
| Pets / products shop | Real estate: listings, applications, payments |
| `/api/login` | Lexik `/api/login_check` |

## USB + IP steps

```powershell
npm run sync:pc-ip
npm run server
npm run android:reverse
npm run android
```

Auth screens show **all BASE_URLs** the app tries (dev only).
