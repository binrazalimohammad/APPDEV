/** Debug keystore SHA-1 — register this in Google Cloud for package com.binrazali */
export const ANDROID_DEBUG_SHA1 =
  '5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25';

export const ANDROID_PACKAGE = 'com.binrazali';

/** Short message for alerts — not shown as a full-screen banner */
export function isGoogleDeveloperError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const code = (error as { code?: string | number }).code;
    if (code === 10 || code === '10') {
      return true;
    }
  }
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();
  return (
    lower.includes('developer_error') ||
    lower.includes('developer error') ||
    raw === '10'
  );
}

export function getGoogleSignInAlertMessage(raw: string): string {
  const lower = raw.toLowerCase();
  if (isGoogleDeveloperError(new Error(raw))) {
    return (
      'Google sign-in could not finish in the browser.\n\n' +
      'Use Sign in with email (tenant@example.com / tenant2222), or ensure staff Google login works on the server (npm run google:redirect-uris).\n\n' +
      'Optional native fix: Android OAuth client for ' +
      `${ANDROID_PACKAGE} + SHA-1 from npm run android:sha1`
    );
  }
  if (lower.includes('cancel')) {
    return 'Google sign-in was cancelled';
  }
  if (raw.includes('404') || raw.includes('Not Found')) {
    return 'Google login is not on the CasaClick server yet. Use Sign in with email.';
  }
  return raw.length > 200 ? 'Google sign-in failed. Try Sign in with email.' : raw;
}

/** @deprecated Use getGoogleSignInAlertMessage — kept for compatibility */
export function formatGoogleSignInError(raw: string): string {
  return getGoogleSignInAlertMessage(raw);
}
