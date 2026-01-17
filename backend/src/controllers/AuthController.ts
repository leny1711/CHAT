import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { generateToken } from '../middleware/auth';
import { AuthRequest, RegisterRequest } from '../types';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterRequest = req.body;

      // Validate input
      if (!data.email || !data.password || !data.name || !data.age) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const user = await authService.register(data);
      const token = generateToken(user.id);

      res.status(201).json({ token, user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({ error: message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: AuthRequest = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Missing email or password' });
        return;
      }

      const user = await authService.login(email, password);
      const token = generateToken(user.id);

      res.status(200).json({ token, user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({ error: message });
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const user = await authService.getUserById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  }
}
