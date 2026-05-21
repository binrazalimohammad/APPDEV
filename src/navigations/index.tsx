/**
 * Root navigation — auth stack vs main stack when JWT is present.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import type { RootState } from '../app/reducers';
import { useActivityNavigationTracking } from '../components/ActivityNavigationTracker';
import MobileAccessGate from '../components/MobileAccessGate';
import AuthNav from './AuthNav';
import MainNav from './MainNav';

const Navigation = () => {
  const token = useSelector((s: RootState) => s.auth.token);
  const isLoggedIn = Boolean(token);
  const onNavStateChange = useActivityNavigationTracking();

  return (
    <NavigationContainer
      key={isLoggedIn ? 'logged-in' : 'logged-out'}
      onStateChange={onNavStateChange}
    >
      {isLoggedIn ? (
        <MobileAccessGate>
          <MainNav />
        </MobileAccessGate>
      ) : (
        <AuthNav />
      )}
    </NavigationContainer>
  );
};

export default Navigation;
