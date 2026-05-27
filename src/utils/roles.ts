import type { MobileUserProfile } from '../app/api/types';

export type PrimaryRole =
  | 'ROLE_ADMIN'
  | 'ROLE_STAFF'
  | 'ROLE_LANDLORD'
  | 'ROLE_TENANT';

export function getPrimaryRole(user: MobileUserProfile | null | undefined): PrimaryRole {
  const roles = user?.roles ?? [];
  if (roles.includes('ROLE_ADMIN')) {
    return 'ROLE_ADMIN';
  }
  if (roles.includes('ROLE_STAFF')) {
    return 'ROLE_STAFF';
  }
  if (roles.includes('ROLE_LANDLORD')) {
    return 'ROLE_LANDLORD';
  }
  return 'ROLE_TENANT';
}

export function getRoleLabel(role: PrimaryRole | string): string {
  switch (role) {
    case 'ROLE_ADMIN':
      return 'Admin';
    case 'ROLE_STAFF':
      return 'Staff';
    case 'ROLE_LANDLORD':
      return 'Landlord';
    default:
      return 'Tenant';
  }
}

export const ROLE_BADGE_COLORS: Record<
  PrimaryRole,
  { bg: string; text: string; border: string }
> = {
  ROLE_ADMIN: { bg: '#F5E6D3', text: '#6D3710', border: '#D2B48C' },
  ROLE_STAFF: { bg: '#F4F8FF', text: '#2C5282', border: '#B8D4F0' },
  ROLE_LANDLORD: { bg: '#FFF8E6', text: '#7A5A00', border: '#E8DCC0' },
  ROLE_TENANT: { bg: '#F0FFF4', text: '#1E5C2E', border: '#B8E0C8' },
};
