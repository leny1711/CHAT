import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';
import { profilePhotoUpload } from '../middleware/upload';

const router = Router();
const authController = new AuthController();

// Public routes
router.post(
  '/register',
  profilePhotoUpload.single('profilePhoto'),
  (req, res) => authController.register(req, res)
);
router.post('/login', (req, res) => authController.login(req, res));

// Protected routes
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));

export default router;
