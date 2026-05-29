import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../app/api/mobile';
import { fetchSyncRevision } from '../app/api/sync';
import type { NotificationItem } from '../app/api/types';
import { LISTINGS_SYNC_INTERVAL_MS } from '../constants/sync';
import { NOTIFICATION_WS_ENABLED } from '../constants/websocket';
import { notificationWebSocket } from '../services/notificationWebSocket';
import { showLocalNotification } from '../services/localNotifications';
import type { OrderUpdatedPayload } from '../services/orderStatusEvents';

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

  const applyResult = useCallback((next: NotificationItem[], unread: number) => {
    const fingerprint = `${unread}:${next.map(n => `${n.id}:${n.isRead}`).join('|')}`;
    if (fingerprint !== lastFingerprint.current) {
      lastFingerprint.current = fingerprint;
      setItems(next);
      setUnreadCount(unread);
    }
  }, []);

  const load = useCallback(
    async (silent = false) => {
      if (!enabled || !token || token === 'demo') {
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
        void showLocalNotification({
          title: item.type === 'order_update' ? 'Order update' : 'CasaClick',
          body: item.message,
          data: {
            notificationId: String(item.id),
            type: item.type ?? '',
            relatedId: item.relatedId != null ? String(item.relatedId) : '',
          },
          // Order screens show Alert via useOrderStatusListener; bell still updates here.
          force: false,
        });
      }
      lastSyncRevision.current = null;
    },
    [],
  );

  const handleWsOrderUpdated = useCallback((_payload: OrderUpdatedPayload) => {
    lastSyncRevision.current = null;
  }, []);

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
    if (wsConnected) {
      return;
    }
    try {
      const sync = await fetchSyncRevision(token);
      if (lastSyncRevision.current === null) {
        lastSyncRevision.current = sync.revision;
        await load(true);
        return;
      }
      if (sync.revision !== lastSyncRevision.current) {
        lastSyncRevision.current = sync.revision;
        await load(true);
      }
    } catch {
      await load(true);
    }
  }, [enabled, load, token, wsConnected]);

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
      }, LISTINGS_SYNC_INTERVAL_MS);
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
