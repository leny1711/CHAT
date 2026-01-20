import {
  Match,
  Like,
  DiscoveryProfile,
  MatchStatus,
} from '../../domain/entities/Match';
import {IMatchRepository} from '../../domain/repositories/IMatchRepository';
import {IUserRepository} from '../../domain/repositories/IUserRepository';

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
  private userRepository: IUserRepository | null = null;

  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
  }

  setUserRepository(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getDiscoveryProfiles(_limit?: number): Promise<DiscoveryProfile[]> {
    if (!this.currentUserId || !this.userRepository) {
      return [];
    }

    const userLikes = this.likes.get(this.currentUserId);
    const userPasses = this.passes.get(this.currentUserId) || new Set();

    // Get all users from UserRepository
    const allUsers = await this.userRepository.getAllUsers();

    // Filter and map to discovery profiles
    return allUsers
      .filter(user => {
        // Exclude current user
        if (user.id === this.currentUserId) {
          return false;
        }

        // Exclude already liked users
        const hasLiked = userLikes && userLikes.has(user.id);
        if (hasLiked) {
          return false;
        }

        // Exclude already passed users
        const hasPassed = userPasses.has(user.id);
        if (hasPassed) {
          return false;
        }

        return true;
      })
      .map(user => ({
        userId: user.id,
        name: user.name,
        age: user.age,
        bio: user.bio,
      }));
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
