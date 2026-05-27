import { API_CONFIG } from './config';
import { apiPost } from './client';
import type { ApiEnvelope } from './types';

export type GoogleAuthResponse = {
  token: string;
  user?: {
    email?: string;
    username?: string;
    name?: string;
    id?: string | number;
    roles?: string[];
    emailVerified?: boolean;
  } | null;
};

type GoogleAuthPayload = ApiEnvelope & {
  token?: string;
  user?: GoogleAuthResponse['user'];
  message?: string;
};

/** Exchange native Google Sign-In ID token for a Lexik JWT (POST /api/auth/google). */
export async function exchangeGoogleIdToken(
  idToken: string,
  options?: { role?: 'ROLE_TENANT' | 'ROLE_LANDLORD' },
): Promise<GoogleAuthResponse> {
  const response = await apiPost<GoogleAuthPayload>(API_CONFIG.ENDPOINTS.GOOGLE, {
    idToken,
    ...(options?.role ? { role: options.role } : {}),
  });

  if (!response.ok) {
    const data = response.data;
    const msg =
      (typeof data?.error === 'string' && data.error) ||
      (typeof data?.message === 'string' && data.message) ||
      `Google authentication failed (${response.status})`;
    throw new Error(msg);
  }

  const data = response.data ?? {};
  const envelope = data as GoogleAuthPayload & { data?: { token?: string; user?: GoogleAuthResponse['user'] } };
  const token =
    (typeof envelope.token === 'string' && envelope.token) ||
    (typeof envelope.data?.token === 'string' && envelope.data.token) ||
    '';

  if (!token) {
    throw new Error('Missing token from server — run npm run server');
  }

  const user = envelope.user ?? envelope.data?.user ?? null;

  return { token, user };
}
