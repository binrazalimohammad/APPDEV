import type { DashboardLinkId } from './dashboardLinks';
import { ROUTES } from './routes';

export type TenantMenuItem = {
  id: DashboardLinkId | 'home';
  label: string;
  shortLabel?: string;
  icon: string;
  route: (typeof ROUTES)[keyof typeof ROUTES];
};

/** Tenant-only sidebar / drawer links (customer view). */
export const TENANT_SIDEBAR_ITEMS: TenantMenuItem[] = [
  { id: 'home', label: 'Dashboard', shortLabel: 'Home', icon: '⌂', route: ROUTES.HOME },
  { id: 'listings', label: 'Browse listings', shortLabel: 'Listings', icon: '▦', route: ROUTES.LISTINGS },
  { id: 'applications', label: 'My applications', shortLabel: 'Bookings', icon: '☰', route: ROUTES.APPLICATIONS },
  { id: 'payments', label: 'Payments', shortLabel: 'Pay', icon: '₱', route: ROUTES.PAYMENTS },
  { id: 'notifications', label: 'Notifications', shortLabel: 'Alerts', icon: '◉', route: ROUTES.NOTIFICATIONS },
  { id: 'profile', label: 'Profile', shortLabel: 'Profile', icon: '◎', route: ROUTES.PROFILE },
  { id: 'about', label: 'About CasaClick', shortLabel: 'About', icon: 'i', route: ROUTES.ABOUT },
  { id: 'contact', label: 'Contact', shortLabel: 'Help', icon: '✉', route: ROUTES.CONTACT },
];
