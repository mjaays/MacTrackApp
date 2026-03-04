import { prisma } from '../utils/prisma';
import { NotFoundError } from '../errors/NotFoundError';
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
    return prisma.progressLog.create({
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
}

export const progressService = new ProgressService();
export default progressService;
