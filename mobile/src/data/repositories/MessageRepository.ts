import {
  Message,
  MessagePage,
  Conversation,
  MessageStatus,
  MessageType,
} from '../../domain/entities/Message';
import {IMessageRepository} from '../../domain/repositories/IMessageRepository';
import {apiClient} from '../../infrastructure/api/client';
import {wsClient} from '../../infrastructure/api/websocket';

interface ConversationsResponse {
  conversations: Array<{
    id: string;
    match_id: string;
    created_at: string;
    last_message_at: string;
    otherUser: {
      id: string;
      name: string;
      age: number;
      bio: string;
    };
    lastMessage?: {
      id: string;
      conversation_id: string;
      sender_id: string;
      content: string;
      type: string;
      status: string;
      created_at: string;
    };
  }>;
}

interface MessagePageResponse {
  messages: Array<{
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    type: string;
    status: string;
    created_at: string;
  }>;
  hasMore: boolean;
  nextCursor?: string;
  totalCount: number;
}

interface SendMessageResponse {
  message: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    type: string;
    status: string;
    created_at: string;
  };
}

/**
 * Message Repository with real backend API integration
 * Critical: Handles pagination for infinite message history
 */
export class MessageRepository implements IMessageRepository {
  private listeners: Map<string, Set<(message: Message) => void>> = new Map();

  constructor() {
    // Subscribe to WebSocket messages
    wsClient.subscribe((message: Message) => {
      this.notifyListeners(message.conversationId, message);
    });
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await apiClient.get<ConversationsResponse>(
        '/api/conversations',
      );

      return response.conversations.map(conv => {
        const conversation: Conversation = {
          id: conv.id,
          participantIds: ['current_user', conv.otherUser.id] as [
            string,
            string,
          ],
          matchId: conv.match_id,
          createdAt: new Date(conv.created_at),
          lastMessageAt: new Date(conv.last_message_at),
          lastMessage: conv.lastMessage
            ? {
                id: conv.lastMessage.id,
                conversationId: conv.lastMessage.conversation_id,
                senderId: conv.lastMessage.sender_id,
                content: conv.lastMessage.content,
                createdAt: new Date(conv.lastMessage.created_at),
                status: conv.lastMessage.status as MessageStatus,
                type: conv.lastMessage.type as MessageType,
              }
            : undefined,
          unreadCount: 0, // TODO: Get from backend
        };
        return conversation;
      });
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const conversations = await this.getConversations();
    return conversations.find(c => c.id === conversationId) || null;
  }

  /**
   * Get messages with pagination - critical for infinite chat
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    cursor?: string,
  ): Promise<MessagePage> {
    try {
      const url = `/api/conversations/${conversationId}/messages?limit=${limit}${
        cursor ? `&cursor=${cursor}` : ''
      }`;

      const response = await apiClient.get<MessagePageResponse>(url);

      return {
        messages: response.messages.map(msg => ({
          id: msg.id,
          conversationId: msg.conversation_id,
          senderId: msg.sender_id,
          content: msg.content,
          createdAt: new Date(msg.created_at),
          status: msg.status as MessageStatus,
          type: msg.type as MessageType,
        })),
        hasMore: response.hasMore,
        nextCursor: response.nextCursor,
        totalCount: response.totalCount,
      };
    } catch (error) {
      console.error('Error getting messages:', error);
      return {messages: [], hasMore: false, totalCount: 0};
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    try {
      // CRITICAL VALIDATION: Ensure conversationId is provided before making API call
      // This prevents "Conversation not found" errors from undefined conversationId
      if (!conversationId || conversationId.trim() === '') {
        console.error('CRITICAL ERROR: Cannot send message without conversationId', {
          conversationId,
          contentPreview: content.substring(0, 50),
        });
        throw new Error('conversationId is required to send a message');
      }

      console.log('Sending message via API', {
        conversationId,
        contentLength: content.length,
      });

      const response = await apiClient.post<SendMessageResponse>(
        `/api/conversations/${conversationId}/messages`,
        {content},
      );

      const message: Message = {
        id: response.message.id,
        conversationId: response.message.conversation_id,
        senderId: response.message.sender_id,
        content: response.message.content,
        createdAt: new Date(response.message.created_at),
        status: response.message.status as MessageStatus,
        type: response.message.type as MessageType,
      };

      // Notify local listeners
      this.notifyListeners(conversationId, message);

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async markAsRead(
    conversationId: string,
    messageIds: string[],
  ): Promise<void> {
    try {
      await apiClient.post(`/api/conversations/${conversationId}/read`, {
        messageIds,
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      // Don't throw - marking as read is not critical
    }
  }

  subscribeToConversation(
    conversationId: string,
    callback: (message: Message) => void,
  ): () => void {
    if (!this.listeners.has(conversationId)) {
      this.listeners.set(conversationId, new Set());
    }
    this.listeners.get(conversationId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(conversationId);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  async getMessageCount(conversationId: string): Promise<number> {
    try {
      const result = await this.getMessages(conversationId, 1);
      return result.totalCount;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }

  private notifyListeners(conversationId: string, message: Message): void {
    const callbacks = this.listeners.get(conversationId);
    if (callbacks) {
      callbacks.forEach(callback => callback(message));
    }
  }
}
