import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { GOOGLE_WEB_CLIENT_ID } from '../config/google';

let configured = false;

/** Call once at app start (also safe to call again). */
export function configureGoogleSignIn(): void {
  if (configured || GOOGLE_WEB_CLIENT_ID.includes('REPLACE_WITH')) {
    return;
  }
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

export function isGoogleSignInConfigured(): boolean {
  return !GOOGLE_WEB_CLIENT_ID.includes('REPLACE_WITH');
}

/** Opens Google account picker and returns an ID token for POST /api/auth/google. */
export async function getGoogleIdToken(): Promise<string> {
  configureGoogleSignIn();

  if (!isGoogleSignInConfigured()) {
    throw new Error('Set GOOGLE_WEB_CLIENT_ID in src/config/google.ts');
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  const result = await GoogleSignin.signIn();
  if (result.type !== 'success') {
    throw new Error('Google sign-in was cancelled');
  }

  let idToken = result.data?.idToken ?? null;
  if (!idToken) {
    const tokens = await GoogleSignin.getTokens();
    idToken = tokens.idToken ?? null;
  }

  if (!idToken) {
    throw new Error('Google did not return an ID token');
  }

  return idToken;
}

/** Clears cached Google account so the next sign-in shows the account picker. */
export async function signOutGoogle(): Promise<void> {
  if (!isGoogleSignInConfigured()) {
    return;
  }
  try {
    configureGoogleSignIn();
    await GoogleSignin.signOut();
  } catch {
    // non-blocking
  }
}
