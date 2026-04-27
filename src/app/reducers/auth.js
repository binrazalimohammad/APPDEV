import {
  USER_LOGIN,
  USER_LOGIN_COMPLETED,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_LOGIN_RESET,
} from '../action';

const INITIAL_STATE = {
  user: null,
  token: null,
  data: null,
  isLoading: false,
  isError: false,
  error: null,
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        data: null,
        isLoading: true,
        isError: false,
        error: null,
      };

    case USER_LOGIN_COMPLETED: {
      const payload = action.payload ?? {};
      return {
        ...state,
        user: payload.user ?? null,
        token: payload.token ?? payload?.data?.token ?? state.token,
        data: payload,
        isLoading: false,
        isError: false,
        error: null,
      };
    }

    case USER_LOGIN_ERROR:
      return {
        ...state,
        data: null,
        isLoading: false,
        isError: true,
        error: action.payload,
      };

    case USER_LOGIN_RESET:
      return INITIAL_STATE;

    default:
      return state;
  }
}

export const userLogin = payload => ({
  type: USER_LOGIN,
  payload,
});

export const resetLogin = () => ({
  type: USER_LOGIN_RESET,
});
