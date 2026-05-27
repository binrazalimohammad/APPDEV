import { call, put, takeEvery, select } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { trackMobileActivity } from '../api/activity';
import { authLoginRaw } from '../api/auth';
import { exchangeGoogleIdToken } from '../api/googleAuth';
import { fetchMobileProfile } from '../api/auth';
import { formatFetchError } from '../api/networkErrors';
import type { MobileUserProfile, RegisterRole } from '../api/types';
import { getGoogleIdToken, signOutGoogle } from '../../services/googleSignIn';
import { signInWithGoogleBrowser } from '../../services/googleSignInBrowser';
import { ALLOW_DEMO_LOGIN } from '../../constants/demoAuth';
import {
  getGoogleSignInAlertMessage,
  isGoogleDeveloperError,
} from '../../utils/googleSignInErrors';
import { formatErrorForRedux } from '../../utils/errorUtils';
import { setError, clearError } from '../reducers/error';
import type { RootState } from '../reducers';
import type { AuthSession } from '../reducers/auth';
import {
  USER_GOOGLE_LOGIN,
  USER_LOGIN,
  USER_LOGIN_COMPLETED,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_LOGOUT,
  USER_LOGOUT_COMPLETED,
  USER_LOGOUT_ERROR,
  USER_LOGOUT_REQUEST,
  USER_REGISTER,
  USER_REGISTER_COMPLETED,
  USER_REGISTER_ERROR,
  USER_REGISTER_REQUEST,
  REFRESH_PROFILE,
  REFRESH_PROFILE_COMPLETED,
} from '../actions';

type AuthAction = { type: string; payload?: unknown };

function* userLoginAsync(action: AuthAction): SagaIterator {
  yield put({ type: USER_LOGIN_REQUEST });
  const { email, password } = action.payload as { email: string; password: string };

  try {
    if (ALLOW_DEMO_LOGIN && email === '123' && password === '123') {
      const demo: AuthSession = {
        token: 'demo',
        email: 'demo@casaclick.test',
        name: 'Demo User',
      };
      yield put({ type: USER_LOGIN_COMPLETED, payload: demo });
      yield put(clearError());
      return;
    }

    const response = yield call(authLoginRaw, { email, password });

    if (response?.ok && response.data?.token) {
      const token = response.data.token;
      const user = response.data.user;
      const session: AuthSession = {
        ...(user ?? { email, name: email.split('@')[0] }),
        token,
      };
      yield call(trackMobileActivity, 'MOBILE_LOGIN', `Signed in via email (${email})`, 'password', token);
      yield put({ type: USER_LOGIN_COMPLETED, payload: session });
      yield put(clearError());
      return;
    }

    const message = response?.data?.message ?? response?.data?.error ?? 'Login failed';
    yield put({ type: USER_LOGIN_ERROR, payload: message });
    yield put(setError(formatErrorForRedux(new Error(message), response?.status ?? 500)));
  } catch (error: unknown) {
    const payload = formatErrorForRedux(error, 0);
    yield put({ type: USER_LOGIN_ERROR, payload: payload.message });
    yield put(setError(payload));
  }
}

function* userGoogleLoginAsync(action: AuthAction): SagaIterator {
  yield put({ type: USER_LOGIN_REQUEST });
  const role = (action.payload as { role?: RegisterRole } | undefined)?.role;

  try {
    let token: string;
    let user: MobileUserProfile | null = null;

    try {
      const idToken: string = yield call(getGoogleIdToken);
      const res = yield call(exchangeGoogleIdToken, idToken, { role });
      token = res.token;
      user = res.user ?? null;
    } catch (nativeError: unknown) {
      if (!isGoogleDeveloperError(nativeError)) {
        throw nativeError;
      }
      token = yield call(signInWithGoogleBrowser, role);
    }

    if (token) {
      try {
        user = yield call(fetchMobileProfile, token);
      } catch {
        // keep user from exchange if any
      }
      yield call(
        trackMobileActivity,
        'MOBILE_LOGIN',
        `Signed in via Google (${user?.email ?? 'account'})`,
        'google',
        token,
      );
    }

    const session: AuthSession = {
      ...(user ?? { email: 'google@user', name: 'Google User' }),
      token,
    };
    yield put({ type: USER_LOGIN_COMPLETED, payload: session });
    yield put(clearError());
  } catch (error: unknown) {
    const raw = error instanceof Error ? error.message : 'Google sign-in failed';
    const message = getGoogleSignInAlertMessage(raw);
    yield put({ type: USER_LOGIN_ERROR, payload: message });
    yield put(setError(formatErrorForRedux(new Error(message), 0)));
  }
}

function* userRegisterAsync(action: AuthAction): SagaIterator {
  yield put({ type: USER_REGISTER_REQUEST });
  const payload = action.payload as {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    role?: RegisterRole;
  };

  try {
    const { registerMobileUser } = yield call(() => import('../api/mobile'));
    const result = yield call(registerMobileUser, {
      ...payload,
      role: payload.role ?? 'ROLE_TENANT',
      platform: 'mobile',
    });

    const session: AuthSession = {
      ...(result.user ?? { email: payload.email, name: payload.name }),
      token: result.token,
    };

    yield call(
      trackMobileActivity,
      'MOBILE_LOGIN',
      `Renter registered (${result.user?.email ?? payload.email})`,
      'register',
      result.token,
    );
    yield put({ type: USER_REGISTER_COMPLETED, payload: session });
    yield put(clearError());
  } catch (error: unknown) {
    const message = formatFetchError(error, 'Registration failed');
    yield put({ type: USER_REGISTER_ERROR, payload: message });
    yield put(setError(formatErrorForRedux(new Error(message), 422)));
  }
}

function* userLogoutAsync(): SagaIterator {
  yield put({ type: USER_LOGOUT_REQUEST });
  const token: string | null = yield select((s: RootState) => s.auth.token);

  try {
    if (token && token !== 'demo') {
      yield call(trackMobileActivity, 'MOBILE_LOGOUT', 'Signed out of CasaClick mobile', undefined, token);
    }
    yield call(signOutGoogle);
    const { resetPreferredApiOrigin } = yield call(() => import('../api/client'));
    yield call(resetPreferredApiOrigin);
    const { persistor } = yield call(() => import('../reducers'));
    yield call([persistor, persistor.purge]);
    yield put({ type: USER_LOGOUT_COMPLETED });
    yield put(clearError());
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    yield put({ type: USER_LOGOUT_ERROR, payload: message });
  }
}

function* refreshProfileAsync(): SagaIterator {
  const token: string | null = yield select((s: RootState) => s.auth.token);
  if (!token || token === 'demo') {
    return;
  }
  try {
    const user = yield call(fetchMobileProfile, token);
    if (user) {
      yield put({ type: REFRESH_PROFILE_COMPLETED, payload: user });
    }
  } catch {
    // ignore
  }
}

export function* authSaga(): SagaIterator {
  yield takeEvery(USER_LOGIN, userLoginAsync);
  yield takeEvery(USER_GOOGLE_LOGIN, userGoogleLoginAsync);
  yield takeEvery(USER_REGISTER, userRegisterAsync);
  yield takeEvery(USER_LOGOUT, userLogoutAsync);
  yield takeEvery(REFRESH_PROFILE, refreshProfileAsync);
}
