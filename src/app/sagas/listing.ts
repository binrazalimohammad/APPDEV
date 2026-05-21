/**
 * Listings saga — Appdev petSaga / product flow mapped to CasaClick listings.
 */
import { call, put, takeEvery } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import { fetchListings } from '../api/listing';
import { formatErrorForRedux } from '../../utils/errorUtils';
import { setError } from '../reducers/error';
import {
  GET_LISTINGS_REQUEST,
  GET_LISTINGS_COMPLETED,
  GET_LISTINGS_ERROR,
} from '../actions';

function* getListingsAsync(): SagaIterator {
  yield put({ type: GET_LISTINGS_REQUEST });
  try {
    const items = yield call(fetchListings);
    yield put({ type: GET_LISTINGS_COMPLETED, payload: items });
  } catch (error: unknown) {
    const payload = formatErrorForRedux(error, 0);
    yield put({ type: GET_LISTINGS_ERROR, payload: payload.message });
    yield put(setError(payload));
  }
}

export function* listingSaga(): SagaIterator {
  yield takeEvery('GET_LISTINGS', getListingsAsync);
}
