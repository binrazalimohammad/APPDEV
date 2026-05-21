# Project structure (matches khrings/Appdev layout)

Reference: [khrings/Appdev](https://github.com/khrings/Appdev.git)

## Root

```
BinRazali/
├── API_SETUP_GUIDE.md      ← Appdev: API_SETUP_GUIDE.md
├── App.tsx
├── server/README.md        ← Appdev: server.js (Symfony lives in websitedev/)
├── src/
├── android/
├── ios/
└── docs/
```

## `src/` (same layout as Appdev)

```
src/
├── app/
│   ├── actions.ts              ← action type constants
│   ├── api/
│   │   ├── auth.ts
│   │   ├── client.ts
│   │   ├── config.ts
│   │   ├── listing.ts          ← Appdev: product.ts (properties)
│   │   ├── application.ts      ← Appdev: order.ts (bookings)
│   │   ├── payment.ts
│   │   ├── mobile.ts           ← shared mobile endpoints
│   │   └── ...
│   ├── reducers/
│   │   ├── auth.ts             ← Appdev: reducers/auth.ts
│   │   └── index.ts            ← store + persist (Appdev used sagas)
│   ├── authSlice.ts            ← re-export shim
│   └── store.ts                ← re-export shim
├── assets/images/
├── components/
├── contexts/
│   └── AuthContext.ts          ← Appdev: AuthContext.ts
├── navigations/
│   ├── Index.tsx               ← Appdev: Index.tsx
│   ├── AuthNav.tsx             ← Appdev: AuthNav.tsx
│   └── MainNav.tsx             ← Appdev: MainNav.tsx
├── screens/
│   ├── auth/                   ← Appdev: screens/auth/
│   └── main/                   ← customer / landlord screens
├── types/
│   └── index.ts                ← Appdev: types/index.ts
└── utils/
```

## Differences from Appdev (intentional)

| Appdev | BinRazali |
|--------|-----------|
| Express `server.js` in repo | Symfony in `../websitedev` |
| `redux-saga` | Redux Toolkit thunks |
| `product` / `order` / `pet` | `listing` / `application` / `payment` (real estate) |
| Pets shop domain | CasaClick rentals |
