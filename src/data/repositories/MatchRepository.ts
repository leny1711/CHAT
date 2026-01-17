import AsyncStorage from '@react-native-async-storage/async-storage';
import { Match, Like, DiscoveryProfile, MatchStatus } from '../../domain/entities/Match';
import { IMatchRepository } from '../../domain/repositories/IMatchRepository';

/**
 * Mock implementation of Match Repository
 * In production, this would connect to a real backend API
 */
export class MatchRepository implements IMatchRepository {
  private readonly MATCHES_KEY = '@matches';
  private readonly LIKES_KEY = '@likes';
  private readonly DISCOVERY_KEY = '@discovery_profiles';

  async getDiscoveryProfiles(limit: number = 10): Promise<DiscoveryProfile[]> {
    try {
      const data = await AsyncStorage.getItem(this.DISCOVERY_KEY);
      const profiles: DiscoveryProfile[] = data ? JSON.parse(data) : this.generateMockProfiles();
      return profiles.slice(0, limit);
    } catch (error) {
      console.error('Error getting discovery profiles:', error);
      return this.generateMockProfiles().slice(0, limit);
    }
  }

  async likeUser(userId: string): Promise<Like> {
    const like: Like = {
      id: `like_${Date.now()}`,
      fromUserId: 'current_user', // In production, get from auth
      toUserId: userId,
      createdAt: new Date(),
    };

    // Save like
    const data = await AsyncStorage.getItem(this.LIKES_KEY);
    const likes: Like[] = data ? JSON.parse(data) : [];
    likes.push(like);
    await AsyncStorage.setItem(this.LIKES_KEY, JSON.stringify(likes));

    return like;
  }

  async passUser(userId: string): Promise<void> {
    // In a real app, we'd save this to avoid showing again
    console.log('Passed on user:', userId);
  }

  async getMatches(): Promise<Match[]> {
    try {
      const data = await AsyncStorage.getItem(this.MATCHES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  }

  async getMatch(matchId: string): Promise<Match | null> {
    const matches = await this.getMatches();
    return matches.find(m => m.id === matchId) || null;
  }

  async checkMatch(userId1: string, userId2: string): Promise<Match | null> {
    // Check if both users have liked each other
    const data = await AsyncStorage.getItem(this.LIKES_KEY);
    const likes: Like[] = data ? JSON.parse(data) : [];

    const user1LikesUser2 = likes.some(
      l => l.fromUserId === userId1 && l.toUserId === userId2
    );
    const user2LikesUser1 = likes.some(
      l => l.fromUserId === userId2 && l.toUserId === userId1
    );

    if (user1LikesUser2 && user2LikesUser1) {
      // Create a match
      const match: Match = {
        id: `match_${Date.now()}`,
        userIds: [userId1, userId2],
        createdAt: new Date(),
        conversationId: `conv_${Date.now()}`,
        status: MatchStatus.ACTIVE,
      };

      const matchesData = await AsyncStorage.getItem(this.MATCHES_KEY);
      const matches: Match[] = matchesData ? JSON.parse(matchesData) : [];
      matches.push(match);
      await AsyncStorage.setItem(this.MATCHES_KEY, JSON.stringify(matches));

      return match;
    }

    return null;
  }

  private generateMockProfiles(): DiscoveryProfile[] {
    // Generate mock profiles for discovery
    return [
      {
        userId: 'user1',
        name: 'Alex',
        age: 28,
        bio: 'Love reading and long conversations about life',
        previewPhoto: undefined,
      },
      {
        userId: 'user2',
        name: 'Sam',
        age: 26,
        bio: 'Writer and coffee enthusiast',
        previewPhoto: undefined,
      },
      {
        userId: 'user3',
        name: 'Jordan',
        age: 30,
        bio: 'Looking for meaningful connections',
        previewPhoto: undefined,
      },
    ];
  }
}
