import {Match, Like, DiscoveryProfile} from '../entities/Match';

/**
 * Repository interface for discovery and matching
 */
export interface IMatchRepository {
  /**
   * Get discovery profiles to show
   */
  getDiscoveryProfiles(limit?: number): Promise<DiscoveryProfile[]>;

  /**
   * Like a user
   */
  likeUser(userId: string): Promise<{like: Like; match?: Match}>;

  /**
   * Pass on a user
   */
  passUser(userId: string): Promise<void>;

  /**
   * Get matches for current user
   */
  getMatches(): Promise<Match[]>;

  /**
   * Get a specific match
   */
  getMatch(matchId: string): Promise<Match | null>;

  /**
   * Ensure conversation exists for a match and return its ID
   */
  ensureConversation(matchId: string): Promise<string>;
}
