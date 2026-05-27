/**
 * Root saga — khrings/Appdev src/app/sagas/index.ts
 */
import { all, fork } from 'redux-saga/effects';

import { authSaga } from './auth';
import { listingSaga } from './listing';
import { applicationSaga } from './application';

export default function* rootSaga() {
  yield all([fork(authSaga), fork(listingSaga), fork(applicationSaga)]);
}
