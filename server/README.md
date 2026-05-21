# Server (CasaClick API)

In [khrings/Appdev](https://github.com/khrings/Appdev.git), the API lives in the **same repo** as the mobile app:

- `server.js` — Express entry
- `authRoutes.js` — login / register
- `db.js` — database

**BinRazali** uses **Symfony CasaClick** in a separate folder (same database as the website):

| Appdev file | CasaClick equivalent |
|-------------|----------------------|
| `server.js` (repo root) | `npm run server` → Symfony `websitedev/public` on **8000** |
| `authRoutes.js` (repo root) | Route map; real code in `MobileApiController.php` + Lexik JWT |
| `User.js` | `websitedev/src/Entity/User.php` |

Start the API from the mobile project root:

```bash
npm run server
npm run api:ping
```
