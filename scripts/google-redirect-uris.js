/**
 * Google OAuth redirect URIs for CasaClick (browser + staff login).
 * With usb-adb, use 127.0.0.1 — Google blocks raw 192.168.x.x callbacks.
 * Run: npm run google:redirect-uris
 */
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'src', 'app', 'api', 'config.ts');
const text = fs.readFileSync(configPath, 'utf8');
const ipMatch = text.match(/DEV_API_PC_IP\s*=\s*'([^']+)'/);
const ip = ipMatch ? ipMatch[1] : 'YOUR_PC_IP';
const prodMatch = text.match(/PRODUCTION_API_ORIGIN\s*=\s*'([^']+)'/);
const prod = prodMatch ? prodMatch[1].replace(/\/$/, '') : '';

const paths = ['/connect/google/check'];
const hosts = ['127.0.0.1', 'localhost', ip];

console.log('\nGoogle Sign-In (usb-adb): phone uses 127.0.0.1 via adb reverse.');
console.log('Add these to Google Cloud → Web OAuth client → Authorized redirect URIs:\n');
for (const host of hosts) {
  for (const p of paths) {
    console.log(`  http://${host}:8000${p}`);
  }
}
if (prod) {
  console.log(`  ${prod}${paths[0]}`);
  console.log('\nAuthorized JavaScript origins (Railway):');
  console.log(`  ${prod}`);
}
console.log('\nRequired for browser Google: http://127.0.0.1:8000/connect/google/check');
console.log('Railway: npm run railway:google-env (after railway login)');
console.log('Then: npm run server → npm run android:usb → Sign in with Google\n');
