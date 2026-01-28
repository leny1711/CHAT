import { db } from '../config/database';
import { Match, Like, Conversation, UserResponse } from '../types';
import { generateId } from '../utils/crypto';

export class MatchService {
  async likeUser(fromUserId: string, toUserId: string): Promise<{ matched: boolean; matchId?: string; conversationId?: string }> {
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
      // Use transaction to ensure match and conversation are created atomically
      const client = await db.getClient();
      try {
        await client.query('BEGIN');

        // Create match
        const matchId = generateId('match_');
        const [user1, user2] = [fromUserId, toUserId].sort(); // Consistent ordering

        await client.query(
          'INSERT INTO matches (id, user_id_1, user_id_2) VALUES ($1, $2, $3)',
          [matchId, user1, user2]
        );

        // Create conversation automatically for every match
        const conversationId = generateId('conv_');
        await client.query(
          'INSERT INTO conversations (id, match_id) VALUES ($1, $2)',
          [conversationId, matchId]
        );

        // Verify conversation was created within transaction
        const verifyConv = await client.query(
          'SELECT id FROM conversations WHERE id = $1',
          [conversationId]
        );
        
        if (!verifyConv.rows || verifyConv.rows.length === 0) {
          console.error('CRITICAL: Conversation not found after creation!', {
            conversationId,
            matchId,
          });
          throw new Error('Failed to create conversation');
        }

        await client.query('COMMIT');
        
        console.log('Match and conversation created successfully', {
          matchId,
          conversationId,
          user1,
          user2,
        });
        
        return { matched: true, matchId, conversationId };
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating match/conversation:', error);
        throw error;
      } finally {
        client.release();
      }
    }

    return { matched: false };
  }

  async passUser(fromUserId: string, toUserId: string): Promise<void> {
    // For now, just record that we passed - in production, you might want a separate table
    // to avoid showing the same profile again
  }

  async getMatches(userId: string): Promise<Array<Match & { otherUser: UserResponse; conversationId?: string }>> {
    const matches = await db.all<Match & { conversation_id: string | null }>(
      `SELECT m.*, c.id as conversation_id 
       FROM matches m
       LEFT JOIN conversations c ON c.match_id = m.id
       WHERE (m.user_id_1 = $1 OR m.user_id_2 = $2) AND m.status = 'active'
       ORDER BY m.created_at DESC`,
      [userId, userId]
    );

    // Get other user info for each match
    const matchesWithUsers = await Promise.all(
       matches.map(async (match) => {
         const otherUserId = match.user_id_1 === userId ? match.user_id_2 : match.user_id_1;
          const otherUser = await db.get<UserResponse>(
            'SELECT id, email, name, age, bio, profile_photo, created_at, last_active FROM users WHERE id = $1',
            [otherUserId],
          );

        return {
          id: match.id,
          user_id_1: match.user_id_1,
          user_id_2: match.user_id_2,
          created_at: match.created_at,
          status: match.status,
          conversationId: match.conversation_id ?? undefined,
          otherUser: otherUser!,
        };
      })
    );

    return matchesWithUsers;
  }

  async ensureConversationForMatch(
    userId: string,
    matchId: string
  ): Promise<{ conversationId: string }> {
    const match = await db.get<Match>(
      `SELECT * FROM matches 
       WHERE id = $1 
       AND status = 'active'
       AND (user_id_1 = $2 OR user_id_2 = $2)`,
      [matchId, userId]
    );

    if (!match) {
      throw new Error('Match not found or access denied');
    }

    const existingConversation = await db.get<Conversation>(
      'SELECT * FROM conversations WHERE match_id = $1',
      [matchId]
    );

    if (existingConversation) {
      return { conversationId: existingConversation.id };
    }

    const conversationId = generateId('conv_');
    const createdConversation = await db.get<{ id: string }>(
      `INSERT INTO conversations (id, match_id, created_at, last_message_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (match_id) DO UPDATE SET last_message_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [conversationId, matchId]
    );

    if (!createdConversation) {
      const existingConversation = await db.get<Conversation>(
        'SELECT * FROM conversations WHERE match_id = $1',
        [matchId]
      );

      if (existingConversation) {
        return { conversationId: existingConversation.id };
      }

      const errorMessage = 'Failed to create conversation for match';
      console.error('CRITICAL: Conversation missing after ensure', {
        matchId,
        conversationId,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }

    return { conversationId: createdConversation.id };
  }

  async getDiscoveryProfiles(userId: string, limit: number = 10): Promise<UserResponse[]> {
    const currentUser = await db.get<UserResponse>(
      'SELECT id, gender, looking_for FROM users WHERE id = $1',
      [userId],
    );

    if (!currentUser?.gender || !currentUser.looking_for || currentUser.looking_for.length === 0) {
      return [];
    }

    // Get users that:
    // 1. Are not the current user
    // 2. Haven't been liked or passed by the current user
    // 3. Haven't been matched with the current user
    // 4. Match mutual compatibility preferences
    const profiles = await db.all<UserResponse>(
      `SELECT id, email, name, age, bio, profile_photo, gender, looking_for, created_at, last_active 
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
       AND gender IS NOT NULL
       AND looking_for IS NOT NULL
       AND gender = ANY($5::text[])
       AND $6 = ANY(looking_for)
       ORDER BY RANDOM()
       LIMIT $7`,
      [userId, userId, userId, userId, currentUser.looking_for, currentUser.gender, limit],
    );

    return profiles;
  }
}
