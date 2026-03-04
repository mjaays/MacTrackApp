import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { responseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types';
import type { UpdateProfileInput, UpdateGoalsInput } from '../validators/user.validator';

export const userController = {
  async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await userService.getProfile(req.userId!);
      responseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const profile = await userService.updateProfile(
        req.userId!,
        req.body as UpdateProfileInput
      );
      responseUtil.success(res, profile);
    } catch (error) {
      next(error);
    }
  },

  async getGoals(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const goals = await userService.getGoals(req.userId!);
      responseUtil.success(res, goals);
    } catch (error) {
      next(error);
    }
  },

  async updateGoals(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const goals = await userService.updateGoals(
        req.userId!,
        req.body as UpdateGoalsInput
      );
      responseUtil.success(res, goals);
    } catch (error) {
      next(error);
    }
  },

  async getCalculatedGoals(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const goals = await userService.getCalculatedGoals(req.userId!);
      responseUtil.success(res, goals);
    } catch (error) {
      next(error);
    }
  },

  async deleteAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await userService.deleteAccount(req.userId!);
      responseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  },
};

export default userController;
