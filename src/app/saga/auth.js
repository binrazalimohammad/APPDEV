import { call, put, takeEvery } from 'redux-saga/effects';
import { authLogin } from '../api/auth';

import {
  USER_LOGIN,
  USER_LOGIN_COMPLETED,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
} from '../action';

export function* userLoginAsync(action) {
  const { email, password } = action.payload || {};
  if (!email || !password) {
    yield put({ type: USER_LOGIN_ERROR, payload: 'Email and password are required.' });
    return;
  }

  yield put({ type: USER_LOGIN_REQUEST });
  try {
    const response = yield call(authLogin, { email, password });
    yield put({ type: USER_LOGIN_COMPLETED, payload: response });
  } catch (error) {
    yield put({
      type: USER_LOGIN_ERROR,
      payload: error?.message || 'Login failed. Please try again.',
    });
  }
}

export function* userLogin() {
  yield takeEvery(USER_LOGIN, userLoginAsync);
}