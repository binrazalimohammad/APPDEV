import type { StackNavigationProp } from '@react-navigation/stack';

import type { MainStackParamList } from '../navigation/types';
import { ROUTES } from './routes';

export type DashboardLinkId =
  | 'listings'
  | 'my_listings'
  | 'applications'
  | 'payments'
  | 'notifications'
  | 'profile'
  | 'about'
  | 'contact'
  | 'admin_area';

type Nav = StackNavigationProp<MainStackParamList>;

export function navigateDashboardLink(
  navigation: Nav,
  linkId: DashboardLinkId,
): void {
  switch (linkId) {
    case 'listings':
      navigation.navigate(ROUTES.LISTINGS);
      break;
    case 'my_listings':
      navigation.navigate(ROUTES.MY_LISTINGS);
      break;
    case 'applications':
      navigation.navigate(ROUTES.APPLICATIONS);
      break;
    case 'payments':
      navigation.navigate(ROUTES.PAYMENTS);
      break;
    case 'notifications':
      navigation.navigate(ROUTES.NOTIFICATIONS);
      break;
    case 'profile':
      navigation.navigate(ROUTES.PROFILE);
      break;
    case 'about':
      navigation.navigate(ROUTES.ABOUT);
      break;
    case 'contact':
      navigation.navigate(ROUTES.CONTACT);
      break;
    case 'admin_area':
      navigation.navigate(ROUTES.PROFILE);
      break;
    default:
      break;
  }
}
