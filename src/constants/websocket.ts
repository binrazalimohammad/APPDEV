import { Platform } from 'react-native';

import { resolvePrimaryHost, USE_PRODUCTION_API } from '../app/api/config';

/** WebSocket port for notification push (scripts/ws-notification-server.js) */
export const NOTIFICATION_WS_PORT = 8082;

/** Enable WebSocket when using local Symfony (not Railway-only production API). */
export const NOTIFICATION_WS_ENABLED = __DEV__ && !USE_PRODUCTION_API;

export function getNotificationWebSocketUrl(): string | null {
  if (!NOTIFICATION_WS_ENABLED) {
    return null;
  }

  let host = resolvePrimaryHost();
  if (Platform.OS === 'android') {
    host = '127.0.0.1';
  } else if (host === '10.0.2.2') {
    host = '127.0.0.1';
  }

  return `ws://${host}:${NOTIFICATION_WS_PORT}/notifications`;
}

export type WebSocketNotificationMessage =
  | {
      type: 'notification';
      data: {
        id: number | string;
        type: string;
        message: string;
        isRead: boolean;
        relatedEntity?: string | null;
        relatedId?: number | null;
        createdAt: string;
      };
      event?: string;
    }
  | { type: 'auth_ok' }
  | { type: 'ping' };
