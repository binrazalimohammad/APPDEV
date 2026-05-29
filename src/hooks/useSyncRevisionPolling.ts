import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { fetchSyncRevision } from '../app/api/sync';
import {
  ENABLE_BACKGROUND_SYNC_POLLING,
  LISTINGS_SYNC_INTERVAL_MS,
} from '../constants/sync';

/**
 * Polls GET /api/mobile/sync/revision (listings + applications + payments).
 * Use on dashboard, payments, notifications for near real-time sync with the website DB.
 */
export function useSyncRevisionPolling(
  token: string | null | undefined,
  onChanged: () => void | Promise<void>,
  enabled = true,
  intervalMs = LISTINGS_SYNC_INTERVAL_MS,
) {
  const active = enabled && ENABLE_BACKGROUND_SYNC_POLLING;
  const lastRevision = useRef<string | null>(null);
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  const poll = useCallback(async () => {
    if (!active || !token || token === 'demo') {
      return;
    }
    try {
      const sync = await fetchSyncRevision(token);
      const revision = sync.revision;
      if (lastRevision.current === null) {
        lastRevision.current = revision;
        return;
      }
      if (revision !== lastRevision.current) {
        lastRevision.current = revision;
        await onChangedRef.current();
      }
    } catch {
      // silent — pull-to-refresh still works
    }
  }, [active, token]);

  useFocusEffect(
    useCallback(() => {
      if (!active || !token || token === 'demo') {
        return undefined;
      }
      void poll().catch(() => undefined);
      const id = setInterval(() => {
        void poll().catch(() => undefined);
      }, intervalMs);
      return () => clearInterval(id);
    }, [active, token, poll, intervalMs]),
  );

  return { pollNow: poll };
}
