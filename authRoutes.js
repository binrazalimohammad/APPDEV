/**
 * Auth + mobile API routes — Appdev authRoutes.js equivalent.
 * https://github.com/khrings/Appdev/blob/main/authRoutes.js
 *
 * Appdev implements these in Express; CasaClick implements them in:
 *   websitedev/src/Controller/Api/MobileApiController.php
 *   websitedev/config/packages/lexik_jwt_authentication.yaml
 */
module.exports = {
  /** Lexik JWT (not Appdev POST /api/login) */
  LOGIN: '/api/login_check',
  REGISTER: '/api/mobile/register',
  GOOGLE: '/api/auth/google',
  PROFILE: '/api/mobile/me',
  HEALTH: '/api/mobile/health',
  LISTINGS: '/api/mobile/listings',
  APPLICATIONS: '/api/mobile/applications',
  PAYMENTS: '/api/mobile/payments',
  DASHBOARD: '/api/mobile/dashboard',
  SYNC_REVISION: '/api/mobile/sync/revision',
};
