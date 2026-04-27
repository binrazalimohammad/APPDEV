import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';

import AuthNav from './AuthNavigations';
import MainNav from './MainNavigations';
import { COLORS } from '../utils';

enableScreens();

export default () => {
  const isLoggedIn = useSelector(s => Boolean(s?.auth?.token));

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(COLORS.background, true);
    }
    StatusBar.setBarStyle('dark-content', true);
  }, []);

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainNav /> : <AuthNav />}
    </NavigationContainer>
  );
};
