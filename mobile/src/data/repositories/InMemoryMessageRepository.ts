import {
  Message,
  MessagePage,
  MessageStatus,
  MessageType,
  Conversation,
} from '../../domain/entities/Message';
import {IMessageRepository} from '../../domain/repositories/IMessageRepository';

/**
 * Simple in-memory message repository
 * Messages are stored in memory and persist during app runtime
 */
export class InMemoryMessageRepository implements IMessageRepository {
  private messages: Map<string, Message[]> = new Map(); // conversationId -> messages
  private conversations: Map<string, Conversation> = new Map();
  private nextMessageId = 1;
  private currentUserId: string | null = null;
  private subscribers: Map<string, Set<(message: Message) => void>> = new Map();

  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
  }

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversations.get(conversationId) || null;
  }

  async getMessages(
    conversationId: string,
    limit: number = 50,
    cursor?: string,
  ): Promise<MessagePage> {
    const allMessages = this.messages.get(conversationId) || [];

    // Sort by date descending (newest first)
    const sorted = [...allMessages].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = parseInt(cursor, 10);
      startIndex = isNaN(cursorIndex) ? 0 : cursorIndex;
    }

    const messages = sorted.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < sorted.length;
    const nextCursor = hasMore ? String(startIndex + limit) : undefined;

    return {
      messages,
      hasMore,
      nextCursor,
      totalCount: sorted.length,
    };
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    if (!this.currentUserId) {
      throw new Error('No user logged in');
    }

    const message: Message = {
      id: `msg_${this.nextMessageId++}`,
      conversationId,
      senderId: this.currentUserId,
      content,
      createdAt: new Date(),
      status: MessageStatus.SENT,
      type: MessageType.TEXT,
    };

    // Add to conversation
    if (!this.messages.has(conversationId)) {
      this.messages.set(conversationId, []);
    }
    this.messages.get(conversationId)!.push(message);

    // Update conversation
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.lastMessageAt = message.createdAt;
      conversation.lastMessage = message;
    }

    // Notify subscribers
    const conversationSubscribers = this.subscribers.get(conversationId);
    if (conversationSubscribers) {
      conversationSubscribers.forEach(callback => callback(message));
    }

    return message;
  }

  async markAsRead(
    _conversationId: string,
    _messageIds: string[],
  ): Promise<void> {
    // Simple implementation - just acknowledge
    return Promise.resolve();
  }

  subscribeToConversation(
    conversationId: string,
    callback: (message: Message) => void,
  ): () => void {
    if (!this.subscribers.has(conversationId)) {
      this.subscribers.set(conversationId, new Set());
    }

    this.subscribers.get(conversationId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const conversationSubscribers = this.subscribers.get(conversationId);
      if (conversationSubscribers) {
        conversationSubscribers.delete(callback);
      }
    };
  }

  async getMessageCount(conversationId: string): Promise<number> {
    const messages = this.messages.get(conversationId) || [];
    return messages.length;
  }
}
