## Technical Documentation — BinRazali / CasaClick

### Overview

- **Mobile**: React Native app (BinRazali)
- **API**: Symfony (CasaClick) exposing `/api/*` and `/api/mobile/*`
- **DB**: MySQL via Doctrine
- **Realtime**: WebSocket push in local dev + polling fallback in production

### Install (developer)

```powershell
cd BinRazali
npm install
```

Android:

```powershell
npm start
npm run android
```

### Local backend (development)

- Start Symfony API via `npm run server` (expects local `websitedev` / `casaclick` folder setup per docs).
- Start WS server via `npm run ws:server` (or `npm run dev:all`).

### Build (Android release)

```powershell
npm run android:release
```

### Architecture (key modules)

- API config: `src/app/api/config.ts`
- API calls: `src/app/api/*`
- Auth state: `src/app/authSlice.ts` + `src/app/store.ts`
- Navigation: `src/navigations/*`
- Notifications UI: `src/screens/main/NotificationsScreen.tsx`
- Realtime WS client: `src/services/notificationWebSocket.ts`
- Local notifications: `src/services/localNotifications.ts`

### Configuration

- Production API origin: `src/app/api/config.ts` → `PRODUCTION_API_ORIGIN`
- Toggle prod vs local: `USE_PRODUCTION_API`
- USB/LAN connection modes: `ANDROID_CONNECT_MODE`

### Backups

- **Database**: use MySQL dump from the server environment (Railway/local MySQL)
- **Uploads/media**: back up public uploads directory used by Symfony (if applicable)

### Security

See `docs/SECURITY_NOTES.md`.

