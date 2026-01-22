import {
  Match,
  Like,
  DiscoveryProfile,
  MatchStatus,
} from '../../domain/entities/Match';
import {IMatchRepository} from '../../domain/repositories/IMatchRepository';
import {apiClient} from '../../infrastructure/api/client';

interface MatchResponse {
  matched: boolean;
  matchId?: string;
  conversationId?: string;
}

interface DiscoveryResponse {
  profiles: Array<{
    id: string;
    name: string;
    age: number;
    bio: string;
    profile_photo?: string | null;
  }>;
}

interface MatchesResponse {
  matches: Array<{
    id: string;
    user_id_1: string;
    user_id_2: string;
    created_at: string;
    status: string;
    conversationId?: string;
    otherUser: {
      id: string;
      name: string;
      age: number;
      bio: string;
      profile_photo?: string | null;
    };
  }>;
}

interface EnsureConversationResponse {
  conversationId: string;
}

/**
 * Match Repository with real backend API integration
 */
export class MatchRepository implements IMatchRepository {
  async getDiscoveryProfiles(limit: number = 10): Promise<DiscoveryProfile[]> {
    try {
      const response = await apiClient.get<DiscoveryResponse>(
        `/api/matches/discovery?limit=${limit}`,
      );

      return response.profiles.map(profile => ({
        userId: profile.id,
        name: profile.name,
        age: profile.age,
        bio: profile.bio,
        previewPhoto: profile.profile_photo ?? undefined,
      }));
    } catch (error) {
      console.error('Error getting discovery profiles:', error);
      return [];
    }
  }

  async likeUser(userId: string): Promise<Like> {
    try {
      const response = await apiClient.post<MatchResponse>(
        '/api/matches/like',
        {
          targetUserId: userId,
        },
      );

      const like: Like = {
        id: `like_${Date.now()}`,
        fromUserId: 'current_user', // This would come from auth context
        toUserId: userId,
        createdAt: new Date(),
      };

      // DEV LOG: Match response must include conversationId from backend.
      if (__DEV__ && response.matched) {
        console.log('Match received from API', {
          matchId: response.matchId,
          conversationId: response.conversationId,
        });
      }

      return like;
    } catch (error) {
      console.error('Error liking user:', error);
      throw error;
    }
  }

  async passUser(userId: string): Promise<void> {
    try {
      await apiClient.post('/api/matches/pass', {
        targetUserId: userId,
      });
    } catch (error) {
      console.error('Error passing user:', error);
      // Don't throw - passing is not critical
    }
  }

  async getMatches(): Promise<Match[]> {
    try {
      const response = await apiClient.get<MatchesResponse>('/api/matches');

      if (__DEV__) {
        console.log(
          'Matches received',
          response.matches.map(match => ({
            matchId: match.id,
            conversationId: match.conversationId,
          })),
        );
      }

      return response.matches.map(match => ({
        id: match.id,
        userIds: [match.user_id_1, match.user_id_2] as [string, string],
        createdAt: new Date(match.created_at),
        conversationId: match.conversationId,
        otherUser: match.otherUser
          ? {
              id: match.otherUser.id,
              name: match.otherUser.name,
              age: match.otherUser.age,
              bio: match.otherUser.bio,
              profilePhotoUrl: match.otherUser.profile_photo ?? undefined,
            }
          : undefined,
        status: match.status as MatchStatus,
      }));
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  }

  async getMatch(matchId: string): Promise<Match | null> {
    const matches = await this.getMatches();
    return matches.find(m => m.id === matchId) || null;
  }

  async checkMatch(_userId1: string, _userId2: string): Promise<Match | null> {
    // This is handled automatically by the backend when users like each other
    // We just return null here as this method is not needed with the backend
    return null;
  }

  async ensureConversation(matchId: string): Promise<string> {
    const response = await apiClient.post<EnsureConversationResponse>(
      '/api/matches/conversation',
      {matchId},
    );
    return response.conversationId;
  }
}
