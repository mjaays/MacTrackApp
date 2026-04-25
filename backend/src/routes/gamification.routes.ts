import { Router } from 'express';
import { gamificationController } from '../controllers/gamification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/stats', gamificationController.getStats);
router.get('/achievements', gamificationController.getAchievements);
router.get('/quests/today', gamificationController.getTodayQuests);
router.get('/leaderboard', gamificationController.getLeaderboard);

export default router;
