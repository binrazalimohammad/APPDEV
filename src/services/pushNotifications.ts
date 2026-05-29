import { Platform } from 'react-native';
import messaging, { type FirebaseMessagingTypes } from '@react-native-firebase/messaging';

import { registerPushToken, unregisterPushToken } from '../app/api/mobile';
import { showLocalNotification } from './localNotifications';

let currentJwt: string | null = null;
let cachedFcmToken: string | null = null;
let tokenRefreshUnsubscribe: (() => void) | null = null;

export async function getFcmToken(): Promise<string | null> {
  if (cachedFcmToken) {
    return cachedFcmToken;
  }
  try {
    const token = await messaging().getToken();
    cachedFcmToken = token || null;
    return cachedFcmToken;
  } catch {
    return null;
  }
}

async function requestPushPermission(): Promise<boolean> {
  try {
    const status = await messaging().requestPermission();
    return (
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch {
    return false;
  }
}

export async function displayFcmNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const title =
    remoteMessage.notification?.title ??
    remoteMessage.data?.title ??
    'Order update';
  const body =
    remoteMessage.notification?.body ??
    remoteMessage.data?.body ??
    remoteMessage.data?.message ??
    '';

  if (!body) {
    return;
  }

  await showLocalNotification({
    title: String(title),
    body: String(body),
    data: remoteMessage.data as Record<string, string> | undefined,
    force: true,
  });
}

export async function setupPushNotifications(jwt: string): Promise<void> {
  currentJwt = jwt;

  await requestPushPermission();

  const fcmToken = await getFcmToken();
  if (fcmToken) {
    try {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      await registerPushToken(jwt, fcmToken, platform);
    } catch {
      // Backend may be offline — Socket.IO auth still sends token in handshake.
    }
  }

  tokenRefreshUnsubscribe?.();
  tokenRefreshUnsubscribe = messaging().onTokenRefresh(async token => {
    cachedFcmToken = token;
    if (currentJwt && currentJwt !== 'demo') {
      try {
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        await registerPushToken(currentJwt, token, platform);
      } catch {
        // ignore
      }
    }
  });
}

export function attachForegroundMessageHandler(): () => void {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    await displayFcmNotification(remoteMessage);
  });
  return unsubscribe;
}

/** Disconnect FCM from this user: clear JWT ref, server token, and cached device token. */
export async function teardownPushNotifications(jwtForUnregister?: string | null): Promise<void> {
  const jwt = jwtForUnregister ?? currentJwt;
  currentJwt = null;

  tokenRefreshUnsubscribe?.();
  tokenRefreshUnsubscribe = null;

  if (jwt && jwt !== 'demo') {
    try {
      await unregisterPushToken(jwt);
    } catch {
      // ignore if API unavailable
    }
  }

  if (cachedFcmToken) {
    try {
      await messaging().deleteToken();
    } catch {
      // ignore
    }
    cachedFcmToken = null;
  }
}
