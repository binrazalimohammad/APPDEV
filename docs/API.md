# CasaClick Customer API (mobile + web)

Base URL (development): `http://127.0.0.1:8000` with USB (`adb reverse`) or `http://<PC_IP>:8000` on LAN.

**Auth header (protected routes):** `Authorization: Bearer <JWT>`

**JSON shape:** `{ "success": true, "data": ... }` or `{ "success": false, "error": "..." }` / `"errors": []`

## Terminology (rubric mapping)

| Rubric term | CasaClick |
|-------------|-----------|
| Products | Listings (`/api/mobile/listings`) |
| Bookings | Applications (`/api/mobile/applications`) |
| Orders | Approved/completed applications (`/api/mobile/customer/orders`) |
| Profile | `/api/mobile/me` |
| Payments | `/api/mobile/payments`, Paymongo checkout |

## Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/login_check` | Public | Email/password → JWT |
| POST | `/api/mobile/register` | Public | Register tenant/landlord → JWT |
| POST | `/api/auth/google` | Public | Native Google `idToken` → JWT |
| GET | `/mobile/google/start` | Public | Browser Google OAuth (mobile) |

### Login

```http
POST /api/login_check
Content-Type: application/json

{ "email": "tenant@example.com", "password": "tenant2222" }
```

```json
{ "token": "eyJ..." }
```

## Customer mobile API (`/api/mobile/...`)

Used by the React Native app.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/mobile/health` | Health check |
| GET | `/api/mobile/me` | Profile |
| PATCH | `/api/mobile/me` | Update name, phone |
| GET | `/api/mobile/dashboard` | Dashboard stats |
| GET | `/api/mobile/listings` | Browse listings |
| GET | `/api/mobile/listings/{id}` | Listing detail |
| POST | `/api/mobile/listings/{id}/apply` | Create application (tenant) |
| GET | `/api/mobile/applications` | My applications |
| GET | `/api/mobile/applications/{id}` | Application detail |
| GET | `/api/mobile/payments` | Payment history |
| POST | `/api/mobile/applications/{id}/payments` | Record payment |
| POST | `/api/mobile/applications/{id}/payments/paymongo` | Paymongo checkout |
| GET | `/api/mobile/notifications` | Notifications |
| GET | `/api/mobile/sync/revision` | Sync fingerprint (polling) |
| POST | `/api/mobile/register` | Register account |

### PATCH profile sample

```http
PATCH /api/mobile/me
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "Maria Santos" }
```

## Customer REST API (`/api/mobile/customer/...`)

Tenant-only (403 for staff/admin/landlord). Alternative surface for rubric “bookings/orders” wording.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/mobile/customer/profile` | Profile |
| PATCH | `/api/mobile/customer/profile` | Update name |
| GET | `/api/mobile/customer/bookings` | List applications |
| POST | `/api/mobile/customer/bookings` | Create application |
| GET | `/api/mobile/customer/bookings/{id}` | Booking detail |
| GET | `/api/mobile/customer/orders` | Approved/completed bookings |
| GET | `/api/mobile/customer/payments` | Payments |
| POST | `/api/mobile/customer/payments` | Submit payment |

### RBAC example (403)

```http
GET /api/mobile/customer/bookings
Authorization: Bearer <staff_jwt>
```

```json
{
  "success": false,
  "error": "This Customer API is only for tenant/customer accounts..."
}
```

## Status codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created (register) |
| 400 | Validation error |
| 401 | Missing/invalid JWT |
| 403 | Wrong role |
| 404 | Not found |
| 409 | Email already registered |
| 503 | Google/token service unavailable |

See also: `docs/DEMO_SCRIPT.md`, `docs/DEPLOYMENT.md`, `docs/CASACLICK_MOBILE_SYNC.md`.
