import { useEffect, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMobileProfile } from '../app/api/auth';
import { fetchRealtimeConfig } from '../app/api/mobile';
import { probeApiConnection } from '../app/api/health';
import {
  isSessionExpiredError,
  notifySessionExpired,
  registerSessionExpiredHandler,
} from '../app/api/sessionExpired';
import { NOTIFICATION_WS_ENABLED } from '../constants/websocket';
import { notificationWebSocket } from '../services/notificationWebSocket';
import { setRuntimeRealtimeOrigin } from '../services/realtimeConfig';
import { initLocalNotifications } from '../services/localNotifications';
import {
  attachForegroundMessageHandler,
  setupPushNotifications,
  teardownPushNotifications,
} from '../services/pushNotifications';
import type { AppDispatch, RootState } from '../app/store';
import NotificationBackgroundSync from './NotificationBackgroundSync';

type Props = {
  children: ReactNode;
};

/** Registers JWT expiry handler and validates persisted token on launch */
const SessionBootstrap = ({ children }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((s: RootState) => s.auth.token);

  useEffect(() => {
    registerSessionExpiredHandler(dispatch);
  }, [dispatch]);

  useEffect(() => {
    void initLocalNotifications();
  }, []);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }
    void probeApiConnection()
      .then(result => {
        if (result.ok) {
          console.log(`[CasaClick] API connected at ${result.origin}`);
        } else {
          console.warn(`[CasaClick] ${result.message}`);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!token || token === 'demo') {
      notificationWebSocket.disconnect();
      return undefined;
    }

    let cancelled = false;

    void (async () => {
      await setupPushNotifications(token);
      if (cancelled) {
        return;
      }

      const realtimeOrigin = await fetchRealtimeConfig();
      if (cancelled) {
        return;
      }
      setRuntimeRealtimeOrigin(realtimeOrigin);
      if (__DEV__ && realtimeOrigin) {
        console.log(`[CasaClick] Realtime: ${realtimeOrigin}`);
      }

      if (NOTIFICATION_WS_ENABLED) {
        notificationWebSocket.connect(token);
      }
    })();

    const detachForeground = attachForegroundMessageHandler();

    fetchMobileProfile(token).catch(error => {
      if (isSessionExpiredError(error)) {
        notifySessionExpired();
      }
    });

    return () => {
      cancelled = true;
      detachForeground();
      notificationWebSocket.disconnect();
      setRuntimeRealtimeOrigin(null);
      void teardownPushNotifications(token);
    };
  }, [token]);

  return (
    <>
      <NotificationBackgroundSync />
      {children}
    </>
  );
};

export default SessionBootstrap;
