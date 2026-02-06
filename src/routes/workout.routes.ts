import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { WorkoutController } from '../controllers/workout.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', WorkoutController.getWorkouts);
router.post('/', WorkoutController.createWorkout);

export default router;
