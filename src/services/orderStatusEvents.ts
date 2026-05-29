/**
 * Lightweight pub/sub so booking screens update when order_updated arrives over Socket.IO.
 */
export type OrderUpdatedPayload = {
  order_id: number;
  customer_id: number;
  status: string;
  message: string;
  timestamp: string;
  statusLabel?: string;
};

type OrderUpdatedListener = (payload: OrderUpdatedPayload) => void;

const listeners = new Set<OrderUpdatedListener>();

export function subscribeOrderUpdated(listener: OrderUpdatedListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitOrderUpdated(payload: OrderUpdatedPayload): void {
  for (const listener of listeners) {
    try {
      listener(payload);
    } catch {
      // isolate subscriber failures
    }
  }
}

/** Invoked by notificationWebSocket when Socket.IO emits order_updated */
export function dispatchOrderUpdated(payload: OrderUpdatedPayload): void {
  emitOrderUpdated(payload);
}
