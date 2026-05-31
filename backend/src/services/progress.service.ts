import { prisma } from '../utils/prisma';
import { NotFoundError } from '../errors/NotFoundError';
import { gamificationService } from './gamification.service';
import { parseISO, endOfDay } from 'date-fns';
import type { CreateProgressLogInput, UpdateProgressLogInput } from '../validators/progress.validator';

interface GetProgressLogsParams {
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

export class ProgressService {
  async getProgressLogs(userId: string, params: GetProgressLogsParams) {
    const { startDate, endDate, page, limit } = params;
    const skip = (page - 1) * limit;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {
        loggedAt: {
          ...(startDate && { gte: parseISO(startDate) }),
          ...(endDate && { lte: endOfDay(parseISO(endDate)) }),
        },
      };
    }

    const where = { userId, ...dateFilter };

    const [logs, total] = await Promise.all([
      prisma.progressLog.findMany({
        where,
        orderBy: { loggedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.progressLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProgressLogById(userId: string, logId: string) {
    const log = await prisma.progressLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      throw new NotFoundError('ProgressLog', logId);
    }

    if (log.userId !== userId) {
      throw new NotFoundError('ProgressLog', logId);
    }

    return log;
  }

  async createProgressLog(userId: string, data: CreateProgressLogInput) {
    const log = await prisma.progressLog.create({
      data: {
        userId,
        loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
        weightKg: data.weightKg ?? null,
        bodyFatPct: data.bodyFatPct ?? null,
        waistCm: data.waistCm ?? null,
        hipsCm: data.hipsCm ?? null,
        chestCm: data.chestCm ?? null,
        armsCm: data.armsCm ?? null,
        thighsCm: data.thighsCm ?? null,
        notes: data.notes ?? null,
        photoUrl: data.photoUrl ?? null,
      },
    });
    gamificationService.onProgressLogged(userId).catch(() => {});
    return log;
  }

  async updateProgressLog(userId: string, logId: string, data: UpdateProgressLogInput) {
    const log = await this.getProgressLogById(userId, logId);

    return prisma.progressLog.update({
      where: { id: log.id },
      data,
    });
  }

  async deleteProgressLog(userId: string, logId: string) {
    const log = await this.getProgressLogById(userId, logId);

    await prisma.progressLog.delete({
      where: { id: log.id },
    });
  }

  async getProgressStats(userId: string, startDate?: string, endDate?: string) {
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {
        loggedAt: {
          ...(startDate && { gte: parseISO(startDate) }),
          ...(endDate && { lte: endOfDay(parseISO(endDate)) }),
        },
      };
    }

    const logs = await prisma.progressLog.findMany({
      where: { userId, ...dateFilter },
      orderBy: { loggedAt: 'asc' },
      select: {
        loggedAt: true,
        weightKg: true,
        bodyFatPct: true,
        waistCm: true,
        hipsCm: true,
        chestCm: true,
        armsCm: true,
        thighsCm: true,
      },
    });

    const weightEntries = logs.filter((l) => l.weightKg !== null);
    const weightTrend = weightEntries.map((l) => ({
      date: l.loggedAt,
      weightKg: l.weightKg,
    }));

    const firstWeight = weightEntries.length > 0 ? weightEntries[0].weightKg : null;
    const lastWeight =
      weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weightKg : null;
    const weightChange =
      firstWeight != null && lastWeight != null ? lastWeight - firstWeight : null;

    const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

    return {
      totalEntries: logs.length,
      weightTrend,
      weightChange,
      currentWeight: lastWeight,
      latestMeasurements: latestLog
        ? {
            date: latestLog.loggedAt,
            bodyFatPct: latestLog.bodyFatPct,
            waistCm: latestLog.waistCm,
            hipsCm: latestLog.hipsCm,
            chestCm: latestLog.chestCm,
            armsCm: latestLog.armsCm,
            thighsCm: latestLog.thighsCm,
          }
        : null,
    };
  }

  /**
   * Least-squares slope of weight over time, expressed as kg/week (signed).
   * Returns null when there are fewer than 2 weighted entries, or all entries
   * fall on the same day (no time span to fit a trend to).
   */
  private computeWeeklyRate(
    entries: { loggedAt: Date; weightKg: number | null }[]
  ): number | null {
    const pts = entries
      .filter((e): e is { loggedAt: Date; weightKg: number } => e.weightKg !== null)
      .map((e) => ({ t: e.loggedAt.getTime(), y: e.weightKg }));
    if (pts.length < 2) return null;

    const msPerDay = 1000 * 60 * 60 * 24;
    const t0 = pts[0].t;
    const xs = pts.map((p) => (p.t - t0) / msPerDay);
    const ys = pts.map((p) => p.y);

    const n = pts.length;
    const meanX = xs.reduce((s, v) => s + v, 0) / n;
    const meanY = ys.reduce((s, v) => s + v, 0) / n;

    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (ys[i] - meanY);
      den += (xs[i] - meanX) ** 2;
    }
    if (den === 0) return null; // all entries on the same day

    const slopePerDay = num / den; // kg/day
    return slopePerDay * 7; // kg/week
  }

  /**
   * Goal weight progress + projection.
   * Combines the user's target weight (UserGoals) with their logged weight
   * trend to compute % complete, kg remaining, observed weekly rate, and a
   * projected date to reach the target at the current pace.
   */
  async getGoalProgress(userId: string) {
    const [goals, weightLogs] = await Promise.all([
      prisma.userGoals.findUnique({ where: { userId } }),
      prisma.progressLog.findMany({
        where: { userId, weightKg: { not: null } },
        orderBy: { loggedAt: 'asc' },
        select: { loggedAt: true, weightKg: true },
      }),
    ]);

    const targetWeightKg = goals?.targetWeightKg ?? null;
    const hasGoal = targetWeightKg !== null;
    const hasData = weightLogs.length > 0;

    const startWeightKg = hasData ? weightLogs[0].weightKg : null;
    const currentWeightKg = hasData ? weightLogs[weightLogs.length - 1].weightKg : null;
    const weeklyRateKg = this.computeWeeklyRate(weightLogs);

    let totalChangeKg: number | null = null;
    let changedKg: number | null = null;
    let remainingKg: number | null = null;
    let percentComplete: number | null = null;
    let reached = false;
    let onTrack: boolean | null = null;
    let weeksRemaining: number | null = null;
    let projectedDate: string | null = null;

    if (
      hasGoal &&
      hasData &&
      startWeightKg !== null &&
      currentWeightKg !== null &&
      targetWeightKg !== null
    ) {
      totalChangeKg = targetWeightKg - startWeightKg;
      changedKg = currentWeightKg - startWeightKg;
      remainingKg = targetWeightKg - currentWeightKg;

      // % of the planned change covered so far (clamped to 0..100)
      if (Math.abs(totalChangeKg) < 0.05) {
        percentComplete = 100; // started already at target
      } else {
        const raw = (changedKg / totalChangeKg) * 100;
        percentComplete = Math.max(0, Math.min(100, Math.round(raw)));
      }

      if (Math.abs(remainingKg) <= 0.25) {
        // Within tolerance of the target
        reached = true;
        percentComplete = 100;
        onTrack = true;
        weeksRemaining = 0;
      } else if (weeklyRateKg !== null && weeklyRateKg !== 0) {
        const slopePerDay = weeklyRateKg / 7;
        // Both signed: positive only when the trend moves toward the target
        const daysToGoal = remainingKg / slopePerDay;
        const maxDays = 520 * 7; // ~10 years — beyond this the pace is effectively flat
        if (daysToGoal > 0 && daysToGoal <= maxDays) {
          onTrack = true;
          weeksRemaining = Math.round((daysToGoal / 7) * 10) / 10;
          projectedDate = new Date(Date.now() + daysToGoal * 24 * 60 * 60 * 1000).toISOString();
        } else {
          onTrack = false;
        }
      } else {
        onTrack = false;
      }
    }

    const round1 = (v: number | null) => (v !== null ? Math.round(v * 10) / 10 : null);

    return {
      hasGoal,
      hasData,
      goalType: goals?.goalType ?? null,
      startWeightKg,
      currentWeightKg,
      targetWeightKg,
      totalChangeKg: round1(totalChangeKg),
      changedKg: round1(changedKg),
      remainingKg: round1(remainingKg),
      percentComplete,
      weeklyRateKg: weeklyRateKg !== null ? Math.round(weeklyRateKg * 100) / 100 : null,
      plannedWeeklyRateKg: goals?.weeklyWeightChangeKg ?? null,
      reached,
      onTrack,
      weeksRemaining,
      projectedDate,
    };
  }
}

export const progressService = new ProgressService();
export default progressService;
