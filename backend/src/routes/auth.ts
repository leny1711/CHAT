import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { CityController } from '../controllers/CityController';
import { authMiddleware } from '../middleware/auth';
import { profilePhotoUpload } from '../middleware/upload';

const router = Router();
const authController = new AuthController();
const cityController = new CityController();

// Public routes
router.post(
  '/register',
  profilePhotoUpload.single('profilePhoto'),
  (req, res) => authController.register(req, res)
);
router.post('/login', (req, res) => authController.login(req, res));
router.get('/cities', (req, res) => cityController.search(req, res));

// Protected routes
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));

export default router;
