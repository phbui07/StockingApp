/* eslint-env jest */

// Native modules aren't available under Jest, so swap in mocks.
// Prefer the mocks the libraries ship themselves (Google Sign-In's is loaded
// from jest.config.js because its package exports don't expose it).

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('react-native-notifications', () => ({
  Notifications: {
    postLocalNotification: jest.fn(),
    registerRemoteNotifications: jest.fn(),
    ios: {checkPermissions: jest.fn(() => Promise.resolve({alert: true}))},
    events: () => ({
      registerRemoteNotificationsRegistrationDenied: () => ({
        remove: jest.fn(),
      }),
    }),
  },
}));

jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  BiometryTypes: {
    TouchID: 'TouchID',
    FaceID: 'FaceID',
    Biometrics: 'Biometrics',
  },
  default: jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn().mockResolvedValue({available: false}),
    simplePrompt: jest.fn().mockResolvedValue({success: false}),
  })),
}));
