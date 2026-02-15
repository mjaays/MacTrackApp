import { Response, NextFunction } from 'express';
import { progressService } from '../services/progress.service';
import { responseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types';
import type { CreateProgressLogInput, UpdateProgressLogInput } from '../validators/progress.validator';

export const progressController = {
  async getProgressLogs(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const params = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };
      const result = await progressService.getProgressLogs(req.userId!, params);
      responseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getProgressLogById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const logId = req.params.id as string;
      const log = await progressService.getProgressLogById(req.userId!, logId);
      responseUtil.success(res, log);
    } catch (error) {
      next(error);
    }
  },

  async createProgressLog(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const log = await progressService.createProgressLog(
        req.userId!,
        req.body as CreateProgressLogInput
      );
      responseUtil.created(res, log);
    } catch (error) {
      next(error);
    }
  },

  async updateProgressLog(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const logId = req.params.id as string;
      const log = await progressService.updateProgressLog(
        req.userId!,
        logId,
        req.body as UpdateProgressLogInput
      );
      responseUtil.success(res, log);
    } catch (error) {
      next(error);
    }
  },

  async deleteProgressLog(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const logId = req.params.id as string;
      await progressService.deleteProgressLog(req.userId!, logId);
      responseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  },

  async getProgressStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await progressService.getProgressStats(
        req.userId!,
        req.query.startDate as string | undefined,
        req.query.endDate as string | undefined
      );
      responseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  },
};

export default progressController;
