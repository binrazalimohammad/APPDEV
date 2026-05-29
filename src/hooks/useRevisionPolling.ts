import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  ENABLE_BACKGROUND_SYNC_POLLING,
  LISTINGS_SYNC_INTERVAL_MS,
} from '../constants/sync';

export type ListingsRevision = {
  revision: string;
  count?: number;
  serverTime?: string;
};

/**
 * Polls a lightweight revision endpoint while the screen is focused.
 * Calls onChanged when the server fingerprint changes (new/updated listings on website).
 */
export function useRevisionPolling(
  fetchRevision: () => Promise<ListingsRevision>,
  onChanged: () => void | Promise<void>,
  enabled = true,
  intervalMs = LISTINGS_SYNC_INTERVAL_MS,
) {
  const active = enabled && ENABLE_BACKGROUND_SYNC_POLLING;
  const lastRevision = useRef<string | null>(null);
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  const poll = useCallback(async () => {
    if (!active) {
      return;
    }
    try {
      const { revision } = await fetchRevision();
      if (lastRevision.current === null) {
        lastRevision.current = revision;
        return;
      }
      if (revision !== lastRevision.current) {
        lastRevision.current = revision;
        await onChangedRef.current();
      }
    } catch {
      // Silent — user can still pull to refresh
    }
  }, [active, fetchRevision]);

  const resetRevision = useCallback(() => {
    lastRevision.current = null;
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!active) {
        return undefined;
      }
      void poll().catch(() => undefined);
      const id = setInterval(() => {
        void poll().catch(() => undefined);
      }, intervalMs);
      return () => clearInterval(id);
    }, [active, poll, intervalMs]),
  );

  return { resetRevision, pollNow: poll };
}
