/**
 * Starts Symfony (server.js) + WebSocket notification server together for local dev.
 */
const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

const symfony = spawn('node', ['server.js'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

const ws = spawn('node', ['scripts/ws-notification-server.js'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

function shutdown() {
  symfony.kill('SIGINT');
  ws.kill('SIGINT');
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

symfony.on('exit', code => {
  ws.kill('SIGINT');
  process.exit(code ?? 0);
});

ws.on('exit', code => {
  if (code && code !== 0) {
    console.error('[dev:all] WebSocket server exited with code', code);
  }
});

console.log('CasaClick dev: Symfony :8000 + WebSocket :8082');
console.log('Run: npm run android:reverse (includes port 8082)');
