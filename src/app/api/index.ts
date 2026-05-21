export {
  API_HOST,
  API_PORT,
  API_ORIGIN,
  API_BASE_URL,
  MOBILE_API_BASE_URL,
  API_CONFIG,
  ANDROID_CONNECT_MODE,
  DEV_API_PC_IP,
  ANDROID_PC_LAN_HOST,
  ANDROID_WIFI_PC_HOST,
  getBaseUrls,
  getDevApiBaseUrls,
  buildApiUrl,
  buildMobileApiUrl,
  resolvePrimaryHost,
  USB_CONNECT_HINT,
  getApiOriginCandidates,
} from './config';
export { getActiveApiOrigin } from './client';
export {
  apiClient,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  buildUrl,
  apiFetch,
} from './client';
export type { ApiResponse } from './client';
export { probeApiConnection } from './health';
export { fetchSyncRevision, fetchApplicationsRevision } from './sync';
export type { SyncRevisionPayload } from './sync';
export type { ApiHealthResult } from './health';
export type { AndroidConnectMode } from './config';
export { authLogin, fetchMobileProfile } from './auth';
export { updateMobileProfile } from './profile';
export { trackMobileActivity, screenActivityLabel, getActiveRouteName } from './activity';
export type { MobileActivityAction } from './activity';
export { exchangeGoogleIdToken } from './googleAuth';
export type { GoogleAuthResponse } from './googleAuth';
export * from './listing';
export * from './application';
export * from './payment';
export {
  registerMobileUser,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './mobile';
export {
  fetchHomeContent,
  fetchAboutContent,
  fetchContactContent,
  fetchDashboard,
} from './content';
export type {
  HomeContent,
  AboutContent,
  ContactContent,
  DashboardSummary,
  DashboardStat,
  DashboardQuickLink,
} from './content';
export type { ListingsRevisionPayload } from './mobile';
export { createPaymongoCheckout } from './paymongo';
export type { PaymongoCheckoutResult } from './paymongo';
export type {
  ApiEnvelope,
  MobileUserProfile,
  Listing,
  ListingDto,
  Category,
  RegisterRole,
} from './types';
