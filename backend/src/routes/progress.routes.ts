import { Router } from 'express';
import { progressController } from '../controllers/progress.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createProgressLogSchema, updateProgressLogSchema } from '../validators/progress.validator';

const router = Router();

router.use(authMiddleware);

// GET /progress - List progress logs (with date range + pagination)
router.get('/', progressController.getProgressLogs);

// GET /progress/stats - Weight/measurement trend stats
router.get('/stats', progressController.getProgressStats);

// GET /progress/:id - Get progress log by ID
router.get('/:id', progressController.getProgressLogById);

// POST /progress - Create progress log
router.post('/', validateBody(createProgressLogSchema), progressController.createProgressLog);

// PUT /progress/:id - Update progress log
router.put('/:id', validateBody(updateProgressLogSchema), progressController.updateProgressLog);

// DELETE /progress/:id - Delete progress log
router.delete('/:id', progressController.deleteProgressLog);

export default router;
