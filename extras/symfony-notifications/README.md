# CasaClick notifications — wired in websitedev

**Status:** The live Symfony backend at `C:\Users\Maligalig\websitedev` already had the `notification` table, mobile API routes, and `NotificationService`. This task added:

- `src/EventSubscriber/StatusChangeNotificationSubscriber.php` — auto-notifies users when application, payment, or listing **status** changes (including admin booking updates)
- Extended `NotificationService` with `notifyApplicationStatusChange`, `notifyPaymentStatusChange`, `notifyListingStatusChange`

Copy-from-here files below are **reference only** if you need them on another environment. Prefer editing `websitedev` directly.

| Method | Path |
|--------|------|
| GET | `/api/mobile/notifications` |
| POST | `/api/mobile/notifications/{id}/read` |
| POST | `/api/mobile/notifications/read-all` |

## 1. Database migration

Run the SQL in `migrations/Version20250527000000.php` (or merge into a Doctrine migration):

```bash
php bin/console doctrine:migrations:migrate
```

## 2. Copy PHP files

| From (this folder) | To (websitedev) |
|--------------------|-----------------|
| `src/Entity/Notification.php` | `src/Entity/Notification.php` |
| `src/Repository/NotificationRepository.php` | `src/Repository/NotificationRepository.php` |
| `src/Service/NotificationService.php` | `src/Service/NotificationService.php` |
| `src/Controller/Api/Mobile/NotificationController.php` | `src/Controller/Api/Mobile/NotificationController.php` |
| `src/EventSubscriber/StatusChangeNotificationSubscriber.php` | `src/EventSubscriber/StatusChangeNotificationSubscriber.php` |

Register routes (if not auto-discovered) under `/api/mobile/notifications`.

## 3. Wire status-change hooks

`StatusChangeNotificationSubscriber` listens to Doctrine `preUpdate` on:

- **Application** (lease/booking) — notifies tenant on status change
- **Payment** — notifies tenant on status change
- **Listing** — notifies landlord on status change

Adjust entity class names / property names to match your websitedev models (see comments in the subscriber).

## 4. Sync revision (optional, recommended)

Add `notifications` fingerprint to `GET /api/mobile/sync/revision` response so mobile polling stays efficient:

```json
{
  "revision": "abc123",
  "notifications": "2025-05-27T10:00:00+00:00"
}
```

The mobile app polls notifications every 8s via `useNotifications`; updating sync revision lets you switch to revision-based polling later.

## Notification record shape

| Field | Type | Description |
|-------|------|-------------|
| user_id | FK → User | Recipient |
| type | string | e.g. `lease_update`, `maintenance_update`, `payment_update` |
| message | text | Human-readable message |
| related_entity | string? | e.g. `application`, `payment`, `listing` |
| related_id | int? | Related record ID |
| is_read | bool | Default `false` |
| created_at | datetime | Auto-set |

## Example messages (created by NotificationService)

- Lease: *"Your application for Unit 4B at Sunrise Residences has been approved"*
- Maintenance: *"Your maintenance request #MR-2041 has been marked as In Progress"*
- Listing inquiry: *"A new inquiry has been received for your listed property: 123 Mahogany St"*
- Payment: *"Your rent payment for June 2025 has been received"*
- Contract: *"Your lease agreement is ready for e-signature"*
