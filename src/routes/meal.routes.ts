import { Router } from 'express';
import { mealController } from '../controllers/meal.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  createMealSchema,
  updateMealSchema,
  addMealEntrySchema,
  updateMealEntrySchema,
} from '../validators/meal.validator';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /meals - List meals (with optional filters)
router.get('/', mealController.getMeals);

// GET /meals/daily/:date - Get all meals for a specific date
router.get('/daily/:date', mealController.getMealsByDate);

// GET /meals/:id - Get meal by ID
router.get('/:id', mealController.getMealById);

// POST /meals - Create meal
router.post('/', validateBody(createMealSchema), mealController.createMeal);

// PUT /meals/:id - Update meal
router.put('/:id', validateBody(updateMealSchema), mealController.updateMeal);

// DELETE /meals/:id - Delete meal
router.delete('/:id', mealController.deleteMeal);

// POST /meals/:id/entries - Add entry to meal
router.post('/:id/entries', validateBody(addMealEntrySchema), mealController.addEntry);

// PUT /meals/:mealId/entries/:entryId - Update meal entry
router.put(
  '/:mealId/entries/:entryId',
  validateBody(updateMealEntrySchema),
  mealController.updateEntry
);

// DELETE /meals/:mealId/entries/:entryId - Remove meal entry
router.delete('/:mealId/entries/:entryId', mealController.removeEntry);

export default router;
