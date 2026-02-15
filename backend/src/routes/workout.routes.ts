import { Router } from 'express';
import { workoutController } from '../controllers/workout.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  addWorkoutEntrySchema,
  updateWorkoutEntrySchema,
} from '../validators/workout.validator';

const router = Router();

router.use(authMiddleware);

// GET /workouts - List workouts (with optional date/type filters)
router.get('/', workoutController.getWorkouts);

// GET /workouts/:id - Get workout by ID
router.get('/:id', workoutController.getWorkoutById);

// POST /workouts - Create workout
router.post('/', validateBody(createWorkoutSchema), workoutController.createWorkout);

// PUT /workouts/:id - Update workout metadata
router.put('/:id', validateBody(updateWorkoutSchema), workoutController.updateWorkout);

// DELETE /workouts/:id - Delete workout
router.delete('/:id', workoutController.deleteWorkout);

// POST /workouts/:id/entries - Add entry to workout
router.post('/:id/entries', validateBody(addWorkoutEntrySchema), workoutController.addEntry);

// PUT /workouts/:workoutId/entries/:entryId - Update workout entry
router.put(
  '/:workoutId/entries/:entryId',
  validateBody(updateWorkoutEntrySchema),
  workoutController.updateEntry
);

// DELETE /workouts/:workoutId/entries/:entryId - Remove workout entry
router.delete('/:workoutId/entries/:entryId', workoutController.removeEntry);

export default router;
