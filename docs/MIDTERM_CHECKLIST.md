# Midterm checklist: Google OAuth, Symfony, Redux Toolkit, Firebase Test Lab

This document matches the coursework checklist. The **React Native** app lives in this repo; **Symfony templates** live in `extras/symfony-casaclick-google/` (copy into [`casaclick`](https://github.com/binrazalimohammad/casaclick)).

---

## Google Cloud Console

- [ ] Create an OAuth **Web** client (used as `webClientId` in the app — `src/config/google.ts`).
- [ ] Create an OAuth **Android** client (package `com.binrazali`, SHA-1 from your debug/release keystore).
- [ ] Save **Client ID** and **Client Secret** (secret is for server / HWI web flow).
- [ ] Put the Web client ID into `src/config/google.ts` as `GOOGLE_WEB_CLIENT_ID`.

---

## Backend (Symfony + HWIOAuthBundle)

- [ ] In `casaclick`: `composer require hwi/oauth-bundle google/apiclient` (see `extras/symfony-casaclick-google/README.md`).
- [ ] Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env` / `.env.local`.
- [ ] Copy files from `extras/symfony-casaclick-google/` into the Symfony tree (config + controllers).
- [ ] Register `GoogleTokenAuthController` service bind `$googleClientId` (see README).
- [ ] Allow `POST /api/auth/google` anonymously in `security.yaml` (and CORS for the app).
- [ ] Web flow: HWI routes under `/connect` and callback route name `auth_google_callback` → `/auth/google/callback` (adjust as needed).

**Mobile contract:** `POST /api/auth/google` with JSON `{ "idToken": "..." }` → `{ "token": "..." }`.

---

## Mobile (React Native — no Expo)

- [x] `@react-native-google-signin/google-signin` installed.
- [x] `@reduxjs/toolkit` + `react-redux` (store in `src/app/store.ts`, slice in `src/app/authSlice.ts`).
- [x] `GoogleSignin.configure({ webClientId })` in `App.tsx` (after you set `GOOGLE_WEB_CLIENT_ID`).
- [x] **`Auth`** screen (`src/screens/auth/AuthScreen.tsx`) with Google button; email login pushes **Login**.
- [x] **Redux Persist** uses `AsyncStorage` only inside `src/app/store.ts` (no `AsyncStorage` calls in screens for auth).

Use `src/app/api/config.js` host (`10.0.2.2` emulator / LAN IP phone / `adb reverse`).

---

## Firebase Test Lab (Android release APK)

From project root:

```powershell
cd android
.\gradlew.bat assembleRelease
```

APK output (typical):

`android/app/build/outputs/apk/release/app-release.apk`

Then in **Firebase Console** → Test Lab → upload the APK → choose device matrices → run.

**Note:** For Play-protected OAuth on release builds you must register the **release keystore SHA-1** in Google Cloud (Android OAuth client).

---

## Reference links

- [HWIOAuthBundle](https://github.com/hwi/HWIOAuthBundle)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
