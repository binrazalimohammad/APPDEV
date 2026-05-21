import { API_CONFIG } from './config';
import { apiPatch } from './client';
import type { ApiEnvelope, MobileUserProfile } from './types';

/** PATCH /api/mobile/me — name, phone */
export async function updateMobileProfile(
  token: string,
  fields: { name?: string; phone?: string },
): Promise<MobileUserProfile> {
  const response = await apiPatch<ApiEnvelope<MobileUserProfile>>(
    API_CONFIG.ENDPOINTS.PROFILE,
    fields,
    token,
  );

  if (!response.ok) {
    const errors = (response.data as { errors?: string[] })?.errors;
    const msg =
      errors?.join(', ') ??
      (response.data as { error?: string })?.error ??
      `Profile update failed (${response.status})`;
    throw new Error(msg);
  }

  const envelope = response.data;
  const user = envelope?.data ?? (envelope as unknown as MobileUserProfile);
  if (!user?.email) {
    throw new Error('Invalid profile response');
  }

  return user;
}
