import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// GET /dashboard/today - Today's full summary with meals, workouts, goal comparison
router.get('/today', dashboardController.getTodaySummary);

// GET /dashboard/weekly - Weekly overview (7 days of summaries + averages)
router.get('/weekly', dashboardController.getWeeklyOverview);

// GET /dashboard/:date - Summary for a specific date (YYYY-MM-DD)
router.get('/:date', dashboardController.getDateSummary);

export default router;
