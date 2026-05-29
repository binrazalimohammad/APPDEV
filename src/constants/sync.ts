/** How often the app checks the server when background sync is enabled. */
export const LISTINGS_SYNC_INTERVAL_MS = 8000;

/**
 * When true, open screens poll the API every ~8s and reload data when the server revision changes.
 * When false, lists/dashboard only update on pull-to-refresh or Socket.IO (notifications/orders).
 */
export const ENABLE_BACKGROUND_SYNC_POLLING = false;
