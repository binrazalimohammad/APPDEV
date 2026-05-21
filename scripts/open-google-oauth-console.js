/**
 * Opens Google Cloud OAuth client editor and copies redirect URIs to clipboard (Windows).
 * Run: npm run google:setup
 */
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const WEBSITEDEV_ENV = path.resolve(__dirname, '../../../websitedev/.env');
const CONFIG_TS = path.join(__dirname, '..', 'src', 'app', 'api', 'config.ts');

function readClientId() {
  if (!fs.existsSync(WEBSITEDEV_ENV)) {
    return null;
  }
  const text = fs.readFileSync(WEBSITEDEV_ENV, 'utf8');
  const m = text.match(/GOOGLE_OAUTH_CLIENT_ID=(\S+)/);
  return m?.[1]?.trim() ?? null;
}

function readConnectMode() {
  const text = fs.readFileSync(CONFIG_TS, 'utf8');
  return text.includes("ANDROID_CONNECT_MODE: AndroidConnectMode = 'usb-adb'") ? 'usb-adb' : 'other';
}

const clientId = readClientId();
if (!clientId) {
  console.error('Missing GOOGLE_OAUTH_CLIENT_ID in websitedev/.env');
  process.exit(1);
}

const clientKey = clientId.replace('.apps.googleusercontent.com', '');
const projectNumber = clientKey.split('-')[0];

const uris =
  readConnectMode() === 'usb-adb'
    ? [
        'http://127.0.0.1:8000/connect/google/check',
        'http://localhost:8000/connect/google/check',
      ]
    : ['http://127.0.0.1:8000/connect/google/check'];

const clipboardText = [
  'Paste under Authorized redirect URIs, then click SAVE:',
  '',
  ...uris,
  '',
  '(Google Cloud → CasaClick Web OAuth client)',
].join('\r\n');

console.log('\n' + clipboardText.replace(/\r/g, '') + '\n');

try {
  if (process.platform === 'win32') {
    const clip = spawn('clip', [], { stdio: ['pipe', 'inherit', 'inherit'] });
    clip.stdin.write(clipboardText);
    clip.stdin.end();
    console.log('Copied redirect URIs to clipboard.\n');
  }
} catch {
  console.log('Copy the URIs above manually.\n');
}

const consoleUrl = `https://console.cloud.google.com/apis/credentials/oauthclient/${clientKey}?project=${projectNumber}`;

console.log('Opening Google Cloud Console in your browser…');
console.log(consoleUrl + '\n');

try {
  if (process.platform === 'win32') {
    execSync(`start "" "${consoleUrl}"`, { shell: true });
  } else if (process.platform === 'darwin') {
    execSync(`open "${consoleUrl}"`);
  } else {
    execSync(`xdg-open "${consoleUrl}"`);
  }
} catch (e) {
  console.error('Could not open browser. Open the URL above manually.');
  process.exit(1);
}

console.log('In the browser:');
console.log('  1. Under Authorized redirect URIs → + ADD URI');
console.log('  2. Paste (Ctrl+V) — already on clipboard');
console.log('  3. Click SAVE');
console.log('  4. Wait ~1 minute, then try Sign in with Google on the phone\n');
