import { prisma } from '../utils/prisma';
import { NotFoundError } from '../errors/NotFoundError';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import type {
  CreateWorkoutInput,
  UpdateWorkoutInput,
  AddWorkoutEntryInput,
  UpdateWorkoutEntryInput,
} from '../validators/workout.validator';

interface GetWorkoutsParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  workoutType?: string;
}

export class WorkoutService {
  async getWorkouts(userId: string, params: GetWorkoutsParams) {
    const { date, startDate, endDate, workoutType } = params;

    let dateFilter = {};

    if (date) {
      const parsedDate = parseISO(date);
      dateFilter = {
        startedAt: {
          gte: startOfDay(parsedDate),
          lte: endOfDay(parsedDate),
        },
      };
    } else if (startDate || endDate) {
      dateFilter = {
        startedAt: {
          ...(startDate && { gte: parseISO(startDate) }),
          ...(endDate && { lte: endOfDay(parseISO(endDate)) }),
        },
      };
    }

    return prisma.workout.findMany({
      where: {
        userId,
        ...dateFilter,
        ...(workoutType && { workoutType }),
      },
      orderBy: { startedAt: 'desc' },
      include: {
        entries: {
          include: { exercise: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  async getWorkoutById(userId: string, workoutId: string) {
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        entries: {
          include: { exercise: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!workout) {
      throw new NotFoundError('Workout', workoutId);
    }

    if (workout.userId !== userId) {
      throw new NotFoundError('Workout', workoutId);
    }

    return workout;
  }

  async createWorkout(userId: string, input: CreateWorkoutInput) {
    const startedAt = new Date(input.startedAt);
    const endedAt = input.endedAt ? new Date(input.endedAt) : null;
    const durationMin = endedAt
      ? Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))
      : null;

    // Validate all exercise IDs exist
    const exerciseIds = input.entries.map((e) => e.exerciseId);
    const exercises = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
    });

    if (exercises.length !== exerciseIds.length) {
      const foundIds = new Set(exercises.map((e) => e.id));
      const missingIds = exerciseIds.filter((id) => !foundIds.has(id));
      throw new NotFoundError('Exercises', missingIds.join(', '));
    }

    const totalCaloriesBurned =
      input.entries.reduce((sum, e) => sum + (e.caloriesBurned ?? 0), 0) || null;

    return prisma.workout.create({
      data: {
        userId,
        name: input.name ?? null,
        workoutType: input.workoutType,
        startedAt,
        endedAt,
        durationMin,
        notes: input.notes ?? null,
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

  async updateWorkout(userId: string, workoutId: string, data: UpdateWorkoutInput) {
    const workout = await this.getWorkoutById(userId, workoutId);

    return prisma.workout.update({
      where: { id: workout.id },
      data,
      include: {
        entries: {
          include: { exercise: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });
  }

  async deleteWorkout(userId: string, workoutId: string) {
    const workout = await this.getWorkoutById(userId, workoutId);

    await prisma.workout.delete({
      where: { id: workout.id },
    });
  }

  async addWorkoutEntry(userId: string, workoutId: string, input: AddWorkoutEntryInput) {
    await this.getWorkoutById(userId, workoutId);

    const exercise = await prisma.exercise.findUnique({
      where: { id: input.exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise', input.exerciseId);
    }

    const caloriesBurned = input.caloriesBurned ?? 0;

    const [entry] = await prisma.$transaction([
      prisma.workoutEntry.create({
        data: {
          workoutId,
          exerciseId: input.exerciseId,
          orderIndex: input.orderIndex ?? 0,
          sets: input.sets ?? null,
          reps: input.reps ?? null,
          weightKg: input.weightKg ?? null,
          durationMin: input.durationMin ?? null,
          distanceKm: input.distanceKm ?? null,
          avgHeartRate: input.avgHeartRate ?? null,
          caloriesBurned: input.caloriesBurned ?? null,
          notes: input.notes ?? null,
        },
        include: { exercise: true },
      }),
      prisma.workout.update({
        where: { id: workoutId },
        data: {
          totalCaloriesBurned: { increment: caloriesBurned },
        },
      }),
    ]);

    return entry;
  }

  async updateWorkoutEntry(
    userId: string,
    workoutId: string,
    entryId: string,
    input: UpdateWorkoutEntryInput
  ) {
    const workout = await this.getWorkoutById(userId, workoutId);

    const entry = await prisma.workoutEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.workoutId !== workout.id) {
      throw new NotFoundError('Workout entry', entryId);
    }

    const oldCalories = entry.caloriesBurned ?? 0;
    const newCalories =
      input.caloriesBurned === null
        ? 0
        : input.caloriesBurned === undefined
          ? oldCalories
          : input.caloriesBurned;
    const diff = newCalories - oldCalories;

    const updateData: Record<string, unknown> = {};
    if (input.sets !== undefined) updateData.sets = input.sets;
    if (input.reps !== undefined) updateData.reps = input.reps;
    if (input.weightKg !== undefined) updateData.weightKg = input.weightKg;
    if (input.durationMin !== undefined) updateData.durationMin = input.durationMin;
    if (input.distanceKm !== undefined) updateData.distanceKm = input.distanceKm;
    if (input.avgHeartRate !== undefined) updateData.avgHeartRate = input.avgHeartRate;
    if (input.caloriesBurned !== undefined) updateData.caloriesBurned = input.caloriesBurned;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const [updatedEntry] = await prisma.$transaction([
      prisma.workoutEntry.update({
        where: { id: entryId },
        data: updateData,
        include: { exercise: true },
      }),
      prisma.workout.update({
        where: { id: workoutId },
        data: {
          totalCaloriesBurned: { increment: diff },
        },
      }),
    ]);

    return updatedEntry;
  }

  async removeWorkoutEntry(userId: string, workoutId: string, entryId: string) {
    const workout = await this.getWorkoutById(userId, workoutId);

    const entry = await prisma.workoutEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.workoutId !== workout.id) {
      throw new NotFoundError('Workout entry', entryId);
    }

    const caloriesBurned = entry.caloriesBurned ?? 0;

    await prisma.$transaction([
      prisma.workoutEntry.delete({
        where: { id: entryId },
      }),
      prisma.workout.update({
        where: { id: workoutId },
        data: {
          totalCaloriesBurned: { decrement: caloriesBurned },
        },
      }),
    ]);
  }
}

export const workoutService = new WorkoutService();
export default workoutService;
