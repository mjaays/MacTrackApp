import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Placeholder - to be implemented
router.get('/today', (_req, res) => {
  res.json({ success: true, data: {}, message: 'Dashboard routes coming soon' });
});

export default router;
