import { SendMessageUseCase, GetMessagesUseCase } from '../MessageUseCases';
import { IMessageRepository } from '../../repositories/IMessageRepository';
import { Message, MessageStatus, MessageType, MessagePage } from '../../entities/Message';

// Mock repository
class MockMessageRepository implements IMessageRepository {
  private messages: Message[] = [];

  async getConversations() {
    return [];
  }

  async getConversation() {
    return null;
  }

  async getMessages(conversationId: string, limit = 50, cursor?: string): Promise<MessagePage> {
    const messages = this.messages.filter(m => m.conversationId === conversationId);
    return {
      messages: messages.slice(0, limit),
      hasMore: messages.length > limit,
      nextCursor: messages.length > limit ? messages[limit - 1].id : undefined,
      totalCount: messages.length,
    };
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const message: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: 'test_user',
      content,
      createdAt: new Date(),
      status: MessageStatus.SENT,
      type: MessageType.TEXT,
    };
    this.messages.push(message);
    return message;
  }

  async markAsRead() {}

  subscribeToConversation() {
    return () => {};
  }

  async getMessageCount(conversationId: string): Promise<number> {
    return this.messages.filter(m => m.conversationId === conversationId).length;
  }

  // Helper for tests
  addMessage(message: Message) {
    this.messages.push(message);
  }
}

describe('MessageUseCases', () => {
  describe('SendMessageUseCase', () => {
    it('should send a message successfully', async () => {
      const mockRepo = new MockMessageRepository();
      const useCase = new SendMessageUseCase(mockRepo);

      const message = await useCase.execute('conv1', 'Hello world');

      expect(message).toBeDefined();
      expect(message.content).toBe('Hello world');
      expect(message.conversationId).toBe('conv1');
      expect(message.status).toBe(MessageStatus.SENT);
    });

    it('should throw error for empty message', async () => {
      const mockRepo = new MockMessageRepository();
      const useCase = new SendMessageUseCase(mockRepo);

      await expect(useCase.execute('conv1', '   ')).rejects.toThrow(
        'Message content cannot be empty'
      );
    });
  });

  describe('GetMessagesUseCase', () => {
    it('should get messages with pagination', async () => {
      const mockRepo = new MockMessageRepository();
      
      // Add test messages
      for (let i = 0; i < 100; i++) {
        mockRepo.addMessage({
          id: `msg_${i}`,
          conversationId: 'conv1',
          senderId: 'user1',
          content: `Message ${i}`,
          createdAt: new Date(),
          status: MessageStatus.SENT,
          type: MessageType.TEXT,
        });
      }

      const useCase = new GetMessagesUseCase(mockRepo);
      const result = await useCase.execute('conv1', 50);

      expect(result.messages).toHaveLength(50);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBeDefined();
      expect(result.totalCount).toBe(100);
    });

    it('should handle empty conversation', async () => {
      const mockRepo = new MockMessageRepository();
      const useCase = new GetMessagesUseCase(mockRepo);

      const result = await useCase.execute('empty_conv', 50);

      expect(result.messages).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.totalCount).toBe(0);
    });
  });
});
