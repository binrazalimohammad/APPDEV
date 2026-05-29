## Performance notes (short)

### Startup

- First launch is slower due to JS bundle + initial API probe.
- Subsequent launches benefit from persisted auth state (redux-persist).

### Network

- API calls use an 8-second polling fallback for sync (`/api/mobile/sync/revision`).
- When WebSocket is enabled (local dev), notifications update instantly and reduces polling pressure.

### UI

- Lists use `FlatList` (listings, notifications) to avoid rendering huge arrays at once.

### Recommended measurements (for defense/demo)

- Time-to-login (tap login → dashboard rendered): ______ ms
- Listings load time (open listings → cards visible): ______ ms
- Notification delivery time:
  - WebSocket: ~1s (local)
  - Polling: ≤ 8s (production fallback)

