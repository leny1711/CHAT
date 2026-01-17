import { Router } from 'express';
import { MatchController } from '../controllers/MatchController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const matchController = new MatchController();

// All routes require authentication
router.use(authMiddleware);

router.post('/like', (req, res) => matchController.like(req, res));
router.post('/pass', (req, res) => matchController.pass(req, res));
router.get('/', (req, res) => matchController.getMatches(req, res));
router.get('/discovery', (req, res) => matchController.getDiscoveryProfiles(req, res));

export default router;
