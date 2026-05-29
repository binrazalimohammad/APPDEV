import firebase from '@react-native-firebase/app';

/**
 * React Native Firebase auto-initializes from native config:
 * - Android: android/app/google-services.json
 * - iOS: ios/GoogleService-Info.plist
 */
export function isFirebaseReady(): boolean {
  return firebase.apps.length > 0;
}

