import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Placeholder - to be implemented
router.get('/', (_req, res) => {
  res.json({ success: true, data: [], message: 'Food routes coming soon' });
});

export default router;
