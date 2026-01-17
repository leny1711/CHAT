import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { MessageService } from '../services/MessageService';

const messageService = new MessageService();

export class MessageController {
  setMessageService(service: MessageService): void {
    // Allow setting service with WebSocket server configured
  }

  async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const conversations = await messageService.getConversations(userId);
      res.status(200).json({ conversations });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get conversations' });
    }
  }

  async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const conversationId = req.params.conversationId as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const cursor = req.query.cursor as string | undefined;

      const result = await messageService.getMessages(conversationId, limit, cursor);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get messages' });
    }
  }

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const conversationId = req.params.conversationId as string;
      const { content } = req.body;

      if (!content) {
        res.status(400).json({ error: 'Message content is required' });
        return;
      }

      const message = await messageService.sendMessage(conversationId, userId, content);
      res.status(201).json({ message });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      res.status(400).json({ error: message });
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const conversationId = req.params.conversationId as string;
      const { messageIds } = req.body;

      if (!Array.isArray(messageIds)) {
        res.status(400).json({ error: 'messageIds must be an array' });
        return;
      }

      await messageService.markMessagesAsRead(conversationId, messageIds, userId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }
}

export const messageController = new MessageController();
export { messageService };
