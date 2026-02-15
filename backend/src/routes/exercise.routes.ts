import { Router } from 'express';
import { exerciseController } from '../controllers/exercise.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createExerciseSchema, updateExerciseSchema } from '../validators/exercise.validator';

const router = Router();

router.use(authMiddleware);

// GET /exercises - List/search exercises
router.get('/', exerciseController.getAllExercises);

// GET /exercises/:id - Get exercise by ID
router.get('/:id', exerciseController.getExerciseById);

// POST /exercises - Create custom exercise
router.post('/', validateBody(createExerciseSchema), exerciseController.createExercise);

// PUT /exercises/:id - Update custom exercise
router.put('/:id', validateBody(updateExerciseSchema), exerciseController.updateExercise);

// DELETE /exercises/:id - Delete custom exercise
router.delete('/:id', exerciseController.deleteExercise);

export default router;
