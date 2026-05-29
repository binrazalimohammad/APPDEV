## Testing & QA — Test cases (manual)

### Smoke suite (core)

1. **Install / launch**
   - Install APK
   - App launches without crash
2. **Login (email/password)**
   - Valid credentials → navigates to dashboard
   - Invalid credentials → shows error
3. **Listings browse**
   - Listings screen loads
   - Listing detail loads
4. **Apply**
   - Apply to a listing → success message
   - Application appears in “My Applications”
5. **Profile update**
   - Update name/phone → saved and persists after relaunch
6. **Notifications list**
   - Notification screen loads
   - Mark read / mark all read works
7. **Realtime update**
   - While logged in, create a backend notification (admin status change)
   - App updates bell count via WebSocket (local dev) or polling (production)
8. **Local notification (OS-level)**
   - Put app in background
   - Trigger a new notification from backend
   - Verify Android system notification appears

### Negative / edge cases

- **Expired JWT**: trigger 401 → app logs out / shows session expired message
- **Offline**: disable internet → app shows graceful errors and can retry
- **WebSocket disconnected**: stop WS server → app falls back to polling

