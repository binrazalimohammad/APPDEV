import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../app/store';
import {
  startTenantStatusAlertPoller,
  stopTenantStatusAlertPoller,
} from '../services/tenantStatusAlertPoller';

/** Global poller — keeps notifications fresh while logged in (all screens). */
const NotificationBackgroundSync = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const roles = useSelector((s: RootState) => s.auth.user?.roles);

  useEffect(() => {
    if (!token || token === 'demo') {
      stopTenantStatusAlertPoller();
      return undefined;
    }

    startTenantStatusAlertPoller(token, roles);
    return () => {
      stopTenantStatusAlertPoller();
    };
  }, [token, roles]);

  return null;
};

export default NotificationBackgroundSync;
