/**
 * Redux store — khrings/Appdev reducers/index.ts + CasaClick persist on auth.
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer, { type AuthState } from './auth';
import errorReducer, { type ErrorState } from './error';
import rootSaga from '../sagas';

export type { AuthState, ErrorState };

const sagaMiddleware = createSagaMiddleware();

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: ['isLoading', 'isError', 'errorMessage', 'error', 'isRegistering', 'registerErrorMessage'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  error: errorReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => {
    const base = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(sagaMiddleware);

    if (__DEV__) {
      try {
        const { createLogger } = require('redux-logger');
        return base.concat(
          createLogger({ collapsed: true, duration: true, diff: false }),
        );
      } catch {
        return base;
      }
    }

    return base;
  },
});

sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
