/**
 * CasaClick notification Socket.IO server + optional FCM push.
 *
 * Symfony POSTs new notifications here; mobile clients subscribe by JWT user id.
 * FCM: set FIREBASE_SERVICE_ACCOUNT_PATH to a service-account JSON from Firebase Console.
 *
 * Start: npm run io:server
 * USB:   adb reverse tcp:8082 tcp:8082
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const express = require('express');

/** Railway sets PORT; local dev uses WS_PORT or 8082 */
const PORT = Number(process.env.PORT || process.env.WS_PORT) || 8082;
const SYMFONY_API = (process.env.SYMFONY_API_ORIGIN || 'http://127.0.0.1:8000').replace(
  /\/$/,
  '',
);
const INTERNAL_SECRET = process.env.WS_INTERNAL_SECRET || 'casaclick-ws-dev-secret';

/** @type {Map<number, Set<string>>} */
const fcmTokensByUserId = new Map();

let firebaseMessaging = null;

function initFirebaseAdmin() {
  try {
    const admin = require('firebase-admin');
    if (admin.apps.length) {
      firebaseMessaging = admin.messaging();
      return;
    }

    const jsonEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (jsonEnv) {
      const parsed = JSON.parse(jsonEnv);
      admin.initializeApp({ credential: admin.credential.cert(parsed) });
      firebaseMessaging = admin.messaging();
      console.log('[FCM] Firebase Admin ready (FIREBASE_SERVICE_ACCOUNT_JSON)');
      return;
    }

    const saPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!saPath || !fs.existsSync(saPath)) {
      console.log(
        '[FCM] No service account — Socket.IO only (set FIREBASE_SERVICE_ACCOUNT_JSON or PATH)',
      );
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert(require(path.resolve(saPath))),
    });
    firebaseMessaging = admin.messaging();
    console.log('[FCM] Firebase Admin ready');
  } catch (e) {
    console.warn('[FCM] Init failed:', e instanceof Error ? e.message : e);
  }
}

function rememberFcmToken(userId, token) {
  if (!userId || !token || typeof token !== 'string') {
    return;
  }
  if (!fcmTokensByUserId.has(userId)) {
    fcmTokensByUserId.set(userId, new Set());
  }
  fcmTokensByUserId.get(userId).add(token);
}

async function sendFcmToUser(userId, title, body, data = {}) {
  if (!firebaseMessaging) {
    return 0;
  }
  const tokens = new Set();
  const fromBody = data.fcmToken;
  if (fromBody) {
    tokens.add(String(fromBody));
  }
  const stored = fcmTokensByUserId.get(Number(userId));
  if (stored) {
    for (const t of stored) {
      tokens.add(t);
    }
  }
  if (tokens.size === 0) {
    return 0;
  }

  let sent = 0;
  const stringData = {};
  for (const [k, v] of Object.entries(data)) {
    if (v != null) {
      stringData[k] = String(v);
    }
  }

  for (const token of tokens) {
    try {
      await firebaseMessaging.send({
        token,
        notification: { title, body },
        data: stringData,
        android: { priority: 'high' },
      });
      sent += 1;
    } catch (e) {
      console.warn('[FCM] send failed:', e instanceof Error ? e.message : e);
    }
  }
  return sent;
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

const app = express();
app.use(express.json({ limit: '1mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  path: '/notifications',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'X-WS-Secret'],
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token ?? socket.handshake.query?.token;
    const fcmToken = socket.handshake.auth?.fcmToken;
    const profile = await validateToken(String(token ?? ''));
    if (!profile) {
      return next(new Error('Unauthorized'));
    }
    socket.data.userId = profile.id;
    socket.data.profile = profile;
    if (fcmToken) {
      rememberFcmToken(profile.id, String(fcmToken));
    }
    return next();
  } catch {
    return next(new Error('Unauthorized'));
  }
});

io.on('connection', socket => {
  const userId = Number(socket.data.userId);
  if (!userId) {
    socket.disconnect(true);
    return;
  }
  socket.join(`user:${userId}`);
  socket.emit('auth_ok', { userId });

  socket.on('ping', () => {
    socket.emit('pong');
  });
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    clients: io.engine.clientsCount,
    port: PORT,
    fcm: Boolean(firebaseMessaging),
  });
});

app.post('/broadcast', async (req, res) => {
  const secret = req.header('X-WS-Secret');
  if (secret !== INTERNAL_SECRET) {
    res.status(403).json({ ok: false, error: 'Forbidden' });
    return;
  }

  const userId = Number(req.body?.userId);
  if (!userId) {
    res.status(400).json({ ok: false, error: 'userId required' });
    return;
  }

  const notification = req.body?.notification ?? null;
  const eventName = req.body?.event ?? 'new_notification';
  const order = req.body?.order ?? null;

  const notificationPayload = {
    type: 'notification',
    data: notification,
    event: eventName,
  };

  io.to(`user:${userId}`).emit('notification', notificationPayload);

  // Dedicated order status channel for mobile booking screens (real-time UI).
  if (eventName === 'order_updated' && order) {
    io.to(`user:${userId}`).emit('order_updated', {
      order_id: order.order_id,
      customer_id: order.customer_id,
      status: order.status,
      message: order.message,
      timestamp: order.timestamp,
      statusLabel: order.statusLabel ?? order.status,
      notification,
    });
  }

  const message =
    notification?.message ?? req.body?.message ?? 'You have a new notification';
  const fcmTitle = req.body?.fcmTitle ?? 'Order update';
  const fcmToken = req.body?.fcmToken;
  if (fcmToken) {
    rememberFcmToken(userId, String(fcmToken));
  }

  const orderStatus = req.body?.orderStatus ?? order?.status ?? '';
  const fcmSent = await sendFcmToUser(userId, fcmTitle, message, {
    fcmToken,
    notificationId: notification?.id != null ? String(notification.id) : '',
    type: notification?.type ?? '',
    orderId: order?.order_id != null ? String(order.order_id) : '',
    status: orderStatus,
    title: fcmTitle,
    message,
  });

  res.json({ ok: true, sent: 1, fcmSent, event: eventName });
});

initFirebaseAdmin();

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CasaClick Socket.IO on http://0.0.0.0:${PORT} (path /notifications)`);
  console.log(`Symfony API for JWT check: ${SYMFONY_API}`);
  console.log(`Broadcast: POST http://127.0.0.1:${PORT}/broadcast (X-WS-Secret)`);
  console.log('USB phone: adb reverse tcp:8082 tcp:8082');
});
