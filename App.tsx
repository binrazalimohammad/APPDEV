/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SessionBootstrap from './src/components/SessionBootstrap';
import ErrorBoundary from './src/components/ErrorBoundary';
import ErrorDisplay from './src/components/ErrorDisplay';
import Navigation from './src/navigations';
import { configureGoogleSignIn } from './src/services/googleSignIn';
import { persistor, store } from './src/app/reducers';
import { COLORS } from './src/utils';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

const App = () => {
  React.useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.root}>
            <ErrorBoundary>
              <SessionBootstrap>
                <Navigation />
                <ErrorDisplay />
              </SessionBootstrap>
            </ErrorBoundary>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
