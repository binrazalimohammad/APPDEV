import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/auth/LoginScreen';

import { ROUTES } from '../utils';

const Stack = createStackNavigator();

const AuthNav = () => {
  return (
    <Stack.Navigator initialRouteName={ROUTES.LOGIN}>
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
    </Stack.Navigator>
  );
};

export default AuthNav;

