import { Router } from 'express';
import { foodController } from '../controllers/food.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { createFoodSchema, updateFoodSchema } from '../validators/food.validator';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /foods - List/search foods
router.get('/', foodController.getAllFoods);

// GET /foods/barcode/:barcode - Get food by barcode
router.get('/barcode/:barcode', foodController.getFoodByBarcode);

// GET /foods/:id - Get food by ID
router.get('/:id', foodController.getFoodById);

// POST /foods - Create custom food
router.post('/', validateBody(createFoodSchema), foodController.createFood);

// PUT /foods/:id - Update custom food
router.put('/:id', validateBody(updateFoodSchema), foodController.updateFood);

// DELETE /foods/:id - Delete custom food
router.delete('/:id', foodController.deleteFood);

export default router;
