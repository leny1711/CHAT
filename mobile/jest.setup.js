jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-color-matrix-image-filters', () => {
  const React = require('react');
  const {View} = require('react-native');
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const concatTwoColorMatrices = (matB, matA) => {
    const tmp = Array(20);
    let index = 0;
    for (let row = 0; row < 20; row += 5) {
      for (let col = 0; col < 4; col += 1) {
        tmp[index++] =
          matA[row + 0] * matB[col + 0] +
          matA[row + 1] * matB[col + 5] +
          matA[row + 2] * matB[col + 10] +
          matA[row + 3] * matB[col + 15];
      }
      tmp[index++] =
        matA[row + 0] * matB[4] +
        matA[row + 1] * matB[9] +
        matA[row + 2] * matB[14] +
        matA[row + 3] * matB[19] +
        matA[row + 4];
    }
    return tmp;
  };
  return {
    ColorMatrix: ({children, ...props}) => <View {...props}>{children}</View>,
    concatColorMatrices: matrices => matrices.reduce(concatTwoColorMatrices),
    grayscale: (value = 1) => {
      const cv = clamp(1 - value, 0, 1);
      return [
        0.2126 + 0.7874 * cv,
        0.7152 - 0.7152 * cv,
        0.0722 - 0.0722 * cv,
        0,
        0,
        0.2126 - 0.2126 * cv,
        0.7152 + 0.2848 * cv,
        0.0722 - 0.0722 * cv,
        0,
        0,
        0.2126 - 0.2126 * cv,
        0.7152 - 0.7152 * cv,
        0.0722 + 0.9278 * cv,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
      ];
    },
    saturate: (value = 1) => [
      0.213 + 0.787 * value,
      0.715 - 0.715 * value,
      0.072 - 0.072 * value,
      0,
      0,
      0.213 - 0.213 * value,
      0.715 + 0.285 * value,
      0.072 - 0.072 * value,
      0,
      0,
      0.213 - 0.213 * value,
      0.715 - 0.715 * value,
      0.072 + 0.928 * value,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
    ],
  };
});
