import { MOBILE_API_BASE_URL } from './config';
import { apiFetch } from './client';
import type { ApiEnvelope } from './types';

export type SyncRevisionPayload = {
  revision: string;
  listings?: string;
  applications?: string;
  payments?: string;
  serverTime?: string;
};

/** GET /api/mobile/sync/revision — bookings + payments + listings fingerprint */
export async function fetchSyncRevision(token: string): Promise<SyncRevisionPayload> {
  const body = await apiFetch<ApiEnvelope & SyncRevisionPayload>('/sync/revision', {
    token,
    baseUrl: MOBILE_API_BASE_URL,
  });
  return {
    revision: String(body.revision ?? ''),
    listings: body.listings,
    applications: body.applications,
    payments: body.payments,
    serverTime: body.serverTime,
  };
}

/** GET /api/mobile/applications/revision — bookings only */
export async function fetchApplicationsRevision(token: string): Promise<{ revision: string }> {
  const body = await apiFetch<ApiEnvelope & { revision?: string }>('/applications/revision', {
    token,
    baseUrl: MOBILE_API_BASE_URL,
  });
  return { revision: String(body.revision ?? '') };
}
