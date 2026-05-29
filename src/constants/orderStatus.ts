/**
 * Customer-facing order/booking status labels (synced with Symfony OrderStatusLabelService).
 */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  approved: 'Accepted',
  processing: 'Processing',
  ready_for_pickup: 'Ready for Pickup',
  completed: 'Completed',
  refunded: 'Refund',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

export function orderStatusLabel(status: string): string {
  const key = status.toLowerCase().trim();
  return ORDER_STATUS_LABELS[key] ?? status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
