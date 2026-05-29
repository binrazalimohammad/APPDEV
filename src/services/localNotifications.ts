import { Platform } from 'react-native';
import notifee, { AndroidImportance, type Notification } from '@notifee/react-native';

/** HIGH importance → heads-up banner on Android when app is open or backgrounded. */
const ANDROID_CHANNEL_ID = 'casaclick-alerts';

let initialized = false;

export async function initLocalNotifications(): Promise<void> {
  if (initialized) {
    return;
  }
  initialized = true;

  try {
    await notifee.requestPermission();
  } catch {
    // permissions denied or unavailable
  }

  if (Platform.OS === 'android') {
    try {
      await notifee.createChannel({
        id: ANDROID_CHANNEL_ID,
        name: 'CasaClick Alerts',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    } catch {
      // ignore channel creation failure
    }
  }
}

export async function showLocalNotification(input: {
  title: string;
  body: string;
  data?: Record<string, string>;
  /** @deprecated All notifications show as system pop-ups; kept for call-site compatibility. */
  force?: boolean;
}): Promise<void> {
  const notification: Notification = {
    title: input.title,
    body: input.body,
    data: input.data,
    android: Platform.OS === 'android'
      ? {
          channelId: ANDROID_CHANNEL_ID,
          smallIcon: 'ic_launcher',
          pressAction: { id: 'default' },
        }
      : undefined,
  };

  try {
    await notifee.displayNotification(notification);
  } catch {
    // ignore display failures (e.g. permission denied)
  }
}

