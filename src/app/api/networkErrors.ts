import { API_ORIGIN, USB_CONNECT_HINT } from './config';

export function formatFetchError(error: unknown, context: string): string {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  if (
    lower.includes('network request failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('connection refused') ||
    lower.includes('timeout')
  ) {
    return (
      `Cannot reach CasaClick API at ${API_ORIGIN}.\n\n` +
      'On your PC:\n' +
      '1. Stop any other app on port 8000 (not websitedev).\n' +
      '2. Run: npm run server\n' +
      `3. ${USB_CONNECT_HINT}\n` +
      '4. USB cable: npm run android:reverse then reload app (uses 127.0.0.1:8000)\n' +
      '5. Or: npm run sync:pc-ip if your PC Wi‑Fi IP changed\n' +
      '6. Reload the app and try again.'
    );
  }

  if (lower.includes('verify your email')) {
    return (
      `${raw}\n\n` +
      'Demo accounts must be email-verified in the database.\n' +
      'From the casaclick folder run:\n' +
      'php bin/console doctrine:fixtures:load --no-interaction\n' +
      'Or ensure npm run casaclick:serve is running (not another project on port 8000).'
    );
  }

  return raw || context;
}
