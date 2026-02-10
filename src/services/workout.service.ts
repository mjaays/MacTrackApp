import prisma from '../utils/prisma';

type CreateWorkoutInput = {
  workoutType: string;
  name?: string;
  notes?: string;
  startedAt: string;
  endedAt?: string;
  entries: Array<{
    exerciseId: string;
    orderIndex?: number;
    sets?: number;
    reps?: number;
    weightKg?: number;
    durationMin?: number;
    distanceKm?: number;
    avgHeartRate?: number;
    caloriesBurned?: number;
    notes?: string;
  }>;
};

export class WorkoutService {
  static async createWorkout(userId: string, input: CreateWorkoutInput) {
    const startedAt = new Date(input.startedAt);
    const endedAt = input.endedAt ? new Date(input.endedAt) : null;

    const durationMin =
      endedAt != null ? Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000)) : null;

    const totalCaloriesBurned = input.entries.reduce((sum, e) => sum + (e.caloriesBurned ?? 0), 0) || null;

    return prisma.workout.create({
      data: {
        userId,
        workoutType: input.workoutType,
        name: input.name ?? null,
        notes: input.notes ?? null,
        startedAt,
        endedAt,
        durationMin,
        totalCaloriesBurned,
        entries: {
          create: input.entries.map((e, idx) => ({
            exerciseId: e.exerciseId,
            orderIndex: e.orderIndex ?? idx,
            sets: e.sets ?? null,
            reps: e.reps ?? null,
            weightKg: e.weightKg ?? null,
            durationMin: e.durationMin ?? null,
            distanceKm: e.distanceKm ?? null,
            avgHeartRate: e.avgHeartRate ?? null,
            caloriesBurned: e.caloriesBurned ?? null,
            notes: e.notes ?? null,
          })),
        },
      },
      include: {
        entries: {
          include: { exercise: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  static async getWorkouts(userId: string) {
    return prisma.workout.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        entries: {
          include: { exercise: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }
}
