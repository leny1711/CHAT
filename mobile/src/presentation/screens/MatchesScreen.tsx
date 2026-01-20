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
  onSelectMatch: (match: Match) => void;
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

      // Load user details for each match
      const userMap = new Map<string, User>();
      for (const match of data) {
        const otherUserId =
          match.userIds.find(id => id !== currentUserId) || '';
        if (otherUserId) {
          const user = await getUserById(otherUserId);
          if (user) {
            userMap.set(otherUserId, user);
          }
        }
      }
      setMatchedUsers(userMap);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMatch = ({item}: {item: Match}) => {
    const otherUserId =
      item.userIds.find(id => id !== currentUserId) || 'Unknown';
    const otherUser = matchedUsers.get(otherUserId);

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => onSelectMatch(item)}>
        <View style={styles.matchAvatar}>
          <Text style={styles.matchAvatarText}>
            {otherUser
              ? otherUser.name.charAt(0).toUpperCase()
              : otherUserId.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>
            {otherUser ? otherUser.name : `User ${otherUserId.slice(-6)}`}
          </Text>
          <Text style={styles.matchDate}>
            Matched {new Date(item.createdAt).toLocaleDateString()}
          </Text>
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
        <Text style={styles.headerTitle}>Matches</Text>
        <Text style={styles.headerSubtitle}>Your connections</Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Matches Yet</Text>
          <Text style={styles.emptyText}>
            Start discovering profiles to make connections
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
});
