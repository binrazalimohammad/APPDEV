export const ROUTES = {
  AUTH: 'Auth',
  LOGIN: 'Login',
  HOME: 'Home',
  LISTINGS: 'Listings',
  LISTING_DETAIL: 'ListingDetail',
  APPLICATIONS: 'Applications',
  APPLICATION_DETAIL: 'ApplicationDetail',
  PAYMENTS: 'Payments',
  NOTIFICATIONS: 'Notifications',
  ABOUT: 'About',
  CONTACT: 'Contact',
  REGISTER: 'Register',
  PROFILE: 'Profile',
  MY_LISTINGS: 'MyListings',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];

export default ROUTES;
