import {StyleSheet} from 'react-native';
import {theme} from '../theme/theme';

export const matchNoticeStyles = StyleSheet.create({
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
