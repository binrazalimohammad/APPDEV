import { applyMiddleware, combineReducers, createStore, compose } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import AsyncStorage from '@react-native-async-storage/async-storage';

import auth from './auth';

// Config
const sagaMiddleware = createSagaMiddleware();
const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['auth'],
};

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: ['isLoading', 'error', 'isError'],
};

// Combine Reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, auth),
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export default () => {
  const middlewares = [sagaMiddleware];

  // DevTools visibility: log every action in the console (works in RN DevTools)
  if (__DEV__) {
    try {
      // eslint-disable-next-line global-require
      const { createLogger } = require('redux-logger');
      middlewares.push(
        createLogger({
          collapsed: true,
          duration: true,
          diff: false,
        })
      );
    } catch (e) {
      // logger not installed/available; ignore safely
    }
  }

  // Redux DevTools: works with React Native Debugger if it injects __REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  const composeEnhancers =
    (typeof global !== 'undefined' && global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
  const enhancer = composeEnhancers(applyMiddleware(...middlewares));
  let store = createStore(persistedReducer, enhancer);

  let persistor = persistStore(store);

  const runSaga = sagaMiddleware.run.bind(sagaMiddleware);

  return { store, persistor, runSaga };
};