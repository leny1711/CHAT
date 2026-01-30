import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {theme} from '../theme/theme';
import {DiscoveryProfile} from '../../domain/entities/Match';

interface DiscoveryScreenProps {
  onLike: (userId: string) => Promise<void>;
  onPass: (userId: string) => Promise<void>;
  getProfiles: () => Promise<DiscoveryProfile[]>;
}

/**
 * Discovery Screen - Simple version without animations
 * Shows one profile at a time with Like/Pass buttons
 */
export const SimpleDiscoveryScreen: React.FC<DiscoveryScreenProps> = ({
  onLike,
  onPass,
  getProfiles,
}) => {
  const [profiles, setProfiles] = useState<DiscoveryProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
      console.warn('SimpleDiscoveryScreen: error loading profiles', error);
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

    try {
      if (action === 'like') {
        await onLike(currentProfile.userId);
      } else {
        await onPass(currentProfile.userId);
      }

      // Move to next profile
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // No more profiles, reload
        await loadProfiles();
      }
    } catch (error) {
      console.warn('SimpleDiscoveryScreen: error handling action', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Recherche de connexions...</Text>
      </View>
    );
  }

  if (!currentProfile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Plus de profils</Text>
        <Text style={styles.emptyText}>
          Revenez plus tard pour de nouvelles connexions
        </Text>
        <TouchableOpacity style={styles.reloadButton} onPress={loadProfiles}>
          <Text style={styles.reloadButtonText}>Actualiser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Découvrir</Text>
          <Text style={styles.headerSubtitle}>Prenez votre temps</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadProfiles}
          disabled={loading}>
          <Text style={styles.refreshButtonText}>Actualiser</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.photoPlaceholder} />

        <View style={styles.profileInfo}>
          <Text style={styles.name}>{currentProfile.name}</Text>
          <Text style={styles.bio}>{currentProfile.bio}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleAction('pass')}
          disabled={actionLoading}>
          <Text style={[styles.actionButtonText, styles.passButtonText]}>
            Passer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleAction('like')}
          disabled={actionLoading}>
          <Text style={[styles.actionButtonText, styles.likeButtonText]}>
            J'aime
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.counter}>
        {currentIndex + 1} sur {profiles.length}
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
    marginTop: theme.spacing.xs,
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
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  photoPlaceholder: {
    height: 400,
    backgroundColor: theme.colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  profileInfo: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    zIndex: 1,
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
