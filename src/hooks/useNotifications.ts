import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../app/api/mobile';
import { fetchSyncRevision } from '../app/api/sync';
import type { NotificationItem } from '../app/api/types';
import { NOTIFICATION_POLL_INTERVAL_MS } from '../constants/sync';
import { subscribeNotificationReload } from '../services/notificationSync';
import { NOTIFICATION_WS_ENABLED } from '../constants/websocket';
import { notificationWebSocket } from '../services/notificationWebSocket';
import type { OrderUpdatedPayload } from '../services/orderStatusEvents';
import { showNotificationPopup } from '../utils/showNotificationPopup';

type UseNotificationsOptions = {
  enabled?: boolean;
  poll?: boolean;
};

export function useNotifications(
  token: string | null | undefined,
  options: UseNotificationsOptions = {},
) {
  const { enabled = true, poll = true } = options;
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const lastFingerprint = useRef<string>('');
  const lastSyncRevision = useRef<string | null>(null);
  const knownNotificationIds = useRef<Set<number | string>>(new Set());
  const notificationBaselineReady = useRef(false);

  const notifyNewItems = useCallback((next: NotificationItem[]) => {
    if (!notificationBaselineReady.current) {
      for (const item of next) {
        if (item.id != null) {
          knownNotificationIds.current.add(item.id);
        }
      }
      notificationBaselineReady.current = true;
      return;
    }

    for (const item of next) {
      if (item.id == null || knownNotificationIds.current.has(item.id)) {
        continue;
      }
      knownNotificationIds.current.add(item.id);
      if (!item.isRead) {
        showNotificationPopup(item);
      }
    }
  }, []);

  const applyResult = useCallback(
    (next: NotificationItem[], unread: number) => {
      notifyNewItems(next);
      const fingerprint = `${unread}:${next.map(n => `${n.id}:${n.isRead}`).join('|')}`;
      if (fingerprint !== lastFingerprint.current) {
        lastFingerprint.current = fingerprint;
        setItems(next);
        setUnreadCount(unread);
      }
    },
    [notifyNewItems],
  );

  const load = useCallback(
    async (silent = false) => {
      if (!enabled || !token || token === 'demo') {
        knownNotificationIds.current.clear();
        notificationBaselineReady.current = false;
        setItems([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }
      if (!silent) {
        setLoading(true);
      }
      try {
        const res = await fetchNotifications(token);
        applyResult(res.items, res.unread || res.items.filter(n => !n.isRead).length);
      } catch {
        if (!silent) {
          setItems([]);
          setUnreadCount(0);
        }
      } finally {
        setLoading(false);
      }
    },
    [applyResult, enabled, token],
  );

  const markRead = useCallback(
    async (id: number | string) => {
      if (!token || token === 'demo') {
        return;
      }
      try {
        await markNotificationRead(token, Number(id));
        setItems(prev =>
          prev.map(item => (item.id === id ? { ...item, isRead: true } : item)),
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {
        await load(true);
      }
    },
    [load, token],
  );

  const markAllRead = useCallback(async () => {
    if (!token || token === 'demo') {
      return;
    }
    try {
      await markAllNotificationsRead(token);
      setItems(prev => prev.map(item => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      await load(true);
    }
  }, [load, token]);

  const handleWsNotification = useCallback(
    (item: NotificationItem) => {
      setItems(prev => {
        if (prev.some(n => n.id === item.id)) {
          return prev;
        }
        return [item, ...prev];
      });
      if (!item.isRead) {
        setUnreadCount(prev => prev + 1);
        showNotificationPopup(item);
      }
      lastSyncRevision.current = null;
    },
    [],
  );

  const handleWsOrderUpdated = useCallback(
    (payload: OrderUpdatedPayload) => {
      lastSyncRevision.current = null;
      void load(true);
      const message = payload.message?.trim();
      if (message) {
        showNotificationPopup({
          type: 'order_update',
          message,
          relatedId: payload.order_id,
        });
      }
    },
    [load],
  );

  useEffect(() => {
    if (!enabled || !token || token === 'demo' || !NOTIFICATION_WS_ENABLED) {
      notificationWebSocket.setHandlers({});
      setWsConnected(false);
      return undefined;
    }

    notificationWebSocket.setHandlers({
      onNotification: handleWsNotification,
      onOrderUpdated: handleWsOrderUpdated,
      onConnection: setWsConnected,
    });

    return () => {
      notificationWebSocket.setHandlers({});
    };
  }, [enabled, handleWsNotification, handleWsOrderUpdated, token]);

  const pollForChanges = useCallback(async () => {
    if (!enabled || !token || token === 'demo') {
      return;
    }
    // Always reload notifications — do not rely on sync revision or WebSocket alone.
    try {
      const sync = await fetchSyncRevision(token);
      lastSyncRevision.current = sync.revision;
    } catch {
      // revision optional
    }
    await load(true);
  }, [enabled, load, token]);

  useEffect(() => {
    if (!enabled || !token || token === 'demo') {
      return undefined;
    }
    void load(true);
    return subscribeNotificationReload(() => {
      void load(true);
    });
  }, [enabled, load, token]);

  useEffect(() => {
    if (!enabled || !token || token === 'demo') {
      return undefined;
    }
    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        void load(true);
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [enabled, load, token]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled || !token || token === 'demo') {
        return undefined;
      }
      void pollForChanges();
      if (!poll) {
        return undefined;
      }
      const id = setInterval(() => {
        void pollForChanges();
      }, NOTIFICATION_POLL_INTERVAL_MS);
      return () => clearInterval(id);
    }, [enabled, poll, pollForChanges, token]),
  );

  return {
    items,
    unreadCount,
    loading,
    wsConnected,
    refresh: () => load(true),
    reload: () => load(false),
    markRead,
    markAllRead,
  };
}
