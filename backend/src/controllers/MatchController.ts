import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { MatchService } from '../services/MatchService';

const matchService = new MatchService();

export class MatchController {
  async like(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { targetUserId } = req.body;

      if (!targetUserId) {
        res.status(400).json({ error: 'Missing targetUserId' });
        return;
      }

      const result = await matchService.likeUser(userId, targetUserId);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Like failed';
      res.status(400).json({ error: message });
    }
  }

  async pass(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { targetUserId } = req.body;

      if (!targetUserId) {
        res.status(400).json({ error: 'Missing targetUserId' });
        return;
      }

      await matchService.passUser(userId, targetUserId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ error: 'Pass failed' });
    }
  }

  async getMatches(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const matches = await matchService.getMatches(userId);
      res.status(200).json({ matches });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get matches' });
    }
  }

  async getDiscoveryProfiles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const profiles = await matchService.getDiscoveryProfiles(userId, limit);
      res.status(200).json({ profiles });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get discovery profiles' });
    }
  }

  async ensureConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { matchId } = req.body;

      if (!matchId) {
        res.status(400).json({ error: 'Missing matchId' });
        return;
      }

      const result = await matchService.ensureConversationForMatch(userId, matchId);
      res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to ensure conversation';
      res.status(400).json({ error: message });
    }
  }
}
