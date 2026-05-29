import { AppState, type AppStateStatus } from 'react-native';

import { fetchApplications } from '../app/api/application';
import { fetchNotifications, fetchPayments } from '../app/api/mobile';
import type { Application, Payment } from '../app/api/types';
import { NOTIFICATION_POLL_INTERVAL_MS } from '../constants/sync';
import { showNotificationPopup } from '../utils/showNotificationPopup';
import { requestNotificationReload } from './notificationSync';

type Snapshot = {
  applications: Map<number, string>;
  payments: Map<number, string>;
};

const snapshots = new Map<string, Snapshot>();

function isTenantRoles(roles: string[] | undefined): boolean {
  if (!roles?.length) {
    return true;
  }
  return roles.includes('ROLE_TENANT');
}

function ensureSnapshot(token: string): Snapshot {
  let snap = snapshots.get(token);
  if (!snap) {
    snap = { applications: new Map(), payments: new Map() };
    snapshots.set(token, snap);
  }
  return snap;
}

function baselineApplications(snap: Snapshot, apps: Application[]): void {
  for (const app of apps) {
    const id = Number(app.id);
    if (!Number.isFinite(id)) {
      continue;
    }
    if (!snap.applications.has(id)) {
      snap.applications.set(id, String(app.status ?? ''));
    }
  }
}

function baselinePayments(snap: Snapshot, payments: Payment[]): void {
  for (const payment of payments) {
    const id = Number(payment.id);
    if (!Number.isFinite(id)) {
      continue;
    }
    if (!snap.payments.has(id)) {
      snap.payments.set(id, String(payment.status ?? ''));
    }
  }
}

function alertApplicationChange(app: Application, status: string): void {
  const id = Number(app.id);
  const name = app.listing?.name ?? 'your listing';
  const normalized = status.toLowerCase();

  if (normalized === 'approved' || normalized === 'accepted') {
    showNotificationPopup({
      type: 'application_approved',
      message: `Your application for ${name} has been approved by your landlord.`,
      relatedId: id,
    });
    return;
  }

  if (normalized === 'rejected') {
    showNotificationPopup({
      type: 'application_rejected',
      message: `Your application for ${name} was declined by your landlord.`,
      relatedId: id,
    });
    return;
  }

  if (normalized === 'completed') {
    showNotificationPopup({
      type: 'listing_unoccupied',
      message: `The listing "${name}" is available again (tenancy ended).`,
      relatedId: id,
    });
  }
}

function alertPaymentChange(payment: Payment, status: string): void {
  const id = Number(payment.id);
  const listing =
    payment.application?.listing?.name ??
    (payment as Payment & { listingName?: string }).listingName ??
    'your listing';
  const amount = payment.amount != null ? `₱${payment.amount}` : 'your payment';
  const normalized = status.toLowerCase();

  if (['completed', 'paid', 'received'].includes(normalized)) {
    showNotificationPopup({
      type: 'payment_approved',
      message: `Your payment of ${amount} for "${listing}" has been approved.`,
      relatedId: id,
    });
    return;
  }

  if (['failed', 'rejected'].includes(normalized)) {
    showNotificationPopup({
      type: 'payment_rejected',
      message: `Your payment of ${amount} for "${listing}" was declined.`,
      relatedId: id,
    });
  }
}

function detectApplicationChanges(snap: Snapshot, apps: Application[], primed: boolean): void {
  for (const app of apps) {
    const id = Number(app.id);
    if (!Number.isFinite(id)) {
      continue;
    }
    const next = String(app.status ?? '');
    const prev = snap.applications.get(id);
    if (prev === undefined) {
      snap.applications.set(id, next);
      continue;
    }
    if (prev !== next) {
      snap.applications.set(id, next);
      if (primed) {
        alertApplicationChange(app, next);
      }
    }
  }
}

function detectPaymentChanges(snap: Snapshot, payments: Payment[], primed: boolean): void {
  for (const payment of payments) {
    const id = Number(payment.id);
    if (!Number.isFinite(id)) {
      continue;
    }
    const next = String(payment.status ?? '');
    const prev = snap.payments.get(id);
    if (prev === undefined) {
      snap.payments.set(id, next);
      continue;
    }
    if (prev !== next) {
      snap.payments.set(id, next);
      if (primed) {
        alertPaymentChange(payment, next);
      }
    }
  }
}

let activeToken: string | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;
let appStateSub: { remove: () => void } | null = null;
let primed = false;
let ticking = false;

async function tick(token: string, roles: string[] | undefined): Promise<void> {
  if (ticking || token === 'demo') {
    return;
  }
  ticking = true;
  try {
    await fetchNotifications(token).catch(() => undefined);
    requestNotificationReload();

    if (!isTenantRoles(roles)) {
      return;
    }

    const snap = ensureSnapshot(token);
    const [apps, payments] = await Promise.all([
      fetchApplications(token).catch(() => [] as Application[]),
      fetchPayments(token).catch(() => [] as Payment[]),
    ]);

    if (!primed) {
      baselineApplications(snap, apps);
      baselinePayments(snap, payments);
      primed = true;
      return;
    }

    detectApplicationChanges(snap, apps, true);
    detectPaymentChanges(snap, payments, true);
  } finally {
    ticking = false;
  }
}

export function startTenantStatusAlertPoller(
  token: string,
  roles: string[] | undefined,
): void {
  if (!token || token === 'demo') {
    stopTenantStatusAlertPoller();
    return;
  }

  if (activeToken === token && intervalId != null) {
    return;
  }

  stopTenantStatusAlertPoller();
  activeToken = token;
  primed = false;

  const run = () => {
    if (activeToken) {
      void tick(activeToken, roles);
    }
  };

  run();
  intervalId = setInterval(run, NOTIFICATION_POLL_INTERVAL_MS);

  const onAppState = (state: AppStateStatus) => {
    if (state === 'active' && activeToken) {
      void tick(activeToken, roles);
    }
  };
  appStateSub = AppState.addEventListener('change', onAppState);
}

export function stopTenantStatusAlertPoller(): void {
  if (intervalId != null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  appStateSub?.remove();
  appStateSub = null;
  if (activeToken) {
    snapshots.delete(activeToken);
  }
  activeToken = null;
  primed = false;
}
