import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Message,
  MessagePage,
  Conversation,
  MessageStatus,
  MessageType,
} from '../../domain/entities/Message';
import { IMessageRepository } from '../../domain/repositories/IMessageRepository';

/**
 * Mock implementation of Message Repository
 * Critical: Handles pagination for infinite message history
 * In production, this would connect to a real backend with proper pagination
 */
export class MessageRepository implements IMessageRepository {
  private readonly CONVERSATIONS_KEY = '@conversations';
  private readonly MESSAGES_PREFIX = '@messages_';
  private listeners: Map<string, Set<(message: Message) => void>> = new Map();

  async getConversations(): Promise<Conversation[]> {
    try {
      const data = await AsyncStorage.getItem(this.CONVERSATIONS_KEY);
      return data ? JSON.parse(data) : [];
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
    cursor?: string
  ): Promise<MessagePage> {
    try {
      const key = `${this.MESSAGES_PREFIX}${conversationId}`;
      const data = await AsyncStorage.getItem(key);
      const allMessages: Message[] = data ? JSON.parse(data) : [];

      // Sort by createdAt descending (newest first)
      allMessages.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Find cursor position
      let startIndex = 0;
      if (cursor) {
        startIndex = allMessages.findIndex(m => m.id === cursor) + 1;
      }

      // Get page of messages
      const messages = allMessages.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < allMessages.length;
      const nextCursor = messages.length > 0 ? messages[messages.length - 1].id : undefined;

      return {
        messages,
        hasMore,
        nextCursor,
        totalCount: allMessages.length,
      };
    } catch (error) {
      console.error('Error getting messages:', error);
      return { messages: [], hasMore: false, totalCount: 0 };
    }
  }

  async sendMessage(
    conversationId: string,
    content: string
  ): Promise<Message> {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      conversationId,
      senderId: 'current_user', // In production, get from auth
      content,
      createdAt: new Date(),
      status: MessageStatus.SENT,
      type: MessageType.TEXT,
    };

    // Save message
    const key = `${this.MESSAGES_PREFIX}${conversationId}`;
    const data = await AsyncStorage.getItem(key);
    const messages: Message[] = data ? JSON.parse(data) : [];
    messages.push(message);
    await AsyncStorage.setItem(key, JSON.stringify(messages));

    // Update conversation
    const conversations = await this.getConversations();
    const convIndex = conversations.findIndex(c => c.id === conversationId);
    if (convIndex >= 0) {
      conversations[convIndex].lastMessageAt = new Date();
      conversations[convIndex].lastMessage = message;
      await AsyncStorage.setItem(
        this.CONVERSATIONS_KEY,
        JSON.stringify(conversations)
      );
    }

    // Notify listeners
    this.notifyListeners(conversationId, message);

    return message;
  }

  async markAsRead(
    conversationId: string,
    messageIds: string[]
  ): Promise<void> {
    const key = `${this.MESSAGES_PREFIX}${conversationId}`;
    const data = await AsyncStorage.getItem(key);
    const messages: Message[] = data ? JSON.parse(data) : [];

    messages.forEach(msg => {
      if (messageIds.includes(msg.id)) {
        msg.status = MessageStatus.READ;
      }
    });

    await AsyncStorage.setItem(key, JSON.stringify(messages));
  }

  subscribeToConversation(
    conversationId: string,
    callback: (message: Message) => void
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
    const key = `${this.MESSAGES_PREFIX}${conversationId}`;
    const data = await AsyncStorage.getItem(key);
    const messages: Message[] = data ? JSON.parse(data) : [];
    return messages.length;
  }

  private notifyListeners(conversationId: string, message: Message): void {
    const callbacks = this.listeners.get(conversationId);
    if (callbacks) {
      callbacks.forEach(callback => callback(message));
    }
  }
}
