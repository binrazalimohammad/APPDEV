/**
 * CasaClick API — same role as khrings/Appdev server.js
 * https://github.com/khrings/Appdev/blob/main/server.js
 *
 * Appdev:  node server.js  → Express on 0.0.0.0
 * BinRazali: node server.js → Symfony (websitedev) on 0.0.0.0:8000
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const routes = require('./authRoutes');

const PORT = Number(process.env.PORT) || 8000;

function findWebsiteRoot() {
  const fromEnv = process.env.CASACLICK_WEB;
  const candidates = [
    fromEnv,
    path.resolve(__dirname, '../../websitedev'),
    path.resolve(__dirname, '../casaclick'),
  ].filter(Boolean);

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'public', 'index.php'))) {
      return dir;
    }
  }
  return null;
}

function printLanIp() {
  const configPath = path.join(__dirname, 'src', 'app', 'api', 'config.ts');
  try {
    const src = fs.readFileSync(configPath, 'utf8');
    const m = src.match(/export const DEV_API_PC_IP = '([^']+)'/);
    if (m?.[1]) {
      console.log(`Phone (Wi‑Fi / LAN): http://${m[1]}:${PORT}`);
      console.log('  Update IP: npm run sync:pc-ip');
    }
  } catch {
    // optional
  }
  console.log(`USB + adb reverse: http://127.0.0.1:${PORT}  (npm run android:reverse)`);
}

const webRoot = findWebsiteRoot();
if (!webRoot) {
  console.error('CasaClick website not found.');
  console.error('Clone websitedev to ../../websitedev or set CASACLICK_WEB=path');
  process.exit(1);
}

console.log('CasaClick API (Appdev-style server.js)');
console.log('Website folder:', webRoot);
console.log('Auth routes (Symfony):', routes.LOGIN, routes.REGISTER);
printLanIp();
console.log(`PC browser: http://127.0.0.1:${PORT}`);
console.log(`Health: http://127.0.0.1:${PORT}${routes.HEALTH}`);
console.log('Press Ctrl+C to stop.\n');

const child = spawn('php', ['-S', `0.0.0.0:${PORT}`, '-t', 'public'], {
  cwd: webRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', code => process.exit(code ?? 0));
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
