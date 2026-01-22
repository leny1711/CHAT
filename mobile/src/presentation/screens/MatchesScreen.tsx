import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {theme} from '../theme/theme';
import {Match} from '../../domain/entities/Match';
import {User} from '../../domain/entities/User';

interface MatchesScreenProps {
  onGetMatches: () => Promise<Match[]>;
  onSelectMatch: (match: Match, otherUser?: User) => Promise<void>;
  getUserById: (userId: string) => Promise<User | null>;
  currentUserId: string;
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({
  onGetMatches,
  onSelectMatch,
  getUserById,
  currentUserId,
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingMatchId, setSelectingMatchId] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [matchedUsers, setMatchedUsers] = useState<Map<string, User>>(
    new Map(),
  );

  useEffect(() => {
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const data = await onGetMatches();
      setMatches(data);

      // Load user details for each match in parallel
      const userMap = new Map<string, User>();
      const userPromises = data.map(async match => {
        const otherUserId =
          match.userIds.find(id => id !== currentUserId) || '';
        if (otherUserId) {
          const user = await getUserById(otherUserId);
          if (user) {
            return [otherUserId, user] as const;
          }
        }
        return null;
      });

      const results = await Promise.all(userPromises);
      results.forEach(result => {
        if (result) {
          userMap.set(result[0], result[1]);
        }
      });

      setMatchedUsers(userMap);
    } catch (error) {
      console.warn('MatchesScreen: error loading matches', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMatch = async (match: Match, otherUser?: User) => {
    if (selectingMatchId) {
      return;
    }
    setSelectionError(null);
    setSelectingMatchId(match.id);
    try {
      await onSelectMatch(match, otherUser);
    } catch (error) {
      console.warn('MatchesScreen: error selecting match', error);
      setSelectionError(
        "Impossible d'ouvrir la conversation pour le moment. Réessayez.",
      );
    } finally {
      setSelectingMatchId(null);
    }
  };

  const renderMatch = ({item}: {item: Match}) => {
    const otherUserId =
      item.userIds.find(id => id !== currentUserId) || 'Unknown';
    const otherUser = matchedUsers.get(otherUserId);
    const resolvedUserName = item.otherUser?.name || otherUser?.name;

    // Affiche le nom disponible ou un fallback explicite.
    const displayName = resolvedUserName || 'Utilisateur';

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => handleSelectMatch(item, otherUser)}
        disabled={selectingMatchId === item.id}>
        <View style={styles.matchAvatar}>
          <Text style={styles.matchAvatarText}>
            {resolvedUserName ? resolvedUserName.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{displayName}</Text>
          <Text style={styles.matchDate}>
            Match le {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {selectingMatchId === item.id && (
            <View style={styles.matchLoadingRow}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.matchLoadingText}>
                Ouverture de la discussion…
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.matchArrow}>→</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matchs</Text>
        <Text style={styles.headerSubtitle}>Vos connexions</Text>
        {selectionError && (
          <Text style={styles.selectionError}>{selectionError}</Text>
        )}
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Aucun match</Text>
          <Text style={styles.emptyText}>
            Commencez à découvrir des profils pour créer des liens
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
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
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  matchAvatarText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.surface,
    fontWeight: '500',
  },
  matchInfo: {
    flex: 1,
  },
  matchLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  matchLoadingText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  matchName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  matchDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  matchArrow: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
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
  },
  selectionError: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
  },
});
