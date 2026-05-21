import { useCallback, useRef } from 'react';
import type { NavigationState } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import {
  getActiveRouteName,
  screenActivityLabel,
  trackMobileActivity,
} from '../app/api/activity';
import type { RootState } from '../app/store';

const VIEW_DEBOUNCE_MS = 4000;

/** Logs screen views to CasaClick admin Activity Logs (polled every ~8s on the website). */
export function useActivityNavigationTracking() {
  const token = useSelector((s: RootState) => s.auth.token);
  const lastScreen = useRef<string | null>(null);
  const lastTrackedAt = useRef(0);

  return useCallback(
    (state: NavigationState | undefined) => {
      if (!token || token === 'demo') {
        return;
      }
      const name = getActiveRouteName(state);
      if (!name) {
        return;
      }
      const now = Date.now();
      if (name === lastScreen.current && now - lastTrackedAt.current < VIEW_DEBOUNCE_MS) {
        return;
      }
      lastScreen.current = name;
      lastTrackedAt.current = now;
      void trackMobileActivity('MOBILE_VIEW', screenActivityLabel(name), name, token);
    },
    [token],
  );
}
