/**
 * Centralized HTTP client — copied from khrings/Appdev src/app/api/client.ts
 * Adapted for CasaClick Symfony routes.
 */
import { API_CONFIG, getBaseUrls } from './config';
import { formatFetchError } from './networkErrors';
import { getErrorMessage } from './parseResponse';
import { isSessionExpiredResponse, notifySessionExpired, SessionExpiredError } from './sessionExpired';

export const JSON_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

let preferredBaseUrl: string | null = null;

/** Origin that last succeeded (e.g. http://192.168.1.5:8000) */
export function getActiveApiOrigin(): string {
  return preferredBaseUrl ?? getBaseUrls()[0];
}

type FetchOptions = RequestInit & { signal?: AbortSignal };

export type ApiResponse<T = unknown> = {
  status: number;
  ok: boolean;
  data?: T;
  response: Response | null;
};

const fetchWithTimeout = async (
  url: string,
  options: FetchOptions = {},
  timeoutMs: number = API_CONFIG.TIMEOUT,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (error: unknown) {
    clearTimeout(timer);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
};

/** Build full URL (Appdev buildUrl) */
export const buildUrl = (baseUrl: string, endpoint: string): string => {
  const normalized = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (normalized.startsWith('/api/')) {
    return `${baseUrl}${normalized}`;
  }
  if (normalized.startsWith('/mobile/')) {
    return `${baseUrl}/api${normalized}`;
  }
  return `${baseUrl}/api${normalized}`;
};

const getOrderedBaseUrls = (): string[] => {
  const baseUrls = getBaseUrls();
  if (!preferredBaseUrl || !baseUrls.includes(preferredBaseUrl)) {
    return baseUrls;
  }
  return [preferredBaseUrl, ...baseUrls.filter(url => url !== preferredBaseUrl)];
};

const hasJsonContentType = (response: Response): boolean => {
  const ct = response.headers.get('content-type')?.toLowerCase() ?? '';
  return ct.includes('application/json') || ct.includes('+json');
};

const readResponseData = async <T>(response: Response): Promise<T | undefined> => {
  const text = await response.clone().text();
  if (!text.trim()) {
    return undefined;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    if (text.trimStart().startsWith('<')) {
      throw new Error(
        `Server returned HTML instead of JSON (${response.status}). Is Symfony running? npm run server`,
      );
    }
    throw new Error(`Invalid JSON response (${response.status})`);
  }
};

const isUsableResponse = (response: Response): boolean => {
  if (response.ok) {
    return true;
  }
  const ct = response.headers.get('content-type')?.toLowerCase() ?? '';
  return ct.includes('json');
};

/**
 * Main HTTP client — tries all LAN origins in parallel; first JSON response wins.
 */
export const apiClient = async <T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> => {
  const baseUrls = getOrderedBaseUrls();
  const timeoutMs = API_CONFIG.TIMEOUT;
  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  const tryBase = async (baseUrl: string): Promise<ApiResponse<T>> => {
    const fullUrl = buildUrl(baseUrl, endpoint);
    if (API_CONFIG.DEBUG) {
      console.log(`[API] Trying: ${fullUrl} (${timeoutMs}ms)`);
    }
    const response = await fetchWithTimeout(fullUrl, options, timeoutMs);
    if (API_CONFIG.DEBUG) {
      console.log(`[API] Response: ${response.status} from ${baseUrl}`);
    }
    if (isUsableResponse(response)) {
      preferredBaseUrl = baseUrl;
      return {
        status: response.status,
        ok: response.ok,
        data: await readResponseData<T>(response),
        response,
      };
    }
    lastResponse = response;
    throw new Error(`Unusable response (${response.status}) from ${baseUrl}`);
  };

  /** Parallel try; losing requests must not surface as unhandled rejections. */
  const raceHosts = (): Promise<ApiResponse<T>> =>
    new Promise((resolve, reject) => {
      if (baseUrls.length === 0) {
        reject(new Error('No API hosts configured'));
        return;
      }

      let pending = baseUrls.length;
      let settled = false;

      const onFailure = (error: unknown) => {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (API_CONFIG.DEBUG) {
          console.warn(`[API] Failed: ${lastError.message}`);
        }
        pending -= 1;
        if (pending === 0 && !settled) {
          if (lastResponse) {
            settled = true;
            readResponseData<T>(lastResponse)
              .then(data =>
                resolve({
                  status: lastResponse!.status,
                  ok: lastResponse!.ok,
                  data,
                  response: lastResponse,
                }),
              )
              .catch(reject);
            return;
          }
          reject(
            lastError ??
              new Error(
                'Cannot reach Symfony API. Run: npm run sync:pc-ip → npm run server → npm run android:reverse',
              ),
          );
        }
      };

      for (const baseUrl of baseUrls) {
        tryBase(baseUrl)
          .then(result => {
            if (!settled) {
              settled = true;
              resolve(result);
            }
          })
          .catch(onFailure);
      }
    });

  return raceHosts();
};

function authHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { ...JSON_HEADERS };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export const apiGet = async <T = unknown>(
  endpoint: string,
  token?: string,
): Promise<ApiResponse<T>> => {
  try {
    return await apiClient<T>(endpoint, { method: 'GET', headers: authHeaders(token) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { status: 0, ok: false, data: { message } as T, response: null };
  }
};

export const apiPost = async <T = unknown>(
  endpoint: string,
  body?: Record<string, unknown>,
  token?: string,
): Promise<ApiResponse<T>> => {
  try {
    return await apiClient<T>(endpoint, {
      method: 'POST',
      headers: authHeaders(token),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { status: 0, ok: false, data: { message } as T, response: null };
  }
};

export const apiPut = async <T = unknown>(
  endpoint: string,
  body?: Record<string, unknown>,
  token?: string,
): Promise<ApiResponse<T>> => {
  try {
    return await apiClient<T>(endpoint, {
      method: 'PUT',
      headers: authHeaders(token),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { status: 0, ok: false, data: { message } as T, response: null };
  }
};

export const apiPatch = async <T = unknown>(
  endpoint: string,
  body?: Record<string, unknown>,
  token?: string,
): Promise<ApiResponse<T>> => {
  try {
    return await apiClient<T>(endpoint, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { status: 0, ok: false, data: { message } as T, response: null };
  }
};

export const apiDelete = async <T = unknown>(
  endpoint: string,
  token?: string,
): Promise<ApiResponse<T>> => {
  try {
    return await apiClient<T>(endpoint, { method: 'DELETE', headers: authHeaders(token) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Network error';
    return { status: 0, ok: false, data: { message } as T, response: null };
  }
};

/** Legacy helper — maps mobile base + path to Appdev-style endpoint */
export type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string;
  body?: Record<string, unknown>;
  baseUrl: string;
  noFallback?: boolean;
};

export async function apiFetch<T = Record<string, unknown>>(
  path: string,
  { method = 'GET', token, body, baseUrl }: ApiFetchOptions,
): Promise<T> {
  const rootMatch = baseUrl.match(/^(https?:\/\/[^/]+)/);
  const root = rootMatch?.[1] ?? baseUrl;
  const prefix = baseUrl.slice(root.length) || '';
  const endpoint = `${prefix}${path.startsWith('/') ? path : `/${path}`}`;

  const run = async (): Promise<ApiResponse<T>> => {
    const opts = { headers: authHeaders(token), body: body !== undefined ? JSON.stringify(body) : undefined };
    switch (method) {
      case 'POST':
        return apiClient<T>(endpoint, { method: 'POST', ...opts });
      case 'PUT':
        return apiClient<T>(endpoint, { method: 'PUT', ...opts });
      case 'PATCH':
        return apiClient<T>(endpoint, { method: 'PATCH', ...opts });
      case 'DELETE':
        return apiClient<T>(endpoint, { method: 'DELETE', headers: authHeaders(token) });
      default:
        return apiClient<T>(endpoint, { method: 'GET', headers: authHeaders(token) });
    }
  };

  try {
    const res = await run();
    const data = (res.data ?? {}) as T & { success?: boolean; error?: string; message?: string };

    if (!res.ok || data.success === false) {
      const msg = getErrorMessage(
        data as { error?: string; message?: string },
        `Request failed (${res.status})`,
      );
      if (isSessionExpiredResponse(res.status, msg)) {
        notifySessionExpired();
        throw new SessionExpiredError();
      }
      throw new Error(msg);
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof SessionExpiredError) {
      throw error;
    }
    throw new Error(formatFetchError(error, 'Request failed'));
  }
}

if (__DEV__) {
  console.log('[API Client] Initialized with BASE_URLS:', getBaseUrls());
}
