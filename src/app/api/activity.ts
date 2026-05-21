import { apiFetch } from './client';
import { MOBILE_API_BASE_URL } from './config';
import { ROUTES } from '../../utils/routes';

export type MobileActivityAction =
  | 'MOBILE_LOGIN'
  | 'MOBILE_LOGOUT'
  | 'MOBILE_VIEW'
  | 'MOBILE_REGISTER';

const SCREEN_LABELS: Record<string, string> = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.LISTINGS]: 'Listings',
  [ROUTES.LISTING_DETAIL]: 'Listing detail',
  [ROUTES.APPLICATIONS]: 'Applications',
  [ROUTES.APPLICATION_DETAIL]: 'Application detail',
  [ROUTES.PAYMENTS]: 'Payments',
  [ROUTES.NOTIFICATIONS]: 'Notifications',
  [ROUTES.ABOUT]: 'About',
  [ROUTES.CONTACT]: 'Contact',
  [ROUTES.PROFILE]: 'Profile',
  [ROUTES.LOGIN]: 'Login',
  [ROUTES.REGISTER]: 'Register',
  [ROUTES.AUTH]: 'Welcome',
};

export function screenActivityLabel(routeName: string): string {
  const label = SCREEN_LABELS[routeName] ?? routeName;
  return `Opened ${label}`;
}

/** Report a user action to CasaClick (admin Activity Logs, ~8s refresh on website). */
export async function trackMobileActivity(
  action: MobileActivityAction | string,
  targetData: string,
  details?: string,
  token?: string | null,
): Promise<void> {
  if (!token || token === 'demo') {
    return;
  }
  try {
    await apiFetch('/activity', {
      method: 'POST',
      baseUrl: MOBILE_API_BASE_URL,
      token,
      body: {
        action,
        targetData,
        ...(details ? { details } : {}),
      },
    });
  } catch {
    // Non-blocking — do not interrupt the user flow
  }
}

export function getActiveRouteName(
  state: { routes: { name: string; state?: unknown }[]; index: number } | undefined,
): string | undefined {
  if (!state?.routes?.length) {
    return undefined;
  }
  const route = state.routes[state.index];
  if (!route) {
    return undefined;
  }
  const nested = route.state as typeof state | undefined;
  if (nested) {
    return getActiveRouteName(nested);
  }
  return route.name;
}
