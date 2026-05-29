import { PRODUCTION_API_ORIGIN, PRODUCTION_REALTIME_ORIGIN } from '../app/api/config';

let runtimeOrigin: string | null = null;

/** Set after GET /api/mobile/realtime-config (Railway WS_BROADCAST_URL). */
export function setRuntimeRealtimeOrigin(origin: string | null | undefined): void {
  const trimmed = origin?.trim().replace(/\/$/, '') ?? '';
  runtimeOrigin = trimmed.length > 0 ? trimmed : null;
}

/** Static config.ts value, or runtime value from API — never the Symfony API host. */
export function getEffectiveRealtimeOrigin(): string {
  const api = PRODUCTION_API_ORIGIN.trim().replace(/\/$/, '');
  const fromConfig = PRODUCTION_REALTIME_ORIGIN.trim().replace(/\/$/, '');
  if (fromConfig.length > 0 && fromConfig !== api) {
    return fromConfig;
  }
  if (runtimeOrigin && runtimeOrigin !== api) {
    return runtimeOrigin;
  }
  return '';
}

export function isEffectiveRealtimeConfigured(): boolean {
  return getEffectiveRealtimeOrigin().length > 0;
}
