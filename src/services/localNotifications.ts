import { AppState, Platform } from 'react-native';
import notifee, { AndroidImportance, type Notification } from '@notifee/react-native';

const ANDROID_CHANNEL_ID = 'casaclick-notifications';

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
        name: 'CasaClick Notifications',
        importance: AndroidImportance.DEFAULT,
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
  /** FCM / background: always show system notification */
  force?: boolean;
}): Promise<void> {
  if (!input.force && AppState.currentState === 'active') {
    return;
  }

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

