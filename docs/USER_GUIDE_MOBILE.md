## User Guide (Mobile) — BinRazali / CasaClick

### 1) Install

1. Copy the APK to your phone.
2. Open the APK and allow installation from unknown sources if prompted.
3. Launch **BinRazali**.

### 2) Login

- Use **Email login** or **Google sign-in** (if configured).

### 3) Browse listings

1. Open **Listings**
2. Tap a listing to view details

### 4) Apply (booking/application)

1. From listing detail, tap **Apply**
2. Confirm the success message
3. Check **My Applications** to see the record

### 5) Profile update

1. Open **Profile**
2. Update name/phone
3. Tap **Save**

### 6) Notifications

- Tap **Notifications** to see updates from the website/admin actions.
- Use **Mark all read** to clear unread badges.

### Troubleshooting

- **Cannot connect to API (local dev)**: run `npm run android:reverse` then restart the app.
- **Google sign-in fails**: verify SHA1 + OAuth IDs (see `docs/GOOGLE_SIGNIN_ANDROID.md`).
- **Realtime not instant**: WebSocket only works in local dev; production uses polling (see `docs/WEBSOCKET.md`).

