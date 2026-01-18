/**
 * Message entity
 * Represents a single message in a conversation
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  status: MessageStatus;
  type: MessageType;
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
}

/**
 * Conversation entity
 * Represents a 1-to-1 chat between two matched users
 * Designed to handle infinite messages with pagination
 */
export interface Conversation {
  id: string;
  participantIds: [string, string];
  matchId: string;
  createdAt: Date;
  lastMessageAt: Date;
  lastMessage?: Message;
  unreadCount: number;
}

/**
 * Paginated message result for efficient loading
 */
export interface MessagePage {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount: number;
}
