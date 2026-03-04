import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { updateProfileSchema, updateGoalsSchema } from '../validators/user.validator';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/me', userController.getProfile);
router.put('/me', validateBody(updateProfileSchema), userController.updateProfile);
router.delete('/me', userController.deleteAccount);

// Goals routes
router.get('/me/goals', userController.getGoals);
router.put('/me/goals', validateBody(updateGoalsSchema), userController.updateGoals);
router.get('/me/goals/calculated', userController.getCalculatedGoals);

export default router;
