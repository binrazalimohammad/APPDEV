/**
 * Auth context hook (Appdev-style) — thin wrapper over Redux auth state.
 */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  clearAuthError,
  userLogin,
  userGoogleLogin,
  userLogout,
  userRegister,
  type AuthUser,
  type GoogleSignInOptions,
} from '../app/reducers/auth';
import type { AppDispatch, RootState } from '../app/reducers';

export type AuthContextValue = {
  user: AuthUser;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => void;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    role?: import('../app/api/types').RegisterRole;
  }) => void;
  googleLogin: (options?: GoogleSignInOptions) => void;
  logout: () => void;
  clearError: () => void;
};

export function useAuth(): AuthContextValue {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading, error } = useSelector((s: RootState) => s.auth);

  return {
    user,
    token,
    isLoading,
    error,
    isLoggedIn: Boolean(token),
    login: useCallback(
      (email: string, password: string) => dispatch(userLogin({ email, password })),
      [dispatch],
    ),
    register: useCallback(
      (payload: Parameters<typeof userRegister>[0]) => dispatch(userRegister(payload)),
      [dispatch],
    ),
    googleLogin: useCallback(
      (options?: GoogleSignInOptions) => dispatch(userGoogleLogin(options)),
      [dispatch],
    ),
    logout: useCallback(() => dispatch(userLogout()), [dispatch]),
    clearError: useCallback(() => dispatch(clearAuthError()), [dispatch]),
  };
}
