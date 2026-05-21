/**
 * Auth API — Appdev-style (apiPost + multi-IP client), CasaClick routes kept.
 */
import { API_CONFIG } from './config';
import { apiGet, apiPost } from './client';
import { formatFetchError } from './networkErrors';
import type { ApiEnvelope, MobileUserProfile } from './types';

export type ApiAuthResponse = {
  ok: boolean;
  status: number;
  data?: {
    token?: string;
    user?: MobileUserProfile;
    message?: string;
    error?: string;
    success?: boolean;
  };
};

type LoginPayload = {
  token?: string;
  user?: MobileUserProfile;
  success?: boolean;
  error?: string;
  message?: string;
};

function extractToken(data: LoginPayload | undefined): string {
  if (!data || typeof data !== 'object') {
    return '';
  }
  if (typeof data.token === 'string') {
    return data.token;
  }
  const nested = (data as { data?: { token?: string } }).data;
  if (nested && typeof nested.token === 'string') {
    return nested.token;
  }
  return '';
}

/**
 * Lexik JWT — POST /api/login_check (Appdev used /api/login)
 */
export async function authLogin({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ token: string; user: MobileUserProfile | null }> {
  if (__DEV__) {
    console.log('[Auth] Login attempt:', email);
  }

  const response = await apiPost<LoginPayload>(API_CONFIG.ENDPOINTS.LOGIN, { email, password });

  if (!response.ok) {
    const msg =
      response.data?.message ??
      response.data?.error ??
      `Login failed (${response.status})`;
    throw new Error(formatFetchError(new Error(msg), 'Login failed'));
  }

  const token = extractToken(response.data);
  if (!token) {
    throw new Error('Missing token — run npm run server on port 8000');
  }

  try {
    const profile = await fetchMobileProfile(token);
    return { token, user: profile };
  } catch {
    return { token, user: { email, name: email.split('@')[0] ?? 'User' } };
  }
}

/** GET /api/mobile/me */
export async function fetchMobileProfile(token: string): Promise<MobileUserProfile | null> {
  const response = await apiGet<ApiEnvelope<MobileUserProfile>>(API_CONFIG.ENDPOINTS.PROFILE, token);

  if (!response.ok) {
    throw new Error(response.data?.error ?? 'Profile load failed');
  }

  const envelope = response.data;
  const user = envelope?.data ?? (envelope as unknown as MobileUserProfile);
  if (!user || typeof user !== 'object') {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    roles: user.roles,
    roleLabel: user.roleLabel,
    emailVerified: user.emailVerified,
  };
}

/** Appdev-compatible shape for screens that expect ApiAuthResponse */
export async function authLoginRaw(credentials: {
  email: string;
  password: string;
}): Promise<ApiAuthResponse> {
  try {
    const result = await authLogin(credentials);
    return {
      ok: true,
      status: 200,
      data: { token: result.token, user: result.user ?? undefined, success: true },
    };
  } catch (e: unknown) {
    return {
      ok: false,
      status: 0,
      data: { message: e instanceof Error ? e.message : 'Login failed' },
    };
  }
}
