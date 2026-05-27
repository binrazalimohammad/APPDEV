# Deployment & production-like setup

## Development (demo / coursework)

| Component | Command |
|-----------|---------|
| Symfony API | `npm run server` (from BinRazali → `websitedev` on `0.0.0.0:8000`) |
| Metro | `npm start` |
| Android USB | `npm run android:usb` (`usb-adb` + `adb reverse`) |
| DB | MySQL per `websitedev/.env` `DATABASE_URL` |
| Fixtures | `npm run casaclick:fixtures` |

## Environment variables (Symfony `websitedev`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL connection |
| `GOOGLE_OAUTH_CLIENT_ID` / `SECRET` | Staff + browser OAuth |
| `GOOGLE_MOBILE_WEB_CLIENT_ID` | Native Google token audience |
| `JWT_SECRET_KEY` | Lexik JWT |
| `PAYMONGO_SECRET_KEY` | Live payments (optional) |
| `DEFAULT_URI` | Email links / OAuth host |

## Production-like checklist

1. Host Symfony behind **nginx** or Apache with **HTTPS**
2. Set `APP_ENV=prod`, `APP_DEBUG=0`, run `php bin/console cache:clear`
3. Run Doctrine migrations on production MySQL
4. Restrict CORS if needed for mobile origin
5. Build Android release: `npm run android:release` → sign APK / Play Console
6. Point mobile `API_ORIGIN` to production host (not `127.0.0.1`)

## Stability tips for demo day

- Phone USB + `npm run android:reverse`
- Keep `ALLOW_DEMO_LOGIN = false` in `src/constants/demoAuth.ts`
- Pre-login once before presenting
- Fallback account: `tenant@example.com` / `tenant2222`

## Health check

```powershell
npm run api:ping
```

## Railway (hosted API)

Full step-by-step: **[DEPLOYMENT_RAILWAY.md](./DEPLOYMENT_RAILWAY.md)** — MySQL plugin, env vars, Google OAuth HTTPS, mobile `PRODUCTION_API_ORIGIN`.
