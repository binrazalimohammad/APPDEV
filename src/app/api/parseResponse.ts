import {
  isSessionExpiredResponse,
  notifySessionExpired,
  SessionExpiredError,
} from './sessionExpired';
import type { ApiEnvelope, ApiErrorPayload } from './types';

/**
 * CasaClick mobile API envelope: { success, data?, error?, errors?, meta? }
 */
export function getErrorMessage(
  data: ApiErrorPayload | null | undefined,
  fallback = 'Request failed',
): string {
  if (!data || typeof data !== 'object') {
    return fallback;
  }
  if (typeof data.error === 'string' && data.error) {
    return data.error;
  }
  if (typeof data.message === 'string' && data.message) {
    return data.message;
  }
  if (typeof data.detail === 'string' && data.detail) {
    return data.detail;
  }
  if (Array.isArray(data.errors) && data.errors.length) {
    return data.errors.join('\n');
  }
  return fallback;
}

export async function parseJsonResponse<T = ApiEnvelope>(
  response: Response,
  fallbackMessage?: string,
): Promise<T> {
  let data: ApiEnvelope = {};
  try {
    data = (await response.json()) as ApiEnvelope;
  } catch {
    data = {};
  }

  const ok = response.ok && (data.success === undefined || data.success === true);

  if (ok) {
    return data as T;
  }

  const message = getErrorMessage(
    data,
    fallbackMessage ?? `Request failed (${response.status})`,
  );

  if (isSessionExpiredResponse(response.status, message)) {
    notifySessionExpired();
    throw new SessionExpiredError(
      'Your session has expired. Please sign in again.',
    );
  }

  throw new Error(message);
}
