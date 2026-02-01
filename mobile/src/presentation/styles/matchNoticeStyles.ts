import {StyleSheet} from 'react-native';
import {theme} from '../theme/theme';

export const matchNoticeStyles = StyleSheet.create({
  matchNoticeOverlay: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    elevation: 6,
  },
  matchNotice: {
    alignSelf: 'center',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    maxWidth: '85%',
  },
  matchNoticeText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
});
