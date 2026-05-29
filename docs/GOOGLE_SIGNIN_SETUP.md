## Google Sign-In (Mobile) Setup

This app supports **Google Sign-In** on mobile via:

- Native Google Sign-In: `@react-native-google-signin/google-signin`
- Server exchange endpoint: `POST /api/auth/google` (returns a CasaClick/Lexik JWT)
- Fallback browser OAuth (deep link): `GET /mobile/google/start` → redirects back to `com.binrazali://oauth?token=...`

### What’s already implemented in this repo

- **UI**: Google buttons on `LoginScreen` and `RegisterScreen`
- **Native token retrieval**: `src/services/googleSignIn.ts` (`getGoogleIdToken()`)
- **Token exchange call**: `src/app/api/googleAuth.ts` (`exchangeGoogleIdToken()`)
- **Redux saga wiring**: `src/app/sagas/auth.ts` listens to `USER_GOOGLE_LOGIN`
- **Deep link receiver**: `android/app/src/main/AndroidManifest.xml` for `com.binrazali://oauth`

### 1) Google Cloud Console configuration

You need **two** OAuth client configurations:

- **Web client** (required): used as `webClientId` to request an **ID token**
  - Put it in `src/config/google.ts` as `GOOGLE_WEB_CLIENT_ID`
- **Android client** (recommended for native sign-in):
  - Package name: `com.binrazali`
  - SHA‑1:
    - Debug: run `npm run android:sha1`
    - Release: use your release keystore SHA‑1

### 2) Backend requirements (Symfony / CasaClick server)

The mobile app expects these server routes:

- `POST /api/auth/google`
  - Request JSON: `{ "idToken": "<google-id-token>", "role": "ROLE_TENANT" | "ROLE_LANDLORD" }`
  - Response JSON: `{ "token": "<jwt>", "user": { ... } }` (or envelope containing `data.token`)

Optional (browser fallback for Android “DEVELOPER_ERROR”):

- `GET /mobile/google/start?role=ROLE_TENANT`
  - Starts web OAuth and eventually redirects back to:
    - `com.binrazali://oauth?token=<jwt>` (or `...&error=...`)

### 3) Local Android dev notes

For local server testing on a USB-connected Android device:

- Start API: `npm run server` (serves PHP/Symfony on port 8000)
- Reverse ports: `npm run android:reverse`

If you use the **browser fallback** flow, it must be reachable as `http://127.0.0.1:8000` on device (ADB reverse).

