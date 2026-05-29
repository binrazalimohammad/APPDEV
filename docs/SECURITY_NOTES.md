## Security notes (mobile + API)

### Authentication

- **JWT bearer tokens** are used for protected routes.
- Mobile sends `Authorization: Bearer <token>` (see `docs/API.md`).
- **Google sign-in** exchanges a native `idToken` for a backend JWT.

### Transport security

- **Production API** must be HTTPS (Railway origin is HTTPS in `src/app/api/config.ts`).
- Avoid using HTTP on public networks; use HTTP only for local dev with USB/LAN.

### Secrets / environment variables

- Do not commit real secrets:
  - API keys (Paymongo, OAuth secrets)
  - JWT private keys
  - Database credentials
- Use `.env` / platform env vars (see `docs/DEPLOYMENT.md`).

### Storage on device

- Tokens are persisted using `redux-persist` + `AsyncStorage`.
- Risk: `AsyncStorage` is not encrypted by default. For higher security, migrate token storage to encrypted storage (future hardening).

### RBAC

- API must enforce roles (example: tenant-only endpoints returning **403** for staff/admin tokens; see `docs/API.md`).
- UI alone must not be relied on to block access.

### Common app hardening checklist (demo-ready)

- `APP_ENV=prod`, `APP_DEBUG=0` on Symfony in production
- Rotate secrets if exposed
- Validate inputs server-side (email/password, payment references)
- Return safe error messages (no stack traces)

