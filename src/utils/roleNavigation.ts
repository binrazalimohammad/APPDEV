import type { DashboardQuickLink } from '../app/api/content';
import type { RegisterRole } from '../app/api/types';
import type { DashboardLinkId } from './dashboardLinks';
import { getPrimaryRole, type PrimaryRole } from './roles';

/** Quick links hidden from customers (tenants) — admin/staff only on website. */
const TENANT_HIDDEN_LINKS: DashboardLinkId[] = ['admin_area', 'my_listings'];

const LANDLORD_ONLY_LINKS: DashboardLinkId[] = ['my_listings'];

const TENANT_ALLOWED_LINKS: DashboardLinkId[] = [
  'listings',
  'applications',
  'payments',
  'notifications',
  'profile',
  'about',
  'contact',
];

export function filterQuickLinksForRole(
  links: DashboardQuickLink[],
  role: PrimaryRole | string,
): DashboardQuickLink[] {
  if (role === 'ROLE_TENANT') {
    return links.filter(l => !TENANT_HIDDEN_LINKS.includes(l.id as DashboardLinkId));
  }
  if (role === 'ROLE_LANDLORD') {
    return links;
  }
  if (role === 'ROLE_ADMIN' || role === 'ROLE_STAFF') {
    return links;
  }
  return links.filter(l => TENANT_ALLOWED_LINKS.includes(l.id as DashboardLinkId));
}

export function canAccessRoute(route: string, role: PrimaryRole | string): boolean {
  if (role === 'ROLE_TENANT') {
    if (route === 'MyListings') {
      return false;
    }
    return true;
  }
  if (role === 'ROLE_LANDLORD') {
    return true;
  }
  return true;
}

export function isCustomerRole(user: { roles?: string[] } | null | undefined): boolean {
  return getPrimaryRole(user) === 'ROLE_TENANT';
}

export type { RegisterRole };
