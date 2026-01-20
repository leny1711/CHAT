import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {theme} from '../theme/theme';
import {DiscoveryProfile} from '../../domain/entities/Match';

interface DiscoveryScreenProps {
  onLike: (userId: string) => Promise<void>;
  onPass: (userId: string) => Promise<void>;
  getProfiles: () => Promise<DiscoveryProfile[]>;
}

export const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({
  onLike,
  onPass,
  getProfiles,
}) => {
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await getProfiles();
      setProfiles(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentProfile = profiles[currentIndex];

  const handleAction = async (action: 'like' | 'pass') => {
    if (!currentProfile || actionLoading) {
      return;
    }

    setActionLoading(true);

    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      try {
        if (action === 'like') {
          await onLike(currentProfile.userId);
        } else {
          await onPass(currentProfile.userId);
        }

        // Move to next profile
        if (currentIndex < profiles.length - 1) {
          setCurrentIndex(currentIndex + 1);
          fadeAnim.setValue(0);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        } else {
          // No more profiles, reload
          await loadProfiles();
          fadeAnim.setValue(1);
        }
      } catch (error) {
        console.error('Error handling action:', error);
        fadeAnim.setValue(1);
      } finally {
        setActionLoading(false);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Finding connections...</Text>
      </View>
    );
  }

  if (!currentProfile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No More Profiles</Text>
        <Text style={styles.emptyText}>
          Check back later for new connections
        </Text>
        <TouchableOpacity style={styles.reloadButton} onPress={loadProfiles}>
          <Text style={styles.reloadButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Take your time</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadProfiles}
          disabled={loading}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.card, {opacity: fadeAnim}]}>
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>
            Photo reveals through conversation
          </Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.name}>{currentProfile.name}</Text>
          <Text style={styles.bio}>{currentProfile.bio}</Text>
        </View>
      </Animated.View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleAction('pass')}
          disabled={actionLoading}>
          <Text style={[styles.actionButtonText, styles.passButtonText]}>
            Pass
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleAction('like')}
          disabled={actionLoading}>
          <Text style={[styles.actionButtonText, styles.likeButtonText]}>
            Like
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.counter}>
        {currentIndex + 1} of {profiles.length}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.xl,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: '300',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: 4,
  },
  refreshButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
  },
  card: {
    flex: 1,
    marginHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  photoPlaceholder: {
    height: 400,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  profileInfo: {
    padding: theme.spacing.lg,
  },
  name: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  bio: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  passButtonText: {
    color: theme.colors.text,
  },
  likeButtonText: {
    color: theme.colors.surface,
  },
  likeButton: {
    backgroundColor: theme.colors.primary,
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
  },
  counter: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
    paddingBottom: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  reloadButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  reloadButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
  },
});
