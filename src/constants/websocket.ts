import { Platform } from 'react-native';

import { USE_PRODUCTION_API, USE_REALTIME_NOTIFICATIONS, resolvePrimaryHost } from '../app/api/config';
import {
  getEffectiveRealtimeOrigin,
  isEffectiveRealtimeConfigured,
} from '../services/realtimeConfig';

/** Socket.IO port for notifications (scripts/socketio-notification-server.js) */
export const NOTIFICATION_WS_PORT = 8082;

/** Enable realtime notifications (Socket.IO client). */
export const NOTIFICATION_WS_ENABLED = USE_REALTIME_NOTIFICATIONS;

export function getNotificationWebSocketUrl(): string | null {
  if (!NOTIFICATION_WS_ENABLED) {
    return null;
  }

  // Production: Socket.IO base URL only — client sets path: '/notifications' separately.
  if (USE_PRODUCTION_API) {
    const origin = getEffectiveRealtimeOrigin();
    if (!origin || !isEffectiveRealtimeConfigured()) {
      return null;
    }
    if (origin.startsWith('https://')) {
      return origin.replace(/^https:\/\//i, 'wss://');
    }
    if (origin.startsWith('http://')) {
      return origin.replace(/^http:\/\//i, 'ws://');
    }
    return `wss://${origin}`;
  }

  let host = resolvePrimaryHost();
  // On Android:
  // - emulator must use 10.0.2.2 to reach the host machine
  // - usb-adb can use 127.0.0.1 when adb reverse is enabled
  // - wifi/lan should use the PC LAN IP (resolvePrimaryHost already handles this)
  if (Platform.OS === 'android') {
    if (host === 'localhost') {
      host = '10.0.2.2';
    }
    // Keep 10.0.2.2 as-is; do not rewrite to 127.0.0.1.
  }

  return `ws://${host}:${NOTIFICATION_WS_PORT}`;
}

export type OrderUpdatedEvent = {
  order_id: number;
  customer_id: number;
  status: string;
  message: string;
  timestamp: string;
  statusLabel?: string;
};

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
      order?: OrderUpdatedEvent;
    }
  | { type: 'auth_ok' }
  | { type: 'ping' };
