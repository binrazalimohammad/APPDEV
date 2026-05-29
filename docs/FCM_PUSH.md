# Firebase Cloud Messaging (device pop-up notifications)

The mobile app registers an **FCM token** and can receive **system tray notifications** when the app is backgrounded or killed.

## Mobile (this repo)

- `@react-native-firebase/messaging` — token + handlers
- `src/services/pushNotifications.ts` — register token, foreground/background display via Notifee
- `index.ts` — `setBackgroundMessageHandler` (required when app is not running)
- `POST /api/mobile/push-token` — saves token on the Symfony user (see extras)

## Backend (websitedev / casaclick)

1. Run migration `extras/symfony-notifications/migrations/Version20250528100000_fcm_token.php`
2. Add to `User` entity:

```php
#[ORM\Column(length: 512, nullable: true)]
private ?string $fcmToken = null;

public function getFcmToken(): ?string { return $this->fcmToken; }
public function setFcmToken(?string $fcmToken): self { $this->fcmToken = $fcmToken; return $this; }
```

3. Copy `PushTokenController.php` into `src/Controller/Api/Mobile/`
4. When broadcasting to Socket.IO, include the user's token:

```json
{
  "userId": 12,
  "fcmToken": "<from user.fcm_token>",
  "notification": { "id": 1, "message": "...", "type": "lease_update" }
}
```

## Socket.IO server + FCM (local / Railway realtime service)

Production: deploy `services/realtime-notification` and set `FIREBASE_SERVICE_ACCOUNT_JSON` on Railway (see `docs/DEPLOYMENT_RAILWAY_REALTIME.md`).

```powershell
npm run io:server
```

Set env (download **service account JSON** from Firebase Console → Project settings → Service accounts):

```env
FIREBASE_SERVICE_ACCOUNT_PATH=C:\path\to\casaclick-firebase-adminsdk.json
WS_INTERNAL_SECRET=casaclick-ws-dev-secret
```

Symfony `.env`:

```env
WS_BROADCAST_URL=http://127.0.0.1:8082
WS_INTERNAL_SECRET=casaclick-ws-dev-secret
```

## Test

1. Build release or debug APK, sign in on a **physical device**
2. Allow notifications when prompted
3. **Background** the app (home button)
4. Trigger a status change on the website (admin updates booking)
5. Notification should appear in the Android shade

## Notes

- **Foreground**: FCM still shows a system notification (`force: true` via Notifee).
- **Socket.IO only** (no FCM credentials): in-app realtime works; killed app will not pop up.
- Register **release keystore SHA-1** in Firebase for release APK builds.
