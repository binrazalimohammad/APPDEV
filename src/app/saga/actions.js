// AUTH/USER_LOGIN
export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
export const USER_LOGIN_COMPLETED = 'USER_LOGIN_COMPLETED';
export const USER_LOGIN_ERROR = 'USER_LOGIN_ERROR';
export const USER_LOGIN_RESET = 'USER_LOGIN_RESET';

export const userLogin = payload => ({
  type: USER_LOGIN,
  payload,
});

export const userLoginRequest = () => ({
  type: USER_LOGIN_REQUEST,
});

export const userLoginCompleted = payload => ({
  type: USER_LOGIN_COMPLETED,
  payload,
});

export const userLoginError = errorMessage => ({
  type: USER_LOGIN_ERROR,
  payload: errorMessage,
});

export const userLoginReset = () => ({
  type: USER_LOGIN_RESET,
});