import {Match, DiscoveryProfile} from '../../domain/entities/Match';
import {IMatchRepository} from '../../domain/repositories/IMatchRepository';

/**
 * Simple in-memory match repository
 */
export class InMemoryMatchRepository implements IMatchRepository {
  private matches: Map<string, Match> = new Map();
  private likes: Map<string, Set<string>> = new Map(); // userId -> Set of liked user IDs
  private passes: Map<string, Set<string>> = new Map(); // userId -> Set of passed user IDs
  private nextMatchId = 1;
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

  async getDiscoveryProfiles(): Promise<DiscoveryProfile[]> {
    if (!this.currentUserId) return [];

    const userLikes = this.likes.get(this.currentUserId) || new Set();
    const userPasses = this.passes.get(this.currentUserId) || new Set();

    // Filter out already liked/passed profiles
    return this.mockProfiles.filter(
      profile =>
        !userLikes.has(profile.userId) && !userPasses.has(profile.userId),
    );
  }

  async likeUser(targetUserId: string): Promise<Match | null> {
    if (!this.currentUserId) return null;

    // Add to likes
    if (!this.likes.has(this.currentUserId)) {
      this.likes.set(this.currentUserId, new Set());
    }
    this.likes.get(this.currentUserId)!.add(targetUserId);

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
      };

      this.matches.set(matchId, match);
      return match;
    }

    return null;
  }

  async passUser(targetUserId: string): Promise<void> {
    if (!this.currentUserId) return;

    if (!this.passes.has(this.currentUserId)) {
      this.passes.set(this.currentUserId, new Set());
    }
    this.passes.get(this.currentUserId)!.add(targetUserId);
  }

  async getMatches(): Promise<Match[]> {
    if (!this.currentUserId) return [];

    return Array.from(this.matches.values()).filter(match =>
      match.userIds.includes(this.currentUserId!),
    );
  }

  async getMatchById(matchId: string): Promise<Match | null> {
    return this.matches.get(matchId) || null;
  }
}
