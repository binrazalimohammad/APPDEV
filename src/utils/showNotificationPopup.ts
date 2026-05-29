import type { NotificationItem } from '../app/api/types';
import { showLocalNotification } from '../services/localNotifications';
import { getNotificationVisual } from './notificationMeta';

const recentKeys = new Map<string, number>();
const DEDUPE_MS = 8000;
/** Avoid double banner when approve creates application_approved + order_update. */
const RELATED_DEDUPE_MS = 5000;

export type NotificationPopupInput = Pick<
  NotificationItem,
  'type' | 'message' | 'relatedId'
> & {
  id?: NotificationItem['id'];
};

/** System tray / heads-up banner (deduped across bell + poll hooks). */
export function showNotificationPopup(item: NotificationPopupInput): void {
  const message = item.message?.trim();
  if (!message) {
    return;
  }

  const now = Date.now();

  if (item.relatedId != null) {
    const relKey = `rel:${item.relatedId}`;
    const relLast = recentKeys.get(relKey);
    if (relLast != null && now - relLast < RELATED_DEDUPE_MS) {
      return;
    }
    recentKeys.set(relKey, now);
  }

  const key =
    item.id != null
      ? `id:${item.id}`
      : `msg:${item.type ?? ''}:${item.relatedId ?? ''}:${message.slice(0, 120)}`;
  const last = recentKeys.get(key);
  if (last != null && now - last < DEDUPE_MS) {
    return;
  }
  recentKeys.set(key, now);

  const { label } = getNotificationVisual(item.type);
  const title = label === 'Update' ? 'BinRazali' : label;

  void showLocalNotification({
    title,
    body: message,
    data: {
      ...(item.id != null ? { notificationId: String(item.id) } : {}),
      type: item.type ?? '',
      relatedId: item.relatedId != null ? String(item.relatedId) : '',
    },
  });
}
