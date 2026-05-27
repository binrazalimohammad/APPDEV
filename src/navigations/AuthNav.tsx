import { createStackNavigator } from '@react-navigation/stack';

import type { AuthStackParamList } from '../types/navigation';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import { COLORS, ROUTES } from '../utils';

const Stack = createStackNavigator<AuthStackParamList>();

const headerOptions = {
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
};

const AuthNav = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.AUTH}
      screenOptions={{
        ...headerOptions,
        cardStyle: { backgroundColor: COLORS.background },
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name={ROUTES.AUTH}
        component={AuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.LOGIN}
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.REGISTER}
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthNav;
