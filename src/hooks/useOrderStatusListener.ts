import { useEffect } from 'react';

import { orderStatusLabel } from '../constants/orderStatus';
import { subscribeOrderUpdated, type OrderUpdatedPayload } from '../services/orderStatusEvents';
import { showNotificationPopup } from '../utils/showNotificationPopup';

type Options = {
  /** When set, only handle updates for this booking/application id */
  orderId?: number;
  /** Called when matching order status changes (refresh detail/list) */
  onStatusChange?: (payload: OrderUpdatedPayload) => void;
  /** Show system notification banner (default true) */
  showPopup?: boolean;
};

/**
 * Subscribe to realtime order_updated events (from notificationWebSocket).
 * Use on ApplicationsScreen / ApplicationDetailScreen for live status UI.
 */
export function useOrderStatusListener(options: Options = {}): void {
  const { orderId, onStatusChange, showPopup = true } = options;

  useEffect(() => {
    return subscribeOrderUpdated(payload => {
      if (orderId != null && payload.order_id !== orderId) {
        return;
      }

      onStatusChange?.(payload);

      if (!showPopup) {
        return;
      }

      const label = payload.statusLabel ?? orderStatusLabel(payload.status);
      showNotificationPopup({
        id: `order:${payload.order_id}:${payload.status}:${payload.timestamp}`,
        type: 'order_update',
        message: payload.message || `Status: ${label}`,
        relatedId: payload.order_id,
      });
    });
  }, [orderId, onStatusChange, showPopup]);
}
