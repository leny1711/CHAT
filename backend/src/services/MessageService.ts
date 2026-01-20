import { db } from '../config/database';
import { Message, Conversation, MessagePage } from '../types';
import { generateId } from '../utils/crypto';
import { WebSocketServer } from '../config/websocket';

export class MessageService {
  private wsServer?: WebSocketServer;

  setWebSocketServer(wsServer: WebSocketServer): void {
    this.wsServer = wsServer;
  }

  async getConversations(userId: string): Promise<Array<Conversation & { otherUser: any; lastMessage?: Message }>> {
    // Get all conversations where user is a participant
    const conversations = await db.all<Conversation & { user_id_1: string; user_id_2: string }>(
      `SELECT c.*, m.user_id_1, m.user_id_2
       FROM conversations c
       JOIN matches m ON m.id = c.match_id
       WHERE m.user_id_1 = $1 OR m.user_id_2 = $2
       ORDER BY c.last_message_at DESC`,
      [userId, userId]
    );

    // Get last message and other user info for each conversation
    const conversationsWithData = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await db.get<Message>(
          `SELECT * FROM messages 
           WHERE conversation_id = $1 
           ORDER BY created_at DESC LIMIT 1`,
          [conv.id]
        );

        const otherUserId = conv.user_id_1 === userId ? conv.user_id_2 : conv.user_id_1;
        const otherUser = await db.get(
          'SELECT id, name, age, bio FROM users WHERE id = $1',
          [otherUserId]
        );

        return {
          id: conv.id,
          match_id: conv.match_id,
          created_at: conv.created_at,
          last_message_at: conv.last_message_at,
          otherUser,
          lastMessage,
        };
      })
    );

    return conversationsWithData;
  }

  async getMessages(
    conversationId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<MessagePage> {
    // Get total count
    const countResult = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM messages WHERE conversation_id = $1',
      [conversationId]
    );
    const totalCount = countResult?.count || 0;

    // Build query
    let query = `
      SELECT * FROM messages 
      WHERE conversation_id = $1
    `;
    const params: any[] = [conversationId];

    // Add cursor condition if provided
    if (cursor) {
      const cursorMessage = await db.get<Message>(
        'SELECT * FROM messages WHERE id = $1',
        [cursor]
      );
      
      if (cursorMessage) {
        query += ' AND created_at < $2';
        params.push(cursorMessage.created_at);
      }
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit + 1); // Get one extra to check if there are more

    // Get messages
    const messages = await db.all<Message>(query, params);

    // Check if there are more messages
    const hasMore = messages.length > limit;
    if (hasMore) {
      messages.pop(); // Remove the extra message
    }

    // Get next cursor (last message id)
    const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : undefined;

    return {
      messages: messages.reverse(), // Return in ascending order (oldest to newest)
      hasMore,
      nextCursor,
      totalCount,
    };
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<Message> {
    // Verify conversation exists and user is participant
    const conversation = await db.get<Conversation & { user_id_1: string; user_id_2: string }>(
      `SELECT c.*, m.user_id_1, m.user_id_2
       FROM conversations c
       JOIN matches m ON m.id = c.match_id
       WHERE c.id = $1`,
      [conversationId]
    );

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.user_id_1 !== senderId && conversation.user_id_2 !== senderId) {
      throw new Error('Not a participant in this conversation');
    }

    // Create message
    const messageId = generateId('msg_');
    await db.run(
      `INSERT INTO messages (id, conversation_id, sender_id, content, type, status) 
       VALUES ($1, $2, $3, $4, 'text', 'sent')`,
      [messageId, conversationId, senderId, content]
    );

    // Update conversation last_message_at
    await db.run(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );

    // Get the created message
    const message = await db.get<Message>(
      'SELECT * FROM messages WHERE id = $1',
      [messageId]
    );

    if (!message) {
      throw new Error('Failed to create message');
    }

    // Send via WebSocket to other participant
    const recipientId = conversation.user_id_1 === senderId 
      ? conversation.user_id_2 
      : conversation.user_id_1;

    if (this.wsServer) {
      this.wsServer.sendToUser(recipientId, {
        type: 'new_message',
        payload: message,
      });
    }

    return message;
  }

  async markMessagesAsRead(
    conversationId: string,
    messageIds: string[],
    userId: string
  ): Promise<void> {
    if (messageIds.length === 0) return;

    // PostgreSQL uses ANY with array parameter instead of IN
    await db.run(
      `UPDATE messages 
       SET status = 'read' 
       WHERE id = ANY($1::text[]) 
       AND conversation_id = $2 
       AND sender_id != $3`,
      [messageIds, conversationId, userId]
    );
  }
}
