# Rubric self-check (100 pts)

Quick evidence map after gap-fill work.

| # | Criterion | Evidence in project |
|---|-----------|---------------------|
| 1 | Mobile integration | RN screens + `src/app/api/*` → Symfony `:8000` |
| 2 | Customer API (5+) | `docs/API.md` — 15+ routes |
| 3 | Auth & security | JWT, Google OAuth, hashed passwords; demo login **off** |
| 4 | RBAC | Symfony `isGranted`, `CustomerApiController` 403, `MobileAccessGate` |
| 5 | Sync | Shared MySQL, `sync/revision` polling — `docs/CASACLICK_MOBILE_SYNC.md` |
| 6 | Database | Doctrine entities, register/Google persist + `Tenant` profile |
| 7 | Errors | `FormFlash`, API status codes, validation |
| 8 | UI/branding | `theme.ts`, auth buttons, dashboard |
| 9 | Deployment | `docs/DEPLOYMENT.md`, `npm run server`, release APK script |
| 10 | Documentation | `docs/API.md`, `docs/DEMO_SCRIPT.md` |

**Demo:** follow `docs/DEMO_SCRIPT.md` only with real JWT login.
