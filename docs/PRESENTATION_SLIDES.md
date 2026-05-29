## Presentation (export to PDF)

### Slide 1 — Title

- **BinRazali (CasaClick Mobile)**
- React Native + Symfony API + MySQL

### Slide 2 — Problem / goal

- Mobile app for tenants/landlords
- Syncs with existing website/admin dashboard

### Slide 3 — Architecture

- Mobile (React Native)
- API (Symfony `/api/mobile/*`)
- DB (MySQL)
- Realtime: WebSocket (local) + polling fallback (prod)

### Slide 4 — Key features demo

- Login (JWT / Google)
- Browse listings + Apply
- Notifications bell + list
- Profile update

### Slide 5 — Evidence / screenshots (insert)

- Login screen
- Listings screen
- Application submit success
- Notifications screen
- (Optional) website admin showing the same record

### Slide 6 — Testing / QA

- Smoke test suite + logs
- Performance notes (polling interval, WS latency)

