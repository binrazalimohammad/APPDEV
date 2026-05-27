import { Linking } from 'react-native';

import { API_ORIGIN } from '../app/api/config';
import type { RegisterRole } from '../app/api/types';

const OAUTH_DEEP_LINK = 'com.binrazali://oauth';

function readQueryParam(query: string, key: string): string | undefined {
  for (const part of query.split('&')) {
    if (!part) {
      continue;
    }
    const eq = part.indexOf('=');
    const rawKey = eq >= 0 ? part.slice(0, eq) : part;
    if (decodeURIComponent(rawKey) !== key) {
      continue;
    }
    const rawValue = eq >= 0 ? part.slice(eq + 1) : '';
    return decodeURIComponent(rawValue.replace(/\+/g, ' '));
  }
  return undefined;
}

function parseOAuthCallback(url: string): { token?: string; error?: string } {
  if (!url.startsWith(OAUTH_DEEP_LINK)) {
    return {};
  }
  const query = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
  return {
    token: readQueryParam(query, 'token'),
    error: readQueryParam(query, 'error'),
  };
}

/**
 * Opens CasaClick in the device browser for Google OAuth (Web client only).
 * Returns a Lexik JWT when the app receives com.binrazali://oauth?token=...
 */
export function signInWithGoogleBrowser(role?: RegisterRole): Promise<string> {
  const roleParam = role ?? 'ROLE_TENANT';
  const startUrl = `${API_ORIGIN}/mobile/google/start?role=${encodeURIComponent(roleParam)}`;

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      subscription.remove();
      fn();
    };

    const handleUrl = (url: string) => {
      const { token, error } = parseOAuthCallback(url);
      if (!url.startsWith(OAUTH_DEEP_LINK)) {
        return;
      }
      if (token) {
        finish(() => resolve(token));
        return;
      }
      finish(() => reject(new Error(error ?? 'Google sign-in failed')));
    };

    const subscription = Linking.addEventListener('url', event => {
      handleUrl(event.url);
    });

    const timer = setTimeout(() => {
      finish(() =>
        reject(
          new Error(
            'Google sign-in timed out. Run npm run server, npm run android:reverse, and add http://127.0.0.1:8000/connect/google/check in Google Cloud.',
          ),
        ),
      );
    }, 120_000);

    Linking.getInitialURL()
      .then(initial => {
        if (initial) {
          handleUrl(initial);
        }
      })
      .catch(() => {});

    Linking.openURL(startUrl).catch(err => {
      finish(() =>
        reject(
          err instanceof Error
            ? err
            : new Error('Could not open Google sign-in in the browser. Is npm run server running?'),
        ),
      );
    });
  });
}
