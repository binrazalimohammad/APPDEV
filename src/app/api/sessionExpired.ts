import { Alert } from 'react-native';

import type { AppDispatch } from '../store';
import { userLogout } from '../authSlice';

export class SessionExpiredError extends Error {
  readonly code = 'SESSION_EXPIRED';

  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

export function isSessionExpiredError(error: unknown): boolean {
  if (error instanceof SessionExpiredError) {
    return true;
  }
  if (error instanceof Error) {
    const m = error.message.toLowerCase();
    return (
      m.includes('expired jwt') ||
      m.includes('jwt expired') ||
      m.includes('invalid jwt') ||
      m.includes('jwt token') ||
      m.includes('token expired') ||
      m.includes('session expired') ||
      m.includes('unauthorized') && m.includes('token')
    );
  }
  return false;
}

export function isSessionExpiredResponse(status: number, message: string): boolean {
  if (status === 401) {
    return true;
  }
  const m = message.toLowerCase();
  return (
    m.includes('expired jwt') ||
    m.includes('jwt expired') ||
    m.includes('invalid jwt') ||
    m.includes('token expired')
  );
}

let handleSessionExpired: (() => void) | null = null;
let alertShown = false;

/** Call once at app start — clears stored token and returns user to sign-in */
export function registerSessionExpiredHandler(dispatch: AppDispatch): void {
  handleSessionExpired = () => {
    dispatch(userLogout());
    if (!alertShown) {
      alertShown = true;
      Alert.alert(
        'Session expired',
        'Your sign-in has expired. Please sign in again with your email and password.',
        [{ text: 'OK', onPress: () => { alertShown = false; } }],
      );
    }
  };
}

export function notifySessionExpired(): void {
  handleSessionExpired?.();
}
