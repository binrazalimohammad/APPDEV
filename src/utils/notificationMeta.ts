import { COLORS } from './theme';

export type NotificationVisual = {
  icon: string;
  dotColor: string;
  label: string;
};

const TYPE_MAP: Record<string, NotificationVisual> = {
  lease_update: { icon: '🏠', dotColor: COLORS.primary, label: 'Lease' },
  application_update: { icon: '📋', dotColor: COLORS.primary, label: 'Application' },
  application_approved: { icon: '🏠', dotColor: COLORS.success, label: 'Application' },
  application_submitted: { icon: '📋', dotColor: COLORS.info, label: 'Application' },
  maintenance_update: { icon: '🔧', dotColor: COLORS.warning, label: 'Maintenance' },
  listing_update: { icon: '🏡', dotColor: COLORS.info, label: 'Listing' },
  listing_approved: { icon: '🏡', dotColor: COLORS.success, label: 'Listing' },
  listing_rejected: { icon: '🏡', dotColor: COLORS.error, label: 'Listing' },
  listing_unoccupied: { icon: '🏡', dotColor: COLORS.info, label: 'Listing' },
  inquiry: { icon: '💬', dotColor: COLORS.info, label: 'Inquiry' },
  payment_update: { icon: '💳', dotColor: COLORS.success, label: 'Payment' },
  payment_approved: { icon: '💳', dotColor: COLORS.success, label: 'Payment' },
  payment_submitted: { icon: '💳', dotColor: COLORS.info, label: 'Payment' },
  payment_rejected: { icon: '💳', dotColor: COLORS.error, label: 'Payment' },
  contract_update: { icon: '📄', dotColor: COLORS.primaryMid, label: 'Contract' },
  onboarding_update: { icon: '✅', dotColor: COLORS.success, label: 'Onboarding' },
  order_update: { icon: '📦', dotColor: COLORS.primary, label: 'Order update' },
};

const DEFAULT_VISUAL: NotificationVisual = {
  icon: '◉',
  dotColor: COLORS.primary,
  label: 'Update',
};

export function getNotificationVisual(type: string | undefined | null): NotificationVisual {
  if (!type) {
    return DEFAULT_VISUAL;
  }
  const key = type.toLowerCase().replace(/[\s-]+/g, '_');
  return TYPE_MAP[key] ?? DEFAULT_VISUAL;
}
