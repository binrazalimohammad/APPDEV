/**
 * Ping CasaClick API (same hosts as mobile app config + 127.0.0.1).
 * Run: npm run server  then  npm run api:ping
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TIMEOUT_MS = 8000;
const PORT = 8000;
const CONFIG_PATH = path.join(__dirname, '..', 'src', 'app', 'api', 'config.ts');

function readDevApiPcIp() {
  try {
    const src = fs.readFileSync(CONFIG_PATH, 'utf8');
    const m = src.match(/export const DEV_API_PC_IP = '([^']+)'/);
    return m?.[1] ?? null;
  } catch {
    return null;
  }
}

function getCandidates() {
  const seen = new Set();
  const list = [];

  const add = host => {
    if (!host || host === '0.0.0.0') {
      return;
    }
    const origin = `http://${host}:${PORT}`;
    if (!seen.has(origin)) {
      seen.add(origin);
      list.push(origin);
    }
  };

  const fromConfig = readDevApiPcIp();
  if (fromConfig) {
    add(fromConfig);
  }
  add('127.0.0.1');
  add('localhost');

  return list;
}

function fetchWithTimeout(url, options = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(t));
}

async function get(base, path) {
  const res = await fetchWithTimeout(`${base}${path}`, {
    headers: { Accept: 'application/json' },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { ok: res.ok, status: res.status, json };
}

(async () => {
  const candidates = getCandidates();
  let base = null;

  for (const origin of candidates) {
    try {
      const health = await get(origin, '/api/mobile/health');
      if (health.ok && health.json?.success !== false) {
        base = origin;
        console.log('CasaClick API ping →', base, '(health OK)');
        break;
      }
      if (health.status === 401) {
        console.warn(`WARN ${origin}/api/mobile/health → 401 (add PUBLIC_ACCESS for health in security.yaml)`);
      }
    } catch (e) {
      console.warn(`skip ${origin}:`, e.message || e);
    }
  }

  if (!base) {
    console.error('FAIL — no host responded. Tried:', candidates.join(', '));
    console.error('Start: npm run server');
    process.exitCode = 1;
    return;
  }

  for (const path of ['/api/mobile/home', '/api/mobile/listings']) {
    const r = await get(base, path);
    const count = r.json?.data?.length ?? r.json?.meta?.count ?? '—';
    console.log(`${r.ok ? 'OK' : 'FAIL'} ${path} (${r.status})`, r.ok ? `items/stats: ${count}` : r.json);
  }

  const login = await fetchWithTimeout(`${base}/api/login_check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: 'tenant@example.com', password: 'tenant2222' }),
  });
  const loginJson = await login.json().catch(() => ({}));
  console.log(
    login.ok ? 'OK' : 'FAIL',
    '/api/login_check',
    `(${login.status})`,
    login.ok ? 'token received' : loginJson.message || loginJson.error || loginJson,
  );
  if (!login.ok) {
    process.exitCode = 1;
  }
})();
