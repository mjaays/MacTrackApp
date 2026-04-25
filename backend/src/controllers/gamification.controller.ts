import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { gamificationService } from '../services/gamification.service';
import { responseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types';
import { format } from 'date-fns';

export const gamificationController = {
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await gamificationService.getUserStats(req.userId!);
      responseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  },

  async getAchievements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await gamificationService.seedAchievements();

      const [all, unlocked] = await Promise.all([
        prisma.achievement.findMany({ orderBy: { sortOrder: 'asc' } }),
        prisma.userAchievement.findMany({
          where: { userId: req.userId! },
          include: { achievement: true },
        }),
      ]);

      const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

      const result = all.map((a) => ({
        ...a,
        unlocked: unlockedMap.has(a.id),
        unlockedAt: unlockedMap.get(a.id) ?? null,
      }));

      responseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  async getTodayQuests(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const quests = await gamificationService.getOrCreateDailyQuests(req.userId!, todayStr);
      responseUtil.success(res, quests);
    } catch (error) {
      next(error);
    }
  },

  async getLeaderboard(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const board = await gamificationService.getLeaderboard();
      responseUtil.success(res, board);
    } catch (error) {
      next(error);
    }
  },
};

export default gamificationController;
