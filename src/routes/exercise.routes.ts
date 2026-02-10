import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { ExerciseController } from '../controllers/exercise.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', ExerciseController.getAllExercises);
router.post('/', ExerciseController.createExercise);

export default router;
