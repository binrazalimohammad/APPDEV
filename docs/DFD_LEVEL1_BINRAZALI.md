# Data Flow Diagram — Level 1 (BinRazali / CasaClick)

**System name:** CasaClick Property Rental Platform (mobile client + Symfony API)  
**Diagram PDF:** `docs/dfd-level1-binrazali.pdf` (generate with `npm run dfd-pdf`)

## Context (Level 0 summary)

Single process **0.0 CasaClick Rental System** between external actors and shared MySQL data.

## External entities

| ID | Entity | Description |
|----|--------|-------------|
| E1 | Tenant | Renter using the BinRazali React Native app |
| E2 | Landlord | Property owner using the mobile app |
| E3 | Google OAuth | Identity provider for browser / native Google sign-in |
| E4 | Paymongo | Payment gateway (checkout + webhooks) |
| E5 | Admin / Staff | Uses CasaClick **web** dashboard (not mobile) |

## Level 1 processes

| ID | Process | Responsibility |
|----|---------|----------------|
| P1.0 | Authenticate & register users | `POST /api/login_check`, `/api/mobile/register`, `/api/auth/google`, JWT issuance |
| P2.0 | Manage listings | Browse listings, detail, categories, landlord `my-listings`, revision poll |
| P3.0 | Process applications | Submit application, list/detail, status updates |
| P4.0 | Process payments | Payment history, record payment, Paymongo checkout |
| P5.0 | Notifications & sync | Notification list, sync revision fingerprint, optional WebSocket push (dev) |

## Data stores

| ID | Store | Contents |
|----|-------|----------|
| D1 | Users | Accounts, roles (`ROLE_TENANT`, `ROLE_LANDLORD`, …), hashed passwords |
| D2 | Listings | Properties, categories, images, approval state |
| D3 | Applications | Rental applications linking tenant ↔ listing |
| D4 | Payments | Payment records, Paymongo references |
| D5 | Notifications | User notifications (read/unread, related entity) |

## Major data flows

| From | To | Data flow |
|------|-----|-----------|
| E1, E2 | P1.0 | Credentials, registration, Google `idToken` |
| P1.0 | E1, E2 | JWT, profile, error messages |
| E3 | P1.0 | OAuth token / user identity |
| P1.0 | D1 | Read/write user records |
| E1, E2 | P2.0 | Browse/search requests, landlord listing CRUD |
| P2.0 | D2 | Query/update listings |
| P2.0 | E1, E2 | Listing cards, detail JSON |
| E1 | P3.0 | Application submit |
| P3.0 | D3 | Create/update applications |
| P3.0 | E1, E2 | Application status, detail |
| E1 | P4.0 | Payment intent / checkout request |
| P4.0 | D4 | Persist payment rows |
| E4 ↔ P4.0 | Checkout session, webhook events |
| P4.0 | E1 | Payment confirmation / history |
| P2.0, P3.0, P4.0 | P5.0 | Domain events (status changes) |
| P5.0 | D5 | Store notifications |
| P5.0 | E1, E2 | Notification feed, sync revision |
| E5 | D1–D5 | Admin CRUD via web (parallel channel) |

## Implementation map

| DFD | Code / deployment |
|-----|-------------------|
| Mobile UI | `src/screens/*`, `src/components/*` (BinRazali) |
| API | Symfony **casaclick** on Railway (`PRODUCTION_API_ORIGIN`) |
| D1–D5 | MySQL via Doctrine (Railway plugin) |
| P1–P5 routes | `docs/API.md`, `src/app/api/config.ts` `ENDPOINTS` |
