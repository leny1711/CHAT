import {IMessageRepository} from '../repositories/IMessageRepository';
import {Message, MessagePage, Conversation} from '../entities/Message';

/**
 * Use case for getting conversations
 */
export class GetConversationsUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(): Promise<Conversation[]> {
    return this.messageRepository.getConversations();
  }
}

/**
 * Use case for getting messages with pagination
 * Critical: Handles infinite message history
 */
export class GetMessagesUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(
    conversationId: string,
    limit: number = 50,
    cursor?: string,
  ): Promise<MessagePage> {
    return this.messageRepository.getMessages(conversationId, limit, cursor);
  }
}

/**
 * Use case for sending a message
 */
export class SendMessageUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(conversationId: string, content: string): Promise<Message> {
    if (!content.trim()) {
      throw new Error('Message content cannot be empty');
    }
    return this.messageRepository.sendMessage(conversationId, content);
  }
}

/**
 * Use case for marking messages as read
 */
export class MarkMessagesAsReadUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(conversationId: string, messageIds: string[]): Promise<void> {
    return this.messageRepository.markAsRead(conversationId, messageIds);
  }
}

/**
 * Use case for subscribing to conversation updates
 */
export class SubscribeToConversationUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  execute(
    conversationId: string,
    callback: (message: Message) => void,
  ): () => void {
    return this.messageRepository.subscribeToConversation(
      conversationId,
      callback,
    );
  }
}
