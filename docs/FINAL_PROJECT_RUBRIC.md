# Final project rubric — BinRazali / CasaClick stack

Use this sheet to **self-check** against your course criteria and show **evidence** during demo/defense.  
Max total: **100 points** (same weights as your handout).

Legend: **[done]** partially or fully implemented in-repo | **[gap]** not demonstrated or needs work | **[external]** expected in linked Symfony app (`casaclick`) or deployment, not only in this repo.

---

## 1. Customer mobile app integration — **/15**

| Expectation | Where it shows in this project | Status |
|-------------|--------------------------------|--------|
| Consumes customer API | Mobile `API_BASE_URL` targets Symfony-style host: `src/app/api/config.js` → `http://<host>:8000/api`. Auth: `src/app/api/auth.js` (`POST .../login`), Google: `src/app/api/googleAuth.js`. | **[done]** *if* backend matches these routes and returns JSON the app expects. |
| Smooth navigation, responsive UI | React Navigation: `src/navigations/index.js` (auth vs main by token), theme: `src/utils/theme.js` (CasaClick-aligned colors). | **[done]** for auth + home/profile-style flows; extend for more customer screens. |
| Core customer features E2E | Screens under `src/screens/` (auth, home, profile). No dedicated products/bookings/orders flows in app code yet. | **[gap]** until those features exist and call real endpoints. |

**To score high:** Add customer flows (list/detail, booking or cart, profile update) wired to the same API the web app uses; remove or isolate demo bypass (`email/password 123` in `src/app/authSlice.ts`).

---

## 2. Customer API development — **/15**

| Expectation | Evidence | Status |
|-------------|----------|--------|
| ≥5 functional REST endpoints (products, bookings, orders, profile, payments, etc.) | **Node reference API** (`backend/`): `GET /`, `POST /login`, `POST /refresh`, `POST /google`, `GET/POST /users` (protected) — **not** the same URL/port as the RN app’s `8000/api` target. **Symfony** customer API is expected in `casaclick` + templates in `extras/symfony-casaclick-google/`. | **[external]** + **[gap]** in this monorepo unless you document 5+ `/api/...` customer routes in Symfony and show them in Postman. |
| Proper HTTP methods + standardized JSON | Express routes return `{ success, message, ... }` patterns; `401` with messages in `backend/src/middleware/auth.js`. | **[done]** for the small Node sample; align Symfony responses with one contract (e.g. `{ data, error, message }` or your standard). |

**To score high:** List **five or more** customer-facing routes in your **actual** API (Symfony), with method, path, sample request/response; keep mobile + web on the same contract.

---

## 3. Authentication & security — **/15**

| Expectation | Evidence | Status |
|-------------|----------|--------|
| JWT / OAuth / session | JWT middleware: `backend/src/middleware/auth.js`; refresh: `backend/src/utils/tokens.js`, `POST /refresh`. **Mobile:** Google Sign-In + `exchangeGoogleIdToken`; password login via `authLogin`. **Symfony path:** Lexik JWT + `POST /api/auth/google` pattern in `extras/symfony-casaclick-google/src/Controller/Api/GoogleTokenAuthController.php`. | **[done]** pattern-wise; RN must call the **deployed** API, not mismatched ports/paths. |
| Protected routes | Express: `/users` uses `authenticateToken`. **Mobile:** token gates main stack (`src/navigations/index.js`). | **[done]** for app shell; API routes need the same for every sensitive operation. |
| Password handling | Symfony: use password hasher server-side (see extras README). **Avoid:** demo `123/123` in `authSlice` for production/demo story. In-memory demo users in `backend/src/data/` — ok for sandbox only. | **[partial]** tighten validation and hashing story in the **real** backend. |

**To score high:** Demonstrate hashed passwords on server, HTTPS in production-like setup, attach `Authorization: Bearer` on authenticated mobile calls (if not already centralized in an API layer).

---

## 4. Role-based access control (RBAC) — **/10**

| Expectation | Evidence | Status |
|-------------|----------|--------|
| Customer / Staff / Admin separation | No role checks in RN navigation or Express sample routes beyond “logged in”. Symfony often uses voter/roles — must be wired in **`casaclick`**. | **[gap]** in this repo; **[external]** in Symfony/UI. |

**To score high:** `ROLE_CUSTOMER`, `ROLE_STAFF`, `ROLE_ADMIN` (or equivalent) in API responses; Symfony `access_control` / voters; hide admin URLs on mobile; return `403` for wrong role.

---

## 5. Mobile & web synchronization — **/10**

| Expectation | Evidence | Status |
|-------------|----------|--------|
| Changes reflect web ↔ mobile (near real time) | No WebSocket/SSE/Mercure usage found in this RN repo; usual pattern is shared DB + refresh, or polling, or push. | **[gap]** unless implemented in Symfony + mobile (document mechanism). |

**To score high:** Short write-up: same database, invalidate cache, or Mercure/live component; demo: create booking on phone → appears in dashboard after refresh or live.

---

## 6. Database design & data management — **/10**

| Expectation | Evidence | Status |
|-------------|----------|--------|
| Relational DB, relationships, validation, CRUD | **Node backend** uses in-memory `backend/src/data/users.js` — fine for JWT lab, **not** a full DB story. Production story = **Doctrine entities** in Symfony. | **[partial]** here; **[external]** for real schema. |

**To score high:** ERD or migration list (User, Booking, Property, Payment, …); show constraints and no duplicate inconsistent state.

---

## 7. Error handling & validation — **/10**

| Expectation | Evidence | Status |
|-------------|----------|--------|
| Friendly errors on mobile + web | RN: `AuthScreen.tsx` / `LoginScreen.js` surface `auth.error`; API errors from thrown `Error` in thunks. | **[partial]** — extend to all API modules; map HTTP status → user copy. |
| API status codes | Express returns `400`, `401` with JSON messages. | **[done]** sample; replicate in Symfony controllers. |

**To score high:** Consistent error JSON shape; form validation (email format, password rules) on client and server.

---

## 8. UI/UX & branding consistency — **/5**

| Expectation | Evidence | Status |
|-------------|----------|--------|
| Professional, consistent web + mobile | Mobile theme aligned with CasaClick (`src/utils/theme.js` + comments to `app.css`). Web = Symfony templates in `casaclick`. | **[done]** directionally on mobile; match admin panel typography/components on web. |

**To score high:** Same primary color, typography scale, button styles; responsive admin + phone layouts.

---

## 9. Deployment & system stability — **/5**

| Expectation | Evidence | Status |
|-------------|----------|--------|
| Production-like runnable stack | RN: Firebase Test Lab path in root `README.md`; Android USB/emulator docs: `docs/ANDROID_USB_DEBUG.md`. Symfony deploy: not in this repo. | **[partial]** |

**To score high:** Document one host (VPS/cloud) or Docker compose: PHP-FPM + DB + nginx; env vars; smoke test checklist for demo day.

---

## 10. Documentation & project presentation — **/5**

| Expectation | Evidence | Status |
|-------------|----------|--------|
| API docs, setup guide, clear demo | `README.md`, `docs/MIDTERM_CHECKLIST.md`, `backend/README.md`, `extras/symfony-casaclick-google/README.md`. | **[partial]** — add OpenAPI/Swagger or a **`docs/API.md`** listing all customer + admin endpoints with samples. |

**To score high:** 5-minute demo script: login (Google + password), two customer actions, show web dashboard update, show one forbidden `403` for wrong role.

---

## Quick scoring guide (for you or instructor)

Scores are **indicative** until the full Symfony customer API + RBAC + sync are demonstrated.

| # | Criterion | If you only have this repo + basic Symfony auth | With full customer API + DB + RBAC + sync doc |
|---|-----------|----------------------------------------------------|-----------------------------------------------|
| 1 | Mobile integration | ~8–11 | 13–15 |
| 2 | Customer API | ~4–8 (need 5+ real endpoints) | 13–15 |
| 3 | Auth & security | ~9–12 | 13–15 |
| 4 | RBAC | ~2–4 | 8–10 |
| 5 | Sync | ~2–4 | 8–10 |
| 6 | Database | ~3–6 | 8–10 |
| 7 | Errors & validation | ~5–7 | 8–10 |
| 8 | UI/branding | ~3–5 | 4–5 |
| 9 | Deployment | ~2–3 | 4–5 |
| 10 | Documentation | ~2–4 | 4–5 |

---

## Priority backlog (rubric order)

1. **Five+ customer REST endpoints** on the API the mobile actually uses (`/api/...` on port 8000 or your chosen base).
2. **Remove demo-only auth** or flag it dev-only; attach JWT to all customer calls.
3. **RBAC** in Symfony + `403` tests; optional role claim in JWT for UI.
4. **One sync story** (shared DB + manual refresh is acceptable if you document it; real-time is a bonus).
5. **`docs/API.md`** (or Swagger) + demo script for criterion 10.

---

*Maps your course rubric to the BinRazali React Native client, the Node `backend/` sample, and the Symfony/CasaClick integration path.*
