/**
 * Auth reducer — khrings/Appdev src/app/reducers/auth.ts (CasaClick user shape kept).
 */
import type { MobileUserProfile, RegisterRole } from '../api/types';
import {
  USER_GOOGLE_LOGIN,
  USER_LOGIN,
  USER_LOGIN_COMPLETED,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_LOGIN_RESET,
  USER_LOGOUT,
  USER_LOGOUT_COMPLETED,
  USER_LOGOUT_ERROR,
  USER_LOGOUT_REQUEST,
  USER_REGISTER,
  USER_REGISTER_COMPLETED,
  USER_REGISTER_ERROR,
  USER_REGISTER_REQUEST,
  USER_REGISTER_RESET,
  REFRESH_PROFILE,
  REFRESH_PROFILE_COMPLETED,
} from '../actions';

export type { RegisterRole };
export type GoogleSignInOptions = { role?: RegisterRole };
export type AuthUser = MobileUserProfile | null;

export type AuthSession = MobileUserProfile & { token: string };

export type AuthState = {
  /** Appdev: auth.data — user + embedded token */
  data: AuthSession | null;
  user: AuthUser;
  token: string | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  /** Screens use `error` — mirrors errorMessage */
  error: string | null;
  registerSuccess: boolean;
  isRegistering: boolean;
  registerErrorMessage: string | null;
};

export type AuthAction = {
  type: string;
  payload?: unknown;
  [extraProp: string]: unknown;
};

const INITIAL_STATE: AuthState = {
  data: null,
  user: null,
  token: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
  error: null,
  registerSuccess: false,
  isRegistering: false,
  registerErrorMessage: null,
};

function applySession(payload: AuthSession): AuthState {
  const { token, ...profile } = payload;
  return {
    data: payload,
    user: profile as MobileUserProfile,
    token,
    isLoading: false,
    isError: false,
    errorMessage: null,
    error: null,
    registerSuccess: false,
    isRegistering: false,
    registerErrorMessage: null,
  };
}

export default function authReducer(
  state: AuthState = INITIAL_STATE,
  action: AuthAction,
): AuthState {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        isLoading: true,
        isError: false,
        errorMessage: null,
        error: null,
      };

    case USER_LOGIN_COMPLETED:
      return applySession(action.payload as AuthSession);

    case USER_LOGIN_ERROR: {
      const msg = (action.payload as string) || 'Login failed';
      return {
        ...INITIAL_STATE,
        isLoading: false,
        isError: true,
        errorMessage: msg,
        error: msg,
      };
    }

    case USER_REGISTER_REQUEST:
      return {
        ...state,
        isRegistering: true,
        registerErrorMessage: null,
        registerSuccess: false,
      };

    case USER_REGISTER_COMPLETED:
      return {
        ...applySession(action.payload as AuthSession),
        registerSuccess: true,
      };

    case USER_REGISTER_ERROR: {
      const msg = (action.payload as string) || 'Registration failed';
      return {
        ...state,
        isRegistering: false,
        registerErrorMessage: msg,
        registerSuccess: false,
      };
    }

    case USER_LOGOUT_REQUEST:
      return { ...state, isLoading: true };

    case USER_LOGOUT_COMPLETED:
      return { ...INITIAL_STATE };

    case USER_LOGOUT_ERROR: {
      const msg = (action.payload as string) || 'Logout failed';
      return {
        ...state,
        isLoading: false,
        errorMessage: msg,
        error: msg,
      };
    }

    case REFRESH_PROFILE_COMPLETED:
      if (!state.token) {
        return state;
      }
      return {
        ...state,
        user: (action.payload as MobileUserProfile) ?? state.user,
        data: state.data
          ? { ...state.data, ...(action.payload as MobileUserProfile), token: state.token }
          : state.data,
      };

    case USER_LOGIN_RESET:
    case USER_REGISTER_RESET:
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// —— Action creators (Appdev) ——

export const userLogin = (payload: { email: string; password: string }) => ({
  type: USER_LOGIN,
  payload,
});

export const userGoogleLogin = (payload?: { role?: RegisterRole }) => ({
  type: USER_GOOGLE_LOGIN,
  payload,
});

export const userRegister = (payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role?: RegisterRole;
}) => ({
  type: USER_REGISTER,
  payload,
});

export const userLogout = () => ({ type: USER_LOGOUT });

export const clearAuthError = () => ({ type: USER_LOGIN_RESET });

export const refreshProfile = () => ({ type: REFRESH_PROFILE });

/** @deprecated Use userLogout */
export const performLogout = userLogout;

/** @deprecated Use userLogin */
export const loginWithPassword = userLogin;

/** @deprecated Use userGoogleLogin */
export const loginWithGoogle = userGoogleLogin;

/** @deprecated Use userRegister */
export const registerWithEmail = userRegister;

export const logout = () => ({ type: USER_LOGOUT_COMPLETED });
