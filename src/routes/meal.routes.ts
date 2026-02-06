import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { MealController } from '../controllers/meal.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', MealController.getMeals);
router.post('/', MealController.createMeal);

export default router;
