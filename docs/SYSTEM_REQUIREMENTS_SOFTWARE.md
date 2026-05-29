## System Requirements — Software

This section is written for the **BinRazali (React Native)** mobile app + the **CasaClick Symfony API** stack.

### Operating system

- **Development OS (tested)**: Windows 10/11
- **Mobile target OS**: Android

### SDKs / runtimes

- **Node.js**: \(>= 20\) (see `package.json` → `engines.node`)
- **npm**: comes with Node.js (use the version bundled with Node 20+)
- **React Native**: 0.83.1 (see `package.json`)
- **React**: 19.2.0 (see `package.json`)
- **Android SDK**: Android Studio SDK manager (needed to build/run Android)
- **JDK**: required for Gradle Android builds (Android Studio installs a compatible JDK; use that)

### Key libraries (mobile)

- **Navigation**: `@react-navigation/native`, `@react-navigation/stack`
- **State**: `@reduxjs/toolkit`, `react-redux`, `redux-persist`
- **Google sign-in**: `@react-native-google-signin/google-signin`
- **Realtime**: WebSocket client (built-in RN `WebSocket`) + WS dev server (`ws`)
- **Local notifications**: `@notifee/react-native`

### Backend stack (expected / documented)

- **Symfony**: serves `/api/*` and `/api/mobile/*` routes (see `docs/API.md`)
- **MySQL**: data store (see `docs/DEPLOYMENT.md`)
- **JWT**: LexikJWTAuthenticationBundle pattern (see `docs/DEMO_SCRIPT.md`)

### Compatibility notes

- **Google sign-in**: requires correct OAuth client IDs (see `docs/GOOGLE_SIGNIN_ANDROID.md`)
- **Local dev API**: uses `adb reverse` for ports 8000 (API) and 8082 (WS) (see `docs/USB_REALTIME_SYNC.md`)
- **Production**: set `USE_PRODUCTION_API = true` in `src/app/api/config.ts` to use Railway HTTPS API.

