/* eslint-env jest */
jest.mock('react-native-gesture-handler', () => {
  // Minimal mock for this project: App.tsx uses GestureHandlerRootView.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require('react-native');
  return { GestureHandlerRootView: View };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signIn: jest.fn(async () => ({
      type: 'success',
      data: { idToken: 'test-id-token', user: { id: '1' } },
    })),
    getTokens: jest.fn(async () => ({ idToken: 'test-id-token', accessToken: 'test-access' })),
    signOut: jest.fn(async () => undefined),
  },
}));
