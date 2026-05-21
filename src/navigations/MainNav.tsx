import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

import TenantHeaderLeft from '../components/dashboard/TenantHeaderLeft';
import TenantSidebarHost from '../components/dashboard/TenantSidebarHost';
import type { RootState } from '../app/reducers';
import type { MainStackParamList } from '../types/navigation';
import AboutScreen from '../screens/main/AboutScreen';
import ApplicationDetailScreen from '../screens/main/ApplicationDetailScreen';
import ApplicationsScreen from '../screens/main/ApplicationsScreen';
import ContactScreen from '../screens/main/ContactScreen';
import ListingDetailScreen from '../screens/main/ListingDetailScreen';
import ListingsScreen from '../screens/main/ListingsScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import PaymentsScreen from '../screens/main/PaymentsScreen';
import MyListingsScreen from '../screens/main/MyListingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import HomeScreen from './screens/HomeScreen';
import { COLORS, ROUTES } from '../utils';
import { getPrimaryRole } from '../utils/roles';

const Stack = createStackNavigator<MainStackParamList>();

const baseScreenOptions = {
  headerStyle: {
    backgroundColor: COLORS.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  headerTintColor: COLORS.primary,
  headerShadowVisible: false,
  cardStyle: { backgroundColor: COLORS.background },
};

const MainNav = () => {
  const user = useSelector((s: RootState) => s.auth.user);
  const isTenant = getPrimaryRole(user) === 'ROLE_TENANT';

  return (
    <TenantSidebarHost>
      <Stack.Navigator
        screenOptions={{
          ...baseScreenOptions,
          headerLeft: isTenant ? () => <TenantHeaderLeft /> : undefined,
        }}
      >
        <Stack.Screen name={ROUTES.HOME} component={HomeScreen} options={{ title: 'Dashboard' }} />
        <Stack.Screen
          name={ROUTES.MY_LISTINGS}
          component={MyListingsScreen}
          options={{ title: 'My listings' }}
        />
        <Stack.Screen name={ROUTES.LISTINGS} component={ListingsScreen} options={{ title: 'Listings' }} />
        <Stack.Screen
          name={ROUTES.LISTING_DETAIL}
          component={ListingDetailScreen}
          options={{ title: 'Listing' }}
        />
        <Stack.Screen
          name={ROUTES.APPLICATIONS}
          component={ApplicationsScreen}
          options={{ title: 'Applications' }}
        />
        <Stack.Screen
          name={ROUTES.APPLICATION_DETAIL}
          component={ApplicationDetailScreen}
          options={{ title: 'Application' }}
        />
        <Stack.Screen name={ROUTES.PAYMENTS} component={PaymentsScreen} options={{ title: 'Payments' }} />
        <Stack.Screen
          name={ROUTES.NOTIFICATIONS}
          component={NotificationsScreen}
          options={{ title: 'Notifications' }}
        />
        <Stack.Screen name={ROUTES.ABOUT} component={AboutScreen} options={{ title: 'About' }} />
        <Stack.Screen name={ROUTES.CONTACT} component={ContactScreen} options={{ title: 'Contact' }} />
        <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} options={{ title: 'Profile' }} />
      </Stack.Navigator>
    </TenantSidebarHost>
  );
};

export default MainNav;
