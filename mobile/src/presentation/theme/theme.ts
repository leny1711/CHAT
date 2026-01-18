/**
 * Theme configuration for the dating app
 * Inspired by a book/novel feeling: soft, calm, intimate
 */

export const colors = {
  // Primary soft, warm colors
  primary: '#8B7B6B', // Warm brown - book pages
  primaryLight: '#B5A89A',
  primaryDark: '#5D4E42',

  // Background - soft, paper-like
  background: '#F8F6F2', // Cream/off-white
  surface: '#FFFFFF',
  surfaceAlt: '#F0EDE8',

  // Text - soft, readable
  text: '#3A3A3A', // Soft black
  textSecondary: '#6B6B6B',
  textLight: '#9B9B9B',

  // Accents - gentle, not aggressive
  accent: '#B8A68F', // Muted gold
  accentLight: '#D4C4B0',

  // Semantic colors - soft versions
  success: '#8BA888',
  error: '#C89B9B',
  warning: '#D4B896',

  // Interaction states
  border: '#E0DDD8',
  divider: '#EEEBE6',
  disabled: '#C9C6C1',

  // Special - for progressive reveal
  revealed: '#A8C9A1',
  locked: '#D4CCC0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  // Book-like typography
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const shadows = {
  // Soft, subtle shadows
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;
