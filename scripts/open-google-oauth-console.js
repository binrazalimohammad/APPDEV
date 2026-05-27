/**
 * Opens Google Cloud OAuth client editor and copies redirect URIs to clipboard (Windows).
 * Run: npm run google:setup
 */
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const WEBSITEDEV_ENV = path.resolve(__dirname, '../../../websitedev/.env');
const CASACLICK_ENV = path.resolve(__dirname, '../../casaclick/.env');
const CONFIG_TS = path.join(__dirname, '..', 'src', 'app', 'api', 'config.ts');

function readFromEnvFiles(key) {
  for (const file of [WEBSITEDEV_ENV, CASACLICK_ENV]) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const m = text.match(new RegExp(`^${key}=(\\S+)`, 'm'));
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function readConfigTs() {
  const text = fs.readFileSync(CONFIG_TS, 'utf8');
  const prod = text.match(/PRODUCTION_API_ORIGIN\s*=\s*'([^']+)'/);
  const useProd = text.includes('USE_PRODUCTION_API = true');
  const usbAdb = text.includes("ANDROID_CONNECT_MODE: AndroidConnectMode = 'usb-adb'");
  return {
    productionOrigin: prod?.[1]?.replace(/\/$/, '') ?? '',
    useProduction: useProd,
    usbAdb,
  };
}

const clientId = readFromEnvFiles('GOOGLE_OAUTH_CLIENT_ID');
if (!clientId) {
  console.error('Missing GOOGLE_OAUTH_CLIENT_ID in websitedev/.env or casaclick/.env');
  process.exit(1);
}

const { productionOrigin, useProduction, usbAdb } = readConfigTs();
const clientKey = clientId.replace('.apps.googleusercontent.com', '');
const projectNumber = clientKey.split('-')[0];

const pathSuffix = '/connect/google/check';
const uris = new Set();
if (usbAdb) {
  uris.add(`http://127.0.0.1:8000${pathSuffix}`);
  uris.add(`http://localhost:8000${pathSuffix}`);
}
if (useProduction && productionOrigin) {
  uris.add(`${productionOrigin}${pathSuffix}`);
}
if (uris.size === 0) {
  uris.add(`http://127.0.0.1:8000${pathSuffix}`);
}

const origins = [...uris].map(u => u.replace(/\/connect\/google\/check$/, ''));
const clipboardText = [
  'Web OAuth client (GOOGLE_OAUTH_CLIENT_ID) — NOT the Android client.',
  '',
  'Authorized redirect URIs → + ADD URI → paste each line → SAVE:',
  '',
  ...[...uris],
  '',
  'Authorized JavaScript origins → + ADD URI → paste each line → SAVE:',
  '',
  ...origins,
  '',
  `Client ID on server: ${clientId}`,
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

console.log('In the browser (fix redirect_uri_mismatch):');
console.log('  1. Confirm client name ends with ...r526rlq... (Web application)');
console.log('  2. Authorized redirect URIs → + ADD URI → paste from clipboard');
console.log('  3. Authorized JavaScript origins → + ADD URI → paste origins from clipboard');
console.log('  4. Click SAVE on each section, wait ~1 minute');
console.log('  5. Try Continue with Google on the phone again\n');
