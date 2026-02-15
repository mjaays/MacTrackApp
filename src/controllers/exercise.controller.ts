import { Response, NextFunction } from 'express';
import { exerciseService } from '../services/exercise.service';
import { responseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types';
import type { CreateExerciseInput, UpdateExerciseInput, SearchExercisesInput } from '../validators/exercise.validator';

export const exerciseController = {
  async getAllExercises(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const params: SearchExercisesInput = {
        query: req.query.query as string | undefined,
        category: req.query.category as SearchExercisesInput['category'],
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };
      const result = await exerciseService.getAllExercises(req.userId!, params);
      responseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getExerciseById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const exerciseId = req.params.id as string;
      const exercise = await exerciseService.getExerciseById(req.userId!, exerciseId);
      responseUtil.success(res, exercise);
    } catch (error) {
      next(error);
    }
  },

  async createExercise(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const exercise = await exerciseService.createExercise(
        req.userId!,
        req.body as CreateExerciseInput
      );
      responseUtil.created(res, exercise);
    } catch (error) {
      next(error);
    }
  },

  async updateExercise(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const exerciseId = req.params.id as string;
      const exercise = await exerciseService.updateExercise(
        req.userId!,
        exerciseId,
        req.body as UpdateExerciseInput
      );
      responseUtil.success(res, exercise);
    } catch (error) {
      next(error);
    }
  },

  async deleteExercise(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const exerciseId = req.params.id as string;
      await exerciseService.deleteExercise(req.userId!, exerciseId);
      responseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  },
};

export default exerciseController;
