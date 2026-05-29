import type { NotificationItem } from '../app/api/types';
import {
  getNotificationWebSocketUrl,
  NOTIFICATION_WS_ENABLED,
} from '../constants/websocket';
import { io, type Socket } from 'socket.io-client';

import { dispatchOrderUpdated, type OrderUpdatedPayload } from './orderStatusEvents';
import { getFcmToken } from './pushNotifications';

type NotificationHandler = (item: NotificationItem) => void;
type OrderUpdatedHandler = (payload: OrderUpdatedPayload) => void;
type ConnectionHandler = (connected: boolean) => void;

const RECONNECT_MS = 4000;
const PING_MS = 30000;

class NotificationWebSocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private onNotification: NotificationHandler | null = null;
  private onOrderUpdated: OrderUpdatedHandler | null = null;
  private onConnection: ConnectionHandler | null = null;
  private disposed = false;

  connect(token: string) {
    if (!NOTIFICATION_WS_ENABLED || token === 'demo') {
      this.disconnect();
      return;
    }

    const url = getNotificationWebSocketUrl();
    if (!url) {
      return;
    }

    if (this.token === token && this.socket?.connected) {
      return;
    }

    this.token = token;
    this.disposed = false;
    void this.open(url);
  }

  disconnect() {
    this.disposed = true;
    this.token = null;
    this.clearTimers();
    this.socket?.disconnect();
    this.socket = null;
    this.onConnection?.(false);
  }

  setHandlers(handlers: {
    onNotification?: NotificationHandler;
    onOrderUpdated?: OrderUpdatedHandler;
    onConnection?: ConnectionHandler;
  }) {
    this.onNotification = handlers.onNotification ?? null;
    this.onOrderUpdated = handlers.onOrderUpdated ?? null;
    this.onConnection = handlers.onConnection ?? null;
  }

  private async open(url: string) {
    this.clearTimers();
    this.socket?.disconnect();
    this.socket = null;

    try {
      const httpUrl = url.replace(/^ws:\/\//i, 'http://').replace(/^wss:\/\//i, 'https://');
      const fcmToken = await getFcmToken();
      this.socket = io(httpUrl, {
        path: '/notifications',
        transports: ['websocket'],
        auth: { token: this.token, fcmToken: fcmToken ?? undefined },
        reconnection: false,
      });
    } catch {
      this.scheduleReconnect();
      return;
    }

    const socket = this.socket;
    if (!socket) {
      return;
    }

    socket.on('connect', () => {
      // wait for auth_ok before marking connected
    });

    socket.on('auth_ok', () => {
      this.onConnection?.(true);
      this.startPing();
    });

    socket.on('notification', payload => {
      const item = payload?.data;
      if (item) {
        this.onNotification?.(item as NotificationItem);
      }
      // order_updated is also wrapped in notification payload from Symfony
      if (payload?.event === 'order_updated' && payload?.order) {
        this.handleOrderUpdated(payload.order);
      }
    });

    socket.on('order_updated', raw => {
      this.handleOrderUpdated(raw);
    });

    socket.on('connect_error', () => {
      this.onConnection?.(false);
    });

    socket.on('disconnect', () => {
      this.onConnection?.(false);
      this.clearPing();
      if (!this.disposed && this.token) {
        this.scheduleReconnect();
      }
    });
  }

  private handleOrderUpdated(raw: Record<string, unknown>) {
    const orderId = Number(raw.order_id ?? raw.orderId);
    const customerId = Number(raw.customer_id ?? raw.customerId);
    const status = String(raw.status ?? '');
    if (!orderId || !status) {
      return;
    }
    const payload: OrderUpdatedPayload = {
      order_id: orderId,
      customer_id: customerId,
      status,
      message: String(raw.message ?? ''),
      timestamp: String(raw.timestamp ?? new Date().toISOString()),
      statusLabel: raw.statusLabel != null ? String(raw.statusLabel) : undefined,
    };
    this.onOrderUpdated?.(payload);
    dispatchOrderUpdated(payload);
  }

  private startPing() {
    this.clearPing();
    this.pingTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, PING_MS);
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.disposed || !this.token) {
      return;
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      const url = getNotificationWebSocketUrl();
      if (url && this.token) {
        void this.open(url);
      }
    }, RECONNECT_MS);
  }

  private clearPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private clearTimers() {
    this.clearPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

export const notificationWebSocket = new NotificationWebSocketClient();
