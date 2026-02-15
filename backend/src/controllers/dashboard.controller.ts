import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { responseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types';

export const dashboardController = {
  async getTodaySummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await dashboardService.getTodaySummary(req.userId!);
      responseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getDateSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const date = req.params.date as string;
      const result = await dashboardService.getDateSummary(req.userId!, date);
      responseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getWeeklyOverview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await dashboardService.getWeeklyOverview(
        req.userId!,
        req.query.startDate as string | undefined
      );
      responseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};

export default dashboardController;
