import { API_CONFIG, getBaseUrls } from './config';
import { apiGet, getActiveApiOrigin } from './client';

export type ApiHealthResult = {
  ok: boolean;
  origin: string;
  message: string;
};

/**
 * Probe Symfony — apiClient tries each LAN origin until /api/mobile/health returns JSON.
 */
export async function probeApiConnection(): Promise<ApiHealthResult> {
  try {
    const response = await apiGet<{ success?: boolean; message?: string }>(
      API_CONFIG.ENDPOINTS.HEALTH,
    );

    if (response.ok && response.data?.success !== false) {
      return {
        ok: true,
        origin: getActiveApiOrigin(),
        message: response.data?.message ?? 'CasaClick API connected',
      };
    }
  } catch {
    // fall through
  }

  return {
    ok: false,
    origin: getBaseUrls()[0] ?? '',
    message: 'Cannot reach CasaClick. Run npm run server and npm run sync:pc-ip',
  };
}
