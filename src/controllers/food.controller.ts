import { Request, Response } from 'express';
import { FoodService } from '../services/food.service';
import { createFoodSchema } from '../validators/food.validator';
import { AuthenticatedRequest } from '../types';

export class FoodController {
  static async getAllFoods(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const foods = await FoodService.getAllFoods(userId);

    res.json({
      success: true,
      data: foods,
    });
  }

  static async createFood(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const data = createFoodSchema.parse(req.body);

    const food = await FoodService.createFood(userId, data);

    res.status(201).json({
      success: true,
      data: food,
    });
  }
}
