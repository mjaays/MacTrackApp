import { Response, NextFunction } from 'express';
import { mealService } from '../services/meal.service';
import { responseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types';
import type {
  CreateMealInput,
  UpdateMealInput,
  AddMealEntryInput,
  UpdateMealEntryInput,
  GetMealsInput,
} from '../validators/meal.validator';

export const mealController = {
  async getMeals(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const params: GetMealsInput = {
        date: req.query.date as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        mealType: req.query.mealType as GetMealsInput['mealType'],
      };

      const meals = await mealService.getMeals(req.userId!, params);
      responseUtil.success(res, meals);
    } catch (error) {
      next(error);
    }
  },

  async getMealsByDate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const date = req.params.date as string;
      const meals = await mealService.getMealsByDate(req.userId!, date);
      responseUtil.success(res, meals);
    } catch (error) {
      next(error);
    }
  },

  async getMealById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const mealId = req.params.id as string;
      const meal = await mealService.getMealById(req.userId!, mealId);
      responseUtil.success(res, meal);
    } catch (error) {
      next(error);
    }
  },

  async createMeal(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const meal = await mealService.createMeal(req.userId!, req.body as CreateMealInput);
      responseUtil.created(res, meal);
    } catch (error) {
      next(error);
    }
  },

  async updateMeal(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const mealId = req.params.id as string;
      const meal = await mealService.updateMeal(
        req.userId!,
        mealId,
        req.body as UpdateMealInput
      );
      responseUtil.success(res, meal);
    } catch (error) {
      next(error);
    }
  },

  async deleteMeal(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const mealId = req.params.id as string;
      await mealService.deleteMeal(req.userId!, mealId);
      responseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  },

  async addEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const mealId = req.params.id as string;
      const entry = await mealService.addMealEntry(
        req.userId!,
        mealId,
        req.body as AddMealEntryInput
      );
      responseUtil.created(res, entry);
    } catch (error) {
      next(error);
    }
  },

  async updateEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const mealId = req.params.mealId as string;
      const entryId = req.params.entryId as string;
      const entry = await mealService.updateMealEntry(
        req.userId!,
        mealId,
        entryId,
        req.body as UpdateMealEntryInput
      );
      responseUtil.success(res, entry);
    } catch (error) {
      next(error);
    }
  },

  async removeEntry(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const mealId = req.params.mealId as string;
      const entryId = req.params.entryId as string;
      await mealService.removeMealEntry(req.userId!, mealId, entryId);
      responseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  },
};

export default mealController;
