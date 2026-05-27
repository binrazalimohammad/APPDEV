import type { NotificationItem } from '../app/api/types';
import {
  getNotificationWebSocketUrl,
  NOTIFICATION_WS_ENABLED,
  type WebSocketNotificationMessage,
} from '../constants/websocket';

type NotificationHandler = (item: NotificationItem) => void;
type ConnectionHandler = (connected: boolean) => void;

const RECONNECT_MS = 4000;
const PING_MS = 30000;

class NotificationWebSocketClient {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private onNotification: NotificationHandler | null = null;
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

    if (this.token === token && this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.token = token;
    this.disposed = false;
    this.open(url);
  }

  disconnect() {
    this.disposed = true;
    this.token = null;
    this.clearTimers();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.onConnection?.(false);
  }

  setHandlers(handlers: {
    onNotification?: NotificationHandler;
    onConnection?: ConnectionHandler;
  }) {
    this.onNotification = handlers.onNotification ?? null;
    this.onConnection = handlers.onConnection ?? null;
  }

  private open(url: string) {
    this.clearTimers();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    try {
      this.ws = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    const ws = this.ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token: this.token }));
    };

    ws.onmessage = event => {
      try {
        const msg = JSON.parse(String(event.data)) as WebSocketNotificationMessage & {
          type: string;
        };
        if (msg.type === 'auth_ok') {
          this.onConnection?.(true);
          this.startPing();
          return;
        }
        if (msg.type === 'notification' && msg.data) {
          this.onNotification?.(msg.data as NotificationItem);
        }
      } catch {
        // ignore malformed frames
      }
    };

    ws.onerror = () => {
      this.onConnection?.(false);
    };

    ws.onclose = () => {
      this.onConnection?.(false);
      this.clearPing();
      if (!this.disposed && this.token) {
        this.scheduleReconnect();
      }
    };
  }

  private startPing() {
    this.clearPing();
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
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
        this.open(url);
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
