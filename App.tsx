/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import Navigations from './src/navigations';
import configureStore from './src/app/reducers';
import rootSaga from './src/app/saga';

const App = () => {
  const { store, persistor, runSaga } = React.useMemo(() => configureStore(), []);

  React.useEffect(() => {
    runSaga(rootSaga);
  }, [runSaga]);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <View style={{ flex: 1 }}>
          <Navigations />
        </View>
      </PersistGate>
    </Provider>
  );
};

export default App;
