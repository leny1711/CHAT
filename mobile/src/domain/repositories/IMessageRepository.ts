import { Message, MessagePage, Conversation } from '../entities/Message';

/**
 * Repository interface for chat/messaging
 * Critical: Designed to handle infinite message history with pagination
 */
export interface IMessageRepository {
  /**
   * Get conversations for current user
   */
  getConversations(): Promise<Conversation[]>;

  /**
   * Get a specific conversation
   */
  getConversation(conversationId: string): Promise<Conversation | null>;

  /**
   * Get messages with pagination (critical for infinite chat)
   * @param conversationId - The conversation ID
   * @param limit - Number of messages to fetch
   * @param cursor - Pagination cursor (message ID or timestamp)
   * @returns Page of messages with pagination info
   */
  getMessages(
    conversationId: string,
    limit?: number,
    cursor?: string
  ): Promise<MessagePage>;

  /**
   * Send a new message
   */
  sendMessage(
    conversationId: string,
    content: string
  ): Promise<Message>;

  /**
   * Mark messages as read
   */
  markAsRead(conversationId: string, messageIds: string[]): Promise<void>;

  /**
   * Subscribe to new messages in a conversation (real-time)
   */
  subscribeToConversation(
    conversationId: string,
    callback: (message: Message) => void
  ): () => void;

  /**
   * Get total message count for a conversation
   */
  getMessageCount(conversationId: string): Promise<number>;
}
