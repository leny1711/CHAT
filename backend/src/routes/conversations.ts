import { Router } from 'express';
import { messageController } from '../controllers/MessageController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/', (req, res) => messageController.getConversations(req, res));
router.get('/:conversationId/messages', (req, res) => messageController.getMessages(req, res));
router.post('/:conversationId/messages', (req, res) => messageController.sendMessage(req, res));
router.post('/:conversationId/read', (req, res) => messageController.markAsRead(req, res));

export default router;
