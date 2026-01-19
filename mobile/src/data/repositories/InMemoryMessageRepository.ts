import {Message} from '../../domain/entities/Message';
import {IMessageRepository} from '../../domain/repositories/IMessageRepository';

/**
 * Simple in-memory message repository
 * Messages are stored in memory and persist during app runtime
 */
export class InMemoryMessageRepository implements IMessageRepository {
  private messages: Map<string, Message[]> = new Map(); // conversationId -> messages
  private nextMessageId = 1;
  private currentUserId: string | null = null;
  private subscribers: Map<string, Set<(message: Message) => void>> =
    new Map();

  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
  }

  async getMessages(
    conversationId: string,
    limit: number = 50,
    cursor?: string,
  ): Promise<{
    messages: Message[];
    hasMore: boolean;
    nextCursor?: string;
  }> {
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

    return {messages, hasMore, nextCursor};
  }

  async sendMessage(
    conversationId: string,
    content: string,
  ): Promise<Message> {
    if (!this.currentUserId) {
      throw new Error('No user logged in');
    }

    const message: Message = {
      id: `msg_${this.nextMessageId++}`,
      conversationId,
      senderId: this.currentUserId,
      content,
      createdAt: new Date(),
      status: 'sent',
    };

    // Add to conversation
    if (!this.messages.has(conversationId)) {
      this.messages.set(conversationId, []);
    }
    this.messages.get(conversationId)!.push(message);

    // Notify subscribers
    const conversationSubscribers = this.subscribers.get(conversationId);
    if (conversationSubscribers) {
      conversationSubscribers.forEach(callback => callback(message));
    }

    return message;
  }

  async subscribeToConversation(
    conversationId: string,
    callback: (message: Message) => void,
  ): Promise<() => void> {
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
}
