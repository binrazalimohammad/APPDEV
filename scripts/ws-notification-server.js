/**
 * CasaClick notification WebSocket server.
 * Symfony POSTs new notifications here; mobile clients subscribe by JWT user id.
 *
 * Start: npm run ws:server
 * USB:   adb reverse tcp:8082 tcp:8082
 */
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.WS_PORT) || 8082;
const SYMFONY_API = (process.env.SYMFONY_API_ORIGIN || 'http://127.0.0.1:8000').replace(/\/$/, '');
const INTERNAL_SECRET = process.env.WS_INTERNAL_SECRET || 'casaclick-ws-dev-secret';

/** @type {Map<number, Set<import('ws').WebSocket>>} */
const clientsByUserId = new Map();

function addClient(userId, ws) {
  if (!clientsByUserId.has(userId)) {
    clientsByUserId.set(userId, new Set());
  }
  clientsByUserId.get(userId).add(ws);
}

function removeClient(userId, ws) {
  const set = clientsByUserId.get(userId);
  if (!set) {
    return;
  }
  set.delete(ws);
  if (set.size === 0) {
    clientsByUserId.delete(userId);
  }
}

async function validateToken(token) {
  if (!token || token === 'demo') {
    return null;
  }
  try {
    const res = await fetch(`${SYMFONY_API}/api/mobile/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      return null;
    }
    const body = await res.json();
    const user = body?.data ?? body?.user ?? body;
    const id = user?.id;
    if (id == null) {
      return null;
    }
    return { id: Number(id), email: user.email, name: user.name };
  } catch {
    return null;
  }
}

function broadcastToUser(userId, payload) {
  const set = clientsByUserId.get(Number(userId));
  if (!set || set.size === 0) {
    return 0;
  }
  const message = JSON.stringify(payload);
  let sent = 0;
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
      sent += 1;
    }
  }
  return sent;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-WS-Secret');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, clients: clientsByUserId.size, port: PORT }));
    return;
  }

  if (req.method === 'POST' && req.url === '/broadcast') {
    try {
      const secret = req.headers['x-ws-secret'];
      if (secret !== INTERNAL_SECRET) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Forbidden' }));
        return;
      }

      const body = await readJsonBody(req);
      const userId = Number(body.userId);
      if (!userId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'userId required' }));
        return;
      }

      const sent = broadcastToUser(userId, {
        type: 'notification',
        data: body.notification ?? null,
        event: body.event ?? 'new_notification',
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, sent }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : 'Error' }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server, path: '/notifications' });

wss.on('connection', ws => {
  /** @type {number | null} */
  let userId = null;
  let authed = false;

  ws.on('message', async raw => {
    try {
      const msg = JSON.parse(String(raw));
      if (msg.type === 'auth') {
        const profile = await validateToken(msg.token);
        if (!profile) {
          ws.send(JSON.stringify({ type: 'auth_error', error: 'Invalid token' }));
          ws.close(4001, 'Unauthorized');
          return;
        }
        userId = profile.id;
        authed = true;
        addClient(userId, ws);
        ws.send(JSON.stringify({ type: 'auth_ok', userId }));
        return;
      }
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch {
      ws.send(JSON.stringify({ type: 'error', error: 'Invalid message' }));
    }
  });

  ws.on('close', () => {
    if (userId != null) {
      removeClient(userId, ws);
    }
  });

  // Require auth within 10s
  setTimeout(() => {
    if (!authed && ws.readyState === ws.OPEN) {
      ws.close(4001, 'Auth timeout');
    }
  }, 10000);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CasaClick WebSocket notifications on ws://0.0.0.0:${PORT}/notifications`);
  console.log(`Symfony API for JWT check: ${SYMFONY_API}`);
  console.log(`Broadcast: POST http://127.0.0.1:${PORT}/broadcast (X-WS-Secret)`);
  console.log('USB phone: adb reverse tcp:8082 tcp:8082');
});
