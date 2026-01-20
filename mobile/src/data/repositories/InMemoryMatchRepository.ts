import {
  Match,
  Like,
  DiscoveryProfile,
  MatchStatus,
} from '../../domain/entities/Match';
import {IMatchRepository} from '../../domain/repositories/IMatchRepository';

/**
 * Simple in-memory match repository
 */
export class InMemoryMatchRepository implements IMatchRepository {
  private matches: Map<string, Match> = new Map();
  private likes: Map<string, Map<string, Like>> = new Map(); // fromUserId -> toUserId -> Like
  private passes: Map<string, Set<string>> = new Map(); // userId -> Set of passed user IDs
  private nextMatchId = 1;
  private nextLikeId = 1;
  private currentUserId: string | null = null;

  // Mock discovery profiles
  private mockProfiles: DiscoveryProfile[] = [
    {
      userId: 'user_1001',
      name: 'Alex',
      bio: 'Love hiking and outdoor adventures. Always looking for new trails to explore.',
    },
    {
      userId: 'user_1002',
      name: 'Jordan',
      bio: 'Coffee enthusiast and bookworm. Can talk for hours about literature and good espresso.',
    },
    {
      userId: 'user_1003',
      name: 'Morgan',
      bio: 'Artist and dreamer. Creating meaningful connections through conversation.',
    },
    {
      userId: 'user_1004',
      name: 'Taylor',
      bio: 'Traveler and storyteller. Seeking genuine conversations and authentic connections.',
    },
  ];

  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
  }

  async getDiscoveryProfiles(_limit?: number): Promise<DiscoveryProfile[]> {
    if (!this.currentUserId) {
      return [];
    }

    const userLikes = this.likes.get(this.currentUserId);
    const userPasses = this.passes.get(this.currentUserId) || new Set();

    // Filter out already liked/passed profiles
    return this.mockProfiles.filter(profile => {
      const hasLiked = userLikes && userLikes.has(profile.userId);
      const hasPassed = userPasses.has(profile.userId);
      return !hasLiked && !hasPassed;
    });
  }

  async likeUser(targetUserId: string): Promise<Like> {
    if (!this.currentUserId) {
      throw new Error('No user logged in');
    }

    // Create like
    const like: Like = {
      id: `like_${this.nextLikeId++}`,
      fromUserId: this.currentUserId,
      toUserId: targetUserId,
      createdAt: new Date(),
    };

    // Store like
    if (!this.likes.has(this.currentUserId)) {
      this.likes.set(this.currentUserId, new Map());
    }
    this.likes.get(this.currentUserId)!.set(targetUserId, like);

    // Check if it's a mutual match
    const targetLikes = this.likes.get(targetUserId);
    if (targetLikes && targetLikes.has(this.currentUserId)) {
      // Create match
      const matchId = `match_${this.nextMatchId++}`;
      const match: Match = {
        id: matchId,
        userIds: [this.currentUserId, targetUserId],
        conversationId: `conv_${matchId}`,
        createdAt: new Date(),
        status: MatchStatus.ACTIVE,
      };

      this.matches.set(matchId, match);
    }

    return like;
  }

  async passUser(targetUserId: string): Promise<void> {
    if (!this.currentUserId) {
      return;
    }

    if (!this.passes.has(this.currentUserId)) {
      this.passes.set(this.currentUserId, new Set());
    }
    this.passes.get(this.currentUserId)!.add(targetUserId);
  }

  async getMatches(): Promise<Match[]> {
    if (!this.currentUserId) {
      return [];
    }

    const userId = this.currentUserId;
    return Array.from(this.matches.values()).filter(match =>
      match.userIds.includes(userId),
    );
  }

  async getMatch(matchId: string): Promise<Match | null> {
    return this.matches.get(matchId) || null;
  }

  async checkMatch(userId1: string, userId2: string): Promise<Match | null> {
    return (
      Array.from(this.matches.values()).find(
        match =>
          match.userIds.includes(userId1) && match.userIds.includes(userId2),
      ) || null
    );
  }
}
