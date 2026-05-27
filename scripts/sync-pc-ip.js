/**
 * Reads Windows ipconfig and updates ANDROID_PC_LAN_HOST in src/app/api/config.ts.
 * Run: npm run sync:pc-ip
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'src', 'app', 'api', 'config.ts');
const WEBSITEDEV_ENV_LOCAL = path.join(__dirname, '..', '..', '..', 'websitedev', '.env.local');

const VIRTUAL_PREFIXES = [
  '192.168.56.',
  '192.168.135.',
  '192.168.233.',
  '172.16.',
  '172.17.',
  '172.18.',
  '172.19.',
  '172.20.',
  '172.21.',
  '172.22.',
  '172.23.',
  '172.24.',
  '172.25.',
  '172.26.',
  '172.27.',
  '172.28.',
  '172.29.',
  '172.30.',
  '172.31.',
];

function isVirtual(ip) {
  return VIRTUAL_PREFIXES.some(p => ip.startsWith(p));
}

function scoreIp(ip) {
  if (isVirtual(ip)) {
    return -1;
  }
  if (ip.startsWith('192.168.137.')) {
    return 100; // Windows USB tethering / phone hotspot to PC
  }
  if (ip.startsWith('192.168.1.') || ip.startsWith('192.168.0.')) {
    return 80;
  }
  if (ip.startsWith('192.168.')) {
    return 60;
  }
  if (ip.startsWith('10.')) {
    return 40;
  }
  return 10;
}

function pickBestIpv4(text) {
  const matches = [...text.matchAll(/IPv4 Address[^:]*:\s*([\d.]+)/gi)];
  const ips = matches.map(m => m[1].trim()).filter(ip => ip && ip !== '127.0.0.1');
  if (ips.length === 0) {
    return null;
  }
  return ips.sort((a, b) => scoreIp(b) - scoreIp(a))[0];
}

function updateConfig(ip) {
  let src = fs.readFileSync(CONFIG_PATH, 'utf8');
  const re = /export const DEV_API_PC_IP = '[^']*';/;
  if (!re.test(src)) {
    throw new Error('DEV_API_PC_IP not found in config.ts');
  }
  src = src.replace(re, `export const DEV_API_PC_IP = '${ip}';`);
  fs.writeFileSync(CONFIG_PATH, src, 'utf8');
}

/** So Paymongo demo checkout + email links use the PC LAN IP (phone-reachable). */
function updateWebsitedevDefaultUri(ip) {
  if (!fs.existsSync(WEBSITEDEV_ENV_LOCAL)) {
    return;
  }
  const uri = `http://${ip}:8000`;
  let env = fs.readFileSync(WEBSITEDEV_ENV_LOCAL, 'utf8');
  if (/^DEFAULT_URI=/m.test(env)) {
    env = env.replace(/^DEFAULT_URI=.*/m, `DEFAULT_URI=${uri}`);
  } else if (/^#\s*DEFAULT_URI=/m.test(env)) {
    env = env.replace(/^#\s*DEFAULT_URI=.*/m, `DEFAULT_URI=${uri}`);
  } else {
    env = env.trimEnd() + `\nDEFAULT_URI=${uri}\n`;
  }
  fs.writeFileSync(WEBSITEDEV_ENV_LOCAL, env, 'utf8');
}

function main() {
  const out = execSync('ipconfig', { encoding: 'utf8' });
  const ip = pickBestIpv4(out);
  if (!ip) {
    console.error('No IPv4 found. Connect Wi‑Fi or USB tethering, then run ipconfig again.');
    process.exit(1);
  }
  updateConfig(ip);
  updateWebsitedevDefaultUri(ip);
  console.log(`Updated DEV_API_PC_IP → ${ip}`);
  if (fs.existsSync(WEBSITEDEV_ENV_LOCAL)) {
    console.log(`Updated websitedev/.env.local DEFAULT_URI → http://${ip}:8000`);
  }
  console.log('');
  console.log('USB steps (default ANDROID_CONNECT_MODE = usb-adb):');
  console.log('  1. npm run server');
  console.log('  2. npm run android:usb     (reverse 8081+8000, install app)');
  console.log('  Google OAuth: http://127.0.0.1:8000/connect/google/check in Cloud Console');
  console.log('');
  console.log('Wi‑Fi only: set ANDROID_CONNECT_MODE = "usb-lan" in config.ts (browser Google may fail on LAN IP)');
  console.log('');
  console.log(`Test API from PC: http://${ip}:8000/api/mobile/home`);
}

main();
