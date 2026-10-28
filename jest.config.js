module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: [
    ...require('@react-native/jest-preset').setupFiles,
    '<rootDir>/node_modules/@react-native-google-signin/google-signin/jest/build/jest/setup.js',
    '<rootDir>/jest.setup.js',
  ],
  // Most React Native libraries ship untranspiled ESM, so let Babel handle them.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-.*|@react-navigation|react-native-.*|gifted-charts-core)/)',
  ],
};
