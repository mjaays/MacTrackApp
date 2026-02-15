import { Response, NextFunction } from 'express';
import { foodService } from '../services/food.service';
import { responseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types';
import type { CreateFoodInput, UpdateFoodInput, SearchFoodsInput } from '../validators/food.validator';

export const foodController = {
  async getAllFoods(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const params: SearchFoodsInput = {
        query: req.query.query as string | undefined,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };

      const result = await foodService.getAllFoods(req.userId!, params);
      responseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getFoodById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const foodId = req.params.id as string;
      const food = await foodService.getFoodById(req.userId!, foodId);
      responseUtil.success(res, food);
    } catch (error) {
      next(error);
    }
  },

  async getFoodByBarcode(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const barcode = req.params.barcode as string;
      const food = await foodService.getFoodByBarcode(req.userId!, barcode);
      responseUtil.success(res, food);
    } catch (error) {
      next(error);
    }
  },

  async createFood(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const food = await foodService.createFood(req.userId!, req.body as CreateFoodInput);
      responseUtil.created(res, food);
    } catch (error) {
      next(error);
    }
  },

  async updateFood(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const foodId = req.params.id as string;
      const food = await foodService.updateFood(
        req.userId!,
        foodId,
        req.body as UpdateFoodInput
      );
      responseUtil.success(res, food);
    } catch (error) {
      next(error);
    }
  },

  async deleteFood(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const foodId = req.params.id as string;
      await foodService.deleteFood(req.userId!, foodId);
      responseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  },
};

export default foodController;
