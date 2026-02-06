import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { FoodController } from '../controllers/food.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', FoodController.getAllFoods);
router.post('/', FoodController.createFood);

export default router;
