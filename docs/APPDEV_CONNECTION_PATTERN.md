# How khrings/Appdev connects mobile ↔ backend (applied to BinRazali)

Reference repo: [khrings/Appdev](https://github.com/khrings/Appdev.git)

Your stack is different (Symfony CasaClick + Lexik JWT), but the **connection pattern** is the same.

## Appdev — files that connect the two sides

| File | Role |
|------|------|
| [`server.js`](https://github.com/khrings/Appdev/blob/main/server.js) | Express on `0.0.0.0:PORT`, **CORS** headers, mounts `/api` routes |
| [`authRoutes.js`](https://github.com/khrings/Appdev/blob/main/authRoutes.js) | `POST /api/auth/login`, `/register` → returns **`token` + `user`** |
| [`src/app/api/config.ts`](https://github.com/khrings/Appdev/blob/main/src/app/api/config.ts) | Builds list of base URLs (Metro host, emulator, LAN IP) |
| [`src/app/api/client.ts`](https://github.com/khrings/Appdev/blob/main/src/app/api/client.ts) | **Tries each URL** until one responds; caches working host |
| [`src/app/api/auth.ts`](https://github.com/khrings/Appdev/blob/main/src/app/api/auth.ts) | Login/register via client + `Authorization: Bearer` |
| [`API_SETUP_GUIDE.md`](https://github.com/khrings/Appdev/blob/main/API_SETUP_GUIDE.md) | Documents port **8000** and mobile → `10.0.2.2` |

## BinRazali / CasaClick — equivalent files (now aligned)

| Appdev concept | Your project |
|----------------|--------------|
| `server.js` + CORS | Repo root `server.js` → `npm run server` (Symfony `0.0.0.0:8000`) |
| `authRoutes.js` | `MobileApiController::register`, Lexik `POST /api/login_check` |
| `GET /api/health` | `GET /api/mobile/health` |
| `config.ts` URL list | `src/app/api/config.ts` → `getApiOriginCandidates()` |
| `client.ts` fallback | `src/app/api/client.ts` → tries multiple hosts |
| Redux token | `src/app/authSlice.ts` + `SessionBootstrap.tsx` |
| USB / ipconfig | `npm run sync:pc-ip`, `ANDROID_CONNECT_MODE = 'usb-lan'` |

## Run connected (USB)

```powershell
npm run sync:pc-ip
npm run server
npm run android
```

Sign in: `tenant@example.com` / `tenant2222`

Dev console should show: `[CasaClick] API connected at http://192.168.x.x:8000`
