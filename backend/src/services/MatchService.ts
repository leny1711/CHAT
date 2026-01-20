import { db } from '../config/database';
import { Match, Like, Conversation, UserResponse } from '../types';
import { generateId } from '../utils/crypto';

export class MatchService {
  async likeUser(fromUserId: string, toUserId: string): Promise<{ matched: boolean; matchId?: string }> {
    // Check if already liked
    const existingLike = await db.get<Like>(
      'SELECT * FROM likes WHERE from_user_id = $1 AND to_user_id = $2',
      [fromUserId, toUserId]
    );

    if (existingLike) {
      return { matched: false };
    }

    // Create like
    const likeId = generateId('like_');
    await db.run(
      'INSERT INTO likes (id, from_user_id, to_user_id) VALUES ($1, $2, $3)',
      [likeId, fromUserId, toUserId]
    );

    // Check for mutual like
    const mutualLike = await db.get<Like>(
      'SELECT * FROM likes WHERE from_user_id = $1 AND to_user_id = $2',
      [toUserId, fromUserId]
    );

    if (mutualLike) {
      // Create match
      const matchId = generateId('match_');
      const [user1, user2] = [fromUserId, toUserId].sort(); // Consistent ordering

      await db.run(
        'INSERT INTO matches (id, user_id_1, user_id_2) VALUES ($1, $2, $3)',
        [matchId, user1, user2]
      );

      // Create conversation
      const conversationId = generateId('conv_');
      await db.run(
        'INSERT INTO conversations (id, match_id) VALUES ($1, $2)',
        [conversationId, matchId]
      );

      return { matched: true, matchId };
    }

    return { matched: false };
  }

  async passUser(fromUserId: string, toUserId: string): Promise<void> {
    // For now, just record that we passed - in production, you might want a separate table
    // to avoid showing the same profile again
  }

  async getMatches(userId: string): Promise<Array<Match & { otherUser: UserResponse; conversationId: string }>> {
    const matches = await db.all<Match & { conversationId: string }>(
      `SELECT m.*, c.id as conversationId 
       FROM matches m
       JOIN conversations c ON c.match_id = m.id
       WHERE (m.user_id_1 = $1 OR m.user_id_2 = $2) AND m.status = 'active'
       ORDER BY m.created_at DESC`,
      [userId, userId]
    );

    // Get other user info for each match
    const matchesWithUsers = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.user_id_1 === userId ? match.user_id_2 : match.user_id_1;
        const otherUser = await db.get<UserResponse>(
          'SELECT id, email, name, age, bio, created_at, last_active FROM users WHERE id = $1',
          [otherUserId]
        );

        return {
          ...match,
          otherUser: otherUser!,
        };
      })
    );

    return matchesWithUsers;
  }

  async getDiscoveryProfiles(userId: string, limit: number = 10): Promise<UserResponse[]> {
    // Get users that:
    // 1. Are not the current user
    // 2. Haven't been liked or passed by the current user
    // 3. Haven't been matched with the current user
    const profiles = await db.all<UserResponse>(
      `SELECT id, email, name, age, bio, created_at, last_active 
       FROM users 
       WHERE id != $1 
       AND id NOT IN (
         SELECT to_user_id FROM likes WHERE from_user_id = $2
       )
       AND id NOT IN (
         SELECT user_id_1 FROM matches WHERE user_id_2 = $3
         UNION
         SELECT user_id_2 FROM matches WHERE user_id_1 = $4
       )
       ORDER BY RANDOM()
       LIMIT $5`,
      [userId, userId, userId, userId, limit]
    );

    return profiles;
  }
}
