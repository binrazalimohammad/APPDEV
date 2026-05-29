import { useEffect } from 'react';
import { Alert, AppState } from 'react-native';

import { orderStatusLabel } from '../constants/orderStatus';
import { subscribeOrderUpdated, type OrderUpdatedPayload } from '../services/orderStatusEvents';
import { showLocalNotification } from '../services/localNotifications';

type Options = {
  /** When set, only handle updates for this booking/application id */
  orderId?: number;
  /** Called when matching order status changes (refresh detail/list) */
  onStatusChange?: (payload: OrderUpdatedPayload) => void;
  /** Show Alert when app is foreground (default true) */
  showAlert?: boolean;
};

/**
 * Subscribe to realtime order_updated events (from notificationWebSocket).
 * Use on ApplicationsScreen / ApplicationDetailScreen for live status UI.
 */
export function useOrderStatusListener(options: Options = {}): void {
  const { orderId, onStatusChange, showAlert = true } = options;

  useEffect(() => {
    return subscribeOrderUpdated(payload => {
      if (orderId != null && payload.order_id !== orderId) {
        return;
      }

      onStatusChange?.(payload);

      const label = payload.statusLabel ?? orderStatusLabel(payload.status);
      const isForeground = AppState.currentState === 'active';

      if (isForeground && showAlert) {
        Alert.alert('Order update', payload.message || `Status: ${label}`);
      } else if (!isForeground) {
        void showLocalNotification({
          title: 'Order update',
          body: payload.message || `Status: ${label}`,
          data: {
            orderId: String(payload.order_id),
            status: payload.status,
            type: 'order_update',
          },
          force: true,
        });
      }
    });
  }, [orderId, onStatusChange, showAlert]);
}
