jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));
