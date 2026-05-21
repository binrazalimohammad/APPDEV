/**
 * Central API configuration — single source of truth for Symfony CasaClick.
 *
 * USB debugging (default): usb-adb → 127.0.0.1 + npm run android:reverse
 *   (required for Google browser sign-in — Google blocks private IPs like 192.168.x.x)
 *
 * Wi‑Fi / LAN only: set ANDROID_CONNECT_MODE = 'usb-lan' or 'wifi', then:
 *   npm run sync:pc-ip   (reads Windows ipconfig → DEV_API_PC_IP)
 *
 * Start backend: npm run server (Symfony on 0.0.0.0:8000)
 */
import { NativeModules, Platform } from 'react-native';

export type AndroidConnectMode = 'emulator' | 'usb-adb' | 'usb-lan' | 'wifi';

/** PC IPv4 — updated by: npm run sync:pc-ip */
export const DEV_API_PC_IP = '192.168.254.100';

export const ANDROID_PC_LAN_HOST = DEV_API_PC_IP;
export const ANDROID_WIFI_PC_HOST = DEV_API_PC_IP;

/**
 * usb-adb (default) → 127.0.0.1 + npm run android:reverse (Google OAuth-safe)
 * usb-lan / wifi    → http://DEV_API_PC_IP:8000 (no browser Google on LAN IP)
 * emulator          → 10.0.2.2
 */
export const ANDROID_CONNECT_MODE: AndroidConnectMode = 'usb-adb';

export const API_PORT = 8000;

/**
 * Railway / production API (HTTPS, no port). Set after deploy — see docs/DEPLOYMENT_RAILWAY.md
 * Example: 'https://casaclick-api-production.up.railway.app'
 * Leave empty '' for local-only development.
 */
export const PRODUCTION_API_ORIGIN = '';

const LOCAL_ONLY_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

function resolveApiOrigin(): string {
  const prod = PRODUCTION_API_ORIGIN.trim().replace(/\/$/, '');
  if (!__DEV__ && prod.length > 0) {
    return prod;
  }
  return `http://${resolvePrimaryHost()}:${API_PORT}`;
}

/** Metro bundler host (USB reverse for JS bundle) */
export const getMetroHost = (): string | null => {
  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  if (!scriptURL) {
    return null;
  }
  try {
    return scriptURL.match(/^https?:\/\/([^/:]+)/i)?.[1] ?? null;
  } catch {
    return null;
  }
};

function isLocalHost(host: string): boolean {
  return LOCAL_ONLY_HOSTS.has(host.toLowerCase());
}

/** Primary Symfony host for this device (no path, no port). */
export function resolvePrimaryHost(): string {
  if (Platform.OS === 'android') {
    switch (ANDROID_CONNECT_MODE) {
      case 'emulator':
        return '10.0.2.2';
      case 'usb-adb':
        return '127.0.0.1';
      case 'usb-lan':
      case 'wifi':
        return DEV_API_PC_IP;
      default:
        return DEV_API_PC_IP;
    }
  }
  // iOS simulator can use localhost; physical device should set usb-lan + sync:pc-ip
  return __DEV__ ? 'localhost' : DEV_API_PC_IP;
}

/** Symfony server root — local dev or PRODUCTION_API_ORIGIN in release builds */
export const API_ORIGIN = resolveApiOrigin();

/** All JSON API routes, e.g. http://192.168.1.5:8000/api */
export const API_BASE_URL = `${API_ORIGIN}/api`;

/** Mobile API prefix, e.g. http://192.168.1.5:8000/api/mobile */
export const MOBILE_API_BASE_URL = `${API_BASE_URL}/mobile`;

/**
 * Origins to try when the primary host fails (multi-IP fallback).
 * localhost/127.0.0.1 are omitted on real devices (usb-lan / wifi).
 */
export const getBaseUrls = (): string[] => {
  const urls: string[] = [];
  const seen = new Set<string>();

  const add = (host: string) => {
    if (!host || isLocalHost(host)) {
      return;
    }
    const origin = `http://${host}:${API_PORT}`;
    if (!seen.has(origin)) {
      seen.add(origin);
      urls.push(origin);
    }
  };

  // 1) PC LAN IP (phone on same network / USB tethering)
  add(DEV_API_PC_IP);

  // Do not add Metro bundler host — it is not the Symfony API and causes extra timeouts.

  if (Platform.OS === 'android') {
    if (ANDROID_CONNECT_MODE === 'emulator') {
      add('10.0.2.2');
      add('10.0.3.2');
    }
    // USB debugging with `npm run android:reverse` — API on PC localhost:8000
    if (ANDROID_CONNECT_MODE === 'usb-adb' || ANDROID_CONNECT_MODE === 'usb-lan') {
      add('127.0.0.1');
    }
  }

  if (ANDROID_CONNECT_MODE === 'usb-adb' || ANDROID_CONNECT_MODE === 'emulator') {
    add('localhost');
  }

  const primary = resolveApiOrigin();
  if (!seen.has(primary)) {
    urls.unshift(primary);
  } else {
    const idx = urls.indexOf(primary);
    if (idx > 0) {
      urls.splice(idx, 1);
      urls.unshift(primary);
    }
  }

  return urls;
};

/** Symfony + mobile route paths (always under API_BASE_URL) */
export const API_CONFIG = {
  BASE_URLS: getBaseUrls(),
  /** Per-origin timeout when trying hosts in parallel */
  TIMEOUT: 8000,
  /** @deprecated Sequential fallback only; parallel client uses TIMEOUT for each host */
  FALLBACK_TIMEOUT: 3000,
  DEBUG: __DEV__,
  ENDPOINTS: {
    LOGIN: '/api/login_check',
    REGISTER: '/api/mobile/register',
    GOOGLE: '/api/auth/google',
    PROFILE: '/api/mobile/me',
    HEALTH: '/api/mobile/health',
    HOME: '/api/mobile/home',
    ABOUT: '/api/mobile/about',
    CONTACT: '/api/mobile/contact',
    LISTINGS: '/api/mobile/listings',
    LISTINGS_REVISION: '/api/mobile/listings/revision',
    LISTING_DETAIL: '/api/mobile/listings', // + /:id
    CATEGORIES: '/api/mobile/categories',
    APPLICATIONS: '/api/mobile/applications',
    APPLICATION_DETAIL: '/api/mobile/applications', // + /:id
    PAYMENTS: '/api/mobile/payments',
    DASHBOARD: '/api/mobile/dashboard',
    NOTIFICATIONS: '/api/mobile/notifications',
    SYNC_REVISION: '/api/mobile/sync/revision',
    APPLICATIONS_REVISION: '/api/mobile/applications/revision',
    MY_LISTINGS: '/api/mobile/my-listings',
  },
} as const;

export const API_TIMEOUT_MS = API_CONFIG.TIMEOUT;
export const API_FALLBACK_TIMEOUT_MS = API_CONFIG.FALLBACK_TIMEOUT;

/** @deprecated Use API_ORIGIN */
export const API_HOST = resolvePrimaryHost();

export function getApiOriginCandidates(): string[] {
  return getBaseUrls();
}

export function getDevApiBaseUrls(): string[] {
  return getBaseUrls();
}

export function getMobileApiBaseCandidates(): string[] {
  return getBaseUrls().map(origin => `${origin}/api/mobile`);
}

export function getApiBaseCandidates(): string[] {
  return getBaseUrls().map(origin => `${origin}/api`);
}

/** Build full URL for a Symfony path (path must start with /api/...) */
export function buildApiUrl(path: string, origin: string = API_ORIGIN): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalized}`;
}

/** Build mobile sub-path URL, e.g. listings → /api/mobile/listings */
export function buildMobileApiUrl(
  segment: string,
  origin: string = API_ORIGIN,
): string {
  const sub = segment.startsWith('/') ? segment : `/${segment}`;
  return `${origin}/api/mobile${sub}`;
}

export const USB_CONNECT_HINT =
  ANDROID_CONNECT_MODE === 'usb-lan' || ANDROID_CONNECT_MODE === 'wifi'
    ? `Phone → ${API_BASE_URL} (npm run sync:pc-ip)`
    : 'USB → npm run android:reverse';

if (__DEV__) {
  console.log('[CasaClick API] Primary:', API_BASE_URL);
  console.log('[CasaClick API] Fallback origins:', API_CONFIG.BASE_URLS);
}
