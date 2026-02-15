import { Response, NextFunction } from 'express';
import { workoutService } from '../services/workout.service';
import { responseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types';
import type {
  CreateWorkoutInput,
  UpdateWorkoutInput,
  AddWorkoutEntryInput,
  UpdateWorkoutEntryInput,
} from '../validators/workout.validator';

export const workoutController = {
  async getWorkouts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const params = {
        date: req.query.date as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        workoutType: req.query.workoutType as string | undefined,
      };
      const workouts = await workoutService.getWorkouts(req.userId!, params);
      responseUtil.success(res, workouts);
    } catch (error) {
      next(error);
    }
  },

  async getWorkoutById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const workoutId = req.params.id as string;
      const workout = await workoutService.getWorkoutById(req.userId!, workoutId);
      responseUtil.success(res, workout);
    } catch (error) {
      next(error);
    }
  },

  async createWorkout(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const workout = await workoutService.createWorkout(
        req.userId!,
        req.body as CreateWorkoutInput
      );
      responseUtil.created(res, workout);
    } catch (error) {
      next(error);
    }
  },

  async updateWorkout(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const workoutId = req.params.id as string;
      const workout = await workoutService.updateWorkout(
        req.userId!,
        workoutId,
        req.body as UpdateWorkoutInput
      );
      responseUtil.success(res, workout);
    } catch (error) {
      next(error);
    }
  },

  async deleteWorkout(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const workoutId = req.params.id as string;
      await workoutService.deleteWorkout(req.userId!, workoutId);
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
      const workoutId = req.params.id as string;
      const entry = await workoutService.addWorkoutEntry(
        req.userId!,
        workoutId,
        req.body as AddWorkoutEntryInput
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
      const workoutId = req.params.workoutId as string;
      const entryId = req.params.entryId as string;
      const entry = await workoutService.updateWorkoutEntry(
        req.userId!,
        workoutId,
        entryId,
        req.body as UpdateWorkoutEntryInput
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
      const workoutId = req.params.workoutId as string;
      const entryId = req.params.entryId as string;
      await workoutService.removeWorkoutEntry(req.userId!, workoutId, entryId);
      responseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  },
};

export default workoutController;
