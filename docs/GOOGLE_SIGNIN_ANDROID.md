# Google Sign-In on Android (CasaClick mobile)

## USB default (`usb-adb`)

Google **blocks** OAuth redirects to private LAN IPs (`192.168.x.x`) with:

> device_id and device_name are required for private IP

This project defaults to **`usb-adb`**: the phone uses `http://127.0.0.1:8000` and `adb reverse` forwards port 8000 to your PC. Google accepts `127.0.0.1` as the callback host.

## Run before testing

```powershell
npm run server
npm run android:usb
```

`android:usb` runs `sync:pc-ip`, `android:reverse` (ports 8081 + 8000), and installs the app.

Ensure `GOOGLE_OAUTH_CLIENT_SECRET` is set in `websitedev/.env.local`.

## Google Cloud redirect URI

On your **Web application** OAuth client (`GOOGLE_OAUTH_CLIENT_ID`), include:

```
http://127.0.0.1:8000/connect/google/check
```

Run `npm run google:redirect-uris` to print the full list.

## How sign-in works

1. **Native** Google Sign-In (optional; Android OAuth client + SHA-1).
2. On **Developer error**, **browser** flow: `http://127.0.0.1:8000/mobile/google/start` → Google → `/connect/google/check` → `com.binrazali://oauth?token=...`.

## Wi‑Fi only (no USB)

Set `ANDROID_CONNECT_MODE = 'usb-lan'` in `config.ts`. Regular API may work, but **browser Google sign-in will fail** on LAN IPs unless you use a public tunnel (ngrok) or native Android OAuth.

## Optional: native account picker

Android OAuth client: package `com.binrazali`, SHA-1 from `npm run android:sha1`.

`src/config/google.ts` must match `GOOGLE_MOBILE_WEB_CLIENT_ID` in `websitedev/.env`.

## Email fallback

- `tenant@example.com` / `tenant2222`
- `landlord@example.com` / `landlord3333`
