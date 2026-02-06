import { Response } from 'express';
import { MealService } from '../services/meal.service';
import { createMealSchema } from '../validators/meal.validator';
import { AuthenticatedRequest } from '../types';

export class MealController {
  static async createMeal(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const input = createMealSchema.parse(req.body);

    const meal = await MealService.createMeal(userId, input);

    res.status(201).json({
      success: true,
      data: meal,
    });
  }

  static async getMeals(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId!;
    const meals = await MealService.getMeals(userId);

    res.json({
      success: true,
      data: meals,
    });
  }
}
