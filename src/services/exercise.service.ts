import { prisma } from '../utils/prisma';
import { NotFoundError } from '../errors/NotFoundError';
import { AuthError } from '../errors/AuthError';
import type { CreateExerciseInput, UpdateExerciseInput, SearchExercisesInput } from '../validators/exercise.validator';

export class ExerciseService {
  async getAllExercises(userId: string, params: SearchExercisesInput) {
    const { query, category, page, limit } = params;
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        {
          OR: [
            { isCustom: false },
            { createdByUserId: userId },
          ],
        },
        query
          ? {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
              ],
            }
          : {},
        category ? { category } : {},
      ],
    };

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.exercise.count({ where }),
    ]);

    return {
      exercises,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getExerciseById(userId: string, exerciseId: string) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise', exerciseId);
    }

    if (exercise.isCustom && exercise.createdByUserId !== userId) {
      throw new NotFoundError('Exercise', exerciseId);
    }

    return exercise;
  }

  async createExercise(userId: string, data: CreateExerciseInput) {
    return prisma.exercise.create({
      data: {
        ...data,
        isCustom: true,
        createdByUserId: userId,
      },
    });
  }

  async updateExercise(userId: string, exerciseId: string, data: UpdateExerciseInput) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise', exerciseId);
    }

    if (exercise.createdByUserId !== userId) {
      throw new AuthError('You can only update your own custom exercises');
    }

    return prisma.exercise.update({
      where: { id: exerciseId },
      data,
    });
  }

  async deleteExercise(userId: string, exerciseId: string) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundError('Exercise', exerciseId);
    }

    if (exercise.createdByUserId !== userId) {
      throw new AuthError('You can only delete your own custom exercises');
    }

    const usageCount = await prisma.workoutEntry.count({
      where: { exerciseId },
    });

    if (usageCount > 0) {
      throw new AuthError(`Cannot delete exercise: it is used in ${usageCount} workout entries`);
    }

    await prisma.exercise.delete({
      where: { id: exerciseId },
    });
  }
}

export const exerciseService = new ExerciseService();
export default exerciseService;
