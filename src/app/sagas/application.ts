/**
 * Applications saga — Appdev orderSaga mapped to CasaClick bookings.
 */
import { call, put, takeEvery } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { fetchApplications } from '../api/application';
import { formatErrorForRedux } from '../../utils/errorUtils';
import { setError } from '../reducers/error';
import {
  GET_APPLICATIONS_REQUEST,
  GET_APPLICATIONS_COMPLETED,
  GET_APPLICATIONS_ERROR,
} from '../actions';

function* getApplicationsAsync(action: {
  type: string;
  payload?: { token?: string };
}): SagaIterator {
  yield put({ type: GET_APPLICATIONS_REQUEST });
  try {
    const token = action.payload?.token ?? '';
    const items = yield call(fetchApplications, token);
    yield put({ type: GET_APPLICATIONS_COMPLETED, payload: items });
  } catch (error: unknown) {
    const payload = formatErrorForRedux(error, 0);
    yield put({ type: GET_APPLICATIONS_ERROR, payload: payload.message });
    yield put(setError(payload));
  }
}

export function* applicationSaga(): SagaIterator {
  yield takeEvery('GET_APPLICATIONS', getApplicationsAsync);
}
