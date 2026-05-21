import { useEffect, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMobileProfile } from '../app/api/auth';
import { probeApiConnection } from '../app/api/health';
import {
  isSessionExpiredError,
  notifySessionExpired,
  registerSessionExpiredHandler,
} from '../app/api/sessionExpired';
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
      return;
    }
    fetchMobileProfile(token).catch(error => {
      if (isSessionExpiredError(error)) {
        notifySessionExpired();
      }
    });
  }, [token]);

  return children;
};

export default SessionBootstrap;
