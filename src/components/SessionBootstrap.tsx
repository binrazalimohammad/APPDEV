import { useEffect, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMobileProfile } from '../app/api/auth';
import { probeApiConnection } from '../app/api/health';
import {
  isSessionExpiredError,
  notifySessionExpired,
  registerSessionExpiredHandler,
} from '../app/api/sessionExpired';
import { NOTIFICATION_WS_ENABLED } from '../constants/websocket';
import { notificationWebSocket } from '../services/notificationWebSocket';
import { initLocalNotifications } from '../services/localNotifications';
import {
  attachForegroundMessageHandler,
  setupPushNotifications,
  teardownPushNotifications,
} from '../services/pushNotifications';
import type { AppDispatch, RootState } from '../app/store';

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

    void setupPushNotifications(token);
    const detachForeground = attachForegroundMessageHandler();

    if (NOTIFICATION_WS_ENABLED) {
      notificationWebSocket.connect(token);
    }

    fetchMobileProfile(token).catch(error => {
      if (isSessionExpiredError(error)) {
        notifySessionExpired();
      }
    });

    return () => {
      detachForeground();
      notificationWebSocket.disconnect();
      void teardownPushNotifications(token);
    };
  }, [token]);

  return children;
};

export default SessionBootstrap;
