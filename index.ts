/**
 * @format
 */

import messaging from '@react-native-firebase/messaging';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';
import { displayFcmNotification } from './src/services/pushNotifications';

// Required for notifications when app is backgrounded or killed (Android).
messaging().setBackgroundMessageHandler(async remoteMessage => {
  await displayFcmNotification(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
