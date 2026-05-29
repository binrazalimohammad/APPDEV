import auth from '@react-native-firebase/auth';

export async function firebaseSignInWithGoogleIdToken(idToken: string) {
  const credential = auth.GoogleAuthProvider.credential(idToken);
  return auth().signInWithCredential(credential);
}

export async function firebaseSignOut(): Promise<void> {
  try {
    await auth().signOut();
  } catch {
    // non-blocking
  }
}

