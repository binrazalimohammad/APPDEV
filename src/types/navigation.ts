import type { ROUTES } from '../utils/routes';

export type AuthStackParamList = {
  [ROUTES.AUTH]: undefined;
  [ROUTES.LOGIN]: undefined;
  [ROUTES.REGISTER]: undefined;
};

export type MainStackParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.LISTINGS]: undefined;
  [ROUTES.LISTING_DETAIL]: { id: number };
  [ROUTES.APPLICATIONS]: undefined;
  [ROUTES.APPLICATION_DETAIL]: { id: number };
  [ROUTES.PAYMENTS]: undefined;
  [ROUTES.NOTIFICATIONS]: undefined;
  [ROUTES.ABOUT]: undefined;
  [ROUTES.CONTACT]: undefined;
  [ROUTES.PROFILE]: undefined;
  [ROUTES.MY_LISTINGS]: undefined;
};
